/**
 * Key Stage 1 (Y1/Y2) grammar & punctuation content — word-bank + sentence
 * template driven, same shape as content-generators/grammar.ts's KS2
 * strands. Multiple-choice/matching only, consistent with the app-wide
 * move away from free-text fill-in-the-blank grading for non-maths content.
 */
import { createRng, shuffle, type Rng } from "./rng";
import type { DraftQuestion } from "./types";
import type { DifficultyBand, YearGroup } from "@/lib/curriculum/types";

const SUBJECT = "grammar";
const Y1: YearGroup = "Y1";
const Y2: YearGroup = "Y2";

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

interface Item { prompt: string; correct: string; distractors: string[]; explanation: string; difficulty?: DifficultyBand }

function build(strandSlug: string, yearGroup: YearGroup, objectiveCode: string, defaultDifficulty: DifficultyBand, items: Item[]): (rng: Rng) => DraftQuestion[] {
  return (rng: Rng) => items.map((it) => mc(rng, { strandSlug, yearGroup, objectiveCode, difficulty: it.difficulty ?? defaultDifficulty, promptText: it.prompt, correct: it.correct, distractors: it.distractors, explanation: it.explanation }));
}

// --- sentence-punctuation ---
const sentencePunctuationY1 = build("sentence-punctuation", Y1, "GR1-PUNC-2", "bronze", [
  { prompt: "Which sentence about a cat is correctly punctuated?", correct: "The cat sat on the mat.", distractors: ["the cat sat on the mat", "The cat sat on the mat", "the cat sat on the mat."], explanation: "A sentence needs a capital letter at the start and a full stop at the end." },
  { prompt: "Which sentence about a dog is correctly punctuated?", correct: "My dog can run fast.", distractors: ["my dog can run fast", "My dog can run fast", "my Dog can run fast."], explanation: "Sentences start with a capital letter and end with a full stop." },
  { prompt: "What is missing from this sentence: 'the sun is hot'?", correct: "a capital letter and a full stop", distractors: ["a question mark", "a comma", "an exclamation mark"], explanation: "This is a statement, so it needs a capital letter at the start and a full stop at the end: 'The sun is hot.'" },
  { prompt: "Which is the correct way to end a question?", correct: "Are you happy?", distractors: ["Are you happy.", "Are you happy!", "are you happy?"], explanation: "Questions end with a question mark, and still need a capital letter at the start." },
  { prompt: "Which punctuation mark ends a question?", correct: "?", distractors: [".", "!", ","], explanation: "A question mark (?) shows a sentence is asking something." },
  { prompt: "Which punctuation mark shows strong feeling, like surprise?", correct: "!", distractors: [".", "?", ","], explanation: "An exclamation mark (!) shows strong feeling or excitement." },
  { prompt: "Which sentence correctly uses an exclamation mark?", correct: "What a big dog!", distractors: ["What a big dog.", "What a big dog?", "what a big dog!"], explanation: "An exclamation about something needs a capital letter and an exclamation mark." },
  { prompt: "Which sentence needs a question mark at the end?", correct: "Where is my bag", distractors: ["I have a bag", "My bag is here", "The bag is red"], explanation: "'Where is my bag' is asking something, so it needs a question mark: 'Where is my bag?'" },
  { prompt: "Which word should start with a capital letter in: 'i like my school'?", correct: "I", distractors: ["like", "my", "school"], explanation: "The word 'I' always starts with a capital letter." },
  { prompt: "Which sentence uses spaces between words correctly?", correct: "I like cake.", distractors: ["Ilikecake.", "I likecake.", "Ilike cake."], explanation: "Each word in a sentence needs a space before and after it." },
]);
const sentencePunctuationY2 = build("sentence-punctuation", Y2, "GR2-PUNC-1", "silver", [
  { prompt: "Which sentence uses capital letters and full stops correctly?", correct: "Ben and Amy went to the park.", distractors: ["ben and Amy went to the park.", "Ben and amy went to the park", "Ben and Amy went to the Park."], explanation: "Only the first word and proper nouns (names) need capital letters; the sentence ends with a full stop." },
  { prompt: "Which sentence is correctly punctuated as a command?", correct: "Close the door.", distractors: ["close the door.", "Close the door", "Close the Door."], explanation: "A command still needs a capital letter and a full stop." },
  { prompt: "Which sentence correctly uses a question mark?", correct: "Why is the sky blue?", distractors: ["Why is the sky blue.", "why is the sky blue?", "Why is the sky blue!"], explanation: "A question needs a capital letter at the start and a question mark at the end." },
  { prompt: "Which sentence is punctuated correctly?", correct: "What a surprise!", distractors: ["what a surprise!", "What a surprise.", "What a surprise?"], explanation: "An exclamation needs a capital letter and an exclamation mark." },
  { prompt: "Which of these uses capital letters correctly for a name and a place?", correct: "Jamal lives in London.", distractors: ["jamal lives in london.", "Jamal lives in london.", "jamal lives in London."], explanation: "Names and place names (proper nouns) always start with a capital letter." },
]);

// --- sentence-types ---
const sentenceTypes = build("sentence-types", Y2, "GR2-SENT-1", "silver", [
  { prompt: "What type of sentence is this: 'The dog is barking.'?", correct: "statement", distractors: ["question", "exclamation", "command"], explanation: "A statement tells you something and ends with a full stop." },
  { prompt: "What type of sentence is this: 'Where are my shoes?'?", correct: "question", distractors: ["statement", "exclamation", "command"], explanation: "A question asks something and ends with a question mark." },
  { prompt: "What type of sentence is this: 'What a lovely day!'?", correct: "exclamation", distractors: ["statement", "question", "command"], explanation: "An exclamation shows strong feeling and ends with an exclamation mark." },
  { prompt: "What type of sentence is this: 'Pick up your toys.'?", correct: "command", distractors: ["statement", "question", "exclamation"], explanation: "A command tells someone to do something." },
  { prompt: "Which sentence is a command?", correct: "Sit down, please.", distractors: ["Are you sitting down?", "I am sitting down.", "How comfy this chair is!"], explanation: "'Sit down, please' instructs someone to do something, making it a command." },
  { prompt: "Which sentence is a question?", correct: "Can we go outside?", distractors: ["We can go outside.", "Let's go outside!", "Go outside now."], explanation: "'Can we go outside?' is asking something, so it's a question." },
  { prompt: "Which sentence is an exclamation?", correct: "That was amazing!", distractors: ["That was amazing.", "Was that amazing?", "Tell me it was amazing."], explanation: "'That was amazing!' shows strong feeling, making it an exclamation." },
  { prompt: "Which sentence is a statement?", correct: "The bus arrives at nine o'clock.", distractors: ["Does the bus arrive at nine?", "Catch the nine o'clock bus!", "Catch the bus."], explanation: "A statement simply gives information." },
]);

