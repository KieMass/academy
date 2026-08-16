#!/bin/sh
set -e

echo "Applying database migrations..."
npx prisma migrate deploy

# The seed script inserts questions/passages with `create` (not `upsert`), so
# only run it once — re-running on every container restart would duplicate
# content. We treat "zero subjects" as "never seeded".
SUBJECT_COUNT=$(node -e "
  const { PrismaClient } = require('@prisma/client');
  const db = new PrismaClient();
  db.subject.count().then((n) => { console.log(n); process.exit(0); }).catch(() => { console.log(0); process.exit(0); });
")

if [ "$SUBJECT_COUNT" = "0" ]; then
  echo "No content found — running initial seed..."
  npx tsx prisma/seed.ts
else
  echo "Database already seeded ($SUBJECT_COUNT subjects found) — skipping seed."
fi

exec "$@"
