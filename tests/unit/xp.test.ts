import { describe, it, expect } from "vitest";
import { xpForCorrectAnswer, levelForXp, xpProgressWithinLevel } from "@/lib/gamification/xp";

describe("xpForCorrectAnswer", () => {
  it("awards more XP for harder difficulty bands", () => {
    const bronze = xpForCorrectAnswer("bronze");
    const silver = xpForCorrectAnswer("silver");
    const gold = xpForCorrectAnswer("gold");
    const challenge = xpForCorrectAnswer("challenge");
    expect(bronze).toBeLessThan(silver);
    expect(silver).toBeLessThan(gold);
    expect(gold).toBeLessThan(challenge);
  });
});

describe("levelForXp", () => {
  it("starts at level 1 with zero XP", () => {
    expect(levelForXp(0)).toBe(1);
  });

  it("advances to level 2 once 100 XP is reached (level N needs N*100)", () => {
    expect(levelForXp(99)).toBe(1);
    expect(levelForXp(100)).toBe(2);
  });

  it("advances to level 3 after a further 200 XP (cumulative 300)", () => {
    expect(levelForXp(299)).toBe(2);
    expect(levelForXp(300)).toBe(3);
  });

  it("keeps climbing correctly across several more level boundaries", () => {
    // Level N needs N*100, cumulative: L1=0, L2=100, L3=300, L4=600, L5=1000
    expect(levelForXp(599)).toBe(3);
    expect(levelForXp(600)).toBe(4);
    expect(levelForXp(999)).toBe(4);
    expect(levelForXp(1000)).toBe(5);
  });
});

describe("xpProgressWithinLevel", () => {
  it("reports level 1 with the full 100 XP needed when starting at zero", () => {
    expect(xpProgressWithinLevel(0)).toEqual({ level: 1, xpIntoLevel: 0, xpForLevel: 100 });
  });

  it("reports progress partway through a level", () => {
    expect(xpProgressWithinLevel(50)).toEqual({ level: 1, xpIntoLevel: 50, xpForLevel: 100 });
  });

  it("rolls over into the next level's progress exactly at a boundary", () => {
    // 100 XP exactly completes level 1 (needs 100) and starts level 2 (needs 200) at 0 into it.
    expect(xpProgressWithinLevel(100)).toEqual({ level: 2, xpIntoLevel: 0, xpForLevel: 200 });
  });

  it("agrees with levelForXp's level for the same xpTotal", () => {
    for (const xp of [0, 50, 99, 100, 250, 300, 599, 600, 1000]) {
      expect(xpProgressWithinLevel(xp).level).toBe(levelForXp(xp));
    }
  });

  it("xpIntoLevel is always less than xpForLevel (never shows a full/overflowing bar)", () => {
    for (const xp of [0, 1, 99, 100, 101, 599, 600, 1234]) {
      const { xpIntoLevel, xpForLevel } = xpProgressWithinLevel(xp);
      expect(xpIntoLevel).toBeLessThan(xpForLevel);
      expect(xpIntoLevel).toBeGreaterThanOrEqual(0);
    }
  });
});
