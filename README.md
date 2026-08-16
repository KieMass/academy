# KaeLex Academy

A learning platform built around your child's curriculum — maths, reading, grammar, spelling, science,
history, geography and computing practice aligned to the UK Key Stage 2 curriculum and Cayman Islands
Year 5 expectations, with PUMA-style maths, PIRA-style reading and GAPS-style grammar/spelling
assessment styles.

**Everything the app knows about "what to teach" lives in `content/curriculum/*.json`** — see
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for why that matters (short version: moving to Year 6 next
year is a content change, not a code change).

## Quick start

```bash
npm install
cp .env.example .env          # set DATABASE_URL (Postgres) + AUTH_SECRET
npm run db:migrate             # applies the schema to your Postgres database
npm run db:seed                # loads the curriculum map + question banks + demo accounts
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Demo accounts (created by the seed script):

| Role    | Login                  | Password     |
| ------- | ----------------------- | ------------ |
| Parent  | `parent@kaelex.demo`    | `Parent123!` |
| Student | username `alex`         | `student123` |

## Tech stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui (on Base UI) · Prisma · PostgreSQL
· TanStack Query · Zustand · `@react-pdf/renderer` · Vitest · Playwright · Docker

## Project structure

```
content/
  curriculum/         Curriculum map JSON — the source of truth for subjects/topics/objectives
  questions/           Question banks (maths, grammar, science, history, geography, computing)
  passages/            Reading passages with embedded comprehension questions
  spelling/             Weekly spelling lists
prisma/
  schema.prisma        Database schema (PostgreSQL)
  seed.ts              Populates the DB from content/ — never hand-edit Subject/Topic rows
  migrations/
src/
  app/
    (marketing)         /, /login, /register
    parent/             Parent dashboard, progress & reports, assign work, print resources, settings
    student/            Student dashboard, [subject]/[strand] practice, badges, progress, settings
    api/                 Route handlers — auth, questions, attempts, assignments, worksheets
  components/
    ui/                 shadcn/ui primitives
    question-engine/     Per-type renderers + the practice session orchestrator
    layout/               Dashboard shell (sidebar nav + topbar) shared by parent/student
    parent/, auth/, accessibility/, providers/
  lib/
    curriculum/          Loads + validates content/curriculum/*.json
    question-engine/     Question type contracts, grading, DB<->domain mapping, answer reveal
    content-generators/  Procedural question generators used by the seed script
    gamification/        XP + badge evaluation
    auth/                 Password hashing, session cookies, role guards
    pdf/                  Worksheet PDF document
  store/                 Zustand (accessibility preferences)
docs/
  ARCHITECTURE.md        Deeper technical detail
  ROADMAP.md              Milestones + honest gaps in this delivery
  DEPLOYMENT.md            Vercel + Docker instructions
```

## What's implemented

- **Auth** — separate parent (email) and student (username) login, session cookies, role-guarded routes.
- **Question engine** — 6 question types (multiple choice, fill-in-the-box, multi-step, drag-and-drop,
  matching, short answer), Bronze/Silver/Gold/Challenge difficulty, always graded server-side with
  immediate feedback and a worked explanation.
- **8 subjects** — maths (all 13 PUMA-style strands), reading (PIRA-style, fiction/non-fiction/poetry),
  grammar (all 13 GAPS-style topics), spelling (weekly lists × 4 activity modes), science, history,
  geography, computing — every topic sourced from the curriculum map.
- **Progress tracking** — per-topic mastery (Not Started → Developing → Secure → Mastered), accuracy,
  time spent, recommended "reattempt weak areas" practice.
- **Gamification** — XP (scaled by difficulty), levels, streaks, 8 rule-based badges.
- **Parent tools** — multi-child dashboard, accuracy/strengths/weaknesses reports, assign practice to a
  topic, generate printable PDF worksheets (10/20-question, Assessment Paper, Targeted Intervention Paper
  with a name/date header and a separate answer sheet).
- **Accessibility** — dyslexia-friendly font, adjustable text size, high-contrast mode, read-aloud
  (Web Speech API), all persisted client-side.
- **AI content generation framework** — staged (not yet model-backed): an `AiGeneratedContent` table
  holds generated drafts for parent review before anything is published; the procedural seed generators
  already emit content in the exact shape a model-backed generator would.

See [docs/ROADMAP.md](docs/ROADMAP.md) for what's next and an honest list of what's stubbed vs. full-depth
in this delivery (in particular: seed content volume is a strong representative sample, not yet the full
200/100/100/50 target counts from the spec — the pipeline is built to grow into that without code changes).

## Scripts

| Command              | What it does                                      |
| --------------------- | -------------------------------------------------- |
| `npm run dev`          | Start the dev server                                |
| `npm run build`        | Production build                                    |
| `npm run db:migrate`   | Create/apply a migration (dev)                       |
| `npm run db:deploy`    | Apply migrations (production)                         |
| `npm run db:seed`      | Seed curriculum + content + demo accounts             |
| `npm run db:reset`     | Drop, recreate, migrate and reseed the dev database    |
| `npm run db:studio`    | Open Prisma Studio (visual DB browser)                 |
| `npm test`             | Run Vitest unit tests                                  |
| `npm run test:e2e`     | Run Playwright e2e tests                               |

## Docker

```bash
cp .env.example .env   # set AUTH_SECRET
docker compose up --build
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full Docker and Vercel instructions.
