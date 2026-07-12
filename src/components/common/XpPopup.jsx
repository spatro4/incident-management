export default function XpPopup({ show, amount }) {
  if (!show) return null
  return (
    <div className="pointer-events-none fixed top-24 left-1/2 -translate-x-1/2 z-[70]">
      <span className="font-display text-3xl font-extrabold text-candy-green drop-shadow-[0_2px_0_rgba(0,0,0,0.15)] animate-fly-up">
        +{amount} XP
      </span>
    </div>
  )
}
