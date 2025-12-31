import os
import requests

class OpenRouterProvider:
    def analyze(self, clinical_signals: dict) -> dict:
        """
        Uses OpenRouter to reason over clinical signals
        and return counselling-style guidance.
        """

        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise RuntimeError("OPENROUTER_API_KEY not set")

        prompt = f"""
You are an AI medical support assistant.
You are NOT a doctor.
You do NOT diagnose or prescribe.

Your role:
- Explain possible causes in simple language
- Reassure the patient
- Suggest when to seek medical help
- Maintain a calm counselling tone

Clinical signals:
{clinical_signals}

Respond in this JSON format ONLY:
{{
  "explanation": "...",
  "confidence": 0.0
}}
"""

        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "openai/gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "You are a clinical decision support assistant."},
                    {"role": "user", "content": prompt}
                ]
            },
            timeout=20
        )

        response.raise_for_status()
        data = response.json()

        content = data["choices"][0]["message"]["content"]

        # VERY IMPORTANT: we keep parsing safe
        try:
            import json
            parsed = json.loads(content)
        except Exception:
            parsed = {
                "explanation": content,
                "confidence": 0.5
            }

        return parsed
