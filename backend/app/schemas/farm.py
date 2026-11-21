from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FarmBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    department: str = Field(..., min_length=2, max_length=80)
    municipality: str = Field(..., min_length=2, max_length=80)
    location: str = Field(..., min_length=2, max_length=160)
    area_hectares: float = Field(..., ge=0, le=100000)
    description: str | None = Field(default=None, max_length=2000)


class FarmCreate(FarmBase):
    pass


class FarmUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    department: str | None = Field(default=None, min_length=2, max_length=80)
    municipality: str | None = Field(default=None, min_length=2, max_length=80)
    location: str | None = Field(default=None, min_length=2, max_length=160)
    area_hectares: float | None = Field(default=None, ge=0, le=100000)
    description: str | None = Field(default=None, max_length=2000)


class FarmResponse(FarmBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
