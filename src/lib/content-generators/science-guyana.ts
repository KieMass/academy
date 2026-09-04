/**
 * Data-table-driven Guyana Science generators (Grades 1-6) — Science is a
 * brand-new subject for Guyana (see content/curriculum/guyana/science.json),
 * so there's no existing question pack to top up; this file is the whole
 * bank. Mirrors grammar-guyana.ts's approach: most Science questions reduce
 * to "pick the correct fact from a small set of plausible alternatives", so
 * compact data rows plus one `mc()` call per row are far faster to author
 * — and just as genuinely varied — as typing out full question objects.
 */
import { createRng, shuffle, type Rng } from "./rng";
import type { DraftQuestion } from "./types";
import type { DifficultyBand, YearGroup } from "@/lib/curriculum/types";

const SUBJECT = "science";

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
  return rows.flatMap(([promptText, correct, distractors, explanation]) => {
    const out: DraftQuestion[] = [mc(rng, { strandSlug, yearGroup, objectiveCode, difficulty, promptText, correct, distractors, explanation })];
    // A short-answer companion for the same fact — recall rather than
    // recognition, doubling volume with zero new authoring. Only for short,
    // single-phrase answers: a long/multi-item correct answer (e.g. "Sunlight,
    // water and air") is unfair to grade by exact string match, since a
    // correct but differently-ordered or -punctuated typed answer would be
    // marked wrong.
    if (correct.split(" ").length <= 3 && !correct.includes(",")) {
      out.push({ type: "short_answer", subjectSlug: SUBJECT, strandSlug, yearGroup, objectiveCode, difficulty, promptText: `${promptText} (Answer without looking at multiple choices.)`, explanation, acceptedAnswers: [correct] });
    }
    return out;
  });
}

// =========================== LIVING THINGS ==================================

const y1LivingThings: Row[] = [
  ["Which of these is a living thing?", "A dog", ["A rock", "A chair", "A toy car"], "Living things like dogs grow, move and need food; rocks, chairs and toy cars do not."],
  ["Which of these is a non-living thing?", "A stone", ["A plant", "A bird", "A fish"], "A stone does not grow, feed or move on its own, so it is non-living."],
  ["Which sense do we use to see colours?", "Sight (our eyes)", ["Hearing (our ears)", "Smell (our nose)", "Taste (our tongue)"], "We use our eyes and the sense of sight to see colours."],
  ["Which body part do we use to hear sounds?", "Ears", ["Eyes", "Nose", "Skin"], "Our ears let us hear sounds around us."],
  ["Which sense tells us that a mango is sweet?", "Taste", ["Sight", "Hearing", "Touch"], "We use our sense of taste, through our tongue, to tell if food is sweet."],
  ["Which of these things can grow and needs food to live?", "A tree", ["A bicycle", "A book", "A table"], "A tree is alive — it grows and needs food (made from sunlight, water and air) to live."],
  ["Which sense helps us feel if something is hot or cold?", "Touch", ["Sight", "Smell", "Taste"], "Our skin gives us the sense of touch, which tells us about temperature and texture."],
  ["Which of these is a living thing found in a pond?", "A fish", ["A pebble", "A plastic bottle", "A toy boat"], "A fish is alive — it breathes, feeds and grows; the other objects are non-living."],
];

