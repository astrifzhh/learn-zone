import React from 'react'
import { Zap, Moon, Heart, HelpCircle } from 'lucide-react'
import type { MoodType } from '../../types/planner'

interface MoodSelectorProps {
  currentMood: MoodType | null
  onSelectMood: (mood: MoodType) => void
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  currentMood,
  onSelectMood,
}) => {
  const moods: { type: MoodType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      type: 'semangat',
      label: 'Semangat',
      icon: <Zap size={22} />,
      desc: 'Penuh energi untuk menyelesaikan semua PR & tugas!',
    },
    {
      type: 'lelah',
      label: 'Lelah',
      icon: <Moon size={22} />,
      desc: 'Butuh rehat sejenak sebelum lanjut belajar.',
    },
    {
      type: 'senang',
      label: 'Senang',
      icon: <Heart size={22} />,
      desc: 'Suasana hati gembira, belajar jadi menyenangkan!',
    },
    {
      type: 'bingung',
      label: 'Bingung',
      icon: <HelpCircle size={22} />,
      desc: 'Ada materi yang sulit dipahami? Jangan ragu bertanya!',
    },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
      }}
    >
      {moods.map(m => {
        const isSelected = currentMood === m.type
        return (
          <button
            key={m.type}
            onClick={() => onSelectMood(m.type)}
            style={{
              padding: '16px',
              borderRadius: '14px',
              border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
              backgroundColor: isSelected ? 'var(--color-primary-soft)' : '#FFFFFF',
              boxShadow: isSelected ? '0 0 0 3px rgba(33, 150, 243, 0.2)' : 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: isSelected ? 'var(--color-primary)' : '#FAF8F3',
                color: isSelected ? '#FFFFFF' : 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px',
              }}
            >
              {m.icon}
            </div>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
              }}
            >
              {m.label}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-text-muted)',
                marginTop: '4px',
                lineHeight: 1.3,
              }}
            >
              {m.desc}
            </div>
          </button>
        )
      })}
    </div>
  )
}
