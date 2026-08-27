/**
 * Key Stage 1 (Y1/Y2) procedural maths generators. Kept in a separate file
 * from maths.ts (KS2) since the two share no content overlap and this keeps
 * each file a manageable size — mirrors the local-helper pattern already
 * used in content-generators/grammar.ts rather than importing maths.ts's
 * private helpers.
 */
import { createRng, pick, randInt, shuffle, type Rng } from "./rng";
import type { DraftQuestion } from "./types";
import type { DifficultyBand, YearGroup } from "@/lib/curriculum/types";

function mcQuestion(
  rng: Rng,
  opts: {
    subjectSlug: string;
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
  yearGroup: YearGroup;
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

const SUBJECT = "maths";
const Y1: YearGroup = "Y1";
const Y2: YearGroup = "Y2";

// ============================= YEAR 1 =====================================

function generateY1NumberPlaceValueQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["count-to", "one-more", "one-less", "compare"] as const);
    if (kind === "count-to") {
      const n = randInt(rng, 1, 98);
      out.push(fillInBox({ subjectSlug: SUBJECT, strandSlug: "number-place-value", yearGroup: Y1, objectiveCode: "MA1-NPV-2", difficulty: "bronze", promptText: `What number comes after ${n}?`, answer: String(n + 1), explanation: `The number after ${n} is ${n + 1}.` }));
    } else if (kind === "one-more") {
      const n = randInt(rng, 1, 99);
      out.push(fillInBox({ subjectSlug: SUBJECT, strandSlug: "number-place-value", yearGroup: Y1, objectiveCode: "MA1-NPV-3", difficulty: "silver", promptText: `What is one more than ${n}?`, answer: String(n + 1), explanation: `One more than ${n} is ${n + 1}.` }));
    } else if (kind === "one-less") {
      const n = randInt(rng, 2, 100);
      out.push(fillInBox({ subjectSlug: SUBJECT, strandSlug: "number-place-value", yearGroup: Y1, objectiveCode: "MA1-NPV-3", difficulty: "silver", promptText: `What is one less than ${n}?`, answer: String(n - 1), explanation: `One less than ${n} is ${n - 1}.` }));
    } else {
      const a = randInt(rng, 1, 99);
      let b = randInt(rng, 1, 99);
      while (b === a) b = randInt(rng, 1, 99);
      const correct = a > b ? "more than" : "less than";
      out.push(mcQuestion(rng, { subjectSlug: SUBJECT, strandSlug: "number-place-value", yearGroup: Y1, objectiveCode: "MA1-NPV-4", difficulty: "bronze", promptText: `Is ${a} more than or less than ${b}?`, correct, distractors: [correct === "more than" ? "less than" : "more than", "equal to"], explanation: `${a} is ${correct} ${b}.` }));
    }
  }
  return out;
}

function generateY1AdditionQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "bronze", "silver", "silver", "gold"] as const);
    const max = difficulty === "bronze" ? 10 : difficulty === "silver" ? 15 : 20;
    const a = randInt(rng, 0, max);
    const b = randInt(rng, 0, max - a);
    out.push(fillInBox({ subjectSlug: SUBJECT, strandSlug: "addition", yearGroup: Y1, objectiveCode: "MA1-ADD-2", difficulty, promptText: `Work out: ${a} + ${b} = ?`, answer: String(a + b), explanation: `${a} + ${b} = ${a + b}.` }));
  }
  return out;
}

function generateY1SubtractionQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "bronze", "silver", "silver", "gold"] as const);
    const max = difficulty === "bronze" ? 10 : difficulty === "silver" ? 15 : 20;
    const a = randInt(rng, 1, max);
    const b = randInt(rng, 0, a);
    out.push(fillInBox({ subjectSlug: SUBJECT, strandSlug: "subtraction", yearGroup: Y1, objectiveCode: "MA1-SUB-2", difficulty, promptText: `Work out: ${a} - ${b} = ?`, answer: String(a - b), explanation: `${a} - ${b} = ${a - b}.` }));
  }
  return out;
}

