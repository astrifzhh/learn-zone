import React from 'react'
import { Plus, Edit2, Trash2, Clock } from 'lucide-react'
import type { ScheduleEntry } from '../../types/planner'
import { DAY_NAMES_ID_MAP } from '../../types/planner'

interface ScheduleGridProps {
  schedule: ScheduleEntry[]
  days: number[]
  onAddForDay: (day: number) => void
  onEdit: (entry: ScheduleEntry) => void
  onDelete: (id: string) => void
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  schedule,
  days,
  onAddForDay,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
      }}
    >
      {days.map(day => {
        const dayName = DAY_NAMES_ID_MAP[day]
        const entries = schedule
          .filter(e => e.day_of_week === day)
          .sort((a, b) => a.start_time.localeCompare(b.start_time))

        return (
          <div
            key={day}
            className="lz-card"
            style={{
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '340px',
            }}
          >
            {/* Day Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
                borderBottom: '1.5px solid var(--color-border-subtle)',
                paddingBottom: '8px',
              }}
            >
              <h4 style={{ fontSize: '16px', fontWeight: 700 }}>{dayName}</h4>
              <button
                onClick={() => onAddForDay(day)}
                className="lz-btn-ghost"
                style={{
                  padding: '4px 6px',
                  borderRadius: '6px',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  fontSize: '12px',
                }}
                title={`Tambah jadwal ${dayName}`}
              >
                <Plus size={14} />
                <span>Tambah</span>
              </button>
            </div>

            {/* Entries List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              {entries.length === 0 ? (
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--color-text-muted)',
                    textAlign: 'center',
                    padding: '24px 8px',
                    backgroundColor: '#FAF8F3',
                    borderRadius: '10px',
                    border: '1px dashed var(--color-border)',
                  }}
                >
                  Belum ada jadwal
                </div>
              ) : (
                entries.map(item => {
                  const color = item.subject_color || '#2196F3'
                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: '#FAF8F3',
                        borderRadius: '10px',
                        borderLeft: `4px solid ${color}`,
                        border: '1px solid var(--color-border-subtle)',
                        borderLeftWidth: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '6px',
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
                          {item.subject_name}
                        </span>
                        <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                          <button
                            onClick={() => onEdit(item)}
                            style={{
                              padding: '2px',
                              color: 'var(--color-text-muted)',
                              borderRadius: '4px',
                            }}
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => onDelete(item.id)}
                            style={{
                              padding: '2px',
                              color: 'var(--color-action)',
                              borderRadius: '4px',
                            }}
                            title="Hapus"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--color-text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Clock size={11} />
                        <span>
                          {item.start_time} - {item.end_time || 'Selesai'}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
