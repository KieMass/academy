/**
 * Lower Key Stage 2 (Y3/Y4) grammar & punctuation content — same word-bank +
 * sentence template pattern as grammar-ks1.ts (KS1) and the KS2 (Y5/Y6)
 * strands in grammar.ts. Multiple-choice only, except where a strand's
 * questionTypes call for short_answer/fill_in_box, consistent with the
 * app-wide move away from free-text grading for non-maths content.
 */
import { createRng, shuffle, type Rng } from "./rng";
import type { DraftQuestion } from "./types";
import type { DifficultyBand, YearGroup } from "@/lib/curriculum/types";

const SUBJECT = "grammar";
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

interface Item { prompt: string; correct: string; distractors: string[]; explanation: string; difficulty?: DifficultyBand }

function build(strandSlug: string, yearGroup: YearGroup, objectiveCode: string, defaultDifficulty: DifficultyBand, items: Item[]): (rng: Rng) => DraftQuestion[] {
  return (rng: Rng) => items.map((it) => mc(rng, { strandSlug, yearGroup, objectiveCode, difficulty: it.difficulty ?? defaultDifficulty, promptText: it.prompt, correct: it.correct, distractors: it.distractors, explanation: it.explanation }));
}

// =============================== YEAR 3 ====================================

// --- coordination-subordination ---
const coordExtendedY3 = build("coordination-subordination", Y3, "GR3-COORD-1", "silver", [
  { prompt: "Which word correctly joins: 'We went outside ___ the rain had stopped.'?", correct: "when", distractors: ["and", "or", "but"], explanation: "'When' shows the timing between the two events." },
  { prompt: "Which word correctly joins: 'I will feed the cat ___ it is hungry.'?", correct: "if", distractors: ["when", "but", "or"], explanation: "'If' introduces a condition." },
  { prompt: "Which word correctly joins: 'We stayed indoors ___ it was cold outside.'?", correct: "because", distractors: ["although", "or", "and"], explanation: "'Because' gives the reason for staying indoors." },
  { prompt: "Which word correctly joins: 'She finished her homework ___ she was very tired.'?", correct: "although", distractors: ["because", "if", "and"], explanation: "'Although' shows a contrast — she finished despite being tired." },
  { prompt: "Which sentence correctly uses 'when' to join two clauses?", correct: "The dog barked when the doorbell rang.", distractors: ["The dog barked, the doorbell rang when.", "When the dog barked and the doorbell rang.", "The dog barked when doorbell the rang."], explanation: "'When' links the two events in the correct order." },
  { prompt: "Which conjunction best completes: 'Take an umbrella ___ it might rain.'?", correct: "because", distractors: ["although", "when", "or"], explanation: "'Because' explains the reason for taking an umbrella." },
]);
const coordClauseOrderY3 = build("coordination-subordination", Y3, "GR3-COORD-2", "gold", [
  { prompt: "Which sentence starts with the subordinate clause for effect?", correct: "Although it was raining, we went for a walk.", distractors: ["We went for a walk although it was raining but.", "We went, although it was raining, for a walk.", "We went for a walk it was raining although."], explanation: "Starting with 'Although it was raining' puts the contrast first for effect, followed by a comma." },
  { prompt: "Which sentence correctly places the subordinate clause at the start?", correct: "Because the bridge was closed, we took a different road.", distractors: ["We took a different road, because the bridge was closed but.", "Because we took a different road the bridge was closed.", "The bridge was closed because we took a different road."], explanation: "The subordinate clause 'Because the bridge was closed' comes first, followed by a comma and the main clause." },
  { prompt: "Which sentence keeps the same meaning as 'We had a picnic when the sun came out'?", correct: "When the sun came out, we had a picnic.", distractors: ["When we had a picnic, the sun came out.", "The sun came out we had a picnic when.", "We had, when the sun came out, a picnic."], explanation: "Moving the subordinate clause to the front keeps the same meaning, with a comma after it." },
  { prompt: "Which sentence correctly opens with a subordinate clause?", correct: "If you finish your work, you can go outside.", distractors: ["You can go outside if you finish, your work.", "If you finish your work you can, go outside.", "Finish your work if, you can go outside."], explanation: "The 'if' clause comes first, followed by a comma, then the main clause." },
]);

// --- verb-tenses ---
const presentPerfectY3 = build("verb-tenses", Y3, "GR3-TEN-1", "silver", [
  { prompt: "Which sentence uses the present perfect form correctly?", correct: "She has finished her lunch.", distractors: ["She finish her lunch.", "She finishing her lunch.", "She will finished her lunch."], explanation: "The present perfect uses 'has'/'have' + past participle: 'has finished'." },
  { prompt: "Which sentence about going out uses the present perfect instead of the simple past?", correct: "He has gone out.", distractors: ["He went out.", "He goes out.", "He was going out."], explanation: "'Has gone' is the present perfect form, showing a link to now, rather than the simple past 'went'." },
  { prompt: "Which sentence correctly uses the present perfect for 'eat'?", correct: "They have eaten all the biscuits.", distractors: ["They ate all the biscuits eaten.", "They eating all the biscuits.", "They eaten all the biscuits."], explanation: "The present perfect needs 'have' + the past participle 'eaten': 'have eaten'." },
  { prompt: "Which sentence about visiting Paris uses the present perfect correctly?", correct: "I have never visited Paris.", distractors: ["I never visited Paris have.", "I having never visited Paris.", "I never visit Paris have."], explanation: "'Have visited' is the present perfect form, used with 'never' to talk about experience up to now." },
  { prompt: "Which sentence uses the present perfect form of 'lose'?", correct: "We have lost the match.", distractors: ["We losing the match.", "We lose the match have.", "We losed the match."], explanation: "'Have lost' uses 'have' + the past participle 'lost'." },
]);

