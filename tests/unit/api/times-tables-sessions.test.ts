import { describe, it, expect, beforeEach, vi } from "vitest";
import type { MockDb } from "../mocks/prisma";

// See tests/unit/api/attempts.test.ts for why vi.mock's factories are async
// dynamic imports here rather than referencing a statically-imported helper.
vi.mock("@/lib/db", async () => {
  const { createMockDb } = await import("../mocks/prisma");
  return { db: createMockDb() };
});
vi.mock("@/lib/auth/guards", () => ({ requireStudent: vi.fn() }));

const { db: mockDb } = (await import("@/lib/db")) as unknown as { db: MockDb };
const { requireStudent } = (await import("@/lib/auth/guards")) as unknown as { requireStudent: ReturnType<typeof vi.fn> };

const { POST, GET } = await import("@/app/api/times-tables/sessions/route");

const STUDENT_ID = "student-1";

function postRequest(body: unknown): Request {
  return new Request("http://localhost/api/times-tables/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function getRequest(query = ""): Request {
  return new Request(`http://localhost/api/times-tables/sessions${query}`);
}

beforeEach(() => {
  vi.clearAllMocks();
  requireStudent.mockResolvedValue({ studentProfile: { id: STUDENT_ID } });
  mockDb.$queryRaw.mockResolvedValue([{ count: 1, resetAt: new Date(Date.now() + 60_000) }]);
});

describe("POST /api/times-tables/sessions", () => {
  it("recomputes the summary from the raw answer log and persists it", async () => {
    mockDb.timesTableSession.create.mockResolvedValue({ id: "session-1" });

    const res = await POST(
      postRequest({
        tables: [6, 7],
        roundSeconds: 60,
        endedEarly: false,
        answers: [
          { table: 6, multiplier: 7, correct: true, speedMs: 1200 },
          { table: 7, multiplier: 8, correct: false, speedMs: 4000 },
          { table: 6, multiplier: 9, correct: true, speedMs: 800 },
        ],
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.questionsAnswered).toBe(3);
    expect(body.correctCount).toBe(2);
    expect(body.avgCorrectSpeedMs).toBe(1000); // (1200 + 800) / 2

    expect(mockDb.timesTableSession.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        studentId: STUDENT_ID,
        tables: JSON.stringify([6, 7]),
        roundSeconds: 60,
        endedEarly: false,
        questionsAnswered: 3,
        correctCount: 2,
        avgCorrectSpeedMs: 1000,
      }),
    });
  });

  it("stores the selected tables sorted and de-duplicated regardless of input order", async () => {
    mockDb.timesTableSession.create.mockResolvedValue({ id: "session-1" });

    await POST(postRequest({ tables: [9, 3, 3], roundSeconds: 30, endedEarly: true, answers: [] }));

    expect(mockDb.timesTableSession.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ tables: JSON.stringify([3, 9]), endedEarly: true }) })
    );
  });

  it("400s when an answer references a table outside the round's selection (tamper guard)", async () => {
    const res = await POST(
      postRequest({
        tables: [6],
        roundSeconds: 60,
        endedEarly: false,
        answers: [{ table: 11, multiplier: 4, correct: true, speedMs: 1000 }],
      })
    );
    expect(res.status).toBe(400);
    expect(mockDb.timesTableSession.create).not.toHaveBeenCalled();
  });

  it("400s on an invalid round length", async () => {
    const res = await POST(postRequest({ tables: [6], roundSeconds: 45, endedEarly: false, answers: [] }));
    expect(res.status).toBe(400);
    expect(mockDb.timesTableSession.create).not.toHaveBeenCalled();
  });

  it("400s when the request body fails schema validation", async () => {
    const res = await POST(postRequest({ tables: [] }));
    expect(res.status).toBe(400);
    expect(mockDb.timesTableSession.create).not.toHaveBeenCalled();
  });

  it("429s once the per-student rate limit is exceeded", async () => {
    mockDb.$queryRaw.mockResolvedValue([{ count: 21, resetAt: new Date(Date.now() + 30_000) }]); // over LIMIT(20)

    const res = await POST(postRequest({ tables: [6], roundSeconds: 60, endedEarly: false, answers: [] }));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("30");
    expect(mockDb.timesTableSession.create).not.toHaveBeenCalled();
  });
});

describe("GET /api/times-tables/sessions", () => {
  it("returns the student's own recent rounds, parsed for the client", async () => {
    mockDb.timesTableSession.findMany.mockResolvedValue([
      {
        id: "session-1",
        tables: JSON.stringify([3, 9]),
        roundSeconds: 60,
        endedEarly: false,
        questionsAnswered: 10,
        correctCount: 9,
        avgCorrectSpeedMs: 1500,
        createdAt: new Date("2026-01-01"),
      },
    ]);

    const res = await GET(getRequest());
    const body = await res.json();

    expect(mockDb.timesTableSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { studentId: STUDENT_ID }, orderBy: { createdAt: "desc" } })
    );
    expect(body.sessions).toEqual([
      expect.objectContaining({ id: "session-1", tables: [3, 9], correctCount: 9, questionsAnswered: 10 }),
    ]);
  });

  it("clamps an out-of-range limit instead of passing it straight to the query", async () => {
    mockDb.timesTableSession.findMany.mockResolvedValue([]);
    await GET(getRequest("?limit=500"));
    expect(mockDb.timesTableSession.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 50 }));
  });
});
