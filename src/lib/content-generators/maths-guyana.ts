/**
 * Guyana Mathematics procedural generators (Grades 1-6). Mirrors the
 * Cayman generator files' local-helper pattern (see maths-ks1.ts), but is
 * organised by strand rather than by year — each strand covers all six
 * grades in one function since the curriculum map (content/curriculum/
 * guyana/maths.json) declares exactly two objectives per strand per grade,
 * a much smaller surface than Cayman's, so a per-grade split isn't needed
 * to keep functions readable.
 *
 * Every grade/strand branch offers several "kinds" of question rather than
 * just one — a single repeatable template runs out of genuinely distinct
 * prompts quickly (e.g. "how many sides does a square have?" only has a
 * handful of shapes to ask about), so the seed script's exact-promptText
 * dedupe would just discard most of a higher `count` as duplicates. More
 * kinds per branch means a higher count converts into real, distinct
 * question volume instead.
 *
 * Number theory (fractions, decimals, percentages, ratio) and coordinate/
 * compass geometry don't depend on which country's curriculum is asking
 * about them, so those "kinds" pull their underlying facts from
 * shared/maths-facts.ts rather than reimplementing the arithmetic here —
 * that shared layer is written so Cayman's generators could eventually
 * draw on it too, rather than each curriculum re-deriving the same facts.
 *
 * Every question is tagged curriculumSlug-implicitly — this file only ever
 * feeds Guyana topics (see prisma/seed-content.ts), so there's no
 * curriculumSlug field on DraftQuestion itself; the seed script resolves
 * topic ids scoped to the "guyana" Curriculum row.
 */
import { createRng, pick, randInt, shuffle, type Rng } from "./rng";
import type { DraftQuestion } from "./types";
import type { DifficultyBand, YearGroup } from "@/lib/curriculum/types";
import {
  randomFraction,
  simplifiableFraction,
  comparableFractionPair,
  addableFractionPair,
  fractionOfAmount,
  decimalPlaceValueFact,
  comparableDecimalPair,
  roundingDecimalFact,
  percentOfAmountFact,
  fractionToPercentFact,
  simplifiableRatio,
  shareInRatioFact,
  coordinateTranslationFact,
  compassTurnFact,
  COMPASS as COMPASS_DIRECTIONS,
} from "./shared/maths-facts";

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
// Y1-Y2: MA{g}-NUM-1 (counting/sequence) + MA{g}-NUM-2 (compare/partition).
// Y3-Y4: place value + arithmetic. Y5: factors + expanded notation.
// Y6: sets + prime factors/LCD.

const NUM_MAX: Record<YearGroup, number> = { Y1: 20, Y2: 100, Y3: 1000, Y4: 10000, Y5: 10000, Y6: 100000 };

