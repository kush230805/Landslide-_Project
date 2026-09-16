from sqlalchemy import select 
from app.core.database import SessionLocal
from app.models.ner_grid import NerGrid

try:
    with SessionLocal() as session:
        stmt = select(NerGrid).where(NerGrid.id == 4410)
        result = session.execute(stmt).scalars().one()
        print("Query execution successful.")
        print(result)
except Exception as e:
    print("Query execution failed.")
    print(e)