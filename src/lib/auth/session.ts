import "server-only";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const SESSION_COOKIE = "rba_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export async function createSession(userId: string) {
  const session = await db.session.create({
    data: {
      userId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: session.expiresAt,
    path: "/",
  });

  return session;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await db.session.delete({ where: { id: sessionId } }).catch(() => {
      // Session already gone — fine.
    });
  }
  cookieStore.delete(SESSION_COOKIE);
}

/** Returns the logged-in User (with role) for the current request, or null. */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const session = await db.session.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        include: {
          parentProfile: { include: { family: { include: { curriculum: true } } } },
          studentProfile: { include: { parent: { include: { family: { include: { curriculum: true } } } } } },
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return session.user;
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** Family.curriculumId is a required DB column, so this is a defensive
 * fallback only (e.g. a raw query that skips the include) — it should never
 * actually be needed in practice. */
export const DEFAULT_CURRICULUM_SLUG = "cayman";
export const DEFAULT_YEAR_GROUP_LABEL = "Year";
