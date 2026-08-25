/**
 * Data-table-driven Guyana Grammar generators (Grades 1-6) — a volume
 * top-up alongside the hand-written questions in
 * content/questions/guyana/grammar.json. Mirrors Cayman's
 * grammar-wordbanks.ts: where a grammar skill reduces to "pick the right
 * word/form from a small option set" (word families, prefixes, suffixes,
 * homophones, punctuation, conjunctions...), listing compact data rows and
 * generating one question per row is far faster to author — and just as
 * genuinely varied — as typing out full question objects by hand.
 */
import { createRng, shuffle, type Rng } from "./rng";
import type { DraftQuestion } from "./types";
import type { DifficultyBand, YearGroup } from "@/lib/curriculum/types";
import { PLURAL_BANK, SYNONYM_BANK, STANDARD_ENGLISH_BANK } from "./shared/word-facts";

const SUBJECT = "grammar";

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

// =============================== SPELLING PATTERNS =========================

// --- Y1: simple word families (short-vowel CVC words) ---
const y1WordFamilyRows: [string, string, string][] = [
  ["c", "at", "cat"], ["h", "at", "hat"], ["m", "at", "mat"], ["r", "at", "rat"], ["s", "at", "sat"],
  ["c", "an", "can"], ["m", "an", "man"], ["p", "an", "pan"], ["r", "an", "ran"], ["f", "an", "fan"],
  ["b", "ig", "big"], ["d", "ig", "dig"], ["f", "ig", "fig"], ["p", "ig", "pig"], ["w", "ig", "wig"],
  ["d", "og", "dog"], ["l", "og", "log"], ["j", "og", "jog"], ["h", "op", "hop"], ["t", "op", "top"],
];
function y1WordFamilies(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [start, family, whole] of y1WordFamilyRows) {
    out.push(mc(rng, { strandSlug: "spelling-patterns", yearGroup: "Y1", objectiveCode: "GY-GR1-SPL-1", difficulty: "bronze", promptText: `Which letters complete the word: "${start}__" to spell "${whole}"?`, correct: family, distractors: ["at", "an", "ig", "og", "op"].filter((f) => f !== family), explanation: `"${start}" + "${family}" spells "${whole}".` }));
  }
  return out;
}

// --- Y2: longer word families (-ay/-ight/-ould/-ow) ---
const y2WordFamilyRows: [string, string][] = [
  ["day", "-ay"], ["play", "-ay"], ["stay", "-ay"], ["tray", "-ay"], ["spray", "-ay"],
  ["light", "-ight"], ["night", "-ight"], ["right", "-ight"], ["bright", "-ight"], ["sight", "-ight"],
  ["would", "-ould"], ["could", "-ould"], ["should", "-ould"],
  ["snow", "-ow"], ["grow", "-ow"], ["blow", "-ow"], ["throw", "-ow"], ["slow", "-ow"],
];
function y2WordFamilies(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const families = ["-ay", "-ight", "-ould", "-ow"];
  for (const [word, family] of y2WordFamilyRows) {
    out.push(mc(rng, { strandSlug: "spelling-patterns", yearGroup: "Y2", objectiveCode: "GY-GR2-SPL-1", difficulty: "bronze", promptText: `Which spelling pattern does "${word}" end in?`, correct: family, distractors: families.filter((f) => f !== family), explanation: `"${word}" ends in the "${family}" pattern.` }));
  }
  return out;
}

// --- Y2: plural rules, drawn from the shared word-facts bank (spelling
// theory doesn't depend on which country's curriculum is teaching it — see
// shared/word-facts.ts) ---
function y2Plurals(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const { singular, plural, rule } of PLURAL_BANK) {
    const wrongOptions =
      rule === "y-to-ies" ? [`${singular}s`, `${singular.slice(0, -1)}ys`] :
      rule === "f-to-ves" ? [`${singular}s`, `${singular.slice(0, -1)}fs`] :
      rule === "add-es" ? [`${singular}s`] :
      [`${singular}s`, `${singular}es`];
    out.push(mc(rng, { strandSlug: "spelling-patterns", yearGroup: "Y2", objectiveCode: "GY-GR2-SPL-1", difficulty: "silver", promptText: `What is the plural of "${singular}"?`, correct: plural, distractors: wrongOptions, explanation: `The plural of "${singular}" is "${plural}".` }));
  }
  return out;
}

