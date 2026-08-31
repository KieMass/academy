/**
 * Data-table-driven Guyana Spelling generators (Grades 1-6) — Spelling is a
 * brand-new subject for Guyana (see content/curriculum/guyana/
 * spelling.json), distinct from Grammar's own "spelling-patterns" strand:
 * this subject goes deeper on homophones, affixes and word-building than
 * Grammar's single spelling objective per grade has room for. Mirrors
 * grammar-guyana.ts's word-table pattern, which is exactly this subject's
 * shape ("pick/complete the correctly spelled word").
 */
import { createRng, shuffle, type Rng } from "./rng";
import type { DraftQuestion } from "./types";
import type { DifficultyBand, YearGroup } from "@/lib/curriculum/types";

const SUBJECT = "spelling";

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

// A row is [prompt, correct answer, distractors, explanation].
type Row = [string, string, string[], string];

function rowsToQuestions(rng: Rng, rows: Row[], strandSlug: string, yearGroup: YearGroup, objectiveCode: string, difficulty: DifficultyBand): DraftQuestion[] {
  return rows.map(([promptText, correct, distractors, explanation]) => mc(rng, { strandSlug, yearGroup, objectiveCode, difficulty, promptText, correct, distractors, explanation }));
}

// ===================== HOMOPHONES AND TRICKY WORDS ===========================

const y1Homophones: Row[] = [
  ["Which spelling is correct? 'She ___ hello to her friend.'", "said", ["sed", "sayed", "seid"], "\"Said\" is the correct spelling of this common high-frequency word."],
  ["Which spelling is correct? 'It ___ a sunny day.'", "was", ["wuz", "waz", "wus"], "\"Was\" is the correct spelling of this common high-frequency word."],
  ["Which spelling is correct? 'Is this book for ___?'", "you", ["yu", "yhu", "yoou"], "\"You\" is the correct spelling of this common high-frequency word."],
  ["Which spelling is correct? '___ dog ran across the yard.'", "the", ["th", "de", "thi"], "\"The\" is the correct spelling of this common high-frequency word."],
  ["Which spelling is correct? '___ went to the market together.'", "they", ["thay", "thei", "dey"], "\"They\" is the correct spelling of this common high-frequency word."],
  ["Which spelling is correct? 'I ___ two brothers.'", "have", ["hav", "haev", "habe"], "\"Have\" is the correct spelling of this common high-frequency word."],
  ["Which spelling is correct? 'Please ___ here.'", "come", ["cum", "kome", "comme"], "\"Come\" is the correct spelling of this common high-frequency word."],
  ["Which spelling is correct? 'May I have ___ juice?'", "some", ["sum", "som", "sume"], "\"Some\" is the correct spelling of this common high-frequency word."],
];

const y2Homophones: Row[] = [
  ["Which spelling means moving in a direction, as in 'going ___ school'?", "to", ["too", "two"], "\"To\" is used to show direction or movement toward something."],
  ["Which spelling means 'also' or 'as well'?", "too", ["to", "two"], "\"Too\" means 'also', as in \"I want to come too.\""],
  ["Which spelling is the number that comes after one?", "two", ["to", "too"], "\"Two\" is the number 2."],
  ["Which spelling means 'belonging to them'?", "their", ["there", "they're"], "\"Their\" shows something belongs to them."],
  ["Which spelling means 'in that place'?", "there", ["their", "they're"], "\"There\" refers to a place."],
  ["I want ___ go home.", "to", ["too", "two"], "\"To\" is used before a verb to show direction, as in \"to go\"."],
  ["She has ___ many toys.", "too", ["to", "two"], "\"Too\" means 'more than enough' here."],
  ["I have ___ apples.", "two", ["to", "too"], "\"Two\" is the number of apples."],
  ["That is ___ house.", "their", ["there", "they're"], "\"Their\" shows the house belongs to them."],
  ["Put it over ___.", "there", ["their", "they're"], "\"There\" points to a place."],
];

