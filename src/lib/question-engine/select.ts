/**
 * Runtime question selection for a practice/assignment session — deliberately
 * separate from content-generators/rng.ts's seeded RNG, which exists for
 * *reproducible content generation* (same seed -> same question bank every
 * seed run). Here we want the opposite: genuine per-request randomness, so
 * `GET /api/questions` doesn't hand back the exact same set (and order)
 * every time, which let students just memorise a level instead of learning
 * it — see prisma/schema.prisma's QuestionAttempt for how "recently seen" is
 * derived.
 */
function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Picks up to `limit` ids from `allIds`, biased toward ones not in
 * `recentlySeenIds` — so a retry pulls in fresh questions from the pool
 * instead of the same set, as long as the pool has enough unseen ones to
 * cover `limit`. Falls back to (shuffled) recently-seen ids only to fill any
 * remaining slots. Always shuffled, even in the all-seen fallback case, so
 * at minimum the order varies.
 */
export function pickRandomQuestionIds(allIds: readonly string[], limit: number, recentlySeenIds: ReadonlySet<string>): string[] {
  const unseen = shuffle(allIds.filter((id) => !recentlySeenIds.has(id)));
  const seen = shuffle(allIds.filter((id) => recentlySeenIds.has(id)));
  return [...unseen, ...seen].slice(0, limit);
}
