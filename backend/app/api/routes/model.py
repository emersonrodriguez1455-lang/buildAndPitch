from fastapi import APIRouter

from app.core.class_catalog import CLASS_CATALOG, get_class_info
from app.services.model_service import model_service

router = APIRouter(prefix="/model", tags=["model"])


@router.get("/status")
def model_status() -> dict:
    return model_service.status()


@router.get("/classes")
def model_classes() -> dict:
    labels = model_service.labels
    if not labels:
        labels = list(CLASS_CATALOG.keys())
    return {
        "source": "model.pretrained_cfg.label_names when loaded; otherwise catalog from model config.json",
        "loaded": model_service.is_loaded,
        "classes": [
            {
                "class_name": name,
                "label_es": get_class_info(name)["label_es"],
                "description": get_class_info(name)["description"],
                "severity": get_class_info(name)["severity"],
            }
            for name in labels
        ],
    }


@router.get("/metrics")
def model_metrics() -> dict:
    return model_service.reported_metrics()
