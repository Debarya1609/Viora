# app/models/patient.py

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4


@dataclass
class EmergencyContact:
    name: str
    phone: str
    relationship: Optional[str] = None


@dataclass
class MedicationSummary:
    """
    Lightweight view of a patient's medication for AI context.
    This mirrors key fields from the `medications` table.
    """
    id: UUID
    name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    route: Optional[str] = None
    is_active: bool = True


@dataclass
class AppointmentSummary:
    """
    Lightweight view of appointments for AI context.
    """
    id: UUID
    doctor_name: Optional[str]
    start_time: datetime
    status: str  # scheduled, completed, cancelled, no_show


@dataclass
class PatientContext:
    """
    In-memory patient model used by the AI orchestration layer.

    - `patient_id` maps to patients.id in Postgres
    - `user_id` maps to users.id
    - This object can be built from DB rows and passed into the AI engines.
    """

    patient_id: UUID = field(default_factory=uuid4)
    user_id: Optional[UUID] = None

    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None

    emergency_contact: Optional[EmergencyContact] = None
    medical_summary: Optional[str] = None  # high-level history / conditions

    # Simple lists, populated from DB when needed
    active_medications: List[MedicationSummary] = field(default_factory=list)
    upcoming_appointments: List[AppointmentSummary] = field(default_factory=list)

    # Free-form extra data (e.g. vitals, recent labs)
    extras: Dict[str, Any] = field(default_factory=dict)

    loaded_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    @property
    def age_years(self) -> Optional[int]:
        if not self.date_of_birth:
            return None
        today = date.today()
        return (
            today.year
            - self.date_of_birth.year
            - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
        )

    def to_ai_context(self) -> Dict[str, Any]:
        """
        Convert to a compact dict the AI prompt builders can use.
        """
        return {
            "patient_id": str(self.patient_id),
            "user_id": str(self.user_id) if self.user_id else None,
            "name": self.full_name,
            "age": self.age_years,
            "gender": self.gender,
            "medical_summary": self.medical_summary,
            "emergency_contact": {
                "name": self.emergency_contact.name,
                "phone": self.emergency_contact.phone,
                "relationship": self.emergency_contact.relationship,
            }
            if self.emergency_contact
            else None,
            "active_medications": [
                {
                    "id": str(m.id),
                    "name": m.name,
                    "dosage": m.dosage,
                    "frequency": m.frequency,
                    "route": m.route,
                    "is_active": m.is_active,
                }
                for m in self.active_medications
            ],
            "upcoming_appointments": [
                {
                    "id": str(a.id),
                    "doctor_name": a.doctor_name,
                    "start_time": a.start_time.isoformat(),
                    "status": a.status,
                }
                for a in self.upcoming_appointments
            ],
            "extras": self.extras,
        }
