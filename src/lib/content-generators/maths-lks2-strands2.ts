/**
 * Additional Y3/Y4 procedural coverage for measurement, geometry, statistics,
 * position & direction (Y4 only) reasoning and word problems — the same kind
 * of volume top-up as maths-ks1-strands2.ts, but for lower KS2. These strands
 * are hand-authored in maths-authored.json for other year groups; here they
 * are proceduralised instead so a large, varied volume is achievable without
 * writing hundreds of individual hand items.
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
const Y3: YearGroup = "Y3";
const Y4: YearGroup = "Y4";

// =============================== YEAR 3 =====================================

function generateY3LengthMassCapacityQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["add-length", "add-mass", "add-capacity"] as const);
    if (kind === "add-length") {
      const m1 = randInt(rng, 1, 8);
      const cm1 = randInt(rng, 0, 99);
      const m2 = randInt(rng, 1, 8);
      const cm2 = randInt(rng, 0, 99);
      const totalCm = (m1 * 100 + cm1) + (m2 * 100 + cm2);
      out.push(fillInBox({ strandSlug: "measurement", yearGroup: Y3, objectiveCode: "MA3-MEA-1", difficulty: "silver", promptText: `A ribbon is ${m1} m ${cm1} cm long. Another is ${m2} m ${cm2} cm long. What is their total length in centimetres?`, answer: String(totalCm), explanation: `${m1} m ${cm1} cm = ${m1 * 100 + cm1} cm, and ${m2} m ${cm2} cm = ${m2 * 100 + cm2} cm. Total: ${totalCm} cm.` }));
    } else if (kind === "add-mass") {
      const g1 = randInt(rng, 100, 900);
      const g2 = randInt(rng, 100, 900);
      out.push(fillInBox({ strandSlug: "measurement", yearGroup: Y3, objectiveCode: "MA3-MEA-1", difficulty: "silver", promptText: `A bag of flour weighs ${g1} g and a bag of sugar weighs ${g2} g. What is their total mass in grams?`, answer: String(g1 + g2), explanation: `${g1} g + ${g2} g = ${g1 + g2} g.` }));
    } else {
      const ml1 = randInt(rng, 100, 900);
      const ml2 = randInt(rng, 100, 900);
      out.push(fillInBox({ strandSlug: "measurement", yearGroup: Y3, objectiveCode: "MA3-MEA-1", difficulty: "silver", promptText: `A jug holds ${ml1} ml and a bottle holds ${ml2} ml. How much liquid is there altogether, in millilitres?`, answer: String(ml1 + ml2), explanation: `${ml1} ml + ${ml2} ml = ${ml1 + ml2} ml.` }));
    }
  }
  return out;
}

function generateY3PerimeterQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const shape = pick(rng, ["rectangle", "square", "triangle"] as const);
    if (shape === "rectangle") {
      const l = randInt(rng, 3, 20);
      const w = randInt(rng, 2, l - 1 > 2 ? l - 1 : 3);
      out.push(fillInBox({ strandSlug: "measurement", yearGroup: Y3, objectiveCode: "MA3-MEA-2", difficulty: "silver", promptText: `A rectangle is ${l} cm long and ${w} cm wide. What is its perimeter?`, answer: String(2 * (l + w)), explanation: `Perimeter = 2 × (${l} + ${w}) = ${2 * (l + w)} cm.` }));
    } else if (shape === "square") {
      const s = randInt(rng, 2, 15);
      out.push(fillInBox({ strandSlug: "measurement", yearGroup: Y3, objectiveCode: "MA3-MEA-2", difficulty: "bronze", promptText: `A square has sides of ${s} cm. What is its perimeter?`, answer: String(s * 4), explanation: `Perimeter = 4 × ${s} = ${s * 4} cm.` }));
    } else {
      const a = randInt(rng, 3, 15);
      const b = randInt(rng, 3, 15);
      const c = randInt(rng, 3, 15);
      out.push(fillInBox({ strandSlug: "measurement", yearGroup: Y3, objectiveCode: "MA3-MEA-2", difficulty: "gold", promptText: `A triangle has sides of ${a} cm, ${b} cm and ${c} cm. What is its perimeter?`, answer: String(a + b + c), explanation: `Perimeter = ${a} + ${b} + ${c} = ${a + b + c} cm.` }));
    }
  }
  return out;
}

function generateY3MoneyQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["change", "total"] as const);
    if (kind === "change") {
      const pounds = randInt(rng, 5, 20);
      const pence = randInt(rng, 1, 99);
      const cost = pounds * 100 - pence;
      const paid = pounds * 100;
      out.push(fillInBox({ strandSlug: "measurement", yearGroup: Y3, objectiveCode: "MA3-MEA-3", difficulty: "gold", promptText: `An item costs £${((cost) / 100).toFixed(2)}. You pay with a £${pounds} note. How much change do you get, in pence?`, answer: String(paid - cost), explanation: `£${pounds} = ${paid}p. ${paid}p - ${cost}p = ${paid - cost}p change.` }));
    } else {
      const p1 = randInt(rng, 1, 20);
      const pn1 = randInt(rng, 0, 99);
      const p2 = randInt(rng, 1, 20);
      const pn2 = randInt(rng, 0, 99);
      const totalPence = (p1 * 100 + pn1) + (p2 * 100 + pn2);
      out.push(fillInBox({ strandSlug: "measurement", yearGroup: Y3, objectiveCode: "MA3-MEA-3", difficulty: "silver", promptText: `Two items cost £${p1}.${String(pn1).padStart(2, "0")} and £${p2}.${String(pn2).padStart(2, "0")}. What is the total cost in pence?`, answer: String(totalPence), explanation: `£${p1}.${String(pn1).padStart(2, "0")} = ${p1 * 100 + pn1}p, plus £${p2}.${String(pn2).padStart(2, "0")} = ${p2 * 100 + pn2}p. Total: ${totalPence}p.` }));
    }
  }
  return out;
}

function generateY3TimeQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const romanMap: [number, string][] = [[1, "I"], [2, "II"], [3, "III"], [4, "IV"], [5, "V"], [6, "VI"], [7, "VII"], [8, "VIII"], [9, "IX"], [10, "X"], [11, "XI"], [12, "XII"]];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["roman", "duration", "seconds"] as const);
    if (kind === "roman") {
      const [n, roman] = pick(rng, romanMap);
      const toRoman = pick(rng, [true, false]);
      if (toRoman) {
        out.push(fillInBox({ strandSlug: "measurement", yearGroup: Y3, objectiveCode: "MA3-MEA-4", difficulty: "silver", promptText: `Write the number ${n} as a Roman numeral, as it would appear on a clock face.`, answer: roman, explanation: `${n} is written as ${roman} in Roman numerals.` }));
      } else {
        out.push(fillInBox({ strandSlug: "measurement", yearGroup: Y3, objectiveCode: "MA3-MEA-4", difficulty: "silver", promptText: `What number does the Roman numeral ${roman} represent on a clock face?`, answer: String(n), explanation: `${roman} represents the number ${n}.` }));
      }
    } else if (kind === "duration") {
      const h1 = randInt(rng, 0, 2);
      const m1 = randInt(rng, 10, 59);
      const h2 = randInt(rng, 0, 2);
      const m2 = randInt(rng, 10, 59);
      const total1 = h1 * 60 + m1;
      const total2 = h2 * 60 + m2;
      const longer = total1 >= total2 ? `${h1} hour(s) ${m1} minutes` : `${h2} hour(s) ${m2} minutes`;
      const shorter = total1 < total2 ? `${h1} hour(s) ${m1} minutes` : `${h2} hour(s) ${m2} minutes`;
      out.push(mcQuestion(rng, { strandSlug: "measurement", yearGroup: Y3, objectiveCode: "MA3-MEA-6", difficulty: "silver", promptText: `Which event lasted longer: one that took ${h1} hour(s) ${m1} minutes, or one that took ${h2} hour(s) ${m2} minutes?`, correct: longer, distractors: [shorter, "They took exactly the same time"], explanation: `${longer} is longer than ${shorter}.` }));
    } else {
      const minutes = randInt(rng, 1, 10);
      out.push(fillInBox({ strandSlug: "measurement", yearGroup: Y3, objectiveCode: "MA3-MEA-5", difficulty: "bronze", promptText: `How many seconds are there in ${minutes} minutes?`, answer: String(minutes * 60), explanation: `${minutes} × 60 = ${minutes * 60} seconds.` }));
    }
  }
  return out;
}

function generateY3AnglesQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const angleTypes = [{ deg: randInt(rng, 10, 89), name: "acute" }];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["classify", "turns", "lines"] as const);
    if (kind === "classify") {
      const deg = pick(rng, [randInt(rng, 10, 89), 90, randInt(rng, 91, 179)]);
      const name = deg < 90 ? "acute" : deg === 90 ? "right angle" : "obtuse";
      out.push(mcQuestion(rng, { strandSlug: "geometry", yearGroup: Y3, objectiveCode: "MA3-GEO-3", difficulty: "silver", promptText: `An angle measures ${deg}°. Is it acute, a right angle, or obtuse?`, correct: name, distractors: ["acute", "right angle", "obtuse"].filter((n) => n !== name), explanation: `${deg}° is ${name === "right angle" ? "exactly 90°, a right angle" : name < "right angle" ? `less than 90° (${name})` : `between 90° and 180° (${name})`}.` }));
    } else if (kind === "turns") {
      const n = randInt(rng, 1, 4);
      const names = ["a quarter turn", "a half turn", "three-quarters of a turn", "a complete turn"];
      out.push(fillInBox({ strandSlug: "geometry", yearGroup: Y3, objectiveCode: "MA3-GEO-3", difficulty: "gold", promptText: `How many right angles make ${names[n - 1]}?`, answer: String(n), explanation: `${names[n - 1]} is made up of ${n} right angle(s).` }));
    } else {
      const kind2 = pick(rng, ["parallel", "perpendicular", "horizontal", "vertical"] as const);
      const defs: Record<string, string> = { parallel: "never meet and stay the same distance apart", perpendicular: "cross each other at a right angle", horizontal: "run flat, side to side", vertical: "run straight up and down" };
      out.push(mcQuestion(rng, { strandSlug: "geometry", yearGroup: Y3, objectiveCode: "MA3-GEO-4", difficulty: "silver", promptText: `Which word describes lines that ${defs[kind2]}?`, correct: kind2, distractors: ["parallel", "perpendicular", "horizontal", "vertical"].filter((d) => d !== kind2), explanation: `${kind2[0].toUpperCase()}${kind2.slice(1)} lines ${defs[kind2]}.` }));
    }
  }
  return out;
}

function generateY3ShapePropertiesQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const solids = [{ n: "cube", faces: 6, edges: 12, vertices: 8 }, { n: "cuboid", faces: 6, edges: 12, vertices: 8 }, { n: "triangular prism", faces: 5, edges: 9, vertices: 6 }, { n: "square-based pyramid", faces: 5, edges: 8, vertices: 5 }, { n: "cylinder", faces: 3, edges: 2, vertices: 0 }, { n: "cone", faces: 2, edges: 1, vertices: 1 }];
  for (let i = 0; i < count; i++) {
    const shape = pick(rng, solids);
    const ask = pick(rng, ["faces", "edges", "vertices"] as const);
    out.push(fillInBox({ strandSlug: "geometry", yearGroup: Y3, objectiveCode: "MA3-GEO-1", difficulty: "silver", promptText: `How many ${ask} does a ${shape.n} have?`, answer: String(shape[ask]), explanation: `A ${shape.n} has ${shape[ask]} ${ask}.` }));
  }
  return out;
}

function generateY3StatisticsQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const categorySets = [["Football", "Netball", "Swimming", "Athletics"], ["Chocolate", "Vanilla", "Strawberry", "Mint"], ["Bus", "Car", "Bike", "Walk"], ["January", "February", "March", "April"]];
  for (let i = 0; i < count; i++) {
    const cats = pick(rng, categorySets);
    const counts = cats.map(() => randInt(rng, 3, 30));
    const total = counts.reduce((a, b) => a + b, 0);
    const listStr = cats.map((c, idx) => `${c}: ${counts[idx]}`).join(", ");
    const kind = pick(rng, ["total", "difference", "more-than-half", "double"] as const);
    if (kind === "total") {
      out.push(fillInBox({ strandSlug: "statistics", yearGroup: Y3, objectiveCode: "MA3-STAT-2", difficulty: "gold", promptText: `A bar chart shows: ${listStr}. What is the total across all categories?`, answer: String(total), explanation: `${counts.join(" + ")} = ${total}.` }));
    } else if (kind === "difference") {
      const maxIdx = counts.indexOf(Math.max(...counts));
      const minIdx = counts.indexOf(Math.min(...counts));
      out.push(fillInBox({ strandSlug: "statistics", yearGroup: Y3, objectiveCode: "MA3-STAT-2", difficulty: "gold", promptText: `A bar chart shows: ${listStr}. What is the difference between the highest and lowest values?`, answer: String(counts[maxIdx] - counts[minIdx]), explanation: `${counts[maxIdx]} - ${counts[minIdx]} = ${counts[maxIdx] - counts[minIdx]}.` }));
    } else if (kind === "more-than-half") {
      const halfTotal = total / 2;
      const aboveHalf = cats.filter((_, idx) => counts[idx] > halfTotal);
      out.push(mcQuestion(rng, { strandSlug: "statistics", yearGroup: Y3, objectiveCode: "MA3-STAT-1", difficulty: "silver", promptText: `A bar chart shows: ${listStr}. Which category has the highest value?`, correct: cats[counts.indexOf(Math.max(...counts))], distractors: cats.filter((c) => c !== cats[counts.indexOf(Math.max(...counts))]), explanation: `${cats[counts.indexOf(Math.max(...counts))]} has the highest value (${Math.max(...counts)}).` }));
    } else {
      const idx = randInt(rng, 0, cats.length - 1);
      out.push(fillInBox({ strandSlug: "statistics", yearGroup: Y3, objectiveCode: "MA3-STAT-2", difficulty: "gold", promptText: `A bar chart shows: ${listStr}. What is double the value for ${cats[idx]}?`, answer: String(counts[idx] * 2), explanation: `${counts[idx]} × 2 = ${counts[idx] * 2}.` }));
    }
  }
  return out;
}

function generateY3ReasoningQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["missing-number", "digit-clue", "multiple-check", "true-false"] as const);
    if (kind === "missing-number") {
      const a = randInt(rng, 50, 300);
      const b = randInt(rng, 50, 300);
      const sum = a + b;
      out.push(fillInBox({ strandSlug: "reasoning", yearGroup: Y3, objectiveCode: "MA3-REA-1", difficulty: "gold", promptText: `${a} + ___ = ${sum}. What number goes in the gap?`, answer: String(b), explanation: `${sum} - ${a} = ${b}.` }));
    } else if (kind === "digit-clue") {
      const h = randInt(rng, 1, 9);
      const t = randInt(rng, 0, 9);
      const o = randInt(rng, 0, 9);
      const n = h * 100 + t * 10 + o;
      out.push(fillInBox({ strandSlug: "reasoning", yearGroup: Y3, objectiveCode: "MA3-REA-1", difficulty: "challenge", promptText: `I am a 3-digit number. My hundreds digit is ${h}, my tens digit is ${t}, and my ones digit is ${o}. What number am I?`, answer: String(n), explanation: `${h} hundreds + ${t} tens + ${o} ones = ${n}.` }));
    } else if (kind === "multiple-check") {
      const table = pick(rng, [3, 4, 8] as const);
      const isMultiple = pick(rng, [true, false]);
      const n = isMultiple ? table * randInt(rng, 2, 15) : table * randInt(rng, 2, 15) + randInt(rng, 1, table - 1);
      out.push(mcQuestion(rng, { strandSlug: "reasoning", yearGroup: Y3, objectiveCode: "MA3-REA-1", difficulty: "gold", promptText: `Is ${n} a multiple of ${table}?`, correct: isMultiple ? "Yes" : "No", distractors: [isMultiple ? "No" : "Yes"], explanation: `${n} ÷ ${table} ${isMultiple ? "divides exactly" : "does not divide exactly"}, so ${n} is ${isMultiple ? "" : "not "}a multiple of ${table}.` }));
    } else {
      const a = randInt(rng, 10, 200);
      const b = randInt(rng, 10, 200);
      const claimed = a + b + (pick(rng, [true, false]) ? 0 : randInt(rng, 1, 10));
      const isTrue = claimed === a + b;
      out.push(mcQuestion(rng, { strandSlug: "reasoning", yearGroup: Y3, objectiveCode: "MA3-REA-1", difficulty: "gold", promptText: `True or false: ${a} + ${b} = ${claimed}`, correct: isTrue ? "True" : "False", distractors: [isTrue ? "False" : "True"], explanation: `${a} + ${b} = ${a + b}, so the statement is ${isTrue ? "true" : "false"}.` }));
    }
  }
  return out;
}

function generateY3WordProblemsQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const items = ["stickers", "marbles", "football cards", "buttons", "beads", "pebbles"];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["two-step-add-sub", "multiply-groups", "divide-share", "missing-number"] as const);
    const item = pick(rng, items);
    if (kind === "two-step-add-sub") {
      const start = randInt(rng, 100, 400);
      const gain = randInt(rng, 20, 100);
      const loss = randInt(rng, 20, 100);
      out.push(fillInBox({ strandSlug: "word-problems", yearGroup: Y3, objectiveCode: "MA3-WP-1", difficulty: "gold", promptText: `Priya has ${start} ${item}. She finds ${gain} more, then gives away ${loss}. How many does she have now?`, answer: String(start + gain - loss), explanation: `${start} + ${gain} = ${start + gain}, then ${start + gain} - ${loss} = ${start + gain - loss}.` }));
    } else if (kind === "multiply-groups") {
      const groups = randInt(rng, 3, 12);
      const each = pick(rng, [3, 4, 8] as const);
      out.push(fillInBox({ strandSlug: "word-problems", yearGroup: Y3, objectiveCode: "MA3-WP-1", difficulty: "silver", promptText: `A shop has ${groups} bags of ${item}, with ${each} in each bag. How many ${item} are there altogether?`, answer: String(groups * each), explanation: `${groups} × ${each} = ${groups * each}.` }));
    } else if (kind === "divide-share") {
      const each = pick(rng, [3, 4, 8] as const);
      const friends = randInt(rng, 2, 9);
      const total = each * friends;
      out.push(fillInBox({ strandSlug: "word-problems", yearGroup: Y3, objectiveCode: "MA3-WP-1", difficulty: "gold", promptText: `${total} ${item} are shared equally between ${friends} friends. How many does each friend get?`, answer: String(each), explanation: `${total} ÷ ${friends} = ${each}.` }));
    } else {
      const total = randInt(rng, 100, 500);
      const known = randInt(rng, 20, total - 20);
      out.push(fillInBox({ strandSlug: "word-problems", yearGroup: Y3, objectiveCode: "MA3-WP-1", difficulty: "challenge", promptText: `___ + ${known} = ${total}. What number goes in the gap?`, answer: String(total - known), explanation: `${total} - ${known} = ${total - known}.` }));
    }
  }
  return out;
}

export function generateAllMathsQuestionsY3Strands2(seed = 63700): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...generateY3LengthMassCapacityQuestions(rng, 16),
    ...generateY3PerimeterQuestions(rng, 16),
    ...generateY3MoneyQuestions(rng, 16),
    ...generateY3TimeQuestions(rng, 16),
    ...generateY3AnglesQuestions(rng, 16),
    ...generateY3ShapePropertiesQuestions(rng, 16),
    ...generateY3StatisticsQuestions(rng, 22),
    ...generateY3ReasoningQuestions(rng, 20),
    ...generateY3WordProblemsQuestions(rng, 20),
  ];
}

export function generateAllMathsQuestionsY3Strands2Extra(seed = 73700): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...generateY3LengthMassCapacityQuestions(rng, 14),
    ...generateY3PerimeterQuestions(rng, 14),
    ...generateY3MoneyQuestions(rng, 14),
    ...generateY3TimeQuestions(rng, 14),
    ...generateY3AnglesQuestions(rng, 14),
    ...generateY3ShapePropertiesQuestions(rng, 14),
    ...generateY3StatisticsQuestions(rng, 18),
    ...generateY3ReasoningQuestions(rng, 16),
    ...generateY3WordProblemsQuestions(rng, 16),
  ];
}

// =============================== YEAR 4 =====================================

function generateY4ConvertUnitsQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["km-m", "kg-g", "l-ml", "hour-min", "cm-mm"] as const);
    if (kind === "km-m") {
      const km = randInt(rng, 1, 20);
      out.push(fillInBox({ strandSlug: "measurement", yearGroup: Y4, objectiveCode: "MA4-MEA-1", difficulty: "bronze", promptText: `Convert ${km} km to metres.`, answer: String(km * 1000), explanation: `1 km = 1000 m, so ${km} km = ${km * 1000} m.` }));
    } else if (kind === "kg-g") {
      const kg = randInt(rng, 1, 15);
      out.push(fillInBox({ strandSlug: "measurement", yearGroup: Y4, objectiveCode: "MA4-MEA-1", difficulty: "bronze", promptText: `Convert ${kg} kg to grams.`, answer: String(kg * 1000), explanation: `1 kg = 1000 g, so ${kg} kg = ${kg * 1000} g.` }));
    } else if (kind === "l-ml") {
      const l = randInt(rng, 1, 15);
      out.push(fillInBox({ strandSlug: "measurement", yearGroup: Y4, objectiveCode: "MA4-MEA-1", difficulty: "bronze", promptText: `Convert ${l} litres to millilitres.`, answer: String(l * 1000), explanation: `1 l = 1000 ml, so ${l} l = ${l * 1000} ml.` }));
    } else if (kind === "hour-min") {
      const h = randInt(rng, 1, 6);
      const m = pick(rng, [0, 15, 30, 45] as const);
      out.push(fillInBox({ strandSlug: "measurement", yearGroup: Y4, objectiveCode: "MA4-MEA-1", difficulty: "silver", promptText: `Convert ${h} hours ${m} minutes into minutes.`, answer: String(h * 60 + m), explanation: `${h} hours = ${h * 60} minutes, plus ${m} minutes = ${h * 60 + m} minutes.` }));
    } else {
      const cm = randInt(rng, 1, 50);
      out.push(fillInBox({ strandSlug: "measurement", yearGroup: Y4, objectiveCode: "MA4-MEA-1", difficulty: "bronze", promptText: `Convert ${cm} cm to millimetres.`, answer: String(cm * 10), explanation: `1 cm = 10 mm, so ${cm} cm = ${cm * 10} mm.` }));
    }
  }
  return out;
}

function generateY4PerimeterAreaQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["perimeter", "area-count", "area-multiply"] as const);
    if (kind === "perimeter") {
      const l = randInt(rng, 4, 30);
      const w = randInt(rng, 2, l - 1 > 2 ? l - 1 : 3);
      out.push(fillInBox({ strandSlug: "measurement", yearGroup: Y4, objectiveCode: "MA4-MEA-2", difficulty: "silver", promptText: `A rectangle is ${l} cm long and ${w} cm wide. What is its perimeter?`, answer: String(2 * (l + w)), explanation: `Perimeter = 2 × (${l} + ${w}) = ${2 * (l + w)} cm.` }));
    } else if (kind === "area-count") {
      const squares = randInt(rng, 10, 60);
      out.push(fillInBox({ strandSlug: "measurement", yearGroup: Y4, objectiveCode: "MA4-MEA-3", difficulty: "silver", promptText: `A shape drawn on 1 cm squared paper covers ${squares} whole squares. What is its area?`, answer: String(squares), explanation: `Counting whole squares gives the area directly: ${squares} cm².` }));
    } else {
      const l = randInt(rng, 3, 15);
      const w = randInt(rng, 3, 15);
      out.push(fillInBox({ strandSlug: "measurement", yearGroup: Y4, objectiveCode: "MA4-MEA-3", difficulty: "gold", promptText: `A rectangle is ${l} cm by ${w} cm. What is its area?`, answer: String(l * w), explanation: `Area = ${l} × ${w} = ${l * w} cm².` }));
    }
  }
  return out;
}

function generateY4MoneyEstimateQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const p1 = randInt(rng, 1, 20);
    const pn1 = randInt(rng, 0, 99);
    const p2 = randInt(rng, 1, 20);
    const pn2 = randInt(rng, 0, 99);
    const total = (p1 * 100 + pn1) + (p2 * 100 + pn2);
    out.push(fillInBox({ strandSlug: "measurement", yearGroup: Y4, objectiveCode: "MA4-MEA-4", difficulty: "gold", promptText: `Two items cost £${p1}.${String(pn1).padStart(2, "0")} and £${p2}.${String(pn2).padStart(2, "0")}. What is the total in pence?`, answer: String(total), explanation: `£${p1}.${String(pn1).padStart(2, "0")} = ${p1 * 100 + pn1}p, plus £${p2}.${String(pn2).padStart(2, "0")} = ${p2 * 100 + pn2}p. Total: ${total}p.` }));
  }
  return out;
}

function generateY4TimeQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["24h-to-12h", "12h-to-24h", "duration"] as const);
    if (kind === "24h-to-12h") {
      const h24 = randInt(rng, 13, 23);
      const m = pick(rng, [0, 15, 30, 45] as const);
      const h12 = h24 - 12;
      out.push(fillInBox({ strandSlug: "measurement", yearGroup: Y4, objectiveCode: "MA4-MEA-5", difficulty: "silver", promptText: `Write ${h24}:${String(m).padStart(2, "0")} (24-hour clock) as a 12-hour time (e.g. 3:15 pm).`, answer: `${h12}:${String(m).padStart(2, "0")} pm`, explanation: `${h24}:${String(m).padStart(2, "0")} - 12:00 = ${h12}:${String(m).padStart(2, "0")} pm.` }));
    } else if (kind === "12h-to-24h") {
      const h12 = randInt(rng, 1, 11);
      const m = pick(rng, [0, 15, 30, 45] as const);
      const h24 = h12 + 12;
      out.push(fillInBox({ strandSlug: "measurement", yearGroup: Y4, objectiveCode: "MA4-MEA-5", difficulty: "silver", promptText: `Write ${h12}:${String(m).padStart(2, "0")} pm as a 24-hour time.`, answer: `${h24}:${String(m).padStart(2, "0")}`, explanation: `Adding 12 hours to ${h12}:${String(m).padStart(2, "0")} pm gives ${h24}:${String(m).padStart(2, "0")}.` }));
    } else {
      const startH = randInt(rng, 8, 16);
      const startM = pick(rng, [0, 15, 30, 45] as const);
      const durMin = randInt(rng, 15, 180);
      const totalMin = startH * 60 + startM + durMin;
      const endH = Math.floor(totalMin / 60) % 24;
      const endM = totalMin % 60;
      out.push(fillInBox({ strandSlug: "measurement", yearGroup: Y4, objectiveCode: "MA4-MEA-6", difficulty: "gold", promptText: `A journey starts at ${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")} and lasts ${durMin} minutes. What time (24-hour clock) does it end?`, answer: `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`, explanation: `${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")} + ${durMin} minutes = ${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}.` }));
    }
  }
  return out;
}

function generateY4GeometryQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["angle-classify", "angle-compare", "symmetry", "quadrilateral"] as const);
    if (kind === "angle-classify") {
      const deg = pick(rng, [randInt(rng, 10, 89), randInt(rng, 91, 179)]);
      const name = deg < 90 ? "acute" : "obtuse";
      out.push(mcQuestion(rng, { strandSlug: "geometry", yearGroup: Y4, objectiveCode: "MA4-GEO-2", difficulty: "silver", promptText: `An angle measures ${deg}°. Is it acute or obtuse?`, correct: name, distractors: [name === "acute" ? "obtuse" : "acute", "right angle", "reflex"], explanation: `${deg}° is ${name === "acute" ? "less than 90° (acute)" : "between 90° and 180° (obtuse)"}.` }));
    } else if (kind === "angle-compare") {
      const a = randInt(rng, 10, 175);
      let b = randInt(rng, 10, 175);
      while (b === a) b = randInt(rng, 10, 175);
      const correct = a > b ? `${a}°` : `${b}°`;
      out.push(mcQuestion(rng, { strandSlug: "geometry", yearGroup: Y4, objectiveCode: "MA4-GEO-2", difficulty: "gold", promptText: `Which angle is larger: ${a}° or ${b}°?`, correct, distractors: [`${a}°`, `${b}°`].filter((d) => d !== correct), explanation: `${correct.replace("°", "")} is greater than ${(a > b ? b : a)}.` }));
    } else if (kind === "symmetry") {
      const shapes = [{ n: "square", lines: 4 }, { n: "rectangle (non-square)", lines: 2 }, { n: "equilateral triangle", lines: 3 }, { n: "isosceles triangle", lines: 1 }, { n: "regular pentagon", lines: 5 }, { n: "regular hexagon", lines: 6 }, { n: "circle", lines: 999 }];
      const shape = pick(rng, shapes.slice(0, 6));
      out.push(fillInBox({ strandSlug: "geometry", yearGroup: Y4, objectiveCode: "MA4-GEO-3", difficulty: "silver", promptText: `How many lines of symmetry does a ${shape.n} have?`, answer: String(shape.lines), explanation: `A ${shape.n} has ${shape.lines} line(s) of symmetry.` }));
    } else {
      const quads = [{ n: "square", desc: "4 equal sides and 4 right angles" }, { n: "rectangle", desc: "2 pairs of equal sides and 4 right angles" }, { n: "rhombus", desc: "4 equal sides and no right angles" }, { n: "trapezium", desc: "exactly 1 pair of parallel sides" }, { n: "parallelogram", desc: "2 pairs of parallel sides and no right angles" }];
      const quad = pick(rng, quads);
      out.push(mcQuestion(rng, { strandSlug: "geometry", yearGroup: Y4, objectiveCode: "MA4-GEO-1", difficulty: "gold", promptText: `Which quadrilateral has ${quad.desc}?`, correct: quad.n, distractors: quads.filter((q) => q.n !== quad.n).map((q) => q.n), explanation: `A ${quad.n} is defined by having ${quad.desc}.` }));
    }
  }
  return out;
}

function generateY4PositionQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["coordinates", "translate"] as const);
    if (kind === "coordinates") {
      const x = randInt(rng, 0, 10);
      const y = randInt(rng, 0, 10);
      out.push(fillInBox({ strandSlug: "position-direction", yearGroup: Y4, objectiveCode: "MA4-POS-1", difficulty: "silver", promptText: `A point is ${x} across and ${y} up from the origin. Write its coordinates as (x, y).`, answer: `(${x},${y})`, explanation: `Coordinates are written (x, y): ${x} across, ${y} up gives (${x}, ${y}).` }));
    } else {
      const x = randInt(rng, 0, 8);
      const y = randInt(rng, 0, 8);
      const right = randInt(rng, -4, 4);
      const up = randInt(rng, -4, 4);
      out.push(fillInBox({ strandSlug: "position-direction", yearGroup: Y4, objectiveCode: "MA4-POS-2", difficulty: "gold", promptText: `A point starts at (${x}, ${y}) and is translated ${Math.abs(right)} units ${right >= 0 ? "right" : "left"} and ${Math.abs(up)} units ${up >= 0 ? "up" : "down"}. What are its new coordinates?`, answer: `(${x + right},${y + up})`, explanation: `(${x}${right >= 0 ? "+" : ""}${right}, ${y}${up >= 0 ? "+" : ""}${up}) = (${x + right}, ${y + up}).` }));
    }
  }
  return out;
}

function generateY4StatisticsQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const categorySets = [["Monday", "Tuesday", "Wednesday", "Thursday"], ["Class 4A", "Class 4B", "Class 4C", "Class 4D"], ["Bananas", "Apples", "Oranges", "Pears"], ["Rain (mm)", "Sun (hrs)", "Wind (mph)", "Temp (°C)"]];
  for (let i = 0; i < count; i++) {
    const cats = pick(rng, categorySets);
    const counts = cats.map(() => randInt(rng, 5, 60));
    const total = counts.reduce((a, b) => a + b, 0);
    const listStr = cats.map((c, idx) => `${c}: ${counts[idx]}`).join(", ");
    const kind = pick(rng, ["difference", "total", "average-ish", "compare"] as const);
    if (kind === "difference") {
      const maxIdx = counts.indexOf(Math.max(...counts));
      const minIdx = counts.indexOf(Math.min(...counts));
      out.push(fillInBox({ strandSlug: "statistics", yearGroup: Y4, objectiveCode: "MA4-STAT-2", difficulty: "gold", promptText: `A table shows: ${listStr}. What is the difference between the highest and lowest values?`, answer: String(counts[maxIdx] - counts[minIdx]), explanation: `${counts[maxIdx]} - ${counts[minIdx]} = ${counts[maxIdx] - counts[minIdx]}.` }));
    } else if (kind === "total") {
      out.push(fillInBox({ strandSlug: "statistics", yearGroup: Y4, objectiveCode: "MA4-STAT-2", difficulty: "gold", promptText: `A table shows: ${listStr}. What is the total across all categories?`, answer: String(total), explanation: `${counts.join(" + ")} = ${total}.` }));
    } else if (kind === "average-ish") {
      const idxA = 0;
      const idxB = 1;
      out.push(fillInBox({ strandSlug: "statistics", yearGroup: Y4, objectiveCode: "MA4-STAT-2", difficulty: "gold", promptText: `A table shows: ${listStr}. What is the combined total for ${cats[idxA]} and ${cats[idxB]}?`, answer: String(counts[idxA] + counts[idxB]), explanation: `${counts[idxA]} + ${counts[idxB]} = ${counts[idxA] + counts[idxB]}.` }));
    } else {
      const maxIdx = counts.indexOf(Math.max(...counts));
      out.push(mcQuestion(rng, { strandSlug: "statistics", yearGroup: Y4, objectiveCode: "MA4-STAT-1", difficulty: "silver", promptText: `A table shows: ${listStr}. Which category has the highest value?`, correct: cats[maxIdx], distractors: cats.filter((c) => c !== cats[maxIdx]), explanation: `${cats[maxIdx]} has the highest value (${counts[maxIdx]}).` }));
    }
  }
  return out;
}

function generateY4ReasoningQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["sequence", "missing-number", "multiple-check", "true-false"] as const);
    if (kind === "sequence") {
      const start = randInt(rng, 1, 20);
      const step = randInt(rng, 2, 9);
      const terms = [start, start + step, start + step * 2, start + step * 3];
      out.push(fillInBox({ strandSlug: "reasoning", yearGroup: Y4, objectiveCode: "MA4-REA-1", difficulty: "gold", promptText: `Look at the pattern: ${terms.join(", ")}, ___. What is the next number?`, answer: String(start + step * 4), explanation: `Each term increases by ${step}, so the next number is ${terms[3]} + ${step} = ${start + step * 4}.` }));
    } else if (kind === "missing-number") {
      const b = randInt(rng, 2, 20);
      const result = randInt(rng, 10, 100);
      out.push(fillInBox({ strandSlug: "reasoning", yearGroup: Y4, objectiveCode: "MA4-REA-1", difficulty: "gold", promptText: `I am thinking of a number. If you double it and add ${b}, you get ${result}. What is my number?`, answer: String((result - b) / 2), explanation: `${result} - ${b} = ${result - b}, then ${result - b} ÷ 2 = ${(result - b) / 2}.` }));
    } else if (kind === "multiple-check") {
      const table = randInt(rng, 6, 12);
      const isMultiple = pick(rng, [true, false]);
      const n = isMultiple ? table * randInt(rng, 2, 12) : table * randInt(rng, 2, 12) + randInt(rng, 1, table - 1);
      out.push(mcQuestion(rng, { strandSlug: "reasoning", yearGroup: Y4, objectiveCode: "MA4-REA-1", difficulty: "gold", promptText: `Is ${n} a multiple of ${table}?`, correct: isMultiple ? "Yes" : "No", distractors: [isMultiple ? "No" : "Yes"], explanation: `${n} ÷ ${table} ${isMultiple ? "divides exactly" : "does not divide exactly"}.` }));
    } else {
      const a = randInt(rng, 10, 30);
      const claimedSquare = a * a + (pick(rng, [true, false]) ? 0 : randInt(rng, 1, 20));
      const isTrue = claimedSquare === a * a;
      out.push(mcQuestion(rng, { strandSlug: "reasoning", yearGroup: Y4, objectiveCode: "MA4-REA-1", difficulty: "challenge", promptText: `True or false: ${a} × ${a} = ${claimedSquare}`, correct: isTrue ? "True" : "False", distractors: [isTrue ? "False" : "True"], explanation: `${a} × ${a} = ${a * a}, so the statement is ${isTrue ? "true" : "false"}.` }));
    }
  }
  return out;
}

function generateY4WordProblemsQuestions(rng: Rng, count: number): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const items = ["pencils", "footballs", "raffle tickets", "cupcakes", "postcards", "seeds"];
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["multiply-boxes", "divide-remainder", "two-step", "scaling"] as const);
    const item = pick(rng, items);
    if (kind === "multiply-boxes") {
      const boxes = randInt(rng, 6, 30);
      const each = randInt(rng, 8, 25);
      out.push(fillInBox({ strandSlug: "word-problems", yearGroup: Y4, objectiveCode: "MA4-WP-1", difficulty: "gold", promptText: `A warehouse has ${boxes} boxes of ${item}, with ${each} in each box. How many ${item} are there in total?`, answer: String(boxes * each), explanation: `${boxes} × ${each} = ${boxes * each}.` }));
    } else if (kind === "divide-remainder") {
      const each = randInt(rng, 6, 12);
      const groups = randInt(rng, 3, 9);
      const extra = randInt(rng, 1, each - 1);
      const total = each * groups + extra;
      out.push(fillInBox({ strandSlug: "word-problems", yearGroup: Y4, objectiveCode: "MA4-WP-1", difficulty: "challenge", promptText: `${total} ${item} are packed into bags of ${each}. How many full bags can be made?`, answer: String(groups), explanation: `${total} ÷ ${each} = ${groups} remainder ${extra}, so ${groups} full bags can be made.` }));
    } else if (kind === "two-step") {
      const start = randInt(rng, 200, 900);
      const spent = randInt(rng, 50, 150);
      const earned = randInt(rng, 30, 120);
      out.push(fillInBox({ strandSlug: "word-problems", yearGroup: Y4, objectiveCode: "MA4-WP-1", difficulty: "gold", promptText: `A school has ${start} ${item}. It gives away ${spent} and then receives a donation of ${earned}. How many ${item} does it have now?`, answer: String(start - spent + earned), explanation: `${start} - ${spent} = ${start - spent}, then ${start - spent} + ${earned} = ${start - spent + earned}.` }));
    } else {
      const scale = randInt(rng, 2, 8);
      const baseAmount = randInt(rng, 3, 12);
      out.push(fillInBox({ strandSlug: "word-problems", yearGroup: Y4, objectiveCode: "MA4-WP-1", difficulty: "gold", promptText: `A recipe for 1 person needs ${baseAmount} ${item}. How many are needed for ${scale} people?`, answer: String(baseAmount * scale), explanation: `${baseAmount} × ${scale} = ${baseAmount * scale}.` }));
    }
  }
  return out;
}

export function generateAllMathsQuestionsY4Strands2(seed = 64700): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...generateY4ConvertUnitsQuestions(rng, 18),
    ...generateY4PerimeterAreaQuestions(rng, 16),
    ...generateY4MoneyEstimateQuestions(rng, 12),
    ...generateY4TimeQuestions(rng, 16),
    ...generateY4GeometryQuestions(rng, 20),
    ...generateY4PositionQuestions(rng, 18),
    ...generateY4StatisticsQuestions(rng, 20),
    ...generateY4ReasoningQuestions(rng, 18),
    ...generateY4WordProblemsQuestions(rng, 18),
  ];
}

export function generateAllMathsQuestionsY4Strands2Extra(seed = 74700): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...generateY4ConvertUnitsQuestions(rng, 16),
    ...generateY4PerimeterAreaQuestions(rng, 14),
    ...generateY4MoneyEstimateQuestions(rng, 10),
    ...generateY4TimeQuestions(rng, 14),
    ...generateY4GeometryQuestions(rng, 16),
    ...generateY4PositionQuestions(rng, 14),
    ...generateY4StatisticsQuestions(rng, 16),
    ...generateY4ReasoningQuestions(rng, 14),
    ...generateY4WordProblemsQuestions(rng, 14),
  ];
}
