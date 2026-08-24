import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireParent } from "@/lib/auth/guards";
import { hashPassword } from "@/lib/auth/password";

const schema = z.object({ newPassword: z.string().min(6, "Password must be at least 6 characters.") });

/**
 * POST /api/parent/students/:id/change-password
 *
 * A parent sets a new password directly for one of their own students —
 * no "current password" needed (mirrors how a parent already sets the
 * student's password when creating the account in the first place; see
 * POST /api/parent/students), unlike the self-service
 * /api/auth/change-password flow. Family-scoped, like every other
 * "my students" query — either parent in a family can manage any student
 * in it, not just the one who added them.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { parentProfile } = await requireParent();
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  const student = await db.studentProfile.findUnique({ where: { id }, include: { parent: true } });
  if (!student || student.parent.familyId !== parentProfile.familyId) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await db.user.update({ where: { id: student.userId }, data: { passwordHash } });

  // Log the student out everywhere so a device they're already signed into
  // (e.g. a shared family tablet) can't keep using the old password.
  await db.session.deleteMany({ where: { userId: student.userId } });

  return NextResponse.json({ ok: true });
}
