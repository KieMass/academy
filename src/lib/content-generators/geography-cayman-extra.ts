/**
 * Additional procedurally-organised Cayman Geography questions, on top of
 * the existing hand-authored content/questions/cayman/geography.json. See
 * science-cayman-extra.ts's header for the rationale — same pattern.
 */
import { createRng, shuffle, type Rng } from "./rng";
import type { DraftQuestion } from "./types";
import type { DifficultyBand, YearGroup } from "@/lib/curriculum/types";

const SUBJECT = "geography";

function mc(rng: Rng, opts: { strandSlug: string; yearGroup: YearGroup; objectiveCode: string; difficulty: DifficultyBand; promptText: string; correct: string; distractors: string[]; explanation: string }): DraftQuestion {
  const uniqueDistractors = [...new Set(opts.distractors.filter((d) => d !== opts.correct))].slice(0, 3);
  const optionTexts = shuffle(rng, [opts.correct, ...uniqueDistractors]);
  const options = optionTexts.map((text, i) => ({ id: `opt${i + 1}`, text }));
  const correctOptionId = options.find((o) => o.text === opts.correct)!.id;
  return { type: "multiple_choice", subjectSlug: SUBJECT, strandSlug: opts.strandSlug, yearGroup: opts.yearGroup, objectiveCode: opts.objectiveCode, difficulty: opts.difficulty, promptText: opts.promptText, explanation: opts.explanation, options, correctOptionId };
}

type Row = [string, string, string[], string];

function rowsToQuestions(rng: Rng, rows: Row[], strandSlug: string, yearGroup: YearGroup, objectiveCode: string, difficulty: DifficultyBand): DraftQuestion[] {
  return rows.flatMap(([promptText, correct, distractors, explanation]) => {
    const out: DraftQuestion[] = [mc(rng, { strandSlug, yearGroup, objectiveCode, difficulty, promptText, correct, distractors, explanation })];
    if (correct.split(" ").length <= 3 && !correct.includes(",")) {
      out.push({ type: "short_answer", subjectSlug: SUBJECT, strandSlug, yearGroup, objectiveCode, difficulty, promptText: `${promptText} (Answer without looking at multiple choices.)`, explanation, acceptedAnswers: [correct] });
    }
    return out;
  });
}

// Country/capital pairs are naturally combinatorial — a rich, easily
// extendable source of genuinely varied world-geography questions.
const CAPITALS: [string, string][] = [
  ["France", "Paris"], ["Jamaica", "Kingston"], ["Cuba", "Havana"], ["Mexico", "Mexico City"],
  ["Brazil", "Brasília"], ["Canada", "Ottawa"], ["Japan", "Tokyo"], ["Egypt", "Cairo"],
  ["Kenya", "Nairobi"], ["Guyana", "Georgetown"], ["Trinidad and Tobago", "Port of Spain"], ["Barbados", "Bridgetown"],
];

function capitalQuestions(rng: Rng, yearGroup: YearGroup, objectiveCode: string, difficulty: DifficultyBand): DraftQuestion[] {
  return CAPITALS.map(([country, capital]) => {
    const distractors = shuffle(rng, CAPITALS.filter(([c]) => c !== country).map(([, cap]) => cap)).slice(0, 3);
    return mc(rng, { strandSlug: "world-geography", yearGroup, objectiveCode, difficulty, promptText: `What is the capital city of ${country}?`, correct: capital, distractors, explanation: `${capital} is the capital city of ${country}.` });
  });
}

const y5Maps: Row[] = [
  ["What does a map's scale tell you?", "The relationship between distance on the map and real distance", ["The direction of north", "The names of nearby towns", "The height of the land"], "A map's scale shows how a distance measured on the map relates to the real distance on the ground."],
  ["What are the four main points on a compass called?", "North, South, East, West", ["Up, down, left, right", "Hot, cold, wet, dry", "Near, far, high, low"], "The four cardinal (main) compass points are North, South, East and West."],
  ["What does contour lines on a map usually show?", "Changes in height (elevation)", ["Roads and railways", "Political borders only", "Population density"], "Contour lines connect points of equal height, showing the shape of the land."],
];

const y6Rivers: Row[] = [
  ["What is a river's 'source'?", "The place where a river begins", ["The place where a river meets the sea", "A type of river bend", "A man-made dam"], "A river's source is the starting point, often in hills or mountains, where it begins to flow."],
  ["What is a meander?", "A winding bend in a river's course", ["A type of bridge", "A waterfall", "A river's source"], "A meander is a curving, winding bend in a river, often found in its middle or lower course."],
  ["What is a river delta?", "An area of land formed where a river deposits sediment at its mouth", ["The start of a river in the mountains", "A type of dam", "A fast-flowing waterfall"], "A delta forms where a river slows and deposits sediment as it meets the sea or a lake."],
];

const y5NaturalResources: Row[] = [
  ["Which of these is a renewable energy resource?", "Solar power", ["Coal", "Natural gas", "Oil"], "Solar power comes from the Sun, a source that won't run out — making it renewable, unlike fossil fuels."],
  ["Which of these is a non-renewable resource?", "Coal", ["Wind", "Solar power", "Water (hydro)"], "Coal is a fossil fuel that takes millions of years to form, so once used it cannot be quickly replaced."],
];

export function generateAllGeographyQuestionsCaymanExtra(seed = 86100): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...capitalQuestions(rng, "Y5", "GE5-WOR-1", "bronze"),
    ...capitalQuestions(rng, "Y6", "GE6-WOR-1", "bronze"),
    ...rowsToQuestions(rng, y5Maps, "maps", "Y5", "GE5-MAP-1", "bronze"),
    ...rowsToQuestions(rng, y6Rivers, "rivers-water-cycle", "Y6", "GE6-RIV-1", "bronze"),
    ...rowsToQuestions(rng, y5NaturalResources, "natural-resources", "Y5", "GE5-RES-1", "bronze"),
  ];
}
