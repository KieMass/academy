# Technical Architecture

## Core principle: the curriculum map is the source of truth

Every subject, topic and piece of content in Red Bay Academy is derived from
JSON files in [`content/curriculum/`](../content/curriculum) — **never**
hard-coded to "Year 5". Each file (`maths.json`, `reading.json`, ...)
describes a subject as a list of **strands** (e.g. "Fractions"), and each
strand lists the **year groups** it covers with curriculum objectives tagged
by code, difficulty band and question type:

```
content/curriculum/maths.json
  └─ strand: "fractions"
       └─ years: [
            { yearGroup: "Y5", objectives: [ { code: "MA5-FRAC-1", ... } ] }
          ]
```

`src/lib/curriculum/loader.ts` reads and validates these files (Zod schema)
and exposes:

- `loadCurriculumMaps()` — every subject map
- `resolveTopics({ subjectSlug?, yearGroup? })` — flattens (strand × year
  group) pairs into the "topics" the UI renders
- `getSubjectMap(slug)`, `listSubjects()`, `getObjectiveByCode(code)`

`prisma/seed.ts` reads these same files and **generates** `Subject` and
`Topic` database rows from them — those tables are never hand-populated.
Question content packs (`content/questions/*.json`,
`content/passages/reading.json`, `content/spelling/lists.json`) tag every
question with `subjectSlug` + `strandSlug` + `yearGroup`, which the seed
script resolves to a `Topic` id.

### Adding Year 6 (or Year 3/4 catch-up) content

1. Add a new `{ yearGroup: "Y6", objectives: [...] }` entry to the relevant
   strand(s) in `content/curriculum/*.json`.
2. Add a matching question/passage content pack tagged `"yearGroup": "Y6"`.
3. Run `npm run db:seed` again.

No application code, API route, or component changes — the student/topic
pages, the question engine, the worksheet generator and the progress
dashboards all resolve topics dynamically from the database via
`student.yearGroup`. `YearGroup` in `prisma/schema.prisma` is an enum
covering the whole of Key Stage 2 (`Y3`–`Y6`) precisely so this doesn't
require a schema migration when the student progresses a year — only their
`StudentProfile.yearGroup` field changes.

## Layered architecture

```
content/                    Curriculum map + question/passage/spelling JSON (data layer)
prisma/                     schema.prisma, migrations, seed.ts
src/lib/curriculum/         Loads + validates content/curriculum/*.json
src/lib/question-engine/    Question type contracts, grading, answer-reveal, DB<->domain mapping
src/lib/content-generators/ Procedural question generators (seed-time; same shape an AI generator would produce)
src/lib/gamification/       XP + badge-criteria evaluation
src/lib/auth/               Password hashing, session cookies, role guards
src/lib/pdf/                @react-pdf/renderer worksheet document
src/app/api/                Route handlers (the only place grading/answers touch the network)
src/app/(parent|student)/   App Router pages — server components fetch via Prisma directly
src/components/             UI: shadcn/ui primitives, question-engine renderers, dashboards
```

## Question engine

`AnyQuestion` (in `lib/question-engine/types.ts`) is a discriminated union
over six types: `multiple_choice`, `fill_in_box`, `multi_step`, `drag_drop`,
`matching`, `short_answer`. Each `ContentQuestion` DB row stores
`prompt` / `options` / `answer` as JSON strings; `mapper.ts` is the single
place that knows the storage convention in both directions
(`fromContentQuestion` / `toStorageFields`).

**Grading is always server-side.** `/api/questions` strips every
answer-bearing field (including `explanation`, which routinely spells out
the working) via `toPublicQuestion` before sending a question to the
browser. `/api/attempts` loads the full row, grades with the pure function
`gradeResponse()`, persists the attempt, updates topic mastery, awards XP,
and evaluates badge criteria — then returns the explanation and a
human-readable `correctAnswer` (`revealAnswer()`) for immediate feedback.
This is also why the printed worksheet's answer sheet page (`worksheet-document.tsx`)
reuses `revealAnswer()` rather than duplicating answer-formatting logic.

