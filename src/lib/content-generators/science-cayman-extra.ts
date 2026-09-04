/**
 * Additional procedurally-organised Cayman Science questions, on top of the
 * existing hand-authored content/questions/cayman/science.json. That file
 * has no generator behind it (flat JSON, capped at whatever was typed by
 * hand), so this file exists purely to add volume via the same
 * Row+rowsToQuestions pattern established in science-guyana.ts — same
 * subject slug/strand/year taxonomy as science.json, additional facts only.
 */
import { createRng, shuffle, type Rng } from "./rng";
import type { DraftQuestion } from "./types";
import type { DifficultyBand, YearGroup } from "@/lib/curriculum/types";

const SUBJECT = "science";

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

// =========================== LIVING THINGS AND HABITATS =====================

const y5LivingThings: Row[] = [
  ["Which group do frogs belong to?", "Amphibians", ["Reptiles", "Mammals", "Fish"], "Frogs are amphibians — they live both in water and on land, and lay soft eggs in water."],
  ["Which group do snakes belong to?", "Reptiles", ["Amphibians", "Mammals", "Birds"], "Snakes are reptiles — they have scaly, dry skin and most lay leathery eggs on land."],
  ["What is metamorphosis?", "A dramatic change in body form during a life cycle", ["A type of flower", "A kind of rock", "A method of breathing"], "Metamorphosis describes the dramatic body changes some animals, like frogs and butterflies, go through as they mature."],
  ["Which of these is a mammal?", "A bat", ["A frog", "A shark", "A crocodile"], "Bats are mammals — they are warm-blooded, have fur, and feed their young milk."],
  ["What do we call animals that eat only plants?", "Herbivores", ["Carnivores", "Omnivores", "Decomposers"], "Herbivores are animals whose diet is made up entirely of plants."],
  ["What do we call animals that eat both plants and animals?", "Omnivores", ["Herbivores", "Carnivores", "Producers"], "Omnivores eat a mixed diet of both plants and animals."],
  ["Which of these best describes a habitat?", "The natural home of a plant or animal", ["A type of weather", "A kind of rock", "A method of movement"], "A habitat is the natural environment where an organism lives and gets what it needs to survive."],
  ["What is a food chain?", "A sequence showing what eats what", ["A type of fence", "A list of ingredients", "A kind of chemical reaction"], "A food chain shows the order in which organisms feed on one another, starting with a producer."],
  ["What do we call the first organism in most food chains?", "A producer (like a plant)", ["A predator", "A decomposer", "A consumer"], "Producers, usually plants, make their own food and form the base of most food chains."],
  ["Which of these breaks down dead plants and animals?", "Decomposers", ["Producers", "Predators", "Herbivores"], "Decomposers, such as fungi and bacteria, break down dead organisms and recycle nutrients."],
];

const y6LivingThings: Row[] = [
  ["Into which two broad groups are living things first classified?", "Plants and animals", ["Rocks and minerals", "Solids and liquids", "Predators and prey"], "At the broadest level, most living things are classified as either plants or animals (with further kingdoms for fungi, bacteria etc.)."],
  ["What characteristic do all vertebrates share?", "They have a backbone", ["They can fly", "They live in water", "They lay eggs"], "Vertebrates are defined by having a backbone (spinal column), unlike invertebrates."],
  ["Which of these is an invertebrate?", "A crab", ["A dog", "A snake", "A bird"], "A crab has no backbone, so it is classified as an invertebrate, unlike the other options."],
  ["What is a key characteristic used to classify insects?", "Six legs and three body parts", ["Four legs and fur", "A backbone and lungs", "Feathers and a beak"], "Insects are classified by having six legs and three main body parts: head, thorax and abdomen."],
  ["Why might scientists classify a dolphin as a mammal rather than a fish?", "It breathes air, is warm-blooded, and feeds its young milk", ["It lives in the sea", "It has fins", "It is a similar size to fish"], "Even though dolphins live in the sea like fish, they share mammal characteristics: breathing air, being warm-blooded, and nursing young with milk."],
  ["What is a keystone species?", "A species that has a very large effect on its ecosystem", ["The largest animal in a habitat", "A species found only in zoos", "An animal that never moves"], "A keystone species has a disproportionately large impact on its ecosystem relative to its numbers — removing it can cause major changes."],
];

// =========================== FORCES ==========================================

const y5Forces: Row[] = [
  ["What happens to an object's weight (not mass) on the Moon compared to Earth?", "It becomes lighter", ["It becomes heavier", "It stays exactly the same", "It disappears completely"], "The Moon's gravity is weaker than Earth's, so an object's weight (the pull of gravity on it) is less there, even though its mass stays the same."],
  ["Which force acts between two magnets when their like poles face each other?", "A repelling (pushing apart) force", ["An attracting (pulling together) force", "No force at all", "A twisting force"], "Like magnetic poles (N-N or S-S) repel each other, pushing apart."],
  ["What is friction?", "A force that resists motion between two surfaces", ["A force that speeds objects up", "A type of energy", "A force found only in water"], "Friction acts between two touching surfaces, resisting relative motion and often producing heat."],
  ["Why do objects fall more slowly through water than through air?", "Water resistance is greater than air resistance", ["Gravity is weaker in water", "Water pushes objects upward only", "Objects weigh more in water"], "Water is denser than air, so it creates more resistance against a moving object, slowing its fall."],
];

