def adapt_tone(ai_result: dict, patient_context: dict) -> dict:
    """
    Take structured AI result + patient context and produce a humanized message.
    """
    # Fallbacks for robustness
    raw_message = (
        ai_result.get("ai_explanation")
        or (ai_result.get("counselling") or {}).get("message")
        or ""
    )

    mood = (patient_context.get("mood") or "neutral").lower()
    risk = (ai_result.get("risk_level") or "LOW").upper()

    # Mood-based prefix
    if mood == "anxious":
        prefix = "I understand this can feel worrying. "
    elif mood == "sad":
        prefix = "I'm really sorry you're feeling this way. "
    elif mood == "angry":
        prefix = "It sounds frustrating to deal with this. "
    else:
        prefix = ""

    # Risk-based suffix
    if risk == "HIGH":
        suffix = " Please consider contacting a doctor as soon as possible."
    elif risk == "MEDIUM":
        suffix = " It may help to monitor your symptoms closely."
    else:
        suffix = " Many people experience this temporarily."

    message = (prefix + raw_message + suffix).strip()

    return {
        "message": message,
        "risk_level": risk,
        "escalation": ai_result.get("escalation"),
        "confidence": ai_result.get("confidence"),
        "safety_flags": ai_result.get("safety_flags"),
        "disclaimer": ai_result.get("disclaimer"),
    }