function generateY1MultiplicationQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const step = pick(rng, [2, 5, 10] as const);
    const n = randInt(rng, 1, 10);
    const target = n * step;
    const distractors = [target + step, Math.max(0, target - step), target + 1].map(String);
    out.push(mcQuestion(rng, { subjectSlug: SUBJECT, strandSlug: "multiplication", yearGroup: Y1, objectiveCode: "MA1-MUL-1", difficulty: n <= 5 ? "bronze" : "silver", promptText: `Counting in ${step}s: 0, ${step}, ${step * 2}, ... what comes ${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"} — i.e. what is ${n} × ${step}?`, correct: String(target), distractors, explanation: `Counting in ${step}s, ${n} lots of ${step} is ${target}.` }));
  }
  return out;
}

function generateY1DivisionQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const groups = randInt(rng, 2, 5);
    const perGroup = randInt(rng, 2, 5);
    const total = groups * perGroup;
    out.push(mcQuestion(rng, { subjectSlug: SUBJECT, strandSlug: "division", yearGroup: Y1, objectiveCode: "MA1-DIV-1", difficulty: "gold", promptText: `${total} sweets are shared equally between ${groups} children. How many sweets does each child get?`, correct: String(perGroup), distractors: [String(perGroup + 1), String(Math.max(1, perGroup - 1)), String(groups)], explanation: `${total} ÷ ${groups} = ${perGroup} sweets each.` }));
  }
  return out;
}

function generateY1FractionsQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const items = ["a pizza", "a chocolate bar", "an apple", "a cake", "a sandwich"];
  for (let i = 0; i < count; i++) {
    const half = pick(rng, [true, false]);
    const item = pick(rng, items);
    if (half) {
      out.push(mcQuestion(rng, { subjectSlug: SUBJECT, strandSlug: "fractions", yearGroup: Y1, objectiveCode: "MA1-FRAC-1", difficulty: "bronze", promptText: `If you split ${item} into two equal parts, what is each part called?`, correct: "a half", distractors: ["a quarter", "a third", "a whole"], explanation: "Splitting something into two equal parts gives two halves." }));
    } else {
      out.push(mcQuestion(rng, { subjectSlug: SUBJECT, strandSlug: "fractions", yearGroup: Y1, objectiveCode: "MA1-FRAC-2", difficulty: "silver", promptText: `If you split ${item} into four equal parts, what is each part called?`, correct: "a quarter", distractors: ["a half", "a third", "a whole"], explanation: "Splitting something into four equal parts gives four quarters." }));
    }
  }
  return out;
}

function generateY1MeasurementQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["coin", "time", "compare"] as const);
    if (kind === "coin") {
      const coin = pick(rng, [{ v: "1p", val: 1 }, { v: "2p", val: 2 }, { v: "5p", val: 5 }, { v: "10p", val: 10 }, { v: "20p", val: 20 }, { v: "50p", val: 50 }, { v: "£1", val: 100 }, { v: "£2", val: 200 }]);
      out.push(mcQuestion(rng, { subjectSlug: SUBJECT, strandSlug: "measurement", yearGroup: Y1, objectiveCode: "MA1-MEA-2", difficulty: "silver", promptText: `Which coin is worth ${coin.v}?`, correct: coin.v, distractors: ["1p", "5p", "10p", "50p", "£1"].filter((c) => c !== coin.v).slice(0, 3), explanation: `This coin is worth ${coin.v}.` }));
    } else if (kind === "time") {
      const hour = randInt(rng, 1, 12);
      const half = pick(rng, [true, false]);
      out.push(mcQuestion(rng, { subjectSlug: SUBJECT, strandSlug: "measurement", yearGroup: Y1, objectiveCode: "MA1-MEA-5", difficulty: "gold", promptText: `The clock shows the hour hand just past ${hour} and the minute hand pointing straight ${half ? "down" : "up"}. What time is it?`, correct: half ? `half past ${hour}` : `${hour} o'clock`, distractors: [half ? `${hour} o'clock` : `half past ${hour}`, `quarter past ${hour}`, `quarter to ${hour}`], explanation: half ? `Minute hand down means half past the hour: half past ${hour}.` : `Minute hand up at 12 means it's exactly ${hour} o'clock.` }));
    } else {
      const a = pick(rng, ["the pencil", "the book", "the table", "the ribbon"]);
      const b = pick(rng, ["the eraser", "the ruler", "the chair", "the string"]);
      out.push(mcQuestion(rng, { subjectSlug: SUBJECT, strandSlug: "measurement", yearGroup: Y1, objectiveCode: "MA1-MEA-1", difficulty: "bronze", promptText: `${a} is longer than ${b}. Which is shorter?`, correct: b, distractors: [a, "They are the same"], explanation: `Since ${a} is longer, ${b} must be shorter.` }));
    }
  }
  return out;
}

