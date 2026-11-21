from __future__ import annotations

import io

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.config import get_settings
from app.database.session import Base, get_engine, init_db, reset_engine
from app.main import app
from app.services.model_service import model_service


@pytest.fixture()
def client(tmp_path, monkeypatch):
    db_path = tmp_path / "test.db"
    upload_dir = tmp_path / "uploads"
    upload_dir.mkdir()

    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path.as_posix()}")
    monkeypatch.setenv("UPLOAD_DIR", str(upload_dir))
    monkeypatch.setenv("AUTO_LOAD_MODEL", "false")

    get_settings.cache_clear()
    reset_engine()
    init_db()

    model_service._loaded = False
    model_service._loading = False
    model_service._error = "Modelo deshabilitado en pruebas unitarias"
    model_service._model = None

    with TestClient(app) as test_client:
        yield test_client

    engine = get_engine()
    Base.metadata.drop_all(bind=engine)
    reset_engine()
    get_settings.cache_clear()


@pytest.fixture()
def sample_image_bytes() -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (64, 64), color=(34, 139, 87)).save(buffer, format="JPEG")
    return buffer.getvalue()
