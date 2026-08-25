import { describe, it, expect, beforeEach, vi } from "vitest";
import type { MockDb } from "../mocks/prisma";

vi.mock("@/lib/db", async () => {
  const { createMockDb } = await import("../mocks/prisma");
  return { db: createMockDb() };
});
vi.mock("@/lib/auth/guards", () => ({ requireParent: vi.fn() }));

const { db: mockDb } = (await import("@/lib/db")) as unknown as { db: MockDb };
const { requireParent } = (await import("@/lib/auth/guards")) as unknown as { requireParent: ReturnType<typeof vi.fn> };

const { PATCH } = await import("@/app/api/parent/students/[id]/route");

function request(body: unknown): Request {
  return new Request("http://localhost/api/parent/students/student-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function call(id: string, body: unknown) {
  return PATCH(request(body), { params: Promise.resolve({ id }) });
}

beforeEach(() => {
  vi.clearAllMocks();
  requireParent.mockResolvedValue({ parentProfile: { id: "parent-1", familyId: "family-1" } });
});

describe("PATCH /api/parent/students/:id", () => {
  it("400s when yearGroup is not a valid enum value", async () => {
    const res = await call("student-1", { displayName: "Alex", yearGroup: "Y9" });
    expect(res.status).toBe(400);
    expect(mockDb.studentProfile.findUnique).not.toHaveBeenCalled();
  });

  it("404s when the student doesn't exist at all", async () => {
    mockDb.studentProfile.findUnique.mockResolvedValue(null);
    const res = await call("missing", { displayName: "Alex", yearGroup: "Y5" });
    expect(res.status).toBe(404);
    expect(mockDb.studentProfile.update).not.toHaveBeenCalled();
  });

  it("SECURITY: 404s (not 200) when the student belongs to a different family", async () => {
    mockDb.studentProfile.findUnique.mockResolvedValue({
      id: "student-1",
      avatarEmoji: "🦊",
      parent: { familyId: "someone-elses-family" },
    });
    const res = await call("student-1", { displayName: "Hijacked", yearGroup: "Y6" });
    expect(res.status).toBe(404);
    expect(mockDb.studentProfile.update).not.toHaveBeenCalled();
  });

  it("updates a student who does belong to the caller's own family", async () => {
    mockDb.studentProfile.findUnique.mockResolvedValue({
      id: "student-1",
      avatarEmoji: "🦊",
      parent: { familyId: "family-1" },
    });
    mockDb.studentProfile.update.mockResolvedValue({});

    const res = await call("student-1", { displayName: "Alex", yearGroup: "Y6" });
    expect(res.status).toBe(200);
    expect(mockDb.studentProfile.update).toHaveBeenCalledWith({
      where: { id: "student-1" },
      data: { displayName: "Alex", yearGroup: "Y6", avatarEmoji: "🦊" },
    });
  });

  it("lets a co-parent (any parent in the same family) edit the student too", async () => {
    // Second parent in the same family — familyId matches even though this
    // isn't the parent who originally added the student.
    requireParent.mockResolvedValue({ parentProfile: { id: "parent-2-coparent", familyId: "family-1" } });
    mockDb.studentProfile.findUnique.mockResolvedValue({ id: "student-1", avatarEmoji: "🦊", parent: { familyId: "family-1" } });
    mockDb.studentProfile.update.mockResolvedValue({});

    const res = await call("student-1", { displayName: "Alex", yearGroup: "Y4" });
    expect(res.status).toBe(200);
  });

  it("falls back to the existing avatarEmoji when none is provided", async () => {
    mockDb.studentProfile.findUnique.mockResolvedValue({ id: "student-1", avatarEmoji: "🐢", parent: { familyId: "family-1" } });
    mockDb.studentProfile.update.mockResolvedValue({});

    await call("student-1", { displayName: "Alex", yearGroup: "Y5" });
    expect(mockDb.studentProfile.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ avatarEmoji: "🐢" }) })
    );
  });
});
