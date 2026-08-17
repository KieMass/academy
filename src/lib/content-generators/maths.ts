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

function toRoman(num: number): string {
  const table: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let result = "";
  let n = num;
  for (const [value, symbol] of table) {
    while (n >= value) {
      result += symbol;
      n -= value;
    }
  }
  return result;
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function generateNumberComparisonQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "silver", "gold"] as const);
    const digits = difficulty === "bronze" ? 4 : difficulty === "silver" ? 5 : 6;
    const nums = new Set<number>();
    while (nums.size < 4) nums.add(randInt(rng, 10 ** (digits - 1), 10 ** digits - 1));
    const arr = [...nums];
    const askMax = pick(rng, [true, false]);
    const target = askMax ? Math.max(...arr) : Math.min(...arr);
    out.push(
      mcQuestion(rng, {
        subjectSlug: SUBJECT,
        strandSlug: "number-place-value",
        yearGroup: YEAR,
        objectiveCode: "MA5-NPV-1",
        difficulty,
        promptText: `Which of these numbers is the ${askMax ? "largest" : "smallest"}?`,
        correct: target.toLocaleString("en-GB"),
        distractors: arr.filter((n) => n !== target).map((n) => n.toLocaleString("en-GB")),
        explanation: `${target.toLocaleString("en-GB")} is the ${askMax ? "largest" : "smallest"} of the four numbers.`,
      })
    );
  }
  return out;
}

export function generateNegativeNumberQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["silver", "gold", "gold", "challenge"] as const);
    const start = randInt(rng, -10, 10);
    const change = randInt(rng, 3, 20);
    const goesDown = pick(rng, [true, false]);
    const result = goesDown ? start - change : start + change;
    out.push(
      fillInBox({
        subjectSlug: SUBJECT,
        strandSlug: "number-place-value",
        yearGroup: YEAR,
        objectiveCode: "MA5-NPV-3",
        difficulty,
        promptText: `The temperature is ${start}°C. It ${goesDown ? "falls" : "rises"} by ${change} degrees. What is the new temperature (in °C)?`,
        answer: String(result),
        explanation: `${start} ${goesDown ? "-" : "+"} ${change} = ${result}°C.`,
      })
    );
  }
  return out;
}

export function generateRomanNumeralQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["silver", "silver", "gold"] as const);
    const n = randInt(rng, 4, 998);
    const roman = toRoman(n);
    const toNumber = pick(rng, [true, false]);
    if (toNumber) {
      const distractors = new Set<number>();
      while (distractors.size < 3) {
        const delta = randInt(rng, 1, 20) * pick(rng, [1, -1]);
        const d = n + delta;
        if (d > 0 && d !== n) distractors.add(d);
      }
      out.push(
        mcQuestion(rng, {
          subjectSlug: SUBJECT, strandSlug: "number-place-value", yearGroup: YEAR, objectiveCode: "MA5-NPV-6",
          difficulty,
          promptText: `What number does the Roman numeral ${roman} represent?`,
          correct: String(n),
          distractors: [...distractors].map(String),
          explanation: `${roman} represents ${n}.`,
        })
      );
    } else {
      const distractors = new Set<string>();
      while (distractors.size < 3) {
        const delta = randInt(rng, 1, 20) * pick(rng, [1, -1]);
        const d = n + delta;
        if (d > 0 && d !== n) distractors.add(toRoman(d));
      }
      out.push(
        mcQuestion(rng, {
          subjectSlug: SUBJECT, strandSlug: "number-place-value", yearGroup: YEAR, objectiveCode: "MA5-NPV-6",
          difficulty,
          promptText: `What is the Roman numeral for ${n}?`,
          correct: roman,
          distractors: [...distractors],
          explanation: `${n} in Roman numerals is ${roman}.`,
        })
      );
    }
  }
  return out;
}

export function generateMentalAdditionQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "bronze", "silver"] as const);
    const roundTo = pick(rng, [10, 100, 1000]);
    const a = randInt(rng, 2, 90) * roundTo;
    const b = randInt(rng, 2, 90) * roundTo;
    out.push(
      fillInBox({
        subjectSlug: SUBJECT, strandSlug: "addition", yearGroup: YEAR, objectiveCode: "MA5-ADD-2",
        difficulty,
        promptText: `Work out mentally: ${a.toLocaleString("en-GB")} + ${b.toLocaleString("en-GB")} = ?`,
        answer: String(a + b),
        explanation: `${a.toLocaleString("en-GB")} + ${b.toLocaleString("en-GB")} = ${(a + b).toLocaleString("en-GB")}.`,
      })
    );
  }
  return out;
}

export function generateRoundingEstimateQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["silver", "gold"] as const);
    const roundTo = pick(rng, [100, 1000]);
    const a = randInt(rng, 10, 90) * roundTo + randInt(rng, 1, roundTo - 1);
    const b = randInt(rng, 10, 90) * roundTo + randInt(rng, 1, roundTo - 1);
    const estimate = Math.round(a / roundTo) * roundTo + Math.round(b / roundTo) * roundTo;
    out.push(
      fillInBox({
        subjectSlug: SUBJECT, strandSlug: "addition", yearGroup: YEAR, objectiveCode: "MA5-ADD-3",
        difficulty,
        promptText: `Estimate ${a.toLocaleString("en-GB")} + ${b.toLocaleString("en-GB")} by rounding each number to the nearest ${roundTo.toLocaleString("en-GB")} first.`,
        answer: String(estimate),
        explanation: `${a.toLocaleString("en-GB")} rounds to ${(Math.round(a / roundTo) * roundTo).toLocaleString("en-GB")}, ${b.toLocaleString("en-GB")} rounds to ${(Math.round(b / roundTo) * roundTo).toLocaleString("en-GB")}. Estimate: ${estimate.toLocaleString("en-GB")}.`,
      })
    );
  }
  return out;
}

