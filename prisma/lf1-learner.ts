import type { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";
import { hashPassword } from "../src/lib/auth/password";

/**
 * Seeds the single LF1 Study learner account (username "fanell", role
 * LEARNER). Same one-time-password rule as the admin account in seed.ts:
 * the password is generated and printed only when the account is first
 * created, never reset by re-runs. Set LF1_LEARNER_PASSWORD before the
 * first run to choose it yourself; LF1_LEARNER_USERNAME /
 * LF1_LEARNER_NAME override the defaults.
 *
 * Idempotent, and safe to run against production on its own via
 * `npm run db:seed-lf1` (it doesn't touch any other content).
 */
export async function seedLf1Learner(db: PrismaClient) {
  console.log("→ Seeding LF1 Study learner account...");
  const username = (process.env.LF1_LEARNER_USERNAME ?? "fanell").toLowerCase();
  const displayName = process.env.LF1_LEARNER_NAME ?? "Fanell";

  const existing = await db.user.findUnique({ where: { username }, include: { learnerProfile: true } });
  if (existing) {
    if (existing.role !== "LEARNER") {
      throw new Error(`Username "${username}" is already used by a ${existing.role} account — set LF1_LEARNER_USERNAME to pick another.`);
    }
    if (!existing.learnerProfile) {
      await db.learnerProfile.create({ data: { userId: existing.id, displayName } });
    }
    console.log(`  ✓ LF1 learner already exists (${username}) — leaving password untouched`);
    return;
  }

  const password = process.env.LF1_LEARNER_PASSWORD ?? crypto.randomBytes(9).toString("base64url");
  const passwordHash = await hashPassword(password);
  await db.user.create({
    data: { role: "LEARNER", username, passwordHash, learnerProfile: { create: { displayName } } },
  });

  console.log("  ✓ LF1 learner account created (log in at /lf1/login):");
  console.log(`    Username → ${username}`);
  console.log(`    Password → ${password}`);
  console.log("    (shown once — save it now; re-running the seed will not print it again)");
}
