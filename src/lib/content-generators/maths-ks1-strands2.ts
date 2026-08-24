/**
 * Additional Y2 procedural coverage for measurement, geometry, statistics,
 * position & direction, reasoning and word problems — a volume top-up
 * alongside the strand generators already in maths-ks1.ts. Kept in a
 * separate file to avoid bloating maths-ks1.ts further and so the wider
 * "kind" pools / number ranges here (needed to support larger counts without
 * heavy duplication) are easy to tell apart from the original set.
 */
import { createRng, pick, randInt, shuffle, type Rng } from "./rng";
import type { DraftQuestion } from "./types";
import type { DifficultyBand, YearGroup } from "@/lib/curriculum/types";

function mcQuestion(
  rng: Rng,
  opts: { strandSlug: string; yearGroup: YearGroup; objectiveCode: string; difficulty: DifficultyBand; promptText: string; correct: string; distractors: string[]; explanation: string }
): DraftQuestion {
  const uniqueDistractors = [...new Set(opts.distractors.filter((d) => d !== opts.correct))].slice(0, 3);
  while (uniqueDistractors.length < 3) uniqueDistractors.push(`${opts.correct}${uniqueDistractors.length + 1}`);
  const optionTexts = shuffle(rng, [opts.correct, ...uniqueDistractors]);
  const options = optionTexts.map((text, i) => ({ id: `opt${i + 1}`, text }));
  const correctOptionId = options.find((o) => o.text === opts.correct)!.id;
  return { type: "multiple_choice", subjectSlug: SUBJECT, strandSlug: opts.strandSlug, yearGroup: opts.yearGroup, objectiveCode: opts.objectiveCode, difficulty: opts.difficulty, promptText: opts.promptText, explanation: opts.explanation, options, correctOptionId };
}

function fillInBox(opts: { strandSlug: string; yearGroup: YearGroup; objectiveCode: string; difficulty: DifficultyBand; promptText: string; answer: string; explanation: string }): DraftQuestion {
  return { type: "fill_in_box", subjectSlug: SUBJECT, strandSlug: opts.strandSlug, yearGroup: opts.yearGroup, objectiveCode: opts.objectiveCode, difficulty: opts.difficulty, promptText: opts.promptText, explanation: opts.explanation, blanks: [{ id: "answer", acceptedAnswers: [opts.answer] }] };
}

const SUBJECT = "maths";
const Y2: YearGroup = "Y2";

// --- measurement ---
function generateY2MoneyChangeQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const paidOptions = [20, 50, 100, 200] as const;
    const paid = pick(rng, paidOptions);
    const price = randInt(rng, 1, paid - 1);
    out.push(fillInBox({ strandSlug: "measurement", yearGroup: Y2, objectiveCode: "MA2-MEA-3", difficulty: paid >= 100 ? "gold" : "silver", promptText: `An item costs ${price}p. You pay with ${paid >= 100 ? `£${paid / 100}` : `${paid}p`}. How much change do you get, in pence?`, answer: String(paid - price), explanation: `${paid}p - ${price}p = ${paid - price}p change.` }));
  }
  return out;
}

function generateY2CoinCombinationQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const coins = [1, 2, 5, 10, 20, 50, 100] as const;
  for (let i = 0; i < count; i++) {
    const a = pick(rng, coins);
    const b = pick(rng, coins);
    const total = a + b;
    out.push(fillInBox({ strandSlug: "measurement", yearGroup: Y2, objectiveCode: "MA2-MEA-4", difficulty: "gold", promptText: `You have a ${a}p coin and a ${b}p coin. How much money do you have altogether, in pence?`, answer: String(total), explanation: `${a}p + ${b}p = ${total}p.` }));
  }
  return out;
}

