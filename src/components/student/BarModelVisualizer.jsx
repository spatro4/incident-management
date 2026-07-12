// Visual "bar model" representation of Singapore Math word problems.
// Renders blocks whose widths are proportional to their numeric value so
// students can *see* the part-whole or comparison relationship.

function Block({ value, widthPct, colorClass, label, dashed = false, negative = false }) {
  return (
    <div className="flex flex-col items-center" style={{ width: `${widthPct}%`, minWidth: '3rem' }}>
      <div
        className={`w-full h-12 rounded-xl flex items-center justify-center font-display font-bold text-white text-sm sm:text-base shadow-chunky-sm border-2 ${
          dashed ? 'border-dashed border-slate-400 bg-slate-100 !text-slate-500' : 'border-white/60'
        } ${negative ? 'bg-rose-400' : colorClass}`}
      >
        {dashed ? '?' : value}
      </div>
      {label && <span className="text-xs font-bold text-slate-500 mt-1 text-center">{label}</span>}
    </div>
  )
}

export default function BarModelVisualizer({ barModel, unit }) {
  if (!barModel) return null
  const palette = ['bg-candy-blue', 'bg-candy-purple', 'bg-candy-teal', 'bg-candy-orange']

  if (barModel.mode === 'part-whole') {
    const { parts, whole, unknownIndex } = barModel
    const knownTotal = parts.reduce((sum, p) => sum + (p ?? 0), 0)
    const totalForScale = whole ?? (knownTotal || 1)
    return (
      <div className="bg-indigo-50 rounded-2xl p-4 border-2 border-indigo-100">
        <p className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-wide">Part-Whole Bar Model</p>
        <div className="mb-2">
          <div className="text-[11px] text-slate-400 font-bold mb-1">Whole {unit ? `(${unit})` : ''}</div>
          <div
            className={`h-10 rounded-xl flex items-center justify-center font-display font-bold text-white shadow-chunky-sm ${
              unknownIndex === 'whole' ? 'border-2 border-dashed border-slate-400 bg-slate-100 !text-slate-500' : 'bg-slate-700'
            }`}
          >
            {unknownIndex === 'whole' ? '?' : whole}
          </div>
        </div>
        <div className="flex gap-1.5">
          {parts.map((p, i) => (
            <Block
              key={i}
              value={p}
              widthPct={((p ?? totalForScale / parts.length) / totalForScale) * 100}
              colorClass={palette[i % palette.length]}
              label={`Part ${i + 1}`}
              dashed={unknownIndex === i}
            />
          ))}
        </div>
      </div>
    )
  }

  if (barModel.mode === 'comparison') {
    const { bars, unknownIndex } = barModel
    const max = Math.max(...bars.map((b) => b.value)) || 1
    return (
      <div className="bg-purple-50 rounded-2xl p-4 border-2 border-purple-100 space-y-2">
        <p className="text-xs font-bold text-purple-400 mb-1 uppercase tracking-wide">Comparison Bar Model</p>
        {bars.map((b, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 w-16 shrink-0 truncate">{b.label}</span>
            <div className="flex-1">
              <Block
                value={b.value}
                widthPct={Math.max(10, (b.value / max) * 100)}
                colorClass={palette[i % palette.length]}
                dashed={unknownIndex === i}
              />
            </div>
          </div>
        ))}
        {unknownIndex === 'diff' && (
          <p className="text-xs text-slate-400 italic pl-16">Find the difference between the two bars ↑</p>
        )}
      </div>
    )
  }

  if (barModel.mode === 'multi-step') {
    const { steps } = barModel
    const max = Math.max(...steps.map((s) => Math.abs(s.value))) || 1
    return (
      <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-100">
        <p className="text-xs font-bold text-amber-500 mb-2 uppercase tracking-wide">Step-by-Step Bar Model</p>
        <div className="flex gap-2 items-end flex-wrap">
          {steps.map((s, i) => (
            <Block
              key={i}
              value={s.value < 0 ? `-${Math.abs(s.value)}` : s.value}
              widthPct={Math.max(18, (Math.abs(s.value) / max) * 40)}
              colorClass={palette[i % palette.length]}
              label={s.label}
              negative={s.value < 0}
            />
          ))}
        </div>
      </div>
    )
  }

  return null
}
