import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth/guards";

const schema = z.object({
  questionId: z.string(),
  reason: z.string().min(1).max(200),
  note: z.string().max(1000).optional(),
  response: z.record(z.string(), z.unknown()).and(z.object({ type: z.string() })).optional(),
});

/**
 * POST /api/question-flags — a student reports a question as broken.
 * Starts the review pipeline at PENDING_PARENT_REVIEW; see
 * /api/parent/question-flags/[id]/{dismiss,escalate} and
 * /api/admin/question-flags/[id]/{dismiss,remove} for the rest of the flow.
 */
export async function POST(req: Request) {
  const { studentProfile } = await requireStudent();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { questionId, reason, note, response } = parsed.data;

  const question = await db.contentQuestion.findUnique({ where: { id: questionId } });
  if (!question) return NextResponse.json({ error: "Question not found." }, { status: 404 });

  // Don't spam duplicate flags — if this student already has one open on
  // this question, just hand that back instead of creating another.
  const existing = await db.questionFlag.findFirst({
    where: {
      questionId,
      studentId: studentProfile.id,
      status: { in: ["PENDING_PARENT_REVIEW", "PENDING_ADMIN_REVIEW"] },
    },
  });
  if (existing) {
    return NextResponse.json({ flag: existing, alreadyReported: true });
  }

  const flag = await db.questionFlag.create({
    data: {
      questionId,
      studentId: studentProfile.id,
      reason,
      note,
      studentAnswer: response ? JSON.stringify(response) : null,
    },
  });

  return NextResponse.json({ flag, alreadyReported: false });
}
