/**
 * One-off content rework: the 65 legacy hand-authored grammar `short_answer`
 * questions across 15 strands (relative-clauses, fronted-adverbials,
 * expanded-noun-phrases, sentence-structure, cohesion, parenthesis,
 * modal-verbs, prefixes, active-passive-voice, subjunctive-form,
 * semicolons-colons-dashes, layout-devices, brackets-dashes, suffixes,
 * synonyms-antonyms) are open creative-composition prompts ("Rewrite this
 * sentence using...", "Expand this noun phrase...") that were graded by
 * exact string match against 1-3 sample answers — a valid answer that
 * didn't literally match one of the samples was marked wrong. Converts all
 * 65 to multiple_choice, matching the app's established (and already-used-
 * everywhere-else-this-session) approach to grammar content.
 *
 * Updates BOTH:
 *  1. content/curriculum's source-of-truth file, content/questions/grammar.json
 *     (so a fresh seed against a new/empty DB gets the fixed content too), and
 *  2. the already-seeded ContentQuestion rows in the live DB, in place (same
 *     row id — not archive+recreate — so any QuestionAttempt history already
 *     recorded against these rows stays correctly linked).
 *
 * Usage: npx tsx prisma/rework-freetext-grammar-questions.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const db = new PrismaClient();
const GRAMMAR_JSON_PATH = path.join(process.cwd(), "content", "questions", "grammar.json");

interface Rework {
  strandSlug: string;
  yearGroup: "Y5" | "Y6";
  /** Must exactly match the current promptText in content/questions/grammar.json. */
  oldPromptText: string;
  newPromptText: string;
  options: string[]; // first entry is always the correct one
  explanation: string;
}