export function generateMentalSubtractionQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "bronze", "silver"] as const);
    const roundTo = pick(rng, [10, 100, 1000]);
    const b = randInt(rng, 2, 80) * roundTo;
    const a = b + randInt(rng, 2, 80) * roundTo;
    out.push(
      fillInBox({
        subjectSlug: SUBJECT, strandSlug: "subtraction", yearGroup: YEAR, objectiveCode: "MA5-SUB-2",
        difficulty,
        promptText: `Work out mentally: ${a.toLocaleString("en-GB")} - ${b.toLocaleString("en-GB")} = ?`,
        answer: String(a - b),
        explanation: `${a.toLocaleString("en-GB")} - ${b.toLocaleString("en-GB")} = ${(a - b).toLocaleString("en-GB")}.`,
      })
    );
  }
  return out;
}

export function generatePrimeQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["silver", "gold", "gold", "challenge"] as const);
    const askPrime = pick(rng, [true, false]);
    const primes = Array.from({ length: 99 }, (_, n) => n + 2).filter(isPrime);
    const composites = Array.from({ length: 99 }, (_, n) => n + 2).filter((n) => !isPrime(n));
    const correctPool = askPrime ? primes : composites;
    const wrongPool = askPrime ? composites : primes;
    const correct = pick(rng, correctPool);
    const distractors = new Set<number>();
    while (distractors.size < 3) distractors.add(pick(rng, wrongPool));
    out.push(
      mcQuestion(rng, {
        subjectSlug: SUBJECT, strandSlug: "multiplication", yearGroup: YEAR, objectiveCode: "MA5-MUL-2",
        difficulty,
        promptText: `Which of these numbers is ${askPrime ? "prime" : "composite (not prime)"}?`,
        correct: String(correct),
        distractors: [...distractors].map(String),
        explanation: askPrime
          ? `${correct} has exactly two factors (1 and itself), so it is prime.`
          : `${correct} has factors other than 1 and itself, so it is composite.`,
      })
    );
  }
  return out;
}

export function generateSquareCubeQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "gold"] as const);
    const isCube = pick(rng, [true, false]);
    const base = isCube ? randInt(rng, 2, 10) : randInt(rng, 2, 15);
    const result = isCube ? base ** 3 : base ** 2;
    out.push(
      fillInBox({
        subjectSlug: SUBJECT, strandSlug: "multiplication", yearGroup: YEAR, objectiveCode: "MA5-MUL-5",
        difficulty,
        promptText: `What is ${base}${isCube ? "³" : "²"}?`,
        answer: String(result),
        explanation: isCube
          ? `${base}³ = ${base} × ${base} × ${base} = ${result}.`
          : `${base}² = ${base} × ${base} = ${result}.`,
      })
    );
  }
  return out;
}

export function generateMixedNumberQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["silver", "silver", "gold"] as const);
    const d = pick(rng, [3, 4, 5, 6, 8]);
    const whole = randInt(rng, 1, 6);
    const rem = randInt(rng, 1, d - 1);
    const improperNumerator = whole * d + rem;
    const toMixed = pick(rng, [true, false]);
    if (toMixed) {
      out.push(
        fillInBox({
          subjectSlug: SUBJECT, strandSlug: "fractions", yearGroup: YEAR, objectiveCode: "MA5-FRAC-2",
          difficulty,
          promptText: `Write ${improperNumerator}/${d} as a mixed number (e.g. 2 1/3).`,
          answer: `${whole} ${rem}/${d}`,
          explanation: `${improperNumerator} ÷ ${d} = ${whole} remainder ${rem}, so ${improperNumerator}/${d} = ${whole} ${rem}/${d}.`,
        })
      );
    } else {
      out.push(
        fillInBox({
          subjectSlug: SUBJECT, strandSlug: "fractions", yearGroup: YEAR, objectiveCode: "MA5-FRAC-2",
          difficulty,
          promptText: `Write ${whole} ${rem}/${d} as an improper fraction.`,
          answer: `${improperNumerator}/${d}`,
          explanation: `${whole} × ${d} + ${rem} = ${improperNumerator}, so the improper fraction is ${improperNumerator}/${d}.`,
        })
      );
    }
  }
  return out;
}

export function generateFractionAddSubQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const denominators = [4, 5, 6, 8, 10, 12];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "silver", "gold"] as const);
    const d = pick(rng, denominators);
    const n1 = randInt(rng, 1, d - 1);
    const n2 = randInt(rng, 1, d - 1);
    const isAdd = pick(rng, [true, false]);
    const resultNum = isAdd ? n1 + n2 : Math.max(n1, n2) - Math.min(n1, n2);
    const [big, small] = n1 >= n2 ? [n1, n2] : [n2, n1];
    const g = gcd(resultNum || 1, d);
    const simplifiedNum = resultNum / g;
    const simplifiedDen = d / g;
    const simplified =
      resultNum === 0 ? "0" : simplifiedDen === 1 ? String(simplifiedNum) : g > 1 ? `${simplifiedNum}/${simplifiedDen}` : `${resultNum}/${d}`;
    out.push(
      fillInBox({
        subjectSlug: SUBJECT, strandSlug: "fractions", yearGroup: YEAR, objectiveCode: "MA5-FRAC-3",
        difficulty,
        promptText: isAdd
          ? `Work out: ${n1}/${d} + ${n2}/${d} = ? (give your answer in its simplest form)`
          : `Work out: ${big}/${d} - ${small}/${d} = ? (give your answer in its simplest form)`,
        answer: simplified,
        explanation: isAdd
          ? `${n1}/${d} + ${n2}/${d} = ${resultNum}/${d}${g > 1 ? ` = ${simplified}` : ""}.`
          : `${big}/${d} - ${small}/${d} = ${resultNum}/${d}${g > 1 ? ` = ${simplified}` : ""}.`,
      })
    );
  }
  return out;
}

