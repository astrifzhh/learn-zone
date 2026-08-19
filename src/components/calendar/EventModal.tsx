import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { STICKER_PRESETS } from '../../types/planner'
import type { CalendarEvent, EventType } from '../../types/planner'

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: {
    event_date: string
    title: string
    event_type: EventType
    sticker_key: string | null
  }) => Promise<void>
  initialEvent?: CalendarEvent | null
  defaultDate?: string
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEvent,
  defaultDate,
}) => {
  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventType, setEventType] = useState<EventType>('exam')
  const [stickerKey, setStickerKey] = useState<string>('pencil')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title)
      setEventDate(initialEvent.event_date)
      setEventType(initialEvent.event_type as EventType)
      setStickerKey(initialEvent.sticker_key || 'pencil')
    } else {
      setTitle('')
      setEventDate(defaultDate || new Date().toISOString().split('T')[0])
      setEventType('exam')
      setStickerKey('pencil')
    }
    setError('')
  }, [initialEvent, defaultDate, isOpen])

  const handleEventTypeChange = (type: EventType) => {
    setEventType(type)
    if (type === 'exam') setStickerKey('pencil')
    else if (type === 'birthday') setStickerKey('cake')
    else if (type === 'assignment') setStickerKey('book')
    else if (type === 'holiday') setStickerKey('holiday')
    else if (type === 'group') setStickerKey('group')
    else setStickerKey('star')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Nama kegiatan / agenda wajib diisi')
      return
    }
    if (!eventDate) {
      setError('Tanggal kegiatan wajib dipilih')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await onSave({
        event_date: eventDate,
        title: title.trim(),
        event_type: eventType,
        sticker_key: stickerKey,
      })
      onClose()
    } catch {
      setError('Gagal menyimpan kegiatan.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialEvent ? 'Edit Kegiatan Kalender' : 'Tambah Kegiatan Baru'}
    >
      <form onSubmit={handleSubmit}>
        <div className="lz-form-group">
          <label className="lz-label" htmlFor="event-title">
            Nama Kegiatan / Agenda <span style={{ color: 'var(--color-action)' }}>*</span>
          </label>
          <input
            id="event-title"
            type="text"
            placeholder="Contoh: Ulangan Harian Bab 1 Matematika"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={160}
            autoFocus
          />
          {error && <div className="lz-input-error">{error}</div>}
        </div>

        <div className="lz-form-group">
          <label className="lz-label" htmlFor="event-date">
            Tanggal
          </label>
          <input
            id="event-date"
            type="date"
            value={eventDate}
            onChange={e => setEventDate(e.target.value)}
            required
          />
        </div>

        <div className="lz-form-group">
          <label className="lz-label" htmlFor="event-type">
            Jenis Kegiatan
          </label>
          <select
            id="event-type"
            value={eventType}
            onChange={e => handleEventTypeChange(e.target.value as EventType)}
          >
            <option value="exam">✏️ Ujian / Ulangan</option>
            <option value="assignment">📚 Tugas / PR</option>
            <option value="birthday">🎂 Ulang Tahun</option>
            <option value="holiday">🏖️ Liburan / Tanggal Merah</option>
            <option value="group">👥 Kerja Kelompok</option>
            <option value="other">⭐ Lainnya</option>
          </select>
        </div>

        <div className="lz-form-group">
          <label className="lz-label">Pilih Stiker Kalender</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {STICKER_PRESETS.map(s => {
              const isSelected = stickerKey === s.key
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStickerKey(s.key)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 4px',
                    borderRadius: '10px',
                    border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: isSelected ? 'var(--color-primary-soft)' : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{s.icon}</span>
                  <span style={{ fontSize: '10px', fontWeight: isSelected ? 700 : 500, textAlign: 'center' }}>
                    {s.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
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
            {isSubmitting ? 'Menyimpan...' : initialEvent ? 'Simpan Perubahan' : 'Tambah Kegiatan'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