// --- joining-words (Y1: 'and') ---
const joiningWords = build("joining-words", Y1, "GR1-JOIN-1", "bronze", [
  { prompt: "Which word correctly joins these: 'I like apples ___ bananas.'?", correct: "and", distractors: ["but", "so", "the"], explanation: "'And' joins two words together in a list." },
  { prompt: "Which sentence correctly joins two ideas with 'and'?", correct: "I ran fast and I jumped high.", distractors: ["I ran fast, I jumped high.", "I ran fast I jumped high.", "I ran fast so jumped high."], explanation: "'And' can join two whole clauses together." },
  { prompt: "Which word joins these words: 'cats ___ dogs'?", correct: "and", distractors: ["but", "or", "the"], explanation: "'And' is used to join two things together in a list." },
  { prompt: "Which sentence uses 'and' to join two clauses correctly?", correct: "The sun was shining and the birds were singing.", distractors: ["The sun was shining, the birds were singing.", "The sun was shining and birds singing.", "The sun and the birds were singing shining."], explanation: "'And' joins two complete ideas (clauses) into one sentence." },
  { prompt: "Choose the word to join: 'She packed her bag ___ went to school.'", correct: "and", distractors: ["but", "because", "the"], explanation: "'And' joins the two actions in the sentence." },
  { prompt: "Which sentence correctly uses 'and' to join a list of three things?", correct: "I have a pen, a book and a ruler.", distractors: ["I have a pen a book and a ruler.", "I have a pen, a book, and, a ruler.", "I have a pen and a book and a ruler and."], explanation: "A list uses commas between items, with 'and' before the final item." },
]);

// --- coordination-subordination (Y2) ---
const coordination = build("coordination-subordination", Y2, "GR2-COORD-1", "silver", [
  { prompt: "Which word correctly joins: 'I wanted to play outside, ___ it was raining.'?", correct: "but", distractors: ["and", "or", "because"], explanation: "'But' shows a contrast between two ideas." },
  { prompt: "Which word correctly joins: 'Would you like tea ___ coffee?'?", correct: "or", distractors: ["and", "but", "because"], explanation: "'Or' shows a choice between two things." },
  { prompt: "Which word correctly joins: 'I like both cats ___ dogs.'?", correct: "and", distractors: ["but", "or", "so"], explanation: "'And' adds one thing to another." },
  { prompt: "Which sentence correctly uses 'but' to show contrast?", correct: "It was cold, but we still went outside.", distractors: ["It was cold, and we still went outside.", "It was cold, or we still went outside.", "It was cold but still we went outside but."], explanation: "'But' links two ideas that contrast with each other." },
]);
const subordination = build("coordination-subordination", Y2, "GR2-COORD-2", "gold", [
  { prompt: "Which word correctly joins: 'We stayed inside ___ it was raining.'?", correct: "because", distractors: ["and", "or", "but"], explanation: "'Because' explains the reason for something." },
  { prompt: "Which word correctly joins: 'I will bring an umbrella ___ it rains.'?", correct: "if", distractors: ["and", "but", "or"], explanation: "'If' introduces a condition." },
  { prompt: "Which word correctly joins: 'She said ___ she was tired.'?", correct: "that", distractors: ["and", "but", "or"], explanation: "'That' introduces what someone said or thought." },
  { prompt: "Which sentence correctly uses 'when' to join two clauses?", correct: "We went inside when it started to rain.", distractors: ["We went inside, it started to rain when.", "We went inside and when it started to rain.", "When we went inside it started raining but."], explanation: "'When' shows the timing between two events." },
  { prompt: "Which word correctly completes: 'I was happy ___ I won the race.'?", correct: "because", distractors: ["if", "when", "or"], explanation: "'Because' gives the reason she was happy." },
]);

// --- nouns-and-pronouns (Y1) ---
const nounsAndPronouns = build("nouns-and-pronouns", Y1, "GR1-NOUN-1", "bronze", [
  { prompt: "Which word should always have a capital letter?", correct: "I", distractors: ["he", "she", "it"], explanation: "The pronoun 'I' always has a capital letter, wherever it appears in a sentence." },
  { prompt: "Which sentence uses 'I' correctly?", correct: "Tom and I went to the shop.", distractors: ["Tom and i went to the shop.", "tom and I went to the shop.", "Tom and I Went to the shop."], explanation: "'I' is always capitalised." },
  { prompt: "Which is a name that needs a capital letter?", correct: "Priya", distractors: ["girl", "friend", "teacher"], explanation: "Names of people are proper nouns and always start with a capital letter." },
  { prompt: "Which word in this sentence is a noun: 'The dog ran fast'?", correct: "dog", distractors: ["ran", "fast", "the"], explanation: "'Dog' is a noun — it names a thing (an animal)." },
]);
const singularPlural = build("nouns-and-pronouns", Y1, "GR1-NOUN-2", "silver", [
  { prompt: "Which of these words is plural (more than one)?", correct: "cats", distractors: ["cat", "catlike", "catty"], explanation: "'Cats' means more than one cat, so it is plural." },
  { prompt: "Which of these words is singular (just one)?", correct: "dog", distractors: ["dogs", "doggy", "dogged"], explanation: "'Dog' means just one dog, so it is singular." },
  { prompt: "Which word means more than one book?", correct: "books", distractors: ["book", "booking", "booked"], explanation: "Adding 's' to 'book' makes it plural: 'books'." },
  { prompt: "Which word is singular?", correct: "chair", distractors: ["chairs", "chaired", "chairing"], explanation: "'Chair' refers to just one, so it's singular." },
]);

// --- plurals ---
const pluralsY1 = build("plurals", Y1, "GR1-PLU-1", "bronze", [
  { prompt: "What is the plural of 'cat'?", correct: "cats", distractors: ["cates", "catss", "cat's"], explanation: "Add 's' to most nouns to make them plural: cat → cats." },
  { prompt: "What is the plural of 'dog'?", correct: "dogs", distractors: ["doges", "dogss", "dog's"], explanation: "Add 's' to most nouns to make them plural: dog → dogs." },
  { prompt: "What is the plural of 'book'?", correct: "books", distractors: ["bookes", "bookss", "book's"], explanation: "Add 's' to most nouns to make them plural: book → books." },
]);
const pluralsEsY1 = build("plurals", Y1, "GR1-PLU-2", "silver", [
  { prompt: "What is the plural of 'box'?", correct: "boxes", distractors: ["boxs", "boxies", "box's"], explanation: "Words ending in 'x' add 'es': box → boxes." },
  { prompt: "What is the plural of 'wish'?", correct: "wishes", distractors: ["wishs", "wishies", "wish's"], explanation: "Words ending in 'sh' add 'es': wish → wishes." },
  { prompt: "What is the plural of 'bus'?", correct: "buses", distractors: ["buss", "busies", "bus's"], explanation: "Words ending in 's' add 'es': bus → buses." },
  { prompt: "What is the plural of 'brush'?", correct: "brushes", distractors: ["brushs", "brushies", "brush's"], explanation: "Words ending in 'sh' add 'es': brush → brushes." },
]);
const pluralsY2 = build("plurals", Y2, "GR2-PLU-1", "gold", [
  { prompt: "What is the plural of 'baby'?", correct: "babies", distractors: ["babys", "babyes", "baby's"], explanation: "Words ending in a consonant + 'y' change 'y' to 'ies': baby → babies." },
  { prompt: "What is the plural of 'city'?", correct: "cities", distractors: ["citys", "cityes", "city's"], explanation: "Words ending in a consonant + 'y' change 'y' to 'ies': city → cities." },
  { prompt: "What is the plural of 'party'?", correct: "parties", distractors: ["partys", "partyes", "party's"], explanation: "Words ending in a consonant + 'y' change 'y' to 'ies': party → parties." },
  { prompt: "What is the plural of 'toy'?", correct: "toys", distractors: ["toies", "toyes", "toy's"], explanation: "When 'y' follows a vowel, just add 's': toy → toys (the y/ies rule only applies after a consonant)." },
]);

