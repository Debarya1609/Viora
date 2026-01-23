import os
import re
from openai import OpenAI, RateLimitError

# Defaults: use same Gemini setup as central backend
TONE_MODEL = os.getenv("TONE_MODEL", "gemini-flash-latest")
TONE_AI_API_KEY = os.getenv("TONE_AI_API_KEY")  # can reuse GEMINI_API_KEY

# Only create client if a key is present to avoid import-time errors
client = (
    OpenAI(
        api_key=TONE_AI_API_KEY,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    )
    if TONE_AI_API_KEY
    else None
)

SYSTEM_PROMPT = """
You are a calm, empathetic AI health assistant.

STRICT RULES:
- Do NOT change medical meaning
- Do NOT remove or modify medical terms
- Do NOT reduce urgency
- Do NOT remove safety disclaimers
- Keep answers SHORT and easy to scan (3–6 concise bullet points max)
- Use simple '-' bullet points, not long paragraphs
- Do NOT use any Markdown formatting (*, **, ###, etc.)
- Sound human, kind, and supportive
- Never sound robotic or overly clinical
- No emojis, no slang, no jokes, no exaggerations
"""


BULLET_MARKERS = re.compile(r"^\s*[*•]\s+", re.MULTILINE)
STAR_MARKERS = re.compile(r"\*{1,3}")  # *, **, ***


def _normalize_bullets(text: str) -> str:
    """
    Convert Markdown-style bullets/emphasis into plain text bullets.
    - Leading '* ' or '• ' → '- '
    - Strip *, **, *** used for bold/italics.
    """
    if not text:
        return text
    text = BULLET_MARKERS.sub("- ", text)
    text = STAR_MARKERS.sub("", text)
    return text.strip()


def transform_to_human_tone(clinical_text: str, risk_level: str) -> str:
    """
    Take the AI explanation and risk level, and return a shorter,
    warm, bullet-style version. If the tone model fails or is
    misconfigured, return a safe fallback that still surfaces the
    original text.
    """
    # No key or client configured, skip the model call
    if client is None:
        return (
            "I’m here with you. Based on what we understand so far:\n\n"
            + clinical_text
        )

    user_prompt = f"""
Risk level: {risk_level}

Clinical explanation:
\"\"\"{clinical_text}\"\"\"

Rewrite this as a SHORT, easy-to-scan answer for a patient:

- Start with 1 brief reassurance sentence.
- Then list 3–6 key points using '-' bullets.
- Each bullet should be one concise sentence.
- Do NOT use Markdown formatting (no *, **, ###).
- Do NOT change clinical meaning or urgency.
- Keep all medical terms and safety disclaimers.
"""

    try:
        response = client.chat.completions.create(
            model=TONE_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.4,
        )

        content = response.choices[0].message.content or ""
        content = _normalize_bullets(content)
        return content

    except RateLimitError as e:
        # Quota exhausted → log and fall back to original text
        print(f"Tone adapter Gemini rate limit: {e}")
        return (
            "I’m here with you. Based on what we understand so far:\n\n"
            + clinical_text
        )

    except Exception as e:
        print(f"Tone adapter Gemini error: {type(e).__name__}: {e}")
        # Fallback — never block patient response
        return (
            "I’m here with you. Based on what we understand so far:\n\n"
            + clinical_text
        )
