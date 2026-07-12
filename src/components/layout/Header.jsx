import { GraduationCap, School } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function Header() {
  const { role, setRole } = useApp()

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b-4 border-white shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧮</span>
          <span className="font-display text-lg font-extrabold text-slate-700">Math Quest</span>
        </div>
        <div className="flex bg-slate-100 rounded-2xl p-1">
          <button
            onClick={() => setRole('student')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
              role === 'student' ? 'bg-white shadow-chunky-sm text-indigo-600' : 'text-slate-400'
            }`}
          >
            <GraduationCap size={16} /> Student
          </button>
          <button
            onClick={() => setRole('teacher')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
              role === 'teacher' ? 'bg-white shadow-chunky-sm text-indigo-600' : 'text-slate-400'
            }`}
          >
            <School size={16} /> Teacher
          </button>
        </div>
      </div>
    </header>
  )
}