// --- expanded-noun-phrases (Y2) ---
const expandedNounPhrasesY2 = build("expanded-noun-phrases", Y2, "GR2-ENP-1", "silver", [
  { prompt: "Which is an expanded noun phrase describing a butterfly?", correct: "the blue butterfly", distractors: ["the butterfly", "a butterfly flew", "butterfly blue the"], explanation: "Adding the adjective 'blue' expands and describes the noun 'butterfly'." },
  { prompt: "Which is an expanded noun phrase describing a house?", correct: "the tall, old house", distractors: ["the house", "a house is tall", "house old tall the"], explanation: "Adding adjectives like 'tall' and 'old' expands and describes the noun 'house'." },
  { prompt: "Which sentence uses an expanded noun phrase?", correct: "The fierce, hungry lion roared.", distractors: ["The lion roared.", "A lion is fierce and hungry.", "Roared the lion fierce hungry."], explanation: "'The fierce, hungry lion' expands the noun 'lion' with descriptive adjectives." },
  { prompt: "Which expanded noun phrase best describes a small kitten?", correct: "the tiny, fluffy kitten", distractors: ["the kitten", "a kitten is tiny", "kitten fluffy tiny the"], explanation: "Adjectives like 'tiny' and 'fluffy' expand the noun phrase to give more detail." },
  { prompt: "Which is an expanded noun phrase?", correct: "a bright, shiny star", distractors: ["a star", "star is bright", "shiny bright a star"], explanation: "Adjectives 'bright' and 'shiny' expand the simple noun phrase 'a star'." },
]);

// --- verb-tenses (Y2) ---
const tenseChoiceY2 = build("verb-tenses", Y2, "GR2-TEN-1", "silver", [
  { prompt: "Which sentence uses the past tense correctly?", correct: "Yesterday, I walked to school.", distractors: ["Yesterday, I walk to school.", "Yesterday, I am walking to school.", "Yesterday, I will walk to school."], explanation: "'Yesterday' signals the past tense: 'walked'." },
  { prompt: "Which sentence uses the present tense correctly?", correct: "Every day, I walk to school.", distractors: ["Every day, I walked to school.", "Every day, I will walk to school.", "Every day, I had walked to school."], explanation: "'Every day' is a habit happening now, so it uses the present tense: 'walk'." },
  { prompt: "Which sentence correctly uses the past tense of 'jump'?", correct: "She jumped over the puddle.", distractors: ["She jumps over the puddle.", "She jumping over the puddle.", "She jump over the puddle."], explanation: "'Jumped' is the past tense form of 'jump'." },
  { prompt: "Which sentence correctly uses the present tense of 'play'?", correct: "He plays football every Saturday.", distractors: ["He played football every Saturday.", "He playing football every Saturday.", "He play football every Saturday."], explanation: "'Plays' agrees with the singular subject 'he' in the present tense." },
]);
const progressiveY2 = build("verb-tenses", Y2, "GR2-TEN-2", "gold", [
  { prompt: "Which sentence about drumming correctly uses the present progressive form?", correct: "She is drumming loudly.", distractors: ["She drums loudly.", "She drummed loudly.", "She drum loudly."], explanation: "The present progressive uses 'is' + verb-ing: 'is drumming'." },
  { prompt: "Which sentence correctly uses the past progressive form?", correct: "He was shouting across the field.", distractors: ["He shouts across the field.", "He shout across the field.", "He shouted across the field, was."], explanation: "The past progressive uses 'was' + verb-ing: 'was shouting'." },
  { prompt: "Which sentence about singing correctly uses the present progressive form?", correct: "The children are singing a song.", distractors: ["The children sings a song.", "The children sang a song.", "The children sing-ing a song."], explanation: "The present progressive uses 'are' + verb-ing for a plural subject: 'are singing'." },
]);

// --- suffixes (Y2) ---
const suffixNounsY2 = build("suffixes", Y2, "GR2-SUF-1", "bronze", [
  { prompt: "Which word means 'the quality of being kind', formed with a suffix?", correct: "kindness", distractors: ["kindful", "kindly", "kinded"], explanation: "'-ness' turns the adjective 'kind' into a noun: kindness." },
  { prompt: "Which word describes someone who teaches, formed with a suffix?", correct: "teacher", distractors: ["teachness", "teachful", "teachly"], explanation: "'-er' turns the verb 'teach' into a person noun: teacher." },
  { prompt: "Which word means 'the quality of being sad', formed with a suffix?", correct: "sadness", distractors: ["sadful", "sadly", "sadify"], explanation: "'-ness' turns the adjective 'sad' into a noun: sadness." },
]);
const suffixAdjectivesY2 = build("suffixes", Y2, "GR2-SUF-2", "silver", [
  { prompt: "Which word means 'full of hope', formed with a suffix?", correct: "hopeful", distractors: ["hopeness", "hopely", "hopeer"], explanation: "'-ful' means 'full of': hopeful." },
  { prompt: "Which word means 'without care', formed with a suffix?", correct: "careless", distractors: ["careful", "careness", "carely"], explanation: "'-less' means 'without': careless." },
  { prompt: "Which word means 'full of joy', formed with a suffix?", correct: "joyful", distractors: ["joyness", "joyly", "joyer"], explanation: "'-ful' means 'full of': joyful." },
  { prompt: "Which word means 'without help', formed with a suffix?", correct: "helpless", distractors: ["helpful", "helpness", "helply"], explanation: "'-less' means 'without': helpless." },
]);
const suffixAdverbsY2 = build("suffixes", Y2, "GR2-SUF-3", "gold", [
  { prompt: "Which word turns 'quick' into an adverb?", correct: "quickly", distractors: ["quickness", "quickful", "quicker"], explanation: "'-ly' turns the adjective 'quick' into the adverb 'quickly'." },
  { prompt: "Which word turns 'sad' into an adverb?", correct: "sadly", distractors: ["sadness", "sadful", "sader"], explanation: "'-ly' turns the adjective 'sad' into the adverb 'sadly'." },
  { prompt: "Which word turns 'brave' into an adverb?", correct: "bravely", distractors: ["braveness", "braveful", "braver"], explanation: "'-ly' turns the adjective 'brave' into the adverb 'bravely'." },
]);

