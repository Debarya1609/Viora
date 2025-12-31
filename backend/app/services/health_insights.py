def extract_clinical_signals(user_input: dict) -> dict:
    return {
        "normalized_symptoms": user_input.get("symptoms", []),
        "mental_state": user_input.get("mood", "neutral"),
        "clinical_summary": "Temporary clinical normalization",
        "confidence": 0.7
    }
