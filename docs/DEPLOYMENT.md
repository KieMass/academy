# Deployment

The schema (`prisma/schema.prisma`) targets Postgres — shared by local dev,
Docker, and production. There is no SQLite path any more (Vercel's
filesystem is read-only and ephemeral at request time, which ruled it out
for production, so the whole app standardised on Postgres instead).

## Vercel (recommended for a family/small-scale deployment)

1. Create a Postgres database (Vercel Postgres, Neon, or Supabase all work).
2. In the Vercel project settings, add environment variables:
   - `DATABASE_URL` — your Postgres connection string
   - `AUTH_SECRET` — a long random string (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
3. Add a build step to run migrations before the app builds — either:
   - Set the Vercel **Build Command** to `npx prisma migrate deploy && next build`, or
   - Run `npx prisma migrate deploy` manually against the production
     `DATABASE_URL` before the first deploy.
4. Seed once after the first successful migration:
   `DATABASE_URL=<prod-url> npm run db:seed` (run locally, pointed at prod —
   there's no seed step in the Vercel build since it should only run once).
5. Deploy: `vercel --prod` or connect the GitHub repo in the Vercel dashboard.

`next.config.ts` sets `output: "standalone"` only when `process.env.VERCEL`
is unset — it's there for the Docker path below. Vercel has its own build
pipeline and this setting actively breaks it there (`ENOENT` on
`.next/next-server.js.nft.json`), so it's conditionally disabled on Vercel
rather than merely redundant.

## Docker (self-hosted / home server)

```bash
cp .env.example .env   # set AUTH_SECRET
docker compose up --build
```

`docker-compose.yml` starts the app alongside a `db` (Postgres) service and
points `DATABASE_URL` at it by default — no extra setup needed. On boot,
`docker-entrypoint.sh` runs `prisma migrate deploy` and (on first boot only)
`npm run db:seed`, then serves the app on `http://localhost:3000`. Postgres
data persists in the `pg-data` named volume.

To point at an external Postgres instead (e.g. the same Neon database used
elsewhere), remove the `db` service and set `DATABASE_URL` on `app` to that
connection string.

## Local development

See the Quick Start in the main [README](../README.md).
