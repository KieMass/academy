import type { DifficultyBand } from "@/lib/curriculum/types";

/** XP awarded per correct answer, scaled by difficulty — the harder the
 * band, the more it's worth, which nudges students toward "reattempt weak
 * areas" rather than farming easy Bronze questions for points. */
const XP_BY_DIFFICULTY: Record<DifficultyBand, number> = {
  bronze: 5,
  silver: 8,
  gold: 12,
  challenge: 18,
};

export function xpForCorrectAnswer(difficulty: DifficultyBand): number {
  return XP_BY_DIFFICULTY[difficulty];
}

/** Simple level curve: level N requires N * 100 cumulative XP. */
export function levelForXp(xpTotal: number): number {
  let level = 1;
  while (xpTotal >= level * 100) {
    xpTotal -= level * 100;
    level++;
  }
  return level;
}

/** How far a student is into their current level, for progress-bar UI.
 * Mirrors the same N*100 curve as levelForXp, but keeps the remainder so
 * callers can render "120 / 300 XP to Level 4" style progress. */
export function xpProgressWithinLevel(xpTotal: number): { level: number; xpIntoLevel: number; xpForLevel: number } {
  let level = 1;
  let remaining = xpTotal;
  while (remaining >= level * 100) {
    remaining -= level * 100;
    level++;
  }
  return { level, xpIntoLevel: remaining, xpForLevel: level * 100 };
}
