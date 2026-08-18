import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { hashPassword } from "@/lib/auth/password";

/** POST /api/admin/reset-requests/:id/fulfil
 *
 * Generates a new password for the account behind a pending forgot-password
 * request (same one-time-shown pattern as the direct admin reset), marks the
 * request FULFILLED, and revokes that user's active sessions. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const request = await db.passwordResetRequest.findUnique({ where: { id } });
  if (!request) return NextResponse.json({ error: "Request not found." }, { status: 404 });
  if (!request.userId) return NextResponse.json({ error: "No matching account for this request." }, { status: 400 });

  const password = crypto.randomBytes(9).toString("base64url");
  const passwordHash = await hashPassword(password);
  await db.user.update({ where: { id: request.userId }, data: { passwordHash } });
  await db.session.deleteMany({ where: { userId: request.userId } });
  await db.passwordResetRequest.update({ where: { id }, data: { status: "FULFILLED", fulfilledAt: new Date() } });

  return NextResponse.json({ password });
}
