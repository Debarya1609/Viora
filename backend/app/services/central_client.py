import os
import requests


CENTRAL_BACKEND_URL = os.getenv(
    "CENTRAL_BACKEND_URL",
    "http://localhost:8000",  # Local central backend by default
)


def call_central_backend(payload: dict) -> dict:
    """
    Sends user health question/context to the central Gemini backend
    and returns structured clinical output.

    Graceful fallback ensures the patient app never crashes.
    """
    try:
        resp = requests.post(
            f"{CENTRAL_BACKEND_URL}/doctor/ask-nurse",
            json=payload,
            timeout=15,  # Slightly longer for Gemini
        )
        resp.raise_for_status()
        data = resp.json()

        # Prefer the AI explanation, then counselling message, else empty string
        ai_explanation = (
            data.get("ai_explanation")
            or (data.get("counselling") or {}).get("message")
            or ""
        )

        return {
            "risk_level": data.get("risk_level", "UNKNOWN"),
            "ai_explanation": ai_explanation,
            "confidence": data.get("confidence", 0.0),
            "escalation": data.get("escalation", {}),
            "safety_flags": data.get("safety_flags") or {},
            "clinical_signals": data.get("clinical_signals", {}),
            "counselling": data.get("counselling"),
            "disclaimer": data.get("disclaimer"),
        }

    except requests.RequestException as e:
        print(f"Central backend unavailable or rate-limited: {e}")
        # Patient app must NEVER crash - safe fallback
        return {
            "risk_level": "UNKNOWN",
            "ai_explanation": (
                "The central AI service is currently unavailable or has reached its usage limit. "
                "This answer is based on general safety guidance, not a personalized analysis. "
                "Monitor your symptoms closely, and contact a doctor or emergency services if you "
                "have chest pain, difficulty breathing, very high fever, or if you feel worse."
            ),
            "confidence": 0.0,
            "escalation": {
                "requires_doctor": True,
                "reason": "central_unavailable",
            },
            "safety_flags": {
                "ai_unavailable": True,
                "needs_human_review": True,
            },
            "clinical_signals": {},
            "counselling": None,
            "disclaimer": "This is not medical advice. Consult a healthcare professional.",
        }