export function generateDecimalCompareQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "silver", "gold"] as const);
    const places = difficulty === "bronze" ? 1 : difficulty === "silver" ? 2 : 3;
    const nums = new Set<number>();
    while (nums.size < 4) nums.add(randInt(rng, 1, 999) / 10 ** places);
    const arr = [...nums];
    const askMax = pick(rng, [true, false]);
    const target = askMax ? Math.max(...arr) : Math.min(...arr);
    out.push(
      mcQuestion(rng, {
        subjectSlug: SUBJECT, strandSlug: "decimals", yearGroup: YEAR, objectiveCode: "MA5-DEC-1",
        difficulty,
        promptText: `Which of these decimals is the ${askMax ? "largest" : "smallest"}?`,
        correct: target.toFixed(places),
        distractors: arr.filter((n) => n !== target).map((n) => n.toFixed(places)),
        explanation: `${target.toFixed(places)} is the ${askMax ? "largest" : "smallest"} of the four decimals.`,
      })
    );
  }
  return out;
}

export function generateDecimalFractionQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  // Denominators chosen so the decimal terminates cleanly within 3 places.
  const fracToDecimal: [number, number, string][] = [
    [1, 2, "0.5"], [1, 4, "0.25"], [3, 4, "0.75"], [1, 5, "0.2"], [2, 5, "0.4"],
    [3, 5, "0.6"], [4, 5, "0.8"], [1, 8, "0.125"], [3, 8, "0.375"], [1, 10, "0.1"],
    [3, 10, "0.3"], [7, 10, "0.7"], [1, 20, "0.05"], [1, 25, "0.04"], [1, 100, "0.01"],
  ];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["silver", "silver", "gold", "challenge"] as const);
    const [num, den, decimal] = pick(rng, fracToDecimal);
    const toDecimal = pick(rng, [true, false]);
    if (toDecimal) {
      out.push(
        fillInBox({
          subjectSlug: SUBJECT, strandSlug: "decimals", yearGroup: YEAR, objectiveCode: "MA5-DEC-3",
          difficulty,
          promptText: `Write ${num}/${den} as a decimal.`,
          answer: decimal,
          explanation: `${num}/${den} = ${decimal}.`,
        })
      );
    } else {
      out.push(
        fillInBox({
          subjectSlug: SUBJECT, strandSlug: "decimals", yearGroup: YEAR, objectiveCode: "MA5-DEC-3",
          difficulty,
          promptText: `Write ${decimal} as a fraction in its simplest form.`,
          answer: `${num}/${den}`,
          explanation: `${decimal} = ${num}/${den} in its simplest form.`,
        })
      );
    }
  }
  return out;
}

export function generatePercentFractionDecimalQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const percents = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "silver", "gold"] as const);
    const pct = pick(rng, percents);
    const asDecimal = pick(rng, [true, false]);
    if (asDecimal) {
      out.push(
        fillInBox({
          subjectSlug: SUBJECT, strandSlug: "percentages", yearGroup: YEAR, objectiveCode: "MA5-PCT-2",
          difficulty,
          promptText: `Write ${pct}% as a decimal.`,
          answer: (pct / 100).toString(),
          explanation: `${pct}% = ${pct}/100 = ${pct / 100}.`,
        })
      );
    } else {
      out.push(
        fillInBox({
          subjectSlug: SUBJECT, strandSlug: "percentages", yearGroup: YEAR, objectiveCode: "MA5-PCT-1",
          difficulty,
          promptText: `Write ${pct}% as a fraction with denominator 100.`,
          answer: `${pct}/100`,
          explanation: `${pct}% means ${pct} parts per hundred, so it is ${pct}/100.`,
        })
      );
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Year 6 generators. Number ranges and objective codes step up from Y5, but
// reuse the same mcQuestion/fillInBox helpers and difficulty-band pattern.
// Hand-authored content for geometry, measurement, position & direction,
// statistics (charts), algebra word problems, ratio scale-factor problems,
// reasoning and word problems lives in `content/questions/maths-authored.json`
// (context-heavy / diagram-dependent strands that don't template well).
// ---------------------------------------------------------------------------
const YEAR6: DraftQuestion["yearGroup"] = "Y6";

export function generateNumberComparisonY6Questions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "silver", "gold"] as const);
    // "Up to 10,000,000" tops out at a 7-digit range (9,999,999) — there is
    // no 8-digit number below ten million, so bronze/silver/gold all draw
    // from 6- or 7-digit numbers, just with a narrower band at gold.
    const digits = difficulty === "bronze" ? 6 : 7;
    const min = difficulty === "gold" ? 5000000 : 10 ** (digits - 1);
    const max = 10 ** digits - 1;
    const nums = new Set<number>();
    while (nums.size < 4) nums.add(randInt(rng, min, max));
    const arr = [...nums];
    const askMax = pick(rng, [true, false]);
    const target = askMax ? Math.max(...arr) : Math.min(...arr);
    out.push(
      mcQuestion(rng, {
        subjectSlug: SUBJECT, strandSlug: "number-place-value", yearGroup: YEAR6, objectiveCode: "MA6-NPV-1",
        difficulty,
        promptText: `Which of these numbers is the ${askMax ? "largest" : "smallest"}?`,
        correct: target.toLocaleString("en-GB"),
        distractors: arr.filter((n) => n !== target).map((n) => n.toLocaleString("en-GB")),
        explanation: `${target.toLocaleString("en-GB")} is the ${askMax ? "largest" : "smallest"} of the four numbers.`,
      })
    );
  }
  return out;
}

