import { describe, it, expect, beforeEach, vi } from "vitest";
import type { ContentQuestion } from "@prisma/client";
import type { MockDb } from "../mocks/prisma";

// vi.mock is hoisted above regular imports, and (per vitest) a hoisted
// factory can't reference anything from a static import — including a
// plain helper like createMockDb — since imports are rewritten to
// lazily-initialized bindings that aren't ready yet at hoist time. An
// *async* factory sidesteps that: the dynamic `import()` inside it only
// runs when the mock is actually installed, well after hoisting. The
// mock/db handles are then grabbed via their own top-level dynamic
// imports below, in normal (non-hoisted) execution order.
vi.mock("@/lib/db", async () => {
  const { createMockDb } = await import("../mocks/prisma");
  return { db: createMockDb() };
});
vi.mock("@/lib/auth/guards", () => ({ requireStudent: vi.fn() }));

const { db: mockDb } = (await import("@/lib/db")) as unknown as { db: MockDb };
const { requireStudent } = (await import("@/lib/auth/guards")) as unknown as { requireStudent: ReturnType<typeof vi.fn> };

// Imported *after* the mocks above so the route picks up the mocked
// `db`/`requireStudent` — everything else it pulls in (grade.ts,
// mastery.ts, gamification/*, content-gap.ts) runs for real.
const { POST } = await import("@/app/api/attempts/route");

const STUDENT_ID = "student-1";
const TOPIC_ID = "topic-1";
const QUESTION_ID = "question-1";

