import { AlertTriangle, TrendingUp } from 'lucide-react'
import { CHAPTERS, CHAPTER_ICONS } from '../../data/curriculum'

const COLORS = ['#3DA9FC', '#8B5CF6', '#2EC4B6', '#FF9F45', '#FF6FA5', '#FFC93C']

function accuracyOf(cs) {
  if (!cs || cs.attempts === 0) return null
  return Math.round((cs.correct / cs.attempts) * 100)
}

export default function AnalyticsCharts({ chapterStats }) {
  const chapterData = CHAPTERS.map((c, i) => ({
    ...c,
    accuracy: accuracyOf(chapterStats[c.id]),
    attempts: chapterStats[c.id]?.attempts || 0,
    color: COLORS[i % COLORS.length],
  }))

  const totalAttempts = chapterData.reduce((sum, c) => sum + c.attempts, 0)
  const strugglingTopics = []
  chapterData.forEach((c) => {
    const cs = chapterStats[c.id]
    if (!cs) return
    Object.entries(cs.subtopics || {}).forEach(([subId, stat]) => {
      const acc = stat.attempts > 0 ? Math.round((stat.correct / stat.attempts) * 100) : null
      if (acc !== null && acc < 60 && stat.attempts >= 2) {
        const subtopic = c.subtopics.find((s) => s.id === subId)
        strugglingTopics.push({ chapter: c.short, label: subtopic?.label || subId, accuracy: acc })
      }
    })
  })

  return (
    <div className="space-y-6">
      {/* Bar chart: accuracy per chapter */}
      <div className="card-playful p-5">
        <h3 className="font-display font-bold text-slate-700 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-indigo-400" /> Accuracy by Chapter
        </h3>
        {totalAttempts === 0 ? (
          <p className="text-sm text-slate-400">No practice data yet — once the student completes a quest, results will appear here.</p>
        ) : (
          <div className="flex items-end justify-around h-48 gap-3">
            {chapterData.map((c) => (
              <div key={c.id} className="flex flex-col items-center flex-1 h-full justify-end">
                <span className="text-xs font-bold text-slate-500 mb-1">
                  {c.accuracy === null ? '—' : `${c.accuracy}%`}
                </span>
                <div
                  className="w-full rounded-t-lg transition-all duration-700"
                  style={{
                    height: c.accuracy === null ? 4 : `${Math.max(4, c.accuracy)}%`,
                    backgroundColor: c.color,
                  }}
                />
                <span className="text-[11px] font-bold text-slate-500 mt-2 text-center leading-tight">{c.short}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Distribution pie (attempts share) */}
      <div className="card-playful p-5">
        <h3 className="font-display font-bold text-slate-700 mb-4">Practice Distribution</h3>
        {totalAttempts === 0 ? (
          <p className="text-sm text-slate-400">No data yet.</p>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <PieChartSvg data={chapterData} total={totalAttempts} />
            <div className="flex-1 grid grid-cols-1 gap-2 w-full">
              {chapterData
                .filter((c) => c.attempts > 0)
                .map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-sm bg-slate-50 rounded-xl px-3 py-2">
                    <span className="flex items-center gap-2 font-bold text-slate-600">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.short}
                    </span>
                    <span className="text-slate-400 font-bold">
                      {c.attempts} question{c.attempts === 1 ? '' : 's'} ({Math.round((c.attempts / totalAttempts) * 100)}%)
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Struggling areas */}
      <div className="card-playful p-5">
        <h3 className="font-display font-bold text-slate-700 mb-3 flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500" /> Areas Needing Attention
        </h3>
        {strugglingTopics.length === 0 ? (
          <p className="text-sm text-slate-400">No struggling sub-topics detected yet — great job, or not enough data!</p>
        ) : (
          <ul className="space-y-2">
            {strugglingTopics.map((t, i) => (
              <li key={i} className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 text-sm">
                <span className="font-bold text-rose-600">
                  {t.chapter} — {t.label}
                </span>
                <span className="font-display font-extrabold text-rose-500">{t.accuracy}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function PieChartSvg({ data, total }) {
  const filtered = data.filter((d) => d.attempts > 0)
  let cumulative = 0
  const radius = 60
  const cx = 70
  const cy = 70
  const slices = filtered.map((d) => {
    const fraction = d.attempts / total
    const startAngle = cumulative * 2 * Math.PI
    cumulative += fraction
    const endAngle = cumulative * 2 * Math.PI
    const x1 = cx + radius * Math.sin(startAngle)
    const y1 = cy - radius * Math.cos(startAngle)
    const x2 = cx + radius * Math.sin(endAngle)
    const y2 = cy - radius * Math.cos(endAngle)
    const largeArc = fraction > 0.5 ? 1 : 0
    return {
      path: `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: d.color,
    }
  })
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0">
      {slices.map((s, i) => (
        <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth="2" />
      ))}
    </svg>
  )
}
