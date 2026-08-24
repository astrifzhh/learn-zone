import React from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { usePlanner } from '../context/PlannerContext'

const icons = {
  task: '⏰',
  goal: '🎯',
  schedule: '📚',
  event: '🗓️',
  mood: '💛',
}

export const NotificationHistoryPage: React.FC = () => {
  const { notificationHistory, markNotificationRead, markAllNotificationsRead } = usePlanner()
  const unreadCount = notificationHistory.filter(item => !item.read).length

  return (
    <div className="notification-history-page" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-heading-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Riwayat Notifikasi</h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>{unreadCount} notifikasi belum dibaca</p>
        </div>
        <button className="lz-btn lz-btn-secondary" onClick={markAllNotificationsRead} disabled={!unreadCount}>
          <CheckCheck size={16} /> Tandai semua dibaca
        </button>
      </div>

      <div className="lz-card" style={{ padding: '12px' }}>
        {notificationHistory.length === 0 ? (
          <div style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Bell size={30} />
            <p style={{ marginTop: '10px' }}>Belum ada riwayat notifikasi.</p>
          </div>
        ) : notificationHistory.map(item => (
          <button
            key={item.id}
            onClick={() => markNotificationRead(item.id)}
            style={{ display: 'flex', width: '100%', alignItems: 'flex-start', gap: '12px', textAlign: 'left', padding: '14px 12px', borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: item.read ? '#FFFFFF' : 'var(--color-primary-soft)' }}
          >
            <span style={{ fontSize: '20px' }}>{icons[item.kind]}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ display: 'block', fontSize: '13px' }}>{item.title}</strong>
              <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '3px' }}>{item.message}</span>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '5px' }}>{item.dueDate}</span>
            </span>
            {!item.read && <span className="lz-chip lz-chip-primary">Baru</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
