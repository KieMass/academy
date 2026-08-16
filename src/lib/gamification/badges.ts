import "server-only";
import { db } from "@/lib/db";

type BadgeCriteria =
  | { type: "questions_answered"; count: number }
  | { type: "correct_streak"; count: number }
  | { type: "difficulty_completed"; difficulty: "bronze" | "silver" | "gold" | "challenge"; count: number }
  | { type: "streak_days"; count: number }
  | { type: "topics_mastered"; subjectSlug: string; count: number }
  | { type: "passages_completed"; count: number }
  | { type: "spelling_test_perfect"; count: number };

/**
 * Checks every not-yet-earned badge against the student's current stats and
 * awards any that now qualify. Called after every graded attempt and every
 * spelling run. Cheap enough for MVP scale (a handful of badges, indexed
 * queries) — if the badge catalogue grows large, precompute stats once and
 * pass them in rather than querying per badge.
 */
export async function evaluateBadgesForStudent(studentId: string): Promise<string[]> {
  const [allBadges, alreadyEarned] = await Promise.all([
    db.badge.findMany(),
    db.studentBadge.findMany({ where: { studentId }, select: { badgeId: true } }),
  ]);
  const earnedIds = new Set(alreadyEarned.map((b) => b.badgeId));
  const candidates = allBadges.filter((b) => !earnedIds.has(b.id));
  if (candidates.length === 0) return [];

  const newlyAwarded: string[] = [];

  for (const badge of candidates) {
    const criteria = JSON.parse(badge.criteria) as BadgeCriteria;
    const qualifies = await checkCriteria(studentId, criteria);
    if (qualifies) {
      await db.studentBadge.create({ data: { studentId, badgeId: badge.id } });
      newlyAwarded.push(badge.slug);
    }
  }

  return newlyAwarded;
}

async function checkCriteria(studentId: string, criteria: BadgeCriteria): Promise<boolean> {
  switch (criteria.type) {
    case "questions_answered": {
      const count = await db.questionAttempt.count({ where: { studentId } });
      return count >= criteria.count;
    }

    case "correct_streak": {
      const recent = await db.questionAttempt.findMany({
        where: { studentId },
        orderBy: { attemptedAt: "desc" },
        take: criteria.count,
        select: { isCorrect: true },
      });
      return recent.length === criteria.count && recent.every((a) => a.isCorrect);
    }

    case "difficulty_completed": {
      const count = await db.questionAttempt.count({
        where: {
          studentId,
          isCorrect: true,
          question: { difficulty: criteria.difficulty.toUpperCase() as never },
        },
      });
      return count >= criteria.count;
    }

    case "streak_days": {
      const student = await db.studentProfile.findUnique({ where: { id: studentId }, select: { streakDays: true } });
      return (student?.streakDays ?? 0) >= criteria.count;
    }

    case "topics_mastered": {
      const count = await db.topicMastery.count({
        where: {
          studentId,
          masteryLevel: { in: ["SECURE", "MASTERED"] },
          topic: { subject: { slug: criteria.subjectSlug } },
        },
      });
      return count >= criteria.count;
    }

    case "passages_completed": {
      const distinctPassages = await db.questionAttempt.findMany({
        where: { studentId, question: { passageId: { not: null } } },
        select: { question: { select: { passageId: true } } },
        distinct: ["questionId"],
      });
      const passageIds = new Set(distinctPassages.map((a) => a.question.passageId));
      return passageIds.size >= criteria.count;
    }

    case "spelling_test_perfect": {
      // Prisma can't compare two columns in a `where` filter, so fetch the
      // (small) set of test runs and compare in JS.
      const runs = await db.spellingRun.findMany({ where: { studentId, mode: "TEST" } });
      return runs.some((r) => r.score === r.totalWords);
    }
  }
}