function generateY2CompareMeasuresQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const lengthPairs = [["the pencil", "the ruler"], ["the table", "the chair"], ["the road", "the garden path"], ["the rope", "the ribbon"], ["the ladder", "the broom"]];
  const massPairs = [["the elephant", "the mouse"], ["the bag of flour", "the feather"], ["the football", "the tennis ball"], ["the brick", "the sponge"]];
  const capacityPairs = [["the bathtub", "the cup"], ["the swimming pool", "the bucket"], ["the jug", "the teaspoon"]];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["length", "mass", "capacity"] as const);
    if (kind === "length") {
      const [a, b] = pick(rng, lengthPairs);
      const aLonger = pick(rng, [true, false]);
      const [longer, shorter] = aLonger ? [a, b] : [b, a];
      out.push(mcQuestion(rng, { strandSlug: "measurement", yearGroup: Y2, objectiveCode: "MA2-MEA-2", difficulty: "silver", promptText: `${longer} is longer than ${shorter}. Which is shorter?`, correct: shorter, distractors: [longer, "They are the same length"], explanation: `Since ${longer} is longer, ${shorter} must be shorter.` }));
    } else if (kind === "mass") {
      const [a, b] = pick(rng, massPairs);
      const aHeavier = pick(rng, [true, false]);
      const [heavier, lighter] = aHeavier ? [a, b] : [b, a];
      out.push(mcQuestion(rng, { strandSlug: "measurement", yearGroup: Y2, objectiveCode: "MA2-MEA-2", difficulty: "silver", promptText: `${heavier} is heavier than ${lighter}. Which is lighter?`, correct: lighter, distractors: [heavier, "They weigh the same"], explanation: `Since ${heavier} is heavier, ${lighter} must be lighter.` }));
    } else {
      const [a, b] = pick(rng, capacityPairs);
      const aMore = pick(rng, [true, false]);
      const [more, less] = aMore ? [a, b] : [b, a];
      out.push(mcQuestion(rng, { strandSlug: "measurement", yearGroup: Y2, objectiveCode: "MA2-MEA-2", difficulty: "silver", promptText: `${more} holds more than ${less}. Which holds less?`, correct: less, distractors: [more, "They hold the same amount"], explanation: `Since ${more} holds more, ${less} must hold less.` }));
    }
  }
  return out;
}

function generateY2ChooseUnitQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const items: [string, string, string[]][] = [
    ["the length of a pencil", "centimetres", ["kilometres", "kilograms", "litres"]],
    ["the length of a football pitch", "metres", ["millilitres", "grams", "seconds"]],
    ["the mass of an apple", "grams", ["litres", "metres", "kilometres"]],
    ["the mass of a car", "kilograms", ["millilitres", "centimetres", "seconds"]],
    ["the capacity of a mug", "millilitres", ["kilograms", "metres", "kilometres"]],
    ["the capacity of a bathtub", "litres", ["grams", "centimetres", "kilometres"]],
    ["the height of a door", "metres", ["millilitres", "grams", "kilometres"]],
    ["the mass of a feather", "grams", ["kilometres", "litres", "metres"]],
  ];
  for (let i = 0; i < count; i++) {
    const [thing, correct, distractors] = pick(rng, items);
    out.push(mcQuestion(rng, { strandSlug: "measurement", yearGroup: Y2, objectiveCode: "MA2-MEA-1", difficulty: "bronze", promptText: `Which unit would you use to measure ${thing}?`, correct, distractors, explanation: `${correct[0].toUpperCase()}${correct.slice(1)} is the most sensible unit for measuring ${thing}.` }));
  }
  return out;
}

function generateY2TimeQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const hour = randInt(rng, 1, 12);
    const minutes = pick(rng, [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as const);
    const label = minutes === 0 ? `${hour} o'clock` : minutes === 15 ? `quarter past ${hour}` : minutes === 30 ? `half past ${hour}` : minutes === 45 ? `quarter to ${hour === 12 ? 1 : hour + 1}` : minutes < 30 ? `${minutes} minutes past ${hour}` : `${60 - minutes} minutes to ${hour === 12 ? 1 : hour + 1}`;
    out.push(mcQuestion(rng, { strandSlug: "measurement", yearGroup: Y2, objectiveCode: "MA2-MEA-5", difficulty: "gold", promptText: `The clock shows ${hour}:${String(minutes).padStart(2, "0")}. How do you say this time?`, correct: label, distractors: [`${hour} o'clock`, `half past ${hour}`, `quarter past ${hour}`].filter((d) => d !== label), explanation: `${hour}:${String(minutes).padStart(2, "0")} is said as "${label}".` }));
  }
  return out;
}

