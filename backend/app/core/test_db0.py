from sqlalchemy import text
from backend.app.core.database import engine
#just connection testing file not main file of project
#this is used when in your env file it is postgresql+psycopg://postgres:
try: 
    with engine.connect() as connection:
        result=connection.execute(text("SELECT version()"))
        print("Database connection successful.")
        print(result.scalar())
except Exception as e:
    print("Database connection failed.")
    print(e)