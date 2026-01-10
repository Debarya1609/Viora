import os
from openai import OpenAI

TONE_MODEL = os.getenv("TONE_MODEL", "gpt-4o-mini")
TONE_AI_API_KEY = os.getenv("TONE_AI_API_KEY")

# Only create client if a key is present to avoid import-time errors
client = OpenAI(api_key=TONE_AI_API_KEY) if TONE_AI_API_KEY else None

SYSTEM_PROMPT = """
You are a calm, empathetic AI nurse.

STRICT RULES:
- Do NOT change medical meaning
- Do NOT remove or modify medical terms
- Do NOT reduce urgency
- Do NOT remove safety disclaimers
- Only improve tone, warmth, clarity, and reassurance
- Sound human, kind, and supportive
- Never sound robotic or overly clinical
- No emojis, no slang, no jokes, no exaggerations
"""


def transform_to_human_tone(clinical_text: str, risk_level: str) -> str:
    """
    Take the clinical explanation and risk level, and return a warmer
    but medically identical version. If tone model fails or is misconfigured,
    return a safe fallback that still surfaces the original text.
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

Rewrite this in a warm, gentle, reassuring nurse-like tone.
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
        return content.strip()

    except Exception:
        # Fallback — never block patient response
        return (
            "I’m here with you. Based on what we understand so far:\n\n"
            + clinical_text
        )
