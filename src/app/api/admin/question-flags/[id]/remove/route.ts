import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";

/**
 * Archives the flagged question (ContentQuestion.status -> ARCHIVED, already
 * excluded by /api/questions' PUBLISHED filter) and closes out every flag
 * still pending admin review on that same question, so one bad question
 * reported by several students doesn't leave duplicate open flags behind.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await requireAdmin();
  const { id } = await params;

  const flag = await db.questionFlag.findUnique({ where: { id } });
  if (!flag) return NextResponse.json({ error: "Flag not found." }, { status: 404 });
  if (flag.status !== "PENDING_ADMIN_REVIEW") {
    return NextResponse.json({ error: "This flag isn't awaiting admin review." }, { status: 400 });
  }

  const now = new Date();
  await db.$transaction([
    db.contentQuestion.update({ where: { id: flag.questionId }, data: { status: "ARCHIVED" } }),
    db.questionFlag.updateMany({
      where: { questionId: flag.questionId, status: "PENDING_ADMIN_REVIEW" },
      data: { status: "REMOVED", reviewedByAdminId: user.id, adminReviewedAt: now },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
