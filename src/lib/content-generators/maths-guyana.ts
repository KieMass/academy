/**
 * Guyana Mathematics procedural generators (Grades 1-6). Mirrors the
 * Cayman generator files' local-helper pattern (see maths-ks1.ts), but is
 * organised by strand rather than by year — each strand covers all six
 * grades in one function since the curriculum map (content/curriculum/
 * guyana/maths.json) declares exactly two objectives per strand per grade,
 * a much smaller surface than Cayman's, so a per-grade split isn't needed
 * to keep functions readable.
 *
 * Every question is tagged curriculumSlug-implicitly — this file only ever
 * feeds Guyana topics (see prisma/seed-content.ts), so there's no
 * curriculumSlug field on DraftQuestion itself; the seed script resolves
 * topic ids scoped to the "guyana" Curriculum row.
 */
import { createRng, pick, randInt, shuffle, type Rng } from "./rng";
import type { DraftQuestion } from "./types";
import type { DifficultyBand, YearGroup } from "@/lib/curriculum/types";

function mc(
  rng: Rng,
  opts: {
    strandSlug: string;
    yearGroup: YearGroup;
    objectiveCode: string;
    difficulty: DifficultyBand;
    promptText: string;
    correct: string;
    distractors: string[];
    explanation: string;
  }
): DraftQuestion {
  const uniqueDistractors = [...new Set(opts.distractors.filter((d) => d !== opts.correct))].slice(0, 3);
  while (uniqueDistractors.length < 3) uniqueDistractors.push(`${opts.correct}${uniqueDistractors.length + 1}`);
  const optionTexts = shuffle(rng, [opts.correct, ...uniqueDistractors]);
  const options = optionTexts.map((text, i) => ({ id: `opt${i + 1}`, text }));
  const correctOptionId = options.find((o) => o.text === opts.correct)!.id;
  return {
    type: "multiple_choice",
    subjectSlug: "maths",
    strandSlug: opts.strandSlug,
    yearGroup: opts.yearGroup,
    objectiveCode: opts.objectiveCode,
    difficulty: opts.difficulty,
    promptText: opts.promptText,
    explanation: opts.explanation,
    options,
    correctOptionId,
  };
}

function fib(opts: {
  strandSlug: string;
  yearGroup: YearGroup;
  objectiveCode: string;
  difficulty: DifficultyBand;
  promptText: string;
  answer: string;
  explanation: string;
}): DraftQuestion {
  return {
    type: "fill_in_box",
    subjectSlug: "maths",
    strandSlug: opts.strandSlug,
    yearGroup: opts.yearGroup,
    objectiveCode: opts.objectiveCode,
    difficulty: opts.difficulty,
    promptText: opts.promptText,
    explanation: opts.explanation,
    blanks: [{ id: "answer", acceptedAnswers: [opts.answer] }],
  };
}

const YEARS: YearGroup[] = ["Y1", "Y2", "Y3", "Y4", "Y5", "Y6"];
const BANDS: DifficultyBand[] = ["bronze", "silver"];

// ============================= NUMBER AND OPERATIONS =======================
// Y1-Y2: MA{g}-NUM-1 (counting/sequence). Y1-Y2 also cover MA{g}-NUM-2
// (compare/partition). Y3-Y4: place value + arithmetic. Y5: factors +
// expanded notation. Y6: sets + prime factors/LCD.

const NUM_MAX: Record<YearGroup, number> = { Y1: 20, Y2: 100, Y3: 1000, Y4: 10000, Y5: 10000, Y6: 100000 };