const y3Homophones: Row[] = [
  ["The dog wagged ___ tail.", "its", ["it's"], "\"Its\" shows possession (belonging to it); \"it's\" is short for \"it is\"."],
  ["___ raining outside.", "It's", ["Its"], "\"It's\" is short for \"it is\"."],
  ["Please bring ___ book to class.", "your", ["you're"], "\"Your\" shows possession; \"you're\" is short for \"you are\"."],
  ["___ going to enjoy this story.", "You're", ["Your"], "\"You're\" is short for \"you are\"."],
  ["The cat licked ___ paw.", "its", ["it's"], "\"Its\" shows the paw belongs to the cat."],
  ["I think ___ right about the answer.", "you're", ["your"], "\"You're\" is short for \"you are\"."],
  ["___ a beautiful day today.", "It's", ["Its"], "\"It's\" is short for \"it is\"."],
  ["Is this ___ pencil case?", "your", ["you're"], "\"Your\" shows possession."],
];

const y4Homophones: Row[] = [
  ["___ turn is it to read?", "Whose", ["Who's"], "\"Whose\" shows possession; \"who's\" is short for \"who is\"."],
  ["___ coming to the party?", "Who's", ["Whose"], "\"Who's\" is short for \"who is\"."],
  ["The rain will ___ our picnic plans.", "affect", ["effect"], "\"Affect\" is usually a verb meaning to influence something."],
  ["One ___ of the rain was a cancelled game.", "effect", ["affect"], "\"Effect\" is usually a noun meaning a result."],
  ["___ bag is this on the floor?", "Whose", ["Who's"], "\"Whose\" shows possession."],
  ["___ responsible for locking the classroom?", "Who's", ["Whose"], "\"Who's\" is short for \"who is\"."],
  ["Not sleeping enough can ___ your concentration.", "affect", ["effect"], "\"Affect\" (verb) means to influence."],
  ["The new rule had a positive ___ on behaviour.", "effect", ["affect"], "\"Effect\" (noun) means a result."],
];

const y5Homophones: Row[] = [
  ["I need to ___ my spelling every day.", "practise", ["practice"], "\"Practise\" is the verb form (in British/CXC spelling); \"practice\" is the noun."],
  ["Football ___ starts at four o'clock.", "practice", ["practise"], "\"Practice\" is the noun form; \"practise\" is the verb."],
  ["The bus remained ___ at the red light.", "stationary", ["stationery"], "\"Stationary\" means not moving."],
  ["We bought pens and paper from the ___ shop.", "stationery", ["stationary"], "\"Stationery\" refers to writing materials like paper and pens."],
  ["The school ___ gave a speech at assembly.", "principal", ["principle"], "\"Principal\" refers to the head of a school."],
  ["Honesty is an important ___ to live by.", "principle", ["principal"], "\"Principle\" means a fundamental rule or belief."],
  ["She gave her friend a nice ___ on the new haircut.", "compliment", ["complement"], "\"Compliment\" means a kind remark."],
  ["The scarf was a perfect ___ to her outfit.", "complement", ["compliment"], "\"Complement\" means something that completes or goes well with another thing."],
];

const y6Homophones: Row[] = [
  ["After the meal, we had a sweet ___.", "dessert", ["desert"], "\"Dessert\" is a sweet course eaten after a meal."],
  ["The camel crossed the dry, sandy ___.", "desert", ["dessert"], "A \"desert\" is a dry, sandy region."],
  ["Please read the instructions ___ so everyone can hear.", "aloud", ["allowed"], "\"Aloud\" means out loud, so others can hear."],
  ["We were ___ to leave early today.", "allowed", ["aloud"], "\"Allowed\" means given permission."],
  ["We walked down the ___ to find our seats.", "aisle", ["isle"], "An \"aisle\" is a walkway between rows of seats."],
  ["Guyana lies near a small ___ off the coast.", "isle", ["aisle"], "An \"isle\" is a small island."],
  ["The driver had to ___ suddenly to avoid the dog.", "brake", ["break"], "\"Brake\" means to slow or stop a vehicle."],
  ["Be careful not to ___ the glass vase.", "break", ["brake"], "\"Break\" means to smash or damage something."],
  ["The recipe calls for a handful of dried ___.", "currants", ["currents"], "\"Currants\" are small dried fruit."],
  ["Strong ocean ___ can be dangerous for swimmers.", "currents", ["currants"], "\"Currents\" are the moving flow of water in the sea."],
];

// ===================== PLURALS, PREFIXES AND SUFFIXES ========================

