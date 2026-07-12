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
}

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
    description: 'Numbers to 100,000, rounding, and estimation.',
    subtopics: [
      { id: 'numbers-to-100000', label: 'Numbers to 100,000' },
      { id: 'rounding-estimation', label: 'Rounding and Estimation' },
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
    description: 'Factors and common factors, multiples and common multiples, prime and composite numbers.',
    subtopics: [
      { id: 'factors-common-factors', label: 'Factors and Common Factors' },
      { id: 'multiples-common-multiples', label: 'Multiples and Common Multiples' },
      { id: 'prime-composite', label: 'Prime and Composite Numbers' },
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
    description: 'Angles and protractor use, perpendicular and parallel lines, squares and rectangles, symmetry.',
    subtopics: [
      { id: 'angles-protractor', label: 'Angles and Protractor Use' },
      { id: 'perpendicular-parallel', label: 'Perpendicular and Parallel Lines' },
      { id: 'squares-rectangles', label: 'Squares and Rectangles' },
      { id: 'symmetry', label: 'Symmetry' },
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
    description: 'Perimeter of squares and rectangles, area of squares and rectangles, area of composite figures.',
    subtopics: [
      { id: 'perimeter-squares-rectangles', label: 'Perimeter of Squares and Rectangles' },
      { id: 'area-squares-rectangles', label: 'Area of Squares and Rectangles' },
      { id: 'area-composite', label: 'Area of Composite Figures' },
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
    description: 'Reading tables and bar graphs, and line graphs.',
    subtopics: [
      { id: 'tables-bar-graphs', label: 'Tables and Bar Graphs' },
      { id: 'line-graphs', label: 'Line Graphs' },
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
  {
    id: 'olympiad',
    level: 'bonus',
    order: 11,
    title: 'Math Olympiad Prep',
    short: 'Olympiad Prep',
    icon: 'Trophy',
    color: 'candy.yellow',
    gradient: 'from-amber-400 to-yellow-500',
    description: 'Challenge problems covering the topics most often seen in Grade 4 math competitions (SASMO, Math Kangaroo, and similar): patterns, logic, number theory, geometry, counting, and word problems.',
    subtopics: [
      { id: 'patterns-sequences', label: 'Number patterns & sequences' },
      { id: 'logic-puzzles', label: 'Logic puzzles & digit riddles' },
      { id: 'number-theory-puzzles', label: 'Number theory puzzles' },
      { id: 'geometry-spatial', label: 'Geometry & spatial reasoning' },
      { id: 'combinatorics-counting', label: 'Combinatorics & counting' },
      { id: 'competition-problems', label: 'Competition-style word problems' },
    ],
  },
]

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
}

export const getChapterById = (id) => CHAPTERS.find((c) => c.id === id)

export const chaptersByLevel = (level) => CHAPTERS.filter((c) => c.level === level)

export const BADGES = [
  { id: 'first-steps', label: 'First Steps', description: 'Complete your first quest', icon: '🌱', condition: (s) => s.totalQuestsCompleted >= 1 },
  { id: 'streak-3', label: 'On Fire', description: '3-day streak', icon: '🔥', condition: (s) => s.streak >= 3 },
  { id: 'streak-7', label: 'Unstoppable', description: '7-day streak', icon: '⚡', condition: (s) => s.streak >= 7 },
  { id: 'point-collector', label: 'Point Collector', description: 'Earn 500 Math Points', icon: '💎', condition: (s) => s.points >= 500 },
  { id: 'point-master', label: 'Math Master', description: 'Earn 2000 Math Points', icon: '👑', condition: (s) => s.points >= 2000 },
  { id: 'perfect-score', label: 'Perfectionist', description: 'Score 100% on a quest', icon: '🌟', condition: (s) => s.hasPerfectScore },
  { id: 'all-rounder', label: 'All-Rounder', description: 'Practice every chapter at least once', icon: '🏆', condition: (s) => s.chaptersTriedCount >= CHAPTERS.length },
  { id: 'level-5', label: 'Rising Star', description: 'Reach Level 5', icon: '🚀', condition: (s) => s.level >= 5 },
  { id: 'olympiad-challenger', label: 'Olympiad Challenger', description: 'Try a Math Olympiad Prep quest', icon: '🥇', condition: (s) => (s.chaptersTried || []).includes('olympiad') },
]

export const LEVEL_XP_STEP = 200 // XP required per level
export const XP_PER_CORRECT = 10
export const XP_PER_QUEST_BONUS = 20
