from flask import Blueprint, request, jsonify
from app.services.ai_handler import handle_patient_ai

patient_ai_bp = Blueprint("patient_ai", __name__, url_prefix="/patient/ai")


@patient_ai_bp.route("/", methods=["POST"])
def patient_ai():
    payload = request.get_json()
    if not payload:
        return jsonify({"error": "Invalid JSON"}), 400

    result = handle_patient_ai(payload)
    return jsonify(result), 200
