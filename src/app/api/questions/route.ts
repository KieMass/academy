import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { fromContentQuestion } from "@/lib/question-engine/mapper";
import { toPublicQuestion } from "@/lib/question-engine/types";

/**
 * GET /api/questions?subject=maths&strand=fractions&yearGroup=Y5&difficulty=silver&limit=10
 *
 * Returns questions with every answer-bearing field stripped (see
 * toPublicQuestion) — grading always happens server-side in /api/attempts.
 */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const subjectSlug = searchParams.get("subject");
  const strandSlug = searchParams.get("strand");
  const yearGroup = searchParams.get("yearGroup");
  const difficulty = searchParams.get("difficulty");
  const limit = Math.min(Number(searchParams.get("limit") ?? 10), 50);

  if (!subjectSlug || !strandSlug || !yearGroup) {
    return NextResponse.json({ error: "subject, strand and yearGroup are required." }, { status: 400 });
  }

  const topic = await db.topic.findFirst({
    where: { subject: { slug: subjectSlug }, strandSlug, yearGroup: yearGroup as never },
  });
  if (!topic) return NextResponse.json({ error: "Topic not found." }, { status: 404 });

  const rows = await db.contentQuestion.findMany({
    where: {
      topicId: topic.id,
      status: "PUBLISHED",
      ...(difficulty ? { difficulty: difficulty.toUpperCase() as never } : {}),
    },
    take: limit,
    orderBy: { createdAt: "asc" },
    include: { passage: true },
  });

  const questions = rows.map((row) => toPublicQuestion(fromContentQuestion(row)));
  const passages = Object.fromEntries(
    rows.filter((r) => r.passage).map((r) => [r.passage!.id, { title: r.passage!.title, bodyText: r.passage!.bodyText, type: r.passage!.type }])
  );

  return NextResponse.json({ topic: { id: topic.id, strandName: topic.strandName }, questions, passages });
}