// --- Y3: prefixes (un-/dis-/re-/mis-) + suffixes (-ful/-less) ---
const y3PrefixRows: [string, string, string][] = [
  ["happy", "un", "unhappy"], ["kind", "un", "unkind"], ["fair", "un", "unfair"], ["well", "un", "unwell"],
  ["agree", "dis", "disagree"], ["like", "dis", "dislike"], ["appear", "dis", "disappear"], ["obey", "dis", "disobey"],
  ["write", "re", "rewrite"], ["do", "re", "redo"], ["play", "re", "replay"], ["build", "re", "rebuild"],
  ["understand", "mis", "misunderstand"], ["spell", "mis", "misspell"], ["behave", "mis", "misbehave"], ["lead", "mis", "mislead"],
];
function y3Prefixes(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [base, prefix, whole] of y3PrefixRows) {
    out.push(mc(rng, { strandSlug: "spelling-patterns", yearGroup: "Y3", objectiveCode: "GY-GR3-SPL-1", difficulty: "bronze", promptText: `Which prefix correctly completes: ___${base}?`, correct: `${prefix}-`, distractors: ["un-", "dis-", "re-", "mis-"].filter((p) => p !== `${prefix}-`), explanation: `Adding "${prefix}-" to "${base}" gives "${whole}".` }));
  }
  return out;
}
const y3SuffixRows: [string, string, string, string][] = [
  ["hope", "-ful", "hopeful", "full of hope"], ["care", "-ful", "careful", "full of care"], ["wonder", "-ful", "wonderful", "full of wonder"],
  ["fear", "-less", "fearless", "without fear"], ["help", "-less", "helpless", "without help"], ["care", "-less", "careless", "without care"],
];
function y3Suffixes(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [base, suffix, whole, meaning] of y3SuffixRows) {
    out.push(mc(rng, { strandSlug: "spelling-patterns", yearGroup: "Y3", objectiveCode: "GY-GR3-SPL-1", difficulty: "silver", promptText: `Which word means "${meaning}", formed from "${base}"?`, correct: whole, distractors: ["-ful", "-less"].filter((s) => s !== suffix).map((s) => `${base}${s}`).concat([`${base}ness`]), explanation: `Adding "${suffix}" to "${base}" gives "${whole}", meaning "${meaning}".` }));
  }
  return out;
}

// --- Y4: homophones ---
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
  ["Please ___ the door quietly.", "close", ["clothes"]],
  ["I need new ___ for winter.", "clothes", ["close"]],
  ["We saw a ___ in the field.", "hare", ["hair"]],
  ["She brushed her ___ before school.", "hair", ["hare"]],
  ["The homework is ___ on Friday.", "due", ["do", "dew"]],
];
function y4Homophones(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [sentence, correct, distractors] of y4HomophoneFrames) {
    out.push(mc(rng, { strandSlug: "spelling-patterns", yearGroup: "Y4", objectiveCode: "GY-GR4-SPL-1", difficulty: "silver", promptText: `Which word correctly completes: '${sentence}'`, correct, distractors, explanation: `"${correct}" is the correct homophone for this sentence's meaning.` }));
  }
  return out;
}

