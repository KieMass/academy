/**
 * Lower Key Stage 2 (Y3/Y4) procedural maths generators. Kept separate from
 * maths.ts (upper KS2, Y5/Y6) and maths-ks1.ts (KS1, Y1/Y2) for the same
 * reason those two are split: no content overlap, and it keeps each file a
 * manageable size.
 *
 * Mirrors maths.ts's Y5/Y6 split: number-based strands (place value, the
 * four operations, fractions) are covered procedurally here with the
 * mcQuestion/fillInBox helpers; context-heavy or diagram-dependent strands
 * (geometry, measurement, statistics, position & direction, reasoning,
 * word problems) are hand-authored in content/questions/maths-authored.json.
 */
import { createRng, pick, randInt, shuffle, type Rng } from "./rng";
import type { DraftQuestion } from "./types";
import type { DifficultyBand, YearGroup } from "@/lib/curriculum/types";

function mcQuestion(
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
  while (uniqueDistractors.length < 3) {
    uniqueDistractors.push(`${opts.correct}${uniqueDistractors.length + 1}`);
  }
  const optionTexts = shuffle(rng, [opts.correct, ...uniqueDistractors]);
  const options = optionTexts.map((text, i) => ({ id: `opt${i + 1}`, text }));
  const correctOptionId = options.find((o) => o.text === opts.correct)!.id;
  return {
    type: "multiple_choice",
    subjectSlug: SUBJECT,
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
    subjectSlug: SUBJECT,
    strandSlug: opts.strandSlug,
    yearGroup: opts.yearGroup,
    objectiveCode: opts.objectiveCode,
    difficulty: opts.difficulty,
    promptText: opts.promptText,
    explanation: opts.explanation,
    blanks: [{ id: "answer", acceptedAnswers: [opts.answer] }],
  };
}

const SUBJECT = "maths";
const Y3: YearGroup = "Y3";
const Y4: YearGroup = "Y4";

// ============================= YEAR 3 =====================================

function generateY3NumberPlaceValueQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["count-multiples", "place-value", "compare", "write-words"] as const);
    if (kind === "count-multiples") {
      const step = pick(rng, [4, 8, 50, 100] as const);
      const start = randInt(rng, 0, 4) * step;
      out.push(fillInBox({ strandSlug: "number-place-value", yearGroup: Y3, objectiveCode: "MA3-NPV-1", difficulty: "bronze", promptText: `Counting in ${step}s from ${start}: ${start}, ${start + step}, ${start + step * 2}, ___`, answer: String(start + step * 3), explanation: `Continuing the count in ${step}s gives ${start + step * 3}.` }));
    } else if (kind === "place-value") {
      const h = randInt(rng, 1, 9);
      const t = randInt(rng, 0, 9);
      const o = randInt(rng, 0, 9);
      const n = h * 100 + t * 10 + o;
      const ask = pick(rng, ["hundreds", "tens", "ones"] as const);
      const answer = ask === "hundreds" ? h : ask === "tens" ? t : o;
      out.push(fillInBox({ strandSlug: "number-place-value", yearGroup: Y3, objectiveCode: "MA3-NPV-2", difficulty: "silver", promptText: `In the number ${n}, how many ${ask} are there?`, answer: String(answer), explanation: `${n} = ${h} hundreds, ${t} tens and ${o} ones.` }));
    } else if (kind === "compare") {
      const a = randInt(rng, 1, 999);
      let b = randInt(rng, 1, 999);
      while (b === a) b = randInt(rng, 1, 999);
      const correct = a > b ? ">" : "<";
      out.push(mcQuestion(rng, { strandSlug: "number-place-value", yearGroup: Y3, objectiveCode: "MA3-NPV-3", difficulty: "silver", promptText: `Which symbol correctly compares ${a} and ${b}? ${a} ___ ${b}`, correct, distractors: ["=", correct === ">" ? "<" : ">"], explanation: `${a} is ${correct === ">" ? "greater" : "less"} than ${b}, so ${a} ${correct} ${b}.` }));
    } else {
      const h = randInt(rng, 1, 9);
      const t = randInt(rng, 0, 9);
      const o = randInt(rng, 0, 9);
      const n = h * 100 + t * 10 + o;
      out.push(fillInBox({ strandSlug: "number-place-value", yearGroup: Y3, objectiveCode: "MA3-NPV-4", difficulty: "gold", promptText: `Write this number in numerals: it has ${h} hundreds, ${t} tens and ${o} ones.`, answer: String(n), explanation: `${h} hundreds + ${t} tens + ${o} ones = ${n}.` }));
    }
  }
  return out;
}