function generateY1GeometryQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const shapes2d = [{ n: "circle", sides: "no straight sides" }, { n: "triangle", sides: "3 sides" }, { n: "square", sides: "4 equal sides" }, { n: "rectangle", sides: "4 sides, opposite ones equal" }];
  const shapes3d = [{ n: "cube", desc: "6 flat square faces" }, { n: "sphere", desc: "perfectly round, like a ball" }, { n: "cuboid", desc: "6 rectangular faces" }, { n: "pyramid", desc: "a flat base and triangular sides meeting at a point" }, { n: "cylinder", desc: "two flat circular ends and a curved side" }];
  for (let i = 0; i < count; i++) {
    const is3d = pick(rng, [true, false]);
    if (is3d) {
      const shape = pick(rng, shapes3d);
      out.push(mcQuestion(rng, { subjectSlug: SUBJECT, strandSlug: "geometry", yearGroup: Y1, objectiveCode: "MA1-GEO-2", difficulty: "silver", promptText: `Which 3-D shape has ${shape.desc}?`, correct: shape.n, distractors: shapes3d.filter((s) => s.n !== shape.n).map((s) => s.n).slice(0, 3), explanation: `A ${shape.n} has ${shape.desc}.` }));
    } else {
      const shape = pick(rng, shapes2d);
      out.push(mcQuestion(rng, { subjectSlug: SUBJECT, strandSlug: "geometry", yearGroup: Y1, objectiveCode: "MA1-GEO-1", difficulty: "bronze", promptText: `Which 2-D shape has ${shape.sides}?`, correct: shape.n, distractors: shapes2d.filter((s) => s.n !== shape.n).map((s) => s.n).slice(0, 3), explanation: `A ${shape.n} has ${shape.sides}.` }));
    }
  }
  return out;
}

function generateY1PositionQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const turns = [{ n: "whole turn", frac: "4/4" }, { n: "half turn", frac: "2/4" }, { n: "quarter turn", frac: "1/4" }, { n: "three-quarter turn", frac: "3/4" }];
  // Only 4 distinct turn fractions exist to name, so "turn-name" alone caps
  // out at 4 ever-distinct prompts no matter how many times it's called —
  // three more kinds spread across bronze/silver/gold (matching the
  // declared bands for MA1-POS-1) give this branch real variety instead.
  const oppositePairs: [string, string][] = [["up", "down"], ["left", "right"], ["forwards", "backwards"], ["over", "under"], ["in front of", "behind"]];
  const facingPairs: [string, string][] = [["the window", "the door"], ["the whiteboard", "the back wall"], ["the teacher", "the classroom door"], ["the playground", "the school hall"]];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["turn-name", "opposite-direction", "clockwise-sense", "half-turn-facing"] as const);
    if (kind === "turn-name") {
      const t = pick(rng, turns);
      out.push(mcQuestion(rng, { subjectSlug: SUBJECT, strandSlug: "position-direction", yearGroup: Y1, objectiveCode: "MA1-POS-1", difficulty: "silver", promptText: `A turn of ${t.frac} of a full circle is called what?`, correct: t.n, distractors: turns.filter((x) => x.n !== t.n).map((x) => x.n).slice(0, 3), explanation: `${t.frac} of a full turn is a ${t.n}.` }));
    } else if (kind === "opposite-direction") {
      const pair = pick(rng, oppositePairs);
      const [word, opposite] = pick(rng, [true, false]) ? pair : [pair[1], pair[0]];
      const otherWords = oppositePairs.flat().filter((w) => w !== word && w !== opposite);
      out.push(mcQuestion(rng, { subjectSlug: SUBJECT, strandSlug: "position-direction", yearGroup: Y1, objectiveCode: "MA1-POS-1", difficulty: "bronze", promptText: `Which word means the opposite of "${word}"?`, correct: opposite, distractors: shuffle(rng, otherWords).slice(0, 3), explanation: `"${opposite}" is the opposite direction to "${word}".` }));
    } else if (kind === "clockwise-sense") {
      const wantClockwise = pick(rng, [true, false]);
      out.push(mcQuestion(rng, { subjectSlug: SUBJECT, strandSlug: "position-direction", yearGroup: Y1, objectiveCode: "MA1-POS-1", difficulty: "silver", promptText: `Which word describes a turn in ${wantClockwise ? "the same direction the hands of a clock move" : "the opposite direction to the hands of a clock"}?`, correct: wantClockwise ? "Clockwise" : "Anticlockwise", distractors: ["Sideways", "Diagonally", wantClockwise ? "Anticlockwise" : "Clockwise"], explanation: `A turn in ${wantClockwise ? "the same direction as a clock's hands" : "the opposite direction to a clock's hands"} is called ${wantClockwise ? "clockwise" : "anticlockwise"}.` }));
    } else {
      const [start, opposite] = pick(rng, facingPairs);
      out.push(mcQuestion(rng, { subjectSlug: SUBJECT, strandSlug: "position-direction", yearGroup: Y1, objectiveCode: "MA1-POS-1", difficulty: "gold", promptText: `You are facing ${start}. You make a half turn. Which direction are you now facing?`, correct: opposite, distractors: [start, "left", "right"], explanation: `A half turn always leaves you facing the exact opposite way — from ${start} to ${opposite}.` }));
    }
  }
  return out;
}

