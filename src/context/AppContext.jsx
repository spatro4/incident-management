import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { loadState, saveState, resetState, recordQuestResult, setAssignment, xpIntoLevel, todayISO } from '../utils/storage'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, setState] = useState(() => loadState())
  const [role, setRole] = useState('student') // 'student' | 'teacher'

  useEffect(() => {
    saveState(state)
  }, [state])

  const submitQuestResult = useCallback((result) => {
    setState((prev) => recordQuestResult(prev, result))
  }, [])

  const assignChapters = useCallback((chapterIds, lockedChapters) => {
    setState((prev) => setAssignment(prev, { chapterIds, lockedChapters }))
  }, [])

  const resetProgress = useCallback(() => {
    setState(resetState())
  }, [])

  const levelInfo = useMemo(() => xpIntoLevel(state.student.points), [state.student.points])

  const isAssignedToday = state.assignments.assignedDate === todayISO()

  const value = useMemo(
    () => ({
      state,
      role,
      setRole,
      levelInfo,
      isAssignedToday,
      submitQuestResult,
      assignChapters,
      resetProgress,
    }),
    [state, role, levelInfo, isAssignedToday, submitQuestResult, assignChapters, resetProgress]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