function generateY3AdditionQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "silver", "gold"] as const);
    const a = randInt(rng, 100, 799);
    const b = difficulty === "bronze" ? randInt(rng, 1, 9) : difficulty === "silver" ? randInt(rng, 10, 90) : randInt(rng, 100, 199);
    out.push(fillInBox({ strandSlug: "addition", yearGroup: Y3, objectiveCode: difficulty === "gold" ? "MA3-ADD-2" : "MA3-ADD-1", difficulty, promptText: `Work out: ${a} + ${b} = ?`, answer: String(a + b), explanation: `${a} + ${b} = ${a + b}.` }));
  }
  return out;
}

function generateY3SubtractionQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "silver", "gold"] as const);
    const a = randInt(rng, 200, 900);
    const b = difficulty === "bronze" ? randInt(rng, 1, 9) : difficulty === "silver" ? randInt(rng, 10, 90) : randInt(rng, 100, a - 1);
    out.push(fillInBox({ strandSlug: "subtraction", yearGroup: Y3, objectiveCode: difficulty === "gold" ? "MA3-SUB-2" : "MA3-SUB-1", difficulty, promptText: `Work out: ${a} - ${b} = ?`, answer: String(a - b), explanation: `${a} - ${b} = ${a - b}.` }));
  }
  return out;
}

function generateY3MultiplicationQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const table = pick(rng, [3, 4, 8] as const);
    const n = randInt(rng, 1, 12);
    const product = table * n;
    out.push(fillInBox({ strandSlug: "multiplication", yearGroup: Y3, objectiveCode: "MA3-MUL-1", difficulty: n <= 6 ? "bronze" : "silver", promptText: `Work out: ${table} × ${n} = ?`, answer: String(product), explanation: `${table} × ${n} = ${product}.` }));
  }
  return out;
}

function generateY3DivisionQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const table = pick(rng, [3, 4, 8] as const);
    const n = randInt(rng, 1, 12);
    const product = table * n;
    out.push(fillInBox({ strandSlug: "division", yearGroup: Y3, objectiveCode: "MA3-DIV-1", difficulty: "silver", promptText: `Work out: ${product} ÷ ${table} = ?`, answer: String(n), explanation: `${product} ÷ ${table} = ${n}.` }));
  }
  return out;
}

