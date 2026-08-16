import type { AnyQuestion, QuestionResponse } from "./types";

export interface GradeResult {
  correct: boolean;
  /** Per-part breakdown for multi-part question types (multi_step, drag_drop, matching, fill_in_box). */
  partial?: { total: number; correct: number };
}

function normalise(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function answerMatches(given: string, accepted: string[], caseSensitive = false): boolean {
  const target = caseSensitive ? given.trim() : normalise(given);
  return accepted.some((a) => (caseSensitive ? a.trim() : normalise(a)) === target);
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
