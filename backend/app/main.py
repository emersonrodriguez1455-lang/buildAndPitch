from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import api_router
from app.config import get_settings
from app.database.session import init_db
from app.services.model_service import model_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agroalerta")


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    init_db()
    settings.upload_path.mkdir(parents=True, exist_ok=True)
    logger.info("Base de datos inicializada.")

    if settings.auto_load_model:
        asyncio.create_task(asyncio.to_thread(model_service.load))
        logger.info("Carga del modelo iniciada en segundo plano.")

    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        description=(
            "API de AgroAlerta AI para registro de fincas, parcelas e inspección "
            "experimental de hojas de café mediante visión artificial."
        ),
        version="1.0.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router)

    @app.get("/")
    def root() -> dict:
        return {
            "app": settings.app_name,
            "message": "Inteligencia que protege tus cultivos.",
            "docs": "/docs",
            "health": "/api/health",
        }

    return app


app = create_app()
