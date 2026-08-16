import { NextResponse } from "next/server";
import { z } from "zod";
import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { requireParent } from "@/lib/auth/guards";
import { fromContentQuestion } from "@/lib/question-engine/mapper";
import { WorksheetDocument } from "@/lib/pdf/worksheet-document";
import { getStudentOverview } from "@/lib/student-stats";
import { YEAR_GROUPS } from "@/lib/curriculum/types";

const schema = z.object({
  subjectSlug: z.string(),
  strandSlug: z.string().optional(), // omit for ASSESSMENT (spans the whole subject)
  yearGroup: z.enum(YEAR_GROUPS),
  kind: z.enum(["TEN_QUESTION", "TWENTY_QUESTION", "ASSESSMENT", "INTERVENTION"]),
  studentId: z.string().optional(), // required for INTERVENTION; used to print the student's name otherwise
});

const QUESTION_COUNT: Record<string, number> = {
  TEN_QUESTION: 10,
  TWENTY_QUESTION: 20,
  ASSESSMENT: 20,
  INTERVENTION: 10,
};

const KIND_LABEL: Record<string, string> = {
  TEN_QUESTION: "10-Question Practice Sheet",
  TWENTY_QUESTION: "20-Question Practice Sheet",
  ASSESSMENT: "Assessment Paper",
  INTERVENTION: "Targeted Intervention Paper",
};

export async function POST(req: Request) {
  const { parentProfile } = await requireParent();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }
  const { subjectSlug, strandSlug, yearGroup, kind, studentId } = parsed.data;
  const targetCount = QUESTION_COUNT[kind];

  let student: { id: string; displayName: string } | null = null;
  if (studentId) {
    const found = await db.studentProfile.findFirst({ where: { id: studentId, parentId: parentProfile.id } });
    if (!found) return NextResponse.json({ error: "Student not found." }, { status: 404 });
    student = { id: found.id, displayName: found.displayName };
  }

  const subject = await db.subject.findUnique({ where: { slug: subjectSlug } });
  if (!subject) return NextResponse.json({ error: "Subject not found." }, { status: 404 });

  let topicIds: string[] = [];
  let topicLabel = "Mixed topics";

  if (kind === "INTERVENTION") {
    if (!student) return NextResponse.json({ error: "A student must be selected for an intervention paper." }, { status: 400 });
    const overview = await getStudentOverview(student.id, yearGroup, 5);
    const weakStrandSlugs = overview.recommended.filter((t) => t.subjectSlug === subjectSlug).map((t) => t.strandSlug);
    const topics = await db.topic.findMany({ where: { subject: { slug: subjectSlug }, yearGroup, strandSlug: { in: weakStrandSlugs } } });
    topicIds = topics.length > 0 ? topics.map((t) => t.id) : (await db.topic.findMany({ where: { subject: { slug: subjectSlug }, yearGroup } })).map((t) => t.id);
    topicLabel = "Targeted practice (weak areas)";
  } else if (kind === "ASSESSMENT" || !strandSlug) {
    const topics = await db.topic.findMany({ where: { subject: { slug: subjectSlug }, yearGroup } });
    topicIds = topics.map((t) => t.id);
    topicLabel = "Mixed topics";
  } else {
    const topic = await db.topic.findFirst({ where: { subject: { slug: subjectSlug }, strandSlug, yearGroup } });
    if (!topic) return NextResponse.json({ error: "Topic not found." }, { status: 404 });
    topicIds = [topic.id];
    topicLabel = topic.strandName;
  }

  if (topicIds.length === 0) {
    return NextResponse.json({ error: "No topics available to build this worksheet." }, { status: 404 });
  }

  // Spread questions evenly across the selected topics, mixed difficulty.
  const perTopic = Math.max(1, Math.ceil(targetCount / topicIds.length));
  const rows = (
    await Promise.all(
      topicIds.map((topicId) =>
        db.contentQuestion.findMany({ where: { topicId, status: "PUBLISHED" }, take: perTopic, orderBy: { difficulty: "asc" } })
      )
    )
  )
    .flat()
    .slice(0, targetCount);

  if (rows.length === 0) {
    return NextResponse.json({ error: "No published questions found for this selection." }, { status: 404 });
  }

  const questions = rows.map(fromContentQuestion);

  await db.worksheet.create({
    data: {
      createdByStudentId: student?.id,
      subjectId: subject.id,
      topicIds: JSON.stringify(topicIds),
      kind,
      studentName: student?.displayName ?? "Student",
      questionIds: JSON.stringify(questions.map((q) => q.id)),
    },
  });

  const pdfBuffer = await renderToBuffer(
    <WorksheetDocument
      meta={{
        studentName: student?.displayName ?? "________________",
        date: new Date().toLocaleDateString("en-GB"),
        subjectName: subject.name,
        topicLabel,
        kindLabel: KIND_LABEL[kind],
      }}
      questions={questions}
    />
  );

  const filename = `${subject.name}-${topicLabel}-${kind}.pdf`.replace(/\s+/g, "-");

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
