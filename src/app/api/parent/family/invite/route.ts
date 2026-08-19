import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireParent } from "@/lib/auth/guards";
import { hashPassword } from "@/lib/auth/password";

const schema = z.object({
  fullName: z.string().min(1).max(100),
  email: z.string().email(),
});

/** POST /api/parent/family/invite
 *
 * Adds a co-parent to the caller's family — full, equal access to the same
 * students, no "primary" gatekeeping once added. There's no email service,
 * so this creates the account outright (like admin's password reset) and
 * returns the generated password once for the inviting parent to relay
 * directly to their co-parent. Only supports brand-new email addresses —
 * folding an already-registered, unrelated account into this family could
 * silently merge in someone else's students, so that's rejected instead. */
export async function POST(req: Request) {
  const { parentProfile } = await requireParent();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }
  const { fullName, email } = parsed.data;
  const normalisedEmail = email.toLowerCase();

  const existing = await db.user.findUnique({ where: { email: normalisedEmail } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const password = crypto.randomBytes(9).toString("base64url"); // 12 chars, URL-safe
  const passwordHash = await hashPassword(password);
  await db.user.create({
    data: {
      role: "PARENT",
      email: normalisedEmail,
      passwordHash,
      parentProfile: { create: { fullName, familyId: parentProfile.familyId } },
    },
  });

  return NextResponse.json({ email: normalisedEmail, password });
}
