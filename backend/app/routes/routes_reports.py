# app/routes_reports.py

from __future__ import annotations

from datetime import datetime
import os
from typing import Optional

from flask import Blueprint, jsonify, request
import jwt

from app import db
from app.sql_models import User, Patient, PatientReport

bp = Blueprint("reports", __name__, url_prefix="/reports")

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


def report_to_dict(r: PatientReport) -> dict:
    return {
        "id": str(r.id),
        "patient_id": str(r.patient_id),
        "uploaded_by": str(r.uploaded_by) if r.uploaded_by else None,
        "type": r.type,
        "file_url": r.file_url,
        "date": r.date.isoformat() if r.date else None,
        "notes": r.notes,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    }


@bp.get("")
def list_reports():
    """
    GET /reports

    - patient: own reports (patient_id = their patient.id)
    - doctor: reports of patients they are linked to (for MVP, return all)
      -> you can later filter by patient or doctor panel.
    """
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if user.role == "patient":
        patient = Patient.query.get(user.id)
        if not patient:
            return jsonify([])
        reports = (
            PatientReport.query.filter_by(patient_id=patient.id)
            .order_by(PatientReport.date.desc(), PatientReport.created_at.desc())
            .all()
        )
    elif user.role == "doctor":
        # MVP: show all reports; later restrict to their linked patients
        reports = (
            PatientReport.query.order_by(
                PatientReport.date.desc(), PatientReport.created_at.desc()
            ).all()
        )
    else:
        return jsonify({"error": "Invalid role"}), 400

    return jsonify([report_to_dict(r) for r in reports])


@bp.post("")
def create_report():
    """
    POST /reports

    Body:
      {
        "patient_id": "<uuid>",        # required for doctors; ignored for patient
        "type": "lab" | "imaging" | ...,
        "file_url": "https://...",     # for MVP, just a URL or placeholder
        "date": "YYYY-MM-DD",
        "notes": "optional notes"
      }

    - patient: can only create for themselves (patient_id inferred).
    - doctor: must specify patient_id; uploaded_by = doctor user.id.
    """
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json() or {}

    file_url = (data.get("file_url") or "").strip()
    if not file_url:
        return jsonify({"error": "file_url is required for now"}), 400

    report_type = data.get("type")
    notes = data.get("notes")

    date_value = None
    if data.get("date"):
        try:
            date_value = datetime.fromisoformat(data["date"]).date()
        except Exception:
            return jsonify({"error": "Invalid date"}), 400

    if user.role == "patient":
        patient = Patient.query.get(user.id)
        if not patient:
            return jsonify({"error": "Patient profile not found"}), 400

        report = PatientReport(
            patient_id=patient.id,
            uploaded_by=user.id,
            type=report_type,
            file_url=file_url,
            date=date_value,
            notes=notes,
        )

    elif user.role == "doctor":
        patient_id = data.get("patient_id")
        if not patient_id:
            return jsonify({"error": "patient_id is required"}), 400

        report = PatientReport(
            patient_id=patient_id,
            uploaded_by=user.id,
            type=report_type,
            file_url=file_url,
            date=date_value,
            notes=notes,
        )
    else:
        return jsonify({"error": "Invalid role"}), 400

    db.session.add(report)
    db.session.commit()

    return jsonify(report_to_dict(report)), 201


@bp.put("/<uuid:report_id>")
@bp.patch("/<uuid:report_id>")
def update_report(report_id):
    """
    PUT/PATCH /reports/<id>

    Allow updating: type, file_url, date, notes.
    """
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    report: PatientReport | None = PatientReport.query.get(report_id)
    if not report:
        return jsonify({"error": "Report not found"}), 404

    # Permissions:
    if user.role == "patient":
        if str(report.patient_id) != str(user.id):
            return jsonify({"error": "Forbidden"}), 403
    elif user.role == "doctor":
        # For MVP, allow edit for any report; later restrict to own patients
        pass
    else:
        return jsonify({"error": "Invalid role"}), 400

    data = request.get_json() or {}

    if "type" in data:
        report.type = data["type"]

    if "file_url" in data:
        report.file_url = data["file_url"]

    if "date" in data:
        if data["date"]:
            try:
                report.date = datetime.fromisoformat(data["date"]).date()
            except Exception:
                return jsonify({"error": "Invalid date"}), 400
        else:
            report.date = None

    if "notes" in data:
        report.notes = data["notes"]

    db.session.commit()

    return jsonify(report_to_dict(report))


@bp.delete("/<uuid:report_id>")
def delete_report(report_id):
    """
    DELETE /reports/<id>
    """
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    report: PatientReport | None = PatientReport.query.get(report_id)
    if not report:
        return jsonify({"error": "Report not found"}), 404

    if user.role == "patient":
        if str(report.patient_id) != str(user.id):
            return jsonify({"error": "Forbidden"}), 403
    elif user.role == "doctor":
        # For MVP, allow delete; later restrict
        pass
    else:
        return jsonify({"error": "Invalid role"}), 400

    db.session.delete(report)
    db.session.commit()

    return jsonify({"ok": True})
