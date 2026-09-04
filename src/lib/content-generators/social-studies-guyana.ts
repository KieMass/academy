/**
 * Data-table-driven Guyana Social Studies generators (Grades 1-6) — a
 * brand-new subject for Guyana (see content/curriculum/guyana/
 * social-studies.json), so this file is the whole bank rather than a
 * top-up. Mirrors science-guyana.ts and grammar-guyana.ts: each Social
 * Studies question reduces to "pick the correct fact from a small set of
 * plausible alternatives", so compact data rows plus one `mc()` call per
 * row are far faster to author than typing out full question objects.
 */
import { createRng, shuffle, type Rng } from "./rng";
import type { DraftQuestion } from "./types";
import type { DifficultyBand, YearGroup } from "@/lib/curriculum/types";

const SUBJECT = "social-studies";

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

// ===================== MYSELF, MY FAMILY AND MY COMMUNITY ===================

const y1SelfFamily: Row[] = [
  ["Which of these people usually takes care of you at home?", "A parent or guardian", ["A stranger", "A shop owner", "A bus driver"], "Parents and guardians are the family members who care for children at home."],
  ["Which of these is part of your immediate family?", "Your sibling (brother or sister)", ["Your teacher", "Your neighbour's friend", "A shopkeeper"], "Siblings are part of your immediate family, along with your parents."],
  ["What is one job family members often do to help the household?", "Cooking, cleaning or caring for each other", ["Ignoring each other", "Never helping at home", "Only playing games all day"], "Family members share jobs like cooking and cleaning to help the household run smoothly."],
  ["Which of these is an example of an extended family member?", "A grandparent", ["A classmate", "A shop owner", "A police officer"], "Grandparents, aunts, uncles and cousins are all part of the extended family."],
  ["Why is it important for family members to help one another?", "It builds a caring and supportive home", ["It causes more arguments", "It has no benefit", "Families should never help each other"], "Helping one another builds trust and a supportive home for everyone."],
  ["Which word describes the people you live with and are related to?", "Family", ["Strangers", "Tourists", "Customers"], "Family describes the people you are related to and often live with."],
];

const y2SelfFamily: Row[] = [
  ["Who helps keep people safe by responding to fires?", "A firefighter", ["A teacher", "A farmer", "A cashier"], "Firefighters respond to fires and other emergencies to keep people safe."],
  ["Who helps people when they are sick or injured?", "A doctor or nurse", ["A police officer", "A librarian", "A carpenter"], "Doctors and nurses treat people who are sick or injured."],
  ["Who helps keep law and order in the community?", "A police officer", ["A baker", "A farmer", "A tailor"], "Police officers help enforce laws and keep communities safe."],
  ["Who teaches children in a school?", "A teacher", ["A postal worker", "A plumber", "A fisherman"], "Teachers educate children in schools."],
  ["Which community helper delivers letters and packages?", "A postal worker", ["A dentist", "A pilot", "A judge"], "Postal workers deliver mail and packages to homes and businesses."],
  ["Who helps grow the food we eat?", "A farmer", ["A pilot", "A lawyer", "A banker"], "Farmers grow crops and raise animals that provide the food we eat."],
  ["Why do communities need helpers like doctors, teachers and police officers?", "They provide important services that keep the community safe and running well", ["They have no real purpose", "Communities do not need any helpers", "They only work for themselves"], "Community helpers provide essential services that keep a community healthy, safe and educated."],
];

const y3SelfFamily: Row[] = [
  ["Which of these is a responsibility of a good citizen?", "Obeying laws and respecting others", ["Littering in public places", "Ignoring rules", "Being unkind to neighbours"], "Good citizens follow laws and treat other people with respect."],
  ["What is a community?", "A group of people living and working together in the same area", ["A single family only", "A type of building", "A kind of food"], "A community is a group of people who live and interact in the same area."],
  ["Which of these actions shows good citizenship?", "Helping to keep public spaces clean", ["Damaging public property", "Refusing to follow any rules", "Being rude to community helpers"], "Keeping shared spaces clean is an example of responsible citizenship."],
  ["Why do communities need rules?", "To keep people safe and living together fairly", ["To make life harder for no reason", "Rules are not needed", "To stop people from doing anything"], "Rules help people in a community live together safely and fairly."],
  ["Which of these is an example of working together in a community?", "Neighbours helping to clean a local park", ["Refusing to speak to neighbours", "Leaving rubbish everywhere", "Ignoring community events"], "Working together, like cleaning a shared park, strengthens a community."],
  ["What right do citizens usually have in their community?", "The right to be treated fairly and safely", ["The right to break any law", "The right to harm others", "The right to ignore all rules"], "Citizens have the right to fair and safe treatment within their community."],
];

