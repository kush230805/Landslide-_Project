from fastapi import APIRouter ,Depends , HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.schemas.location import LocationRequest

router = APIRouter(prefix="/locations", tags=["Location Features"])

@router.get("/features")
def get_location_features(location: LocationRequest):
    return{
        "latitude": location.latitude,
        "longitude": location.longitude,
        "features": {
            "elevation": 1200,  # Example elevation in meters
            "slope": 15,  # Example slope in degrees
            "rainfall": 1000 , # Example rainfall in millimeters
            "soil_moisture": 0.71  # Example soil moisture 
        }
    }
@router.post("/grid")
def get_grid(
    location: LocationRequest,
    db: Session= Depends(get_db)
):
    query=text("""
        SELECT
            id,
            row_index,
            col_index,
            latitude,
            longitude,
            mean_elevation,
            mean_slope
        FROM ner_grid
        WHERE ST_Contains(
            geom,
            ST_Transform(
                ST_SetSRID(
                    ST_Point(:longitude, :latitude),
                    4326
                ),
                7771
            )
        )
        LIMIT 1;
    """)
    result = db.execute(query, {"longitude": location.longitude, "latitude": location.latitude}).mappings().first()
    if result is None:
        raise HTTPException(status_code=404, detail="Grid not found for the given location.")
    return result