from flask import Blueprint, request, jsonify
from app.services.ai_handler import handle_patient_ai

patient_ai_bp = Blueprint("patient_ai", __name__, url_prefix="/patient/ai")


@patient_ai_bp.route("/", methods=["POST"])
def patient_ai():
    """
    Generic AI endpoint for patient flows.
    Delegates to handle_patient_ai, which calls central backend
    and applies tone transformation.
    """
    payload = request.get_json() or {}
    if not payload:
        return jsonify({"error": "Invalid JSON"}), 400

    result = handle_patient_ai(payload)
    return jsonify(result), 200
