import { createRng, pick, randInt, shuffle, type Rng } from "./rng";
import type { DraftQuestion } from "./types";
import type { DifficultyBand } from "@/lib/curriculum/types";

/** Builds a 4-option multiple-choice question from a correct numeric/text
 *  answer plus a distractor generator, deduping and shuffling. */
function mcQuestion(
  rng: Rng,
  opts: {
    subjectSlug: string;
    strandSlug: string;
    yearGroup: DraftQuestion["yearGroup"];
    objectiveCode: string;
    difficulty: DifficultyBand;
    promptText: string;
    correct: string;
    distractors: string[];
    explanation: string;
  }
): DraftQuestion {
  const uniqueDistractors = [...new Set(opts.distractors.filter((d) => d !== opts.correct))].slice(0, 3);
  while (uniqueDistractors.length < 3) {
    uniqueDistractors.push(`${opts.correct}${uniqueDistractors.length + 1}`);
  }
  const optionTexts = shuffle(rng, [opts.correct, ...uniqueDistractors]);
  const options = optionTexts.map((text, i) => ({ id: `opt${i + 1}`, text }));
  const correctOptionId = options.find((o) => o.text === opts.correct)!.id;

  return {
    type: "multiple_choice",
    subjectSlug: opts.subjectSlug,
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

function fillInBox(opts: {
  subjectSlug: string;
  strandSlug: string;
  yearGroup: DraftQuestion["yearGroup"];
  objectiveCode: string;
  difficulty: DifficultyBand;
  promptText: string;
  answer: string;
  explanation: string;
}): DraftQuestion {
  return {
    type: "fill_in_box",
    subjectSlug: opts.subjectSlug,
    strandSlug: opts.strandSlug,
    yearGroup: opts.yearGroup,
    objectiveCode: opts.objectiveCode,
    difficulty: opts.difficulty,
    promptText: opts.promptText,
    explanation: opts.explanation,
    blanks: [{ id: "answer", acceptedAnswers: [opts.answer] }],
  };
}

const YEAR: DraftQuestion["yearGroup"] = "Y5";
const SUBJECT = "maths";

export function generateAdditionQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "bronze", "silver", "silver", "gold"] as const);
    const digits = difficulty === "bronze" ? 3 : difficulty === "silver" ? 4 : 5;
    const a = randInt(rng, 10 ** (digits - 1), 10 ** digits - 1);
    const b = randInt(rng, 10 ** (digits - 2), 10 ** (digits - 1) - 1);
    const sum = a + b;
    out.push(
      fillInBox({
        subjectSlug: SUBJECT,
        strandSlug: "addition",
        yearGroup: YEAR,
        objectiveCode: "MA5-ADD-1",
        difficulty,
        promptText: `Use column addition to work out: ${a} + ${b} = ?`,
        answer: String(sum),
        explanation: `${a} + ${b} = ${sum}. Line up the digits by place value and add each column, carrying where needed.`,
      })
    );
  }
  return out;
}

export function generateSubtractionQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "bronze", "silver", "silver", "gold"] as const);
    const digits = difficulty === "bronze" ? 3 : difficulty === "silver" ? 4 : 5;
    const a = randInt(rng, 10 ** (digits - 1), 10 ** digits - 1);
    const b = randInt(rng, 10 ** (digits - 2), a - 1);
    const diff = a - b;
    out.push(
      fillInBox({
        subjectSlug: SUBJECT,
        strandSlug: "subtraction",
        yearGroup: YEAR,
        objectiveCode: "MA5-SUB-1",
        difficulty,
        promptText: `Use column subtraction to work out: ${a} - ${b} = ?`,
        answer: String(diff),
        explanation: `${a} - ${b} = ${diff}. Line up the digits by place value and subtract each column, exchanging where needed.`,
      })
    );
  }
  return out;
}

export function generateMultiplicationQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "bronze", "silver", "silver", "gold"] as const);
    const a = randInt(rng, difficulty === "bronze" ? 12 : difficulty === "silver" ? 100 : 1000, difficulty === "bronze" ? 99 : difficulty === "silver" ? 999 : 4999);
    const b = randInt(rng, 2, 12);
    const product = a * b;
    out.push(
      fillInBox({
        subjectSlug: SUBJECT,
        strandSlug: "multiplication",
        yearGroup: YEAR,
        objectiveCode: "MA5-MUL-3",
        difficulty,
        promptText: `Work out: ${a} × ${b} = ?`,
        answer: String(product),
        explanation: `${a} × ${b} = ${product}.`,
      })
    );
  }
  // Factors/primes multiple choice
  const factorTargets = [24, 36, 48, 60, 72, 84, 90, 100];
  for (const n of shuffle(rng, factorTargets).slice(0, Math.max(0, Math.min(4, count - out.length)))) {
    const factors: number[] = [];
    for (let f = 1; f <= n; f++) if (n % f === 0) factors.push(f);
    out.push(
      mcQuestion(rng, {
        subjectSlug: SUBJECT,
        strandSlug: "multiplication",
        yearGroup: YEAR,
        objectiveCode: "MA5-MUL-1",
        difficulty: "silver",
        promptText: `How many factor pairs does ${n} have?`,
        correct: String(factors.length / 2),
        distractors: [String(factors.length / 2 + 1), String(factors.length / 2 - 1), String(factors.length)],
        explanation: `${n} has factors: ${factors.join(", ")} — that's ${factors.length / 2} pairs.`,
      })
    );
  }
  return out.slice(0, count);
}

