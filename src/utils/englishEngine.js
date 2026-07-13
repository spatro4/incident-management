// EnglishEngine — dynamic question generation for Grade 4 English syllabus
// topics, plus Olympiad-only reasoning/vocabulary categories. Mirrors the
// structure of mathEngine.js but is entirely self-contained (no shared
// state) since the subject matter is unrelated.

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = (arr) => arr[randInt(0, arr.length - 1)]
const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

function mcqFrom(correctValue, distractorFn, formatFn = (v) => `${v}`) {
  const choicesSet = new Set([correctValue])
  let guard = 0
  while (choicesSet.size < 4 && guard < 30) {
    choicesSet.add(distractorFn())
    guard += 1
  }
  const choices = shuffle(Array.from(choicesSet)).map(formatFn)
  return { choices, answer: formatFn(correctValue) }
}

// ---------------------------------------------------------------------------
// NOUNS AND PRONOUNS
// ---------------------------------------------------------------------------
const COMMON_NOUNS = ['dog', 'city', 'river', 'teacher', 'book', 'mountain', 'flower', 'chair', 'bottle', 'garden']
const PROPER_NOUNS = ['India', 'Monday', 'Everest', 'Priya', 'London', 'Diwali', 'Shakespeare', 'Ganga', 'Friday', 'Delhi']
const COLLECTIVE_NOUNS = [
  ['herd', 'cows'],
  ['flock', 'birds'],
  ['swarm', 'bees'],
  ['pack', 'wolves'],
  ['bunch', 'grapes'],
  ['team', 'players'],
  ['fleet', 'ships'],
  ['pride', 'lions'],
]
const NAME_PRONOUNS = [
  ['Ravi', 'He'],
  ['Meera', 'She'],
  ['Arjun', 'He'],
  ['Kavya', 'She'],
  ['Rohan', 'He'],
  ['Anya', 'She'],
  ['Karan', 'He'],
  ['Divya', 'She'],
]

function genNounsPronouns() {
  const mode = pick(['identify-type', 'collective', 'pronoun-fill'])
  if (mode === 'identify-type') {
    const isCommon = Math.random() < 0.5
    const word = isCommon ? pick(COMMON_NOUNS) : pick(PROPER_NOUNS)
    const correct = isCommon ? 'Common Noun' : 'Proper Noun'
    return {
      subtopicId: 'nouns-pronouns',
      type: 'mcq',
      prompt: `Is "${word}" a common noun or a proper noun?`,
      choices: shuffle(['Common Noun', 'Proper Noun']),
      answer: correct,
      hint: `A proper noun names a specific person, place, or thing and starts with a capital letter. A common noun names a general person, place, or thing.`,
    }
  }
  if (mode === 'collective') {
    const [collective, plural] = pick(COLLECTIVE_NOUNS)
    const { choices, answer } = mcqFrom(collective, () => pick(COLLECTIVE_NOUNS.filter((c) => c[0] !== collective))[0], (v) => v)
    return {
      subtopicId: 'nouns-pronouns',
      type: 'mcq',
      prompt: `What is the collective noun for a group of ${plural}?`,
      choices,
      answer,
      hint: `A collective noun names a whole group of things or people as one unit (like "a herd of cows").`,
    }
  }
  const [name, pronoun] = pick(NAME_PRONOUNS)
  return {
    subtopicId: 'nouns-pronouns',
    type: 'mcq',
    prompt: `${name} finished the homework quickly. ___ then went out to play. Which pronoun completes the sentence?`,
    choices: shuffle(['He', 'She', 'It', 'They']),
    answer: pronoun,
    hint: `A pronoun replaces a noun. Think about whether ${name} is male or female.`,
  }
}

// ---------------------------------------------------------------------------
// VERBS AND TENSES
// ---------------------------------------------------------------------------
const REGULAR_VERBS = [
  ['walk', 'walked'],
  ['play', 'played'],
  ['jump', 'jumped'],
  ['talk', 'talked'],
  ['climb', 'climbed'],
  ['clean', 'cleaned'],
  ['help', 'helped'],
  ['paint', 'painted'],
]
const IRREGULAR_VERBS = [
  ['go', 'went'],
  ['eat', 'ate'],
  ['run', 'ran'],
  ['see', 'saw'],
  ['write', 'wrote'],
  ['come', 'came'],
  ['take', 'took'],
  ['give', 'gave'],
  ['break', 'broke'],
  ['buy', 'bought'],
  ['catch', 'caught'],
  ['drink', 'drank'],
  ['fly', 'flew'],
  ['grow', 'grew'],
]
const TENSE_SENTENCES = [
  { s: 'She sings a song every morning.', tense: 'Present' },
  { s: 'They played football yesterday.', tense: 'Past' },
  { s: 'We will visit the zoo tomorrow.', tense: 'Future' },
  { s: 'He is reading a book right now.', tense: 'Present' },
  { s: 'I ate breakfast an hour ago.', tense: 'Past' },
  { s: 'She will finish the project next week.', tense: 'Future' },
  { s: 'The sun rises in the east.', tense: 'Present' },
  { s: 'My father cooked dinner last night.', tense: 'Past' },
  { s: 'They will travel to Delhi next month.', tense: 'Future' },
  { s: 'We visit our grandparents every weekend.', tense: 'Present' },
  { s: 'The children built a sandcastle yesterday.', tense: 'Past' },
  { s: 'I will call you after school.', tense: 'Future' },
  { s: 'Birds fly south in winter.', tense: 'Present' },
  { s: 'She painted a lovely picture last week.', tense: 'Past' },
  { s: 'We shall celebrate her birthday next Sunday.', tense: 'Future' },
  { s: 'He walks to school every day.', tense: 'Present' },
]

function genVerbsTenses(difficulty = 'medium') {
  const mode = difficulty === 'hard' ? pick(['identify-tense', 'past-irregular']) : pick(['identify-tense', 'past-regular'])
  if (mode === 'identify-tense') {
    const item = pick(TENSE_SENTENCES)
    return {
      subtopicId: 'verbs-tenses',
      type: 'mcq',
      prompt: `Which tense is used in this sentence? "${item.s}"`,
      choices: shuffle(['Past', 'Present', 'Future']),
      answer: item.tense,
      hint: `Look for time clues in the sentence (like "yesterday", "right now", or "tomorrow") and the verb form used.`,
    }
  }
  if (mode === 'past-irregular') {
    const [base, past] = pick(IRREGULAR_VERBS)
    const { choices, answer } = mcqFrom(past, () => pick(IRREGULAR_VERBS.filter((v) => v[1] !== past))[1], (v) => v)
    return {
      subtopicId: 'verbs-tenses',
      type: 'mcq',
      prompt: `What is the past tense of "${base}"?`,
      choices,
      answer,
      hint: `"${base}" is an irregular verb — its past tense doesn't just add "-ed".`,
    }
  }
  const [base, past] = pick(REGULAR_VERBS)
  const { choices, answer } = mcqFrom(past, () => pick(REGULAR_VERBS.filter((v) => v[1] !== past))[1], (v) => v)
  return {
    subtopicId: 'verbs-tenses',
    type: 'mcq',
    prompt: `What is the past tense of "${base}"?`,
    choices,
    answer,
    hint: `Most regular verbs form the past tense by adding "-ed".`,
  }
}

