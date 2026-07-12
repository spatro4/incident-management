// Singapore Math — Grade 4 curriculum map
// Organized using Concrete-Pictorial-Abstract (CPA) progression.
import {
  Hash,
  PieChart,
  Percent,
  Shapes,
  BarChart3,
  Blocks,
} from 'lucide-react'

export const CHAPTERS = [
  {
    id: 'place-value',
    order: 1,
    title: 'Place Value & Whole Numbers',
    short: 'Place Value',
    icon: 'Hash',
    color: 'candy.blue',
    gradient: 'from-sky-400 to-blue-500',
    description: 'Numbers up to 100,000, rounding, factors & multiples.',
    subtopics: [
      { id: 'reading-numbers', label: 'Reading & writing numbers to 100,000' },
      { id: 'rounding', label: 'Rounding to nearest 10, 100, 1000' },
      { id: 'factors-multiples', label: 'Factors & multiples' },
    ],
  },
  {
    id: 'fractions',
    order: 2,
    title: 'Fractions',
    short: 'Fractions',
    icon: 'PieChart',
    color: 'candy.purple',
    gradient: 'from-purple-400 to-fuchsia-500',
    description: 'Equivalent fractions, add/subtract fractions, mixed numbers.',
    subtopics: [
      { id: 'equivalent-fractions', label: 'Equivalent fractions' },
      { id: 'add-sub-fractions', label: 'Adding & subtracting fractions' },
      { id: 'mixed-numbers', label: 'Mixed numbers & improper fractions' },
    ],
  },
  {
    id: 'decimals',
    order: 3,
    title: 'Decimals',
    short: 'Decimals',
    icon: 'Percent',
    color: 'candy.teal',
    gradient: 'from-teal-400 to-emerald-500',
    description: 'Tenths, hundredths, fraction conversion, four operations.',
    subtopics: [
      { id: 'tenths-hundredths', label: 'Tenths & hundredths' },
      { id: 'decimal-fraction-conversion', label: 'Converting decimals & fractions' },
      { id: 'decimal-operations', label: 'Adding, subtracting, multiplying decimals' },
    ],
  },
  {
    id: 'geometry',
    order: 4,
    title: 'Geometry',
    short: 'Geometry',
    icon: 'Shapes',
    color: 'candy.orange',
    gradient: 'from-orange-400 to-amber-500',
    description: 'Angles, perpendicular/parallel lines, area & perimeter of composite figures.',
    subtopics: [
      { id: 'angles', label: 'Measuring & classifying angles' },
      { id: 'lines', label: 'Perpendicular & parallel lines' },
      { id: 'area-perimeter', label: 'Area & perimeter of composite figures' },
    ],
  },
  {
    id: 'data',
    order: 5,
    title: 'Bar Graphs, Line Graphs & Data',
    short: 'Data & Graphs',
    icon: 'BarChart3',
    color: 'candy.pink',
    gradient: 'from-pink-400 to-rose-500',
    description: 'Reading & interpreting bar graphs, line graphs, and data sets.',
    subtopics: [
      { id: 'bar-graphs', label: 'Reading bar graphs' },
      { id: 'line-graphs', label: 'Reading line graphs' },
      { id: 'data-analysis', label: 'Analyzing & comparing data' },
    ],
  },
  {
    id: 'word-problems',
    order: 6,
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

export const CHAPTER_ICONS = {
  Hash,
  PieChart,
  Percent,
  Shapes,
  BarChart3,
  Blocks,
}

export const getChapterById = (id) => CHAPTERS.find((c) => c.id === id)

export const BADGES = [
  { id: 'first-steps', label: 'First Steps', description: 'Complete your first quest', icon: '🌱', condition: (s) => s.totalQuestsCompleted >= 1 },
  { id: 'streak-3', label: 'On Fire', description: '3-day streak', icon: '🔥', condition: (s) => s.streak >= 3 },
  { id: 'streak-7', label: 'Unstoppable', description: '7-day streak', icon: '⚡', condition: (s) => s.streak >= 7 },
  { id: 'point-collector', label: 'Point Collector', description: 'Earn 500 Math Points', icon: '💎', condition: (s) => s.points >= 500 },
  { id: 'point-master', label: 'Math Master', description: 'Earn 2000 Math Points', icon: '👑', condition: (s) => s.points >= 2000 },
  { id: 'perfect-score', label: 'Perfectionist', description: 'Score 100% on a quest', icon: '🌟', condition: (s) => s.hasPerfectScore },
  { id: 'all-rounder', label: 'All-Rounder', description: 'Practice every chapter at least once', icon: '🏆', condition: (s) => s.chaptersTried >= CHAPTERS.length },
  { id: 'level-5', label: 'Rising Star', description: 'Reach Level 5', icon: '🚀', condition: (s) => s.level >= 5 },
]

export const LEVEL_XP_STEP = 200 // XP required per level
export const XP_PER_CORRECT = 10
export const XP_PER_QUEST_BONUS = 20
