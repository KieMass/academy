/**
 * Data-table-driven grammar generators for Y2/Y3/Y4 — a volume top-up
 * alongside the hand-written item banks in grammar-ks1.ts and
 * grammar-lks2.ts. Where a grammar skill reduces to "pick the right
 * word/form from a small option set" (prefixes, suffixes, homophones,
 * conjunctions, possessive apostrophes, plurals...), listing compact data
 * rows and generating 1-2 question variants per row is far faster to author
 * — and just as genuinely varied — as typing out full question objects by
 * hand, the way content-generators/maths.ts uses randomised numbers instead
 * of hand-listing every calculation.
 */
import { createRng, shuffle, type Rng } from "./rng";
import type { DraftQuestion } from "./types";
import type { DifficultyBand, YearGroup } from "@/lib/curriculum/types";

const SUBJECT = "grammar";
const Y2: YearGroup = "Y2";
const Y3: YearGroup = "Y3";
const Y4: YearGroup = "Y4";

function mc(
  rng: Rng,
  opts: { strandSlug: string; yearGroup: YearGroup; objectiveCode: string; difficulty: DifficultyBand; promptText: string; correct: string; distractors: string[]; explanation: string }
): DraftQuestion {
  const uniqueDistractors = [...new Set(opts.distractors.filter((d) => d !== opts.correct))].slice(0, 3);
  const optionTexts = shuffle(rng, [opts.correct, ...uniqueDistractors]);
  const options = optionTexts.map((text, i) => ({ id: `opt${i + 1}`, text }));
  const correctOptionId = options.find((o) => o.text === opts.correct)!.id;
  return { type: "multiple_choice", subjectSlug: SUBJECT, strandSlug: opts.strandSlug, yearGroup: opts.yearGroup, objectiveCode: opts.objectiveCode, difficulty: opts.difficulty, promptText: opts.promptText, explanation: opts.explanation, options, correctOptionId };
}

// =============================== YEAR 3 ======================================

// --- prefixes: negative prefixes (dis-/mis-/im-/il-/ir-) ---
const y3PrefixRows: [string, string, string, string[]][] = [
  // [base word, correct prefix, correct whole word, wrong prefixes]
  ["agree", "dis", "disagree", ["mis", "un", "im"]],
  ["obey", "dis", "disobey", ["im", "il", "ir"]],
  ["trust", "dis", "distrust", ["im", "il", "ir"]],
  ["appear", "dis", "disappear", ["mis", "im", "un"]],
  ["honest", "dis", "dishonest", ["im", "un", "ir"]],
  ["like", "dis", "dislike", ["im", "il", "ir"]],
  ["connect", "dis", "disconnect", ["mis", "un", "im"]],
  ["spell", "mis", "misspell", ["dis", "un", "re"]],
  ["behave", "mis", "misbehave", ["dis", "un", "re"]],
  ["understand", "mis", "misunderstand", ["dis", "un", "re"]],
  ["lead", "mis", "mislead", ["dis", "un", "re"]],
  ["place", "mis", "misplace", ["dis", "un", "re"]],
  ["count", "mis", "miscount", ["dis", "un", "re"]],
  ["possible", "im", "impossible", ["dis", "un", "il"]],
  ["mature", "im", "immature", ["dis", "un", "il"]],
  ["patient", "im", "impatient", ["dis", "un", "il"]],
  ["perfect", "im", "imperfect", ["dis", "un", "il"]],
  ["polite", "im", "impolite", ["dis", "un", "il"]],
  ["legal", "il", "illegal", ["dis", "im", "ir"]],
  ["literate", "il", "illiterate", ["dis", "im", "ir"]],
  ["logical", "il", "illogical", ["dis", "im", "ir"]],
  ["legible", "il", "illegible", ["dis", "im", "ir"]],
  ["regular", "ir", "irregular", ["dis", "im", "il"]],
  ["responsible", "ir", "irresponsible", ["dis", "im", "il"]],
  ["relevant", "ir", "irrelevant", ["dis", "im", "il"]],
];
function y3Prefixes(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [base, prefix, whole, wrongPrefixes] of y3PrefixRows) {
    out.push(mc(rng, { strandSlug: "prefixes", yearGroup: Y3, objectiveCode: "GR3-PRE-1", difficulty: "bronze", promptText: `Which prefix correctly completes: ___${base} to mean "not ${base}"?`, correct: `${prefix}-`, distractors: wrongPrefixes.map((p) => `${p}-`), explanation: `Adding "${prefix}-" to "${base}" gives "${whole}".` }));
    out.push(mc(rng, { strandSlug: "prefixes", yearGroup: Y3, objectiveCode: "GR3-PRE-1", difficulty: "silver", promptText: `Which word means "not ${base}"?`, correct: whole, distractors: wrongPrefixes.map((p) => `${p}${base}`), explanation: `"${prefix}-" added to "${base}" gives "${whole}", meaning "not ${base}".` }));
  }
  return out;
}

