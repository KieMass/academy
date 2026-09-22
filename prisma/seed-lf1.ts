/**
 * Creates the LF1 Study learner account on its own — for databases that
 * were seeded before LF1 existed (e.g. production, where the full seed
 * never re-runs). Usage: `npm run db:seed-lf1`. See prisma/lf1-learner.ts.
 */
import { PrismaClient } from "@prisma/client";
import { seedLf1Learner } from "./lf1-learner";

const db = new PrismaClient();

seedLf1Learner(db)
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
