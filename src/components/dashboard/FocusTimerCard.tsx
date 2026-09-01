import React from 'react'
import { Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX, Music } from 'lucide-react'
import { usePlanner } from '../../context/PlannerContext'
import { useFocusTimer } from '../../context/FocusTimerContext'
import { audioService } from '../../lib/audio'
import type { AlarmSound, BackgroundAudio } from '../../types/planner'

export const FocusTimerCard: React.FC = () => {
  const { settings, updateSettings } = usePlanner()
  const {
    focusDuration,
    breakDuration,
    phase,
    timeLeft,
    isRunning,
    progressPercent,
    minutes,
    seconds,
    togglePlay,
    handleReset,
    handleSkip,
  } = useFocusTimer()

  // Switch Sound/Background Audio
  const handleAlarmChange = (alarm: AlarmSound) => {
    updateSettings({ alarm_sound: alarm })
    audioService.playAlarm(alarm, true)
  }

  const handleAmbientChange = (bg: BackgroundAudio) => {
    updateSettings({ background_audio: bg })
    if (isRunning) {
      audioService.startBackgroundAudio(bg, settings.sound_enabled)
    }
  }

  // SVG Circular progress math
  const strokeWidth = 8
  const radius = 64
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  return (
    <div className="lz-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="lz-card-header">
        <div>
          <h3 className="lz-card-title">Mode Fokus</h3>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Teknik Pomodoro untuk belajar efektif
          </span>
        </div>

        <span
          className="lz-chip"
          style={{
            backgroundColor: phase === 'focus' ? 'var(--color-primary-soft)' : 'var(--color-success-soft)',
            color: phase === 'focus' ? 'var(--color-primary)' : 'var(--color-success)',
            fontWeight: 800,
            letterSpacing: '0.5px',
          }}
        >
          {phase === 'focus' ? 'FOKUS' : 'ISTIRAHAT'}
        </span>
      </div>

      {/* Main Timer Display */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 0',
          position: 'relative',
        }}
      >
        <svg width="150" height="150" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="75"
            cy="75"
            r={radius}
            stroke="var(--color-border-subtle)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx="75"
            cy="75"
            r={radius}
            stroke={phase === 'focus' ? 'var(--color-primary)' : 'var(--color-success)'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>

        {/* Center Digits */}
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '32px',
              fontWeight: 700,
              color: 'var(--color-text)',
              letterSpacing: '1px',
            }}
          >
            {minutes}:{seconds}
          </div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)' }}>
            {phase === 'focus' ? `${focusDuration} Menit Belajar` : `${breakDuration} Menit Rehat`}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          margin: '10px 0 14px 0',
        }}
      >
        <button
          onClick={handleReset}
          className="lz-btn lz-btn-ghost lz-btn-sm"
          title="Ulangi Timer"
          aria-label="Reset Timer"
        >
          <RotateCcw size={16} />
        </button>

        <button
          onClick={togglePlay}
          className="lz-btn lz-btn-primary"
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            padding: 0,
            boxShadow: '0 4px 14px rgba(255, 90, 78, 0.35)',
          }}
          aria-label={isRunning ? 'Jeda Timer' : 'Mulai Timer'}
        >
          {isRunning ? <Pause size={22} fill="#FFFFFF" /> : <Play size={22} fill="#FFFFFF" style={{ marginLeft: '2px' }} />}
        </button>

        <button
          onClick={handleSkip}
          className="lz-btn lz-btn-ghost lz-btn-sm"
          title="Lewati Fase"
          aria-label="Lewati Fase Timer"
        >
          <SkipForward size={16} />
        </button>
      </div>

      {/* Audio Preferences Row */}
      <div
        style={{
          borderTop: '1px solid var(--color-border-subtle)',
          paddingTop: '12px',
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
        }}
      >
        {/* Sound Alarm Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => updateSettings({ sound_enabled: !settings.sound_enabled })}
            style={{
              padding: '4px',
              color: settings.sound_enabled ? 'var(--color-primary)' : 'var(--color-text-muted)',
              display: 'flex',
            }}
            title={settings.sound_enabled ? 'Suara Aktif' : 'Suara Mati'}
            aria-label="Toggle Suara"
          >
            {settings.sound_enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <select
            value={settings.alarm_sound}
            onChange={e => handleAlarmChange(e.target.value as AlarmSound)}
            style={{ padding: '4px 8px', fontSize: '11px', width: 'auto' }}
            aria-label="Pilih Suara Alarm"
          >
            <option value="school_bell">🔔 Bel Sekolah</option>
            <option value="cheerful">✨ Nada Ceria</option>
            <option value="nature">🍃 Nada Alami</option>
          </select>
        </div>

        {/* Ambient Audio */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Music size={14} color="var(--color-text-muted)" />
          <select
            value={settings.background_audio}
            onChange={e => handleAmbientChange(e.target.value as BackgroundAudio)}
            style={{ padding: '4px 8px', fontSize: '11px', width: 'auto' }}
            aria-label="Pilih Audio Latar Belakang"
          >
            <option value="none">Tanpa Musik</option>
            <option value="soft_rain">🌧️ Hujan Lembut</option>
            <option value="instrumental">🎹 Nada Tenang</option>
          </select>
        </div>
      </div>
    </div>
  )
}