const y4SelfFamily: Row[] = [
  ["What is a law?", "A rule made by the government that everyone must follow", ["A suggestion that can be ignored", "A game played at school", "A type of food"], "A law is an official rule made by government that citizens must obey."],
  ["Why are laws important in Guyana?", "They protect people's rights and keep order in society", ["They have no purpose", "They only apply to some people", "They make society more dangerous"], "Laws protect citizens' rights and help maintain order in society."],
  ["Which of these is a right that children have?", "The right to an education", ["The right to skip all responsibilities", "The right to break rules freely", "The right to ignore others' safety"], "Children have the right to receive an education."],
  ["Which of these is a responsibility that comes with being a citizen?", "Respecting the rights of others", ["Avoiding all responsibilities", "Breaking laws whenever convenient", "Ignoring the community"], "Respecting other people's rights is a key responsibility of citizenship."],
  ["What might happen if there were no laws in a community?", "There could be confusion, unfairness and danger", ["Everything would run perfectly", "Nothing would change", "Communities would need fewer helpers"], "Without laws, communities could face disorder, unfairness and danger."],
  ["Which of these describes a citizen's responsibility toward the environment?", "Keeping it clean and using resources wisely", ["Polluting freely", "Wasting resources on purpose", "Ignoring environmental problems"], "Citizens are responsible for protecting the environment and using resources wisely."],
];

const y5SelfFamily: Row[] = [
  ["What is the name given to the ten geographic and administrative divisions of Guyana?", "Regions", ["States", "Provinces", "Territories"], "Guyana is divided into ten administrative Regions."],
  ["Which level of government deals with issues in a specific town or village?", "Local government", ["National government only", "International government", "No government handles local issues"], "Local government manages issues within a specific town, village or area."],
  ["What is the name of Guyana's capital city, where the national government is based?", "Georgetown", ["New Amsterdam", "Linden", "Bartica"], "Georgetown is Guyana's capital and the seat of the national government."],
  ["Which level of government makes laws for the whole country of Guyana?", "National (central) government", ["Only local government", "Only regional government", "No level makes national laws"], "The national government is responsible for country-wide laws."],
  ["Who is responsible for managing the affairs of one of Guyana's ten regions?", "The Regional Democratic Council", ["A single shopkeeper", "A foreign government", "No one manages regions"], "Each region is managed by its own Regional Democratic Council."],
  ["Why does Guyana have different levels of government (local, regional and national)?", "To manage issues effectively at the community, regional and country-wide level", ["To confuse citizens on purpose", "Because one level cannot exist alone", "There is no real reason"], "Different levels of government allow issues to be handled at the most appropriate scale."],
];

const y6SelfFamily: Row[] = [
  ["Which branch of government is responsible for making laws in Guyana?", "The Legislature (National Assembly)", ["The Judiciary", "The Executive", "The Police Force"], "The Legislature, or National Assembly, is responsible for making laws."],
  ["Which branch of government is responsible for enforcing and carrying out laws?", "The Executive", ["The Legislature", "The Judiciary", "The Media"], "The Executive branch, led by the President and Cabinet, carries out laws."],
  ["Which branch of government interprets laws and settles disputes through the courts?", "The Judiciary", ["The Executive", "The Legislature", "The Regional Council"], "The Judiciary interprets the law and resolves disputes through the court system."],
  ["Who is the Head of State of Guyana?", "The President", ["The Prime Minister only", "The Mayor", "The Speaker of the National Assembly"], "The President is Guyana's Head of State."],
  ["Which document sets out the basic rights and freedoms of Guyanese citizens?", "The Constitution of Guyana", ["A newspaper", "A school textbook", "A shop receipt"], "The Constitution is the country's highest law, setting out citizens' rights and freedoms."],
  ["Why is it important that government power is divided into three branches?", "So that no single branch has too much power (checks and balances)", ["So the government can ignore citizens", "To make the government slower for no reason", "It is not important"], "Dividing power among three branches provides checks and balances against any one branch becoming too powerful."],
];