// --- prefixes ---
const negativePrefixesY3 = build("prefixes", Y3, "GR3-PRE-1", "silver", [
  { prompt: "Which prefix makes 'agree' mean the opposite?", correct: "dis-", distractors: ["mis-", "re-", "un-"], explanation: "'Dis-' added to 'agree' gives 'disagree', meaning the opposite." },
  { prompt: "Which word means 'to spell wrongly'?", correct: "misspell", distractors: ["disspell", "unspell", "respell"], explanation: "'Mis-' means 'wrongly', so 'misspell' means to spell something wrongly." },
  { prompt: "Which prefix makes a word mean 'not possible'?", correct: "im-", distractors: ["dis-", "mis-", "re-"], explanation: "'Im-' before words starting with 'p' or 'm' gives a negative meaning, e.g. 'impossible'." },
  { prompt: "Which word correctly uses the prefix 'il-' to mean 'not legal'?", correct: "illegal", distractors: ["dislegal", "unlegal", "mislegal"], explanation: "'Il-' is used before words starting with 'l': legal → illegal." },
  { prompt: "Which word correctly uses the prefix 'ir-' to mean 'not regular'?", correct: "irregular", distractors: ["disregular", "unregular", "misregular"], explanation: "'Ir-' is used before words starting with 'r': regular → irregular." },
  { prompt: "Which prefix gives 'obey' the opposite meaning?", correct: "dis-", distractors: ["im-", "il-", "ir-"], explanation: "'Dis-' added to 'obey' gives 'disobey', meaning the opposite." },
]);

// --- suffixes ---
const nounSuffixesY3 = build("suffixes", Y3, "GR3-SUF-1", "bronze", [
  { prompt: "Which suffix turns 'inform' into a noun meaning 'facts told to someone'?", correct: "-ation", distractors: ["-er", "-ly", "-ful"], explanation: "'-ation' turns the verb 'inform' into the noun 'information'." },
  { prompt: "Which word means 'a person who acts', formed with a suffix?", correct: "actor", distractors: ["actness", "actful", "actly"], explanation: "'-or' turns the verb 'act' into a person noun: actor." },
  { prompt: "Which suffix turns 'create' into a noun?", correct: "-ion", distractors: ["-ly", "-ful", "-ness"], explanation: "'-ion' turns the verb 'create' into the noun 'creation'." },
  { prompt: "Which word means 'someone who paints', formed with a suffix?", correct: "painter", distractors: ["paintness", "paintful", "paintation"], explanation: "'-er' turns the verb 'paint' into a person noun: painter." },
  { prompt: "Which suffix turns 'decide' into the noun 'decision'?", correct: "-sion", distractors: ["-ation", "-ful", "-ly"], explanation: "'-sion' turns the verb 'decide' into the noun 'decision'." },
]);
const adjectiveSuffixesY3 = build("suffixes", Y3, "GR3-SUF-2", "silver", [
  { prompt: "Which word means 'full of wonder', formed with a suffix?", correct: "wonderful", distractors: ["wonderless", "wonderous", "wonderian"], explanation: "'-ful' means 'full of': wonderful." },
  { prompt: "Which word means 'without fear', formed with a suffix?", correct: "fearless", distractors: ["fearful", "fearous", "fearian"], explanation: "'-less' means 'without': fearless." },
  { prompt: "Which word means 'full of danger', formed with a suffix?", correct: "dangerous", distractors: ["dangerful", "dangerless", "dangerian"], explanation: "'-ous' means 'full of' or 'having the quality of': dangerous." },
  { prompt: "Which word describes someone from Egypt, formed with a suffix?", correct: "Egyptian", distractors: ["Egyptful", "Egyptless", "Egyptous"], explanation: "'-ian' forms an adjective (or noun) describing where someone is from: Egyptian." },
  { prompt: "Which word means 'full of joy', formed with a suffix?", correct: "joyous", distractors: ["joyful", "joyless", "joyian"], explanation: "'-ous' can also mean 'full of': joyous (as well as 'joyful')." },
]);

// --- layout-devices ---
const paragraphsGroupY3 = build("layout-devices", Y3, "GR3-LAY-1", "bronze", [
  { prompt: "Why do writers use paragraphs?", correct: "To group related sentences together", distractors: ["To make the text longer", "To use more punctuation", "To avoid using capital letters"], explanation: "Paragraphs group sentences about the same idea, making the text easier to follow." },
  { prompt: "When should a writer usually start a new paragraph?", correct: "When the topic or idea changes", distractors: ["Every single sentence", "Only at the very end", "Whenever there is a comma"], explanation: "A new paragraph signals to the reader that the topic or idea is changing." },
  { prompt: "Which of these is a paragraph most likely to be about?", correct: "One main idea, explained across a few related sentences", distractors: ["As many different topics as possible", "A single random word", "Only questions with no statements"], explanation: "A paragraph groups sentences that relate to one main idea." },
  { prompt: "A writer is describing a character and then starts describing the setting. What should they do?", correct: "Start a new paragraph", distractors: ["Use more exclamation marks", "Write it all in one long sentence", "Delete the description of the character"], explanation: "Moving to a new topic (setting instead of character) is a good place to start a new paragraph." },
]);

