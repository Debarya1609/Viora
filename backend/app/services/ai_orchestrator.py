import os
from app.services.health_insights import extract_clinical_signals
from app.services.openrouter_provider import OpenRouterProvider
from app.services.central_client import call_central_backend  # new import


def analyze_patient_context(context: dict) -> dict:
    """
    In Viora:
    - Extract clinical signals
    - Either call central backend (preferred) or OpenRouter directly
    - Normalize to { clinical_signals, explanation, confidence }
    """
    clinical_signals = extract_clinical_signals(context)

    provider_name = os.getenv("AI_PROVIDER", "central").lower()

    # Preferred path: delegate to central backend
    if provider_name == "central":
        central_payload = {
            **context,
            "clinical_signals": clinical_signals,
        }
        central_result = call_central_backend(central_payload)

        explanation = (
            central_result.get("ai_explanation")
            or (central_result.get("counselling") or {}).get("message")
            or ""
        )
        confidence = central_result.get("confidence", 0.5)

        return {
            "clinical_signals": central_result.get(
                "clinical_signals", clinical_signals
            ),
            "explanation": explanation,
            "confidence": confidence,
            "risk_level": central_result.get("risk_level"),
            "escalation": central_result.get("escalation"),
            "safety_flags": central_result.get("safety_flags"),
            "disclaimer": central_result.get("disclaimer"),
        }

    # Legacy path: direct OpenRouter provider
    elif provider_name == "openrouter":
        ai = OpenRouterProvider()
        reasoning = ai.analyze(clinical_signals)
        return {
            "clinical_signals": clinical_signals,
            "explanation": reasoning.get("explanation", ""),
            "confidence": reasoning.get("confidence", 0.5),
        }

    else:
        raise RuntimeError(f"Unsupported AI_PROVIDER: {provider_name}")
