import { describe, it, expect } from "vitest";
import { rankByCurriculum, type ScoredEntry } from "@/lib/leaderboards";

function entry(overrides: Partial<ScoredEntry> = {}): ScoredEntry {
  return { curriculumId: "cayman", id: "e1", label: "Someone", value: 1, ...overrides };
}

describe("rankByCurriculum", () => {
  it("buckets entries by curriculumId", () => {
    const result = rankByCurriculum([
      entry({ curriculumId: "cayman", id: "a", value: 3 }),
      entry({ curriculumId: "guyana", id: "b", value: 5 }),
    ]);
    expect([...result.keys()].sort()).toEqual(["cayman", "guyana"]);
    expect(result.get("cayman")).toHaveLength(1);
    expect(result.get("guyana")).toHaveLength(1);
  });

  it("sorts each country's bucket by value, descending", () => {
    const result = rankByCurriculum([
      entry({ id: "low", value: 2 }),
      entry({ id: "high", value: 9 }),
      entry({ id: "mid", value: 5 }),
    ]);
    expect(result.get("cayman")!.map((r) => r.id)).toEqual(["high", "mid", "low"]);
  });

  it("keeps countries independent — a low score in one country isn't outranked by a high score in another", () => {
    const result = rankByCurriculum([
      entry({ curriculumId: "cayman", id: "cayman-1", value: 1 }),
      entry({ curriculumId: "guyana", id: "guyana-1", value: 100 }),
    ]);
    expect(result.get("cayman")!.map((r) => r.id)).toEqual(["cayman-1"]);
  });

  it("drops curriculumId from the ranked output but keeps label/sublabel/value", () => {
    const result = rankByCurriculum([entry({ label: "Jane Doe", sublabel: "Level 3", value: 42 })]);
    expect(result.get("cayman")![0]).toEqual({ id: "e1", label: "Jane Doe", sublabel: "Level 3", value: 42 });
  });

  it("returns an empty map for no entries", () => {
    expect(rankByCurriculum([]).size).toBe(0);
  });
});
