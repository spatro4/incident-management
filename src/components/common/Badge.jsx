export default function Badge({ badge, unlocked }) {
  return (
    <div
      className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 w-24 shrink-0 transition-transform hover:scale-105 ${
        unlocked
          ? 'bg-gradient-to-br from-yellow-100 to-amber-200 border-amber-300 shadow-chunky-sm'
          : 'bg-slate-100 border-slate-200 grayscale opacity-60'
      }`}
      title={badge.description}
    >
      <span className={`text-3xl ${unlocked ? 'animate-float' : ''}`}>{badge.icon}</span>
      <span className="text-[11px] font-display font-bold text-center mt-1 text-slate-700 leading-tight">
        {badge.label}
      </span>
      <div className="pointer-events-none absolute -top-2 -right-2 bg-slate-800 text-white text-[10px] rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
        {badge.description}
      </div>
    </div>
  )
}
