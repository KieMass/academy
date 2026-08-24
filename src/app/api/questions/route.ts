import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { fromContentQuestion } from "@/lib/question-engine/mapper";
import { toPublicQuestion } from "@/lib/question-engine/types";
import { pickRandomQuestionIds } from "@/lib/question-engine/select";

/** Recently-attempted question ids are only worth excluding up to a point —
 * cap the lookup so a heavy-practice topic doesn't turn this into an
 * unbounded query. */
const RECENT_ATTEMPTS_LOOKBACK = 100;

/**
 * GET /api/questions?subject=maths&strand=fractions&yearGroup=Y5&difficulty=silver&limit=10
 *
 * Returns questions with every answer-bearing field stripped (see
 * toPublicQuestion) — grading always happens server-side in /api/attempts.
 *
 * Selection is randomised per request, biased toward questions the calling
 * student hasn't attempted recently on this exact topic+difficulty — a
 * retry (e.g. a failed Bronze attempt tried again) pulls in a different set
 * from the pool where possible, rather than the identical questions every
 * time. See lib/question-engine/select.ts.
 *
 * A topic's content isn't necessarily spread evenly across all four
 * difficulty bands (e.g. a strand might only have Silver questions
 * authored so far) — rather than hand a student a dead "no questions"
 * screen for a band that's simply thin, if the exact band is empty we fall
 * back to the topic's whole published pool and say so via
 * `usedFallbackDifficulty`, so the UI can be honest about it instead of
 * silently mislabelling the questions shown.
 */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const subjectSlug = searchParams.get("subject");
  const strandSlug = searchParams.get("strand");
  const yearGroup = searchParams.get("yearGroup");
  const difficulty = searchParams.get("difficulty");
  const limit = Math.min(Number(searchParams.get("limit") ?? 10), 50);

  if (!subjectSlug || !strandSlug || !yearGroup) {
    return NextResponse.json({ error: "subject, strand and yearGroup are required." }, { status: 400 });
  }

  const topic = await db.topic.findFirst({
    where: { subject: { slug: subjectSlug }, strandSlug, yearGroup: yearGroup as never },
  });
  if (!topic) return NextResponse.json({ error: "Topic not found." }, { status: 404 });

  const basePoolWhere = { topicId: topic.id, status: "PUBLISHED" as const };
  const difficultyPoolWhere = difficulty ? { ...basePoolWhere, difficulty: difficulty.toUpperCase() as never } : basePoolWhere;

  let pool = await db.contentQuestion.findMany({ where: difficultyPoolWhere, select: { id: true } });
  let usedFallbackDifficulty = false;

  // The exact band is thin/empty but the topic has other content — fall
  // back to the whole topic rather than a dead end.
  if (pool.length === 0 && difficulty) {
    pool = await db.contentQuestion.findMany({ where: basePoolWhere, select: { id: true } });
    usedFallbackDifficulty = pool.length > 0;
  }

  if (pool.length === 0) {
    return NextResponse.json({ topic: { id: topic.id, strandName: topic.strandName }, questions: [], passages: {}, usedFallbackDifficulty: false });
  }
  const poolIds = pool.map((p) => p.id);

  let recentlySeenIds = new Set<string>();
  if (user.studentProfile) {
    const recent = await db.questionAttempt.findMany({
      where: { studentId: user.studentProfile.id, questionId: { in: poolIds } },
      select: { questionId: true },
      orderBy: { attemptedAt: "desc" },
      take: RECENT_ATTEMPTS_LOOKBACK,
      distinct: ["questionId"],
    });
    recentlySeenIds = new Set(recent.map((r) => r.questionId));
  }

  const selectedIds = pickRandomQuestionIds(poolIds, limit, recentlySeenIds);

  const rows = await db.contentQuestion.findMany({
    where: { id: { in: selectedIds } },
    include: { passage: true },
  });
  // `findMany` with `id: { in }` doesn't preserve the input order — restore
  // the shuffled order picked above.
  const rowById = new Map(rows.map((r) => [r.id, r]));
  const orderedRows = selectedIds.map((id) => rowById.get(id)).filter((r): r is NonNullable<typeof r> => !!r);

  const questions = orderedRows.map((row) => toPublicQuestion(fromContentQuestion(row)));
  const passages = Object.fromEntries(
    orderedRows.filter((r) => r.passage).map((r) => [r.passage!.id, { title: r.passage!.title, bodyText: r.passage!.bodyText, type: r.passage!.type }])
  );

  return NextResponse.json({ topic: { id: topic.id, strandName: topic.strandName }, questions, passages, usedFallbackDifficulty });
}
