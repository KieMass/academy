import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireLearner } from "@/lib/auth/guards";
import { LF1_MOCK_GRACE_SECONDS, gradeLf1Answers, lf1Deadline, parseLf1Answers, parseLf1QuestionIds } from "@/lib/lf1/tests";

const schema = z.object({
  // Mock only: the client's final answer sheet, in case the last autosave
  // didn't land. Ignored for practice, whose answers are graded one by one.
  answers: z.record(z.string(), z.number().int().min(0)).optional(),
});

/**
 * POST /api/lf1/tests/:id/complete — finishes a test.
 *
 * MOCK: marks the whole paper, writes one Lf1Answer per question
 * (unanswered = incorrect, as in the real exam) and records the score.
 * PRACTICE: just closes the set; its answers were already recorded by
 * /answer, and only those count (skipped questions aren't marked wrong).
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { learnerProfile } = await requireLearner();
  const { id } = await params;

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body ?? {});
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const session = await db.lf1TestSession.findFirst({ where: { id, learnerId: learnerProfile.id } });
  if (!session) return NextResponse.json({ error: "Test not found." }, { status: 404 });
  if (session.completedAt) return NextResponse.json({ id, correctCount: session.correctCount, totalQuestions: session.totalQuestions });

  const questionIds = parseLf1QuestionIds(session.questionIds);
  const now = new Date();

  if (session.mode === "PRACTICE") {
    const correctCount = await db.lf1Answer.count({ where: { sessionId: id, isCorrect: true } });
    await db.lf1TestSession.update({ where: { id }, data: { completedAt: now, correctCount } });
    return NextResponse.json({ id, correctCount, totalQuestions: session.totalQuestions });
  }

  const deadline = lf1Deadline(session);
  const inTime = deadline === null || now.getTime() <= deadline + LF1_MOCK_GRACE_SECONDS * 1000;
  const answers = { ...parseLf1Answers(session.answers), ...(inTime ? parsed.data.answers : {}) };
  const { graded, correctCount } = gradeLf1Answers(questionIds, answers);

  // updateMany + completedAt:null guard so a double submit (e.g. the timer's
  // auto-submit racing a manual click) can't write the answer rows twice.
  const claimed = await db.lf1TestSession.updateMany({
    where: { id, completedAt: null },
    data: { completedAt: now, correctCount, answers: JSON.stringify(answers) },
  });
  if (claimed.count === 0) {
    return NextResponse.json({ id, correctCount, totalQuestions: session.totalQuestions });
  }
  await db.lf1Answer.createMany({
    data: graded.map((g) => ({ sessionId: id, learnerId: learnerProfile.id, questionId: g.questionId, outcome: g.outcome, selectedIndex: g.selectedIndex, isCorrect: g.isCorrect })),
    skipDuplicates: true,
  });

  return NextResponse.json({ id, correctCount, totalQuestions: session.totalQuestions });
}