// ===================== GUYANA: LAND, REGIONS AND RESOURCES ==================

const y1Geography: Row[] = [
  ["Which direction does the sun rise from?", "East", ["West", "North", "South"], "The sun rises in the east every day."],
  ["Which direction does the sun set?", "West", ["East", "North", "South"], "The sun sets in the west every day."],
  ["What does a map help us do?", "Find and understand places", ["Cook food", "Play games only", "Tell time"], "Maps show us where places are and how to find them."],
  ["Which symbol on a simple map often shows a river?", "A wavy blue line", ["A red square", "A green triangle", "A black dot only"], "Maps usually show rivers as wavy blue lines."],
  ["If you are facing north and turn to your right, which direction do you face?", "East", ["West", "South", "North"], "Turning right from facing north points you east."],
  ["Which of these is a compass direction?", "South", ["Up", "Sideways", "Backward"], "North, south, east and west are the four main compass directions."],
];

const y2Geography: Row[] = [
  ["On which continent is Guyana located?", "South America", ["Africa", "Asia", "Europe"], "Guyana is located on the continent of South America."],
  ["Which country lies to the west of Guyana?", "Venezuela", ["Brazil", "Suriname", "Colombia"], "Venezuela borders Guyana to the west."],
  ["Which country lies to the east of Guyana?", "Suriname", ["Venezuela", "Brazil", "Trinidad and Tobago"], "Suriname borders Guyana to the east."],
  ["Which large country lies to the south of Guyana?", "Brazil", ["Venezuela", "Suriname", "Argentina"], "Brazil borders Guyana along its southern edge."],
  ["Which ocean lies along Guyana's northern coast?", "The Atlantic Ocean", ["The Pacific Ocean", "The Indian Ocean", "The Arctic Ocean"], "Guyana's coastline faces the Atlantic Ocean."],
  ["Guyana is part of which group of Caribbean nations, despite being in South America?", "CARICOM (the Caribbean Community)", ["The European Union", "ASEAN", "NATO"], "Guyana is a member of CARICOM, the Caribbean Community, and hosts its headquarters in Georgetown."],
];

const y3Geography: Row[] = [
  ["How many administrative regions does Guyana have?", "Ten", ["Five", "Fifteen", "Twenty"], "Guyana is divided into ten administrative regions."],
  ["In which region is Guyana's capital, Georgetown, located?", "Region 4 (Demerara-Mahaica)", ["Region 1 (Barima-Waini)", "Region 10 (Upper Demerara-Berbice)", "Region 6 (East Berbice-Corentyne)"], "Georgetown is located in Region 4, Demerara-Mahaica."],
  ["Which region is home to the town of Linden?", "Region 10 (Upper Demerara-Berbice)", ["Region 2 (Pomeroon-Supenaam)", "Region 7 (Cuyuni-Mazaruni)", "Region 9 (Upper Takutu-Upper Essequibo)"], "Linden, a major bauxite mining town, is located in Region 10."],
  ["Which region includes the area around the Rupununi savannah?", "Region 9 (Upper Takutu-Upper Essequibo)", ["Region 3 (Essequibo Islands-West Demerara)", "Region 5 (Mahaica-Berbice)", "Region 6 (East Berbice-Corentyne)"], "The Rupununi savannah lies mainly within Region 9."],
  ["How are Guyana's regions mainly identified?", "By a number and a name", ["By colour only", "By a single letter only", "They have no identification"], "Each of Guyana's ten regions has both a number and a name."],
  ["Which region lies at the far northwest of Guyana, bordering Venezuela?", "Region 1 (Barima-Waini)", ["Region 6 (East Berbice-Corentyne)", "Region 4 (Demerara-Mahaica)", "Region 10 (Upper Demerara-Berbice)"], "Region 1, Barima-Waini, is in the northwest and borders Venezuela."],
];

