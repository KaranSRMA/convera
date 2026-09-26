from abc import ABC, abstractmethod
from typing import TypeVar

from pydantic import BaseModel


T = TypeVar("T", bound=BaseModel)


class AIProvider(ABC):

    @abstractmethod
    async def extract_messages(
        self,
        image: bytes,
        mime_type: str,
        response_schema: type[T],
        system_prompt: str,
    ) -> T:
        pass

    @abstractmethod
    async def generate(
        self,
        messages: list[dict],
        response_schema: type[T],
        system_prompt: str,
    ) -> T:
        pass