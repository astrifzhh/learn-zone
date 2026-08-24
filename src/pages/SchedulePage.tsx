import React, { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { usePlanner } from '../context/PlannerContext'
import { ScheduleGrid } from '../components/schedule/ScheduleGrid'
import { ScheduleModal } from '../components/schedule/ScheduleModal'
import type { ScheduleEntry } from '../types/planner'

export const SchedulePage: React.FC = () => {
  const { schedule, addScheduleEntry, updateScheduleEntry, deleteScheduleEntry } = usePlanner()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null)
  const [visibleDays, setVisibleDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [hiddenDays, setHiddenDays] = useState<number[]>([])
  const [selectedDay, setSelectedDay] = useState(1)

  useEffect(() => {
    const storedDays = schedule.map(entry => entry.day_of_week)
    setVisibleDays(current => Array.from(new Set([...current, ...storedDays]))
      .filter(day => !hiddenDays.includes(day))
      .sort((a, b) => a - b))
  }, [schedule, hiddenDays])

  const handleAddForDay = (day: number) => {
    setSelectedDay(day)
    setEditingEntry(null)
    setIsModalOpen(true)
  }

  const handleEdit = (entry: ScheduleEntry) => {
    setEditingEntry(entry)
    setIsModalOpen(true)
  }

  const handleRemoveDay = (day: number) => {
    setHiddenDays(current => [...current, day])
    setVisibleDays(current => current.filter(item => item !== day))
  }

  const handleSave = async (data: {
    day_of_week: number
    start_time: string
    end_time: string | null
    subject_name: string
    subject_color: string
  }) => {
    if (editingEntry) {
      await updateScheduleEntry(editingEntry.id, data)
    } else {
      await addScheduleEntry(data)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Jadwal Pelajaran Mingguan</h2>
            <span className="lz-chip lz-chip-primary">
              {visibleDays.includes(6) ? 'Senin – Sabtu' : 'Senin – Jumat'}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Atur mata pelajaran harianmu dan dapatkan peringatan otomatis jika ada jam yang bertabrakan
          </p>
        </div>

        <button
          onClick={() => {
            const nextDay = [1, 2, 3, 4, 5, 6].find(day => !visibleDays.includes(day))
            if (nextDay) {
              setHiddenDays(current => current.filter(day => day !== nextDay))
              setVisibleDays(current => [...current, nextDay].sort((a, b) => a - b))
            }
          }}
          className="lz-btn lz-btn-primary"
          disabled={visibleDays.length >= 7}
        >
          <Plus size={16} />
          <span>{visibleDays.length >= 7 ? 'Semua Hari Ditampilkan' : 'Tambah Hari'}</span>
        </button>
      </div>

      <ScheduleGrid
        schedule={schedule}
        days={visibleDays}
        onAddForDay={handleAddForDay}
        onEdit={handleEdit}
        onDelete={deleteScheduleEntry}
        onRemoveDay={handleRemoveDay}
      />

      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialEntry={editingEntry}
        existingEntries={schedule}
        defaultDay={selectedDay}
      />
    </div>
  )
}