const y2LivingThings: Row[] = [
  ["What do plants need to make their own food?", "Sunlight, water and air", ["Only water", "Only soil", "Only sunlight"], "Plants use sunlight, water and air together (photosynthesis) to make their own food."],
  ["Which of these is a basic need of all animals?", "Food, water and shelter", ["Toys", "Money", "Books"], "Every animal needs food, water and shelter to survive."],
  ["Why do plants need water?", "To grow and stay healthy", ["To make noise", "To change colour only", "To become heavier only"], "Water helps carry nutrients through a plant so it can grow and stay healthy."],
  ["What do animals need air for?", "To breathe", ["To grow taller only", "To make sounds only", "To see"], "Animals need to breathe air to survive."],
  ["Which of these gives shelter to a bird?", "A nest", ["A river", "A cloud", "A road"], "Birds build nests as a safe shelter to rest and raise their young."],
  ["What often happens to a plant that does not get enough sunlight?", "It grows weak and pale", ["It grows faster and greener", "It changes into an animal", "Nothing happens to it"], "Without enough sunlight, a plant cannot make enough food and grows weak and pale."],
  ["Besides food and water, what else do farm animals need to stay healthy?", "Shelter and care", ["Sugar only", "Toys only", "Loud music"], "Like all animals, farm animals need shelter and care as well as food and water."],
];

const y3LivingThings: Row[] = [
  ["What is the correct order of a frog's life cycle?", "Egg → tadpole → froglet → adult frog", ["Egg → adult frog → tadpole", "Tadpole → egg → adult frog", "Adult frog → egg → froglet → tadpole"], "A frog begins as an egg, hatches into a tadpole, grows legs as a froglet, then becomes an adult frog."],
  ["What is the correct order of a butterfly's life cycle?", "Egg → caterpillar → chrysalis → butterfly", ["Egg → butterfly → caterpillar", "Caterpillar → egg → chrysalis → butterfly", "Chrysalis → egg → caterpillar → butterfly"], "A butterfly starts as an egg, hatches into a caterpillar, forms a chrysalis, then emerges as a butterfly."],
  ["What is the stage between caterpillar and adult butterfly called?", "Chrysalis (pupa)", ["Larva", "Tadpole", "Nymph"], "Inside the chrysalis (pupa), the caterpillar changes into a butterfly."],
  ["What comes out of a chicken's egg after it hatches?", "A chick", ["A tadpole", "A caterpillar", "An adult hen straight away"], "A chicken egg hatches into a young chick, which grows into an adult hen or rooster."],
  ["What do we call a young frog that still has a tail and lives in water?", "A tadpole", ["A froglet", "A chrysalis", "A chick"], "A tadpole is the young, water-living stage of a frog before it grows legs."],
  ["Which of these animals changes completely from a caterpillar into an adult?", "A butterfly", ["A chicken", "A frog", "A dog"], "A butterfly's body completely changes shape inside the chrysalis — this is called metamorphosis."],
  ["Where does a frog usually lay its eggs?", "In water", ["In a nest", "Underground", "On a leaf away from water"], "Frogs lay their eggs in water, where tadpoles can hatch and swim."],
];

const y4LivingThings: Row[] = [
  ["Which organ pumps blood around the body?", "The heart", ["The stomach", "The lungs", "The liver"], "The heart pumps blood through the body's blood vessels."],
  ["Which body system breaks down food so the body can use it?", "The digestive system", ["The skeletal system", "The circulatory system", "The respiratory system"], "The digestive system breaks food down into nutrients the body can use."],
  ["What is the main job of the skeleton?", "To support and protect the body", ["To digest food", "To pump blood", "To breathe air"], "The skeleton gives the body its shape, support and protects organs like the heart and brain."],
  ["Which organ helps us breathe air in and out?", "The lungs", ["The stomach", "The kidneys", "The skin"], "The lungs take in oxygen from the air and release carbon dioxide."],
  ["Where does digestion of food begin?", "In the mouth", ["In the stomach", "In the lungs", "In the heart"], "Digestion begins in the mouth, where chewing and saliva start breaking food down."],
  ["Which part of the skeleton protects the brain?", "The skull", ["The ribs", "The spine", "The pelvis"], "The skull is a hard case of bone that protects the brain."],
  ["What is the name of the tube that carries food from the mouth to the stomach?", "The oesophagus", ["The trachea", "The intestine", "The bladder"], "The oesophagus is the tube that carries swallowed food down to the stomach."],
  ["Which bones protect the heart and lungs?", "The ribs", ["The skull", "The spine", "The pelvis"], "The rib cage surrounds and protects the heart and lungs."],
];

