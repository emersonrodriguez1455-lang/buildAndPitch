from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    farm_id: Mapped[int] = mapped_column(ForeignKey("farms.id", ondelete="CASCADE"), index=True)
    plot_id: Mapped[int] = mapped_column(ForeignKey("plots.id", ondelete="CASCADE"), index=True)
    parent_diagnosis_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("diagnoses.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    root_diagnosis_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    image_path: Mapped[str] = mapped_column(String(255), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    predicted_class: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    predicted_class_label: Mapped[str] = mapped_column(String(120), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    alternatives_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    recommendation: Mapped[str] = mapped_column(Text, nullable=False)
    observations: Mapped[str | None] = mapped_column(Text, nullable=True)
    model_name: Mapped[str] = mapped_column(String(120), nullable=False)
    model_version: Mapped[str] = mapped_column(String(80), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)

    farm = relationship("Farm", back_populates="diagnoses")
    plot = relationship("Plot", back_populates="diagnoses")
    parent = relationship("Diagnosis", remote_side=[id], foreign_keys=[parent_diagnosis_id])