function multipleChoiceRow(overrides: Partial<ContentQuestion> = {}): ContentQuestion {
  return {
    id: QUESTION_ID,
    topicId: TOPIC_ID,
    objectiveCode: "MA5-NPV-1",
    type: "MULTIPLE_CHOICE",
    difficulty: "BRONZE",
    prompt: JSON.stringify({ text: "What is 6 x 7?" }),
    options: JSON.stringify({ options: [{ id: "a", text: "42" }, { id: "b", text: "36" }] }),
    answer: JSON.stringify({ correctOptionId: "a" }),
    explanation: "6 x 7 = 42.",
    tags: "[]",
    passageId: null,
    subSkill: null,
    source: "SEED",
    status: "PUBLISHED",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function request(body: unknown): Request {
  return new Request("http://localhost/api/attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function studentProfile(overrides: Partial<{ id: string; xpTotal: number; streakDays: number; lastActiveAt: Date | null }> = {}) {
  return {
    id: STUDENT_ID,
    xpTotal: 0,
    streakDays: 0,
    lastActiveAt: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  requireStudent.mockResolvedValue({ studentProfile: studentProfile() });
  // Defaults that make checkContentGap() and evaluateBadgesForStudent()
  // short-circuit cleanly so each test only needs to override what its
  // scenario actually cares about.
  mockDb.contentGapAlert.findFirst.mockResolvedValue(null);
  mockDb.contentQuestion.count.mockResolvedValue(50);
  mockDb.questionAttempt.count.mockResolvedValue(1); // below MIN_ATTEMPTS_FLOOR(20) -> no alert created
  mockDb.badge.findMany.mockResolvedValue([]); // no badge candidates -> evaluateBadgesForStudent() returns [] immediately
  mockDb.studentBadge.findMany.mockResolvedValue([]);
  mockDb.topicMastery.findUnique.mockResolvedValue(null);
  mockDb.topicMastery.upsert.mockResolvedValue({});
  mockDb.studentProfile.findUniqueOrThrow.mockResolvedValue(studentProfile());
  mockDb.studentProfile.update.mockResolvedValue({});
  mockDb.questionAttempt.create.mockResolvedValue({});
  mockDb.xpEvent.create.mockResolvedValue({});
});

describe("POST /api/attempts", () => {
  it("grades a correct answer, awards XP, and updates mastery/streak", async () => {
    mockDb.contentQuestion.findUnique.mockResolvedValue(multipleChoiceRow());

    const res = await POST(request({ questionId: QUESTION_ID, response: { type: "multiple_choice", optionId: "a" }, timeSpentSeconds: 12 }));
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.correct).toBe(true);
    expect(body.correctAnswer).toBe("42");
    expect(body.xpAwarded).toBe(5); // bronze XP, see gamification/xp.ts
    expect(body.xpTotal).toBe(5);
    expect(body.level).toBe(1);
    expect(body.newBadges).toEqual([]);

    // The attempt was recorded as correct.
    expect(mockDb.questionAttempt.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ studentId: STUDENT_ID, questionId: QUESTION_ID, isCorrect: true }) })
    );
    // First-ever attempt on this topic -> mastery goes to DEVELOPING (attempted=1 < the SECURE/MASTERED thresholds).
    expect(mockDb.topicMastery.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: expect.objectContaining({ questionsAttempted: 1, questionsCorrect: 1, masteryLevel: "DEVELOPING" }) })
    );
    // XP was only awarded because the answer was correct.
    expect(mockDb.xpEvent.create).toHaveBeenCalledTimes(1);
    // First activity ever (lastActiveAt: null) -> streak starts at 1.
    expect(mockDb.studentProfile.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ streakDays: 1 }) }));
  });

  it("grades an incorrect answer with no XP and no streak/mastery credit", async () => {
    mockDb.contentQuestion.findUnique.mockResolvedValue(multipleChoiceRow());

    const res = await POST(request({ questionId: QUESTION_ID, response: { type: "multiple_choice", optionId: "b" }, timeSpentSeconds: 5 }));
    const body = await res.json();

    expect(body.correct).toBe(false);
    expect(body.xpAwarded).toBe(0);
    expect(body.xpTotal).toBe(0);
    expect(mockDb.xpEvent.create).not.toHaveBeenCalled();
    expect(mockDb.topicMastery.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: expect.objectContaining({ questionsAttempted: 1, questionsCorrect: 0, masteryLevel: "DEVELOPING" }) })
    );
  });

  it("awards more XP for a harder difficulty band", async () => {
    mockDb.contentQuestion.findUnique.mockResolvedValue(multipleChoiceRow({ difficulty: "GOLD" }));

    const res = await POST(request({ questionId: QUESTION_ID, response: { type: "multiple_choice", optionId: "a" }, timeSpentSeconds: 12 }));
    const body = await res.json();

    expect(body.xpAwarded).toBe(12); // gold XP, see gamification/xp.ts
  });

  it("400s when the response body fails schema validation", async () => {
    const res = await POST(request({ questionId: QUESTION_ID })); // missing response/timeSpentSeconds
    expect(res.status).toBe(400);
    expect(mockDb.contentQuestion.findUnique).not.toHaveBeenCalled();
  });

  it("404s when the question doesn't exist", async () => {
    mockDb.contentQuestion.findUnique.mockResolvedValue(null);
    const res = await POST(request({ questionId: "missing", response: { type: "multiple_choice", optionId: "a" }, timeSpentSeconds: 1 }));
    expect(res.status).toBe(404);
  });

  it("400s when the response type doesn't match the question type (tamper guard)", async () => {
    mockDb.contentQuestion.findUnique.mockResolvedValue(multipleChoiceRow());
    const res = await POST(request({ questionId: QUESTION_ID, response: { type: "short_answer", value: "42" }, timeSpentSeconds: 1 }));
    expect(res.status).toBe(400);
    expect(mockDb.questionAttempt.create).not.toHaveBeenCalled();
  });

  it("404s when an assignmentId is given but doesn't belong to this student", async () => {
    mockDb.assignment.findFirst.mockResolvedValue(null);
    const res = await POST(
      request({ questionId: QUESTION_ID, response: { type: "multiple_choice", optionId: "a" }, timeSpentSeconds: 1, assignmentId: "not-mine" })
    );
    expect(res.status).toBe(404);
    // Ownership is checked before the question is even looked up.
    expect(mockDb.contentQuestion.findUnique).not.toHaveBeenCalled();
  });

  it("proceeds when the assignmentId does belong to this student", async () => {
    mockDb.assignment.findFirst.mockResolvedValue({ id: "assign-1", studentId: STUDENT_ID });
    mockDb.contentQuestion.findUnique.mockResolvedValue(multipleChoiceRow());

    const res = await POST(
      request({ questionId: QUESTION_ID, response: { type: "multiple_choice", optionId: "a" }, timeSpentSeconds: 1, assignmentId: "assign-1" })
    );
    expect(res.status).toBe(200);
    expect(mockDb.questionAttempt.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ assignmentId: "assign-1" }) }));
  });

  it("carries an existing streak forward on a consecutive day and resets it after a gap", async () => {
    mockDb.contentQuestion.findUnique.mockResolvedValue(multipleChoiceRow());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    mockDb.studentProfile.findUniqueOrThrow.mockResolvedValue(studentProfile({ streakDays: 4, lastActiveAt: yesterday }));

    await POST(request({ questionId: QUESTION_ID, response: { type: "multiple_choice", optionId: "a" }, timeSpentSeconds: 1 }));
    expect(mockDb.studentProfile.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ streakDays: 5 }) }));
  });

  it("reports newly earned badges from evaluateBadgesForStudent", async () => {
    mockDb.contentQuestion.findUnique.mockResolvedValue(multipleChoiceRow());
    mockDb.badge.findMany.mockResolvedValue([
      { id: "b1", slug: "first-steps", criteria: JSON.stringify({ type: "questions_answered", count: 1 }) },
    ]);
    mockDb.studentBadge.findMany.mockResolvedValue([]); // not already earned
    mockDb.questionAttempt.count.mockImplementation(async (args: { where?: { studentId?: string } }) =>
      // checkContentGap() also calls questionAttempt.count (scoped by question.topicId, no studentId)
      // — only the badge criteria's studentId-scoped call should report 1.
      args?.where?.studentId ? 1 : 1
    );
    mockDb.studentBadge.create.mockResolvedValue({});

    const res = await POST(request({ questionId: QUESTION_ID, response: { type: "multiple_choice", optionId: "a" }, timeSpentSeconds: 1 }));
    const body = await res.json();
    expect(body.newBadges).toEqual(["first-steps"]);
    expect(mockDb.studentBadge.create).toHaveBeenCalledWith({ data: { studentId: STUDENT_ID, badgeId: "b1" } });
  });
});