// --- suffixes: nouns (-ation/-or/-er/-sion) ---
const y3NounSuffixRows: [string, string, string][] = [
  ["educate", "-ation", "education"], ["invite", "-ation", "invitation"], ["inform", "-ation", "information"],
  ["celebrate", "-ation", "celebration"], ["explore", "-ation", "exploration"], ["imagine", "-ation", "imagination"],
  ["direct", "-or", "director"], ["visit", "-or", "visitor"], ["invent", "-or", "inventor"], ["act", "-or", "actor"],
  ["teach", "-er", "teacher"], ["paint", "-er", "painter"], ["farm", "-er", "farmer"], ["build", "-er", "builder"],
  ["confuse", "-sion", "confusion"], ["decide", "-sion", "decision"], ["explode", "-sion", "explosion"],
];
function y3NounSuffixes(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const suffixPool = ["-ation", "-or", "-er", "-sion"];
  for (const [base, suffix, whole] of y3NounSuffixRows) {
    out.push(mc(rng, { strandSlug: "suffixes", yearGroup: Y3, objectiveCode: "GR3-SUF-1", difficulty: "bronze", promptText: `Which suffix turns "${base}" into a noun?`, correct: suffix, distractors: suffixPool.filter((s) => s !== suffix), explanation: `Adding "${suffix}" to "${base}" gives the noun "${whole}".` }));
  }
  return out;
}

// --- suffixes: adjectives (-ful/-less/-ous/-ian) ---
const y3AdjSuffixRows: [string, string, string, string][] = [
  ["wonder", "-ful", "wonderful", "full of wonder"], ["fear", "-less", "fearless", "without fear"],
  ["danger", "-ous", "dangerous", "full of danger"], ["Egypt", "-ian", "Egyptian", "from Egypt"],
  ["joy", "-ous", "joyous", "full of joy"], ["hope", "-ful", "hopeful", "full of hope"],
  ["care", "-less", "careless", "without care"], ["nerve", "-ous", "nervous", "full of nerves"],
  ["skill", "-ful", "skilful", "full of skill"], ["shape", "-less", "shapeless", "without shape"],
  ["humour", "-ous", "humorous", "full of humour"], ["Canada", "-ian", "Canadian", "from Canada"],
  ["thank", "-ful", "thankful", "full of thanks"], ["home", "-less", "homeless", "without a home"],
  ["fame", "-ous", "famous", "well known"],
];
function y3AdjSuffixes(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [base, suffix, whole, meaning] of y3AdjSuffixRows) {
    out.push(mc(rng, { strandSlug: "suffixes", yearGroup: Y3, objectiveCode: "GR3-SUF-2", difficulty: "silver", promptText: `Which word means "${meaning}", formed from "${base}"?`, correct: whole, distractors: ["-ful", "-less", "-ous", "-ian"].filter((s) => s !== suffix).map((s) => `${base}${s}`), explanation: `Adding "${suffix}" to "${base}" gives "${whole}", meaning "${meaning}".` }));
  }
  return out;
}

// --- coordination-subordination: wider conjunctions ---
const y3ConjunctionRows: [string, string, string[]][] = [
  ["We ___ the picnic because it started to rain.", "cancelled", []],
  ["I will text you ___ I arrive at the station.", "when", []],
];
const y3ConjunctionFrames: [string, string, string[]][] = [
  ["We stayed at the beach ___ the tide was coming in.", "although", ["because", "when", "or"]],
  ["Take a torch ___ the power goes out.", "if", ["because", "although", "or"]],
  ["The dog barked ___ a stranger knocked.", "when", ["although", "if", "or"]],
  ["She apologised ___ she had made a mistake.", "because", ["although", "if", "or"]],
  ["We can walk ___ take the shortcut through the woods.", "or", ["because", "although", "if"]],
  ["He finished the race ___ his shoe had come untied.", "although", ["because", "if", "or"]],
  ["I'll water the plants ___ you're away.", "while", ["because", "or", "if"]],
  ["We waited under the tree ___ the storm passed.", "until", ["because", "or", "although"]],
  ["The museum was closed ___ it was a public holiday.", "because", ["although", "if", "or"]],
  ["You can borrow my bike ___ you return it by five.", "if", ["because", "although", "or"]],
  ["They kept playing ___ the whistle blew.", "until", ["because", "or", "if"]],
  ["She read quietly ___ her brother watched television.", "while", ["because", "if", "or"]],
  ["We'll go to the park ___ it's sunny tomorrow.", "if", ["because", "although", "or"]],
  ["He passed the test ___ he hadn't studied much.", "although", ["because", "if", "or"]],
  ["The plane was delayed ___ the fog was heavy.", "because", ["although", "if", "or"]],
];
function y3Conjunctions(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [sentence, correct, distractors] of y3ConjunctionFrames) {
    out.push(mc(rng, { strandSlug: "coordination-subordination", yearGroup: Y3, objectiveCode: "GR3-COORD-1", difficulty: "silver", promptText: `Which word correctly completes: '${sentence}'`, correct, distractors, explanation: `"${correct[0].toUpperCase()}${correct.slice(1)}" is the conjunction that best fits the meaning of the sentence.` }));
  }
  return out;
}

