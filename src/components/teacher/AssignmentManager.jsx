import { useState } from 'react'
import { ClipboardList, Lock, Unlock, CheckCircle2 } from 'lucide-react'
import { CHAPTERS, CHAPTER_ICONS } from '../../data/curriculum'
import { useApp } from '../../context/AppContext'

export default function AssignmentManager() {
  const { state, assignChapters } = useApp()
  const [selected, setSelected] = useState(state.assignments.assignedChapters || [])
  const [locked, setLocked] = useState(state.assignments.lockedChapters || [])
  const [saved, setSaved] = useState(false)

  const toggleAssigned = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
    setSaved(false)
  }

  const toggleLocked = (id) => {
    setLocked((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
    setSaved(false)
  }

  const handleSave = () => {
    assignChapters(selected, locked)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="card-playful p-5">
      <h3 className="font-display font-bold text-slate-700 mb-1 flex items-center gap-2">
        <ClipboardList size={18} className="text-indigo-400" /> Assignment Manager
      </h3>
      <p className="text-sm text-slate-400 mb-4">
        Choose which chapters make up tomorrow's Daily Quest, and lock any chapters you don't want the student practicing right now.
      </p>

      <div className="space-y-2">
        {CHAPTERS.map((chapter) => {
          const Icon = CHAPTER_ICONS[chapter.icon]
          const isAssigned = selected.includes(chapter.id)
          const isLocked = locked.includes(chapter.id)
          return (
            <div
              key={chapter.id}
              className={`flex items-center gap-3 rounded-2xl border-2 p-3 transition-colors ${
                isAssigned ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'
              }`}
            >
              <div className={`p-2 rounded-xl bg-gradient-to-br ${chapter.gradient} shrink-0`}>
                {Icon && <Icon size={18} className="text-white" />}
              </div>
              <span className="flex-1 font-bold text-slate-700 text-sm">{chapter.title}</span>

              <button
                onClick={() => toggleAssigned(chapter.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                  isAssigned ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-indigo-100'
                }`}
              >
                {isAssigned ? 'Assigned' : 'Assign'}
              </button>

              <button
                onClick={() => toggleLocked(chapter.id)}
                className={`p-2 rounded-full transition-colors ${
                  isLocked ? 'bg-rose-100 text-rose-500' : 'bg-slate-100 text-slate-400 hover:bg-rose-50'
                }`}
                title={isLocked ? 'Unlock chapter' : 'Lock chapter'}
              >
                {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
              </button>
            </div>
          )
        })}
      </div>

      <button onClick={handleSave} className="btn-chunky w-full mt-5 bg-slate-800 text-white py-3 flex items-center justify-center gap-2">
        {saved ? (
          <>
            <CheckCircle2 size={18} /> Saved!
          </>
        ) : (
          "Save Tomorrow's Assignment"
        )}
      </button>
    </div>
  )
}
