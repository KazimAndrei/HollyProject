import os, json, uuid, psycopg
DSN = os.getenv('DATABASE_URL_PSYNC','postgresql://postgres:postgres@localhost:5432/holly')
with psycopg.connect(DSN) as conn, conn.cursor() as cur:
    cur.execute("INSERT INTO daily_verse_pool (translation,book,chapter,verse,weight) VALUES (%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING", ('WEB',19,23,1,1.0))
    cur.execute("INSERT INTO daily_verse_pool (translation,book,chapter,verse,weight) VALUES (%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING", ('WEB',19,46,1,1.0))
    plan_id = str(uuid.uuid4())
    cur.execute("INSERT INTO reading_plans (id, key, title, description, days, lang) VALUES (%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING", (plan_id,'john14','John in 14 days','Read the Gospel of John in two weeks',14,'en'))
    day_id = str(uuid.uuid4())
    refs = json.dumps({"John": [[1,1,18]]})
    cur.execute("INSERT INTO plan_days (id, plan_id, day_number, refs) VALUES (%s,%s,%s,%s) ON CONFLICT DO NOTHING", (day_id, plan_id, 1, refs))
print("Seeded")