const REWORKS: Rework[] = [
  {
    strandSlug: "relative-clauses", yearGroup: "Y5",
    oldPromptText: "Rewrite this as one sentence using a relative clause: 'This is the house. My grandmother grew up in the house.'",
    newPromptText: "Which sentence correctly combines these into one sentence using a relative clause: 'This is the house. My grandmother grew up in the house.'?",
    options: [
      "This is the house where my grandmother grew up.",
      "This is the house, my grandmother grew up in the house.",
      "My grandmother grew up in the house where this is.",
      "This is the house which my grandmother grew up.",
    ],
    explanation: "'Where' introduces a relative clause about a place, replacing the repeated 'the house'.",
  },
  {
    strandSlug: "fronted-adverbials", yearGroup: "Y5",
    oldPromptText: "Rewrite this sentence to begin with a fronted adverbial: 'The children ran outside quickly when the bell rang.'",
    newPromptText: "Which sentence correctly begins with a fronted adverbial: 'The children ran outside quickly when the bell rang.'?",
    options: [
      "Quickly, the children ran outside when the bell rang.",
      "The children ran outside quickly when the bell rang.",
      "Quickly the children ran outside when the bell rang.",
      "When the bell rang the children ran outside quickly.",
    ],
    explanation: "Moving 'Quickly' to the front and adding a comma creates a fronted adverbial.",
  },
  {
    strandSlug: "expanded-noun-phrases", yearGroup: "Y5",
    oldPromptText: "Expand this noun phrase with at least two extra details: 'the castle'",
    newPromptText: "Which of these best expands the noun phrase 'the castle' with at least two extra details?",
    options: ["the ancient, crumbling castle on the hill", "the castle", "a castle", "castle ancient crumbling hill the on"],
    explanation: "Adding the adjectives 'ancient, crumbling' and the prepositional phrase 'on the hill' gives more than two extra details.",
  },
  {
    strandSlug: "sentence-structure", yearGroup: "Y5",
    oldPromptText: "Combine these into one complex sentence using a subordinating conjunction: 'The match was cancelled. It was raining heavily.'",
    newPromptText: "Which sentence correctly combines these into one complex sentence using a subordinating conjunction: 'The match was cancelled. It was raining heavily.'?",
    options: [
      "The match was cancelled because it was raining heavily.",
      "The match was cancelled, it was raining heavily.",
      "The match was cancelled and it was raining heavily.",
      "Because the match was cancelled, it was raining heavily.",
    ],
    explanation: "'Because' correctly links cause (rain) and effect (cancellation) in a complex sentence.",
  },
  {
    strandSlug: "cohesion", yearGroup: "Y5",
    oldPromptText: "Write a sentence that links back to this idea using a time adverbial: 'The explorers set up camp at the base of the mountain.'",
    newPromptText: "Which sentence best links back to this idea using a time adverbial: 'The explorers set up camp at the base of the mountain.'?",
    options: ["The next morning, they began the climb.", "They began the climb.", "The mountain was very tall.", "Climbing, they began the next morning."],
    explanation: "'The next morning' is a time adverbial that logically follows on from setting up camp.",
  },
  {
    strandSlug: "relative-clauses", yearGroup: "Y5",
    oldPromptText: "Combine using a relative clause: 'The bridge is very old. The bridge crosses the river.'",
    newPromptText: "Which sentence correctly combines these using a relative clause: 'The bridge is very old. The bridge crosses the river.'?",
    options: [
      "The bridge that crosses the river is very old.",
      "The bridge is very old, and the bridge crosses the river.",
      "The bridge is very old that crosses the river.",
      "That crosses the river, the bridge is very old.",
    ],
    explanation: "The relative clause 'that crosses the river' replaces the repeated subject and sits right after 'the bridge'.",
  },
  {
    strandSlug: "fronted-adverbials", yearGroup: "Y5",
    oldPromptText: "Rewrite starting with a fronted adverbial of time: 'We packed our bags before dawn.'",
    newPromptText: "Which sentence correctly starts with a fronted adverbial of time: 'We packed our bags before dawn.'?",
    options: ["Before dawn, we packed our bags.", "Before dawn we packed our bags.", "We packed our bags before dawn.", "Dawn before, we packed our bags."],
    explanation: "Moving 'before dawn' to the front and adding a comma creates a fronted adverbial.",
  },
  {
    strandSlug: "parenthesis", yearGroup: "Y5",
    oldPromptText: "Rewrite adding parenthesis using brackets: 'The castle was built in 1350. It still stands today.'",
    newPromptText: "Which sentence correctly adds parenthesis using brackets: 'The castle was built in 1350. It still stands today.'?",
    options: [
      "The castle (built in 1350) still stands today.",
      "The castle, built in 1350 still stands today.",
      "The castle still stands today (built in 1350).",
      "The castle built in (1350) still stands today.",
    ],
    explanation: "'(built in 1350)' is inserted right after 'the castle' as extra, removable information.",
  },
  {
    strandSlug: "expanded-noun-phrases", yearGroup: "Y5",
    oldPromptText: "Expand this noun phrase with at least two extra details: 'the forest'",
    newPromptText: "Which of these best expands the noun phrase 'the forest' with at least two extra details?",
    options: ["the dark, mysterious forest", "the forest", "a forest", "forest dark mysterious the"],
    explanation: "'Dark' and 'mysterious' both add descriptive detail to the noun 'forest'.",
  },
  {
    strandSlug: "sentence-structure", yearGroup: "Y5",
    oldPromptText: "Write a compound sentence joining these ideas with 'but': 'The team trained hard. They lost the match.'",
    newPromptText: "Which sentence correctly joins these ideas as a compound sentence with 'but': 'The team trained hard. They lost the match.'?",
    options: [
      "The team trained hard, but they lost the match.",
      "The team trained hard but lost the match they.",
      "The team trained hard, so they lost the match.",
      "The team trained hard. But they lost the match.",
    ],
    explanation: "'But' joins the two contrasting main clauses into a single compound sentence.",
  },
  {
    strandSlug: "sentence-structure", yearGroup: "Y5",
    oldPromptText: "Rewrite as a complex sentence with the subordinate clause at the start: 'We went home. The party ended.'",
    newPromptText: "Which sentence correctly rewrites this as a complex sentence with the subordinate clause at the start: 'We went home. The party ended.'?",
    options: [
      "When the party ended, we went home.",
      "We went home when the party ended.",
      "When the party ended we went home.",
      "The party ended, when we went home.",
    ],
    explanation: "'When the party ended' is the subordinate clause, correctly placed first and followed by a comma.",
  },
  {
    strandSlug: "cohesion", yearGroup: "Y5",
    oldPromptText: "Write a sentence linking back to this idea using an adverbial of place: 'The hikers reached the summit.'",
    newPromptText: "Which sentence best links back to this idea using an adverbial of place: 'The hikers reached the summit.'?",
    options: ["From there, they could see the whole valley.", "They could see the whole valley.", "They reached the summit quickly.", "Valley the whole see could they there from."],
    explanation: "'From there' is an adverbial of place that logically follows on from reaching the summit.",
  },
  {
    strandSlug: "cohesion", yearGroup: "Y5",
    oldPromptText: "Write a sentence linking back using an adverbial of number/order: 'The chef prepared the sauce.'",
    newPromptText: "Which sentence best links back using an adverbial of number/order: 'The chef prepared the sauce.'?",
    options: ["Next, she added the herbs.", "She added the herbs.", "The sauce was very tasty.", "Herbs the added she next."],
    explanation: "'Next' is a sequencing adverbial that shows what happened after the sauce was prepared.",
  },
  {
    strandSlug: "relative-clauses", yearGroup: "Y6",
    oldPromptText: "Rewrite this sentence, omitting the relative pronoun where possible: 'The film that we watched last night was terrifying.'",
    newPromptText: "Which sentence correctly omits the relative pronoun from 'The film that we watched last night was terrifying.'?",
    options: [
      "The film we watched last night was terrifying.",
      "The film that we watched last night was terrifying.",
      "The film we that watched last night was terrifying.",
      "We watched the film last night that was terrifying.",
    ],
    explanation: "'That' can be dropped because it is the object of the relative clause, not the subject.",
  },
  {
    strandSlug: "relative-clauses", yearGroup: "Y6",
    oldPromptText: "Combine using an omitted relative pronoun: 'This is the photograph. My uncle took the photograph in 1985.'",
    newPromptText: "Which sentence correctly combines these using an omitted relative pronoun: 'This is the photograph. My uncle took the photograph in 1985.'?",
    options: [
      "This is the photograph my uncle took in 1985.",
      "This is the photograph that my uncle took in 1985.",
      "My uncle took this is the photograph in 1985.",
      "This is the photograph, my uncle took in 1985.",
    ],
    explanation: "Since 'the photograph' is the object of 'took', the relative pronoun 'that/which' can be omitted for a concise, formal style.",
  },
  {
    strandSlug: "relative-clauses", yearGroup: "Y6",
    oldPromptText: "Rewrite formally, omitting the relative pronoun: 'The decision that the judges reached surprised everyone.'",
    newPromptText: "Which sentence correctly rewrites this formally, omitting the relative pronoun: 'The decision that the judges reached surprised everyone.'?",
    options: [
      "The decision the judges reached surprised everyone.",
      "The decision that the judges reached surprised everyone.",
      "The judges reached the decision surprised everyone.",
      "The decision the judges that reached surprised everyone.",
    ],
    explanation: "'That' is the object of 'reached' so it can be dropped for concise, formal writing.",
  },
  {
    strandSlug: "modal-verbs", yearGroup: "Y6",
    oldPromptText: "Rewrite using a modal verb to show strong obligation: 'You attend the meeting.'",
    newPromptText: "Which sentence correctly uses a modal verb to show strong obligation: 'You attend the meeting.'?",
    options: ["You must attend the meeting.", "You might attend the meeting.", "You could attend the meeting.", "You attend the meeting maybe."],
    explanation: "'Must' expresses strong obligation, unlike the weaker possibility modals 'might'/'could'.",
  },
  {
    strandSlug: "modal-verbs", yearGroup: "Y6",
    oldPromptText: "Rewrite this informal sentence formally, keeping the same degree of possibility: 'It might be true, I reckon.'",
    newPromptText: "Which sentence correctly rewrites this formally, keeping the same degree of possibility: 'It might be true, I reckon.'?",
    options: ["It might be true.", "It must be true.", "It is true, I reckon.", "I reckon it might be true."],
    explanation: "Formal register drops the informal 'I reckon' while keeping the modal verb 'might' for the same degree of possibility.",
  },
  {
    strandSlug: "modal-verbs", yearGroup: "Y6",
    oldPromptText: "Write a formal sentence expressing a small degree of possibility that the results are inaccurate, using a modal verb.",
    newPromptText: "Which sentence formally expresses a small degree of possibility that the results are inaccurate, using a modal verb?",
    options: ["The results may be inaccurate.", "The results must be inaccurate.", "The results are definitely inaccurate.", "The results are probably accurate."],
    explanation: "'May' expresses a small degree of possibility, unlike 'must'/'definitely', which express certainty.",
  },
  {
    strandSlug: "fronted-adverbials", yearGroup: "Y6",
    oldPromptText: "Write a sentence beginning with a fronted adverbial of manner, describing how a dancer moved.",
    newPromptText: "Which sentence correctly begins with a fronted adverbial of manner, describing how a dancer moved?",
    options: [
      "Gracefully, the dancer moved across the stage.",
      "The dancer moved across the stage gracefully.",
      "Gracefully the dancer moved across the stage.",
      "The graceful dancer moved across the stage.",
    ],
    explanation: "'Gracefully' fronts the sentence and is followed by a comma, describing how the dancer moved.",
  },
  {
    strandSlug: "fronted-adverbials", yearGroup: "Y6",
    oldPromptText: "Write a sentence beginning with a fronted adverbial of probability about whether a team will win.",
    newPromptText: "Which sentence correctly begins with a fronted adverbial of probability about whether a team will win?",
    options: [
      "Surely, the team will win the match.",
      "The team will surely win the match.",
      "Surely the team will win the match.",
      "The team, surely, will win the match.",
    ],
    explanation: "'Surely' fronts the sentence and is followed by a comma, expressing how likely the win is.",
  },
  {
    strandSlug: "fronted-adverbials", yearGroup: "Y6",
    oldPromptText: "Rewrite this paragraph opening using a varied fronted adverbial of time (not 'suddenly' or 'later'): 'The bell rang and the exam began.'",
    newPromptText: "Which sentence correctly rewrites this using a varied fronted adverbial of time (not 'suddenly' or 'later'): 'The bell rang and the exam began.'?",
    options: [
      "At nine o'clock sharp, the bell rang and the exam began.",
      "Suddenly, the bell rang and the exam began.",
      "Later, the bell rang and the exam began.",
      "The bell rang and the exam began at nine o'clock sharp.",
    ],
    explanation: "'At nine o'clock sharp' is a fronted adverbial of time that avoids the overused 'suddenly'/'later'.",
  },
  {
    strandSlug: "parenthesis", yearGroup: "Y6",
    oldPromptText: "Rewrite this sentence using dashes instead of brackets for a more dramatic, informal effect: 'The winner (much to everyone's surprise) was the youngest competitor.'",
    newPromptText: "Which sentence correctly uses dashes instead of brackets for a more dramatic, informal effect: 'The winner (much to everyone's surprise) was the youngest competitor.'?",
    options: [
      "The winner — much to everyone's surprise — was the youngest competitor.",
      "The winner (much to everyone's surprise) was the youngest competitor.",
      "The winner, much to everyone's surprise, was the youngest competitor.",
      "The winner — much to everyone's surprise, was the youngest competitor.",
    ],
    explanation: "A pair of dashes replaces the brackets, creating a more dramatic, informal interruption.",
  },
  {
    strandSlug: "parenthesis", yearGroup: "Y6",
    oldPromptText: "Rewrite this sentence for a formal essay, replacing the dashes with a more suitable form of parenthesis: 'The volcano — dormant for over a century — erupted without warning.'",
    newPromptText: "Which sentence correctly replaces the dashes with a more suitable form of parenthesis for a formal essay: 'The volcano — dormant for over a century — erupted without warning.'?",
    options: [
      "The volcano (dormant for over a century) erupted without warning.",
      "The volcano — dormant for over a century — erupted without warning.",
      "The volcano, dormant for over a century — erupted without warning.",
      "The volcano dormant for over a century erupted without warning.",
    ],
    explanation: "Brackets suit formal essay writing better than dashes, which feel more dramatic and informal.",
  },
  {
    strandSlug: "expanded-noun-phrases", yearGroup: "Y6",
    oldPromptText: "Expand this noun phrase economically using one adjective and one prepositional phrase: 'the bridge'",
    newPromptText: "Which of these economically expands 'the bridge' using one adjective and one prepositional phrase?",
    options: ["the narrow bridge over the river", "the bridge", "the narrow, old, ancient bridge", "the bridge over the river that is narrow"],
    explanation: "'Narrow' (adjective) plus 'over the river' (prepositional phrase) adds precise detail economically.",
  },
  {
    strandSlug: "expanded-noun-phrases", yearGroup: "Y6",
    oldPromptText: "Rewrite this noun phrase more precisely and economically, using a modifying noun instead of a wordy description: 'a door that is made of oak'",
    newPromptText: "Which of these rewrites 'a door that is made of oak' more precisely and economically, using a modifying noun?",
    options: ["the oak door", "a door that is made of oak", "a door of oak material", "the oaken made door"],
    explanation: "'Oak' used as a modifying noun expresses the same information far more economically than the wordy relative clause.",
  },
  {
    strandSlug: "expanded-noun-phrases", yearGroup: "Y6",
    oldPromptText: "Expand 'the letter' precisely and economically using an adjective, a modifying noun and a prepositional phrase.",
    newPromptText: "Which of these expands 'the letter' precisely and economically using an adjective, a modifying noun and a prepositional phrase?",
    options: ["the crumpled parchment letter from her grandfather", "the letter", "the crumpled letter", "letter crumpled parchment grandfather her from the"],
    explanation: "Combining an adjective ('crumpled'), a modifying noun ('parchment') and a prepositional phrase ('from her grandfather') packs maximum precision into a concise phrase.",
  },
  {
    strandSlug: "prefixes", yearGroup: "Y6",
    oldPromptText: "Use your knowledge of prefixes to infer the meaning of 'overreact'.",
    newPromptText: "Using your knowledge of prefixes, what does 'overreact' mean?",
    options: ["To react too much", "To react again", "To not react at all", "To react wrongly"],
    explanation: "'Over-' means 'too much', so 'overreact' means to react excessively to something.",
  },
  {
    strandSlug: "prefixes", yearGroup: "Y6",
    oldPromptText: "Using prefix knowledge, explain what 'misinform' means.",
    newPromptText: "Using your knowledge of prefixes, what does 'misinform' mean?",
    options: [
      "To give someone wrong or incorrect information",
      "To inform someone again",
      "To inform someone too much",
      "To refuse to inform someone",
    ],
    explanation: "'Mis-' means 'wrongly', so 'misinform' means to give incorrect information.",
  },
  {
    strandSlug: "sentence-structure", yearGroup: "Y6",
    oldPromptText: "Identify the sentence type: 'Because the bridge was closed, we took a longer route home.'",
    newPromptText: "What type of sentence is this: 'Because the bridge was closed, we took a longer route home.'?",
    options: ["Complex", "Simple", "Compound", "Compound-complex"],
    explanation: "This sentence has a subordinate clause ('Because the bridge was closed') and a main clause, making it complex.",
  },
  {
    strandSlug: "sentence-structure", yearGroup: "Y6",
    oldPromptText: "Rewrite these two simple sentences as one compound sentence: 'The wind howled. The trees swayed violently.'",
    newPromptText: "Which sentence correctly combines these as one compound sentence: 'The wind howled. The trees swayed violently.'?",
    options: [
      "The wind howled, and the trees swayed violently.",
      "The wind howled because the trees swayed violently.",
      "The wind howled, the trees swayed violently.",
      "Howling, the wind made the trees sway violently.",
    ],
    explanation: "Joining the two independent clauses with 'and' (plus a comma) creates a compound sentence.",
  },
  {
    strandSlug: "sentence-structure", yearGroup: "Y6",
    oldPromptText: "Rewrite this sentence in a more formal register: 'The boss wants everyone to turn up on time.'",
    newPromptText: "Which sentence correctly rewrites this in a more formal register: 'The boss wants everyone to turn up on time.'?",
    options: [
      "The manager requests that everyone arrive on time.",
      "The boss wants everyone to turn up on time.",
      "The manager wants everyone to turn up on time.",
      "The boss requests everyone arrives on time please.",
    ],
    explanation: "Formal register replaces informal words ('boss', 'turn up') with more precise, elevated vocabulary throughout.",
  },
  {
    strandSlug: "sentence-structure", yearGroup: "Y6",
    oldPromptText: "Rewrite formally, using a subjunctive structure: 'The doctor said, \"You should rest.\"'",
    newPromptText: "Which sentence correctly rewrites this formally, using a subjunctive structure: 'The doctor said, \"You should rest.\"'?",
    options: [
      "The doctor recommended that she rest.",
      "The doctor recommended that she rests.",
      "The doctor said that she should rest.",
      "The doctor recommended she is resting.",
    ],
    explanation: "Verbs like 'recommend' trigger the subjunctive, which uses the base form of the verb ('rest') regardless of subject.",
  },
  {
    strandSlug: "cohesion", yearGroup: "Y6",
    oldPromptText: "Rewrite the second sentence using ellipsis to avoid repetition: 'Sam wanted to play football. Jess wanted to play football too.'",
    newPromptText: "Which version of the second sentence correctly uses ellipsis to avoid repetition: 'Sam wanted to play football. Jess wanted to play football too.'?",
    options: ["Jess did too.", "Jess wanted to play football too.", "Jess wanted to play football, Sam too.", "Jess did football too."],
    explanation: "Ellipsis omits the repeated words ('wanted to play football'), relying on the reader to infer them from context.",
  },
  {
    strandSlug: "cohesion", yearGroup: "Y6",
    oldPromptText: "Write a follow-up sentence that links back using deliberate repetition of a key word or phrase: 'The old library held thousands of forgotten books.'",
    newPromptText: "Which follow-up sentence correctly links back using deliberate repetition of a key phrase: 'The old library held thousands of forgotten books.'?",
    options: [
      "Those forgotten books had not been opened in decades.",
      "They had not been opened in decades.",
      "The library was very old.",
      "Decades opened not had books forgotten those.",
    ],
    explanation: "Repeating the phrase 'forgotten books' creates cohesion by explicitly linking the two sentences.",
  },
  {
    strandSlug: "cohesion", yearGroup: "Y6",
    oldPromptText: "Rewrite the second sentence using ellipsis to avoid repetition: 'Maya had finished her project. Leo had finished his project as well.'",
    newPromptText: "Which version of the second sentence correctly uses ellipsis to avoid repetition: 'Maya had finished her project. Leo had finished his project as well.'?",
    options: ["Leo had too.", "Leo had finished his project as well.", "Leo too had finished.", "So Leo had finished."],
    explanation: "Ellipsis omits 'finished his project', which is understood from the first sentence.",
  },
  {
    strandSlug: "active-passive-voice", yearGroup: "Y6",
    oldPromptText: "Rewrite this sentence in the passive voice: 'The council will repair the road next month.'",
    newPromptText: "Which sentence correctly rewrites this in the passive voice: 'The council will repair the road next month.'?",
    options: [
      "The road will be repaired by the council next month.",
      "The council will repair the road next month.",
      "The road will repair the council next month.",
      "The road was repaired by the council next month.",
    ],
    explanation: "The passive voice moves the object ('the road') to the subject position, using 'will be' + past participle.",
  },
  {
    strandSlug: "active-passive-voice", yearGroup: "Y6",
    oldPromptText: "Rewrite this passive sentence in the active voice: 'The trophy was presented to the winner by the mayor.'",
    newPromptText: "Which sentence correctly rewrites this in the active voice: 'The trophy was presented to the winner by the mayor.'?",
    options: [
      "The mayor presented the trophy to the winner.",
      "The trophy was presented to the winner by the mayor.",
      "The winner presented the trophy to the mayor.",
      "The trophy presented the mayor to the winner.",
    ],
    explanation: "In the active voice, the mayor (the doer of the action) becomes the subject of the sentence.",
  },
  {
    strandSlug: "active-passive-voice", yearGroup: "Y6",
    oldPromptText: "Explain why a newspaper headline might use the passive voice: 'Local park vandalised overnight.'",
    newPromptText: "Why might a newspaper headline use the passive voice, as in 'Local park vandalised overnight'?",
    options: [
      "To focus attention on the event rather than on who did it, especially when the culprit is unknown",
      "To make the sentence longer and more formal",
      "Because active voice cannot be used in headlines",
      "To clearly name who is responsible for the vandalism",
    ],
    explanation: "The passive voice foregrounds the event itself when the agent is unknown or less important than the outcome.",
  },
  {
    strandSlug: "subjunctive-form", yearGroup: "Y6",
    oldPromptText: "Rewrite using the subjunctive: 'If I am you, I would apologise.'",
    newPromptText: "Which sentence correctly rewrites this using the subjunctive: 'If I am you, I would apologise.'?",
    options: ["If I were you, I would apologise.", "If I am you, I would apologise.", "If I was you, I would apologise.", "If I were you, I will apologise."],
    explanation: "The subjunctive 'were' is used for hypothetical situations contrary to fact, regardless of subject.",
  },
  {
    strandSlug: "subjunctive-form", yearGroup: "Y6",
    oldPromptText: "Rewrite formally using the subjunctive: 'The headteacher insisted, \"Every student must arrive on time.\"'",
    newPromptText: "Which sentence correctly rewrites this formally using the subjunctive: 'The headteacher insisted, \"Every student must arrive on time.\"'?",
    options: [
      "The headteacher insisted that every student arrive on time.",
      "The headteacher insisted that every student arrives on time.",
      "The headteacher insisted every student must arrive on time.",
      "The headteacher insisted that every student arrived on time.",
    ],
    explanation: "'Insisted that' triggers the subjunctive, which uses the base form 'arrive' rather than 'arrives'.",
  },
  {
    strandSlug: "semicolons-colons-dashes", yearGroup: "Y6",
    oldPromptText: "Explain the difference in meaning between 'a hot water bottle' and 'a hot-water bottle'.",
    newPromptText: "What is the difference in meaning between 'a hot water bottle' and 'a hot-water bottle'?",
    options: [
      "A hot-water bottle is a bottle for holding hot water, while a hot water bottle could mean a water bottle that is hot",
      "There is no difference in meaning between the two",
      "A hot-water bottle means the bottle itself is hot, while a hot water bottle holds hot water",
      "The hyphen only affects pronunciation, not meaning",
    ],
    explanation: "The hyphen links 'hot' and 'water' as a single modifier describing the type of bottle, avoiding ambiguity.",
  },
  {
    strandSlug: "semicolons-colons-dashes", yearGroup: "Y6",
    oldPromptText: "Explain how a hyphen changes the meaning between 're-form' and 'reform'.",
    newPromptText: "How does a hyphen change the meaning between 're-form' and 'reform'?",
    options: [
      "Re-form means to form again, while reform means to improve or change a system",
      "Reform means to form again, while re-form means to improve a system",
      "There is no difference between re-form and reform",
      "The hyphen makes 're-form' informal and 'reform' formal",
    ],
    explanation: "The hyphen distinguishes 're-form' (to form again) from 'reform' (to improve or change).",
  },
  {
    strandSlug: "semicolons-colons-dashes", yearGroup: "Y6",
    oldPromptText: "Explain the ambiguity in the phrase 'a man eating shark' and show how a hyphen fixes it.",
    newPromptText: "How does a hyphen fix the ambiguity in the phrase 'a man eating shark'?",
    options: [
      "Without a hyphen it could mean a shark that is eating a man; 'man-eating shark' with a hyphen means a shark that eats people",
      "The phrase has no ambiguity, with or without a hyphen",
      "Without a hyphen it means the shark is being eaten by the man; the hyphen changes nothing",
      "The hyphen changes 'shark' into an adjective describing the man",
    ],
    explanation: "Without the hyphen, 'man eating shark' could describe a man eating shark meat; the hyphen fixes 'man-eating' as a single adjective describing the shark's diet.",
  },
  {
    strandSlug: "layout-devices", yearGroup: "Y6",
    oldPromptText: "Give one reason why a recipe uses bullet points to list ingredients rather than a full paragraph.",
    newPromptText: "Why might a recipe use bullet points to list ingredients rather than a full paragraph?",
    options: [
      "Bullet points make each ingredient easy to see and read quickly, rather than searching through a paragraph",
      "Bullet points use fewer letters than paragraphs",
      "Paragraphs are not allowed in recipes",
      "Bullet points make the recipe sound more formal",
    ],
    explanation: "Bullet points present list items clearly and concisely, making them faster to scan than a dense paragraph.",
  },
  {
    strandSlug: "layout-devices", yearGroup: "Y6",
    oldPromptText: "Explain why a non-fiction text about volcanoes might use sub-headings.",
    newPromptText: "Why might a non-fiction text about volcanoes use sub-headings?",
    options: [
      "To break the information into smaller, organised sections so readers can find specific information quickly",
      "To make the text look more colourful",
      "Because paragraphs are not allowed in non-fiction texts",
      "To make the text longer",
    ],
    explanation: "Sub-headings divide information into clear, organised sections, helping readers locate facts quickly.",
  },
  {
    strandSlug: "layout-devices", yearGroup: "Y6",
    oldPromptText: "A pupil is writing an information text about the rainforest with sections on 'Climate', 'Animals' and 'Plants'. Explain how headings would help organise this text.",
    newPromptText: "A pupil is writing an information text about the rainforest with sections on 'Climate', 'Animals' and 'Plants'. How would headings help organise this text?",
    options: [
      "Headings would let the reader quickly find the section they want, such as jumping straight to 'Animals'",
      "Headings would make each section shorter automatically",
      "Headings are only needed if the text has pictures",
      "Headings replace the need for full sentences",
    ],
    explanation: "Headings act as signposts, allowing readers to locate the specific section they need without reading the whole text.",
  },
  {
    strandSlug: "brackets-dashes", yearGroup: "Y6",
    oldPromptText: "Combine these two sentences using a single dash: 'The explorers ran out of supplies. They had to turn back three days from the summit.'",
    newPromptText: "Which sentence correctly combines these using a single dash: 'The explorers ran out of supplies. They had to turn back three days from the summit.'?",
    options: [
      "The explorers ran out of supplies — they had to turn back three days from the summit.",
      "The explorers ran out of supplies. They had to turn back three days from the summit.",
      "The explorers ran out of supplies, they had to turn back three days from the summit.",
      "The explorers ran out of supplies — — they had to turn back three days from the summit.",
    ],
    explanation: "A single dash can replace the full stop between two closely related independent clauses for effect.",
  },
  {
    strandSlug: "cohesion", yearGroup: "Y6",
    oldPromptText: "Rewrite the second sentence using a grammatical connection (a pronoun) instead of repeating the noun: 'The scientist studied the samples. The samples revealed a surprising pattern.'",
    newPromptText: "Which version of the second sentence correctly uses a pronoun instead of repeating the noun: 'The scientist studied the samples. The samples revealed a surprising pattern.'?",
    options: [
      "The scientist studied the samples. They revealed a surprising pattern.",
      "The scientist studied the samples. The samples revealed a surprising pattern.",
      "The scientist studied the samples. It revealed a surprising pattern.",
      "The scientist studied it. The samples revealed a surprising pattern.",
    ],
    explanation: "Replacing 'the samples' with the plural pronoun 'they' links the sentences cohesively without clunky repetition.",
  },
  {
    strandSlug: "cohesion", yearGroup: "Y6",
    oldPromptText: "Write a sentence that could open a new paragraph, using repetition of the phrase 'the ancient forest' to link back to a previous paragraph about deforestation.",
    newPromptText: "Which sentence could correctly open a new paragraph, using repetition of the phrase 'the ancient forest' to link back to a previous paragraph about deforestation?",
    options: [
      "The ancient forest had stood for a thousand years.",
      "It had stood for a thousand years.",
      "Forests are important for wildlife.",
      "Thousand a for stood had forest ancient the years.",
    ],
    explanation: "Deliberately repeating the key phrase 'the ancient forest' across paragraph boundaries keeps the reader anchored to the topic.",
  },
  {
    strandSlug: "expanded-noun-phrases", yearGroup: "Y6",
    oldPromptText: "Rewrite 'the cottage' as an expanded noun phrase that gives precise detail using both a modifying adjective and a prepositional phrase.",
    newPromptText: "Which of these expands 'the cottage' precisely using both a modifying adjective and a prepositional phrase?",
    options: [
      "the crumbling cottage at the edge of the woods",
      "the cottage",
      "the crumbling, old, ancient cottage",
      "the cottage at the edge of the woods that is crumbling",
    ],
    explanation: "Combining an adjective ('crumbling') with a prepositional phrase ('at the edge of the woods') builds precision economically.",
  },
  {
    strandSlug: "fronted-adverbials", yearGroup: "Y6",
    oldPromptText: "Write a fronted adverbial of probability to begin this sentence: '___, the match will be postponed if the rain continues.'",
    newPromptText: "Which word correctly completes this fronted adverbial of probability: '___, the match will be postponed if the rain continues.'?",
    options: ["Surely", "Quickly", "Yesterday", "Nearby"],
    explanation: "'Surely' is an adverbial of probability, signalling how likely the postponement is — 'quickly' (manner), 'yesterday' (time) and 'nearby' (place) are the wrong kind of adverbial.",
  },
  {
    strandSlug: "fronted-adverbials", yearGroup: "Y6",
    oldPromptText: "Rewrite this sentence to begin with a fronted adverbial of time: 'The lights flickered off just as the storm reached its peak.'",
    newPromptText: "Which sentence correctly begins with a fronted adverbial of time: 'The lights flickered off just as the storm reached its peak.'?",
    options: [
      "Just as the storm reached its peak, the lights flickered off.",
      "The lights flickered off just as the storm reached its peak.",
      "Just as the storm reached its peak the lights flickered off.",
      "The storm reached its peak, just as the lights flickered off.",
    ],
    explanation: "Moving the time clause to the front creates a fronted adverbial, correctly followed by a comma.",
  },
  {
    strandSlug: "layout-devices", yearGroup: "Y6",
    oldPromptText: "You are writing a report on the water cycle with three main sections: evaporation, condensation, and precipitation. Suggest a heading and one sub-heading you could use.",
    newPromptText: "You are writing a report on the water cycle with three main sections: evaporation, condensation, and precipitation. Which heading and sub-heading pair works best?",
    options: [
      "Heading: The Water Cycle. Sub-heading: Evaporation.",
      "Heading: Water. Sub-heading: The Cycle.",
      "Heading: Evaporation. Sub-heading: The Water Cycle.",
      "Heading: My Report. Sub-heading: Science.",
    ],
    explanation: "A clear main heading names the overall topic ('The Water Cycle'), while the sub-heading names the first section ('Evaporation').",
  },
  {
    strandSlug: "modal-verbs", yearGroup: "Y6",
    oldPromptText: "Add a modal adverb to strengthen the degree of certainty in this sentence: 'It ___ will rain later, given the dark clouds.'",
    newPromptText: "Which modal adverb correctly strengthens the degree of certainty in this sentence: 'It ___ will rain later, given the dark clouds.'?",
    options: ["Surely", "Rarely", "Barely", "Never"],
    explanation: "'Surely' strengthens certainty, unlike 'rarely'/'barely' (frequency/extent) or 'never', which would contradict the sentence.",
  },
  {
    strandSlug: "modal-verbs", yearGroup: "Y6",
    oldPromptText: "Rewrite this informal request as a formal one using an appropriate modal verb: 'Can I leave early today?'",
    newPromptText: "Which sentence correctly rewrites this as a formal request using an appropriate modal verb: 'Can I leave early today?'?",
    options: ["May I leave early today?", "Can I leave early today?", "Must I leave early today?", "I can leave early today?"],
    explanation: "'May' is the more formal modal verb for requesting permission than the informal 'can'.",
  },
  {
    strandSlug: "parenthesis", yearGroup: "Y6",
    oldPromptText: "Add parenthesis using commas to this sentence to insert the extra detail 'a small fishing village': 'Whitby was once a small fishing village and is now a popular tourist town.'",
    newPromptText: "Which sentence correctly adds parenthesis using commas to insert the detail 'a small fishing village': 'Whitby is now a popular tourist town.'?",
    options: [
      "Whitby, once a small fishing village, is now a popular tourist town.",
      "Whitby was once a small fishing village and is now a popular tourist town.",
      "Whitby, once a small fishing village is now a popular tourist town.",
      "Whitby once, a small fishing village, is now a popular tourist town.",
    ],
    explanation: "Commas are the most neutral, everyday way to insert parenthetical information, with one comma on each side of the inserted detail.",
  },
  {
    strandSlug: "prefixes", yearGroup: "Y6",
    oldPromptText: "Use the prefix 'over-' to form a word meaning 'to sleep for too long'.",
    newPromptText: "Which word, formed with the prefix 'over-', means 'to sleep for too long'?",
    options: ["Oversleep", "Resleep", "Undersleep", "Missleep"],
    explanation: "'Over-' means 'too much', so 'oversleep' means to sleep for longer than intended.",
  },
  {
    strandSlug: "prefixes", yearGroup: "Y6",
    oldPromptText: "The word 'misinformation' contains the prefix 'mis-'. Explain what 'mis-' means and how it changes the meaning of 'information'.",
    newPromptText: "The word 'misinformation' contains the prefix 'mis-'. What does 'mis-' mean, and how does it change the meaning of 'information'?",
    options: [
      "Mis- means wrongly or badly, so misinformation means information that is wrong or incorrect",
      "Mis- means too much, so misinformation means an excessive amount of information",
      "Mis- means again, so misinformation means information given again",
      "Mis- means not, so misinformation means a complete lack of information",
    ],
    explanation: "'Mis-' means 'wrongly' or 'badly', so 'misinformation' is information that is incorrect or misleading.",
  },
  {
    strandSlug: "relative-clauses", yearGroup: "Y6",
    oldPromptText: "Rewrite this sentence to omit the relative pronoun: 'The book that I borrowed from the library was fascinating.'",
    newPromptText: "Which sentence correctly omits the relative pronoun from 'The book that I borrowed from the library was fascinating.'?",
    options: [
      "The book I borrowed from the library was fascinating.",
      "The book that I borrowed from the library was fascinating.",
      "The book I that borrowed from the library was fascinating.",
      "I borrowed the book from the library that was fascinating.",
    ],
    explanation: "When the relative pronoun is the object of the clause, it can be dropped: 'The book I borrowed...'.",
  },
  {
    strandSlug: "relative-clauses", yearGroup: "Y6",
    oldPromptText: "Explain why the relative pronoun can be omitted from 'The house [that] we visited was for sale' but not from 'The house that stood on the hill was for sale.'",
    newPromptText: "Why can the relative pronoun be omitted from 'The house [that] we visited was for sale' but not from 'The house that stood on the hill was for sale'?",
    options: [
      "Because in the first sentence 'that' is the object of the clause, but in the second it is the subject, so it cannot be omitted",
      "Because the first sentence is shorter than the second",
      "Because 'house' is used twice in the second sentence",
      "Because the second sentence is a question and the first is a statement",
    ],
    explanation: "A relative pronoun can only be omitted when it is the object of its clause; when it acts as the subject, as in the second example, it must remain.",
  },
  {
    strandSlug: "subjunctive-form", yearGroup: "Y6",
    oldPromptText: "Rewrite formally using the subjunctive: 'If I was in charge, I would change the rules.'",
    newPromptText: "Which sentence correctly rewrites this formally using the subjunctive: 'If I was in charge, I would change the rules.'?",
    options: [
      "If I were in charge, I would change the rules.",
      "If I was in charge, I would change the rules.",
      "If I am in charge, I would change the rules.",
      "If I were in charge, I will change the rules.",
    ],
    explanation: "The subjunctive 'were' replaces 'was' in hypothetical if-clauses, regardless of subject.",
  },
  {
    strandSlug: "subjunctive-form", yearGroup: "Y6",
    oldPromptText: "Rewrite as a formal demand using the subjunctive: 'The manager demanded, \"Everyone must submit the form today.\"'",
    newPromptText: "Which sentence correctly rewrites this as a formal demand using the subjunctive: 'The manager demanded, \"Everyone must submit the form today.\"'?",
    options: [
      "The manager demanded that everyone submit the form today.",
      "The manager demanded that everyone submits the form today.",
      "The manager demanded everyone must submit the form today.",
      "The manager demanded that everyone submitted the form today.",
    ],
    explanation: "'Demanded that' triggers the subjunctive base form 'submit' rather than 'submits'.",
  },
  {
    strandSlug: "suffixes", yearGroup: "Y6",
    oldPromptText: "Explain the spelling rule: why is it 'official' (-cial) but 'essential' (-tial)?",
    newPromptText: "What is the spelling rule that explains why it is 'official' (-cial) but 'essential' (-tial)?",
    options: [
      "-cial usually follows a vowel and -tial usually follows a consonant",
      "-cial is always used and -tial is an old-fashioned spelling no longer used",
      "-cial follows a consonant and -tial follows a vowel",
      "There is no rule — the spelling is completely random",
    ],
    explanation: "'-cial' generally follows a root ending in a vowel sound (office → official), while '-tial' generally follows a root ending in a consonant (essence → essential).",
  },
  {
    strandSlug: "synonyms-antonyms", yearGroup: "Y6",
    oldPromptText: "This sentence repeats 'big' three times. Rewrite it using varied synonyms: 'It was a big house, with a big garden and a big pond.'",
    newPromptText: "Which sentence correctly rewrites this using varied synonyms instead of repeating 'big': 'It was a big house, with a big garden and a big pond.'?",
    options: [
      "It was a vast house, with a sprawling garden and a large pond.",
      "It was a big house, with a big garden and a big pond.",
      "It was a house, with a garden and a pond.",
      "It was a big, big house, with a big garden and a big pond.",
    ],
    explanation: "'Vast', 'sprawling' and 'large' are varied synonyms for 'big' that make the writing more precise and engaging.",
  },
];