// --- cohesion: time/place/cause words ---
const y3CohesionFrames: [string, string, string[]][] = [
  ["The bell rang ___ the lesson began.", "before", ["under", "so", "therefore"]],
  ["We hid the presents ___ the wardrobe.", "inside", ["so", "then", "because"]],
  ["It was cold, ___ we wore extra jumpers.", "so", ["under", "before", "during"]],
  ["The library is ___ the town hall.", "opposite", ["so", "then", "because"]],
  ["He trained hard, ___ he won the race.", "so", ["under", "before", "during"]],
  ["We ate breakfast ___ we left for school.", "before", ["under", "so", "therefore"]],
  ["The treasure was buried ___ the old oak tree.", "beneath", ["so", "then", "because"]],
  ["She was nervous ___ it was her first performance.", "because", ["during", "then", "there"]],
  ["We packed umbrellas ___ it might rain.", "because", ["during", "then", "there"]],
  ["The shop closes ___ six o'clock.", "at", ["so", "because", "then"]],
  ["___ the interval, the audience bought snacks.", "During", ["Before", "Because", "There"]],
  ["We tidied the classroom ___ the visitors arrived.", "before", ["under", "so", "because"]],
  ["The cat slept ___ the warm radiator.", "beside", ["so", "then", "because"]],
  ["He was exhausted ___ he had run a marathon.", "because", ["during", "then", "there"]],
  ["We waited ___ the bus arrived.", "until", ["under", "so", "because"]],
  ["The keys were hidden ___ the plant pot.", "under", ["so", "then", "because"]],
];
function y3Cohesion(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [sentence, correct, distractors] of y3CohesionFrames) {
    out.push(mc(rng, { strandSlug: "cohesion", yearGroup: Y3, objectiveCode: "GR3-COH-1", difficulty: "bronze", promptText: `Which word correctly completes: '${sentence}'`, correct, distractors, explanation: `"${correct}" correctly expresses the time, place or cause relationship in the sentence.` }));
  }
  return out;
}

export function generateAllGrammarQuestionsY3Wordbanks(seed = 133001): DraftQuestion[] {
  const rng = createRng(seed);
  return [...y3Prefixes(rng), ...y3NounSuffixes(rng), ...y3AdjSuffixes(rng), ...y3Conjunctions(rng), ...y3Cohesion(rng)];
}

// =============================== YEAR 4 ======================================

// --- verb-tenses: standard English forms ---
const y4StandardEnglishRows: [string, string, string][] = [
  ["We ___ at the park yesterday.", "were", "was"], ["I ___ my homework already.", "did", "done"],
  ["They ___ to the shop.", "ran", "runned"], ["She ___ the answer.", "knew", "knowed"],
  ["We ___ that film before.", "have seen", "seen"], ["He ___ the ball hard.", "threw", "throwed"],
  ["You ___ right about that.", "were", "was"], ["I ___ my keys somewhere.", "have lost", "lost, have"],
  ["They ___ home early.", "went", "goed"], ["We ___ the whole cake.", "ate", "eated"],
  ["She ___ the fastest in the class.", "is", "be"], ["He ___ a mistake earlier.", "made", "maked"],
  ["We ___ swimming last summer.", "went", "goed"], ["I ___ that song before.", "have heard", "heared"],
  ["They ___ very tired after the match.", "were", "was"], ["She ___ her project on time.", "finished", "finish"],
];
function y4StandardEnglish(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [sentence, correct, wrong] of y4StandardEnglishRows) {
    out.push(mc(rng, { strandSlug: "verb-tenses", yearGroup: Y4, objectiveCode: "GR4-TEN-1", difficulty: "silver", promptText: `Which fills the gap in standard English: '${sentence}'`, correct, distractors: [wrong], explanation: `Standard English uses "${correct}", not the non-standard "${wrong}".` }));
  }
  return out;
}

// --- suffixes: -ly adverbs with spelling changes ---
const y4LySuffixRows: [string, string][] = [
  ["happy", "happily"], ["gentle", "gently"], ["careful", "carefully"], ["quick", "quickly"],
  ["angry", "angrily"], ["simple", "simply"], ["easy", "easily"], ["sudden", "suddenly"],
  ["true", "truly"], ["whole", "wholly"], ["busy", "busily"], ["heavy", "heavily"],
  ["responsible", "responsibly"], ["comfortable", "comfortably"], ["noble", "nobly"],
];
function y4LySuffixes(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [base, adverb] of y4LySuffixRows) {
    out.push(mc(rng, { strandSlug: "suffixes", yearGroup: Y4, objectiveCode: "GR4-SUF-1", difficulty: "silver", promptText: `Which word correctly turns "${base}" into an adverb?`, correct: adverb, distractors: [`${base}ly`, `${base}ely`, `${base}fully`], explanation: `"${base}" becomes "${adverb}" when the "-ly" suffix is added (with any spelling change needed).` }));
  }
  return out;
}

