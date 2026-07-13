import { useState } from 'react'
import { Smile, BookOpen } from 'lucide-react'
import { COMICS } from '../../data/comics'
import ComicReader from './ComicReader'

export default function ComicsLibrary() {
  const [activeComicId, setActiveComicId] = useState(null)

  if (activeComicId) {
    const comic = COMICS.find((c) => c.id === activeComicId)
    return <ComicReader comic={comic} onBack={() => setActiveComicId(null)} />
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 p-4">
        <h3 className="font-display font-extrabold text-white flex items-center gap-2 text-sm uppercase tracking-wide">
          <Smile size={16} /> Story Time — Good Habits & Good Choices
        </h3>
        <p className="text-white/90 text-xs mt-1">
          Fun illustrated stories about honesty, kindness, teamwork, and other good habits. Just for reading — no quiz, no points!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {COMICS.map((comic) => (
          <button
            key={comic.id}
            onClick={() => setActiveComicId(comic.id)}
            className="card-playful p-4 flex flex-col gap-3 text-left hover:border-indigo-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${comic.gradient} text-4xl leading-none`}>{comic.coverEmoji}</div>
              <div className="flex-1">
                <p className="font-display font-bold text-slate-700">{comic.title}</p>
                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wide bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                  {comic.moral}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400">{comic.summary}</p>
            <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-indigo-500">
              <BookOpen size={14} /> Read the story
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