export function generateRoundingY6Questions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "gold"] as const);
    const n = randInt(rng, 100000, 9999999);
    const roundTo = pick(rng, difficulty === "bronze" ? [100, 1000] : difficulty === "silver" ? [1000, 10000] : [10000, 100000, 1000000]);
    const rounded = Math.round(n / roundTo) * roundTo;
    out.push(
      mcQuestion(rng, {
        subjectSlug: SUBJECT, strandSlug: "number-place-value", yearGroup: YEAR6, objectiveCode: "MA6-NPV-2",
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

export function generateNegativeIntervalY6Questions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["silver", "gold", "gold", "challenge"] as const);
    const a = randInt(rng, -30, -1);
    const b = randInt(rng, 1, 30);
    const [lo, hi] = pick(rng, [
      [a, b],
      [b, a],
    ]);
    const interval = Math.abs(hi - lo);
    out.push(
      fillInBox({
        subjectSlug: SUBJECT, strandSlug: "number-place-value", yearGroup: YEAR6, objectiveCode: "MA6-NPV-3",
        difficulty,
        promptText: `Find the difference between ${lo} and ${hi}.`,
        answer: String(interval),
        explanation: `The difference between ${lo} and ${hi} is ${interval} (count the interval across zero).`,
      })
    );
  }
  return out;
}

export function generateMixedMentalY6Questions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "gold"] as const);
    const roundTo = pick(rng, [10, 100]);
    const a = randInt(rng, 2, 90) * roundTo;
    const b = randInt(rng, 2, 90) * roundTo;
    const c = randInt(rng, 2, 90) * roundTo;
    const isAddAdd = pick(rng, [true, false]);
    const result = isAddAdd ? a + b + c : a + b - c;
    out.push(
      fillInBox({
        subjectSlug: SUBJECT, strandSlug: "addition", yearGroup: YEAR6, objectiveCode: "MA6-ADD-1",
        difficulty,
        promptText: `Work out mentally: ${a.toLocaleString("en-GB")} ${isAddAdd ? "+" : "+"} ${b.toLocaleString("en-GB")} ${isAddAdd ? "+" : "-"} ${c.toLocaleString("en-GB")} = ?`,
        answer: String(result),
        explanation: `${a.toLocaleString("en-GB")} ${isAddAdd ? "+" : "+"} ${b.toLocaleString("en-GB")} ${isAddAdd ? "+" : "-"} ${c.toLocaleString("en-GB")} = ${result.toLocaleString("en-GB")}.`,
      })
    );
  }
  return out;
}

export function generateEstimationY6Questions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["silver", "gold", "challenge"] as const);
    const roundTo = pick(rng, [100, 1000, 10000]);
    const a = randInt(rng, 10, 90) * roundTo + randInt(rng, 1, roundTo - 1);
    const b = randInt(rng, 10, 90) * roundTo + randInt(rng, 1, roundTo - 1);
    const isSub = pick(rng, [true, false]) && a > b;
    const roundedA = Math.round(a / roundTo) * roundTo;
    const roundedB = Math.round(b / roundTo) * roundTo;
    const estimate = isSub ? roundedA - roundedB : roundedA + roundedB;
    out.push(
      fillInBox({
        subjectSlug: SUBJECT, strandSlug: "addition", yearGroup: YEAR6, objectiveCode: "MA6-ADD-2",
        difficulty,
        promptText: `Estimate ${a.toLocaleString("en-GB")} ${isSub ? "-" : "+"} ${b.toLocaleString("en-GB")} by rounding each number to the nearest ${roundTo.toLocaleString("en-GB")} first.`,
        answer: String(estimate),
        explanation: `${a.toLocaleString("en-GB")} rounds to ${roundedA.toLocaleString("en-GB")}, ${b.toLocaleString("en-GB")} rounds to ${roundedB.toLocaleString("en-GB")}. Estimate: ${estimate.toLocaleString("en-GB")}.`,
      })
    );
  }
  return out;
}

export function generateLongMultiplicationY6Questions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "gold"] as const);
    const digits = difficulty === "bronze" ? 2 : difficulty === "silver" ? 3 : 4;
    const a = randInt(rng, 10 ** (digits - 1), 10 ** digits - 1);
    const b = randInt(rng, 11, 89);
    const product = a * b;
    out.push(
      fillInBox({
        subjectSlug: SUBJECT, strandSlug: "multiplication", yearGroup: YEAR6, objectiveCode: "MA6-MUL-1",
        difficulty,
        promptText: `Use long multiplication to work out: ${a} × ${b} = ?`,
        answer: String(product),
        explanation: `${a} × ${b} = ${product}.`,
      })
    );
  }
  return out;
}

export function generateFactorsMultiplesY6Questions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const pairs: [number, number][] = [[12, 18], [8, 12], [15, 20], [16, 24], [9, 15], [10, 25], [14, 21], [18, 30]];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["silver", "gold", "challenge"] as const);
    const [x, y] = pick(rng, pairs);
    const askHCF = pick(rng, [true, false]);
    const factorsOf = (n: number) => Array.from({ length: n }, (_, k) => k + 1).filter((f) => n % f === 0);
    const commonFactors = factorsOf(x).filter((f) => y % f === 0);
    const hcf = Math.max(...commonFactors);
    const lcm = (x * y) / hcf;
    const correct = askHCF ? hcf : lcm;
    const distractors = askHCF
      ? [hcf + 1, hcf - 1 > 0 ? hcf - 1 : hcf + 2, hcf * 2].map(String)
      : [lcm + x, lcm - x > 0 ? lcm - x : lcm + y, x * y].map(String);
    out.push(
      mcQuestion(rng, {
        subjectSlug: SUBJECT, strandSlug: "multiplication", yearGroup: YEAR6, objectiveCode: "MA6-MUL-2",
        difficulty,
        promptText: `What is the ${askHCF ? "highest common factor" : "lowest common multiple"} of ${x} and ${y}?`,
        correct: String(correct),
        distractors,
        explanation: askHCF
          ? `The common factors of ${x} and ${y} are ${commonFactors.join(", ")} — the highest is ${hcf}.`
          : `The lowest common multiple of ${x} and ${y} is ${lcm}.`,
      })
    );
  }
  return out;
}

