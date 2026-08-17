import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

const loginSchema = z.object({
  role: z.enum(["PARENT", "STUDENT", "ADMIN"]),
  identifier: z.string().min(1), // email for parents/admins, username for students
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { role, identifier, password } = parsed.data;

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
