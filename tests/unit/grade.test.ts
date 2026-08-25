import { describe, it, expect } from "vitest";
import { gradeResponse } from "@/lib/question-engine/grade";
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

describe("gradeResponse — multiple_choice", () => {
  const question: MultipleChoiceQuestion = {
    ...base,
    type: "multiple_choice",
    options: [
      { id: "a", text: "12" },
      { id: "b", text: "14" },
    ],
    correctOptionId: "a",
  };

  it("marks the correct option as correct", () => {
    expect(gradeResponse(question, { type: "multiple_choice", optionId: "a" }).correct).toBe(true);
  });

  it("marks any other option as incorrect", () => {
    expect(gradeResponse(question, { type: "multiple_choice", optionId: "b" }).correct).toBe(false);
  });
});

describe("gradeResponse — short_answer", () => {
  const question: ShortAnswerQuestion = {
    ...base,
    type: "short_answer",
    acceptedAnswers: ["Paris", "paris"],
  };

  it("is case-insensitive and trims whitespace by default", () => {
    expect(gradeResponse(question, { type: "short_answer", value: "  PARIS  " }).correct).toBe(true);
  });

  it("rejects a wrong answer", () => {
    expect(gradeResponse(question, { type: "short_answer", value: "London" }).correct).toBe(false);
  });

  it("respects caseSensitive: true", () => {
    const caseSensitive: ShortAnswerQuestion = { ...question, acceptedAnswers: ["Paris"], caseSensitive: true };
    expect(gradeResponse(caseSensitive, { type: "short_answer", value: "paris" }).correct).toBe(false);
    expect(gradeResponse(caseSensitive, { type: "short_answer", value: "Paris" }).correct).toBe(true);
  });
});

describe("gradeResponse — thousands-separator commas", () => {
  it("accepts a comma-formatted answer against a plain-digit accepted answer", () => {
    const question: FillInBoxQuestion = { ...base, type: "fill_in_box", blanks: [{ id: "answer", acceptedAnswers: ["5541"] }] };
    expect(gradeResponse(question, { type: "fill_in_box", values: { answer: "5,541" } }).correct).toBe(true);
  });

  it("accepts a plain-digit answer against a comma-formatted accepted answer (symmetric)", () => {
    const question: ShortAnswerQuestion = { ...base, type: "short_answer", acceptedAnswers: ["5,541"] };
    expect(gradeResponse(question, { type: "short_answer", value: "5541" }).correct).toBe(true);
  });

  it("handles multiple comma groups (millions)", () => {
    const question: ShortAnswerQuestion = { ...base, type: "short_answer", acceptedAnswers: ["1234567"] };
    expect(gradeResponse(question, { type: "short_answer", value: "1,234,567" }).correct).toBe(true);
  });

  it("strips a thousands comma immediately followed by a unit", () => {
    const question: ShortAnswerQuestion = { ...base, type: "short_answer", acceptedAnswers: ["30000cm3"] };
    expect(gradeResponse(question, { type: "short_answer", value: "30,000cm3" }).correct).toBe(true);
  });

  it("does not touch a comma in a coordinate pair like '6,2' (only 1 digit follows, not a thousands group)", () => {
    const question: ShortAnswerQuestion = { ...base, type: "short_answer", acceptedAnswers: ["6,2"] };
    expect(gradeResponse(question, { type: "short_answer", value: "6,2" }).correct).toBe(true);
    expect(gradeResponse(question, { type: "short_answer", value: "62" }).correct).toBe(false);
  });

  it("does not touch a comma in ordinary prose", () => {
    const question: ShortAnswerQuestion = { ...base, type: "short_answer", acceptedAnswers: ["yesterday, i walked to school"] };
    expect(gradeResponse(question, { type: "short_answer", value: "yesterday i walked to school" }).correct).toBe(false);
  });
});

describe("gradeResponse — fill_in_box (partial credit tracking)", () => {
  const question: FillInBoxQuestion = {
    ...base,
    type: "fill_in_box",
    blanks: [
      { id: "b1", acceptedAnswers: ["4"] },
      { id: "b2", acceptedAnswers: ["9"] },
    ],
  };

  it("is only fully correct when every blank matches", () => {
    const result = gradeResponse(question, { type: "fill_in_box", values: { b1: "4", b2: "9" } });
    expect(result).toEqual({ correct: true, partial: { total: 2, correct: 2 } });
  });

  it("reports partial credit when one blank is wrong", () => {
    const result = gradeResponse(question, { type: "fill_in_box", values: { b1: "4", b2: "wrong" } });
    expect(result).toEqual({ correct: false, partial: { total: 2, correct: 1 } });
  });
});

describe("gradeResponse — multi_step", () => {
  const question: MultiStepQuestion = {
    ...base,
    type: "multi_step",
    steps: [
      { id: "s1", prompt: "First", acceptedAnswers: ["33"] },
      { id: "s2", prompt: "Second", acceptedAnswers: ["11"] },
    ],
  };

  it("requires every step correct to be fully correct", () => {
    expect(gradeResponse(question, { type: "multi_step", values: { s1: "33", s2: "11" } }).correct).toBe(true);
    expect(gradeResponse(question, { type: "multi_step", values: { s1: "33", s2: "12" } }).correct).toBe(false);
  });
});

describe("gradeResponse — drag_drop", () => {
  const question: DragDropQuestion = {
    ...base,
    type: "drag_drop",
    items: [{ id: "i1", label: "40°" }, { id: "i2", label: "150°" }],
    targets: [{ id: "t1", label: "Acute" }, { id: "t2", label: "Obtuse" }],
    correctMapping: { i1: "t1", i2: "t2" },
  };

  it("is correct only when every item maps to its correct target", () => {
    expect(gradeResponse(question, { type: "drag_drop", mapping: { i1: "t1", i2: "t2" } }).correct).toBe(true);
    expect(gradeResponse(question, { type: "drag_drop", mapping: { i1: "t2", i2: "t2" } }).correct).toBe(false);
  });
});

describe("gradeResponse — matching", () => {
  const question: MatchingQuestion = {
    ...base,
    type: "matching",
    pairs: [
      { id: "p1", left: "Cube", right: "6 faces" },
      { id: "p2", left: "Pyramid", right: "5 faces" },
    ],
  };

  it("requires each pair to map to its own id", () => {
    expect(gradeResponse(question, { type: "matching", pairs: { p1: "p1", p2: "p2" } }).correct).toBe(true);
    expect(gradeResponse(question, { type: "matching", pairs: { p1: "p2", p2: "p1" } }).correct).toBe(false);
  });
});

describe("gradeResponse — type mismatch guard", () => {
  it("throws if the response type doesn't match the question type", () => {
    const question: ShortAnswerQuestion = { ...base, type: "short_answer", acceptedAnswers: ["4"] };
    expect(() => gradeResponse(question, { type: "multiple_choice", optionId: "a" })).toThrow();
  });
});
