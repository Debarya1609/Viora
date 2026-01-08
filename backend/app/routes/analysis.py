from flask import Blueprint, request, jsonify
from app.services.ai_orchestrator import analyze_patient_context
from app.services.risk_engine import classify_risk
from app.services.counselling_engine import generate_response
from app.safety.guardrails import enforce_safety

analysis_bp = Blueprint("analysis", __name__)

@analysis_bp.route("/analyze/", methods=["POST"])
def analyze():
    data = request.get_json()

    ai_output = analyze_patient_context(data)
    risk = classify_risk(data)
    response = generate_response(risk, ai_output)

    enforce_safety(response)

    return jsonify({
        "risk_level": risk,
        "response": {
            "message": response["message"],
            "tone": response["tone"],
            "disclaimer": "This guidance is informational and not a medical diagnosis."
        }
    })
