/**
 * Curriculum Map type definitions.
 *
 * This is the load-bearing abstraction of the whole platform: every subject,
 * topic, question, passage and spelling list is tagged against a curriculum
 * map entry rather than hard-coded to "Year 5". When the student moves up a
 * year group, we add a new `years[]` entry (and matching content packs) to
 * these JSON files — nothing in `src/app` or `src/components` changes.
 *
 * Source of truth: JSON files in `content/curriculum/*.json`, validated
 * against these types at build/seed time (see `lib/curriculum/loader.ts`).
 */

/** Key Stage 2 year groups. Extend this union (not the app code) to support
 *  Year 3/4 catch-up content or Year 6 progression later. */
export const YEAR_GROUPS = ["Y3", "Y4", "Y5", "Y6"] as const;
export type YearGroup = (typeof YEAR_GROUPS)[number];

export const DIFFICULTY_BANDS = ["bronze", "silver", "gold", "challenge"] as const;
export type DifficultyBand = (typeof DIFFICULTY_BANDS)[number];

export const QUESTION_TYPES = [
  "multiple_choice",
  "fill_in_box",
  "multi_step",
  "drag_drop",
  "matching",
  "short_answer",
] as const;
export type QuestionTypeSlug = (typeof QUESTION_TYPES)[number];

/** A single, assessable curriculum reference point (~NC "pupils should be
 *  taught to..." statement, PUMA/GAPS style skill, or PIRA content-domain
 *  code). Questions and passages tag themselves against `code`. */
export interface CurriculumObjective {
  code: string; // e.g. "MA5-NPV-1"
  description: string;
  difficultyBands: DifficultyBand[];
  questionTypes: QuestionTypeSlug[];
  notes?: string; // e.g. Cayman-specific framing, PUMA/PIRA/GAPS provenance
}

export interface CurriculumStrandYear {
  yearGroup: YearGroup;
  objectives: CurriculumObjective[];
}

/** A strand/topic family (e.g. "Fractions", "Inference", "Fronted
 *  Adverbials", "Vikings"). One strand spans multiple year groups. */
export interface CurriculumStrand {
  slug: string;
  name: string;
  description?: string;
  years: CurriculumStrandYear[];
}

export interface SubjectCurriculumMap {
  subjectSlug: string;
  subjectName: string;
  /** Frameworks this subject content is aligned to, for display/attribution. */
  frameworks: string[];
  icon: string; // lucide-react icon name
  color: string; // tailwind color token, e.g. "sky"
  strands: CurriculumStrand[];
}

/** A resolved (strand, yearGroup) pair — what the UI actually renders as a
 *  "topic". Produced by flattening the curriculum map at load time. */
export interface ResolvedTopic {
  subjectSlug: string;
  subjectName: string;
  strandSlug: string;
  strandName: string;
  yearGroup: YearGroup;
  objectives: CurriculumObjective[];
}