// --- direct-speech ---
const invertedCommasY3 = build("direct-speech", Y3, "GR3-DS-1", "silver", [
  { prompt: "Which sentence correctly punctuates Ali saying he is hungry as direct speech?", correct: "\"I am hungry,\" said Ali.", distractors: ["I am hungry, said Ali.", "\"I am hungry, said Ali.\"", "\"I am hungry said Ali.\""], explanation: "The spoken words go inside inverted commas: \"I am hungry,\" said Ali." },
  { prompt: "Which sentence correctly uses inverted commas for Mia's warning?", correct: "\"Watch out!\" shouted Mia.", distractors: ["Watch out! shouted Mia.", "\"Watch out\" shouted Mia!", "Watch out, \"shouted Mia!\""], explanation: "The words actually spoken, \"Watch out!\", are enclosed in inverted commas." },
  { prompt: "Which sentence correctly punctuates Tom's question as direct speech?", correct: "\"Where are you going?\" asked Tom.", distractors: ["Where are you going? asked Tom.", "\"Where are you going\" asked Tom?", "\"Where are you going?\" Asked Tom."], explanation: "The question mark goes inside the inverted commas, before the closing mark." },
  { prompt: "Which sentence uses inverted commas correctly to show Sam is speaking?", correct: "Sam said, \"I can't wait for the trip.\"", distractors: ["Sam said, I can't wait for the trip.", "Sam said \"I can't wait for the trip\".", "\"Sam said, I can't wait for the trip.\""], explanation: "The words Sam actually says go inside the inverted commas, after the reporting clause and comma." },
  { prompt: "Which of these correctly uses inverted commas for direct speech?", correct: "\"That's my favourite book!\" exclaimed Priya.", distractors: ["That's my favourite book! exclaimed Priya.", "\"That's my favourite book!\" Exclaimed Priya.", "\"That's my favourite book\" exclaimed Priya!"], explanation: "The exclamation mark stays inside the inverted commas, and 'exclaimed' does not need a capital letter." },
]);

// --- cohesion (time/place/cause) ---
const timePlaceCauseY3 = build("cohesion", Y3, "GR3-COH-1", "bronze", [
  { prompt: "Which word tells you when something happened: 'We went home ___ the game finished.'?", correct: "after", distractors: ["because", "so", "there"], explanation: "'After' expresses time — when the going home happened relative to the game finishing." },
  { prompt: "Which word expresses cause: 'It was raining, ___ we stayed inside.'?", correct: "so", distractors: ["then", "before", "during"], explanation: "'So' shows the result caused by the rain." },
  { prompt: "Which word expresses place: 'The keys were ___ the table.'?", correct: "under", distractors: ["therefore", "then", "because"], explanation: "'Under' is a preposition that describes place." },
  { prompt: "Which adverb best completes: 'First we packed our bags. ___, we caught the bus.'?", correct: "Next", distractors: ["Under", "Because", "During"], explanation: "'Next' is a time adverb that shows the order of events." },
  { prompt: "Which word expresses cause: 'She was tired ___ she had run a race.'?", correct: "because", distractors: ["during", "then", "there"], explanation: "'Because' introduces the reason she was tired." },
  { prompt: "Which preposition expresses time: 'We will leave ___ breakfast.'?", correct: "before", distractors: ["under", "there", "so"], explanation: "'Before' is a preposition that expresses time." },
]);

export function generateAllGrammarQuestionsY3(seed = 83001): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...coordExtendedY3(rng),
    ...coordClauseOrderY3(rng),
    ...presentPerfectY3(rng),
    ...negativePrefixesY3(rng),
    ...nounSuffixesY3(rng),
    ...adjectiveSuffixesY3(rng),
    ...paragraphsGroupY3(rng),
    ...invertedCommasY3(rng),
    ...timePlaceCauseY3(rng),
  ];
}

// ============================ YEAR 3 — EXTRA BATCH ==========================

