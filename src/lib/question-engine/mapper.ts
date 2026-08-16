import type { ContentQuestion, DifficultyBand as PrismaDifficulty, QuestionType as PrismaQuestionType } from "@prisma/client";
import type { AnyQuestion, DistributiveOmit } from "./types";

/**
 * Storage convention for `ContentQuestion.prompt/options/answer` (each a JSON
 * string in the DB):
 *   prompt  -> { text: string; media?: string }
 *   options -> multiple_choice: { options: {id,text}[] }
 *              drag_drop:       { items: {id,label}[]; targets: {id,label}[] }
 *              (null for other types)
 *   answer  -> multiple_choice: { correctOptionId }
 *              fill_in_box:     { blanks: {id,label?,acceptedAnswers}[] }
 *              multi_step:      { steps: {id,prompt,acceptedAnswers}[] }
 *              drag_drop:       { correctMapping: Record<string,string> }
 *              matching:        { pairs: {id,left,right}[] }
 *              short_answer:    { acceptedAnswers: string[]; caseSensitive?: boolean }
 */

const TYPE_MAP: Record<PrismaQuestionType, AnyQuestion["type"]> = {
  MULTIPLE_CHOICE: "multiple_choice",
  FILL_IN_BOX: "fill_in_box",
  MULTI_STEP: "multi_step",
  DRAG_DROP: "drag_drop",
  MATCHING: "matching",
  SHORT_ANSWER: "short_answer",
};

const DIFFICULTY_MAP: Record<PrismaDifficulty, AnyQuestion["difficulty"]> = {
  BRONZE: "bronze",
  SILVER: "silver",
  GOLD: "gold",
  CHALLENGE: "challenge",
};

export function fromContentQuestion(row: ContentQuestion): AnyQuestion {
  const prompt = JSON.parse(row.prompt) as { text: string; media?: string };
  const options = row.options ? JSON.parse(row.options) : null;
  const answer = JSON.parse(row.answer);
  const type = TYPE_MAP[row.type];

  const base = {
    id: row.id,
    topicId: row.topicId,
    objectiveCode: row.objectiveCode,
    difficulty: DIFFICULTY_MAP[row.difficulty],
    promptText: prompt.text,
    promptMedia: prompt.media,
    explanation: row.explanation ?? undefined,
    subSkill: row.subSkill ?? undefined,
    passageId: row.passageId ?? undefined,
  };

  switch (type) {
    case "multiple_choice":
      return { ...base, type, options: options.options, correctOptionId: answer.correctOptionId };
    case "fill_in_box":
      return { ...base, type, blanks: answer.blanks };
    case "multi_step":
      return { ...base, type, steps: answer.steps };
    case "drag_drop":
      return { ...base, type, items: options.items, targets: options.targets, correctMapping: answer.correctMapping };
    case "matching":
      return { ...base, type, pairs: answer.pairs };
    case "short_answer":
      return { ...base, type, acceptedAnswers: answer.acceptedAnswers, caseSensitive: answer.caseSensitive };
  }
}

export function toPrismaEnums(type: AnyQuestion["type"], difficulty: AnyQuestion["difficulty"]) {
  const typeEntry = Object.entries(TYPE_MAP).find(([, v]) => v === type)?.[0] as PrismaQuestionType;
  const difficultyEntry = Object.entries(DIFFICULTY_MAP).find(([, v]) => v === difficulty)?.[0] as PrismaDifficulty;
  return { type: typeEntry, difficulty: difficultyEntry };
}

/** Inverse of `fromContentQuestion` — serialises a question (minus id/topicId,
 * which the caller assigns) into the prompt/options/answer JSON columns. Used
 * by the seed script and by future AI/parent content authoring tools so
 * there is exactly one place that encodes the storage convention. */
export function toStorageFields(q: DistributiveOmit<AnyQuestion, "id" | "topicId">) {
  const prompt = JSON.stringify({ text: q.promptText, media: q.promptMedia });

  let options: string | null = null;
  let answer: string;

  switch (q.type) {
    case "multiple_choice":
      options = JSON.stringify({ options: q.options });
      answer = JSON.stringify({ correctOptionId: q.correctOptionId });
      break;
    case "fill_in_box":
      answer = JSON.stringify({ blanks: q.blanks });
      break;
    case "multi_step":
      answer = JSON.stringify({ steps: q.steps });
      break;
    case "drag_drop":
      options = JSON.stringify({ items: q.items, targets: q.targets });
      answer = JSON.stringify({ correctMapping: q.correctMapping });
      break;
    case "matching":
      answer = JSON.stringify({ pairs: q.pairs });
      break;
    case "short_answer":
      answer = JSON.stringify({ acceptedAnswers: q.acceptedAnswers, caseSensitive: q.caseSensitive });
      break;
  }

  return { prompt, options, answer };
}