const y5LivingThings: Row[] = [
  ["What do we call living things, like plants, that make their own food using sunlight?", "Producers", ["Consumers", "Predators", "Decomposers"], "Plants are producers because they make their own food through photosynthesis."],
  ["In a food chain, what do we call an animal that eats other animals or plants?", "A consumer", ["A producer", "A decomposer", "A habitat"], "Animals that eat other living things for energy are called consumers."],
  ["Which habitat in Guyana is covered mostly by grassland with few trees?", "Savannah", ["Rainforest", "Coastal mangrove", "Riverbank"], "Guyana's Rupununi savannah is a grassland habitat with scattered trees."],
  ["Which of these animals is commonly found in Guyana's rivers?", "The arapaima, a large freshwater fish", ["The polar bear", "The camel", "The penguin"], "The arapaima is one of the world's largest freshwater fish and lives in Guyana's rivers."],
  ["What is a habitat?", "The natural home of a plant or animal", ["A type of food", "A kind of weather", "A tool used by farmers"], "A habitat is the natural environment where a plant or animal lives."],
  ["In the food chain leaves → deer → jaguar, what role does the jaguar play?", "A predator at the top of the chain", ["A producer", "A decomposer", "Part of the soil"], "The jaguar is a predator that eats the deer, making it a top consumer in this food chain."],
  ["Why are Guyana's rainforests important habitats?", "They support a huge variety of plants and animals", ["They have no living things", "They only contain rocks", "They are covered in ice"], "Guyana's rainforests are rich in biodiversity, supporting many species of plants and animals."],
];

const y6LivingThings: Row[] = [
  ["Which of these is a way scientists classify living things?", "By grouping them based on shared characteristics", ["By their colour only", "By how loud they are", "By their price"], "Scientists classify living things into groups based on features they share."],
  ["Which group of animals do humans belong to?", "Mammals", ["Reptiles", "Amphibians", "Insects"], "Humans are mammals — warm-blooded animals that feed their young with milk."],
  ["What is one feature shared by all mammals?", "They feed their young with milk", ["They can all fly", "They all live in water", "They all lay eggs"], "A defining feature of mammals is that mothers produce milk to feed their young."],
  ["What happens to the human body during puberty?", "It grows and changes as it develops from a child into an adult", ["It stops growing completely", "It shrinks in size", "Nothing changes"], "Puberty is the stage of growth and change as the body develops toward adulthood."],
  ["Which of these best describes human reproduction?", "The process by which new humans are produced by a mother and father", ["The process of digesting food", "The process of breathing air", "The process of growing bones only"], "Reproduction is the biological process that produces new offspring."],
  ["Which group is used to classify animals without a backbone?", "Invertebrates", ["Vertebrates", "Mammals", "Reptiles"], "Animals without a backbone, like insects and worms, are called invertebrates."],
  ["Which stage of human life comes after childhood and before adulthood?", "Adolescence", ["Infancy", "Old age", "Birth"], "Adolescence is the growth stage between childhood and adulthood, including puberty."],
];

// ========================= MATTER, FORCES AND ENERGY ========================

const y1MatterEnergy: Row[] = [
  ["Which of these materials is hard?", "A rock", ["A cotton ball", "A feather", "A sponge"], "A rock is a hard material — it does not squash or bend easily."],
  ["Which of these materials feels soft?", "A cotton ball", ["A rock", "A brick", "A piece of metal"], "Cotton is a soft material that squashes easily."],
  ["Which of these is rough to touch?", "Sandpaper", ["Glass", "Ice", "Silk cloth"], "Sandpaper has a bumpy, rough surface."],
  ["Which of these is smooth to touch?", "Glass", ["Sandpaper", "Tree bark", "A pineapple's skin"], "Glass has a flat, smooth surface."],
  ["Which material would be best for making a soft pillow?", "Cotton", ["Metal", "Stone", "Glass"], "Cotton is soft and comfortable, which is why it is used to fill pillows."],
  ["Which of these objects is made from a hard material?", "A metal spoon", ["A sponge", "A cotton scarf", "A feather"], "Metal is a hard material, so a metal spoon keeps its shape and does not squash."],
  ["Is a piece of wool hard or soft?", "Soft", ["Hard"], "Wool is a soft, bendable material."],
];

