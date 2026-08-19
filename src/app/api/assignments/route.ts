import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireParent } from "@/lib/auth/guards";

const schema = z.object({
  studentId: z.string(),
  subjectSlug: z.string(),
  strandSlug: z.string(),
  yearGroup: z.string(),
  title: z.string().min(1),
  dueDate: z.string().optional(),
});

export async function GET() {
  const { parentProfile } = await requireParent();
  const assignments = await db.assignment.findMany({
    where: { student: { parent: { familyId: parentProfile.familyId } } },
    include: { student: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ assignments });
}

export async function POST(req: Request) {
  const { parentProfile } = await requireParent();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { studentId, subjectSlug, strandSlug, yearGroup, title, dueDate } = parsed.data;

  const student = await db.studentProfile.findFirst({ where: { id: studentId, parent: { familyId: parentProfile.familyId } } });
  if (!student) return NextResponse.json({ error: "Student not found." }, { status: 404 });

  const topic = await db.topic.findFirst({ where: { subject: { slug: subjectSlug }, strandSlug, yearGroup: yearGroup as never } });
  if (!topic) return NextResponse.json({ error: "Topic not found." }, { status: 404 });

  const assignment = await db.assignment.create({
    data: {
      studentId,
      createdByParentId: parentProfile.id,
      type: "PRACTICE",
      title,
      topicIds: JSON.stringify([topic.id]),
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
  });

  return NextResponse.json({ assignment });
}
