import { describe, it, expect } from "vitest";
import { summarizeAnswers, randomFact, isRoundSeconds, MIN_TABLE, MAX_TABLE, type TimesTableAnswer } from "@/lib/times-tables/types";

function answer(overrides: Partial<TimesTableAnswer> = {}): TimesTableAnswer {
  return { table: 7, multiplier: 8, correct: true, speedMs: 1000, ...overrides };
}

describe("summarizeAnswers", () => {
  it("returns zeroed-out results for an empty round", () => {
    const summary = summarizeAnswers([]);
    expect(summary).toEqual({ questionsAnswered: 0, correctCount: 0, avgCorrectSpeedMs: null, tableStats: {} });
  });

  it("counts answered/correct and averages speed across correct answers only", () => {
    const summary = summarizeAnswers([
      answer({ correct: true, speedMs: 1000 }),
      answer({ correct: true, speedMs: 3000 }),
      answer({ correct: false, speedMs: 10_000 }), // a slow wrong guess must not drag the average down
    ]);
    expect(summary.questionsAnswered).toBe(3);
    expect(summary.correctCount).toBe(2);
    expect(summary.avgCorrectSpeedMs).toBe(2000);
  });

  it("is null when nothing was answered correctly", () => {
    const summary = summarizeAnswers([answer({ correct: false })]);
    expect(summary.avgCorrectSpeedMs).toBeNull();
  });

  it("breaks results down per table, independently of other tables", () => {
    const summary = summarizeAnswers([
      answer({ table: 6, correct: true, speedMs: 1000 }),
      answer({ table: 6, correct: false, speedMs: 5000 }),
      answer({ table: 9, correct: true, speedMs: 2000 }),
    ]);
    expect(summary.tableStats[6]).toEqual({ answered: 2, correct: 1, avgCorrectSpeedMs: 1000 });
    expect(summary.tableStats[9]).toEqual({ answered: 1, correct: 1, avgCorrectSpeedMs: 2000 });
  });

  it("gives a table with no correct answers a null avg speed, not zero", () => {
    const summary = summarizeAnswers([answer({ table: 4, correct: false })]);
    expect(summary.tableStats[4]).toEqual({ answered: 1, correct: 0, avgCorrectSpeedMs: null });
  });
});

describe("randomFact", () => {
  it("only draws the table from the given selection", () => {
    for (let i = 0; i < 50; i++) {
      const fact = randomFact([7]);
      expect(fact.table).toBe(7);
      expect(fact.multiplier).toBeGreaterThanOrEqual(MIN_TABLE);
      expect(fact.multiplier).toBeLessThanOrEqual(MAX_TABLE);
    }
  });

  it("never repeats the immediately previous fact when more than one fact is possible", () => {
    for (let i = 0; i < 50; i++) {
      const previous = { table: 7, multiplier: 8 };
      const next = randomFact([7], previous);
      expect(next).not.toEqual(previous);
    }
  });
});

describe("isRoundSeconds", () => {
  it("accepts the known preset lengths and rejects anything else", () => {
    expect(isRoundSeconds(60)).toBe(true);
    expect(isRoundSeconds(45)).toBe(false);
  });
});
