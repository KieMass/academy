import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { fromContentQuestion } from "@/lib/question-engine/mapper";
import { toPublicQuestion } from "@/lib/question-engine/types";
import { shuffle, createRng } from "@/lib/content-generators/rng";

/**
 * GET /api/ngsa/exam?subject=maths|english|science|social-studies
 *
 * Assembles a simulated NGSA-style practice paper from the existing Guyana
 * Y6 question bank — NOT a transcription of any real past paper (see
 * /student/ngsa's disclaimer). "English" combines this app's separate
 * Reading and Grammar subjects, matching how NGSA itself treats English
 * Language as one paper. Guyana Grade 6 (Y6) only, matching what NGSA
 * actually assesses.
 */
const SUBJECT_MAP: Record<string, string[]> = {
  maths: ["maths"],
  english: ["reading", "grammar"],
  science: ["science"],
  "social-studies": ["social-studies"],
};
const SUBJECT_LABELS: Record<string, string> = {
  maths: "Mathematics",
  english: "English Language",
  science: "Science",
  "social-studies": "Social Studies",
};

const QUESTION_COUNT = 25;

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.studentProfile) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const curriculumSlug = user.studentProfile.parent.family.curriculum?.slug;
  if (curriculumSlug !== "guyana") {
    return NextResponse.json({ error: "NGSA practice exams are only available for the Guyana curriculum." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const subjectKey = searchParams.get("subject") ?? "";
  const subjectSlugs = SUBJECT_MAP[subjectKey];
  if (!subjectSlugs) {
    return NextResponse.json({ error: "Unknown subject. Use maths, english, science or social-studies." }, { status: 400 });
  }

  const topics = await db.topic.findMany({
    where: { subject: { slug: { in: subjectSlugs } }, yearGroup: "Y6", curriculum: { slug: "guyana" } },
  });
  if (topics.length === 0) {
    return NextResponse.json({ error: "No Grade 6 content found for this subject yet." }, { status: 404 });
  }
  const topicIds = topics.map((t) => t.id);

  const perTopic = Math.max(1, Math.ceil(QUESTION_COUNT / topicIds.length));
  const rows = (
    await Promise.all(
      topicIds.map((topicId) =>
        db.contentQuestion.findMany({
          where: { topicId, status: "PUBLISHED" },
          take: perTopic,
          orderBy: { difficulty: "asc" },
          include: { passage: true },
        })
      )
    )
  ).flat();

  // Deterministic per-day shuffle (not per-request) so refreshing mid-exam
  // doesn't reshuffle the paper from under the student, but the paper still
  // varies day to day rather than being frozen forever.
  const dayStamp = new Date().toISOString().slice(0, 10);
  const rng = createRng(`${subjectKey}:${dayStamp}`.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7));
  const orderedRows = shuffle(rng, rows).slice(0, QUESTION_COUNT);

  const questions = orderedRows.map((row) => toPublicQuestion(fromContentQuestion(row)));
  const passages = Object.fromEntries(
    orderedRows.filter((r) => r.passage).map((r) => [r.passage!.id, { title: r.passage!.title, bodyText: r.passage!.bodyText }])
  );

  return NextResponse.json({
    subjectLabel: SUBJECT_LABELS[subjectKey],
    questions,
    passages,
  });
}
