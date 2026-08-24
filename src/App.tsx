import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PlannerProvider } from './context/PlannerContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import type { NavTab } from './components/layout/Sidebar'
import { DashboardPage } from './pages/DashboardPage'
import { TasksPage } from './pages/TasksPage'
import { SchedulePage } from './pages/SchedulePage'
import { CalendarPage } from './pages/CalendarPage'
import { GoalsPage } from './pages/GoalsPage'
import { FocusMoodPage } from './pages/FocusMoodPage'
import { AdminPage } from './pages/AdminPage'
import { AuthPage } from './pages/AuthPage'
import { NotificationHistoryPage } from './pages/NotificationHistoryPage'

const MainAppContent: React.FC = () => {
  const { user, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard')
  const [isAdminPageOpen, setIsAdminPageOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password' | 'update-password'>('login')

  useEffect(() => {
    // Check if user followed a password reset or callback link
    const path = window.location.pathname
    const hash = window.location.hash
    if (path.includes('update-password') || hash.includes('type=recovery')) {
      setAuthMode('update-password')
    }
  }, [])

  if (!user) {
    return <AuthPage initialMode={authMode} />
  }

  if (isAdmin && isAdminPageOpen) {
    return <AdminPage onBackToPlanner={() => setIsAdminPageOpen(false)} />
  }

  return (
    <AppLayout activeTab={activeTab} onSelectTab={setActiveTab} onOpenAdmin={() => setIsAdminPageOpen(true)}>
      {activeTab === 'dashboard' && <DashboardPage onNavigate={setActiveTab} />}
      {activeTab === 'tasks' && <TasksPage />}
      {activeTab === 'schedule' && <SchedulePage />}
      {activeTab === 'calendar' && <CalendarPage />}
      {activeTab === 'goals' && <GoalsPage />}
      {activeTab === 'focus-mood' && <FocusMoodPage />}
      {activeTab === 'notifications' && <NotificationHistoryPage />}
    </AppLayout>
  )
}

export function App() {
  return (
    <AuthProvider>
      <PlannerProvider>
        <ProtectedRoute fallback={<AuthPage />}>
          <MainAppContent />
        </ProtectedRoute>
      </PlannerProvider>
    </AuthProvider>
  )
}

export default App
