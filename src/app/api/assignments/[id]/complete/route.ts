import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth/guards";

// Require a handful of graded questions before a score can complete an
// assignment — stops a single lucky first answer from finishing it.
const MIN_ATTEMPTS = 4;
const COMPLETION_THRESHOLD = 0.75; // strictly greater than this

/** POST /api/assignments/:id/complete
 *
 * Called by the practice UI after a session launched from an assignment
 * link finishes. Deliberately takes no score from the client — grading
 * already happened server-side per question in /api/attempts, so this
 * just recomputes accuracy from that student's own QuestionAttempt rows
 * tagged with this assignmentId and only flips status if it genuinely
 * clears the threshold. Idempotent. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { studentProfile } = await requireStudent();
  const { id } = await params;

  const assignment = await db.assignment.findFirst({ where: { id, studentId: studentProfile.id } });
  if (!assignment) return NextResponse.json({ error: "Assignment not found." }, { status: 404 });

  if (assignment.status === "COMPLETED") {
    return NextResponse.json({ ok: true, alreadyCompleted: true });
  }

  const attempts = await db.questionAttempt.findMany({
    where: { studentId: studentProfile.id, assignmentId: id },
    select: { isCorrect: true },
  });

  if (attempts.length < MIN_ATTEMPTS) {
    return NextResponse.json({ ok: false, reason: "not_enough_attempts", attempts: attempts.length }, { status: 200 });
  }

  const correct = attempts.filter((a) => a.isCorrect).length;
  const accuracy = correct / attempts.length;

  if (accuracy <= COMPLETION_THRESHOLD) {
    return NextResponse.json({ ok: false, reason: "below_threshold", scorePct: Math.round(accuracy * 100) }, { status: 200 });
  }

  await db.assignment.update({ where: { id }, data: { status: "COMPLETED" } });
  return NextResponse.json({ ok: true, scorePct: Math.round(accuracy * 100) });
}
