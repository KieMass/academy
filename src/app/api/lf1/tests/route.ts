import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireLearner } from "@/lib/auth/guards";
import { LF1_SYLLABUS } from "@/lib/lf1/bank";
import { LF1_MOCK_TIME_LIMIT_SECONDS, LF1_PRACTICE_SIZES, buildMockPaper, buildPracticeSet } from "@/lib/lf1/tests";

const OUTCOME_NUMBERS = LF1_SYLLABUS.outcomes.map((o) => o.number);

const schema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("PRACTICE"),
    outcome: z.number().int().refine((n) => OUTCOME_NUMBERS.includes(n), "Unknown learning outcome.").nullable(),
    count: z.number().int().refine((n) => (LF1_PRACTICE_SIZES as readonly number[]).includes(n), "Unsupported practice size."),
  }),
  z.object({ mode: z.literal("MOCK") }),
]);

/**
 * POST /api/lf1/tests — starts an LF1 practice set or a timed mock exam.
 * The question list is frozen onto the session at creation so the page can
 * be refreshed (or resumed later) without the paper changing.
 */
export async function POST(req: Request) {
  const { learnerProfile } = await requireLearner();

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  const answered = await db.lf1Answer.findMany({ where: { learnerId: learnerProfile.id }, select: { questionId: true }, distinct: ["questionId"] });
  const answeredIds = new Set(answered.map((a) => a.questionId));

  const input = parsed.data;
  const questionIds = input.mode === "MOCK" ? buildMockPaper(answeredIds) : buildPracticeSet(input.outcome, input.count, answeredIds);
  if (questionIds.length === 0) {
    return NextResponse.json({ error: "No questions available for that selection yet." }, { status: 404 });
  }

  const session = await db.lf1TestSession.create({
    data: {
      learnerId: learnerProfile.id,
      mode: input.mode,
      outcome: input.mode === "PRACTICE" ? input.outcome : null,
      questionIds: JSON.stringify(questionIds),
      totalQuestions: questionIds.length,
      timeLimitSeconds: input.mode === "MOCK" ? LF1_MOCK_TIME_LIMIT_SECONDS : null,
    },
  });

  return NextResponse.json({ id: session.id });
}
