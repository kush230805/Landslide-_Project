from sqlalchemy import select 
from backend.app.core.database import SessionLocal
from backend.app.models.ner_grid import NerGrid

try:
    with SessionLocal() as session:
        stmt = select(NerGrid).where(NerGrid.id == 4410)
        result = session.execute(stmt).scalars().one()
        print("Query execution successful.")
        print(result)
except Exception as e:
    print("Query execution failed.")
    print(e)