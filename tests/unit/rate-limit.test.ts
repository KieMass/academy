import { describe, it, expect, beforeEach, vi } from "vitest";
import type { MockDb } from "./mocks/prisma";

vi.mock("@/lib/db", async () => {
  const { createMockDb } = await import("./mocks/prisma");
  return { db: createMockDb() };
});

const { db: mockDb } = (await import("@/lib/db")) as unknown as { db: MockDb };
const { checkRateLimit, getClientIp, rateLimitResponse } = await import("@/lib/rate-limit");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("checkRateLimit", () => {
  it("allows the request and issues no retry hint when under the limit", async () => {
    mockDb.$queryRaw.mockResolvedValue([{ count: 3, resetAt: new Date(Date.now() + 60_000) }]);

    const result = await checkRateLimit("test:key", 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.retryAfterSeconds).toBeUndefined();
  });

  it("allows the request when the count exactly equals the limit", async () => {
    mockDb.$queryRaw.mockResolvedValue([{ count: 5, resetAt: new Date(Date.now() + 60_000) }]);

    const result = await checkRateLimit("test:key", 5, 60_000);
    expect(result.allowed).toBe(true);
  });

  it("blocks and reports a retryAfterSeconds once over the limit", async () => {
    const resetAt = new Date(Date.now() + 30_000);
    mockDb.$queryRaw.mockResolvedValue([{ count: 6, resetAt }]);

    const result = await checkRateLimit("test:key", 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThanOrEqual(29);
    expect(result.retryAfterSeconds).toBeLessThanOrEqual(30);
  });

  it("floors retryAfterSeconds at 1 even if resetAt is imminent/past", async () => {
    mockDb.$queryRaw.mockResolvedValue([{ count: 6, resetAt: new Date(Date.now() - 1000) }]);

    const result = await checkRateLimit("test:key", 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBe(1);
  });

  it("passes the key and a future reset timestamp into the raw query", async () => {
    mockDb.$queryRaw.mockResolvedValue([{ count: 1, resetAt: new Date(Date.now() + 60_000) }]);

    await checkRateLimit("login:ip:1.2.3.4", 20, 300_000);
    expect(mockDb.$queryRaw).toHaveBeenCalledTimes(1);
    // Called as a tagged template: (strings, key, windowReset, now, windowReset).
    const args = mockDb.$queryRaw.mock.calls[0];
    expect(args).toContain("login:ip:1.2.3.4");
  });
});

describe("getClientIp", () => {
  it("prefers the first entry of x-forwarded-for", () => {
    const req = new Request("http://localhost", { headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1" } });
    expect(getClientIp(req)).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const req = new Request("http://localhost", { headers: { "x-real-ip": "198.51.100.9" } });
    expect(getClientIp(req)).toBe("198.51.100.9");
  });

  it("falls back to a constant when neither header is present", () => {
    const req = new Request("http://localhost");
    expect(getClientIp(req)).toBe("unknown");
  });
});

describe("rateLimitResponse", () => {
  it("returns a 429 with a Retry-After header and a JSON error body", async () => {
    const res = rateLimitResponse(42);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("42");
    const body = await res.json();
    expect(body.error).toMatch(/too many requests/i);
  });
});
