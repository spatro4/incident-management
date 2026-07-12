import { useState } from 'react'
import { Rocket, Sparkles, Trophy } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { generateQuestions, generateChapterPractice } from '../../utils/mathEngine'
import { CHAPTERS, BADGES, CHAPTER_PRACTICE_LENGTH, getChapterById } from '../../data/curriculum'
import { OLYMPIAD_BANK } from '../../data/olympiadBank'
import ChapterSelect from './ChapterSelect'
import QuizRunner from './QuizRunner'
import Results from './Results'

const QUESTION_COUNT = 12

function loadQuestionsFor(chapterIds) {
  if (chapterIds.length === 1) {
    const chapter = getChapterById(chapterIds[0])
    if (chapter?.level === 'olympiad') {
      return OLYMPIAD_BANK[chapter.sourceId] || []
    }
    return generateChapterPractice(chapterIds[0], CHAPTER_PRACTICE_LENGTH)
  }
  return generateQuestions(chapterIds, QUESTION_COUNT)
}

export default function DailyQuest({ onDone, initialChapterId }) {
  const { state, isAssignedToday, submitQuestResult } = useApp()
  const forcedChapters = isAssignedToday ? state.assignments.assignedChapters : []
  const lockedChapters = state.assignments.lockedChapters || []

  const [step, setStep] = useState(initialChapterId ? 'quiz' : 'select')
  const [selected, setSelected] = useState(
    initialChapterId
      ? [initialChapterId]
      : forcedChapters.length > 0
        ? forcedChapters
        : CHAPTERS.slice(0, 2).map((c) => c.id)
  )
  const [questions, setQuestions] = useState(() => (initialChapterId ? loadQuestionsFor([initialChapterId]) : []))
  const [summary, setSummary] = useState(null)
  const [newBadges, setNewBadges] = useState([])

  const activeChapter = selected.length === 1 ? getChapterById(selected[0]) : null
  const isOlympiadSelection = activeChapter?.level === 'olympiad'

  const toggleChapter = (id) => {
    if (forcedChapters.includes(id)) return
    if (lockedChapters.includes(id)) return
    const chapter = getChapterById(id)
    const isOlympiad = chapter?.level === 'olympiad'
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id)
      // Olympiad challenge papers are always taken solo, never mixed with
      // other chapters — picking one replaces the current selection, and
      // picking a regular chapter drops any previously selected paper.
      if (isOlympiad) return [id]
      const withoutOlympiad = prev.filter((c) => getChapterById(c)?.level !== 'olympiad')
      return [...withoutOlympiad, id]
    })
  }

  const start = () => {
    if (selected.length === 0) return
    setQuestions(loadQuestionsFor(selected))
    setStep('quiz')
  }

  const handleComplete = (result) => {
    const prevBadges = new Set(state.student.badges)
    submitQuestResult(result)
    // badges are recomputed synchronously inside recordQuestResult; we approximate
    // by checking which badges *would* now be satisfied based on updated totals.
    const updatedPoints = state.student.points + result.xpEarned + (result.correct === result.total && result.total > 0 ? 20 : 0)
    const updatedStreak = state.student.streak // streak logic handled in storage; badge diff best-effort
    const mergedChaptersTried = Array.from(new Set([...state.student.chaptersTried, ...result.chapterIds]))
    const probableUnlocked = BADGES.filter((b) => !prevBadges.has(b.id) && b.condition({
      ...state.student,
      points: updatedPoints,
      streak: updatedStreak + 1,
      totalQuestsCompleted: state.student.totalQuestsCompleted + 1,
      hasPerfectScore: state.student.hasPerfectScore || (result.correct === result.total && result.total > 0),
      chaptersTried: mergedChaptersTried,
      chaptersTriedCount: mergedChaptersTried.length,
      level: Math.floor(updatedPoints / 200) + 1,
    }))
    setNewBadges(probableUnlocked)
    setSummary(result)
    setStep('results')
  }

  if (step === 'quiz') {
    return (
      <QuizRunner
        questions={questions}
        mode={isAssignedToday ? 'exam' : isOlympiadSelection ? 'olympiad' : 'quest'}
        onComplete={handleComplete}
        onExit={() => setStep('select')}
      />
    )
  }

  if (step === 'results' && summary) {
    return (
      <Results
        summary={summary}
        newBadges={newBadges}
        onRetry={() => setStep('select')}
        onHome={onDone}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={`card-playful p-6 mb-4 text-white ${
          isOlympiadSelection ? 'bg-gradient-to-br from-slate-800 to-slate-950' : 'bg-gradient-to-br from-indigo-500 to-purple-500'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-2xl">
            {isOlympiadSelection ? <Trophy size={28} /> : <Rocket size={28} />}
          </div>
          <div>
            <h2 className="font-display text-xl font-extrabold">
              {isAssignedToday ? "Today's Assigned Quest" : isOlympiadSelection ? 'Olympiad Challenge Paper' : 'Daily Quest'}
            </h2>
            <p className="text-white/80 text-sm">
              {isAssignedToday
                ? 'Your teacher picked these chapters for you today. Complete them all!'
                : isOlympiadSelection
                  ? 'A fixed 25-question challenge paper at real competition difficulty. Same questions every attempt.'
                  : `Pick a single chapter for a ${CHAPTER_PRACTICE_LENGTH}-question deep practice (simple to advanced), or a few chapters for a quick ${QUESTION_COUNT}-question mix.`}
            </p>
          </div>
        </div>
      </div>

      <ChapterSelect
        selected={selected}
        onToggle={toggleChapter}
        lockedChapters={lockedChapters}
        forcedChapters={forcedChapters}
      />

      <button
        onClick={start}
        disabled={selected.length === 0}
        className={`btn-chunky w-full mt-5 text-white py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 ${
          isOlympiadSelection ? 'bg-slate-800' : 'bg-candy-green'
        }`}
      >
        <Sparkles size={20} />
        {isOlympiadSelection ? 'Start Challenge Paper (25 Questions)' : `Start Quest (${selected.length === 1 ? CHAPTER_PRACTICE_LENGTH : QUESTION_COUNT} Questions)`}
      </button>
    </div>
  )
}
