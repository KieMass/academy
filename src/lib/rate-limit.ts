import "server-only";
import { db } from "@/lib/db";

/**
 * Fixed-window rate limiting backed by Postgres (see the RateLimitBucket
 * model). An in-memory counter would not work here: this app runs on
 * Vercel's serverless functions, where separate invocations don't share
 * process memory, so a counter kept in a module-level variable resets
 * per-instance and gives essentially no protection under real traffic.
 *
 * The window/reset logic is done in a single atomic upsert (Postgres'
 * `INSERT ... ON CONFLICT DO UPDATE`) so concurrent requests for the same
 * key can't race past each other between a read and a write.
 */

export interface RateLimitResult {
  allowed: boolean;
  /** Only set when `allowed` is false. */
  retryAfterSeconds?: number;
}

export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const now = new Date();
  const windowReset = new Date(now.getTime() + windowMs);

  const rows = await db.$queryRaw<{ count: number; resetAt: Date }[]>`
    INSERT INTO "RateLimitBucket" ("key", "count", "resetAt", "updatedAt")
    VALUES (${key}, 1, ${windowReset}, now())
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimitBucket"."resetAt" <= ${now} THEN 1 ELSE "RateLimitBucket"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimitBucket"."resetAt" <= ${now} THEN ${windowReset} ELSE "RateLimitBucket"."resetAt" END,
      "updatedAt" = now()
    RETURNING "count", "resetAt"
  `;

  const row = rows[0];
  if (!row || row.count <= limit) {
    return { allowed: true };
  }
  const retryAfterSeconds = Math.max(1, Math.ceil((row.resetAt.getTime() - now.getTime()) / 1000));
  return { allowed: false, retryAfterSeconds };
}

/** Best-effort client IP from the headers Vercel/most proxies set. Falls
 *  back to a constant so requests without either header still share one
 *  (very lenient) bucket instead of bypassing rate limiting entirely. */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export function rateLimitResponse(retryAfterSeconds: number) {
  return new Response(JSON.stringify({ error: "Too many requests. Please try again shortly." }), {
    status: 429,
    headers: { "Content-Type": "application/json", "Retry-After": String(retryAfterSeconds) },
  });
}