// ---------------------------------------------------------------------------
// ADJECTIVES AND ADVERBS
// ---------------------------------------------------------------------------
const ADJ_COMPARISON = [
  ['tall', 'taller', 'tallest'],
  ['big', 'bigger', 'biggest'],
  ['small', 'smaller', 'smallest'],
  ['fast', 'faster', 'fastest'],
  ['strong', 'stronger', 'strongest'],
  ['bright', 'brighter', 'brightest'],
  ['long', 'longer', 'longest'],
  ['short', 'shorter', 'shortest'],
]
const IRREGULAR_ADJ = [
  ['good', 'better', 'best'],
  ['bad', 'worse', 'worst'],
  ['far', 'farther', 'farthest'],
  ['little', 'less', 'least'],
]
const ADVERB_SENTENCES = [
  { s: 'She runs quickly.', words: ['She', 'runs', 'quickly'], adverb: 'quickly' },
  { s: 'He speaks softly.', words: ['He', 'speaks', 'softly'], adverb: 'softly' },
  { s: 'The bird sang sweetly.', words: ['The', 'bird', 'sang', 'sweetly'], adverb: 'sweetly' },
  { s: 'They arrived early.', words: ['They', 'arrived', 'early'], adverb: 'early' },
  { s: 'She always tells the truth.', words: ['She', 'always', 'tells', 'the', 'truth'], adverb: 'always' },
  { s: 'He never lies.', words: ['He', 'never', 'lies'], adverb: 'never' },
  { s: 'The car moved slowly.', words: ['The', 'car', 'moved', 'slowly'], adverb: 'slowly' },
]

function genAdjectivesAdverbs(difficulty = 'medium') {
  const mode = difficulty === 'hard' ? pick(['comparative', 'superlative', 'irregular']) : pick(['comparative', 'superlative', 'identify-adverb'])
  if (mode === 'irregular') {
    const [base, comp, sup] = pick(IRREGULAR_ADJ)
    const askComp = Math.random() < 0.5
    const correct = askComp ? comp : sup
    const { choices, answer } = mcqFrom(
      correct,
      () => {
        const [, c, s] = pick(IRREGULAR_ADJ.filter((row) => row[0] !== base))
        return askComp ? c : s
      },
      (v) => v
    )
    return {
      subtopicId: 'adjectives-adverbs',
      type: 'mcq',
      prompt: `What is the ${askComp ? 'comparative' : 'superlative'} form of "${base}"?`,
      choices,
      answer,
      hint: `"${base}" is an irregular adjective — it doesn't just add "-er" or "-est".`,
    }
  }
  if (mode === 'identify-adverb') {
    const item = pick(ADVERB_SENTENCES)
    const { choices, answer } = mcqFrom(item.adverb, () => pick(item.words.filter((w) => w !== item.adverb)), (v) => v)
    return {
      subtopicId: 'adjectives-adverbs',
      type: 'mcq',
      prompt: `Which word in this sentence is an adverb? "${item.s}"`,
      choices,
      answer,
      hint: `An adverb describes a verb — it often tells us how, when, or where something happens.`,
    }
  }
  const [base, comp, sup] = pick(ADJ_COMPARISON)
  const askComparative = mode === 'comparative'
  const correct = askComparative ? comp : sup
  const { choices, answer } = mcqFrom(
    correct,
    () => {
      const [, c, s] = pick(ADJ_COMPARISON.filter((row) => row[0] !== base))
      return askComparative ? c : s
    },
    (v) => v
  )
  return {
    subtopicId: 'adjectives-adverbs',
    type: 'mcq',
    prompt: `What is the ${askComparative ? 'comparative' : 'superlative'} form of "${base}"?`,
    choices,
    answer,
    hint: askComparative ? `Add "-er" to compare two things.` : `Add "-est" to compare more than two things.`,
  }
}

// ---------------------------------------------------------------------------
// SENTENCE STRUCTURE
// ---------------------------------------------------------------------------
const SENTENCE_TYPES = [
  { s: 'What is your name?', type: 'Interrogative' },
  { s: 'Please close the door.', type: 'Imperative' },
  { s: 'What a beautiful sunset!', type: 'Exclamatory' },
  { s: 'The sky is blue.', type: 'Declarative' },
  { s: 'Where do you live?', type: 'Interrogative' },
  { s: 'Sit down quietly.', type: 'Imperative' },
  { s: 'Hurray, we won the match!', type: 'Exclamatory' },
  { s: 'Elephants are the largest land animals.', type: 'Declarative' },
]
const SUBJECT_VERB = [
  { subject: 'The dogs', blank: 'are', rest: 'barking loudly.', options: ['is', 'are'] },
  { subject: 'She', blank: 'is', rest: 'my best friend.', options: ['is', 'are'] },
  { subject: 'The children', blank: 'were', rest: 'playing in the park.', options: ['was', 'were'] },
  { subject: 'He', blank: 'has', rest: 'finished his homework.', options: ['has', 'have'] },
  { subject: 'They', blank: 'have', rest: 'already left.', options: ['has', 'have'] },
  { subject: 'The cat', blank: 'was', rest: 'sleeping on the sofa.', options: ['was', 'were'] },
  { subject: 'My friends', blank: 'are', rest: 'coming to the party.', options: ['is', 'are'] },
  { subject: 'I', blank: 'am', rest: 'ready for the test.', options: ['am', 'is', 'are'] },
]

function genSentenceStructure() {
  const mode = pick(['sentence-type', 'subject-verb'])
  if (mode === 'sentence-type') {
    const item = pick(SENTENCE_TYPES)
    return {
      subtopicId: 'sentence-structure',
      type: 'mcq',
      prompt: `What type of sentence is this? "${item.s}"`,
      choices: shuffle(['Declarative', 'Interrogative', 'Imperative', 'Exclamatory']),
      answer: item.type,
      hint: `Declarative = a statement. Interrogative = a question. Imperative = a command. Exclamatory = strong feeling.`,
    }
  }
  const item = pick(SUBJECT_VERB)
  return {
    subtopicId: 'sentence-structure',
    type: 'mcq',
    prompt: `Choose the correct verb to complete the sentence: "${item.subject} ___ ${item.rest}"`,
    choices: shuffle(item.options),
    answer: item.blank,
    hint: `Make sure the verb agrees with the subject "${item.subject}" in number (singular or plural).`,
  }
}

// ---------------------------------------------------------------------------
// VOCABULARY — SYNONYMS AND ANTONYMS
// ---------------------------------------------------------------------------
const SYNONYM_PAIRS = [
  ['happy', 'joyful'],
  ['big', 'large'],
  ['fast', 'quick'],
  ['smart', 'clever'],
  ['sad', 'unhappy'],
  ['beautiful', 'pretty'],
  ['angry', 'furious'],
  ['tired', 'exhausted'],
  ['begin', 'start'],
  ['end', 'finish'],
  ['small', 'tiny'],
  ['brave', 'courageous'],
  ['quiet', 'silent'],
  ['strange', 'odd'],
  ['rich', 'wealthy'],
  ['difficult', 'tough'],
  ['funny', 'amusing'],
  ['loud', 'noisy'],
  ['ancient', 'old'],
  ['gather', 'collect'],
  ['choose', 'select'],
  ['huge', 'enormous'],
]
const ANTONYM_PAIRS = [
  ['hot', 'cold'],
  ['big', 'small'],
  ['happy', 'sad'],
  ['fast', 'slow'],
  ['light', 'dark'],
  ['open', 'closed'],
  ['easy', 'difficult'],
  ['up', 'down'],
  ['begin', 'end'],
  ['win', 'lose'],
  ['young', 'old'],
  ['love', 'hate'],
  ['clean', 'dirty'],
  ['brave', 'cowardly'],
  ['generous', 'selfish'],
  ['polite', 'rude'],
  ['wide', 'narrow'],
  ['ancient', 'modern'],
  ['loud', 'quiet'],
  ['full', 'empty'],
  ['strong', 'weak'],
  ['inside', 'outside'],
]

// Synonym/antonym pairs work in both directions (e.g. antonym of "hot" is
// "cold" and antonym of "cold" is "hot"), so pick a random order each time
// to double the effective question variety from the same word bank.
function pickPairEitherWay(pairs) {
  const pair = pick(pairs)
  return Math.random() < 0.5 ? pair : [pair[1], pair[0]]
}