const coordExtendedY3b = build("coordination-subordination", Y3, "GR3-COORD-1", "silver", [
  { prompt: "Which word correctly joins: 'She smiled ___ she had won the prize.'?", correct: "because", distractors: ["although", "when", "or"], explanation: "'Because' gives the reason for her smiling." },
  { prompt: "Which word correctly joins: 'We left the park ___ it started to rain.'?", correct: "when", distractors: ["because", "although", "or"], explanation: "'When' shows the timing between leaving and the rain starting." },
  { prompt: "Which word correctly joins: 'I will help you ___ you ask nicely.'?", correct: "if", distractors: ["because", "when", "and"], explanation: "'If' introduces a condition for helping." },
  { prompt: "Which word correctly joins: 'He kept smiling ___ he had lost the match.'?", correct: "although", distractors: ["because", "if", "and"], explanation: "'Although' shows a contrast between losing and still smiling." },
  { prompt: "Which conjunction best completes: 'We stayed at the party ___ it was very late.'?", correct: "although", distractors: ["because", "if", "or"], explanation: "'Although' shows a contrast — staying despite the lateness." },
  { prompt: "Which conjunction best completes: 'The plants grew well ___ we watered them daily.'?", correct: "because", distractors: ["although", "if", "or"], explanation: "'Because' explains the reason the plants grew well." },
  { prompt: "Which word correctly joins: 'You can join the team ___ you attend every practice.'?", correct: "if", distractors: ["although", "because", "or"], explanation: "'If' introduces the condition for joining the team." },
]);
const coordClauseOrderY3b = build("coordination-subordination", Y3, "GR3-COORD-2", "gold", [
  { prompt: "Which sentence about the bell ringing correctly opens with the subordinate clause?", correct: "When the bell rang, the children lined up.", distractors: ["The children lined up, when the bell rang but.", "When the children lined up, the bell rang.", "The bell rang, the children when lined up."], explanation: "The subordinate clause 'When the bell rang' comes first, followed by a comma." },
  { prompt: "Which sentence about the ferry correctly opens with the subordinate clause?", correct: "Because the sea was rough, the ferry was delayed.", distractors: ["The ferry was delayed, because the sea was rough but.", "Because the ferry was delayed the sea was rough.", "The sea rough was because the ferry delayed."], explanation: "The subordinate clause 'Because the sea was rough' comes first, followed by a comma." },
  { prompt: "Which sentence keeps the same meaning as 'She practised every day if she wanted to improve'?", correct: "If she wanted to improve, she practised every day.", distractors: ["If she practised every day, she wanted to improve.", "She wanted to improve if, she practised every day.", "Practised every day if she wanted improve she."], explanation: "Moving the 'if' clause to the front keeps the same meaning, followed by a comma." },
]);
const presentPerfectY3b = build("verb-tenses", Y3, "GR3-TEN-1", "silver", [
  { prompt: "Which sentence about cleaning the classroom uses the present perfect correctly?", correct: "We have already cleaned the classroom.", distractors: ["We already cleaned the classroom have.", "We already cleaning the classroom.", "We already clean the classroom have."], explanation: "'Have cleaned' is the present perfect form, used with 'already'." },
  { prompt: "Which sentence uses the present perfect form of 'break'?", correct: "He has broken his arm.", distractors: ["He broke his arm broken.", "He breaking his arm.", "He broken his arm has."], explanation: "'Has broken' uses 'has' + the past participle 'broken'." },
  { prompt: "Which sentence about arriving at school uses the present perfect instead of the simple past?", correct: "She has arrived at school.", distractors: ["She arrived at school.", "She arriving at school.", "She arrives at school has."], explanation: "'Has arrived' is the present perfect form, showing a link to now." },
  { prompt: "Which sentence uses the present perfect form of 'write'?", correct: "They have written a letter.", distractors: ["They wrote a letter written.", "They writing a letter.", "They written a letter have."], explanation: "'Have written' uses 'have' + the past participle 'written'." },
  { prompt: "Which sentence uses the present perfect form of 'see'?", correct: "I have seen that film twice.", distractors: ["I seen that film twice have.", "I seeing that film twice.", "I see that film twice have."], explanation: "'Have seen' uses 'have' + the past participle 'seen'." },
]);
const negativePrefixesY3b = build("prefixes", Y3, "GR3-PRE-1", "silver", [
  { prompt: "Which prefix makes 'appear' mean the opposite?", correct: "dis-", distractors: ["mis-", "im-", "un-"], explanation: "'Dis-' added to 'appear' gives 'disappear', meaning the opposite." },
  { prompt: "Which word means 'to behave badly'?", correct: "misbehave", distractors: ["disbehave", "unbehave", "rebehave"], explanation: "'Mis-' means 'wrongly' or 'badly', so 'misbehave' means to behave badly." },
  { prompt: "Which prefix makes a word mean 'not mature'?", correct: "im-", distractors: ["dis-", "il-", "ir-"], explanation: "'Im-' before words starting with 'm' gives a negative meaning, e.g. 'immature'." },
  { prompt: "Which word correctly uses the prefix 'il-' to mean 'not literate'?", correct: "illiterate", distractors: ["disliterate", "unliterate", "misliterate"], explanation: "'Il-' is used before words starting with 'l': literate → illiterate." },
  { prompt: "Which word correctly uses the prefix 'ir-' to mean 'not responsible'?", correct: "irresponsible", distractors: ["disresponsible", "unresponsible", "misresponsible"], explanation: "'Ir-' is used before words starting with 'r': responsible → irresponsible." },
  { prompt: "Which prefix gives 'trust' the opposite meaning?", correct: "dis-", distractors: ["im-", "il-", "ir-"], explanation: "'Dis-' added to 'trust' gives 'distrust', meaning the opposite." },
]);
const nounSuffixesY3b = build("suffixes", Y3, "GR3-SUF-1", "bronze", [
  { prompt: "Which suffix turns 'educate' into a noun meaning 'the process of teaching'?", correct: "-ation", distractors: ["-er", "-ly", "-ful"], explanation: "'-ation' turns the verb 'educate' into the noun 'education'." },
  { prompt: "Which word means 'a person who directs', formed with a suffix?", correct: "director", distractors: ["directness", "directful", "directly"], explanation: "'-or' turns the verb 'direct' into a person noun: director." },
  { prompt: "Which suffix turns 'invite' into a noun?", correct: "-ation", distractors: ["-ly", "-ful", "-ness"], explanation: "'-ation' turns the verb 'invite' into the noun 'invitation'." },
  { prompt: "Which word means 'someone who visits', formed with a suffix?", correct: "visitor", distractors: ["visitness", "visitful", "visitation"], explanation: "'-or' turns the verb 'visit' into a person noun: visitor." },
  { prompt: "Which suffix turns 'confuse' into the noun 'confusion'?", correct: "-sion", distractors: ["-ation", "-ful", "-ly"], explanation: "'-sion' turns the verb 'confuse' into the noun 'confusion'." },
]);
const adjectiveSuffixesY3b = build("suffixes", Y3, "GR3-SUF-2", "silver", [
  { prompt: "Which word means 'full of humour', formed with a suffix?", correct: "humorous", distractors: ["humourful", "humourless", "humourian"], explanation: "'-ous' means 'full of' or 'having the quality of': humorous." },
  { prompt: "Which word means 'without shape', formed with a suffix?", correct: "shapeless", distractors: ["shapeful", "shapeous", "shapeian"], explanation: "'-less' means 'without': shapeless." },
  { prompt: "Which word means 'full of skill', formed with a suffix?", correct: "skilful", distractors: ["skilless", "skilous", "skilian"], explanation: "'-ful' means 'full of': skilful." },
  { prompt: "Which word describes someone from Canada, formed with a suffix?", correct: "Canadian", distractors: ["Canadaful", "Canadaless", "Canadaous"], explanation: "'-ian' forms an adjective (or noun) describing where someone is from: Canadian." },
  { prompt: "Which word means 'full of nerves', formed with a suffix?", correct: "nervous", distractors: ["nerveful", "nerveless", "nervian"], explanation: "'-ous' can mean 'full of': nervous." },
]);
const paragraphsGroupY3b = build("layout-devices", Y3, "GR3-LAY-1", "bronze", [
  { prompt: "A report has one paragraph about food and another about habitat. Why are they separate?", correct: "Because each paragraph groups sentences about a different idea", distractors: ["Because paragraphs must always be the same length", "To use up more of the page", "Because the writer forgot to join them"], explanation: "Separate paragraphs group related sentences by topic, making the report easier to follow." },
  { prompt: "What is the main purpose of a paragraph?", correct: "To group sentences about the same idea together", distractors: ["To make writing look longer", "To replace full stops", "To avoid using adjectives"], explanation: "A paragraph's purpose is to keep sentences on the same topic grouped together." },
  { prompt: "If a story moves from the classroom to the playground, what should the writer do?", correct: "Start a new paragraph", distractors: ["Use only exclamation marks", "Delete the classroom scene", "Write everything as one sentence"], explanation: "A change of setting is a natural place to begin a new paragraph." },
]);
const invertedCommasY3b = build("direct-speech", Y3, "GR3-DS-1", "silver", [
  { prompt: "Which sentence correctly punctuates Jack shivering with cold as direct speech?", correct: "\"I'm freezing!\" shivered Jack.", distractors: ["I'm freezing! shivered Jack.", "\"I'm freezing\" shivered Jack!", "\"I'm freezing!\" Shivered Jack."], explanation: "The spoken words go inside inverted commas, and 'shivered' doesn't need a capital letter." },
  { prompt: "Which sentence correctly uses inverted commas for the guide's instruction?", correct: "\"Follow me,\" whispered the guide.", distractors: ["Follow me, whispered the guide.", "\"Follow me\" whispered the guide.", "\"Follow me,\" Whispered the guide."], explanation: "The words spoken, \"Follow me,\" are enclosed in inverted commas, with a comma before the closing mark." },
  { prompt: "Which sentence correctly punctuates Ravi's question as direct speech?", correct: "\"Is anybody home?\" called Ravi.", distractors: ["Is anybody home? called Ravi.", "\"Is anybody home\" called Ravi?", "\"Is anybody home?\" Called Ravi."], explanation: "The question mark goes inside the inverted commas." },
  { prompt: "Which sentence correctly uses inverted commas to show Ellie is speaking?", correct: "Ellie shouted, \"Wait for me!\"", distractors: ["Ellie shouted, Wait for me!", "Ellie shouted \"Wait for me!\".", "\"Ellie shouted, Wait for me!\""], explanation: "The words Ellie shouts go inside the inverted commas, after the reporting clause and comma." },
]);
const timePlaceCauseY3b = build("cohesion", Y3, "GR3-COH-1", "bronze", [
  { prompt: "Which word tells you when something happened: 'We ate lunch ___ we finished the race.'?", correct: "after", distractors: ["because", "so", "under"], explanation: "'After' expresses time — lunch came after the race finished." },
  { prompt: "Which word expresses cause: 'The pitch was wet, ___ the match was cancelled.'?", correct: "so", distractors: ["then", "before", "during"], explanation: "'So' shows the result caused by the wet pitch." },
  { prompt: "Which word expresses place: 'The cat was hiding ___ the sofa.'?", correct: "behind", distractors: ["therefore", "then", "because"], explanation: "'Behind' is a preposition that describes place." },
  { prompt: "Which adverb best completes: 'First we set up the tent. ___, we lit the campfire.'?", correct: "Then", distractors: ["Behind", "Because", "During"], explanation: "'Then' is a time adverb that shows the order of events." },
  { prompt: "Which word expresses cause: 'He was late ___ the bus broke down.'?", correct: "because", distractors: ["during", "then", "there"], explanation: "'Because' introduces the reason he was late." },
]);