// --- geometry ---
function generateY2ShapeSidesQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const shapes = [{ n: "triangle", sides: 3 }, { n: "square", sides: 4 }, { n: "rectangle", sides: 4 }, { n: "pentagon", sides: 5 }, { n: "hexagon", sides: 6 }, { n: "heptagon", sides: 7 }, { n: "octagon", sides: 8 }];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["name-to-sides", "sides-to-name"] as const);
    const shape = pick(rng, shapes);
    if (kind === "name-to-sides") {
      out.push(fillInBox({ strandSlug: "geometry", yearGroup: Y2, objectiveCode: "MA2-GEO-1", difficulty: "silver", promptText: `How many sides does a ${shape.n} have?`, answer: String(shape.sides), explanation: `A ${shape.n} has ${shape.sides} sides.` }));
    } else {
      out.push(mcQuestion(rng, { strandSlug: "geometry", yearGroup: Y2, objectiveCode: "MA2-GEO-1", difficulty: "bronze", promptText: `Which shape has ${shape.sides} sides?`, correct: shape.n, distractors: shapes.filter((s) => s.n !== shape.n).map((s) => s.n), explanation: `A ${shape.n} has ${shape.sides} sides.` }));
    }
  }
  return out;
}

function generateY2SolidPropertiesQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const solids = [{ n: "cube", faces: 6, edges: 12, vertices: 8 }, { n: "cuboid", faces: 6, edges: 12, vertices: 8 }, { n: "square-based pyramid", faces: 5, edges: 8, vertices: 5 }, { n: "triangular prism", faces: 5, edges: 9, vertices: 6 }, { n: "cylinder", faces: 3, edges: 2, vertices: 0 }, { n: "sphere", faces: 1, edges: 0, vertices: 0 }, { n: "cone", faces: 2, edges: 1, vertices: 1 }];
  for (let i = 0; i < count; i++) {
    const shape = pick(rng, solids);
    const ask = pick(rng, ["faces", "edges", "vertices"] as const);
    out.push(fillInBox({ strandSlug: "geometry", yearGroup: Y2, objectiveCode: "MA2-GEO-2", difficulty: "gold", promptText: `How many ${ask} does a ${shape.n} have?`, answer: String(shape[ask]), explanation: `A ${shape.n} has ${shape[ask]} ${ask}.` }));
  }
  return out;
}

function generateY2SortShapesQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const shapes2d = ["circle", "triangle", "square", "rectangle", "pentagon", "hexagon"];
  const shapes3d = ["cube", "sphere", "cuboid", "cylinder", "cone", "pyramid"];
  const all = [...shapes2d.map((n) => ({ n, is3d: false })), ...shapes3d.map((n) => ({ n, is3d: true }))];
  for (let i = 0; i < count; i++) {
    const shape = pick(rng, all);
    out.push(mcQuestion(rng, { strandSlug: "geometry", yearGroup: Y2, objectiveCode: "MA2-GEO-3", difficulty: "bronze", promptText: `Is a ${shape.n} a 2-D or a 3-D shape?`, correct: shape.is3d ? "3-D" : "2-D", distractors: [shape.is3d ? "2-D" : "3-D"], explanation: `A ${shape.n} is a ${shape.is3d ? "3-D shape — it takes up space and has faces" : "2-D shape — it is flat"}.` }));
  }
  return out;
}

// --- position-direction ---
function generateY2PositionQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["turn-degrees", "direction"] as const);
    if (kind === "turn-degrees") {
      const dir = pick(rng, ["clockwise", "anti-clockwise"] as const);
      const turn = pick(rng, [{ f: "quarter", deg: 90 }, { f: "half", deg: 180 }, { f: "three-quarter", deg: 270 }, { f: "whole", deg: 360 }]);
      out.push(mcQuestion(rng, { strandSlug: "position-direction", yearGroup: Y2, objectiveCode: "MA2-POS-1", difficulty: "gold", promptText: `A ${turn.f} turn ${dir} moves through how many degrees?`, correct: `${turn.deg}°`, distractors: ["90°", "180°", "270°", "360°"].filter((d) => d !== `${turn.deg}°`), explanation: `A ${turn.f} turn is ${turn.deg} degrees, whichever direction it's made.` }));
    } else {
      const start = pick(rng, ["facing north", "facing east", "facing south", "facing west"]);
      const dir = pick(rng, ["clockwise", "anti-clockwise"] as const);
      const map: Record<string, string> = dir === "clockwise" ? { "facing north": "facing east", "facing east": "facing south", "facing south": "facing west", "facing west": "facing north" } : { "facing north": "facing west", "facing west": "facing south", "facing south": "facing east", "facing east": "facing north" };
      const result = map[start];
      out.push(mcQuestion(rng, { strandSlug: "position-direction", yearGroup: Y2, objectiveCode: "MA2-POS-2", difficulty: "silver", promptText: `You start ${start} and make a quarter turn ${dir}. Which way are you facing now?`, correct: result, distractors: Object.values(map).filter((d) => d !== result), explanation: `Turning a quarter ${dir} from ${start.replace("facing ", "")} results in ${result}.` }));
    }
  }
  return out;
}

