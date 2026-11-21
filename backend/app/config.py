from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "AgroAlerta AI"
    app_env: str = "development"
    debug: bool = True
    database_url: str = f"sqlite:///{(BASE_DIR / 'data' / 'agroalerta.db').as_posix()}"
    upload_dir: str = str(BASE_DIR / "uploads")
    max_image_size_mb: int = 10
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    model_repo: str = "hf-hub:ixrbhii/coffee-disease-convnext"
    model_name: str = "Coffee Disease Classifier"
    model_version: str = "convnext_small"
    auto_load_model: bool = True
    host: str = "0.0.0.0"
    port: int = 8000

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def max_image_size_bytes(self) -> int:
        return self.max_image_size_mb * 1024 * 1024

    @property
    def upload_path(self) -> Path:
        return Path(self.upload_dir).resolve()


@lru_cache
def get_settings() -> Settings:
    return Settings()
