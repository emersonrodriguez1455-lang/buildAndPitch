"""Centralized friendly labels, care plans and inspection guidance.

Labels are keyed by the real class names from the Hugging Face model
`ixrbhii/coffee-disease-convnext` (config.json label_names).

Importante: las orientaciones son culturales y de monitoreo.
No prescriben pesticidas, productos químicos ni dosis.
"""

from __future__ import annotations

from typing import Any

CLASS_CATALOG: dict[str, dict[str, Any]] = {
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
        "severity_level": "action",
        "verify_steps": [
            "Observe frutos y hojas cercanas buscando manchas similares.",
            "Tome fotos del haz y del envés con buena luz natural.",
            "Marque la planta o el surco para poder volver a inspeccionarla.",
        ],
        "prevent_steps": [
            "Mantenga buena circulación de aire podando sombra excesiva.",
            "Evite acumular restos vegetales húmedos cerca de la planta.",
            "Registre inspecciones cada 7 a 10 días en temporada húmeda.",
        ],
        "recover_steps": [
            "Retire hojas o frutos muy afectados solo si un técnico lo recomienda.",
            "Separe material enfermo del área de cultivo y no lo deje en el suelo de la parcela.",
            "Compare fotos semanales para ver si la mancha se expande o se estabiliza.",
            "Consulte a un técnico agrícola antes de cualquier producto o tratamiento.",
        ],
        "next_check_days": 7,
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
        "severity_level": "action",
        "verify_steps": [
            "Busque manchas circulares con centro claro y borde oscuro.",
            "Revise varias hojas de la misma planta y plantas vecinas.",
            "Anote si hay defoliación o frutos manchados.",
        ],
        "prevent_steps": [
            "Evite mojar en exceso el follaje en horas de poca ventilación.",
            "Mantenga la parcela limpia de hojas caídas muy infectadas.",
            "Programe revisiones frecuentes tras lluvias prolongadas.",
        ],
        "recover_steps": [
            "Documente la extensión de las lesiones con fotos fecha a fecha.",
            "Priorice la visita técnica: esta clase suele confundirse en fotos.",
            "No aplique productos por cuenta propia; pida orientación local.",
            "Si avanza, aísle visualmente el sector para seguimiento intensivo.",
        ],
        "next_check_days": 5,
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
        "severity_level": "none",
        "verify_steps": [
            "Confirme a simple vista que no hay manchas, galerías ni polvo anaranjado.",
            "Revise también el envés de 3 a 5 hojas cercanas.",
            "Guarde esta foto como referencia de una planta sana.",
        ],
        "prevent_steps": [
            "Inspeccione la parcela cada 10 a 14 días, o semanalmente en época lluviosa.",
            "Mantenga sombra y ventilación equilibradas.",
            "Observe plantas nuevas o sectores húmedos con más atención.",
            "Registre cualquier cambio temprano con una nueva foto en AgroAlerta.",
        ],
        "recover_steps": [
            "No se requieren acciones de recuperación: mantenga el monitoreo preventivo.",
        ],
        "next_check_days": 14,
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
        "severity_level": "watch",
        "verify_steps": [
            "Busque galerías o caminos claros dentro de la hoja.",
            "Revise hojas jóvenes y adultas del mismo brote.",
            "Anote si el daño es puntual o está en varias plantas.",
        ],
        "prevent_steps": [
            "Monitoree brotes nuevos semanalmente.",
            "Mantenga maleza controlada alrededor del cafeto.",
            "Registre focos tempranos para actuar con asesoría a tiempo.",
        ],
        "recover_steps": [
            "Quite hojas muy dañadas solo si el técnico lo indica.",
            "Compare fotos cada 7 días para ver si aparecen nuevas galerías.",
            "Consulte manejo integrado local; evite tratamientos improvisados.",
        ],
        "next_check_days": 7,
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
        "severity_level": "action",
        "verify_steps": [
            "Revise brotes tiernos y hojas nuevas.",
            "Observe si hay necrosis o muerte de tejidos en puntas.",
            "Compare con plantas vecinas del mismo surco.",
        ],
        "prevent_steps": [
            "Evite heridas innecesarias en brotes durante labores.",
            "Mejore ventilación en zonas muy sombreadas y húmedas.",
            "Documente condiciones climáticas asociadas a nuevos focos.",
        ],
        "recover_steps": [
            "Marque el sector afectado y haga seguimiento fotográfico semanal.",
            "Retire material muy dañado solo con indicación técnica.",
            "Solicite evaluación profesional antes de cualquier intervención química.",
        ],
        "next_check_days": 7,
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
        "severity_level": "watch",
        "verify_steps": [
            "Inspeccione el envés con buena luz buscando punteado o polvo fino.",
            "Revise hojas de la parte media y alta de la planta.",
            "Anote si hay amarillamiento o bronceado del follaje.",
        ],
        "prevent_steps": [
            "Evite polvo excesivo y estrés hídrico extremo cuando sea posible.",
            "Monitoree con más frecuencia en épocas secas y calurosas.",
            "Mantenga plantas vigorizadas con buen manejo cultural general.",
        ],
        "recover_steps": [
            "Haga seguimiento cada 5 a 7 días con fotos del mismo sector.",
            "Si el daño se extiende, contacte al técnico para un plan de manejo.",
            "No use productos caseros o dosis improvisadas.",
        ],
        "next_check_days": 5,
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
        "severity_level": "action",
        "verify_steps": [
            "Voltee la hoja y busque polvo o pústulas anaranjadas en el envés.",
            "Revise hojas del tercio medio e inferior de la planta.",
            "Cuente aproximadamente cuántas hojas cercanas muestran síntomas.",
        ],
        "prevent_steps": [
            "Mantenga un programa de inspección semanal en temporada de lluvias.",
            "Evite exceso de sombra y humedad estancada en la parcela.",
            "Guarde fotos de referencia de hojas sanas para comparar después.",
        ],
        "recover_steps": [
            "Marque plantas o surcos afectados para seguimiento.",
            "Retire hojas muy infectadas solo según recomendación técnica local.",
            "Compare fotos semanales: ¿hay más hojas afectadas o se estabilizó?",
            "Solicite a un técnico un plan de manejo integrado adaptado a su finca.",
            "No aplique fungicidas ni dosis sin orientación profesional.",
        ],
        "next_check_days": 7,
    },
}