// --- Y5: prefixes/suffixes with meaning ---
const y5AffixRows: [string, string, string, string][] = [
  ["possible", "im-", "impossible", "not possible"], ["patient", "im-", "impatient", "not patient"], ["mature", "im-", "immature", "not mature"],
  ["correct", "in-", "incorrect", "not correct"], ["complete", "in-", "incomplete", "not complete"], ["active", "in-", "inactive", "not active"],
  ["vision", "-ible", "visible", "able to be seen"], ["horror", "-ible", "horrible", "causing horror"],
  ["comfort", "-able", "comfortable", "giving comfort"], ["enjoy", "-able", "enjoyable", "able to be enjoyed"],
  ["danger", "-ous", "dangerous", "full of danger"], ["fame", "-ous", "famous", "well known"],
];
function y5Affixes(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [base, affix, whole, meaning] of y5AffixRows) {
    out.push(mc(rng, { strandSlug: "spelling-patterns", yearGroup: "Y5", objectiveCode: "GY-GR5-SPL-1", difficulty: "bronze", promptText: `Which word means "${meaning}"?`, correct: whole, distractors: shuffle(rng, y5AffixRows.map((r) => r[2])).filter((w) => w !== whole).slice(0, 3), explanation: `"${whole}" is formed by adding "${affix}" to "${base}", meaning "${meaning}".` }));
  }
  return out;
}

// --- Y6: commonly misspelled words ---
const y6SpellingRows: [string, string[], string][] = [
  ["necessary", ["neccessary", "necessery", "neccesary"], "It is ___ to wear a helmet when cycling."],
  ["definitely", ["definately", "definitly", "difinitely"], "I will ___ finish my homework tonight."],
  ["separate", ["seperate", "seperete", "separete"], "Please ___ the recycling from the rubbish."],
  ["accommodate", ["acommodate", "accomodate", "accommadate"], "The hotel can ___ up to 200 guests."],
  ["embarrass", ["embarass", "embarras", "imbarrass"], "Tripping on stage would ___ anyone."],
  ["occurred", ["occured", "ocurred", "occurrd"], "The accident ___ near the school gate."],
  ["rhythm", ["rythm", "rhythem", "rithym"], "The drummer kept a steady ___."],
  ["conscience", ["consience", "concience", "conscienze"], "Her ___ told her to return the wallet."],
  ["government", ["goverment", "govenment", "governmant"], "The ___ announced a new school programme."],
  ["environment", ["enviroment", "envirnoment", "environmant"], "We should protect the natural ___."],
  ["Wednesday", ["Wensday", "Wendesday", "Wendsday"], "The class trip is planned for next ___."],
  ["February", ["Febuary", "Feburary", "Febraury"], "Mashramani celebrations begin in ___."],
];
function y6Spellings(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [correct, wrong, sentence] of y6SpellingRows) {
    out.push(mc(rng, { strandSlug: "spelling-patterns", yearGroup: "Y6", objectiveCode: "GY-GR6-SPL-1", difficulty: "silver", promptText: `Which spelling correctly completes: '${sentence}'`, correct, distractors: wrong, explanation: `"${correct}" is the correct spelling.` }));
  }
  return out;
}

// =============================== PUNCTUATION ================================

// --- Y1: capital letter + full stop ---
const y1SentenceRows: string[] = [
  "The sun is hot", "My dog is brown", "We like to play", "The bird can fly", "I see a boat",
  "She has a cat", "The rain fell fast", "He ran to school", "We eat rice", "The frog can jump",
];
function y1Punctuation(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const s of y1SentenceRows) {
    const correct = `${s}.`;
    out.push(mc(rng, { strandSlug: "punctuation", yearGroup: "Y1", objectiveCode: "GY-GR1-PUN-1", difficulty: "bronze", promptText: `Which version of "${s.toLowerCase()}" is correctly punctuated?`, correct, distractors: [s, s.toLowerCase(), `${s.toLowerCase()}.`], explanation: `A sentence starts with a capital letter and ends with a full stop: "${correct}"` }));
  }
  return out;
}

