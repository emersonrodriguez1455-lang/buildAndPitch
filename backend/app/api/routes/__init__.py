from fastapi import APIRouter

from app.api.routes import diagnosis, farms, health, model, plots, statistics

api_router = APIRouter(prefix="/api")
api_router.include_router(health.router)
api_router.include_router(farms.router)
api_router.include_router(plots.router)
api_router.include_router(diagnosis.router)
api_router.include_router(statistics.router)
api_router.include_router(model.router)
