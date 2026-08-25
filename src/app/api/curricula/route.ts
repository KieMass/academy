import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/** Public, unauthenticated — the registration form needs the list of
 * curricula (country + display name) before a session exists. Nothing
 * here is sensitive; it's the same two rows shown at /admin/subjects. */
export async function GET() {
  const curricula = await db.curriculum.findMany({
    select: { slug: true, name: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ curricula });
}
