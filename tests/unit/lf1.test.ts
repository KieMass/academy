import { describe, it, expect } from "vitest";
import { LF1_QUESTIONS, LF1_SYLLABUS, getLf1Question, validateLf1Bank } from "@/lib/lf1/bank";
import { buildMockPaper, buildPracticeSet, gradeLf1Answers, parseLf1Answers, parseLf1QuestionIds } from "@/lib/lf1/tests";

describe("LF1 question bank", () => {
  it("passes structural validation against the syllabus", () => {
    expect(validateLf1Bank(LF1_QUESTIONS, LF1_SYLLABUS)).toEqual([]);
  });

  it("matches the published exam blueprint (50 questions, 5/3/7/7/7/3/4/8/6)", () => {
    expect(LF1_SYLLABUS.exam).toMatchObject({ questionCount: 50, durationMinutes: 60 });
    expect(LF1_SYLLABUS.outcomes.map((o) => o.examQuestions)).toEqual([5, 3, 7, 7, 7, 3, 4, 8, 6]);
  });

  it("doesn't put the correct answer in the same position too often", () => {
    const counts = [0, 0, 0, 0];
    for (const q of LF1_QUESTIONS) counts[q.answer] += 1;
    for (const c of counts) expect(c / LF1_QUESTIONS.length).toBeLessThan(0.4);
  });

  it("flags broken questions", () => {
    const bad = { ...LF1_QUESTIONS[0], answer: 7, options: ["a", "a", "b", "c"] };
    const errors = validateLf1Bank([bad, bad], LF1_SYLLABUS);
    expect(errors.some((e) => e.includes("duplicate id"))).toBe(true);
    expect(errors.some((e) => e.includes("answer index out of range"))).toBe(true);
    expect(errors.some((e) => e.includes("duplicate options"))).toBe(true);
    expect(errors.some((e) => e.includes("mock paper needs"))).toBe(true);
  });
});

describe("buildMockPaper", () => {
  it("builds a 50-question paper weighted by learning outcome, with no repeats", () => {
    const paper = buildMockPaper(new Set());
    expect(paper).toHaveLength(50);
    expect(new Set(paper).size).toBe(50);
    for (const o of LF1_SYLLABUS.outcomes) {
      expect(paper.filter((id) => getLf1Question(id)!.outcome === o.number)).toHaveLength(o.examQuestions);
    }
  });

  it("prefers questions the learner hasn't answered yet", () => {
    const outcome3 = LF1_QUESTIONS.filter((q) => q.outcome === 3).map((q) => q.id);
    const seen = new Set(outcome3.slice(0, outcome3.length - 7)); // leaves exactly 7 unseen
    const paper = buildMockPaper(seen);
    const picked = paper.filter((id) => getLf1Question(id)!.outcome === 3);
    expect(picked.every((id) => !seen.has(id))).toBe(true);
  });
});

describe("buildPracticeSet", () => {
  it("draws only from the chosen outcome", () => {
    const set = buildPracticeSet(6, 5, new Set());
    expect(set).toHaveLength(5);
    expect(set.every((id) => getLf1Question(id)!.outcome === 6)).toBe(true);
  });

  it("returns what's available when the outcome has fewer questions than requested", () => {
    const available = LF1_QUESTIONS.filter((q) => q.outcome === 2).length;
    expect(buildPracticeSet(2, 20, new Set())).toHaveLength(available);
  });

  it("mixes outcomes when none is chosen", () => {
    const set = buildPracticeSet(null, 20, new Set());
    expect(new Set(set.map((id) => getLf1Question(id)!.outcome)).size).toBeGreaterThan(1);
  });
});

describe("gradeLf1Answers", () => {
  it("marks correct, wrong and unanswered questions and breaks the score down by outcome", () => {
    const [a, b, c] = LF1_QUESTIONS.filter((q) => q.outcome === 1);
    const d = LF1_QUESTIONS.find((q) => q.outcome === 9)!;
    const { graded, correctCount, byOutcome } = gradeLf1Answers([a.id, b.id, c.id, d.id, "removed-question"], {
      [a.id]: a.answer,
      [b.id]: (b.answer + 1) % 4,
      [d.id]: d.answer,
      // c unanswered
    });
    expect(graded).toHaveLength(4); // unknown id skipped
    expect(correctCount).toBe(2);
    expect(graded.find((g) => g.questionId === c.id)).toMatchObject({ selectedIndex: null, isCorrect: false });
    expect(byOutcome).toEqual([
      { outcome: 1, total: 3, correct: 1 },
      { outcome: 9, total: 1, correct: 1 },
    ]);
  });

  it("treats out-of-range selections as unanswered", () => {
    const q = LF1_QUESTIONS[0];
    const { graded } = gradeLf1Answers([q.id], { [q.id]: 9 });
    expect(graded[0]).toMatchObject({ selectedIndex: null, isCorrect: false });
  });
});

describe("JSON column parsing", () => {
  it("tolerates malformed values", () => {
    expect(parseLf1Answers("not json")).toEqual({});
    expect(parseLf1Answers('{"a":1,"b":"x"}')).toEqual({ a: 1 });
    expect(parseLf1QuestionIds('["a",2,"b"]')).toEqual(["a", "b"]);
    expect(parseLf1QuestionIds("{}")).toEqual([]);
  });
});