function genVocabularySynonymsAntonyms(difficulty = 'medium') {
  const isSynonym = Math.random() < 0.5
  const pairs = isSynonym ? SYNONYM_PAIRS : ANTONYM_PAIRS
  const [word, correct] = pickPairEitherWay(pairs)
  const { choices, answer } = mcqFrom(correct, () => pick(pairs.filter((p) => p[1] !== correct && p[0] !== word))[1], (v) => v)
  return {
    subtopicId: 'vocabulary-synonyms-antonyms',
    type: 'mcq',
    prompt: `What is the ${isSynonym ? 'synonym' : 'antonym'} of "${word}"?`,
    choices,
    answer,
    hint: isSynonym ? `A synonym means almost the same thing.` : `An antonym means the opposite.`,
  }
}

// ---------------------------------------------------------------------------
// PUNCTUATION AND CAPITALIZATION
// ---------------------------------------------------------------------------
const PUNCTUATION_SENTENCES = [
  { s: 'Where are you going', mark: '?' },
  { s: 'What a wonderful surprise', mark: '!' },
  { s: 'I live in Mumbai', mark: '.' },
  { s: 'How old are you', mark: '?' },
  { s: 'Watch out for the car', mark: '!' },
  { s: 'She teaches at a school', mark: '.' },
]
const CAPITALIZATION_SENTENCES = [
  { s: 'My friend priya loves painting.', word: 'priya', others: ['my', 'friend', 'loves', 'painting'] },
  { s: 'They live near the ganga river.', word: 'ganga', others: ['they', 'live', 'near', 'the', 'river'] },
  { s: 'We celebrate diwali every year.', word: 'diwali', others: ['we', 'celebrate', 'every', 'year'] },
  { s: 'He was born in mumbai.', word: 'mumbai', others: ['he', 'was', 'born', 'in'] },
  { s: 'Next monday is a holiday.', word: 'monday', others: ['next', 'is', 'a', 'holiday'] },
  { s: 'I read a book by shakespeare.', word: 'shakespeare', others: ['i', 'read', 'a', 'book', 'by'] },
]

function genPunctuationCapitalization() {
  const mode = pick(['end-mark', 'capitalization'])
  if (mode === 'end-mark') {
    const item = pick(PUNCTUATION_SENTENCES)
    return {
      subtopicId: 'punctuation-capitalization',
      type: 'mcq',
      prompt: `Which punctuation mark correctly ends this sentence? "${item.s} ___"`,
      choices: ['.', '?', '!'],
      answer: item.mark,
      hint: `A question ends with "?", a strong feeling ends with "!", and a plain statement ends with "."`,
    }
  }
  const item = pick(CAPITALIZATION_SENTENCES)
  const { choices, answer } = mcqFrom(item.word, () => pick(item.others), (v) => v)
  return {
    subtopicId: 'punctuation-capitalization',
    type: 'mcq',
    prompt: `Which word in this sentence needs a capital letter? "${item.s}"`,
    choices,
    answer,
    hint: `Proper nouns (specific names of people, places, or special days) always start with a capital letter.`,
  }
}

// ---------------------------------------------------------------------------
// SPELLING AND WORD FORMATION
// ---------------------------------------------------------------------------
const SPELLING_WORDS = [
  { correct: 'beautiful', wrong: ['beutiful', 'beautifull', 'byootiful'] },
  { correct: 'necessary', wrong: ['neccessary', 'necesary', 'nescessary'] },
  { correct: 'definitely', wrong: ['definately', 'definitly', 'deffinitely'] },
  { correct: 'friend', wrong: ['freind', 'frend', 'friand'] },
  { correct: 'occasion', wrong: ['ocasion', 'occassion', 'occasoin'] },
  { correct: 'separate', wrong: ['seperate', 'separete', 'seprate'] },
  { correct: 'restaurant', wrong: ['resturant', 'restaraunt', 'restraunt'] },
  { correct: 'February', wrong: ['Febuary', 'Feburary', 'Februrary'] },
  { correct: 'believe', wrong: ['beleive', 'belive', 'beleave'] },
  { correct: 'calendar', wrong: ['calender', 'callendar', 'calandar'] },
  { correct: 'embarrass', wrong: ['embarass', 'embarras', 'emberrass'] },
  { correct: 'government', wrong: ['goverment', 'governmant', 'govermant'] },
  { correct: 'immediately', wrong: ['imediately', 'immediatly', 'immedietely'] },
  { correct: 'library', wrong: ['libary', 'liberry', 'librery'] },
]
const PLURAL_RULES = [
  ['bus', 'buses'],
  ['baby', 'babies'],
  ['leaf', 'leaves'],
  ['tooth', 'teeth'],
  ['child', 'children'],
  ['mouse', 'mice'],
  ['box', 'boxes'],
  ['city', 'cities'],
  ['knife', 'knives'],
  ['man', 'men'],
  ['woman', 'women'],
  ['foot', 'feet'],
  ['sheep', 'sheep'],
  ['wolf', 'wolves'],
]

function genSpellingWordFormation() {
  const mode = pick(['correct-spelling', 'plural'])
  if (mode === 'correct-spelling') {
    const item = pick(SPELLING_WORDS)
    const choices = shuffle([item.correct, ...item.wrong])
    return {
      subtopicId: 'spelling-word-formation',
      type: 'mcq',
      prompt: `Which of these is spelled correctly: ${choices.join(', ')}?`,
      choices,
      answer: item.correct,
      hint: `Sound out the word carefully and think about tricky letter patterns.`,
    }
  }
  const [singular, plural] = pick(PLURAL_RULES)
  const naiveWrong = `${singular}s`
  const { choices, answer } = mcqFrom(
    plural,
    () => (Math.random() < 0.5 ? naiveWrong : pick(PLURAL_RULES.filter((p) => p[1] !== plural))[1]),
    (v) => v
  )
  return {
    subtopicId: 'spelling-word-formation',
    type: 'mcq',
    prompt: `What is the plural of "${singular}"?`,
    choices,
    answer,
    hint: `This word doesn't just add "-s" — it follows a special plural rule.`,
  }
}

