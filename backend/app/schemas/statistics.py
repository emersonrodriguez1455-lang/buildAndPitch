from pydantic import BaseModel


class StatisticsSummary(BaseModel):
    total_farms: int
    total_plots: int
    total_diagnoses: int
    possible_issues: int
    healthy_percentage: float
    recent_activity_count: int


class DiseaseStatItem(BaseModel):
    class_name: str
    label: str
    count: int
    percentage: float


class TimelinePoint(BaseModel):
    period: str
    count: int
    healthy_count: int
    issue_count: int


class FarmActivityItem(BaseModel):
    farm_id: int
    farm_name: str
    diagnosis_count: int
    healthy_count: int
    issue_count: int
