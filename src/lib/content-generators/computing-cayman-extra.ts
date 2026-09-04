/**
 * Additional procedurally-organised Cayman Computing questions, on top of
 * the existing hand-authored content/questions/cayman/computing.json. See
 * science-cayman-extra.ts's header for the rationale — same pattern.
 */
import { createRng, shuffle, type Rng } from "./rng";
import type { DraftQuestion } from "./types";
import type { DifficultyBand, YearGroup } from "@/lib/curriculum/types";

const SUBJECT = "computing";

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

const y5ESafety: Row[] = [
  ["What should you do if a stranger messages you online?", "Tell a trusted adult and don't reply", ["Reply and ask who they are", "Share your address to be polite", "Ignore it and keep chatting later"], "Messages from strangers should be reported to a trusted adult, without replying or sharing personal information."],
  ["Why is it risky to use the same password for every account?", "If one account is hacked, all your accounts become vulnerable", ["It makes passwords easier to remember", "It has no real risk at all", "It automatically deletes your accounts"], "Reusing passwords means a single leaked password can be used to access many of your accounts."],
];

const y6ESafety: Row[] = [
  ["What is 'phishing'?", "A trick to get you to reveal personal information online", ["A method of fishing using a computer", "A type of antivirus software", "A way to speed up your internet"], "Phishing is when someone tries to trick you into giving away personal or financial information, often through fake messages or websites."],
  ["Why should you think carefully before posting a photo online?", "Once shared, it can be difficult to remove or control who sees it", ["Photos automatically delete themselves after a day", "Only you will ever see it", "It has no lasting effect at all"], "Content posted online can be copied, shared further, or seen by unintended audiences — making it hard to fully remove."],
];

const y5Algorithms: Row[] = [
  ["What is a flowchart used for in computing?", "To visually represent the steps of an algorithm", ["To store data permanently", "To connect to the internet", "To design a website's colours"], "A flowchart shows the steps and decisions of an algorithm using a visual diagram."],
  ["What does 'input' mean in computing?", "Information given to a computer program", ["Information a computer program produces", "A type of error", "A computer's storage device"], "Input is data or information fed into a program, which it then processes."],
  ["What does 'output' mean in computing?", "Information a computer program produces as a result", ["Information given to a computer", "A type of computer virus", "A programming language"], "Output is what a program produces after processing its input — such as a result shown on screen."],
];

const y6Algorithms: Row[] = [
  ["What is 'selection' in programming?", "Choosing which instructions to run based on a condition", ["Repeating a set of instructions many times", "Storing a value in memory", "Connecting to a network"], "Selection (an if/else structure) lets a program choose different instructions depending on whether a condition is true or false."],
  ["What is 'iteration' (repetition) in programming?", "Repeating a set of instructions multiple times", ["Choosing between two options", "Deleting a variable", "Connecting two computers"], "Iteration means running the same block of instructions repeatedly, often using a loop."],
];

const y5DigitalLiteracy: Row[] = [
  ["What does 'URL' stand for?", "Uniform Resource Locator", ["Universal Reading List", "United Ranking Level", "Unique Register Log"], "A URL (Uniform Resource Locator) is the address used to find a specific page or resource on the internet."],
  ["What is the purpose of a web browser?", "To display and navigate webpages", ["To store files permanently", "To print documents", "To play only offline games"], "A web browser is software used to access, display and navigate webpages on the internet."],
];

export function generateAllComputingQuestionsCaymanExtra(seed = 87100): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...rowsToQuestions(rng, y5ESafety, "e-safety", "Y5", "CO5-SAFE-1", "bronze"),
    ...rowsToQuestions(rng, y6ESafety, "e-safety", "Y6", "CO6-SAFE-1", "silver"),
    ...rowsToQuestions(rng, y5Algorithms, "algorithms", "Y5", "CO5-ALG-1", "bronze"),
    ...rowsToQuestions(rng, y6Algorithms, "algorithms", "Y6", "CO6-ALG-1", "silver"),
    ...rowsToQuestions(rng, y5DigitalLiteracy, "digital-literacy", "Y5", "CO5-DIG-1", "bronze"),
  ];
}