function generateY1ReasoningQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const a = randInt(rng, 1, 10);
    const b = randInt(rng, 1, 10);
    const sum = a + b;
    out.push(mcQuestion(rng, { subjectSlug: SUBJECT, strandSlug: "reasoning", yearGroup: Y1, objectiveCode: "MA1-REA-1", difficulty: "gold", promptText: `${a} + ___ = ${sum}. What number goes in the gap?`, correct: String(b), distractors: [String(b + 1), String(Math.max(0, b - 1)), String(sum)], explanation: `${a} + ${b} = ${sum}, so the missing number is ${b}.` }));
  }
  return out;
}

function generateY1WordProblemsQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const items = ["apples", "stickers", "marbles", "toy cars", "sweets"];
  for (let i = 0; i < count; i++) {
    const item = pick(rng, items);
    const isAdd = pick(rng, [true, false]);
    const a = randInt(rng, 3, 12);
    const b = randInt(rng, 1, isAdd ? 20 - a : a);
    const result = isAdd ? a + b : a - b;
    const promptText = isAdd
      ? `Sam has ${a} ${item}. A friend gives Sam ${b} more. How many ${item} does Sam have now?`
      : `Sam has ${a} ${item} and gives away ${b}. How many ${item} does Sam have left?`;
    out.push(fillInBox({ subjectSlug: SUBJECT, strandSlug: "word-problems", yearGroup: Y1, objectiveCode: "MA1-WP-1", difficulty: "gold", promptText, answer: String(result), explanation: isAdd ? `${a} + ${b} = ${result}.` : `${a} - ${b} = ${result}.` }));
  }
  return out;
}

export function generateAllMathsQuestionsY1(seed = 11500): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...generateY1NumberPlaceValueQuestions(rng, 16),
    ...generateY1AdditionQuestions(rng, 20),
    ...generateY1SubtractionQuestions(rng, 20),
    ...generateY1MultiplicationQuestions(rng, 12),
    ...generateY1DivisionQuestions(rng, 10),
    ...generateY1FractionsQuestions(rng, 10),
    ...generateY1MeasurementQuestions(rng, 16),
    ...generateY1GeometryQuestions(rng, 14),
    ...generateY1PositionQuestions(rng, 14),
    ...generateY1ReasoningQuestions(rng, 8),
    ...generateY1WordProblemsQuestions(rng, 12),
  ];
}

export function generateAllMathsQuestionsY1Extra(seed = 21500): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...generateY1NumberPlaceValueQuestions(rng, 14),
    ...generateY1AdditionQuestions(rng, 18),
    ...generateY1SubtractionQuestions(rng, 18),
    ...generateY1MultiplicationQuestions(rng, 10),
    ...generateY1DivisionQuestions(rng, 8),
    ...generateY1FractionsQuestions(rng, 8),
    ...generateY1MeasurementQuestions(rng, 14),
    ...generateY1GeometryQuestions(rng, 12),
    ...generateY1PositionQuestions(rng, 10),
    ...generateY1ReasoningQuestions(rng, 6),
    ...generateY1WordProblemsQuestions(rng, 10),
  ];
}

