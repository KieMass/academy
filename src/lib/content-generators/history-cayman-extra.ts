/**
 * Additional procedurally-organised Cayman History questions, on top of the
 * existing hand-authored content/questions/cayman/history.json. See
 * science-cayman-extra.ts's header for the rationale — same pattern.
 */
import { createRng, shuffle, type Rng } from "./rng";
import type { DraftQuestion } from "./types";
import type { DifficultyBand, YearGroup } from "@/lib/curriculum/types";

const SUBJECT = "history";

function mc(rng: Rng, opts: { strandSlug: string; yearGroup: YearGroup; objectiveCode: string; difficulty: DifficultyBand; promptText: string; correct: string; distractors: string[]; explanation: string }): DraftQuestion {
  const uniqueDistractors = [...new Set(opts.distractors.filter((d) => d !== opts.correct))].slice(0, 3);
  const optionTexts = shuffle(rng, [opts.correct, ...uniqueDistractors]);
  const options = optionTexts.map((text, i) => ({ id: `opt${i + 1}`, text }));
  const correctOptionId = options.find((o) => o.text === opts.correct)!.id;
  return { type: "multiple_choice", subjectSlug: SUBJECT, strandSlug: opts.strandSlug, yearGroup: opts.yearGroup, objectiveCode: opts.objectiveCode, difficulty: opts.difficulty, promptText: opts.promptText, explanation: opts.explanation, options, correctOptionId };
}

type Row = [string, string, string[], string];

function rowsToQuestions(rng: Rng, rows: Row[], strandSlug: string, yearGroup: YearGroup, objectiveCode: string, difficulty: DifficultyBand): DraftQuestion[] {
  return rows.flatMap(([promptText, correct, distractors, explanation]) => {
    const out: DraftQuestion[] = [mc(rng, { strandSlug, yearGroup, objectiveCode, difficulty, promptText, correct, distractors, explanation })];
    if (correct.split(" ").length <= 3 && !correct.includes(",")) {
      out.push({ type: "short_answer", subjectSlug: SUBJECT, strandSlug, yearGroup, objectiveCode, difficulty, promptText: `${promptText} (Answer without looking at multiple choices.)`, explanation, acceptedAnswers: [correct] });
    }
    return out;
  });
}

const y5AncientGreece: Row[] = [
  ["In which modern-day country was Ancient Greece located?", "Greece", ["Italy", "Egypt", "Turkey"], "Ancient Greek civilisation was centred in the region that is modern-day Greece."],
  ["What was the name of the Ancient Greek gathering place for public debate?", "The agora", ["The colosseum", "The forum", "The senate"], "The agora was the central public space in a Greek city-state, used for markets and debate."],
  ["Which sport did the Ancient Greeks host that is still held today?", "The Olympic Games", ["Football World Cup", "The Super Bowl", "The Tour de France"], "The Olympic Games began in Ancient Greece, in the city of Olympia, and continue in modern form today."],
];

const y5AngloSaxons: Row[] = [
  ["What did Anglo-Saxons use to farm their land?", "Simple wooden ploughs pulled by oxen", ["Steam-powered tractors", "Electric machinery", "Modern combine harvesters"], "Anglo-Saxon farmers used basic wooden ploughs, often pulled by oxen, to work the land."],
  ["What role did the 'witan' play in Anglo-Saxon society?", "It was a council of advisors to the king", ["It was a type of Anglo-Saxon coin", "It was a farming tool", "It was a religious festival"], "The witan was a council of nobles and church leaders who advised the Anglo-Saxon king."],
];

const y5Vikings: Row[] = [
  ["What material were Viking helmets most likely made from?", "Iron or leather", ["Gold", "Plastic", "Glass"], "Viking helmets were typically made of iron or leather, not the horned metal helmets often shown in fiction."],
  ["Which Viking settlement became an important trading town in England?", "York (Jorvik)", ["London only", "Manchester", "Liverpool"], "York, known to the Vikings as Jorvik, became an important Viking trading centre in England."],
];

const y6WW2: Row[] = [
  ["What was 'evacuation' during the Second World War?", "Moving children from cities to safer rural areas", ["Building new houses in cities", "A type of military training", "A style of wartime clothing"], "Evacuation involved moving children (and some adults) away from cities likely to be bombed, to safer countryside areas."],
  ["What was rationing designed to do?", "Share limited food and goods fairly among everyone", ["Increase the price of food", "Stop people from working", "End the war more quickly"], "Rationing controlled how much of each item people could buy, ensuring scarce wartime supplies were shared fairly."],
  ["What was the significance of VE Day?", "It marked the end of the war in Europe", ["It marked the start of the war", "It marked the first bombing raid", "It marked a treaty with Japan"], "VE (Victory in Europe) Day marked the end of the war in Europe, when Germany surrendered."],
];

const y6CrimePunishment: Row[] = [
  ["How did punishments generally change from medieval to modern times?", "They became less physically violent and more focused on rehabilitation", ["They became more physically violent over time", "They disappeared completely", "They stayed exactly the same"], "Over time, punishments in Britain generally became less physically violent, with more focus on rehabilitation rather than physical punishment."],
  ["What was the 'Bloody Code' in English history?", "A set of laws that made many crimes punishable by death", ["A medical treatment", "A type of Viking law", "A trade agreement"], "The Bloody Code referred to a period when English law listed a very large number of offences punishable by death."],
];

export function generateAllHistoryQuestionsCaymanExtra(seed = 85100): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...rowsToQuestions(rng, y5AncientGreece, "ancient-greeks", "Y5", "HI5-GRE-1", "bronze"),
    ...rowsToQuestions(rng, y5AngloSaxons, "anglo-saxons", "Y5", "HI5-SAX-1", "silver"),
    ...rowsToQuestions(rng, y5Vikings, "vikings", "Y5", "HI5-VIK-1", "bronze"),
    ...rowsToQuestions(rng, y6WW2, "world-war-two", "Y6", "HI6-WW2-1", "bronze"),
    ...rowsToQuestions(rng, y6CrimePunishment, "crime-punishment", "Y6", "HI6-CRI-1", "silver"),
  ];
}