function generateY3FractionsQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["count-tenths", "unit-fraction", "equivalent", "add-sub", "compare"] as const);
    if (kind === "count-tenths") {
      const start = randInt(rng, 1, 6);
      out.push(fillInBox({ strandSlug: "fractions", yearGroup: Y3, objectiveCode: "MA3-FRAC-1", difficulty: "bronze", promptText: `Counting in tenths: ${start}/10, ${start + 1}/10, ${start + 2}/10, ___`, answer: `${start + 3}/10`, explanation: `Continuing the count in tenths gives ${start + 3}/10.` }));
    } else if (kind === "unit-fraction") {
      const denom = pick(rng, [2, 3, 4, 5, 6, 8, 10] as const);
      const wholeCandidates = [denom * 2, denom * 3, denom * 4, denom * 5];
      const whole = pick(rng, wholeCandidates);
      const part = whole / denom;
      out.push(fillInBox({ strandSlug: "fractions", yearGroup: Y3, objectiveCode: "MA3-FRAC-2", difficulty: "silver", promptText: `What is 1/${denom} of ${whole}?`, answer: String(part), explanation: `${whole} ÷ ${denom} = ${part}.` }));
    } else if (kind === "equivalent") {
      const pairs: [number, number, number][] = [[1, 2, 2], [1, 2, 4], [1, 3, 2], [1, 4, 2], [2, 4, 2], [1, 5, 2], [3, 4, 2]];
      const [n, d, mult] = pick(rng, pairs);
      out.push(mcQuestion(rng, { strandSlug: "fractions", yearGroup: Y3, objectiveCode: "MA3-FRAC-3", difficulty: "gold", promptText: `Which fraction is equivalent to ${n}/${d}?`, correct: `${n * mult}/${d * mult}`, distractors: [`${n + 1}/${d}`, `${n}/${d + mult}`, `${n * mult}/${d}`], explanation: `Multiplying the numerator and denominator of ${n}/${d} by ${mult} gives the equivalent fraction ${n * mult}/${d * mult}.` }));
    } else if (kind === "add-sub") {
      const d = pick(rng, [3, 4, 5, 6, 8] as const);
      const n1 = randInt(rng, 1, d - 1);
      const n2 = randInt(rng, 1, d - n1);
      const isAdd = pick(rng, [true, false]);
      if (isAdd) {
        out.push(fillInBox({ strandSlug: "fractions", yearGroup: Y3, objectiveCode: "MA3-FRAC-4", difficulty: "silver", promptText: `Work out: ${n1}/${d} + ${n2}/${d} = ?`, answer: `${n1 + n2}/${d}`, explanation: `${n1}/${d} + ${n2}/${d} = ${n1 + n2}/${d}.` }));
      } else {
        const [big, small] = n1 + n2 >= n1 ? [n1 + n2, n1] : [n1, n1 + n2];
        out.push(fillInBox({ strandSlug: "fractions", yearGroup: Y3, objectiveCode: "MA3-FRAC-4", difficulty: "silver", promptText: `Work out: ${big}/${d} - ${small}/${d} = ?`, answer: `${big - small}/${d}`, explanation: `${big}/${d} - ${small}/${d} = ${big - small}/${d}.` }));
      }
    } else {
      // Needs at least 3 distinct numerators (1..d-1), so d must be >= 4.
      const d = pick(rng, [4, 5, 6, 8, 10] as const);
      const nums = new Set<number>();
      while (nums.size < 3) nums.add(randInt(rng, 1, d - 1));
      const arr = [...nums];
      const askMax = pick(rng, [true, false]);
      const target = askMax ? Math.max(...arr) : Math.min(...arr);
      out.push(mcQuestion(rng, { strandSlug: "fractions", yearGroup: Y3, objectiveCode: "MA3-FRAC-5", difficulty: "gold", promptText: `Which of these fractions is the ${askMax ? "largest" : "smallest"}: ${arr.map((n) => `${n}/${d}`).join(", ")}?`, correct: `${target}/${d}`, distractors: arr.filter((n) => n !== target).map((n) => `${n}/${d}`), explanation: `When fractions share a denominator, the ${askMax ? "largest" : "smallest"} numerator gives the ${askMax ? "largest" : "smallest"} fraction: ${target}/${d}.` }));
    }
  }
  return out;
}

export function generateAllMathsQuestionsY3(seed = 33500): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...generateY3NumberPlaceValueQuestions(rng, 36),
    ...generateY3AdditionQuestions(rng, 36),
    ...generateY3SubtractionQuestions(rng, 36),
    ...generateY3MultiplicationQuestions(rng, 32),
    ...generateY3DivisionQuestions(rng, 28),
    ...generateY3FractionsQuestions(rng, 36),
  ];
}

export function generateAllMathsQuestionsY3Extra(seed = 43500): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...generateY3NumberPlaceValueQuestions(rng, 32),
    ...generateY3AdditionQuestions(rng, 32),
    ...generateY3SubtractionQuestions(rng, 32),
    ...generateY3MultiplicationQuestions(rng, 28),
    ...generateY3DivisionQuestions(rng, 24),
    ...generateY3FractionsQuestions(rng, 32),
  ];
}

export function generateAllMathsQuestionsY3Extra2(seed = 53500): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...generateY3NumberPlaceValueQuestions(rng, 28),
    ...generateY3AdditionQuestions(rng, 28),
    ...generateY3SubtractionQuestions(rng, 28),
    ...generateY3MultiplicationQuestions(rng, 24),
    ...generateY3DivisionQuestions(rng, 20),
    ...generateY3FractionsQuestions(rng, 28),
  ];
}

export function generateAllMathsQuestionsY3Extra3(seed = 63500): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...generateY3NumberPlaceValueQuestions(rng, 36),
    ...generateY3AdditionQuestions(rng, 40),
    ...generateY3SubtractionQuestions(rng, 40),
    ...generateY3MultiplicationQuestions(rng, 16),
    ...generateY3DivisionQuestions(rng, 12),
    ...generateY3FractionsQuestions(rng, 40),
  ];
}

