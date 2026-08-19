import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import type { NavTab } from './Sidebar'
import { SettingsModal } from '../profile/SettingsModal'
import { Toast } from '../ui/Toast'
import { usePlanner } from '../../context/PlannerContext'
import { LayoutDashboard, CheckSquare, CalendarDays, Calendar, Target, Timer, Settings } from 'lucide-react'

interface AppLayoutProps {
  activeTab: NavTab
  onSelectTab: (tab: NavTab) => void
  onOpenAdmin?: () => void
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  onSelectTab,
  onOpenAdmin,
  children,
}) => {
  const { toastMessage, toastType, clearToast } = usePlanner()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const mobileNavItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Beranda', icon: <LayoutDashboard size={18} /> },
    { id: 'tasks', label: 'Tugas', icon: <CheckSquare size={18} /> },
    { id: 'schedule', label: 'Jadwal', icon: <CalendarDays size={18} /> },
    { id: 'calendar', label: 'Kalender', icon: <Calendar size={18} /> },
    { id: 'goals', label: 'Target', icon: <Target size={18} /> },
    { id: 'focus-mood', label: 'Fokus', icon: <Timer size={18} /> },
  ]

  return (
    <div className="lz-app-layout">
      {/* Desktop Sidebar (hidden on mobile via CSS) */}
      <div className="desktop-sidebar-container">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAdmin={onOpenAdmin}
        />
      </div>

      {/* Main Content Area */}
      <main className="lz-main-content">
        {/* Mobile Top Header */}
        <div className="mobile-header" style={{ display: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>LEARN ZONE</span>
            <button onClick={() => setIsSettingsOpen(true)} style={{ padding: '6px', color: 'var(--color-icon)' }}>
              <Settings size={20} />
            </button>
          </div>
        </div>

        {children}

        {/* Mobile Bottom Navigation Bar */}
        <div className="mobile-bottom-nav">
          {mobileNavItems.map(item => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontSize: '11px',
                  fontWeight: isActive ? 800 : 500,
                  flex: 1,
                  padding: '8px 0',
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Global Toast */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={clearToast}
      />
    </div>
  )
}
