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
    Kept for future use when you allow users to select a medication
    to ask about. Not used in current generic chatbot flow.
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
    Kept for future use (select an appointment/report to discuss).
    Not used in current generic chatbot flow.
    """
    id: UUID
    doctor_name: Optional[str]
    start_time: datetime
    status: str


@dataclass
class PatientContext:
    """
    In-memory patient model used by the AI orchestration layer.

    For the current version of Viora, the chatbot behaves as a
    general medical information assistant and does NOT use personal
    medications, reports, or appointments in prompts.

    These fields stay so you can plug them in later when you add:
    - 'ask about this medication'
    - 'ask about this report/appointment'
    """

    patient_id: UUID = field(default_factory=uuid4)
    user_id: Optional[UUID] = None

    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None

    emergency_contact: Optional[EmergencyContact] = None
    medical_summary: Optional[str] = None

    # Lists kept for future richer context (not used in prompts yet)
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
            - (
                (today.month, today.day)
                < (self.date_of_birth.month, self.date_of_birth.day)
            )
        )

    def to_ai_context(self) -> Dict[str, Any]:
        """
        Convert to a compact dict the AI prompt builders can use.

        For now, only identity/demographics are provided.
        Medication/report/appointment details are excluded from
        prompts until the user explicitly selects them in a future update.
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
            # NOTE: not passing detailed meds/appointments now
            "extras": self.extras,
        }
