/**
 * Times tables speed drills — shared between the client (round generation,
 * live timing) and the server (grading/aggregation on submit). No
 * "server-only" here on purpose, unlike most of lib/: this module is
 * imported by a "use client" component as well as the API route.
 *
 * Deliberately curriculum-agnostic — a times table fact isn't tied to a
 * Topic/Subject/Curriculum the way ordinary practice questions are (see
 * prisma/schema.prisma's TimesTableSession for why).
 */

export const MIN_TABLE = 1;
export const MAX_TABLE = 12;
export const TABLES = Array.from({ length: MAX_TABLE - MIN_TABLE + 1 }, (_, i) => i + MIN_TABLE);

export const ROUND_LENGTHS = [30, 60, 120, 300] as const;
export type RoundSeconds = (typeof ROUND_LENGTHS)[number];

export const ROUND_LENGTH_LABEL: Record<RoundSeconds, string> = {
  30: "30 seconds",
  60: "1 minute",
  120: "2 minutes",
  300: "5 minutes",
};

export function isRoundSeconds(value: number): value is RoundSeconds {
  return (ROUND_LENGTHS as readonly number[]).includes(value);
}

/** A single `table x multiplier` fact and how the student did on it. */
export interface TimesTableAnswer {
  table: number; // which selected table this fact belongs to, e.g. 7 for "7 x 4"
  multiplier: number; // the other operand, 1-12
  correct: boolean;
  speedMs: number; // time from the fact appearing to the answer being submitted
}

export interface TableStat {
  answered: number;
  correct: number;
  /** Average time-to-answer for correct answers on this table only; null if none were correct. */
  avgCorrectSpeedMs: number | null;
}

export interface RoundSummary {
  questionsAnswered: number;
  correctCount: number;
  /** Average time-to-answer across every correct answer in the round; null if none were correct. */
  avgCorrectSpeedMs: number | null;
  tableStats: Record<number, TableStat>;
}

/** Recomputed server-side from the raw answer log on submit, rather than
 *  trusting client-supplied aggregates — same principle as grading in
 *  /api/attempts, just applied to a round summary instead of one question. */
export function summarizeAnswers(answers: TimesTableAnswer[]): RoundSummary {
  const perTable = new Map<number, { answered: number; correct: number; correctSpeedSum: number }>();
  let correctCount = 0;
  let correctSpeedSum = 0;

  for (const a of answers) {
    const entry = perTable.get(a.table) ?? { answered: 0, correct: 0, correctSpeedSum: 0 };
    entry.answered += 1;
    if (a.correct) {
      entry.correct += 1;
      entry.correctSpeedSum += a.speedMs;
      correctCount += 1;
      correctSpeedSum += a.speedMs;
    }
    perTable.set(a.table, entry);
  }

  const tableStats: Record<number, TableStat> = {};
  for (const [table, entry] of perTable) {
    tableStats[table] = {
      answered: entry.answered,
      correct: entry.correct,
      avgCorrectSpeedMs: entry.correct > 0 ? Math.round(entry.correctSpeedSum / entry.correct) : null,
    };
  }

  return {
    questionsAnswered: answers.length,
    correctCount,
    avgCorrectSpeedMs: correctCount > 0 ? Math.round(correctSpeedSum / correctCount) : null,
    tableStats,
  };
}

/** Picks a random fact from the selected tables. Avoids immediately
 *  repeating the previous fact (where more than one distinct fact is even
 *  possible) so a student drilling a single table isn't stuck seeing the
 *  same product twice in a row. */
export function randomFact(
  tables: number[],
  previous?: { table: number; multiplier: number } | null
): { table: number; multiplier: number } {
  const canAvoidRepeat = tables.length * (MAX_TABLE - MIN_TABLE + 1) > 1;
  let next: { table: number; multiplier: number };
  do {
    next = {
      table: tables[Math.floor(Math.random() * tables.length)],
      multiplier: Math.floor(Math.random() * (MAX_TABLE - MIN_TABLE + 1)) + MIN_TABLE,
    };
  } while (canAvoidRepeat && previous && next.table === previous.table && next.multiplier === previous.multiplier);
  return next;
}
