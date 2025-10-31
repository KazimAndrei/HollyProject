import argparse, json, os, psycopg
ap = argparse.ArgumentParser()
ap.add_argument('--translation', required=True)
ap.add_argument('--file', required=True)
ap.add_argument('--dsn', default=os.getenv('DATABASE_URL_PSYNC','postgresql://postgres:postgres@localhost:5432/holly'))
args = ap.parse_args()
with psycopg.connect(args.dsn) as conn, conn.cursor() as cur, open(args.file, 'r', encoding='utf-8') as f:
    for line in f:
        o = json.loads(line)
        cur.execute('INSERT INTO verses (translation,book,chapter,verse,text) VALUES (%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING',
                    (args.translation, o['book'], o['chapter'], o['verse'], o['text']))
    cur.execute("UPDATE verses SET text_tsv = to_tsvector('english', text);")
print("Done")
