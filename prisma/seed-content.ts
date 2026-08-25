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
import { loadCurriculumMaps, listCurriculumSlugs } from "../src/lib/curriculum/loader";
import { toStorageFields, toPrismaEnums } from "../src/lib/question-engine/mapper";
import { generateAllMathsQuestions, generateAllMathsQuestionsY6, generateAllMathsQuestionsExtra, generateAllMathsQuestionsY6Extra, generateAllMathsQuestionsExtra2, generateAllMathsQuestionsY6Extra2 } from "../src/lib/content-generators/maths";
import { generateAllGrammarQuestions } from "../src/lib/content-generators/grammar";
import { generateAllMathsQuestionsY1, generateAllMathsQuestionsY1Extra, generateAllMathsQuestionsY1Extra2, generateAllMathsQuestionsY2, generateAllMathsQuestionsY2Extra, generateAllMathsQuestionsY2Extra2, generateAllMathsQuestionsY2Extra3 } from "../src/lib/content-generators/maths-ks1";
import { generateAllGrammarQuestionsY1, generateAllGrammarQuestionsY2, generateAllGrammarQuestionsY2Extra, generateAllGrammarQuestionsY2Extra2 } from "../src/lib/content-generators/grammar-ks1";
import { generateAllMathsQuestionsY3, generateAllMathsQuestionsY3Extra, generateAllMathsQuestionsY3Extra2, generateAllMathsQuestionsY3Extra3, generateAllMathsQuestionsY4, generateAllMathsQuestionsY4Extra, generateAllMathsQuestionsY4Extra2, generateAllMathsQuestionsY4Extra3 } from "../src/lib/content-generators/maths-lks2";
import { generateAllGrammarQuestionsY3, generateAllGrammarQuestionsY3Extra, generateAllGrammarQuestionsY4 } from "../src/lib/content-generators/grammar-lks2";
import { generateAllMathsQuestionsY2Strands2, generateAllMathsQuestionsY2Strands2Extra } from "../src/lib/content-generators/maths-ks1-strands2";
import { generateAllMathsQuestionsY3Strands2, generateAllMathsQuestionsY3Strands2Extra, generateAllMathsQuestionsY4Strands2, generateAllMathsQuestionsY4Strands2Extra } from "../src/lib/content-generators/maths-lks2-strands2";
import { generateAllGrammarQuestionsY2Wordbanks, generateAllGrammarQuestionsY3Wordbanks, generateAllGrammarQuestionsY4Wordbanks } from "../src/lib/content-generators/grammar-wordbanks";
import { generateAllMathsQuestionsGuyana } from "../src/lib/content-generators/maths-guyana";
import type { DraftQuestion } from "../src/lib/content-generators/types";

const db = new PrismaClient();
const CONTENT_DIR = path.join(process.cwd(), "content");

function readJson<T>(...segments: string[]): T {
  return JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, ...segments), "utf-8"));
}

/** Upserts the two known Curriculum rows and returns slug -> id. Mirrors
 * prisma/backfill-curriculum.ts's data, kept idempotent so this script stays
 * safe to run repeatedly against a live DB. */
async function ensureCurricula(): Promise<Map<string, string>> {
  const rows = [
    { slug: "cayman", name: "Cayman Islands", yearGroupLabel: "Year" },
    { slug: "guyana", name: "Guyana", yearGroupLabel: "Grade" },
  ];
  const idBySlug = new Map<string, string>();
  for (const row of rows) {
    const curriculum = await db.curriculum.upsert({
      where: { slug: row.slug },
      update: { name: row.name, yearGroupLabel: row.yearGroupLabel },
      create: row,
    });
    idBySlug.set(row.slug, curriculum.id);
  }
  return idBySlug;
}

/** Syncs subjects (shared across curricula) & topics (scoped to one
 * curriculum) for a single curriculumSlug. Returns a topicIdByKey map keyed
 * by "subjectSlug:strandSlug:yearGroup" (curriculum is implicit — the
 * caller only ever mixes this map with drafts for the same curriculum). */
async function ensureTopicsForCurriculum(curriculumSlug: string, curriculumId: string): Promise<Map<string, string>> {
  console.log(`→ Syncing subjects & topics for curriculum "${curriculumSlug}"...`);
  const maps = loadCurriculumMaps(curriculumSlug);
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
          where: { subjectId_strandSlug_yearGroup_curriculumId: { subjectId: subject.id, strandSlug: strand.slug, yearGroup: year.yearGroup, curriculumId } },
          update: { strandName: strand.name, description: strand.description, order },
          create: { subjectId: subject.id, strandSlug: strand.slug, strandName: strand.name, yearGroup: year.yearGroup, description: strand.description, order, curriculumId },
        });
        topicIdByKey.set(`${map.subjectSlug}:${strand.slug}:${year.yearGroup}`, topic.id);
        order++;
      }
    }
  }
  console.log(`  ✓ ${maps.length} subjects, ${topicIdByKey.size} topics`);
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