function generateNumberOperationsQuestions(rng: Rng, yearGroup: YearGroup, band: DifficultyBand, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const max = NUM_MAX[yearGroup];
  for (let i = 0; i < count; i++) {
    if (yearGroup === "Y1" || yearGroup === "Y2") {
      const kind = pick(rng, ["one-more", "one-less", "compare"] as const);
      if (kind === "one-more") {
        const n = randInt(rng, 1, max - 1);
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: `GY-MA${yearGroup.slice(1)}-NUM-1`, difficulty: band, promptText: `What number comes after ${n}?`, answer: String(n + 1), explanation: `The number after ${n} is ${n + 1}.` }));
      } else if (kind === "one-less") {
        const n = randInt(rng, 2, max);
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: `GY-MA${yearGroup.slice(1)}-NUM-1`, difficulty: band, promptText: `What number comes before ${n}?`, answer: String(n - 1), explanation: `The number before ${n} is ${n - 1}.` }));
      } else {
        const a = randInt(rng, 1, max);
        let b = randInt(rng, 1, max);
        while (b === a) b = randInt(rng, 1, max);
        const correct = a > b ? `${a} is greater than ${b}` : `${b} is greater than ${a}`;
        out.push(mc(rng, { strandSlug: "number-operations", yearGroup, objectiveCode: `GY-MA${yearGroup.slice(1)}-NUM-2`, difficulty: band, promptText: `Which is true: comparing ${a} and ${b}?`, correct, distractors: [a > b ? `${b} is greater than ${a}` : `${a} is greater than ${b}`, `${a} is equal to ${b}`, "Cannot be compared"], explanation: `${Math.max(a, b)} is greater than ${Math.min(a, b)}.` }));
      }
    } else if (yearGroup === "Y3" || yearGroup === "Y4") {
      const kind = pick(rng, ["add", "subtract", "order"] as const);
      if (kind === "add") {
        const a = randInt(rng, 10, max / 2);
        const b = randInt(rng, 10, max / 2);
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: `GY-MA${yearGroup.slice(1)}-NUM-2`, difficulty: band, promptText: `${a} + ${b} = ?`, answer: String(a + b), explanation: `${a} + ${b} = ${a + b}.` }));
      } else if (kind === "subtract") {
        const a = randInt(rng, max / 4, max / 2);
        const b = randInt(rng, 1, a - 1);
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: `GY-MA${yearGroup.slice(1)}-NUM-2`, difficulty: band, promptText: `${a} - ${b} = ?`, answer: String(a - b), explanation: `${a} - ${b} = ${a - b}.` }));
      } else {
        const nums = [randInt(rng, 1, max), randInt(rng, 1, max), randInt(rng, 1, max)];
        const sorted = [...nums].sort((x, y) => x - y);
        out.push(mc(rng, { strandSlug: "number-operations", yearGroup, objectiveCode: `GY-MA${yearGroup.slice(1)}-NUM-1`, difficulty: band, promptText: `Which of these numbers is the smallest: ${nums.join(", ")}?`, correct: String(sorted[0]), distractors: nums.map(String), explanation: `${sorted[0]} is the smallest of ${nums.join(", ")}.` }));
      }
    } else if (yearGroup === "Y5") {
      const kind = pick(rng, ["factor", "expand"] as const);
      if (kind === "factor") {
        const bases = [12, 18, 20, 24, 30, 36, 40];
        const n = pick(rng, bases);
        const factorsOf = (x: number) => Array.from({ length: x }, (_, k) => k + 1).filter((f) => x % f === 0);
        const facs = factorsOf(n);
        const correct = String(pick(rng, facs));
        out.push(mc(rng, { strandSlug: "number-operations", yearGroup, objectiveCode: "GY-MA5-NUM-1", difficulty: band, promptText: `Which of these is a factor of ${n}?`, correct, distractors: [String(n + 1), String(n - 1), String(n * 2 - 1)], explanation: `${correct} divides exactly into ${n}, so it is a factor. Factors of ${n}: ${facs.join(", ")}.` }));
      } else {
        const th = randInt(rng, 1, 9), h = randInt(rng, 0, 9), t = randInt(rng, 0, 9), o = randInt(rng, 0, 9);
        const n = th * 1000 + h * 100 + t * 10 + o;
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: "GY-MA5-NUM-2", difficulty: band, promptText: `Write ${n} in expanded notation as an addition sum (e.g. 3047 -> 3000+0+40+7).`, answer: `${th * 1000}+${h * 100}+${t * 10}+${o}`, explanation: `${n} = ${th} thousands + ${h} hundreds + ${t} tens + ${o} ones = ${th * 1000}+${h * 100}+${t * 10}+${o}.` }));
      }
    } else {
      const kind = pick(rng, ["sets", "lcd"] as const);
      if (kind === "sets") {
        const a = shuffle(rng, [2, 4, 6, 8, 10, 12]).slice(0, 3).sort((x, y) => x - y);
        const b = shuffle(rng, [3, 6, 9, 12, 15]).slice(0, 3).sort((x, y) => x - y);
        const equivalent = a.length === b.length;
        out.push(mc(rng, { strandSlug: "number-operations", yearGroup, objectiveCode: "GY-MA6-NUM-1", difficulty: band, promptText: `Set A = {${a.join(", ")}} and Set B = {${b.join(", ")}}. Are A and B equivalent sets (same number of members)?`, correct: equivalent ? "Yes, they are equivalent" : "No, they are not equivalent", distractors: [equivalent ? "No, they are not equivalent" : "Yes, they are equivalent", "They are equal sets", "Cannot be determined"], explanation: `Set A has ${a.length} members and Set B has ${b.length} members, so they are ${equivalent ? "" : "not "}equivalent.` }));
      } else {
        const pairs: [number, number][] = [[4, 6], [3, 9], [6, 8], [5, 10], [4, 10]];
        const [p, q] = pick(rng, pairs);
        const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
        const lcd = (p * q) / gcd(p, q);
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: "GY-MA6-NUM-2", difficulty: band, promptText: `What is the LCD (lowest common denominator) of fractions with denominators ${p} and ${q}?`, answer: String(lcd), explanation: `The LCD of ${p} and ${q} is their lowest common multiple, ${lcd}.` }));
      }
    }
  }
  return out;
}