// ============================= YEAR 4 =====================================

function generateY4NumberPlaceValueQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["count-multiples", "place-value", "round", "negative"] as const);
    if (kind === "count-multiples") {
      const step = pick(rng, [6, 7, 9, 25, 1000] as const);
      const start = randInt(rng, 0, 4) * step;
      out.push(fillInBox({ strandSlug: "number-place-value", yearGroup: Y4, objectiveCode: "MA4-NPV-1", difficulty: "bronze", promptText: `Counting in ${step}s from ${start}: ${start}, ${start + step}, ${start + step * 2}, ___`, answer: String(start + step * 3), explanation: `Continuing the count in ${step}s gives ${start + step * 3}.` }));
    } else if (kind === "place-value") {
      const th = randInt(rng, 1, 9);
      const h = randInt(rng, 0, 9);
      const t = randInt(rng, 0, 9);
      const o = randInt(rng, 0, 9);
      const n = th * 1000 + h * 100 + t * 10 + o;
      const ask = pick(rng, ["thousands", "hundreds", "tens", "ones"] as const);
      const answer = ask === "thousands" ? th : ask === "hundreds" ? h : ask === "tens" ? t : o;
      out.push(fillInBox({ strandSlug: "number-place-value", yearGroup: Y4, objectiveCode: "MA4-NPV-2", difficulty: "silver", promptText: `In the number ${n}, how many ${ask} are there?`, answer: String(answer), explanation: `${n} = ${th} thousands, ${h} hundreds, ${t} tens and ${o} ones.` }));
    } else if (kind === "round") {
      const n = randInt(rng, 1000, 9999);
      const nearest = pick(rng, [10, 100, 1000] as const);
      const rounded = Math.round(n / nearest) * nearest;
      out.push(fillInBox({ strandSlug: "number-place-value", yearGroup: Y4, objectiveCode: "MA4-NPV-4", difficulty: "gold", promptText: `Round ${n} to the nearest ${nearest}.`, answer: String(rounded), explanation: `${n} rounds to ${rounded} to the nearest ${nearest}.` }));
    } else {
      const a = randInt(rng, -10, 10);
      const step = randInt(rng, 1, 5);
      out.push(fillInBox({ strandSlug: "number-place-value", yearGroup: Y4, objectiveCode: "MA4-NPV-5", difficulty: "gold", promptText: `Count on ${step} from ${a}. What number do you reach?`, answer: String(a + step), explanation: `Counting on ${step} from ${a} (through zero if needed) gives ${a + step}.` }));
    }
  }
  return out;
}

function generateY4AdditionQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "silver", "gold"] as const);
    const a = randInt(rng, 1000, 8000);
    const b = difficulty === "bronze" ? randInt(rng, 100, 900) : difficulty === "silver" ? randInt(rng, 1000, 1999) : randInt(rng, 1000, 1999);
    out.push(fillInBox({ strandSlug: "addition", yearGroup: Y4, objectiveCode: "MA4-ADD-1", difficulty, promptText: `Work out: ${a} + ${b} = ?`, answer: String(a + b), explanation: `${a} + ${b} = ${a + b}.` }));
  }
  return out;
}

function generateY4SubtractionQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "silver", "gold"] as const);
    const a = randInt(rng, 2000, 9000);
    const b = randInt(rng, 1000, a - 1);
    out.push(fillInBox({ strandSlug: "subtraction", yearGroup: Y4, objectiveCode: "MA4-SUB-1", difficulty, promptText: `Work out: ${a} - ${b} = ?`, answer: String(a - b), explanation: `${a} - ${b} = ${a - b}.` }));
  }
  return out;
}

