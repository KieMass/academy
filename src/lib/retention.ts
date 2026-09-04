import "server-only";
import { subDays } from "date-fns";
import { db } from "@/lib/db";
import type { RetentionMode } from "@prisma/client";

// Single fixed id for the one-and-only settings row — same convention as
// RateLimitBucket.key, avoids the ceremony of a generated id for a
// singleton. See prisma/schema.prisma's ResultsRetentionSetting.
const SETTING_ID = "global";

const DEFAULT_MODE: RetentionMode = "ASSIGNMENT_COUNT";
const DEFAULT_VALUE = 20;

// Once a purge has run, don't run the (system-wide) scan again for this
// long — purging is triggered opportunistically from /api/attempts (see
// maybePurgeExpiredResults below), so without this gate every graded
// question would re-scan every student's assignment history.
const PURGE_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

export interface RetentionSetting {
  mode: RetentionMode;
  value: number;
  lastPurgedAt: Date | null;
}

/** Current system-wide retention policy, or the built-in default if an
 * admin has never saved one. */
export async function getRetentionSetting(): Promise<RetentionSetting> {
  const row = await db.resultsRetentionSetting.findUnique({ where: { id: SETTING_ID } });
  return row ?? { mode: DEFAULT_MODE, value: DEFAULT_VALUE, lastPurgedAt: null };
}

/** Saves a new policy and immediately purges against it, so a stricter
 * setting (e.g. shortening 90 days down to 30) takes visible effect right
 * away rather than waiting for the next opportunistic purge window. */
export async function setRetentionSetting(mode: RetentionMode, value: number): Promise<RetentionSetting> {
  await db.resultsRetentionSetting.upsert({
    where: { id: SETTING_ID },
    update: { mode, value },
    create: { id: SETTING_ID, mode, value },
  });
  await purgeExpiredResults();
  return getRetentionSetting();
}

/** Deletes assignments (and their attempts) that fall outside the current
 * retention policy, system-wide — every family, not just one. "Purged"
 * means gone: attempts are deleted first, then the assignment itself,
 * rather than leaving orphaned attempts behind via the FK's onDelete:
 * SetNull. Gamification state (XpEvent, TopicMastery, StudentProfile.xpTotal)
 * is untouched — those are updated incrementally at attempt-time (see
 * /api/attempts) and don't get recomputed from QuestionAttempt history, so
 * purging old results doesn't claw back XP or mastery already earned. */
export async function purgeExpiredResults(): Promise<{ purgedAssignments: number; purgedAttempts: number }> {
  const setting = await getRetentionSetting();
  const staleIds = setting.mode === "DAYS" ? await staleAssignmentIdsByAge(setting.value) : await staleAssignmentIdsByCount(setting.value);

  if (staleIds.length === 0) return { purgedAssignments: 0, purgedAttempts: 0 };

  const { count: purgedAttempts } = await db.questionAttempt.deleteMany({ where: { assignmentId: { in: staleIds } } });
  const { count: purgedAssignments } = await db.assignment.deleteMany({ where: { id: { in: staleIds } } });
  return { purgedAssignments, purgedAttempts };
}

async function staleAssignmentIdsByAge(days: number): Promise<string[]> {
  const cutoff = subDays(new Date(), days);
  const stale = await db.assignment.findMany({ where: { createdAt: { lt: cutoff } }, select: { id: true } });
  return stale.map((a) => a.id);
}

/** Keeps each student's most recent `keep` assignments and returns the ids
 * of the rest. No single query expresses "top N per group" in Prisma, so
 * this walks students one at a time — fine at this app's scale (a purge
 * only runs every PURGE_INTERVAL_MS, and each student's own assignment list
 * is small). */
async function staleAssignmentIdsByCount(keep: number): Promise<string[]> {
  const studentIds = await db.assignment.findMany({ distinct: ["studentId"], select: { studentId: true } });
  const staleIds: string[] = [];
  for (const { studentId } of studentIds) {
    const kept = await db.assignment.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
      take: keep,
    });
    const keptIds = kept.map((a) => a.id);
    const rest = await db.assignment.findMany({
      where: { studentId, id: { notIn: keptIds } },
      select: { id: true },
    });
    staleIds.push(...rest.map((a) => a.id));
  }
  return staleIds;
}

/** Opportunistic purge, cheap in the common case (a single indexed read of
 * the settings row) — call this from a frequently-hit write path instead of
 * standing up a cron job. Mirrors checkContentGap's shape in
 * lib/content-gap.ts. Errors are swallowed: a failed cleanup pass should
 * never break the request that happened to trigger it. */
export async function maybePurgeExpiredResults(): Promise<void> {
  try {
    const setting = await getRetentionSetting();
    if (setting.lastPurgedAt && Date.now() - setting.lastPurgedAt.getTime() < PURGE_INTERVAL_MS) return;
    await purgeExpiredResults();
    await db.resultsRetentionSetting.upsert({
      where: { id: SETTING_ID },
      update: { lastPurgedAt: new Date() },
      create: { id: SETTING_ID, mode: DEFAULT_MODE, value: DEFAULT_VALUE, lastPurgedAt: new Date() },
    });
  } catch (err) {
    console.error("maybePurgeExpiredResults failed", err);
  }
}

/** Human-readable summary of the current policy, for the parent- and
 * admin-facing settings copy. */
export function describeRetentionSetting(setting: RetentionSetting): string {
  return setting.mode === "DAYS"
    ? `Results are kept for ${setting.value} day${setting.value === 1 ? "" : "s"} after being assigned, then removed.`
    : `The most recent ${setting.value} assignment${setting.value === 1 ? "" : "s"} per child are kept; older ones are removed.`;
}
