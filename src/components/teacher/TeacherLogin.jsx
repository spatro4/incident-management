import { useState } from 'react'
import { ShieldCheck, KeyRound } from 'lucide-react'

const TEACHER_PASSWORD = 'teacher123'

export default function TeacherLogin({ onAuthenticated }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === TEACHER_PASSWORD) {
      setError(false)
      onAuthenticated()
    } else {
      setError(true)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-12">
      <div className="card-playful p-8 text-center animate-pop-in">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
          <ShieldCheck size={30} className="text-white" />
        </div>
        <h2 className="font-display text-xl font-extrabold text-slate-800">Teacher / Admin Login</h2>
        <p className="text-slate-400 text-sm mt-1">Enter the teacher password to view the dashboard.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div className="relative">
            <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              placeholder="Password"
              className={`w-full pl-10 pr-4 py-3 rounded-2xl border-4 outline-none font-bold ${
                error ? 'border-rose-300 bg-rose-50' : 'border-slate-200 focus:border-indigo-300'
              }`}
            />
          </div>
          {error && <p className="text-rose-500 text-xs font-bold">Incorrect password. Try again!</p>}
          <button type="submit" className="btn-chunky w-full bg-slate-800 text-white py-3">
            Log In
          </button>
        </form>
      </div>
    </div>
  )
}
