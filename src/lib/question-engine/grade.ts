import type { AnyQuestion, QuestionResponse } from "./types";

export interface GradeResult {
  correct: boolean;
  /** Per-part breakdown for multi-part question types (multi_step, drag_drop, matching, fill_in_box). */
  partial?: { total: number; correct: number };
}

/** Strips thousands-separator commas (5,541 -> 5541; 1,234,567 -> 1234567)
 * so a student who was taught to format large numbers that way isn't
 * marked wrong on formatting alone. Deliberately requires exactly three
 * digits after the comma, not just "a digit" — some accepted answers are
 * coordinate pairs like "(6,2)" or "6,2" where the comma isn't a
 * thousands separator at all, and those must survive untouched. Applied
 * repeatedly (non-global regex in a loop) so multi-comma numbers like
 * "1,234,567" fully resolve: each pass strips one comma, since the digits
 * freed up by a strip can themselves complete the next group. */
function stripThousandsSeparators(value: string): string {
  let result = value;
  let next = result.replace(/(\d),(\d{3})(?!\d)/, "$1$2");
  while (next !== result) {
    result = next;
    next = result.replace(/(\d),(\d{3})(?!\d)/, "$1$2");
  }
  return result;
}

function normalise(value: string): string {
  return stripThousandsSeparators(value.trim().toLowerCase().replace(/\s+/g, " "));
}

function answerMatches(given: string, accepted: string[], caseSensitive = false): boolean {
  const target = caseSensitive ? stripThousandsSeparators(given.trim()) : normalise(given);
  return accepted.some((a) => (caseSensitive ? stripThousandsSeparators(a.trim()) : normalise(a)) === target);
}

/**
 * The single source of truth for "is this response correct?" — always run
 * server-side (see /api/attempts) against the full question record, never
 * trusting a client-computed result. Deterministic and side-effect free so
 * it is trivially unit-testable.
 */
export function gradeResponse(question: AnyQuestion, response: QuestionResponse): GradeResult {
  if (question.type !== response.type) {
    throw new Error(`Response type ${response.type} does not match question type ${question.type}`);
  }

  switch (question.type) {
    case "multiple_choice": {
      const r = response as Extract<QuestionResponse, { type: "multiple_choice" }>;
      return { correct: r.optionId === question.correctOptionId };
    }

    case "short_answer": {
      const r = response as Extract<QuestionResponse, { type: "short_answer" }>;
      return { correct: answerMatches(r.value, question.acceptedAnswers, question.caseSensitive) };
    }

    case "fill_in_box": {
      const r = response as Extract<QuestionResponse, { type: "fill_in_box" }>;
      const total = question.blanks.length;
      let correct = 0;
      for (const blank of question.blanks) {
        if (answerMatches(r.values[blank.id] ?? "", blank.acceptedAnswers)) correct += 1;
      }
      return { correct: correct === total, partial: { total, correct } };
    }

    case "multi_step": {
      const r = response as Extract<QuestionResponse, { type: "multi_step" }>;
      const total = question.steps.length;
      let correct = 0;
      for (const step of question.steps) {
        if (answerMatches(r.values[step.id] ?? "", step.acceptedAnswers)) correct += 1;
      }
      return { correct: correct === total, partial: { total, correct } };
    }

    case "drag_drop": {
      const r = response as Extract<QuestionResponse, { type: "drag_drop" }>;
      const entries = Object.entries(question.correctMapping);
      const total = entries.length;
      const correct = entries.filter(([itemId, targetId]) => r.mapping[itemId] === targetId).length;
      return { correct: correct === total, partial: { total, correct } };
    }

    case "matching": {
      const r = response as Extract<QuestionResponse, { type: "matching" }>;
      const total = question.pairs.length;
      const correct = question.pairs.filter((pair) => r.pairs[pair.id] === pair.id).length;
      return { correct: correct === total, partial: { total, correct } };
    }
  }
}
