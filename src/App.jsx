import { AppProvider, useApp } from './context/AppContext'
import Header from './components/layout/Header'
import StudentDashboard from './components/student/StudentDashboard'
import TeacherDashboard from './components/teacher/TeacherDashboard'

function AppShell() {
  const { role } = useApp()
  return (
    <div className="min-h-screen pb-16">
      <Header />
      <main className="px-4 py-6">{role === 'student' ? <StudentDashboard /> : <TeacherDashboard />}</main>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