// --- homophones ---
const y4HomophoneFrames: [string, string, string[]][] = [
  ["The dogs wagged ___ tails.", "their", ["there", "they're"]],
  ["Put the books over ___.", "there", ["their", "they're"]],
  ["___ going to be late if we don't hurry.", "They're", ["Their", "There"]],
  ["We drove ___ the tunnel.", "through", ["threw", "thru"]],
  ["He ___ the ball across the field.", "threw", ["through", "thru"]],
  ["Is this ___ coat?", "your", ["you're"]],
  ["I think ___ leaving soon.", "you're", ["your"]],
  ["I would like two slices, ___.", "too", ["to", "two"]],
  ["We are going ___ the shop.", "to", ["too", "two"]],
  ["I have ___ pencils.", "two", ["to", "too"]],
  ["The weather affects our ___.", "mood", ["mooed"]],
  ["Please ___ the door quietly.", "close", ["clothes"]],
  ["I need new ___ for winter.", "clothes", ["close"]],
  ["The knight wore a suit of ___.", "armour", ["armor"]],
  ["We saw a ___ in the field.", "hare", ["hair"]],
  ["She brushed her ___ before school.", "hair", ["hare"]],
  ["The ___ of the ship was broken.", "sail", ["sale"]],
  ["Everything in the shop is on ___.", "sale", ["sail"]],
  ["He wrote a ___ to his friend.", "letter", ["litter"]],
  ["Please don't drop ___ on the ground.", "litter", ["letter"]],
  ["We need to ___ the box before we open it.", "weigh", ["way"]],
  ["Which ___ did you take to school?", "way", ["weigh"]],
  ["The knight rode a white ___.", "horse", ["hoarse"]],
  ["My voice was ___ after cheering all match.", "hoarse", ["horse"]],
  ["Please ___ me a favour.", "do", ["due", "dew"]],
  ["The homework is ___ on Friday.", "due", ["do", "dew"]],
  ["Morning grass is often covered in ___.", "dew", ["due", "do"]],
  ["She wore a ___ of flowers on her head.", "wreath", ["reath"]],
  ["The plural of 'mouse' is ___.", "mice", ["mise"]],
  ["A group of wolves is called a ___.", "pack", ["pact"]],
];
function y4Homophones(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [sentence, correct, distractors] of y4HomophoneFrames) {
    out.push(mc(rng, { strandSlug: "homophones", yearGroup: Y4, objectiveCode: "GR4-HOM-1", difficulty: "silver", promptText: `Which word correctly completes: '${sentence}'`, correct, distractors, explanation: `"${correct}" is the correct homophone for this sentence's meaning.` }));
  }
  return out;
}

// --- synonyms-antonyms: replacing overused words ---
const y4SynonymFrames: [string, string, string, string[]][] = [
  ["she said quietly", "said", "whispered", ["said", "shouted", "wrote"]],
  ["it was a nice day", "nice", "pleasant", ["nice", "boring", "difficult"]],
  ["she did a good job", "good", "excellent", ["good", "average", "poor"]],
  ["a big house", "big", "enormous", ["big", "small", "narrow"]],
  ["he said angrily", "said", "snapped", ["said", "smiled", "asked"]],
  ["a nice meal", "nice", "delicious", ["nice", "bland", "cold"]],
  ["it was a big storm", "big", "ferocious", ["big", "gentle", "quiet"]],
  ["she walked slowly", "walked", "strolled", ["walked", "sprinted", "sat"]],
  ["a good friend", "good", "loyal", ["good", "distant", "strange"]],
  ["he ran fast", "ran", "sprinted", ["ran", "walked", "crawled"]],
  ["a big mistake", "big", "significant", ["big", "tiny", "minor"]],
  ["she looked sad", "sad", "miserable", ["sad", "cheerful", "calm"]],
  ["the small kitten", "small", "tiny", ["small", "huge", "average"]],
  ["a good idea", "good", "brilliant", ["good", "terrible", "ordinary"]],
  ["he was happy", "happy", "delighted", ["happy", "furious", "bored"]],
  ["a nice smell", "nice", "fragrant", ["nice", "foul", "faint"]],
  ["the old bridge", "old", "ancient", ["old", "modern", "new"]],
  ["a big crowd", "big", "massive", ["big", "tiny", "scattered"]],
];
function y4Synonyms(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [context, overused, best, options] of y4SynonymFrames) {
    out.push(mc(rng, { strandSlug: "synonyms-antonyms", yearGroup: Y4, objectiveCode: "GR4-SYN-1", difficulty: "silver", promptText: `Which is the best synonym for the overused word "${overused}" in "${context}"?`, correct: best, distractors: options.filter((o) => o !== best), explanation: `"${best}" is a more precise, less overused alternative to "${overused}".` }));
  }
  return out;
}

