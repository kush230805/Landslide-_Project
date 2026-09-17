import time
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

import requests
from dotenv import load_dotenv
from sqlalchemy import create_engine, text, bindparam

import os


# ============================================================
# CONFIGURATION
# ============================================================

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in .env file")


OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

# Conservative batch size.
# This is our implementation choice, not an official API maximum.
BATCH_SIZE = 100

# Three updates per day: 00:00, 08:00 and 16:00 IST
UPDATE_HOURS = [0, 8, 16]

TIMEZONE = ZoneInfo("Asia/Kolkata")


# ============================================================
# DATABASE
# ============================================================

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)


# ============================================================
# GET NEXT UPDATE TIME
# ============================================================

def get_next_update_time():
    """
    Returns the next scheduled update time:
    00:00, 08:00 or 16:00 IST.
    """

    now = datetime.now(TIMEZONE)

    today_times = []

    for hour in UPDATE_HOURS:
        update_time = now.replace(
            hour=hour,
            minute=0,
            second=0,
            microsecond=0
        )

        today_times.append(update_time)

    # Find next update today
    for update_time in today_times:
        if update_time > now:
            return update_time

    # Otherwise next update is tomorrow at 00:00
    tomorrow = now + timedelta(days=1)

    return tomorrow.replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0
    )


# ============================================================
# GET GRID CELLS
# ============================================================

def get_grid_cells():

    query = text("""
        SELECT
            id,
            latitude,
            longitude
        FROM ner_grid
        ORDER BY id
    """)

    with engine.connect() as connection:
        result = connection.execute(query)

        rows = result.mappings().all()

    return rows


# ============================================================
# FETCH WEATHER FROM OPEN-METEO
# ============================================================

def fetch_weather(grid_batch):

    latitudes = ",".join(
        str(row["latitude"])
        for row in grid_batch
    )

    longitudes = ",".join(
        str(row["longitude"])
        for row in grid_batch
    )

    params = {
        "latitude": latitudes,
        "longitude": longitudes,

        # We only need the previous 24 hours.
        "past_hours": 24,

        "hourly": (
            "precipitation,"
            "soil_moisture_0_to_7cm,"
            "soil_moisture_7_to_28cm,"
            "soil_moisture_28_to_100cm"
        ),

        "timezone": "Asia/Kolkata"
    }

    response = requests.get(
        OPEN_METEO_URL,
        params=params,
        timeout=60
    )

    response.raise_for_status()

    data = response.json()

    # When multiple coordinates are requested,
    # Open-Meteo returns a list.
    if isinstance(data, dict):
        data = [data]

    return data


# ============================================================
# CALCULATE FEATURES
# ============================================================

def calculate_features(weather):

    hourly = weather["hourly"]

    # --------------------------------------------------------
    # 24-HOUR RAINFALL
    # --------------------------------------------------------

    precipitation = hourly.get("precipitation", [])

    valid_rainfall = [
        value
        for value in precipitation
        if value is not None
    ]

    rainfall_24h_mm = sum(valid_rainfall)


    # --------------------------------------------------------
    # SOIL MOISTURE
    # --------------------------------------------------------

    sm_0_7 = hourly.get(
        "soil_moisture_0_to_7cm",
        []
    )

    sm_7_28 = hourly.get(
        "soil_moisture_7_to_28cm",
        []
    )

    sm_28_100 = hourly.get(
        "soil_moisture_28_to_100cm",
        []
    )

    hourly_moisture = []

    for a, b, c in zip(
        sm_0_7,
        sm_7_28,
        sm_28_100
    ):

        values = [
            value
            for value in [a, b, c]
            if value is not None
        ]

        if values:
            hourly_average = sum(values) / len(values)
            hourly_moisture.append(hourly_average)

    if hourly_moisture:

        soil_moisture = (
            sum(hourly_moisture)
            / len(hourly_moisture)
        )

    else:

        soil_moisture = None


    return {
        "rainfall_24h_mm": rainfall_24h_mm,
        "soil_moisture": soil_moisture
    }


# ============================================================
# UPDATE DATABASE
# ============================================================

def update_database(updates):

    if not updates:
        return

    query = text("""
        UPDATE ner_grid_dynamic
        SET
            rainfall_24h_mm = :rainfall_24h_mm,
            soil_moisture = :soil_moisture,
            updated_at = NOW()
        WHERE grid_id = :grid_id
    """)

    with engine.begin() as connection:

        connection.execute(
            query,
            updates
        )