const y4Geography: Row[] = [
  ["What is the name of Guyana's longest river?", "The Essequibo River", ["The Demerara River", "The Berbice River", "The Corentyne River"], "The Essequibo is Guyana's longest river."],
  ["What type of land makes up most of Guyana's coastland, where most people live?", "Low-lying, fertile plains reclaimed with sea defences", ["High mountains", "A frozen tundra", "A desert"], "Guyana's densely populated coastland is low-lying and protected by sea defences."],
  ["What is the name of Guyana's famous waterfall, one of the tallest single-drop falls in the world?", "Kaieteur Falls", ["Niagara Falls", "Victoria Falls", "Angel Falls"], "Kaieteur Falls, on the Potaro River, is one of the world's tallest single-drop waterfalls."],
  ["Which geographic feature covers much of Guyana's interior?", "Dense tropical rainforest", ["Frozen glaciers", "A large desert", "An active volcano field"], "Guyana's interior is covered mostly by tropical rainforest."],
  ["What is a savannah?", "A large area of open grassland with few trees", ["A type of ocean", "A tall mountain range", "A frozen region"], "A savannah is a grassland landscape with scattered trees, like Guyana's Rupununi."],
  ["Which mountain range is found in Guyana's western interior?", "The Pakaraima Mountains", ["The Andes", "The Alps", "The Rocky Mountains"], "The Pakaraima Mountains lie in Guyana's western interior."],
];

const y5Geography: Row[] = [
  ["What type of climate does Guyana have?", "Tropical, with hot temperatures year-round", ["Cold and snowy", "Dry desert climate", "Polar climate"], "Guyana has a tropical climate with generally hot, humid weather all year."],
  ["Guyana's wet season and dry season are a feature of which climate type?", "Tropical climate", ["Temperate climate", "Arctic climate", "Mediterranean climate"], "Tropical climates like Guyana's typically alternate between wet and dry seasons."],
  ["Which crop, grown along the coast, has historically been one of Guyana's major exports?", "Sugar cane", ["Wheat", "Coffee beans only", "Olives"], "Sugar cane has long been grown on Guyana's coastal plantations for export."],
  ["Besides sugar, which other crop is widely grown in Guyana's coastal region?", "Rice", ["Corn only", "Wheat", "Bananas only"], "Rice is a major crop grown in Guyana's coastal region."],
  ["Which mineral resource, mined in the interior, is a major source of export income for Guyana?", "Gold", ["Coal", "Table salt", "Diamonds only"], "Gold mining is a significant source of export income for Guyana."],
  ["Which resource, used to make aluminium, is mined near Linden?", "Bauxite", ["Iron ore", "Copper", "Tin"], "Bauxite, mined around Linden, is refined to produce aluminium."],
  ["In recent years, which new natural resource has become very important to Guyana's economy?", "Offshore oil", ["Coal", "Diamonds", "Natural ice"], "The discovery of offshore oil has become a major part of Guyana's economy in recent years."],
];

const y6Geography: Row[] = [
  ["Why do most Guyanese people live along the coast rather than the interior?", "The coast has fertile land, transport links and long-established towns", ["The interior has no land at all", "The coast is the only legal place to live", "There is no difference between the areas"], "The coast's fertile land and infrastructure have made it the main population centre."],
  ["Why is river transport especially important in Guyana's interior regions?", "Roads are limited, so rivers connect remote communities", ["Rivers are faster than planes everywhere", "The interior has no rivers", "People are not allowed to use roads"], "With few roads in the interior, rivers are a vital way to reach remote communities."],
  ["How has Guyana's rainforest interior affected where towns and villages have developed?", "Settlements are smaller and more scattered, often near rivers", ["Every part of the rainforest is densely populated", "The rainforest has no effect on settlement", "All towns are built on mountains"], "Dense rainforest and limited transport mean interior settlements tend to be small and near rivers."],
  ["Why are sea defences important for coastal Guyana?", "Much of the coast lies below sea level and needs protection from flooding", ["They are only used for decoration", "Guyana has no coastline", "The coast is at high altitude"], "Guyana's low-lying coast relies on sea defences to prevent flooding from the Atlantic."],
  ["How does access to fertile land influence farming in Guyana?", "Farming is concentrated on the fertile coastal plain", ["Farming only happens in the mountains", "Fertile land does not affect farming", "All farming happens in cities"], "The fertile coastal plain is where most of Guyana's farming takes place."],
];

