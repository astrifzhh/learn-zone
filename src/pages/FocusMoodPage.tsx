import React, { useState } from 'react'
import { Timer, Smile, Quote, Plus, Trash2 } from 'lucide-react'
import { usePlanner } from '../context/PlannerContext'
import { FocusTimerExtended } from '../components/focus/FocusTimerExtended'
import { FocusHistoryList } from '../components/focus/FocusHistoryList'
import { MoodSelector } from '../components/mood/MoodSelector'
import { CustomQuoteModal } from '../components/mood/CustomQuoteModal'
import { DEFAULT_STUDENT_QUOTES } from '../lib/quotes'
import type { MoodType } from '../types/planner'

export const FocusMoodPage: React.FC = () => {
  const {
    currentMood,
    setDailyMood,
    customQuotes,
    addCustomQuote,
    deleteCustomQuote,
    setActiveQuote,
    focusSessions,
  } = usePlanner()

  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)

  const activeQuote = customQuotes.find(q => q.is_active)
  const displayQuote = activeQuote
    ? activeQuote.quote_text
    : currentMood?.recommended_quote || DEFAULT_STUDENT_QUOTES[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Fokus Belajar & Jurnal Mood</h2>
          <span className="lz-chip lz-chip-primary">
            <Timer size={12} />
            <span>Zona Produktif Siswa</span>
          </span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
          Tingkatkan konsentrasi belajarmu dengan timer Pomodoro dan periksa suasana hatimu hari ini
        </p>
      </div>

      {/* 1. Extended Focus Timer */}
      <FocusTimerExtended />

      {/* 2. Mood Check-In Section */}
      <div className="lz-card" style={{ padding: '24px' }}>
        <div className="lz-card-header" style={{ marginBottom: '16px' }}>
          <div>
            <h3 className="lz-card-title">
              <Smile size={20} color="#32B94B" />
              <span>Bagaimana Perasaanmu Hari Ini?</span>
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Pilih satu mood untuk mendapatkan kata-kata penyemangat belajar
            </p>
          </div>
        </div>

        <MoodSelector
          currentMood={(currentMood?.mood as MoodType) || null}
          onSelectMood={setDailyMood}
        />

        {/* Highlighted Quote Box */}
        <div
          style={{
            marginTop: '20px',
            padding: '16px 20px',
            backgroundColor: '#FAF8F3',
            borderRadius: '12px',
            borderLeft: '4px solid var(--color-primary)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <Quote size={24} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)', fontStyle: 'italic', lineHeight: 1.4 }}>
              "{displayQuote}"
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', fontWeight: 600 }}>
              {activeQuote ? '— Kata Motivasimu Sendiri' : `— Motivasi Belajar (${(currentMood?.mood || 'Semangat').toUpperCase()})`}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Custom Quotes Manager & Focus History */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Student's Custom Quotes */}
        <div className="lz-card" style={{ padding: '20px' }}>
          <div className="lz-card-header" style={{ marginBottom: '14px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Kata Motivasiku</h4>
            <button
              onClick={() => setIsQuoteModalOpen(true)}
              className="lz-btn lz-btn-secondary lz-btn-sm"
            >
              <Plus size={14} />
              <span>Tulis Motivasi</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
            {customQuotes.length === 0 ? (
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--color-text-muted)',
                  textAlign: 'center',
                  padding: '24px',
                  backgroundColor: '#FAF8F3',
                  borderRadius: '10px',
                }}
              >
                Belum ada kata motivasi pribadi. Tulis kutipan favoritmu agar selalu semangat belajar!
              </div>
            ) : (
              customQuotes.map(q => (
                <div
                  key={q.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    backgroundColor: q.is_active ? 'var(--color-primary-soft)' : '#FAF8F3',
                    border: `1.5px solid ${q.is_active ? 'var(--color-primary)' : 'var(--color-border-subtle)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <div style={{ flex: 1, fontSize: '13px', fontWeight: q.is_active ? 700 : 500 }}>
                    "{q.quote_text}"
                  </div>

                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    {!q.is_active && (
                      <button
                        onClick={() => setActiveQuote(q.id)}
                        className="lz-btn lz-btn-ghost lz-btn-sm"
                        style={{ padding: '2px 8px', fontSize: '11px', minHeight: '26px' }}
                        title="Pasang sebagai motivasi aktif"
                      >
                        Pasang
                      </button>
                    )}
                    {q.is_active && (
                      <span className="lz-chip lz-chip-primary" style={{ fontSize: '10px' }}>
                        Aktif
                      </span>
                    )}
                    <button
                      onClick={() => deleteCustomQuote(q.id)}
                      style={{ padding: '4px', color: 'var(--color-action)' }}
                      title="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Focus Sessions History */}
        <FocusHistoryList sessions={focusSessions} />
      </div>

      <CustomQuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        onSave={async text => {
          await addCustomQuote(text, true)
        }}
      />
    </div>
  )
}
