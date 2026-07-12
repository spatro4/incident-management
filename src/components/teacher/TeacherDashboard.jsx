import { useState } from 'react'
import { LayoutDashboard, ClipboardList, History, RefreshCcw, Users } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import TeacherLogin from './TeacherLogin'
import AnalyticsCharts from './AnalyticsCharts'
import AssignmentManager from './AssignmentManager'
import ActivityLog from './ActivityLog'

const TABS = [
  { id: 'analytics', label: 'Analytics', icon: LayoutDashboard },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList },
  { id: 'log', label: 'Activity Log', icon: History },
]

export default function TeacherDashboard() {
  const { state, resetProgress, users, activeUsername, viewAsStudent } = useApp()
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState('analytics')

  if (!authed) {
    return <TeacherLogin onAuthenticated={() => setAuthed(true)} />
  }

  if (users.length === 0) {
    return (
      <div className="max-w-lg mx-auto card-playful p-8 text-center">
        <Users size={36} className="mx-auto text-slate-300 mb-3" />
        <h2 className="font-display text-xl font-extrabold text-slate-700">No Students Yet</h2>
        <p className="text-slate-400 text-sm mt-2">
          Once a student signs up from the Student tab on this device, their progress will show up here.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card-playful p-6 bg-gradient-to-br from-slate-800 to-slate-700 text-white flex items-center justify-between flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <h1 className="font-display text-2xl font-extrabold">Teacher Dashboard</h1>
          {state && (
            <p className="text-white/70 text-sm mt-1">
              Tracking progress for <span className="font-bold">{state.student.name}</span> — Level{' '}
              {Math.floor(state.student.points / 200) + 1}, {state.student.points} Math Points
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-3 py-2">
            <Users size={16} className="text-white/70" />
            <select
              value={activeUsername || ''}
              onChange={(e) => viewAsStudent(e.target.value)}
              className="bg-transparent text-sm font-bold outline-none [&>option]:text-slate-800"
            >
              {users.map((u) => (
                <option key={u.username} value={u.username}>
                  {u.displayName}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              if (confirm(`Reset ${state?.student.name || 'this student'}'s progress? This cannot be undone.`)) resetProgress()
            }}
            className="btn-chunky bg-rose-500 text-white text-sm px-4 py-2 flex items-center gap-2"
          >
            <RefreshCcw size={16} /> Reset Progress
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`btn-chunky flex items-center gap-2 px-4 py-2.5 whitespace-nowrap ${
                active ? 'bg-indigo-500 text-white' : 'bg-white text-slate-500'
              }`}
            >
              <Icon size={16} /> {t.label}
            </button>
          )
        })}
      </div>

      {state && tab === 'analytics' && <AnalyticsCharts chapterStats={state.chapterStats} />}
      {state && tab === 'assignments' && <AssignmentManager />}
      {state && tab === 'log' && <ActivityLog activityLog={state.activityLog} />}
    </div>
  )
}
