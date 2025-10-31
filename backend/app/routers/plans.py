from fastapi import APIRouter
router = APIRouter()

@router.get("/plan/john14")
async def get_plan():
    return {"days": [{"day": 1, "refs": [["John", 1, 1, 18]]}]}

@router.post("/plan/progress")
async def mark_progress(user_id: str, plan_id: str, day_number: int):
    return {"ok": True}
