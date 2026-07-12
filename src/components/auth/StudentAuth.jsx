import { useState } from 'react'
import { UserPlus, LogIn, User, Lock, Sparkles } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function StudentAuth() {
  const { signUp, logIn, authError } = useApp()
  const [mode, setMode] = useState('signup') // 'signup' | 'login'
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    if (mode === 'signup') {
      await signUp(username, displayName, password)
    } else {
      await logIn(username, password)
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-sm mx-auto mt-8">
      <div className="card-playful p-8 text-center animate-pop-in">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
          <Sparkles size={30} className="text-white" />
        </div>
        <h2 className="font-display text-xl font-extrabold text-slate-800">
          {mode === 'signup' ? 'Create Your Explorer Account' : 'Welcome Back!'}
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {mode === 'signup' ? 'Pick a username so your progress is saved just for you.' : 'Log in to continue your quest.'}
        </p>

        <div className="flex bg-slate-100 rounded-2xl p-1 mt-5">
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold transition-colors ${
              mode === 'signup' ? 'bg-white shadow-chunky-sm text-indigo-600' : 'text-slate-400'
            }`}
          >
            <UserPlus size={16} /> Sign Up
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold transition-colors ${
              mode === 'login' ? 'bg-white shadow-chunky-sm text-indigo-600' : 'text-slate-400'
            }`}
          >
            <LogIn size={16} /> Log In
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3 text-left">
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoComplete="username"
              className="w-full pl-10 pr-4 py-3 rounded-2xl border-4 border-slate-200 focus:border-indigo-300 outline-none font-bold"
            />
          </div>
          {mode === 'signup' && (
            <div className="relative">
              <Sparkles size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nickname (e.g. Priya)"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border-4 border-slate-200 focus:border-indigo-300 outline-none font-bold"
              />
            </div>
          )}
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border-4 border-slate-200 focus:border-indigo-300 outline-none font-bold"
            />
          </div>
          {authError && <p className="text-rose-500 text-xs font-bold">{authError}</p>}
          <button type="submit" disabled={submitting} className="btn-chunky w-full bg-candy-purple text-white py-3 disabled:opacity-60">
            {submitting ? 'Please wait…' : mode === 'signup' ? 'Create Account & Start' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  )
}
