SHELL := /bin/bash
.PHONY: setup up migrate health etl-sample seed logs down reset doctor
setup:
	cp -n .env.example .env || true
	@echo "Env ready (.env). Fill OPENAI_API_KEY later."
up:
	docker compose up -d --build
migrate:
	docker compose exec api alembic -c alembic/alembic.ini upgrade head
health:
	@echo "Health check:"
	curl -s http://localhost:8000/healthz || true
	@echo
	@echo "Swagger: http://localhost:8000/docs"
etl-sample:
	@echo '{"book":19,"chapter":23,"verse":1,"text":"The LORD is my shepherd; I shall not want."}' > web.jsonl
	@echo '{"book":19,"chapter":46,"verse":1,"text":"God is our refuge and strength, a very present help in trouble."}' >> web.jsonl
	python scripts/etl/import_web_kjv.py --translation WEB --file web.jsonl
seed:
	python scripts/etl/seed_minimal.py
logs:
	docker compose logs -f api
down:
	docker compose down
reset: down
	docker volume prune -f || true

doctor:
	./scripts/dev/doctor.sh
