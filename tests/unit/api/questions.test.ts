import { describe, it, expect, beforeEach, vi } from "vitest";
import type { ContentQuestion } from "@prisma/client";
import type { MockDb } from "../mocks/prisma";

vi.mock("@/lib/db", async () => {
  const { createMockDb } = await import("../mocks/prisma");
  return { db: createMockDb() };
});
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: vi.fn(), DEFAULT_CURRICULUM_SLUG: "cayman" }));

const { db: mockDb } = (await import("@/lib/db")) as unknown as { db: MockDb };
const { getCurrentUser } = (await import("@/lib/auth/session")) as unknown as { getCurrentUser: ReturnType<typeof vi.fn> };

const { GET } = await import("@/app/api/questions/route");

const TOPIC_ID = "topic-1";

function studentUser(curriculumSlug = "cayman") {
  return {
    id: "user-1",
    studentProfile: {
      id: "student-1",
      parent: { family: { curriculum: curriculumSlug ? { slug: curriculumSlug } : null } },
    },
    parentProfile: null,
  };
}

function questionRow(id: string): ContentQuestion {
  return {
    id,
    topicId: TOPIC_ID,
    objectiveCode: "MA5-NPV-1",
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
  return new Request(`http://localhost/api/questions?${qs}`);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockDb.questionAttempt.findMany.mockResolvedValue([]);
});

describe("GET /api/questions", () => {
  it("401s when there is no authenticated user", async () => {
    getCurrentUser.mockResolvedValue(null);
    const res = await GET(getRequest("subject=maths&strand=fractions&yearGroup=Y5"));
    expect(res.status).toBe(401);
  });

  it("400s when a required query param is missing", async () => {
    getCurrentUser.mockResolvedValue(studentUser());
    const res = await GET(getRequest("subject=maths&strand=fractions")); // no yearGroup
    expect(res.status).toBe(400);
    expect(mockDb.topic.findFirst).not.toHaveBeenCalled();
  });

  it("404s when no topic matches the student's own curriculum", async () => {
    getCurrentUser.mockResolvedValue(studentUser());
    mockDb.topic.findFirst.mockResolvedValue(null);
    const res = await GET(getRequest("subject=maths&strand=fractions&yearGroup=Y5"));
    expect(res.status).toBe(404);
  });

  it("scopes the topic lookup to the student's own curriculum, not just subject/strand/year", async () => {
    getCurrentUser.mockResolvedValue(studentUser("guyana"));
    mockDb.topic.findFirst.mockResolvedValue({ id: TOPIC_ID, strandName: "Number and Operations" });
    mockDb.contentQuestion.findMany.mockResolvedValue([]);

    await GET(getRequest("subject=maths&strand=number-operations&yearGroup=Y5"));

    expect(mockDb.topic.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          subject: { slug: "maths" },
          strandSlug: "number-operations",
          curriculum: { slug: "guyana" },
        }),
      })
    );
  });

  it("falls back to the default curriculum when the user has no family/curriculum linked", async () => {
    getCurrentUser.mockResolvedValue({ id: "user-1", studentProfile: null, parentProfile: null });
    mockDb.topic.findFirst.mockResolvedValue({ id: TOPIC_ID, strandName: "Fractions" });
    mockDb.contentQuestion.findMany.mockResolvedValue([]);

    await GET(getRequest("subject=maths&strand=fractions&yearGroup=Y5"));

    expect(mockDb.topic.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ curriculum: { slug: "cayman" } }) })
    );
  });

  it("returns an empty question list (not a 404) when the topic exists but its question pool is empty", async () => {
    getCurrentUser.mockResolvedValue(studentUser());
    mockDb.topic.findFirst.mockResolvedValue({ id: TOPIC_ID, strandName: "Fractions" });
    mockDb.contentQuestion.findMany.mockResolvedValueOnce([]); // the pool lookup

    const res = await GET(getRequest("subject=maths&strand=fractions&yearGroup=Y5"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.questions).toEqual([]);
  });

  it("strips every answer-bearing field before returning questions to the client", async () => {
    getCurrentUser.mockResolvedValue(studentUser());
    mockDb.topic.findFirst.mockResolvedValue({ id: TOPIC_ID, strandName: "Fractions" });
    mockDb.contentQuestion.findMany
      .mockResolvedValueOnce([{ id: "q1" }]) // pool lookup (select: {id: true})
      .mockResolvedValueOnce([{ ...questionRow("q1"), passage: null }]); // full row fetch

    const res = await GET(getRequest("subject=maths&strand=fractions&yearGroup=Y5"));
    const body = await res.json();

    expect(body.questions).toHaveLength(1);
    expect(body.questions[0].correctOptionId).toBeUndefined();
    expect(body.questions[0].promptText).toBe("Question q1");
  });

  it("filters the question pool by difficulty when provided", async () => {
    getCurrentUser.mockResolvedValue(studentUser());
    mockDb.topic.findFirst.mockResolvedValue({ id: TOPIC_ID, strandName: "Fractions" });
    mockDb.contentQuestion.findMany.mockResolvedValue([]);

    await GET(getRequest("subject=maths&strand=fractions&yearGroup=Y5&difficulty=gold"));

    expect(mockDb.contentQuestion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ difficulty: "GOLD" }) })
    );
  });

  it("caps the requested limit at 50", async () => {
    getCurrentUser.mockResolvedValue(studentUser());
    mockDb.topic.findFirst.mockResolvedValue({ id: TOPIC_ID, strandName: "Fractions" });
    const pool = Array.from({ length: 80 }, (_, i) => ({ id: `q${i}` }));
    mockDb.contentQuestion.findMany.mockResolvedValueOnce(pool).mockResolvedValueOnce([]);

    await GET(getRequest("subject=maths&strand=fractions&yearGroup=Y5&limit=999"));

    const secondCallArgs = mockDb.contentQuestion.findMany.mock.calls[1][0];
    expect(secondCallArgs.where.id.in.length).toBeLessThanOrEqual(50);
  });
});
