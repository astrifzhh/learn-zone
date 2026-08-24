import React, { useState } from 'react'
import { Bell, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { usePlanner } from '../../context/PlannerContext'
import { DAY_NAMES } from '../../types/planner'

export const GreetingHeader: React.FC = () => {
  const { profile } = useAuth()
  const { notifications, markNotificationRead } = usePlanner()
  const [showNotifications, setShowNotifications] = useState(false)

  // Localized Indonesian date
  const now = new Date()
  const dayName = DAY_NAMES[now.getDay()]
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  const formattedDate = `${dayName}, ${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        position: 'relative',
      }}
    >
      {/* Left Greeting & Date */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '26px',
              fontWeight: 700,
              color: 'var(--color-text)',
            }}
          >
            Hai {profile?.nickname || 'Budi'}, siap belajar?
          </h2>
          <span style={{ fontSize: '22px' }}>👋</span>
        </div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Sparkles size={14} color="#FFB800" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Right Area: Student Illustration & Notifications */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Replace this public asset with the supplied student illustration. */}
        <div
          className="header-illustration"
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            height: '70px',
            userSelect: 'none',
          }}
        >
          <img src="/students.png" alt="Tiga siswa LEARN ZONE" width="170" height="70" />
        </div>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-icon)',
              position: 'relative',
              boxShadow: 'var(--shadow-card)',
            }}
            aria-label="Lihat Notifikasi"
          >
            <Bell size={20} />
            {notifications.some(notification => !notification.read) && (
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-action)',
                  border: '2px solid #FFFFFF',
                }}
              />
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '52px',
                right: 0,
                width: '280px',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-modal)',
                padding: '16px',
                zIndex: 100,
                animation: 'slideUp 0.2s ease',
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  marginBottom: '10px',
                  color: 'var(--color-text)',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  paddingBottom: '6px',
                }}
              >
                Pemberitahuan Hari Ini
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.length ? notifications.map(notification => (
                  <button
                    key={notification.id}
                    onClick={() => markNotificationRead(notification.id)}
                    style={{ width: '100%', textAlign: 'left', fontSize: '12px', padding: '8px', backgroundColor: notification.read ? '#FFFFFF' : '#F9F7F1', borderRadius: '8px' }}
                  >
                    {notification.kind === 'task' ? '⏰' : notification.kind === 'schedule' ? '📚' : notification.kind === 'goal' ? '🎯' : notification.kind === 'event' ? '🗓️' : '💛'} <strong>{notification.title}</strong>: {notification.message}
                  </button>
                )) : <div style={{ fontSize: '12px', padding: '8px', color: 'var(--color-text-muted)' }}>Belum ada pengingat baru.</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
