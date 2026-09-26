from pydantic import BaseModel

class DetectedMessage(BaseModel):
    sender: str
    text: str


class DetectedMessagesResponse(BaseModel):
    messages: list[DetectedMessage]


class Suggestion(BaseModel):
    title: str
    text: str


class SuggestionResponse(BaseModel):
    suggestions: list[Suggestion]