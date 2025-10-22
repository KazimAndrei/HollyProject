"""Subscription verification routes."""
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field
from typing import Optional

router = APIRouter(prefix="/api", tags=["subscription"])

# Global appstore service (will be set by main app)
appstore_service = None


def set_appstore_service(service):
    """Set global appstore service."""
    global appstore_service
    appstore_service = service


class SubscriptionVerifyRequest(BaseModel):
    """Subscription verification request."""
    platform: str = Field(..., pattern="^ios$", description="Platform (only ios supported)")
    originalTransactionId: Optional[str] = Field(None, description="Original transaction ID (preferred)")
    transactionId: Optional[str] = Field(None, description="Transaction ID (fallback)")


class SubscriptionVerifyResponse(BaseModel):
    """Subscription verification response."""
    status: str = Field(..., description="active | trial | expired")
    originalTransactionId: str
    trialEndsAt: Optional[str] = Field(None, description="ISO timestamp when trial ends")
    needsServerValidation: bool = Field(False, description="Whether server validation completed")
    error: Optional[str] = Field(None, description="Error message if verification failed")


@router.post("/subscription/verify", response_model=SubscriptionVerifyResponse)
async def verify_subscription(request: SubscriptionVerifyRequest = Body(...)):
    """Verify iOS subscription with App Store Server API.
    
    Args:
        request: Verification request with transaction IDs
        
    Returns:
        Subscription status and metadata
    """
    if not appstore_service:
        raise HTTPException(status_code=500, detail="AppStore service not initialized")

    # Validate that at least one transaction ID is provided
    if not request.originalTransactionId and not request.transactionId:
        raise HTTPException(
            status_code=400,
            detail="Either originalTransactionId or transactionId must be provided"
        )

    try:
        result = await appstore_service.verify_transaction(
            original_transaction_id=request.originalTransactionId,
            transaction_id=request.transactionId
        )

        # Check if verification failed with hint
        if "error" in result and result["status"] == "expired":
            # Return 400 for client errors with hint
            if "send originalTransactionId" in result.get("error", ""):
                raise HTTPException(status_code=400, detail=result["error"])

        return SubscriptionVerifyResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [SubscriptionRoute] Verification error: {e}")
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")


@router.get("/subscription/status", response_model=SubscriptionVerifyResponse)
async def get_subscription_status(
    originalTransactionId: Optional[str] = None,
    transactionId: Optional[str] = None
):
    """Get subscription status (stateless - calls verify_transaction).
    
    Args:
        originalTransactionId: Original transaction ID (preferred)
        transactionId: Transaction ID (fallback)
        
    Returns:
        Subscription status and metadata
    """
    if not appstore_service:
        raise HTTPException(status_code=500, detail="AppStore service not initialized")

    # Validate that at least one transaction ID is provided
    if not originalTransactionId and not transactionId:
        raise HTTPException(
            status_code=400,
            detail="Either originalTransactionId or transactionId must be provided"
        )

    try:
        result = await appstore_service.verify_transaction(
            original_transaction_id=originalTransactionId,
            transaction_id=transactionId
        )

        # Check if verification failed with hint
        if "error" in result and result["status"] == "expired":
            # Return 400 for client errors with hint
            if "send originalTransactionId" in result.get("error", ""):
                raise HTTPException(status_code=400, detail=result["error"])

        return SubscriptionVerifyResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [SubscriptionRoute] Status check error: {e}")
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")
