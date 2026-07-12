import { GraduationCap, School, LogOut } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function Header() {
  const { role, setRole, isLoggedIn, state, logOut } = useApp()

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b-4 border-white shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🧮</span>
          <span className="font-display text-lg font-extrabold text-slate-700">Math Quest</span>
        </div>

        <div className="flex items-center gap-3">
          {role === 'student' && isLoggedIn && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-bold text-slate-500">Hi, {state?.student.name}!</span>
              <button
                onClick={logOut}
                title="Log out"
                className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-500 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
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
      </div>
    </header>
  )
}
