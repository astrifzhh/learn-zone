import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import type { SemesterGoal } from '../../types/planner'

interface GoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (goal: {
    goal_text: string
    progress_percent: number
    semester_label: string
  }) => Promise<void>
  initialGoal?: SemesterGoal | null
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialGoal,
}) => {
  const [goalText, setGoalText] = useState('')
  const [progressPercent, setProgressPercent] = useState<number>(0)
  const [semesterLabel, setSemesterLabel] = useState('Semester Ganjil 2026/2027')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialGoal) {
      setGoalText(initialGoal.goal_text)
      setProgressPercent(initialGoal.progress_percent)
      setSemesterLabel(initialGoal.semester_label || 'Semester Ganjil 2026/2027')
    } else {
      setGoalText('')
      setProgressPercent(0)
      setSemesterLabel('Semester Ganjil 2026/2027')
    }
    setError('')
  }, [initialGoal, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!goalText.trim()) {
      setError('Tuliskan target semester belajarmu')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await onSave({
        goal_text: goalText.trim(),
        progress_percent: progressPercent,
        semester_label: semesterLabel.trim(),
      })
      onClose()
    } catch {
      setError('Gagal menyimpan target semester.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialGoal ? 'Edit Target Semester' : 'Tambah Target Semester Baru'}
    >
      <form onSubmit={handleSubmit}>
        <div className="lz-form-group">
          <label className="lz-label" htmlFor="goal-text">
            Target Belajar / Akademik <span style={{ color: 'var(--color-action)' }}>*</span>
          </label>
          <textarea
            id="goal-text"
            rows={3}
            placeholder="Contoh: Mendapatkan nilai minimal 85 pada Ujian Akhir Matematika & IPA"
            value={goalText}
            onChange={e => setGoalText(e.target.value)}
            maxLength={240}
            autoFocus
          />
          {error && <div className="lz-input-error">{error}</div>}
        </div>

        <div className="lz-form-group">
          <label className="lz-label" htmlFor="goal-semester">
            Periode Semester
          </label>
          <input
            id="goal-semester"
            type="text"
            value={semesterLabel}
            onChange={e => setSemesterLabel(e.target.value)}
            placeholder="Contoh: Semester Ganjil 2026/2027"
          />
        </div>

        <div className="lz-form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label className="lz-label" htmlFor="goal-progress" style={{ margin: 0 }}>
              Progres Capaian
            </label>
            <span style={{ fontWeight: 700, color: progressPercent === 100 ? '#D48800' : 'var(--color-primary)' }}>
              {progressPercent}% {progressPercent === 100 && '🏆 Lencana Emas!'}
            </span>
          </div>
          <input
            id="goal-progress"
            type="range"
            min="0"
            max="100"
            step="5"
            value={progressPercent}
            onChange={e => setProgressPercent(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
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
            {isSubmitting ? 'Menyimpan...' : initialGoal ? 'Simpan Target' : 'Tambah Target'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