// --- Y2: ?/!/. selection ---
const y2PunctRows: [string, "." | "?" | "!"][] = [
  ["What is your name", "?"], ["Watch out for the car", "!"], ["We went to the market", "."],
  ["How old are you", "?"], ["Stop right there", "!"], ["The dog is sleeping", "."],
  ["Where do you live", "?"], ["Help me quickly", "!"], ["She likes to read", "."],
  ["Can you swim", "?"], ["What a surprise", "!"], ["The bus arrived on time", "."],
];
function y2Punctuation(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const labels = { ".": "full stop", "?": "question mark", "!": "exclamation mark" } as const;
  for (const [sentence, mark] of y2PunctRows) {
    out.push(mc(rng, { strandSlug: "punctuation", yearGroup: "Y2", objectiveCode: "GY-GR2-PUN-1", difficulty: "bronze", promptText: `Which punctuation mark should end this sentence: "${sentence}"?`, correct: labels[mark], distractors: Object.values(labels).filter((l) => l !== labels[mark]), explanation: `"${sentence}" needs a ${labels[mark]}.` }));
  }
  return out;
}

// --- Y3: commas in lists ---
const y3ListRows: string[][] = [
  ["apples", "mangoes", "bananas"], ["red", "blue", "green", "yellow"], ["pen", "pencil", "ruler"],
  ["dogs", "cats", "birds", "fish"], ["run", "jump", "skip"], ["shirts", "shoes", "hats"],
  ["Monday", "Tuesday", "Wednesday"], ["rice", "beans", "chicken", "salad"],
];
function y3Commas(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const items of y3ListRows) {
    const correct = `I like ${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}.`;
    const noCommas = `I like ${items.join(" ")}.`;
    const wrongComma = `I like ${items.join(", ")}.`;
    out.push(mc(rng, { strandSlug: "punctuation", yearGroup: "Y3", objectiveCode: "GY-GR3-PUN-1", difficulty: "bronze", promptText: `Which sentence correctly lists ${items.join(", ")} with commas?`, correct, distractors: [noCommas, wrongComma, `I like, ${items.join(" ")}.`], explanation: `Commas separate each item except the last two, which are joined with "and": "${correct}"` }));
  }
  return out;
}

// --- Y4: direct speech ---
const y4SpeechRows: [string, string, string][] = [
  ["I am hungry", "Maya", "said"], ["Let's go home", "Tom", "said"], ["That was amazing", "Priya", "exclaimed"],
  ["I can't find my shoes", "he", "muttered"], ["We should hurry", "the captain", "announced"], ["Watch your step", "her mother", "warned"],
  ["I won the race", "Marcus", "shouted"], ["This is my favourite book", "she", "whispered"],
];
function y4DirectSpeech(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [line, speaker, verb] of y4SpeechRows) {
    const correct = `"${line}," ${speaker} ${verb}.`;
    out.push(mc(rng, { strandSlug: "punctuation", yearGroup: "Y4", objectiveCode: "GY-GR4-PUN-1", difficulty: "silver", promptText: `Which sentence correctly punctuates ${speaker} saying "${line}"?`, correct, distractors: [`${line}, ${speaker} ${verb}.`, `"${line}" ${speaker} ${verb}.`, `"${line}." ${speaker} ${verb}.`], explanation: `Direct speech goes inside inverted commas, with a comma before the closing mark when a reporting clause follows.` }));
  }
  return out;
}

// --- Y5: commas for clarity ---
const y5CommaRows: [string, string][] = [
  ["After the storm", "the streets were flooded."], ["While eating", "the dog barked loudly."],
  ["Before the game started", "the players warmed up."], ["Once the bell rang", "the pupils lined up."],
  ["Although it was raining", "we still went outside."], ["Since it was a holiday", "the shops were closed."],
  ["When the teacher arrived", "the class went quiet."], ["Because he was late", "he missed the bus."],
];
function y5Commas(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [opener, rest] of y5CommaRows) {
    const correct = `${opener}, ${rest}`;
    out.push(mc(rng, { strandSlug: "punctuation", yearGroup: "Y5", objectiveCode: "GY-GR5-PUN-1", difficulty: "silver", promptText: `Which sentence uses a comma correctly after "${opener}"?`, correct, distractors: [`${opener} ${rest}`, `${opener}; ${rest}`, `${opener.slice(0, -1)}, ${opener.slice(-1).toLowerCase()} ${rest}`], explanation: `A comma follows the introductory clause "${opener}" before the main clause.` }));
  }
  return out;
}

