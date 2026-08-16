import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  DIFFICULTY_BANDS,
  QUESTION_TYPES,
  YEAR_GROUPS,
  type ResolvedTopic,
  type SubjectCurriculumMap,
  type YearGroup,
} from "./types";

/**
 * Loads and validates content/curriculum/*.json — the single source of truth
 * for every subject, strand and year group in the platform.
 *
 * IMPORTANT: this is the only place that should ever read curriculum JSON
 * from disk. Everything else (API routes, server components, the seed
 * script) should import from here so there is exactly one place to change
 * when the on-disk layout evolves.
 */

const CURRICULUM_DIR = path.join(process.cwd(), "content", "curriculum");

const objectiveSchema = z.object({
  code: z.string(),
  description: z.string(),
  difficultyBands: z.array(z.enum(DIFFICULTY_BANDS)).min(1),
  questionTypes: z.array(z.enum(QUESTION_TYPES)).min(1),
  notes: z.string().optional(),
});

const strandYearSchema = z.object({
  yearGroup: z.enum(YEAR_GROUPS),
  objectives: z.array(objectiveSchema).min(1),
});

const strandSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string().optional(),
  years: z.array(strandYearSchema).min(1),
});

const subjectMapSchema = z.object({
  subjectSlug: z.string(),
  subjectName: z.string(),
  frameworks: z.array(z.string()),
  icon: z.string(),
  color: z.string(),
  strands: z.array(strandSchema).min(1),
});

let cache: SubjectCurriculumMap[] | null = null;

/** Reads and validates every curriculum map JSON file. Cached after first call. */
export function loadCurriculumMaps(): SubjectCurriculumMap[] {
  if (cache) return cache;

  if (!fs.existsSync(CURRICULUM_DIR)) {
    throw new Error(`Curriculum directory not found: ${CURRICULUM_DIR}`);
  }

  const files = fs.readdirSync(CURRICULUM_DIR).filter((f) => f.endsWith(".json"));
  const maps: SubjectCurriculumMap[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(CURRICULUM_DIR, file), "utf-8");
    const parsed = subjectMapSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      throw new Error(`Invalid curriculum map in ${file}: ${parsed.error.message}`);
    }
    maps.push(parsed.data);
  }

  cache = maps.sort((a, b) => a.subjectName.localeCompare(b.subjectName));
  return cache;
}

/** Clears the in-memory cache — used by the seed script / tests. */
export function clearCurriculumCache() {
  cache = null;
}

export function getSubjectMap(subjectSlug: string): SubjectCurriculumMap | undefined {
  return loadCurriculumMaps().find((m) => m.subjectSlug === subjectSlug);
}

export function listSubjects(): Pick<SubjectCurriculumMap, "subjectSlug" | "subjectName" | "icon" | "color" | "frameworks">[] {
  return loadCurriculumMaps().map(({ subjectSlug, subjectName, icon, color, frameworks }) => ({
    subjectSlug,
    subjectName,
    icon,
    color,
    frameworks,
  }));
}

/**
 * Flattens (strand x yearGroup) pairs into the "topics" the UI renders.
 * Pass a yearGroup to scope to a single student's current year; omit it to
 * get every topic across every year group (used by the seed script and
 * parent-facing "assign from any year" tools).
 */
export function resolveTopics(opts?: { subjectSlug?: string; yearGroup?: YearGroup }): ResolvedTopic[] {
  const maps = loadCurriculumMaps().filter(
    (m) => !opts?.subjectSlug || m.subjectSlug === opts.subjectSlug
  );

  const topics: ResolvedTopic[] = [];
  for (const subject of maps) {
    for (const strand of subject.strands) {
      for (const year of strand.years) {
        if (opts?.yearGroup && year.yearGroup !== opts.yearGroup) continue;
        topics.push({
          subjectSlug: subject.subjectSlug,
          subjectName: subject.subjectName,
          strandSlug: strand.slug,
          strandName: strand.name,
          yearGroup: year.yearGroup,
          objectives: year.objectives,
        });
      }
    }
  }
  return topics;
}

export function getObjectiveByCode(code: string) {
  for (const topic of resolveTopics()) {
    const objective = topic.objectives.find((o) => o.code === code);
    if (objective) return { topic, objective };
  }
  return undefined;
}