// --- apostrophes (Y2) ---
const apostrophesContractionY2 = build("apostrophes", Y2, "GR2-APOS-1", "silver", [
  { prompt: "Which is the correct contraction for 'do not'?", correct: "don't", distractors: ["dont", "do'nt", "don''t"], explanation: "The apostrophe replaces the missing 'o' in 'not': don't." },
  { prompt: "Which is the correct contraction for 'cannot'?", correct: "can't", distractors: ["cant", "ca'nt", "can''t"], explanation: "The apostrophe replaces the missing letters in 'not': can't." },
  { prompt: "Which is the correct contraction for 'I am'?", correct: "I'm", distractors: ["Im", "I'am", "I''m"], explanation: "The apostrophe replaces the missing 'a' in 'am': I'm." },
  { prompt: "Which is the correct contraction for 'it is'?", correct: "it's", distractors: ["its'", "i't's", "it''s"], explanation: "The apostrophe replaces the missing 'i' in 'is': it's." },
  { prompt: "Which is the correct contraction for 'she will'?", correct: "she'll", distractors: ["shel'l", "she'wil", "shell"], explanation: "The apostrophe replaces the missing letters in 'will': she'll." },
]);
const apostrophesPossessionY2 = build("apostrophes", Y2, "GR2-APOS-2", "gold", [
  { prompt: "Which correctly shows that the book belongs to the girl?", correct: "the girl's book", distractors: ["the girls book", "the girl's' book", "the girls' book"], explanation: "For one girl, add apostrophe + s: the girl's book." },
  { prompt: "Which correctly shows that the tail belongs to the dog?", correct: "the dog's tail", distractors: ["the dogs tail", "the dog's' tail", "the dogs' tail"], explanation: "For one dog, add apostrophe + s: the dog's tail." },
  { prompt: "Which correctly shows that the bag belongs to Sam?", correct: "Sam's bag", distractors: ["Sams bag", "Sam' bag", "Sams' bag"], explanation: "For a singular name, add apostrophe + s: Sam's bag." },
]);

// --- commas (Y2) ---
const commasListY2 = build("commas", Y2, "GR2-COM-1", "silver", [
  { prompt: "Which sentence about fruit correctly uses commas in a list?", correct: "I bought apples, pears, and grapes.", distractors: ["I bought apples pears and grapes.", "I bought apples, pears and, grapes.", "I bought, apples, pears, and grapes."], explanation: "Commas separate items in a list, with 'and' before the last item." },
  { prompt: "Which sentence about packing correctly uses commas in a list?", correct: "She packed a hat, a coat and some gloves.", distractors: ["She packed a hat a coat and some gloves.", "She packed, a hat, a coat and some gloves.", "She packed a hat, a coat, and, some gloves."], explanation: "Commas go between each item in the list except before 'and' at the end." },
  { prompt: "Which sentence about the zoo correctly uses commas in a list?", correct: "The zoo has lions, tigers and bears.", distractors: ["The zoo has lions tigers and bears.", "The zoo has, lions, tigers and bears.", "The zoo has lions, tigers, and, bears."], explanation: "Commas separate each item in the list of animals." },
]);

export function generateAllGrammarQuestionsY1(seed = 81001): DraftQuestion[] {
  const rng = createRng(seed);
  return [...sentencePunctuationY1(rng), ...joiningWords(rng), ...nounsAndPronouns(rng), ...singularPlural(rng), ...pluralsY1(rng), ...pluralsEsY1(rng)];
}

export function generateAllGrammarQuestionsY2(seed = 82001): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...sentencePunctuationY2(rng),
    ...sentenceTypes(rng),
    ...coordination(rng),
    ...subordination(rng),
    ...pluralsY2(rng),
    ...expandedNounPhrasesY2(rng),
    ...tenseChoiceY2(rng),
    ...progressiveY2(rng),
    ...suffixNounsY2(rng),
    ...suffixAdjectivesY2(rng),
    ...suffixAdverbsY2(rng),
    ...apostrophesContractionY2(rng),
    ...apostrophesPossessionY2(rng),
    ...commasListY2(rng),
  ];
}

// ============================ YEAR 2 — EXTRA BATCH ==========================
// A second, larger pass of items per Y2 objective, written with different
// vocabulary/subjects from the batch above so the pool stays varied rather
// than just longer.

const expandedNounPhrasesY2b = build("expanded-noun-phrases", Y2, "GR2-ENP-1", "silver", [
  { prompt: "Which is an expanded noun phrase describing a dragon?", correct: "the fierce, scaly dragon", distractors: ["the dragon", "a dragon is fierce", "dragon scaly fierce the"], explanation: "Adjectives 'fierce' and 'scaly' expand the noun 'dragon'." },
  { prompt: "Which is an expanded noun phrase describing a forest?", correct: "the dark, quiet forest", distractors: ["the forest", "a forest is dark", "forest quiet dark the"], explanation: "Adjectives 'dark' and 'quiet' expand the noun 'forest'." },
  { prompt: "Which sentence about a giant uses an expanded noun phrase?", correct: "The tall, friendly giant waved.", distractors: ["The giant waved.", "A giant is tall and friendly.", "Waved the giant tall friendly."], explanation: "'The tall, friendly giant' expands the noun 'giant' with two adjectives." },
  { prompt: "Which is an expanded noun phrase describing a puppy?", correct: "the small, fluffy puppy", distractors: ["the puppy", "a puppy is small", "puppy fluffy small the"], explanation: "Adjectives 'small' and 'fluffy' expand the noun 'puppy'." },
  { prompt: "Which is an expanded noun phrase describing a beach?", correct: "the sandy, sunny beach", distractors: ["the beach", "a beach is sandy", "beach sunny sandy the"], explanation: "Adjectives 'sandy' and 'sunny' expand the noun 'beach'." },
  { prompt: "Which sentence uses an expanded noun phrase to describe a spaceship?", correct: "The shiny, silver spaceship landed.", distractors: ["The spaceship landed.", "A spaceship is shiny and silver.", "Landed the spaceship shiny silver."], explanation: "'The shiny, silver spaceship' expands the noun 'spaceship' with two adjectives." },
  { prompt: "Which is an expanded noun phrase describing a witch?", correct: "the wicked, cackling witch", distractors: ["the witch", "a witch is wicked", "witch cackling wicked the"], explanation: "Adjectives 'wicked' and 'cackling' expand the noun 'witch'." },
  { prompt: "Which is an expanded noun phrase describing a river?", correct: "the wide, fast-flowing river", distractors: ["the river", "a river is wide", "river fast flowing wide the"], explanation: "'Wide' and 'fast-flowing' expand the noun 'river'." },
  { prompt: "Which sentence uses an expanded noun phrase to describe a knight?", correct: "The brave, armoured knight charged.", distractors: ["The knight charged.", "A knight is brave and armoured.", "Charged the knight brave armoured."], explanation: "'The brave, armoured knight' expands the noun 'knight'." },
  { prompt: "Which is an expanded noun phrase describing a cave?", correct: "the deep, echoing cave", distractors: ["the cave", "a cave is deep", "cave echoing deep the"], explanation: "Adjectives 'deep' and 'echoing' expand the noun 'cave'." },
  { prompt: "Which is an expanded noun phrase describing a storm?", correct: "the loud, violent storm", distractors: ["the storm", "a storm is loud", "storm violent loud the"], explanation: "Adjectives 'loud' and 'violent' expand the noun 'storm'." },
]);

