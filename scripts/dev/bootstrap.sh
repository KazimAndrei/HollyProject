#!/usr/bin/env bash
set -euo pipefail
echo "[1/6] Setup env"; cp -n .env.example .env || true
echo "[2/6] Docker up"; docker compose up -d --build
echo "[3/6] DB migrations"; docker compose exec api alembic upgrade head
echo "[4/6] Seed minimal"; python scripts/etl/seed_minimal.py || true
echo "[5/6] Sample WEB verses"; echo '{"book":19,"chapter":23,"verse":1,"text":"The LORD is my shepherd; I shall not want."}' > web.jsonl; echo '{"book":19,"chapter":46,"verse":1,"text":"God is our refuge and strength, a very present help in trouble."}' >> web.jsonl; python scripts/etl/import_web_kjv.py --translation WEB --file web.jsonl
echo "[6/6] Health"; curl -s http://localhost:8000/healthz || true; echo; echo "Open http://localhost:8000/docs"
