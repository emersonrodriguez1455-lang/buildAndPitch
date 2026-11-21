from datetime import datetime

from sqlalchemy import DateTime, Float, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class Farm(Base):
    __tablename__ = "farms"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    department: Mapped[str] = mapped_column(String(80), nullable=False)
    municipality: Mapped[str] = mapped_column(String(80), nullable=False)
    location: Mapped[str] = mapped_column(String(160), nullable=False)
    area_hectares: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    plots = relationship("Plot", back_populates="farm", cascade="all, delete-orphan")
    diagnoses = relationship("Diagnosis", back_populates="farm", cascade="all, delete-orphan")