function generateNumberOperationsQuestions(rng: Rng, yearGroup: YearGroup, band: DifficultyBand, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const max = NUM_MAX[yearGroup];
  for (let i = 0; i < count; i++) {
    if (yearGroup === "Y1" || yearGroup === "Y2") {
      const step = yearGroup === "Y1" ? "GY-MA1-NUM-1" : "GY-MA2-NUM-1";
      const cmp = yearGroup === "Y1" ? "GY-MA1-NUM-2" : "GY-MA2-NUM-2";
      const kind = pick(rng, ["one-more", "one-less", "compare", "skip-count", "missing-in-sequence"] as const);
      if (kind === "one-more") {
        const n = randInt(rng, 1, max - 1);
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: step, difficulty: band, promptText: `What number comes after ${n}?`, answer: String(n + 1), explanation: `The number after ${n} is ${n + 1}.` }));
      } else if (kind === "one-less") {
        const n = randInt(rng, 2, max);
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: step, difficulty: band, promptText: `What number comes before ${n}?`, answer: String(n - 1), explanation: `The number before ${n} is ${n - 1}.` }));
      } else if (kind === "compare") {
        const a = randInt(rng, 1, max);
        let b = randInt(rng, 1, max);
        while (b === a) b = randInt(rng, 1, max);
        const correct = a > b ? `${a} is greater than ${b}` : `${b} is greater than ${a}`;
        out.push(mc(rng, { strandSlug: "number-operations", yearGroup, objectiveCode: cmp, difficulty: band, promptText: `Which is true: comparing ${a} and ${b}?`, correct, distractors: [a > b ? `${b} is greater than ${a}` : `${a} is greater than ${b}`, `${a} is equal to ${b}`, "Cannot be compared"], explanation: `${Math.max(a, b)} is greater than ${Math.min(a, b)}.` }));
      } else if (kind === "skip-count") {
        const stepSize = pick(rng, [2, 5, 10] as const);
        const start = randInt(rng, 0, Math.floor((max - stepSize * 4) / stepSize)) * stepSize;
        const seq = Array.from({ length: 4 }, (_, k) => start + stepSize * k);
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: step, difficulty: band, promptText: `Count on in ${stepSize}s: ${seq.join(", ")}, ?`, answer: String(start + stepSize * 4), explanation: `Counting on in ${stepSize}s from ${seq.join(", ")}, the next number is ${start + stepSize * 4}.` }));
      } else {
        const a = randInt(rng, 2, max - 2);
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: step, difficulty: band, promptText: `Fill in the missing number: ${a - 1}, ?, ${a + 1}`, answer: String(a), explanation: `Counting on by 1 each time, the missing number between ${a - 1} and ${a + 1} is ${a}.` }));
      }
    } else if (yearGroup === "Y3" || yearGroup === "Y4") {
      const numCode = yearGroup === "Y3" ? "GY-MA3-NUM-1" : "GY-MA4-NUM-1";
      const opCode = yearGroup === "Y3" ? "GY-MA3-NUM-2" : "GY-MA4-NUM-2";
      const fracDecCode = yearGroup === "Y3" ? "GY-MA3-NUM-3" : "GY-MA4-NUM-3";
      const kinds = yearGroup === "Y3"
        ? (["add", "subtract", "order", "multiply", "round", "fraction-compare", "fraction-name"] as const)
        : (["add", "subtract", "order", "multiply", "round", "fraction-compare", "fraction-add", "decimal-place-value", "decimal-compare"] as const);
      const kind = pick(rng, kinds);
      if (kind === "fraction-compare") {
        const { aNum, bNum, denominator } = comparableFractionPair(rng);
        const correct = aNum > bNum ? `${aNum}/${denominator}` : `${bNum}/${denominator}`;
        const other = aNum > bNum ? `${bNum}/${denominator}` : `${aNum}/${denominator}`;
        out.push(mc(rng, { strandSlug: "number-operations", yearGroup, objectiveCode: fracDecCode, difficulty: band, promptText: `Which fraction is bigger: ${aNum}/${denominator} or ${bNum}/${denominator}?`, correct, distractors: [other, `They are equal`], explanation: `With the same denominator, the fraction with the bigger numerator is bigger: ${correct} > ${other}.` }));
      } else if (kind === "fraction-name") {
        const { numerator, denominator } = randomFraction(rng);
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: fracDecCode, difficulty: band, promptText: `Write the fraction "${numerator} out of ${denominator}" using digits (e.g. 3 out of 4 -> 3/4).`, answer: `${numerator}/${denominator}`, explanation: `${numerator} out of ${denominator} is written as ${numerator}/${denominator}.` }));
      } else if (kind === "fraction-add") {
        const { aNum, bNum, denominator } = addableFractionPair(rng);
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: fracDecCode, difficulty: band, promptText: `${aNum}/${denominator} + ${bNum}/${denominator} = ?/${denominator}`, answer: String(aNum + bNum), explanation: `With the same denominator, add the numerators: ${aNum} + ${bNum} = ${aNum + bNum}, so the answer is ${aNum + bNum}/${denominator}.` }));
      } else if (kind === "decimal-place-value") {
        const { value, tenths } = decimalPlaceValueFact(rng);
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: fracDecCode, difficulty: band, promptText: `In the number ${value}, what digit is in the tenths place?`, answer: String(tenths), explanation: `In ${value}, the digit right after the decimal point (tenths place) is ${tenths}.` }));
      } else if (kind === "decimal-compare") {
        const { a, b } = comparableDecimalPair(rng);
        const correct = a > b ? a : b;
        const other = a > b ? b : a;
        out.push(mc(rng, { strandSlug: "number-operations", yearGroup, objectiveCode: fracDecCode, difficulty: band, promptText: `Which decimal is bigger: ${a} or ${b}?`, correct: String(correct), distractors: [String(other), "They are equal"], explanation: `${correct} is bigger than ${other}.` }));
      } else if (kind === "add") {
        const a = randInt(rng, 10, max / 2);
        const b = randInt(rng, 10, max / 2);
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: opCode, difficulty: band, promptText: `${a} + ${b} = ?`, answer: String(a + b), explanation: `${a} + ${b} = ${a + b}.` }));
      } else if (kind === "subtract") {
        const a = randInt(rng, max / 4, max / 2);
        const b = randInt(rng, 1, a - 1);
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: opCode, difficulty: band, promptText: `${a} - ${b} = ?`, answer: String(a - b), explanation: `${a} - ${b} = ${a - b}.` }));
      } else if (kind === "order") {
        const nums = [randInt(rng, 1, max), randInt(rng, 1, max), randInt(rng, 1, max)];
        const sorted = [...nums].sort((x, y) => x - y);
        out.push(mc(rng, { strandSlug: "number-operations", yearGroup, objectiveCode: numCode, difficulty: band, promptText: `Which of these numbers is the smallest: ${nums.join(", ")}?`, correct: String(sorted[0]), distractors: nums.map(String), explanation: `${sorted[0]} is the smallest of ${nums.join(", ")}.` }));
      } else if (kind === "multiply") {
        const table = pick(rng, [2, 3, 4, 5, 8, 10] as const);
        const factor = randInt(rng, 2, 12);
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: opCode, difficulty: band, promptText: `${table} x ${factor} = ?`, answer: String(table * factor), explanation: `${table} x ${factor} = ${table * factor}.` }));
      } else {
        const n = randInt(rng, 10, max - 1);
        const roundTo = yearGroup === "Y3" ? 10 : pick(rng, [10, 100] as const);
        const rounded = Math.round(n / roundTo) * roundTo;
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: numCode, difficulty: band, promptText: `Round ${n} to the nearest ${roundTo}.`, answer: String(rounded), explanation: `${n} rounds to ${rounded} to the nearest ${roundTo}.` }));
      }
    } else if (yearGroup === "Y5") {
      const kind = pick(rng, ["factor", "expand", "multiple", "place-value", "simplify-fraction", "percent-of-amount", "fraction-to-percent"] as const);
      if (kind === "simplify-fraction") {
        const { numerator, denominator, simplifiedNumerator, simplifiedDenominator } = simplifiableFraction(rng);
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: "GY-MA5-NUM-3", difficulty: band, promptText: `Simplify the fraction ${numerator}/${denominator} to its lowest terms (write as a/b).`, answer: `${simplifiedNumerator}/${simplifiedDenominator}`, explanation: `${numerator}/${denominator} simplifies to ${simplifiedNumerator}/${simplifiedDenominator}.` }));
      } else if (kind === "percent-of-amount") {
        const { percent, amount, result } = percentOfAmountFact(rng);
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: "GY-MA5-NUM-3", difficulty: band, promptText: `What is ${percent}% of ${amount}?`, answer: String(result), explanation: `${percent}% of ${amount} = (${percent}/100) x ${amount} = ${result}.` }));
      } else if (kind === "fraction-to-percent") {
        const { numerator, denominator, percent } = fractionToPercentFact(rng);
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: "GY-MA5-NUM-3", difficulty: band, promptText: `Write ${numerator}/${denominator} as a percentage.`, answer: `${percent}%`, explanation: `${numerator}/${denominator} = ${percent}%.` }));
      } else if (kind === "factor") {
        const bases = [12, 18, 20, 24, 30, 36, 40, 42, 48, 60];
        const n = pick(rng, bases);
        const factorsOf = (x: number) => Array.from({ length: x }, (_, k) => k + 1).filter((f) => x % f === 0);
        const facs = factorsOf(n);
        const correct = String(pick(rng, facs));
        out.push(mc(rng, { strandSlug: "number-operations", yearGroup, objectiveCode: "GY-MA5-NUM-1", difficulty: band, promptText: `Which of these is a factor of ${n}?`, correct, distractors: [String(n + 1), String(n - 1), String(n * 2 - 1)], explanation: `${correct} divides exactly into ${n}, so it is a factor. Factors of ${n}: ${facs.join(", ")}.` }));
      } else if (kind === "expand") {
        const th = randInt(rng, 1, 9), h = randInt(rng, 0, 9), t = randInt(rng, 0, 9), o = randInt(rng, 0, 9);
        const n = th * 1000 + h * 100 + t * 10 + o;
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: "GY-MA5-NUM-2", difficulty: band, promptText: `Write ${n} in expanded notation as an addition sum (e.g. 3047 -> 3000+0+40+7).`, answer: `${th * 1000}+${h * 100}+${t * 10}+${o}`, explanation: `${n} = ${th} thousands + ${h} hundreds + ${t} tens + ${o} ones = ${th * 1000}+${h * 100}+${t * 10}+${o}.` }));
      } else if (kind === "multiple") {
        const base = pick(rng, [3, 4, 6, 7, 9] as const);
        const times = randInt(rng, 2, 10);
        const target = base * times;
        const notMultiple = target + randInt(rng, 1, base - 1);
        out.push(mc(rng, { strandSlug: "number-operations", yearGroup, objectiveCode: "GY-MA5-NUM-1", difficulty: band, promptText: `Which of these numbers is a multiple of ${base}?`, correct: String(target), distractors: [String(notMultiple), String(target + 1), String(target - 1)], explanation: `${target} = ${base} x ${times}, so it is a multiple of ${base}.` }));
      } else {
        const th = randInt(rng, 1, 9), h = randInt(rng, 0, 9), t = randInt(rng, 0, 9), o = randInt(rng, 0, 9);
        const n = th * 1000 + h * 100 + t * 10 + o;
        const digitNames = [["thousands", th], ["hundreds", h], ["tens", t], ["ones", o]] as const;
        const [placeName, digitVal] = pick(rng, digitNames);
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: "GY-MA5-NUM-2", difficulty: band, promptText: `In the number ${n}, what digit is in the ${placeName} place?`, answer: String(digitVal), explanation: `In ${n}, the ${placeName} digit is ${digitVal}.` }));
      }
    } else {
      const kind = pick(rng, ["sets", "lcd", "prime-factor", "gcf", "simplify-ratio", "share-ratio", "round-decimal", "fraction-of-amount"] as const);
      if (kind === "simplify-ratio") {
        const { a, b, simplifiedA, simplifiedB } = simplifiableRatio(rng);
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: "GY-MA6-NUM-3", difficulty: band, promptText: `Simplify the ratio ${a}:${b} to its lowest terms (write as a:b).`, answer: `${simplifiedA}:${simplifiedB}`, explanation: `${a}:${b} simplifies to ${simplifiedA}:${simplifiedB}.` }));
      } else if (kind === "share-ratio") {
        const { a, b, total, shareA } = shareInRatioFact(rng);
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: "GY-MA6-NUM-3", difficulty: band, promptText: `Share ${total} sweets in the ratio ${a}:${b}. How many sweets does the first share get?`, answer: String(shareA), explanation: `Dividing ${total} in the ratio ${a}:${b} gives the first share ${shareA}.` }));
      } else if (kind === "round-decimal") {
        const { value, roundedToWhole } = roundingDecimalFact(rng);
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: "GY-MA6-NUM-3", difficulty: band, promptText: `Round ${value} to the nearest whole number.`, answer: String(roundedToWhole), explanation: `${value} rounds to ${roundedToWhole} to the nearest whole number.` }));
      } else if (kind === "fraction-of-amount") {
        const { numerator, denominator, amount, result } = fractionOfAmount(rng);
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: "GY-MA6-NUM-2", difficulty: band, promptText: `What is ${numerator}/${denominator} of ${amount}?`, answer: String(result), explanation: `${numerator}/${denominator} of ${amount} = ${result}.` }));
      } else if (kind === "sets") {
        const a = shuffle(rng, [2, 4, 6, 8, 10, 12]).slice(0, 3).sort((x, y) => x - y);
        const b = shuffle(rng, [3, 6, 9, 12, 15]).slice(0, 3).sort((x, y) => x - y);
        const equivalent = a.length === b.length;
        out.push(mc(rng, { strandSlug: "number-operations", yearGroup, objectiveCode: "GY-MA6-NUM-1", difficulty: band, promptText: `Set A = {${a.join(", ")}} and Set B = {${b.join(", ")}}. Are A and B equivalent sets (same number of members)?`, correct: equivalent ? "Yes, they are equivalent" : "No, they are not equivalent", distractors: [equivalent ? "No, they are not equivalent" : "Yes, they are equivalent", "They are equal sets", "Cannot be determined"], explanation: `Set A has ${a.length} members and Set B has ${b.length} members, so they are ${equivalent ? "" : "not "}equivalent.` }));
      } else if (kind === "lcd") {
        const pairs: [number, number][] = [[4, 6], [3, 9], [6, 8], [5, 10], [4, 10], [3, 4], [6, 9], [5, 6], [8, 12], [9, 12]];
        const [p, q] = pick(rng, pairs);
        const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
        const lcd = (p * q) / gcd(p, q);
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: "GY-MA6-NUM-2", difficulty: band, promptText: `What is the LCD (lowest common denominator) of fractions with denominators ${p} and ${q}?`, answer: String(lcd), explanation: `The LCD of ${p} and ${q} is their lowest common multiple, ${lcd}.` }));
      } else if (kind === "prime-factor") {
        const n = pick(rng, [12, 18, 20, 24, 28, 30, 36, 40, 45, 60] as const);
        const primeFactorsOf = (x: number) => {
          const facs: number[] = [];
          let rem = x;
          for (let d = 2; d <= rem; d++) {
            while (rem % d === 0) { facs.push(d); rem /= d; }
          }
          return facs;
        };
        const pf = primeFactorsOf(n);
        const smallestPrime = Math.min(...pf);
        out.push(mc(rng, { strandSlug: "number-operations", yearGroup, objectiveCode: "GY-MA6-NUM-1", difficulty: band, promptText: `What is the smallest prime factor of ${n}?`, correct: String(smallestPrime), distractors: [String(smallestPrime + 1), String(smallestPrime + 2), String(n)], explanation: `The prime factors of ${n} are ${pf.join(" x ")}, so the smallest prime factor is ${smallestPrime}.` }));
      } else {
        const pairs: [number, number][] = [[12, 18], [16, 24], [20, 30], [18, 27], [15, 25], [24, 36], [10, 15], [21, 28]];
        const [p, q] = pick(rng, pairs);
        const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
        out.push(fib({ strandSlug: "number-operations", yearGroup, objectiveCode: "GY-MA6-NUM-2", difficulty: band, promptText: `What is the GCF (greatest common factor) of ${p} and ${q}?`, answer: String(gcd(p, q)), explanation: `The greatest number that divides exactly into both ${p} and ${q} is ${gcd(p, q)}.` }));
      }
    }
  }
  return out;
}

