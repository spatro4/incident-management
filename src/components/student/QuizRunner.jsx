import { useMemo, useState } from 'react'
import { CheckCircle2, XCircle, Lightbulb, ArrowRight, Sparkles } from 'lucide-react'
import { checkAnswer } from '../../utils/mathEngine'
import { getChapterById, DIFFICULTY_LABELS } from '../../data/curriculum'
import { XP_PER_CORRECT } from '../../data/curriculum'
import BarModelVisualizer from './BarModelVisualizer'
import MiniChart from './MiniChart'
import ConfettiOverlay from '../common/ConfettiOverlay'
import XpPopup from '../common/XpPopup'
import ProgressBar from '../common/ProgressBar'

export default function QuizRunner({ questions, mode = 'quest', onComplete, onExit }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showXp, setShowXp] = useState(false)
  const [stats, setStats] = useState({ correct: 0, total: 0, breakdown: {} })

  const question = questions[index]
  const chapter = useMemo(() => getChapterById(question?.chapterId), [question])
  const progressPct = (index / questions.length) * 100

  if (!question) {
    return (
      <div className="card-playful p-8 text-center">
        <p className="font-display text-xl font-bold text-slate-600">No questions available for the selected chapters yet.</p>
        <button onClick={onExit} className="btn-chunky mt-4 bg-candy-blue text-white px-6 py-3">
          Go Back
        </button>
      </div>
    )
  }

  const recordAnswer = (correct) => {
    setStats((prev) => {
      const chId = question.chapterId
      const subId = question.subtopicId
      const breakdown = { ...prev.breakdown }
      if (!breakdown[chId]) breakdown[chId] = {}
      if (!breakdown[chId][subId]) breakdown[chId][subId] = { attempts: 0, correct: 0 }
      breakdown[chId][subId] = {
        attempts: breakdown[chId][subId].attempts + 1,
        correct: breakdown[chId][subId].correct + (correct ? 1 : 0),
      }
      return {
        correct: prev.correct + (correct ? 1 : 0),
        total: prev.total + 1,
        breakdown,
      }
    })
  }

  const handleSubmit = (answerValue) => {
    if (answered) return
    const correct = checkAnswer(question, answerValue)
    setIsCorrect(correct)
    setAnswered(true)
    recordAnswer(correct)
    if (correct) {
      setShowConfetti(true)
      setShowXp(true)
      setTimeout(() => setShowConfetti(false), 1600)
      setTimeout(() => setShowXp(false), 1000)
    } else {
      setShowHint(true)
    }
  }

  const goNext = () => {
    const isLast = index + 1 >= questions.length
    if (isLast) {
      const finalStats = stats
      const chapterIds = Array.from(new Set(questions.map((q) => q.chapterId)))
      onComplete({
        chapterIds,
        chapterBreakdown: finalStats.breakdown,
        correct: finalStats.correct,
        total: finalStats.total,
        xpEarned: finalStats.correct * XP_PER_CORRECT,
        mode,
      })
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setInputValue('')
    setAnswered(false)
    setIsCorrect(false)
    setShowHint(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <ConfettiOverlay active={showConfetti} />
      <XpPopup show={showXp} amount={XP_PER_CORRECT} />

      <div className="flex items-center justify-between mb-3">
        <span className="font-display font-bold text-slate-500 text-sm">
          Question {index + 1} of {questions.length}
        </span>
        <div className="flex items-center gap-2">
          {question.difficulty && (
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                question.difficulty === 'easy'
                  ? 'bg-emerald-100 text-emerald-600'
                  : question.difficulty === 'hard'
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-amber-100 text-amber-600'
              }`}
            >
              {DIFFICULTY_LABELS[question.difficulty]}
            </span>
          )}
          <span className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${chapter?.gradient || 'from-slate-300 to-slate-400'} text-white`}>
            {chapter?.short}
          </span>
        </div>
      </div>
      <ProgressBar value={progressPct} max={100} colorClass="bg-candy-purple" height="h-3" />

      <div className={`card-playful p-6 mt-4 ${answered && !isCorrect ? 'animate-shake-x' : 'animate-pop-in'}`}>
        <p className="font-display text-lg sm:text-xl font-bold text-slate-800 leading-snug mb-4">{question.prompt}</p>

        {question.chartData && <div className="mb-4"><MiniChart chartData={question.chartData} /></div>}
        {question.barModel && (
          <div className="mb-4">
            <BarModelVisualizer barModel={question.barModel} unit={question.barModel.unit} />
          </div>
        )}

        {question.type === 'mcq' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {question.choices.map((choice) => {
              const isSelected = selected === choice
              const isThisCorrect = answered && choice === question.answer
              const isThisWrong = answered && isSelected && choice !== question.answer
              return (
                <button
                  key={choice}
                  disabled={answered}
                  onClick={() => {
                    setSelected(choice)
                    handleSubmit(choice)
                  }}
                  className={`btn-chunky px-4 py-3 text-left flex items-center justify-between border-4 ${
                    isThisCorrect
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-700'
                      : isThisWrong
                        ? 'bg-rose-100 border-rose-400 text-rose-700'
                        : isSelected
                          ? 'bg-indigo-100 border-indigo-400 text-indigo-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  <span>{choice}</span>
                  {isThisCorrect && <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />}
                  {isThisWrong && <XCircle className="text-rose-500 shrink-0" size={20} />}
                </button>
              )
            })}
          </div>
        )}

        {question.type === 'input' && (
          <form
            className="mt-2 flex flex-col sm:flex-row gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit(inputValue)
            }}
          >
            <input
              type="text"
              inputMode="numeric"
              disabled={answered}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your answer"
              className={`flex-1 rounded-2xl border-4 px-4 py-3 font-display font-bold text-lg outline-none transition-colors ${
                answered
                  ? isCorrect
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-700'
                    : 'bg-rose-100 border-rose-400 text-rose-700'
                  : 'bg-white border-slate-200 focus:border-indigo-400'
              }`}
            />
            {!answered && (
              <button type="submit" className="btn-chunky bg-candy-purple text-white px-6 py-3 whitespace-nowrap">
                Submit
              </button>
            )}
          </form>
        )}

        {answered && (
          <div className={`mt-4 rounded-2xl p-4 flex items-start gap-3 ${isCorrect ? 'bg-emerald-50' : 'bg-amber-50'}`}>
            {isCorrect ? (
              <>
                <Sparkles className="text-emerald-500 shrink-0 mt-0.5" size={22} />
                <p className="font-bold text-emerald-700">Awesome job! That's correct! 🎉</p>
              </>
            ) : (
              <>
                <Lightbulb className="text-amber-500 shrink-0 mt-0.5" size={22} />
                <div>
                  <p className="font-bold text-amber-700">Not quite — here's a hint:</p>
                  <p className="text-amber-600 text-sm mt-1">{question.hint}</p>
                  <p className="text-amber-700 text-sm mt-1 font-bold">Correct answer: {question.answer}</p>
                </div>
              </>
            )}
          </div>
        )}

        {!answered && showHint === false && question.type === 'input' && (
          <button
            onClick={() => setShowHint(true)}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-600 mt-3 flex items-center gap-1"
          >
            <Lightbulb size={14} /> Need a hint?
          </button>
        )}
        {!answered && showHint && (
          <p className="text-xs text-indigo-400 mt-2 italic">{question.hint}</p>
        )}

        {answered && (
          <button onClick={goNext} className="btn-chunky bg-candy-blue text-white px-6 py-3 mt-5 w-full flex items-center justify-center gap-2">
            {index + 1 >= questions.length ? 'See Results' : 'Next Question'}
            <ArrowRight size={18} />
          </button>
        )}
      </div>

      <button onClick={onExit} className="block mx-auto mt-4 text-xs font-bold text-slate-400 hover:text-slate-600">
        Exit Quest
      </button>
    </div>
  )
}
