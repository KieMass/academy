import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireParent } from "@/lib/auth/guards";

const schema = z.object({ curriculumSlug: z.string().min(1) });

/**
 * PATCH /api/parent/family/curriculum
 *
 * Changes the national curriculum the whole family follows — e.g. a family
 * relocating from the Cayman Islands to Guyana, or correcting a wrong
 * choice made at registration. Curriculum is a Family-level setting (one
 * household, one school system — see the Curriculum model in
 * schema.prisma), so this applies to every student in the family at once,
 * not per-child. Past attempts/assignments/worksheets stay linked to the
 * topics they were created against (which never change), so history isn't
 * lost — only *new* questions, assignments and worksheets switch to the
 * new curriculum's content from this point on.
 */
export async function PATCH(req: Request) {
  const { parentProfile } = await requireParent();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  const curriculum = await db.curriculum.findUnique({ where: { slug: parsed.data.curriculumSlug } });
  if (!curriculum) {
    return NextResponse.json({ error: "Unknown curriculum." }, { status: 400 });
  }

  await db.family.update({ where: { id: parentProfile.familyId }, data: { curriculumId: curriculum.id } });

  return NextResponse.json({ ok: true, curriculum: { slug: curriculum.slug, name: curriculum.name, yearGroupLabel: curriculum.yearGroupLabel } });
}
