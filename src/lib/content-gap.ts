import { db } from "@/lib/db";

/** Don't flag a topic until it's seen at least this many attempts — avoids
 * raising an alert for a brand-new or barely-used topic where a small pool
 * just hasn't been exercised much yet. */
const MIN_ATTEMPTS_FLOOR = 20;

/** Average attempts-per-question above this signals the pool is being
 * recycled heavily rather than students working through fresh content. */
const REPETITION_THRESHOLD = 4;

/**
 * Checks whether a topic's question pool is being recycled too hard and, if
 * so, raises a ContentGapAlert for admins. Called after each graded attempt
 * (see /api/attempts) — cheap in the common case: once a topic already has
 * a PENDING alert, this is a single indexed lookup and returns immediately.
 *
 * Dismissing an alert doesn't delete it, and a fresh one for the same topic
 * only fires again once attempts have grown by at least MIN_ATTEMPTS_FLOOR
 * beyond the count recorded at dismissal — otherwise the very next attempt
 * after a dismiss would just recreate it.
 */
export async function checkContentGap(topicId: string): Promise<void> {
  const latest = await db.contentGapAlert.findFirst({
    where: { topicId },
    orderBy: { createdAt: "desc" },
  });
  if (latest?.status === "PENDING") return;

  const [questionCount, attemptCount] = await Promise.all([
    db.contentQuestion.count({ where: { topicId, status: "PUBLISHED" } }),
    db.questionAttempt.count({ where: { question: { topicId } } }),
  ]);

  if (questionCount === 0) return; // nothing to compare against
  if (attemptCount < MIN_ATTEMPTS_FLOOR) return;
  if (attemptCount / questionCount < REPETITION_THRESHOLD) return;
  if (latest?.status === "DISMISSED" && attemptCount < latest.attemptCount + MIN_ATTEMPTS_FLOOR) return;

  await db.contentGapAlert.create({ data: { topicId, questionCount, attemptCount } });
}
