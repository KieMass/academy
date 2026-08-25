import { describe, it, expect, beforeEach, vi } from "vitest";
import type { MockDb } from "../mocks/prisma";

// See attempts.test.ts's header comment for why these mocks use an async
// factory (vi.mock is hoisted above imports, so a hoisted factory can't
// reference a statically-imported helper like createMockDb).
vi.mock("@/lib/db", async () => {
  const { createMockDb } = await import("../mocks/prisma");
  return { db: createMockDb() };
});
vi.mock("@/lib/auth/password", () => ({ verifyPassword: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ createSession: vi.fn() }));

const { db: mockDb } = (await import("@/lib/db")) as unknown as { db: MockDb };
const { verifyPassword } = (await import("@/lib/auth/password")) as unknown as { verifyPassword: ReturnType<typeof vi.fn> };
const { createSession } = (await import("@/lib/auth/session")) as unknown as { createSession: ReturnType<typeof vi.fn> };

const { POST } = await import("@/app/api/auth/login/route");

function request(body: unknown, ip = "203.0.113.5"): Request {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

const notRateLimited = [{ count: 1, resetAt: new Date(Date.now() + 60_000) }];

beforeEach(() => {
  vi.clearAllMocks();
  mockDb.$queryRaw.mockResolvedValue(notRateLimited);
  createSession.mockResolvedValue(undefined);
});

describe("POST /api/auth/login", () => {
  it("logs in with correct credentials", async () => {
    mockDb.user.findFirst.mockResolvedValue({ id: "user-1", role: "PARENT", passwordHash: "hashed" });
    verifyPassword.mockResolvedValue(true);

    const res = await POST(request({ role: "PARENT", identifier: "parent@example.com", password: "correct-horse" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.role).toBe("PARENT");
    expect(createSession).toHaveBeenCalledWith("user-1");
  });

  it("401s on an unknown identifier without revealing which part was wrong", async () => {
    mockDb.user.findFirst.mockResolvedValue(null);

    const res = await POST(request({ role: "PARENT", identifier: "nobody@example.com", password: "whatever" }));
    expect(res.status).toBe(401);
    expect(createSession).not.toHaveBeenCalled();
  });

  it("401s on a wrong password", async () => {
    mockDb.user.findFirst.mockResolvedValue({ id: "user-1", role: "PARENT", passwordHash: "hashed" });
    verifyPassword.mockResolvedValue(false);

    const res = await POST(request({ role: "PARENT", identifier: "parent@example.com", password: "wrong" }));
    expect(res.status).toBe(401);
    expect(createSession).not.toHaveBeenCalled();
  });

  it("400s on a malformed body without touching the db", async () => {
    const res = await POST(request({ role: "PARENT" })); // missing identifier/password
    expect(res.status).toBe(400);
    expect(mockDb.$queryRaw).not.toHaveBeenCalled();
  });

  it("429s once the per-IP rate limit is exceeded, before any credential lookup", async () => {
    mockDb.$queryRaw.mockResolvedValue([{ count: 21, resetAt: new Date(Date.now() + 120_000) }]); // over IP_LIMIT(20)

    const res = await POST(request({ role: "PARENT", identifier: "parent@example.com", password: "whatever" }));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("120");
    expect(mockDb.user.findFirst).not.toHaveBeenCalled();
  });

  it("429s once the per-account rate limit is exceeded even from a fresh IP", async () => {
    // First call (per-IP) under the limit, second call (per-account) over it.
    mockDb.$queryRaw
      .mockResolvedValueOnce([{ count: 1, resetAt: new Date(Date.now() + 60_000) }])
      .mockResolvedValueOnce([{ count: 9, resetAt: new Date(Date.now() + 900_000) }]); // over ACCOUNT_LIMIT(8)

    const res = await POST(request({ role: "PARENT", identifier: "targeted@example.com", password: "whatever" }, "198.51.100.9"));
    expect(res.status).toBe(429);
    expect(mockDb.user.findFirst).not.toHaveBeenCalled();
  });
});
