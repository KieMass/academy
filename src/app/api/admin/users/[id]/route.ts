import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { YEAR_GROUPS } from "@/lib/curriculum/types";

const schema = z.object({
  fullName: z.string().min(1).max(100).optional(), // parent
  email: z.string().email().optional(), // parent/admin
  displayName: z.string().min(1).max(60).optional(), // student
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/i, "Usernames can only contain letters, numbers and underscores.").optional(), // student
  yearGroup: z.enum(YEAR_GROUPS).optional(), // student
  avatarEmoji: z.string().min(1).max(4).optional(), // student
});

/** PATCH /api/admin/users/:id — edits the basic profile fields for any
 * account. Which fields apply depends on the user's role; anything else in
 * the body is silently ignored rather than erroring, so the same form
 * component can post a role-appropriate subset without extra branching. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const user = await db.user.findUnique({ where: { id }, include: { parentProfile: true, studentProfile: true } });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }
  const { fullName, email, displayName, username, yearGroup, avatarEmoji } = parsed.data;

  if (email !== undefined) {
    const normalised = email.toLowerCase();
    const existing = await db.user.findUnique({ where: { email: normalised } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: "That email is already in use." }, { status: 409 });
    }
    await db.user.update({ where: { id }, data: { email: normalised } });
  }

  if (username !== undefined) {
    const normalised = username.toLowerCase();
    const existing = await db.user.findUnique({ where: { username: normalised } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
    }
    await db.user.update({ where: { id }, data: { username: normalised } });
  }

  if (user.role === "PARENT" && user.parentProfile && fullName !== undefined) {
    await db.parentProfile.update({ where: { id: user.parentProfile.id }, data: { fullName } });
  }

  if (user.role === "STUDENT" && user.studentProfile) {
    const data: { displayName?: string; yearGroup?: (typeof YEAR_GROUPS)[number]; avatarEmoji?: string } = {};
    if (displayName !== undefined) data.displayName = displayName;
    if (yearGroup !== undefined) data.yearGroup = yearGroup;
    if (avatarEmoji !== undefined) data.avatarEmoji = avatarEmoji;
    if (Object.keys(data).length > 0) {
      await db.studentProfile.update({ where: { id: user.studentProfile.id }, data });
    }
  }

  return NextResponse.json({ ok: true });
}
