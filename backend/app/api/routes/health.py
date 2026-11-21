from fastapi import APIRouter

from app.config import get_settings
from app.services.model_service import model_service

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check() -> dict:
    settings = get_settings()
    return {
        "status": "ok",
        "app": settings.app_name,
        "environment": settings.app_env,
        "model": {
            "loaded": model_service.is_loaded,
            "loading": model_service.is_loading,
            "available": model_service.is_loaded,
            "error": model_service.last_error,
        },
        "mvp_note": (
            "MVP de un solo entorno de usuario. "
            "No incluye autenticación multiusuario ni está preparado para producción."
        ),
    }
