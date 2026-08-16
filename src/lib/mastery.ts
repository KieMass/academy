import "server-only";
import { db } from "@/lib/db";
import type { MasteryLevel } from "@prisma/client";

function computeMasteryLevel(attempted: number, correct: number): MasteryLevel {
  if (attempted === 0) return "NOT_STARTED";
  const accuracy = correct / attempted;
  if (attempted >= 8 && accuracy >= 0.85) return "MASTERED";
  if (attempted >= 5 && accuracy >= 0.6) return "SECURE";
  return "DEVELOPING";
}

/** Upserts and recomputes a student's mastery record for a topic after a
 * graded attempt. Powers "topics mastered / needing support" everywhere:
 * the parent progress dashboard, the student's recommended practice, and
 * the intervention-worksheet generator. */
export async function updateTopicMastery(studentId: string, topicId: string, isCorrect: boolean) {
  const existing = await db.topicMastery.findUnique({ where: { studentId_topicId: { studentId, topicId } } });
  const attempted = (existing?.questionsAttempted ?? 0) + 1;
  const correct = (existing?.questionsCorrect ?? 0) + (isCorrect ? 1 : 0);
  const masteryLevel = computeMasteryLevel(attempted, correct);

  return db.topicMastery.upsert({
    where: { studentId_topicId: { studentId, topicId } },
    update: { questionsAttempted: attempted, questionsCorrect: correct, masteryLevel, lastPracticedAt: new Date() },
    create: {
      studentId,
      topicId,
      questionsAttempted: attempted,
      questionsCorrect: correct,
      masteryLevel,
      lastPracticedAt: new Date(),
    },
  });
}

/** Updates the student's daily streak counter. Call once per session/day of
 * activity (idempotent — calling it multiple times in the same day is a
 * no-op after the first). */
export async function touchStudentStreak(studentId: string) {
  const student = await db.studentProfile.findUniqueOrThrow({ where: { id: studentId } });
  const now = new Date();
  const last = student.lastActiveAt;

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (last && isSameDay(last, now)) return student; // already counted today

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isConsecutive = last ? isSameDay(last, yesterday) : false;

  return db.studentProfile.update({
    where: { id: studentId },
    data: {
      streakDays: isConsecutive ? student.streakDays + 1 : 1,
      lastActiveAt: now,
    },
  });
}
