from __future__ import annotations

import asyncio
import logging
import threading
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from PIL import Image

from app.config import Settings, get_settings
from app.core.class_catalog import friendly_label, get_class_info, recommendation_for

logger = logging.getLogger(__name__)


@dataclass
class PredictionAlternative:
    class_name: str
    label: str
    confidence: float


@dataclass
class PredictionResult:
    predicted_class: str
    predicted_class_label: str
    confidence: float
    alternatives: list[PredictionAlternative]
    recommendation: str
    description: str
    is_healthy: bool
    model_name: str
    model_version: str


class ModelService:
    """Lazy-loaded ConvNeXt coffee disease classifier via timm."""

    def __init__(self, settings: Settings | None = None):
        self.settings = settings or get_settings()
        self._model: Any = None
        self._transform: Any = None
        self._labels: list[str] = []
        self._device: str = "cpu"
        self._loaded = False
        self._loading = False
        self._error: str | None = None
        self._lock = threading.Lock()
        self._infer_lock = asyncio.Lock()

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    @property
    def is_loading(self) -> bool:
        return self._loading

    @property
    def last_error(self) -> str | None:
        return self._error

    @property
    def labels(self) -> list[str]:
        return list(self._labels)

    def status(self) -> dict[str, Any]:
        return {
            "loaded": self._loaded,
            "loading": self._loading,
            "available": self._loaded,
            "device": self._device if self._loaded else None,
            "model_name": self.settings.model_name,
            "model_version": self.settings.model_version,
            "model_repo": self.settings.model_repo,
            "classes": self._labels,
            "error": self._error,
            "disclaimer": (
                "Clasificador experimental de imágenes completas. "
                "Las puntuaciones son confianza del modelo (softmax), no diagnósticos clínicos."
            ),
        }

    def reported_metrics(self) -> dict[str, Any]:
        """Metrics reported by the model authors on their held-out set.

        These are NOT independently verified by AgroAlerta AI.
        """
        return {
            "source": "Hugging Face model card: ixrbhii/coffee-disease-convnext",
            "verification_status": "reported_by_authors_not_independently_verified",
            "note": (
                "Los valores siguientes fueron publicados por los autores del modelo "
                "sobre 506 fotos de prueba del mismo origen de entrenamiento. "
                "Fotos de campo reales suelen puntuar más bajo. "
                "AgroAlerta AI no ha reproducido estas métricas en este MVP."
            ),
            "reported_test_accuracy": 0.947,
            "reported_macro_f1": 0.809,
            "reported_test_photos": 506,
            "class_metrics_reported": [
                {"class_name": "Berry Blotch", "recall": 0.923, "f1": 0.774, "test_photos": 13},
                {"class_name": "Cercospora Brown Eye Spot", "recall": 0.091, "f1": 0.167, "test_photos": 11},
                {"class_name": "Healthy", "recall": 0.993, "f1": 0.980, "test_photos": 150},
                {"class_name": "Leaf Miner", "recall": 1.000, "f1": 1.000, "test_photos": 65},
                {"class_name": "Phoma", "recall": 0.978, "f1": 0.978, "test_photos": 89},
                {"class_name": "Red Spider Mite", "recall": 0.929, "f1": 0.812, "test_photos": 28},
                {"class_name": "Rust", "recall": 0.927, "f1": 0.949, "test_photos": 150},
            ],
            "local_evaluation": {
                "status": "pending",
                "message": "Pendiente de evaluación reproducible con fotografías de Guatemala.",
            },
        }

    def load(self) -> None:
        with self._lock:
            if self._loaded or self._loading:
                return
            self._loading = True
            self._error = None

        try:
            import timm
            import torch

            logger.info("Cargando modelo %s ...", self.settings.model_repo)
            model = timm.create_model(self.settings.model_repo, pretrained=True)
            model.eval()

            device = "cuda" if torch.cuda.is_available() else "cpu"
            model.to(device)

            cfg = timm.data.resolve_data_config({}, model=model)
            transform = timm.data.create_transform(**cfg)

            labels = list(model.pretrained_cfg.get("label_names") or [])
            if not labels:
                # Fallback only if hub config omits labels — documented real order from config.json
                labels = [
                    "Berry Blotch",
                    "Cercospora Brown Eye Spot",
                    "Healthy",
                    "Leaf Miner",
                    "Phoma",
                    "Red Spider Mite",
                    "Rust",
                ]
                logger.warning("label_names ausentes en pretrained_cfg; usando orden de config.json del repo.")

            with self._lock:
                self._model = model
                self._transform = transform
                self._labels = labels
                self._device = device
                self._loaded = True
                self._loading = False
                self._error = None
            logger.info("Modelo cargado en %s con %s clases.", device, len(labels))
        except Exception as exc:  # noqa: BLE001
            logger.exception("Error al cargar el modelo")
            with self._lock:
                self._loaded = False
                self._loading = False
                self._error = str(exc)
                self._model = None
                self._transform = None

    async def ensure_loaded(self) -> bool:
        if self._loaded:
            return True
        if self._loading:
            while self._loading:
                await asyncio.sleep(0.2)
            return self._loaded
        await asyncio.to_thread(self.load)
        return self._loaded

    def _predict_sync(self, image_path: Path) -> PredictionResult:
        if not self._loaded or self._model is None or self._transform is None:
            raise RuntimeError("El modelo de inteligencia artificial no está disponible.")

        import torch

        image = Image.open(image_path).convert("RGB")
        tensor = self._transform(image).unsqueeze(0).to(self._device)

        with torch.inference_mode():
            logits = self._model(tensor)
            probabilities = torch.softmax(logits, dim=-1)[0]
            ranked = torch.argsort(probabilities, descending=True)

        alternatives: list[PredictionAlternative] = []
        for idx in ranked.tolist():
            class_name = self._labels[idx] if idx < len(self._labels) else f"class_{idx}"
            confidence = float(probabilities[idx].item())
            alternatives.append(
                PredictionAlternative(
                    class_name=class_name,
                    label=friendly_label(class_name),
                    confidence=confidence,
                )
            )

        top = alternatives[0]
        info = get_class_info(top.class_name)
        return PredictionResult(
            predicted_class=top.class_name,
            predicted_class_label=top.label,
            confidence=top.confidence,
            alternatives=alternatives[:3],
            recommendation=recommendation_for(top.class_name),
            description=info["description"],
            is_healthy=info["severity"] == "healthy",
            model_name=self.settings.model_name,
            model_version=self.settings.model_version,
        )

    async def predict(self, image_path: Path) -> PredictionResult:
        ready = await self.ensure_loaded()
        if not ready:
            raise RuntimeError(
                self._error
                or "El modelo de inteligencia artificial no está disponible en este momento."
            )
        async with self._infer_lock:
            return await asyncio.to_thread(self._predict_sync, image_path)


model_service = ModelService()
