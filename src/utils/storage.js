// LocalStorage-backed mock database for Math Quest.
import { CHAPTERS, BADGES, LEVEL_XP_STEP, XP_PER_QUEST_BONUS } from '../data/curriculum'

const STORAGE_KEY = 'mathquest_db_v1'

const todayISO = () => new Date().toISOString().slice(0, 10)

const defaultState = () => ({
  student: {
    name: 'Explorer',
    points: 0,
    level: 1,
    streak: 0,
    lastActiveDate: null,
    totalQuestsCompleted: 0,
    hasPerfectScore: false,
    chaptersTried: [],
    badges: [],
  },
  activityLog: [],
  chapterStats: {}, // chapterId -> { attempts, correct, subtopics: { id: {attempts, correct} } }
  assignments: {
    assignedDate: null,
    assignedChapters: [],
    lockedChapters: [],
  },
})

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw)
    // shallow-merge with defaults to survive schema additions
    const base = defaultState()
    return {
      ...base,
      ...parsed,
      student: { ...base.student, ...(parsed.student || {}) },
      assignments: { ...base.assignments, ...(parsed.assignments || {}) },
    }
  } catch (e) {
    console.warn('Failed to load saved progress, starting fresh.', e)
    return defaultState()
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY)
  return defaultState()
}

function levelForPoints(points) {
  return Math.max(1, Math.floor(points / LEVEL_XP_STEP) + 1)
}

export function xpIntoLevel(points) {
  const level = levelForPoints(points)
  const base = (level - 1) * LEVEL_XP_STEP
  return { current: points - base, needed: LEVEL_XP_STEP, level }
}

function updateStreak(student) {
  const today = todayISO()
  if (student.lastActiveDate === today) return student.streak
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yStr = yesterday.toISOString().slice(0, 10)
  if (student.lastActiveDate === yStr) {
    return student.streak + 1
  }
  return 1 // streak reset (or first ever activity)
}

function evaluateBadges(student) {
  const unlocked = new Set(student.badges)
  for (const badge of BADGES) {
    if (!unlocked.has(badge.id) && badge.condition(student)) {
      unlocked.add(badge.id)
    }
  }
  return Array.from(unlocked)
}

/**
 * Records the result of a completed quest/exam, updating streaks, points,
 * level, badges, per-chapter stats, and the activity log.
 * @param {object} state current app state
 * @param {object} result { chapterIds, chapterBreakdown, correct, total, xpEarned, mode }
 * chapterBreakdown: { [chapterId]: { [subtopicId]: { attempts, correct } } }
 */
export function recordQuestResult(state, result) {
  const { chapterIds, chapterBreakdown, correct, total, xpEarned, mode } = result
  const next = structuredClone(state)
  const s = next.student

  s.lastActiveDate = s.lastActiveDate // will be set below
  const newStreak = updateStreak(s)
  s.streak = newStreak
  s.lastActiveDate = todayISO()

  const bonus = correct === total && total > 0 ? XP_PER_QUEST_BONUS : 0
  s.points += xpEarned + bonus
  s.level = levelForPoints(s.points)
  s.totalQuestsCompleted += 1
  if (total > 0 && correct === total) s.hasPerfectScore = true

  chapterIds.forEach((id) => {
    if (!s.chaptersTried.includes(id)) s.chaptersTried.push(id)
  })

  // merge chapter/subtopic stats
  Object.entries(chapterBreakdown || {}).forEach(([chapterId, subtopics]) => {
    if (!next.chapterStats[chapterId]) {
      next.chapterStats[chapterId] = { attempts: 0, correct: 0, subtopics: {} }
    }
    const cs = next.chapterStats[chapterId]
    Object.entries(subtopics).forEach(([subId, stat]) => {
      cs.attempts += stat.attempts
      cs.correct += stat.correct
      if (!cs.subtopics[subId]) cs.subtopics[subId] = { attempts: 0, correct: 0 }
      cs.subtopics[subId].attempts += stat.attempts
      cs.subtopics[subId].correct += stat.correct
    })
  })

  s.badges = evaluateBadges({ ...s, chaptersTried: s.chaptersTried.length })

  const chapterTitles = chapterIds
    .map((id) => CHAPTERS.find((c) => c.id === id)?.short)
    .filter(Boolean)
    .join(', ')

  next.activityLog.unshift({
    id: `${Date.now()}`,
    date: new Date().toISOString(),
    chapterIds,
    chapterTitles,
    mode: mode || 'quest',
    correct,
    total,
    scorePercent: total > 0 ? Math.round((correct / total) * 100) : 0,
    xpEarned: xpEarned + bonus,
  })
  next.activityLog = next.activityLog.slice(0, 100)

  return next
}

export function setAssignment(state, { chapterIds, lockedChapters }) {
  const next = structuredClone(state)
  next.assignments = {
    assignedDate: todayISO(),
    assignedChapters: chapterIds,
    lockedChapters: lockedChapters || [],
  }
  return next
}

export { todayISO, levelForPoints }
