# app/models/interaction.py

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4
from datetime import datetime, timezone


class Role(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
    TOOL = "tool"


@dataclass
class Message:
    """
    Single chat message in a conversation.

    This is an in-memory model used by the AI pipeline.
    It can later be mapped to the `chat_messages` table.
    """

    id: UUID = field(default_factory=uuid4)
    session_id: Optional[UUID] = None           # link to ChatSession.id if needed
    role: Role = Role.USER
    content: str = ""
    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ChatSummary:
    """
    Optional summary / analysis for a conversation
    (risk scores, topics, sentiment, etc.).
    """

    risk_level: Optional[str] = None            # e.g. "low", "medium", "high"
    sentiment: Optional[str] = None             # e.g. "positive", "neutral", "negative"
    key_points: List[str] = field(default_factory=list)
    follow_up_actions: List[str] = field(default_factory=list)
    raw_scores: Dict[str, Any] = field(default_factory=dict)  # numeric scores per engine


@dataclass
class ChatSessionInteraction:
    """
    In-memory representation of a chat session and its messages
    used by the orchestrator and safety layers.
    """

    id: UUID = field(default_factory=uuid4)
    patient_id: Optional[UUID] = None           # maps to patients.id
    doctor_id: Optional[UUID] = None            # maps to doctors.id (if doctor chat)
    type: str = "ai"                            # "ai" or "doctor"
    title: Optional[str] = None
    messages: List[Message] = field(default_factory=list)
    summary: Optional[ChatSummary] = None
    started_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    meta: Dict[str, Any] = field(default_factory=dict)

    def add_message(self, message: Message) -> None:
        """
        Append a new message and update timestamps.
        """
        if message.session_id is None:
            message.session_id = self.id
        self.messages.append(message)
        self.updated_at = datetime.now(timezone.utc)

    def last_user_message(self) -> Optional[Message]:
        """
        Convenience helper: get most recent user message.
        """
        for msg in reversed(self.messages):
            if msg.role == Role.USER:
                return msg
        return None

    def to_llm_messages(self) -> List[Dict[str, str]]:
        """
        Convert conversation into OpenAI-style messages list:
        [{ "role": "user" | "assistant" | "system", "content": "..." }, ...]
        """
        return [
            {"role": msg.role.value, "content": msg.content}
            for msg in self.messages
        ]
