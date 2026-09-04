import { describe, it, expect, beforeEach, vi } from "vitest";
import type { ContentQuestion } from "@prisma/client";
import type { MockDb } from "../mocks/prisma";

vi.mock("@/lib/db", async () => {
  const { createMockDb } = await import("../mocks/prisma");
  return { db: createMockDb() };
});
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: vi.fn() }));

const { db: mockDb } = (await import("@/lib/db")) as unknown as { db: MockDb };
const { getCurrentUser } = (await import("@/lib/auth/session")) as unknown as { getCurrentUser: ReturnType<typeof vi.fn> };

const { GET } = await import("@/app/api/ngsa/exam/route");

function guyanaY6Student() {
  return { id: "user-1", studentProfile: { id: "student-1", parent: { family: { curriculum: { slug: "guyana" } } } } };
}
function caymanStudent() {
  return { id: "user-1", studentProfile: { id: "student-1", parent: { family: { curriculum: { slug: "cayman" } } } } };
}

function questionRow(id: string): ContentQuestion {
  return {
    id,
    topicId: "topic-1",
    objectiveCode: "GY-MA6-NUM-1",
    type: "MULTIPLE_CHOICE",
    difficulty: "BRONZE",
    prompt: JSON.stringify({ text: `Question ${id}` }),
    options: JSON.stringify({ options: [{ id: "a", text: "Right" }, { id: "b", text: "Wrong" }] }),
    answer: JSON.stringify({ correctOptionId: "a" }),
    explanation: null,
    tags: "[]",
    passageId: null,
    subSkill: null,
    source: "SEED",
    status: "PUBLISHED",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function getRequest(qs: string): Request {
  return new Request(`http://localhost/api/ngsa/exam?${qs}`);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/ngsa/exam", () => {
  it("401s when there is no authenticated student", async () => {
    getCurrentUser.mockResolvedValue(null);
    const res = await GET(getRequest("subject=maths"));
    expect(res.status).toBe(401);
  });

  it("403s for a non-Guyana student", async () => {
    getCurrentUser.mockResolvedValue(caymanStudent());
    const res = await GET(getRequest("subject=maths"));
    expect(res.status).toBe(403);
    expect(mockDb.topic.findMany).not.toHaveBeenCalled();
  });

  it("400s for an unrecognised subject key", async () => {
    getCurrentUser.mockResolvedValue(guyanaY6Student());
    const res = await GET(getRequest("subject=not-a-real-subject"));
    expect(res.status).toBe(400);
  });

  it("404s when no Y6 Guyana topics exist for the subject", async () => {
    getCurrentUser.mockResolvedValue(guyanaY6Student());
    mockDb.topic.findMany.mockResolvedValue([]);
    const res = await GET(getRequest("subject=science"));
    expect(res.status).toBe(404);
  });

  it("combines reading and grammar topics for the 'english' subject key", async () => {
    getCurrentUser.mockResolvedValue(guyanaY6Student());
    mockDb.topic.findMany.mockResolvedValue([{ id: "topic-1" }]);
    mockDb.contentQuestion.findMany.mockResolvedValue([]);

    await GET(getRequest("subject=english"));

    expect(mockDb.topic.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          subject: { slug: { in: ["reading", "grammar"] } },
          yearGroup: "Y6",
          curriculum: { slug: "guyana" },
        }),
      })
    );
  });

  it("strips answer-bearing fields and labels the subject in the response", async () => {
    getCurrentUser.mockResolvedValue(guyanaY6Student());
    mockDb.topic.findMany.mockResolvedValue([{ id: "topic-1" }]);
    mockDb.contentQuestion.findMany.mockResolvedValue([{ ...questionRow("q1"), passage: null }]);

    const res = await GET(getRequest("subject=maths"));
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.subjectLabel).toBe("Mathematics");
    expect(body.questions).toHaveLength(1);
    expect(body.questions[0].correctOptionId).toBeUndefined();
    expect(body.questions[0].promptText).toBe("Question q1");
  });
});
