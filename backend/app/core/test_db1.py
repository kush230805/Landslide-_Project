import psycopg
from app.core.config import DATABASE_URL
#just connection testing file not main file of project
#this is used when in your env file it is postgresql://postgres:
try:
    with psycopg.connect(DATABASE_URL) as conn:
        with conn.cursor() as cursor:
            cursor.execute("select version();")
            result=cursor.fetchone()
            print("Database connection successful.")
            print(result[0])
except Exception as e:
    print("Database connection failed.")
    print(e)