// ---------------------------------------------------------------------------
// READING COMPREHENSION
// ---------------------------------------------------------------------------
const PASSAGES = [
  {
    text: `Riya woke up early on Saturday morning. She wanted to help her mother in the garden. Together, they planted tomato seeds and watered the rose bushes. By noon, Riya was tired but happy because she had learned how plants grow.`,
    questions: [
      { prompt: 'What day did Riya wake up early?', choices: ['Saturday', 'Sunday', 'Monday', 'Friday'], answer: 'Saturday' },
      { prompt: 'What did Riya and her mother plant?', choices: ['Tomato seeds', 'Corn seeds', 'Apple seeds', 'Wheat seeds'], answer: 'Tomato seeds' },
      { prompt: 'How did Riya feel by noon?', choices: ['Tired but happy', 'Angry', 'Bored', 'Scared'], answer: 'Tired but happy' },
    ],
  },
  {
    text: `The old lighthouse stood at the edge of the cliff, guiding ships safely to the harbor. Every evening, Mr. Thomas climbed the 120 steps to light the lamp. Sailors said his lighthouse had never once failed them, even during the worst storms.`,
    questions: [
      { prompt: 'Where did the lighthouse stand?', choices: ['At the edge of the cliff', 'In the forest', 'On a mountain', 'In the harbor'], answer: 'At the edge of the cliff' },
      { prompt: 'How many steps did Mr. Thomas climb?', choices: ['120', '100', '150', '80'], answer: '120' },
      { prompt: 'What did the lighthouse help ships do?', choices: ['Reach the harbor safely', 'Catch fish', 'Race each other', 'Repair their sails'], answer: 'Reach the harbor safely' },
    ],
  },
  {
    text: `Ants are tiny but incredibly strong insects. A single ant can carry objects many times its own body weight. Ants live together in large colonies and work as a team to build tunnels, find food, and protect their queen.`,
    questions: [
      { prompt: 'What can a single ant carry?', choices: ['Objects many times its body weight', 'Only leaves', 'Nothing heavy', 'Only water'], answer: 'Objects many times its body weight' },
      { prompt: 'How do ants live?', choices: ['In large colonies', 'Alone', 'In pairs', 'Underwater'], answer: 'In large colonies' },
      { prompt: 'Who do ants protect in their colony?', choices: ['The queen', 'The king', 'A lion', 'A spider'], answer: 'The queen' },
    ],
  },
  {
    text: `Every winter, thousands of Siberian cranes fly thousands of kilometers to warmer wetlands to escape the freezing cold. This long journey is called migration. The birds fly in a V-shaped formation, which helps them save energy during the long flight.`,
    questions: [
      { prompt: 'Why do Siberian cranes migrate?', choices: ['To escape the freezing cold', 'To find new friends', 'To learn to swim', 'To build nests in the snow'], answer: 'To escape the freezing cold' },
      { prompt: 'What shape do the birds fly in?', choices: ['V-shaped formation', 'Circle', 'Straight line', 'Square'], answer: 'V-shaped formation' },
      { prompt: 'What does flying in this shape help the birds do?', choices: ['Save energy', 'Fly faster than airplanes', 'See in the dark', 'Avoid rain'], answer: 'Save energy' },
    ],
  },
  {
    text: `Rohan borrowed a book about dinosaurs from the school library. He was so interested that he finished all 150 pages in just two days. When he returned it, the librarian gave him another book about the solar system.`,
    questions: [
      { prompt: 'What was Rohan\'s first book about?', choices: ['Dinosaurs', 'Rockets', 'The ocean', 'Sports'], answer: 'Dinosaurs' },
      { prompt: 'How many pages did the book have?', choices: ['150', '100', '200', '50'], answer: '150' },
      { prompt: 'What book did the librarian give him next?', choices: ['A book about the solar system', 'A cookbook', 'A comic book', 'A dictionary'], answer: 'A book about the solar system' },
    ],
  },
  {
    text: `Honey bees communicate with each other through a special "waggle dance." By moving in a figure-eight pattern, a bee can tell the rest of the hive exactly where to find flowers with the best nectar, even if the flowers are far away.`,
    questions: [
      { prompt: 'What is the bee\'s dance called?', choices: ['The waggle dance', 'The nectar dance', 'The flower dance', 'The hive dance'], answer: 'The waggle dance' },
      { prompt: 'What pattern does the bee move in?', choices: ['A figure-eight', 'A circle', 'A zigzag', 'A straight line'], answer: 'A figure-eight' },
      { prompt: 'What does the dance tell other bees?', choices: ['Where to find the best nectar', 'When winter will come', 'How to build a hive', 'How to fly faster'], answer: 'Where to find the best nectar' },
    ],
  },
  {
    text: `The Great Wall of China stretches over 21,000 kilometers, making it one of the longest structures ever built by humans. It took many centuries and the labor of millions of workers to complete. Today, it is visited by millions of tourists every year.`,
    questions: [
      { prompt: 'How long is the Great Wall of China?', choices: ['Over 21,000 kilometers', 'Over 5,000 kilometers', 'Over 1,000 kilometers', 'Over 50,000 kilometers'], answer: 'Over 21,000 kilometers' },
      { prompt: 'Who built the Great Wall?', choices: ['Millions of workers', 'One emperor alone', 'A small team of ten', 'Robots'], answer: 'Millions of workers' },
      { prompt: 'Who visits the wall today?', choices: ['Millions of tourists', 'Only scientists', 'Only soldiers', 'No one'], answer: 'Millions of tourists' },
    ],
  },
  {
    text: `Maria loved to bake with her grandmother every Sunday. This week, they made banana bread using three ripe bananas, two cups of flour, and a cup of sugar. The kitchen smelled wonderful while it baked in the oven for forty-five minutes.`,
    questions: [
      { prompt: 'What did Maria bake with her grandmother?', choices: ['Banana bread', 'Chocolate cake', 'Apple pie', 'Bread rolls'], answer: 'Banana bread' },
      { prompt: 'How many bananas did they use?', choices: ['Three', 'Two', 'Five', 'One'], answer: 'Three' },
      { prompt: 'How long did it bake?', choices: ['Forty-five minutes', 'Ten minutes', 'Two hours', 'Thirty minutes'], answer: 'Forty-five minutes' },
    ],
  },
  {
    text: `Volcanoes form when hot melted rock, called magma, rises up from deep inside the Earth. When a volcano erupts, the magma is called lava once it reaches the surface. Some volcanoes erupt violently, while others release lava slowly and gently.`,
    questions: [
      { prompt: 'What is magma called before it reaches the surface?', choices: ['Magma', 'Lava', 'Ash', 'Steam'], answer: 'Magma' },
      { prompt: 'What is magma called once it reaches the surface?', choices: ['Lava', 'Rock', 'Sand', 'Smoke'], answer: 'Lava' },
      { prompt: 'Where does magma come from?', choices: ['Deep inside the Earth', 'The ocean', 'The sky', 'The moon'], answer: 'Deep inside the Earth' },
    ],
  },
  {
    text: `The school organized a cleanliness drive to keep the playground litter-free. Students from every class brought gloves and bags to collect waste paper and plastic. By the end of the day, they had filled twelve large bags with trash and planted five new trees.`,
    questions: [
      { prompt: 'What did the school organize?', choices: ['A cleanliness drive', 'A sports day', 'A music concert', 'A cooking class'], answer: 'A cleanliness drive' },
      { prompt: 'How many bags of trash did they fill?', choices: ['Twelve', 'Five', 'Twenty', 'Three'], answer: 'Twelve' },
      { prompt: 'How many new trees did they plant?', choices: ['Five', 'Twelve', 'Ten', 'Two'], answer: 'Five' },
    ],
  },
]

function genReadingComprehension() {
  const passage = pick(PASSAGES)
  const q = pick(passage.questions)
  return {
    subtopicId: 'reading-comprehension',
    type: 'mcq',
    passage: passage.text,
    prompt: q.prompt,
    choices: shuffle(q.choices),
    answer: q.answer,
    hint: `Re-read the passage above carefully to find the answer.`,
  }
}

// ---------------------------------------------------------------------------
// ONE-WORD SUBSTITUTION AND IDIOMS — bonus
// ---------------------------------------------------------------------------
const ONE_WORD_SUBS = [
  ['A person who studies stars and planets', 'Astronomer'],
  ['A place where books are kept for reading or borrowing', 'Library'],
  ['A person who cannot read or write', 'Illiterate'],
  ['A person who treats sick people', 'Doctor'],
  ['A place where animals are kept for public viewing', 'Zoo'],
  ['A person who flies an aeroplane', 'Pilot'],
  ['A house made of ice', 'Igloo'],
  ['A group of islands', 'Archipelago'],
  ['A person who studies the weather', 'Meteorologist'],
  ['A place where bread is baked and sold', 'Bakery'],
  ['A person who cooks food in a hotel or restaurant', 'Chef'],
  ['A person who repairs pipes and water fittings', 'Plumber'],
  ['A word that has the same meaning as another word', 'Synonym'],
  ['A person who has no permanent home', 'Homeless'],
  ['A person who writes books', 'Author'],
  ['A place where coins and notes are printed', 'Mint'],
  ['A person who can speak many languages', 'Polyglot'],
  ['One who loves books and reading', 'Bibliophile'],
  ['A person who does not eat meat', 'Vegetarian'],
  ['A shelter for homeless or lost animals', 'Sanctuary'],
  ['A person who is new to a place or job', 'Newcomer'],
  ['A word that is opposite in meaning to another word', 'Antonym'],
  ['A person who mends shoes', 'Cobbler'],
  ['A story that is not true, made up from imagination', 'Fiction'],
  ['A person who leads an orchestra', 'Conductor'],
  ['A place where milk and dairy products are processed', 'Dairy'],
]
const IDIOMS = [
  ['Once in a blue moon', 'Very rarely'],
  ['Break the ice', 'To start a conversation'],
  ['Piece of cake', 'Something very easy'],
  ['Under the weather', 'Feeling unwell'],
  ['Spill the beans', 'To reveal a secret'],
  ['Hit the books', 'To study hard'],
  ['A blessing in disguise', 'Something good that seemed bad at first'],
  ['Costs an arm and a leg', 'Very expensive'],
  ['Let the cat out of the bag', 'To reveal a secret by accident'],
  ['Burning the midnight oil', 'Working late into the night'],
  ['A piece of your mind', 'To tell someone honestly that you are angry with them'],
  ['Kill two birds with one stone', 'To achieve two things with a single action'],
  ['The ball is in your court', 'It is now your decision or responsibility'],
  ['Bite the bullet', 'To face a difficult situation bravely'],
  ['Time flies', 'Time passes very quickly'],
  ['Actions speak louder than words', 'What you do matters more than what you say'],
  ['Every cloud has a silver lining', 'There is something good in every bad situation'],
  ['Don\'t judge a book by its cover', 'Don\'t judge something by its appearance alone'],
  ['The early bird catches the worm', 'People who act early gain an advantage'],
  ['When it rains, it pours', 'Difficult things tend to happen all at once'],
  ['Cry over spilt milk', 'To worry uselessly about something that already happened'],
  ['Beat around the bush', 'To avoid getting to the point'],
  ['Get cold feet', 'To become nervous about doing something'],
  ['Once bitten, twice shy', 'To be very cautious after a bad experience'],
  ['A drop in the ocean', 'A very small amount compared to what is needed'],
  ['Add fuel to the fire', 'To make a bad situation even worse'],
  ['Call it a day', 'To stop working on something'],
  ['On thin ice', 'In a risky or difficult situation'],
]