// Y6's strands are electricity/light/evolution-inheritance/animals/living-things
// — there's no Y6 "forces" or "materials" strand in Cayman's curriculum map
// (those are Y5-only), so extra Y6 content below targets strands that
// genuinely exist for Y6 instead of mislabelling forces/materials facts.
const y6Electricity: Row[] = [
  ["What happens to a bulb's brightness when a switch in its circuit is open?", "The bulb turns off completely", ["The bulb gets brighter", "Nothing changes", "The bulb flickers randomly"], "An open switch breaks the circuit, so no current flows and the bulb turns off."],
  ["Which material would work best as an electrical conductor in a circuit?", "Copper wire", ["Rubber", "Wood", "Plastic"], "Copper is a metal and a good conductor of electricity, unlike the insulating materials listed."],
];

// =========================== ANIMALS INCLUDING HUMANS ========================

const y5Animals: Row[] = [
  ["Which human life stage comes right before old age?", "Adulthood", ["Adolescence", "Infancy", "Childhood"], "The typical order of human life stages is: infancy, childhood, adolescence, adulthood, old age."],
  ["At approximately what age does puberty typically begin?", "Between 8 and 14 years old", ["Between 1 and 3 years old", "Between 20 and 25 years old", "Between 40 and 50 years old"], "Puberty usually begins somewhere between the ages of 8 and 14, though this varies between individuals."],
];

const y6Animals: Row[] = [
  ["What is the main function of the heart?", "To pump blood around the body", ["To digest food", "To filter air", "To produce hormones only"], "The heart's main job is to pump blood, carrying oxygen and nutrients, around the whole body."],
  ["Which blood vessels carry blood away from the heart?", "Arteries", ["Veins", "Capillaries", "Nerves"], "Arteries carry oxygen-rich blood away from the heart to the rest of the body."],
  ["Which blood vessels carry blood back to the heart?", "Veins", ["Arteries", "Capillaries", "Tendons"], "Veins carry blood back towards the heart."],
  ["What effect does regular exercise generally have on the heart?", "It strengthens the heart muscle", ["It weakens the heart muscle", "It has no effect at all", "It stops the heart from growing"], "Regular exercise strengthens the heart, like any muscle, helping it pump blood more efficiently."],
];

// =========================== MATERIALS ========================================

const y5Materials: Row[] = [
  ["What is solubility?", "How well a substance dissolves in a liquid", ["How hard a material is", "How see-through a material is", "How much a material weighs"], "Solubility describes how well a substance dissolves in a particular liquid, like water."],
  ["Which of these materials is transparent?", "Glass", ["Wood", "Brick", "Cardboard"], "Glass allows light to pass through it clearly, making it transparent, unlike the other opaque materials listed."],
  ["Which property describes a material's ability to be stretched into a wire?", "Ductility", ["Hardness", "Transparency", "Solubility"], "Ductility describes how well a material, often a metal, can be drawn out into a thin wire without breaking."],
];

const y6EvolutionExtra: Row[] = [
  ["What can studying fossils tell scientists?", "How living things have changed over millions of years", ["Only how old a rock is", "Only what colour ancient animals were", "Nothing useful about the past"], "Fossils provide evidence of how living things have changed and evolved over vast spans of time."],
  ["Why do offspring vary rather than being identical to their parents?", "They inherit a mix of characteristics from both parents", ["They always take on new characteristics not from either parent", "Variation never happens in nature", "Offspring copy only their environment, not their parents"], "Offspring inherit a combination of traits from both parents, which is why they vary rather than being identical clones."],
];

// =========================== EARTH AND SPACE ==================================

const y5EarthSpace: Row[] = [
  ["Which planet is the smallest in our solar system?", "Mercury", ["Venus", "Earth", "Mars"], "Mercury is both the closest planet to the Sun and the smallest planet in our solar system."],
  ["Which planet is known for its prominent rings?", "Saturn", ["Mars", "Mercury", "Venus"], "Saturn is famous for its large, bright ring system made of ice and rock."],
  ["Approximately how long does it take the Earth to orbit the Sun once?", "About 365 days (one year)", ["About 24 hours", "About 28 days", "About 100 days"], "The Earth takes roughly 365 days — one year — to complete one orbit around the Sun."],
];

// ================================ EXPORT =====================================

export function generateAllScienceQuestionsCaymanExtra(seed = 84100): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...rowsToQuestions(rng, y5LivingThings, "living-things-habitats", "Y5", "SC5-LIV-1", "silver"),
    ...rowsToQuestions(rng, y6LivingThings, "living-things-habitats", "Y6", "SC6-LIV-1", "silver"),
    ...rowsToQuestions(rng, y5Forces, "forces", "Y5", "SC5-FOR-1", "silver"),
    ...rowsToQuestions(rng, y6Electricity, "electricity", "Y6", "SC6-ELE-1", "silver"),
    ...rowsToQuestions(rng, y5Animals, "animals-including-humans", "Y5", "SC5-ANI-1", "bronze"),
    ...rowsToQuestions(rng, y6Animals, "animals-including-humans", "Y6", "SC6-ANI-1", "bronze"),
    ...rowsToQuestions(rng, y5Materials, "materials", "Y5", "SC5-MAT-1", "silver"),
    ...rowsToQuestions(rng, y6EvolutionExtra, "evolution-inheritance", "Y6", "SC6-EVO-1", "silver"),
    ...rowsToQuestions(rng, y5EarthSpace, "earth-and-space", "Y5", "SC5-SPA-1", "bronze"),
  ];
}
