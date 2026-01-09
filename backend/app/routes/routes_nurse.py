from __future__ import annotations

import os
from typing import Optional

from flask import Blueprint, jsonify, request
import jwt

from app.sql_models import User, Patient, Medication, Appointment, PatientReport
from app.services.ai_orchestrator import generate_nurse_reply  # <== use your AI here

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

    data = request.get_json() or {}
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

    # Call your existing model/orchestrator with full context
    reply_text = generate_nurse_reply(
        user_message=message,
        medications=meds,
        reports=reports,
        appointments=appointments,
        patient=patient,
    )

    return jsonify({"reply": reply_text})