const y2MatterEnergy: Row[] = [
  ["Which of these objects will float on water?", "A wooden block", ["A metal spoon", "A stone", "A coin"], "A wooden block is light enough to float on water."],
  ["Which of these objects will sink in water?", "A stone", ["A rubber duck", "A balloon", "A wooden boat"], "A stone is heavy for its size, so it sinks in water."],
  ["Which state of matter has a fixed shape and volume?", "Solid", ["Liquid", "Gas", "None of these"], "A solid keeps its own shape and size."],
  ["Which state of matter takes the shape of its container but keeps the same volume?", "Liquid", ["Solid", "Gas", "Plasma"], "A liquid flows to fill the bottom of its container but its volume stays the same."],
  ["Which state of matter spreads out to fill any space it is in?", "Gas", ["Solid", "Liquid", "Ice"], "A gas expands to fill the whole space of its container."],
  ["What state of matter is water when it is in a cup, ready to drink?", "Liquid", ["Solid", "Gas", "Plasma"], "Water you can drink from a cup is in its liquid state."],
  ["Which of these is an example of a gas?", "The air we breathe", ["A block of ice", "A cup of juice", "A wooden chair"], "The air around us is a mixture of gases."],
];

const y3MatterEnergy: Row[] = [
  ["What is it called when a solid changes into a liquid by heating?", "Melting", ["Freezing", "Evaporation", "Condensation"], "Melting happens when heat turns a solid, like ice, into a liquid."],
  ["What is it called when a liquid changes into a solid by cooling?", "Freezing", ["Melting", "Evaporation", "Boiling"], "Freezing happens when cooling turns a liquid, like water, into a solid."],
  ["What is it called when a liquid changes into a gas by heating?", "Evaporation", ["Melting", "Freezing", "Condensation"], "Evaporation happens when heat turns a liquid into a gas."],
  ["What is it called when a gas changes into a liquid by cooling?", "Condensation", ["Evaporation", "Melting", "Freezing"], "Condensation happens when cooling turns a gas back into a liquid."],
  ["What happens to ice left out in the hot sun?", "It melts into water", ["It turns into gas immediately", "It becomes harder", "It disappears completely with no trace"], "Heat from the sun melts ice, turning it from a solid into liquid water."],
  ["Which change of state happens when wet clothes dry on a line?", "Evaporation", ["Freezing", "Melting", "Condensation"], "The water in wet clothes evaporates into the air as the clothes dry."],
  ["What forms on the outside of a cold glass of juice on a hot day?", "Water droplets, from condensation", ["Ice, from freezing", "Steam, from boiling", "Nothing forms"], "Water vapour in the warm air cools on the cold glass and condenses into droplets."],
];

const y4MatterEnergy: Row[] = [
  ["Which of these is an example of a push?", "Pushing a shopping cart", ["Pulling open a drawer", "Pulling a wagon", "Pulling a rope"], "Pushing a shopping cart is a force applied away from you."],
  ["Which of these is an example of a pull?", "Opening a drawer", ["Kicking a ball", "Pushing a door shut", "Pressing a button"], "Opening a drawer means applying a force toward you — a pull."],
  ["What is friction?", "A force that slows down movement between two surfaces", ["A force that speeds up movement with no cause", "A type of energy from the sun", "A measure of weight"], "Friction is a force between two surfaces that resists or slows movement."],
  ["On which surface would a ball roll the farthest?", "A smooth tiled floor", ["A rough carpet", "Sand", "Grass"], "Smooth surfaces create less friction, so the ball rolls farther."],
  ["Why do bicycles have brakes?", "To use friction to slow down or stop the wheels", ["To make the bicycle heavier", "To make the wheels spin faster", "To change the colour of the tyres"], "Brakes press against the wheel to create friction, which slows it down."],
  ["What happens to an object when a bigger push force is applied to it?", "It speeds up or moves further", ["It always stops moving", "It becomes lighter", "It disappears"], "A larger force generally makes an object accelerate or move further."],
  ["Which force pulls objects down towards the Earth?", "Gravity", ["Friction", "Magnetism", "Air resistance"], "Gravity is the force that pulls objects towards the centre of the Earth."],
];