// --- Y6: semicolons/colons/dashes ---
const y6PunctRows: [string, string, ";" | ":" | "—"][] = [
  ["I love mangoes", "they are my favourite fruit", ";"], ["The sky was dark", "a storm was coming", ";"],
  ["Pack these items", "a hat, sunscreen and water", ":"], ["Remember three things", "practise, revise, sleep", ":"],
  ["My sister is ten years old", "loves to read", "—"], ["The old house", "abandoned for years", "—"],
];
function y6AdvancedPunctuation(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  const labels = { ";": "semicolon", ":": "colon", "—": "dash" } as const;
  for (const [first, second, mark] of y6PunctRows) {
    out.push(mc(rng, { strandSlug: "punctuation", yearGroup: "Y6", objectiveCode: "GY-GR6-PUN-1", difficulty: "silver", promptText: `Which mark best joins these ideas: "${first}" and "${second}"?`, correct: labels[mark], distractors: Object.values(labels).filter((l) => l !== labels[mark]), explanation: `A ${labels[mark]} is the best fit for joining "${first}" and "${second}".` }));
  }
  return out;
}

// =============================== SENTENCE CONSTRUCTION ======================

// --- Y1: word order (subject-verb-object) ---
const y1OrderRows: [string, string, string][] = [
  ["The cat", "sat on the mat"], ["She", "likes to swim"], ["The boy", "ran fast"],
  ["We", "played in the park"], ["He", "read a book"], ["The bird", "flew away"],
  ["I", "like ice cream"], ["They", "walked to school"],
].map(([subj, verb]) => [subj, verb, `${subj} ${verb}.`]) as [string, string, string][];
function y1Sentences(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [subj, verb, correct] of y1OrderRows) {
    const words = correct.slice(0, -1).split(" ");
    const scrambled = shuffle(rng, words).join(" ") + ".";
    out.push(mc(rng, { strandSlug: "sentence-construction", yearGroup: "Y1", objectiveCode: "GY-GR1-SEN-1", difficulty: "bronze", promptText: `Which is a complete, correctly ordered sentence about ${subj.toLowerCase()}?`, correct, distractors: [scrambled, `${verb} ${subj}.`, correct.toLowerCase()], explanation: `"${correct}" puts the subject before the verb and makes sense.` }));
  }
  return out;
}

// --- Y2: compound sentences ---
const y2CompoundRows: [string, string, "and" | "but" | "or" | "so"][] = [
  ["I like mangoes", "I like bananas", "and"], ["We wanted to play outside", "it started to rain", "but"],
  ["You can have juice", "you can have water", "or"], ["The sun was hot", "the children played outside", "and"],
  ["I wanted cake", "there was none left", "but"], ["It was sunny", "we went to the park", "so"],
  ["We can walk", "we can take the bus", "or"], ["She practised hard", "she improved", "so"],
];
function y2Compound(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [a, b, conj] of y2CompoundRows) {
    out.push(mc(rng, { strandSlug: "sentence-construction", yearGroup: "Y2", objectiveCode: "GY-GR2-SEN-1", difficulty: "bronze", promptText: `Which conjunction correctly joins: "${a}" and "${b}"?`, correct: conj, distractors: (["and", "but", "or", "so"] as const).filter((c) => c !== conj), explanation: `"${conj}" is the conjunction that best links these two ideas.` }));
  }
  return out;
}

