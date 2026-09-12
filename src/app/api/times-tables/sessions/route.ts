import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth/guards";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { MIN_TABLE, MAX_TABLE, ROUND_LENGTHS, summarizeAnswers } from "@/lib/times-tables/types";

const answerSchema = z.object({
  table: z.number().int().min(MIN_TABLE).max(MAX_TABLE),
  multiplier: z.number().int().min(MIN_TABLE).max(MAX_TABLE),
  correct: z.boolean(),
  speedMs: z.number().int().min(0).max(120_000), // generous per-answer cap; a stalled tab shouldn't skew the average
});

const schema = z.object({
  tables: z.array(z.number().int().min(MIN_TABLE).max(MAX_TABLE)).min(1).max(MAX_TABLE),
  roundSeconds: z.number().int().refine((v) => (ROUND_LENGTHS as readonly number[]).includes(v), "Invalid round length."),
  endedEarly: z.boolean(),
  // Cap generous enough for a very fast student on the longest round (5 min
  // at, say, 1 answer/sec is 300) without leaving the endpoint open to an
  // arbitrarily large payload.
  answers: z.array(answerSchema).max(1000),
});

// One round per few seconds is realistic; this just stops a script from
// farming rows, matching the posture of POST /api/attempts.
const LIMIT = 20;
const WINDOW_MS = 60 * 1000;

/**
 * POST /api/times-tables/sessions
 *
 * Persists one completed (or early-finished) speed-drill round. Facts are
 * generated client-side (see lib/times-tables/types.ts's randomFact) rather
 * than served from the question bank, so unlike /api/attempts there's no
 * per-question round trip — the whole round's raw answer log is submitted
 * once at the end and the summary is recomputed here rather than trusted
 * from the client.
 */
export async function POST(req: Request) {
  const { studentProfile } = await requireStudent();

  const rateCheck = await checkRateLimit(`times-tables:student:${studentProfile.id}`, LIMIT, WINDOW_MS);
  if (!rateCheck.allowed) return rateLimitResponse(rateCheck.retryAfterSeconds!);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }
  const { tables, roundSeconds, endedEarly, answers } = parsed.data;

  // Every answered fact must belong to a table the student actually selected
  // for this round — reject rather than silently accept a mismatched log.
  const tableSet = new Set(tables);
  if (answers.some((a) => !tableSet.has(a.table))) {
    return NextResponse.json({ error: "Answer references a table outside this round's selection." }, { status: 400 });
  }

  const summary = summarizeAnswers(answers);

  const session = await db.timesTableSession.create({
    data: {
      studentId: studentProfile.id,
      tables: JSON.stringify([...tableSet].sort((a, b) => a - b)),
      roundSeconds,
      endedEarly,
      questionsAnswered: summary.questionsAnswered,
      correctCount: summary.correctCount,
      avgCorrectSpeedMs: summary.avgCorrectSpeedMs,
      tableStats: JSON.stringify(summary.tableStats),
    },
  });

  return NextResponse.json({
    id: session.id,
    questionsAnswered: summary.questionsAnswered,
    correctCount: summary.correctCount,
    avgCorrectSpeedMs: summary.avgCorrectSpeedMs,
    tableStats: summary.tableStats,
  });
}

/** GET /api/times-tables/sessions?limit=10 — the student's own recent rounds, most recent first. */
export async function GET(req: Request) {
  const { studentProfile } = await requireStudent();
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 10) || 10, 1), 50);

  const sessions = await db.timesTableSession.findMany({
    where: { studentId: studentProfile.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      tables: JSON.parse(s.tables) as number[],
      roundSeconds: s.roundSeconds,
      endedEarly: s.endedEarly,
      questionsAnswered: s.questionsAnswered,
      correctCount: s.correctCount,
      avgCorrectSpeedMs: s.avgCorrectSpeedMs,
      createdAt: s.createdAt,
    })),
  });
}
