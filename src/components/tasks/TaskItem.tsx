import React from 'react'
import { Check, Clock, Trash2, Edit3 } from 'lucide-react'
import type { Task } from '../../types/planner'

interface TaskItemProps {
  task: Task
  onToggle: (id: string, coords?: { x: number; y: number }) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const handleCheckboxClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    onToggle(task.id, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
  }

  // Format due time or date
  let dueDisplay = ''
  if (task.due_at) {
    const dueDate = new Date(task.due_at)
    const hours = dueDate.getHours().toString().padStart(2, '0')
    const mins = dueDate.getMinutes().toString().padStart(2, '0')
    if (hours !== '00' || mins !== '00') {
      dueDisplay = `${hours}:${mins}`
    } else {
      dueDisplay = `${dueDate.getDate()}/${dueDate.getMonth() + 1}`
    }
  }

  const subjectColor = task.subject_color || '#2196F3'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px',
        borderRadius: '12px',
        backgroundColor: task.is_completed ? '#FAF8F3' : '#FFFFFF',
        border: '1.5px solid',
        borderColor: task.is_completed ? 'var(--color-border-subtle)' : 'var(--color-border)',
        marginBottom: '10px',
        transition: 'all 0.2s ease',
        opacity: task.is_completed ? 0.75 : 1,
      }}
    >
      {/* Left: Checkbox & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
        <button
          type="button"
          onClick={handleCheckboxClick}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '7px',
            border: `2px solid ${task.is_completed ? 'var(--color-success)' : 'var(--color-border)'}`,
            backgroundColor: task.is_completed ? 'var(--color-success)' : '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
          aria-label={task.is_completed ? 'Batalkan selesai' : 'Tandai selesai'}
        >
          {task.is_completed && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
        </button>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: task.is_completed ? 'var(--color-text-muted)' : 'var(--color-text)',
              textDecoration: task.is_completed ? 'line-through' : 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {task.title}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            {task.subject_name && (
              <span
                className="lz-subject-tag"
                style={{
                  backgroundColor: `${subjectColor}18`,
                  color: subjectColor,
                  border: `1px solid ${subjectColor}40`,
                }}
              >
                {task.subject_name}
              </span>
            )}

            {dueDisplay && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <Clock size={12} />
                <span>{dueDisplay}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '12px' }}>
        <button
          onClick={() => onEdit(task)}
          style={{
            padding: '6px',
            color: 'var(--color-text-muted)',
            borderRadius: '6px',
            display: 'flex',
          }}
          title="Edit Tugas"
          aria-label="Edit Tugas"
        >
          <Edit3 size={15} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          style={{
            padding: '6px',
            color: 'var(--color-action)',
            borderRadius: '6px',
            display: 'flex',
          }}
          title="Hapus Tugas"
          aria-label="Hapus Tugas"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