# ============================================================
# RUN ONE COMPLETE UPDATE
# ============================================================

def run_full_update():

    start_time = datetime.now(TIMEZONE)

    print("\n" + "=" * 70)
    print("STARTING NER DYNAMIC WEATHER UPDATE")
    print("=" * 70)

    print(
        "Start time:",
        start_time.strftime("%Y-%m-%d %H:%M:%S %Z")
    )

    # --------------------------------------------------------
    # GET ALL GRID CELLS
    # --------------------------------------------------------

    grid_cells = get_grid_cells()

    total_cells = len(grid_cells)

    print(
        f"Total grid cells: {total_cells:,}"
    )

    total_batches = (
        total_cells + BATCH_SIZE - 1
    ) // BATCH_SIZE

    print(
        f"Batch size: {BATCH_SIZE}"
    )

    print(
        f"Total batches: {total_batches:,}"
    )

    successful = 0
    failed = 0

    # --------------------------------------------------------
    # PROCESS BATCHES
    # --------------------------------------------------------

    for batch_number, start in enumerate(
        range(0, total_cells, BATCH_SIZE),
        start=1
    ):

        batch = grid_cells[
            start:start + BATCH_SIZE
        ]

        grid_ids = [
            row["id"]
            for row in batch
        ]

        print(
            f"\nBatch {batch_number}/{total_batches} "
            f"| Grid IDs {grid_ids[0]} - {grid_ids[-1]}"
        )

        try:

            # ------------------------------------------------
            # API REQUEST
            # ------------------------------------------------

            weather_results = fetch_weather(batch)

            # ------------------------------------------------
            # PREPARE DATABASE UPDATES
            # ------------------------------------------------

            updates = []

            for row, weather in zip(
                batch,
                weather_results
            ):

                features = calculate_features(
                    weather
                )

                updates.append({
                    "grid_id": row["id"],
                    "rainfall_24h_mm": features[
                        "rainfall_24h_mm"
                    ],
                    "soil_moisture": features[
                        "soil_moisture"
                    ]
                })

            # ------------------------------------------------
            # DATABASE UPDATE
            # ------------------------------------------------

            update_database(updates)

            successful += len(updates)

            print(
                f"SUCCESS: {len(updates)} cells updated"
            )

        except Exception as e:

            failed += len(batch)

            print(
                f"FAILED: batch {batch_number}"
            )

            print(
                "Error:",
                str(e)
            )

            # Don't overwrite existing database
            # values when the API fails.

            continue

        # Small delay between API requests
        # to avoid unnecessarily aggressive requests.
        time.sleep(0.2)


    # --------------------------------------------------------
    # FINISH
    # --------------------------------------------------------

    end_time = datetime.now(TIMEZONE)

    duration = end_time - start_time

    print("\n" + "=" * 70)
    print("UPDATE FINISHED")
    print("=" * 70)

    print(
        "End time:",
        end_time.strftime("%Y-%m-%d %H:%M:%S %Z")
    )

    print(
        "Successful:",
        f"{successful:,}"
    )

    print(
        "Failed:",
        f"{failed:,}"
    )

    print(
        "Duration:",
        duration
    )

    print("=" * 70)


# ============================================================
# MAIN SCHEDULER
# ============================================================

if __name__ == "__main__":

    print("=" * 70)
    print("NER DYNAMIC WEATHER SERVICE")
    print("=" * 70)

    print(
        "Scheduled updates:",
        "00:00, 08:00, 16:00 IST"
    )

    print("Service started.")

    while True:

        now = datetime.now(TIMEZONE)

        next_update = get_next_update_time()

        wait_seconds = (
            next_update - now
        ).total_seconds()

        print(
            "\nCurrent time:",
            now.strftime("%Y-%m-%d %H:%M:%S %Z")
        )

        print(
            "Next update:",
            next_update.strftime(
                "%Y-%m-%d %H:%M:%S %Z"
            )
        )

        print(
            f"Waiting approximately "
            f"{wait_seconds / 3600:.2f} hours..."
        )

        # Wait until scheduled time
        time.sleep(
            max(wait_seconds, 1)
        )

        try:

            run_full_update()

        except Exception as e:

            print(
                "\nFULL UPDATE ERROR:"
            )

            print(e)

            print(
                "Existing database values "
                "were not intentionally overwritten."
            )

            # Wait before checking schedule again
            time.sleep(60)