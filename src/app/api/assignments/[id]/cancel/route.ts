import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireParent } from "@/lib/auth/guards";

/** POST /api/assignments/:id/cancel
 *
 * Removes an assignment from a student's active work list without deleting
 * it outright — sets status to CANCELLED, which the student dashboard's
 * "Set by your parent" query already excludes (it only pulls ASSIGNED /
 * IN_PROGRESS), mirroring the auto-complete pattern used at the 75%
 * threshold. Any QuestionAttempt rows already recorded against this
 * assignment are untouched (assignmentId is nullable and not cascaded),
 * so a child's XP/attempt history is never affected by a parent cancelling
 * the assignment it came from. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { parentProfile } = await requireParent();
  const { id } = await params;

  const assignment = await db.assignment.findFirst({
    where: { id, student: { parent: { familyId: parentProfile.familyId } } },
  });
  if (!assignment) return NextResponse.json({ error: "Assignment not found." }, { status: 404 });

  if (assignment.status === "COMPLETED" || assignment.status === "CANCELLED") {
    return NextResponse.json({ error: "This assignment can't be cancelled." }, { status: 400 });
  }

  await db.assignment.update({ where: { id }, data: { status: "CANCELLED" } });
  return NextResponse.json({ ok: true });
}