function genOneWordSubIdioms() {
  const isIdiom = Math.random() < 0.5
  const bank = isIdiom ? IDIOMS : ONE_WORD_SUBS
  const [clue, correct] = pick(bank)
  const { choices, answer } = mcqFrom(correct, () => pick(bank.filter((b) => b[1] !== correct))[1], (v) => v)
  return {
    subtopicId: 'one-word-idioms',
    type: 'mcq',
    prompt: isIdiom ? `What does the idiom "${clue}" mean?` : `What one word means: "${clue}"?`,
    choices,
    answer,
    hint: isIdiom ? `Idioms don't mean exactly what the words say — think about the message behind it.` : `Think of a single word that captures this whole description.`,
  }
}

// ---------------------------------------------------------------------------
// OLYMPIAD-ONLY ENGLISH CATEGORIES
// ---------------------------------------------------------------------------

function genSynonymsOlympiad() {
  const [word, correct] = pickPairEitherWay(SYNONYM_PAIRS)
  const { choices, answer } = mcqFrom(correct, () => pick(SYNONYM_PAIRS.filter((p) => p[1] !== correct && p[0] !== word))[1], (v) => v)
  return {
    subtopicId: 'synonyms',
    type: 'mcq',
    prompt: `Choose the word most similar in meaning to "${word}".`,
    choices,
    answer,
    hint: `A synonym means almost the same thing as the given word.`,
  }
}

function genAntonymsOlympiad() {
  const [word, correct] = pickPairEitherWay(ANTONYM_PAIRS)
  const { choices, answer } = mcqFrom(correct, () => pick(ANTONYM_PAIRS.filter((p) => p[1] !== correct && p[0] !== word))[1], (v) => v)
  return {
    subtopicId: 'antonyms',
    type: 'mcq',
    prompt: `Choose the word most opposite in meaning to "${word}".`,
    choices,
    answer,
    hint: `An antonym means the opposite of the given word.`,
  }
}

function genOneWordSubstitution() {
  const [clue, correct] = pick(ONE_WORD_SUBS)
  const { choices, answer } = mcqFrom(correct, () => pick(ONE_WORD_SUBS.filter((b) => b[1] !== correct))[1], (v) => v)
  return {
    subtopicId: 'one-word-substitution',
    type: 'mcq',
    prompt: `Choose the one word that means: "${clue}".`,
    choices,
    answer,
    hint: `Look for a single specific word rather than a description.`,
  }
}

const ARTICLES_PREPOSITIONS = [
  { s: '___ apple a day keeps the doctor away.', blank: 'An', options: ['A', 'An', 'The'] },
  { s: 'She is ___ honest girl.', blank: 'an', options: ['a', 'an', 'the'] },
  { s: 'The cat is sitting ___ the table.', blank: 'under', options: ['under', 'above', 'between'] },
  { s: 'He divided the sweets ___ the three children.', blank: 'among', options: ['among', 'between', 'under'] },
  { s: 'She arrived ___ 9 o\'clock.', blank: 'at', options: ['at', 'in', 'on'] },
  { s: 'We are meeting ___ Monday.', blank: 'on', options: ['on', 'at', 'in'] },
  { s: 'They live ___ Mumbai.', blank: 'in', options: ['in', 'on', 'at'] },
  { s: 'The book is ___ the two shelves.', blank: 'between', options: ['between', 'among', 'under'] },
  { s: 'He is ___ university student.', blank: 'a', options: ['a', 'an', 'the'] },
  { s: '___ sun rises in the east.', blank: 'The', options: ['A', 'An', 'The'] },
  { s: 'The ball rolled ___ the hill.', blank: 'down', options: ['down', 'up', 'into'] },
  { s: 'She jumped ___ the pool.', blank: 'into', options: ['into', 'onto', 'under'] },
  { s: 'The plane flew ___ the clouds.', blank: 'above', options: ['above', 'below', 'behind'] },
  { s: 'He hid ___ the curtain.', blank: 'behind', options: ['behind', 'beside', 'above'] },
  { s: 'We reached home ___ midnight.', blank: 'before', options: ['before', 'after', 'during'] },
  { s: 'She has been studying ___ two hours.', blank: 'for', options: ['for', 'since', 'at'] },
  { s: 'He has lived here ___ 2015.', blank: 'since', options: ['since', 'for', 'from'] },
  { s: 'The keys are ___ the drawer.', blank: 'in', options: ['in', 'on', 'at'] },
  { s: '___ elephant never forgets.', blank: 'An', options: ['A', 'An', 'The'] },
  { s: 'He is ___ tallest boy in the class.', blank: 'the', options: ['a', 'an', 'the'] },
  { s: 'The picture hangs ___ the wall.', blank: 'on', options: ['on', 'in', 'at'] },
  { s: 'She walked ___ the bridge.', blank: 'across', options: ['across', 'along', 'around'] },
  { s: 'The dog ran ___ the garden.', blank: 'around', options: ['around', 'across', 'into'] },
  { s: 'She placed the vase ___ the shelf.', blank: 'on', options: ['on', 'in', 'at'] },
  { s: 'They walked ___ the narrow lane.', blank: 'through', options: ['through', 'over', 'between'] },
  { s: 'He climbed ___ the ladder carefully.', blank: 'up', options: ['up', 'down', 'across'] },
  { s: 'The train arrived ___ time.', blank: 'on', options: ['on', 'in', 'at'] },
  { s: '___ moon orbits the Earth.', blank: 'The', options: ['A', 'An', 'The'] },
]

function genGrammarArticlesPrepositions() {
  const item = pick(ARTICLES_PREPOSITIONS)
  return {
    subtopicId: 'grammar-articles-prepositions',
    type: 'mcq',
    prompt: `Fill in the blank: "${item.s}"`,
    choices: shuffle(item.options),
    answer: item.blank,
    hint: `Read the sentence carefully — the correct word depends on the noun and context that follows.`,
  }
}

function genGrammarTenses(difficulty = 'hard') {
  return genVerbsTenses('hard')
}

