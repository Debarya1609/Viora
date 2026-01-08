def classify_risk(raw_input: dict) -> str:
    symptoms = raw_input.get("symptoms", [])
    mood = raw_input.get("mood", "").lower()

    if "chest pain" in symptoms or "shortness of breath" in symptoms:
        return "HIGH"

    if mood in ["anxious", "depressed"]:
        return "MEDIUM"

    return "LOW"
