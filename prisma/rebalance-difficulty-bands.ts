/**
 * One-off content fix: many topics have curriculum-declared difficulty
 * bands (content/curriculum/*.json objective.difficultyBands) that are
 * genuinely empty in the live DB — usually because a whole batch of
 * generated/hand-authored content for an objective was tagged with one
 * fixed difficulty (e.g. every fronted-adverbials Y4 question is Silver,
 * every maths addition Y2 question skipped Challenge entirely). That's a
 * real gap, not a display bug: the student-facing difficulty picker
 * (QuestionRunner) now only offers bands with content, so an empty
 * declared band is a level a student can never actually reach, not a level
 * that gracefully falls back.
 *
 * Rather than hand-author fresh questions for every gap (141 cells across
 * 106 topics — infeasible to do well in one pass), this reassigns a
 * *modest* share of each gap's nearest already-populated band (by rank
 * distance: Bronze < Silver < Gold < Challenge) into the empty band. This
 * is a difficulty-label change only — no prompt/answer/explanation
 * content is touched — and is deliberately conservative: it never takes
 * more than ~30% of a source band, and never drains a source below 2
 * remaining questions (unless it only had 1-2 to begin with), so the
 * original, more carefully considered distribution stays largely intact
 * and only genuinely-thin/empty bands get topped up.
 *
 * Usage:
 *   npx tsx prisma/rebalance-difficulty-bands.ts --check   (report only)
 *   npx tsx prisma/rebalance-difficulty-bands.ts           (apply)
 */
import { PrismaClient } from "@prisma/client";
import { loadCurriculumMaps } from "../src/lib/curriculum/loader";

const db = new PrismaClient();

const RANK: Record<string, number> = { BRONZE: 0, SILVER: 1, GOLD: 2, CHALLENGE: 3 };
const BAND_ORDER = ["BRONZE", "SILVER", "GOLD", "CHALLENGE"] as const;
const MOVE_FRACTION = 0.3;
const MIN_SOURCE_REMAINING = 2;

interface Row {
  id: string;
  difficulty: string;
}

interface TopicPlan {
  topicId: string;
  key: string;
  moves: { fromBand: string; toBand: string; questionIds: string[] }[];
}

async function buildDeclaredBandsByKey(): Promise<Map<string, Set<string>>> {
  const maps = loadCurriculumMaps();
  const declaredByKey = new Map<string, Set<string>>();
  for (const map of maps) {
    for (const strand of map.strands) {
      for (const year of strand.years) {
        const key = `${map.subjectSlug}:${strand.slug}:${year.yearGroup}`;
        const bands = new Set<string>();
        for (const obj of year.objectives) for (const b of obj.difficultyBands) bands.add(b.toUpperCase());
        declaredByKey.set(key, bands);
      }
    }
  }
  return declaredByKey;
}

function planTopic(topicId: string, key: string, rows: Row[], declaredBands: Set<string>): TopicPlan | null {
  // Buckets are mutated as we plan moves so a later missing band can, in
  // principle, borrow from a band populated earlier in this same pass.
  const buckets = new Map<string, Row[]>();
  for (const band of BAND_ORDER) buckets.set(band, []);
  for (const row of rows) buckets.get(row.difficulty)?.push(row);

  const declaredList = [...declaredBands].filter((b) => BAND_ORDER.includes(b as never));
  const missing = declaredList.filter((b) => (buckets.get(b)?.length ?? 0) === 0);
  if (missing.length === 0) return null;

  const moves: TopicPlan["moves"] = [];

  for (const target of missing.sort((a, b) => RANK[a] - RANK[b])) {
    const present = declaredList.filter((b) => (buckets.get(b)?.length ?? 0) > 0);
    if (present.length === 0) continue; // shouldn't happen — a topic with a gap has >=1 populated declared band

    present.sort((a, b) => {
      const da = Math.abs(RANK[a] - RANK[target]);
      const db_ = Math.abs(RANK[b] - RANK[target]);
      if (da !== db_) return da - db_;
      return RANK[a] - RANK[b]; // tie-break toward the easier band
    });

    // Prefer the closest source that can donate without ending up below
    // MIN_SOURCE_REMAINING; fall back to one that at least won't be fully
    // drained to zero. If every present band has only a single question,
    // skip this target rather than rob a declared band down to nothing —
    // that would just turn one gap into a different one.
    const source = present.find((b) => (buckets.get(b)?.length ?? 0) > MIN_SOURCE_REMAINING) ?? present.find((b) => (buckets.get(b)?.length ?? 0) > 1);
    if (!source) continue;
    const sourceRows = buckets.get(source)!;

    let moveCount = Math.max(1, Math.floor(sourceRows.length * MOVE_FRACTION));
    moveCount = Math.min(moveCount, Math.max(1, sourceRows.length - MIN_SOURCE_REMAINING));
    moveCount = Math.min(moveCount, sourceRows.length - 1); // never drain the source to zero

    const moved = sourceRows.splice(sourceRows.length - moveCount, moveCount);
    buckets.set(target, moved);
    moves.push({ fromBand: source, toBand: target, questionIds: moved.map((r) => r.id) });
  }

  return moves.length > 0 ? { topicId, key, moves } : null;
}

async function buildPlans(): Promise<TopicPlan[]> {
  const declaredByKey = await buildDeclaredBandsByKey();
  const topics = await db.topic.findMany({ include: { subject: true } });
  const plans: TopicPlan[] = [];

  for (const t of topics) {
    const key = `${t.subject.slug}:${t.strandSlug}:${t.yearGroup}`;
    const declared = declaredByKey.get(key);
    if (!declared || declared.size === 0) continue;

    const rows = await db.contentQuestion.findMany({
      where: { topicId: t.id, status: "PUBLISHED" },
      select: { id: true, difficulty: true },
      orderBy: { createdAt: "asc" },
    });
    if (rows.length === 0) continue;

    const plan = planTopic(t.id, key, rows, declared);
    if (plan) plans.push(plan);
  }
  return plans;
}

async function main() {
  const checkOnly = process.argv.includes("--check");
  console.log("Building rebalance plan from curriculum-declared difficulty bands...\n");
  const plans = await buildPlans();

  let totalMoves = 0;
  for (const plan of plans) {
    for (const m of plan.moves) {
      totalMoves += m.questionIds.length;
      console.log(`${plan.key}: move ${m.questionIds.length} question(s) ${m.fromBand} -> ${m.toBand}`);
    }
  }
  console.log(`\n${plans.length} topics affected, ${totalMoves} questions relabelled.`);

  if (checkOnly) {
    console.log("\n--check mode: no changes applied.");
    return;
  }

  for (const plan of plans) {
    for (const m of plan.moves) {
      await db.contentQuestion.updateMany({
        where: { id: { in: m.questionIds } },
        data: { difficulty: m.toBand as never },
      });
    }
  }
  console.log("\nApplied.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