// --- apostrophes: plural possession ---
const y4PluralPossessionRows: [string, string, string][] = [
  // [plural noun, thing possessed, note if irregular singular form to contrast]
  ["dogs", "toy", "regular"], ["schools", "playground", "regular"], ["girls", "names", "regular"],
  ["players", "kits", "regular"], ["teachers", "classroom", "regular"], ["birds", "nests", "regular"],
  ["farmers", "fields", "regular"], ["parents", "cars", "regular"], ["students", "books", "regular"],
  ["children", "den", "irregular"], ["men", "coats", "irregular"], ["women", "meeting", "irregular"],
  ["mice", "tails", "irregular"], ["people", "voices", "irregular"],
];
function y4PluralPossession(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [plural, thing, kind] of y4PluralPossessionRows) {
    const correct = kind === "regular" ? `the ${plural}' ${thing}` : `the ${plural}'s ${thing}`;
    const distractors = kind === "regular"
      ? [`the ${plural}'s ${thing}`, `the ${plural.slice(0, -1)}'s ${thing}`, `the ${plural} ${thing}`]
      : [`the ${plural}s' ${thing}`, `the ${plural}s's ${thing}`, `the ${plural} ${thing}`];
    out.push(mc(rng, { strandSlug: "apostrophes", yearGroup: Y4, objectiveCode: "GR4-APOS-1", difficulty: "gold", promptText: `Which correctly shows that the ${thing} belongs to more than one ${kind === "regular" ? plural.slice(0, -1) : plural === "children" ? "child" : plural === "men" ? "man" : plural === "women" ? "woman" : plural === "mice" ? "mouse" : "person"}?`, correct, distractors, explanation: kind === "regular" ? `For a regular plural noun ending in 's', the apostrophe goes after the 's': ${plural}' ${thing}.` : `"${plural}" is an irregular plural (it doesn't end in 's'), so it takes apostrophe + s, just like a singular noun: ${plural}'s.` }));
  }
  return out;
}

// --- fronted-adverbials: comma placement ---
const y4FrontedAdverbialFrames: [string, string, string][] = [
  ["Later that day", "I heard the bad news.", "Later that day, I heard the bad news."],
  ["Without warning", "the fire alarm rang loudly.", "Without warning, the fire alarm rang loudly."],
  ["Slowly and carefully", "she opened the ancient box.", "Slowly and carefully, she opened the ancient box."],
  ["Every morning before school", "Leo feeds his rabbit.", "Every morning before school, Leo feeds his rabbit."],
  ["Beyond the old bridge", "a river flowed silently.", "Beyond the old bridge, a river flowed silently."],
  ["In the blink of an eye", "the magician vanished.", "In the blink of an eye, the magician vanished."],
  ["After a long journey", "we finally arrived home.", "After a long journey, we finally arrived home."],
  ["Deep in the forest", "an owl hooted.", "Deep in the forest, an owl hooted."],
  ["With great excitement", "the children opened their presents.", "With great excitement, the children opened their presents."],
  ["Just before sunrise", "the fishermen set sail.", "Just before sunrise, the fishermen set sail."],
  ["High above the clouds", "the plane soared smoothly.", "High above the clouds, the plane soared smoothly."],
  ["Underneath the old floorboards", "they found a hidden box.", "Underneath the old floorboards, they found a hidden box."],
  ["As quick as a flash", "the cat leapt onto the fence.", "As quick as a flash, the cat leapt onto the fence."],
  ["Without a second thought", "she dived into the pool.", "Without a second thought, she dived into the pool."],
  ["Once upon a time", "there lived a curious fox.", "Once upon a time, there lived a curious fox."],
];
function y4FrontedAdverbials(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [opener, rest, correct] of y4FrontedAdverbialFrames) {
    out.push(mc(rng, { strandSlug: "fronted-adverbials", yearGroup: Y4, objectiveCode: "GR4-FA-1", difficulty: "silver", promptText: `Which sentence correctly punctuates the fronted adverbial "${opener}"?`, correct, distractors: [`${opener} ${rest}`, `${opener}; ${rest}`, `${rest} ${opener}.`], explanation: `A fronted adverbial like "${opener}" needs a comma straight after it.` }));
  }
  return out;
}

// --- commas: after fronted adverbials (short form) ---
const y4CommaFrames: [string, string][] = [
  ["Suddenly", "the lights went out."], ["Eventually", "the storm passed."], ["Meanwhile", "back at the ranch, the horses grazed."],
  ["Nearby", "a dog began to bark."], ["Fortunately", "no one was hurt."], ["Unfortunately", "the shop had already closed."],
  ["Yesterday afternoon", "we visited the museum."], ["At long last", "the rain stopped."],
  ["From that moment on", "everything changed."], ["To everyone's surprise", "she won the competition."],
];
function y4Commas(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [opener, rest] of y4CommaFrames) {
    const correct = `${opener}, ${rest}`;
    out.push(mc(rng, { strandSlug: "commas", yearGroup: Y4, objectiveCode: "GR4-COM-1", difficulty: "bronze", promptText: `Which sentence correctly punctuates the fronted adverbial "${opener}"?`, correct, distractors: [`${opener} ${rest}`, `${opener}; ${rest}`, `${opener}. ${rest}`], explanation: `A comma goes straight after the fronted adverbial "${opener}".` }));
  }
  return out;
}