async function syncQuestions(topicIdByKey: Map<string, string>, drafts: DraftQuestion[]) {
  console.log("→ Syncing question bank (skipping anything already present)...");
  const existingByTopic = await loadExistingPromptsByTopic();

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

/** Builds the full Cayman draft-question list (procedural generators +
 * hand-authored JSON packs). Kept as its own function purely so main() reads
 * as "build drafts, then sync" the same way for every curriculum. */
function buildCaymanDrafts(): DraftQuestion[] {
  return [
    ...generateAllMathsQuestions(),
    ...generateAllMathsQuestionsY6(),
    ...generateAllMathsQuestionsExtra(),
    ...generateAllMathsQuestionsY6Extra(),
    ...generateAllMathsQuestionsExtra2(),
    ...generateAllMathsQuestionsY6Extra2(),
    ...generateAllMathsQuestionsY1(),
    ...generateAllMathsQuestionsY1Extra(),
    ...generateAllMathsQuestionsY2(),
    ...generateAllMathsQuestionsY2Extra(),
    ...generateAllMathsQuestionsY1Extra2(),
    ...generateAllMathsQuestionsY2Extra2(),
    ...generateAllMathsQuestionsY2Extra3(),
    ...generateAllMathsQuestionsY2Strands2(),
    ...generateAllMathsQuestionsY2Strands2Extra(),
    ...generateAllMathsQuestionsY3(),
    ...generateAllMathsQuestionsY3Extra(),
    ...generateAllMathsQuestionsY3Extra2(),
    ...generateAllMathsQuestionsY3Extra3(),
    ...generateAllMathsQuestionsY3Strands2(),
    ...generateAllMathsQuestionsY3Strands2Extra(),
    ...generateAllMathsQuestionsY4(),
    ...generateAllMathsQuestionsY4Extra(),
    ...generateAllMathsQuestionsY4Extra2(),
    ...generateAllMathsQuestionsY4Extra3(),
    ...generateAllMathsQuestionsY4Strands2(),
    ...generateAllMathsQuestionsY4Strands2Extra(),
    ...readJson<DraftQuestion[]>("questions", "cayman", "maths-authored.json"),
    ...readJson<DraftQuestion[]>("questions", "cayman", "grammar.json"),
    ...generateAllGrammarQuestions(),
    ...generateAllGrammarQuestionsY1(),
    ...generateAllGrammarQuestionsY2(),
    ...generateAllGrammarQuestionsY2Extra(),
    ...generateAllGrammarQuestionsY2Extra2(),
    ...generateAllGrammarQuestionsY2Wordbanks(),
    ...generateAllGrammarQuestionsY3(),
    ...generateAllGrammarQuestionsY3Extra(),
    ...generateAllGrammarQuestionsY3Wordbanks(),
    ...generateAllGrammarQuestionsY4(),
    ...generateAllGrammarQuestionsY4Wordbanks(),
    ...readJson<DraftQuestion[]>("questions", "cayman", "science.json"),
    ...readJson<DraftQuestion[]>("questions", "cayman", "history.json"),
    ...readJson<DraftQuestion[]>("questions", "cayman", "geography.json"),
    ...readJson<DraftQuestion[]>("questions", "cayman", "computing.json"),
  ];
}

/** Builds the full Guyana draft-question list (procedural Maths generator +
 * a hand-authored Grammar pack — see content/questions/guyana/grammar.json.
 * Reading is passage-driven, so its questions come from syncReadingPassages
 * instead of a flat draft list. */
function buildGuyanaDrafts(): DraftQuestion[] {
  return [
    ...generateAllMathsQuestionsGuyana(),
    ...readJson<DraftQuestion[]>("questions", "guyana", "grammar.json"),
  ];
}

async function syncReadingPassages(topicIdByKey: Map<string, string>, curriculumSlug: string) {
  console.log("→ Syncing reading passages & comprehension questions...");
  type PassageJson = {
    title: string;
    type: "fiction" | "non_fiction" | "poetry";
    yearGroup: "Y1" | "Y2" | "Y3" | "Y4" | "Y5" | "Y6";
    author?: string;
    bodyText: string;
    questions: (Omit<DraftQuestion, "subjectSlug" | "yearGroup"> & { subSkill: string })[];
  };
  const passages = readJson<PassageJson[]>("passages", curriculumSlug, "reading.json");
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
  const curriculumIdBySlug = await ensureCurricula();

  const caymanId = curriculumIdBySlug.get("cayman")!;
  const caymanTopics = await ensureTopicsForCurriculum("cayman", caymanId);
  await syncQuestions(caymanTopics, buildCaymanDrafts());
  await syncReadingPassages(caymanTopics, "cayman");

  // Guyana: Maths (procedural) + Grammar (hand-authored) + Reading
  // (passage-driven). Science/Social Studies aren't in scope for this pass
  // — see content/curriculum/guyana/ (no science.json etc.).
  const guyanaId = curriculumIdBySlug.get("guyana");
  if (guyanaId) {
    const guyanaTopics = await ensureTopicsForCurriculum("guyana", guyanaId);
    await syncQuestions(guyanaTopics, buildGuyanaDrafts());
    await syncReadingPassages(guyanaTopics, "guyana");
  }

  // Any further curriculum slugs on disk beyond cayman/guyana get their
  // topics synced (so they show up in admin) even before their question
  // packs exist — mirrors how content/curriculum/guyana/ started empty.
  for (const slug of listCurriculumSlugs()) {
    if (slug === "cayman" || slug === "guyana") continue;
    const curriculumId = curriculumIdBySlug.get(slug);
    if (!curriculumId) {
      console.warn(`  ! No Curriculum DB row for "${slug}" — skipping (add it to ensureCurricula()).`);
      continue;
    }
    await ensureTopicsForCurriculum(slug, curriculumId);
  }

  console.log("\nContent sync complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