function toMultipleChoiceDraft(r: Rework) {
  const options = r.options.map((text, i) => ({ id: `opt${i + 1}`, text }));
  return { promptText: r.newPromptText, options, correctOptionId: options[0].id, explanation: r.explanation };
}

function updateGrammarJson() {
  const raw = fs.readFileSync(GRAMMAR_JSON_PATH, "utf-8");
  const questions: Array<Record<string, unknown>> = JSON.parse(raw);

  let matched = 0;
  for (const rework of REWORKS) {
    const idx = questions.findIndex(
      (q) => q.strandSlug === rework.strandSlug && q.yearGroup === rework.yearGroup && q.type === "short_answer" && q.promptText === rework.oldPromptText
    );
    if (idx === -1) {
      console.warn(`  ! Not found in grammar.json: [${rework.strandSlug}/${rework.yearGroup}] "${rework.oldPromptText.slice(0, 60)}..."`);
      continue;
    }
    const draft = toMultipleChoiceDraft(rework);
    const original = questions[idx];
    questions[idx] = {
      subjectSlug: original.subjectSlug,
      strandSlug: original.strandSlug,
      yearGroup: original.yearGroup,
      objectiveCode: original.objectiveCode,
      type: "multiple_choice",
      difficulty: original.difficulty,
      promptText: draft.promptText,
      options: draft.options,
      correctOptionId: draft.correctOptionId,
      explanation: draft.explanation,
    };
    matched++;
  }

  fs.writeFileSync(GRAMMAR_JSON_PATH, JSON.stringify(questions, null, 2) + "\n");
  console.log(`  ✓ grammar.json: ${matched}/${REWORKS.length} entries reworked`);
}

