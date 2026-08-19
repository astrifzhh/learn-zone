import React, { useState, useMemo } from 'react'
import { Plus, Search, Sparkles, CheckCircle2 } from 'lucide-react'
import { usePlanner } from '../context/PlannerContext'
import { TaskItem } from '../components/tasks/TaskItem'
import { TaskModal } from '../components/tasks/TaskModal'
import { SUBJECT_PRESETS } from '../types/planner'
import type { Task } from '../types/planner'

export const TasksPage: React.FC = () => {
  const { tasks, addTask, updateTask, toggleTaskComplete, deleteTask } = usePlanner()

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'today'>('all')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const todayStr = new Date().toISOString().split('T')[0]

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search
      if (searchQuery.trim() && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Subject Filter
      if (selectedSubject !== 'all' && task.subject_name !== selectedSubject) {
        return false
      }

      // Status / Date Filter
      if (activeFilter === 'pending') return !task.is_completed
      if (activeFilter === 'completed') return task.is_completed
      if (activeFilter === 'today') {
        if (!task.due_at) return true
        return task.due_at.startsWith(todayStr)
      }

      return true
    })
  }, [tasks, activeFilter, selectedSubject, searchQuery, todayStr])

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
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
            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Daftar Tugas & PR</h2>
            <span className="lz-chip lz-chip-achievement">
              <Sparkles size={12} />
              <span>{completedCount}/{totalCount} Selesai</span>
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Catat semua PR, tugas kelompok, dan ulangan harianmu
          </p>
        </div>

        <button onClick={handleAddNew} className="lz-btn lz-btn-primary">
          <Plus size={16} />
          <span>Tambah Tugas Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="lz-card"
        style={{
          padding: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'Semua' },
            { id: 'pending', label: 'Belum Selesai' },
            { id: 'completed', label: 'Selesai' },
            { id: 'today', label: 'Hari Ini' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as 'all' | 'pending' | 'completed' | 'today')}
              className={activeFilter === tab.id ? 'lz-btn lz-btn-secondary lz-btn-sm' : 'lz-btn lz-btn-ghost lz-btn-sm'}
              style={{ fontWeight: activeFilter === tab.id ? 800 : 600 }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Subject Select */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '200px' }}>
            <Search
              size={14}
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
            />
            <input
              type="text"
              placeholder="Cari tugas..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '30px', paddingRight: '10px', height: '36px', fontSize: '12px' }}
            />
          </div>

          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            style={{ height: '36px', fontSize: '12px', width: 'auto' }}
          >
            <option value="all">Semua Mata Pelajaran</option>
            {SUBJECT_PRESETS.map(s => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="lz-card" style={{ padding: '20px', minHeight: '350px' }}>
        {filteredTasks.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--color-text-muted)',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-soft)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-text)' }}>
                Tidak ada tugas yang sesuai filter
              </div>
              <div style={{ fontSize: '13px', marginTop: '2px' }}>
                Coba ubah filter atau tambahkan tugas baru.
              </div>
            </div>
            <button onClick={handleAddNew} className="lz-btn lz-btn-secondary lz-btn-sm">
              <Plus size={14} />
              <span>Tambah Tugas Baru</span>
            </button>
          </div>
        ) : (
          filteredTasks.map(task => (
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
