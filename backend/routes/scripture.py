"""Scripture routes."""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional

router = APIRouter(prefix="/api", tags=["scripture"])

# Global scripture service (will be set by main app)
scripture_service = None


def set_scripture_service(service):
    """Set global scripture service."""
    global scripture_service
    scripture_service = service


@router.get("/scripture/{ref}")
async def get_scripture(ref: str, locale: str = Query("en", regex="^(en|ru)$")):
    """Get scripture by reference.
    
    Args:
        ref: Bible reference (e.g., "John 3:16" or "Иоанна 3:16")
        locale: Language locale (en/ru)
        
    Returns:
        Verse data with reference, text, and metadata
    """
    if not scripture_service:
        raise HTTPException(status_code=500, detail="Scripture service not initialized")
    
    verse = scripture_service.get_verse_by_ref(ref, locale)
    
    if not verse:
        raise HTTPException(status_code=404, detail=f"Verse '{ref}' not found")
    
    return {
        "success": True,
        "data": verse
    }


@router.get("/daily-verse")
async def get_daily_verse(locale: str = Query("en", regex="^(en|ru)$")):
    """Get daily verse.
    
    Args:
        locale: Language locale (en/ru)
        
    Returns:
        Daily verse data
    """
    if not scripture_service:
        raise HTTPException(status_code=500, detail="Scripture service not initialized")
    
    verse = scripture_service.get_daily_verse(locale)
    
    if not verse:
        raise HTTPException(status_code=404, detail="Daily verse not found")
    
    return {
        "success": True,
        "data": verse
    }