// --- expanded-noun-phrases ---
const y4NounPhraseRows: [string, string, string][] = [
  ["wolf", "the huge, hungry wolf with sharp teeth", "the wolf"],
  ["garden", "the overgrown garden behind the old cottage", "the garden"],
  ["girl", "the girl in the red coat", "the girl"],
  ["dragon", "the enormous, fire-breathing dragon in the cave", "the dragon"],
  ["ship", "the battered old ship with torn sails", "the ship"],
  ["forest", "the dark, silent forest beyond the hills", "the forest"],
  ["market", "the busy, colourful market in the old town", "the market"],
  ["detective", "the sharp-eyed detective with the magnifying glass", "the detective"],
  ["storm", "the violent, howling storm over the harbour", "the storm"],
  ["palace", "the grand, glittering palace at the end of the road", "the palace"],
];
function y4NounPhrases(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [noun, expanded, plain] of y4NounPhraseRows) {
    out.push(mc(rng, { strandSlug: "expanded-noun-phrases", yearGroup: Y4, objectiveCode: "GR4-ENP-1", difficulty: "silver", promptText: `Which is the most expanded noun phrase describing a ${noun}?`, correct: expanded, distractors: [plain, `a ${noun}`, `${plain.replace("the ", "")} ${noun}`], explanation: `Modifying adjectives and a preposition phrase all expand the noun "${noun}" in "${expanded}".` }));
  }
  return out;
}

// --- direct-speech: reporting clause placement ---
const y4DirectSpeechRows: [string, string, string][] = [
  ["I'll be there at six.", "she", "said"], ["This is my favourite place.", "Tom", "whispered"],
  ["We should leave now.", "the captain", "announced"], ["I can't believe it.", "Priya", "gasped"],
  ["That was incredible.", "Marcus", "exclaimed"], ["Please be careful.", "her mother", "warned"],
  ["I'm not sure about this.", "he", "muttered"], ["We won the match!", "the coach", "shouted"],
];
function y4DirectSpeechReporting(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [line, speaker, verb] of y4DirectSpeechRows) {
    const correct = `"${line}" ${speaker} ${verb}.`;
    out.push(mc(rng, { strandSlug: "direct-speech", yearGroup: Y4, objectiveCode: "GR4-DS-1", difficulty: "gold", promptText: `Which sentence correctly punctuates speech that comes before the reporting clause: "${line}" said by ${speaker}?`, correct, distractors: [`"${line}." ${speaker} ${verb}.`, `"${line},\" ${speaker[0].toUpperCase()}${speaker.slice(1)} ${verb}.`, `"${line}", ${speaker} ${verb}.`], explanation: `A comma (not a full stop) goes inside the inverted commas when the reporting clause follows the speech.` }));
  }
  return out;
}

// --- cohesion: pronoun/noun choice to avoid repetition ---
const y4CohesionRows: [string, string, string][] = [
  ["Maria packed Maria's bag. Maria left for the airport.", "Maria packed her bag. She left for the airport.", "Maria's/Maria repeated too often"],
  ["The dog chased the ball. The dog caught the ball easily.", "The dog chased the ball. It caught it easily.", "'the dog'/'the ball' repeated"],
  ["The old oak tree stood in the field. The old oak tree had stood there for 200 years.", "The old oak tree stood in the field. It had stood there for 200 years.", "'the old oak tree' repeated"],
  ["Sam finished Sam's lunch. Sam went outside to play.", "Sam finished his lunch. He went outside to play.", "'Sam' repeated too often"],
  ["The children ran to the playground. The children loved the new slide.", "The children ran to the playground. They loved the new slide.", "'the children' repeated"],
  ["Priya opened Priya's book. Priya began to read.", "Priya opened her book. She began to read.", "'Priya' repeated too often"],
  ["The kite flew high. The kite dipped and swooped in the wind.", "The kite flew high. It dipped and swooped in the wind.", "'the kite' repeated"],
  ["The twins shared the twins' toys. The twins played happily.", "The twins shared their toys. They played happily.", "'the twins' repeated too often"],
];
function y4Cohesion(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [original, improved, issue] of y4CohesionRows) {
    out.push(mc(rng, { strandSlug: "cohesion", yearGroup: Y4, objectiveCode: "GR4-COH-1", difficulty: "silver", promptText: `Which version avoids repetition: '${original}'?`, correct: improved, distractors: [original, original.replace(/\./g, ", and."), `It ${improved.split(". ")[1] ?? improved}`], explanation: `The improved version replaces repeated nouns/names with pronouns, fixing the issue that ${issue}.` }));
  }
  return out;
}