const y1Plurals: Row[] = [
  ["What is the plural of 'cat'?", "cats", ["cates", "catss", "caths"], "Add -s to most nouns to make them plural: cat → cats."],
  ["What is the plural of 'dog'?", "dogs", ["doges", "dogges", "dogs's"], "Add -s to most nouns to make them plural: dog → dogs."],
  ["What is the plural of 'book'?", "books", ["bookes", "bookis", "bookss"], "Add -s to most nouns to make them plural: book → books."],
  ["What is the plural of 'chair'?", "chairs", ["chaires", "chairis", "chairss"], "Add -s to most nouns to make them plural: chair → chairs."],
  ["What is the plural of 'ball'?", "balls", ["balles", "ballis", "ballss"], "Add -s to most nouns to make them plural: ball → balls."],
  ["What is the plural of 'pen'?", "pens", ["penes", "pennis", "penns"], "Add -s to most nouns to make them plural: pen → pens."],
];

const y2Plurals: Row[] = [
  ["What is the plural of 'box'?", "boxes", ["boxs", "boxies", "box"], "Nouns ending in -x add -es to form the plural: box → boxes."],
  ["What is the plural of 'bus'?", "buses", ["buss", "busies", "bus"], "Nouns ending in -s add -es to form the plural: bus → buses."],
  ["What is the plural of 'brush'?", "brushes", ["brushs", "brushies", "brush"], "Nouns ending in -sh add -es to form the plural: brush → brushes."],
  ["What is the plural of 'watch'?", "watches", ["watchs", "watchies", "watch"], "Nouns ending in -ch add -es to form the plural: watch → watches."],
  ["What is the plural of 'baby'?", "babies", ["babys", "babyes", "baby"], "Nouns ending in a consonant + y change y to i and add -es: baby → babies."],
  ["What is the plural of 'city'?", "cities", ["citys", "cityes", "city"], "Nouns ending in a consonant + y change y to i and add -es: city → cities."],
  ["What is the plural of 'toy'?", "toys", ["toies", "toyes", "toy"], "Nouns ending in a vowel + y simply add -s: toy → toys."],
];

const y3PrefixSuffix: Row[] = [
  ["Add the correct prefix to make the opposite of 'happy':", "unhappy", ["dishappy", "rehappy", "mishappy"], "The prefix un- makes the opposite of happy: unhappy."],
  ["Add the correct prefix to make the opposite of 'agree':", "disagree", ["unagree", "reagree", "misagree"], "The prefix dis- makes the opposite of agree: disagree."],
  ["Add the prefix meaning 'again' to 'read':", "reread", ["unread", "disread", "misread"], "The prefix re- means 'again': reread means to read again."],
  ["Add the correct suffix to 'help' to mean 'without help':", "helpless", ["helpful", "helpness", "helping"], "The suffix -less means 'without': helpless means without help."],
  ["Add the correct suffix to 'colour' to mean 'full of colour':", "colourful", ["colourless", "colourness", "colouring"], "The suffix -ful means 'full of': colourful means full of colour."],
  ["Add the correct prefix meaning 'not' to 'kind':", "unkind", ["diskind", "rekind", "miskind"], "The prefix un- means 'not': unkind means not kind."],
  ["Add the correct suffix to 'pain' to mean 'without pain':", "painless", ["painful", "painness", "paining"], "The suffix -less means 'without': painless means without pain."],
];

const y4Suffixing: Row[] = [
  ["Add '-ing' to 'hope':", "hoping", ["hopeing", "hopping", "hopeng"], "Drop the silent -e before adding -ing: hope → hoping."],
  ["Add '-ing' to 'hop':", "hopping", ["hoping", "hopeing", "hopng"], "Double the final consonant after a short vowel before adding -ing: hop → hopping."],
  ["Add '-ed' to 'stop':", "stopped", ["stoped", "stopeed", "stopd"], "Double the final consonant after a short vowel before adding -ed: stop → stopped."],
  ["Add '-ed' to 'like':", "liked", ["likeed", "likked", "likd"], "Drop the silent -e before adding -ed: like → liked."],
  ["Add '-er' to 'run' to name a person who runs:", "runner", ["runer", "runnner", "runeer"], "Double the final consonant after a short vowel before adding -er: run → runner."],
  ["Add '-ing' to 'write':", "writing", ["writeing", "writting", "writng"], "Drop the silent -e before adding -ing: write → writing."],
  ["Add '-ed' to 'clap':", "clapped", ["claped", "clappped", "clapd"], "Double the final consonant after a short vowel before adding -ed: clap → clapped."],
];

