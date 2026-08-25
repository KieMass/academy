import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, DEFAULT_CURRICULUM_SLUG } from "@/lib/auth/session";

/**
 * GET /api/questions/difficulties?subject=maths&strand=fractions&yearGroup=Y5
 *
 * Reports which difficulty bands actually have published questions for a
 * topic, and how many. The student-facing difficulty picker (QuestionRunner)
 * uses this to only ever offer a band that has content — "no questions
 * available" should never be a state a student can reach by clicking a
 * button; it should be a state a button simply doesn't exist for.
 */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const subjectSlug = searchParams.get("subject");
  const strandSlug = searchParams.get("strand");
  const yearGroup = searchParams.get("yearGroup");

  if (!subjectSlug || !strandSlug || !yearGroup) {
    return NextResponse.json({ error: "subject, strand and yearGroup are required." }, { status: 400 });
  }

  const curriculumSlug = user.studentProfile?.parent.family.curriculum?.slug ?? user.parentProfile?.family.curriculum?.slug ?? DEFAULT_CURRICULUM_SLUG;
  const topic = await db.topic.findFirst({
    where: { subject: { slug: subjectSlug }, strandSlug, yearGroup: yearGroup as never, curriculum: { slug: curriculumSlug } },
  });
  if (!topic) return NextResponse.json({ error: "Topic not found." }, { status: 404 });

  const grouped = await db.contentQuestion.groupBy({
    by: ["difficulty"],
    where: { topicId: topic.id, status: "PUBLISHED" },
    _count: { _all: true },
  });

  const available = grouped
    .map((g) => ({ value: g.difficulty.toLowerCase() as "bronze" | "silver" | "gold" | "challenge", count: g._count._all }))
    .filter((g) => g.count > 0);

  return NextResponse.json({ available });
}
