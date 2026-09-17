from datetime import datetime

from sqlalchemy import BigInteger, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.core.database import Base


class NerGridDynamic(Base):
    __tablename__ = "ner_grid_dynamic"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True
    )

    grid_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("ner_grid.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )

    rainfall_24h_mm: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    soil_moisture: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )