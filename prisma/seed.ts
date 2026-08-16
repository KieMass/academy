/**
 * Database seed script.
 *
 * This script NEVER hard-codes "Year 5" content. It:
 *   1. Reads content/curriculum/*.json (via lib/curriculum/loader) and
 *      materialises Subject + Topic rows for every (subject, strand, year
 *      group) combination it finds.
 *   2. Reads content/questions/*.json + procedurally generated maths
 *      questions and inserts them against the Topic they declare.
 *   3. Reads content/passages/reading.json and content/spelling/lists.json.
 *   4. Seeds a starter badge set and a demo parent + student account.
 *
 * Adding Year 6: drop new entries into the content/curriculum/*.json files
 * and new question packs tagged "yearGroup": "Y6", then re-run this script.
 * No changes below are required.
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { loadCurriculumMaps, resolveTopics } from "../src/lib/curriculum/loader";
import { toStorageFields, toPrismaEnums } from "../src/lib/question-engine/mapper";
import { generateAllMathsQuestions } from "../src/lib/content-generators/maths";
import type { DraftQuestion } from "../src/lib/content-generators/types";
import { hashPassword } from "../src/lib/auth/password";

const db = new PrismaClient();
const CONTENT_DIR = path.join(process.cwd(), "content");

function readJson<T>(...segments: string[]): T {
  return JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, ...segments), "utf-8"));
}

async function seedSubjectsAndTopics() {
  console.log("→ Seeding subjects & topics from curriculum map...");
  const maps = loadCurriculumMaps();
  const topicIdByKey = new Map<string, string>();

  for (const map of maps) {
    const subject = await db.subject.upsert({
      where: { slug: map.subjectSlug },
      update: { name: map.subjectName, icon: map.icon, color: map.color, frameworks: JSON.stringify(map.frameworks) },
      create: {
        slug: map.subjectSlug,
        name: map.subjectName,
        icon: map.icon,
        color: map.color,
        frameworks: JSON.stringify(map.frameworks),
      },
    });

    let order = 0;
    for (const strand of map.strands) {
      for (const year of strand.years) {
        const topic = await db.topic.upsert({
          where: { subjectId_strandSlug_yearGroup: { subjectId: subject.id, strandSlug: strand.slug, yearGroup: year.yearGroup } },
          update: { strandName: strand.name, description: strand.description, order },
          create: {
            subjectId: subject.id,
            strandSlug: strand.slug,
            strandName: strand.name,
            yearGroup: year.yearGroup,
            description: strand.description,
            order,
          },
        });
        topicIdByKey.set(`${map.subjectSlug}:${strand.slug}:${year.yearGroup}`, topic.id);
        order++;
      }
    }
  }

  console.log(`  ✓ ${maps.length} subjects, ${resolveTopics().length} topics`);
  return topicIdByKey;
}

async function seedQuestions(topicIdByKey: Map<string, string>) {
  console.log("→ Seeding question bank...");

  const drafts: DraftQuestion[] = [
    ...generateAllMathsQuestions(),
    ...readJson<DraftQuestion[]>("questions", "maths-authored.json"),
    ...readJson<DraftQuestion[]>("questions", "grammar.json"),
    ...readJson<DraftQuestion[]>("questions", "science.json"),
    ...readJson<DraftQuestion[]>("questions", "history.json"),
    ...readJson<DraftQuestion[]>("questions", "geography.json"),
    ...readJson<DraftQuestion[]>("questions", "computing.json"),
  ];

  let created = 0;
  for (const draft of drafts) {
    const topicId = topicIdByKey.get(`${draft.subjectSlug}:${draft.strandSlug}:${draft.yearGroup}`);
    if (!topicId) {
      console.warn(`  ! No topic found for ${draft.subjectSlug}:${draft.strandSlug}:${draft.yearGroup} — skipping question`);
      continue;
    }
    const { prompt, options, answer } = toStorageFields(draft);
    const { type, difficulty } = toPrismaEnums(draft.type, draft.difficulty);

    await db.contentQuestion.create({
      data: {
        topicId,
        objectiveCode: draft.objectiveCode,
        type,
        difficulty,
        prompt,
        options,
        answer,
        explanation: draft.explanation,
        subSkill: draft.subSkill,
        source: "SEED",
        status: "PUBLISHED",
      },
    });
    created++;
  }
  console.log(`  ✓ ${created} questions created`);
}

async function seedReadingPassages(topicIdByKey: Map<string, string>) {
  console.log("→ Seeding reading passages & comprehension questions...");
  type PassageJson = {
    title: string;
    type: "fiction" | "non_fiction" | "poetry";
    yearGroup: "Y3" | "Y4" | "Y5" | "Y6";
    author?: string;
    bodyText: string;
    questions: (Omit<DraftQuestion, "subjectSlug" | "yearGroup"> & { subSkill: string })[];
  };
  const passages = readJson<PassageJson[]>("passages", "reading.json");
  const typeMap = { fiction: "FICTION", non_fiction: "NON_FICTION", poetry: "POETRY" } as const;

  let passageCount = 0;
  let questionCount = 0;
  for (const p of passages) {
    const passage = await db.readingPassage.create({
      data: {
        title: p.title,
        type: typeMap[p.type],
        yearGroup: p.yearGroup,
        bodyText: p.bodyText,
        wordCount: p.bodyText.trim().split(/\s+/).length,
        author: p.author,
        source: "SEED",
        status: "PUBLISHED",
      },
    });
    passageCount++;

    for (const q of p.questions) {
      const topicId = topicIdByKey.get(`reading:${q.strandSlug}:${p.yearGroup}`);
      if (!topicId) {
        console.warn(`  ! No topic found for reading:${q.strandSlug}:${p.yearGroup} — skipping question`);
        continue;
      }
      const draft = { ...q, subjectSlug: "reading", yearGroup: p.yearGroup } as DraftQuestion;
      const { prompt, options, answer } = toStorageFields(draft);
      const { type, difficulty } = toPrismaEnums(draft.type, draft.difficulty);
      await db.contentQuestion.create({
        data: {
          topicId,
          objectiveCode: draft.objectiveCode,
          type,
          difficulty,
          prompt,
          options,
          answer,
          explanation: draft.explanation,
          subSkill: q.subSkill,
          passageId: passage.id,
          source: "SEED",
          status: "PUBLISHED",
        },
      });
      questionCount++;
    }
  }
  console.log(`  ✓ ${passageCount} passages, ${questionCount} reading questions`);
}

async function seedSpellingLists() {
  console.log("→ Seeding spelling lists...");
  type SpellingListJson = {
    weekLabel: string;
    yearGroup: "Y3" | "Y4" | "Y5" | "Y6";
    strandSlug: string;
    words: { word: string; definition?: string; exampleSentence?: string }[];
  };
  const lists = readJson<SpellingListJson[]>("spelling", "lists.json");
  for (const list of lists) {
    await db.spellingList.create({
      data: {
        weekLabel: list.weekLabel,
        yearGroup: list.yearGroup,
        strandSlug: list.strandSlug,
        words: JSON.stringify(list.words),
        source: "SEED",
      },
    });
  }
  console.log(`  ✓ ${lists.length} spelling lists`);
}

const STARTER_BADGES = [
  { slug: "first-steps", name: "First Steps", description: "Complete your very first question.", icon: "Footprints", criteria: JSON.stringify({ type: "questions_answered", count: 1 }) },
  { slug: "on-a-roll", name: "On a Roll", description: "Answer 10 questions correctly in a row.", icon: "Flame", criteria: JSON.stringify({ type: "correct_streak", count: 10 }) },
  { slug: "bronze-collector", name: "Bronze Collector", description: "Complete 20 Bronze-level questions.", icon: "Medal", criteria: JSON.stringify({ type: "difficulty_completed", difficulty: "bronze", count: 20 }) },
  { slug: "gold-star", name: "Gold Star", description: "Complete 10 Gold-level questions.", icon: "Star", criteria: JSON.stringify({ type: "difficulty_completed", difficulty: "gold", count: 10 }) },
  { slug: "week-streak", name: "7-Day Streak", description: "Practise for 7 days in a row.", icon: "CalendarCheck", criteria: JSON.stringify({ type: "streak_days", count: 7 }) },
  { slug: "maths-master", name: "Maths Explorer", description: "Reach Secure mastery in 5 maths topics.", icon: "Calculator", criteria: JSON.stringify({ type: "topics_mastered", subjectSlug: "maths", count: 5 }) },
  { slug: "bookworm", name: "Bookworm", description: "Complete comprehension questions on 5 reading passages.", icon: "BookOpen", criteria: JSON.stringify({ type: "passages_completed", count: 5 }) },
  { slug: "spelling-bee", name: "Spelling Bee", description: "Score 100% on a spelling test.", icon: "SpellCheck", criteria: JSON.stringify({ type: "spelling_test_perfect", count: 1 }) },
];

async function seedBadges() {
  console.log("→ Seeding badges...");
  for (const badge of STARTER_BADGES) {
    await db.badge.upsert({ where: { slug: badge.slug }, update: badge, create: badge });
  }
  console.log(`  ✓ ${STARTER_BADGES.length} badges`);
}

async function seedDemoAccounts() {
  console.log("→ Seeding demo parent + student account...");
  const parentPassword = await hashPassword("Parent123!");
  const studentPassword = await hashPassword("student123");

  const parentUser = await db.user.upsert({
    where: { email: "parent@kaelex.demo" },
    update: {},
    create: {
      role: "PARENT",
      email: "parent@kaelex.demo",
      passwordHash: parentPassword,
      parentProfile: { create: { fullName: "Demo Parent" } },
    },
    include: { parentProfile: true },
  });

  const parentProfileId = parentUser.parentProfile!.id;

  await db.user.upsert({
    where: { username: "alex" },
    update: {},
    create: {
      role: "STUDENT",
      username: "alex",
      passwordHash: studentPassword,
      studentProfile: {
        create: {
          displayName: "Alex",
          avatarEmoji: "🦎",
          yearGroup: "Y5",
          parentId: parentProfileId,
        },
      },
    },
  });

  console.log("  ✓ Demo accounts ready:");
  console.log("    Parent  → email: parent@kaelex.demo   password: Parent123!");
  console.log("    Student → username: alex               password: student123");
}

async function main() {
  console.log("Seeding KaeLex Academy database...\n");
  const topicIdByKey = await seedSubjectsAndTopics();
  await seedQuestions(topicIdByKey);
  await seedReadingPassages(topicIdByKey);
  await seedSpellingLists();
  await seedBadges();
  await seedDemoAccounts();
  console.log("\nSeed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
