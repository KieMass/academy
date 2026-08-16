import { describe, it, expect } from "vitest";
import { xpForCorrectAnswer, levelForXp } from "@/lib/gamification/xp";

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
});