export function generateOrderOfOperationsY6Questions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["silver", "gold", "challenge"] as const);
    const a = randInt(rng, 2, 12);
    const b = randInt(rng, 2, 12);
    const c = randInt(rng, 2, 12);
    const useBrackets = difficulty === "challenge" && pick(rng, [true, false]);
    const result = useBrackets ? (a + b) * c : a + b * c;
    out.push(
      fillInBox({
        subjectSlug: SUBJECT, strandSlug: "multiplication", yearGroup: YEAR6, objectiveCode: "MA6-MUL-3",
        difficulty,
        promptText: useBrackets ? `Work out: (${a} + ${b}) × ${c} = ?` : `Work out: ${a} + ${b} × ${c} = ?`,
        answer: String(result),
        explanation: useBrackets
          ? `Brackets first: ${a} + ${b} = ${a + b}, then × ${c} = ${result}.`
          : `Multiplication before addition: ${b} × ${c} = ${b * c}, then ${a} + ${b * c} = ${result}.`,
      })
    );
  }
  return out;
}

export function generateLongDivisionY6Questions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "gold", "challenge"] as const);
    const divisor = randInt(rng, 11, difficulty === "bronze" ? 20 : difficulty === "silver" ? 40 : 99);
    const quotient = randInt(rng, 20, 400);
    const remainder = difficulty === "gold" || difficulty === "challenge" ? randInt(rng, 0, divisor - 1) : 0;
    const dividend = quotient * divisor + remainder;
    const answer = remainder > 0 ? `${quotient} r ${remainder}` : String(quotient);
    out.push(
      fillInBox({
        subjectSlug: SUBJECT, strandSlug: "division", yearGroup: YEAR6, objectiveCode: "MA6-DIV-1",
        difficulty,
        promptText: `Use long division to work out: ${dividend} ÷ ${divisor} = ? ${remainder > 0 ? "(write remainders as 'r' then the number, e.g. 12 r 3)" : ""}`,
        answer,
        explanation: `${dividend} ÷ ${divisor} = ${answer}.`,
      })
    );
  }
  return out;
}

export function generateDivisionRemainderY6Questions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["silver", "gold"] as const);
    const divisor = randInt(rng, 3, 9);
    const quotient = randInt(rng, 20, 300);
    const remainder = randInt(rng, 1, divisor - 1);
    const dividend = quotient * divisor + remainder;
    const g = gcd(remainder, divisor);
    const fracAnswer = `${quotient} ${remainder / g}/${divisor / g}`;
    out.push(
      fillInBox({
        subjectSlug: SUBJECT, strandSlug: "division", yearGroup: YEAR6, objectiveCode: "MA6-DIV-2",
        difficulty,
        promptText: `Divide ${dividend} ÷ ${divisor}, giving the remainder as a fraction in its simplest form (e.g. 4 1/2).`,
        answer: fracAnswer,
        explanation: `${dividend} ÷ ${divisor} = ${quotient} remainder ${remainder}, so as a mixed number this is ${fracAnswer}.`,
      })
    );
  }
  return out;
}

export function generateFractionCompareY6Questions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const denomPairs: [number, number][] = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [2, 7], [3, 8], [5, 6]];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "gold"] as const);
    const [d1, d2] = pick(rng, denomPairs);
    const n1 = randInt(rng, 1, d1 * 2);
    const n2 = randInt(rng, 1, d2 * 2);
    const value1 = n1 / d1;
    const value2 = n2 / d2;
    if (Math.abs(value1 - value2) < 0.001) continue;
    const bigger = value1 > value2 ? `${n1}/${d1}` : `${n2}/${d2}`;
    const smaller = value1 > value2 ? `${n2}/${d2}` : `${n1}/${d1}`;
    out.push(
      mcQuestion(rng, {
        subjectSlug: SUBJECT, strandSlug: "fractions", yearGroup: YEAR6, objectiveCode: "MA6-FRAC-1",
        difficulty,
        promptText: `Which fraction is greater: ${n1}/${d1} or ${n2}/${d2}?`,
        correct: bigger,
        distractors: [smaller, "They are equal", `${Math.max(d1, d2)}/${Math.max(d1, d2)}`],
        explanation: `Using a common denominator of ${d1 * d2}: ${n1}/${d1} = ${n1 * d2}/${d1 * d2} and ${n2}/${d2} = ${n2 * d1}/${d1 * d2}, so ${bigger} is greater.`,
      })
    );
  }
  return out;
}

export function generateFractionAddSubDifferentDenomY6Questions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const denomPairs: [number, number][] = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [2, 7], [3, 8], [5, 6]];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["silver", "gold", "challenge"] as const);
    const [d1, d2] = pick(rng, denomPairs);
    const n1 = randInt(rng, 1, d1 - 1);
    const n2 = randInt(rng, 1, d2 - 1);
    const commonDen = d1 * d2;
    const isAdd = pick(rng, [true, false]);
    const num1Scaled = n1 * d2;
    const num2Scaled = n2 * d1;
    const resultNum = isAdd ? num1Scaled + num2Scaled : Math.abs(num1Scaled - num2Scaled);
    if (resultNum === 0) continue;
    const g = gcd(resultNum, commonDen);
    const simplified = g === commonDen ? String(resultNum / g) : `${resultNum / g}/${commonDen / g}`;
    out.push(
      fillInBox({
        subjectSlug: SUBJECT, strandSlug: "fractions", yearGroup: YEAR6, objectiveCode: "MA6-FRAC-2",
        difficulty,
        promptText: isAdd
          ? `Work out: ${n1}/${d1} + ${n2}/${d2} = ? (give your answer in its simplest form)`
          : `Work out: ${n1}/${d1} - ${n2}/${d2} = ? or ${n2}/${d2} - ${n1}/${d1}, whichever is positive (give your answer in its simplest form)`,
        answer: simplified,
        explanation: `Using a common denominator of ${commonDen}: ${n1}/${d1} = ${num1Scaled}/${commonDen} and ${n2}/${d2} = ${num2Scaled}/${commonDen}. ${isAdd ? `${num1Scaled}/${commonDen} + ${num2Scaled}/${commonDen}` : `The difference is`} = ${resultNum}/${commonDen}${g > 1 ? ` = ${simplified}` : ""}.`,
      })
    );
  }
  return out;
}