// ============================= PATTERNS AND RELATIONS ======================

function generatePatternsQuestions(rng: Rng, yearGroup: YearGroup, band: DifficultyBand, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    if (yearGroup === "Y1") {
      const [a, b] = shuffle(rng, ["circle", "square", "triangle", "star"]).slice(0, 2);
      const seq = [a, b, a, b, a];
      out.push(mc(rng, { strandSlug: "patterns-relations", yearGroup, objectiveCode: "GY-MA1-PAT-1", difficulty: band, promptText: `What comes next in this pattern: ${seq.join(", ")}, ?`, correct: b, distractors: [a, "diamond", "hexagon"], explanation: `The pattern repeats ${a}, ${b} — so the next shape is ${b}.` }));
    } else if (yearGroup === "Y2") {
      const total = randInt(rng, 6, 20);
      const part1 = randInt(rng, 1, total - 1);
      out.push(fib({ strandSlug: "patterns-relations", yearGroup, objectiveCode: "GY-MA2-PAT-2", difficulty: band, promptText: `A pan balance shows ${part1} + ? = ${total}. What number balances it?`, answer: String(total - part1), explanation: `${part1} + ${total - part1} = ${total}, so the missing number is ${total - part1}.` }));
    } else if (yearGroup === "Y3" || yearGroup === "Y4") {
      const start = randInt(rng, 2, 20);
      const step = pick(rng, [2, 3, 5, 10]);
      const increasing = pick(rng, [true, false]);
      const seq = Array.from({ length: 4 }, (_, k) => (increasing ? start + step * k : start + 60 - step * k));
      const next = increasing ? seq[3] + step : seq[3] - step;
      out.push(fib({ strandSlug: "patterns-relations", yearGroup, objectiveCode: `GY-MA${yearGroup.slice(1)}-PAT-1`, difficulty: band, promptText: `What is the next number in this pattern: ${seq.join(", ")}, ?`, answer: String(next), explanation: `The pattern ${increasing ? "increases" : "decreases"} by ${step} each time, so the next number is ${next}.` }));
    } else {
      const start = randInt(rng, 2, 10);
      const step = randInt(rng, 2, 6);
      const seq = Array.from({ length: 3 }, (_, k) => start + step * k);
      const term5 = start + step * 4;
      out.push(fib({ strandSlug: "patterns-relations", yearGroup, objectiveCode: `GY-MA${yearGroup.slice(1)}-PAT-1`, difficulty: band, promptText: `A pattern starts ${seq.join(", ")}, ... and increases by ${step} each term. What is the 5th term?`, answer: String(term5), explanation: `Term 5 = ${start} + ${step} x 4 = ${term5}.` }));
    }
  }
  return out;
}

// ============================= GEOMETRY =====================================

const ANGLE_TYPES = [
  { max: 89, label: "acute" },
  { max: 90, label: "right" },
  { max: 179, label: "obtuse" },
  { max: 359, label: "reflex" },
] as const;

function classifyAngle(deg: number): string {
  if (deg === 90) return "right";
  if (deg < 90) return "acute";
  if (deg < 180) return "obtuse";
  return "reflex";
}

