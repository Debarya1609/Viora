import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("TONE_AI_API_KEY"))

SYSTEM_PROMPT = """
You are a calm, empathetic AI nurse.

STRICT RULES:
- Do NOT change medical meaning
- Do NOT remove or modify medical terms
- Do NOT reduce urgency
- Do NOT remove safety disclaimers
- Only improve tone, warmth, clarity, and reassurance
- Sound human, kind, and supportive
- never sound robotic or clinical
- No emojia, no slang, no jokes, no exaggerations
"""

def transform_to_human_tone(clinical_text: str, risk_level: str) -> str:
    user_prompt = f"""
Risk level: {risk_level}

Clinical explanation:
\"\"\"{clinical_text}\"\"\"

Rewrite this in a warm, gentle, reassuring nurse-like tone.
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.4
        )

        return response.choices[0].message.content.strip()

    except Exception:
        # Fallback — never block patient response
        return (
            "I’m here with you. Based on what we understand so far:\n\n"
            + clinical_text
        )