// Each entry must already be in correct grammatical order — it's joined
// directly to form the answer, and only shuffled separately for display.
const JUMBLED_SENTENCE_BANK = [
  ['This', 'is', 'my', 'book'],
  ['She', 'goes', 'to', 'school', 'every', 'day'],
  ['He', 'plays', 'football', 'in', 'the', 'evening'],
  ['This', 'is', 'a', 'beautiful', 'garden'],
  ['She', 'finished', 'her', 'homework', 'quickly'],
  ['He', 'likes', 'reading', 'books'],
  ['The', 'birds', 'are', 'flying', 'in', 'the', 'sky'],
  ['Our', 'team', 'won', 'the', 'match'],
  ['She', 'loves', 'painting', 'pictures'],
  ['The', 'sun', 'shone', 'brightly'],
  ['The', 'fox', 'is', 'very', 'clever'],
  ['He', 'brushes', 'his', 'teeth', 'every', 'morning'],
  ['It', 'rains', 'heavily', 'during', 'the', 'monsoon'],
  ['She', 'is', 'the', 'happiest', 'girl', 'in', 'the', 'class'],
  ['We', 'watered', 'the', 'plants', 'in', 'the', 'garden'],
  ['He', 'is', 'kind', 'to', 'everyone'],
]

function genSentenceRearrangement() {
  const words = pick(JUMBLED_SENTENCE_BANK)
  const correctSentence = words.join(' ') + '.'
  const shuffled = shuffle(words)
  return {
    subtopicId: 'sentence-rearrangement',
    type: 'input',
    prompt: `Rearrange these words into a meaningful sentence: ${shuffled.join(' / ')}`,
    answer: correctSentence,
    hint: `Look for the subject first, then the verb, then the rest of the sentence. Don't forget the full stop at the end.`,
  }
}

function genIdiomsPhrases() {
  const [clue, correct] = pick(IDIOMS)
  const { choices, answer } = mcqFrom(correct, () => pick(IDIOMS.filter((b) => b[1] !== correct))[1], (v) => v)
  return {
    subtopicId: 'idioms-phrases',
    type: 'mcq',
    prompt: `What does the idiom "${clue}" mean?`,
    choices,
    answer,
    hint: `Idioms have a figurative meaning that's different from the literal words.`,
  }
}

const WORD_ANALOGIES_ENGLISH = [
  ['Bird', 'Nest', 'Bee', 'Hive'],
  ['Puppy', 'Dog', 'Kitten', 'Cat'],
  ['Author', 'Book', 'Singer', 'Song'],
  ['Doctor', 'Hospital', 'Teacher', 'School'],
  ['Fish', 'Water', 'Bird', 'Air'],
  ['Foot', 'Shoe', 'Hand', 'Glove'],
  ['Cow', 'Calf', 'Cat', 'Kitten'],
  ['Pen', 'Write', 'Knife', 'Cut'],
  ['Sun', 'Day', 'Moon', 'Night'],
  ['Tailor', 'Clothes', 'Carpenter', 'Furniture'],
  ['Eye', 'See', 'Ear', 'Hear'],
  ['Petrol', 'Vehicle', 'Food', 'Body'],
  ['Water', 'Liquid', 'Ice', 'Solid'],
  ['Bee', 'Sting', 'Snake', 'Bite'],
  ['King', 'Palace', 'Bird', 'Nest'],
  ['Author', 'Novel', 'Poet', 'Poem'],
  ['Chef', 'Kitchen', 'Farmer', 'Field'],
  ['Glove', 'Hand', 'Sock', 'Foot'],
  ['Spider', 'Web', 'Bird', 'Nest'],
  ['Book', 'Read', 'Song', 'Sing'],
  ['Lion', 'Roar', 'Dog', 'Bark'],
  ['Ice', 'Cold', 'Fire', 'Hot'],
  ['Student', 'Learn', 'Athlete', 'Train'],
  ['Painter', 'Brush', 'Writer', 'Pen'],
  ['Baker', 'Bread', 'Farmer', 'Crops'],
  ['Knife', 'Sharp', 'Cotton', 'Soft'],
]

function genWordAnalogies() {
  const [w1, w2, w3, w4] = pick(WORD_ANALOGIES_ENGLISH)
  const distractorPool = WORD_ANALOGIES_ENGLISH.flat().filter((w) => w !== w4)
  const { choices, answer } = mcqFrom(w4, () => pick(distractorPool), (v) => v)
  return {
    subtopicId: 'word-analogies',
    type: 'mcq',
    prompt: `${w1} is to ${w2} as ${w3} is to ?`,
    choices,
    answer,
    hint: `Work out how ${w1} relates to ${w2}, then find the word with the same relationship to ${w3}.`,
  }
}

const HOMOPHONE_PAIRS = [
  ['flower', 'flour', 'A powder made from ground wheat, used for baking'],
  ['sun', 'son', 'A male child'],
  ['sea', 'see', 'To use your eyes'],
  ['hear', 'here', 'In this place'],
  ['write', 'right', 'Correct, or the opposite of left'],
  ['blue', 'blew', 'Past tense of blow'],
  ['pair', 'pear', 'A juicy fruit'],
  ['break', 'brake', 'A part of a vehicle used to stop it'],
  ['eight', 'ate', 'Past tense of eat'],
  ['knight', 'night', 'The time of day when it is dark'],
  ['mail', 'male', 'Belonging to the masculine sex'],
  ['meat', 'meet', 'To come together with someone'],
  ['tail', 'tale', 'A story'],
  ['weak', 'week', 'A period of seven days'],
  ['sail', 'sale', 'An event where goods are sold at a discount'],
  ['peace', 'piece', 'A part of something'],
  ['bear', 'bare', 'Without any covering'],
  ['whole', 'hole', 'An opening or gap'],
  ['plane', 'plain', 'Simple, or a flat area of land'],
  ['steal', 'steel', 'A strong metal'],
  ['cell', 'sell', 'To give something in exchange for money'],
  ['bee', 'be', 'To exist'],
  ['deer', 'dear', 'Much loved, or an expensive price'],
  ['maid', 'made', 'Past tense of make'],
  ['road', 'rode', 'Past tense of ride'],
  ['wait', 'weight', 'How heavy something is'],
]

function genHomophones() {
  const [wordA, wordB, meaningOfB] = pick(HOMOPHONE_PAIRS)
  const { choices, answer } = mcqFrom(wordB, () => pick(HOMOPHONE_PAIRS.filter((p) => p[1] !== wordB))[1], (v) => v)
  return {
    subtopicId: 'homophones',
    type: 'mcq',
    prompt: `Which word sounds the same as "${wordA}" but means: "${meaningOfB}"?`,
    choices,
    answer,
    hint: `Homophones sound identical but are spelled differently and mean different things.`,
  }
}