// ============================= YEAR 2 =====================================

function generateY2NumberPlaceValueQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["place-value", "compare", "count-step", "order"] as const);
    if (kind === "place-value") {
      const tens = randInt(rng, 1, 9);
      const ones = randInt(rng, 0, 9);
      const n = tens * 10 + ones;
      const askTens = pick(rng, [true, false]);
      out.push(fillInBox({ subjectSlug: SUBJECT, strandSlug: "number-place-value", yearGroup: Y2, objectiveCode: "MA2-NPV-2", difficulty: "silver", promptText: `In the number ${n}, how many ${askTens ? "tens" : "ones"} are there?`, answer: String(askTens ? tens : ones), explanation: `${n} = ${tens} tens and ${ones} ones.` }));
    } else if (kind === "compare") {
      const a = randInt(rng, 1, 100);
      let b = randInt(rng, 1, 100);
      while (b === a) b = randInt(rng, 1, 100);
      const correct = a > b ? ">" : "<";
      out.push(mcQuestion(rng, { subjectSlug: SUBJECT, strandSlug: "number-place-value", yearGroup: Y2, objectiveCode: "MA2-NPV-3", difficulty: "silver", promptText: `Which symbol correctly compares ${a} and ${b}? ${a} ___ ${b}`, correct, distractors: ["=", correct === ">" ? "<" : ">"], explanation: `${a} is ${correct === ">" ? "greater" : "less"} than ${b}, so ${a} ${correct} ${b}.` }));
    } else if (kind === "count-step") {
      const step = pick(rng, [2, 3, 5, 10] as const);
      const start = randInt(rng, 0, 5) * step;
      const n = randInt(rng, 1, 4);
      const target = start + step * n;
      out.push(fillInBox({ subjectSlug: SUBJECT, strandSlug: "number-place-value", yearGroup: Y2, objectiveCode: "MA2-NPV-1", difficulty: "bronze", promptText: `Counting in ${step}s from ${start}: ${start}, ${start + step}, ${start + step * 2}, ___`, answer: String(start + step * 3), explanation: `Continuing the count in ${step}s gives ${start + step * 3}.` }));
    } else {
      const nums = [randInt(rng, 1, 100), randInt(rng, 1, 100), randInt(rng, 1, 100)];
      const sorted = [...nums].sort((a, b) => a - b);
      out.push(mcQuestion(rng, { subjectSlug: SUBJECT, strandSlug: "number-place-value", yearGroup: Y2, objectiveCode: "MA2-NPV-3", difficulty: "gold", promptText: `Which of these numbers is the smallest: ${nums.join(", ")}?`, correct: String(sorted[0]), distractors: nums.map(String), explanation: `Ordering the numbers from smallest to largest: ${sorted.join(", ")}.` }));
    }
  }
  return out;
}

function generateY2AdditionQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "silver", "gold"] as const);
    const a = randInt(rng, 10, 89);
    const b = difficulty === "bronze" ? randInt(rng, 1, 9) : randInt(rng, 10, 99 - a);
    out.push(fillInBox({ subjectSlug: SUBJECT, strandSlug: "addition", yearGroup: Y2, objectiveCode: "MA2-ADD-2", difficulty, promptText: `Work out: ${a} + ${b} = ?`, answer: String(a + b), explanation: `${a} + ${b} = ${a + b}.` }));
  }
  return out;
}

function generateY2SubtractionQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const difficulty: DifficultyBand = pick(rng, ["bronze", "silver", "silver", "gold"] as const);
    const a = randInt(rng, 20, 99);
    const b = difficulty === "bronze" ? randInt(rng, 1, 9) : randInt(rng, 10, a);
    out.push(fillInBox({ subjectSlug: SUBJECT, strandSlug: "subtraction", yearGroup: Y2, objectiveCode: "MA2-SUB-2", difficulty, promptText: `Work out: ${a} - ${b} = ?`, answer: String(a - b), explanation: `${a} - ${b} = ${a - b}.` }));
  }
  return out;
}

