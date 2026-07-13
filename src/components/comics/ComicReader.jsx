import { useState } from 'react'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import ProgressBar from '../common/ProgressBar'

export default function ComicReader({ comic, onBack }) {
  const [pageIndex, setPageIndex] = useState(0)
  const isLastPage = pageIndex === comic.pages.length - 1
  const page = comic.pages[pageIndex]

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-slate-600 mb-4"
      >
        <ArrowLeft size={16} /> Back to Story Time
      </button>

      <div className={`card-playful p-6 bg-gradient-to-br ${comic.gradient} text-white mb-4`}>
        <h2 className="font-display text-xl font-extrabold">{comic.title}</h2>
        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wide bg-white/25 px-2 py-0.5 rounded-full">
          {comic.moral}
        </span>
      </div>

      <ProgressBar value={pageIndex + 1} max={comic.pages.length} colorClass="bg-candy-purple" height="h-2.5" />

      <div className="card-playful p-8 mt-4 flex flex-col items-center text-center animate-pop-in">
        <div className="text-7xl sm:text-8xl mb-6 leading-none">{page.emoji}</div>
        <p className="font-display text-base sm:text-lg font-bold text-slate-700 leading-relaxed max-w-xl">{page.text}</p>
      </div>

      {isLastPage && (
        <div className="card-playful p-5 mt-4 bg-amber-50 border-amber-200 flex items-start gap-3">
          <Sparkles className="text-amber-500 shrink-0 mt-0.5" size={22} />
          <div>
            <p className="font-display font-extrabold text-amber-700 text-sm uppercase tracking-wide mb-1">The Lesson</p>
            <p className="text-amber-700 text-sm">{comic.lesson}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-5">
        <button
          onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
          disabled={pageIndex === 0}
          className="btn-chunky bg-slate-200 text-slate-600 disabled:opacity-40 px-5 py-3 flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="flex items-center gap-1.5">
          {comic.pages.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${i === pageIndex ? 'bg-candy-purple' : 'bg-slate-200'}`}
            />
          ))}
        </div>

        {isLastPage ? (
          <button onClick={onBack} className="btn-chunky bg-candy-green text-white px-5 py-3 flex items-center gap-2">
            The End <Sparkles size={18} />
          </button>
        ) : (
          <button
            onClick={() => setPageIndex((i) => Math.min(comic.pages.length - 1, i + 1))}
            className="btn-chunky bg-candy-purple text-white px-5 py-3 flex items-center gap-2"
          >
            Next <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
