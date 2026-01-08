# app/sql_models.py

from __future__ import annotations

from datetime import datetime, timezone, date
from uuid import uuid4

from sqlalchemy.dialects.postgresql import UUID, JSONB
from app import db


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ---------- Core identity ----------

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # "patient" or "doctor"
    name = db.Column(db.String(255))
    phone = db.Column(db.String(30))
    is_email_verified = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)


class Patient(db.Model):
    __tablename__ = "patients"

    # NOTE: id == users.id (1‑1 relationship)
    id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
        default=uuid4,
    )
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(20))
    emergency_contact_name = db.Column(db.String(255))
    emergency_contact_phone = db.Column(db.String(30))
    medical_summary = db.Column(db.Text)

    user = db.relationship("User", backref=db.backref("patient_profile", uselist=False))


class Doctor(db.Model):
    __tablename__ = "doctors"

    # NOTE: id == users.id (1‑1 relationship)
    id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
        default=uuid4,
    )
    specialization = db.Column(db.String(255))
    registration_number = db.Column(db.String(100))
    experience_years = db.Column(db.Integer)
    clinic_name = db.Column(db.String(255))
    clinic_address = db.Column(db.Text)

    user = db.relationship("User", backref=db.backref("doctor_profile", uselist=False))


class DoctorPatientLink(db.Model):
    __tablename__ = "doctor_patient_links"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    doctor_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("doctors.id", ondelete="CASCADE"),
        nullable=False,
    )
    patient_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
    )
    status = db.Column(db.String(20), nullable=False, default="active")
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)

    doctor = db.relationship("Doctor", backref="patient_links")
    patient = db.relationship("Patient", backref="doctor_links")

    __table_args__ = (
        db.UniqueConstraint("doctor_id", "patient_id", name="uq_doctor_patient"),
    )


# ---------- Appointments ----------

class Appointment(db.Model):
    __tablename__ = "appointments"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    patient_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
    )
    doctor_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("doctors.id", ondelete="CASCADE"),
        nullable=False,
    )

    start_time = db.Column(db.DateTime(timezone=True), nullable=False)
    end_time = db.Column(db.DateTime(timezone=True))
    status = db.Column(db.String(20), nullable=False, default="scheduled")
    reason = db.Column(db.String(255))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)

    patient = db.relationship("Patient", backref="appointments")
    doctor = db.relationship("Doctor", backref="appointments")


# ---------- Medications ----------

class Medication(db.Model):
    __tablename__ = "medications"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    patient_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
    )
    prescribed_by = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("doctors.id", ondelete="SET NULL"),
        nullable=True,
    )

    name = db.Column(db.String(255), nullable=False)
    dosage = db.Column(db.String(100))
    frequency = db.Column(db.String(100))
    route = db.Column(db.String(50))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    instructions = db.Column(db.Text)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)

    patient = db.relationship("Patient", backref="medications")
    doctor = db.relationship("Doctor", backref="prescriptions")


class MedicationEvent(db.Model):
    __tablename__ = "medication_events"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    medication_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("medications.id", ondelete="CASCADE"),
        nullable=False,
    )
    patient_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
    )

    scheduled_time = db.Column(db.DateTime(timezone=True), nullable=False)
    taken_time = db.Column(db.DateTime(timezone=True))
    status = db.Column(db.String(20), nullable=False)  # scheduled/taken/skipped/missed
    notes = db.Column(db.Text)

    medication = db.relationship("Medication", backref="events")
    patient = db.relationship("Patient", backref="medication_events")


# ---------- Chat ----------

class ChatSession(db.Model):
    __tablename__ = "chat_sessions"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    patient_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
    )
    doctor_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("doctors.id", ondelete="SET NULL"),
        nullable=True,
    )

    type = db.Column(db.String(20), nullable=False)  # "ai" or "doctor"
    title = db.Column(db.String(255))
    started_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)
    closed_at = db.Column(db.DateTime(timezone=True))

    patient = db.relationship("Patient", backref="chat_sessions")
    doctor = db.relationship("Doctor", backref="chat_sessions")


class ChatMessage(db.Model):
    __tablename__ = "chat_messages"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    session_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("chat_sessions.id", ondelete="CASCADE"),
        nullable=False,
    )
    sender_type = db.Column(db.String(20), nullable=False)  # patient/doctor/ai
    sender_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    content = db.Column(db.Text, nullable=False)
    extra_metadata = db.Column(JSONB)  # renamed from `metadata`
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)

    session = db.relationship("ChatSession", backref="messages")
    sender = db.relationship("User", backref="chat_messages")


# ---------- Reports ----------

class PatientReport(db.Model):
    __tablename__ = "patient_reports"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    patient_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
    )
    uploaded_by = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    type = db.Column(db.String(100))
    file_url = db.Column(db.Text, nullable=False)
    date = db.Column(db.Date)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)

    patient = db.relationship("Patient", backref="reports")
    uploader = db.relationship("User", backref="uploaded_reports")
