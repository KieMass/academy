import { describe, it, expect, beforeEach, vi } from "vitest";
import type { MockDb } from "../mocks/prisma";

vi.mock("@/lib/db", async () => {
  const { createMockDb } = await import("../mocks/prisma");
  return { db: createMockDb() };
});
vi.mock("@/lib/auth/guards", () => ({ requireParent: vi.fn() }));

const { db: mockDb } = (await import("@/lib/db")) as unknown as { db: MockDb };
const { requireParent } = (await import("@/lib/auth/guards")) as unknown as { requireParent: ReturnType<typeof vi.fn> };

const { POST } = await import("@/app/api/assignments/route");

const VALID_BODY = { studentId: "student-1", subjectSlug: "maths", strandSlug: "fractions", yearGroup: "Y5", title: "Practice fractions" };

function request(body: unknown): Request {
  return new Request("http://localhost/api/assignments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  requireParent.mockResolvedValue({
    parentProfile: { id: "parent-1", familyId: "family-1", family: { curriculumId: "curr-cayman-id" } },
  });
});

describe("POST /api/assignments", () => {
  it("400s on an invalid body", async () => {
    const res = await POST(request({ studentId: "student-1" })); // missing required fields
    expect(res.status).toBe(400);
    expect(mockDb.studentProfile.findFirst).not.toHaveBeenCalled();
  });

  it("SECURITY: 404s when the student doesn't belong to the caller's family", async () => {
    mockDb.studentProfile.findFirst.mockResolvedValue(null); // findFirst is family-scoped in its where clause
    const res = await POST(request(VALID_BODY));
    expect(res.status).toBe(404);
    expect(mockDb.assignment.create).not.toHaveBeenCalled();
  });

  it("scopes the student lookup to the caller's own family", async () => {
    mockDb.studentProfile.findFirst.mockResolvedValue(null);
    await POST(request(VALID_BODY));
    expect(mockDb.studentProfile.findFirst).toHaveBeenCalledWith({ where: { id: "student-1", parent: { familyId: "family-1" } } });
  });

  it("404s when no topic matches within the parent's own curriculum", async () => {
    mockDb.studentProfile.findFirst.mockResolvedValue({ id: "student-1" });
    mockDb.topic.findFirst.mockResolvedValue(null);
    const res = await POST(request(VALID_BODY));
    expect(res.status).toBe(404);
    expect(mockDb.assignment.create).not.toHaveBeenCalled();
  });

  it("scopes the topic lookup to the parent's own curriculumId, not any curriculum", async () => {
    mockDb.studentProfile.findFirst.mockResolvedValue({ id: "student-1" });
    mockDb.topic.findFirst.mockResolvedValue(null);
    await POST(request(VALID_BODY));
    expect(mockDb.topic.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ curriculumId: "curr-cayman-id" }) })
    );
  });

  it("creates the assignment against the resolved topic id when everything checks out", async () => {
    mockDb.studentProfile.findFirst.mockResolvedValue({ id: "student-1" });
    mockDb.topic.findFirst.mockResolvedValue({ id: "topic-42" });
    mockDb.assignment.create.mockResolvedValue({ id: "assignment-1" });

    const res = await POST(request(VALID_BODY));
    expect(res.status).toBe(200);
    expect(mockDb.assignment.create).toHaveBeenCalledWith({
      data: {
        studentId: "student-1",
        createdByParentId: "parent-1",
        type: "PRACTICE",
        title: "Practice fractions",
        topicIds: JSON.stringify(["topic-42"]),
        dueDate: undefined,
      },
    });
  });

  it("parses a provided dueDate into a Date", async () => {
    mockDb.studentProfile.findFirst.mockResolvedValue({ id: "student-1" });
    mockDb.topic.findFirst.mockResolvedValue({ id: "topic-42" });
    mockDb.assignment.create.mockResolvedValue({ id: "assignment-1" });

    await POST(request({ ...VALID_BODY, dueDate: "2026-09-01" }));
    const createArgs = mockDb.assignment.create.mock.calls[0][0];
    expect(createArgs.data.dueDate).toBeInstanceOf(Date);
    expect((createArgs.data.dueDate as Date).toISOString().slice(0, 10)).toBe("2026-09-01");
  });
});
