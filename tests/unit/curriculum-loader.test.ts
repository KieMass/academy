import { describe, it, expect } from "vitest";
import { loadCurriculumMaps, resolveTopics, getSubjectMap } from "@/lib/curriculum/loader";

describe("curriculum loader", () => {
  it("loads all 8 subject curriculum maps", () => {
    const maps = loadCurriculumMaps("cayman");
    const slugs = maps.map((m) => m.subjectSlug).sort();
    expect(slugs).toEqual(
      ["computing", "geography", "grammar", "history", "maths", "reading", "science", "spelling"].sort()
    );
  });

  it("resolves every strand into a Y5 topic", () => {
    const topics = resolveTopics("cayman", { yearGroup: "Y5" });
    expect(topics.length).toBeGreaterThan(0);
    expect(topics.every((t) => t.yearGroup === "Y5")).toBe(true);
  });

  it("scopes resolveTopics to a single subject when asked", () => {
    const mathsTopics = resolveTopics("cayman", { subjectSlug: "maths", yearGroup: "Y5" });
    expect(mathsTopics.every((t) => t.subjectSlug === "maths")).toBe(true);
    // All 13 PUMA-inspired strands from the spec should be present.
    expect(mathsTopics.length).toBe(13);
  });

  it("getSubjectMap returns undefined for an unknown subject", () => {
    expect(getSubjectMap("cayman", "latin")).toBeUndefined();
  });
});
