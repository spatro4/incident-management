import { useState } from 'react'
import { LayoutDashboard, ClipboardList, History, RefreshCcw } from 'lucide-react'
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
  const { state, resetProgress } = useApp()
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState('analytics')

  if (!authed) {
    return <TeacherLogin onAuthenticated={() => setAuthed(true)} />
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card-playful p-6 bg-gradient-to-br from-slate-800 to-slate-700 text-white flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Teacher Dashboard</h1>
          <p className="text-white/70 text-sm mt-1">
            Tracking progress for <span className="font-bold">{state.student.name}</span> — Level {Math.floor(state.student.points / 200) + 1}, {state.student.points} Math Points
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm('Reset all student progress? This cannot be undone.')) resetProgress()
          }}
          className="btn-chunky bg-rose-500 text-white text-sm px-4 py-2 flex items-center gap-2"
        >
          <RefreshCcw size={16} /> Reset Progress
        </button>
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

      {tab === 'analytics' && <AnalyticsCharts chapterStats={state.chapterStats} />}
      {tab === 'assignments' && <AssignmentManager />}
      {tab === 'log' && <ActivityLog activityLog={state.activityLog} />}
    </div>
  )
}
