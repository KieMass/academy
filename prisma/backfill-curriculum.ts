/**
 * One-off data migration, step 2 of 3 for multi-country curriculum support
 * (see prisma/migrations/20260824235300_add_curriculum_nullable and the
 * follow-up migration that tightens curriculumId to required):
 *
 *   1. Schema migration adds Curriculum + nullable Topic/Family.curriculumId
 *   2. THIS SCRIPT: create the Curriculum rows, backfill every existing
 *      Topic/Family row to "cayman" (the only curriculum that existed
 *      before this change — everything in the app to date is Cayman
 *      Islands / UK-National-Curriculum-derived content)
 *   3. Schema migration makes curriculumId required + adds the composite
 *      unique index for real
 *
 * Usage: npx tsx prisma/backfill-curriculum.ts
 */
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const cayman = await db.curriculum.upsert({
    where: { slug: "cayman" },
    update: {},
    create: { slug: "cayman", name: "Cayman Islands", yearGroupLabel: "Year", description: "UK National Curriculum-derived, Cayman Islands Y5/Y6 expectations, PUMA/PIRA/GAPS-style assessment." },
  });
  const guyana = await db.curriculum.upsert({
    where: { slug: "guyana" },
    update: {},
    create: { slug: "guyana", name: "Guyana", yearGroupLabel: "Grade", description: "Guyana Ministry of Education National Curriculum Framework, CXC/NGSA-aligned." },
  });
  console.log(`Curricula ready: ${cayman.name} (${cayman.id}), ${guyana.name} (${guyana.id})`);

  const topicResult = await db.topic.updateMany({ where: { curriculumId: null }, data: { curriculumId: cayman.id } });
  console.log(`Backfilled ${topicResult.count} Topic rows to Cayman.`);

  const familyResult = await db.family.updateMany({ where: { curriculumId: null }, data: { curriculumId: cayman.id } });
  console.log(`Backfilled ${familyResult.count} Family rows to Cayman.`);

  const remainingTopics = await db.topic.count({ where: { curriculumId: null } });
  const remainingFamilies = await db.family.count({ where: { curriculumId: null } });
  console.log(`\nRemaining NULL curriculumId — Topic: ${remainingTopics}, Family: ${remainingFamilies} (must both be 0 before the next migration).`);
  if (remainingTopics > 0 || remainingFamilies > 0) process.exit(1);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
