import uuid
from datetime import date, datetime, timezone

from fastapi import APIRouter, HTTPException

from ..deps import db_session
from ..models import Quota, Subscription
from ..schemas import ChatRequest, ChatResponse, Citation
from ..services import retrieval, llm

router = APIRouter()
FREE_LIMIT = 4


def _is_active_subscription(subscription: Subscription | None) -> bool:
    if subscription is None or subscription.status != "active":
        return False

    expires_at = subscription.expires_at
    if expires_at is None:
        return True

    if getattr(expires_at, "tzinfo", None) is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    return expires_at > datetime.now(timezone.utc)


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    today = date.today()
    subscription_active = False

    with db_session() as session:
        subscription = session.get(Subscription, req.user_id)
        subscription_active = _is_active_subscription(subscription)

        if not subscription_active:
            quota = session.get(Quota, (req.user_id, today))
            messages_used = quota.messages_used if quota else 0
            if messages_used >= FREE_LIMIT:
                raise HTTPException(status_code=402, detail={"paywall": True, "limit": FREE_LIMIT})

    passages = await retrieval.retrieve(req.message, translation=req.translation)
    answer_text, citations = await llm.answer(req.message, passages)
    conv_id = req.conversation_id or str(uuid.uuid4())

    if not subscription_active:
        with db_session() as session:
            quota = session.get(Quota, (req.user_id, today))
            if quota is None:
                quota = Quota(user_id=req.user_id, date=today, messages_used=1)
                session.add(quota)
            else:
                quota.messages_used += 1
                quota.updated_at = datetime.now(timezone.utc)
            session.commit()

    return ChatResponse(
        answer=answer_text,
        citations=[Citation(**c) for c in citations],
        conversation_id=conv_id,
    )
