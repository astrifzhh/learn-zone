import React from 'react'
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  Calendar,
  Target,
  Timer,
  Settings,
  LogOut,
  Sparkles,
  ShieldCheck,
  Bell,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export type NavTab = 'dashboard' | 'tasks' | 'schedule' | 'calendar' | 'goals' | 'focus-mood' | 'notifications'

interface SidebarProps {
  activeTab: NavTab
  onSelectTab: (tab: NavTab) => void
  onOpenSettings: () => void
  onOpenAdmin?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  onOpenAdmin,
}) => {
  const { profile, signOut, isDemoMode, isAdmin } = useAuth()

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Beranda', icon: <LayoutDashboard size={20} /> },
    { id: 'tasks', label: 'Tugas Hari Ini', icon: <CheckSquare size={20} /> },
    { id: 'schedule', label: 'Jadwal', icon: <CalendarDays size={20} /> },
    { id: 'calendar', label: 'Kalender', icon: <Calendar size={20} /> },
    { id: 'goals', label: 'Target Semester', icon: <Target size={20} /> },
    { id: 'focus-mood', label: 'Fokus & Mood', icon: <Timer size={20} /> },
    { id: 'notifications', label: 'Riwayat Notifikasi', icon: <Bell size={20} /> },
  ]

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: '#FFFFFF',
        borderRight: '1.5px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {/* Brand Header */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '0 8px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              backgroundColor: 'var(--color-primary)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 10px rgba(33, 150, 243, 0.3)',
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                color: 'var(--color-text)',
                lineHeight: 1.1,
              }}
            >
              LEARN ZONE
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                letterSpacing: '0.3px',
              }}
            >
              PLANNER BELAJAR
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map(item => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  backgroundColor: isActive ? 'var(--color-primary-soft)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '14px',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                  width: '100%',
                  border: isActive ? '1px solid rgba(33, 150, 243, 0.2)' : '1px solid transparent',
                }}
              >
                <span style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-icon)' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
        {isAdmin && onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              marginTop: '14px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-achievement-soft)',
              color: '#9A6800',
              fontWeight: 800,
              fontSize: '14px',
              textAlign: 'left',
              width: '100%',
            }}
          >
            <ShieldCheck size={20} />
            <span>Halaman Admin</span>
          </button>
        )}
      </div>

      {/* Profile & Settings Footer Chip */}
      <div
        style={{
          borderTop: '1.5px solid var(--color-border-subtle)',
          paddingTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {isDemoMode && (
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#D48800',
              backgroundColor: 'var(--color-achievement-soft)',
              padding: '4px 8px',
              borderRadius: '6px',
              textAlign: 'center',
            }}
          >
            Mode Demo / Offline
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            borderRadius: '12px',
            backgroundColor: '#FAF7F0',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                flexShrink: 0,
              }}
            >
              {profile?.nickname
                .split(/\s+/)
                .slice(0, 2)
                .map(w => w[0]?.toUpperCase())
                .join('') || 'NA'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '13px',
                  color: 'var(--color-text)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {profile?.nickname || 'Budi'}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {profile?.class_name || 'Kelas 7B'}
              </div>
              <div
                style={{
                  fontSize: '10px',
                  color: 'var(--color-text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '125px',
                }}
              >
                {profile?.email || 'Email belum tersedia'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={onOpenSettings}
              style={{
                padding: '6px',
                color: 'var(--color-text-muted)',
                borderRadius: '6px',
                display: 'flex',
              }}
              title="Pengaturan Profil"
              aria-label="Buka Pengaturan"
            >
              <Settings size={17} />
            </button>
            <button
              onClick={signOut}
              style={{
                padding: '6px',
                color: 'var(--color-action)',
                borderRadius: '6px',
                display: 'flex',
              }}
              title="Keluar"
              aria-label="Keluar dari akun"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
