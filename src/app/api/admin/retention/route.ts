import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { getRetentionSetting, setRetentionSetting } from "@/lib/retention";

const schema = z.object({
  mode: z.enum(["ASSIGNMENT_COUNT", "DAYS"]),
  value: z.number().int().min(1).max(3650),
});

export async function GET() {
  await requireAdmin();
  const setting = await getRetentionSetting();
  return NextResponse.json({ setting });
}

export async function PATCH(req: Request) {
  await requireAdmin();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const setting = await setRetentionSetting(parsed.data.mode, parsed.data.value);
  return NextResponse.json({ setting });
}
