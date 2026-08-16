import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth/guards";
import { fromContentQuestion } from "@/lib/question-engine/mapper";
import { gradeResponse } from "@/lib/question-engine/grade";
import { revealAnswer } from "@/lib/question-engine/reveal";
import { updateTopicMastery, touchStudentStreak } from "@/lib/mastery";
import { xpForCorrectAnswer, levelForXp } from "@/lib/gamification/xp";
import { evaluateBadgesForStudent } from "@/lib/gamification/badges";

const schema = z.object({
  questionId: z.string(),
  response: z.record(z.string(), z.unknown()).and(z.object({ type: z.string() })),
  timeSpentSeconds: z.number().int().min(0).max(3600),
  assignmentId: z.string().optional(),
});

export async function POST(req: Request) {
  const { studentProfile } = await requireStudent();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { questionId, response, timeSpentSeconds, assignmentId } = parsed.data;

  const row = await db.contentQuestion.findUnique({ where: { id: questionId } });
  if (!row) return NextResponse.json({ error: "Question not found." }, { status: 404 });

  const question = fromContentQuestion(row);

  // Response type must match the question type — reject tampering attempts.
  if (response.type !== question.type) {
    return NextResponse.json({ error: "Response type mismatch." }, { status: 400 });
  }

  const result = gradeResponse(question, response as never);

  await db.questionAttempt.create({
    data: {
      studentId: studentProfile.id,
      questionId: question.id,
      response: JSON.stringify(response),
      isCorrect: result.correct,
      timeSpentSeconds,
      assignmentId,
    },
  });

  const [, streaked] = await Promise.all([
    updateTopicMastery(studentProfile.id, question.topicId, result.correct),
    touchStudentStreak(studentProfile.id),
  ]);

  let xpAwarded = 0;
  if (result.correct) {
    xpAwarded = xpForCorrectAnswer(question.difficulty);
    await db.xpEvent.create({
      data: { studentId: studentProfile.id, points: xpAwarded, reason: "QUESTION_CORRECT", meta: JSON.stringify({ questionId }) },
    });
  }

  const newXpTotal = studentProfile.xpTotal + xpAwarded;
  const newLevel = levelForXp(newXpTotal);
  await db.studentProfile.update({
    where: { id: studentProfile.id },
    data: { xpTotal: newXpTotal, levelNumber: newLevel },
  });

  const newBadgeSlugs = await evaluateBadgesForStudent(studentProfile.id);

  return NextResponse.json({
    correct: result.correct,
    partial: result.partial,
    explanation: question.explanation ?? null,
    correctAnswer: revealAnswer(question),
    xpAwarded,
    xpTotal: newXpTotal,
    level: newLevel,
    streakDays: streaked.streakDays,
    newBadges: newBadgeSlugs,
  });
}
