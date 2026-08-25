/**
 * Curriculum-agnostic English grammar/vocabulary data — homophones,
 * prefixes/suffixes, plural rules, verb tenses and synonyms are the same
 * facts about English regardless of which country's curriculum framing
 * wraps around them. See maths-facts.ts's header for the "share the
 * content, not the row" rationale; this is the same layer for Grammar.
 * Plain data tables and pick(rng, ...) helpers, not DraftQuestion objects —
 * the calling generator (e.g. grammar-guyana.ts) supplies its own
 * strandSlug/objectiveCode/yearGroup/phrasing.
 */
import { pick, type Rng } from "../rng";

export interface HomophoneFrame {
  sentence: string;
  correct: string;
  distractors: string[];
}

export const HOMOPHONE_BANK: HomophoneFrame[] = [
  { sentence: "The dogs wagged ___ tails.", correct: "their", distractors: ["there", "they're"] },
  { sentence: "Put the books over ___.", correct: "there", distractors: ["their", "they're"] },
  { sentence: "___ going to be late if we don't hurry.", correct: "They're", distractors: ["Their", "There"] },
  { sentence: "We drove ___ the tunnel.", correct: "through", distractors: ["threw", "thru"] },
  { sentence: "He ___ the ball across the field.", correct: "threw", distractors: ["through", "thru"] },
  { sentence: "Is this ___ coat?", correct: "your", distractors: ["you're"] },
  { sentence: "I think ___ leaving soon.", correct: "you're", distractors: ["your"] },
  { sentence: "I would like two slices, ___.", correct: "too", distractors: ["to", "two"] },
  { sentence: "We are going ___ the shop.", correct: "to", distractors: ["too", "two"] },
  { sentence: "I have ___ pencils.", correct: "two", distractors: ["to", "too"] },
  { sentence: "Please ___ the door quietly.", correct: "close", distractors: ["clothes"] },
  { sentence: "I need new ___ for winter.", correct: "clothes", distractors: ["close"] },
  { sentence: "We saw a ___ in the field.", correct: "hare", distractors: ["hair"] },
  { sentence: "She brushed her ___ before school.", correct: "hair", distractors: ["hare"] },
  { sentence: "The homework is ___ on Friday.", correct: "due", distractors: ["do", "dew"] },
  { sentence: "Morning grass is often covered in ___.", correct: "dew", distractors: ["due", "do"] },
  { sentence: "The knight rode a white ___.", correct: "horse", distractors: ["hoarse"] },
  { sentence: "My voice was ___ after cheering all match.", correct: "hoarse", distractors: ["horse"] },
  { sentence: "Everything in the shop is on ___.", correct: "sale", distractors: ["sail"] },
  { sentence: "The ___ of the ship was torn.", correct: "sail", distractors: ["sale"] },
  { sentence: "He wrote a ___ to his friend.", correct: "letter", distractors: ["litter"] },
  { sentence: "Please don't drop ___ on the ground.", correct: "litter", distractors: ["letter"] },
  { sentence: "We need to ___ the box before we open it.", correct: "weigh", distractors: ["way"] },
  { sentence: "Which ___ did you take to school?", correct: "way", distractors: ["weigh"] },
  { sentence: "She wore a ___ of flowers on her head.", correct: "wreath", distractors: ["reath"] },
  { sentence: "The plural of 'mouse' is ___.", correct: "mice", distractors: ["mise"] },
];

export function pickHomophone(rng: Rng): HomophoneFrame {
  return pick(rng, HOMOPHONE_BANK);
}

export interface AffixFact {
  base: string;
  affix: string;
  whole: string;
  meaning: string;
}

export const PREFIX_BANK: AffixFact[] = [
  { base: "happy", affix: "un-", whole: "unhappy", meaning: "not happy" },
  { base: "kind", affix: "un-", whole: "unkind", meaning: "not kind" },
  { base: "agree", affix: "dis-", whole: "disagree", meaning: "not agree" },
  { base: "like", affix: "dis-", whole: "dislike", meaning: "not like" },
  { base: "appear", affix: "dis-", whole: "disappear", meaning: "stop being visible" },
  { base: "write", affix: "re-", whole: "rewrite", meaning: "write again" },
  { base: "build", affix: "re-", whole: "rebuild", meaning: "build again" },
  { base: "understand", affix: "mis-", whole: "misunderstand", meaning: "understand wrongly" },
  { base: "spell", affix: "mis-", whole: "misspell", meaning: "spell wrongly" },
  { base: "possible", affix: "im-", whole: "impossible", meaning: "not possible" },
  { base: "patient", affix: "im-", whole: "impatient", meaning: "not patient" },
  { base: "correct", affix: "in-", whole: "incorrect", meaning: "not correct" },
  { base: "legal", affix: "il-", whole: "illegal", meaning: "not legal" },
  { base: "regular", affix: "ir-", whole: "irregular", meaning: "not regular" },
];

