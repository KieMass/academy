import { createRng, shuffle, type Rng } from "./rng";
import type { DraftQuestion } from "./types";
import type { DifficultyBand } from "@/lib/curriculum/types";
import type { YearGroup } from "@/lib/curriculum/types";

const SUBJECT = "grammar";

/** A distractor bank sometimes only has 2-3 real alternatives (e.g. a
 * homophone set is a closed group of 2-3 words). Rather than a nonsensical
 * numeric-suffix filler (fine for maths, wrong for words), pad with a
 * plausible misspelling of the correct word — visually distinct, clearly
 * "not quite right" without being absurd. */
function misspell(word: string, salt: number): string {
  const letters = word.split("");
  const i = 1 + (salt % Math.max(1, letters.length - 2));
  if (letters.length > 4) {
    [letters[i], letters[i + 1]] = [letters[i + 1], letters[i]]; // transpose two adjacent letters
  } else {
    letters.splice(i, 0, letters[i]); // double a letter
  }
  return letters.join("");
}

/** Builds a shuffled 4-option MCQ from a correct answer + distractor pool,
 * mirroring content-generators/maths.ts's mcQuestion helper. */
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
  let salt = 0;
  while (uniqueDistractors.length < 3) {
    const candidate = misspell(opts.correct, salt++);
    if (candidate !== opts.correct && !uniqueDistractors.includes(candidate)) uniqueDistractors.push(candidate);
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

// ---------------------------------------------------------------------------
// Homophones — sentence template with a blank, correct word vs. its
// homophone(s) plus one unrelated distractor.
// ---------------------------------------------------------------------------
interface HomophoneItem {
  sentence: string; // contains ___
  correct: string;
  distractors: string[];
  explanation: string;
}

const HOMOPHONES_Y5: HomophoneItem[] = [
  { sentence: "___ going to the park later.", correct: "They're", distractors: ["Their", "There"], explanation: "'They're' is a contraction of 'they are'." },
  { sentence: "The dog wagged ___ tail.", correct: "its", distractors: ["it's", "its'"], explanation: "'Its' (no apostrophe) shows possession; 'it's' means 'it is'." },
  { sentence: "___ your turn to choose a game.", correct: "It's", distractors: ["Its", "Its'"], explanation: "'It's' is a contraction of 'it is'." },
  { sentence: "Put the books over ___.", correct: "there", distractors: ["their", "they're"], explanation: "'There' refers to a place." },
  { sentence: "I bought ___ tickets for the show.", correct: "two", distractors: ["to", "too"], explanation: "'Two' is the number 2." },
  { sentence: "Can you come ___?", correct: "too", distractors: ["to", "two"], explanation: "'Too' means 'also' or 'as well'." },
  { sentence: "We walked ___ the tunnel.", correct: "through", distractors: ["threw", "throw"], explanation: "'Through' means moving inside and out the other side." },
  { sentence: "She ___ the ball to her friend.", correct: "threw", distractors: ["through", "throw"], explanation: "'Threw' is the past tense of 'throw'." },
  { sentence: "I can ___ the birds singing.", correct: "hear", distractors: ["here", "heir"], explanation: "'Hear' relates to listening." },
  { sentence: "Come over ___ and sit down.", correct: "here", distractors: ["hear", "heir"], explanation: "'Here' refers to this place." },
  { sentence: "The knight rode his horse at ___.", correct: "night", distractors: ["knight", "nite"], explanation: "'Night' is the time after sunset." },
  { sentence: "The brave ___ fought the dragon.", correct: "knight", distractors: ["night", "nite"], explanation: "A 'knight' is a medieval soldier." },
  { sentence: "We need to buy some more ___.", correct: "wood", distractors: ["would", "wooed"], explanation: "'Wood' is the material trees are made of." },
  { sentence: "I ___ like an ice cream, please.", correct: "would", distractors: ["wood", "wooed"], explanation: "'Would' is a modal verb used for polite requests." },
  { sentence: "Whose ___ is this on the floor?", correct: "coat", distractors: ["cote", "coate"], explanation: "A 'coat' is a piece of outdoor clothing." },
  { sentence: "The children ate their ___ quickly.", correct: "meal", distractors: ["meel", "mele"], explanation: "'Meal' refers to food eaten at one sitting." },
  { sentence: "We must ___ the flowers every day.", correct: "water", distractors: ["watter", "wator"], explanation: "'Water' as a verb means to give water to plants." },
  { sentence: "The weather forecast said it might ___.", correct: "rain", distractors: ["rein", "reign"], explanation: "'Rain' is water falling from the sky." },
  { sentence: "The queen began her ___ in 1952.", correct: "reign", distractors: ["rain", "rein"], explanation: "A 'reign' is the period a monarch rules." },
  { sentence: "Pull on the horse's ___ to stop it.", correct: "rein", distractors: ["rain", "reign"], explanation: "A 'rein' is the strap used to control a horse." },
  { sentence: "The sailors could ___ land in the distance.", correct: "see", distractors: ["sea", "si"], explanation: "'See' relates to sight." },
  { sentence: "The waves crashed against the ___ wall.", correct: "sea", distractors: ["see", "si"], explanation: "'Sea' is a large body of salt water." },
  { sentence: "Did you ___ my new bike?", correct: "see", distractors: ["sea", "si"], explanation: "'See' relates to sight." },
  { sentence: "The ___ of the school gave an assembly.", correct: "head", distractors: ["hed", "hedd"], explanation: "'Head' here means the leader of the school." },
  { sentence: "Is it ___ to run in the corridor?", correct: "allowed", distractors: ["aloud", "aloud'"], explanation: "'Allowed' means permitted." },
  { sentence: "She read the poem out ___.", correct: "aloud", distractors: ["allowed", "alowd"], explanation: "'Aloud' means in a voice that can be heard." },
];

const HOMOPHONES_Y6: HomophoneItem[] = [
  { sentence: "The scarf ___ her outfit perfectly.", correct: "complements", distractors: ["compliments", "complement"], explanation: "'Complements' (with an e) means completes or enhances." },
  { sentence: "He gave her a lovely ___ on her painting.", correct: "compliment", distractors: ["complement", "complements"], explanation: "A 'compliment' (with an i) is a polite expression of praise." },
  { sentence: "The car remained completely ___ in the traffic jam.", correct: "stationary", distractors: ["stationery", "stationarry"], explanation: "'Stationary' (with an a) means not moving." },
  { sentence: "The shop sells notebooks and other ___.", correct: "stationery", distractors: ["stationary", "stationerry"], explanation: "'Stationery' (with an e) refers to writing materials." },
  { sentence: "It is important to ___ your work is neat.", correct: "ensure", distractors: ["insure", "unsure"], explanation: "'Ensure' means to make certain." },
  { sentence: "The family decided to ___ their new house.", correct: "insure", distractors: ["ensure", "unsure"], explanation: "'Insure' relates to arranging financial protection against loss." },
  { sentence: "The ___ addressed the whole school in assembly.", correct: "principal", distractors: ["principle", "principel"], explanation: "The 'principal' (with -pal) is the head of a school." },
  { sentence: "Honesty is an important ___ to live by.", correct: "principle", distractors: ["principal", "principel"], explanation: "A 'principle' (with -ple) is a fundamental rule or belief." },
  { sentence: "She wanted to ___ the piano every day.", correct: "practise", distractors: ["practice", "practiss"], explanation: "'Practise' (with an s) is the verb form in British English." },
  { sentence: "He went to football ___ after school.", correct: "practice", distractors: ["practise", "practiss"], explanation: "'Practice' (with a c) is the noun form in British English." },
  { sentence: "Loud music can ___ your hearing over time.", correct: "affect", distractors: ["effect", "affeckt"], explanation: "'Affect' (verb) means to influence." },
  { sentence: "The medicine had an immediate ___ on her cough.", correct: "effect", distractors: ["affect", "effeckt"], explanation: "'Effect' (noun) means a result." },
  { sentence: "The council will ___ on the new road plans.", correct: "advise", distractors: ["advice", "advize"], explanation: "'Advise' (with an s) is the verb form." },
  { sentence: "She gave me some useful ___ about revising.", correct: "advice", distractors: ["advise", "advize"], explanation: "'Advice' (with a c) is the noun form." },
  { sentence: "I am not sure ___ we should go today.", correct: "whether", distractors: ["weather", "wether"], explanation: "'Whether' introduces a choice between alternatives." },
  { sentence: "The forecast predicts stormy ___ tomorrow.", correct: "weather", distractors: ["whether", "wether"], explanation: "'Weather' refers to atmospheric conditions." },
  { sentence: "The desert stretched for miles without any water.", correct: "desert", distractors: ["dessert", "desert's"], explanation: "A 'desert' (one s) is a dry, barren area of land." },
  { sentence: "For ___, we had chocolate cake.", correct: "dessert", distractors: ["desert", "desert's"], explanation: "'Dessert' (two s's) is a sweet course eaten after a meal." },
  { sentence: "The town ___ voted on the new library.", correct: "council", distractors: ["counsel", "councel"], explanation: "A 'council' (with -cil) is a group that makes decisions for a town or area." },
  { sentence: "The teacher offered to ___ the worried student.", correct: "counsel", distractors: ["council", "councel"], explanation: "To 'counsel' (with -sel) means to give guidance or advice." },
  { sentence: "The detective examined the crime ___ carefully.", correct: "site", distractors: ["sight", "cite"], explanation: "A 'site' is a location or place." },
  { sentence: "Her eye___ had gotten worse over the year.", correct: "sight", distractors: ["site", "cite"], explanation: "'Sight' relates to the ability to see." },
  { sentence: "Remember to ___ your sources in the essay.", correct: "cite", distractors: ["site", "sight"], explanation: "To 'cite' means to quote or reference a source." },
  { sentence: "The medal was made of solid ___.", correct: "steel", distractors: ["steal", "steele"], explanation: "'Steel' is a strong metal." },
  { sentence: "It is wrong to ___ from other people.", correct: "steal", distractors: ["steel", "steele"], explanation: "To 'steal' means to take something without permission." },
  { sentence: "The wedding ___ took place in the garden.", correct: "aisle", distractors: ["isle", "I'll"], explanation: "An 'aisle' is a passage between rows of seats." },
  { sentence: "The ship sailed towards a small ___.", correct: "isle", distractors: ["aisle", "I'll"], explanation: "An 'isle' is a small island." },
];

// ---------------------------------------------------------------------------
// Prefixes — meaning-driven MCQ: which prefix correctly forms a given word.
// ---------------------------------------------------------------------------
interface PrefixItem {
  root: string;
  meaning: string; // e.g. "not honest"
  correct: string; // e.g. "dis-"
  correctWord: string; // e.g. "dishonest"
  distractors: string[];
  explanation: string;
}

const PREFIXES_Y5: PrefixItem[] = [
  { root: "honest", meaning: "not honest", correct: "dis-", correctWord: "dishonest", distractors: ["un-", "in-", "mis-"], explanation: "'Dis-' reverses the meaning: dishonest." },
  { root: "appear", meaning: "to stop being visible", correct: "dis-", correctWord: "disappear", distractors: ["un-", "in-", "mis-"], explanation: "'Dis-' means to reverse or remove: disappear." },
  { root: "happy", meaning: "not happy", correct: "un-", correctWord: "unhappy", distractors: ["dis-", "in-", "mis-"], explanation: "'Un-' is the most common negating prefix: unhappy." },
  { root: "kind", meaning: "not kind", correct: "un-", correctWord: "unkind", distractors: ["dis-", "in-", "mis-"], explanation: "'Un-' negates the root: unkind." },
  { root: "correct", meaning: "not correct", correct: "in-", correctWord: "incorrect", distractors: ["un-", "dis-", "mis-"], explanation: "'In-' negates words like 'correct': incorrect." },
  { root: "visible", meaning: "not visible", correct: "in-", correctWord: "invisible", distractors: ["un-", "dis-", "mis-"], explanation: "'In-' negates 'visible': invisible." },
  { root: "spell", meaning: "spell wrongly", correct: "mis-", correctWord: "misspell", distractors: ["un-", "dis-", "in-"], explanation: "'Mis-' means wrongly or badly: misspell." },
  { root: "understand", meaning: "understand wrongly", correct: "mis-", correctWord: "misunderstand", distractors: ["un-", "dis-", "in-"], explanation: "'Mis-' means wrongly: misunderstand." },
  { root: "heat", meaning: "heat too much", correct: "over-", correctWord: "overheat", distractors: ["under-", "re-", "pre-"], explanation: "'Over-' means too much: overheat." },
  { root: "cooked", meaning: "not cooked enough", correct: "under-", correctWord: "undercooked", distractors: ["over-", "re-", "pre-"], explanation: "'Under-' means not enough: undercooked." },
  { root: "write", meaning: "write again", correct: "re-", correctWord: "rewrite", distractors: ["pre-", "over-", "under-"], explanation: "'Re-' means again: rewrite." },
  { root: "view", meaning: "view before", correct: "pre-", correctWord: "preview", distractors: ["re-", "over-", "under-"], explanation: "'Pre-' means before: preview." },
  { root: "regular", meaning: "not regular", correct: "ir-", correctWord: "irregular", distractors: ["un-", "in-", "dis-"], explanation: "Before 'r', 'in-' becomes 'ir-': irregular." },
  { root: "possible", meaning: "not possible", correct: "im-", correctWord: "impossible", distractors: ["un-", "in-", "dis-"], explanation: "Before 'p', 'in-' becomes 'im-': impossible." },
  { root: "legal", meaning: "not legal", correct: "il-", correctWord: "illegal", distractors: ["un-", "in-", "dis-"], explanation: "Before 'l', 'in-' becomes 'il-': illegal." },
  { root: "agree", meaning: "to not agree", correct: "dis-", correctWord: "disagree", distractors: ["un-", "in-", "mis-"], explanation: "'Dis-' reverses the meaning: disagree." },
];

const PREFIXES_Y6: PrefixItem[] = [
  { root: "responsible", meaning: "not responsible", correct: "ir-", correctWord: "irresponsible", distractors: ["un-", "in-", "dis-"], explanation: "Before 'r', 'in-' becomes 'ir-': irresponsible." },
  { root: "forest", meaning: "clear the trees from an area", correct: "de-", correctWord: "deforest", distractors: ["re-", "un-", "mis-"], explanation: "'De-' means to remove or reverse: deforest." },
  { root: "compress", meaning: "reverse compression", correct: "de-", correctWord: "decompress", distractors: ["re-", "un-", "mis-"], explanation: "'De-' reverses the action: decompress." },
  { root: "sleep", meaning: "sleep for too long", correct: "over-", correctWord: "oversleep", distractors: ["under-", "de-", "re-"], explanation: "'Over-' means too much: oversleep." },
  { root: "react", meaning: "react too strongly", correct: "over-", correctWord: "overreact", distractors: ["under-", "de-", "re-"], explanation: "'Over-' means excessively: overreact." },
  { root: "direct", meaning: "direct wrongly", correct: "mis-", correctWord: "misdirect", distractors: ["dis-", "de-", "un-"], explanation: "'Mis-' means wrongly: misdirect." },
  { root: "information", meaning: "information that is wrong", correct: "mis-", correctWord: "misinformation", distractors: ["dis-", "de-", "un-"], explanation: "'Mis-' means wrongly or incorrectly: misinformation." },
  { root: "qualify", meaning: "to be judged not qualified", correct: "dis-", correctWord: "disqualify", distractors: ["mis-", "de-", "un-"], explanation: "'Dis-' reverses or removes: disqualify." },
  { root: "part", meaning: "not taking sides", correct: "im-", correctWord: "impartial", distractors: ["un-", "in-", "dis-"], explanation: "Before 'p', 'in-' becomes 'im-': impartial." },
  { root: "mature", meaning: "not mature", correct: "im-", correctWord: "immature", distractors: ["un-", "in-", "dis-"], explanation: "Before 'm', 'in-' becomes 'im-': immature." },
  { root: "dict", meaning: "speak against", correct: "contra-", correctWord: "contradict", distractors: ["anti-", "counter-", "de-"], explanation: "'Contra-' means against: contradict." },
  { root: "clockwise", meaning: "against the direction of clock hands", correct: "anti-", correctWord: "anticlockwise", distractors: ["contra-", "counter-", "de-"], explanation: "'Anti-' means against or opposite: anticlockwise." },
  { root: "national", meaning: "between nations", correct: "inter-", correctWord: "international", distractors: ["intra-", "trans-", "sub-"], explanation: "'Inter-' means between: international." },
  { root: "marine", meaning: "underwater", correct: "sub-", correctWord: "submarine", distractors: ["inter-", "trans-", "super-"], explanation: "'Sub-' means under or below: submarine." },
  { root: "atlantic", meaning: "across the Atlantic", correct: "trans-", correctWord: "transatlantic", distractors: ["inter-", "sub-", "super-"], explanation: "'Trans-' means across: transatlantic." },
  { root: "market", meaning: "a very large market", correct: "super-", correctWord: "supermarket", distractors: ["inter-", "trans-", "sub-"], explanation: "'Super-' means above or beyond in size/degree: supermarket." },
];

// ---------------------------------------------------------------------------
// Suffixes — spelling-rule MCQ.
// ---------------------------------------------------------------------------
interface SuffixItem {
  promptText: string;
  correct: string;
  distractors: string[];
  explanation: string;
}

const SUFFIXES_Y5: SuffixItem[] = [
  { promptText: "Which is the correct spelling? (happy + ness)", correct: "happiness", distractors: ["happyness", "happines", "happinesss"], explanation: "Change 'y' to 'i' before adding '-ness': happiness." },
  { promptText: "Which is the correct spelling? (care + ful)", correct: "careful", distractors: ["carful", "carefull", "careeful"], explanation: "Add '-ful' directly: careful (only one 'l')." },
  { promptText: "Which is the correct spelling? (hope + ing)", correct: "hoping", distractors: ["hopeing", "hopping", "hopeng"], explanation: "Drop the silent 'e' before adding '-ing': hoping." },
  { promptText: "Which is the correct spelling? (hop + ing)", correct: "hopping", distractors: ["hoping", "hopeing", "hopng"], explanation: "Double the final consonant after a short vowel: hopping." },
  { promptText: "Which is the correct spelling? (beauty + ful)", correct: "beautiful", distractors: ["beautyful", "beutiful", "beautifull"], explanation: "Change 'y' to 'i' before adding '-ful': beautiful." },
  { promptText: "Which is the correct spelling? (use + able)", correct: "usable", distractors: ["useable", "usible", "usabble"], explanation: "Drop the silent 'e' before adding '-able': usable." },
  { promptText: "Which is the correct spelling? (notice + able)", correct: "noticeable", distractors: ["noticable", "noticeble", "noticabble"], explanation: "Keep the 'e' when it's needed to keep the soft 'c' sound: noticeable." },
  { promptText: "Which is the correct spelling? (sad + ly)", correct: "sadly", distractors: ["saddly", "sadely", "sadily"], explanation: "Add '-ly' directly to most words: sadly." },
  { promptText: "Which is the correct spelling? (gentle + ly)", correct: "gently", distractors: ["gentley", "gentlely", "gentaly"], explanation: "Drop the 'e' before adding '-ly' to words ending in '-le': gently." },
  { promptText: "Which word means 'the act of governing'?", correct: "government", distractors: ["governly", "governness", "governity"], explanation: "'-ment' turns a verb into a noun: government." },
  { promptText: "Which word means 'full of wonder'?", correct: "wonderful", distractors: ["wonderfull", "wonderfil", "wondersome"], explanation: "'-ful' means 'full of': wonderful (one 'l')." },
  { promptText: "Which word means 'without hope'?", correct: "hopeless", distractors: ["hopeliss", "hopelessly", "hopless"], explanation: "'-less' means 'without': hopeless." },
  { promptText: "Which word describes someone who acts, in a play?", correct: "actor", distractors: ["actist", "actee", "actician"], explanation: "'-or' forms a person noun from 'act': actor." },
  { promptText: "Which word means 'the quality of being kind'?", correct: "kindness", distractors: ["kindliness", "kindity", "kindful"], explanation: "'-ness' turns an adjective into a noun: kindness." },
  { promptText: "Which is the correct spelling? (fry + ed)", correct: "fried", distractors: ["fryed", "fryd", "friied"], explanation: "Change 'y' to 'i' before adding '-ed' when preceded by a consonant: fried." },
  { promptText: "Which is the correct spelling? (play + ed)", correct: "played", distractors: ["plaied", "playd", "plaid"], explanation: "Keep the 'y' when preceded by a vowel: played." },
];

const SUFFIXES_Y6: SuffixItem[] = [
  { promptText: "Which is spelled correctly, using '-cious'?", correct: "delicious", distractors: ["delitious", "delicous", "delishous"], explanation: "'-cious' follows roots ending in 'ce': delicious (from delicacy)." },
  { promptText: "Which is spelled correctly, using '-tious'?", correct: "cautious", distractors: ["cautous", "caucious", "cautshus"], explanation: "'-tious' follows the root 'caution': cautious." },
  { promptText: "Which is spelled correctly, using '-cial'?", correct: "official", distractors: ["offitial", "offical", "officious"], explanation: "'-cial' usually follows a root ending in a vowel sound: official." },
  { promptText: "Which is spelled correctly, using '-tial'?", correct: "essential", distractors: ["essencial", "essentual", "essentail"], explanation: "'-tial' usually follows a root ending in a consonant: essential." },
  { promptText: "Which word means 'the act of governing'?", correct: "governance", distractors: ["government", "governency", "governition"], explanation: "'-ance' turns a verb into an abstract noun: governance." },
  { promptText: "Which word means 'able to be measured'?", correct: "measurable", distractors: ["measureable", "measurible", "measurabble"], explanation: "Drop the silent 'e' before '-able': measurable." },
  { promptText: "Which word describes something 'fit to be seen'?", correct: "visible", distractors: ["visable", "viseble", "visabble"], explanation: "'-ible' follows roots that aren't complete words on their own: visible." },
  { promptText: "Which word means 'the state of being pure'?", correct: "purity", distractors: ["pureness", "purety", "puresity"], explanation: "'-ity' turns 'pure' into an abstract noun: purity." },
  { promptText: "Which word describes 'a person who assists'?", correct: "assistant", distractors: ["assistent", "assistint", "assistint"], explanation: "'-ant' forms a person noun after roots like 'assist': assistant." },
  { promptText: "Which word describes 'a person who is present'?", correct: "resident", distractors: ["residant", "residint", "residunt"], explanation: "'-ent' forms this word: resident." },
  { promptText: "Which is spelled correctly? (fascinate + ing)", correct: "fascinating", distractors: ["fascinateing", "fasinating", "facsinating"], explanation: "Drop the silent 'e' before '-ing': fascinating." },
  { promptText: "Which word means 'able to be forgiven'?", correct: "forgivable", distractors: ["forgiveable", "forgivible", "forgivabble"], explanation: "Drop the silent 'e' before '-able': forgivable." },
  { promptText: "Which money-related word is spelled correctly, using '-cial'?", correct: "financial", distractors: ["financail", "financeal", "financious"], explanation: "'-cial' follows the root 'finance': financial." },
  { promptText: "Which word meaning 'private' is spelled correctly, using '-tial'?", correct: "confidential", distractors: ["confidencial", "confidentual", "confidentail"], explanation: "'-tial' follows the root 'confidence' when it ends in a consonant sound: confidential." },
  { promptText: "Which word means 'showing malice'?", correct: "malicious", distractors: ["malitious", "malicous", "malicious'"], explanation: "'-cious' follows the root 'malice': malicious." },
  { promptText: "Which word means 'full of ambition'?", correct: "ambitious", distractors: ["ambitous", "ambicious", "ambitious'"], explanation: "'-tious' follows the root 'ambition': ambitious." },
];

// ---------------------------------------------------------------------------
// Modal verbs — degree-of-possibility / obligation MCQ.
// ---------------------------------------------------------------------------
interface ModalItem {
  sentence: string;
  correct: string;
  distractors: string[];
  explanation: string;
}

const MODALS_Y5: ModalItem[] = [
  { sentence: "You ___ wear a seatbelt in a car — it's the law.", correct: "must", distractors: ["might", "could", "may"], explanation: "'Must' expresses a strong obligation." },
  { sentence: "It ___ rain later, but the forecast isn't sure.", correct: "might", distractors: ["must", "will", "shall"], explanation: "'Might' expresses uncertainty or possibility." },
  { sentence: "___ I borrow your pencil, please?", correct: "May", distractors: ["Must", "Shall", "Will"], explanation: "'May' is used to politely ask permission." },
  { sentence: "The sun ___ rise in the east tomorrow.", correct: "will", distractors: ["might", "could", "may"], explanation: "'Will' expresses certainty about the future." },
  { sentence: "She ___ swim really well when she was younger.", correct: "could", distractors: ["must", "shall", "may"], explanation: "'Could' expresses past ability." },
  { sentence: "We ___ go to the cinema if we finish our homework.", correct: "can", distractors: ["must", "shall", "ought"], explanation: "'Can' expresses permission or ability in this context." },
  { sentence: "You ___ not run near the swimming pool.", correct: "should", distractors: ["will", "can", "may"], explanation: "'Should not' gives strong advice/warning." },
  { sentence: "They ___ arrive at any moment now.", correct: "should", distractors: ["must", "can", "may"], explanation: "'Should' expresses expectation." },
  { sentence: "I ___ finish my homework before dinner.", correct: "must", distractors: ["might", "could", "may"], explanation: "'Must' expresses obligation." },
  { sentence: "It ___ snow later, but I doubt it.", correct: "might", distractors: ["must", "will", "shall"], explanation: "'Might' shows a low degree of possibility." },
  { sentence: "___ we begin the lesson now?", correct: "Shall", distractors: ["Must", "Might", "Could"], explanation: "'Shall' is used to make a suggestion." },
  { sentence: "You ___ always tell the truth.", correct: "should", distractors: ["might", "could", "may"], explanation: "'Should' expresses moral obligation or advice." },
  { sentence: "He ___ be at home by now — it's already 6pm.", correct: "must", distractors: ["might", "could", "may"], explanation: "'Must' here expresses a strong logical certainty." },
  { sentence: "___ you help me carry these bags?", correct: "Could", distractors: ["Must", "Shall", "Ought"], explanation: "'Could' is used to make a polite request." },
  { sentence: "Visitors ___ not feed the animals at the zoo.", correct: "must", distractors: ["might", "could", "may"], explanation: "'Must not' expresses a firm rule or prohibition." },
  { sentence: "We ___ perhaps visit the museum this weekend.", correct: "might", distractors: ["must", "shall", "will"], explanation: "'Might' pairs naturally with 'perhaps' to show uncertainty." },
];

const MODALS_Y6: ModalItem[] = [
  { sentence: "The committee ___ that every member attend the meeting.", correct: "insists", distractors: ["insist", "insisted", "insisting"], explanation: "'Insists that' triggers the subjunctive base form in formal register — but here as a plain verb it agrees with the singular subject 'committee'." },
  { sentence: "___ you possibly consider rescheduling the meeting?", correct: "Could", distractors: ["Can", "Might", "Shall"], explanation: "'Could you possibly...' is a polite, formal request." },
  { sentence: "The bus ___ be delayed — the roads look busy.", correct: "might", distractors: ["must", "will", "shall"], explanation: "'Might' expresses a tentative, weak possibility." },
  { sentence: "The evidence ___ that the theory is correct.", correct: "suggests", distractors: ["suggest", "suggested", "suggesting"], explanation: "The verb agrees with the singular subject 'evidence'." },
  { sentence: "Surely the train ___ have left by now.", correct: "must", distractors: ["might", "could", "may"], explanation: "'Must' combined with 'surely' expresses strong logical certainty." },
  { sentence: "___ I trouble you for a moment of your time?", correct: "May", distractors: ["Can", "Will", "Shall"], explanation: "'May' is the most formal way to request permission." },
  { sentence: "It is ___ that the results will be announced tomorrow.", correct: "likely", distractors: ["likely to", "like", "liking"], explanation: "'It is likely that' is a formal way to express probability." },
  { sentence: "Almost certainly, the bridge ___ be closed for repairs.", correct: "will", distractors: ["might", "could", "may"], explanation: "'Almost certainly' pairs with the strong modal 'will'." },
  { sentence: "Visitors ___ refrain from touching the exhibits.", correct: "should", distractors: ["might", "could", "may"], explanation: "'Should' gives formal guidance or a strong recommendation." },
  { sentence: "The manager requested that the report ___ finished by Friday.", correct: "be", distractors: ["is", "was", "will be"], explanation: "'Requested that' triggers the subjunctive base form 'be' in formal writing." },
  { sentence: "There ___ well be a simpler explanation.", correct: "might", distractors: ["must", "will", "shall"], explanation: "'Might well' expresses a reasonable, moderate possibility." },
  { sentence: "Applicants ___ submit their forms by the deadline.", correct: "must", distractors: ["might", "could", "may"], explanation: "'Must' expresses a firm requirement in formal instructions." },
  { sentence: "Perhaps the weather ___ improve by the weekend.", correct: "will", distractors: ["must", "shall", "ought to"], explanation: "'Perhaps' pairs with 'will' to soften a prediction." },
  { sentence: "The board recommended that the policy ___ reviewed annually.", correct: "be", distractors: ["is", "was", "being"], explanation: "'Recommended that' triggers the subjunctive base form 'be'." },
  { sentence: "It ___ be argued that the plan has flaws.", correct: "could", distractors: ["must", "shall", "will"], explanation: "'Could be argued' introduces a possible counter-view formally." },
  { sentence: "The headteacher insisted that every pupil ___ arrive on time.", correct: "arrive", distractors: ["arrives", "arrived", "arriving"], explanation: "'Insisted that' triggers the subjunctive base form 'arrive', not 'arrives'." },
];

// ---------------------------------------------------------------------------
// Synonyms & antonyms (Y6) — MCQ + matching.
// ---------------------------------------------------------------------------
interface SynAntItem {
  word: string;
  synonym: string;
  antonym: string;
  synonymDistractors: string[];
  antonymDistractors: string[];
}

const SYN_ANT_Y6: SynAntItem[] = [
  { word: "happy", synonym: "delighted", antonym: "miserable", synonymDistractors: ["furious", "exhausted", "anxious"], antonymDistractors: ["cheerful", "content", "thrilled"] },
  { word: "brave", synonym: "courageous", antonym: "cowardly", synonymDistractors: ["cautious", "clever", "calm"], antonymDistractors: ["fearless", "bold", "daring"] },
  { word: "ancient", synonym: "archaic", antonym: "modern", synonymDistractors: ["fragile", "distant", "sacred"], antonymDistractors: ["antique", "historic", "old-fashioned"] },
  { word: "generous", synonym: "charitable", antonym: "stingy", synonymDistractors: ["wealthy", "proud", "humble"], antonymDistractors: ["kind", "giving", "selfless"] },
  { word: "enormous", synonym: "colossal", antonym: "tiny", synonymDistractors: ["narrow", "distant", "heavy"], antonymDistractors: ["huge", "massive", "vast"] },
  { word: "cautious", synonym: "wary", antonym: "reckless", synonymDistractors: ["excited", "curious", "confident"], antonymDistractors: ["careful", "prudent", "watchful"] },
  { word: "genuine", synonym: "authentic", antonym: "fake", synonymDistractors: ["expensive", "rare", "modern"], antonymDistractors: ["real", "honest", "true"] },
  { word: "furious", synonym: "livid", antonym: "calm", synonymDistractors: ["sad", "worried", "confused"], antonymDistractors: ["angry", "annoyed", "irritated"] },
  { word: "reluctant", synonym: "hesitant", antonym: "eager", synonymDistractors: ["confident", "excited", "certain"], antonymDistractors: ["unwilling", "resistant", "doubtful"] },
  { word: "vivid", synonym: "striking", antonym: "dull", synonymDistractors: ["quiet", "gentle", "faded"], antonymDistractors: ["bright", "colourful", "vibrant"] },
  { word: "diligent", synonym: "hardworking", antonym: "lazy", synonymDistractors: ["clever", "friendly", "quiet"], antonymDistractors: ["industrious", "dedicated", "conscientious"] },
  { word: "transparent", synonym: "clear", antonym: "opaque", synonymDistractors: ["shiny", "fragile", "smooth"], antonymDistractors: ["see-through", "obvious", "plain"] },
  { word: "abundant", synonym: "plentiful", antonym: "scarce", synonymDistractors: ["expensive", "useful", "hidden"], antonymDistractors: ["ample", "copious", "generous"] },
  { word: "concise", synonym: "brief", antonym: "lengthy", synonymDistractors: ["confusing", "detailed", "loud"], antonymDistractors: ["short", "succinct", "compact"] },
  { word: "fragile", synonym: "delicate", antonym: "sturdy", synonymDistractors: ["heavy", "expensive", "small"], antonymDistractors: ["brittle", "flimsy", "weak"] },
  { word: "optimistic", synonym: "hopeful", antonym: "pessimistic", synonymDistractors: ["nervous", "proud", "curious"], antonymDistractors: ["positive", "confident", "cheerful"] },
];

// ---------------------------------------------------------------------------
// Verb tenses (regular conjugation drills, MCQ-only) — Y5 & Y6.
// ---------------------------------------------------------------------------
interface TenseItem {
  sentence: string;
  correct: string;
  distractors: string[];
  explanation: string;
}

const TENSES_Y5: TenseItem[] = [
  { sentence: "Yesterday, she ___ to the shop.", correct: "walked", distractors: ["walks", "walking", "will walk"], explanation: "Past simple 'walked' matches 'yesterday'." },
  { sentence: "Right now, he ___ his homework.", correct: "is doing", distractors: ["did", "does", "will do"], explanation: "Present progressive 'is doing' matches 'right now'." },
  { sentence: "Tomorrow, we ___ our grandparents.", correct: "will visit", distractors: ["visited", "visit", "are visiting"], explanation: "'Will visit' expresses a future plan." },
  { sentence: "Every morning, I ___ my teeth.", correct: "brush", distractors: ["brushed", "am brushing", "will brush"], explanation: "Present simple 'brush' matches the habitual 'every morning'." },
  { sentence: "By the time I arrived, the film ___ already started.", correct: "had", distractors: ["has", "was", "will have"], explanation: "Past perfect 'had started' shows this happened before another past event." },
  { sentence: "She ___ football every Saturday.", correct: "plays", distractors: ["played", "is playing", "will play"], explanation: "Present simple for a regular habit." },
  { sentence: "Last week, they ___ a new house.", correct: "bought", distractors: ["buy", "are buying", "will buy"], explanation: "Past simple 'bought' matches 'last week'." },
  { sentence: "Look! The dog ___ across the field.", correct: "is running", distractors: ["ran", "runs", "will run"], explanation: "Present progressive for an action happening now." },
  { sentence: "Next year, she ___ to secondary school.", correct: "will go", distractors: ["went", "goes", "is going"], explanation: "'Will go' expresses a future event." },
  { sentence: "He ___ his bike when it started to rain.", correct: "was riding", distractors: ["rides", "rode", "has ridden"], explanation: "Past progressive 'was riding' shows an ongoing past action interrupted by another." },
  { sentence: "She has ___ that book three times already.", correct: "read", distractors: ["reads", "reading", "readed"], explanation: "Present perfect uses the past participle 'read'." },
  { sentence: "The sun ___ in the east every day.", correct: "rises", distractors: ["rose", "is rising", "will rise"], explanation: "Present simple for a general truth." },
];

const TENSES_Y6: TenseItem[] = [
  { sentence: "She has been ___ the piano for two hours.", correct: "practising", distractors: ["practised", "practise", "practises"], explanation: "Present perfect progressive: 'has been practising'." },
  { sentence: "By the time we arrived, the film had already ___.", correct: "begun", distractors: ["begin", "began", "beginning"], explanation: "Past perfect uses the past participle 'begun'." },
  { sentence: "I have been ___ for two hours already.", correct: "studying", distractors: ["studied", "study", "studies"], explanation: "Present perfect progressive shows an action continuing into the present." },
  { sentence: "She had ___ the report before the meeting even started.", correct: "finished", distractors: ["finish", "finishes", "finishing"], explanation: "Past perfect 'had finished' shows completion before another past event." },
  { sentence: "By next year, they will have ___ here for a decade.", correct: "lived", distractors: ["live", "living", "lives"], explanation: "Future perfect 'will have lived' shows completion by a future point." },
  { sentence: "The bridge ___ being repaired by engineers this week.", correct: "is", distractors: ["was", "has", "had"], explanation: "Present progressive passive uses 'is being'." },
  { sentence: "The statue ___ damaged by vandals overnight.", correct: "was", distractors: ["is", "has been", "had"], explanation: "Simple past passive uses 'was' + past participle." },
  { sentence: "Yesterday, I walked to school and I ___ my friend.", correct: "saw", distractors: ["see", "seeing", "was seeing"], explanation: "Both verbs should stay in the past tense for consistency." },
  { sentence: "The results will have been ___ by Friday.", correct: "announced", distractors: ["announce", "announcing", "announces"], explanation: "Future perfect passive: 'will have been announced'." },
  { sentence: "She ___ been working there for five years when the company closed.", correct: "had", distractors: ["has", "was", "will have"], explanation: "Past perfect progressive: 'had been working'." },
  { sentence: "Engineers are currently ___ the new bridge design.", correct: "testing", distractors: ["tested", "test", "tests"], explanation: "Present progressive shows an action in progress now." },
  { sentence: "If I ___ you, I would apologise.", correct: "were", distractors: ["was", "am", "will be"], explanation: "The subjunctive 'were' is used for hypothetical situations." },
];

function mcFromSentence(rng: Rng, strandSlug: string, yearGroup: YearGroup, objectiveCode: string, difficulty: DifficultyBand, promptPrefix: string, item: { sentence?: string; promptText?: string; correct: string; distractors: string[]; explanation: string }): DraftQuestion {
  const promptText = item.sentence ? `${promptPrefix} '${item.sentence}'` : item.promptText!;
  return mc(rng, { strandSlug, yearGroup, objectiveCode, difficulty, promptText, correct: item.correct, distractors: item.distractors, explanation: item.explanation });
}

export function generateHomophoneQuestions(seed = 71001): DraftQuestion[] {
  const rng = createRng(seed);
  const out: DraftQuestion[] = [];
  const difficulties: DifficultyBand[] = ["bronze", "silver", "silver", "gold"];
  HOMOPHONES_Y5.forEach((item, i) => out.push(mcFromSentence(rng, "homophones", "Y5", "GR5-HOM-1", difficulties[i % difficulties.length], "Which word correctly completes this sentence?", item)));
  HOMOPHONES_Y6.forEach((item, i) => out.push(mcFromSentence(rng, "homophones", "Y6", "GR6-HOM-1", difficulties[i % difficulties.length], "Which word correctly completes this sentence?", item)));
  return out;
}

export function generatePrefixQuestions(seed = 71002): DraftQuestion[] {
  const rng = createRng(seed);
  const out: DraftQuestion[] = [];
  const difficulties: DifficultyBand[] = ["bronze", "silver", "silver", "gold"];
  PREFIXES_Y5.forEach((item, i) =>
    out.push(mc(rng, { strandSlug: "prefixes", yearGroup: "Y5", objectiveCode: "GR5-PRE-1", difficulty: difficulties[i % difficulties.length], promptText: `Which prefix correctly forms a word meaning '${item.meaning}' from '${item.root}'?`, correct: item.correct, distractors: item.distractors, explanation: item.explanation }))
  );
  PREFIXES_Y6.forEach((item, i) =>
    out.push(mc(rng, { strandSlug: "prefixes", yearGroup: "Y6", objectiveCode: "GR6-PRE-1", difficulty: difficulties[i % difficulties.length], promptText: `Which prefix correctly forms a word meaning '${item.meaning}' from '${item.root}'?`, correct: item.correct, distractors: item.distractors, explanation: item.explanation }))
  );
  return out;
}

export function generateSuffixQuestions(seed = 71003): DraftQuestion[] {
  const rng = createRng(seed);
  const out: DraftQuestion[] = [];
  const difficulties: DifficultyBand[] = ["bronze", "silver", "silver", "gold"];
  SUFFIXES_Y5.forEach((item, i) => out.push(mcFromSentence(rng, "suffixes", "Y5", "GR5-SUF-1", difficulties[i % difficulties.length], "", item)));
  SUFFIXES_Y6.forEach((item, i) => out.push(mcFromSentence(rng, "suffixes", "Y6", "GR6-SUF-1", difficulties[i % difficulties.length], "", item)));
  return out;
}

export function generateModalVerbQuestions(seed = 71004): DraftQuestion[] {
  const rng = createRng(seed);
  const out: DraftQuestion[] = [];
  const difficulties: DifficultyBand[] = ["bronze", "silver", "silver", "gold"];
  MODALS_Y5.forEach((item, i) => out.push(mcFromSentence(rng, "modal-verbs", "Y5", "GR5-MOD-1", difficulties[i % difficulties.length], "Which modal verb correctly completes this sentence?", item)));
  MODALS_Y6.forEach((item, i) => out.push(mcFromSentence(rng, "modal-verbs", "Y6", "GR6-MOD-1", ["silver", "gold", "gold", "challenge"][i % 4] as DifficultyBand, "Which word correctly completes this sentence?", item)));
  return out;
}

export function generateVerbTenseQuestions(seed = 71005): DraftQuestion[] {
  const rng = createRng(seed);
  const out: DraftQuestion[] = [];
  const difficultiesY5: DifficultyBand[] = ["bronze", "silver", "silver", "gold"];
  const difficultiesY6: DifficultyBand[] = ["silver", "gold", "gold", "challenge"];
  TENSES_Y5.forEach((item, i) => out.push(mcFromSentence(rng, "verb-tenses", "Y5", "GR5-TEN-1", difficultiesY5[i % 4], "Which correctly completes this sentence?", item)));
  TENSES_Y6.forEach((item, i) => out.push(mcFromSentence(rng, "verb-tenses", "Y6", "GR6-TEN-1", difficultiesY6[i % 4], "Which correctly completes this sentence?", item)));
  return out;
}

export function generateSynonymAntonymQuestions(seed = 71006): DraftQuestion[] {
  const rng = createRng(seed);
  const out: DraftQuestion[] = [];
  const difficulties: DifficultyBand[] = ["silver", "gold", "gold", "challenge"];
  SYN_ANT_Y6.forEach((item, i) => {
    out.push(
      mc(rng, {
        strandSlug: "synonyms-antonyms", yearGroup: "Y6", objectiveCode: "GR6-SYN-1", difficulty: difficulties[i % 4],
        promptText: `Which word is the closest synonym for '${item.word}'?`,
        correct: item.synonym, distractors: item.synonymDistractors,
        explanation: `'${item.synonym}' means the same as '${item.word}'.`,
      })
    );
    out.push(
      mc(rng, {
        strandSlug: "synonyms-antonyms", yearGroup: "Y6", objectiveCode: "GR6-SYN-1", difficulty: difficulties[(i + 1) % 4],
        promptText: `Which word is the opposite (antonym) of '${item.word}'?`,
        correct: item.antonym, distractors: item.antonymDistractors,
        explanation: `'${item.antonym}' means the opposite of '${item.word}'.`,
      })
    );
  });
  return out;
}

/** Runs every procedural grammar generator. Complements the hand-authored
 * content/questions/grammar.json — these strands (homophones, prefixes,
 * suffixes, modal verbs, verb tenses, synonyms/antonyms) lend themselves to
 * a word-bank + sentence-template shape, so scaling them is a matter of
 * growing the tables above rather than hand-writing full question objects. */
export function generateAllGrammarQuestions(): DraftQuestion[] {
  return [
    ...generateHomophoneQuestions(),
    ...generatePrefixQuestions(),
    ...generateSuffixQuestions(),
    ...generateModalVerbQuestions(),
    ...generateVerbTenseQuestions(),
    ...generateSynonymAntonymQuestions(),
  ];
}
