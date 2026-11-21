from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AlternativeScore(BaseModel):
    class_name: str
    label: str
    confidence: float = Field(..., ge=0, le=1)


class DiagnosisBaseInfo(BaseModel):
    id: int
    farm_id: int
    plot_id: int
    farm_name: str
    plot_name: str
    predicted_class: str
    predicted_class_label: str
    confidence: float
    recommendation: str
    observations: str | None = None
    model_name: str
    model_version: str
    created_at: datetime
    image_url: str
    is_healthy: bool
    status: str


class DiagnosisCreateResponse(DiagnosisBaseInfo):
    alternatives: list[AlternativeScore]
    original_filename: str


class DiagnosisDetail(DiagnosisCreateResponse):
    model_config = ConfigDict(from_attributes=True)


class DiagnosisListItem(DiagnosisBaseInfo):
    model_config = ConfigDict(from_attributes=True)


class DiagnosisListResponse(BaseModel):
    items: list[DiagnosisListItem]
    total: int
    page: int
    page_size: int
    total_pages: int