const OLYMPIAD_PASSAGES = [
  {
    text: `Coral reefs, often called the "rainforests of the sea," are home to nearly a quarter of all marine species despite covering less than one percent of the ocean floor. Rising ocean temperatures cause a stress response called coral bleaching, in which corals expel the colorful algae living in their tissues, turning stark white. Without these algae, corals lose their main source of food and can eventually die if conditions do not improve quickly.`,
    questions: [
      { prompt: 'What fraction of marine species do coral reefs support?', choices: ['Nearly a quarter', 'Nearly half', 'Nearly all', 'Almost none'], answer: 'Nearly a quarter' },
      { prompt: 'What is coral bleaching?', choices: ['Corals expelling their algae due to heat stress', 'Corals growing faster', 'Corals changing color for camouflage', 'Corals reproducing'], answer: 'Corals expelling their algae due to heat stress' },
      { prompt: 'Why do corals need their algae?', choices: ['The algae are their main source of food', 'The algae protect them from fish', 'The algae help them swim', 'The algae make them heavier'], answer: 'The algae are their main source of food' },
    ],
  },
  {
    text: `In 1969, the Apollo 11 mission successfully landed the first humans on the Moon. Neil Armstrong became the first person to step onto the lunar surface, describing it as "one small step for man, one giant leap for mankind." The mission had taken years of preparation, and millions of people around the world watched the landing live on television.`,
    questions: [
      { prompt: 'In which year did Apollo 11 land on the Moon?', choices: ['1969', '1959', '1979', '1989'], answer: '1969' },
      { prompt: 'Who was the first person to step onto the Moon?', choices: ['Neil Armstrong', 'Buzz Aldrin', 'Michael Collins', 'Yuri Gagarin'], answer: 'Neil Armstrong' },
      { prompt: 'How did people around the world experience the landing?', choices: ['They watched it live on television', 'They read about it the next week', 'They heard it on the radio only', 'They were not able to know about it'], answer: 'They watched it live on television' },
    ],
  },
  {
    text: `The invention of the printing press by Johannes Gutenberg in the 15th century revolutionized the spread of information. Before this invention, books had to be copied by hand, which was slow and expensive. The printing press allowed multiple copies of a book to be produced quickly, making books more affordable and helping literacy rates rise across Europe.`,
    questions: [
      { prompt: 'Who invented the printing press?', choices: ['Johannes Gutenberg', 'Isaac Newton', 'Leonardo da Vinci', 'Galileo Galilei'], answer: 'Johannes Gutenberg' },
      { prompt: 'How were books produced before the printing press?', choices: ['Copied by hand', 'Printed digitally', 'Recorded as audio', 'Not produced at all'], answer: 'Copied by hand' },
      { prompt: 'What effect did the printing press have on literacy?', choices: ['It helped literacy rates rise', 'It had no effect', 'It made people stop reading', 'It made books more expensive'], answer: 'It helped literacy rates rise' },
    ],
  },
  {
    text: `Octopuses are remarkably intelligent creatures with three hearts and blue blood. Two of their hearts pump blood to the gills, while the third pumps it to the rest of the body. Their blood is blue because it contains a copper-based molecule called hemocyanin, instead of the iron-based hemoglobin found in human blood.`,
    questions: [
      { prompt: 'How many hearts does an octopus have?', choices: ['Three', 'One', 'Two', 'Four'], answer: 'Three' },
      { prompt: 'Why is octopus blood blue?', choices: ['It contains hemocyanin', 'It contains hemoglobin', 'It is mixed with ink', 'It has no oxygen'], answer: 'It contains hemocyanin' },
      { prompt: 'What do two of the hearts pump blood to?', choices: ['The gills', 'The tentacles', 'The eyes', 'The stomach'], answer: 'The gills' },
    ],
  },
  {
    text: `Bamboo is one of the fastest-growing plants on Earth, with some species growing up to 91 centimeters in a single day. Despite its rapid growth and woody appearance, bamboo is actually a type of grass. Its strength and flexibility make it a popular material for building houses, furniture, and even bicycles.`,
    questions: [
      { prompt: 'How fast can some bamboo species grow in a day?', choices: ['Up to 91 centimeters', 'Up to 10 centimeters', 'Up to 200 centimeters', 'Up to 1 centimeter'], answer: 'Up to 91 centimeters' },
      { prompt: 'What kind of plant is bamboo actually classified as?', choices: ['A type of grass', 'A type of tree', 'A type of vine', 'A type of fern'], answer: 'A type of grass' },
      { prompt: 'What is bamboo used to build, according to the passage?', choices: ['Houses, furniture, and bicycles', 'Only paper', 'Only baskets', 'Only toys'], answer: 'Houses, furniture, and bicycles' },
    ],
  },
  {
    text: `The Amazon Rainforest produces about 20 percent of the world's oxygen and is home to more than 10 percent of all known species on Earth. Often called the "lungs of the planet," it also plays a crucial role in regulating global rainfall patterns. Sadly, large areas of the rainforest are lost each year due to logging and farming.`,
    questions: [
      { prompt: 'What percentage of the world\'s oxygen does the Amazon produce?', choices: ['About 20 percent', 'About 5 percent', 'About 50 percent', 'About 90 percent'], answer: 'About 20 percent' },
      { prompt: 'What is the Amazon Rainforest often called?', choices: ['The lungs of the planet', 'The heart of the Earth', 'The world\'s garden', 'The green desert'], answer: 'The lungs of the planet' },
      { prompt: 'Why is the rainforest shrinking, according to the passage?', choices: ['Logging and farming', 'Volcanic eruptions', 'Too much rainfall', 'Cold weather'], answer: 'Logging and farming' },
    ],
  },
  {
    text: `Braille is a system of raised dots that allows blind and visually impaired people to read using their fingertips. It was invented by Louis Braille, who became blind at the age of three after an accident. He developed the system when he was just fifteen years old, and it is still used worldwide today.`,
    questions: [
      { prompt: 'Who invented the Braille system?', choices: ['Louis Braille', 'Louis Pasteur', 'Thomas Edison', 'Alexander Graham Bell'], answer: 'Louis Braille' },
      { prompt: 'How old was Louis Braille when he developed the system?', choices: ['Fifteen', 'Three', 'Twenty-five', 'Ten'], answer: 'Fifteen' },
      { prompt: 'How do people read using Braille?', choices: ['Using their fingertips to feel raised dots', 'Using their ears to listen', 'Using bright lights', 'Using large printed letters'], answer: 'Using their fingertips to feel raised dots' },
    ],
  },
  {
    text: `Chameleons are famous for their ability to change color, but this is not mainly for camouflage as many people believe. Scientists have found that chameleons change color largely to communicate their mood and to regulate their body temperature, since they cannot generate their own body heat like mammals do.`,
    questions: [
      { prompt: 'What is the main reason chameleons change color, according to the passage?', choices: ['To communicate mood and regulate temperature', 'To hide from every predator', 'To attract insects', 'To look more colorful'], answer: 'To communicate mood and regulate temperature' },
      { prompt: 'Why can\'t chameleons generate their own body heat?', choices: ['They are not mammals', 'They are too small', 'They live underwater', 'They eat only plants'], answer: 'They are not mammals' },
      { prompt: 'What common belief about chameleons does the passage correct?', choices: ['That they change color mainly for camouflage', 'That they can fly', 'That they live in water', 'That they are mammals'], answer: 'That they change color mainly for camouflage' },
    ],
  },
  {
    text: `The Wright brothers, Orville and Wilbur, achieved the first powered, controlled flight of an airplane on December 17, 1903, near Kitty Hawk, North Carolina. Their aircraft, the Wright Flyer, stayed airborne for just 12 seconds and traveled 120 feet, but it proved that sustained human flight was possible, changing transportation forever.`,
    questions: [
      { prompt: 'What were the names of the Wright brothers?', choices: ['Orville and Wilbur', 'Orville and William', 'Wilbur and Walter', 'Oscar and Wilbur'], answer: 'Orville and Wilbur' },
      { prompt: 'How long did the first flight stay airborne?', choices: ['12 seconds', '2 minutes', '1 hour', '30 seconds'], answer: '12 seconds' },
      { prompt: 'Where did the first flight take place?', choices: ['Near Kitty Hawk, North Carolina', 'In New York City', 'In Paris, France', 'In London, England'], answer: 'Near Kitty Hawk, North Carolina' },
    ],
  },
]

function genReadingComprehensionOlympiad() {
  const passage = pick(OLYMPIAD_PASSAGES)
  const q = pick(passage.questions)
  return {
    subtopicId: 'reading-comprehension-olympiad',
    type: 'mcq',
    passage: passage.text,
    prompt: q.prompt,
    choices: shuffle(q.choices),
    answer: q.answer,
    hint: `Re-read the passage above carefully — the answer is stated or clearly implied in the text.`,
  }
}

