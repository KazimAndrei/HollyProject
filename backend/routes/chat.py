"""Chat routes for RAG-based Bible Q&A."""
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field
from typing import Optional

router = APIRouter(prefix="/api", tags=["chat"])

# Global RAG service (will be set by main app)
rag_service = None


def set_rag_service(service):
    """Set global RAG service."""
    global rag_service
    rag_service = service


class ChatRequest(BaseModel):
    """Chat request model."""
    text: str = Field(..., min_length=1, max_length=500, description="User question")
    locale: str = Field("en", pattern="^(en|ru)$", description="Language locale")


class ChatResponse(BaseModel):
    """Chat response model."""
    success: bool
    answer: str
    citations: list
    has_reliable_sources: bool


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest = Body(...)):
    """Process chat question with RAG pipeline.
    
    Args:
        request: Chat request with text and locale
        
    Returns:
        Answer with citations or polite refusal
    """
    if not rag_service:
        raise HTTPException(status_code=500, detail="RAG service not initialized")
    
    try:
        result = rag_service.process_question(
            question=request.text,
            locale=request.locale
        )
        
        return ChatResponse(
            success=True,
            answer=result["answer"],
            citations=result["citations"],
            has_reliable_sources=result["has_reliable_sources"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")