// ============================= PATTERNS AND RELATIONS ======================

const SHAPE_WORDS = ["circle", "square", "triangle", "star", "diamond", "hexagon"] as const;

function generatePatternsQuestions(rng: Rng, yearGroup: YearGroup, band: DifficultyBand, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    if (yearGroup === "Y1") {
      const kind = pick(rng, ["shape-repeat", "count-pattern"] as const);
      if (kind === "shape-repeat") {
        const [a, b] = shuffle(rng, [...SHAPE_WORDS]).slice(0, 2);
        const seq = [a, b, a, b, a];
        const others = SHAPE_WORDS.filter((s) => s !== a && s !== b);
        out.push(mc(rng, { strandSlug: "patterns-relations", yearGroup, objectiveCode: "GY-MA1-PAT-1", difficulty: band, promptText: `What comes next in this pattern: ${seq.join(", ")}, ?`, correct: b, distractors: [a, ...shuffle(rng, [...others]).slice(0, 2)], explanation: `The pattern repeats ${a}, ${b} — so the next shape is ${b}.` }));
      } else {
        const stepSize = pick(rng, [1, 2] as const);
        const start = randInt(rng, 1, 10);
        const seq = Array.from({ length: 3 }, (_, k) => start + stepSize * k);
        out.push(fib({ strandSlug: "patterns-relations", yearGroup, objectiveCode: "GY-MA1-PAT-2", difficulty: band, promptText: `What is one more than ${seq[seq.length - 1]}?`, answer: String(seq[seq.length - 1] + 1), explanation: `One more than ${seq[seq.length - 1]} is ${seq[seq.length - 1] + 1}.` }));
      }
    } else if (yearGroup === "Y2") {
      const kind = pick(rng, ["balance", "equal-expressions"] as const);
      if (kind === "balance") {
        const total = randInt(rng, 6, 20);
        const part1 = randInt(rng, 1, total - 1);
        out.push(fib({ strandSlug: "patterns-relations", yearGroup, objectiveCode: "GY-MA2-PAT-2", difficulty: band, promptText: `A pan balance shows ${part1} + ? = ${total}. What number balances it?`, answer: String(total - part1), explanation: `${part1} + ${total - part1} = ${total}, so the missing number is ${total - part1}.` }));
      } else {
        const a = randInt(rng, 2, 15);
        const b = randInt(rng, 2, 15);
        const sum = a + b;
        const wrongSum1 = sum + randInt(rng, 1, 3);
        const wrongSum2 = sum - randInt(rng, 1, 3);
        out.push(mc(rng, { strandSlug: "patterns-relations", yearGroup, objectiveCode: "GY-MA2-PAT-1", difficulty: band, promptText: `Which number sentence balances ${a} + ${b} = ?`, correct: `${sum}`, distractors: [String(wrongSum1), String(wrongSum2), String(sum + b)], explanation: `${a} + ${b} = ${sum}, so the balancing number is ${sum}.` }));
      }
    } else if (yearGroup === "Y3" || yearGroup === "Y4") {
      const kind = pick(rng, ["sequence", "find-rule"] as const);
      const start = randInt(rng, 2, 20);
      const step = pick(rng, [2, 3, 5, 10] as const);
      const increasing = pick(rng, [true, false]);
      if (kind === "sequence") {
        const seq = Array.from({ length: 4 }, (_, k) => (increasing ? start + step * k : start + 60 - step * k));
        const next = increasing ? seq[3] + step : seq[3] - step;
        out.push(fib({ strandSlug: "patterns-relations", yearGroup, objectiveCode: `GY-MA${yearGroup.slice(1)}-PAT-1`, difficulty: band, promptText: `What is the next number in this pattern: ${seq.join(", ")}, ?`, answer: String(next), explanation: `The pattern ${increasing ? "increases" : "decreases"} by ${step} each time, so the next number is ${next}.` }));
      } else {
        const seq = Array.from({ length: 4 }, (_, k) => start + step * k);
        out.push(mc(rng, { strandSlug: "patterns-relations", yearGroup, objectiveCode: `GY-MA${yearGroup.slice(1)}-PAT-1`, difficulty: band, promptText: `What is the rule for this pattern: ${seq.join(", ")}?`, correct: `Add ${step} each time`, distractors: [`Add ${step + 1} each time`, `Add ${step - 1 > 0 ? step - 1 : step + 2} each time`, `Multiply by ${step} each time`], explanation: `Each term is ${step} more than the one before, so the rule is "add ${step} each time".` }));
      }
    } else {
      const kind = pick(rng, ["nth-term", "find-rule"] as const);
      const start = randInt(rng, 2, 10);
      const step = randInt(rng, 2, 6);
      const seq = Array.from({ length: 3 }, (_, k) => start + step * k);
      if (kind === "nth-term") {
        const term5 = start + step * 4;
        out.push(fib({ strandSlug: "patterns-relations", yearGroup, objectiveCode: `GY-MA${yearGroup.slice(1)}-PAT-1`, difficulty: band, promptText: `A pattern starts ${seq.join(", ")}, ... and increases by ${step} each term. What is the 5th term?`, answer: String(term5), explanation: `Term 5 = ${start} + ${step} x 4 = ${term5}.` }));
      } else {
        const target = randInt(rng, 6, 10);
        const nthTerm = start + step * (target - 1);
        out.push(fib({ strandSlug: "patterns-relations", yearGroup, objectiveCode: `GY-MA${yearGroup.slice(1)}-PAT-2`, difficulty: band, promptText: `A pattern starts at ${start} and increases by ${step} each term. What is the ${target}th term?`, answer: String(nthTerm), explanation: `Term ${target} = ${start} + ${step} x ${target - 1} = ${nthTerm}.` }));
      }
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

const SIDED_SHAPES: Record<string, number> = { triangle: 3, square: 4, rectangle: 4, pentagon: 5, hexagon: 6, heptagon: 7, octagon: 8 };

function generateGeometryQuestions(rng: Rng, yearGroup: YearGroup, band: DifficultyBand, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    if (yearGroup === "Y1" || yearGroup === "Y2") {
      const kind = pick(rng, ["sides", "name-from-sides", "circle-sort"] as const);
      const shapeNames = Object.keys(SIDED_SHAPES);
      if (kind === "sides") {
        const shape = pick(rng, shapeNames);
        const sides = SIDED_SHAPES[shape];
        out.push(mc(rng, { strandSlug: "geometry", yearGroup, objectiveCode: `GY-MA${yearGroup.slice(1)}-GEO-1`, difficulty: band, promptText: `How many sides does a ${shape} have?`, correct: String(sides), distractors: shuffle(rng, Object.values(SIDED_SHAPES).filter((s) => s !== sides)).slice(0, 3).map(String), explanation: `A ${shape} has ${sides} sides.` }));
      } else if (kind === "name-from-sides") {
        const shape = pick(rng, shapeNames);
        const sides = SIDED_SHAPES[shape];
        // Exclude any other shape with the same side count (square vs.
        // rectangle both have 4) — otherwise two options could both
        // genuinely answer "which shape has N sides?", making the question
        // ambiguous even though only one is marked correct.
        const distractorPool = shapeNames.filter((s) => s !== shape && SIDED_SHAPES[s] !== sides);
        out.push(mc(rng, { strandSlug: "geometry", yearGroup, objectiveCode: `GY-MA${yearGroup.slice(1)}-GEO-1`, difficulty: band, promptText: `Which shape has ${sides} sides?`, correct: shape, distractors: shuffle(rng, distractorPool).slice(0, 3), explanation: `A ${shape} has exactly ${sides} sides.` }));
      } else {
        out.push(mc(rng, { strandSlug: "geometry", yearGroup, objectiveCode: `GY-MA${yearGroup.slice(1)}-GEO-2`, difficulty: band, promptText: `Which shape has no straight sides at all?`, correct: "circle", distractors: shuffle(rng, shapeNames).slice(0, 3), explanation: `A circle is round and has no straight sides.` }));
      }
    } else if (yearGroup === "Y3") {
      const kind = pick(rng, ["property", "classify", "coordinate"] as const);
      if (kind === "coordinate") {
        const { x, y } = coordinateTranslationFact(rng);
        out.push(fib({ strandSlug: "geometry", yearGroup, objectiveCode: "GY-MA3-GEO-3", difficulty: band, promptText: `On a grid, a point is ${x} squares across and ${y} squares up from the corner. Write its coordinates as (x,y).`, answer: `(${x},${y})`, explanation: `The point is ${x} across and ${y} up, so its coordinates are (${x},${y}).` }));
      } else if (kind === "property") {
        const shape = pick(rng, ["a square", "a rectangle", "a triangle", "a rhombus"] as const);
        const angleSum: Record<string, string> = { "a square": "4 right angles", "a rectangle": "4 right angles", "a triangle": "3 angles that sum to 180 degrees", "a rhombus": "4 sides of equal length" };
        out.push(mc(rng, { strandSlug: "geometry", yearGroup, objectiveCode: "GY-MA3-GEO-1", difficulty: band, promptText: `Which property is true of ${shape}?`, correct: angleSum[shape], distractors: Object.values(angleSum).filter((v) => v !== angleSum[shape]), explanation: `${shape[0].toUpperCase() + shape.slice(1)} has ${angleSum[shape]}.` }));
      } else {
        const shape = pick(rng, ["square", "rectangle", "triangle", "rhombus", "pentagon"] as const);
        const isQuadrilateral = shape !== "triangle" && shape !== "pentagon";
        out.push(mc(rng, { strandSlug: "geometry", yearGroup, objectiveCode: "GY-MA3-GEO-1", difficulty: band, promptText: `Is a ${shape} a quadrilateral (a shape with exactly 4 sides)?`, correct: isQuadrilateral ? "Yes" : "No", distractors: [isQuadrilateral ? "No" : "Yes", "Only sometimes", "Cannot be determined"], explanation: `A ${shape} has ${SIDED_SHAPES[shape] ?? 4} sides, so it ${isQuadrilateral ? "is" : "is not"} a quadrilateral.` }));
      }
    } else if (yearGroup === "Y4" || yearGroup === "Y5") {
      const kind = pick(rng, ["classify", "complementary", "translate", "compass"] as const);
      if (kind === "translate") {
        const { x, y, dx, dy, newX, newY } = coordinateTranslationFact(rng);
        out.push(fib({ strandSlug: "geometry", yearGroup, objectiveCode: `GY-MA${yearGroup.slice(1)}-GEO-3`, difficulty: band, promptText: `A point at (${x},${y}) is translated ${dx >= 0 ? `${dx} right` : `${-dx} left`} and ${dy >= 0 ? `${dy} up` : `${-dy} down`}. What are its new coordinates?`, answer: `(${newX},${newY})`, explanation: `(${x},${y}) moved by (${dx},${dy}) gives (${newX},${newY}).` }));
      } else if (kind === "compass") {
        const { start, quarterTurns, clockwise, result } = compassTurnFact(rng);
        out.push(mc(rng, { strandSlug: "geometry", yearGroup, objectiveCode: `GY-MA${yearGroup.slice(1)}-GEO-3`, difficulty: band, promptText: `Facing ${start}, you turn ${quarterTurns} quarter-turn${quarterTurns > 1 ? "s" : ""} ${clockwise ? "clockwise" : "anticlockwise"}. Which direction do you now face?`, correct: result, distractors: shuffle(rng, [...COMPASS_DIRECTIONS]).filter((d) => d !== result).slice(0, 3), explanation: `Turning ${quarterTurns} quarter-turn${quarterTurns > 1 ? "s" : ""} ${clockwise ? "clockwise" : "anticlockwise"} from ${start} faces you ${result}.` }));
      } else if (kind === "classify") {
        const deg = randInt(rng, 5, 355);
        const correct = classifyAngle(deg);
        out.push(mc(rng, { strandSlug: "geometry", yearGroup, objectiveCode: `GY-MA${yearGroup.slice(1)}-GEO-1`, difficulty: band, promptText: `An angle measures ${deg} degrees. What type of angle is it?`, correct, distractors: ANGLE_TYPES.map((t) => t.label).filter((l) => l !== correct), explanation: `${deg} degrees is ${correct === "right" ? "exactly 90 degrees, a right angle" : `${correct} (${correct === "acute" ? "less than 90" : correct === "obtuse" ? "between 90 and 180" : "greater than 180"} degrees)`}.` }));
      } else {
        const isComplementary = pick(rng, [true, false]);
        const a = randInt(rng, 10, 80);
        const b = isComplementary ? 90 - a : randInt(rng, 10, 170);
        out.push(mc(rng, { strandSlug: "geometry", yearGroup, objectiveCode: `GY-MA${yearGroup.slice(1)}-GEO-1`, difficulty: band, promptText: `Two angles measure ${a} degrees and ${b} degrees. Are they complementary (add to 90 degrees)?`, correct: a + b === 90 ? "Yes" : "No", distractors: [a + b === 90 ? "No" : "Yes", "They are supplementary", "Cannot be determined"], explanation: `${a} + ${b} = ${a + b} degrees, ${a + b === 90 ? "which is exactly 90 — they are complementary." : "which is not 90, so they are not complementary."}` }));
      }
    } else if (pick(rng, ["solid", "solid", "position"] as const) === "position") {
      const kind = pick(rng, ["translate-twice", "compass"] as const);
      if (kind === "translate-twice") {
        const first = coordinateTranslationFact(rng);
        const second = coordinateTranslationFact(rng);
        const finalX = first.newX + second.dx;
        const finalY = first.newY + second.dy;
        out.push(fib({ strandSlug: "geometry", yearGroup, objectiveCode: "GY-MA6-GEO-3", difficulty: band, promptText: `A point starts at (${first.x},${first.y}). It is translated by (${first.dx},${first.dy}), then translated again by (${second.dx},${second.dy}). What are its final coordinates?`, answer: `(${finalX},${finalY})`, explanation: `First translation: (${first.x},${first.y}) -> (${first.newX},${first.newY}). Second translation: -> (${finalX},${finalY}).` }));
      } else {
        const { start, quarterTurns, clockwise, result } = compassTurnFact(rng);
        out.push(mc(rng, { strandSlug: "geometry", yearGroup, objectiveCode: "GY-MA6-GEO-3", difficulty: band, promptText: `Facing ${start}, you turn ${quarterTurns} quarter-turn${quarterTurns > 1 ? "s" : ""} ${clockwise ? "clockwise" : "anticlockwise"}. Which direction do you now face?`, correct: result, distractors: shuffle(rng, [...COMPASS_DIRECTIONS]).filter((d) => d !== result).slice(0, 3), explanation: `Turning ${quarterTurns} quarter-turn${quarterTurns > 1 ? "s" : ""} ${clockwise ? "clockwise" : "anticlockwise"} from ${start} faces you ${result}.` }));
      }
    } else {
      const kind = pick(rng, ["faces", "edges-vertices"] as const);
      const solids: Record<string, { faces: number; edges: number; vertices: number }> = {
        cube: { faces: 6, edges: 12, vertices: 8 },
        "rectangular prism": { faces: 6, edges: 12, vertices: 8 },
        "triangular prism": { faces: 5, edges: 9, vertices: 6 },
        "square pyramid": { faces: 5, edges: 8, vertices: 5 },
      };
      const solid = pick(rng, Object.keys(solids));
      const info = solids[solid];
      if (kind === "faces") {
        out.push(fib({ strandSlug: "geometry", yearGroup, objectiveCode: "GY-MA6-GEO-1", difficulty: band, promptText: `How many faces does a ${solid} have?`, answer: String(info.faces), explanation: `A ${solid} has ${info.faces} faces.` }));
      } else {
        out.push(mc(rng, { strandSlug: "geometry", yearGroup, objectiveCode: "GY-MA6-GEO-1", difficulty: band, promptText: `How many edges and vertices does a ${solid} have?`, correct: `${info.edges} edges, ${info.vertices} vertices`, distractors: [`${info.vertices} edges, ${info.edges} vertices`, `${info.edges - 2} edges, ${info.vertices} vertices`, `${info.edges} edges, ${info.vertices + 1} vertices`], explanation: `A ${solid} has ${info.edges} edges and ${info.vertices} vertices.` }));
      }
    }
  }
  return out;
}

// ============================= MEASUREMENT ===================================

function generateMeasurementQuestions(rng: Rng, yearGroup: YearGroup, band: DifficultyBand, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    if (yearGroup === "Y1") {
      const kind = pick(rng, ["hour", "half-hour", "compare-length"] as const);
      if (kind === "hour") {
        const h = randInt(rng, 1, 12);
        out.push(mc(rng, { strandSlug: "measurement", yearGroup, objectiveCode: "GY-MA1-MEA-2", difficulty: band, promptText: `The clock's hour hand points to ${h} and the minute hand points to 12. What time is it?`, correct: `${h}:00`, distractors: [`${h}:30`, `${(h % 12) + 1}:00`, `${h}:15`], explanation: `When the minute hand is on 12, the time is ${h} o'clock (${h}:00).` }));
      } else if (kind === "half-hour") {
        const h = randInt(rng, 1, 12);
        out.push(mc(rng, { strandSlug: "measurement", yearGroup, objectiveCode: "GY-MA1-MEA-2", difficulty: band, promptText: `The clock's minute hand points to 6, halfway round from the hour hand just past ${h}. What time is it?`, correct: `${h}:30`, distractors: [`${h}:00`, `${(h % 12) + 1}:30`, `${h}:15`], explanation: `When the minute hand is on 6, it is half past the hour: ${h}:30.` }));
      } else {
        // Ordered shortest -> longest, so any two picked items have an
        // unambiguous, genuinely correct "which is longer" answer — a
        // substring-sniffing heuristic here could pick an item pair with no
        // real length difference and silently mark the wrong one correct.
        const itemsByLength = ["a spoon", "a pencil", "a book", "a school bus", "a swimming pool", "a football field"] as const;
        const [i, j] = shuffle(rng, itemsByLength.map((_, idx) => idx)).slice(0, 2).sort((a, b) => a - b);
        const shorter = itemsByLength[i];
        const longer = itemsByLength[j];
        out.push(mc(rng, { strandSlug: "measurement", yearGroup, objectiveCode: "GY-MA1-MEA-1", difficulty: band, promptText: `Which is longer: ${shorter} or ${longer}?`, correct: longer, distractors: [shorter], explanation: `${longer[0].toUpperCase()}${longer.slice(1)} is longer than ${shorter}.` }));
      }
    } else if (yearGroup === "Y2") {
      const kind = pick(rng, ["unit-choice-length", "unit-choice-mass", "unit-choice-capacity", "compare-length", "tell-time-5min", "calendar"] as const);
      if (kind === "unit-choice-length") {
        const [big, small] = pick(rng, [
          ["a classroom", "a pencil"],
          ["a school field", "a ruler"],
          ["a road", "a book"],
          ["a bridge", "a crayon"],
        ] as const);
        out.push(mc(rng, { strandSlug: "measurement", yearGroup, objectiveCode: "GY-MA2-MEA-1", difficulty: band, promptText: `Which unit would you use to measure the length of ${big} — centimetres or metres?`, correct: "Metres", distractors: ["Centimetres", "Grams", "Litres"], explanation: `${big[0].toUpperCase()}${big.slice(1)} is long, so metres is the sensible unit for measuring it. (${small.replace(/^a /, "A ")} would be measured in centimetres instead.)` }));
      } else if (kind === "unit-choice-mass") {
        const heavy = pick(rng, ["a bag of rice", "a sack of flour", "a grown dog", "a school bag full of books"] as const);
        out.push(mc(rng, { strandSlug: "measurement", yearGroup, objectiveCode: "GY-MA2-MEA-1", difficulty: band, promptText: `Which unit would you use to weigh ${heavy} — grams or kilograms?`, correct: "Kilograms", distractors: ["Grams", "Metres", "Litres"], explanation: `${heavy[0].toUpperCase()}${heavy.slice(1)} is heavy enough that kilograms is the sensible unit.` }));
      } else if (kind === "unit-choice-capacity") {
        const small = pick(rng, ["a small cup", "a spoon", "a medicine bottle", "a juice box"] as const);
        out.push(mc(rng, { strandSlug: "measurement", yearGroup, objectiveCode: "GY-MA2-MEA-1", difficulty: band, promptText: `Which unit would you use to measure water in ${small} — millilitres or litres?`, correct: "Millilitres", distractors: ["Litres", "Grams", "Metres"], explanation: `${small[0].toUpperCase()}${small.slice(1)} holds a small amount, so millilitres is the sensible unit.` }));
      } else if (kind === "compare-length") {
        const itemsByLength = ["a paperclip", "a pencil", "a school ruler", "a classroom door", "a school bus", "a football field"] as const;
        const [i, j] = shuffle(rng, itemsByLength.map((_, idx) => idx)).slice(0, 2).sort((a, b) => a - b);
        const shorter = itemsByLength[i];
        const longer = itemsByLength[j];
        out.push(mc(rng, { strandSlug: "measurement", yearGroup, objectiveCode: "GY-MA2-MEA-1", difficulty: band, promptText: `Which is longer: ${shorter} or ${longer}?`, correct: longer, distractors: [shorter], explanation: `${longer[0].toUpperCase()}${longer.slice(1)} is longer than ${shorter}.` }));
      } else if (kind === "tell-time-5min") {
        const h = randInt(rng, 1, 12);
        const fiveMin = randInt(rng, 1, 11) * 5;
        out.push(mc(rng, { strandSlug: "measurement", yearGroup, objectiveCode: "GY-MA2-MEA-2", difficulty: band, promptText: `The clock's hour hand is just past ${h} and the minute hand points to the ${fiveMin}-minute mark. What time is it? (Write as H:MM)`, correct: `${h}:${String(fiveMin).padStart(2, "0")}`, distractors: [`${h}:00`, `${(h % 12) + 1}:${String(fiveMin).padStart(2, "0")}`, `${h}:${String((fiveMin + 5) % 60).padStart(2, "0")}`], explanation: `The hour hand just past ${h} with the minute hand on the ${fiveMin}-minute mark shows ${h}:${String(fiveMin).padStart(2, "0")}.` }));
      } else {
        const days = pick(rng, [
          { q: "How many days are there in one week?", a: "7" },
          { q: "About how many weeks are there in one month?", a: "4" },
          { q: "How many months are there in one year?", a: "12" },
          { q: "How many days are usually in the month of April?", a: "30" },
        ] as const);
        out.push(fib({ strandSlug: "measurement", yearGroup, objectiveCode: "GY-MA2-MEA-2", difficulty: band, promptText: days.q, answer: days.a, explanation: `${days.q.replace("?", "")} — the answer is ${days.a}.` }));
      }
    } else if (yearGroup === "Y3") {
      const kind = pick(rng, ["money-subtract", "money-add"] as const);
      if (kind === "money-subtract") {
        const dollars = randInt(rng, 100, 900) * 10;
        const spent = randInt(rng, 50, 400) * 10;
        out.push(fib({ strandSlug: "measurement", yearGroup, objectiveCode: "GY-MA3-MEA-2", difficulty: band, promptText: `A pupil has G$${dollars} and spends G$${spent}. How much money is left?`, answer: String(dollars - spent), explanation: `G$${dollars} - G$${spent} = G$${dollars - spent}.` }));
      } else {
        const a = randInt(rng, 50, 500) * 10;
        const b = randInt(rng, 50, 500) * 10;
        out.push(fib({ strandSlug: "measurement", yearGroup, objectiveCode: "GY-MA3-MEA-2", difficulty: band, promptText: `A pupil buys a book for G$${a} and a pencil case for G$${b}. How much did they spend in total?`, answer: String(a + b), explanation: `G$${a} + G$${b} = G$${a + b}.` }));
      }
    } else if (yearGroup === "Y4") {
      const kind = pick(rng, ["length-convert", "mass-convert", "capacity-convert"] as const);
      if (kind === "length-convert") {
        const m = randInt(rng, 1, 20);
        out.push(fib({ strandSlug: "measurement", yearGroup, objectiveCode: "GY-MA4-MEA-1", difficulty: band, promptText: `Convert ${m} metres to centimetres.`, answer: String(m * 100), explanation: `1 m = 100 cm, so ${m} m = ${m * 100} cm.` }));
      } else if (kind === "mass-convert") {
        const kg = randInt(rng, 1, 15);
        out.push(fib({ strandSlug: "measurement", yearGroup, objectiveCode: "GY-MA4-MEA-1", difficulty: band, promptText: `Convert ${kg} kilograms to grams.`, answer: String(kg * 1000), explanation: `1 kg = 1000 g, so ${kg} kg = ${kg * 1000} g.` }));
      } else {
        const l = randInt(rng, 1, 12);
        out.push(fib({ strandSlug: "measurement", yearGroup, objectiveCode: "GY-MA4-MEA-1", difficulty: band, promptText: `Convert ${l} litres to millilitres.`, answer: String(l * 1000), explanation: `1 l = 1000 ml, so ${l} l = ${l * 1000} ml.` }));
      }
    } else if (yearGroup === "Y5") {
      const kind = pick(rng, ["area", "elapsed-time"] as const);
      if (kind === "area") {
        const l = randInt(rng, 2, 15);
        const w = randInt(rng, 2, 10);
        out.push(fib({ strandSlug: "measurement", yearGroup, objectiveCode: "GY-MA5-MEA-1", difficulty: band, promptText: `A rectangle is ${l} cm long and ${w} cm wide. What is its area in square centimetres?`, answer: String(l * w), explanation: `Area = length x width = ${l} x ${w} = ${l * w} sq cm.` }));
      } else {
        const startH = randInt(rng, 1, 10);
        const durationMins = pick(rng, [15, 20, 30, 45, 60, 90] as const);
        const endTotal = startH * 60 + durationMins;
        const endH = Math.floor(endTotal / 60) % 12 || 12;
        const endM = endTotal % 60;
        out.push(fib({ strandSlug: "measurement", yearGroup, objectiveCode: "GY-MA5-MEA-2", difficulty: band, promptText: `A class starts at ${startH}:00 and lasts ${durationMins} minutes. What time does it end? (Write as H:MM)`, answer: `${endH}:${String(endM).padStart(2, "0")}`, explanation: `${startH}:00 plus ${durationMins} minutes is ${endH}:${String(endM).padStart(2, "0")}.` }));
      }
    } else {
      const kind = pick(rng, ["volume", "word-problem"] as const);
      if (kind === "volume") {
        const l = randInt(rng, 2, 10);
        const w = randInt(rng, 2, 8);
        const h = randInt(rng, 2, 6);
        out.push(fib({ strandSlug: "measurement", yearGroup, objectiveCode: "GY-MA6-MEA-2", difficulty: band, promptText: `A rectangular prism is ${l} cm by ${w} cm by ${h} cm. What is its volume in cubic centimetres?`, answer: String(l * w * h), explanation: `Volume = length x width x height = ${l} x ${w} x ${h} = ${l * w * h} cubic cm.` }));
      } else {
        const price = randInt(rng, 100, 900) * 10;
        const quantity = randInt(rng, 2, 8);
        out.push(fib({ strandSlug: "measurement", yearGroup, objectiveCode: "GY-MA6-MEA-1", difficulty: band, promptText: `Rice costs G$${price} per bag. How much do ${quantity} bags cost in total?`, answer: String(price * quantity), explanation: `G$${price} x ${quantity} = G$${price * quantity}.` }));
      }
    }
  }
  return out;
}

