from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PlotBase(BaseModel):
    farm_id: int
    name: str = Field(..., min_length=2, max_length=120)
    coffee_variety: str | None = Field(default=None, max_length=80)
    area_hectares: float | None = Field(default=None, ge=0, le=100000)
    altitude: float | None = Field(default=None, ge=0, le=6000)
    observations: str | None = Field(default=None, max_length=2000)


class PlotCreate(PlotBase):
    pass


class PlotUpdate(BaseModel):
    farm_id: int | None = None
    name: str | None = Field(default=None, min_length=2, max_length=120)
    coffee_variety: str | None = Field(default=None, max_length=80)
    area_hectares: float | None = Field(default=None, ge=0, le=100000)
    altitude: float | None = Field(default=None, ge=0, le=6000)
    observations: str | None = Field(default=None, max_length=2000)


class PlotResponse(PlotBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farm_name: str | None = None
    created_at: datetime
    updated_at: datetime