const y5AdvancedSuffix: Row[] = [
  ["Complete the word: fero____ (fierce and violent)", "ferocious", ["ferotious", "ferocial", "ferotial"], "The -cious ending is used after 'ferо': ferocious."],
  ["Complete the word: ambi____ (having a strong desire to succeed)", "ambitious", ["ambicious", "ambitial", "ambicial"], "The -tious ending is used after 'ambi': ambitious."],
  ["Complete the word: spe____ (not ordinary)", "special", ["speshal", "specail", "specal"], "The -cial ending is used after 'spe': special."],
  ["Complete the word: essen____ (absolutely necessary)", "essential", ["essencial", "essentous", "essentail"], "The -tial ending is used after 'essen': essential."],
  ["Complete the word: preci____ (valuable)", "precious", ["precitious", "precial", "precitial"], "The -cious ending is used after 'preci': precious."],
  ["Complete the word: cau____ (careful)", "cautious", ["caucious", "cautial", "causious"], "The -tious ending is used after 'cau': cautious."],
  ["Complete the word: benefi____ (helpful)", "beneficial", ["beneficious", "benefitial", "beneficous"], "The -cial ending is used after 'benefi': beneficial."],
];

const y6RootsAffixes: Row[] = [
  ["The word 'unbelievable' contains the root word:", "believe", ["belief", "believable", "believing"], "\"Believe\" is the root; un- and -able are added to build \"unbelievable\"."],
  ["The word 'disagreement' contains the root word:", "agree", ["agreed", "agreeing", "agreement"], "\"Agree\" is the root; dis- and -ment are added to build \"disagreement\"."],
  ["What does the prefix 'tele-' mean, as in 'telephone' and 'television'?", "far or distant", ["under", "before", "many"], "The prefix tele- comes from Greek and means 'far' or 'distant'."],
  ["What does the prefix 'bi-' mean, as in 'bicycle'?", "two", ["one", "three", "many"], "The prefix bi- means 'two', as a bicycle has two wheels."],
  ["What does the suffix '-ology' mean, as in 'biology'?", "the study of", ["the fear of", "the love of", "the shape of"], "The suffix -ology means 'the study of'."],
  ["The word 'international' contains which prefix, meaning 'between'?", "inter-", ["intra-", "trans-", "sub-"], "The prefix inter- means 'between' or 'among', as in international (between nations)."],
  ["What is the root word in 'unhappiness'?", "happy", ["happen", "happily", "happiest"], "\"Happy\" is the root; un- and -ness are added to build \"unhappiness\"."],
];

// ===================== COMPOUND WORDS AND SYLLABLE PATTERNS ==================

const y1Compounds: Row[] = [
  ["Which two words make the compound word 'sunhat'?", "sun + hat", ["sun + cap", "son + hat", "sun + hut"], "\"Sunhat\" is made by joining \"sun\" and \"hat\"."],
  ["Which two words make the compound word 'backpack'?", "back + pack", ["black + pack", "back + pact", "bag + pack"], "\"Backpack\" is made by joining \"back\" and \"pack\"."],
  ["Which two words make the compound word 'football'?", "foot + ball", ["food + ball", "foot + bell", "fort + ball"], "\"Football\" is made by joining \"foot\" and \"ball\"."],
  ["Which two words make the compound word 'rainbow'?", "rain + bow", ["rain + boat", "ran + bow", "rain + bowl"], "\"Rainbow\" is made by joining \"rain\" and \"bow\"."],
  ["Which two words make the compound word 'birthday'?", "birth + day", ["bird + day", "birth + say", "birth + date"], "\"Birthday\" is made by joining \"birth\" and \"day\"."],
  ["Which two words make the compound word 'toothbrush'?", "tooth + brush", ["tooth + brash", "tough + brush", "tooth + brushes"], "\"Toothbrush\" is made by joining \"tooth\" and \"brush\"."],
];