// --- layout-devices: paragraphing around a theme ---
const y4ThemeRows: [string, string[]][] = [
  ["a report on tigers", ["habitat", "diet", "predators"]],
  ["a report on volcanoes", ["formation", "eruptions", "famous examples"]],
  ["a diary about a school trip", ["the journey there", "activities at the museum", "the journey home"]],
  ["a report on the Vikings", ["daily life", "longships", "raids and trade"]],
  ["an information leaflet about recycling", ["why it matters", "what can be recycled", "how to sort rubbish"]],
  ["a report on the water cycle", ["evaporation", "condensation", "precipitation"]],
  ["a biography of an explorer", ["early life", "famous journeys", "later achievements"]],
  ["a report on the rainforest", ["layers of the rainforest", "animals", "threats to the rainforest"]],
];
function y4LayoutThemes(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [text, themes] of y4ThemeRows) {
    out.push(mc(rng, { strandSlug: "layout-devices", yearGroup: Y4, objectiveCode: "GR4-LAY-1", difficulty: "silver", promptText: `${text[0].toUpperCase()}${text.slice(1)} covers ${themes.join(", ")}. How should it be organised?`, correct: "Into a separate paragraph for each theme", distractors: ["As one very long paragraph covering everything", "In random order with no paragraph breaks", "As a single sentence per fact with no paragraphs"], explanation: `Grouping each theme (${themes.join(", ")}) into its own paragraph makes the writing clear to follow.` }));
  }
  return out;
}

export function generateAllGrammarQuestionsY4Wordbanks(seed = 134001): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...y4StandardEnglish(rng),
    ...y4LySuffixes(rng),
    ...y4Homophones(rng),
    ...y4Synonyms(rng),
    ...y4PluralPossession(rng),
    ...y4FrontedAdverbials(rng),
    ...y4Commas(rng),
    ...y4NounPhrases(rng),
    ...y4DirectSpeechReporting(rng),
    ...y4Cohesion(rng),
    ...y4LayoutThemes(rng),
  ];
}

// =============================== YEAR 2 ======================================

// --- suffixes: nouns (-ness/-er) ---
const y2NounSuffixRows: [string, string, string, string][] = [
  ["kind", "-ness", "kindness", "the quality of being kind"], ["sad", "-ness", "sadness", "the quality of being sad"],
  ["dark", "-ness", "darkness", "the quality of being dark"], ["ill", "-ness", "illness", "the quality of being ill"],
  ["fit", "-ness", "fitness", "the quality of being fit"], ["happy", "-ness", "happiness", "the quality of being happy"],
  ["teach", "-er", "teacher", "someone who teaches"], ["paint", "-er", "painter", "someone who paints"],
  ["farm", "-er", "farmer", "someone who farms"], ["sing", "-er", "singer", "someone who sings"],
  ["work", "-er", "worker", "someone who works"], ["swim", "-er", "swimmer", "someone who swims"],
];
function y2NounSuffixes(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [base, suffix, whole, meaning] of y2NounSuffixRows) {
    out.push(mc(rng, { strandSlug: "suffixes", yearGroup: Y2, objectiveCode: "GR2-SUF-1", difficulty: "bronze", promptText: `Which word means "${meaning}", formed with a suffix?`, correct: whole, distractors: ["-ness", "-er", "-ful", "-ly"].filter((s) => s !== suffix).map((s) => `${base}${s}`), explanation: `Adding "${suffix}" to "${base}" gives "${whole}".` }));
  }
  return out;
}

// --- suffixes: adjectives (-ful/-less) ---
const y2AdjSuffixRows: [string, string, string, string][] = [
  ["hope", "-ful", "hopeful", "full of hope"], ["care", "-less", "careless", "without care"],
  ["joy", "-ful", "joyful", "full of joy"], ["help", "-less", "helpless", "without help"],
  ["colour", "-ful", "colourful", "full of colour"], ["power", "-less", "powerless", "without power"],
  ["thank", "-ful", "thankful", "full of thanks"], ["home", "-less", "homeless", "without a home"],
  ["harm", "-ful", "harmful", "full of harm"], ["sound", "-less", "soundless", "without a sound"],
  ["use", "-ful", "useful", "full of use"], ["pain", "-ful", "painful", "full of pain"],
];
function y2AdjSuffixes(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [base, suffix, whole, meaning] of y2AdjSuffixRows) {
    out.push(mc(rng, { strandSlug: "suffixes", yearGroup: Y2, objectiveCode: "GR2-SUF-2", difficulty: "silver", promptText: `Which word means "${meaning}", formed with a suffix?`, correct: whole, distractors: ["-ful", "-less"].filter((s) => s !== suffix).map((s) => `${base}${s}`).concat([`${base}ness`, `${base}ly`]).slice(0, 3), explanation: `Adding "${suffix}" to "${base}" gives "${whole}", meaning "${meaning}".` }));
  }
  return out;
}

