from __future__ import annotations

import os
from typing import Optional
from uuid import UUID

from flask import Blueprint, jsonify, request
import jwt

from app.sql_models import User, Patient, Medication, Appointment, PatientReport
from app.services.ai_handler import handle_patient_ai

bp = Blueprint("nurse", __name__, url_prefix="/nurse")

JWT_SECRET = os.getenv("JWT_SECRET", "dev-jwt-secret")
JWT_ALG = "HS256"


def get_current_user() -> Optional[User]:
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "").strip()
    if not token:
        return None
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.PyJWTError:
        return None
    user_id = payload.get("user_id")
    if not user_id:
        return None
    return User.query.get(user_id)


@bp.post("/chat")
def nurse_chat():
    """
    POST /nurse/chat
    Body: { "message": "text from user" }
    """
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error": "message is required"}), 400

    patient = Patient.query.get(user.id) if user.role == "patient" else None

    meds = (
        Medication.query.filter_by(patient_id=patient.id, is_active=True).all()
        if patient
        else []
    )
    reports = (
        PatientReport.query.filter_by(patient_id=patient.id)
        .order_by(PatientReport.date.desc(), PatientReport.created_at.desc())
        .limit(10)
        .all()
        if patient
        else []
    )
    appointments = (
        Appointment.query.filter_by(patient_id=patient.id)
        .order_by(Appointment.start_time.desc())
        .limit(10)
        .all()
        if patient
        else []
    )

    # Ensure patient_id is JSON-serializable
    patient_id = patient.id if patient else None
    if isinstance(patient_id, UUID):
        patient_id = str(patient_id)

    # Build rich context payload for central + tone pipeline
    context_payload = {
        "patient_id": patient_id,
        "message": message,
        "symptoms": data.get("symptoms") or [],
        "mood": data.get("mood") or "neutral",
        "days_post_discharge": data.get("days_post_discharge"),
        "medications": [m.name for m in meds],
        "reports": [r.to_dict() for r in reports]
        if hasattr(PatientReport, "to_dict")
        else [],
        "appointments": [a.to_dict() for a in appointments]
        if hasattr(Appointment, "to_dict")
        else [],
    }

    try:
        ai_result = handle_patient_ai(context_payload)

        return jsonify(
            {
                "reply": ai_result.get("patient_message"),
                "risk_level": ai_result.get("risk_level"),
                "confidence": ai_result.get("confidence"),
                "escalation": ai_result.get("escalation"),
                "safety_flags": ai_result.get("safety_flags"),
                "clinical_signals": ai_result.get("clinical_signals"),
                "disclaimer": ai_result.get("disclaimer"),
            }
        ), 200

    except Exception as e:
        print("nurse_chat error:", e)
        return jsonify({"error": "Failed to generate nurse reply"}), 500
