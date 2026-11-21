"""Build care plans and follow-up trends for diagnoses."""

from __future__ import annotations

from typing import Any

from app.core.class_catalog import friendly_label, get_class_info, is_healthy_class, severity_score


def build_care_plan(class_name: str, confidence: float) -> dict[str, Any]:
    info = get_class_info(class_name)
    healthy = is_healthy_class(class_name)
    low_confidence = confidence < 0.45

    if healthy:
        mode = "prevencion"
        headline = "Tu cultivo se ve aparentemente sano: enfócate en prevenir"
        summary = (
            "No predominan señales de las clases problemáticas del modelo. "
            "Aprovecha para reforzar el monitoreo y detectar cambios a tiempo."
        )
        primary_steps = list(info["prevent_steps"])
        secondary_steps = list(info["verify_steps"])
    elif low_confidence:
        mode = "verificar"
        headline = "Hay una señal posible, pero la confianza es baja: verifica en campo"
        summary = (
            "La puntuación del modelo es baja. Antes de asumir una enfermedad, "
            "confirma síntomas a simple vista y vuelve a fotografiar con mejor luz."
        )
        primary_steps = list(info["verify_steps"])
        secondary_steps = list(info["prevent_steps"])
    else:
        mode = "manejar"
        headline = "Posible problema detectado: verifica y actúa con orientación"
        summary = (
            "El modelo sugiere una condición que requiere seguimiento. "
            "Usa los pasos de verificación y manejo cultural; un técnico debe confirmar "
            "antes de cualquier tratamiento."
        )
        primary_steps = list(info["verify_steps"]) + list(info["recover_steps"])
        secondary_steps = list(info["prevent_steps"])

    return {
        "mode": mode,
        "headline": headline,
        "summary": summary,
        "severity_level": info.get("severity_level", "watch"),
        "class_name": class_name,
        "class_label": friendly_label(class_name),
        "primary_steps": primary_steps,
        "secondary_steps": secondary_steps,
        "technician_advice": (
            "Si los síntomas avanzan, hay defoliación o dudas, contacte a un técnico agrícola local. "
            "AgroAlerta no prescribe pesticidas, dosis ni productos químicos."
        ),
        "next_check_days": int(info.get("next_check_days", 7)),
        "disclaimer": (
            "Orientación general de monitoreo. No sustituye un diagnóstico agronómico profesional."
        ),
    }


def compute_trend(
    previous_class: str | None,
    previous_confidence: float | None,
    current_class: str,
    current_confidence: float,
) -> dict[str, Any]:
    if previous_class is None:
        return {
            "code": "primer_escaneo",
            "label": "Primer escaneo",
            "description": "Aún no hay inspecciones anteriores para comparar. Registra un seguimiento pronto.",
            "direction": "neutral",
        }

    prev_healthy = is_healthy_class(previous_class)
    curr_healthy = is_healthy_class(current_class)
    prev_sev = severity_score(previous_class)
    curr_sev = severity_score(current_class)

    if prev_healthy and curr_healthy:
        return {
            "code": "estable_sano",
            "label": "Se mantiene aparentemente sano",
            "description": "Las dos inspecciones apuntan a hoja aparentemente sana. Sigue con prevención.",
            "direction": "up",
        }

    if (not prev_healthy) and curr_healthy:
        return {
            "code": "mejorando",
            "label": "Posible mejora",
            "description": (
                "Antes había una señal problemática y ahora predomina una clasificación aparentemente sana. "
                "Confirma en campo y mantén el seguimiento."
            ),
            "direction": "up",
        }

    if prev_healthy and (not curr_healthy):
        return {
            "code": "empeorando",
            "label": "Posible empeoramiento",
            "description": (
                "La inspección anterior parecía sana y ahora aparece una señal de problema. "
                "Verifica síntomas y acelera el seguimiento."
            ),
            "direction": "down",
        }

    if curr_sev < prev_sev:
        return {
            "code": "mejorando",
            "label": "Posible mejora",
            "description": "La severidad estimada bajó respecto al escaneo anterior. Confirma visualmente.",
            "direction": "up",
        }

    if curr_sev > prev_sev:
        return {
            "code": "empeorando",
            "label": "Posible empeoramiento",
            "description": "La severidad estimada subió. Prioriza verificación y asesoría técnica.",
            "direction": "down",
        }

    if previous_class == current_class:
        delta = current_confidence - (previous_confidence or 0)
        if abs(delta) < 0.08:
            return {
                "code": "estable",
                "label": "Estable",
                "description": (
                    f"Sigue predominando {friendly_label(current_class)}. "
                    "Continúa el plan de manejo y compara fotos."
                ),
                "direction": "neutral",
            }
        if delta > 0:
            return {
                "code": "estable",
                "label": "Misma condición, más clara",
                "description": (
                    "La misma clase aparece con mayor confianza del modelo. "
                    "No implica necesariamente más daño, pero sí prioriza el seguimiento."
                ),
                "direction": "neutral",
            }
        return {
            "code": "estable",
            "label": "Misma condición, menos clara",
            "description": (
                "La misma clase aparece con menor confianza. "
                "Toma otra foto con mejor luz y confirma en campo."
            ),
            "direction": "neutral",
        }

    return {
        "code": "cambio_clase",
        "label": "Cambio de clasificación",
        "description": (
            f"Pasó de {friendly_label(previous_class)} a {friendly_label(current_class)}. "
            "Compara ambas fotos y pide validación técnica si hay duda."
        ),
        "direction": "neutral",
    }