DEFAULT_RECOMMENDATION = (
    "Documente la observación, compare con inspecciones previas y solicite "
    "validación de un técnico agrícola. No aplique tratamientos sin orientación profesional."
)

DEFAULT_CARE = {
    "label_es": None,
    "description": "Clasificación experimental. Requiere verificación por un técnico agrícola.",
    "recommendation": DEFAULT_RECOMMENDATION,
    "severity": "issue",
    "severity_level": "watch",
    "verify_steps": [
        "Documente la hoja con fotos claras del haz y del envés.",
        "Revise plantas vecinas del mismo sector.",
    ],
    "prevent_steps": [
        "Mantenga inspecciones periódicas.",
        "Conserve un historial fotográfico de la parcela.",
    ],
    "recover_steps": [
        "Consulte a un técnico agrícola antes de intervenir.",
        "Registre un seguimiento en AgroAlerta para ver la evolución.",
    ],
    "next_check_days": 7,
}


def get_class_info(class_name: str) -> dict[str, Any]:
    if class_name in CLASS_CATALOG:
        return CLASS_CATALOG[class_name]
    fallback = dict(DEFAULT_CARE)
    fallback["label_es"] = class_name
    fallback["description"] = (
        f"Clasificación experimental: {class_name}. "
        "Requiere verificación por un técnico agrícola."
    )
    return fallback


def friendly_label(class_name: str) -> str:
    return str(get_class_info(class_name)["label_es"])


def recommendation_for(class_name: str) -> str:
    return str(get_class_info(class_name)["recommendation"])


def is_healthy_class(class_name: str) -> bool:
    return get_class_info(class_name)["severity"] == "healthy"


def severity_score(class_name: str) -> int:
    level = get_class_info(class_name).get("severity_level", "watch")
    if level == "none":
        return 0
    if level == "watch":
        return 1
    return 2
