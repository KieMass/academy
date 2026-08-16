import { describe, it, expect } from "vitest";
import { toStorageFields, fromContentQuestion, toPrismaEnums } from "@/lib/question-engine/mapper";
import type { MultipleChoiceQuestion } from "@/lib/question-engine/types";
import type { ContentQuestion } from "@prisma/client";

describe("question-engine mapper round-trip", () => {
  it("survives a full serialise -> deserialise cycle for multiple_choice", () => {
    const question: Omit<MultipleChoiceQuestion, "id" | "topicId"> = {
      type: "multiple_choice",
      objectiveCode: "MA5-FRAC-1",
      difficulty: "silver",
      promptText: "Which is bigger?",
      explanation: "Compare numerators.",
      options: [
        { id: "a", text: "1/2" },
        { id: "b", text: "1/4" },
      ],
      correctOptionId: "a",
    };

    const { prompt, options, answer } = toStorageFields(question);
    const { type, difficulty } = toPrismaEnums(question.type, question.difficulty);

    const fakeRow: ContentQuestion = {
      id: "q1",
      topicId: "t1",
      objectiveCode: question.objectiveCode,
      type,
      difficulty,
      prompt,
      options,
      answer,
      explanation: question.explanation ?? null,
      tags: "[]",
      passageId: null,
      subSkill: null,
      source: "SEED",
      status: "PUBLISHED",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const roundTripped = fromContentQuestion(fakeRow);
    expect(roundTripped.type).toBe("multiple_choice");
    if (roundTripped.type === "multiple_choice") {
      expect(roundTripped.options).toEqual(question.options);
      expect(roundTripped.correctOptionId).toBe("a");
    }
    expect(roundTripped.promptText).toBe(question.promptText);
    expect(roundTripped.difficulty).toBe("silver");
  });
});