export function generateFractionMultiplyY6Questions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const denominators = [2, 3, 4, 5, 6, 8];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["silver", "gold"] as const);
    const d1 = pick(rng, denominators);
    const d2 = pick(rng, denominators);
    const n1 = randInt(rng, 1, d1 - 1);
    const n2 = randInt(rng, 1, d2 - 1);
    const resultNum = n1 * n2;
    const resultDen = d1 * d2;
    const g = gcd(resultNum, resultDen);
    const simplified = resultDen / g === 1 ? String(resultNum / g) : `${resultNum / g}/${resultDen / g}`;
    out.push(
      fillInBox({
        subjectSlug: SUBJECT, strandSlug: "fractions", yearGroup: YEAR6, objectiveCode: "MA6-FRAC-3",
        difficulty,
        promptText: `Work out: ${n1}/${d1} × ${n2}/${d2} = ? (give your answer in its simplest form)`,
        answer: simplified,
        explanation: `Multiply the numerators and the denominators: ${n1} × ${n2} = ${resultNum}, ${d1} × ${d2} = ${resultDen}, giving ${resultNum}/${resultDen}${g > 1 ? ` = ${simplified}` : ""}.`,
      })
    );
  }
  return out;
}

export function generateFractionDivideY6Questions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const denominators = [2, 3, 4, 5, 6];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["gold", "challenge"] as const);
    const d = pick(rng, denominators);
    const n = randInt(rng, 1, d - 1);
    const whole = randInt(rng, 2, 6);
    const resultDen = d * whole;
    const g = gcd(n, resultDen);
    const simplified = `${n / g}/${resultDen / g}`;
    out.push(
      fillInBox({
        subjectSlug: SUBJECT, strandSlug: "fractions", yearGroup: YEAR6, objectiveCode: "MA6-FRAC-4",
        difficulty,
        promptText: `Work out: ${n}/${d} ÷ ${whole} = ? (give your answer in its simplest form)`,
        answer: simplified,
        explanation: `Dividing by a whole number multiplies the denominator: ${n}/${d} ÷ ${whole} = ${n}/${d * whole}${g > 1 ? ` = ${simplified}` : ""}.`,
      })
    );
  }
  return out;
}

export function generateFractionDecimalEquivY6Questions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const fracToDecimal: [number, number, string][] = [
    [1, 8, "0.125"], [3, 8, "0.375"], [5, 8, "0.625"], [7, 8, "0.875"], [1, 3, "0.333"],
    [2, 3, "0.667"], [1, 6, "0.167"], [5, 6, "0.833"], [1, 16, "0.0625"], [3, 16, "0.1875"],
  ];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["silver", "gold", "challenge"] as const);
    const [num, den, decimal] = pick(rng, fracToDecimal);
    out.push(
      fillInBox({
        subjectSlug: SUBJECT, strandSlug: "fractions", yearGroup: YEAR6, objectiveCode: "MA6-FRAC-5",
        difficulty,
        promptText: `Write ${num}/${den} as a decimal, rounded to 3 decimal places if it doesn't terminate exactly.`,
        answer: decimal,
        explanation: `${num} ÷ ${den} = ${decimal}.`,
      })
    );
  }
  return out;
}

export function generateDecimalPlaceValueY6Questions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const placeNames = ["tenths", "hundredths", "thousandths"];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "gold"] as const);
    const tenths = randInt(rng, 0, 9);
    const hundredths = randInt(rng, 0, 9);
    const thousandths = randInt(rng, 1, 9);
    const value = tenths / 10 + hundredths / 100 + thousandths / 1000;
    const digits = [tenths, hundredths, thousandths];
    const placeIndex = randInt(rng, 0, 2);
    const digit = digits[placeIndex];
    const correct = `${digit} ${placeNames[placeIndex]}`;
    // Distractors: the same digit paired with each of the other two place
    // names (the common misconception — reading the right digit, wrong column).
    const distractors = placeNames.filter((_, idx) => idx !== placeIndex).map((p) => `${digit} ${p}`);
    out.push(
      mcQuestion(rng, {
        subjectSlug: SUBJECT, strandSlug: "decimals", yearGroup: YEAR6, objectiveCode: "MA6-DEC-1",
        difficulty,
        promptText: `In the number ${value.toFixed(3)}, what is the value of the digit ${digit} in the ${placeNames[placeIndex]} column?`,
        correct,
        distractors,
        explanation: `In ${value.toFixed(3)}, the digit ${digit} is in the ${placeNames[placeIndex]} column, so it represents ${correct}.`,
      })
    );
  }
  return out;
}

/** Shifts a non-negative decimal string's point by `shift` places (positive =
 * multiply/move right, negative = divide/move left) using string digit
 * manipulation, so results are always exact — no floating-point rounding. */
function shiftDecimalPoint(raw: number, places: number, shift: number): string {
  const digits = String(raw).padStart(places + 1, "0"); // digits with no point
  const newPlaces = places - shift;
  if (newPlaces <= 0) {
    // Moving right past the decimal point: pad with trailing zeros.
    return digits + "0".repeat(-newPlaces);
  }
  const padded = digits.padStart(newPlaces + 1, "0");
  const wholePart = padded.slice(0, padded.length - newPlaces) || "0";
  const fracPart = padded.slice(padded.length - newPlaces);
  return `${wholePart}.${fracPart}`;
}

function formatOriginalDecimal(raw: number, places: number): string {
  return places === 0 ? String(raw) : shiftDecimalPoint(raw, places, 0);
}

