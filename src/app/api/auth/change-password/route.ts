import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6, "Password must be at least 6 characters."),
});

/** POST /api/auth/change-password
 *
 * Self-service password change for any logged-in role (parent, student or
 * admin) — requires knowing the current password, unlike an admin-initiated
 * reset. Invalidates every *other* session so a lost/shared device can't
 * keep using the old login, but leaves the current session alive so the
 * user isn't immediately booted off the page they just used. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }
  const { currentPassword, newPassword } = parsed.data;

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
  }

  const passwordHash = await hashPassword(newPassword);
  await db.user.update({ where: { id: user.id }, data: { passwordHash } });

  const cookieStore = await cookies();
  const currentSessionId = cookieStore.get("rba_session")?.value;
  await db.session.deleteMany({ where: { userId: user.id, id: { not: currentSessionId } } });

  return NextResponse.json({ ok: true });
}