const y5MatterEnergy: Row[] = [
  ["Which simple machine is a see-saw an example of?", "A lever", ["A pulley", "A wheel and axle", "A screw"], "A see-saw pivots at a fixed point, which is how a lever works."],
  ["What is the main job of a pulley?", "To lift or move loads using a rope over a wheel", ["To cut objects in half", "To store electricity", "To measure temperature"], "A pulley uses a wheel and rope to make lifting a load easier."],
  ["Which simple machine helps a doorknob turn a door's latch?", "A wheel and axle", ["A lever", "A pulley", "An inclined plane"], "The doorknob (wheel) turns the smaller axle inside, working the latch."],
  ["Which simple machine is a ramp an example of?", "An inclined plane", ["A lever", "A pulley", "A wedge"], "A ramp is a sloped surface, which is an inclined plane."],
  ["Why do simple machines make work easier?", "They reduce the force needed to move or lift a load", ["They make objects heavier", "They remove the need for any force", "They make objects disappear"], "Simple machines change the size or direction of a force, making tasks easier."],
  ["Which simple machine would best help raise a bucket of water from a well?", "A pulley", ["A wedge", "A screw", "An inclined plane"], "A pulley over the well lets you pull down on a rope to lift the bucket up."],
  ["Scissors are made from two of which simple machine joined together?", "Levers", ["Pulleys", "Wheels and axles", "Screws"], "Each blade of a pair of scissors acts as a lever pivoting around the middle pin."],
];

const y6MatterEnergy: Row[] = [
  ["What three things are needed to make a simple electric circuit work?", "A power source, wires and a connected component such as a bulb", ["Only wires", "Only a battery", "A magnet and water"], "A complete circuit needs a power source, wires and a component that uses the electricity."],
  ["What happens if there is a gap in a circuit?", "The circuit is broken and current cannot flow", ["The bulb glows brighter", "Nothing changes", "The battery charges faster"], "A gap breaks the loop, so electricity cannot flow around the circuit."],
  ["Which material would best conduct electricity in a circuit?", "Copper wire", ["Rubber", "Wood", "Plastic"], "Metals like copper are good conductors of electricity."],
  ["What do we call materials that do not let electricity pass through easily?", "Insulators", ["Conductors", "Magnets", "Circuits"], "Insulators, like rubber and plastic, resist the flow of electricity."],
  ["Which poles of two magnets attract each other?", "Opposite poles (north and south)", ["Two north poles", "Two south poles", "Magnets never attract"], "Opposite magnetic poles pull towards each other."],
  ["What happens when you bring two like magnetic poles together?", "They repel (push apart)", ["They attract strongly", "They stick together permanently", "Nothing happens"], "Like poles (two norths or two souths) push each other away."],
  ["Which of these materials is attracted to a magnet?", "An iron nail", ["A plastic ruler", "A wooden block", "A sheet of paper"], "Iron and steel are attracted to magnets; plastic, wood and paper are not."],
];

// ========================= EARTH, WEATHER AND ENVIRONMENT ===================

