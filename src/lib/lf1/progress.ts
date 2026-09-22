import "server-only";
import { db } from "@/lib/db";
import { LF1_SYLLABUS } from "./bank";
import { pct } from "./tests";

export interface Lf1OutcomeProgress {
  outcome: number;
  title: string;
  examQuestions: number;
  answered: number;
  correct: number;
  accuracyPct: number;
}

/** Per-learning-outcome accuracy across every graded LF1 answer (practice
 * and mock), in syllabus order — outcomes with no answers yet included. */
export async function getLf1OutcomeProgress(learnerId: string): Promise<Lf1OutcomeProgress[]> {
  const [answeredRows, correctRows] = await Promise.all([
    db.lf1Answer.groupBy({ by: ["outcome"], where: { learnerId }, _count: { _all: true } }),
    db.lf1Answer.groupBy({ by: ["outcome"], where: { learnerId, isCorrect: true }, _count: { _all: true } }),
  ]);
  const answered = new Map(answeredRows.map((r) => [r.outcome, r._count._all]));
  const correct = new Map(correctRows.map((r) => [r.outcome, r._count._all]));

  return LF1_SYLLABUS.outcomes.map((o) => {
    const a = answered.get(o.number) ?? 0;
    const c = correct.get(o.number) ?? 0;
    return { outcome: o.number, title: o.title, examQuestions: o.examQuestions, answered: a, correct: c, accuracyPct: pct(c, a) };
  });
}
