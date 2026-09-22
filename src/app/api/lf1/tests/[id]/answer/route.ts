import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireLearner } from "@/lib/auth/guards";
import { getLf1Question } from "@/lib/lf1/bank";
import { LF1_MOCK_GRACE_SECONDS, lf1Deadline, parseLf1Answers, parseLf1QuestionIds } from "@/lib/lf1/tests";

const schema = z.object({
  questionId: z.string().min(1),
  selectedIndex: z.number().int().min(0),
});

/**
 * POST /api/lf1/tests/:id/answer
 *
 * PRACTICE: grades the answer immediately, records it (once — a question
 * can't be re-answered to fish for the right option) and returns the
 * correct option plus explanation.
 * MOCK: only saves the selection so an interrupted exam can be resumed; no
 * feedback until the paper is submitted via /complete.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { learnerProfile } = await requireLearner();
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { questionId, selectedIndex } = parsed.data;

  const session = await db.lf1TestSession.findFirst({ where: { id, learnerId: learnerProfile.id } });
  if (!session) return NextResponse.json({ error: "Test not found." }, { status: 404 });
  if (session.completedAt) return NextResponse.json({ error: "This test has already been submitted." }, { status: 409 });

  const question = getLf1Question(questionId);
  if (!question || !parseLf1QuestionIds(session.questionIds).includes(questionId)) {
    return NextResponse.json({ error: "That question isn't part of this test." }, { status: 400 });
  }
  if (selectedIndex >= question.options.length) return NextResponse.json({ error: "Invalid option." }, { status: 400 });

  const answers = parseLf1Answers(session.answers);

  if (session.mode === "MOCK") {
    const deadline = lf1Deadline(session);
    if (deadline !== null && Date.now() > deadline + LF1_MOCK_GRACE_SECONDS * 1000) {
      return NextResponse.json({ error: "Time is up for this exam." }, { status: 409 });
    }
    answers[questionId] = selectedIndex;
    await db.lf1TestSession.update({ where: { id }, data: { answers: JSON.stringify(answers) } });
    return NextResponse.json({ saved: true });
  }

  // Practice: first answer stands.
  const existing = answers[questionId];
  const finalIndex = existing ?? selectedIndex;
  const correct = finalIndex === question.answer;
  if (existing === undefined) {
    answers[questionId] = selectedIndex;
    await db.$transaction([
      db.lf1TestSession.update({ where: { id }, data: { answers: JSON.stringify(answers) } }),
      db.lf1Answer.create({
        data: { sessionId: id, learnerId: learnerProfile.id, questionId, outcome: question.outcome, selectedIndex, isCorrect: correct },
      }),
    ]);
  }

  return NextResponse.json({ correct, selectedIndex: finalIndex, correctIndex: question.answer, explanation: question.explanation });
}
