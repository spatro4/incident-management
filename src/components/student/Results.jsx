import { Trophy, RotateCcw, Home, Star } from 'lucide-react'
import ConfettiOverlay from '../common/ConfettiOverlay'
import { useState, useEffect } from 'react'

export default function Results({ summary, newBadges, onRetry, onHome }) {
  const { correct, total, xpEarned } = summary
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  const [celebrate, setCelebrate] = useState(false)

  useEffect(() => {
    if (pct >= 70) {
      setCelebrate(true)
      const t = setTimeout(() => setCelebrate(false), 2200)
      return () => clearTimeout(t)
    }
  }, [pct])

  const message =
    pct === 100
      ? 'PERFECT SCORE! You are a Math Superstar! 🌟'
      : pct >= 80
        ? "Fantastic work! You're really mastering this! 🎉"
        : pct >= 50
          ? 'Good effort! Keep practicing and you will improve! 💪'
          : "Nice try! Let's review those hints and try again. 🌱"

  return (
    <div className="max-w-lg mx-auto text-center">
      <ConfettiOverlay active={celebrate} pieceCount={70} />
      <div className="card-playful p-8 animate-pop-in">
        <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 flex items-center justify-center shadow-chunky mb-4">
          <Trophy size={44} className="text-white" />
        </div>
        <h2 className="font-display text-2xl font-extrabold text-slate-800">{message}</h2>
        <p className="text-slate-500 mt-2 font-bold">
          You got <span className="text-emerald-500">{correct}</span> out of {total} correct ({pct}%)
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 font-display font-bold px-4 py-2 rounded-full">
          <Star size={18} className="fill-emerald-400 text-emerald-400" /> +{xpEarned} Math Points earned!
        </div>

        {newBadges && newBadges.length > 0 && (
          <div className="mt-6">
            <p className="font-display font-bold text-slate-600 mb-2">New Badge{newBadges.length > 1 ? 's' : ''} Unlocked!</p>
            <div className="flex justify-center gap-3 flex-wrap">
              {newBadges.map((b) => (
                <div key={b.id} className="flex flex-col items-center bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-3 animate-pop-in">
                  <span className="text-3xl">{b.icon}</span>
                  <span className="text-xs font-bold text-amber-700 mt-1">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          <button onClick={onRetry} className="btn-chunky flex-1 bg-candy-purple text-white py-3 flex items-center justify-center gap-2">
            <RotateCcw size={18} /> Practice Again
          </button>
          <button onClick={onHome} className="btn-chunky flex-1 bg-candy-blue text-white py-3 flex items-center justify-center gap-2">
            <Home size={18} /> Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
