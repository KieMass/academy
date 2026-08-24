import { describe, it, expect } from "vitest";
import { pickRandomQuestionIds } from "@/lib/question-engine/select";

function ids(n: number, prefix = "q"): string[] {
  return Array.from({ length: n }, (_, i) => `${prefix}${i}`);
}

describe("pickRandomQuestionIds", () => {
  it("returns exactly `limit` ids when the pool is large enough", () => {
    const result = pickRandomQuestionIds(ids(20), 8, new Set());
    expect(result).toHaveLength(8);
  });

  it("returns the whole pool (no fewer, no duplicates) when the pool is smaller than the limit", () => {
    const pool = ids(5);
    const result = pickRandomQuestionIds(pool, 8, new Set());
    expect(result).toHaveLength(5);
    expect(new Set(result)).toEqual(new Set(pool));
  });

  it("never duplicates an id", () => {
    const result = pickRandomQuestionIds(ids(30), 10, new Set(ids(15)));
    expect(new Set(result).size).toBe(result.length);
  });

  it("prioritises unseen ids over recently-seen ones when there are enough unseen", () => {
    const unseen = ids(10, "unseen");
    const seen = ids(10, "seen");
    const result = pickRandomQuestionIds([...unseen, ...seen], 8, new Set(seen));
    // 8 unseen ids exist, so all 8 picks should come from the unseen set.
    expect(result.every((id) => id.startsWith("unseen"))).toBe(true);
  });

  it("falls back to recently-seen ids only to fill remaining slots when unseen is too small", () => {
    const unseen = ids(3, "unseen");
    const seen = ids(10, "seen");
    const result = pickRandomQuestionIds([...unseen, ...seen], 8, new Set(seen));
    expect(result).toHaveLength(8);
    // All 3 unseen ids must be included...
    for (const id of unseen) expect(result).toContain(id);
    // ...and the remaining 5 slots are backfilled from the seen pool.
    expect(result.filter((id) => id.startsWith("seen"))).toHaveLength(5);
  });

  it("shuffles order across repeated calls (not the same order every time)", () => {
    const pool = ids(30);
    const runs = Array.from({ length: 5 }, () => pickRandomQuestionIds(pool, 30, new Set()).join(","));
    expect(new Set(runs).size).toBeGreaterThan(1);
  });
});