// --- statistics ---
function generateY2StatisticsQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const categorySets = [["Apples", "Bananas", "Oranges", "Grapes"], ["Red", "Blue", "Green", "Yellow"], ["Cats", "Dogs", "Fish", "Birds"], ["Football", "Swimming", "Tennis", "Cricket"]];
  for (let i = 0; i < count; i++) {
    const cats = pick(rng, categorySets);
    const counts = cats.map(() => randInt(rng, 2, 15));
    const total = counts.reduce((a, b) => a + b, 0);
    const kind = pick(rng, ["most", "least", "total", "difference"] as const);
    const listStr = cats.map((c, idx) => `${c}: ${counts[idx]}`).join(", ");
    if (kind === "most") {
      const maxIdx = counts.indexOf(Math.max(...counts));
      out.push(mcQuestion(rng, { strandSlug: "statistics", yearGroup: Y2, objectiveCode: "MA2-STAT-1", difficulty: "silver", promptText: `A tally chart shows: ${listStr}. Which category has the most?`, correct: cats[maxIdx], distractors: cats.filter((_, idx) => idx !== maxIdx), explanation: `${cats[maxIdx]} has the highest count (${counts[maxIdx]}).` }));
    } else if (kind === "least") {
      const minIdx = counts.indexOf(Math.min(...counts));
      out.push(mcQuestion(rng, { strandSlug: "statistics", yearGroup: Y2, objectiveCode: "MA2-STAT-2", difficulty: "silver", promptText: `A tally chart shows: ${listStr}. Which category has the fewest?`, correct: cats[minIdx], distractors: cats.filter((_, idx) => idx !== minIdx), explanation: `${cats[minIdx]} has the lowest count (${counts[minIdx]}).` }));
    } else if (kind === "total") {
      out.push(fillInBox({ strandSlug: "statistics", yearGroup: Y2, objectiveCode: "MA2-STAT-3", difficulty: "gold", promptText: `A tally chart shows: ${listStr}. What is the total of all categories?`, answer: String(total), explanation: `${counts.join(" + ")} = ${total}.` }));
    } else {
      const maxIdx = counts.indexOf(Math.max(...counts));
      const minIdx = counts.indexOf(Math.min(...counts));
      out.push(fillInBox({ strandSlug: "statistics", yearGroup: Y2, objectiveCode: "MA2-STAT-3", difficulty: "gold", promptText: `A tally chart shows: ${listStr}. How many more ${cats[maxIdx]} are there than ${cats[minIdx]}?`, answer: String(counts[maxIdx] - counts[minIdx]), explanation: `${counts[maxIdx]} - ${counts[minIdx]} = ${counts[maxIdx] - counts[minIdx]}.` }));
    }
  }
  return out;
}

// --- reasoning ---
function generateY2ReasoningQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["missing-number", "odd-one-out", "true-false"] as const);
    if (kind === "missing-number") {
      const a = randInt(rng, 10, 50);
      const b = randInt(rng, 10, 50);
      const sum = a + b;
      out.push(fillInBox({ strandSlug: "reasoning", yearGroup: Y2, objectiveCode: "MA2-REA-1", difficulty: "challenge", promptText: `${a} + ___ = ${sum}. What number goes in the gap?`, answer: String(b), explanation: `${a} + ${b} = ${sum}, so the missing number is ${b}.` }));
    } else if (kind === "odd-one-out") {
      const step = pick(rng, [2, 5, 10] as const);
      const nums = [step, step * 2, step * 3, step * 4].map((n) => n + randInt(rng, 0, 2) * 10);
      const oddOne = nums[randInt(rng, 0, 3)] + 1;
      const set = [...nums.filter((n) => n !== nums[nums.indexOf(oddOne - 1)]), oddOne];
      const shuffled = shuffle(rng, set.slice(0, 4));
      out.push(mcQuestion(rng, { strandSlug: "reasoning", yearGroup: Y2, objectiveCode: "MA2-REA-1", difficulty: "gold", promptText: `Which number is NOT a multiple of ${step}: ${shuffled.join(", ")}?`, correct: String(oddOne), distractors: shuffled.filter((n) => n !== oddOne).map(String), explanation: `${oddOne} is not a multiple of ${step}; the others are.` }));
    } else {
      const a = randInt(rng, 1, 50);
      const b = randInt(rng, 1, 50);
      const claimedSum = a + b + (pick(rng, [true, false]) ? 0 : randInt(rng, 1, 5));
      const isTrue = claimedSum === a + b;
      out.push(mcQuestion(rng, { strandSlug: "reasoning", yearGroup: Y2, objectiveCode: "MA2-REA-1", difficulty: "gold", promptText: `True or false: ${a} + ${b} = ${claimedSum}`, correct: isTrue ? "True" : "False", distractors: [isTrue ? "False" : "True"], explanation: `${a} + ${b} = ${a + b}, so the statement is ${isTrue ? "true" : "false"}.` }));
    }
  }
  return out;
}

