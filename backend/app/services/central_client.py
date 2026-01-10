import os
import requests

CENTRAL_BACKEND_URL = os.getenv(
    "CENTRAL_BACKEND_URL",
    "https://viora-central-backend.onrender.com",
)


def call_central_backend(payload: dict) -> dict:
    """
    Sends patient context to central brain and returns raw clinical output.
    Never raises to the caller; always returns a safe dict.
    """
    try:
        resp = requests.post(
            f"{CENTRAL_BACKEND_URL}/doctor/ask-nurse",
            json=payload,
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()

        # Ensure minimal keys exist for downstream logic
        return {
            "risk_level": data.get("risk_level", "UNKNOWN"),
            "ai_explanation": data.get("ai_explanation")
            or data.get("counselling", {}).get("message")
            or "I have analyzed your symptoms, but my explanation is limited right now.",
            "confidence": data.get("confidence", 0.0),
            "escalation": data.get("escalation", {}),
            "safety_flags": data.get("safety_flags", {}),
            "clinical_signals": data.get("clinical_signals", {}),
            "counselling": data.get("counselling"),
            "disclaimer": data.get("disclaimer"),
        }

    except requests.RequestException:
        # Patient app must NEVER crash
        return {
            "risk_level": "UNKNOWN",
            "ai_explanation": (
                "I’m having a small delay understanding your symptoms right now. "
                "Please give me a moment and try again shortly."
            ),
            "confidence": 0.0,
            "escalation": {
                "requires_doctor": False,
                "reason": "central_unavailable",
            },
            "safety_flags": {},
            "clinical_signals": {},
            "counselling": None,
            "disclaimer": None,
        }