const y2Compounds: Row[] = [
  ["Join 'sun' and 'flower' to make one word:", "sunflower", ["sun flower's", "sunflowar", "sun-flower's"], "Joining \"sun\" and \"flower\" makes the compound word \"sunflower\"."],
  ["Join 'butter' and 'fly' to make one word:", "butterfly", ["buttterfly", "butterflie", "butter-fly's"], "Joining \"butter\" and \"fly\" makes the compound word \"butterfly\"."],
  ["Join 'grand' and 'mother' to make one word:", "grandmother", ["grandmothar", "grand-mother's", "granmother"], "Joining \"grand\" and \"mother\" makes the compound word \"grandmother\"."],
  ["Join 'basket' and 'ball' to make one word:", "basketball", ["baskitball", "basket-ball's", "baskeball"], "Joining \"basket\" and \"ball\" makes the compound word \"basketball\"."],
  ["Join 'note' and 'book' to make one word:", "notebook", ["notbook", "note-book's", "noteboook"], "Joining \"note\" and \"book\" makes the compound word \"notebook\"."],
  ["Join 'play' and 'ground' to make one word:", "playground", ["playgraund", "play-ground's", "playgroud"], "Joining \"play\" and \"ground\" makes the compound word \"playground\"."],
];

const y3SilentLetters: Row[] = [
  ["Which body-part word has a silent 'k'?", "knee", ["nose", "hand", "foot"], "The 'k' in \"knee\" is silent."],
  ["Which word has a silent 'w'?", "write", ["read", "spell", "speak"], "The 'w' in \"write\" is silent."],
  ["Which word has a silent 'b'?", "thumb", ["finger", "hand", "arm"], "The 'b' in \"thumb\" is silent."],
  ["Which word has a silent 'gh'?", "night", ["day", "sun", "rain"], "The 'gh' in \"night\" is silent."],
  ["Which word has a silent 'h'?", "hour", ["minute", "second", "clock"], "The 'h' in \"hour\" is silent."],
  ["Which word has a silent 'l'?", "half", ["full", "tall", "ball"], "The 'l' in \"half\" is silent."],
  ["Which word meaning 'to be aware of' has a silent 'k'?", "know", ["show", "grow", "flow"], "The 'k' in \"know\" is silent."],
];

const y4Contractions: Row[] = [
  ["What is the contraction for 'do not'?", "don't", ["dont'", "do'nt", "don t"], "\"Don't\" is short for \"do not\", with the apostrophe replacing the missing 'o'."],
  ["What is the contraction for 'I am'?", "I'm", ["Im'", "I am'nt", "Iam"], "\"I'm\" is short for \"I am\"."],
  ["What is the contraction for 'they are'?", "they're", ["their're", "theyare'", "they'r"], "\"They're\" is short for \"they are\"."],
  ["What is the contraction for 'cannot'?", "can't", ["ca'nt", "cann't", "cant'"], "\"Can't\" is short for \"cannot\"."],
  ["What is the contraction for 'will not'?", "won't", ["willn't", "won''t", "wo'nt"], "\"Won't\" is the irregular contraction of \"will not\"."],
  ["What is the contraction for 'she is'?", "she's", ["shes'", "sh'es", "she is'"], "\"She's\" is short for \"she is\"."],
  ["What is the contraction for 'we have'?", "we've", ["weve'", "we'hve", "w'eve"], "\"We've\" is short for \"we have\"."],
];

const y5Syllables: Row[] = [
  ["How many syllables are in the word 'elephant'?", "3", ["2", "4", "5"], "El-e-phant has three syllables."],
  ["How many syllables are in the word 'banana'?", "3", ["2", "4", "1"], "Ba-na-na has three syllables."],
  ["How many syllables are in the word 'hospital'?", "3", ["2", "4", "5"], "Hos-pi-tal has three syllables."],
  ["How many syllables are in the word 'umbrella'?", "3", ["2", "4", "5"], "Um-brel-la has three syllables."],
  ["Which is the correct syllable break for 'rabbit'?", "rab-bit", ["ra-bbit", "rabb-it", "r-abbit"], "\"Rabbit\" is split between its two b's: rab-bit."],
  ["Which is the correct syllable break for 'computer'?", "com-pu-ter", ["comp-uter", "co-mput-er", "comput-er"], "\"Computer\" splits into three syllables: com-pu-ter."],
  ["How many syllables are in the word 'independent'?", "4", ["3", "5", "2"], "In-de-pen-dent has four syllables."],
];

