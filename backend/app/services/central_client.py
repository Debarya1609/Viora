import os
import requests

CENTRAL_BACKEND_URL = os.getenv(
    "CENTRAL_BACKEND_URL",
    "https://viora-central-backend.onrender.com"
)

def call_central_backend(payload: dict) -> dict:
    """
    Sends patient context to central brain and returns raw clinical output
    """
    try:
        response = requests.post(
            f"{CENTRAL_BACKEND_URL}/analyze",
            json=payload,
            timeout=10
        )

        response.raise_for_status()
        return response.json()

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
                "reason": "central_unavailable"
            }
        }
