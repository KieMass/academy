import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const alert = await db.contentGapAlert.findUnique({ where: { id } });
  if (!alert) return NextResponse.json({ error: "Alert not found." }, { status: 404 });

  await db.contentGapAlert.update({ where: { id }, data: { status: "DISMISSED", dismissedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
