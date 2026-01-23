import os
from app.services.health_insights import extract_clinical_signals
from app.services.gemini_provider import GeminiProvider
from app.services.central_client import call_central_backend


def analyze_patient_context(context: dict) -> dict:
    """
    In Viora main backend:
    - Extract clinical signals from the user's question
    - Preferred: call central backend (Gemini-powered pipeline)
    - Fallback: call Gemini directly from this backend
    - Normalize to { clinical_signals, explanation, confidence, ... }
    """
    # 1) Extract structured clinical signals (question + optional symptoms/mood)
    clinical_signals = extract_clinical_signals(context)

    provider_name = os.getenv("AI_PROVIDER", "central").lower()

    # Preferred path: delegate to central backend (Gemini pipeline)
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
            "safety_flags": central_result.get("safety_flags") or {},
            "disclaimer": central_result.get("disclaimer"),
        }

    # Fallback path: direct Gemini provider (local)
    elif provider_name == "gemini":
        ai = GeminiProvider()
        reasoning = ai.analyze(clinical_signals)
        return {
            "clinical_signals": clinical_signals,
            "explanation": reasoning.get("explanation", ""),
            "confidence": reasoning.get("confidence", 0.5),
            "risk_level": None,
            "escalation": None,
            "safety_flags": {},
            "disclaimer": None,
        }

    else:
        raise RuntimeError(
            f"Unsupported AI_PROVIDER: {provider_name}. Use 'central' or 'gemini'"
        )
