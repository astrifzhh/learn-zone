import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw, SkipForward, Sliders } from 'lucide-react'
import { usePlanner } from '../../context/PlannerContext'
import { audioService } from '../../lib/audio'
import type { AlarmSound, BackgroundAudio } from '../../types/planner'

export const FocusTimerExtended: React.FC = () => {
  const { settings, updateSettings, logFocusSession } = usePlanner()

  const [focusDuration, setFocusDuration] = useState<number>(25)
  const [breakDuration, setBreakDuration] = useState<number>(5)
  const [phase, setPhase] = useState<'focus' | 'break'>('focus')
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null)
  const [showConfig, setShowConfig] = useState<boolean>(false)

  const timerRef = useRef<number | null>(null)

  const totalDuration = (phase === 'focus' ? focusDuration : breakDuration) * 60
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0')
  const seconds = (timeLeft % 60).toString().padStart(2, '0')

  const handlePhaseComplete = useCallback(() => {
    audioService.playAlarm(settings.alarm_sound as AlarmSound, settings.sound_enabled)

    if (phase === 'focus') {
      if (sessionStartTime) {
        logFocusSession({
          focus_minutes: focusDuration,
          break_minutes: breakDuration,
          started_at: sessionStartTime,
          ended_at: new Date().toISOString(),
          status: 'completed',
        })
      }
      setPhase('break')
      setTimeLeft(breakDuration * 60)
    } else {
      setPhase('focus')
      setTimeLeft(focusDuration * 60)
    }
    setIsRunning(false)
    setSessionStartTime(null)
  }, [breakDuration, focusDuration, logFocusSession, phase, sessionStartTime, settings.alarm_sound, settings.sound_enabled])

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handlePhaseComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning, handlePhaseComplete])

  const togglePlay = () => {
    if (!isRunning) {
      if (!sessionStartTime) {
        setSessionStartTime(new Date().toISOString())
      }
      if (settings.background_audio !== 'none') {
        audioService.startBackgroundAudio(settings.background_audio as BackgroundAudio, settings.sound_enabled)
      }
      setIsRunning(true)
    } else {
      setIsRunning(false)
      audioService.pauseBackgroundAudio()
    }
  }

  const handleReset = () => {
    if (isRunning && sessionStartTime && phase === 'focus') {
      logFocusSession({
        focus_minutes: focusDuration,
        break_minutes: breakDuration,
        started_at: sessionStartTime,
        ended_at: new Date().toISOString(),
        status: 'cancelled',
      })
    }
    setIsRunning(false)
    setSessionStartTime(null)
    setTimeLeft((phase === 'focus' ? focusDuration : breakDuration) * 60)
    audioService.stopBackgroundAudio()
  }

  const handleSkip = () => {
    handleReset()
    if (phase === 'focus') {
      setPhase('break')
      setTimeLeft(breakDuration * 60)
    } else {
      setPhase('focus')
      setTimeLeft(focusDuration * 60)
    }
  }

  const applyCustomDurations = (focusMins: number, breakMins: number) => {
    setFocusDuration(focusMins)
    setBreakDuration(breakMins)
    setIsRunning(false)
    setPhase('focus')
    setTimeLeft(focusMins * 60)
  }

  const strokeWidth = 10
  const radius = 95
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  return (
    <div className="lz-card" style={{ padding: '28px' }}>
      <div className="lz-card-header">
        <div>
          <h3 className="lz-card-title">Timer Fokus & Pomodoro</h3>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Belajar dengan ritme fokus 25 menit dan istirahat 5 menit
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="lz-btn lz-btn-secondary lz-btn-sm"
          >
            <Sliders size={14} />
            <span>Atur Durasi</span>
          </button>
        </div>
      </div>

      {showConfig && (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#FAF8F3',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700 }}>Preset Cepat:</span>
            <button
              onClick={() => applyCustomDurations(25, 5)}
              className="lz-btn lz-btn-ghost lz-btn-sm"
              style={{ border: '1px solid var(--color-border)' }}
            >
              Standar (25/5m)
            </button>
            <button
              onClick={() => applyCustomDurations(45, 10)}
              className="lz-btn lz-btn-ghost lz-btn-sm"
              style={{ border: '1px solid var(--color-border)' }}
            >
              Ujian/Tugas Berat (45/10m)
            </button>
            <button
              onClick={() => applyCustomDurations(15, 3)}
              className="lz-btn lz-btn-ghost lz-btn-sm"
              style={{ border: '1px solid var(--color-border)' }}
            >
              Cepat (15/3m)
            </button>
          </div>
        </div>
      )}

      {/* Extended Big SVG Timer */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 0',
          position: 'relative',
        }}
      >
        <svg width="220" height="220" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="110"
            cy="110"
            r={radius}
            stroke="var(--color-border-subtle)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx="110"
            cy="110"
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

        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            className="lz-chip"
            style={{
              backgroundColor: phase === 'focus' ? 'var(--color-primary-soft)' : 'var(--color-success-soft)',
              color: phase === 'focus' ? 'var(--color-primary)' : 'var(--color-success)',
              fontWeight: 800,
              fontSize: '11px',
              marginBottom: '4px',
            }}
          >
            {phase === 'focus' ? 'SESI BELAJAR FOKUS' : 'WAKTU ISTIRAHAT & REHAT'}
          </span>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '44px',
              fontWeight: 700,
              color: 'var(--color-text)',
              letterSpacing: '1px',
            }}
          >
            {minutes}:{seconds}
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            {phase === 'focus' ? 'Konsentrasi penuh!' : 'Regangkan badan & minum air putih 💧'}
          </div>
        </div>
      </div>

      {/* Extended Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          margin: '16px 0 20px 0',
        }}
      >
        <button
          onClick={handleReset}
          className="lz-btn lz-btn-ghost"
          style={{ padding: '10px 14px' }}
        >
          <RotateCcw size={18} />
          <span>Reset</span>
        </button>

        <button
          onClick={togglePlay}
          className="lz-btn lz-btn-primary"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            padding: 0,
            boxShadow: '0 6px 18px rgba(255, 90, 78, 0.4)',
          }}
        >
          {isRunning ? <Pause size={26} fill="#FFFFFF" /> : <Play size={26} fill="#FFFFFF" style={{ marginLeft: '3px' }} />}
        </button>

        <button
          onClick={handleSkip}
          className="lz-btn lz-btn-ghost"
          style={{ padding: '10px 14px' }}
        >
          <SkipForward size={18} />
          <span>Lewati</span>
        </button>
      </div>

      {/* Audio selector bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          borderTop: '1.5px solid var(--color-border-subtle)',
          paddingTop: '16px',
        }}
      >
        <div>
          <label className="lz-label" style={{ fontSize: '12px', marginBottom: '4px' }}>
            Suara Bel / Alarm Selesai
          </label>
          <select
            value={settings.alarm_sound}
            onChange={e => {
              updateSettings({ alarm_sound: e.target.value as AlarmSound })
              audioService.playAlarm(e.target.value as AlarmSound, true)
            }}
          >
            <option value="school_bell">🔔 Bel Sekolah Klasik</option>
            <option value="cheerful">✨ Nada Ceria Harmoni</option>
            <option value="nature">🍃 Nada Alami / Bambu Tenang</option>
          </select>
        </div>

        <div>
          <label className="lz-label" style={{ fontSize: '12px', marginBottom: '4px' }}>
            Musik Relaksasi / Audio Latar
          </label>
          <select
            value={settings.background_audio}
            onChange={e => {
              const bg = e.target.value as BackgroundAudio
              updateSettings({ background_audio: bg })
              if (isRunning) audioService.startBackgroundAudio(bg, settings.sound_enabled)
            }}
          >
            <option value="none">Tanpa Audio</option>
            <option value="soft_rain">🌧️ Suara Hujan Lembut (Noise Generator)</option>
            <option value="instrumental">🎹 Nada Instrumental Tenang (Pad Drone)</option>
          </select>
        </div>
      </div>
    </div>
  )
}
