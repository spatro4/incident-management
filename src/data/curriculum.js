// Singapore Math — Primary 4 curriculum map (Level 4A + 4B), plus bonus
// enrichment chapters. Organized using Concrete-Pictorial-Abstract (CPA)
// progression.
import {
  Hash,
  Grid3x3,
  Calculator,
  PieChart,
  Percent,
  Sigma,
  Shapes,
  Ruler,
  BarChart3,
  Blocks,
  Trophy,
  Brain,
  Award,
  Repeat,
  Shuffle,
  Binary,
  FlipHorizontal2,
  ListOrdered,
  Compass,
  Scale,
  CalendarClock,
  Coins,
} from 'lucide-react'

export const DIFFICULTIES = ['easy', 'medium', 'hard']

export const DIFFICULTY_LABELS = {
  easy: 'Simple',
  medium: 'Medium',
  hard: 'Advanced',
}

export const CHAPTER_PRACTICE_LENGTH = 25

export const LEVELS = {
  '4A': 'Level 4A',
  '4B': 'Level 4B',
  bonus: 'Bonus Practice',
  olympiad: '🏆 Olympiad Syllabus — Challenge Papers',
}

// Fixed 25-question Olympiad "papers", one per individual topic in the
// official Grade 4 Olympiad syllabus (16 topics, plus a bonus Achievers
// Section of higher-order-thinking problems). Unlike the regular syllabus
// chapters above, these do not use the random question generator: they're
// static, curated, uniformly hard/advanced sets with a stable answer key
// (see src/data/olympiadBank.js). This keeps a clear line between the
// Grade 4 syllabus (practiced with fresh random questions every time) and
// the Olympiad syllabus (fixed challenge papers, same 25 questions and
// answers every attempt).
export const OLYMPIAD_CHAPTERS = [
  {
    sourceId: 'patterns-series',
    title: 'Patterns and Series',
    icon: 'Repeat',
    gradient: 'from-slate-700 to-slate-900',
    description: '25 fixed, competition-level questions on number and shape patterns and series.',
    subtopics: [{ id: 'patterns-sequences', label: 'Patterns and Series' }],
  },
  {
    sourceId: 'analogy-classification',
    title: 'Analogy and Classification',
    icon: 'Shuffle',
    gradient: 'from-slate-700 to-slate-900',
    description: '25 fixed, competition-level questions on number/word analogies and odd-one-out classification.',
    subtopics: [{ id: 'analogy-classification', label: 'Analogy and Classification' }],
  },
  {
    sourceId: 'coding-decoding',
    title: 'Coding-Decoding',
    icon: 'Binary',
    gradient: 'from-slate-700 to-slate-900',
    description: '25 fixed, competition-level letter/number coding-decoding puzzles.',
    subtopics: [{ id: 'coding-decoding', label: 'Coding-Decoding' }],
  },
  {
    sourceId: 'mirror-embedded-figures',
    title: 'Mirror Images and Embedded Figures',
    icon: 'FlipHorizontal2',
    gradient: 'from-slate-700 to-slate-900',
    description: '25 fixed, competition-level mirror-image and embedded/hidden-figure questions.',
    subtopics: [{ id: 'mirror-embedded-figures', label: 'Mirror Images and Embedded Figures' }],
  },
  {
    sourceId: 'alphabet-ranking',
    title: 'Alphabet and Ranking Test',
    icon: 'ListOrdered',
    gradient: 'from-slate-700 to-slate-900',
    description: '25 fixed, competition-level alphabet-order and ranking/position puzzles.',
    subtopics: [{ id: 'alphabet-ranking', label: 'Alphabet and Ranking Test' }],
  },
  {
    sourceId: 'direction-sense',
    title: 'Direction Sense Test',
    icon: 'Compass',
    gradient: 'from-slate-700 to-slate-900',
    description: '25 fixed, competition-level direction-and-distance reasoning questions.',
    subtopics: [{ id: 'direction-sense', label: 'Direction Sense Test' }],
  },
  {
    sourceId: 'number-system-sense',
    title: 'Number System and Number Sense',
    icon: 'Hash',
    gradient: 'from-slate-700 to-slate-900',
    description: '25 fixed, competition-level questions on large numbers, place value, rounding, and prime/composite numbers.',
    subtopics: [
      { id: 'numbers-to-100000', label: 'Number System and Number Sense' },
      { id: 'prime-composite', label: 'Number System and Number Sense' },
      { id: 'rounding-estimation', label: 'Number System and Number Sense' },
      { id: 'whole-numbers-word-problems', label: 'Number System and Number Sense' },
    ],
  },
  {
    sourceId: 'factors-multiples-olympiad',
    title: 'Factors and Multiples',
    icon: 'Grid3x3',
    gradient: 'from-slate-700 to-slate-900',
    description: '25 fixed, competition-level questions on factors, common factors, multiples, common multiples, and number theory.',
    subtopics: [
      { id: 'factors-common-factors', label: 'Factors and Multiples' },
      { id: 'multiples-common-multiples', label: 'Factors and Multiples' },
      { id: 'number-theory-puzzles', label: 'Factors and Multiples' },
      { id: 'factors-multiples-word-problems', label: 'Factors and Multiples' },
    ],
  },
  {
    sourceId: 'computation-operations',
    title: 'Computation Operations',
    icon: 'Calculator',
    gradient: 'from-slate-700 to-slate-900',
    description: '25 fixed, competition-level mixed +, -, ×, ÷ computation and BODMAS-style questions.',
    subtopics: [
      { id: 'computation-operations', label: 'Computation Operations' },
      { id: 'multiply-2digit', label: 'Computation Operations' },
      { id: 'divide-1digit', label: 'Computation Operations' },
      { id: 'word-problems-multdiv', label: 'Computation Operations' },
    ],
  },
  {
    sourceId: 'fractions-decimals-olympiad',
    title: 'Fractions and Decimals',
    icon: 'PieChart',
    gradient: 'from-slate-700 to-slate-900',
    description: '25 fixed, competition-level questions spanning mixed numbers, unlike fractions, and decimal place value/comparison.',
    subtopics: [
      { id: 'mixed-improper', label: 'Fractions and Decimals' },
      { id: 'comparing-ordering-fractions', label: 'Fractions and Decimals' },
      { id: 'add-sub-unlike', label: 'Fractions and Decimals' },
      { id: 'tenths-hundredths-thousandths', label: 'Fractions and Decimals' },
      { id: 'comparing-ordering-decimals', label: 'Fractions and Decimals' },
      { id: 'word-problems-fractions', label: 'Fractions and Decimals' },
      { id: 'word-problems-decimals', label: 'Fractions and Decimals' },
    ],
  },
  {
    sourceId: 'measurement',
    title: 'Measurement',
    icon: 'Scale',
    gradient: 'from-slate-700 to-slate-900',
    description: '25 fixed, competition-level questions on units of length, mass, volume, and conversions.',
    subtopics: [{ id: 'measurement', label: 'Measurement' }],
  },
  {
    sourceId: 'time-calendar',
    title: 'Time and Calendar',
    icon: 'CalendarClock',
    gradient: 'from-slate-700 to-slate-900',
    description: '25 fixed, competition-level questions on time elapsed, clocks, and calendar reasoning.',
    subtopics: [{ id: 'time-calendar', label: 'Time and Calendar' }],
  },
  {
    sourceId: 'money',
    title: 'Money',
    icon: 'Coins',
    gradient: 'from-slate-700 to-slate-900',
    description: '25 fixed, competition-level questions on money computations, change, and word problems.',
    subtopics: [{ id: 'money', label: 'Money' }],
  },
  {
    sourceId: 'geometry-olympiad',
    title: 'Geometry',
    icon: 'Shapes',
    gradient: 'from-slate-700 to-slate-900',
    description: '25 fixed, competition-level questions on angles, lines, squares/rectangles, symmetry, and spatial reasoning.',
    subtopics: [
      { id: 'angles-protractor', label: 'Geometry' },
      { id: 'perpendicular-parallel', label: 'Geometry' },
      { id: 'squares-rectangles', label: 'Geometry' },
      { id: 'symmetry', label: 'Geometry' },
      { id: 'geometry-spatial', label: 'Geometry' },
      { id: 'geometry-word-problems', label: 'Geometry' },
    ],
  },
  {
    sourceId: 'perimeter-area-olympiad',
    title: 'Perimeter and Area',
    icon: 'Ruler',
    gradient: 'from-slate-700 to-slate-900',
    description: '25 fixed, competition-level questions on perimeter, area, and composite-figure area.',
    subtopics: [
      { id: 'perimeter-squares-rectangles', label: 'Perimeter and Area' },
      { id: 'area-squares-rectangles', label: 'Perimeter and Area' },
      { id: 'area-composite', label: 'Perimeter and Area' },
      { id: 'perimeter-area-word-problems', label: 'Perimeter and Area' },
    ],
  },
  {
    sourceId: 'data-handling',
    title: 'Data Handling',
    icon: 'BarChart3',
    gradient: 'from-slate-700 to-slate-900',
    description: '25 fixed, competition-level questions on tables, bar graphs, line graphs, and counting/combinatorics.',
    subtopics: [
      { id: 'tables-bar-graphs', label: 'Data Handling' },
      { id: 'line-graphs', label: 'Data Handling' },
      { id: 'combinatorics-counting', label: 'Data Handling' },
      { id: 'data-handling-word-problems', label: 'Data Handling' },
    ],
  },
  {
    sourceId: 'achievers',
    title: 'Achievers Section',
    icon: 'Award',
    gradient: 'from-slate-700 to-slate-900',
    description: '25 fixed, extra-hard Higher-Order Thinking Skills (HOTs) questions — the toughest section, mixing everything above.',
    subtopics: [{ id: 'competition-problems', label: 'Higher-Order Thinking Skills (HOTs)' }, { id: 'logic-puzzles', label: 'Higher-Order Thinking Skills (HOTs)' }],
  },
].map((c, i) => ({
  id: `olympiad-${c.sourceId}`,
  sourceId: c.sourceId,
  level: 'olympiad',
  order: 100 + i,
  title: c.title,
  short: c.title,
  icon: c.icon,
  color: 'candy.yellow',
  gradient: c.gradient,
  description: c.description,
  subtopics: c.subtopics,
}))

