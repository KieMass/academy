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
