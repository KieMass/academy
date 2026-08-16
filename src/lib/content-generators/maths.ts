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