export function generateDivisionQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "bronze", "silver", "silver", "gold"] as const);
    const divisor = randInt(rng, 2, difficulty === "bronze" ? 9 : 12);
    const quotient = randInt(rng, difficulty === "bronze" ? 10 : 100, difficulty === "bronze" ? 99 : difficulty === "silver" ? 999 : 4999);
    const remainder = difficulty === "gold" ? randInt(rng, 0, divisor - 1) : 0;
    const dividend = quotient * divisor + remainder;
    const answer = remainder > 0 ? `${quotient} r ${remainder}` : String(quotient);
    out.push(
      fillInBox({
        subjectSlug: SUBJECT,
        strandSlug: "division",
        yearGroup: YEAR,
        objectiveCode: "MA5-DIV-1",
        difficulty,
        promptText: `Use short division to work out: ${dividend} ÷ ${divisor} = ? ${remainder > 0 ? "(write remainders as 'r' then the number, e.g. 12 r 3)" : ""}`,
        answer,
        explanation: `${dividend} ÷ ${divisor} = ${answer}.`,
      })
    );
  }
  return out;
}

export function generatePlaceValueQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "silver", "gold"] as const);
    const n = randInt(rng, 10000, 999999);
    const roundTo = pick(rng, difficulty === "bronze" ? [10, 100] : difficulty === "silver" ? [100, 1000] : [1000, 10000, 100000]);
    const rounded = Math.round(n / roundTo) * roundTo;
    out.push(
      mcQuestion(rng, {
        subjectSlug: SUBJECT,
        strandSlug: "number-place-value",
        yearGroup: YEAR,
        objectiveCode: "MA5-NPV-4",
        difficulty,
        promptText: `Round ${n.toLocaleString("en-GB")} to the nearest ${roundTo.toLocaleString("en-GB")}.`,
        correct: rounded.toLocaleString("en-GB"),
        distractors: [
          (rounded + roundTo).toLocaleString("en-GB"),
          (rounded - roundTo).toLocaleString("en-GB"),
          n.toLocaleString("en-GB"),
        ],
        explanation: `${n.toLocaleString("en-GB")} rounds to ${rounded.toLocaleString("en-GB")} when rounding to the nearest ${roundTo.toLocaleString("en-GB")}.`,
      })
    );
  }
  return out;
}

export function generateDecimalQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "silver", "gold"] as const);
    const places = difficulty === "bronze" ? 1 : difficulty === "silver" ? 2 : 3;
    const raw = randInt(rng, 1, 999);
    const value = raw / 10 ** places;
    const rounded = Math.round(value * 10) / 10;
    out.push(
      fillInBox({
        subjectSlug: SUBJECT,
        strandSlug: "decimals",
        yearGroup: YEAR,
        objectiveCode: "MA5-DEC-2",
        difficulty,
        promptText: `Round ${value} to one decimal place.`,
        answer: rounded.toFixed(1),
        explanation: `${value} rounds to ${rounded.toFixed(1)} to one decimal place.`,
      })
    );
  }
  return out;
}

export function generateFractionQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  // Denominators must allow at least two distinct numerators (1..d-1), so d >= 3.
  const denominators = [3, 4, 5, 6, 8, 10, 12];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "silver", "gold"] as const);
    const d = pick(rng, denominators);
    const n1 = randInt(rng, 1, d - 1);
    let n2 = randInt(rng, 1, d - 1);
    while (n2 === n1) n2 = randInt(rng, 1, d - 1);
    const bigger = n1 > n2 ? `${n1}/${d}` : `${n2}/${d}`;
    out.push(
      mcQuestion(rng, {
        subjectSlug: SUBJECT,
        strandSlug: "fractions",
        yearGroup: YEAR,
        objectiveCode: "MA5-FRAC-1",
        difficulty,
        promptText: `Which fraction is greater: ${n1}/${d} or ${n2}/${d}?`,
        correct: bigger,
        distractors: [n1 > n2 ? `${n2}/${d}` : `${n1}/${d}`, "They are equal", `${d}/${d}`],
        explanation: `Since both fractions share denominator ${d}, compare the numerators: the larger numerator gives the larger fraction, so ${bigger} is greater.`,
      })
    );
  }
  return out;
}

export function generatePercentageQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  // Each percentage is paired with a step size that keeps the answer a whole number.
  const percentageSteps: [pct: number, step: number][] = [[10, 10], [20, 5], [25, 4], [50, 2], [75, 4]];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "gold"] as const);
    const [pct, step] = pick(rng, percentageSteps);
    const base = randInt(rng, 2, 30) * step;
    const amount = Math.round((pct / 100) * base);
    out.push(
      fillInBox({
        subjectSlug: SUBJECT,
        strandSlug: "percentages",
        yearGroup: YEAR,
        objectiveCode: "MA5-PCT-3",
        difficulty,
        promptText: `Find ${pct}% of ${base}.`,
        answer: String(amount),
        explanation: `${pct}% of ${base} = (${pct}/100) × ${base} = ${amount}.`,
      })
    );
  }
  return out;
}

/** Runs every procedural generator for the current year group. Hand-authored
 * content for geometry, measurement, statistics, reasoning and word problems
 * lives in `content/questions/maths-authored.json` (context-heavy strands
 * that don't template well) and is merged in by the seed script. */
export function generateAllMathsQuestions(seed = 5150): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...generateAdditionQuestions(rng, 10),
    ...generateSubtractionQuestions(rng, 10),
    ...generateMultiplicationQuestions(rng, 12),
    ...generateDivisionQuestions(rng, 10),
    ...generatePlaceValueQuestions(rng, 10),
    ...generateDecimalQuestions(rng, 10),
    ...generateFractionQuestions(rng, 12),
    ...generatePercentageQuestions(rng, 8),
  ];
}
