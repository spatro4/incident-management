import { Lock, Check } from 'lucide-react'
import { CHAPTERS, CHAPTER_ICONS, LEVELS } from '../../data/curriculum'

function ChapterCard({ chapter, isSelected, isLocked, isForced, onToggle }) {
  const Icon = CHAPTER_ICONS[chapter.icon]
  return (
    <button
      disabled={isLocked}
      onClick={() => onToggle(chapter.id)}
      className={`relative text-left rounded-2xl p-4 border-4 transition-all flex items-start gap-3 ${
        isLocked
          ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
          : isSelected
            ? `bg-gradient-to-br ${chapter.gradient} border-white text-white shadow-chunky-sm`
            : 'bg-white border-slate-200 hover:border-indigo-300'
      }`}
    >
      <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/25' : 'bg-slate-100'}`}>
        {Icon && <Icon size={22} className={isSelected ? 'text-white' : 'text-slate-500'} />}
      </div>
      <div className="flex-1">
        <p className={`font-display font-bold ${isSelected ? 'text-white' : 'text-slate-700'}`}>{chapter.title}</p>
        <p className={`text-xs mt-0.5 ${isSelected ? 'text-white/90' : 'text-slate-400'}`}>{chapter.description}</p>
        {isForced && (
          <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wide bg-amber-400 text-white px-2 py-0.5 rounded-full">
            Assigned by Teacher
          </span>
        )}
      </div>
      {isLocked && <Lock size={16} className="text-slate-400 absolute top-3 right-3" />}
      {isSelected && !isLocked && <Check size={18} className="text-white absolute top-3 right-3" />}
    </button>
  )
}

export default function ChapterSelect({ selected, onToggle, lockedChapters = [], forcedChapters = [] }) {
  return (
    <div className="space-y-5">
      {Object.entries(LEVELS).map(([levelKey, levelLabel]) => {
        const chaptersInLevel = CHAPTERS.filter((c) => c.level === levelKey)
        if (chaptersInLevel.length === 0) return null
        return (
          <div key={levelKey}>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">{levelLabel}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {chaptersInLevel.map((chapter) => (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  isSelected={selected.includes(chapter.id)}
                  isLocked={lockedChapters.includes(chapter.id) && !forcedChapters.includes(chapter.id)}
                  isForced={forcedChapters.includes(chapter.id)}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