export function generateAllGrammarQuestionsY3Extra(seed = 93001): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...coordExtendedY3b(rng),
    ...coordClauseOrderY3b(rng),
    ...presentPerfectY3b(rng),
    ...negativePrefixesY3b(rng),
    ...nounSuffixesY3b(rng),
    ...adjectiveSuffixesY3b(rng),
    ...paragraphsGroupY3b(rng),
    ...invertedCommasY3b(rng),
    ...timePlaceCauseY3b(rng),
  ];
}

// =============================== YEAR 4 ====================================

// --- verb-tenses (standard English forms) ---
const standardEnglishY4 = build("verb-tenses", Y4, "GR4-TEN-1", "silver", [
  { prompt: "Which sentence about yesterday's park visit uses standard English?", correct: "We were at the park yesterday.", distractors: ["We was at the park yesterday.", "We is at the park yesterday.", "We be at the park yesterday."], explanation: "Standard English uses 'were' with 'we', not 'was'." },
  { prompt: "Which sentence about last night's homework uses standard English?", correct: "I did my homework last night.", distractors: ["I done my homework last night.", "I done did my homework.", "I doing my homework last night."], explanation: "Standard English uses 'did', not 'done', as the simple past of 'do'." },
  { prompt: "Which sentence about running to the shop uses standard English?", correct: "They ran to the shop.", distractors: ["They runned to the shop.", "They was ran to the shop.", "They run to the shop yesterday were."], explanation: "'Ran' is the correct simple past of 'run', not 'runned'." },
  { prompt: "Which sentence about the party uses standard English?", correct: "She isn't coming to the party.", distractors: ["She ain't coming to the party.", "She don't coming to the party.", "She not coming to the party."], explanation: "Standard English uses 'isn't', not the non-standard 'ain't'." },
  { prompt: "Which sentence about seeing a film uses standard English?", correct: "We have seen that film before.", distractors: ["We seen that film before.", "We has seen that film before.", "We has saw that film before."], explanation: "Standard English requires 'have' with a plural subject like 'we': 'have seen'." },
]);

