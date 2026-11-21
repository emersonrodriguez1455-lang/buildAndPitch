from __future__ import annotations

from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings


class Base(DeclarativeBase):
    pass


_engine: Engine | None = None
_SessionLocal: sessionmaker[Session] | None = None


def _ensure_sqlite_parent(url: str) -> None:
    if url.startswith("sqlite:///"):
        db_path = Path(url.replace("sqlite:///", "", 1))
        if not db_path.is_absolute():
            db_path = Path.cwd() / db_path
        db_path.parent.mkdir(parents=True, exist_ok=True)


def get_engine() -> Engine:
    global _engine, _SessionLocal
    if _engine is None:
        settings = get_settings()
        _ensure_sqlite_parent(settings.database_url)
        connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
        engine = create_engine(settings.database_url, connect_args=connect_args)

        @event.listens_for(engine, "connect")
        def _set_sqlite_pragma(dbapi_connection, connection_record) -> None:  # noqa: ARG001
            if settings.database_url.startswith("sqlite"):
                cursor = dbapi_connection.cursor()
                cursor.execute("PRAGMA foreign_keys=ON")
                cursor.close()

        _engine = engine
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)
    return _engine


def get_session_factory() -> sessionmaker[Session]:
    get_engine()
    assert _SessionLocal is not None
    return _SessionLocal


def reset_engine() -> None:
    global _engine, _SessionLocal
    if _engine is not None:
        _engine.dispose()
    _engine = None
    _SessionLocal = None


def get_db() -> Generator[Session, None, None]:
    db = get_session_factory()()
    try:
        yield db
    finally:
        db.close()


def _migrate_sqlite_columns(engine: Engine) -> None:
    """Add follow-up columns to existing SQLite databases without Alembic."""
    settings = get_settings()
    if not settings.database_url.startswith("sqlite"):
        return

    with engine.begin() as connection:
        rows = connection.exec_driver_sql("PRAGMA table_info(diagnoses)").fetchall()
        existing = {row[1] for row in rows}
        if not existing:
            return
        if "parent_diagnosis_id" not in existing:
            connection.exec_driver_sql(
                "ALTER TABLE diagnoses ADD COLUMN parent_diagnosis_id INTEGER"
            )
        if "root_diagnosis_id" not in existing:
            connection.exec_driver_sql("ALTER TABLE diagnoses ADD COLUMN root_diagnosis_id INTEGER")
        connection.exec_driver_sql(
            "UPDATE diagnoses SET root_diagnosis_id = id WHERE root_diagnosis_id IS NULL"
        )


def init_db() -> None:
    from app import models  # noqa: F401

    settings = get_settings()
    settings.upload_path.mkdir(parents=True, exist_ok=True)
    engine = get_engine()
    Base.metadata.create_all(bind=engine)
    _migrate_sqlite_columns(engine)