// --- suffixes: -ly adverbs ---
const y2LySuffixRows: [string, string][] = [
  ["slow", "slowly"], ["loud", "loudly"], ["soft", "softly"], ["kind", "kindly"], ["safe", "safely"],
  ["quick", "quickly"], ["sad", "sadly"], ["brave", "bravely"], ["quiet", "quietly"], ["bright", "brightly"],
];
function y2LySuffixes(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [base, adverb] of y2LySuffixRows) {
    out.push(mc(rng, { strandSlug: "suffixes", yearGroup: Y2, objectiveCode: "GR2-SUF-3", difficulty: "gold", promptText: `Which word turns "${base}" into an adverb?`, correct: adverb, distractors: [`${base}ness`, `${base}ful`, `${base}er`], explanation: `"-ly" turns the adjective "${base}" into the adverb "${adverb}".` }));
  }
  return out;
}

// --- coordination-subordination ---
const y2CoordFrames: [string, string, string[]][] = [
  ["I like apples ___ oranges.", "and", ["but", "or", "so"]],
  ["Would you like juice ___ water?", "or", ["and", "but", "so"]],
  ["It was sunny, ___ we went to the park.", "so", ["and", "but", "or"]],
  ["I wanted cake, ___ there was none left.", "but", ["and", "or", "so"]],
  ["We can play tag ___ hide and seek.", "or", ["and", "but", "so"]],
  ["She practised hard, ___ she improved.", "so", ["and", "but", "or"]],
];
function y2Coordination(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [sentence, correct, distractors] of y2CoordFrames) {
    out.push(mc(rng, { strandSlug: "coordination-subordination", yearGroup: Y2, objectiveCode: "GR2-COORD-1", difficulty: "silver", promptText: `Which word correctly completes: '${sentence}'`, correct, distractors, explanation: `"${correct}" is the coordinating conjunction that best fits the sentence.` }));
  }
  return out;
}
const y2SubordFrames: [string, string, string[]][] = [
  ["We went inside ___ it started raining.", "when", ["and", "but", "or"]],
  ["I'll bring a jumper ___ it's cold.", "if", ["and", "but", "or"]],
  ["She said ___ she was excited.", "that", ["and", "but", "or"]],
  ["We stayed home ___ we were tired.", "because", ["and", "but", "or"]],
  ["Call me ___ you arrive.", "when", ["and", "but", "or"]],
];
function y2Subordination(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [sentence, correct, distractors] of y2SubordFrames) {
    out.push(mc(rng, { strandSlug: "coordination-subordination", yearGroup: Y2, objectiveCode: "GR2-COORD-2", difficulty: "gold", promptText: `Which word correctly completes: '${sentence}'`, correct, distractors, explanation: `"${correct}" is the subordinating conjunction that best fits the sentence.` }));
  }
  return out;
}

// --- plurals (-ies rule) ---
const y2PluralRows: [string, string][] = [
  ["baby", "babies"], ["city", "cities"], ["party", "parties"], ["story", "stories"], ["puppy", "puppies"],
  ["family", "families"], ["lady", "ladies"], ["country", "countries"], ["berry", "berries"], ["fly", "flies"],
];
function y2Plurals(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [base, plural] of y2PluralRows) {
    out.push(mc(rng, { strandSlug: "plurals", yearGroup: Y2, objectiveCode: "GR2-PLU-1", difficulty: "gold", promptText: `What is the plural of "${base}"?`, correct: plural, distractors: [`${base}s`, `${base}es`, `${base}'s`], explanation: `Words ending in a consonant + "y" change "y" to "ies": ${base} → ${plural}.` }));
  }
  return out;
}

// --- apostrophes: singular possession ---
const y2PossessionRows: [string, string][] = [
  ["rabbit", "burrow"], ["fox", "den"], ["duck", "pond"], ["monkey", "banana"], ["sheep", "wool"],
  ["driver", "van"], ["singer", "microphone"], ["chef", "apron"], ["pilot", "helmet"], ["artist", "brush"],
];
function y2Possession(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [owner, thing] of y2PossessionRows) {
    out.push(mc(rng, { strandSlug: "apostrophes", yearGroup: Y2, objectiveCode: "GR2-APOS-2", difficulty: "gold", promptText: `Which correctly shows that the ${thing} belongs to the ${owner}?`, correct: `the ${owner}'s ${thing}`, distractors: [`the ${owner}s ${thing}`, `the ${owner}'s' ${thing}`, `the ${owner}s' ${thing}`], explanation: `For one ${owner}, add apostrophe + s: the ${owner}'s ${thing}.` }));
  }
  return out;
}

export function generateAllGrammarQuestionsY2Wordbanks(seed = 132001): DraftQuestion[] {
  const rng = createRng(seed);
  return [...y2NounSuffixes(rng), ...y2AdjSuffixes(rng), ...y2LySuffixes(rng), ...y2Coordination(rng), ...y2Subordination(rng), ...y2Plurals(rng), ...y2Possession(rng)];
}
