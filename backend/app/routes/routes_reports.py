# app/routes_reports.py

from __future__ import annotations

from datetime import datetime
import os
from typing import Optional

from flask import Blueprint, jsonify, request, current_app
import jwt
from werkzeug.utils import secure_filename

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


def allowed_file(filename: str) -> bool:
    """
    Check extension against allowed set in config.
    """
    if "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    allowed = current_app.config.get(
        "ALLOWED_REPORT_EXTENSIONS",
        {"pdf", "png", "jpg", "jpeg"},
    )
    return ext in allowed  # basic extension filter[web:952][web:1130]


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

    Expects multipart/form-data:

    - file: the uploaded report file (PDF, image, etc.)
    - type: optional string (e.g. "Discharge Summary", "Lab Report")
    - date: optional ISO string (e.g. "2026-01-09T00:00:00Z" or "2026-01-09")
    - notes: optional string
    - patient_id: optional (required when user.role == "doctor")

    - patient: can only create for themselves (patient_id inferred from Patient row).
    - doctor: must specify patient_id; uploaded_by = doctor user.id.
    """
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    # 1) Validate file
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400

    # 2) Save file to UPLOAD_FOLDER
    upload_root = current_app.config.get("UPLOAD_FOLDER")
    if not upload_root:
        # Sensible default if not configured
        upload_root = os.path.join(current_app.instance_path, "uploads")
        os.makedirs(upload_root, exist_ok=True)
        current_app.config["UPLOAD_FOLDER"] = upload_root

    filename = secure_filename(file.filename)
    os.makedirs(upload_root, exist_ok=True)
    save_path = os.path.join(upload_root, filename)
    file.save(save_path)  # File is now on disk[web:952][web:1086][web:1133]

    # 3) Read metadata from form fields
    report_type = request.form.get("type")
    notes = request.form.get("notes")
    raw_date = request.form.get("date")

    date_value = None
    if raw_date:
        # Allow both full ISO and simple YYYY-MM-DD
        try:
            # If it has 'T', parse full ISO; else treat as date only
            if "T" in raw_date:
                date_value = datetime.fromisoformat(raw_date).date()
            else:
                date_value = datetime.fromisoformat(raw_date).date()
        except Exception:
            return jsonify({"error": "Invalid date"}), 400

    # 4) Determine patient_id based on role
    if user.role == "patient":
        patient = Patient.query.get(user.id)
        if not patient:
            return jsonify({"error": "Patient profile not found"}), 400

        report = PatientReport(
            patient_id=patient.id,
            uploaded_by=user.id,
            type=report_type,
            file_url=save_path,  # store server path or relative path
            date=date_value,
            notes=notes,
        )

    elif user.role == "doctor":
        patient_id = request.form.get("patient_id")
        if not patient_id:
            return jsonify({"error": "patient_id is required"}), 400

        report = PatientReport(
            patient_id=patient_id,
            uploaded_by=user.id,
            type=report_type,
            file_url=save_path,
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
    (Still JSON-based; file replacement flow can be added later if needed.)
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