const tenseChoiceY2b = build("verb-tenses", Y2, "GR2-TEN-1", "silver", [
  { prompt: "Which sentence about visiting the museum uses the past tense correctly?", correct: "Last week, we visited the museum.", distractors: ["Last week, we visit the museum.", "Last week, we visiting the museum.", "Last week, we will visit the museum."], explanation: "'Last week' signals the past tense: 'visited'." },
  { prompt: "Which sentence about the baker uses the present tense correctly?", correct: "Every morning, the baker bakes bread.", distractors: ["Every morning, the baker baked bread.", "Every morning, the baker will bake bread.", "Every morning, the baker baking bread."], explanation: "'Every morning' is a habit happening now, so it uses the present tense: 'bakes'." },
  { prompt: "Which sentence correctly uses the past tense of 'catch'?", correct: "He caught the ball.", distractors: ["He catches the ball.", "He catching the ball.", "He catch the ball."], explanation: "'Caught' is the past tense form of 'catch'." },
  { prompt: "Which sentence correctly uses the present tense of 'wash'?", correct: "She washes the car every Saturday.", distractors: ["She washed the car every Saturday.", "She washing the car every Saturday.", "She wash the car every Saturday."], explanation: "'Washes' agrees with the singular subject 'she' in the present tense." },
  { prompt: "Which sentence about the match uses the past tense correctly?", correct: "Yesterday, the team won the match.", distractors: ["Yesterday, the team win the match.", "Yesterday, the team winning the match.", "Yesterday, the team wins the match."], explanation: "'Won' is the past tense form of 'win', matching 'yesterday'." },
  { prompt: "Which sentence correctly uses the present tense of 'fly'?", correct: "The bird flies south every winter.", distractors: ["The bird flew south every winter.", "The bird flying south every winter.", "The bird fly south every winter."], explanation: "'Flies' agrees with the singular subject 'the bird' in the present tense." },
  { prompt: "Which sentence about losing keys uses the past tense correctly?", correct: "Two days ago, I lost my keys.", distractors: ["Two days ago, I lose my keys.", "Two days ago, I losing my keys.", "Two days ago, I will lose my keys."], explanation: "'Lost' is the past tense form of 'lose'." },
  { prompt: "Which sentence correctly uses the present tense of 'carry'?", correct: "She carries her bag to school.", distractors: ["She carried her bag to school.", "She carrying her bag to school.", "She carry her bag to school."], explanation: "'Carries' agrees with the singular subject 'she' in the present tense." },
  { prompt: "Which sentence about last night's rain uses the past tense correctly?", correct: "Last night, it rained heavily.", distractors: ["Last night, it rains heavily.", "Last night, it raining heavily.", "Last night, it will rain heavily."], explanation: "'Rained' is the correct past tense form, matching 'last night'." },
  { prompt: "Which sentence about the sun uses the present tense correctly?", correct: "The sun rises in the east.", distractors: ["The sun rose in the east.", "The sun rising in the east.", "The sun will rise in the east, always."], explanation: "This describes a fact that is always true, so it uses the present tense: 'rises'." },
]);

const progressiveY2b = build("verb-tenses", Y2, "GR2-TEN-2", "gold", [
  { prompt: "Which sentence about painting correctly uses the present progressive form?", correct: "He is painting the fence.", distractors: ["He paints the fence.", "He painted the fence.", "He paint the fence."], explanation: "The present progressive uses 'is' + verb-ing: 'is painting'." },
  { prompt: "Which sentence correctly uses the past progressive form for baking?", correct: "They were baking a cake.", distractors: ["They bake a cake.", "They baked a cake.", "They baking a cake, were."], explanation: "The past progressive uses 'were' + verb-ing for a plural subject: 'were baking'." },
  { prompt: "Which sentence about jumping correctly uses the present progressive form?", correct: "The frogs are jumping into the pond.", distractors: ["The frogs jump into the pond.", "The frogs jumped into the pond.", "The frogs jumping-into the pond."], explanation: "The present progressive uses 'are' + verb-ing for a plural subject: 'are jumping'." },
  { prompt: "Which sentence correctly uses the past progressive form for reading?", correct: "I was reading my favourite book.", distractors: ["I read my favourite book.", "I reads my favourite book.", "I reading my favourite book, was."], explanation: "The past progressive uses 'was' + verb-ing: 'was reading'." },
  { prompt: "Which sentence about laughing correctly uses the present progressive form?", correct: "The children are laughing loudly.", distractors: ["The children laugh loudly.", "The children laughed loudly.", "The children laughing-loudly."], explanation: "The present progressive uses 'are' + verb-ing for a plural subject: 'are laughing'." },
  { prompt: "Which sentence correctly uses the past progressive form for cooking?", correct: "Mum was cooking dinner when I arrived.", distractors: ["Mum cooks dinner when I arrived.", "Mum cooked dinner when I arrived.", "Mum cooking dinner when I arrived, was."], explanation: "The past progressive uses 'was' + verb-ing to show an ongoing action: 'was cooking'." },
]);

const suffixNounsY2b = build("suffixes", Y2, "GR2-SUF-1", "bronze", [
  { prompt: "Which word describes someone who paints, formed with a suffix?", correct: "painter", distractors: ["paintness", "paintful", "paintly"], explanation: "'-er' turns the verb 'paint' into a person noun: painter." },
  { prompt: "Which word means 'the quality of being dark', formed with a suffix?", correct: "darkness", distractors: ["darkful", "darkly", "darkify"], explanation: "'-ness' turns the adjective 'dark' into a noun: darkness." },
  { prompt: "Which word describes someone who sings, formed with a suffix?", correct: "singer", distractors: ["singness", "singful", "singly"], explanation: "'-er' turns the verb 'sing' into a person noun: singer." },
  { prompt: "Which word means 'the quality of being ill', formed with a suffix?", correct: "illness", distractors: ["illful", "illly", "illify"], explanation: "'-ness' turns the adjective 'ill' into a noun: illness." },
  { prompt: "Which word describes someone who works, formed with a suffix?", correct: "worker", distractors: ["workness", "workful", "workly"], explanation: "'-er' turns the verb 'work' into a person noun: worker." },
  { prompt: "Which word means 'the quality of being fit', formed with a suffix?", correct: "fitness", distractors: ["fitful", "fitly", "fitify"], explanation: "'-ness' turns the adjective 'fit' into a noun: fitness." },
  { prompt: "Which word describes someone who swims, formed with a suffix?", correct: "swimmer", distractors: ["swimness", "swimful", "swimly"], explanation: "'-er' turns the verb 'swim' into a person noun: swimmer." },
]);

