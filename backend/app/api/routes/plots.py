from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session, joinedload

from app.database.session import get_db
from app.models.farm import Farm
from app.models.plot import Plot
from app.schemas.plot import PlotCreate, PlotResponse, PlotUpdate

router = APIRouter(tags=["plots"])


def _to_response(plot: Plot) -> PlotResponse:
    return PlotResponse(
        id=plot.id,
        farm_id=plot.farm_id,
        name=plot.name,
        coffee_variety=plot.coffee_variety,
        area_hectares=plot.area_hectares,
        altitude=plot.altitude,
        observations=plot.observations,
        farm_name=plot.farm.name if plot.farm else None,
        created_at=plot.created_at,
        updated_at=plot.updated_at,
    )


@router.get("/plots", response_model=list[PlotResponse])
def list_plots(
    farm_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[PlotResponse]:
    query = db.query(Plot).options(joinedload(Plot.farm))
    if farm_id is not None:
        query = query.filter(Plot.farm_id == farm_id)
    plots = query.order_by(Plot.created_at.desc()).all()
    return [_to_response(plot) for plot in plots]


@router.post("/plots", response_model=PlotResponse, status_code=status.HTTP_201_CREATED)
def create_plot(payload: PlotCreate, db: Session = Depends(get_db)) -> PlotResponse:
    farm = db.get(Farm, payload.farm_id)
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La finca asociada no existe.")

    plot = Plot(**payload.model_dump())
    db.add(plot)
    db.commit()
    db.refresh(plot)
    plot = db.query(Plot).options(joinedload(Plot.farm)).filter(Plot.id == plot.id).one()
    return _to_response(plot)


@router.get("/plots/{plot_id}", response_model=PlotResponse)
def get_plot(plot_id: int, db: Session = Depends(get_db)) -> PlotResponse:
    plot = db.query(Plot).options(joinedload(Plot.farm)).filter(Plot.id == plot_id).first()
    if not plot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcela no encontrada.")
    return _to_response(plot)


@router.put("/plots/{plot_id}", response_model=PlotResponse)
def update_plot(plot_id: int, payload: PlotUpdate, db: Session = Depends(get_db)) -> PlotResponse:
    plot = db.query(Plot).options(joinedload(Plot.farm)).filter(Plot.id == plot_id).first()
    if not plot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcela no encontrada.")

    data = payload.model_dump(exclude_unset=True)
    if "farm_id" in data:
        farm = db.get(Farm, data["farm_id"])
        if not farm:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La finca asociada no existe.")

    for key, value in data.items():
        setattr(plot, key, value)

    db.commit()
    db.refresh(plot)
    plot = db.query(Plot).options(joinedload(Plot.farm)).filter(Plot.id == plot.id).one()
    return _to_response(plot)


@router.delete("/plots/{plot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plot(plot_id: int, db: Session = Depends(get_db)) -> Response:
    plot = db.get(Plot, plot_id)
    if not plot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcela no encontrada.")
    db.delete(plot)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/farms/{farm_id}/plots", response_model=list[PlotResponse])
def list_farm_plots(farm_id: int, db: Session = Depends(get_db)) -> list[PlotResponse]:
    farm = db.get(Farm, farm_id)
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Finca no encontrada.")
    plots = (
        db.query(Plot)
        .options(joinedload(Plot.farm))
        .filter(Plot.farm_id == farm_id)
        .order_by(Plot.created_at.desc())
        .all()
    )
    return [_to_response(plot) for plot in plots]
