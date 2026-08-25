import { NextResponse } from "next/server";
import { z } from "zod";
import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { requireParent } from "@/lib/auth/guards";
import { ReportDocument, type ReportData } from "@/lib/pdf/report-document";

const PERIOD_DAYS: Record<string, number> = {
  WEEK: 7,
  FORTNIGHT: 14,
  MONTH: 30,
};

const PERIOD_LABEL: Record<string, string> = {
  WEEK: "Weekly",
  FORTNIGHT: "Fortnightly",
  MONTH: "Monthly",
};

const schema = z.object({
  studentId: z.string(),
  period: z.enum(["WEEK", "FORTNIGHT", "MONTH"]),
});

export async function POST(req: Request) {
  const { parentProfile, yearGroupLabel } = await requireParent();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }
  const { studentId, period } = parsed.data;

  const student = await db.studentProfile.findFirst({ where: { id: studentId, parent: { familyId: parentProfile.familyId } } });
  if (!student) return NextResponse.json({ error: "Student not found." }, { status: 404 });

  const days = PERIOD_DAYS[period];
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

  const [attempts, xpEvents, badges, masteries] = await Promise.all([
    db.questionAttempt.findMany({
      where: { studentId, attemptedAt: { gte: startDate, lte: endDate } },
      include: { question: { include: { topic: { include: { subject: true } } } } },
    }),
    db.xpEvent.findMany({ where: { studentId, createdAt: { gte: startDate, lte: endDate } } }),
    db.studentBadge.findMany({ where: { studentId, earnedAt: { gte: startDate, lte: endDate } }, include: { badge: true } }),
    db.topicMastery.findMany({ where: { studentId }, include: { topic: { include: { subject: true } } } }),
  ]);

  const bySubjectMap = new Map<string, { attempted: number; correct: number }>();
  for (const a of attempts) {
    const key = a.question.topic.subject.name;
    const entry = bySubjectMap.get(key) ?? { attempted: 0, correct: 0 };
    entry.attempted++;
    if (a.isCorrect) entry.correct++;
    bySubjectMap.set(key, entry);
  }
  const bySubject = [...bySubjectMap.entries()]
    .map(([subjectName, v]) => ({
      subjectName,
      attempted: v.attempted,
      correct: v.correct,
      accuracyPct: v.attempted > 0 ? Math.round((v.correct / v.attempted) * 100) : 0,
    }))
    .sort((a, b) => b.attempted - a.attempted);

  const totalAttempted = attempts.length;
  const totalCorrect = attempts.filter((a) => a.isCorrect).length;
  const xpEarned = xpEvents.reduce((sum, e) => sum + e.points, 0);

  const MASTERY_LABEL: Record<string, string> = {
    NOT_STARTED: "Not started",
    DEVELOPING: "Developing",
    SECURE: "Secure",
    MASTERED: "Mastered",
  };
  const topicRows = masteries
    .filter((m) => m.questionsAttempted > 0)
    .map((m) => ({
      subjectName: m.topic.subject.name,
      strandName: m.topic.strandName,
      attempted: m.questionsAttempted,
      accuracyPct: Math.round((m.questionsCorrect / m.questionsAttempted) * 100),
      masteryLevel: MASTERY_LABEL[m.masteryLevel] ?? m.masteryLevel,
    }))
    .sort((a, b) => a.accuracyPct - b.accuracyPct);

  const reportData: ReportData = {
    studentName: student.displayName,
    yearGroup: student.yearGroup,
    yearGroupLabel,
    periodLabel: PERIOD_LABEL[period],
    startDate: startDate.toLocaleDateString("en-GB"),
    endDate: endDate.toLocaleDateString("en-GB"),
    generatedOn: new Date().toLocaleDateString("en-GB"),
    totals: {
      questionsAttempted: totalAttempted,
      accuracyPct: totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0,
      xpEarned,
      streakDays: student.streakDays,
      currentLevel: student.levelNumber,
    },
    bySubject,
    topicRows,
    badgesEarned: badges.map((b) => b.badge.name),
  };

  const pdfBuffer = await renderToBuffer(<ReportDocument data={reportData} />);
  const filename = `${student.displayName}-${PERIOD_LABEL[period]}-Report.pdf`.replace(/\s+/g, "-");

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