const suffixAdjectivesY2b = build("suffixes", Y2, "GR2-SUF-2", "silver", [
  { prompt: "Which word means 'full of colour', formed with a suffix?", correct: "colourful", distractors: ["colourness", "colourly", "colourer"], explanation: "'-ful' means 'full of': colourful." },
  { prompt: "Which word means 'without power', formed with a suffix?", correct: "powerless", distractors: ["powerful", "powerness", "powerly"], explanation: "'-less' means 'without': powerless." },
  { prompt: "Which word means 'full of thanks', formed with a suffix?", correct: "thankful", distractors: ["thankness", "thankly", "thanker"], explanation: "'-ful' means 'full of': thankful." },
  { prompt: "Which word means 'without a home', formed with a suffix?", correct: "homeless", distractors: ["homeful", "homeness", "homely"], explanation: "'-less' means 'without': homeless." },
  { prompt: "Which word means 'full of harm', formed with a suffix?", correct: "harmful", distractors: ["harmness", "harmly", "harmer"], explanation: "'-ful' means 'full of': harmful." },
  { prompt: "Which word means 'without a sound', formed with a suffix?", correct: "soundless", distractors: ["soundful", "soundness", "soundly"], explanation: "'-less' means 'without': soundless." },
]);

const suffixAdverbsY2b = build("suffixes", Y2, "GR2-SUF-3", "gold", [
  { prompt: "Which word turns 'slow' into an adverb?", correct: "slowly", distractors: ["slowness", "slowful", "slower"], explanation: "'-ly' turns the adjective 'slow' into the adverb 'slowly'." },
  { prompt: "Which word turns 'loud' into an adverb?", correct: "loudly", distractors: ["loudness", "loudful", "louder"], explanation: "'-ly' turns the adjective 'loud' into the adverb 'loudly'." },
  { prompt: "Which word turns 'soft' into an adverb?", correct: "softly", distractors: ["softness", "softful", "softer"], explanation: "'-ly' turns the adjective 'soft' into the adverb 'softly'." },
  { prompt: "Which word turns 'kind' into an adverb?", correct: "kindly", distractors: ["kindness", "kindful", "kinder"], explanation: "'-ly' turns the adjective 'kind' into the adverb 'kindly'." },
  { prompt: "Which word turns 'safe' into an adverb?", correct: "safely", distractors: ["safeness", "safeful", "safer"], explanation: "'-ly' turns the adjective 'safe' into the adverb 'safely'." },
]);

const apostrophesContractionY2b = build("apostrophes", Y2, "GR2-APOS-1", "silver", [
  { prompt: "Which is the correct contraction for 'did not'?", correct: "didn't", distractors: ["didnt", "did'nt", "didn''t"], explanation: "The apostrophe replaces the missing 'o' in 'not': didn't." },
  { prompt: "Which is the correct contraction for 'is not'?", correct: "isn't", distractors: ["isnt", "is'nt", "isn''t"], explanation: "The apostrophe replaces the missing 'o' in 'not': isn't." },
  { prompt: "Which is the correct contraction for 'they will'?", correct: "they'll", distractors: ["theyl'l", "they'wil", "theyll"], explanation: "The apostrophe replaces the missing letters in 'will': they'll." },
  { prompt: "Which is the correct contraction for 'we are'?", correct: "we're", distractors: ["were", "we'are", "we''re"], explanation: "The apostrophe replaces the missing 'a' in 'are': we're." },
  { prompt: "Which is the correct contraction for 'you have'?", correct: "you've", distractors: ["youve", "you'ave", "you''ve"], explanation: "The apostrophe replaces the missing 'ha' in 'have': you've." },
  { prompt: "Which is the correct contraction for 'was not'?", correct: "wasn't", distractors: ["wasnt", "was'nt", "wasn''t"], explanation: "The apostrophe replaces the missing 'o' in 'not': wasn't." },
]);

const apostrophesPossessionY2b = build("apostrophes", Y2, "GR2-APOS-2", "gold", [
  { prompt: "Which correctly shows that the ball belongs to the boy?", correct: "the boy's ball", distractors: ["the boys ball", "the boy's' ball", "the boys' ball"], explanation: "For one boy, add apostrophe + s: the boy's ball." },
  { prompt: "Which correctly shows that the collar belongs to the cat?", correct: "the cat's collar", distractors: ["the cats collar", "the cat's' collar", "the cats' collar"], explanation: "For one cat, add apostrophe + s: the cat's collar." },
  { prompt: "Which correctly shows that the hat belongs to Leo?", correct: "Leo's hat", distractors: ["Leos hat", "Leo' hat", "Leos' hat"], explanation: "For a singular name, add apostrophe + s: Leo's hat." },
  { prompt: "Which correctly shows that the shell belongs to the crab?", correct: "the crab's shell", distractors: ["the crabs shell", "the crab's' shell", "the crabs' shell"], explanation: "For one crab, add apostrophe + s: the crab's shell." },
  { prompt: "Which correctly shows that the wing belongs to the bird?", correct: "the bird's wing", distractors: ["the birds wing", "the bird's' wing", "the birds' wing"], explanation: "For one bird, add apostrophe + s: the bird's wing." },
]);

const commasListY2b = build("commas", Y2, "GR2-COM-1", "silver", [
  { prompt: "Which sentence about pets correctly uses commas in a list?", correct: "She has a cat, a dog and a hamster.", distractors: ["She has a cat a dog and a hamster.", "She has, a cat, a dog and a hamster.", "She has a cat, a dog, and, a hamster."], explanation: "Commas separate items in the list, with 'and' before the last item." },
  { prompt: "Which sentence about colours correctly uses commas in a list?", correct: "The flag is red, white and blue.", distractors: ["The flag is red white and blue.", "The flag is, red, white and blue.", "The flag is red, white, and, blue."], explanation: "Commas go between each colour in the list." },
  { prompt: "Which sentence about the picnic correctly uses commas in a list?", correct: "We packed sandwiches, crisps and juice.", distractors: ["We packed sandwiches crisps and juice.", "We packed, sandwiches, crisps and juice.", "We packed sandwiches, crisps, and, juice."], explanation: "Commas separate each item packed for the picnic." },
  { prompt: "Which sentence about the classroom correctly uses commas in a list?", correct: "The classroom has desks, chairs and books.", distractors: ["The classroom has desks chairs and books.", "The classroom has, desks, chairs and books.", "The classroom has desks, chairs, and, books."], explanation: "Commas separate each item in the classroom list." },
  { prompt: "Which sentence about tropical fruit correctly uses commas in a list?", correct: "I like mangoes, plums and cherries.", distractors: ["I like mangoes plums and cherries.", "I like, mangoes, plums and cherries.", "I like mangoes, plums, and, cherries."], explanation: "Commas separate each fruit in the list, with 'and' before the last one." },
]);

