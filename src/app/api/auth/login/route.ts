import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

const loginSchema = z.object({
  role: z.enum(["PARENT", "STUDENT", "ADMIN"]),
  identifier: z.string().min(1), // email for parents/admins, username for students
  password: z.string().min(1),
});

// Two windows: a looser per-IP cap (stops one attacker rattling through many
// accounts) and a tighter per-account cap (stops one account being
// brute-forced from rotating IPs/proxies). Both are checked before touching
// the DB for the actual credential lookup.
const IP_LIMIT = 20;
const IP_WINDOW_MS = 5 * 60 * 1000;
const ACCOUNT_LIMIT = 8;
const ACCOUNT_WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { role, identifier, password } = parsed.data;

  const ip = getClientIp(req);
  const ipCheck = await checkRateLimit(`login:ip:${ip}`, IP_LIMIT, IP_WINDOW_MS);
  if (!ipCheck.allowed) return rateLimitResponse(ipCheck.retryAfterSeconds!);

  const accountCheck = await checkRateLimit(`login:account:${role}:${identifier.toLowerCase()}`, ACCOUNT_LIMIT, ACCOUNT_WINDOW_MS);
  if (!accountCheck.allowed) return rateLimitResponse(accountCheck.retryAfterSeconds!);

  const user = await db.user.findFirst({
    where: role === "STUDENT" ? { role, username: identifier.toLowerCase() } : { role, email: identifier.toLowerCase() },
  });

  if (!user) {
    return NextResponse.json({ error: "Incorrect login details. Please try again." }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Incorrect login details. Please try again." }, { status: 401 });
  }

  await createSession(user.id);

  return NextResponse.json({ ok: true, role: user.role });
}
