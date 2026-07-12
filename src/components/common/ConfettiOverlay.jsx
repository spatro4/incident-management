const COLORS = ['#FF6FA5', '#8B5CF6', '#3DA9FC', '#2EC4B6', '#FFC93C', '#FF9F45', '#4ADE80']

export default function ConfettiOverlay({ active, pieceCount = 40 }) {
  if (!active) return null
  const pieces = Array.from({ length: pieceCount })
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100
        const delay = Math.random() * 0.4
        const duration = 1.2 + Math.random() * 1
        const size = 6 + Math.random() * 8
        const color = COLORS[i % COLORS.length]
        const rounded = Math.random() < 0.5
        return (
          <span
            key={i}
            className="absolute top-0 animate-confetti"
            style={{
              left: `${left}%`,
              width: size,
              height: size * (rounded ? 1 : 1.6),
              backgroundColor: color,
              borderRadius: rounded ? '50%' : '2px',
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        )
      })}
    </div>
  )
}
