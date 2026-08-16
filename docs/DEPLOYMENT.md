# Deployment

## Vercel (recommended for a family/small-scale deployment)

Vercel's filesystem is read-only and ephemeral at request time, which rules
out the default SQLite setup for production — use a hosted Postgres.

1. Create a Postgres database (Vercel Postgres, Neon, or Supabase all work).
2. In `prisma/schema.prisma`, set `provider = "postgresql"`.
3. In the Vercel project settings, add environment variables:
   - `DATABASE_URL` — your Postgres connection string
   - `AUTH_SECRET` — a long random string (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
4. Add a build step to run migrations before the app builds — either:
   - Set the Vercel **Build Command** to `npx prisma migrate deploy && next build`, or
   - Run `npx prisma migrate deploy` manually against the production
     `DATABASE_URL` before the first deploy.
5. Seed once after the first successful migration:
   `DATABASE_URL=<prod-url> npm run db:seed` (run locally, pointed at prod —
   there's no seed step in the Vercel build since it should only run once).
6. Deploy: `vercel --prod` or connect the GitHub repo in the Vercel dashboard.

`next.config.ts` already sets `output: "standalone"`, which Vercel doesn't
need (it has its own build pipeline) — it's there for the Docker path below
and is harmless on Vercel.

## Docker (self-hosted / home server)

```bash
cp .env.example .env   # set AUTH_SECRET
docker compose up --build
```

This builds the multi-stage `Dockerfile`, runs `prisma migrate deploy` and
(on first boot only) `npm run db:seed` via `docker-entrypoint.sh`, and
serves the app on `http://localhost:3000`. SQLite data persists in the
`app-data` named volume.

To use Postgres instead, uncomment the `db` service in `docker-compose.yml`,
set `DATABASE_URL` to point at it, and flip `provider` in
`prisma/schema.prisma` to `"postgresql"`.

## Local development

See the Quick Start in the main [README](../README.md).
