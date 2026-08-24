import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireParent } from "@/lib/auth/guards";

const schema = z.object({ notes: z.string().max(1000).optional() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { parentProfile } = await requireParent();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const flag = await db.questionFlag.findUnique({ where: { id }, include: { student: { include: { parent: true } } } });
  if (!flag || flag.student.parent.familyId !== parentProfile.familyId) {
    return NextResponse.json({ error: "Flag not found." }, { status: 404 });
  }
  if (flag.status !== "PENDING_PARENT_REVIEW") {
    return NextResponse.json({ error: "This flag has already been reviewed." }, { status: 400 });
  }

  await db.questionFlag.update({
    where: { id },
    data: {
      status: "PENDING_ADMIN_REVIEW",
      reviewedByParentId: parentProfile.id,
      parentNotes: parsed.data.notes,
      parentReviewedAt: new Date(),
    },
  });
  return NextResponse.json({ ok: true });
}
