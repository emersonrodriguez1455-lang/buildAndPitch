from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.class_catalog import friendly_label, is_healthy_class
from app.database.session import get_db
from app.models.diagnosis import Diagnosis
from app.models.farm import Farm
from app.models.plot import Plot
from app.schemas.statistics import (
    DiseaseStatItem,
    FarmActivityItem,
    StatisticsSummary,
    TimelinePoint,
)

router = APIRouter(prefix="/statistics", tags=["statistics"])


@router.get("/summary", response_model=StatisticsSummary)
def statistics_summary(db: Session = Depends(get_db)) -> StatisticsSummary:
    total_farms = db.query(func.count(Farm.id)).scalar() or 0
    total_plots = db.query(func.count(Plot.id)).scalar() or 0
    diagnoses = db.query(Diagnosis).all()
    total_diagnoses = len(diagnoses)
    healthy = sum(1 for d in diagnoses if is_healthy_class(d.predicted_class))
    possible_issues = total_diagnoses - healthy
    healthy_percentage = round((healthy / total_diagnoses) * 100, 1) if total_diagnoses else 0.0

    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_activity_count = (
        db.query(func.count(Diagnosis.id)).filter(Diagnosis.created_at >= week_ago).scalar() or 0
    )

    return StatisticsSummary(
        total_farms=total_farms,
        total_plots=total_plots,
        total_diagnoses=total_diagnoses,
        possible_issues=possible_issues,
        healthy_percentage=healthy_percentage,
        recent_activity_count=recent_activity_count,
    )


@router.get("/diseases", response_model=list[DiseaseStatItem])
def statistics_diseases(db: Session = Depends(get_db)) -> list[DiseaseStatItem]:
    rows = (
        db.query(Diagnosis.predicted_class, func.count(Diagnosis.id))
        .group_by(Diagnosis.predicted_class)
        .all()
    )
    total = sum(count for _, count in rows) or 0
    items = [
        DiseaseStatItem(
            class_name=class_name,
            label=friendly_label(class_name),
            count=count,
            percentage=round((count / total) * 100, 1) if total else 0.0,
        )
        for class_name, count in rows
    ]
    return sorted(items, key=lambda x: x.count, reverse=True)


@router.get("/timeline", response_model=list[TimelinePoint])
def statistics_timeline(
    granularity: str = Query(default="week", pattern="^(day|week|month)$"),
    db: Session = Depends(get_db),
) -> list[TimelinePoint]:
    diagnoses = db.query(Diagnosis).order_by(Diagnosis.created_at.asc()).all()
    buckets: dict[str, dict[str, int]] = defaultdict(lambda: {"count": 0, "healthy": 0, "issue": 0})

    for item in diagnoses:
        dt = item.created_at
        if granularity == "day":
            key = dt.strftime("%Y-%m-%d")
        elif granularity == "month":
            key = dt.strftime("%Y-%m")
        else:
            iso = dt.isocalendar()
            key = f"{iso.year}-W{iso.week:02d}"

        buckets[key]["count"] += 1
        if is_healthy_class(item.predicted_class):
            buckets[key]["healthy"] += 1
        else:
            buckets[key]["issue"] += 1

    return [
        TimelinePoint(
            period=period,
            count=values["count"],
            healthy_count=values["healthy"],
            issue_count=values["issue"],
        )
        for period, values in sorted(buckets.items())
    ]


@router.get("/farms", response_model=list[FarmActivityItem])
def statistics_farms(db: Session = Depends(get_db)) -> list[FarmActivityItem]:
    farms = db.query(Farm).all()
    result: list[FarmActivityItem] = []
    for farm in farms:
        diagnoses = db.query(Diagnosis).filter(Diagnosis.farm_id == farm.id).all()
        healthy = sum(1 for d in diagnoses if is_healthy_class(d.predicted_class))
        result.append(
            FarmActivityItem(
                farm_id=farm.id,
                farm_name=farm.name,
                diagnosis_count=len(diagnoses),
                healthy_count=healthy,
                issue_count=len(diagnoses) - healthy,
            )
        )
    return sorted(result, key=lambda x: x.diagnosis_count, reverse=True)
