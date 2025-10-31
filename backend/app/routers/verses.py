from fastapi import APIRouter, Query, HTTPException
from sqlalchemy import text as sql_text
from starlette.concurrency import run_in_threadpool
from ..deps import db_session

router = APIRouter()

@router.get("/verses/search")
async def search(
    q: str = Query(..., min_length=2),
    translation: str = Query("WEB"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    query_text = q.strip()
    if len(query_text) < 2:
        raise HTTPException(status_code=400, detail="Query must be at least 2 characters.")

    statement = sql_text(
        """
        SELECT
            book,
            chapter,
            verse,
            text,
            ts_headline(
                'english',
                text,
                plainto_tsquery(:ts_query),
                'ShortWords=2,MaxFragments=1,MaxWords=25,MinWords=10,FragmentDelimiter=…'
            ) AS highlight
        FROM verses
        WHERE translation = :translation
          AND text_tsv @@ plainto_tsquery(:ts_query)
        ORDER BY ts_rank(text_tsv, plainto_tsquery(:ts_query)) DESC
        LIMIT :limit OFFSET :offset
        """
    )

    params = {
        "ts_query": query_text,
        "translation": translation,
        "limit": limit,
        "offset": offset,
    }

    def _run_search():
        with db_session() as session:
            return session.execute(statement, params).mappings().all()

    rows = await run_in_threadpool(_run_search)

    results = [
        {
            "book": row["book"],
            "chapter": row["chapter"],
            "verse": row["verse"],
            "text": row["text"],
            "highlight": row["highlight"] or row["text"],
        }
        for row in rows
    ]

    return {"results": results}

@router.get("/daily-verse", response_model=dict)
async def daily_verse(translation: str = "WEB") -> dict:
    # TODO: select from pool with recency penalty
    return {"verse": {"book": 19, "chapter": 23, "verse": 1, "text": "The Lord is my shepherd."}}
