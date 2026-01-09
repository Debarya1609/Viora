# app/routes_medications.py

from __future__ import annotations

from datetime import datetime
import os
from typing import Optional

from flask import Blueprint, jsonify, request
import jwt

from app import db
from app.sql_models import User, Patient, Doctor, Medication, MedicationEvent

bp = Blueprint("medications", __name__, url_prefix="/medications")

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


def medication_to_dict(m: Medication) -> dict:
    return {
        "id": str(m.id),
        "patient_id": str(m.patient_id),
        "prescribed_by": str(m.prescribed_by) if m.prescribed_by else None,
        "name": m.name,
        "dosage": m.dosage,
        "frequency": m.frequency,
        "route": m.route,
        "start_date": m.start_date.isoformat() if m.start_date else None,
        "end_date": m.end_date.isoformat() if m.end_date else None,
        "instructions": m.instructions,
        "is_active": m.is_active,
        "created_at": m.created_at.isoformat() if m.created_at else None,
    }


@bp.get("")
def list_medications():
    """
    GET /medications

    - patient: all meds where patient_id = their patient.id
    - doctor: all meds they prescribed (prescribed_by = doctor.id)
    """
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if user.role == "patient":
        # Patient.id is assumed to match User.id
        patient = Patient.query.get(user.id)
        if not patient:
            return jsonify([])

        meds = (
            Medication.query.filter_by(patient_id=patient.id)
            .order_by(Medication.created_at.desc())
            .all()
        )

    elif user.role == "doctor":
        doctor = Doctor.query.get(user.id)
        if not doctor:
            return jsonify([])

        meds = (
            Medication.query.filter_by(prescribed_by=doctor.id)
            .order_by(Medication.created_at.desc())
            .all()
        )
    else:
        return jsonify({"error": "Invalid role"}), 400

    return jsonify([medication_to_dict(m) for m in meds])


@bp.post("")
def create_medication():
    """
    POST /medications

    Body:
      {
        "patient_id": "<uuid>",     # required for doctor; ignored for patient
        "name": "Atorvastatin",
        "dosage": "10 mg",
        "frequency": "Once daily",
        "route": "oral",
        "start_date": "YYYY-MM-DD",
        "end_date": "YYYY-MM-DD or null",
        "instructions": "Take after food",
        "is_active": true           # optional, defaults to true
      }

    - patient: creates medication for themselves (no prescribed_by).
    - doctor: creates medication for given patient_id with prescribed_by = doctor.id.
    """
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json() or {}

    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "Medication name is required"}), 400

    dosage = data.get("dosage")
    frequency = data.get("frequency")
    route = data.get("route")
    instructions = data.get("instructions")

    start_date = None
    if data.get("start_date"):
        try:
            start_date = datetime.fromisoformat(data["start_date"]).date()
        except Exception:
            return jsonify({"error": "Invalid start_date"}), 400

    end_date = None
    if data.get("end_date"):
        try:
            end_date = datetime.fromisoformat(data["end_date"]).date()
        except Exception:
            return jsonify({"error": "Invalid end_date"}), 400

    # default to True if not provided
    is_active = bool(data.get("is_active", True))

    if user.role == "patient":
        # Look up patient by primary key (same as user.id)
        patient = Patient.query.get(user.id)

        # Dev-friendly: auto-create patient if missing so you can test
        if not patient:
            patient = Patient(id=user.id)  # add other required fields if needed
            db.session.add(patient)
            db.session.commit()

        med = Medication(
            patient_id=patient.id,
            prescribed_by=None,
            name=name,
            dosage=dosage,
            frequency=frequency,
            route=route,
            start_date=start_date,
            end_date=end_date,
            instructions=instructions,
            is_active=is_active,
        )

    elif user.role == "doctor":
        doctor = Doctor.query.get(user.id)
        if not doctor:
            return jsonify({"error": "Doctor profile not found"}), 400

        patient_id = data.get("patient_id")
        if not patient_id:
            return jsonify({"error": "patient_id is required"}), 400

        med = Medication(
            patient_id=patient_id,
            prescribed_by=doctor.id,
            name=name,
            dosage=dosage,
            frequency=frequency,
            route=route,
            start_date=start_date,
            end_date=end_date,
            instructions=instructions,
            is_active=is_active,
        )
    else:
        return jsonify({"error": "Invalid role"}), 400

    db.session.add(med)
    db.session.commit()

    return jsonify(medication_to_dict(med)), 201


@bp.put("/<uuid:medication_id>")
@bp.patch("/<uuid:medication_id>")
def update_medication(medication_id):
    """
    PUT/PATCH /medications/<id>

    Allow updating: name, dosage, frequency, route, start_date, end_date,
    instructions, is_active.
    """
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    med: Medication | None = Medication.query.get(medication_id)
    if not med:
        return jsonify({"error": "Medication not found"}), 404

    # Permission: patient can change only their meds; doctor only their patients' meds
    if user.role == "patient":
        patient = Patient.query.get(user.id)
        if not patient or str(med.patient_id) != str(patient.id):
            return jsonify({"error": "Forbidden"}), 403

    elif user.role == "doctor":
        doctor = Doctor.query.get(user.id)
        if not doctor:
            return jsonify({"error": "Doctor profile not found"}), 400
        if med.prescribed_by and str(med.prescribed_by) != str(doctor.id):
            return jsonify({"error": "Forbidden"}), 403

    data = request.get_json() or {}

    if "name" in data and data["name"]:
        med.name = data["name"].strip()

    if "dosage" in data:
        med.dosage = data["dosage"]

    if "frequency" in data:
        med.frequency = data["frequency"]

    if "route" in data:
        med.route = data["route"]

    if "instructions" in data:
        med.instructions = data["instructions"]

    if "start_date" in data:
        if data["start_date"]:
            try:
                med.start_date = datetime.fromisoformat(
                    data["start_date"]
                ).date()
            except Exception:
                return jsonify({"error": "Invalid start_date"}), 400
        else:
            med.start_date = None

    if "end_date" in data:
        if data["end_date"]:
            try:
                med.end_date = datetime.fromisoformat(
                    data["end_date"]
                ).date()
            except Exception:
                return jsonify({"error": "Invalid end_date"}), 400
        else:
            med.end_date = None

    if "is_active" in data:
        med.is_active = bool(data["is_active"])

    db.session.commit()

    return jsonify(medication_to_dict(med))


@bp.delete("/<uuid:medication_id>")
def delete_medication(medication_id):
    """
    DELETE /medications/<id>
    """
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    med: Medication | None = Medication.query.get(medication_id)
    if not med:
        return jsonify({"error": "Medication not found"}), 404

    if user.role == "patient":
        patient = Patient.query.get(user.id)
        if not patient or str(med.patient_id) != str(patient.id):
            return jsonify({"error": "Forbidden"}), 403

    elif user.role == "doctor":
        doctor = Doctor.query.get(user.id)
        if not doctor:
            return jsonify({"error": "Doctor profile not found"}), 400
        if med.prescribed_by and str(med.prescribed_by) != str(doctor.id):
            return jsonify({"error": "Forbidden"}), 403

    db.session.delete(med)
    db.session.commit()

    return jsonify({"ok": True})
