import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireParent } from "@/lib/auth/guards";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { parentProfile } = await requireParent();
  const { id } = await params;

  const flag = await db.questionFlag.findUnique({ where: { id }, include: { student: { include: { parent: true } } } });
  if (!flag || flag.student.parent.familyId !== parentProfile.familyId) {
    return NextResponse.json({ error: "Flag not found." }, { status: 404 });
  }
  if (flag.status !== "PENDING_PARENT_REVIEW") {
    return NextResponse.json({ error: "This flag has already been reviewed." }, { status: 400 });
  }

  await db.questionFlag.update({
    where: { id },
    data: { status: "DISMISSED_BY_PARENT", reviewedByParentId: parentProfile.id, parentReviewedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