const y1EarthEnvironment: Row[] = [
  ["Which season in Guyana has the most rainfall?", "The wet season", ["The dry season", "Winter", "Autumn"], "Guyana's wet season brings the heaviest rainfall of the year."],
  ["What is weather?", "The condition of the sky and air at a certain time and place", ["The name of a country", "A type of food", "A kind of animal"], "Weather describes conditions like rain, sunshine and wind at a given time."],
  ["Which of these describes rainy weather?", "Cloudy skies with falling rain", ["Clear skies with strong sunshine", "Snow falling from the sky", "No clouds and no wind"], "Rainy weather is cloudy with rain falling from the sky."],
  ["What falls from clouds during a storm?", "Rain", ["Snow", "Sand", "Leaves"], "Storms in Guyana bring heavy rain from dark clouds."],
  ["Which tool helps us measure how much rain has fallen?", "A rain gauge", ["A thermometer", "A ruler for length", "A clock"], "A rain gauge collects and measures rainfall."],
  ["Guyana has two main seasons. What are they called?", "The wet season and the dry season", ["Summer and winter", "Spring and autumn", "Hot season and snow season"], "Guyana's tropical climate has a wet season and a dry season rather than four seasons."],
  ["What should you wear outside on a hot, sunny, dry day?", "Light clothing and a hat", ["A heavy winter coat", "Snow boots", "A scarf and gloves"], "Light clothing and a hat help keep you cool and protected on a hot, sunny day."],
];

const y2EarthEnvironment: Row[] = [
  ["Which of these is a natural source of fresh water?", "A river", ["A plastic bottle", "A can of paint", "A car"], "Rivers are a natural source of fresh water."],
  ["Why is it important to keep our water clean?", "Dirty water can make people sick", ["Clean water tastes worse", "Dirty water is better for drinking", "It does not matter"], "Polluted water can carry germs and chemicals that cause illness."],
  ["Which of these is a good use of water?", "Drinking and cooking", ["Throwing rubbish into rivers", "Leaving taps running and wasting it", "Pouring oil into a river"], "Water is used safely for drinking and cooking, not for polluting rivers."],
  ["What can happen if rubbish is dumped into a river?", "The water becomes polluted and unsafe", ["The river becomes cleaner", "Fish grow bigger and healthier", "Nothing changes"], "Rubbish and waste pollute rivers, harming water quality and wildlife."],
  ["Which activity helps save water at home?", "Turning off the tap while brushing your teeth", ["Leaving the tap running all day", "Washing a car every hour", "Filling a pool and never using it"], "Turning off taps when not needed helps to save water."],
  ["Where does most of Guyana's drinking water eventually come from?", "Rain, rivers and groundwater", ["The ocean directly, unfiltered", "Only from imported bottles", "It is made in factories from nothing"], "Rain, rivers and groundwater are the natural sources that are treated to become drinking water."],
];

const y3EarthEnvironment: Row[] = [
  ["What is the first step of the water cycle, when the sun heats water in a river?", "Evaporation", ["Condensation", "Precipitation", "Collection"], "Heat from the sun evaporates water, turning it into water vapour."],
  ["What happens during condensation in the water cycle?", "Water vapour cools and forms clouds", ["Water falls as rain", "Water soaks into the ground", "Water freezes into ice caps only"], "As water vapour rises and cools, it condenses into tiny droplets that form clouds."],
  ["What is precipitation?", "Water falling from clouds as rain or other forms", ["Water rising into the air", "Water being stored in lakes", "Water turning into rock"], "Precipitation is water falling from clouds, most often as rain."],
  ["After rain falls, where might the water go next?", "Into rivers, lakes or the ground", ["Straight into outer space", "It disappears forever", "It turns into rock instantly"], "Rainwater collects in rivers and lakes or soaks into the ground."],
  ["What causes water to evaporate from oceans and rivers?", "Heat from the sun", ["Cold air only", "Wind alone", "Moonlight"], "The sun's heat provides the energy needed for evaporation."],
  ["What is the correct order of the water cycle stages?", "Evaporation, condensation, precipitation", ["Precipitation, evaporation, condensation", "Condensation, precipitation, evaporation", "They cannot be put in order"], "Water evaporates, then condenses into clouds, then falls as precipitation."],
  ["Why is the water cycle important?", "It moves and recycles the Earth's water supply", ["It creates new water from nothing", "It has no importance", "It only affects the ocean"], "The water cycle continually moves and renews the water available on Earth."],
];

