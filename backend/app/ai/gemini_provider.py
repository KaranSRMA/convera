from typing import TypeVar

from google import genai
from google.genai import types
from pydantic import BaseModel

from app.ai.provider import AIProvider
from app.config import GEMINI_API_KEY


T = TypeVar("T", bound=BaseModel)


class GeminiProvider(AIProvider):

    def __init__(self, model: str):
        self.model = model

        self.client = genai.Client(
            api_key=GEMINI_API_KEY
        )

    async def extract_messages(
        self,
        image: bytes,
        mime_type: str,
        response_schema: type[T],
        system_prompt: str,
    ) -> T:

        response = await self.client.aio.models.generate_content(
            model=self.model,

            contents=[
                {
                    "text": system_prompt
                },
                {
                    "inline_data": {
                        "mime_type": mime_type,
                        "data": image,
                    }
                },
            ],

            config=types.GenerateContentConfig(
                response_mime_type="application/json",

                response_json_schema=(
                    response_schema.model_json_schema()
                ),

                automatic_function_calling=(
                    types.AutomaticFunctionCallingConfig(
                        disable=True
                    )
                ),
            ),
        )

        return response_schema.model_validate_json(
            response.text
        )

    async def generate(
        self,
        messages: list[dict],
        response_schema: type[T],
        system_prompt: str,
    ) -> T:

        prompt_parts = [
            f"System instructions:\n{system_prompt}"
        ]

        for message in messages:
            prompt_parts.append(
                f"Sender: {message['sender']}\n"
                f"Message: {message['text']}"
            )

        prompt = "\n\n".join(prompt_parts)

        response = await self.client.aio.models.generate_content(
            model=self.model,
            contents=prompt,

            config=types.GenerateContentConfig(
                response_mime_type="application/json",

                response_json_schema=(
                    response_schema.model_json_schema()
                ),

                automatic_function_calling=(
                    types.AutomaticFunctionCallingConfig(
                        disable=True
                    )
                ),
            ),
        )

        return response_schema.model_validate_json(
            response.text
        )