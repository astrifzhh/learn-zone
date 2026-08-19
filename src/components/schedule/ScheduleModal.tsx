import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { SUBJECT_PRESETS, DAY_NAMES_ID_MAP } from '../../types/planner'
import type { ScheduleEntry } from '../../types/planner'

interface ScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (entry: {
    day_of_week: number
    start_time: string
    end_time: string | null
    subject_name: string
    subject_color: string
  }) => Promise<void>
  initialEntry?: ScheduleEntry | null
  existingEntries: ScheduleEntry[]
  defaultDay: number
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEntry,
  existingEntries,
  defaultDay,
}) => {
  const [dayOfWeek, setDayOfWeek] = useState<number>(defaultDay)
  const [startTime, setStartTime] = useState('07:30')
  const [endTime, setEndTime] = useState('09:00')
  const [subjectName, setSubjectName] = useState(SUBJECT_PRESETS[0].name)
  const [subjectColor, setSubjectColor] = useState(SUBJECT_PRESETS[0].color)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [conflictWarning, setConflictWarning] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialEntry) {
      setDayOfWeek(initialEntry.day_of_week)
      setStartTime(initialEntry.start_time)
      setEndTime(initialEntry.end_time || '')
      setSubjectName(initialEntry.subject_name)
      setSubjectColor(initialEntry.subject_color || SUBJECT_PRESETS[0].color)
    } else {
      setDayOfWeek(defaultDay)
      setStartTime('07:30')
      setEndTime('09:00')
      setSubjectName(SUBJECT_PRESETS[0].name)
      setSubjectColor(SUBJECT_PRESETS[0].color)
    }
    setError('')
    setConflictWarning('')
  }, [initialEntry, isOpen, defaultDay])

  // Check conflicts
  useEffect(() => {
    if (!startTime || !endTime) return
    const conflicts = existingEntries.filter(
      e =>
        e.day_of_week === dayOfWeek &&
        (!initialEntry || e.id !== initialEntry.id) &&
        startTime < (e.end_time || '23:59') &&
        endTime > e.start_time
    )

    if (conflicts.length > 0) {
      setConflictWarning(
        `⚠️ Peringatan: Jam ini bertabrakan dengan jadwal "${conflicts[0].subject_name}" (${conflicts[0].start_time} - ${conflicts[0].end_time || ''}).`
      )
    } else {
      setConflictWarning('')
    }
  }, [dayOfWeek, startTime, endTime, existingEntries, initialEntry])

  const handleSubjectChange = (name: string) => {
    if (name === 'Lainnya') {
      setSubjectName('')
      return
    }
    setSubjectName(name)
    const preset = SUBJECT_PRESETS.find(p => p.name === name)
    if (preset) setSubjectColor(preset.color)
  }

  const hasConflict = existingEntries.some(
    entry =>
      entry.day_of_week === dayOfWeek &&
      (!initialEntry || entry.id !== initialEntry.id) &&
      startTime < (entry.end_time || '23:59') &&
      (endTime || '23:59') > entry.start_time
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subjectName.trim()) {
      setError('Nama mata pelajaran wajib diisi')
      return
    }
    if (!endTime) {
      setError('Jam selesai wajib diisi')
      return
    }
    if (endTime <= startTime) {
      setError('Jam selesai harus setelah jam mulai')
      return
    }
    if (hasConflict) {
      setError('Jam pelajaran bertabrakan dengan jadwal lain pada hari yang sama')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await onSave({
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime || null,
        subject_name: subjectName.trim(),
        subject_color: subjectColor,
      })
      onClose()
    } catch {
      setError('Gagal menyimpan jadwal kelas.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialEntry ? 'Edit Jadwal Pelajaran' : 'Tambah Jadwal Pelajaran'}
    >
      <form onSubmit={handleSubmit}>
        <div className="lz-form-group">
          <label className="lz-label" htmlFor="sched-day">
            Hari
          </label>
          <select
            id="sched-day"
            value={dayOfWeek}
            onChange={e => setDayOfWeek(Number(e.target.value))}
          >
            {Object.entries(DAY_NAMES_ID_MAP).map(([num, name]) => (
              <option key={num} value={num}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="lz-form-group">
          <label className="lz-label" htmlFor="sched-subject">
            Mata Pelajaran
          </label>
          <select
            id="sched-subject"
            value={SUBJECT_PRESETS.some(subject => subject.name === subjectName) ? subjectName : 'Lainnya'}
            onChange={e => handleSubjectChange(e.target.value)}
          >
            {SUBJECT_PRESETS.map(subj => (
              <option key={subj.name} value={subj.name}>
                {subj.name}
              </option>
            ))}
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        {(!SUBJECT_PRESETS.some(subject => subject.name === subjectName) || subjectName === '') && (
          <div className="lz-form-group">
            <label className="lz-label" htmlFor="sched-custom-subject">
              Nama Mata Pelajaran
            </label>
            <input
              id="sched-custom-subject"
              type="text"
              value={subjectName}
              onChange={e => setSubjectName(e.target.value)}
              placeholder="Contoh: Bahasa Daerah"
              maxLength={80}
              required
            />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="lz-form-group">
            <label className="lz-label" htmlFor="sched-start">
              Jam Mulai
            </label>
            <input
              id="sched-start"
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              required
            />
          </div>

          <div className="lz-form-group">
            <label className="lz-label" htmlFor="sched-end">
              Jam Selesai
            </label>
            <input
              id="sched-end"
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        {conflictWarning && (
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: '#FFF8E1',
              border: '1px solid #FFE082',
              color: '#8A5300',
              borderRadius: '10px',
              fontSize: '12px',
              marginBottom: '16px',
            }}
          >
            {conflictWarning}
          </div>
        )}

        {error && <div className="lz-input-error" style={{ marginBottom: '14px' }}>{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
          <button
            type="button"
            className="lz-btn lz-btn-ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            type="submit"
            className="lz-btn lz-btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : initialEntry ? 'Simpan Perubahan' : 'Tambah Jadwal'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
