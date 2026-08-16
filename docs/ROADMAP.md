# Development Roadmap

## Milestone 0 — Architecture & MVP (this delivery)

- [x] Curriculum-map-driven architecture (`content/curriculum/*.json` → Prisma `Subject`/`Topic`)
- [x] Database schema covering auth, question engine, mastery, assignments, worksheets, gamification, AI-content staging
- [x] Parent + student auth (session cookies, role guards)
- [x] Generic question engine — 6 question types, server-side grading, immediate feedback
- [x] Maths module: all 13 PUMA-style strands, Bronze/Silver/Gold/Challenge, ~108 questions
- [x] Reading module: 3 full passages (fiction/non-fiction/poetry) × PIRA-style question sets (28 questions)
- [x] Grammar module: all 13 GAPS-style topics (~29 questions)
- [x] Spelling module: 10 weekly lists across NC Y5/6 patterns; look-cover-write-check/word-sort/dictation/test modes generated per list
- [x] Science, History, Geography, Computing: full curriculum map + starter question banks
- [x] Student dashboard: today's tasks (assignments + recommended practice), badges, progress, subject browsing
- [x] Parent dashboard: per-child overview, progress & reports (accuracy by subject, strengths/weaknesses, attainment table), assign work, print resources, settings
- [x] Gamification: XP (difficulty-weighted), levels, streaks, 8 starter badges with rule-based evaluation
- [x] Printable worksheets: 10/20-question, Assessment Paper, Targeted Intervention Paper — PDF with name/date header + answer sheet
- [x] Accessibility: dyslexia-friendly font, font scale, high contrast, read-aloud (Web Speech API)
- [x] Docker + docker-compose (SQLite by default, Postgres swap documented)
- [x] Vitest unit tests (grading engine), Playwright e2e scaffold

## Known gaps in this delivery (honest accounting)

- **Seed content volume** is a representative sample, not full spec volume:
  ~108 maths questions (target 200), 28 reading (target 100), 29 grammar
  (target 100), 10 spelling lists (target 50 — though each list drives 4
  dynamically-generated activity modes, so effective activity count is
  higher than the raw list count suggests). The content pack format and
  seed pipeline are built for this exact expansion — see Milestone 1.
- Assignments don't yet mark themselves `IN_PROGRESS`/`COMPLETED` when a
  student practises the assigned topic, or link a practice session back to
  its `assignmentId` for attempt tracking.
- Drag-and-drop and matching question types use tap-to-assign rather than
  native HTML5 drag events, chosen deliberately for touch-device
  reliability — worth a design review if mouse-drag "feel" matters more
  than touch support for your household's devices.
- No password reset flow (a home-use MVP with two accounts doesn't need
  one yet, but a real deployment should add it before wider rollout).
- Reading/passage "add your own content" UI for parents isn't built —
  only the data model and seed pipeline support it today.

## Milestone 1 — Content depth

- Expand question banks to full target volumes using the existing
  `content/questions/*.json` + `lib/content-generators/*` pattern
  (procedural generators for computational strands, hand-authored for
  context-heavy ones).
- Add more reading passages (aim for 8–10) and a parent-facing "add a
  passage" authoring UI (`ReadingPassage`/`ContentQuestion` already support
  `source: PARENT_ADDED`).
- Science/History/Geography/Computing: add interactive activities (drag-drop
  labelling diagrams, timeline ordering) and short revision-notes pages per
  topic (`Topic.description` already carries a summary field to extend).

## Milestone 2 — AI content generation

- Wire `AiGeneratedContent` (already staged in the schema) to an LLM call
  that emits `DraftQuestion`-shaped JSON — same contract the procedural
  generators already produce, so no changes needed downstream.
- Build the parent review queue UI: list `PENDING_REVIEW` items, approve
  (copies into `ContentQuestion`/`ReadingPassage` with `source: AI_GENERATED`)
  or reject with notes.
- Personalised homework: generate a worksheet from a student's current
  weak-area list (the intervention-paper logic in `/api/worksheets` already
  computes this list — reuse it as the AI prompt context).

## Milestone 3 — Depth on progress & assignments

- Weekly/monthly/termly PDF report export for parents (reuse
  `@react-pdf/renderer`; the accuracy-by-subject/attainment-by-topic queries
  already exist in `parent/progress/page.tsx`).
- Assignment lifecycle: mark `IN_PROGRESS` on first attempt, `COMPLETED`
  when all linked topics reach a target attempt count, `OVERDUE` via a
  scheduled check.
- Email/notification hooks for assignment due dates.

## Milestone 4 — Testing & hardening

- Expand Vitest coverage to `lib/mastery.ts`, `lib/gamification/*`,
  `lib/question-engine/mapper.ts`.
- Playwright: full parent flow (register → add student → assign → student
  logs in and completes it → parent sees updated progress) and worksheet
  PDF generation.
- Rate limiting on `/api/attempts` and `/api/auth/login`.
- CI pipeline (lint + typecheck + unit + e2e) before merging content packs.

## Migrating to PostgreSQL

1. Provision a Postgres instance (Vercel Postgres, Neon, Supabase, or the
   `db` service commented out in `docker-compose.yml`).
2. In `prisma/schema.prisma`, change `provider = "sqlite"` to
   `provider = "postgresql"`.
3. Set `DATABASE_URL` to the Postgres connection string.
4. Run `npx prisma migrate deploy` (a fresh `migrations/` history against
   Postgres — SQLite and Postgres migrations aren't binary-compatible, so
   regenerate with `prisma migrate dev` once against the new provider in a
   scratch environment, commit the new migration, then deploy).
5. Re-run `npm run db:seed`.

No application code changes are required — every query goes through Prisma.
