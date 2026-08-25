import { describe, it, expect, beforeEach, vi } from "vitest";
import type { MockDb } from "../mocks/prisma";

vi.mock("@/lib/db", async () => {
  const { createMockDb } = await import("../mocks/prisma");
  return { db: createMockDb() };
});
vi.mock("@/lib/auth/password", () => ({ hashPassword: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ createSession: vi.fn() }));

const { db: mockDb } = (await import("@/lib/db")) as unknown as { db: MockDb };
const { hashPassword } = (await import("@/lib/auth/password")) as unknown as { hashPassword: ReturnType<typeof vi.fn> };
const { createSession } = (await import("@/lib/auth/session")) as unknown as { createSession: ReturnType<typeof vi.fn> };

const { POST } = await import("@/app/api/auth/register-parent/route");

function request(body: unknown): Request {
  return new Request("http://localhost/api/auth/register-parent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = { fullName: "Jamie Parent", email: "Jamie@Example.com", password: "correcthorsebattery", curriculumSlug: "guyana" };

beforeEach(() => {
  vi.clearAllMocks();
  hashPassword.mockResolvedValue("hashed-password");
  createSession.mockResolvedValue(undefined);
});

describe("POST /api/auth/register-parent", () => {
  it("400s when the password is too short", async () => {
    const res = await POST(request({ ...VALID_BODY, password: "short" }));
    expect(res.status).toBe(400);
    expect(mockDb.curriculum.findUnique).not.toHaveBeenCalled();
  });

  it("400s when curriculumSlug is missing", async () => {
    const { curriculumSlug: _curriculumSlug, ...withoutCurriculum } = VALID_BODY;
    const res = await POST(request(withoutCurriculum));
    expect(res.status).toBe(400);
  });

  it("400s when the curriculum slug doesn't exist", async () => {
    mockDb.curriculum.findUnique.mockResolvedValue(null);
    const res = await POST(request(VALID_BODY));
    expect(res.status).toBe(400);
    expect(mockDb.user.findUnique).not.toHaveBeenCalled();
    expect(mockDb.user.create).not.toHaveBeenCalled();
  });

  it("409s when an account with that email already exists", async () => {
    mockDb.curriculum.findUnique.mockResolvedValue({ id: "curr-1", slug: "guyana" });
    mockDb.user.findUnique.mockResolvedValue({ id: "existing-user" });
    const res = await POST(request(VALID_BODY));
    expect(res.status).toBe(409);
    expect(mockDb.user.create).not.toHaveBeenCalled();
  });

  it("lower-cases the email for both the duplicate check and the created account", async () => {
    mockDb.curriculum.findUnique.mockResolvedValue({ id: "curr-1", slug: "guyana" });
    mockDb.user.findUnique.mockResolvedValue(null);
    mockDb.user.create.mockResolvedValue({ id: "new-user" });

    await POST(request(VALID_BODY));

    expect(mockDb.user.findUnique).toHaveBeenCalledWith({ where: { email: "jamie@example.com" } });
    expect(mockDb.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ email: "jamie@example.com" }) })
    );
  });

  it("creates the family with the resolved curriculum id and starts a session on success", async () => {
    mockDb.curriculum.findUnique.mockResolvedValue({ id: "curr-guyana-id", slug: "guyana" });
    mockDb.user.findUnique.mockResolvedValue(null);
    mockDb.user.create.mockResolvedValue({ id: "new-user-id" });

    const res = await POST(request(VALID_BODY));
    expect(res.status).toBe(200);

    expect(mockDb.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          role: "PARENT",
          parentProfile: { create: { fullName: "Jamie Parent", family: { create: { curriculumId: "curr-guyana-id" } } } },
        }),
      })
    );
    expect(createSession).toHaveBeenCalledWith("new-user-id");
  });

  it("never stores the plaintext password", async () => {
    mockDb.curriculum.findUnique.mockResolvedValue({ id: "curr-1", slug: "guyana" });
    mockDb.user.findUnique.mockResolvedValue(null);
    mockDb.user.create.mockResolvedValue({ id: "new-user" });

    await POST(request(VALID_BODY));

    expect(hashPassword).toHaveBeenCalledWith("correcthorsebattery");
    const createArgs = mockDb.user.create.mock.calls[0][0];
    expect(createArgs.data.passwordHash).toBe("hashed-password");
    expect(JSON.stringify(createArgs)).not.toContain("correcthorsebattery");
  });
});
