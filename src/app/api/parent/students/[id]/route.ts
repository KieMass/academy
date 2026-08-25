import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireParent } from "@/lib/auth/guards";
import { YEAR_GROUPS } from "@/lib/curriculum/types";

const schema = z.object({
  displayName: z.string().min(1).max(60),
  yearGroup: z.enum(YEAR_GROUPS),
  avatarEmoji: z.string().min(1).max(4).optional(),
});

/**
 * PATCH /api/parent/students/:id
 *
 * Lets a parent update their own child's display name, year/grade and
 * avatar — most importantly the year group, which needs to move up as a
 * child progresses through school (previously only settable once, at
 * account creation, or by an admin). Family-scoped like every other
 * "my students" route — either parent in a family can edit any student in
 * it, not just the one who added them.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const { displayName, yearGroup, avatarEmoji } = parsed.data;
  await db.studentProfile.update({
    where: { id },
    data: { displayName, yearGroup, avatarEmoji: avatarEmoji ?? student.avatarEmoji },
  });

  return NextResponse.json({ ok: true });
}