const y4EarthEnvironment: Row[] = [
  ["Which mineral resource, used to make aluminium, is Guyana well known for mining?", "Bauxite", ["Coal", "Iron ore", "Diamond only"], "Guyana has large bauxite deposits, especially around Linden, used to make aluminium."],
  ["Which precious metal is mined in Guyana's interior regions?", "Gold", ["Platinum", "Copper", "Tin"], "Gold mining is a major industry in Guyana's interior."],
  ["What natural resource covers most of Guyana's land area?", "Forests (rainforest)", ["Desert", "Ice fields", "Volcanic rock"], "Rainforest covers roughly 85% of Guyana's land area."],
  ["Which of these is an important river used for transport and resources in Guyana?", "The Essequibo River", ["The Nile River", "The Amazon River", "The Thames River"], "The Essequibo is Guyana's longest and most important river."],
  ["Why are Guyana's forests considered an important natural resource?", "They provide timber, protect biodiversity and absorb carbon dioxide", ["They have no useful purpose", "They only provide sand", "They block all rainfall"], "Forests supply timber, shelter wildlife and help absorb carbon dioxide from the air."],
  ["Which of these is a use of Guyana's rivers?", "Transport, fishing and generating hydroelectric power", ["None — rivers have no uses", "Only for swimming", "Only for decoration"], "Rivers in Guyana are used for transport, fishing and producing electricity."],
  ["Besides bauxite and gold, which other resource is commonly taken from Guyana's forests?", "Timber (wood)", ["Coal", "Salt from the desert", "Ice"], "Guyana's forests provide valuable timber as a natural resource."],
];

const y5EarthEnvironment: Row[] = [
  ["What is deforestation?", "The cutting down of large areas of forest", ["The planting of new trees", "The growth of a rainforest", "The flooding of a river"], "Deforestation is the large-scale removal of forest, often for farming or logging."],
  ["Which human activity can pollute rivers?", "Dumping chemicals or rubbish into the water", ["Planting trees along the riverbank", "Recycling household waste", "Using rainwater to water plants"], "Chemicals and rubbish dumped in rivers pollute the water and harm wildlife."],
  ["What is one way people can help conserve Guyana's forests?", "Practising sustainable logging and replanting trees", ["Cutting down all the trees quickly", "Burning forests for fun", "Ignoring the problem completely"], "Sustainable logging and replanting help forests recover and remain healthy."],
  ["Why is recycling important for the environment?", "It reduces waste and saves natural resources", ["It creates more rubbish", "It uses up more resources", "It has no effect on the environment"], "Recycling reduces the need for new raw materials and cuts down on waste."],
  ["What can happen to animals when their habitat is destroyed?", "They can lose their homes and food sources", ["They automatically move to a better habitat", "Nothing happens to them", "They multiply faster"], "Habitat destruction removes the shelter and food that animals depend on."],
  ["Which of these is a renewable energy source that can help protect the environment?", "Solar or hydroelectric power", ["Burning more fossil fuels", "Cutting down more forests", "Dumping more waste in rivers"], "Solar and hydroelectric power are renewable and cause less environmental harm than fossil fuels."],
  ["What does 'conservation' mean?", "Protecting and looking after natural resources", ["Using up all resources quickly", "Ignoring nature", "Building as many factories as possible"], "Conservation means using and protecting natural resources responsibly."],
];

