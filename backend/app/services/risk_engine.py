def classify_risk(ai_output, raw_input):
    symptoms = raw_input.get("symptoms", [])

    # High-risk red flags
    if "chest pain" in symptoms or "severe bleeding" in symptoms:
        return "HIGH"

    # Medium risk if AI confidence is low
    if ai_output.get("confidence", 1) < 0.4:
        return "MEDIUM"

    # Default
    return "LOW"
