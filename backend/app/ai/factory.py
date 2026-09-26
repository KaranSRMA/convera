from app.ai.provider import AIProvider
from app.ai.gemini_provider import GeminiProvider


def create_ai_provider(
    provider: str,
    model: str,
) -> AIProvider:

    provider = provider.lower()

    if provider == "gemini":
        return GeminiProvider(
            model=model
        )

    if provider == "ollama":
        # Add OllamaProvider later
        raise ValueError(
            "Ollama provider is not implemented yet"
        )

    raise ValueError(
        f"Unsupported AI provider: {provider}"
    )