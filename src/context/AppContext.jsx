import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { loadState, saveState, resetState, recordQuestResult, setAssignment, xpIntoLevel, todayISO } from '../utils/storage'
import {
  getSessionUsername,
  clearSession,
  signUp as authSignUp,
  logIn as authLogIn,
  listUsers,
  getDisplayName,
  getSecurityQuestion,
  resetPasswordWithSecurityAnswer as authResetWithSecurityAnswer,
  resetPasswordAsTeacher as authResetAsTeacher,
} from '../utils/auth'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [sessionUsername, setSessionUsername] = useState(() => getSessionUsername())
  const [activeUsername, setActiveUsername] = useState(() => getSessionUsername())
  const [role, setRole] = useState('student') // 'student' | 'teacher'
  const [users, setUsers] = useState(() => listUsers())
  const [authError, setAuthError] = useState('')
  const [state, setState] = useState(() =>
    activeUsername ? loadState(activeUsername, getDisplayName(activeUsername)) : null
  )

  // Student tab always reflects the logged-in student's own data, even if
  // the teacher was just browsing a different student's progress.
  useEffect(() => {
    if (role === 'student') setActiveUsername(sessionUsername)
  }, [role, sessionUsername])

  useEffect(() => {
    setState(activeUsername ? loadState(activeUsername, getDisplayName(activeUsername)) : null)
  }, [activeUsername])

  useEffect(() => {
    if (activeUsername && state) saveState(activeUsername, state)
  }, [state, activeUsername])

  const signUp = useCallback(async (username, displayName, password, securityQuestion, securityAnswer) => {
    setAuthError('')
    try {
      const normalized = await authSignUp(username, displayName, password, securityQuestion, securityAnswer)
      setUsers(listUsers())
      setSessionUsername(normalized)
      setActiveUsername(normalized)
      return true
    } catch (e) {
      setAuthError(e.message)
      return false
    }
  }, [])

  const logIn = useCallback(async (username, password) => {
    setAuthError('')
    try {
      const normalized = await authLogIn(username, password)
      setSessionUsername(normalized)
      setActiveUsername(normalized)
      return true
    } catch (e) {
      setAuthError(e.message)
      return false
    }
  }, [])

  const logOut = useCallback(() => {
    clearSession()
    setSessionUsername(null)
    setActiveUsername(null)
  }, [])

  // Teacher-only: browse any registered student's data without touching
  // the actual student login session.
  const viewAsStudent = useCallback((username) => {
    setActiveUsername(username)
  }, [])

  const lookupSecurityQuestion = useCallback((username) => getSecurityQuestion(username), [])

  const resetPasswordWithSecurityAnswer = useCallback(async (username, securityAnswer, newPassword) => {
    setAuthError('')
    try {
      await authResetWithSecurityAnswer(username, securityAnswer, newPassword)
      return true
    } catch (e) {
      setAuthError(e.message)
      return false
    }
  }, [])

  // Teacher-only: reset a student's password without needing their old
  // password or security answer.
  const resetPasswordAsTeacher = useCallback(async (username, newPassword) => {
    setAuthError('')
    try {
      await authResetAsTeacher(username, newPassword)
      return true
    } catch (e) {
      setAuthError(e.message)
      return false
    }
  }, [])

  const submitQuestResult = useCallback((result) => {
    setState((prev) => recordQuestResult(prev, result))
  }, [])

  const assignChapters = useCallback((chapterIds, lockedChapters) => {
    setState((prev) => setAssignment(prev, { chapterIds, lockedChapters }))
  }, [])

  const resetProgress = useCallback(() => {
    if (!activeUsername) return
    setState(resetState(activeUsername, getDisplayName(activeUsername)))
  }, [activeUsername])

  const levelInfo = useMemo(
    () => (state ? xpIntoLevel(state.student.points) : { current: 0, needed: 200, level: 1 }),
    [state]
  )

  const isAssignedToday = state ? state.assignments.assignedDate === todayISO() : false

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
      isLoggedIn: Boolean(sessionUsername),
      sessionUsername,
      activeUsername,
      users,
      authError,
      signUp,
      logIn,
      logOut,
      viewAsStudent,
      lookupSecurityQuestion,
      resetPasswordWithSecurityAnswer,
      resetPasswordAsTeacher,
    }),
    [
      state,
      role,
      levelInfo,
      isAssignedToday,
      submitQuestResult,
      assignChapters,
      resetProgress,
      sessionUsername,
      activeUsername,
      users,
      authError,
      signUp,
      logIn,
      logOut,
      viewAsStudent,
      lookupSecurityQuestion,
      resetPasswordWithSecurityAnswer,
      resetPasswordAsTeacher,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
