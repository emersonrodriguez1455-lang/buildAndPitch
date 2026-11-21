from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from PIL import Image, UnidentifiedImageError

from app.config import Settings


ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}


class ImageService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.upload_dir = settings.upload_path
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    async def validate_and_store(self, upload: UploadFile) -> tuple[str, str, Path]:
        if not upload.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debe proporcionar un archivo de imagen.",
            )

        original_name = Path(upload.filename).name
        extension = Path(original_name).suffix.lower()
        if extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Formato no permitido. Use JPG, JPEG, PNG o WEBP.",
            )

        content_type = (upload.content_type or "").lower()
        if content_type and content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El tipo MIME de la imagen no es válido.",
            )

        data = await upload.read()
        if not data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La imagen está vacía o corrupta.",
            )

        if len(data) > self.settings.max_image_size_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"La imagen supera el tamaño máximo de {self.settings.max_image_size_mb} MB.",
            )

        unique_name = f"{uuid.uuid4().hex}{extension}"
        destination = self.upload_dir / unique_name

        try:
            destination.write_bytes(data)
            with Image.open(destination) as img:
                img.verify()
            with Image.open(destination) as img:
                rgb = img.convert("RGB")
                rgb.save(destination, format="JPEG" if extension in {".jpg", ".jpeg"} else img.format)
        except (UnidentifiedImageError, OSError, ValueError) as exc:
            if destination.exists():
                destination.unlink(missing_ok=True)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo leer la imagen. Verifique que el archivo no esté corrupto.",
            ) from exc

        return unique_name, original_name, destination

    def delete_image(self, stored_name: str) -> None:
        path = self.upload_dir / Path(stored_name).name
        if path.exists() and path.is_file():
            path.unlink()

    def resolve_path(self, stored_name: str) -> Path:
        path = (self.upload_dir / Path(stored_name).name).resolve()
        if not str(path).startswith(str(self.upload_dir.resolve())):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ruta de imagen inválida.")
        if not path.exists():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imagen no encontrada.")
        return path
