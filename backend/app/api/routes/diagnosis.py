from __future__ import annotations

import json
import math
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse, Response
from sqlalchemy import and_, func
from sqlalchemy.orm import Session, joinedload

from app.config import get_settings
from app.core.class_catalog import is_healthy_class
from app.database.session import get_db
from app.models.diagnosis import Diagnosis
from app.models.farm import Farm
from app.models.plot import Plot
from app.schemas.diagnosis import (
    AlternativeScore,
    CarePlan,
    DiagnosisCreateResponse,
    DiagnosisDetail,
    DiagnosisListItem,
    DiagnosisListResponse,
    DiagnosisTimelineItem,
    DiagnosisTimelineResponse,
    TrendInfo,
)
from app.services.care_service import build_care_plan, compute_trend
from app.services.image_service import ImageService
from app.services.model_service import model_service

router = APIRouter(tags=["diagnosis"])


def _image_url(stored_name: str) -> str:
    return f"/api/media/{Path(stored_name).name}"


def _status_for(class_name: str) -> str:
    return "aparentemente_saludable" if is_healthy_class(class_name) else "posible_problema"


def _follow_up_count(db: Session, item: Diagnosis) -> int:
    root_id = item.root_diagnosis_id or item.id
    total = (
        db.query(func.count(Diagnosis.id))
        .filter((Diagnosis.root_diagnosis_id == root_id) | (Diagnosis.id == root_id))
        .scalar()
        or 0
    )
    return max(0, total - 1)


def _previous_in_chain(db: Session, item: Diagnosis) -> Diagnosis | None:
    if item.parent_diagnosis_id:
        return db.get(Diagnosis, item.parent_diagnosis_id)
    return None


def _serialize_detail(item: Diagnosis, db: Session) -> DiagnosisDetail:
    alternatives_raw = json.loads(item.alternatives_json or "[]")
    alternatives = [AlternativeScore(**alt) for alt in alternatives_raw]
    previous = _previous_in_chain(db, item)
    trend = compute_trend(
        previous.predicted_class if previous else None,
        previous.confidence if previous else None,
        item.predicted_class,
        item.confidence,
    )
    care = build_care_plan(item.predicted_class, item.confidence)
    return DiagnosisDetail(
        id=item.id,
        farm_id=item.farm_id,
        plot_id=item.plot_id,
        farm_name=item.farm.name if item.farm else "",
        plot_name=item.plot.name if item.plot else "",
        predicted_class=item.predicted_class,
        predicted_class_label=item.predicted_class_label,
        confidence=item.confidence,
        alternatives=alternatives,
        recommendation=item.recommendation,
        observations=item.observations,
        model_name=item.model_name,
        model_version=item.model_version,
        created_at=item.created_at,
        image_url=_image_url(item.image_path),
        is_healthy=is_healthy_class(item.predicted_class),
        status=_status_for(item.predicted_class),
        original_filename=item.original_filename,
        parent_diagnosis_id=item.parent_diagnosis_id,
        root_diagnosis_id=item.root_diagnosis_id or item.id,
        follow_up_count=_follow_up_count(db, item),
        care_plan=CarePlan(**care),
        trend=TrendInfo(**trend),
    )


def _serialize_list_item(item: Diagnosis, db: Session) -> DiagnosisListItem:
    detail = _serialize_detail(item, db)
    return DiagnosisListItem(**detail.model_dump(exclude={"alternatives", "original_filename"}))


async def _ensure_model_ready() -> None:
    if not model_service.is_loaded:
        loading = await model_service.ensure_loaded()
        if not loading:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=(
                    "El modelo de inteligencia artificial no está disponible. "
                    f"{model_service.last_error or 'Intente nuevamente en unos momentos.'}"
                ),
            )


