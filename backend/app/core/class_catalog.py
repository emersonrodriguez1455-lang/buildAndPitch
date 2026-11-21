"""Centralized friendly labels, descriptions and inspection guidance.

Labels are keyed by the real class names from the Hugging Face model
`ixrbhii/coffee-disease-convnext` (config.json label_names).
"""

from __future__ import annotations

CLASS_CATALOG: dict[str, dict[str, str]] = {
    "Berry Blotch": {
        "label_es": "Manchas de baya",
        "description": (
            "El modelo sugiere señales compatibles con manchas asociadas a frutos/hojas "
            "en la clase Berry Blotch. La clasificación es experimental y requiere verificación en campo."
        ),
        "recommendation": (
            "Revise hojas y frutos cercanos de la misma planta. Documente nuevas fotografías "
            "para comparar la evolución y consulte a un técnico agrícola si los síntomas persisten."
        ),
        "severity": "issue",
    },
    "Cercospora Brown Eye Spot": {
        "label_es": "Mancha de ojo pardo (Cercospora)",
        "description": (
            "El modelo sugiere una posible mancha de ojo pardo (Cercospora). "
            "Esta clase puede ser difícil de distinguir en fotografías de campo."
        ),
        "recommendation": (
            "Inspeccione las hojas y frutos cercanos. Documente las lesiones observadas "
            "y solicite una evaluación técnica si los síntomas persisten."
        ),
        "severity": "issue",
    },
    "Healthy": {
        "label_es": "Hoja aparentemente sana",
        "description": (
            "El modelo no identificó señales predominantes de las clases problemáticas "
            "contempladas. Esto no garantiza ausencia de otras afecciones."
        ),
        "recommendation": (
            "No se identificaron señales predominantes de las clases problemáticas contempladas "
            "por el modelo. Continúe con las inspecciones periódicas."
        ),
        "severity": "healthy",
    },
    "Leaf Miner": {
        "label_es": "Minador de la hoja",
        "description": (
            "El modelo sugiere patrones compatibles con daño por minador de la hoja. "
            "Confirme visualmente galerías o trazas en el tejido foliar."
        ),
        "recommendation": (
            "Observe el envés y el haz de varias hojas de la misma zona. Registre nuevas "
            "fotografías y solicite orientación técnica antes de cualquier intervención."
        ),
        "severity": "issue",
    },
    "Phoma": {
        "label_es": "Phoma",
        "description": (
            "El modelo sugiere una condición compatible con Phoma. "
            "La identificación definitiva requiere inspección agronómica."
        ),
        "recommendation": (
            "Revise brotes y hojas adyacentes. Documente la extensión de los síntomas "
            "y solicite validación de un técnico agrícola."
        ),
        "severity": "issue",
    },
    "Red Spider Mite": {
        "label_es": "Ácaro rojo",
        "description": (
            "El modelo sugiere señales compatibles con ácaro rojo. "
            "Verifique decoloraciones, punteado o presencia de ácaros en campo."
        ),
        "recommendation": (
            "Inspeccione el envés de varias hojas con buena iluminación. Compare con "
            "fotografías posteriores y consulte a un técnico si la afectación avanza."
        ),
        "severity": "issue",
    },
    "Rust": {
        "label_es": "Roya del café",
        "description": (
            "El modelo sugiere una posible roya del café. "
            "Busque manchas amarillas o anaranjadas en el envés de las hojas."
        ),
        "recommendation": (
            "Revise otras hojas de la misma planta y observe si existen manchas amarillas "
            "o anaranjadas. Registre nuevas fotografías para comparar la evolución."
        ),
        "severity": "issue",
    },
}

DEFAULT_RECOMMENDATION = (
    "Documente la observación, compare con inspecciones previas y solicite "
    "validación de un técnico agrícola. No aplique tratamientos sin orientación profesional."
)


def get_class_info(class_name: str) -> dict[str, str]:
    return CLASS_CATALOG.get(
        class_name,
        {
            "label_es": class_name,
            "description": (
                f"Clasificación experimental: {class_name}. "
                "Requiere verificación por un técnico agrícola."
            ),
            "recommendation": DEFAULT_RECOMMENDATION,
            "severity": "issue",
        },
    )


def friendly_label(class_name: str) -> str:
    return get_class_info(class_name)["label_es"]


def recommendation_for(class_name: str) -> str:
    return get_class_info(class_name)["recommendation"]


def is_healthy_class(class_name: str) -> bool:
    return get_class_info(class_name)["severity"] == "healthy"