// --- word-problems ---
function generateY2WordProblemsQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const items = ["stickers", "marbles", "sweets", "crayons", "toy cars", "conkers"];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["change", "combine", "share"] as const);
    const item = pick(rng, items);
    if (kind === "change") {
      const paid = pick(rng, [50, 100] as const);
      const priceOptions = paid === 100 ? [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90] : [5, 10, 15, 20, 25, 30, 35, 40, 45];
      const price = pick(rng, priceOptions);
      out.push(fillInBox({ strandSlug: "word-problems", yearGroup: Y2, objectiveCode: "MA2-WP-1", difficulty: "gold", promptText: `A toy costs ${price}p. You pay with a ${paid === 100 ? "£1 coin" : "50p coin"}. How much change do you get?`, answer: String(paid - price), explanation: `${paid}p - ${price}p = ${paid - price}p change.` }));
    } else if (kind === "combine") {
      const a = randInt(rng, 5, 40);
      const b = randInt(rng, 5, 40);
      out.push(fillInBox({ strandSlug: "word-problems", yearGroup: Y2, objectiveCode: "MA2-WP-2", difficulty: "silver", promptText: `Maya has ${a} ${item}. Her friend gives her ${b} more. How many ${item} does she have now?`, answer: String(a + b), explanation: `${a} + ${b} = ${a + b}.` }));
    } else {
      const groups = randInt(rng, 2, 5);
      const each = randInt(rng, 2, 9);
      out.push(fillInBox({ strandSlug: "word-problems", yearGroup: Y2, objectiveCode: "MA2-WP-2", difficulty: "gold", promptText: `${groups} friends share ${groups * each} ${item} equally. How many ${item} does each friend get?`, answer: String(each), explanation: `${groups * each} ÷ ${groups} = ${each}.` }));
    }
  }
  return out;
}

export function generateAllMathsQuestionsY2Strands2(seed = 62700): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...generateY2MoneyChangeQuestions(rng, 14),
    ...generateY2CoinCombinationQuestions(rng, 12),
    ...generateY2CompareMeasuresQuestions(rng, 12),
    ...generateY2ChooseUnitQuestions(rng, 10),
    ...generateY2TimeQuestions(rng, 12),
    ...generateY2ShapeSidesQuestions(rng, 14),
    ...generateY2SolidPropertiesQuestions(rng, 14),
    ...generateY2SortShapesQuestions(rng, 12),
    ...generateY2PositionQuestions(rng, 20),
    ...generateY2StatisticsQuestions(rng, 18),
    ...generateY2ReasoningQuestions(rng, 18),
    ...generateY2WordProblemsQuestions(rng, 18),
  ];
}

export function generateAllMathsQuestionsY2Strands2Extra(seed = 72700): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...generateY2MoneyChangeQuestions(rng, 12),
    ...generateY2CoinCombinationQuestions(rng, 10),
    ...generateY2CompareMeasuresQuestions(rng, 10),
    ...generateY2ChooseUnitQuestions(rng, 8),
    ...generateY2TimeQuestions(rng, 10),
    ...generateY2ShapeSidesQuestions(rng, 12),
    ...generateY2SolidPropertiesQuestions(rng, 12),
    ...generateY2SortShapesQuestions(rng, 10),
    ...generateY2PositionQuestions(rng, 16),
    ...generateY2StatisticsQuestions(rng, 16),
    ...generateY2ReasoningQuestions(rng, 16),
    ...generateY2WordProblemsQuestions(rng, 16),
  ];
}
