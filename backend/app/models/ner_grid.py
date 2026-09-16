from sqlalchemy import BigInteger, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column
from geoalchemy2 import Geometry

from app.core.database import Base

class NerGrid(Base):
    __tablename__="ner_grid"
    fid: Mapped[int]=mapped_column(BigInteger)
    id: Mapped[int]=mapped_column(BigInteger, primary_key=True)
    left_coord: Mapped[float]=mapped_column(Float)
    right_coord: Mapped[float]=mapped_column(Float)
    top_coord: Mapped[float]=mapped_column(Float)
    bottom_coord: Mapped[float]=mapped_column(Float)
    row_index: Mapped[int]=mapped_column(Integer)
    col_index: Mapped[int]=mapped_column(Integer)
    latitude: Mapped[float]=mapped_column(Float)
    longitude: Mapped[float]=mapped_column(Float)
    mean_elevation: Mapped[float]=mapped_column(Float)
    mean_slope: Mapped[float]=mapped_column(Float)
    geom: Mapped = mapped_column(Geometry("POLYGON", srid=7771))