Extending with a new question type touches exactly four files:
`lib/curriculum/types.ts` (add to `QUESTION_TYPES`), `lib/question-engine/types.ts`
(add the variant), `lib/question-engine/grade.ts` (add a grader), and
`components/question-engine/renderers.tsx` (add a renderer).

## Auth

Custom cookie-session auth (not NextAuth) — deliberately simple for two
account types with very different login flows (parent: email, student:
short username): `bcryptjs` for password hashing, an httpOnly `Session`
cookie referencing a DB-backed `Session` row (30-day expiry). Every
parent/student page is guarded via `requireParent()` / `requireStudent()`
server-side (`lib/auth/guards.ts`) — there is no client-side-only protection.

## Mastery, XP and badges

- `lib/mastery.ts` — recomputes `TopicMastery.masteryLevel`
  (`NOT_STARTED → DEVELOPING → SECURE → MASTERED`) from accuracy + volume
  after every attempt, and maintains the daily streak counter.
- `lib/gamification/xp.ts` — XP-per-correct-answer scales with difficulty
  band, so "reattempting weak areas" at a harder band is worth more than
  farming Bronze questions.
- `lib/gamification/badges.ts` — evaluates every unearned badge's
  JSON-encoded criteria (`questions_answered`, `correct_streak`,
  `difficulty_completed`, `streak_days`, `topics_mastered`,
  `passages_completed`, `spelling_test_perfect`) after each attempt.
- `lib/student-stats.ts` — `getStudentOverview()` is the single place that
  turns raw `TopicMastery` rows into the "recommended practice" list
  (weak areas first, then unattempted topics) used on both the student
  dashboard and the parent's intervention-worksheet generator.

## AI content generation framework (staged, not yet wired to a model)

`AiGeneratedContent` (Prisma model) is a staging table: `type`
(`QUESTION` | `PASSAGE` | `REVISION_TASK` | `HOMEWORK_SET`), `payload`
(JSON matching the same `ContentQuestion`/`ReadingPassage` draft shape used
by the procedural generators), and `status`
(`PENDING_REVIEW` → `APPROVED` | `REJECTED`) with a `reviewedByParentId` +
`reviewNotes`. Nothing is ever inserted into `ContentQuestion` directly from
generated content — it lands here first for a parent to approve, matching
the brief's "store generated content safely before publication."

The procedural generators in `lib/content-generators/` already produce
output in exactly the shape a future LLM-backed generator would (`DraftQuestion`,
keyed by curriculum coordinates, not a DB id) — swapping the deterministic
`generateAllMathsQuestions()` for a model call that emits the same shape
is the intended integration point; see `docs/ROADMAP.md`.

## Printable worksheets

`/api/worksheets` (POST, parent-only) resolves a set of `Topic`s (single
strand for 10/20-question sheets, every topic in a subject for an
Assessment Paper, a student's current weak topics for a Targeted
Intervention Paper), pulls published questions, freezes the exact
`questionIds` onto a `Worksheet` row (so a re-print is reproducible), and
renders a two-page PDF (`lib/pdf/worksheet-document.tsx`, `@react-pdf/renderer`):
page 1 is the worksheet with a name/date/subject/topic header, page 2 is the
answer sheet.

## Database

SQLite locally (`prisma/schema.prisma`, `provider = "sqlite"`), designed to
be portable to PostgreSQL for production: no SQLite-specific types are used,
JSON is stored as `String` (parsed in the app layer) specifically so the
same schema works unchanged on both engines. To migrate: change `provider`
to `"postgresql"`, point `DATABASE_URL` at a Postgres instance, and re-run
`prisma migrate deploy`. See `docs/DEPLOYMENT.md`.

Full schema: [`prisma/schema.prisma`](../prisma/schema.prisma).
