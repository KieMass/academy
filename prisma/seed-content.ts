/**
 * Idempotent content sync.
 *
 * Unlike prisma/seed.ts (which inserts unconditionally and is only safe to
 * run once, against an empty database), this script can be re-run any time
 * new questions/passages are added to content/*.json — it skips anything
 * that already exists (matched by topic/passage + exact promptText) and
 * only inserts genuinely new rows. Safe to run against a live database that
 * already has real user data.
 *
 * Usage: npx tsx prisma/seed-content.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { loadCurriculumMaps, resolveTopics } from "../src/lib/curriculum/loader";
import { toStorageFields, toPrismaEnums } from "../src/lib/question-engine/mapper";
import { generateAllMathsQuestions, generateAllMathsQuestionsY6 } from "../src/lib/content-generators/maths";
import type { DraftQuestion } from "../src/lib/content-generators/types";

const db = new PrismaClient();
const CONTENT_DIR = path.join(process.cwd(), "content");

function readJson<T>(...segments: string[]): T {
  return JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, ...segments), "utf-8"));
}

async function ensureTopics(): Promise<Map<string, string>> {
  console.log("→ Syncing subjects & topics from curriculum map...");
  const maps = loadCurriculumMaps();
  const topicIdByKey = new Map<string, string>();

  for (const map of maps) {
    const subject = await db.subject.upsert({
      where: { slug: map.subjectSlug },
      update: { name: map.subjectName, icon: map.icon, color: map.color, frameworks: JSON.stringify(map.frameworks) },
      create: { slug: map.subjectSlug, name: map.subjectName, icon: map.icon, color: map.color, frameworks: JSON.stringify(map.frameworks) },
    });

    let order = 0;
    for (const strand of map.strands) {
      for (const year of strand.years) {
        const topic = await db.topic.upsert({
          where: { subjectId_strandSlug_yearGroup: { subjectId: subject.id, strandSlug: strand.slug, yearGroup: year.yearGroup } },
          update: { strandName: strand.name, description: strand.description, order },
          create: { subjectId: subject.id, strandSlug: strand.slug, strandName: strand.name, yearGroup: year.yearGroup, description: strand.description, order },
        });
        topicIdByKey.set(`${map.subjectSlug}:${strand.slug}:${year.yearGroup}`, topic.id);
        order++;
      }
    }
  }
  console.log(`  ✓ ${maps.length} subjects, ${resolveTopics().length} topics`);
  return topicIdByKey;
}

/** Existing prompt texts per topic, so we can skip questions we've already inserted. */
async function loadExistingPromptsByTopic(): Promise<Map<string, Set<string>>> {
  const rows = await db.contentQuestion.findMany({ select: { topicId: true, prompt: true } });
  const map = new Map<string, Set<string>>();
  for (const row of rows) {
    const text = (JSON.parse(row.prompt) as { text: string }).text;
    const set = map.get(row.topicId) ?? new Set<string>();
    set.add(text);
    map.set(row.topicId, set);
  }
  return map;
}

async function syncQuestions(topicIdByKey: Map<string, string>) {
  console.log("→ Syncing question bank (skipping anything already present)...");
  const existingByTopic = await loadExistingPromptsByTopic();

  const drafts: DraftQuestion[] = [
    ...generateAllMathsQuestions(),
    ...generateAllMathsQuestionsY6(),
    ...readJson<DraftQuestion[]>("questions", "maths-authored.json"),
    ...readJson<DraftQuestion[]>("questions", "grammar.json"),
    ...readJson<DraftQuestion[]>("questions", "science.json"),
    ...readJson<DraftQuestion[]>("questions", "history.json"),
    ...readJson<DraftQuestion[]>("questions", "geography.json"),
    ...readJson<DraftQuestion[]>("questions", "computing.json"),
  ];

  let created = 0;
  let skipped = 0;
  for (const draft of drafts) {
    const topicId = topicIdByKey.get(`${draft.subjectSlug}:${draft.strandSlug}:${draft.yearGroup}`);
    if (!topicId) {
      console.warn(`  ! No topic found for ${draft.subjectSlug}:${draft.strandSlug}:${draft.yearGroup} — skipping question`);
      continue;
    }
    const existing = existingByTopic.get(topicId) ?? new Set<string>();
    if (existing.has(draft.promptText)) {
      skipped++;
      continue;
    }

    const { prompt, options, answer } = toStorageFields(draft);
    const { type, difficulty } = toPrismaEnums(draft.type, draft.difficulty);
    await db.contentQuestion.create({
      data: { topicId, objectiveCode: draft.objectiveCode, type, difficulty, prompt, options, answer, explanation: draft.explanation, subSkill: draft.subSkill, source: "SEED", status: "PUBLISHED" },
    });
    existing.add(draft.promptText);
    existingByTopic.set(topicId, existing);
    created++;
  }
  console.log(`  ✓ ${created} new questions created, ${skipped} already present (skipped)`);
}

async function syncReadingPassages(topicIdByKey: Map<string, string>) {
  console.log("→ Syncing reading passages & comprehension questions...");
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

  const existingPassages = await db.readingPassage.findMany({ select: { id: true, title: true } });
  const passageIdByTitle = new Map(existingPassages.map((p) => [p.title, p.id]));
  const existingByTopic = await loadExistingPromptsByTopic();

  let passagesCreated = 0;
  let questionsCreated = 0;
  let questionsSkipped = 0;

  for (const p of passages) {
    let passageId = passageIdByTitle.get(p.title);
    if (!passageId) {
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
      passageId = passage.id;
      passageIdByTitle.set(p.title, passageId);
      passagesCreated++;
    }

    for (const q of p.questions) {
      const topicId = topicIdByKey.get(`reading:${q.strandSlug}:${p.yearGroup}`);
      if (!topicId) {
        console.warn(`  ! No topic found for reading:${q.strandSlug}:${p.yearGroup} — skipping question`);
        continue;
      }
      const existing = existingByTopic.get(topicId) ?? new Set<string>();
      if (existing.has(q.promptText)) {
        questionsSkipped++;
        continue;
      }

      const draft = { ...q, subjectSlug: "reading", yearGroup: p.yearGroup } as DraftQuestion;
      const { prompt, options, answer } = toStorageFields(draft);
      const { type, difficulty } = toPrismaEnums(draft.type, draft.difficulty);
      await db.contentQuestion.create({
        data: { topicId, objectiveCode: draft.objectiveCode, type, difficulty, prompt, options, answer, explanation: draft.explanation, subSkill: q.subSkill, passageId, source: "SEED", status: "PUBLISHED" },
      });
      existing.add(q.promptText);
      existingByTopic.set(topicId, existing);
      questionsCreated++;
    }
  }
  console.log(`  ✓ ${passagesCreated} new passages, ${questionsCreated} new reading questions (${questionsSkipped} already present, skipped)`);
}

async function main() {
  console.log("Syncing KaeLex Academy content (idempotent)...\n");
  const topicIdByKey = await ensureTopics();
  await syncQuestions(topicIdByKey);
  await syncReadingPassages(topicIdByKey);
  console.log("\nContent sync complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
