from __future__ import annotations

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import api_router
from app.config import get_settings
from app.database.session import init_db
from app.services.model_service import model_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agroalerta")

STATIC_DIR = Path(os.getenv("STATIC_DIR", "")).resolve() if os.getenv("STATIC_DIR") else None


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
        allow_origins=settings.cors_origin_list if settings.cors_origin_list else ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router)

    spa_dir = STATIC_DIR if STATIC_DIR and STATIC_DIR.exists() else None

    if spa_dir:
        assets_dir = spa_dir / "assets"
        if assets_dir.exists():
            app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

        @app.get("/")
        async def spa_index() -> FileResponse:
            return FileResponse(spa_dir / "index.html")

        @app.get("/{full_path:path}")
        async def spa_fallback(full_path: str) -> FileResponse:
            # Never shadow API / OpenAPI routes
            reserved = ("api", "docs", "redoc", "openapi.json")
            first = full_path.split("/", 1)[0]
            if first in reserved:
                from fastapi import HTTPException

                raise HTTPException(status_code=404, detail="Not found")
            candidate = spa_dir / full_path
            if full_path and candidate.is_file():
                return FileResponse(candidate)
            return FileResponse(spa_dir / "index.html")
    else:

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
