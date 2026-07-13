import { useEffect, useMemo, useState } from 'react'
import { Flame, Star, Trophy, Rocket, Megaphone, ChevronRight, GraduationCap, Calculator, BookOpen, Smile } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { CHAPTERS, CHAPTER_ICONS, BADGES, LEVELS } from '../../data/curriculum'
import ProgressBar from '../common/ProgressBar'
import Badge from '../common/Badge'
import DailyQuest from './DailyQuest'
import ComicsLibrary from '../comics/ComicsLibrary'

const SUBJECT_TABS = [
  { id: 'math', label: 'Math', icon: Calculator },
  { id: 'english', label: 'English', icon: BookOpen },
  { id: 'comics', label: 'Comics', icon: Smile },
]

function StatCard({ icon: Icon, label, value, colorClass }) {
  return (
    <div className="card-playful p-4 flex items-center gap-3">
      <div className={`p-3 rounded-2xl ${colorClass}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="font-display text-2xl font-extrabold text-slate-800">{value}</p>
      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const { state, levelInfo, isAssignedToday, homeTrigger } = useApp()
  const [view, setView] = useState('home') // 'home' | 'quest' | 'chapter'
  const [activeChapterId, setActiveChapterId] = useState(null)
  const [subjectTab, setSubjectTab] = useState('math') // 'math' | 'english' | 'comics'

  // Clicking the header's Home button bumps homeTrigger — jump back to the
  // dashboard home view even if we're mid-quiz or on the chapter picker.
  useEffect(() => {
    if (homeTrigger > 0) {
      setView('home')
      setActiveChapterId(null)
    }
  }, [homeTrigger])

  if (!state) return null

  const chapterStats = state.chapterStats
  const unlockedBadgeIds = new Set(state.student.badges)

  if (view === 'quest') {
    return (
      <div className="animate-pop-in">
        <DailyQuest onDone={() => setView('home')} subject={subjectTab === 'english' ? 'english' : 'math'} />
      </div>
    )
  }

  if (view === 'chapter' && activeChapterId) {
    return (
      <div className="animate-pop-in">
        <DailyQuest onDone={() => setView('home')} initialChapterId={activeChapterId} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero */}
      <div className="card-playful p-6 bg-gradient-to-br from-candy-blue via-indigo-500 to-purple-500 text-white relative overflow-hidden">
        <div className="absolute -right-6 -top-6 text-8xl opacity-20 select-none">🧮</div>
        <p className="text-white/80 font-bold text-sm">Welcome back,</p>
        <h1 className="font-display text-3xl font-extrabold">{state.student.name}! 👋</h1>
        <p className="text-white/90 mt-1">Level {levelInfo.level} Explorer</p>
        <div className="mt-4 max-w-sm">
          <ProgressBar
            value={levelInfo.current}
            max={levelInfo.needed}
            colorClass="bg-yellow-300"
            height="h-4"
            showLabel
            label={`Level ${levelInfo.level} progress`}
          />
        </div>
      </div>

      {isAssignedToday && (
        <div className="card-playful p-4 bg-amber-50 border-amber-200 flex items-center gap-3">
          <Megaphone className="text-amber-500 shrink-0" size={22} />
          <p className="text-amber-700 font-bold text-sm">
            Your teacher assigned today's practice:{' '}
            {state.assignments.assignedChapters
              .map((id) => CHAPTERS.find((c) => c.id === id)?.short)
              .filter(Boolean)
              .join(', ')}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard icon={Flame} label="Day Streak" value={state.student.streak} colorClass="bg-candy-orange" />
        <StatCard icon={Star} label="Points" value={state.student.points} colorClass="bg-candy-yellow" />
        <StatCard icon={Trophy} label="Quests Done" value={state.student.totalQuestsCompleted} colorClass="bg-candy-teal" />
      </div>

      {/* Badges */}
      <div className="card-playful p-5">
        <h3 className="font-display font-bold text-slate-700 mb-3">My Badges</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {BADGES.map((b) => (
            <Badge key={b.id} badge={b} unlocked={unlockedBadgeIds.has(b.id)} />
          ))}
        </div>
      </div>

      {/* Subject tabs */}
      <div className="flex bg-slate-100 rounded-2xl p-1.5 gap-1.5">
        {SUBJECT_TABS.map((tab) => {
          const Icon = tab.icon
          const active = subjectTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setSubjectTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                active ? 'bg-white shadow-chunky-sm text-indigo-600' : 'text-slate-400'
              }`}
            >
              <Icon size={16} /> {tab.label}
            </button>
          )
        })}
      </div>

      {subjectTab === 'comics' ? (
        <ComicsLibrary />
      ) : (
        <>
          {/* Daily Quest CTA */}
          <button
            onClick={() => setView('quest')}
            className="btn-chunky w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white p-5 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/25 p-3 rounded-2xl group-hover:animate-wiggle">
                <Rocket size={26} />
              </div>
              <div className="text-left">
                <p className="font-display text-lg font-extrabold">Start Daily Quest</p>
                <p className="text-white/80 text-sm">12 fresh {subjectTab === 'english' ? 'English' : 'Math'} questions, picked just for you</p>
              </div>
            </div>
            <ChevronRight size={24} />
          </button>

          {/* Chapters grid, grouped by level */}
          <div className="space-y-6">
        {Object.entries(LEVELS).map(([levelKey, levelLabel], idx) => {
          const chaptersInLevel = CHAPTERS.filter((c) => c.level === levelKey && c.subject === subjectTab)
          if (chaptersInLevel.length === 0) return null
          const isOlympiadSection = levelKey === 'olympiad'
          return (
            <div key={levelKey}>
              {idx === 0 && (
                <p className="text-xs font-bold uppercase tracking-wide text-indigo-400 mb-2 flex items-center gap-1.5">
                  <GraduationCap size={14} /> Grade 4 {subjectTab === 'english' ? 'English' : 'Math'} Syllabus
                </p>
              )}
              {isOlympiadSection ? (
                <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-2 border-amber-400/60 p-4 mb-3">
                  <h3 className="font-display font-extrabold text-amber-400 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <Trophy size={16} /> {subjectTab === 'english' ? 'English' : 'Math'} Olympiad Syllabus — Advanced Challenge Papers
                  </h3>
                  <p className="text-slate-300 text-xs mt-1">
                    Fixed, competition-level papers — much harder than the regular syllabus above. Same 25 questions and answers every attempt.
                  </p>
                </div>
              ) : (
                <h3 className="font-display font-bold text-slate-700 mb-3">{levelLabel}</h3>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {chaptersInLevel.map((chapter) => {
                  const Icon = CHAPTER_ICONS[chapter.icon]
                  const cs = chapterStats[chapter.id]
                  const mastery = cs && cs.attempts > 0 ? Math.round((cs.correct / cs.attempts) * 100) : 0
                  const isLocked = (state.assignments.lockedChapters || []).includes(chapter.id)
                  return (
                    <div
                      key={chapter.id}
                      className={`card-playful p-4 flex flex-col gap-3 ${isOlympiadSection ? '!bg-slate-900 !border-slate-700' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${chapter.gradient}`}>
                          {Icon && <Icon size={22} className={isOlympiadSection ? 'text-amber-400' : 'text-white'} />}
                        </div>
                        <div className="flex-1">
                          <p className={`font-display font-bold ${isOlympiadSection ? 'text-white' : 'text-slate-700'}`}>{chapter.title}</p>
                          <p className={`text-xs ${isOlympiadSection ? 'text-slate-300' : 'text-slate-400'}`}>{chapter.description}</p>
                        </div>
                      </div>
                      <ProgressBar
                        value={mastery}
                        max={100}
                        colorClass={isOlympiadSection ? 'bg-amber-400' : 'bg-candy-green'}
                        height="h-2.5"
                        showLabel
                        label="Mastery"
                      />
                      <button
                        disabled={isLocked}
                        onClick={() => {
                          setActiveChapterId(chapter.id)
                          setView('chapter')
                        }}
                        className={`btn-chunky disabled:bg-slate-300 text-white text-sm py-2.5 mt-1 ${
                          isOlympiadSection ? 'bg-amber-500' : 'bg-slate-800'
                        }`}
                      >
                        {isLocked ? 'Locked by Teacher' : isOlympiadSection ? 'Start Challenge Paper' : 'Practice This Chapter'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
          </div>
        </>
      )}

      {/* Recent activity */}
      {state.activityLog.length > 0 && (
        <div className="card-playful p-5">
          <h3 className="font-display font-bold text-slate-700 mb-3">Recent Activity</h3>
          <ul className="space-y-2">
            {state.activityLog.slice(0, 5).map((log) => (
              <li key={log.id} className="flex items-center justify-between text-sm bg-slate-50 rounded-xl px-3 py-2">
                <span className="text-slate-600 font-bold">
                  {log.chapterTitles} — {new Date(log.date).toLocaleDateString()}
                </span>
                <span className={`font-display font-extrabold ${log.scorePercent >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {log.scorePercent}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