function generateY2MultiplicationQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const step = pick(rng, [2, 5, 10] as const);
    const n = randInt(rng, 1, 12);
    const product = step * n;
    out.push(fillInBox({ subjectSlug: SUBJECT, strandSlug: "multiplication", yearGroup: Y2, objectiveCode: "MA2-MUL-1", difficulty: n <= 5 ? "bronze" : "silver", promptText: `Work out: ${step} × ${n} = ?`, answer: String(product), explanation: `${step} × ${n} = ${product}.` }));
  }
  return out;
}

function generateY2DivisionQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const step = pick(rng, [2, 5, 10] as const);
    const n = randInt(rng, 1, 10);
    const product = step * n;
    out.push(fillInBox({ subjectSlug: SUBJECT, strandSlug: "division", yearGroup: Y2, objectiveCode: "MA2-DIV-2", difficulty: "silver", promptText: `Work out: ${product} ÷ ${step} = ?`, answer: String(n), explanation: `${product} ÷ ${step} = ${n}.` }));
  }
  return out;
}

function generateY2FractionsQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const denom = pick(rng, [2, 3, 4] as const);
    const wholeCandidates = denom === 2 ? [4, 6, 8, 10, 12] : denom === 3 ? [6, 9, 12] : [4, 8, 12, 16];
    const whole = pick(rng, wholeCandidates);
    const part = whole / denom;
    const fracName = denom === 2 ? "half" : denom === 3 ? "third" : "quarter";
    out.push(fillInBox({ subjectSlug: SUBJECT, strandSlug: "fractions", yearGroup: Y2, objectiveCode: "MA2-FRAC-2", difficulty: "silver", promptText: `What is 1/${denom} (one ${fracName}) of ${whole}?`, answer: String(part), explanation: `${whole} ÷ ${denom} = ${part}, so one ${fracName} of ${whole} is ${part}.` }));
  }
  return out;
}

function generateY2MeasurementQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["money", "time"] as const);
    if (kind === "money") {
      const pounds = randInt(rng, 1, 5);
      const pence = pick(rng, [0, 10, 20, 25, 50, 75] as const);
      out.push(fillInBox({ subjectSlug: SUBJECT, strandSlug: "measurement", yearGroup: Y2, objectiveCode: "MA2-MEA-3", difficulty: "silver", promptText: `Write £${pounds} and ${pence}p as an amount in pence.`, answer: String(pounds * 100 + pence), explanation: `£${pounds} = ${pounds * 100}p, plus ${pence}p = ${pounds * 100 + pence}p.` }));
    } else {
      const hour = randInt(rng, 1, 12);
      const minutes = pick(rng, [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as const);
      const label = minutes === 0 ? `${hour} o'clock` : minutes === 15 ? `quarter past ${hour}` : minutes === 30 ? `half past ${hour}` : minutes === 45 ? `quarter to ${hour === 12 ? 1 : hour + 1}` : `${minutes} past ${hour}`;
      out.push(mcQuestion(rng, { subjectSlug: SUBJECT, strandSlug: "measurement", yearGroup: Y2, objectiveCode: "MA2-MEA-5", difficulty: "gold", promptText: `The clock shows ${hour}:${String(minutes).padStart(2, "0")}. How do you say this time?`, correct: label, distractors: ["half past " + hour, "quarter past " + hour, hour + " o'clock"].filter((d) => d !== label), explanation: `${hour}:${String(minutes).padStart(2, "0")} is said as "${label}".` }));
    }
  }
  return out;
}

