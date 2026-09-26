from app.ai.factory import create_ai_provider

from app.schemas.schema import (
    DetectedMessagesResponse,
    SuggestionResponse,
)


class AIService:

    def __init__(
        self,
        provider: str,
        model: str,
    ):
        self.provider = create_ai_provider(
            provider=provider,
            model=model,
        )

    async def extract_messages(
        self,
        image: bytes,
        mime_type: str,
    ) -> DetectedMessagesResponse:

        system_prompt = """
You are Convera, a professional client communication assistant.

Analyze the provided screenshot of a conversation.

Extract the visible conversation messages.

Rules:

- Extract only actual conversation messages.
- Do not extract buttons.
- Do not extract navigation text.
- Do not extract timestamps as messages.
- Do not extract menu items.
- Preserve the message text accurately.
- Identify the sender when possible.
- Use "client" when the message is from the other person.
- Use "me" when the message is from the user.
- Use "unknown" when the sender cannot be determined.
- Do not invent missing text.
- Do not add explanations.
- Return only the requested JSON structure.
"""

        return await self.provider.extract_messages(
            image=image,
            mime_type=mime_type,
            response_schema=DetectedMessagesResponse,
            system_prompt=system_prompt,
        )

    async def generate_reply(
        self,
        messages: list[dict],
    ) -> SuggestionResponse:

        system_prompt = """
You are Convera, a professional client communication assistant.

Analyze the conversation and suggest the user's next reply.

Generate 2 or 3 meaningfully different suggestions.

Each suggestion must contain:

- title: short strategy name for the UI
- text: exact reply the user could send

Rules:

- Never generate more than 3 suggestions.
- Do not generate fewer than 2 unless there is genuinely only one reasonable response.
- The title is only for the Convera UI.
- NEVER put the title inside the reply text.
- Do not use Markdown headings.
- Do not number the suggestions.
- Do not add explanations.
- Do not invent facts.
- Do not invent prices.
- Do not invent deadlines.
- Do not invent commitments.
- Do not assume information that is not present.
- Suggestions must be meaningfully different strategies.
- Replies should sound natural and professional.
- Return only the requested JSON structure.
"""

        return await self.provider.generate(
            messages=messages,
            response_schema=SuggestionResponse,
            system_prompt=system_prompt,
        )