// ===================== THE HISTORY AND PEOPLES OF GUYANA =====================

const y1History: Row[] = [
  ["What is the nickname of Guyana's flag because of its shape?", "The Golden Arrowhead", ["The Golden Star", "The Silver Cross", "The Red Diamond"], "Guyana's flag is nicknamed the Golden Arrowhead because of its arrow-like shape."],
  ["Which colour on Guyana's flag represents its forests?", "Green", ["Red", "Gold", "Black"], "The green on Guyana's flag represents its forests and agriculture."],
  ["What is the title of Guyana's national anthem?", "'Dear Land of Guyana, of Rivers and Plains'", ["'God Save the Queen'", "'O Canada'", "'The Star-Spangled Banner'"], "Guyana's national anthem is titled 'Dear Land of Guyana, of Rivers and Plains'."],
  ["What is Guyana's national flower?", "The Victoria Regia (giant water lily)", ["The rose", "The tulip", "The sunflower"], "The Victoria Regia, a giant water lily, is Guyana's national flower."],
  ["What is Guyana's national bird?", "The Hoatzin (Canje pheasant)", ["The eagle", "The penguin", "The ostrich"], "The Hoatzin, also called the Canje pheasant, is Guyana's national bird."],
  ["Which animal appears on Guyana's Coat of Arms?", "The jaguar", ["The polar bear", "The kangaroo", "The penguin"], "Jaguars appear on Guyana's Coat of Arms, representing the country's wildlife."],
];

const y2History: Row[] = [
  ["Which Guyanese festival celebrates the Hindu festival of lights?", "Diwali", ["Easter", "Christmas", "Emancipation Day"], "Diwali, the Hindu festival of lights, is widely celebrated in Guyana."],
  ["Which Guyanese holiday celebrates the end of slavery in the British Empire?", "Emancipation Day", ["Diwali", "Eid-ul-Fitr", "Republic Day"], "Emancipation Day, on 1 August, marks the end of slavery."],
  ["Which Muslim festival, marking the end of Ramadan, is celebrated in Guyana?", "Eid-ul-Fitr", ["Diwali", "Phagwah", "Christmas"], "Eid-ul-Fitr marks the end of the Islamic holy month of Ramadan."],
  ["Which colourful Hindu festival, also called Holi, is celebrated in Guyana with coloured powder and water?", "Phagwah", ["Diwali", "Eid-ul-Fitr", "Mashramani"], "Phagwah, also known as Holi, is celebrated with coloured powder and water."],
  ["What is Mashramani, celebrated every February?", "A festival celebrating Guyana becoming a republic", ["A harvest festival only", "A religious festival for one group only", "A festival with no meaning"], "Mashramani celebrates Guyana becoming a republic in 1970."],
  ["Why does Guyana celebrate many different festivals throughout the year?", "Because it is home to many ethnic groups with different cultures and religions", ["Because it has only one culture", "Because festivals are required by law with no meaning", "Because there is nothing else to do"], "Guyana's diverse population of many ethnic groups celebrates a wide range of cultural and religious festivals."],
];