// ============================= DATA ANALYSIS AND PROBABILITY ================

function generateDataQuestions(rng: Rng, yearGroup: YearGroup, band: DifficultyBand, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    if (yearGroup === "Y1" || yearGroup === "Y2") {
      const kind = pick(rng, ["pictograph", "chance"] as const);
      if (kind === "pictograph") {
        const fruits = { apples: randInt(rng, 2, 8), mangoes: randInt(rng, 2, 8), bananas: randInt(rng, 2, 8) };
        const entries = Object.entries(fruits);
        const [maxFruit] = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
        out.push(mc(rng, { strandSlug: "data-analysis", yearGroup, objectiveCode: `GY-MA${yearGroup.slice(1)}-DAT-1`, difficulty: band, promptText: `A pictograph shows ${entries.map(([k, v]) => `${v} ${k}`).join(", ")}. Which fruit has the most?`, correct: maxFruit, distractors: entries.map(([k]) => k).filter((k) => k !== maxFruit), explanation: `${maxFruit} has the highest count: ${fruits[maxFruit as keyof typeof fruits]}.` }));
      } else {
        const events = [
          ["The sun will rise tomorrow", "certain"],
          ["It will snow in Georgetown next week", "impossible"],
          ["A coin toss will land on heads", "possible"],
          ["Every day is a Monday", "impossible"],
          ["It will rain at some point this year in Guyana", "certain"],
          ["Rolling a 6 on a dice", "possible"],
        ] as const;
        const [event, correct] = pick(rng, events);
        out.push(mc(rng, { strandSlug: "data-analysis", yearGroup, objectiveCode: `GY-MA${yearGroup.slice(1)}-DAT-2`, difficulty: band, promptText: `How likely is this: "${event}"?`, correct, distractors: ["certain", "possible", "impossible"].filter((c) => c !== correct), explanation: `"${event}" is ${correct}.` }));
      }
    } else if (yearGroup === "Y3") {
      const kind = pick(rng, ["range", "mode"] as const);
      const vals = Array.from({ length: 6 }, () => randInt(rng, 1, 10));
      if (kind === "range") {
        out.push(fib({ strandSlug: "data-analysis", yearGroup, objectiveCode: "GY-MA3-DAT-2", difficulty: band, promptText: `Find the range of this data set: ${vals.join(", ")}.`, answer: String(Math.max(...vals) - Math.min(...vals)), explanation: `Range = largest - smallest = ${Math.max(...vals)} - ${Math.min(...vals)} = ${Math.max(...vals) - Math.min(...vals)}.` }));
      } else {
        const withDup = [...vals, vals[0], vals[0]];
        const counts = new Map<number, number>();
        for (const v of withDup) counts.set(v, (counts.get(v) ?? 0) + 1);
        const mode = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
        out.push(fib({ strandSlug: "data-analysis", yearGroup, objectiveCode: "GY-MA3-DAT-1", difficulty: band, promptText: `Find the mode (most common value) of this data set: ${withDup.join(", ")}.`, answer: String(mode), explanation: `${mode} appears more often than any other value in the data set.` }));
      }
    } else if (yearGroup === "Y4") {
      const kind = pick(rng, ["probability", "double-bar"] as const);
      if (kind === "probability") {
        const total = randInt(rng, 4, 10);
        const favourable = randInt(rng, 1, total - 1);
        out.push(fib({ strandSlug: "data-analysis", yearGroup, objectiveCode: "GY-MA4-DAT-2", difficulty: band, promptText: `A bag has ${total} equally-sized balls, ${favourable} of which are red. What is the probability of picking a red ball, as a fraction?`, answer: `${favourable}/${total}`, explanation: `Probability = favourable outcomes / total outcomes = ${favourable}/${total}.` }));
      } else {
        const boysA = randInt(rng, 3, 12);
        const girlsA = randInt(rng, 3, 12);
        out.push(mc(rng, { strandSlug: "data-analysis", yearGroup, objectiveCode: "GY-MA4-DAT-1", difficulty: band, promptText: `A double bar graph shows ${boysA} boys and ${girlsA} girls chose football as their favourite sport. Which group is larger?`, correct: boysA > girlsA ? "Boys" : girlsA > boysA ? "Girls" : "They are equal", distractors: ["Boys", "Girls", "They are equal"].filter((c) => c !== (boysA > girlsA ? "Boys" : girlsA > boysA ? "Girls" : "They are equal")), explanation: `${boysA} boys vs ${girlsA} girls — ${boysA === girlsA ? "the two groups are equal" : `the larger group is ${boysA > girlsA ? "boys" : "girls"}`}.` }));
      }
    } else {
      if (yearGroup === "Y5") {
        const kind = pick(rng, ["median", "mean"] as const);
        if (kind === "median") {
          const vals = Array.from({ length: 5 }, () => randInt(rng, 2, 20)).sort((a, b) => a - b);
          out.push(fib({ strandSlug: "data-analysis", yearGroup, objectiveCode: "GY-MA5-DAT-2", difficulty: band, promptText: `Find the median of this data set: ${vals.join(", ")}.`, answer: String(vals[2]), explanation: `Sorted, the middle value of ${vals.join(", ")} is ${vals[2]} — that's the median.` }));
        } else {
          const cleanVals = Array.from({ length: 4 }, () => randInt(rng, 1, 10) * 2);
          const cleanSum = cleanVals.reduce((a, b) => a + b, 0);
          const mean = cleanSum / cleanVals.length;
          out.push(fib({ strandSlug: "data-analysis", yearGroup, objectiveCode: "GY-MA5-DAT-2", difficulty: band, promptText: `Find the mean (average) of this data set: ${cleanVals.join(", ")}.`, answer: String(mean), explanation: `Mean = total / count = ${cleanSum} / ${cleanVals.length} = ${mean}.` }));
        }
      } else {
        const kind = pick(rng, ["pie-chart", "compare-graphs"] as const);
        if (kind === "pie-chart") {
          const total = pick(rng, [20, 25, 40, 50] as const);
          const slice = pick(rng, [total / 4, total / 2, (total * 3) / 4] as const);
          const pct = Math.round((slice / total) * 100);
          out.push(fib({ strandSlug: "data-analysis", yearGroup, objectiveCode: "GY-MA6-DAT-1", difficulty: band, promptText: `A pie chart shows ${slice} out of ${total} pupils chose mangoes as their favourite fruit. What percentage of pupils is that?`, answer: `${pct}%`, explanation: `${slice}/${total} = ${slice / total} = ${pct}%.` }));
        } else {
          const barTotal = randInt(rng, 20, 60);
          const pieShare = pick(rng, [25, 50, 75] as const);
          const pieTotal = Math.round((barTotal * pieShare) / 100);
          out.push(mc(rng, { strandSlug: "data-analysis", yearGroup, objectiveCode: "GY-MA6-DAT-2", difficulty: band, promptText: `A bar graph shows ${barTotal} pupils were surveyed. A pie chart of the same data shows ${pieShare}% chose Maths as their favourite subject. How many pupils is that?`, correct: String(pieTotal), distractors: [String(pieTotal + 5), String(pieTotal - 5 > 0 ? pieTotal - 5 : pieTotal + 10), String(barTotal)], explanation: `${pieShare}% of ${barTotal} = ${pieTotal} pupils.` }));
        }
      }
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
      out.push(...generateNumberOperationsQuestions(rng, yearGroup, band, 16));
      out.push(...generatePatternsQuestions(rng, yearGroup, band, 8));
      out.push(...generateGeometryQuestions(rng, yearGroup, band, 12));
      out.push(...generateMeasurementQuestions(rng, yearGroup, band, 8));
      out.push(...generateDataQuestions(rng, yearGroup, band, 8));
    }
  }
  return out;
}
