export default function ProgressBar({ value, max = 100, colorClass = 'bg-candy-teal', height = 'h-4', showLabel = false, label }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
          <span>{label}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div className={`w-full ${height} rounded-full bg-slate-200/70 overflow-hidden shadow-inner`}>
        <div
          className={`${height} rounded-full ${colorClass} transition-[width] duration-700 ease-out relative overflow-hidden`}
          style={{ width: `${pct}%` }}
        >
          <div className="absolute inset-0 bg-white/25 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