const sentencePunctuationY2b = build("sentence-punctuation", Y2, "GR2-PUNC-1", "silver", [
  { prompt: "Which sentence about swimming uses capital letters and full stops correctly?", correct: "Leo and Mia went swimming.", distractors: ["leo and Mia went swimming.", "Leo and mia went swimming.", "Leo and Mia went Swimming."], explanation: "Only the first word and proper nouns need capital letters; the sentence ends with a full stop." },
  { prompt: "Which sentence about homework correctly uses a question mark?", correct: "Have you finished your homework?", distractors: ["Have you finished your homework.", "have you finished your homework?", "Have you finished your homework!"], explanation: "A question needs a capital letter at the start and a question mark at the end." },
  { prompt: "Which sentence about a goal is punctuated correctly?", correct: "What a fantastic goal!", distractors: ["what a fantastic goal!", "What a fantastic goal.", "What a fantastic goal?"], explanation: "An exclamation needs a capital letter and an exclamation mark." },
  { prompt: "Which sentence correctly uses capital letters for a name and a place?", correct: "Aisha lives in Cardiff.", distractors: ["aisha lives in cardiff.", "Aisha lives in cardiff.", "aisha lives in Cardiff."], explanation: "Names and place names always start with a capital letter." },
  { prompt: "Which sentence about tidying up is correctly punctuated as a command?", correct: "Tidy your room.", distractors: ["tidy your room.", "Tidy your room", "Tidy your Room."], explanation: "A command still needs a capital letter and a full stop." },
]);

const sentenceTypesB = build("sentence-types", Y2, "GR2-SENT-1", "silver", [
  { prompt: "What type of sentence is this: 'The cat is sleeping.'?", correct: "statement", distractors: ["question", "exclamation", "command"], explanation: "A statement tells you something and ends with a full stop." },
  { prompt: "What type of sentence is this: 'What time is it?'?", correct: "question", distractors: ["statement", "exclamation", "command"], explanation: "A question asks something and ends with a question mark." },
  { prompt: "What type of sentence is this: 'What a huge castle!'?", correct: "exclamation", distractors: ["statement", "question", "command"], explanation: "An exclamation shows strong feeling and ends with an exclamation mark." },
  { prompt: "What type of sentence is this: 'Close the window.'?", correct: "command", distractors: ["statement", "question", "exclamation"], explanation: "A command tells someone to do something." },
  { prompt: "Which sentence about washing hands is a command?", correct: "Wash your hands before dinner.", distractors: ["Have you washed your hands?", "I have washed my hands.", "How clean my hands are!"], explanation: "'Wash your hands before dinner' instructs someone to do something, making it a command." },
  { prompt: "Which sentence about a pencil is a question?", correct: "Where did you put my pencil?", distractors: ["I put your pencil away.", "Put your pencil away!", "Put the pencil away."], explanation: "'Where did you put my pencil?' is asking something, so it's a question." },
]);

const coordinationB = build("coordination-subordination", Y2, "GR2-COORD-1", "silver", [
  { prompt: "Which word correctly joins: 'I could have juice ___ water.'?", correct: "or", distractors: ["and", "but", "because"], explanation: "'Or' shows a choice between two things." },
  { prompt: "Which word correctly joins: 'The cake looked lovely, ___ it tasted awful.'?", correct: "but", distractors: ["and", "or", "so"], explanation: "'But' shows a contrast between two ideas." },
  { prompt: "Which word correctly joins: 'I like drawing ___ painting.'?", correct: "and", distractors: ["but", "or", "so"], explanation: "'And' adds one thing to another." },
  { prompt: "Which sentence correctly uses 'or' to show a choice?", correct: "Would you like tea or coffee?", distractors: ["Would you like tea and coffee, or?", "Would you like tea, or, coffee?", "Would you or like tea coffee?"], explanation: "'Or' links two alternatives in a question about choice." },
]);
const subordinationB = build("coordination-subordination", Y2, "GR2-COORD-2", "gold", [
  { prompt: "Which word correctly joins: 'We couldn't go outside ___ it was snowing.'?", correct: "because", distractors: ["and", "or", "but"], explanation: "'Because' explains the reason." },
  { prompt: "Which word correctly joins: 'I will call you ___ I arrive.'?", correct: "when", distractors: ["and", "but", "or"], explanation: "'When' shows the timing of the action." },
  { prompt: "Which word correctly joins: 'Take a coat ___ it gets cold.'?", correct: "if", distractors: ["and", "but", "or"], explanation: "'If' introduces a condition." },
  { prompt: "Which word correctly completes: 'She knew ___ she had won the race.'?", correct: "that", distractors: ["and", "but", "or"], explanation: "'That' introduces what she knew." },
]);

const pluralsY2b = build("plurals", Y2, "GR2-PLU-1", "gold", [
  { prompt: "What is the plural of 'story'?", correct: "stories", distractors: ["storys", "storyes", "story's"], explanation: "Words ending in a consonant + 'y' change 'y' to 'ies': story → stories." },
  { prompt: "What is the plural of 'puppy'?", correct: "puppies", distractors: ["puppys", "puppyes", "puppy's"], explanation: "Words ending in a consonant + 'y' change 'y' to 'ies': puppy → puppies." },
  { prompt: "What is the plural of 'family'?", correct: "families", distractors: ["familys", "familyes", "family's"], explanation: "Words ending in a consonant + 'y' change 'y' to 'ies': family → families." },
  { prompt: "What is the plural of 'key'?", correct: "keys", distractors: ["kies", "keyes", "key's"], explanation: "When 'y' follows a vowel, just add 's': key → keys." },
  { prompt: "What is the plural of 'lady'?", correct: "ladies", distractors: ["ladys", "ladyes", "lady's"], explanation: "Words ending in a consonant + 'y' change 'y' to 'ies': lady → ladies." },
]);

export function generateAllGrammarQuestionsY2Extra(seed = 92001): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...expandedNounPhrasesY2b(rng),
    ...tenseChoiceY2b(rng),
    ...progressiveY2b(rng),
    ...suffixNounsY2b(rng),
    ...suffixAdjectivesY2b(rng),
    ...suffixAdverbsY2b(rng),
    ...apostrophesContractionY2b(rng),
    ...apostrophesPossessionY2b(rng),
    ...commasListY2b(rng),
    ...sentencePunctuationY2b(rng),
    ...sentenceTypesB(rng),
    ...coordinationB(rng),
    ...subordinationB(rng),
    ...pluralsY2b(rng),
  ];
}

