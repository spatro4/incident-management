import { useMemo, useState } from 'react'
import { Rocket, Sparkles } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { generateQuestions } from '../../utils/mathEngine'
import { CHAPTERS, BADGES } from '../../data/curriculum'
import ChapterSelect from './ChapterSelect'
import QuizRunner from './QuizRunner'
import Results from './Results'

const QUESTION_COUNT = 12

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
  const [questions, setQuestions] = useState(() =>
    initialChapterId ? generateQuestions([initialChapterId], QUESTION_COUNT) : []
  )
  const [summary, setSummary] = useState(null)
  const [newBadges, setNewBadges] = useState([])

  const toggleChapter = (id) => {
    if (forcedChapters.includes(id)) return
    if (lockedChapters.includes(id)) return
    setSelected((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  const start = () => {
    if (selected.length === 0) return
    setQuestions(generateQuestions(selected, QUESTION_COUNT))
    setStep('quiz')
  }

  const handleComplete = (result) => {
    const prevBadges = new Set(state.student.badges)
    submitQuestResult(result)
    // badges are recomputed synchronously inside recordQuestResult; we approximate
    // by checking which badges *would* now be satisfied based on updated totals.
    const updatedPoints = state.student.points + result.xpEarned + (result.correct === result.total && result.total > 0 ? 20 : 0)
    const updatedStreak = state.student.streak // streak logic handled in storage; badge diff best-effort
    const probableUnlocked = BADGES.filter((b) => !prevBadges.has(b.id) && b.condition({
      ...state.student,
      points: updatedPoints,
      streak: updatedStreak + 1,
      totalQuestsCompleted: state.student.totalQuestsCompleted + 1,
      hasPerfectScore: state.student.hasPerfectScore || (result.correct === result.total && result.total > 0),
      chaptersTried: new Set([...state.student.chaptersTried, ...result.chapterIds]).size,
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
        mode={isAssignedToday ? 'exam' : 'quest'}
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
      <div className="card-playful p-6 mb-4 bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-2xl">
            <Rocket size={28} />
          </div>
          <div>
            <h2 className="font-display text-xl font-extrabold">
              {isAssignedToday ? "Today's Assigned Quest" : 'Daily Quest'}
            </h2>
            <p className="text-white/80 text-sm">
              {isAssignedToday
                ? 'Your teacher picked these chapters for you today. Complete them all!'
                : 'Pick 1 or more chapters to build your practice set (12 questions).'}
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
        className="btn-chunky w-full mt-5 bg-candy-green text-white py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Sparkles size={20} /> Start Quest ({QUESTION_COUNT} Questions)
      </button>
    </div>
  )
}