function generateY4MultiplicationQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["fact", "written", "factor-pairs"] as const);
    if (kind === "fact") {
      const table = randInt(rng, 2, 12);
      const n = randInt(rng, 1, 12);
      out.push(fillInBox({ strandSlug: "multiplication", yearGroup: Y4, objectiveCode: "MA4-MUL-1", difficulty: table <= 6 ? "bronze" : "silver", promptText: `Work out: ${table} × ${n} = ?`, answer: String(table * n), explanation: `${table} × ${n} = ${table * n}.` }));
    } else if (kind === "written") {
      const a = randInt(rng, 100, 999);
      const b = randInt(rng, 2, 9);
      out.push(fillInBox({ strandSlug: "multiplication", yearGroup: Y4, objectiveCode: "MA4-MUL-4", difficulty: "gold", promptText: `Work out: ${a} × ${b} = ?`, answer: String(a * b), explanation: `${a} × ${b} = ${a * b}.` }));
    } else {
      const n = pick(rng, [12, 16, 18, 20, 24, 28, 30, 36, 40] as const);
      const factors: number[] = [];
      for (let f = 1; f <= n; f++) if (n % f === 0) factors.push(f);
      const pairIdx = randInt(rng, 0, Math.floor(factors.length / 2) - 1);
      const a = factors[pairIdx];
      const b = n / a;
      out.push(mcQuestion(rng, { strandSlug: "multiplication", yearGroup: Y4, objectiveCode: "MA4-MUL-3", difficulty: "silver", promptText: `Which pair of factors multiplies to give ${n}?`, correct: `${a} × ${b}`, distractors: [`${a + 1} × ${b}`, `${a} × ${b + 1}`, `${a + 2} × ${Math.max(1, b - 1)}`], explanation: `${a} × ${b} = ${n}.` }));
    }
  }
  return out;
}

function generateY4DivisionQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const table = randInt(rng, 2, 12);
    const n = randInt(rng, 1, 12);
    const product = table * n;
    const withRemainder = pick(rng, [true, false]);
    if (withRemainder) {
      const remainder = randInt(rng, 1, table - 1);
      out.push(fillInBox({ strandSlug: "division", yearGroup: Y4, objectiveCode: "MA4-DIV-2", difficulty: "gold", promptText: `Work out: ${product + remainder} ÷ ${table} = ? (write the whole number, ignore the remainder)`, answer: String(n), explanation: `${product + remainder} ÷ ${table} = ${n} remainder ${remainder}, so the whole number part is ${n}.` }));
    } else {
      out.push(fillInBox({ strandSlug: "division", yearGroup: Y4, objectiveCode: "MA4-DIV-1", difficulty: table <= 6 ? "bronze" : "silver", promptText: `Work out: ${product} ÷ ${table} = ?`, answer: String(n), explanation: `${product} ÷ ${table} = ${n}.` }));
    }
  }
  return out;
}

