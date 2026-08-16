import "server-only";
import { db } from "@/lib/db";
import { resolveTopics } from "@/lib/curriculum/loader";
import type { YearGroup } from "@/lib/curriculum/types";

export interface RecommendedTopic {
  subjectSlug: string;
  subjectName: string;
  strandSlug: string;
  strandName: string;
  yearGroup: YearGroup;
  reason: "weak-area" | "not-started";
  accuracy?: number;
}

/**
 * Aggregates a student's mastery across every topic in their year group and
 * produces a recommended-practice list: attempted-but-weak topics first
 * (the "reattempt weak areas" goal), then a few never-attempted topics to
 * keep exploration balanced.
 */
export async function getStudentOverview(studentId: string, yearGroup: YearGroup, limit = 5) {
  const allTopics = resolveTopics({ yearGroup });
  const masteries = await db.topicMastery.findMany({
    where: { studentId, topic: { yearGroup } },
    include: { topic: { include: { subject: true } } },
  });

  const masteryByStrand = new Map(masteries.map((m) => [`${m.topic.subject.slug}:${m.topic.strandSlug}`, m]));

  const counts = { mastered: 0, secure: 0, developing: 0, notStarted: 0 };
  const weakAreas: RecommendedTopic[] = [];
  const notStartedTopics: RecommendedTopic[] = [];

  for (const topic of allTopics) {
    const mastery = masteryByStrand.get(`${topic.subjectSlug}:${topic.strandSlug}`);
    if (!mastery || mastery.masteryLevel === "NOT_STARTED") {
      counts.notStarted++;
      notStartedTopics.push({
        subjectSlug: topic.subjectSlug,
        subjectName: topic.subjectName,
        strandSlug: topic.strandSlug,
        strandName: topic.strandName,
        yearGroup: topic.yearGroup,
        reason: "not-started",
      });
    } else if (mastery.masteryLevel === "DEVELOPING") {
      counts.developing++;
      weakAreas.push({
        subjectSlug: topic.subjectSlug,
        subjectName: topic.subjectName,
        strandSlug: topic.strandSlug,
        strandName: topic.strandName,
        yearGroup: topic.yearGroup,
        reason: "weak-area",
        accuracy: mastery.questionsAttempted > 0 ? mastery.questionsCorrect / mastery.questionsAttempted : 0,
      });
    } else if (mastery.masteryLevel === "SECURE") {
      counts.secure++;
    } else if (mastery.masteryLevel === "MASTERED") {
      counts.mastered++;
    }
  }

  weakAreas.sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0));

  const recommended = [...weakAreas.slice(0, limit), ...notStartedTopics.slice(0, Math.max(0, limit - weakAreas.length))].slice(
    0,
    limit
  );

  return {
    totalTopics: allTopics.length,
    counts,
    recommended,
  };
}
