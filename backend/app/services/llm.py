import logging
import os
from typing import List, Dict, Any, Tuple

from fastapi import HTTPException
from openai import OpenAI
from openai import APIStatusError, APITimeoutError, AuthenticationError, RateLimitError

SYSTEM = ("You are a respectful Bible assistant. Always cite at least two verses in 'Book Chapter:Verse' format. "
          "Keep quotes concise. English only. Do not invent references.")

logger = logging.getLogger(__name__)


def _format_passage(passage: Dict[str, Any]) -> str:
    return f"{passage['translation']} {passage['book']}:{passage['chapter']}:{passage['verse']}"


def _offline_reply(passages: List[Dict[str, Any]]) -> Tuple[str, List[Dict[str, Any]]]:
    if not passages:
        return "I am unavailable right now. Please try again later.", []

    refs = [
        f"{_format_passage(p)} — {p['text']}" if p.get("text") else _format_passage(p)
        for p in passages[:2]
    ]
    intro = "I cannot access the language model right now."
    ans = f"{intro} Consider these passages:\n" + "\n".join(refs)
    return ans, passages[:2]


async def answer(q: str, passages: List[Dict[str, Any]]) -> Tuple[str, List[Dict[str, Any]]]:
    ctx_passages = passages[:6]
    ctx_lines = [f"- {_format_passage(p)} — {p['text']}" for p in ctx_passages if p.get("text")]
    prompt = (
        "Answer the user's question using the verses below. Cite at least two verses.\n\n"
        + "\n".join(ctx_lines)
        + f"\n\nQuestion: {q}"
    )

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return _offline_reply(ctx_passages)

    client = OpenAI(api_key=api_key)
    model = os.getenv("LLM_MODEL", "gpt-4o-mini")
    try:
        resp = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
        )
    except APITimeoutError:
        logger.error("LLM_TIMEOUT")
        raise HTTPException(status_code=504, detail="llm_timeout")
    except (AuthenticationError, RateLimitError):
        logger.error("LLM_AUTH_RATE")
        raise HTTPException(status_code=502, detail="llm_unavailable")
    except APIStatusError as exc:
        if exc.status_code in (401, 429):
            logger.error("LLM_STATUS_%s", exc.status_code)
            raise HTTPException(status_code=502, detail="llm_unavailable")
        logger.error("LLM_STATUS_%s", exc.status_code)
        raise HTTPException(status_code=502, detail="llm_error")
    except Exception:
        logger.error("LLM_GENERAL")
        raise HTTPException(status_code=502, detail="llm_error")

    choices = getattr(resp, "choices", [])
    text = choices[0].message.content if choices else ""
    return text, ctx_passages[:2]
