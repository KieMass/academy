import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  role: z.enum(["PARENT", "STUDENT", "ADMIN"]),
  identifier: z.string().min(1), // email for parents/admins, username for students
});

/** POST /api/auth/forgot-password
 *
 * There's no email service wired up, so this can't reset anything on its
 * own — it records a request an admin can see and act on at
 * /admin/reset-requests (same generated-password flow as an admin-initiated
 * reset). Always returns the same generic response regardless of whether a
 * matching account exists, so this can't be used to probe which emails or
 * usernames are registered. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { role, identifier } = parsed.data;

  const user = await db.user.findFirst({
    where: role === "STUDENT" ? { role, username: identifier.toLowerCase() } : { role, email: identifier.toLowerCase() },
  });

  await db.passwordResetRequest.create({
    data: { identifier, userId: user?.id },
  });

  return NextResponse.json({ ok: true });
}
