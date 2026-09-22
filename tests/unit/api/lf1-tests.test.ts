import { describe, it, expect, beforeEach, vi } from "vitest";
import type { MockDb } from "../mocks/prisma";
import { LF1_QUESTIONS } from "@/lib/lf1/bank";

// See tests/unit/api/attempts.test.ts for why vi.mock's factories are async
// dynamic imports here rather than referencing a statically-imported helper.
vi.mock("@/lib/db", async () => {
  const { createMockDb } = await import("../mocks/prisma");
  return { db: createMockDb() };
});
vi.mock("@/lib/auth/guards", () => ({ requireLearner: vi.fn() }));

const { db: mockDb } = (await import("@/lib/db")) as unknown as { db: MockDb };
const { requireLearner } = (await import("@/lib/auth/guards")) as unknown as { requireLearner: ReturnType<typeof vi.fn> };

const { POST: createTest } = await import("@/app/api/lf1/tests/route");
const { POST: answer } = await import("@/app/api/lf1/tests/[id]/answer/route");
const { POST: complete } = await import("@/app/api/lf1/tests/[id]/complete/route");

const LEARNER_ID = "learner-1";
const Q1 = LF1_QUESTIONS[0];
const Q2 = LF1_QUESTIONS[1];

function post(body: unknown): Request {
  return new Request("http://localhost/api/lf1/tests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}
const params = (id: string) => ({ params: Promise.resolve({ id }) });

function session(overrides: Record<string, unknown> = {}) {
  return {
    id: "test-1",
    learnerId: LEARNER_ID,
    mode: "PRACTICE",
    outcome: null,
    questionIds: JSON.stringify([Q1.id, Q2.id]),
    answers: "{}",
    totalQuestions: 2,
    correctCount: null,
    timeLimitSeconds: null,
    startedAt: new Date(),
    completedAt: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  requireLearner.mockResolvedValue({ learnerProfile: { id: LEARNER_ID } });
  mockDb.lf1Answer.findMany.mockResolvedValue([]);
  mockDb.$transaction.mockImplementation(async (ops: unknown[]) => Promise.all(ops));
});

describe("POST /api/lf1/tests", () => {
  it("creates a 50-question, 60-minute mock exam", async () => {
    mockDb.lf1TestSession.create.mockResolvedValue({ id: "mock-1" });
    const res = await createTest(post({ mode: "MOCK" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: "mock-1" });

    const { data } = mockDb.lf1TestSession.create.mock.calls[0][0];
    expect(data).toMatchObject({ learnerId: LEARNER_ID, mode: "MOCK", outcome: null, totalQuestions: 50, timeLimitSeconds: 3600 });
    expect(JSON.parse(data.questionIds)).toHaveLength(50);
  });

  it("creates an untimed practice set for one outcome", async () => {
    mockDb.lf1TestSession.create.mockResolvedValue({ id: "p-1" });
    const res = await createTest(post({ mode: "PRACTICE", outcome: 4, count: 10 }));
    expect(res.status).toBe(200);
    const { data } = mockDb.lf1TestSession.create.mock.calls[0][0];
    expect(data).toMatchObject({ mode: "PRACTICE", outcome: 4, totalQuestions: 10, timeLimitSeconds: null });
    for (const id of JSON.parse(data.questionIds)) expect(id).toMatch(/^lf1-4-/);
  });

  it("rejects unknown outcomes and sizes", async () => {
    expect((await createTest(post({ mode: "PRACTICE", outcome: 12, count: 10 }))).status).toBe(400);
    expect((await createTest(post({ mode: "PRACTICE", outcome: 1, count: 500 }))).status).toBe(400);
    expect(mockDb.lf1TestSession.create).not.toHaveBeenCalled();
  });
});

describe("POST /api/lf1/tests/:id/answer", () => {
  function answerReq(questionId: string, selectedIndex: number) {
    return new Request("http://localhost/x", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId, selectedIndex }) });
  }

  it("grades a practice answer immediately and records it", async () => {
    mockDb.lf1TestSession.findFirst.mockResolvedValue(session());
    const wrong = (Q1.answer + 1) % 4;
    const res = await answer(answerReq(Q1.id, wrong), params("test-1"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ correct: false, selectedIndex: wrong, correctIndex: Q1.answer, explanation: Q1.explanation });
    expect(mockDb.lf1Answer.create).toHaveBeenCalledWith({
      data: { sessionId: "test-1", learnerId: LEARNER_ID, questionId: Q1.id, outcome: Q1.outcome, selectedIndex: wrong, isCorrect: false },
    });
  });

  it("keeps the first practice answer if the same question is re-submitted", async () => {
    mockDb.lf1TestSession.findFirst.mockResolvedValue(session({ answers: JSON.stringify({ [Q1.id]: Q1.answer }) }));
    const res = await answer(answerReq(Q1.id, (Q1.answer + 1) % 4), params("test-1"));
    expect(await res.json()).toMatchObject({ correct: true, selectedIndex: Q1.answer });
    expect(mockDb.lf1Answer.create).not.toHaveBeenCalled();
  });

  it("only saves (no feedback) during a mock exam", async () => {
    mockDb.lf1TestSession.findFirst.mockResolvedValue(session({ mode: "MOCK", timeLimitSeconds: 3600 }));
    const res = await answer(answerReq(Q2.id, 2), params("test-1"));
    expect(await res.json()).toEqual({ saved: true });
    expect(mockDb.lf1TestSession.update).toHaveBeenCalledWith({ where: { id: "test-1" }, data: { answers: JSON.stringify({ [Q2.id]: 2 }) } });
    expect(mockDb.lf1Answer.create).not.toHaveBeenCalled();
  });

  it("refuses mock answers after time is up", async () => {
    mockDb.lf1TestSession.findFirst.mockResolvedValue(session({ mode: "MOCK", timeLimitSeconds: 3600, startedAt: new Date(Date.now() - 2 * 3600 * 1000) }));
    expect((await answer(answerReq(Q2.id, 2), params("test-1"))).status).toBe(409);
  });

  it("rejects questions that aren't in the test, and other learners' tests", async () => {
    mockDb.lf1TestSession.findFirst.mockResolvedValue(session());
    expect((await answer(answerReq(LF1_QUESTIONS[50].id, 0), params("test-1"))).status).toBe(400);

    mockDb.lf1TestSession.findFirst.mockResolvedValue(null);
    expect((await answer(answerReq(Q1.id, 0), params("someone-elses"))).status).toBe(404);
    expect(mockDb.lf1TestSession.findFirst).toHaveBeenLastCalledWith({ where: { id: "someone-elses", learnerId: LEARNER_ID } });
  });
});

