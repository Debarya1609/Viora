def adapt_tone(ai_result: dict, patient_context: dict) -> dict:
    message = ai_result.get("ai_explanation", "")
    mood = patient_context.get("mood", "neutral")
    risk = ai_result.get("risk_level", "LOW")

    prefix = ""
    if mood == "anxious":
        prefix = "I understand this can feel worrying. "
    elif mood == "sad":
        prefix = "I'm really sorry you're feeling this way. "
    elif mood == "angry":
        prefix = "It sounds frustrating to deal with this. "

    if risk == "HIGH":
        suffix = " Please consider contacting a doctor as soon as possible."
    elif risk == "MEDIUM":
        suffix = " It may help to monitor your symptoms closely."
    else:
        suffix = " Many people experience this temporarily."

    return {
        "message": prefix + message + suffix,
        "risk_level": risk,
        "escalation": ai_result.get("escalation"),
        "confidence": ai_result.get("confidence")
    }