function generateY4FractionsQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const fracToDecimal: [number, number, string][] = [[1, 4, "0.25"], [1, 2, "0.5"], [3, 4, "0.75"], [1, 10, "0.1"], [3, 10, "0.3"], [7, 10, "0.7"], [1, 100, "0.01"], [25, 100, "0.25"], [50, 100, "0.5"]];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["equivalent", "count-hundredths", "add-sub", "decimal-equiv", "round", "compare"] as const);
    if (kind === "equivalent") {
      const d = pick(rng, [2, 3, 4, 5] as const);
      const n = randInt(rng, 1, d - 1);
      const mult = randInt(rng, 2, 4);
      out.push(fillInBox({ strandSlug: "fractions", yearGroup: Y4, objectiveCode: "MA4-FRAC-1", difficulty: "silver", promptText: `Complete the equivalent fraction: ${n}/${d} = ___/${d * mult}`, answer: String(n * mult), explanation: `Multiplying numerator and denominator by ${mult}: ${n}/${d} = ${n * mult}/${d * mult}.` }));
    } else if (kind === "count-hundredths") {
      const start = randInt(rng, 1, 90);
      out.push(fillInBox({ strandSlug: "fractions", yearGroup: Y4, objectiveCode: "MA4-FRAC-2", difficulty: "bronze", promptText: `Counting in hundredths: ${start}/100, ${start + 1}/100, ${start + 2}/100, ___`, answer: `${start + 3}/100`, explanation: `Continuing the count in hundredths gives ${start + 3}/100.` }));
    } else if (kind === "add-sub") {
      const d = pick(rng, [5, 6, 7, 8, 9, 10] as const);
      const n1 = randInt(rng, 1, d - 1);
      const n2 = randInt(rng, 1, d - n1);
      out.push(fillInBox({ strandSlug: "fractions", yearGroup: Y4, objectiveCode: "MA4-FRAC-3", difficulty: "silver", promptText: `Work out: ${n1}/${d} + ${n2}/${d} = ?`, answer: `${n1 + n2}/${d}`, explanation: `${n1}/${d} + ${n2}/${d} = ${n1 + n2}/${d}.` }));
    } else if (kind === "decimal-equiv") {
      const [n, d, decimal] = pick(rng, fracToDecimal);
      const toDecimal = pick(rng, [true, false]);
      if (toDecimal) {
        out.push(fillInBox({ strandSlug: "fractions", yearGroup: Y4, objectiveCode: "MA4-FRAC-4", difficulty: "gold", promptText: `Write ${n}/${d} as a decimal.`, answer: decimal, explanation: `${n}/${d} = ${decimal}.` }));
      } else {
        out.push(fillInBox({ strandSlug: "fractions", yearGroup: Y4, objectiveCode: "MA4-FRAC-5", difficulty: "silver", promptText: `Write ${decimal} as a fraction (e.g. quarters, halves or tenths).`, answer: `${n}/${d}`, explanation: `${decimal} = ${n}/${d}.` }));
      }
    } else if (kind === "round") {
      const whole = randInt(rng, 1, 20);
      const tenth = randInt(rng, 0, 9);
      const decimal = `${whole}.${tenth}`;
      const rounded = tenth >= 5 ? whole + 1 : whole;
      out.push(fillInBox({ strandSlug: "fractions", yearGroup: Y4, objectiveCode: "MA4-FRAC-6", difficulty: "silver", promptText: `Round ${decimal} to the nearest whole number.`, answer: String(rounded), explanation: `${decimal} rounds to ${rounded} (round up from .5).` }));
    } else {
      const places = 2;
      const nums = new Set<number>();
      while (nums.size < 3) nums.add(randInt(rng, 1, 99) / 10 ** places);
      const arr = [...nums];
      const askMax = pick(rng, [true, false]);
      const target = askMax ? Math.max(...arr) : Math.min(...arr);
      out.push(mcQuestion(rng, { strandSlug: "fractions", yearGroup: Y4, objectiveCode: "MA4-FRAC-7", difficulty: "gold", promptText: `Which of these decimals is the ${askMax ? "largest" : "smallest"}?`, correct: target.toFixed(places), distractors: arr.filter((n) => n !== target).map((n) => n.toFixed(places)), explanation: `${target.toFixed(places)} is the ${askMax ? "largest" : "smallest"} of the decimals.` }));
    }
  }
  return out;
}

export function generateAllMathsQuestionsY4(seed = 34500): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...generateY4NumberPlaceValueQuestions(rng, 40),
    ...generateY4AdditionQuestions(rng, 32),
    ...generateY4SubtractionQuestions(rng, 32),
    ...generateY4MultiplicationQuestions(rng, 40),
    ...generateY4DivisionQuestions(rng, 32),
    ...generateY4FractionsQuestions(rng, 40),
  ];
}

export function generateAllMathsQuestionsY4Extra(seed = 44500): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...generateY4NumberPlaceValueQuestions(rng, 36),
    ...generateY4AdditionQuestions(rng, 28),
    ...generateY4SubtractionQuestions(rng, 28),
    ...generateY4MultiplicationQuestions(rng, 36),
    ...generateY4DivisionQuestions(rng, 28),
    ...generateY4FractionsQuestions(rng, 36),
  ];
}

export function generateAllMathsQuestionsY4Extra2(seed = 54500): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...generateY4NumberPlaceValueQuestions(rng, 32),
    ...generateY4AdditionQuestions(rng, 24),
    ...generateY4SubtractionQuestions(rng, 24),
    ...generateY4MultiplicationQuestions(rng, 32),
    ...generateY4DivisionQuestions(rng, 24),
    ...generateY4FractionsQuestions(rng, 32),
  ];
}

export function generateAllMathsQuestionsY4Extra3(seed = 64500): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...generateY4NumberPlaceValueQuestions(rng, 40),
    ...generateY4AdditionQuestions(rng, 36),
    ...generateY4SubtractionQuestions(rng, 36),
    ...generateY4MultiplicationQuestions(rng, 40),
    ...generateY4DivisionQuestions(rng, 32),
    ...generateY4FractionsQuestions(rng, 40),
  ];
}
