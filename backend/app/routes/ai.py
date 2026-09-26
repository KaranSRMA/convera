from fastapi import (
    APIRouter,
    File,
    Form,
    HTTPException,
    UploadFile,
)

from app.ai.service import AIService
from app.schemas.schema import SuggestionResponse


router = APIRouter(prefix="/ai", tags=["AI"])


@router.post(
    "/suggest",
    response_model=SuggestionResponse,
)
async def suggest_reply(
    provider: str = Form(...),
    model: str = Form(...),
    image: UploadFile = File(...),
):

    if not image.content_type:
        raise HTTPException(
            status_code=400,
            detail="Image content type is missing",
        )

    if not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Uploaded file must be an image",
        )

    image_data = await image.read()

    if not image_data:
        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty",
        )

    ai_service = AIService(
        provider=provider,
        model=model,
    )

    detected = await ai_service.extract_messages(
        image=image_data,
        mime_type=image.content_type,
    )

    messages = [
        {
            "sender": message.sender,
            "text": message.text,
        }
        for message in detected.messages
    ]

    if not messages:
        raise HTTPException(
            status_code=400,
            detail="No messages detected in the image",
        )

    result = await ai_service.generate_reply(
        messages=messages,
    )

    return result