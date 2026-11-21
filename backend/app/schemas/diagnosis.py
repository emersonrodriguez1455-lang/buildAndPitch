from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AlternativeScore(BaseModel):
    class_name: str
    label: str
    confidence: float = Field(..., ge=0, le=1)


class CarePlan(BaseModel):
    mode: str
    headline: str
    summary: str
    severity_level: str
    class_name: str
    class_label: str
    primary_steps: list[str]
    secondary_steps: list[str]
    technician_advice: str
    next_check_days: int
    disclaimer: str


class TrendInfo(BaseModel):
    code: str
    label: str
    description: str
    direction: str


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
    parent_diagnosis_id: int | None = None
    root_diagnosis_id: int | None = None
    follow_up_count: int = 0
    care_plan: CarePlan | None = None
    trend: TrendInfo | None = None


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


class DiagnosisTimelineItem(BaseModel):
    id: int
    predicted_class: str
    predicted_class_label: str
    confidence: float
    is_healthy: bool
    created_at: datetime
    image_url: str
    observations: str | None = None
    trend: TrendInfo | None = None
    is_current: bool = False


class DiagnosisTimelineResponse(BaseModel):
    root_diagnosis_id: int
    current_id: int
    items: list[DiagnosisTimelineItem]
    overall_trend: TrendInfo
    care_plan: CarePlan
