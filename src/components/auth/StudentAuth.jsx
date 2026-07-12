import { useState } from 'react'
import { UserPlus, LogIn, User, Lock, Sparkles, HelpCircle, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { SECURITY_QUESTIONS } from '../../utils/auth'

export default function StudentAuth() {
  const { signUp, logIn, authError, lookupSecurityQuestion, resetPasswordWithSecurityAnswer } = useApp()
  const [mode, setMode] = useState('signup') // 'signup' | 'login' | 'reset'
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [securityQuestionChoice, setSecurityQuestionChoice] = useState(SECURITY_QUESTIONS[0])
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Forgot-password flow state
  const [resetStep, setResetStep] = useState('find') // 'find' | 'answer'
  const [resetUsername, setResetUsername] = useState('')
  const [foundQuestion, setFoundQuestion] = useState('')
  const [resetLookupError, setResetLookupError] = useState('')
  const [resetAnswer, setResetAnswer] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    if (mode === 'signup') {
      await signUp(username, displayName, password, securityQuestionChoice, securityAnswer)
    } else {
      await logIn(username, password)
    }
    setSubmitting(false)
  }

  const goToMode = (m) => {
    setMode(m)
    setResetStep('find')
    setResetLookupError('')
    setResetSuccess(false)
  }

  const handleFindAccount = (e) => {
    e.preventDefault()
    const q = lookupSecurityQuestion(resetUsername)
    if (!q) {
      setResetLookupError('No account found with that username, or it has no security question set up.')
      return
    }
    setResetLookupError('')
    setFoundQuestion(q)
    setResetStep('answer')
  }

  const handleResetSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const ok = await resetPasswordWithSecurityAnswer(resetUsername, resetAnswer, newPassword)
    setSubmitting(false)
    if (ok) {
      setResetSuccess(true)
      setUsername(resetUsername)
      setTimeout(() => goToMode('login'), 1800)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-8">
      <div className="card-playful p-8 text-center animate-pop-in">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
          <Sparkles size={30} className="text-white" />
        </div>
        <h2 className="font-display text-xl font-extrabold text-slate-800">
          {mode === 'signup' ? 'Create Your Explorer Account' : mode === 'login' ? 'Welcome Back!' : 'Reset Your Password'}
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {mode === 'signup'
            ? 'Pick a username so your progress is saved just for you.'
            : mode === 'login'
              ? 'Log in to continue your quest.'
              : 'Answer your security question to set a new password.'}
        </p>

        {mode !== 'reset' && (
          <div className="flex bg-slate-100 rounded-2xl p-1 mt-5">
            <button
              type="button"
              onClick={() => goToMode('signup')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold transition-colors ${
                mode === 'signup' ? 'bg-white shadow-chunky-sm text-indigo-600' : 'text-slate-400'
              }`}
            >
              <UserPlus size={16} /> Sign Up
            </button>
            <button
              type="button"
              onClick={() => goToMode('login')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold transition-colors ${
                mode === 'login' ? 'bg-white shadow-chunky-sm text-indigo-600' : 'text-slate-400'
              }`}
            >
              <LogIn size={16} /> Log In
            </button>
          </div>
        )}

        {(mode === 'signup' || mode === 'login') && (
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
            {mode === 'signup' && (
              <>
                <div className="relative">
                  <HelpCircle size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <select
                    value={securityQuestionChoice}
                    onChange={(e) => setSecurityQuestionChoice(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border-4 border-slate-200 focus:border-indigo-300 outline-none font-bold appearance-none"
                  >
                    {SECURITY_QUESTIONS.map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="text"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    placeholder="Your answer (for password resets)"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border-4 border-slate-200 focus:border-indigo-300 outline-none font-bold"
                  />
                </div>
              </>
            )}
            {authError && <p className="text-rose-500 text-xs font-bold">{authError}</p>}
            <button type="submit" disabled={submitting} className="btn-chunky w-full bg-candy-purple text-white py-3 disabled:opacity-60">
              {submitting ? 'Please wait…' : mode === 'signup' ? 'Create Account & Start' : 'Log In'}
            </button>
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => goToMode('reset')}
                className="w-full text-center text-xs font-bold text-indigo-400 hover:text-indigo-600 mt-1"
              >
                Forgot password?
              </button>
            )}
          </form>
        )}

        {mode === 'reset' && resetStep === 'find' && (
          <form onSubmit={handleFindAccount} className="mt-5 space-y-3 text-left">
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="text"
                value={resetUsername}
                onChange={(e) => setResetUsername(e.target.value)}
                placeholder="Your username"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border-4 border-slate-200 focus:border-indigo-300 outline-none font-bold"
              />
            </div>
            {resetLookupError && <p className="text-rose-500 text-xs font-bold">{resetLookupError}</p>}
            <button type="submit" className="btn-chunky w-full bg-candy-purple text-white py-3">
              Continue
            </button>
            <button
              type="button"
              onClick={() => goToMode('login')}
              className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 mt-1 flex items-center justify-center gap-1"
            >
              <ArrowLeft size={12} /> Back to Log In
            </button>
          </form>
        )}

        {mode === 'reset' && resetStep === 'answer' && !resetSuccess && (
          <form onSubmit={handleResetSubmit} className="mt-5 space-y-3 text-left">
            <div className="rounded-2xl bg-indigo-50 border-2 border-indigo-100 p-3">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-1">Your security question</p>
              <p className="text-sm font-bold text-slate-700">{foundQuestion}</p>
            </div>
            <div className="relative">
              <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="text"
                value={resetAnswer}
                onChange={(e) => setResetAnswer(e.target.value)}
                placeholder="Your answer"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border-4 border-slate-200 focus:border-indigo-300 outline-none font-bold"
              />
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                autoComplete="new-password"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border-4 border-slate-200 focus:border-indigo-300 outline-none font-bold"
              />
            </div>
            {authError && <p className="text-rose-500 text-xs font-bold">{authError}</p>}
            <button type="submit" disabled={submitting} className="btn-chunky w-full bg-candy-purple text-white py-3 disabled:opacity-60">
              {submitting ? 'Please wait…' : 'Reset Password'}
            </button>
            <button
              type="button"
              onClick={() => goToMode('login')}
              className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 mt-1 flex items-center justify-center gap-1"
            >
              <ArrowLeft size={12} /> Back to Log In
            </button>
          </form>
        )}

        {mode === 'reset' && resetSuccess && (
          <div className="mt-5 text-center">
            <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-2" />
            <p className="font-bold text-emerald-600">Password reset! Taking you to log in…</p>
          </div>
        )}
      </div>
    </div>
  )
}
