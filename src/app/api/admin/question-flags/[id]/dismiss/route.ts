import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await requireAdmin();
  const { id } = await params;

  const flag = await db.questionFlag.findUnique({ where: { id } });
  if (!flag) return NextResponse.json({ error: "Flag not found." }, { status: 404 });
  if (flag.status !== "PENDING_ADMIN_REVIEW") {
    return NextResponse.json({ error: "This flag isn't awaiting admin review." }, { status: 400 });
  }

  await db.questionFlag.update({
    where: { id },
    data: { status: "DISMISSED_BY_ADMIN", reviewedByAdminId: user.id, adminReviewedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
