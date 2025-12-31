import os
from app.services.health_insights import extract_clinical_signals
from app.services.openrouter_provider import OpenRouterProvider

def analyze_patient_context(context: dict) -> dict:
    clinical_signals = extract_clinical_signals(context)

    provider_name = os.getenv("AI_PROVIDER", "openrouter")

    if provider_name == "openrouter":
        ai = OpenRouterProvider()
    else:
        raise RuntimeError("Unsupported AI_PROVIDER")

    reasoning = ai.analyze(clinical_signals)

    return {
        "clinical_signals": clinical_signals,
        "explanation": reasoning.get("explanation", ""),
        "confidence": reasoning.get("confidence", 0.5)
    }