export function generateDecimalScaleY6Questions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "gold"] as const);
    const scale = pick(rng, [10, 100, 1000]);
    const shift = Math.log10(scale);
    const isMultiply = pick(rng, [true, false]);
    const raw = randInt(rng, 1, 9999);
    const places = randInt(rng, 0, 3);
    const original = formatOriginalDecimal(raw, places);
    const result = shiftDecimalPoint(raw, places, isMultiply ? shift : -shift);
    out.push(
      fillInBox({
        subjectSlug: SUBJECT, strandSlug: "decimals", yearGroup: YEAR6, objectiveCode: "MA6-DEC-2",
        difficulty,
        promptText: `Work out: ${original} ${isMultiply ? "×" : "÷"} ${scale} = ?`,
        answer: result,
        explanation: `${isMultiply ? "Multiplying" : "Dividing"} by ${scale} moves each digit ${shift} place${scale === 10 ? "" : "s"} ${isMultiply ? "left" : "right"}: ${original} ${isMultiply ? "×" : "÷"} ${scale} = ${result}.`,
      })
    );
  }
  return out;
}

export function generateDecimalMultiplyY6Questions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["silver", "gold"] as const);
    const places = pick(rng, [1, 2]);
    const rawDecimal = randInt(rng, 1, 10 ** places * 9);
    const decimalValue = rawDecimal / 10 ** places;
    const whole = randInt(rng, 2, 9);
    const product = Math.round(decimalValue * whole * 1000) / 1000;
    out.push(
      fillInBox({
        subjectSlug: SUBJECT, strandSlug: "decimals", yearGroup: YEAR6, objectiveCode: "MA6-DEC-3",
        difficulty,
        promptText: `Work out: ${decimalValue} × ${whole} = ?`,
        answer: String(product),
        explanation: `${decimalValue} × ${whole} = ${product}.`,
      })
    );
  }
  return out;
}

export function generateDecimalDivisionY6Questions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["gold", "challenge"] as const);
    const divisor = randInt(rng, 2, 9);
    const quotientCents = randInt(rng, 100, 999); // ensures a clean 2dp quotient
    const quotient = quotientCents / 100;
    const dividend = Math.round(quotient * divisor * 100) / 100;
    out.push(
      fillInBox({
        subjectSlug: SUBJECT, strandSlug: "decimals", yearGroup: YEAR6, objectiveCode: "MA6-DEC-4",
        difficulty,
        promptText: `Work out: ${dividend} ÷ ${divisor} = ? (give your answer to 2 decimal places)`,
        answer: quotient.toFixed(2),
        explanation: `${dividend} ÷ ${divisor} = ${quotient.toFixed(2)}.`,
      })
    );
  }
  return out;
}

export function generatePercentageChangeY6Questions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const percentageSteps: [pct: number, step: number][] = [[10, 10], [20, 5], [25, 4], [50, 2], [5, 20], [15, 20]];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["silver", "gold", "challenge"] as const);
    const [pct, step] = pick(rng, percentageSteps);
    const base = randInt(rng, 2, 20) * step;
    const change = Math.round((pct / 100) * base);
    const isIncrease = pick(rng, [true, false]);
    const result = isIncrease ? base + change : base - change;
    out.push(
      fillInBox({
        subjectSlug: SUBJECT, strandSlug: "percentages", yearGroup: YEAR6, objectiveCode: "MA6-PCT-1",
        difficulty,
        promptText: `A price of $${base} is ${isIncrease ? "increased" : "decreased"} by ${pct}%. What is the new price (in $)?`,
        answer: String(result),
        explanation: `${pct}% of $${base} = $${change}. $${base} ${isIncrease ? "+" : "-"} $${change} = $${result}.`,
      })
    );
  }
  return out;
}

export function generateFDPEquivalenceY6Questions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const table: [string, string, string][] = [
    ["1/2", "0.5", "50%"], ["1/4", "0.25", "25%"], ["3/4", "0.75", "75%"], ["1/5", "0.2", "20%"],
    ["2/5", "0.4", "40%"], ["1/10", "0.1", "10%"], ["1/8", "0.125", "12.5%"], ["1/20", "0.05", "5%"],
    ["3/10", "0.3", "30%"], ["9/10", "0.9", "90%"],
  ];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "gold"] as const);
    const [frac, dec, pct] = pick(rng, table);
    const forms = [frac, dec, pct];
    const giveIndex = randInt(rng, 0, 2);
    const askIndex = (giveIndex + 1 + randInt(rng, 0, 1)) % 3;
    const labels = ["fraction", "decimal", "percentage"];
    out.push(
      fillInBox({
        subjectSlug: SUBJECT, strandSlug: "percentages", yearGroup: YEAR6, objectiveCode: "MA6-PCT-2",
        difficulty,
        promptText: `${forms[giveIndex]} as a ${labels[giveIndex]} is equivalent to which ${labels[askIndex]}? Write ${forms[giveIndex]} as a ${labels[askIndex]}.`,
        answer: forms[askIndex],
        explanation: `${frac} = ${dec} = ${pct} — these are all equivalent.`,
      })
    );
  }
  return out;
}

export function generateLinearSequenceY6Questions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "gold"] as const);
    const start = randInt(rng, 1, 20);
    const step = pick(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const terms = Array.from({ length: 5 }, (_, k) => start + k * step);
    const nextTerm = start + 5 * step;
    out.push(
      fillInBox({
        subjectSlug: SUBJECT, strandSlug: "algebra", yearGroup: YEAR6, objectiveCode: "MA6-ALG-2",
        difficulty,
        promptText: `What is the next number in this sequence: ${terms.join(", ")}, ?`,
        answer: String(nextTerm),
        explanation: `Each term increases by ${step}, so the next term is ${terms[4]} + ${step} = ${nextTerm}.`,
      })
    );
  }
  return out;
}

