import syllabusJson from "../../../content/lf1/syllabus.json";
import questionsJson from "../../../content/lf1/questions.json";

/**
 * CII LF1 (Life and pensions foundations) content — the syllabus and the
 * question bank both live in content/lf1/*.json, same "content is data"
 * principle as the rest of the app. Questions are referenced from the DB
 * (Lf1TestSession.questionIds, Lf1Answer.questionId) by their stable `id`,
 * so the bank can be edited or extended without a migration or re-seed —
 * just never reuse or renumber an existing id.
 */

export interface Lf1Objective {
  code: string; // "3.1"
  text: string;
}

export interface Lf1Outcome {
  number: number; // 1-9
  title: string;
  examQuestions: number; // weighting in the real 50-question exam
  objectives: Lf1Objective[];
}

export interface Lf1Syllabus {
  code: string;
  title: string;
  awardingBody: string;
  examinedFrom: string;
  examinedTo: string;
  taxYear: string;
  exam: { questionCount: number; durationMinutes: number; format: string };
  objective: string[];
  outcomes: Lf1Outcome[];
}

export interface Lf1Question {
  id: string;
  outcome: number;
  objective: string;
  question: string;
  options: string[];
  answer: number; // index into options
  explanation: string;
}

/** What the browser sees before a question is graded — never the answer. */
export type Lf1PublicQuestion = Omit<Lf1Question, "answer" | "explanation">;

export const LF1_SYLLABUS = syllabusJson as Lf1Syllabus;
export const LF1_QUESTIONS = questionsJson as Lf1Question[];

const QUESTIONS_BY_ID = new Map(LF1_QUESTIONS.map((q) => [q.id, q]));

export function getLf1Question(id: string): Lf1Question | undefined {
  return QUESTIONS_BY_ID.get(id);
}

export function getLf1Outcome(number: number): Lf1Outcome | undefined {
  return LF1_SYLLABUS.outcomes.find((o) => o.number === number);
}

export function lf1QuestionsForOutcome(outcome: number | null): Lf1Question[] {
  return outcome === null ? LF1_QUESTIONS : LF1_QUESTIONS.filter((q) => q.outcome === outcome);
}

export function toLf1PublicQuestion(q: Lf1Question): Lf1PublicQuestion {
  return { id: q.id, outcome: q.outcome, objective: q.objective, question: q.question, options: q.options };
}

/** Structural checks on the bank — run by the unit tests so a bad edit to
 * questions.json fails CI rather than surfacing mid-exam. Returns a list of
 * human-readable problems (empty = valid). */
export function validateLf1Bank(questions: readonly Lf1Question[], syllabus: Lf1Syllabus): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  const objectiveCodes = new Set(syllabus.outcomes.flatMap((o) => o.objectives.map((ob) => ob.code)));

  for (const q of questions) {
    if (seen.has(q.id)) errors.push(`${q.id}: duplicate id`);
    seen.add(q.id);
    if (!getOutcomeFrom(syllabus, q.outcome)) errors.push(`${q.id}: unknown outcome ${q.outcome}`);
    if (!objectiveCodes.has(q.objective)) errors.push(`${q.id}: unknown objective ${q.objective}`);
    if (!q.objective.startsWith(`${q.outcome}.`)) errors.push(`${q.id}: objective ${q.objective} is not under outcome ${q.outcome}`);
    if (q.options.length !== 4) errors.push(`${q.id}: expected 4 options, got ${q.options.length}`);
    if (new Set(q.options).size !== q.options.length) errors.push(`${q.id}: duplicate options`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) errors.push(`${q.id}: answer index out of range`);
    if (!q.question.trim() || !q.explanation.trim()) errors.push(`${q.id}: empty question or explanation`);
  }

  for (const o of syllabus.outcomes) {
    const available = questions.filter((q) => q.outcome === o.number).length;
    if (available < o.examQuestions) errors.push(`outcome ${o.number}: ${available} questions, mock paper needs ${o.examQuestions}`);
  }
  const blueprintTotal = syllabus.outcomes.reduce((sum, o) => sum + o.examQuestions, 0);
  if (blueprintTotal !== syllabus.exam.questionCount) errors.push(`outcome weightings sum to ${blueprintTotal}, exam has ${syllabus.exam.questionCount}`);

  return errors;
}

function getOutcomeFrom(syllabus: Lf1Syllabus, number: number) {
  return syllabus.outcomes.find((o) => o.number === number);
}
