import { useState } from 'react'
import { KeyRound, CheckCircle2 } from 'lucide-react'
import { CHAPTERS } from '../../data/curriculum'
import { OLYMPIAD_BANK } from '../../data/olympiadBank'
import { ENGLISH_OLYMPIAD_BANK } from '../../data/englishOlympiadBank'

const ALL_OLYMPIAD_CHAPTERS = CHAPTERS.filter((c) => c.level === 'olympiad')

function bankFor(chapter) {
  return chapter.subject === 'english' ? ENGLISH_OLYMPIAD_BANK : OLYMPIAD_BANK
}

export default function OlympiadAnswerKey() {
  const [chapterId, setChapterId] = useState(ALL_OLYMPIAD_CHAPTERS[0].id)
  const chapter = ALL_OLYMPIAD_CHAPTERS.find((c) => c.id === chapterId)
  const questions = bankFor(chapter)[chapter.sourceId] || []

  return (
    <div className="card-playful p-5">
      <h3 className="font-display font-bold text-slate-700 mb-1 flex items-center gap-2">
        <KeyRound size={18} className="text-slate-700" /> Olympiad Answer Key
      </h3>
      <p className="text-sm text-slate-400 mb-4">
        Teacher-only view of every fixed Olympiad challenge question and its correct answer. Students never see this list — only
        the per-question feedback after they answer.
      </p>

      <select
        value={chapterId}
        onChange={(e) => setChapterId(e.target.value)}
        className="w-full sm:w-auto border-4 border-slate-200 focus:border-indigo-300 outline-none rounded-2xl px-4 py-2.5 font-bold text-slate-700 mb-4"
      >
        <optgroup label="Math Olympiad">
          {ALL_OLYMPIAD_CHAPTERS.filter((c) => c.subject === 'math').map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </optgroup>
        <optgroup label="English Olympiad">
          {ALL_OLYMPIAD_CHAPTERS.filter((c) => c.subject === 'english').map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </optgroup>
      </select>

      <ol className="space-y-3 max-h-[32rem] overflow-y-auto pr-1">
        {questions.map((q, i) => (
          <li key={q.id} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-xs font-bold text-slate-400 mb-1">Question {i + 1}</p>
            {q.passage && <p className="text-xs text-slate-500 italic mb-2 leading-relaxed">{q.passage}</p>}
            <p className="font-bold text-slate-700 text-sm mb-2">{q.prompt}</p>
            {q.choices && (
              <div className="flex flex-wrap gap-2 mb-2">
                {q.choices.map((c) => (
                  <span
                    key={c}
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      c === q.answer ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-white text-slate-400 border border-slate-200'
                    }`}
                  >
                    {c === q.answer && <CheckCircle2 size={12} className="inline mr-1 -mt-0.5" />}
                    {c}
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs font-bold text-emerald-600">
              Answer: <span className="font-display">{q.answer}</span>
            </p>
            {q.hint && <p className="text-xs text-slate-400 mt-1">Hint given to student: {q.hint}</p>}
          </li>
        ))}
      </ol>
    </div>
  )
}