async def _run_and_store_diagnosis(
    *,
    db: Session,
    image: UploadFile,
    farm_id: int,
    plot_id: int,
    observations: str | None,
    parent: Diagnosis | None = None,
) -> Diagnosis:
    farm = db.get(Farm, farm_id)
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Finca no encontrada.")

    plot = db.get(Plot, plot_id)
    if not plot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcela no encontrada.")
    if plot.farm_id != farm_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La parcela no pertenece a la finca seleccionada.",
        )

    settings = get_settings()
    image_service = ImageService(settings)
    stored_name, original_name, absolute_path = await image_service.validate_and_store(image)

    try:
        prediction = await model_service.predict(absolute_path)
    except Exception as exc:  # noqa: BLE001
        image_service.delete_image(stored_name)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"No se pudo completar la inferencia: {exc}",
        ) from exc

    alternatives_payload = [
        {
            "class_name": alt.class_name,
            "label": alt.label,
            "confidence": alt.confidence,
        }
        for alt in prediction.alternatives
    ]

    diagnosis = Diagnosis(
        farm_id=farm_id,
        plot_id=plot_id,
        parent_diagnosis_id=parent.id if parent else None,
        root_diagnosis_id=(parent.root_diagnosis_id or parent.id) if parent else None,
        image_path=stored_name,
        original_filename=original_name,
        predicted_class=prediction.predicted_class,
        predicted_class_label=prediction.predicted_class_label,
        confidence=prediction.confidence,
        alternatives_json=json.dumps(alternatives_payload),
        recommendation=prediction.recommendation,
        observations=observations,
        model_name=prediction.model_name,
        model_version=prediction.model_version,
    )
    db.add(diagnosis)
    db.commit()
    db.refresh(diagnosis)

    if diagnosis.root_diagnosis_id is None:
        diagnosis.root_diagnosis_id = diagnosis.id
        db.commit()
        db.refresh(diagnosis)

    return (
        db.query(Diagnosis)
        .options(joinedload(Diagnosis.farm), joinedload(Diagnosis.plot))
        .filter(Diagnosis.id == diagnosis.id)
        .one()
    )


