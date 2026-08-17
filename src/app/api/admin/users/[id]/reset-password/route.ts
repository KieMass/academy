import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { hashPassword } from "@/lib/auth/password";

/** POST /api/admin/users/:id/reset-password
 *
 * Generates a fresh random password for the given user, hashes and stores
 * it, then returns the plaintext once so the admin can relay it — there's
 * no email service wired up yet, so this is the only time it's ever visible. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const user = await db.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const password = crypto.randomBytes(9).toString("base64url"); // 12 chars, URL-safe
  const passwordHash = await hashPassword(password);
  await db.user.update({ where: { id }, data: { passwordHash } });

  // Resetting a password should also invalidate any sessions the user is
  // currently holding, so a lost/compromised device can't keep using the
  // old login.
  await db.session.deleteMany({ where: { userId: id } });

  return NextResponse.json({ password });
}