const y3History: Row[] = [
  ["What is the term used for Guyana's Indigenous peoples?", "Amerindians", ["Settlers", "Colonists", "Immigrants"], "Guyana's Indigenous peoples are commonly referred to as Amerindians."],
  ["Which of these is one of Guyana's recognised Indigenous peoples?", "The Arawak", ["The Maori", "The Zulu", "The Inuit"], "The Arawak are one of Guyana's nine recognised Indigenous (Amerindian) peoples."],
  ["What traditional food, made from cassava, is prepared by many Amerindian communities?", "Cassava bread", ["Rice pudding", "Wheat bread", "Corn tortillas"], "Cassava bread is a traditional food made by many of Guyana's Amerindian communities."],
  ["Where do many of Guyana's Amerindian communities traditionally live?", "In the interior, near rivers and forests", ["Only in large coastal cities", "On boats in the ocean", "In the desert"], "Many Amerindian communities are traditionally found in Guyana's interior, near rivers and forests."],
  ["What type of home, suited to the rainforest climate, did many Amerindian communities traditionally build?", "A benab (open-sided, thatched-roof structure)", ["An igloo", "A skyscraper", "A stone castle"], "A benab is a traditional open-sided, thatched shelter suited to the rainforest climate."],
  ["Which of these is a traditional Amerindian craft still practised today?", "Weaving baskets and hammocks", ["Building space rockets", "Manufacturing cars", "Mining oil"], "Basket and hammock weaving are traditional Amerindian crafts still practised in Guyana."],
];

const y4History: Row[] = [
  ["Which European nation first established the colony that later became British Guiana?", "The Dutch", ["The Spanish", "The French", "The Portuguese"], "The Dutch were the first Europeans to establish colonial settlements in what became British Guiana."],
  ["Why were enslaved Africans brought to Guyana by European colonisers?", "To be forced to work on sugar plantations", ["To govern the colony", "To teach in schools", "To explore new lands for fun"], "Enslaved Africans were forcibly brought to work on colonial sugar plantations."],
  ["After slavery ended, which group of workers were brought to Guyana under indentureship, mainly from India?", "Indentured labourers", ["Tourists", "Soldiers only", "Diplomats"], "Indentured labourers, largely from India, were brought to work on plantations after slavery ended."],
  ["What was the main crop grown on the plantations that shaped Guyana's colonial economy?", "Sugar cane", ["Wheat", "Cotton only", "Coffee only"], "Sugar cane plantations were central to Guyana's colonial economy."],
  ["Guyana was once known by which name under British colonial rule?", "British Guiana", ["New Amsterdam", "Dutch Guiana", "Essequibo Colony"], "Before independence, the colony was known as British Guiana."],
  ["Whose arrival, after slavery ended, is remembered as adding significantly to Guyana's cultural diversity?", "Indentured labourers from India and other regions", ["Tourists on holiday", "Only European settlers", "No new groups arrived"], "Indentured labourers from India and elsewhere added greatly to Guyana's cultural diversity."],
];

const y5History: Row[] = [
  ["In which year did Guyana gain independence from Britain?", "1966", ["1962", "1970", "1980"], "Guyana became independent from Britain on 26 May 1966."],
  ["Who became Guyana's first Prime Minister at Independence?", "Forbes Burnham", ["Cheddi Jagan", "Janet Jagan", "Desmond Hoyte"], "Forbes Burnham was Guyana's first Prime Minister after Independence in 1966."],
  ["On which date is Guyana's Independence celebrated each year?", "26 May", ["1 January", "23 February", "1 August"], "Guyana celebrates Independence Day on 26 May."],
  ["Which political leader is remembered as a key figure in Guyana's independence movement and later became President?", "Cheddi Jagan", ["Nelson Mandela", "Mahatma Gandhi", "Simon Bolivar"], "Cheddi Jagan was a key figure in Guyana's independence movement and later served as President."],
  ["Before gaining full independence, what political status did Guyana move through?", "Self-government under British colonial rule", ["Guyana was always fully independent", "Guyana was never a British colony", "Guyana became independent overnight with no earlier changes"], "Guyana progressed through stages of self-government before gaining full independence."],
  ["What does 'independence' mean for a country like Guyana?", "Gaining the right to self-govern, free from colonial rule", ["Losing all forms of government", "Joining another country permanently", "Having no laws at all"], "Independence means a country gains the right to govern itself, free of colonial control."],
];

