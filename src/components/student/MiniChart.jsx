const COLORS = ['#3DA9FC', '#8B5CF6', '#2EC4B6', '#FF9F45', '#FF6FA5']

export default function MiniChart({ chartData }) {
  if (!chartData) return null
  const { type, data } = chartData
  const max = Math.max(...data.map((d) => d.value), 1)

  if (type === 'bar') {
    return (
      <div className="bg-sky-50 rounded-2xl p-4 border-2 border-sky-100">
        <div className="flex items-end justify-around h-32 gap-2">
          {data.map((d, i) => (
            <div key={d.label} className="flex flex-col items-center flex-1 h-full justify-end">
              <span className="text-[11px] font-bold text-slate-500 mb-1">{d.value}</span>
              <div
                className="w-full rounded-t-lg transition-all duration-500"
                style={{ height: `${(d.value / max) * 100}%`, backgroundColor: COLORS[i % COLORS.length], minHeight: 6 }}
              />
              <span className="text-[11px] font-bold text-slate-500 mt-1 text-center">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'line') {
    const w = 300
    const h = 110
    const stepX = w / (data.length - 1 || 1)
    const points = data.map((d, i) => {
      const x = i * stepX
      const y = h - (d.value / max) * (h - 20) - 5
      return [x, y]
    })
    const path = points.map(([x, y]) => `${x},${y}`).join(' ')
    return (
      <div className="bg-rose-50 rounded-2xl p-4 border-2 border-rose-100">
        <svg viewBox={`0 0 ${w} ${h + 20}`} className="w-full h-32">
          <polyline points={path} fill="none" stroke="#FF6FA5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {points.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="#8B5CF6" />
              <text x={x} y={h + 16} textAnchor="middle" fontSize="10" fontWeight="700" fill="#64748b">
                {data[i].label}
              </text>
              <text x={x} y={y - 8} textAnchor="middle" fontSize="10" fontWeight="700" fill="#64748b">
                {data[i].value}
              </text>
            </g>
          ))}
        </svg>
      </div>
    )
  }

  return null
}
