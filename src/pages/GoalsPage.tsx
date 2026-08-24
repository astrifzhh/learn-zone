import React, { useState } from 'react'
import { Plus, Target, Trophy, Sparkles } from 'lucide-react'
import { usePlanner } from '../context/PlannerContext'
import { GoalCard } from '../components/goals/GoalCard'
import { GoalModal } from '../components/goals/GoalModal'
import type { SemesterGoal } from '../types/planner'

export const GoalsPage: React.FC = () => {
  const { goals, addGoal, updateGoalProgress, updateGoal, deleteGoal } = usePlanner()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SemesterGoal | null>(null)

  const unlockedBadgesCount = goals.filter(g => g.badge_awarded || g.progress_percent >= 100).length

  const handleEdit = (goal: SemesterGoal) => {
    setEditingGoal(goal)
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    setEditingGoal(null)
    setIsModalOpen(true)
  }

  const handleSave = async (data: {
    goal_text: string
    progress_percent: number
    semester_label: string
    deadline_date: string | null
  }) => {
    if (editingGoal) {
      await updateGoal(editingGoal.id, data)
    } else {
      await addGoal(data)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Target Semester & Prestasi</h2>
            <span className="lz-chip lz-chip-achievement">
              <Trophy size={12} />
              <span>{unlockedBadgesCount} Lencana Terbuka</span>
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Tetapkan impian akademik semester ini. Capai 100% untuk membuka lencana digital!
          </p>
        </div>

        <button onClick={handleAddNew} className="lz-btn lz-btn-primary">
          <Plus size={16} />
          <span>Tambah Target Semester</span>
        </button>
      </div>

      {/* Badges Showcase Banner */}
      <div
        className="lz-card"
        style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDF7 100%)',
          border: '1.5px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Sparkles size={18} color="#FFB800" />
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Koleksi Lencana Digital Pelajar</h3>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '12px',
          }}
        >
          {[
            { title: 'Lencana Bintang Emas', icon: '🌟', desc: 'Target 100% Tercapai', unlocked: unlockedBadgesCount >= 1 },
            { title: 'Juara Semester', icon: '🏆', desc: 'Menyelesaikan 2+ Target', unlocked: unlockedBadgesCount >= 2 },
            { title: 'Ahli Konsistensi', icon: '🎯', desc: 'Menyelesaikan 3+ Target', unlocked: unlockedBadgesCount >= 3 },
            { title: 'Siswa Teladan', icon: '👑', desc: 'Semua Target Selesai', unlocked: goals.length > 0 && unlockedBadgesCount === goals.length },
          ].map((b, idx) => (
            <div
              key={idx}
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: b.unlocked ? '#FFF8E1' : '#FAF8F3',
                border: `1.5px solid ${b.unlocked ? '#FFD54F' : 'var(--color-border-subtle)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                opacity: b.unlocked ? 1 : 0.55,
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '26px' }}>{b.icon}</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: b.unlocked ? '#8A5300' : 'var(--color-text)' }}>
                  {b.title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  {b.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Goals Cards List */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>
          Daftar Target Aktif
        </h3>

        {goals.length === 0 ? (
          <div
            className="lz-card"
            style={{
              padding: '48px 16px',
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
              <Target size={32} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-text)' }}>
                Belum ada target semester
              </div>
              <div style={{ fontSize: '13px', marginTop: '2px' }}>
                Tentukan nilai impianmu atau target ekstrakurikuler semester ini!
              </div>
            </div>
            <button onClick={handleAddNew} className="lz-btn lz-btn-primary lz-btn-sm">
              <Plus size={14} />
              <span>Tambah Target Semester</span>
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '16px',
            }}
          >
            {goals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onUpdateProgress={updateGoalProgress}
                onEdit={handleEdit}
                onDelete={deleteGoal}
              />
            ))}
          </div>
        )}
      </div>

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialGoal={editingGoal}
      />
    </div>
  )
}
