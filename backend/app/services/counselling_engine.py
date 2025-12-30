def generate_response(risk_level, ai_output):
    if risk_level == "LOW":
        return {
            "message": "What you're experiencing is common during recovery. You're doing okay.",
            "tone": "reassuring"
        }

    if risk_level == "MEDIUM":
        return {
            "message": "Some of your symptoms need closer monitoring. Please keep an eye on how you feel today.",
            "tone": "supportive"
        }

    return {
        "message": "Your symptoms may need medical attention. Please contact your doctor or visit a hospital.",
        "tone": "urgent"
    }
