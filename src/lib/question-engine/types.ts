import type { DifficultyBand, QuestionTypeSlug } from "@/lib/curriculum/types";

/**
 * The Question Engine's data contract. This is intentionally decoupled from
 * the Prisma model: `ContentQuestion.prompt/options/answer` are JSON strings
 * whose parsed shape is one of the variants below, discriminated by `type`.
 * Add a new question type by: (1) adding it to QUESTION_TYPES in
 * lib/curriculum/types.ts, (2) adding a variant here, (3) adding a grader in
 * grade.ts, (4) adding a renderer in components/question-engine.
 */

interface QuestionBase {
  id: string;
  topicId: string;
  objectiveCode: string;
  difficulty: DifficultyBand;
  promptText: string;
  promptMedia?: string;
  explanation?: string;
  subSkill?: string; // reading sub-skill: literal | inference | prediction | vocabulary | author-intent | summarising | retrieval
  passageId?: string;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: "multiple_choice";
  options: { id: string; text: string }[];
  correctOptionId: string;
}

export interface FillInBoxQuestion extends QuestionBase {
  type: "fill_in_box";
  blanks: { id: string; label?: string; acceptedAnswers: string[] }[];
}

export interface MultiStepQuestion extends QuestionBase {
  type: "multi_step";
  steps: { id: string; prompt: string; acceptedAnswers: string[] }[];
}

export interface DragDropQuestion extends QuestionBase {
  type: "drag_drop";
  items: { id: string; label: string }[];
  targets: { id: string; label: string }[];
  correctMapping: Record<string, string>; // itemId -> targetId
}

export interface MatchingQuestion extends QuestionBase {
  type: "matching";
  pairs: { id: string; left: string; right: string }[];
}

export interface ShortAnswerQuestion extends QuestionBase {
  type: "short_answer";
  acceptedAnswers: string[];
  caseSensitive?: boolean;
}

export type AnyQuestion =
  | MultipleChoiceQuestion
  | FillInBoxQuestion
  | MultiStepQuestion
  | DragDropQuestion
  | MatchingQuestion
  | ShortAnswerQuestion;

export type QuestionTypeOf<T extends QuestionTypeSlug> = Extract<AnyQuestion, { type: T }>;

/** Plain `Omit<Union, K>` collapses to only the properties shared across
 * every member (TS resolves `keyof` on a union as an intersection), which
 * silently strips variant-specific fields like `options` or `blanks`. This
 * distributes the Omit over each union member first. */
export type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;

/** What the client submits for grading — mirrors the question's answer shape. */
export type QuestionResponse =
  | { type: "multiple_choice"; optionId: string }
  | { type: "fill_in_box"; values: Record<string, string> }
  | { type: "multi_step"; values: Record<string, string> }
  | { type: "drag_drop"; mapping: Record<string, string> }
  | { type: "matching"; pairs: Record<string, string> }
  | { type: "short_answer"; value: string };

/** Safe-to-send-to-client projection: strips every answer-bearing field. */
// `explanation` is answer-bearing (it routinely spells out the working, e.g.
// "8 dogs - 2 rabbits = 6 more") so every variant below omits it — it's only
// returned by /api/attempts, after grading, alongside the reveal.
export type PublicQuestion =
  | Omit<MultipleChoiceQuestion, "correctOptionId" | "explanation">
  | (Omit<FillInBoxQuestion, "blanks" | "explanation"> & { blanks: { id: string; label?: string }[] })
  | (Omit<MultiStepQuestion, "steps" | "explanation"> & { steps: { id: string; prompt: string }[] })
  | Omit<DragDropQuestion, "correctMapping" | "explanation">
  | (Omit<MatchingQuestion, "pairs" | "explanation"> & { pairs: { id: string; left: string; right: string }[] }) // right side shuffled client-side
  | Omit<ShortAnswerQuestion, "acceptedAnswers" | "caseSensitive" | "explanation">;

export function toPublicQuestion(q: AnyQuestion): PublicQuestion {
  switch (q.type) {
    case "multiple_choice": {
      const { correctOptionId: _correctOptionId, explanation: _explanation, ...rest } = q;
      return rest;
    }
    case "fill_in_box": {
      const { explanation: _explanation, ...rest } = q;
      return { ...rest, blanks: q.blanks.map(({ id, label }) => ({ id, label })) };
    }
    case "multi_step": {
      const { explanation: _explanation, ...rest } = q;
      return { ...rest, steps: q.steps.map(({ id, prompt }) => ({ id, prompt })) };
    }
    case "drag_drop": {
      const { correctMapping: _correctMapping, explanation: _explanation, ...rest } = q;
      return rest;
    }
    case "matching": {
      const { explanation: _explanation, ...rest } = q;
      return rest;
    }
    case "short_answer": {
      const { acceptedAnswers: _acceptedAnswers, caseSensitive: _caseSensitive, explanation: _explanation, ...rest } = q;
      return rest;
    }
  }
}