const y6StatutoryWords: Row[] = [
  ["Which is the correct spelling of the word meaning 'required or essential'?", "necessary", ["neccessary", "necesary", "neccesary"], "\"Necessary\" has one c and two s's."],
  ["Which is the correct spelling of the word meaning 'apart from one another'?", "separate", ["seperate", "separete", "seprate"], "Remember: there's \"a rat\" in \"separate\"."],
  ["Which is the correct spelling of the word meaning 'without any doubt'?", "definitely", ["definately", "definitly", "defenitely"], "\"Definitely\" contains \"finite\", not \"finate\"."],
  ["Which is the correct spelling of the word for a country's ruling body?", "government", ["goverment", "governmant", "govarnment"], "\"Government\" contains \"govern\" plus \"-ment\"."],
  ["Which is the correct spelling of the word for the natural world around us?", "environment", ["enviroment", "enviornment", "envirnoment"], "\"Environment\" contains \"iron\" in the middle: env-iron-ment."],
  ["Which is the correct spelling of the word meaning 'now and then'?", "occasionally", ["ocasionally", "occasionaly", "occassionally"], "\"Occasionally\" has double c, single s, and double l."],
  ["Which is the correct spelling of the word meaning 'promised for certain'?", "guaranteed", ["garanteed", "guarenteed", "guaranteeed"], "\"Guaranteed\" starts with \"guar-\" and ends in a single \"-eed\"."],
];

export function generateAllSpellingQuestionsGuyana(seed = 56400): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...rowsToQuestions(rng, y1Homophones, "homophones-tricky-words", "Y1", "GY-SP1-HOM-1", "bronze"),
    ...rowsToQuestions(rng, y2Homophones, "homophones-tricky-words", "Y2", "GY-SP2-HOM-1", "bronze"),
    ...rowsToQuestions(rng, y3Homophones, "homophones-tricky-words", "Y3", "GY-SP3-HOM-1", "silver"),
    ...rowsToQuestions(rng, y4Homophones, "homophones-tricky-words", "Y4", "GY-SP4-HOM-1", "silver"),
    ...rowsToQuestions(rng, y5Homophones, "homophones-tricky-words", "Y5", "GY-SP5-HOM-1", "gold"),
    ...rowsToQuestions(rng, y6Homophones, "homophones-tricky-words", "Y6", "GY-SP6-HOM-1", "gold"),

    ...rowsToQuestions(rng, y1Plurals, "plurals-and-suffixes", "Y1", "GY-SP1-AFF-1", "bronze"),
    ...rowsToQuestions(rng, y2Plurals, "plurals-and-suffixes", "Y2", "GY-SP2-AFF-1", "bronze"),
    ...rowsToQuestions(rng, y3PrefixSuffix, "plurals-and-suffixes", "Y3", "GY-SP3-AFF-1", "silver"),
    ...rowsToQuestions(rng, y4Suffixing, "plurals-and-suffixes", "Y4", "GY-SP4-AFF-1", "silver"),
    ...rowsToQuestions(rng, y5AdvancedSuffix, "plurals-and-suffixes", "Y5", "GY-SP5-AFF-1", "gold"),
    ...rowsToQuestions(rng, y6RootsAffixes, "plurals-and-suffixes", "Y6", "GY-SP6-AFF-1", "gold"),

    ...rowsToQuestions(rng, y1Compounds, "compound-and-syllables", "Y1", "GY-SP1-CPD-1", "bronze"),
    ...rowsToQuestions(rng, y2Compounds, "compound-and-syllables", "Y2", "GY-SP2-CPD-1", "bronze"),
    ...rowsToQuestions(rng, y3SilentLetters, "compound-and-syllables", "Y3", "GY-SP3-CPD-1", "silver"),
    ...rowsToQuestions(rng, y4Contractions, "compound-and-syllables", "Y4", "GY-SP4-CPD-1", "silver"),
    ...rowsToQuestions(rng, y5Syllables, "compound-and-syllables", "Y5", "GY-SP5-CPD-1", "gold"),
    ...rowsToQuestions(rng, y6StatutoryWords, "compound-and-syllables", "Y6", "GY-SP6-CPD-1", "gold"),
  ];
}
