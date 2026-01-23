import json
from openai import OpenAI, RateLimitError
from app.services.config import get_settings

settings = get_settings()


class GeminiProvider:
    def __init__(self) -> None:
        """
        Uses Gemini (Google AI Studio) via OpenAI-compatible client
        to answer general health questions and provide counselling-style guidance.
        """
        if not settings.GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY not set")

        self.client = OpenAI(
            api_key=settings.GEMINI_API_KEY,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        )
        self.model = settings.GEMINI_MODEL

    def analyze(self, clinical_signals: dict) -> dict:
        """
        Uses Gemini to reason over the user's health question
        and return counselling-style guidance.

        clinical_signals is expected to contain:
        - question / clinical_summary
        - optional normalized_symptoms, mood, etc.
        """
        question = clinical_signals.get("question") or clinical_signals.get(
            "clinical_summary"
        )

        prompt = f"""
You are Viora's medical information assistant.
You are NOT a doctor and you do NOT diagnose or prescribe.

Your role:
- Answer general health questions such as treatments and typical healing times
- Explain options in simple, non-technical language
- Reassure the user and encourage them to seek in-person care when needed
- Never give specific medication doses or prescriptions
- Emphasize that this is general information, not personal medical advice

User question and context:
{question}

If symptoms are mentioned, list common causes and red-flag symptoms that
should make the user seek urgent medical care.

Respond in this JSON format ONLY:
{{
  "explanation": "your response here",
  "confidence": 0.85
}}
"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You provide general, non-diagnostic health information only.",
                    },
                    {"role": "user", "content": prompt},
                ],
                max_tokens=settings.MAX_TOKENS_NURSE_REPLY,
                temperature=settings.TEMPERATURE_NURSE_REPLY,
                response_format={"type": "json_object"},
            )

            content = response.choices[0].message.content

            # VERY IMPORTANT: keep parsing safe
            try:
                parsed = json.loads(content)
            except Exception:
                parsed = {
                    "explanation": content,
                    "confidence": 0.5,
                }

            return parsed

        except RateLimitError as e:
            print(f"Gemini provider rate limit: {e}")
            # Quota exhausted → generic but safe explanation
            return {
                "explanation": (
                    "Right now the AI service is temporarily unavailable because it "
                    "has reached its usage limit. Here is general guidance only. "
                    "For questions about treatments or healing times, please also "
                    "consult a doctor or local clinician, especially if your "
                    "symptoms are severe, worsening, or worrying you."
                ),
                "confidence": 0.2,
            }

        except Exception as e:
            print(f"Gemini provider error: {type(e).__name__}: {e}")
            # Safe fallback to avoid crashing the app
            return {
                "explanation": (
                    "I’m having trouble reaching the AI service right now. "
                    "Please monitor your symptoms carefully and contact a clinician "
                    "or emergency services if they worsen."
                ),
                "confidence": 0.3,
            }
