from pydantic import BaseModel
from typing import List, Optional

class Citation(BaseModel):
    translation: str
    book: int
    chapter: int
    verse: int
    text: str | None = None

class ChatRequest(BaseModel):
    user_id: str
    message: str
    translation: str = "WEB"
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    citations: List[Citation]
    conversation_id: str
