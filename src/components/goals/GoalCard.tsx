import React from 'react'
import { Trophy, Award, Edit2, Trash2, Plus, Minus } from 'lucide-react'
import type { SemesterGoal } from '../../types/planner'

interface GoalCardProps {
  goal: SemesterGoal
  onUpdateProgress: (id: string, progress: number) => void
  onEdit: (goal: SemesterGoal) => void
  onDelete: (id: string) => void
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onUpdateProgress,
  onEdit,
  onDelete,
}) => {
  const is100 = goal.progress_percent >= 100

  const handleAdjust = (delta: number) => {
    const nextVal = Math.min(100, Math.max(0, goal.progress_percent + delta))
    onUpdateProgress(goal.id, nextVal)
  }

  return (
    <div
      className="lz-card"
      style={{
        padding: '20px',
        border: is100 ? '2px solid #FFD54F' : '1px solid var(--color-border)',
        boxShadow: is100 ? '0 6px 18px rgba(255, 184, 0, 0.18)' : 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-text-muted)',
              backgroundColor: '#FAF8F3',
              padding: '3px 8px',
              borderRadius: '6px',
              display: 'inline-block',
              marginBottom: '8px',
            }}
          >
            {goal.semester_label || 'Semester 1'}
          </span>
          <h4 style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.35, color: 'var(--color-text)' }}>
            {goal.goal_text}
          </h4>
        </div>

        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          <button
            onClick={() => onEdit(goal)}
            style={{ padding: '4px', color: 'var(--color-text-muted)' }}
            title="Edit Target"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            style={{ padding: '4px', color: 'var(--color-action)' }}
            title="Hapus Target"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Progress & Badge */}
      <div style={{ marginTop: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '6px',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          <span style={{ color: 'var(--color-text-muted)' }}>Capaian Target</span>
          <span style={{ color: is100 ? '#D48800' : 'var(--color-primary)' }}>
            {goal.progress_percent}%
          </span>
        </div>

        {/* Bar */}
        <div
          style={{
            height: '10px',
            backgroundColor: '#EBE5D8',
            borderRadius: '999px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${goal.progress_percent}%`,
              backgroundColor: is100 ? '#FFB800' : 'var(--color-primary)',
              borderRadius: '999px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Quick adjustments */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => handleAdjust(-10)}
              disabled={goal.progress_percent <= 0}
              className="lz-btn lz-btn-ghost lz-btn-sm"
              style={{ padding: '4px 8px', fontSize: '11px', minHeight: '28px' }}
              title="Kurangi 10%"
            >
              <Minus size={12} />
              <span>10%</span>
            </button>
            <button
              onClick={() => handleAdjust(10)}
              disabled={goal.progress_percent >= 100}
              className="lz-btn lz-btn-secondary lz-btn-sm"
              style={{ padding: '4px 8px', fontSize: '11px', minHeight: '28px' }}
              title="Tambah 10%"
            >
              <Plus size={12} />
              <span>10%</span>
            </button>
            {!is100 && (
              <button
                onClick={() => onUpdateProgress(goal.id, 100)}
                className="lz-btn lz-btn-success lz-btn-sm"
                style={{ padding: '4px 8px', fontSize: '11px', minHeight: '28px' }}
              >
                Selesai 100%
              </button>
            )}
          </div>

          {/* Badge indicator */}
          {is100 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'var(--color-achievement-soft)',
                color: '#D48800',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 800,
              }}
            >
              <Trophy size={14} />
              <span>Lencana Emas 🏆</span>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--color-text-muted)',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              <Award size={13} />
              <span>Kunci lencana di 100%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
