from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from ..deps import db_session, redis_client
from ..models import Subscription, User

router = APIRouter()

class VerifyReq(BaseModel):
    user_id: str
    jws: str

@router.post("/iap/verify")
async def verify(req: VerifyReq):
    if not req.jws or len(req.jws.split('.')) != 3:
        raise HTTPException(400, "Invalid JWS format")

    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    with db_session() as session:
        user = session.get(User, req.user_id)
        if user is None:
            session.add(User(id=req.user_id))

        subscription = session.get(Subscription, req.user_id)
        if subscription is None:
            subscription = Subscription(user_id=req.user_id)
            session.add(subscription)

        subscription.status = "active"
        subscription.product_id = "weekly.premium"
        subscription.expires_at = expires_at
        subscription.updated_at = datetime.now(timezone.utc)

        session.commit()

    ttl_seconds = int(timedelta(days=7).total_seconds())
    redis_client.set(f"entitlement:{req.user_id}", "active", ex=ttl_seconds)
    return {"status": "active", "expires_at": expires_at.isoformat()}


@router.get("/iap/entitlement")
async def entitlement(user_id: str = Query(...)):
    with db_session() as session:
        subscription = session.get(Subscription, user_id)

    if subscription is None:
        return {"status": "none"}

    now = datetime.now(timezone.utc)
    expires_at = subscription.expires_at
    is_active = (
        subscription.status == "active"
        and (expires_at is None or expires_at > now)
    )

    status = "active" if is_active else "expired"
    payload = {"status": status}
    if expires_at is not None:
        payload["expires_at"] = expires_at.isoformat()
    return payload
