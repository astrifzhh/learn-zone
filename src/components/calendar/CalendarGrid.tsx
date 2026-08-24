import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2 } from 'lucide-react'
import type { CalendarEvent } from '../../types/planner'
import { STICKER_PRESETS } from '../../types/planner'

interface CalendarGridProps {
  events: CalendarEvent[]
  onAddEvent: (dateStr: string) => void
  onEditEvent: (event: CalendarEvent) => void
  onDeleteEvent: (id: string) => void
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  events,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  // Days calculations
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days: { dayNumber: number | null; dateStr: string | null }[] = []

  // Preceding empty slots
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push({ dayNumber: null, dateStr: null })
  }

  // Days of month
  for (let i = 1; i <= daysInMonth; i++) {
    const monthStr = (month + 1).toString().padStart(2, '0')
    const dayStr = i.toString().padStart(2, '0')
    days.push({ dayNumber: i, dateStr: `${year}-${monthStr}-${dayStr}` })
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const selectedEvents = events.filter(e => e.event_date === selectedDateStr)

  return (
    <div className="calendar-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
      {/* Calendar Grid Left */}
      <div className="lz-card" style={{ padding: '24px' }}>
        {/* Navigation Bar */}
        <div
          className="calendar-toolbar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <div className="calendar-month-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700 }}>
              {monthNames[month]} {year}
            </h3>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="lz-btn lz-btn-secondary lz-btn-sm"
              style={{ fontSize: '11px', padding: '3px 8px', minHeight: '28px' }}
            >
              Bulan Ini
            </button>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={prevMonth}
              className="lz-btn-ghost"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Bulan Sebelumnya"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextMonth}
              className="lz-btn-ghost"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Bulan Berikutnya"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '13px',
            color: 'var(--color-text-muted)',
            marginBottom: '10px',
          }}
        >
          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((w, idx) => (
            <div key={w} style={{ color: idx === 0 ? 'var(--color-action)' : 'var(--color-text-muted)' }}>
              {w}
            </div>
          ))}
        </div>

        {/* Days Matrix */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px',
          }}
        >
          {days.map((d, index) => {
            if (!d.dayNumber || !d.dateStr) {
              return (
                <div
                  key={`empty-${index}`}
                  style={{
                    minHeight: '76px',
                    borderRadius: '10px',
                    backgroundColor: '#FAF8F3',
                    opacity: 0.35,
                  }}
                />
              )
            }

            const isToday = d.dateStr === todayStr
            const isSelected = d.dateStr === selectedDateStr
            const dayEvents = events.filter(e => e.event_date === d.dateStr)

            return (
              <div
                key={d.dateStr}
                onClick={() => setSelectedDateStr(d.dateStr!)}
                style={{
                  minHeight: '76px',
                  borderRadius: '12px',
                  padding: '6px',
                  backgroundColor: isSelected ? 'var(--color-primary-soft)' : '#FFFFFF',
                  border: isSelected
                    ? '2px solid var(--color-primary)'
                    : isToday
                    ? '2px solid var(--color-action)'
                    : '1px solid var(--color-border)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Date number */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: isToday ? 'var(--color-action)' : 'var(--color-text)',
                    }}
                  >
                    {d.dayNumber}
                  </span>
                  {dayEvents.length > 0 && (
                    <span style={{ fontSize: '12px' }}>
                      {STICKER_PRESETS.find(s => s.key === dayEvents[0].sticker_key)?.icon || '⭐'}
                    </span>
                  )}
                </div>

                {/* Event titles preview */}
                <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {dayEvents.slice(0, 2).map(evt => (
                    <div
                      key={evt.id}
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: '#FAF7ED',
                        color: 'var(--color-text)',
                        borderRadius: '4px',
                        padding: '1px 4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      {evt.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                      +{dayEvents.length - 2} lainnya
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Date Detail Panel Right */}
      <div className="lz-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            borderBottom: '1.5px solid var(--color-border-subtle)',
            paddingBottom: '10px',
          }}
        >
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Agenda Tanggal</h4>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {selectedDateStr}
            </span>
          </div>
          <button
            onClick={() => onAddEvent(selectedDateStr)}
            className="lz-btn lz-btn-primary lz-btn-sm"
          >
            <Plus size={14} />
            <span>Tambah</span>
          </button>
        </div>

        {/* Selected Date Events */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
          {selectedEvents.length === 0 ? (
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                padding: '24px 12px',
                backgroundColor: '#FAF8F3',
                borderRadius: '10px',
              }}
            >
              Tidak ada agenda di tanggal ini.
            </div>
          ) : (
            selectedEvents.map(event => {
              const sticker = STICKER_PRESETS.find(s => s.key === event.sticker_key)
              return (
                <div
                  key={event.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    backgroundColor: '#FAF8F3',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>{sticker?.icon || '⭐'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
                      {event.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {sticker?.label || 'Kegiatan'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <button
                      onClick={() => onEditEvent(event)}
                      style={{ padding: '3px', color: 'var(--color-text-muted)' }}
                      title="Edit"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => onDeleteEvent(event.id)}
                      style={{ padding: '3px', color: 'var(--color-action)' }}
                      title="Hapus"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