// ============================ YEAR 2 — THIRD BATCH ==========================
// A third, smaller pass to close the remaining gap to the target volume.

const expandedNounPhrasesY2c = build("expanded-noun-phrases", Y2, "GR2-ENP-1", "silver", [
  { prompt: "Which is an expanded noun phrase describing a robot?", correct: "the clunky, metal robot", distractors: ["the robot", "a robot is clunky", "robot metal clunky the"], explanation: "Adjectives 'clunky' and 'metal' expand the noun 'robot'." },
  { prompt: "Which is an expanded noun phrase describing a mountain?", correct: "the tall, snowy mountain", distractors: ["the mountain", "a mountain is tall", "mountain snowy tall the"], explanation: "Adjectives 'tall' and 'snowy' expand the noun 'mountain'." },
  { prompt: "Which sentence about a gate uses an expanded noun phrase?", correct: "The old, rusty gate creaked.", distractors: ["The gate creaked.", "A gate is old and rusty.", "Creaked the gate old rusty."], explanation: "'The old, rusty gate' expands the noun 'gate' with two adjectives." },
  { prompt: "Which is an expanded noun phrase describing a pirate ship?", correct: "the fast, wooden pirate ship", distractors: ["the pirate ship", "a pirate ship is fast", "ship pirate wooden fast the"], explanation: "Adjectives 'fast' and 'wooden' expand the noun phrase 'pirate ship'." },
]);
const tenseChoiceY2c = build("verb-tenses", Y2, "GR2-TEN-1", "silver", [
  { prompt: "Which sentence correctly uses the past tense of 'buy'?", correct: "We bought new shoes.", distractors: ["We buys new shoes.", "We buying new shoes.", "We buy new shoes."], explanation: "'Bought' is the past tense form of 'buy'." },
  { prompt: "Which sentence correctly uses the present tense of 'teach'?", correct: "Mr Diallo teaches Year 2.", distractors: ["Mr Diallo taught Year 2.", "Mr Diallo teaching Year 2.", "Mr Diallo teach Year 2."], explanation: "'Teaches' agrees with the singular subject 'Mr Diallo' in the present tense." },
  { prompt: "Which sentence about finding a coin uses the past tense correctly?", correct: "This morning, I found a coin.", distractors: ["This morning, I find a coin.", "This morning, I finding a coin.", "This morning, I will find a coin."], explanation: "'Found' is the past tense of 'find', matching 'this morning'." },
]);
const suffixAdjectivesY2c = build("suffixes", Y2, "GR2-SUF-2", "silver", [
  { prompt: "Which word means 'full of use', formed with a suffix?", correct: "useful", distractors: ["useness", "usely", "user"], explanation: "'-ful' means 'full of': useful." },
  { prompt: "Which word means 'without hope', formed with a suffix?", correct: "hopeless", distractors: ["hopeful", "hopeness", "hopely"], explanation: "'-less' means 'without': hopeless." },
  { prompt: "Which word means 'full of pain', formed with a suffix?", correct: "painful", distractors: ["painness", "painly", "painer"], explanation: "'-ful' means 'full of': painful." },
]);
const apostrophesPossessionY2c = build("apostrophes", Y2, "GR2-APOS-2", "gold", [
  { prompt: "Which correctly shows that the nest belongs to the bird?", correct: "the bird's nest", distractors: ["the birds nest", "the bird's' nest", "the birds' nest"], explanation: "For one bird, add apostrophe + s: the bird's nest." },
  { prompt: "Which correctly shows that the toy belongs to Zara?", correct: "Zara's toy", distractors: ["Zaras toy", "Zara' toy", "Zaras' toy"], explanation: "For a singular name, add apostrophe + s: Zara's toy." },
  { prompt: "Which correctly shows that the trunk belongs to the elephant?", correct: "the elephant's trunk", distractors: ["the elephants trunk", "the elephant's' trunk", "the elephants' trunk"], explanation: "For one elephant, add apostrophe + s: the elephant's trunk." },
]);
const commasListY2c = build("commas", Y2, "GR2-COM-1", "silver", [
  { prompt: "Which sentence about the farm correctly uses commas in a list?", correct: "The farm has cows, sheep and pigs.", distractors: ["The farm has cows sheep and pigs.", "The farm has, cows, sheep and pigs.", "The farm has cows, sheep, and, pigs."], explanation: "Commas separate each animal in the list." },
  { prompt: "Which sentence about the weekend correctly uses commas in a list?", correct: "We played games, watched films and baked cakes.", distractors: ["We played games watched films and baked cakes.", "We played, games, watched films and baked cakes.", "We played games, watched films, and, baked cakes."], explanation: "Commas separate each activity in the list." },
]);
const sentenceTypesC = build("sentence-types", Y2, "GR2-SENT-1", "silver", [
  { prompt: "Which sentence about a storm is an exclamation?", correct: "What a scary storm!", distractors: ["What a scary storm.", "Is that a scary storm?", "Tell me about the storm."], explanation: "'What a scary storm!' shows strong feeling, making it an exclamation." },
  { prompt: "Which sentence about the library is a statement?", correct: "The library closes at five o'clock.", distractors: ["Does the library close at five?", "Close the library at five!", "Close the library."], explanation: "A statement simply gives information." },
]);
const coordinationC = build("coordination-subordination", Y2, "GR2-COORD-1", "silver", [
  { prompt: "Which word correctly joins: 'She wanted to run, ___ her leg hurt.'?", correct: "but", distractors: ["and", "or", "because"], explanation: "'But' shows a contrast between wanting to run and the leg hurting." },
  { prompt: "Which word correctly joins: 'We can walk ___ take the bus.'?", correct: "or", distractors: ["and", "but", "so"], explanation: "'Or' shows a choice between two options." },
]);
const pluralsY2c = build("plurals", Y2, "GR2-PLU-1", "gold", [
  { prompt: "What is the plural of 'country'?", correct: "countries", distractors: ["countrys", "countryes", "country's"], explanation: "Words ending in a consonant + 'y' change 'y' to 'ies': country → countries." },
  { prompt: "What is the plural of 'monkey'?", correct: "monkeys", distractors: ["monkies", "monkeyes", "monkey's"], explanation: "When 'y' follows a vowel, just add 's': monkey → monkeys." },
  { prompt: "What is the plural of 'berry'?", correct: "berries", distractors: ["berrys", "berryes", "berry's"], explanation: "Words ending in a consonant + 'y' change 'y' to 'ies': berry → berries." },
]);

export function generateAllGrammarQuestionsY2Extra2(seed = 102001): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...expandedNounPhrasesY2c(rng),
    ...tenseChoiceY2c(rng),
    ...suffixAdjectivesY2c(rng),
    ...apostrophesPossessionY2c(rng),
    ...commasListY2c(rng),
    ...sentenceTypesC(rng),
    ...coordinationC(rng),
    ...pluralsY2c(rng),
  ];
}
