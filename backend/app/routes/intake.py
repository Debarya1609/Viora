from flask import Blueprint, request, jsonify

intake_bp = Blueprint("intake", __name__, url_prefix="/intake")

@intake_bp.route("/daily", methods=["POST"])
def daily_intake():
    data = request.json

    required = ["symptoms", "mood", "medications"]
    for r in required:
        if r not in data:
            return jsonify({"error": f"{r} missing"}), 400

    return jsonify({
        "status": "received",
        "next": "analysis"
    })