function generateGeometryQuestions(rng: Rng, yearGroup: YearGroup, band: DifficultyBand, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    if (yearGroup === "Y1" || yearGroup === "Y2") {
      const shape = pick(rng, ["triangle", "square", "rectangle", "circle", "pentagon", "hexagon"] as const);
      const sides: Record<string, number> = { triangle: 3, square: 4, rectangle: 4, circle: 0, pentagon: 5, hexagon: 6 };
      out.push(mc(rng, { strandSlug: "geometry", yearGroup, objectiveCode: `GY-MA${yearGroup.slice(1)}-GEO-1`, difficulty: band, promptText: `How many sides does a ${shape} have?`, correct: String(sides[shape]), distractors: ["3", "4", "5", "6"].filter((s) => s !== String(sides[shape])), explanation: `A ${shape} has ${sides[shape]} sides.` }));
    } else if (yearGroup === "Y3") {
      const shape = pick(rng, ["a square", "a rectangle", "a triangle", "a rhombus"] as const);
      const angleSum: Record<string, string> = { "a square": "4 right angles", "a rectangle": "4 right angles", "a triangle": "3 angles that sum to 180 degrees", "a rhombus": "4 sides of equal length" };
      out.push(mc(rng, { strandSlug: "geometry", yearGroup, objectiveCode: "GY-MA3-GEO-1", difficulty: band, promptText: `Which property is true of ${shape}?`, correct: angleSum[shape], distractors: Object.values(angleSum).filter((v) => v !== angleSum[shape]), explanation: `${shape[0].toUpperCase() + shape.slice(1)} has ${angleSum[shape]}.` }));
    } else if (yearGroup === "Y4" || yearGroup === "Y5") {
      const deg = randInt(rng, 5, 355);
      const correct = classifyAngle(deg);
      out.push(mc(rng, { strandSlug: "geometry", yearGroup, objectiveCode: `GY-MA${yearGroup.slice(1)}-GEO-1`, difficulty: band, promptText: `An angle measures ${deg} degrees. What type of angle is it?`, correct, distractors: ANGLE_TYPES.map((t) => t.label).filter((l) => l !== correct), explanation: `${deg} degrees is ${correct === "right" ? "exactly 90 degrees, a right angle" : `${correct} (${correct === "acute" ? "less than 90" : correct === "obtuse" ? "between 90 and 180" : "greater than 180"} degrees)`}.` }));
    } else {
      const solid = pick(rng, ["cube", "rectangular prism", "triangular prism", "square pyramid"] as const);
      const faces: Record<string, number> = { cube: 6, "rectangular prism": 6, "triangular prism": 5, "square pyramid": 5 };
      out.push(fib({ strandSlug: "geometry", yearGroup, objectiveCode: "GY-MA6-GEO-1", difficulty: band, promptText: `How many faces does a ${solid} have?`, answer: String(faces[solid]), explanation: `A ${solid} has ${faces[solid]} faces.` }));
    }
  }
  return out;
}

// ============================= MEASUREMENT ===================================

function generateMeasurementQuestions(rng: Rng, yearGroup: YearGroup, band: DifficultyBand, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    if (yearGroup === "Y1") {
      const h = randInt(rng, 1, 12);
      out.push(mc(rng, { strandSlug: "measurement", yearGroup, objectiveCode: "GY-MA1-MEA-2", difficulty: band, promptText: `The clock's hour hand points to ${h} and the minute hand points to 12. What time is it?`, correct: `${h}:00`, distractors: [`${h}:30`, `${(h % 12) + 1}:00`, `${h}:15`], explanation: `When the minute hand is on 12, the time is ${h} o'clock (${h}:00).` }));
    } else if (yearGroup === "Y2") {
      const cm = randInt(rng, 20, 300);
      out.push(mc(rng, { strandSlug: "measurement", yearGroup, objectiveCode: "GY-MA2-MEA-1", difficulty: band, promptText: `Which unit would you use to measure the length of a classroom — centimetres or metres?`, correct: "Metres", distractors: ["Centimetres", "Grams", "Litres"], explanation: `A classroom is long, so metres (not centimetres) is the sensible unit — ${cm} cm is only about ${(cm / 100).toFixed(1)} m.` }));
    } else if (yearGroup === "Y3") {
      const dollars = randInt(rng, 100, 900) * 10;
      const spent = randInt(rng, 50, 400) * 10;
      out.push(fib({ strandSlug: "measurement", yearGroup, objectiveCode: "GY-MA3-MEA-2", difficulty: band, promptText: `A pupil has G$${dollars} and spends G$${spent}. How much money is left?`, answer: String(dollars - spent), explanation: `G$${dollars} - G$${spent} = G$${dollars - spent}.` }));
    } else if (yearGroup === "Y4") {
      const m = randInt(rng, 1, 20);
      out.push(fib({ strandSlug: "measurement", yearGroup, objectiveCode: "GY-MA4-MEA-1", difficulty: band, promptText: `Convert ${m} metres to centimetres.`, answer: String(m * 100), explanation: `1 m = 100 cm, so ${m} m = ${m * 100} cm.` }));
    } else if (yearGroup === "Y5") {
      const l = randInt(rng, 2, 15);
      const w = randInt(rng, 2, 10);
      out.push(fib({ strandSlug: "measurement", yearGroup, objectiveCode: "GY-MA5-MEA-1", difficulty: band, promptText: `A rectangle is ${l} cm long and ${w} cm wide. What is its area in square centimetres?`, answer: String(l * w), explanation: `Area = length x width = ${l} x ${w} = ${l * w} sq cm.` }));
    } else {
      const l = randInt(rng, 2, 10);
      const w = randInt(rng, 2, 8);
      const h = randInt(rng, 2, 6);
      out.push(fib({ strandSlug: "measurement", yearGroup, objectiveCode: "GY-MA6-MEA-2", difficulty: band, promptText: `A rectangular prism is ${l} cm by ${w} cm by ${h} cm. What is its volume in cubic centimetres?`, answer: String(l * w * h), explanation: `Volume = length x width x height = ${l} x ${w} x ${h} = ${l * w * h} cubic cm.` }));
    }
  }
  return out;
}

