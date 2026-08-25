import { describe, it, expect } from "vitest";
import { revealAnswer } from "@/lib/question-engine/reveal";
import type {
  MultipleChoiceQuestion,
  FillInBoxQuestion,
  MultiStepQuestion,
  DragDropQuestion,
  MatchingQuestion,
  ShortAnswerQuestion,
} from "@/lib/question-engine/types";

const base = {
  id: "q1",
  topicId: "t1",
  objectiveCode: "MA5-TEST-1",
  difficulty: "bronze" as const,
  promptText: "Test question",
};

describe("revealAnswer", () => {
  it("returns the text of the correct option for multiple_choice", () => {
    const question: MultipleChoiceQuestion = {
      ...base,
      type: "multiple_choice",
      options: [
        { id: "a", text: "12" },
        { id: "b", text: "14" },
      ],
      correctOptionId: "b",
    };
    expect(revealAnswer(question)).toBe("14");
  });

  it("falls back to an empty string if correctOptionId doesn't match any option", () => {
    const question: MultipleChoiceQuestion = {
      ...base,
      type: "multiple_choice",
      options: [{ id: "a", text: "12" }],
      correctOptionId: "missing",
    };
    expect(revealAnswer(question)).toBe("");
  });

  it("joins every blank's first accepted answer for fill_in_box", () => {
    const question: FillInBoxQuestion = {
      ...base,
      type: "fill_in_box",
      blanks: [
        { id: "b1", acceptedAnswers: ["4", "four"] },
        { id: "b2", acceptedAnswers: ["9"] },
      ],
    };
    expect(revealAnswer(question)).toBe("4, 9");
  });

  it("numbers each step's first accepted answer for multi_step", () => {
    const question: MultiStepQuestion = {
      ...base,
      type: "multi_step",
      steps: [
        { id: "s1", prompt: "First", acceptedAnswers: ["33"] },
        { id: "s2", prompt: "Second", acceptedAnswers: ["11"] },
      ],
    };
    expect(revealAnswer(question)).toBe("1. 33  2. 11");
  });

  it("describes each item -> target mapping by label for drag_drop", () => {
    const question: DragDropQuestion = {
      ...base,
      type: "drag_drop",
      items: [{ id: "i1", label: "40°" }, { id: "i2", label: "150°" }],
      targets: [{ id: "t1", label: "Acute" }, { id: "t2", label: "Obtuse" }],
      correctMapping: { i1: "t1", i2: "t2" },
    };
    expect(revealAnswer(question)).toBe("40° → Acute; 150° → Obtuse");
  });

  it("falls back to the raw id if an item or target label is missing for drag_drop", () => {
    const question: DragDropQuestion = {
      ...base,
      type: "drag_drop",
      items: [],
      targets: [],
      correctMapping: { i1: "t1" },
    };
    expect(revealAnswer(question)).toBe("i1 → t1");
  });

  it("describes each left -> right pair for matching", () => {
    const question: MatchingQuestion = {
      ...base,
      type: "matching",
      pairs: [
        { id: "p1", left: "Cube", right: "6 faces" },
        { id: "p2", left: "Pyramid", right: "5 faces" },
      ],
    };
    expect(revealAnswer(question)).toBe("Cube → 6 faces; Pyramid → 5 faces");
  });

  it("returns the first accepted answer for short_answer", () => {
    const question: ShortAnswerQuestion = {
      ...base,
      type: "short_answer",
      acceptedAnswers: ["Paris", "paris"],
    };
    expect(revealAnswer(question)).toBe("Paris");
  });
});