// --- suffixes (-ly adverbs) ---
const adverbSuffixesY4 = build("suffixes", Y4, "GR4-SUF-1", "silver", [
  { prompt: "Which word turns 'happy' into an adverb?", correct: "happily", distractors: ["happyly", "happiness", "happyful"], explanation: "Words ending in a consonant + 'y' change 'y' to 'i' before adding '-ly': happy → happily." },
  { prompt: "Which word turns 'gentle' into an adverb?", correct: "gently", distractors: ["gentlely", "gentleness", "gentlily"], explanation: "Words ending in '-le' drop the 'e' before adding '-ly': gentle → gently." },
  { prompt: "Which word turns 'careful' into an adverb?", correct: "carefully", distractors: ["carefuly", "carefulley", "carefulness"], explanation: "Adding '-ly' to a word ending in 'l' keeps both l's: careful → carefully." },
  { prompt: "Which word turns 'quick' into an adverb?", correct: "quickly", distractors: ["quickley", "quickily", "quickness"], explanation: "Most words simply add '-ly': quick → quickly." },
  { prompt: "Which word turns 'angry' into an adverb?", correct: "angrily", distractors: ["angryly", "angriness", "angrely"], explanation: "Words ending in a consonant + 'y' change 'y' to 'i' before adding '-ly': angry → angrily." },
]);

// --- expanded-noun-phrases ---
const expandedNounPhrasesY4 = build("expanded-noun-phrases", Y4, "GR4-ENP-1", "silver", [
  { prompt: "Which is the most expanded noun phrase describing a teacher?", correct: "the strict maths teacher with curly hair", distractors: ["the teacher", "a strict teacher", "teacher with hair curly the"], explanation: "Modifying adjectives ('strict'), a noun ('maths') and a preposition phrase ('with curly hair') all expand the noun 'teacher'." },
  { prompt: "Which is the most expanded noun phrase describing a castle?", correct: "the crumbling stone castle on the hill", distractors: ["the castle", "an old castle", "castle stone on the hill crumbling"], explanation: "Adjectives, a noun modifier ('stone') and a preposition phrase ('on the hill') expand the noun 'castle'." },
  { prompt: "Which sentence uses the most expanded noun phrase?", correct: "The huge, hungry wolf with sharp teeth howled at the moon.", distractors: ["The wolf howled at the moon.", "A wolf is huge and hungry.", "Howled the wolf hungry huge teeth sharp."], explanation: "'The huge, hungry wolf with sharp teeth' expands the noun with adjectives and a preposition phrase." },
  { prompt: "Which is an expanded noun phrase describing a garden?", correct: "the overgrown garden behind the old cottage", distractors: ["the garden", "a big garden", "garden cottage the behind old"], explanation: "Adjective ('overgrown') and preposition phrase ('behind the old cottage') expand the noun 'garden'." },
  { prompt: "Which sentence uses an expanded noun phrase with a preposition phrase?", correct: "The girl in the red coat waved at us.", distractors: ["The girl waved at us.", "A girl was wearing a red coat.", "Waved the girl coat red in at us."], explanation: "'In the red coat' is a preposition phrase that expands and specifies which girl." },
]);

// --- fronted-adverbials ---
const frontedAdverbialsY4 = build("fronted-adverbials", Y4, "GR4-FA-1", "silver", [
  { prompt: "Which sentence correctly opens with a fronted adverbial?", correct: "Later that day, I heard the bad news.", distractors: ["I heard, later that day, the bad news.", "I heard the bad news later that day but.", "Later that day I heard the bad news but."], explanation: "'Later that day' is a fronted adverbial, placed at the start and followed by a comma." },
  { prompt: "Which sentence correctly opens with a fronted adverbial of place?", correct: "Beyond the old bridge, a river flowed silently.", distractors: ["A river flowed silently beyond, the old bridge.", "Beyond the old bridge a river flowed silently.", "A river beyond the old bridge flowed silently, comma."], explanation: "'Beyond the old bridge' opens the sentence and needs a comma before the main clause — the correct version has one." },
  { prompt: "Which sentence correctly opens with a fronted adverbial of manner?", correct: "Slowly and carefully, she opened the ancient box.", distractors: ["She opened, slowly and carefully, the ancient box.", "Slowly and carefully she opened the ancient box.", "She opened the ancient box slowly and carefully comma."], explanation: "'Slowly and carefully' fronts the sentence, punctuated with a comma." },
  { prompt: "Which sentence uses a fronted adverbial correctly punctuated?", correct: "Without warning, the fire alarm rang loudly.", distractors: ["Without warning the fire alarm rang loudly.", "The fire alarm, without warning, rang loudly but.", "Without, warning the fire alarm rang loudly."], explanation: "'Without warning' is a fronted adverbial and needs a comma after it." },
  { prompt: "Which sentence correctly opens with a fronted adverbial of time?", correct: "Every morning before school, Leo feeds his rabbit.", distractors: ["Leo, every morning before school, feeds his rabbit.", "Every morning before school Leo feeds his rabbit.", "Leo feeds his rabbit every morning before school comma."], explanation: "'Every morning before school' fronts the sentence and is followed by a comma." },
]);

