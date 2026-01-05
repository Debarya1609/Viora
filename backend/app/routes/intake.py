from flask import Blueprint, request, jsonify
from app.services.central_client import call_central_backend

from app.services.tone_adapter import adapt_tone

intake_bp = Blueprint("intake", __name__, url_prefix="/intake")

@intake_bp.route("/daily", methods=["POST"])
def daily_intake():
    data = request.get_json()

    if not data or "patient_id" not in data:
        return jsonify({"error": "patient_id required"}), 400

    result = call_central_backend(data)
    central_result = result

    if "error" in central_result:
        return jsonify(central_result), 503

    patient_response = adapt_tone(central_result, data)

    return jsonify({
        "patient_id": data["patient_id"],
        "response": patient_response
    })
