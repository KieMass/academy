import type { YearGroup } from "@/lib/curriculum/types";
import type { AnyQuestion, DistributiveOmit } from "@/lib/question-engine/types";

/**
 * What a content generator (procedural today, AI-backed tomorrow — see
 * lib/ai-content/) produces: a question keyed by curriculum coordinates
 * instead of a database topicId, so it can be seeded before any Topic rows
 * exist. `prisma/seed.ts` resolves subjectSlug+strandSlug+yearGroup -> topicId.
 */
export type DraftQuestion = DistributiveOmit<AnyQuestion, "id" | "topicId"> & {
  subjectSlug: string;
  strandSlug: string;
  yearGroup: YearGroup;
};

export type QuestionGenerator = () => DraftQuestion[];