// ============================= DATA ANALYSIS AND PROBABILITY ================

function generateDataQuestions(rng: Rng, yearGroup: YearGroup, band: DifficultyBand, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    if (yearGroup === "Y1" || yearGroup === "Y2") {
      const fruits = { apples: randInt(rng, 2, 8), mangoes: randInt(rng, 2, 8), bananas: randInt(rng, 2, 8) };
      const entries = Object.entries(fruits);
      const [maxFruit] = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
      out.push(mc(rng, { strandSlug: "data-analysis", yearGroup, objectiveCode: `GY-MA${yearGroup.slice(1)}-DAT-1`, difficulty: band, promptText: `A pictograph shows ${entries.map(([k, v]) => `${v} ${k}`).join(", ")}. Which fruit has the most?`, correct: maxFruit, distractors: entries.map(([k]) => k).filter((k) => k !== maxFruit), explanation: `${maxFruit} has the highest count: ${fruits[maxFruit as keyof typeof fruits]}.` }));
    } else if (yearGroup === "Y3") {
      const vals = Array.from({ length: 5 }, () => randInt(rng, 1, 10));
      out.push(fib({ strandSlug: "data-analysis", yearGroup, objectiveCode: "GY-MA3-DAT-2", difficulty: band, promptText: `Find the range of this data set: ${vals.join(", ")}.`, answer: String(Math.max(...vals) - Math.min(...vals)), explanation: `Range = largest - smallest = ${Math.max(...vals)} - ${Math.min(...vals)} = ${Math.max(...vals) - Math.min(...vals)}.` }));
    } else if (yearGroup === "Y4") {
      const total = randInt(rng, 4, 10);
      const favourable = randInt(rng, 1, total - 1);
      out.push(fib({ strandSlug: "data-analysis", yearGroup, objectiveCode: "GY-MA4-DAT-2", difficulty: band, promptText: `A bag has ${total} equally-sized balls, ${favourable} of which are red. What is the probability of picking a red ball, as a fraction?`, answer: `${favourable}/${total}`, explanation: `Probability = favourable outcomes / total outcomes = ${favourable}/${total}.` }));
    } else {
      const vals = Array.from({ length: 5 }, () => randInt(rng, 2, 20)).sort((a, b) => a - b);
      const mean = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      out.push(fib({ strandSlug: "data-analysis", yearGroup, objectiveCode: `GY-MA${yearGroup.slice(1)}-DAT-2`, difficulty: band, promptText: `Find the median of this data set: ${vals.join(", ")}.`, answer: String(vals[2]), explanation: `Sorted, the middle value of ${vals.join(", ")} is ${vals[2]} — that's the median. (Mean is about ${mean}.)` }));
    }
  }
  return out;
}

/** Every Guyana Grade 1-6 Maths question, across every declared strand and
 *  difficulty band (see content/curriculum/guyana/maths.json). */
export function generateAllMathsQuestionsGuyana(seed = 55100): DraftQuestion[] {
  const rng = createRng(seed);
  const out: DraftQuestion[] = [];
  for (const yearGroup of YEARS) {
    for (const band of BANDS) {
      out.push(...generateNumberOperationsQuestions(rng, yearGroup, band, 4));
      out.push(...generatePatternsQuestions(rng, yearGroup, band, 3));
      out.push(...generateGeometryQuestions(rng, yearGroup, band, 3));
      out.push(...generateMeasurementQuestions(rng, yearGroup, band, 3));
      out.push(...generateDataQuestions(rng, yearGroup, band, 3));
    }
  }
  return out;
}