export const CHAPTERS = [
  // ---------------------------------------------------------------------
  // LEVEL 4A
  // ---------------------------------------------------------------------
  {
    id: 'whole-numbers',
    level: '4A',
    order: 1,
    title: 'Whole Numbers',
    short: 'Whole Numbers',
    icon: 'Hash',
    color: 'candy.blue',
    gradient: 'from-sky-400 to-blue-500',
    description: 'Numbers to 100,000, rounding, estimation, and word problems.',
    subtopics: [
      { id: 'numbers-to-100000', label: 'Numbers to 100,000' },
      { id: 'rounding-estimation', label: 'Rounding and Estimation' },
      { id: 'whole-numbers-word-problems', label: 'Word Problems' },
    ],
  },
  {
    id: 'factors-multiples',
    level: '4A',
    order: 2,
    title: 'Multiples and Factors',
    short: 'Multiples & Factors',
    icon: 'Grid3x3',
    color: 'candy.teal',
    gradient: 'from-teal-400 to-cyan-500',
    description: 'Factors and common factors, multiples and common multiples, prime and composite numbers, and word problems.',
    subtopics: [
      { id: 'factors-common-factors', label: 'Factors and Common Factors' },
      { id: 'multiples-common-multiples', label: 'Multiples and Common Multiples' },
      { id: 'prime-composite', label: 'Prime and Composite Numbers' },
      { id: 'factors-multiples-word-problems', label: 'Word Problems' },
    ],
  },
  {
    id: 'multiplication-division',
    level: '4A',
    order: 3,
    title: 'Multiplication and Division',
    short: 'Mult. & Division',
    icon: 'Calculator',
    color: 'candy.orange',
    gradient: 'from-orange-400 to-red-400',
    description: 'Multiplying by a 2-digit number, dividing by a 1-digit number, and word problems.',
    subtopics: [
      { id: 'multiply-2digit', label: 'Multiplying by a 2-Digit Number' },
      { id: 'divide-1digit', label: 'Dividing by a 1-Digit Number' },
      { id: 'word-problems-multdiv', label: 'Word Problems' },
    ],
  },
  {
    id: 'fractions',
    level: '4A',
    order: 4,
    title: 'Fractions',
    short: 'Fractions',
    icon: 'PieChart',
    color: 'candy.purple',
    gradient: 'from-purple-400 to-fuchsia-500',
    description: 'Mixed numbers, comparing and ordering, unlike fractions, fraction of a set, and word problems.',
    subtopics: [
      { id: 'mixed-improper', label: 'Mixed Numbers and Improper Fractions' },
      { id: 'comparing-ordering-fractions', label: 'Comparing and Ordering Fractions' },
      { id: 'add-sub-unlike', label: 'Adding and Subtracting Unlike Fractions' },
      { id: 'fraction-of-set', label: 'Fraction of a Set' },
      { id: 'word-problems-fractions', label: 'Word Problems' },
    ],
  },

  // ---------------------------------------------------------------------
  // LEVEL 4B
  // ---------------------------------------------------------------------
  {
    id: 'decimals',
    level: '4B',
    order: 5,
    title: 'Decimals',
    short: 'Decimals',
    icon: 'Percent',
    color: 'candy.teal',
    gradient: 'from-teal-400 to-emerald-500',
    description: 'Tenths, hundredths, and thousandths; comparing and ordering; rounding decimals.',
    subtopics: [
      { id: 'tenths-hundredths-thousandths', label: 'Tenths, Hundredths, and Thousandths' },
      { id: 'comparing-ordering-decimals', label: 'Comparing and Ordering Decimals' },
      { id: 'rounding-decimals', label: 'Rounding Decimals' },
    ],
  },
  {
    id: 'decimal-operations',
    level: '4B',
    order: 6,
    title: 'Decimals Operations',
    short: 'Decimal Ops',
    icon: 'Sigma',
    color: 'candy.green',
    gradient: 'from-emerald-400 to-lime-500',
    description: 'Adding and subtracting decimals, multiplying and dividing decimals, and word problems.',
    subtopics: [
      { id: 'add-sub-decimals', label: 'Adding and Subtracting Decimals' },
      { id: 'multiply-divide-decimals', label: 'Multiplying and Dividing Decimals' },
      { id: 'word-problems-decimals', label: 'Word Problems' },
    ],
  },
  {
    id: 'geometry',
    level: '4B',
    order: 7,
    title: 'Geometry',
    short: 'Geometry',
    icon: 'Shapes',
    color: 'candy.orange',
    gradient: 'from-orange-400 to-amber-500',
    description: 'Angles and protractor use, perpendicular and parallel lines, squares and rectangles, symmetry, and word problems.',
    subtopics: [
      { id: 'angles-protractor', label: 'Angles and Protractor Use' },
      { id: 'perpendicular-parallel', label: 'Perpendicular and Parallel Lines' },
      { id: 'squares-rectangles', label: 'Squares and Rectangles' },
      { id: 'symmetry', label: 'Symmetry' },
      { id: 'geometry-word-problems', label: 'Word Problems' },
    ],
  },
  {
    id: 'perimeter-area',
    level: '4B',
    order: 8,
    title: 'Perimeter and Area',
    short: 'Perimeter & Area',
    icon: 'Ruler',
    color: 'candy.blue',
    gradient: 'from-blue-400 to-indigo-500',
    description: 'Perimeter of squares and rectangles, area of squares and rectangles, area of composite figures, and word problems.',
    subtopics: [
      { id: 'perimeter-squares-rectangles', label: 'Perimeter of Squares and Rectangles' },
      { id: 'area-squares-rectangles', label: 'Area of Squares and Rectangles' },
      { id: 'area-composite', label: 'Area of Composite Figures' },
      { id: 'perimeter-area-word-problems', label: 'Word Problems' },
    ],
  },
  {
    id: 'data-analysis',
    level: '4B',
    order: 9,
    title: 'Data Analysis',
    short: 'Data Analysis',
    icon: 'BarChart3',
    color: 'candy.pink',
    gradient: 'from-pink-400 to-rose-500',
    description: 'Reading tables and bar graphs, line graphs, and word problems.',
    subtopics: [
      { id: 'tables-bar-graphs', label: 'Tables and Bar Graphs' },
      { id: 'line-graphs', label: 'Line Graphs' },
      { id: 'data-handling-word-problems', label: 'Word Problems' },
    ],
  },

  // ---------------------------------------------------------------------
  // BONUS PRACTICE
  // ---------------------------------------------------------------------
  {
    id: 'word-problems',
    level: 'bonus',
    order: 10,
    title: 'Word Problems (Bar Modeling)',
    short: 'Word Problems',
    icon: 'Blocks',
    color: 'candy.yellow',
    gradient: 'from-yellow-400 to-orange-400',
    description: 'Singapore Math bar modeling method for word problems.',
    subtopics: [
      { id: 'part-whole', label: 'Part-whole models' },
      { id: 'comparison', label: 'Comparison models' },
      { id: 'multi-step', label: 'Multi-step problems' },
    ],
  },
]

