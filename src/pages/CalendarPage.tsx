import React, { useState } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { usePlanner } from '../context/PlannerContext'
import { CalendarGrid } from '../components/calendar/CalendarGrid'
import { EventModal } from '../components/calendar/EventModal'
import { STICKER_PRESETS } from '../types/planner'
import type { CalendarEvent, EventType } from '../types/planner'

export const CalendarPage: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent } = usePlanner()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])

  const handleAddEvent = (dateStr: string) => {
    setSelectedDate(dateStr)
    setEditingEvent(null)
    setIsModalOpen(true)
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event)
    setSelectedDate(event.event_date)
    setIsModalOpen(true)
  }

  const handleSave = async (data: {
    event_date: string
    title: string
    event_type: EventType
    sticker_key: string | null
  }) => {
    if (editingEvent) {
      await updateEvent(editingEvent.id, data)
    } else {
      await addEvent(data)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Kalender & Agenda Bulanan</h2>
            <span className="lz-chip lz-chip-primary">
              <Sparkles size={12} />
              <span>{events.length} Agenda Tercatat</span>
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Tandai ujian, ulang tahun teman, libur sekolah, dan tugas kelompok dengan stiker lucu
          </p>
        </div>

        <button
          onClick={() => handleAddEvent(selectedDate)}
          className="lz-btn lz-btn-primary"
        >
          <Plus size={16} />
          <span>Tambah Agenda Baru</span>
        </button>
      </div>

      {/* Stickers quick banner */}
      <div
        className="lz-card"
        style={{
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          overflowX: 'auto',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
          Stiker Kalender:
        </span>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          {STICKER_PRESETS.map(s => (
            <div
              key={s.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{s.icon}</span>
              <span style={{ fontWeight: 600 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Grid */}
      <CalendarGrid
        events={events}
        onAddEvent={handleAddEvent}
        onEditEvent={handleEditEvent}
        onDeleteEvent={deleteEvent}
      />

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialEvent={editingEvent}
        defaultDate={selectedDate}
      />
    </div>
  )
}
