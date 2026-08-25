/**
 * Curriculum-agnostic maths fact generators — number theory doesn't change
 * between Cayman and Guyana, only the strand taxonomy and framing wrapped
 * around it does. These return plain data (numbers/strings), not
 * DraftQuestion objects, so a per-curriculum generator file (e.g.
 * maths-guyana.ts) can wrap each fact in its own strandSlug/objectiveCode/
 * yearGroup and question phrasing without duplicating the underlying
 * arithmetic. See the "share the content, not the row" design discussed
 * for cross-curriculum question reuse — this is that layer.
 */
import { randInt, pick, shuffle, type Rng } from "../rng";

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

// ============================= FRACTIONS ====================================

export interface FractionFact {
  numerator: number;
  denominator: number;
}

/** A proper fraction with a denominator from a small "friendly" set. */
export function randomFraction(rng: Rng, maxDenominator = 12): FractionFact {
  const denominator = pick(rng, [2, 3, 4, 5, 6, 8, 10, 12].filter((d) => d <= maxDenominator));
  const numerator = randInt(rng, 1, denominator - 1);
  return { numerator, denominator };
}

/** An unsimplified fraction (numerator/denominator share a common factor > 1),
 *  plus its fully-simplified form. */
export function simplifiableFraction(rng: Rng): { numerator: number; denominator: number; simplifiedNumerator: number; simplifiedDenominator: number } {
  const pairs: [number, number][] = [[2, 4], [3, 6], [4, 8], [2, 6], [3, 9], [4, 10], [6, 8], [3, 12], [4, 12], [6, 9], [2, 8], [5, 10]];
  const [numerator, denominator] = pick(rng, pairs);
  const g = gcd(numerator, denominator);
  return { numerator, denominator, simplifiedNumerator: numerator / g, simplifiedDenominator: denominator / g };
}

/** Two fractions with the same denominator and different numerators, for comparison. */
export function comparableFractionPair(rng: Rng): { aNum: number; bNum: number; denominator: number } {
  const denominator = pick(rng, [4, 5, 6, 8, 10, 12]);
  const aNum = randInt(rng, 1, denominator - 1);
  let bNum = randInt(rng, 1, denominator - 1);
  while (bNum === aNum) bNum = randInt(rng, 1, denominator - 1);
  return { aNum, bNum, denominator };
}

/** Two fractions with the same denominator whose sum stays a proper or exactly-whole fraction. */
export function addableFractionPair(rng: Rng): { aNum: number; bNum: number; denominator: number } {
  const denominator = pick(rng, [4, 5, 6, 8, 10, 12]);
  const aNum = randInt(rng, 1, denominator - 2);
  const bNum = randInt(rng, 1, denominator - aNum);
  return { aNum, bNum, denominator };
}

/** A fraction-of-an-amount problem where the answer is a whole number. */
export function fractionOfAmount(rng: Rng): { numerator: number; denominator: number; amount: number; result: number } {
  const denominator = pick(rng, [2, 3, 4, 5, 6, 8, 10]);
  const unit = randInt(rng, 2, 12);
  const amount = denominator * unit;
  const numerator = randInt(rng, 1, denominator - 1);
  return { numerator, denominator, amount, result: numerator * unit };
}

// ============================= DECIMALS =====================================

/** A decimal to 1 or 2 places, plus which digit is in which place. */
export function decimalPlaceValueFact(rng: Rng): { value: string; tenths: number; hundredths: number } {
  const tenths = randInt(rng, 0, 9);
  const hundredths = randInt(rng, 0, 9);
  const whole = randInt(rng, 1, 20);
  return { value: `${whole}.${tenths}${hundredths}`, tenths, hundredths };
}

/** Two distinct decimals (1-2dp) for comparison. */
export function comparableDecimalPair(rng: Rng): { a: number; b: number } {
  const a = Math.round((randInt(rng, 10, 999) / 100) * 100) / 100;
  let b = Math.round((randInt(rng, 10, 999) / 100) * 100) / 100;
  while (b === a) b = Math.round((randInt(rng, 10, 999) / 100) * 100) / 100;
  return { a, b };
}

