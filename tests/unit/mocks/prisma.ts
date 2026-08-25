import { vi } from "vitest";

/**
 * A minimal, hand-rolled fake Prisma client — just the model methods our
 * API route tests actually call, each a `vi.fn()` with no default
 * implementation. Individual tests set behaviour with
 * `mockResolvedValue`/`mockResolvedValueOnce`.
 *
 * Route tests mock only two boundaries — this db and `@/lib/auth/guards` or
 * `@/lib/auth/session` — and let every other lib module (grade.ts,
 * mastery.ts, gamification/*, content-gap.ts, mapper.ts) run for real
 * against the fake db. That exercises the actual wiring between them
 * instead of just asserting the route calls the right mocked functions.
 *
 * Call this inside a per-test-file `vi.hoisted()` block, since
 * `vi.mock("@/lib/db", ...)` is itself hoisted above the file's imports and
 * can only reference hoisted values.
 */
export function createMockDb() {
  return {
    assignment: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    contentQuestion: { findUnique: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), groupBy: vi.fn(), count: vi.fn() },
    questionAttempt: { create: vi.fn(), findMany: vi.fn(), count: vi.fn() },
    topicMastery: { findUnique: vi.fn(), upsert: vi.fn(), count: vi.fn() },
    studentProfile: { findUniqueOrThrow: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn(), count: vi.fn() },
    contentGapAlert: { findFirst: vi.fn(), create: vi.fn() },
    xpEvent: { create: vi.fn() },
    badge: { findMany: vi.fn() },
    studentBadge: { findMany: vi.fn(), create: vi.fn() },
    spellingRun: { findMany: vi.fn() },
    curriculum: { findUnique: vi.fn(), findMany: vi.fn() },
    family: { update: vi.fn(), findUnique: vi.fn(), count: vi.fn() },
    user: { findUnique: vi.fn(), create: vi.fn() },
    parentProfile: { findMany: vi.fn() },
    topic: { findFirst: vi.fn(), findMany: vi.fn(), findUnique: vi.fn() },
    subject: { findUnique: vi.fn(), findMany: vi.fn() },
  };
}

export type MockDb = ReturnType<typeof createMockDb>;
