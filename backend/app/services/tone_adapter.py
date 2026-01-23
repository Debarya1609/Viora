def adapt_tone(ai_result: dict, patient_context: dict) -> dict:
    """
    Take structured AI result + patient context and produce a humanized message.
    Works on top of Gemini's explanation, adding mood- and risk-aware framing.
    For generic health questions (no personal history).
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
        prefix = "I'm here with you. "

    # Risk-based suffix (slightly more general for Q&A mode)
    if risk == "HIGH":
        suffix = (
            " This could be important. Please contact a doctor or urgent care "
            "as soon as you can, especially if symptoms suddenly worsen or feel severe."
        )
    elif risk == "MEDIUM":
        suffix = (
            " It may help to monitor how you feel and contact a doctor if things "
            "do not improve or if new symptoms appear."
        )
    else:  # LOW or unknown
        suffix = (
            " Many people experience this temporarily, but reach out to a clinician "
            "if you feel unsure or if anything about your symptoms worries you."
        )

    message = (prefix + raw_message + " " + suffix).strip()

    return {
        "message": message,
        "risk_level": risk,
        "escalation": ai_result.get("escalation"),
        "confidence": ai_result.get("confidence"),
        "safety_flags": ai_result.get("safety_flags") or {},
        "disclaimer": ai_result.get("disclaimer"),
    }