// --- commas (after fronted adverbials) ---
const commasFrontedAdverbialY4 = build("commas", Y4, "GR4-COM-1", "bronze", [
  { prompt: "Which sentence correctly punctuates the fronted adverbial 'Suddenly'?", correct: "Suddenly, the lights went out.", distractors: ["Suddenly the lights, went out.", "Suddenly the lights went, out.", "Suddenly the lights went out."], explanation: "A comma goes straight after the fronted adverbial 'Suddenly'." },
  { prompt: "Which sentence correctly punctuates the fronted adverbial 'After a long journey'?", correct: "After a long journey, we finally arrived home.", distractors: ["After a long journey we finally, arrived home.", "After, a long journey we finally arrived home.", "After a long journey we finally arrived, home."], explanation: "The comma follows the whole fronted adverbial phrase 'After a long journey'." },
  { prompt: "Which sentence correctly punctuates the fronted adverbial 'In the blink of an eye'?", correct: "In the blink of an eye, the magician vanished.", distractors: ["In the blink of an eye the magician, vanished.", "In the blink, of an eye the magician vanished.", "In the blink of an eye the magician vanished, ."], explanation: "The comma comes after the complete fronted adverbial phrase." },
  { prompt: "Which sentence is missing its comma?", correct: "Eventually the storm passed.", distractors: ["Eventually, the storm passed.", "The storm eventually passed.", "The storm passed eventually."], explanation: "'Eventually the storm passed' should have a comma after the fronted adverbial 'Eventually'." },
]);

// --- apostrophes (plural possession) ---
const pluralPossessionY4 = build("apostrophes", Y4, "GR4-APOS-1", "gold", [
  { prompt: "Which correctly shows that a toy belongs to more than one dog?", correct: "the dogs' toy", distractors: ["the dog's toy", "the dogs's toy", "the dogs toy"], explanation: "For a regular plural noun ending in 's', the apostrophe goes after the 's': dogs' toy." },
  { prompt: "Which correctly shows that a playground belongs to more than one school?", correct: "the schools' playground", distractors: ["the school's playground", "the schools's playground", "the schools playground"], explanation: "For the plural 'schools', the apostrophe goes after the final 's': schools' playground." },
  { prompt: "Which correctly shows the names belong to more than one girl?", correct: "the girls' names", distractors: ["the girl's names", "the girls's names", "the girls names"], explanation: "'Girls' is already plural, so the apostrophe goes after the 's': girls' names." },
  { prompt: "Which correctly shows a den belongs to more than one child (irregular plural)?", correct: "the children's den", distractors: ["the childrens' den", "the childrens's den", "the childrens den"], explanation: "'Children' is an irregular plural (it doesn't end in 's'), so it takes apostrophe + s, just like a singular noun: children's." },
  { prompt: "Which sentence correctly shows plural possession?", correct: "The players' kits were muddy after the match.", distractors: ["The player's kits were muddy after the match.", "The players's kits were muddy after the match.", "The players kits were muddy after the match."], explanation: "'Players' is plural, so the apostrophe goes after the final 's': players'." },
]);

// --- layout-devices ---
const paragraphsThemeY4 = build("layout-devices", Y4, "GR4-LAY-1", "silver", [
  { prompt: "A non-fiction report has sections on habitat, diet and predators. How should it be organised?", correct: "Into separate paragraphs, one for each theme", distractors: ["As one very long paragraph", "As a single sentence per fact", "In random order across the page"], explanation: "Grouping each theme (habitat, diet, predators) into its own paragraph makes the report clear to follow." },
  { prompt: "Why might a writer start a new paragraph even mid-story?", correct: "Because the theme, time or place of the action changes", distractors: ["Because they ran out of ideas", "Because the page is full", "Because a character speaks only once"], explanation: "A new paragraph often signals a shift in theme, time, place or speaker." },
  { prompt: "A diary entry describes morning activities, then afternoon activities. What's the best structure?", correct: "A paragraph for the morning and a separate paragraph for the afternoon", distractors: ["One paragraph mixing both times together", "A single sentence for the whole day", "No paragraphs at all"], explanation: "Organising by theme — here, time of day — into separate paragraphs helps the reader follow the sequence." },
  { prompt: "Which best describes the purpose of paragraphing around a theme?", correct: "It groups all the ideas connected to one theme so the reader can follow them together", distractors: ["It makes the writing look neater with no other benefit", "It is only used in poetry", "It replaces the need for punctuation"], explanation: "Paragraphs organised around a theme keep related ideas together for the reader." },
]);

// --- direct-speech (punctuation within speech) ---
const directSpeechPunctuationY4 = build("direct-speech", Y4, "GR4-DS-1", "gold", [
  { prompt: "Which sentence correctly punctuates the reporting clause before the speech?", correct: "She said, \"I'll be there at six.\"", distractors: ["She said \"I'll be there at six.\"", "She said, \"I'll be there at six\".", "She said \"I'll be there at six\","], explanation: "A comma follows the reporting clause ('She said,'), and the full stop stays inside the closing inverted commas." },
  { prompt: "Which sentence correctly punctuates speech that comes before the reporting clause?", correct: "\"I'll be there at six,\" she said.", distractors: ["\"I'll be there at six\" she said.", "\"I'll be there at six,\" She said.", "\"I'll be there at six\", she said."], explanation: "A comma (not a full stop) goes inside the inverted commas when the reporting clause follows, and 'she' keeps a lower-case s." },
  { prompt: "When a new person starts speaking in a script or story, what should a writer do?", correct: "Start a new line for the new speaker", distractors: ["Keep writing on the same line", "Only use a comma to separate the speakers", "Put both speakers' words in one set of inverted commas"], explanation: "A new line for each new speaker makes it clear who is talking." },
  { prompt: "Which sentence correctly punctuates an exclamation within direct speech?", correct: "\"Look out!\" cried the sailor.", distractors: ["\"Look out\"! cried the sailor.", "\"Look out!\" Cried the sailor.", "\"Look out\" cried the sailor!"], explanation: "The exclamation mark stays inside the inverted commas, and 'cried' doesn't need a capital letter." },
]);