export const SUFFIX_BANK: AffixFact[] = [
  { base: "hope", affix: "-ful", whole: "hopeful", meaning: "full of hope" },
  { base: "care", affix: "-ful", whole: "careful", meaning: "full of care" },
  { base: "fear", affix: "-less", whole: "fearless", meaning: "without fear" },
  { base: "help", affix: "-less", whole: "helpless", meaning: "without help" },
  { base: "kind", affix: "-ness", whole: "kindness", meaning: "the quality of being kind" },
  { base: "sad", affix: "-ness", whole: "sadness", meaning: "the quality of being sad" },
  { base: "teach", affix: "-er", whole: "teacher", meaning: "someone who teaches" },
  { base: "paint", affix: "-er", whole: "painter", meaning: "someone who paints" },
  { base: "danger", affix: "-ous", whole: "dangerous", meaning: "full of danger" },
  { base: "fame", affix: "-ous", whole: "famous", meaning: "well known" },
  { base: "vision", affix: "-ible", whole: "visible", meaning: "able to be seen" },
  { base: "comfort", affix: "-able", whole: "comfortable", meaning: "giving comfort" },
  { base: "educate", affix: "-ation", whole: "education", meaning: "the process of being educated" },
  { base: "invite", affix: "-ation", whole: "invitation", meaning: "a request to attend" },
];

export function pickPrefix(rng: Rng): AffixFact {
  return pick(rng, PREFIX_BANK);
}
export function pickSuffix(rng: Rng): AffixFact {
  return pick(rng, SUFFIX_BANK);
}

export interface PluralFact {
  singular: string;
  plural: string;
  rule: "add-s" | "add-es" | "y-to-ies" | "f-to-ves" | "irregular";
}

export const PLURAL_BANK: PluralFact[] = [
  { singular: "cat", plural: "cats", rule: "add-s" },
  { singular: "dog", plural: "dogs", rule: "add-s" },
  { singular: "bus", plural: "buses", rule: "add-es" },
  { singular: "box", plural: "boxes", rule: "add-es" },
  { singular: "wish", plural: "wishes", rule: "add-es" },
  { singular: "baby", plural: "babies", rule: "y-to-ies" },
  { singular: "city", plural: "cities", rule: "y-to-ies" },
  { singular: "puppy", plural: "puppies", rule: "y-to-ies" },
  { singular: "leaf", plural: "leaves", rule: "f-to-ves" },
  { singular: "knife", plural: "knives", rule: "f-to-ves" },
  { singular: "child", plural: "children", rule: "irregular" },
  { singular: "mouse", plural: "mice", rule: "irregular" },
  { singular: "person", plural: "people", rule: "irregular" },
  { singular: "tooth", plural: "teeth", rule: "irregular" },
];

export function pickPlural(rng: Rng): PluralFact {
  return pick(rng, PLURAL_BANK);
}

export interface SynonymFact {
  context: string;
  overused: string;
  best: string;
  distractors: string[];
}

export const SYNONYM_BANK: SynonymFact[] = [
  { context: "she said quietly", overused: "said", best: "whispered", distractors: ["shouted", "wrote"] },
  { context: "it was a nice day", overused: "nice", best: "pleasant", distractors: ["boring", "difficult"] },
  { context: "a big house", overused: "big", best: "enormous", distractors: ["small", "narrow"] },
  { context: "he said angrily", overused: "said", best: "snapped", distractors: ["smiled", "asked"] },
  { context: "she walked slowly", overused: "walked", best: "strolled", distractors: ["sprinted", "sat"] },
  { context: "he ran fast", overused: "ran", best: "sprinted", distractors: ["walked", "crawled"] },
  { context: "a good idea", overused: "good", best: "brilliant", distractors: ["terrible", "ordinary"] },
  { context: "she looked sad", overused: "sad", best: "miserable", distractors: ["cheerful", "calm"] },
  { context: "the old bridge", overused: "old", best: "ancient", distractors: ["modern", "new"] },
  { context: "a big crowd", overused: "big", best: "massive", distractors: ["tiny", "scattered"] },
];

export function pickSynonym(rng: Rng): SynonymFact {
  return pick(rng, SYNONYM_BANK);
}

export interface VerbTenseFact {
  sentence: string;
  correct: string;
  nonStandard: string;
}

export const STANDARD_ENGLISH_BANK: VerbTenseFact[] = [
  { sentence: "We ___ at the park yesterday.", correct: "were", nonStandard: "was" },
  { sentence: "I ___ my homework already.", correct: "did", nonStandard: "done" },
  { sentence: "They ___ to the shop.", correct: "ran", nonStandard: "runned" },
  { sentence: "She ___ the answer.", correct: "knew", nonStandard: "knowed" },
  { sentence: "He ___ the ball hard.", correct: "threw", nonStandard: "throwed" },
  { sentence: "You ___ right about that.", correct: "were", nonStandard: "was" },
  { sentence: "They ___ home early.", correct: "went", nonStandard: "goed" },
  { sentence: "We ___ the whole cake.", correct: "ate", nonStandard: "eated" },
  { sentence: "He ___ a mistake earlier.", correct: "made", nonStandard: "maked" },
  { sentence: "They ___ very tired after the match.", correct: "were", nonStandard: "was" },
];

export function pickVerbTense(rng: Rng): VerbTenseFact {
  return pick(rng, STANDARD_ENGLISH_BANK);
}