// --- Y3: conjunctions (because/although/if/when) ---
const y3ConjRows: [string, "because" | "although" | "if" | "when"][] = [
  ["We stayed inside ___ it was raining.", "because"], ["I wanted to go outside ___ it was raining.", "although"],
  ["I'll bring an umbrella ___ it rains.", "if"], ["Call me ___ you arrive.", "when"],
  ["She was tired ___ she kept working.", "although"], ["We can walk ___ the weather is good.", "if"],
  ["The dog barked ___ a stranger knocked.", "when"], ["He passed the test ___ he hadn't studied much.", "although"],
  ["We left early ___ we wanted to avoid traffic.", "because"], ["You can borrow my bike ___ you return it.", "if"],
];
function y3Conjunctions(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [sentence, correct] of y3ConjRows) {
    out.push(mc(rng, { strandSlug: "sentence-construction", yearGroup: "Y3", objectiveCode: "GY-GR3-SEN-1", difficulty: "bronze", promptText: `Which word correctly completes: '${sentence}'`, correct, distractors: (["because", "although", "if", "when"] as const).filter((c) => c !== correct), explanation: `"${correct}" is the conjunction that best fits the meaning of the sentence.` }));
  }
  return out;
}

// --- Y4: fronted adverbials / expanded noun phrases ---
const y4FrontedRows: [string, string][] = [
  ["Slowly", "the turtle crossed the road."], ["After school", "we played cricket."],
  ["Without warning", "the fire alarm rang."], ["Every morning", "Leo feeds his rabbit."],
  ["Deep in the forest", "an owl hooted."], ["Just before sunrise", "the fishermen set sail."],
  ["High above the clouds", "the plane soared."], ["Once upon a time", "there lived a curious fox."],
];
function y4FrontedAdverbials(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [opener, rest] of y4FrontedRows) {
    const correct = `${opener}, ${rest}`;
    out.push(mc(rng, { strandSlug: "sentence-construction", yearGroup: "Y4", objectiveCode: "GY-GR4-SEN-1", difficulty: "bronze", promptText: `Which sentence correctly punctuates the fronted adverbial "${opener}"?`, correct, distractors: [`${opener} ${rest}`, `${opener}; ${rest}`, `${rest} ${opener}.`], explanation: `A fronted adverbial like "${opener}" needs a comma straight after it.` }));
  }
  return out;
}
const y4NounPhraseRows: [string, string, string][] = [
  ["wolf", "the huge, hungry wolf with sharp teeth", "the wolf"],
  ["garden", "the overgrown garden behind the old cottage", "the garden"],
  ["ship", "the battered old ship with torn sails", "the ship"],
  ["market", "the busy, colourful market in the old town", "the market"],
  ["storm", "the violent, howling storm over the harbour", "the storm"],
];
function y4NounPhrases(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [noun, expanded, plain] of y4NounPhraseRows) {
    out.push(mc(rng, { strandSlug: "sentence-construction", yearGroup: "Y4", objectiveCode: "GY-GR4-SEN-1", difficulty: "silver", promptText: `Which is the most expanded noun phrase describing a ${noun}?`, correct: expanded, distractors: [plain, `a ${noun}`, `${plain.replace("the ", "")} ${noun}`], explanation: `Modifying adjectives and a preposition phrase all expand the noun "${noun}" in "${expanded}".` }));
  }
  return out;
}

// --- Y5: relative clauses ---
const y5RelativeRows: [string, "who" | "which" | "whose"][] = [
  ["The girl ___ lives next door is my friend.", "who"], ["The book ___ I borrowed was excellent.", "which"],
  ["The teacher ___ taught us was very kind.", "who"], ["The house ___ roof is red belongs to my uncle.", "whose"],
  ["The film ___ we watched was too long.", "which"], ["The doctor ___ treated me was very gentle.", "who"],
  ["The dog ___ bark I heard was very loud.", "whose"], ["The car ___ broke down was new.", "which"],
];
function y5RelativeClauses(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [sentence, correct] of y5RelativeRows) {
    out.push(mc(rng, { strandSlug: "sentence-construction", yearGroup: "Y5", objectiveCode: "GY-GR5-SEN-1", difficulty: "bronze", promptText: `Which relative pronoun best completes: '${sentence}'`, correct, distractors: (["who", "which", "whose"] as const).filter((c) => c !== correct), explanation: `"${correct}" is the relative pronoun that fits — "who" for people, "which" for things, "whose" for possession.` }));
  }
  return out;
}