export function generateSimpleFormulaY6Questions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["silver", "gold", "challenge"] as const);
    const a = randInt(rng, 2, 8);
    const b = randInt(rng, 1, 10);
    const x = randInt(rng, 2, 12);
    const result = a * x + b;
    out.push(
      fillInBox({
        subjectSlug: SUBJECT, strandSlug: "algebra", yearGroup: YEAR6, objectiveCode: "MA6-ALG-1",
        difficulty,
        promptText: `Using the formula y = ${a}x + ${b}, find y when x = ${x}.`,
        answer: String(result),
        explanation: `y = ${a} × ${x} + ${b} = ${a * x} + ${b} = ${result}.`,
      })
    );
  }
  return out;
}

export function generateRatioShareY6Questions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const ratios: [number, number][] = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [1, 5]];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "gold"] as const);
    const [p1, p2] = pick(rng, ratios);
    const unit = randInt(rng, 2, 12);
    const total = (p1 + p2) * unit;
    const share1 = p1 * unit;
    const share2 = p2 * unit;
    out.push(
      fillInBox({
        subjectSlug: SUBJECT, strandSlug: "ratio-proportion", yearGroup: YEAR6, objectiveCode: "MA6-RAT-1",
        difficulty,
        promptText: `Share ${total} sweets in the ratio ${p1}:${p2}. How many sweets does the larger share get?`,
        answer: String(Math.max(share1, share2)),
        explanation: `${total} ÷ ${p1 + p2} = ${unit} per part. The larger share is ${Math.max(p1, p2)} × ${unit} = ${Math.max(share1, share2)}.`,
      })
    );
  }
  return out;
}

export function generateMeanY6Questions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["silver", "gold", "challenge"] as const);
    const size = randInt(rng, 4, 6);
    const meanTarget = randInt(rng, 4, 20);
    const values: number[] = [];
    let total = 0;
    for (let k = 0; k < size - 1; k++) {
      const v = randInt(rng, Math.max(1, meanTarget - 8), meanTarget + 8);
      values.push(v);
      total += v;
    }
    const last = meanTarget * size - total;
    if (last < 1) { i--; continue; }
    values.push(last);
    out.push(
      fillInBox({
        subjectSlug: SUBJECT, strandSlug: "statistics", yearGroup: YEAR6, objectiveCode: "MA6-STAT-2",
        difficulty,
        promptText: `Find the mean of these numbers: ${values.join(", ")}.`,
        answer: String(meanTarget),
        explanation: `Add the numbers: ${values.join(" + ")} = ${values.reduce((a, b) => a + b, 0)}. Divide by ${size} numbers: ${values.reduce((a, b) => a + b, 0)} ÷ ${size} = ${meanTarget}.`,
      })
    );
  }
  return out;
}

/** Runs every Y6 procedural generator. See the file-level comment above for
 * which Y6 strands are hand-authored instead. */
export function generateAllMathsQuestionsY6(seed = 6250): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...generateNumberComparisonY6Questions(rng, 10),
    ...generateRoundingY6Questions(rng, 10),
    ...generateNegativeIntervalY6Questions(rng, 8),
    ...generateMixedMentalY6Questions(rng, 8),
    ...generateEstimationY6Questions(rng, 8),
    ...generateLongMultiplicationY6Questions(rng, 12),
    ...generateFactorsMultiplesY6Questions(rng, 8),
    ...generateOrderOfOperationsY6Questions(rng, 8),
    ...generateLongDivisionY6Questions(rng, 12),
    ...generateDivisionRemainderY6Questions(rng, 6),
    ...generateFractionCompareY6Questions(rng, 10),
    ...generateFractionAddSubDifferentDenomY6Questions(rng, 12),
    ...generateFractionMultiplyY6Questions(rng, 8),
    ...generateFractionDivideY6Questions(rng, 6),
    ...generateFractionDecimalEquivY6Questions(rng, 6),
    ...generateDecimalPlaceValueY6Questions(rng, 8),
    ...generateDecimalScaleY6Questions(rng, 10),
    ...generateDecimalMultiplyY6Questions(rng, 8),
    ...generateDecimalDivisionY6Questions(rng, 6),
    ...generatePercentageChangeY6Questions(rng, 8),
    ...generateFDPEquivalenceY6Questions(rng, 8),
    ...generateLinearSequenceY6Questions(rng, 6),
    ...generateSimpleFormulaY6Questions(rng, 6),
    ...generateRatioShareY6Questions(rng, 8),
    ...generateMeanY6Questions(rng, 6),
  ];
}

/** Runs every procedural generator for the current year group. Hand-authored
 * content for geometry, measurement, statistics, reasoning and word problems
 * lives in `content/questions/maths-authored.json` (context-heavy strands
 * that don't template well) and is merged in by the seed script. */
export function generateAllMathsQuestions(seed = 5150): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...generateAdditionQuestions(rng, 14),
    ...generateSubtractionQuestions(rng, 14),
    ...generateMultiplicationQuestions(rng, 16),
    ...generateDivisionQuestions(rng, 14),
    ...generatePlaceValueQuestions(rng, 14),
    ...generateDecimalQuestions(rng, 14),
    ...generateFractionQuestions(rng, 16),
    ...generatePercentageQuestions(rng, 12),
    ...generateNumberComparisonQuestions(rng, 8),
    ...generateNegativeNumberQuestions(rng, 8),
    ...generateRomanNumeralQuestions(rng, 6),
    ...generateMentalAdditionQuestions(rng, 8),
    ...generateRoundingEstimateQuestions(rng, 6),
    ...generateMentalSubtractionQuestions(rng, 8),
    ...generatePrimeQuestions(rng, 8),
    ...generateSquareCubeQuestions(rng, 8),
    ...generateMixedNumberQuestions(rng, 8),
    ...generateFractionAddSubQuestions(rng, 10),
    ...generateDecimalCompareQuestions(rng, 8),
    ...generateDecimalFractionQuestions(rng, 8),
    ...generatePercentFractionDecimalQuestions(rng, 8),
  ];
}
