import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import chat, verses, plans, iap

app = FastAPI(title="HollyProject API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/healthz")
async def healthz():
    return {"ok": True}


@app.get("/v1/healthz")
async def healthz_v1():
    return {"ok": True, "llm": bool(os.getenv("OPENAI_API_KEY"))}

app.include_router(chat.router, prefix="/v1", tags=["chat"])
app.include_router(verses.router, prefix="/v1", tags=["verses"])
app.include_router(plans.router, prefix="/v1", tags=["plans"])
app.include_router(iap.router, prefix="/v1", tags=["iap"])