async function updateLiveDb() {
  let updated = 0;
  let notFound = 0;

  for (const rework of REWORKS) {
    const topic = await db.topic.findFirst({
      where: { subject: { slug: "grammar" }, strandSlug: rework.strandSlug, yearGroup: rework.yearGroup },
    });
    if (!topic) {
      console.warn(`  ! No topic for ${rework.strandSlug}/${rework.yearGroup}`);
      notFound++;
      continue;
    }

    // prompt is stored as JSON `{ text, media? }` — match on the parsed text,
    // not a raw substring, since the JSON encoding could differ byte-for-byte.
    const candidates = await db.contentQuestion.findMany({
      where: { topicId: topic.id, type: "SHORT_ANSWER" },
    });
    const row = candidates.find((c) => {
      try {
        return (JSON.parse(c.prompt) as { text: string }).text === rework.oldPromptText;
      } catch {
        return false;
      }
    });

    if (!row) {
      console.warn(`  ! Not found in live DB: [${rework.strandSlug}/${rework.yearGroup}] "${rework.oldPromptText.slice(0, 60)}..."`);
      notFound++;
      continue;
    }

    const draft = toMultipleChoiceDraft(rework);
    await db.contentQuestion.update({
      where: { id: row.id },
      data: {
        type: "MULTIPLE_CHOICE",
        prompt: JSON.stringify({ text: draft.promptText }),
        options: JSON.stringify({ options: draft.options }),
        answer: JSON.stringify({ correctOptionId: draft.correctOptionId }),
        explanation: draft.explanation,
      },
    });
    updated++;
  }

  console.log(`  ✓ live DB: ${updated}/${REWORKS.length} rows updated in place (${notFound} not found)`);
}