// --- Y6: active/passive voice ---
const y6VoiceRows: [string, string, string][] = [
  ["The children", "ate the cake.", "The cake was eaten by the children."],
  ["The gardener", "planted the tree.", "The tree was planted by the gardener."],
  ["The storm", "destroyed the roof.", "The roof was destroyed by the storm."],
  ["The team", "won the match.", "The match was won by the team."],
  ["The artist", "painted the mural.", "The mural was painted by the artist."],
  ["The chef", "cooked the meal.", "The meal was cooked by the chef."],
];
function y6ActivePassive(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const [subject, verbPhrase, passive] of y6VoiceRows) {
    const active = `${subject} ${verbPhrase}`;
    out.push(mc(rng, { strandSlug: "sentence-construction", yearGroup: "Y6", objectiveCode: "GY-GR6-SEN-1", difficulty: "bronze", promptText: `Rewrite in the passive voice: "${active}"`, correct: passive, distractors: [active, passive.replace("was", "is"), `${verbPhrase.replace(".", "")} was done by ${subject.toLowerCase()}.`], explanation: `In the passive voice, the thing acted upon becomes the subject: "${passive}"` }));
  }
  return out;
}

// --- Y5: word choice (replacing an overused word), drawn from the shared
// synonym bank — a style/vocabulary skill that fits alongside relative
// clauses under "improving sentences" ---
function y5Synonyms(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const { context, overused, best, distractors } of SYNONYM_BANK) {
    out.push(mc(rng, { strandSlug: "sentence-construction", yearGroup: "Y5", objectiveCode: "GY-GR5-SEN-1", difficulty: "silver", promptText: `Which is the best replacement for the overused word "${overused}" in "${context}"?`, correct: best, distractors, explanation: `"${best}" is a more precise, less overused alternative to "${overused}".` }));
  }
  return out;
}

// --- Y6: standard vs. non-standard English verb forms, drawn from the
// shared bank — fits alongside active/passive under sentence accuracy ---
function y6StandardEnglish(rng: Rng): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const { sentence, correct, nonStandard } of STANDARD_ENGLISH_BANK) {
    out.push(mc(rng, { strandSlug: "sentence-construction", yearGroup: "Y6", objectiveCode: "GY-GR6-SEN-1", difficulty: "silver", promptText: `Which fills the gap in standard English: '${sentence}'`, correct, distractors: [nonStandard], explanation: `Standard English uses "${correct}", not the non-standard "${nonStandard}".` }));
  }
  return out;
}

export function generateAllGrammarQuestionsGuyana(seed = 56100): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...y1WordFamilies(rng),
    ...y2WordFamilies(rng),
    ...y2Plurals(rng),
    ...y3Prefixes(rng),
    ...y3Suffixes(rng),
    ...y4Homophones(rng),
    ...y5Affixes(rng),
    ...y6Spellings(rng),
    ...y1Punctuation(rng),
    ...y2Punctuation(rng),
    ...y3Commas(rng),
    ...y4DirectSpeech(rng),
    ...y5Commas(rng),
    ...y6AdvancedPunctuation(rng),
    ...y1Sentences(rng),
    ...y2Compound(rng),
    ...y3Conjunctions(rng),
    ...y4FrontedAdverbials(rng),
    ...y4NounPhrases(rng),
    ...y5RelativeClauses(rng),
    ...y5Synonyms(rng),
    ...y6ActivePassive(rng),
    ...y6StandardEnglish(rng),
  ];
}
