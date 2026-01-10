from app.services.central_client import call_central_backend
from app.services.tone_transformer import transform_to_human_tone


def handle_patient_ai(payload: dict) -> dict:
    """
    Main orchestration function for patient AI flow in Viora.
    - Calls central backend for risk + explanation
    - Applies tone transformer to the explanation
    - Returns a clean, patient-facing object
    """

    # Step 1: Get raw clinical reasoning from central brain
    central_result = call_central_backend(payload)

    base_explanation = (
        central_result.get("ai_explanation")
        or (central_result.get("counselling") or {}).get("message")
        or ""
    )
    risk_level = central_result.get("risk_level", "UNKNOWN")

    # Step 2: Convert to patient-friendly tone
    patient_message = transform_to_human_tone(
        clinical_text=base_explanation,
        risk_level=risk_level,
    )

    # Step 3: Return clean response to the app
    return {
        "patient_id": payload.get("patient_id"),
        "risk_level": risk_level,
        "patient_message": patient_message,
        "confidence": central_result.get("confidence"),
        "escalation": central_result.get("escalation"),
        "safety_flags": central_result.get("safety_flags"),
        "clinical_signals": central_result.get("clinical_signals"),
        "disclaimer": central_result.get("disclaimer"),
    }
