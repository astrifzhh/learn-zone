import React from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { FocusSession } from '../../types/planner'

interface FocusHistoryListProps {
  sessions: FocusSession[]
}

export const FocusHistoryList: React.FC<FocusHistoryListProps> = ({ sessions }) => {
  return (
    <div className="lz-card" style={{ padding: '20px' }}>
      <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
        Riwayat Sesi Fokus Belajar
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
        {sessions.length === 0 ? (
          <div
            style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              padding: '24px',
              backgroundColor: '#FAF8F3',
              borderRadius: '10px',
            }}
          >
            Belum ada sesi fokus yang tercatat. Mulai sesi pertamamu sekarang!
          </div>
        ) : (
          sessions.map(s => {
            const startDate = new Date(s.started_at)
            const dateStr = `${startDate.getDate()}/${startDate.getMonth() + 1}`
            const timeStr = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`

            const isSuccess = s.status === 'completed'

            return (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  backgroundColor: '#FAF8F3',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isSuccess ? (
                    <CheckCircle2 size={18} color="var(--color-success)" />
                  ) : (
                    <XCircle size={18} color="var(--color-action)" />
                  )}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>
                      Sesi Fokus {s.focus_minutes} Menit
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      {dateStr} pukul {timeStr}
                    </div>
                  </div>
                </div>

                <span
                  className="lz-chip"
                  style={{
                    backgroundColor: isSuccess ? 'var(--color-success-soft)' : 'var(--color-action-soft)',
                    color: isSuccess ? 'var(--color-success)' : 'var(--color-action)',
                    fontSize: '10px',
                    fontWeight: 700,
                  }}
                >
                  {isSuccess ? 'SELESAI' : 'DIBATALKAN'}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