describe("POST /api/lf1/tests/:id/complete", () => {
  function completeReq(body: unknown = {}) {
    return new Request("http://localhost/x", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  }

  it("marks a whole mock paper, counting unanswered questions as wrong", async () => {
    mockDb.lf1TestSession.findFirst.mockResolvedValue(session({ mode: "MOCK", timeLimitSeconds: 3600, answers: JSON.stringify({ [Q1.id]: Q1.answer }) }));
    mockDb.lf1TestSession.updateMany.mockResolvedValue({ count: 1 });

    const res = await complete(completeReq({ answers: {} }), params("test-1"));
    expect(await res.json()).toEqual({ id: "test-1", correctCount: 1, totalQuestions: 2 });
    expect(mockDb.lf1Answer.createMany).toHaveBeenCalledWith({
      data: [
        { sessionId: "test-1", learnerId: LEARNER_ID, questionId: Q1.id, outcome: Q1.outcome, selectedIndex: Q1.answer, isCorrect: true },
        { sessionId: "test-1", learnerId: LEARNER_ID, questionId: Q2.id, outcome: Q2.outcome, selectedIndex: null, isCorrect: false },
      ],
      skipDuplicates: true,
    });
  });

  it("merges the client's final answer sheet when submitted in time", async () => {
    mockDb.lf1TestSession.findFirst.mockResolvedValue(session({ mode: "MOCK", timeLimitSeconds: 3600 }));
    mockDb.lf1TestSession.updateMany.mockResolvedValue({ count: 1 });
    const res = await complete(completeReq({ answers: { [Q1.id]: Q1.answer, [Q2.id]: Q2.answer } }), params("test-1"));
    expect((await res.json()).correctCount).toBe(2);
  });

  it("ignores late answer sheets and uses only what was saved in time", async () => {
    mockDb.lf1TestSession.findFirst.mockResolvedValue(
      session({ mode: "MOCK", timeLimitSeconds: 3600, startedAt: new Date(Date.now() - 3 * 3600 * 1000), answers: JSON.stringify({ [Q1.id]: Q1.answer }) })
    );
    mockDb.lf1TestSession.updateMany.mockResolvedValue({ count: 1 });
    const res = await complete(completeReq({ answers: { [Q2.id]: Q2.answer } }), params("test-1"));
    expect((await res.json()).correctCount).toBe(1);
  });

  it("doesn't write answer rows twice when a mock is submitted twice concurrently", async () => {
    mockDb.lf1TestSession.findFirst.mockResolvedValue(session({ mode: "MOCK", timeLimitSeconds: 3600 }));
    mockDb.lf1TestSession.updateMany.mockResolvedValue({ count: 0 });
    await complete(completeReq(), params("test-1"));
    expect(mockDb.lf1Answer.createMany).not.toHaveBeenCalled();
  });

  it("closes a practice set using the answers already graded", async () => {
    mockDb.lf1TestSession.findFirst.mockResolvedValue(session());
    mockDb.lf1Answer.count.mockResolvedValue(1);
    const res = await complete(completeReq(), params("test-1"));
    expect(await res.json()).toEqual({ id: "test-1", correctCount: 1, totalQuestions: 2 });
    expect(mockDb.lf1TestSession.update).toHaveBeenCalledWith({ where: { id: "test-1" }, data: { completedAt: expect.any(Date), correctCount: 1 } });
  });
});
