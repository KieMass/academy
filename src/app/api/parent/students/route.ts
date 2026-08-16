import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { requireParent } from "@/lib/auth/guards";
import { YEAR_GROUPS } from "@/lib/curriculum/types";

const schema = z.object({
  displayName: z.string().min(1).max(60),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/i, "Usernames can only contain letters, numbers and underscores."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  yearGroup: z.enum(YEAR_GROUPS),
  avatarEmoji: z.string().min(1).max(4).optional(),
});

export async function GET() {
  const { parentProfile } = await requireParent();
  const students = await db.studentProfile.findMany({
    where: { parentId: parentProfile.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ students });
}

export async function POST(req: Request) {
  const { parentProfile } = await requireParent();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }
  const { displayName, username, password, yearGroup, avatarEmoji } = parsed.data;

  const existing = await db.user.findUnique({ where: { username: username.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  await db.user.create({
    data: {
      role: "STUDENT",
      username: username.toLowerCase(),
      passwordHash,
      studentProfile: {
        create: {
          displayName,
          yearGroup,
          avatarEmoji: avatarEmoji ?? "🦊",
          parentId: parentProfile.id,
        },
      },
    },
  });

  return NextResponse.json({ ok: true });
}
