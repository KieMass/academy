import { describe, it, expect } from "vitest";
import { toStorageFields, fromContentQuestion, toPrismaEnums } from "@/lib/question-engine/mapper";
import type { AnyQuestion, DistributiveOmit } from "@/lib/question-engine/types";
import type { ContentQuestion } from "@prisma/client";

/** Round-trips a question through toStorageFields -> (fake DB row) ->
 * fromContentQuestion, mirroring exactly what happens between seeding a
 * question and serving it back to a student. Returns the reconstructed
 * question so each test can assert on the fields specific to its type. */
function roundTrip(question: DistributiveOmit<AnyQuestion, "id" | "topicId">): AnyQuestion {
  const { prompt, options, answer } = toStorageFields(question);
  const { type, difficulty } = toPrismaEnums(question.type, question.difficulty);

  const row: ContentQuestion = {
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

  return fromContentQuestion(row);
}

describe("question-engine mapper round-trip", () => {
  it("survives a full serialise -> deserialise cycle for multiple_choice", () => {
    const result = roundTrip({
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
    });

    expect(result.type).toBe("multiple_choice");
    if (result.type === "multiple_choice") {
      expect(result.options).toEqual([{ id: "a", text: "1/2" }, { id: "b", text: "1/4" }]);
      expect(result.correctOptionId).toBe("a");
    }
    expect(result.promptText).toBe("Which is bigger?");
    expect(result.difficulty).toBe("silver");
  });

  it("survives a full serialise -> deserialise cycle for fill_in_box", () => {
    const result = roundTrip({
      type: "fill_in_box",
      objectiveCode: "MA5-NPV-1",
      difficulty: "bronze",
      promptText: "12 + 9 = ?",
      blanks: [{ id: "answer", label: "sum", acceptedAnswers: ["21"] }],
    });

    expect(result.type).toBe("fill_in_box");
    if (result.type === "fill_in_box") {
      expect(result.blanks).toEqual([{ id: "answer", label: "sum", acceptedAnswers: ["21"] }]);
    }
  });

  it("survives a full serialise -> deserialise cycle for multi_step", () => {
    const result = roundTrip({
      type: "multi_step",
      objectiveCode: "MA5-WP-1",
      difficulty: "gold",
      promptText: "Work out the total cost.",
      steps: [
        { id: "s1", prompt: "Cost per item", acceptedAnswers: ["3"] },
        { id: "s2", prompt: "Total for 4 items", acceptedAnswers: ["12"] },
      ],
    });

    expect(result.type).toBe("multi_step");
    if (result.type === "multi_step") {
      expect(result.steps).toHaveLength(2);
      expect(result.steps[1]).toEqual({ id: "s2", prompt: "Total for 4 items", acceptedAnswers: ["12"] });
    }
  });

  it("survives a full serialise -> deserialise cycle for drag_drop", () => {
    const result = roundTrip({
      type: "drag_drop",
      objectiveCode: "MA5-GEO-2",
      difficulty: "silver",
      promptText: "Sort each angle.",
      items: [{ id: "i1", label: "40°" }, { id: "i2", label: "150°" }],
      targets: [{ id: "t1", label: "Acute" }, { id: "t2", label: "Obtuse" }],
      correctMapping: { i1: "t1", i2: "t2" },
    });

    expect(result.type).toBe("drag_drop");
    if (result.type === "drag_drop") {
      expect(result.items).toEqual([{ id: "i1", label: "40°" }, { id: "i2", label: "150°" }]);
      expect(result.targets).toEqual([{ id: "t1", label: "Acute" }, { id: "t2", label: "Obtuse" }]);
      expect(result.correctMapping).toEqual({ i1: "t1", i2: "t2" });
    }
  });

  it("survives a full serialise -> deserialise cycle for matching", () => {
    const result = roundTrip({
      type: "matching",
      objectiveCode: "MA6-GEO-1",
      difficulty: "gold",
      promptText: "Match each solid to its face count.",
      pairs: [
        { id: "p1", left: "Cube", right: "6 faces" },
        { id: "p2", left: "Pyramid", right: "5 faces" },
      ],
    });

    expect(result.type).toBe("matching");
    if (result.type === "matching") {
      expect(result.pairs).toHaveLength(2);
      expect(result.pairs[0]).toEqual({ id: "p1", left: "Cube", right: "6 faces" });
    }
  });

  it("survives a full serialise -> deserialise cycle for short_answer, including caseSensitive", () => {
    const result = roundTrip({
      type: "short_answer",
      objectiveCode: "RE5-VOC-1",
      difficulty: "bronze",
      promptText: "What is the capital of France?",
      acceptedAnswers: ["Paris"],
      caseSensitive: true,
    });

    expect(result.type).toBe("short_answer");
    if (result.type === "short_answer") {
      expect(result.acceptedAnswers).toEqual(["Paris"]);
      expect(result.caseSensitive).toBe(true);
    }
  });

  it("preserves promptMedia when present", () => {
    const result = roundTrip({
      type: "short_answer",
      objectiveCode: "SC5-1",
      difficulty: "bronze",
      promptText: "Name this diagram.",
      promptMedia: "/images/plant-cell.png",
      acceptedAnswers: ["Plant cell"],
    });
    expect(result.promptMedia).toBe("/images/plant-cell.png");
  });

  it("maps every difficulty band correctly through the enum round-trip", () => {
    for (const difficulty of ["bronze", "silver", "gold", "challenge"] as const) {
      const result = roundTrip({
        type: "short_answer",
        objectiveCode: "TEST-1",
        difficulty,
        promptText: "Test",
        acceptedAnswers: ["x"],
      });
      expect(result.difficulty).toBe(difficulty);
    }
  });
});
