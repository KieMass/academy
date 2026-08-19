import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";

/** POST /api/admin/reset-requests/:id/dismiss — for requests with no
 * matching account (or ones the admin decides not to action). */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const request = await db.passwordResetRequest.findUnique({ where: { id } });
  if (!request) return NextResponse.json({ error: "Request not found." }, { status: 404 });

  await db.passwordResetRequest.update({ where: { id }, data: { status: "DISMISSED" } });
  return NextResponse.json({ ok: true });
}