function generateY2GeometryQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const shapes = [
    { n: "triangle", sides: 3, vertices: 3 }, { n: "square", sides: 4, vertices: 4 }, { n: "pentagon", sides: 5, vertices: 5 },
    { n: "hexagon", sides: 6, vertices: 6 }, { n: "octagon", sides: 8, vertices: 8 },
  ];
  const solids = [
    { n: "cube", faces: 6, edges: 12, vertices: 8 }, { n: "cuboid", faces: 6, edges: 12, vertices: 8 },
    { n: "square-based pyramid", faces: 5, edges: 8, vertices: 5 }, { n: "triangular prism", faces: 5, edges: 9, vertices: 6 },
  ];
  for (let i = 0; i < count; i++) {
    const is3d = pick(rng, [true, false]);
    if (is3d) {
      const shape = pick(rng, solids);
      const ask = pick(rng, ["faces", "edges", "vertices"] as const);
      out.push(fillInBox({ subjectSlug: SUBJECT, strandSlug: "geometry", yearGroup: Y2, objectiveCode: "MA2-GEO-2", difficulty: "gold", promptText: `How many ${ask} does a ${shape.n} have?`, answer: String(shape[ask]), explanation: `A ${shape.n} has ${shape[ask]} ${ask}.` }));
    } else {
      const shape = pick(rng, shapes);
      out.push(fillInBox({ subjectSlug: SUBJECT, strandSlug: "geometry", yearGroup: Y2, objectiveCode: "MA2-GEO-1", difficulty: "silver", promptText: `How many sides does a ${shape.n} have?`, answer: String(shape.sides), explanation: `A ${shape.n} has ${shape.sides} sides.` }));
    }
  }
  return out;
}

function generateY2PositionQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const dir = pick(rng, ["clockwise", "anti-clockwise"] as const);
    const turn = pick(rng, [{ f: "quarter", deg: 90 }, { f: "half", deg: 180 }, { f: "three-quarter", deg: 270 }]);
    out.push(mcQuestion(rng, { subjectSlug: SUBJECT, strandSlug: "position-direction", yearGroup: Y2, objectiveCode: "MA2-POS-1", difficulty: "gold", promptText: `A ${turn.f} turn ${dir} moves through how many degrees?`, correct: `${turn.deg}°`, distractors: ["90°", "180°", "270°"].filter((d) => d !== `${turn.deg}°`), explanation: `A ${turn.f} turn is ${turn.deg} degrees, whichever direction it's made.` }));
  }
  return out;
}

function generateY2StatisticsQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const categories = [["Apples", "Bananas", "Oranges"], ["Red", "Blue", "Green"], ["Cats", "Dogs", "Fish"]];
  for (let i = 0; i < count; i++) {
    const cats = pick(rng, categories);
    const counts = cats.map(() => randInt(rng, 2, 12));
    const total = counts.reduce((a, b) => a + b, 0);
    const maxIdx = counts.indexOf(Math.max(...counts));
    const ask = pick(rng, ["most", "total"] as const);
    if (ask === "most") {
      out.push(mcQuestion(rng, { subjectSlug: SUBJECT, strandSlug: "statistics", yearGroup: Y2, objectiveCode: "MA2-STAT-1", difficulty: "silver", promptText: `A pictogram shows: ${cats.map((c, idx) => `${c}: ${counts[idx]}`).join(", ")}. Which category has the most?`, correct: cats[maxIdx], distractors: cats.filter((_, idx) => idx !== maxIdx), explanation: `${cats[maxIdx]} has the highest count (${counts[maxIdx]}).` }));
    } else {
      out.push(fillInBox({ subjectSlug: SUBJECT, strandSlug: "statistics", yearGroup: Y2, objectiveCode: "MA2-STAT-3", difficulty: "gold", promptText: `A pictogram shows: ${cats.map((c, idx) => `${c}: ${counts[idx]}`).join(", ")}. What is the total of all categories?`, answer: String(total), explanation: `${counts.join(" + ")} = ${total}.` }));
    }
  }
  return out;
}

function generateY2ReasoningQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const a = randInt(rng, 10, 50);
    const b = randInt(rng, 10, 50);
    const sum = a + b;
    out.push(fillInBox({ subjectSlug: SUBJECT, strandSlug: "reasoning", yearGroup: Y2, objectiveCode: "MA2-REA-1", difficulty: "challenge", promptText: `${a} + ___ = ${sum}. What number goes in the gap?`, answer: String(b), explanation: `${a} + ${b} = ${sum}, so the missing number is ${b}.` }));
  }
  return out;
}

