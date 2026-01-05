from app.services.central_client import call_central_backend
from app.services.tone_transformer import transform_to_human_tone

def handle_patient_ai(payload: dict) -> dict:
    """
    Main orchestration function for patient AI flow
    """

    # Step 1: Get raw clinical reasoning
    central_result = call_central_backend(payload)

    # Step 2: Convert to patient-friendly tone
    patient_message = transform_to_human_tone(
        clinical_text=central_result.get("ai_explanation", ""),
        risk_level=central_result.get("risk_level", "UNKNOWN")
    )

    # Step 3: Return clean response
    return {
        "patient_id": payload.get("patient_id"),
        "risk_level": central_result.get("risk_level"),
        "patient_message": patient_message,
        "confidence": central_result.get("confidence"),
        "escalation": central_result.get("escalation")
    }
