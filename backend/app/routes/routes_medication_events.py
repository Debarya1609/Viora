from __future__ import annotations

from datetime import datetime, date
from flask import Blueprint, jsonify, g
from app import db
from app.sql_models import MedicationEvent, Medication, Patient
from app.routes.routes_auth import auth_required  # use shared JWT auth

bp = Blueprint("medication_events", __name__, url_prefix="/medication-events")


def get_today_range():
    today = date.today()
    start = datetime.combine(today, datetime.min.time()).astimezone()
    end = datetime.combine(today, datetime.max.time()).astimezone()
    return start, end


@bp.get("/today")
@auth_required
def list_today_events():
    user = g.current_user

    patient = Patient.query.get(user.id)
    if not patient:
        return jsonify([])

    start, end = get_today_range()

    events = (
        MedicationEvent.query.join(Medication)
        .filter(
            MedicationEvent.patient_id == patient.id,
            MedicationEvent.scheduled_time >= start,
            MedicationEvent.scheduled_time <= end,
        )
        .order_by(MedicationEvent.scheduled_time.asc())
        .all()
    )

    def serialize(ev: MedicationEvent):
        med = ev.medication
        return {
            "id": str(ev.id),
            "medication_id": str(ev.medication_id),
            "name": med.name if med else None,
            "dosage": med.dosage if med else None,
            "scheduled_time": ev.scheduled_time.isoformat(),
            "taken_time": ev.taken_time.isoformat() if ev.taken_time else None,
            "status": ev.status,
            "notes": ev.notes,
            # "reminder_id": ev.reminder_id,
        }

    return jsonify([serialize(e) for e in events])


@bp.patch("/<uuid:event_id>/mark-taken")
@auth_required
def mark_event_taken(event_id):
    user = g.current_user

    patient = Patient.query.get(user.id)
    if not patient:
        return jsonify({"error": "Not a patient"}), 400

    ev = MedicationEvent.query.get(event_id)
    if not ev or ev.patient_id != patient.id:
        return jsonify({"error": "Not found"}), 404

    ev.status = "taken"
    ev.taken_time = datetime.now().astimezone()
    db.session.commit()

    return jsonify({"ok": True, "event_id": str(ev.id)})