// --- cohesion (pronoun/noun choice) ---
const cohesionPronounY4 = build("cohesion", Y4, "GR4-COH-1", "silver", [
  { prompt: "Which version avoids repeating 'Maria' too many times: 'Maria packed Maria's bag. Maria left for the airport.'?", correct: "Maria packed her bag. She left for the airport.", distractors: ["Maria packed Maria's bag. Maria left for the airport.", "She packed her bag. Maria left for the airport, she.", "Maria packed her bag. Maria left for the airport, Maria."], explanation: "Replacing repeated uses of 'Maria' with the pronouns 'her' and 'she' improves cohesion." },
  { prompt: "Which sentence pair best avoids repetition using a pronoun?", correct: "The dog chased the ball. It caught it easily.", distractors: ["The dog chased the ball. The dog caught the ball easily.", "The dog chased the ball, the dog caught the ball.", "It chased it. The dog caught the ball."], explanation: "'It' replaces 'the dog' and 'the ball' to avoid repeating the nouns." },
  { prompt: "Which sentence replaces a repeated noun with a more specific noun to keep the meaning clear?", correct: "The children ran to the playground. The youngsters loved the new slide.", distractors: ["The children ran to the playground. The children loved the new slide.", "They ran to the playground. They loved the new slide, they.", "The children ran to the playground, the children loved the slide."], explanation: "Using a synonym like 'the youngsters' instead of repeating 'the children' avoids repetition while keeping the meaning clear." },
  { prompt: "Which sentence best uses a pronoun to link back to 'the old oak tree'?", correct: "The old oak tree stood in the field. It had stood there for 200 years.", distractors: ["The old oak tree stood in the field. The old oak tree had stood there for 200 years.", "It stood in the field. The old oak tree had stood there for 200 years.", "The old oak tree stood in the field, the old oak tree stood."], explanation: "'It' refers back to 'the old oak tree' without repeating the full noun phrase." },
]);

// --- homophones ---
const homophonesY4 = build("homophones", Y4, "GR4-HOM-1", "silver", [
  { prompt: "Which word correctly completes: 'The dogs wagged ___ tails.'?", correct: "their", distractors: ["there", "they're", "there's"], explanation: "'Their' shows possession — the tails belong to the dogs." },
  { prompt: "Which word correctly completes: 'Put the books over ___.'?", correct: "there", distractors: ["their", "they're", "theyre"], explanation: "'There' refers to a place." },
  { prompt: "Which word correctly completes: '___ going to be late if we don't hurry.'?", correct: "They're", distractors: ["Their", "There", "Theyre"], explanation: "\"They're\" is a contraction of 'they are'." },
  { prompt: "Which word correctly completes: 'I would like ___ slices of cake, ___.'?", correct: "two, too", distractors: ["to, two", "too, to", "two, to"], explanation: "'Two' is the number, and 'too' means 'also' or 'as well'." },
  { prompt: "Which word correctly completes: 'Is this ___ coat or is it ___ leaving?'?", correct: "your, you're", distractors: ["you're, your", "your, your", "you're, you're"], explanation: "'Your' shows possession; \"you're\" is a contraction of 'you are'." },
  { prompt: "Which word correctly completes: 'We drove ___ the tunnel.'?", correct: "through", distractors: ["threw", "thru", "throo"], explanation: "'Through' describes movement from one side to the other." },
]);

// --- synonyms-antonyms ---
const synonymsY4 = build("synonyms-antonyms", Y4, "GR4-SYN-1", "silver", [
  { prompt: "Which is the best synonym for the overused word 'said' in 'she said quietly'?", correct: "whispered", distractors: ["shouted", "said", "wrote"], explanation: "'Whispered' captures the quiet manner more precisely than the overused 'said'." },
  { prompt: "Which is the best synonym for 'nice' in 'it was a nice day'?", correct: "pleasant", distractors: ["nice", "boring", "difficult"], explanation: "'Pleasant' is a more precise, less overused alternative to 'nice'." },
  { prompt: "Which is the best synonym for 'good' in 'she did a good job'?", correct: "excellent", distractors: ["good", "average", "poor"], explanation: "'Excellent' is a stronger, more precise alternative to the overused 'good'." },
  { prompt: "Which is the best synonym for 'big' in 'a big house'?", correct: "enormous", distractors: ["big", "small", "narrow"], explanation: "'Enormous' is a more vivid alternative to the overused 'big'." },
  { prompt: "Which is the best synonym for 'said' in 'he said angrily'?", correct: "snapped", distractors: ["said", "smiled", "asked"], explanation: "'Snapped' conveys the angry tone more precisely than 'said'." },
]);

export function generateAllGrammarQuestionsY4(seed = 84001): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...standardEnglishY4(rng),
    ...adverbSuffixesY4(rng),
    ...expandedNounPhrasesY4(rng),
    ...frontedAdverbialsY4(rng),
    ...commasFrontedAdverbialY4(rng),
    ...pluralPossessionY4(rng),
    ...paragraphsThemeY4(rng),
    ...directSpeechPunctuationY4(rng),
    ...cohesionPronounY4(rng),
    ...homophonesY4(rng),
    ...synonymsY4(rng),
  ];
}
