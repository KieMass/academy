/**
 * Shared ranking helper for the admin "Leaderboards" page
 * (src/app/admin/(protected)/leaderboards/page.tsx) — every leaderboard
 * there (downloaders, active users, top children) buckets a flat list of
 * scored entries by country and sorts each bucket, so the logic is pulled
 * out once here rather than repeated three times.
 */

export interface RankedEntry {
  id: string;
  label: string;
  sublabel?: string;
  value: number;
}

export interface ScoredEntry extends RankedEntry {
  curriculumId: string;
}

/** Groups entries by curriculumId and sorts each group by value, descending. */
export function rankByCurriculum(entries: ScoredEntry[]): Map<string, RankedEntry[]> {
  const byCurriculum = new Map<string, RankedEntry[]>();
  for (const { curriculumId, ...entry } of entries) {
    const list = byCurriculum.get(curriculumId) ?? [];
    list.push(entry);
    byCurriculum.set(curriculumId, list);
  }
  for (const list of byCurriculum.values()) list.sort((a, b) => b.value - a.value);
  return byCurriculum;
}
