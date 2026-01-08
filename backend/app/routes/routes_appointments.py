# app/routes_appointments.py

from __future__ import annotations

from datetime import datetime
import os
from typing import Optional

from flask import Blueprint, jsonify, request
import jwt

from app import db
from app.sql_models import User, Patient, Doctor, Appointment  # see example models below

bp = Blueprint("appointments", __name__, url_prefix="/appointments")

JWT_SECRET = os.getenv("JWT_SECRET", "dev-jwt-secret")
JWT_ALG = "HS256"


def get_current_user() -> Optional[User]:
    """
    Decode JWT from Authorization header and return User or None.
    """
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


@bp.get("")
def list_appointments():
    """
    GET /appointments

    - If role == patient: return this patient's appointments.
    - If role == doctor: return this doctor's appointments.
    """
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if user.role == "patient":
        patient = Patient.query.get(user.id)  # patients.id == users.id
        if not patient:
            return jsonify([])

        appts = (
            Appointment.query.filter_by(patient_id=patient.id)
            .order_by(Appointment.start_time.desc())
            .all()
        )

    elif user.role == "doctor":
        doctor = Doctor.query.get(user.id)
        if not doctor:
            return jsonify([])

        appts = (
            Appointment.query.filter_by(doctor_id=doctor.id)
            .order_by(Appointment.start_time.desc())
            .all()
        )
    else:
        return jsonify({"error": "Invalid role"}), 400

    return jsonify([appointment_to_dict(a) for a in appts])


@bp.post("")
def create_appointment():
    """
    POST /appointments

    Body:
      {
        "patient_id": "<uuid>",   # required (for doctor creating)
        "doctor_id": "<uuid>",    # optional; can default to current doctor
        "start_time": "ISO8601",
        "end_time": "ISO8601 or null",
        "reason": "string",
        "notes": "string"
      }

    - Patient can book only for themself (patient_id inferred from token).
    - Doctor can specify patient_id and optionally doctor_id (defaults to self).
    """
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json() or {}

    # parse times
    try:
        start_time = datetime.fromisoformat(data.get("start_time"))
    except Exception:
        return jsonify({"error": "Invalid or missing start_time"}), 400

    end_time_raw = data.get("end_time")
    end_time = None
    if end_time_raw:
        try:
            end_time = datetime.fromisoformat(end_time_raw)
        except Exception:
            return jsonify({"error": "Invalid end_time"}), 400

    reason = data.get("reason")
    notes = data.get("notes")

    if user.role == "patient":
        patient = Patient.query.get(user.id)
        if not patient:
            return jsonify({"error": "Patient profile not found"}), 400

        # patient can choose doctor_id (e.g. from UI)
        doctor_id = data.get("doctor_id")
        if not doctor_id:
            return jsonify({"error": "doctor_id is required"}), 400

        appt = Appointment(
            patient_id=patient.id,
            doctor_id=doctor_id,
            start_time=start_time,
            end_time=end_time,
            status="scheduled",
            reason=reason,
            notes=notes,
        )

    elif user.role == "doctor":
        doctor = Doctor.query.get(user.id)
        if not doctor:
            return jsonify({"error": "Doctor profile not found"}), 400

        patient_id = data.get("patient_id")
        if not patient_id:
            return jsonify({"error": "patient_id is required"}), 400

        # doctor_id can be given or default to current doctor
        doctor_id = data.get("doctor_id") or doctor.id

        appt = Appointment(
            patient_id=patient_id,
            doctor_id=doctor_id,
            start_time=start_time,
            end_time=end_time,
            status="scheduled",
            reason=reason,
            notes=notes,
        )
    else:
        return jsonify({"error": "Invalid role"}), 400

    db.session.add(appt)
    db.session.commit()

    return jsonify(appointment_to_dict(appt)), 201


@bp.patch("/<uuid:appointment_id>")
def update_appointment(appointment_id):
    """
    PATCH /appointments/<id>

    Allow updating:
      - status (scheduled/completed/cancelled/no_show)
      - start_time, end_time, reason, notes (optional)
    """
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    appt: Appointment | None = Appointment.query.get(appointment_id)
    if not appt:
        return jsonify({"error": "Appointment not found"}), 404

    # Basic permission check:
    if user.role == "patient":
        if str(appt.patient_id) != str(user.id):
            return jsonify({"error": "Forbidden"}), 403
    elif user.role == "doctor":
        if str(appt.doctor_id) != str(user.id):
            return jsonify({"error": "Forbidden"}), 403

    data = request.get_json() or {}

    status = data.get("status")
    if status:
        appt.status = status

    if "start_time" in data and data["start_time"]:
        try:
            appt.start_time = datetime.fromisoformat(data["start_time"])
        except Exception:
            return jsonify({"error": "Invalid start_time"}), 400

    if "end_time" in data:
        if data["end_time"]:
            try:
                appt.end_time = datetime.fromisoformat(data["end_time"])
            except Exception:
                return jsonify({"error": "Invalid end_time"}), 400
        else:
            appt.end_time = None

    if "reason" in data:
        appt.reason = data["reason"]

    if "notes" in data:
        appt.notes = data["notes"]

    db.session.commit()

    return jsonify(appointment_to_dict(appt))


def appointment_to_dict(a: Appointment) -> dict:
    return {
        "id": str(a.id),
        "patient_id": str(a.patient_id),
        "doctor_id": str(a.doctor_id),
        "start_time": a.start_time.isoformat() if a.start_time else None,
        "end_time": a.end_time.isoformat() if a.end_time else None,
        "status": a.status,
        "reason": a.reason,
        "notes": a.notes,
        "created_at": a.created_at.isoformat() if getattr(a, "created_at", None) else None,
    }