@router.post("/diagnosis", response_model=DiagnosisCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_diagnosis(
    image: UploadFile = File(...),
    farm_id: int = Form(...),
    plot_id: int = Form(...),
    observations: str | None = Form(default=None),
    db: Session = Depends(get_db),
) -> DiagnosisCreateResponse:
    await _ensure_model_ready()
    diagnosis = await _run_and_store_diagnosis(
        db=db,
        image=image,
        farm_id=farm_id,
        plot_id=plot_id,
        observations=observations,
        parent=None,
    )
    return _serialize_detail(diagnosis, db)


@router.post(
    "/diagnosis/{diagnosis_id}/follow-up",
    response_model=DiagnosisCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_follow_up(
    diagnosis_id: int,
    image: UploadFile = File(...),
    observations: str | None = Form(default=None),
    db: Session = Depends(get_db),
) -> DiagnosisCreateResponse:
    await _ensure_model_ready()
    parent = (
        db.query(Diagnosis)
        .options(joinedload(Diagnosis.farm), joinedload(Diagnosis.plot))
        .filter(Diagnosis.id == diagnosis_id)
        .first()
    )
    if not parent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diagnóstico no encontrado.")

    diagnosis = await _run_and_store_diagnosis(
        db=db,
        image=image,
        farm_id=parent.farm_id,
        plot_id=parent.plot_id,
        observations=observations,
        parent=parent,
    )
    return _serialize_detail(diagnosis, db)


@router.get("/diagnosis", response_model=DiagnosisListResponse)
def list_diagnoses(
    q: str | None = Query(default=None),
    farm_id: int | None = Query(default=None),
    predicted_class: str | None = Query(default=None),
    date_from: datetime | None = Query(default=None),
    date_to: datetime | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
) -> DiagnosisListResponse:
    query = db.query(Diagnosis).options(joinedload(Diagnosis.farm), joinedload(Diagnosis.plot))

    filters = []
    if farm_id is not None:
        filters.append(Diagnosis.farm_id == farm_id)
    if predicted_class:
        filters.append(Diagnosis.predicted_class == predicted_class)
    if date_from is not None:
        filters.append(Diagnosis.created_at >= date_from)
    if date_to is not None:
        filters.append(Diagnosis.created_at <= date_to)
    if q:
        like = f"%{q}%"
        filters.append(
            (Diagnosis.predicted_class_label.ilike(like))
            | (Diagnosis.predicted_class.ilike(like))
            | (Diagnosis.observations.ilike(like))
        )

    if filters:
        query = query.filter(and_(*filters))

    total = query.with_entities(func.count(Diagnosis.id)).scalar() or 0
    items = (
        query.order_by(Diagnosis.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    total_pages = max(1, math.ceil(total / page_size)) if total else 0

    return DiagnosisListResponse(
        items=[_serialize_list_item(item, db) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/media/{filename}")
def serve_diagnosis_image(filename: str) -> FileResponse:
    settings = get_settings()
    image_service = ImageService(settings)
    path = image_service.resolve_path(filename)
    return FileResponse(path)


@router.get("/diagnosis/{diagnosis_id}/timeline", response_model=DiagnosisTimelineResponse)
def diagnosis_timeline(diagnosis_id: int, db: Session = Depends(get_db)) -> DiagnosisTimelineResponse:
    current = db.get(Diagnosis, diagnosis_id)
    if not current:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diagnóstico no encontrado.")

    root_id = current.root_diagnosis_id or current.id
    chain = (
        db.query(Diagnosis)
        .options(joinedload(Diagnosis.farm), joinedload(Diagnosis.plot))
        .filter((Diagnosis.root_diagnosis_id == root_id) | (Diagnosis.id == root_id))
        .order_by(Diagnosis.created_at.asc())
        .all()
    )
    if not chain:
        chain = [current]

    timeline_items: list[DiagnosisTimelineItem] = []
    previous: Diagnosis | None = None
    for item in chain:
        trend = compute_trend(
            previous.predicted_class if previous else None,
            previous.confidence if previous else None,
            item.predicted_class,
            item.confidence,
        )
        timeline_items.append(
            DiagnosisTimelineItem(
                id=item.id,
                predicted_class=item.predicted_class,
                predicted_class_label=item.predicted_class_label,
                confidence=item.confidence,
                is_healthy=is_healthy_class(item.predicted_class),
                created_at=item.created_at,
                image_url=_image_url(item.image_path),
                observations=item.observations,
                trend=TrendInfo(**trend),
                is_current=item.id == diagnosis_id,
            )
        )
        previous = item

    first = chain[0]
    last = chain[-1]
    overall = compute_trend(
        first.predicted_class if len(chain) > 1 else None,
        first.confidence if len(chain) > 1 else None,
        last.predicted_class,
        last.confidence,
    )
    if len(chain) == 1:
        overall = compute_trend(None, None, last.predicted_class, last.confidence)

    care = build_care_plan(last.predicted_class, last.confidence)
    return DiagnosisTimelineResponse(
        root_diagnosis_id=root_id,
        current_id=diagnosis_id,
        items=timeline_items,
        overall_trend=TrendInfo(**overall),
        care_plan=CarePlan(**care),
    )


@router.get("/diagnosis/{diagnosis_id}", response_model=DiagnosisDetail)
def get_diagnosis(diagnosis_id: int, db: Session = Depends(get_db)) -> DiagnosisDetail:
    item = (
        db.query(Diagnosis)
        .options(joinedload(Diagnosis.farm), joinedload(Diagnosis.plot))
        .filter(Diagnosis.id == diagnosis_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diagnóstico no encontrado.")
    return _serialize_detail(item, db)


@router.delete("/diagnosis/{diagnosis_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_diagnosis(diagnosis_id: int, db: Session = Depends(get_db)) -> Response:
    item = db.get(Diagnosis, diagnosis_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diagnóstico no encontrado.")

    settings = get_settings()
    image_service = ImageService(settings)
    stored_name = item.image_path
    db.delete(item)
    db.commit()
    image_service.delete_image(stored_name)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