const ACHIEVERS_RIDDLES = [
  { prompt: 'I have keys but no locks, space but no rooms, and you can enter but not go outside. What am I?', answer: 'A keyboard', choices: ['A keyboard', 'A house', 'A car', 'A book'] },
  { prompt: 'The more you take, the more you leave behind. What am I?', answer: 'Footsteps', choices: ['Footsteps', 'Money', 'Time', 'Food'] },
  { prompt: 'What has a face and two hands but no arms or legs?', answer: 'A clock', choices: ['A clock', 'A doll', 'A robot', 'A statue'] },
  { prompt: 'What word becomes shorter when you add two letters to it?', answer: 'Short', choices: ['Short', 'Long', 'Tiny', 'Word'] },
  { prompt: 'What can travel around the world while staying in a corner?', answer: 'A stamp', choices: ['A stamp', 'A ball', 'A letter', 'A map'] },
  { prompt: 'What has to be broken before you can use it?', answer: 'An egg', choices: ['An egg', 'A rule', 'A promise', 'A window'] },
  { prompt: 'What gets wetter the more it dries?', answer: 'A towel', choices: ['A towel', 'A sponge', 'Rain', 'A cloud'] },
  { prompt: 'What has many teeth but cannot bite?', answer: 'A comb', choices: ['A comb', 'A saw', 'A zipper', 'A shark'] },
  { prompt: 'What begins with T, ends with T, and has T in it?', answer: 'A teapot', choices: ['A teapot', 'A ticket', 'A table', 'A tent'] },
  { prompt: 'What can you catch but not throw?', answer: 'A cold', choices: ['A cold', 'A ball', 'A fish', 'A fly'] },
  { prompt: 'What has one eye but cannot see?', answer: 'A needle', choices: ['A needle', 'A storm', 'A potato', 'A camera'] },
  { prompt: 'What runs but never walks, has a mouth but never talks?', answer: 'A river', choices: ['A river', 'A car', 'A clock', 'The wind'] },
  { prompt: 'What has a neck but no head?', answer: 'A bottle', choices: ['A bottle', 'A shirt', 'A guitar', 'A giraffe'] },
  { prompt: 'What building has the most stories?', answer: 'A library', choices: ['A library', 'A skyscraper', 'A school', 'A museum'] },
  { prompt: 'I shrink smaller every time I take a bath. What am I?', answer: 'Soap', choices: ['Soap', 'A sponge', 'A towel', 'Ice'] },
  { prompt: 'What has hands but cannot clap?', answer: 'A clock', choices: ['A clock', 'A statue', 'A puppet', 'A glove'] },
  { prompt: 'What kind of room has no doors or windows?', answer: 'A mushroom', choices: ['A mushroom', 'A basement', 'A tent', 'A cave'] },
  { prompt: 'What is full of holes but still holds water?', answer: 'A sponge', choices: ['A sponge', 'A net', 'A basket', 'A colander'] },
  { prompt: 'What has a bed but never sleeps?', answer: 'A river', choices: ['A river', 'A hospital', 'A hotel', 'A garden'] },
  { prompt: 'What can you break without touching it?', answer: 'A promise', choices: ['A promise', 'A window', 'A cup', 'A phone'] },
  { prompt: 'I am tall when I am young and short when I am old. What am I?', answer: 'A candle', choices: ['A candle', 'A tree', 'A person', 'A pencil'] },
  { prompt: 'What has a thumb and four fingers but is not alive?', answer: 'A glove', choices: ['A glove', 'A hand', 'A statue', 'A puppet'] },
  { prompt: 'What goes up but never comes down?', answer: 'Your age', choices: ['Your age', 'A balloon', 'A kite', 'Smoke'] },
  { prompt: 'What can fill a room but takes up no space?', answer: 'Light', choices: ['Light', 'Air', 'Sound', 'Smoke'] },
  { prompt: 'What has many rings but no fingers?', answer: 'A tree', choices: ['A tree', 'A phone', 'A bell', 'A circus'] },
]

function genAchieversEnglish() {
  const item = pick(ACHIEVERS_RIDDLES)
  return {
    subtopicId: 'achievers-english',
    type: 'mcq',
    prompt: item.prompt,
    choices: shuffle(item.choices),
    answer: item.answer,
    hint: `Think outside the box — this is a wordplay riddle, not a literal question.`,
  }
}

// ---------------------------------------------------------------------------
// REGISTRY — regular Grade 4 English syllabus
// ---------------------------------------------------------------------------
const ENGLISH_GENERATORS = {
  'english-nouns-pronouns': [genNounsPronouns],
  'english-verbs-tenses': [genVerbsTenses],
  'english-adjectives-adverbs': [genAdjectivesAdverbs],
  'english-sentence-structure': [genSentenceStructure],
  'english-vocabulary': [genVocabularySynonymsAntonyms],
  'english-punctuation': [genPunctuationCapitalization],
  'english-spelling': [genSpellingWordFormation],
  'english-reading-comprehension': [genReadingComprehension],
  'english-word-power': [genOneWordSubIdioms],
}

// ---------------------------------------------------------------------------
// REGISTRY — English Olympiad syllabus (individual per-topic fixed papers)
// ---------------------------------------------------------------------------
export const ENGLISH_OLYMPIAD_CHAPTER_GENERATORS = {
  synonyms: [genSynonymsOlympiad],
  antonyms: [genAntonymsOlympiad],
  'one-word-substitution': [genOneWordSubstitution],
  'spelling-word-formation-olympiad': [genSpellingWordFormation],
  'grammar-tenses': [genGrammarTenses],
  'grammar-articles-prepositions': [genGrammarArticlesPrepositions],
  'sentence-rearrangement': [genSentenceRearrangement],
  'idioms-phrases': [genIdiomsPhrases],
  'word-analogies': [genWordAnalogies],
  homophones: [genHomophones],
  'reading-comprehension-olympiad': [genReadingComprehensionOlympiad],
  'achievers-english': [genAchieversEnglish],
}

/**
 * Author-time generator for a fixed, non-randomized 25-question English
 * Olympiad "paper" for one syllabus chapter. Mirrors
 * mathEngine.generateOlympiadPaper — deduped by prompt text, meant to be
 * baked into a static file once (see scripts/gen-english-olympiad-bank.mjs).
 */
export function generateEnglishOlympiadPaper(chapterId, count = 25) {
  const pool = ENGLISH_OLYMPIAD_CHAPTER_GENERATORS[chapterId]
  if (!pool) return []
  const seen = new Set()
  const questions = []
  let idx = 0
  let guard = 0
  while (questions.length < count && guard < count * 40) {
    const generator = pool[idx % pool.length]
    idx += 1
    guard += 1
    const q = generator('hard')
    if (seen.has(q.prompt)) continue
    seen.add(q.prompt)
    questions.push({
      ...q,
      id: `english-olympiad-${chapterId}-${questions.length + 1}`,
      chapterId: `english-olympiad-${chapterId}`,
      difficulty: 'hard',
    })
  }
  return questions
}

const DIFFICULTY_TIERS = ['easy', 'medium', 'hard']

function difficultyForIndex(index, total) {
  const third = total / 3
  if (index < third) return 'easy'
  if (index < third * 2) return 'medium'
  return 'hard'
}

/**
 * Generate a randomized set of questions across the given chapter ids,
 * mixing difficulty tiers for a quick, varied practice session.
 */
export function generateEnglishQuestions(chapterIds, count = 12) {
  const validChapters = chapterIds.filter((id) => ENGLISH_GENERATORS[id])
  if (validChapters.length === 0) return []
  const questions = []
  for (let i = 0; i < count; i++) {
    const chapterId = validChapters[i % validChapters.length]
    const generatorPool = ENGLISH_GENERATORS[chapterId]
    const generator = pick(generatorPool)
    const difficulty = pick(DIFFICULTY_TIERS)
    const q = generator(difficulty)
    questions.push({ ...q, id: uid(), chapterId, difficulty })
  }
  return shuffle(questions)
}

/**
 * Generate a deep-practice session for a single English chapter: simple ->
 * advanced, cycling evenly through the chapter's generators.
 */
export function generateEnglishChapterPractice(chapterId, count = 25) {
  const pool = ENGLISH_GENERATORS[chapterId]
  if (!pool) return []
  const questions = []
  for (let i = 0; i < count; i++) {
    const difficulty = difficultyForIndex(i, count)
    const generator = pool[i % pool.length]
    const q = generator(difficulty)
    questions.push({ ...q, id: uid(), chapterId, difficulty })
  }
  return questions
}
