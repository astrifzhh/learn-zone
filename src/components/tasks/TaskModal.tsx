import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { SUBJECT_PRESETS } from '../../types/planner'
import type { Task } from '../../types/planner'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: {
    title: string
    subject_name: string
    subject_color: string
    due_at: string | null
    is_completed: boolean
  }) => Promise<void>
  initialTask?: Task | null
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
}) => {
  const [title, setTitle] = useState('')
  const [subjectName, setSubjectName] = useState(SUBJECT_PRESETS[0].name)
  const [subjectColor, setSubjectColor] = useState(SUBJECT_PRESETS[0].color)
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('16:00')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title)
      setSubjectName(initialTask.subject_name || SUBJECT_PRESETS[0].name)
      setSubjectColor(initialTask.subject_color || SUBJECT_PRESETS[0].color)
      if (initialTask.due_at) {
        const d = new Date(initialTask.due_at)
        setDueDate(d.toISOString().split('T')[0])
        setDueTime(`${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`)
      } else {
        setDueDate(new Date().toISOString().split('T')[0])
        setDueTime('16:00')
      }
    } else {
      setTitle('')
      setSubjectName(SUBJECT_PRESETS[0].name)
      setSubjectColor(SUBJECT_PRESETS[0].color)
      setDueDate(new Date().toISOString().split('T')[0])
      setDueTime('16:00')
    }
    setError('')
  }, [initialTask, isOpen])

  const handleSubjectChange = (name: string) => {
    if (name === 'Lainnya') {
      setSubjectName('')
      return
    }
    setSubjectName(name)
    const preset = SUBJECT_PRESETS.find(p => p.name === name)
    if (preset) setSubjectColor(preset.color)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Judul tugas wajib diisi')
      return
    }

    setIsSubmitting(true)
    setError('')

    let fullDueAt: string | null = null
    if (dueDate) {
      fullDueAt = new Date(`${dueDate}T${dueTime || '00:00'}:00`).toISOString()
    }

    try {
      await onSave({
        title: title.trim(),
        subject_name: subjectName,
        subject_color: subjectColor,
        due_at: fullDueAt,
        is_completed: initialTask ? initialTask.is_completed : false,
      })
      onClose()
    } catch {
      setError('Gagal menyimpan tugas. Coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTask ? 'Edit Tugas' : 'Tambah Tugas Baru'}
    >
      <form onSubmit={handleSubmit}>
        <div className="lz-form-group">
          <label className="lz-label" htmlFor="task-title">
            Judul Tugas / PR <span style={{ color: 'var(--color-action)' }}>*</span>
          </label>
          <input
            id="task-title"
            type="text"
            placeholder="Contoh: Latihan Soal Matematika Bab 2 Hal 34"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={160}
            autoFocus
          />
          {error && <div className="lz-input-error">{error}</div>}
        </div>

        <div className="lz-form-group">
          <label className="lz-label" htmlFor="task-subject">
            Mata Pelajaran
          </label>
          <select
            id="task-subject"
            value={subjectName}
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
            <label className="lz-label" htmlFor="task-custom-subject">Nama Mata Pelajaran</label>
            <input id="task-custom-subject" type="text" value={subjectName} onChange={e => setSubjectName(e.target.value)} placeholder="Contoh: Bahasa Daerah" maxLength={80} required />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="lz-form-group">
            <label className="lz-label" htmlFor="task-date">
              Tenggat Tanggal
            </label>
            <input
              id="task-date"
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>

          <div className="lz-form-group">
            <label className="lz-label" htmlFor="task-time">
              Jam (Opsional)
            </label>
            <input
              id="task-time"
              type="time"
              value={dueTime}
              onChange={e => setDueTime(e.target.value)}
            />
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
            {isSubmitting ? 'Menyimpan...' : initialTask ? 'Simpan Perubahan' : 'Tambah Tugas'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