function generateY2WordProblemsQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const paid = pick(rng, [50, 100] as const);
    const priceOptions = paid === 100 ? [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90] : [5, 10, 15, 20, 25, 30, 35, 40, 45];
    const price = pick(rng, priceOptions);
    out.push(fillInBox({ subjectSlug: SUBJECT, strandSlug: "word-problems", yearGroup: Y2, objectiveCode: "MA2-WP-1", difficulty: "gold", promptText: `A toy costs ${price}p. You pay with a ${paid === 100 ? "£1 coin" : "50p coin"}. How much change do you get?`, answer: String(paid - price), explanation: `${paid}p - ${price}p = ${paid - price}p change.` }));
  }
  return out;
}

export function generateAllMathsQuestionsY2(seed = 12500): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...generateY2NumberPlaceValueQuestions(rng, 20),
    ...generateY2AdditionQuestions(rng, 18),
    ...generateY2SubtractionQuestions(rng, 18),
    ...generateY2MultiplicationQuestions(rng, 16),
    ...generateY2DivisionQuestions(rng, 12),
    ...generateY2FractionsQuestions(rng, 12),
    ...generateY2MeasurementQuestions(rng, 16),
    ...generateY2GeometryQuestions(rng, 14),
    ...generateY2PositionQuestions(rng, 8),
    ...generateY2StatisticsQuestions(rng, 10),
    ...generateY2ReasoningQuestions(rng, 8),
    ...generateY2WordProblemsQuestions(rng, 10),
  ];
}

export function generateAllMathsQuestionsY2Extra(seed = 22500): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...generateY2NumberPlaceValueQuestions(rng, 18),
    ...generateY2AdditionQuestions(rng, 16),
    ...generateY2SubtractionQuestions(rng, 16),
    ...generateY2MultiplicationQuestions(rng, 14),
    ...generateY2DivisionQuestions(rng, 10),
    ...generateY2FractionsQuestions(rng, 10),
    ...generateY2MeasurementQuestions(rng, 14),
    ...generateY2GeometryQuestions(rng, 12),
    ...generateY2PositionQuestions(rng, 6),
    ...generateY2StatisticsQuestions(rng, 8),
    ...generateY2ReasoningQuestions(rng, 6),
    ...generateY2WordProblemsQuestions(rng, 8),
  ];
}

export function generateAllMathsQuestionsY1Extra2(seed = 31500): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...generateY1NumberPlaceValueQuestions(rng, 12),
    ...generateY1AdditionQuestions(rng, 16),
    ...generateY1SubtractionQuestions(rng, 16),
    ...generateY1MultiplicationQuestions(rng, 8),
    ...generateY1DivisionQuestions(rng, 6),
    ...generateY1FractionsQuestions(rng, 6),
    ...generateY1MeasurementQuestions(rng, 12),
    ...generateY1GeometryQuestions(rng, 10),
    ...generateY1PositionQuestions(rng, 9),
    ...generateY1ReasoningQuestions(rng, 5),
    ...generateY1WordProblemsQuestions(rng, 8),
  ];
}

export function generateAllMathsQuestionsY2Extra2(seed = 32500): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...generateY2NumberPlaceValueQuestions(rng, 16),
    ...generateY2AdditionQuestions(rng, 14),
    ...generateY2SubtractionQuestions(rng, 14),
    ...generateY2MultiplicationQuestions(rng, 12),
    ...generateY2DivisionQuestions(rng, 8),
    ...generateY2FractionsQuestions(rng, 8),
    ...generateY2MeasurementQuestions(rng, 12),
    ...generateY2GeometryQuestions(rng, 10),
    ...generateY2PositionQuestions(rng, 5),
    ...generateY2StatisticsQuestions(rng, 6),
    ...generateY2ReasoningQuestions(rng, 5),
    ...generateY2WordProblemsQuestions(rng, 6),
  ];
}

/** A further volume pass over just the "core 6" number strands (the ones
 * with wide enough numeric ranges to keep yielding new, non-duplicate
 * combinations) — measurement/geometry/position/statistics/reasoning/
 * word-problems get their extra volume from maths-ks1-strands2.ts instead. */
export function generateAllMathsQuestionsY2Extra3(seed = 42500): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...generateY2NumberPlaceValueQuestions(rng, 20),
    ...generateY2AdditionQuestions(rng, 22),
    ...generateY2SubtractionQuestions(rng, 22),
    ...generateY2MultiplicationQuestions(rng, 10),
    ...generateY2DivisionQuestions(rng, 8),
    ...generateY2FractionsQuestions(rng, 6),
  ];
}