/** Structural sanity checks only — no file/DB writes. Run with `--check`. */
function checkOnly() {
  let problems = 0;
  const seenPrompts = new Set<string>();
  for (const r of REWORKS) {
    const key = `${r.strandSlug}/${r.yearGroup}/${r.oldPromptText}`;
    if (seenPrompts.has(key)) {
      console.error(`  ! Duplicate oldPromptText entry: [${r.strandSlug}/${r.yearGroup}] "${r.oldPromptText.slice(0, 60)}..."`);
      problems++;
    }
    seenPrompts.add(key);

    if (r.options.length !== 4) {
      console.error(`  ! Expected 4 options, got ${r.options.length}: "${r.newPromptText.slice(0, 60)}..."`);
      problems++;
    }
    if (new Set(r.options).size !== r.options.length) {
      console.error(`  ! Duplicate option text: "${r.newPromptText.slice(0, 60)}..."`);
      problems++;
    }
    if (!r.newPromptText.trim() || !r.explanation.trim()) {
      console.error(`  ! Missing prompt/explanation for: "${r.oldPromptText.slice(0, 60)}..."`);
      problems++;
    }
  }
  console.log(`Checked ${REWORKS.length} reworks — ${problems} problem(s).`);
  if (problems > 0) process.exit(1);
}

async function main() {
  if (process.argv.includes("--check")) {
    checkOnly();
    return;
  }
  console.log(`Reworking ${REWORKS.length} free-composition grammar questions to multiple_choice...\n`);
  console.log("→ Updating content/questions/grammar.json...");
  updateGrammarJson();
  console.log("→ Updating live ContentQuestion rows...");
  await updateLiveDb();
  console.log("\nDone.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
