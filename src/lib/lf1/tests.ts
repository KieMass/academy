import { pickRandomQuestionIds } from "@/lib/question-engine/select";
import { LF1_SYLLABUS, getLf1Question, lf1QuestionsForOutcome, type Lf1Syllabus } from "./bank";

/** Practice set sizes offered in the UI (and accepted by the API). */
export const LF1_PRACTICE_SIZES = [5, 10, 20] as const;

export const LF1_MOCK_TIME_LIMIT_SECONDS = LF1_SYLLABUS.exam.durationMinutes * 60;

/** Answers posted this long after the mock deadline are still accepted, to
 * cover network latency on the auto-submit when the clock hits zero. */
export const LF1_MOCK_GRACE_SECONDS = 60;

/** A study target for the dashboard — this app's own benchmark, NOT an
 * official CII pass mark (the CII doesn't publish a fixed one). */
export const LF1_READINESS_TARGET_PCT = 70;

/**
 * Picks a practice set for one learning outcome (or all of them, for a mixed
 * quiz), preferring questions the learner hasn't answered before — the same
 * "fresh questions first" rule as KaeLex's student practice
 * (lib/question-engine/select.ts).
 */
export function buildPracticeSet(outcome: number | null, count: number, answeredIds: ReadonlySet<string>): string[] {
  const pool = lf1QuestionsForOutcome(outcome).map((q) => q.id);
  return pickRandomQuestionIds(pool, count, answeredIds);
}

/**
 * Builds a mock paper weighted exactly like the real exam: each learning
 * outcome contributes its syllabus `examQuestions` count (5, 3, 7, 7, 7, 3,
 * 4, 8, 6 = 50). Within each outcome, unseen questions are preferred; the
 * final paper is shuffled so outcomes are interleaved, as in the real exam.
 */
export function buildMockPaper(answeredIds: ReadonlySet<string>, syllabus: Lf1Syllabus = LF1_SYLLABUS): string[] {
  const ids = syllabus.outcomes.flatMap((o) => buildPracticeSet(o.number, o.examQuestions, answeredIds));
  return pickRandomQuestionIds(ids, ids.length, new Set());
}

export interface Lf1GradedAnswer {
  questionId: string;
  outcome: number;
  selectedIndex: number | null;
  isCorrect: boolean;
}

export interface Lf1OutcomeScore {
  outcome: number;
  total: number;
  correct: number;
}

/** Marks a set of answers against the bank. Question ids no longer in the
 * bank (removed after the test was created) are skipped rather than counted
 * wrong. Unanswered questions count as incorrect, as in the real exam. */
export function gradeLf1Answers(questionIds: readonly string[], answers: Readonly<Record<string, number>>) {
  const graded: Lf1GradedAnswer[] = [];
  for (const id of questionIds) {
    const q = getLf1Question(id);
    if (!q) continue;
    const raw = answers[id];
    const selectedIndex = Number.isInteger(raw) && raw >= 0 && raw < q.options.length ? raw : null;
    graded.push({ questionId: id, outcome: q.outcome, selectedIndex, isCorrect: selectedIndex === q.answer });
  }
  return { graded, correctCount: graded.filter((g) => g.isCorrect).length, byOutcome: scoreByOutcome(graded) };
}

export function scoreByOutcome(graded: readonly Pick<Lf1GradedAnswer, "outcome" | "isCorrect">[]): Lf1OutcomeScore[] {
  const map = new Map<number, Lf1OutcomeScore>();
  for (const g of graded) {
    const entry = map.get(g.outcome) ?? { outcome: g.outcome, total: 0, correct: 0 };
    entry.total += 1;
    if (g.isCorrect) entry.correct += 1;
    map.set(g.outcome, entry);
  }
  return [...map.values()].sort((a, b) => a.outcome - b.outcome);
}

export function pct(correct: number, total: number): number {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

/** Parses Lf1TestSession.answers defensively — it's a JSON string column. */
export function parseLf1Answers(raw: string): Record<string, number> {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter((e): e is [string, number] => Number.isInteger(e[1])));
  } catch {
    return {};
  }
}

export function parseLf1QuestionIds(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

/** Mock deadline (ms since epoch), or null for untimed practice. */
export function lf1Deadline(session: { startedAt: Date; timeLimitSeconds: number | null }): number | null {
  return session.timeLimitSeconds ? session.startedAt.getTime() + session.timeLimitSeconds * 1000 : null;
}