/** A value to round, and the nearest whole number / tenth to round it to. */
export function roundingDecimalFact(rng: Rng): { value: number; roundedToWhole: number } {
  const whole = randInt(rng, 1, 40);
  const decimalPart = randInt(rng, 1, 99);
  const value = Math.round((whole + decimalPart / 100) * 100) / 100;
  const roundedToWhole = decimalPart >= 50 ? whole + 1 : whole;
  return { value, roundedToWhole };
}

// ============================= PERCENTAGES ===================================

/** A "find X% of Y" fact where the answer is a whole number — `amount` is
 *  built as a multiple of whatever divisor guarantees a clean result for
 *  the chosen percentage (e.g. 25% needs amount divisible by 4). */
export function percentOfAmountFact(rng: Rng): { percent: number; amount: number; result: number } {
  const percent = pick(rng, [10, 20, 25, 50, 75]);
  const divisor = percent === 10 ? 10 : percent === 20 ? 5 : percent === 25 ? 4 : percent === 50 ? 2 : 4; // 75% also only needs /4
  const unit = randInt(rng, 2, 20);
  const amount = divisor * unit;
  return { percent, amount, result: (percent / 100) * amount };
}

/** A fraction with a denominator that converts cleanly to a percentage
 *  (2,4,5,10,20,25,50 etc.), plus that percentage. */
export function fractionToPercentFact(rng: Rng): { numerator: number; denominator: number; percent: number } {
  const table: [number, number][] = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10], [1, 20], [1, 25]];
  const [numerator, denominator] = pick(rng, table);
  return { numerator, denominator, percent: Math.round((numerator / denominator) * 100) };
}

// ============================= RATIO =========================================

/** A ratio and its simplified form. */
export function simplifiableRatio(rng: Rng): { a: number; b: number; simplifiedA: number; simplifiedB: number } {
  const pairs: [number, number][] = [[2, 4], [3, 6], [4, 8], [2, 6], [3, 9], [5, 10], [4, 6], [6, 9], [2, 10], [4, 10]];
  const [a, b] = pick(rng, pairs);
  const g = gcd(a, b);
  return { a, b, simplifiedA: a / g, simplifiedB: b / g };
}

/** "Share `total` in the ratio a:b" — total is chosen so both shares are whole numbers. */
export function shareInRatioFact(rng: Rng): { a: number; b: number; total: number; shareA: number; shareB: number } {
  const [a, b] = pick(rng, [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5]] as [number, number][]);
  const unit = randInt(rng, 2, 10);
  const total = (a + b) * unit;
  return { a, b, total, shareA: a * unit, shareB: b * unit };
}

// ============================= GEOMETRY (POSITION) ===========================

/** A point on a small coordinate grid, plus a translated version of it. */
export function coordinateTranslationFact(rng: Rng): { x: number; y: number; dx: number; dy: number; newX: number; newY: number } {
  const x = randInt(rng, 0, 8);
  const y = randInt(rng, 0, 8);
  const dx = randInt(rng, -3, 3);
  const dy = randInt(rng, -3, 3);
  return { x, y, dx, dy, newX: x + dx, newY: y + dy };
}

/** A compass bearing/direction fact — a starting direction plus a turn. */
export const COMPASS: readonly string[] = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"];
export function compassTurnFact(rng: Rng): { start: string; quarterTurns: number; clockwise: boolean; result: string } {
  const startIdx = randInt(rng, 0, 7);
  const quarterTurns = pick(rng, [1, 2, 3]);
  const clockwise = pick(rng, [true, false]);
  const resultIdx = ((clockwise ? startIdx + quarterTurns * 2 : startIdx - quarterTurns * 2) + 8) % 8;
  return { start: COMPASS[startIdx], quarterTurns, clockwise, result: COMPASS[resultIdx] };
}

export function shuffleDistinct<T>(rng: Rng, arr: readonly T[], count: number): T[] {
  return shuffle(rng, [...arr]).slice(0, count);
}
