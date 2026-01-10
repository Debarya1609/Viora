from flask import Blueprint, request, jsonify
from app.services.central_client import call_central_backend
from app.services.tone_adapter import adapt_tone

intake_bp = Blueprint("intake", __name__, url_prefix="/intake")


@intake_bp.route("/daily", methods=["POST"])
def daily_intake():
    """
    Daily intake route that:
    - accepts basic patient check-in
    - calls central backend for analysis
    - adapts tone for patient-facing response
    """
    data = request.get_json() or {}

    if "patient_id" not in data:
        return jsonify({"error": "patient_id required"}), 400

    central_result = call_central_backend(data)

    # If central returns an error-style object, bubble it up
    if isinstance(central_result, dict) and "error" in central_result:
        return jsonify(central_result), 503

    patient_response = adapt_tone(central_result, data)

    return jsonify(
        {
            "patient_id": data["patient_id"],
            "response": patient_response,
        }
    )