const y6History: Row[] = [
  ["In which year did Guyana become a republic?", "1970", ["1966", "1980", "1992"], "Guyana became a republic on 23 February 1970."],
  ["What changed for Guyana when it became a republic in 1970?", "It replaced the British monarch as head of state with a Guyanese President", ["It rejoined the British Empire", "It became a monarchy for the first time", "Nothing changed at all"], "Becoming a republic meant Guyana's own President, not the British monarch, became head of state."],
  ["Which national holiday celebrates Guyana becoming a republic?", "Republic Day (Mashramani), 23 February", ["Independence Day, 26 May", "Emancipation Day, 1 August", "Diwali"], "Mashramani, celebrated on 23 February, marks Guyana becoming a republic."],
  ["Which Guyanese leader is honoured as a national hero for leading resistance during slavery?", "Cuffy, leader of the 1763 Berbice Slave Rebellion", ["Christopher Columbus", "Queen Victoria", "A fictional character"], "Cuffy led the 1763 Berbice Slave Rebellion and is honoured as a national hero."],
  ["What does the Cuffy monument in Georgetown commemorate?", "The 1763 Berbice Slave Rebellion", ["Guyana's Independence in 1966", "The discovery of gold", "The founding of a university"], "The 1763 Monument in Georgetown honours Cuffy and the Berbice Slave Rebellion."],
  ["Why are national holidays like Independence Day and Emancipation Day important to Guyanese people?", "They commemorate key moments and figures in the nation's history", ["They have no historical meaning", "They are just days off with no purpose", "They celebrate other countries' history"], "These holidays mark and honour important events and people in Guyana's history."],
];

export function generateAllSocialStudiesQuestionsGuyana(seed = 56300): DraftQuestion[] {
  const rng = createRng(seed);
  return [
    ...rowsToQuestions(rng, y1SelfFamily, "self-family-community", "Y1", "GY-SS1-SEC-1", "bronze"),
    ...rowsToQuestions(rng, y2SelfFamily, "self-family-community", "Y2", "GY-SS2-SEC-1", "bronze"),
    ...rowsToQuestions(rng, y3SelfFamily, "self-family-community", "Y3", "GY-SS3-SEC-1", "silver"),
    ...rowsToQuestions(rng, y4SelfFamily, "self-family-community", "Y4", "GY-SS4-SEC-1", "silver"),
    ...rowsToQuestions(rng, y5SelfFamily, "self-family-community", "Y5", "GY-SS5-SEC-1", "gold"),
    ...rowsToQuestions(rng, y6SelfFamily, "self-family-community", "Y6", "GY-SS6-SEC-1", "gold"),

    ...rowsToQuestions(rng, y1Geography, "guyana-geography", "Y1", "GY-SS1-GEO-1", "bronze"),
    ...rowsToQuestions(rng, y2Geography, "guyana-geography", "Y2", "GY-SS2-GEO-1", "bronze"),
    ...rowsToQuestions(rng, y3Geography, "guyana-geography", "Y3", "GY-SS3-GEO-1", "silver"),
    ...rowsToQuestions(rng, y4Geography, "guyana-geography", "Y4", "GY-SS4-GEO-1", "silver"),
    ...rowsToQuestions(rng, y5Geography, "guyana-geography", "Y5", "GY-SS5-GEO-1", "gold"),
    ...rowsToQuestions(rng, y6Geography, "guyana-geography", "Y6", "GY-SS6-GEO-1", "gold"),

    ...rowsToQuestions(rng, y1History, "guyana-history-civics", "Y1", "GY-SS1-HIS-1", "bronze"),
    ...rowsToQuestions(rng, y2History, "guyana-history-civics", "Y2", "GY-SS2-HIS-1", "bronze"),
    ...rowsToQuestions(rng, y3History, "guyana-history-civics", "Y3", "GY-SS3-HIS-1", "silver"),
    ...rowsToQuestions(rng, y4History, "guyana-history-civics", "Y4", "GY-SS4-HIS-1", "silver"),
    ...rowsToQuestions(rng, y5History, "guyana-history-civics", "Y5", "GY-SS5-HIS-1", "gold"),
    ...rowsToQuestions(rng, y6History, "guyana-history-civics", "Y6", "GY-SS6-HIS-1", "gold"),
  ];
}
