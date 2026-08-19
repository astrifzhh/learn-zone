import React, { useState } from 'react'
import { Plus, Sparkles, CheckCircle2 } from 'lucide-react'
import { usePlanner } from '../../context/PlannerContext'
import { TaskItem } from '../tasks/TaskItem'
import { TaskModal } from '../tasks/TaskModal'
import type { Task } from '../../types/planner'

export const DailyTaskCard: React.FC = () => {
  const { tasks, addTask, updateTask, toggleTaskComplete, deleteTask } = usePlanner()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Prioritize today's tasks or incomplete tasks
  const todayTasks = tasks.slice(0, 5) // Show top 5 on dashboard
  const completedCount = tasks.filter(t => t.is_completed).length
  const totalCount = tasks.length

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  const handleSaveTask = async (taskData: {
    title: string
    subject_name: string
    subject_color: string
    due_at: string | null
    is_completed: boolean
  }) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData)
    } else {
      await addTask(taskData)
    }
  }

  return (
    <div className="lz-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="lz-card-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 className="lz-card-title">Tugas Hari Ini</h3>
            <span
              className="lz-chip lz-chip-achievement"
              style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Sparkles size={12} />
              <span>{completedCount}/{totalCount} selesai</span>
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Selesaikan tugasmu satu per satu & raih bintang!
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="lz-btn lz-btn-primary lz-btn-sm"
          style={{ whiteSpace: 'nowrap' }}
        >
          <Plus size={16} />
          <span>Tambah Tugas</span>
        </button>
      </div>

      {/* Task List */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '310px', paddingRight: '4px' }}>
        {todayTasks.length === 0 ? (
          <div
            style={{
              padding: '36px 16px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--color-text-muted)',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-success-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-success)',
              }}
            >
              <CheckCircle2 size={30} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text)' }}>
                Belum ada tugas hari ini!
              </div>
              <div style={{ fontSize: '13px', marginTop: '2px' }}>
                Nikmati waktu istirahat atau tambahkan tugas barumu.
              </div>
            </div>
            <button onClick={handleAddNew} className="lz-btn lz-btn-secondary lz-btn-sm">
              <Plus size={14} />
              <span>Tambah Tugas Baru</span>
            </button>
          </div>
        ) : (
          todayTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTaskComplete}
              onEdit={handleEdit}
              onDelete={deleteTask}
            />
          ))
        )}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
      />
    </div>
  )
}
