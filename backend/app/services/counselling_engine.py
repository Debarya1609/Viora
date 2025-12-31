def generate_response(risk_level, ai_output):
    explanation = ai_output.get("explanation", "")

    if risk_level == "LOW":
        return {
            "message": explanation,
            "tone": "reassuring"
        }

    if risk_level == "MEDIUM":
        return {
            "message": explanation,
            "tone": "supportive"
        }

    return {
        "message": explanation,
        "tone": "urgent"
    }
