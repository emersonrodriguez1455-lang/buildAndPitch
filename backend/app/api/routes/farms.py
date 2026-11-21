from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.farm import Farm
from app.schemas.farm import FarmCreate, FarmResponse, FarmUpdate

router = APIRouter(prefix="/farms", tags=["farms"])


@router.get("", response_model=list[FarmResponse])
def list_farms(db: Session = Depends(get_db)) -> list[Farm]:
    return db.query(Farm).order_by(Farm.created_at.desc()).all()


@router.post("", response_model=FarmResponse, status_code=status.HTTP_201_CREATED)
def create_farm(payload: FarmCreate, db: Session = Depends(get_db)) -> Farm:
    farm = Farm(**payload.model_dump())
    db.add(farm)
    db.commit()
    db.refresh(farm)
    return farm


@router.get("/{farm_id}", response_model=FarmResponse)
def get_farm(farm_id: int, db: Session = Depends(get_db)) -> Farm:
    farm = db.get(Farm, farm_id)
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Finca no encontrada.")
    return farm


@router.put("/{farm_id}", response_model=FarmResponse)
def update_farm(farm_id: int, payload: FarmUpdate, db: Session = Depends(get_db)) -> Farm:
    farm = db.get(Farm, farm_id)
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Finca no encontrada.")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(farm, key, value)

    db.commit()
    db.refresh(farm)
    return farm


@router.delete("/{farm_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_farm(farm_id: int, db: Session = Depends(get_db)) -> Response:
    farm = db.get(Farm, farm_id)
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Finca no encontrada.")
    db.delete(farm)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
