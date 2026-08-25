import { describe, it, expect, beforeEach, vi } from "vitest";
import type { MockDb } from "../mocks/prisma";

vi.mock("@/lib/db", async () => {
  const { createMockDb } = await import("../mocks/prisma");
  return { db: createMockDb() };
});
vi.mock("@/lib/auth/guards", () => ({ requireParent: vi.fn() }));

const { db: mockDb } = (await import("@/lib/db")) as unknown as { db: MockDb };
const { requireParent } = (await import("@/lib/auth/guards")) as unknown as { requireParent: ReturnType<typeof vi.fn> };

const { PATCH } = await import("@/app/api/parent/family/curriculum/route");

function request(body: unknown): Request {
  return new Request("http://localhost/api/parent/family/curriculum", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  requireParent.mockResolvedValue({ parentProfile: { id: "parent-1", familyId: "family-1" } });
});

describe("PATCH /api/parent/family/curriculum", () => {
  it("400s when curriculumSlug is missing", async () => {
    const res = await PATCH(request({}));
    expect(res.status).toBe(400);
    expect(mockDb.curriculum.findUnique).not.toHaveBeenCalled();
  });

  it("400s when the curriculum slug doesn't exist", async () => {
    mockDb.curriculum.findUnique.mockResolvedValue(null);
    const res = await PATCH(request({ curriculumSlug: "atlantis" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/unknown curriculum/i);
    expect(mockDb.family.update).not.toHaveBeenCalled();
  });

  it("updates the caller's own family, not an arbitrary id", async () => {
    mockDb.curriculum.findUnique.mockResolvedValue({ id: "curr-guyana", slug: "guyana", name: "Guyana", yearGroupLabel: "Grade" });
    const res = await PATCH(request({ curriculumSlug: "guyana" }));

    expect(res.status).toBe(200);
    expect(mockDb.family.update).toHaveBeenCalledWith({ where: { id: "family-1" }, data: { curriculumId: "curr-guyana" } });
    const body = await res.json();
    expect(body.curriculum).toEqual({ slug: "guyana", name: "Guyana", yearGroupLabel: "Grade" });
  });
});