const y6EarthEnvironment: Row[] = [
  ["Which object is at the centre of our solar system?", "The Sun", ["The Moon", "Earth", "Jupiter"], "The Sun sits at the centre, and the planets, including Earth, orbit around it."],
  ["Which planet, often called the 'Red Planet', is Earth's neighbour?", "Mars", ["Venus", "Jupiter", "Saturn"], "Mars appears reddish because of iron oxide (rust) on its surface."],
  ["What causes day and night on Earth?", "Earth rotating on its axis", ["The Sun moving around Earth", "The Moon blocking the Sun", "Earth stopping completely at night"], "As Earth spins on its axis, different sides face the Sun, causing day and night."],
  ["What causes the phases of the Moon we see from Earth?", "The changing amount of sunlit Moon visible as it orbits Earth", ["The Moon changing shape physically", "Clouds covering the Moon", "The Sun disappearing"], "As the Moon orbits Earth, we see different amounts of its sunlit half, creating phases."],
  ["About how long does it take Earth to orbit the Sun once?", "About one year (365 days)", ["One day", "One month", "Ten years"], "Earth takes approximately 365 days to complete one orbit of the Sun."],
  ["What is the Moon?", "A natural satellite that orbits the Earth", ["A star", "A planet", "A comet"], "The Moon is Earth's natural satellite, orbiting our planet."],
  ["What is the correct order of the first three planets outward from the Sun?", "Mercury, Venus, Earth", ["Earth, Venus, Mercury", "Venus, Earth, Mercury", "Mars, Earth, Venus"], "Starting from the Sun, the order is Mercury, then Venus, then Earth."],
];

export function generateAllScienceQuestionsGuyana(seed = 56200): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...rowsToQuestions(rng, y1LivingThings, "living-things", "Y1", "GY-SC1-LIV-1", "bronze"),
    ...rowsToQuestions(rng, y2LivingThings, "living-things", "Y2", "GY-SC2-LIV-1", "bronze"),
    ...rowsToQuestions(rng, y3LivingThings, "living-things", "Y3", "GY-SC3-LIV-1", "silver"),
    ...rowsToQuestions(rng, y4LivingThings, "living-things", "Y4", "GY-SC4-LIV-1", "silver"),
    ...rowsToQuestions(rng, y5LivingThings, "living-things", "Y5", "GY-SC5-LIV-1", "gold"),
    ...rowsToQuestions(rng, y6LivingThings, "living-things", "Y6", "GY-SC6-LIV-1", "gold"),

    ...rowsToQuestions(rng, y1MatterEnergy, "matter-and-energy", "Y1", "GY-SC1-MAE-1", "bronze"),
    ...rowsToQuestions(rng, y2MatterEnergy, "matter-and-energy", "Y2", "GY-SC2-MAE-1", "bronze"),
    ...rowsToQuestions(rng, y3MatterEnergy, "matter-and-energy", "Y3", "GY-SC3-MAE-1", "silver"),
    ...rowsToQuestions(rng, y4MatterEnergy, "matter-and-energy", "Y4", "GY-SC4-MAE-1", "silver"),
    ...rowsToQuestions(rng, y5MatterEnergy, "matter-and-energy", "Y5", "GY-SC5-MAE-1", "gold"),
    ...rowsToQuestions(rng, y6MatterEnergy, "matter-and-energy", "Y6", "GY-SC6-MAE-1", "gold"),

    ...rowsToQuestions(rng, y1EarthEnvironment, "earth-and-environment", "Y1", "GY-SC1-EAE-1", "bronze"),
    ...rowsToQuestions(rng, y2EarthEnvironment, "earth-and-environment", "Y2", "GY-SC2-EAE-1", "bronze"),
    ...rowsToQuestions(rng, y3EarthEnvironment, "earth-and-environment", "Y3", "GY-SC3-EAE-1", "silver"),
    ...rowsToQuestions(rng, y4EarthEnvironment, "earth-and-environment", "Y4", "GY-SC4-EAE-1", "silver"),
    ...rowsToQuestions(rng, y5EarthEnvironment, "earth-and-environment", "Y5", "GY-SC5-EAE-1", "gold"),
    ...rowsToQuestions(rng, y6EarthEnvironment, "earth-and-environment", "Y6", "GY-SC6-EAE-1", "gold"),
  ];
}
