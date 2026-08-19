import React from 'react'
import { CalendarDays, Target, Smile, Trophy, ChevronRight, Zap, Moon, Heart, HelpCircle } from 'lucide-react'
import { usePlanner } from '../../context/PlannerContext'
import type { MoodType } from '../../types/planner'

interface DailySummaryCardProps {
  onNavigate: (tab: 'schedule' | 'goals' | 'focus-mood') => void
}

export const DailySummaryCard: React.FC<DailySummaryCardProps> = ({ onNavigate }) => {
  const { schedule, goals, currentMood, setDailyMood, customQuotes } = usePlanner()

  // Determine today's day of week (1=Senin..5=Jumat)
  const dayIdx = new Date().getDay()
  const todayDayOfWeek = dayIdx >= 1 && dayIdx <= 5 ? dayIdx : 1 // default to Senin if weekend

  // Today's classes (top 3)
  const todayClasses = schedule
    .filter(s => s.day_of_week === todayDayOfWeek)
    .slice(0, 3)

  // Priority Semester Goal (first goal or highest incomplete)
  const priorityGoal = goals[0] || null

  // Active student quote or current mood recommended quote
  const activeCustomQuote = customQuotes.find(q => q.is_active)
  const displayQuote = activeCustomQuote
    ? activeCustomQuote.quote_text
    : currentMood?.recommended_quote || 'Semangat belajar hari ini! Setiap usaha membawamu lebih dekat ke impian.'

  const moods: { type: MoodType; label: string; icon: React.ReactNode }[] = [
    { type: 'semangat', label: 'Semangat', icon: <Zap size={15} /> },
    { type: 'lelah', label: 'Lelah', icon: <Moon size={15} /> },
    { type: 'senang', label: 'Senang', icon: <Heart size={15} /> },
    { type: 'bingung', label: 'Bingung', icon: <HelpCircle size={15} /> },
  ]

  return (
    <div className="lz-card" style={{ padding: '24px' }}>
      <div className="lz-card-header" style={{ marginBottom: '18px' }}>
        <h3 className="lz-card-title">Ringkasan Hari Ini</h3>
        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
          Pelajaran, target semester, & motivasi
        </span>
      </div>

      {/* 3 Unified Columns with subtle vertical separators */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Section 1: Jadwal Pelajaran Hari Ini */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CalendarDays size={16} color="var(--color-primary)" />
              <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Jadwal Hari Ini</h4>
            </div>
            <button
              onClick={() => onNavigate('schedule')}
              className="lz-btn-ghost"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                padding: '2px 6px',
                borderRadius: '6px',
              }}
            >
              <span>Lihat Semua</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            {todayClasses.length === 0 ? (
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--color-text-muted)',
                  padding: '12px',
                  backgroundColor: '#FAF8F3',
                  borderRadius: '10px',
                  textAlign: 'center',
                }}
              >
                Tidak ada jadwal kelas untuk hari ini 🎉
              </div>
            ) : (
              todayClasses.map((item, idx) => (
                <div
                  key={item.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: '#FAF8F3',
                    borderRadius: '10px',
                    borderLeft: `4px solid ${item.subject_color || '#2196F3'}`,
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>{item.subject_name}</span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {item.start_time} - {item.end_time || 'Selesai'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 2: Target Semester */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid var(--color-border-subtle)',
            paddingLeft: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={16} color="#FFB800" />
              <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Target Semester</h4>
            </div>
            <button
              onClick={() => onNavigate('goals')}
              className="lz-btn-ghost"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                padding: '2px 6px',
                borderRadius: '6px',
              }}
            >
              <span>Kelola</span>
              <ChevronRight size={13} />
            </button>
          </div>

          {priorityGoal ? (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#FAF8F3',
                borderRadius: '10px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', lineHeight: 1.35 }}>
                {priorityGoal.goal_text}
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    fontWeight: 700,
                    marginBottom: '4px',
                  }}
                >
                  <span style={{ color: 'var(--color-text-muted)' }}>Progres</span>
                  <span style={{ color: priorityGoal.badge_awarded ? '#D48800' : 'var(--color-primary)' }}>
                    {priorityGoal.progress_percent}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div
                  style={{
                    height: '8px',
                    backgroundColor: '#EBE5D8',
                    borderRadius: '999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${priorityGoal.progress_percent}%`,
                      backgroundColor: priorityGoal.badge_awarded ? '#FFB800' : 'var(--color-primary)',
                      borderRadius: '999px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>

                {priorityGoal.badge_awarded && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#D48800',
                    }}
                  >
                    <Trophy size={13} />
                    <span>Lencana Prestasi Terbuka! 🏆</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-text-muted)',
                padding: '12px',
                backgroundColor: '#FAF8F3',
                borderRadius: '10px',
                textAlign: 'center',
                flex: 1,
              }}
            >
              Belum ada target semester. Tambahkan target belajarmu!
            </div>
          )}
        </div>

        {/* Section 3: Mood & Motivasi Hari Ini */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid var(--color-border-subtle)',
            paddingLeft: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Smile size={16} color="#32B94B" />
              <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Mood Hari Ini</h4>
            </div>
            <button
              onClick={() => onNavigate('focus-mood')}
              className="lz-btn-ghost"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                padding: '2px 6px',
                borderRadius: '6px',
              }}
            >
              <span>Jurnal Mood</span>
              <ChevronRight size={13} />
            </button>
          </div>

          {/* 4 Mood Selector Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '10px' }}>
            {moods.map(m => {
              const isSelected = currentMood?.mood === m.type
              return (
                <button
                  key={m.type}
                  onClick={() => setDailyMood(m.type)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 4px',
                    borderRadius: '10px',
                    border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: isSelected ? 'var(--color-primary-soft)' : '#FFFFFF',
                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    boxShadow: isSelected ? '0 0 0 2px rgba(33, 150, 243, 0.2)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                  title={m.label}
                  aria-label={`Pilih mood ${m.label}`}
                >
                  <span style={{ marginBottom: '2px' }}>{m.icon}</span>
                  <span style={{ fontSize: '10px', fontWeight: isSelected ? 800 : 600 }}>{m.label}</span>
                </button>
              )
            })}
          </div>

          {/* Motivational Quote Display */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: '#FAF8F3',
              borderRadius: '10px',
              borderLeft: '3px solid var(--color-primary)',
              fontSize: '12px',
              color: 'var(--color-text)',
              fontStyle: 'italic',
              lineHeight: 1.35,
              flex: 1,
            }}
          >
            "{displayQuote}"
          </div>
        </div>
      </div>
    </div>
  )
}
