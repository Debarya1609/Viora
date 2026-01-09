# app/routes/routes_profile.py
from __future__ import annotations

from datetime import datetime

from flask import Blueprint, jsonify, request

from app import db
from app.sql_models import User, Patient
from app.routes.routes_medications import get_current_user  # reuse helper

bp = Blueprint("profile", __name__, url_prefix="/me")


def patient_to_dict(user: User, patient: Patient | None) -> dict:
    """
    Combine User + Patient into a single profile payload.

    User fields:
      - name  -> full_name
      - phone -> phone

    Patient fields:
      - date_of_birth
      - gender
      - medical_summary -> conditions
    """
    return {
        "id": str(user.id),
        "full_name": user.name,  # User.name
        "date_of_birth": (
            patient.date_of_birth.isoformat()
            if patient and patient.date_of_birth
            else None
        ),
        "gender": patient.gender if patient else None,
        "phone": user.phone,  # User.phone
        "address": None,  # not in DB yet
        "blood_group": None,  # not in DB yet
        "conditions": patient.medical_summary if patient else None,
        "allergies": None,  # not in DB yet
    }


@bp.get("/profile-status")
def profile_status():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    patient = Patient.query.get(user.id)

    # For now, treat profile as "complete" if we have a user.name and a patient row.
    full_name = (user.name or "").strip()
    has_patient = patient is not None

    is_complete = bool(full_name and has_patient)
    return jsonify({"needs_profile": not is_complete})


@bp.get("/profile")
def get_profile():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    patient = Patient.query.get(user.id)
    # It’s okay if patient is None; we still return a profile with user data.
    return jsonify(patient_to_dict(user, patient)), 200


@bp.put("/profile")
def update_profile():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json() or {}

    full_name = (data.get("full_name") or "").strip()
    gender = (data.get("gender") or "").strip()
    # blood_group not in DB yet, so we just read it and ignore for now
    blood_group = (data.get("blood_group") or "").strip()

    if not full_name or not gender:
        return (
            jsonify({"error": "full_name and gender are required"}),
            400,
        )

    # Update User name & phone
    user.name = full_name
    if "phone" in data:
        user.phone = data.get("phone") or None

    # Ensure Patient row exists
    patient = Patient.query.get(user.id)
    if not patient:
        patient = Patient(id=user.id)
        db.session.add(patient)

    # Update Patient fields that exist
    patient.gender = gender

    dob_str = data.get("date_of_birth")
    if dob_str:
        try:
            patient.date_of_birth = datetime.fromisoformat(dob_str).date()
        except Exception:
            return jsonify({"error": "Invalid date_of_birth"}), 400

    # Map conditions -> medical_summary
    if "conditions" in data:
        patient.medical_summary = data.get("conditions") or None

    # address, blood_group, allergies not in current model; ignore for now

    db.session.commit()

    return jsonify(patient_to_dict(user, patient)), 200