CHAPTERS.push(...OLYMPIAD_CHAPTERS)

export const CHAPTER_ICONS = {
  Hash,
  Grid3x3,
  Calculator,
  PieChart,
  Percent,
  Sigma,
  Shapes,
  Ruler,
  BarChart3,
  Blocks,
  Trophy,
  Brain,
  Award,
  Repeat,
  Shuffle,
  Binary,
  FlipHorizontal2,
  ListOrdered,
  Compass,
  Scale,
  CalendarClock,
  Coins,
}

export const getChapterById = (id) => CHAPTERS.find((c) => c.id === id)

export const chaptersByLevel = (level) => CHAPTERS.filter((c) => c.level === level)

const CORE_SYLLABUS_CHAPTER_COUNT = CHAPTERS.filter((c) => c.level === '4A' || c.level === '4B').length

export const BADGES = [
  { id: 'first-steps', label: 'First Steps', description: 'Complete your first quest', icon: '🌱', condition: (s) => s.totalQuestsCompleted >= 1 },
  { id: 'streak-3', label: 'On Fire', description: '3-day streak', icon: '🔥', condition: (s) => s.streak >= 3 },
  { id: 'streak-7', label: 'Unstoppable', description: '7-day streak', icon: '⚡', condition: (s) => s.streak >= 7 },
  { id: 'point-collector', label: 'Point Collector', description: 'Earn 500 Math Points', icon: '💎', condition: (s) => s.points >= 500 },
  { id: 'point-master', label: 'Math Master', description: 'Earn 2000 Math Points', icon: '👑', condition: (s) => s.points >= 2000 },
  { id: 'perfect-score', label: 'Perfectionist', description: 'Score 100% on a quest', icon: '🌟', condition: (s) => s.hasPerfectScore },
  { id: 'all-rounder', label: 'All-Rounder', description: 'Practice every Grade 4 syllabus chapter at least once', icon: '🏆', condition: (s) => s.chaptersTriedCount >= CORE_SYLLABUS_CHAPTER_COUNT },
  { id: 'level-5', label: 'Rising Star', description: 'Reach Level 5', icon: '🚀', condition: (s) => s.level >= 5 },
  { id: 'olympiad-challenger', label: 'Olympiad Challenger', description: 'Attempt an Olympiad Syllabus challenge paper', icon: '🥇', condition: (s) => (s.chaptersTried || []).some((id) => id.startsWith('olympiad-')) },
]

export const LEVEL_XP_STEP = 200 // XP required per level
export const XP_PER_CORRECT = 10
export const XP_PER_QUEST_BONUS = 20
