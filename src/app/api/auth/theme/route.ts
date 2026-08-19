import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { isValidColorScheme } from "@/lib/theme/color-schemes";

const schema = z.object({ colorScheme: z.string() });

/** POST /api/auth/theme
 *
 * Persists a colour scheme choice on the account (any logged-in role), so
 * it follows the user across devices — unlike the accessibility prefs,
 * which are deliberately per-device (see accessibility-store.ts). Applied
 * server-side on the next request via app/layout.tsx reading it back into
 * html[data-theme-color]; the client also flips the attribute immediately
 * for an instant preview rather than waiting on a navigation. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success || !isValidColorScheme(parsed.data.colorScheme)) {
    return NextResponse.json({ error: "Invalid colour scheme." }, { status: 400 });
  }

  await db.user.update({ where: { id: user.id }, data: { colorScheme: parsed.data.colorScheme } });
  return NextResponse.json({ ok: true });
}
