import React, { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { usePlanner } from './PlannerContext'
import { useAuth } from './AuthContext'
import { audioService } from '../lib/audio'
import type { AlarmSound, BackgroundAudio } from '../types/planner'

interface FocusTimerState {
  focusDuration: number // minutes
  breakDuration: number // minutes
  phase: 'focus' | 'break'
  timeLeft: number // seconds
  isRunning: boolean
  targetEndTime: number | null // timestamp ms
  sessionStartTime: string | null
}

interface FocusTimerContextType {
  focusDuration: number
  breakDuration: number
  phase: 'focus' | 'break'
  timeLeft: number
  isRunning: boolean
  progressPercent: number
  minutes: string
  seconds: string
  togglePlay: () => void
  handleReset: () => void
  handleSkip: () => void
  applyCustomDurations: (focusMins: number, breakMins: number) => void
  requestNotificationPermission: () => Promise<void>
}

const FocusTimerContext = createContext<FocusTimerContextType | undefined>(undefined)

const DEFAULT_FOCUS_DURATION = 25
const DEFAULT_BREAK_DURATION = 5
const DEFAULT_DOC_TITLE = 'LearnZone — Dashboard Produktivitas Belajar Siswa'

export const FocusTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const { settings, logFocusSession, showToast } = usePlanner()

  const storageKey = `lz_focus_timer_${user?.id || 'guest'}`

  const [focusDuration, setFocusDuration] = useState<number>(DEFAULT_FOCUS_DURATION)
  const [breakDuration, setBreakDuration] = useState<number>(DEFAULT_BREAK_DURATION)
  const [phase, setPhase] = useState<'focus' | 'break'>('focus')
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_FOCUS_DURATION * 60)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [targetEndTime, setTargetEndTime] = useState<number | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null)

  const workerRef = useRef<Worker | null>(null)
  const intervalRef = useRef<number | null>(null)

  // Save current timer state to localStorage
  const saveStateToStorage = useCallback(
    (state: Partial<FocusTimerState>) => {
      try {
        const fullState: FocusTimerState = {
          focusDuration,
          breakDuration,
          phase,
          timeLeft,
          isRunning,
          targetEndTime,
          sessionStartTime,
          ...state,
        }
        localStorage.setItem(storageKey, JSON.stringify(fullState))
      } catch {
        // LocalStorage quota or access error ignore
      }
    },
    [breakDuration, focusDuration, isRunning, phase, sessionStartTime, storageKey, targetEndTime, timeLeft]
  )

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission()
      } catch {
        // Ignore permission rejection
      }
    }
  }, [])

  // Send system notification when tab is in background or minimized
  const sendBrowserNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'learnzone-focus-timer',
        })
        notification.onclick = () => {
          window.focus()
          notification.close()
        }
      } catch {
        // Ignore notification creation errors
      }
    }
  }, [])

  // Handle phase completion
  const handlePhaseComplete = useCallback(
    (completedPhase: 'focus' | 'break', currentStart: string | null, focusMins: number, breakMins: number) => {
      audioService.playAlarm(settings.alarm_sound as AlarmSound, settings.sound_enabled)
      audioService.stopBackgroundAudio()

      if (completedPhase === 'focus') {
        if (currentStart) {
          logFocusSession({
            focus_minutes: focusMins,
            break_minutes: breakMins,
            started_at: currentStart,
            ended_at: new Date().toISOString(),
            status: 'completed',
          })
        }

        sendBrowserNotification(
          '🔔 Sesi Belajar Fokus Selesai!',
          `Hebat! Kamu telah menyelesaikan sesi fokus ${focusMins} menit. Sekarang istirahatlah selama ${breakMins} menit 😊`
        )
        showToast(`🎉 Sesi fokus selesai! Waktunya istirahat (${breakMins} menit).`, 'success')

        setPhase('break')
        setTimeLeft(breakMins * 60)
        setIsRunning(false)
        setTargetEndTime(null)
        setSessionStartTime(null)

        saveStateToStorage({
          phase: 'break',
          timeLeft: breakMins * 60,
          isRunning: false,
          targetEndTime: null,
          sessionStartTime: null,
        })
      } else {
        sendBrowserNotification(
          '✨ Waktu Istirahat Selesai!',
          'Waktu rehat telah usai. Siap untuk kembali belajar dengan konsentrasi penuh?'
        )
        showToast('✨ Waktu istirahat selesai! Siap untuk sesi fokus berikutnya?', 'info')

        setPhase('focus')
        setTimeLeft(focusMins * 60)
        setIsRunning(false)
        setTargetEndTime(null)
        setSessionStartTime(null)

        saveStateToStorage({
          phase: 'focus',
          timeLeft: focusMins * 60,
          isRunning: false,
          targetEndTime: null,
          sessionStartTime: null,
        })
      }

      document.title = DEFAULT_DOC_TITLE
    },
    [logFocusSession, saveStateToStorage, sendBrowserNotification, settings.alarm_sound, settings.sound_enabled, showToast]
  )

  // Initialize and load saved state from localStorage on startup
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed: FocusTimerState = JSON.parse(saved)
        setFocusDuration(parsed.focusDuration || DEFAULT_FOCUS_DURATION)
        setBreakDuration(parsed.breakDuration || DEFAULT_BREAK_DURATION)
        setPhase(parsed.phase || 'focus')

        if (parsed.isRunning && parsed.targetEndTime) {
          const now = Date.now()
          const diffSeconds = Math.round((parsed.targetEndTime - now) / 1000)

          if (diffSeconds > 0) {
            // Timer is still running in background
            setTimeLeft(diffSeconds)
            setIsRunning(true)
            setTargetEndTime(parsed.targetEndTime)
            setSessionStartTime(parsed.sessionStartTime)
          } else {
            // Timer expired while user was away
            handlePhaseComplete(
              parsed.phase || 'focus',
              parsed.sessionStartTime,
              parsed.focusDuration || DEFAULT_FOCUS_DURATION,
              parsed.breakDuration || DEFAULT_BREAK_DURATION
            )
          }
        } else {
          setTimeLeft(parsed.timeLeft ?? (parsed.focusDuration || DEFAULT_FOCUS_DURATION) * 60)
          setIsRunning(false)
          setTargetEndTime(null)
          setSessionStartTime(null)
        }
      }
    } catch (e) {
      console.error('Failed to load focus timer state:', e)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  // Initialize Web Worker for active background ticking
  useEffect(() => {
    try {
      const workerBlob = new Blob(
        [
          `
          var timerId = null;
          self.onmessage = function(e) {
            if (e.data === 'start') {
              if (timerId) clearInterval(timerId);
              timerId = setInterval(function() {
                self.postMessage('tick');
              }, 1000);
            } else if (e.data === 'stop') {
              if (timerId) clearInterval(timerId);
              timerId = null;
            }
          };
          `,
        ],
        { type: 'application/javascript' }
      )
      const workerUrl = URL.createObjectURL(workerBlob)
      const worker = new Worker(workerUrl)
      workerRef.current = worker

      return () => {
        worker.terminate()
        URL.revokeObjectURL(workerUrl)
      }
    } catch {
      // Fallback if Web Workers are disabled
    }
  }, [])

  // Sync remaining time precisely using targetEndTime
  const syncTime = useCallback(() => {
    if (!isRunning || !targetEndTime) return

    const now = Date.now()
    const remaining = Math.max(0, Math.round((targetEndTime - now) / 1000))

    if (remaining <= 0) {
      handlePhaseComplete(phase, sessionStartTime, focusDuration, breakDuration)
    } else {
      setTimeLeft(remaining)
    }
  }, [breakDuration, focusDuration, handlePhaseComplete, isRunning, phase, sessionStartTime, targetEndTime])

  // Web Worker message listener & setInterval backup
  useEffect(() => {
    const handleTick = () => {
      syncTime()
    }

    const worker = workerRef.current
    if (isRunning && targetEndTime) {
      if (worker) {
        worker.postMessage('start')
        worker.onmessage = handleTick
      }

      // Main thread fallback interval
      intervalRef.current = window.setInterval(handleTick, 1000)
    } else {
      if (worker) worker.postMessage('stop')
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (worker) worker.postMessage('stop')
    }
  }, [isRunning, targetEndTime, syncTime])

  // Sync instantly on tab focus, visibilitychange, pageshow
  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      syncTime()
    }

    document.addEventListener('visibilitychange', handleVisibilityOrFocus)
    window.addEventListener('focus', handleVisibilityOrFocus)
    window.addEventListener('pageshow', handleVisibilityOrFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus)
      window.removeEventListener('focus', handleVisibilityOrFocus)
      window.removeEventListener('pageshow', handleVisibilityOrFocus)
    }
  }, [syncTime])

  // Update dynamic browser tab title
  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, '0')
  const seconds = (timeLeft % 60).toString().padStart(2, '0')

  useEffect(() => {
    if (isRunning) {
      const emoji = phase === 'focus' ? '🎯' : '☕'
      const label = phase === 'focus' ? 'Belajar' : 'Istirahat'
      document.title = `(${minutes}:${seconds}) ${emoji} ${label} - LearnZone`
    } else {
      document.title = DEFAULT_DOC_TITLE
    }

    return () => {
      document.title = DEFAULT_DOC_TITLE
    }
  }, [isRunning, minutes, seconds, phase])

  // Control Actions
  const togglePlay = () => {
    if (!isRunning) {
      requestNotificationPermission()

      const currentStart = sessionStartTime || (phase === 'focus' ? new Date().toISOString() : null)
      const target = Date.now() + timeLeft * 1000

      setIsRunning(true)
      setTargetEndTime(target)
      if (currentStart) setSessionStartTime(currentStart)

      if (settings.background_audio !== 'none') {
        audioService.startBackgroundAudio(settings.background_audio as BackgroundAudio, settings.sound_enabled)
      }

      saveStateToStorage({
        isRunning: true,
        targetEndTime: target,
        sessionStartTime: currentStart,
        timeLeft,
      })
    } else {
      // Pause
      const now = Date.now()
      const remaining = targetEndTime ? Math.max(0, Math.round((targetEndTime - now) / 1000)) : timeLeft

      setIsRunning(false)
      setTargetEndTime(null)
      setTimeLeft(remaining)
      audioService.pauseBackgroundAudio()

      saveStateToStorage({
        isRunning: false,
        targetEndTime: null,
        timeLeft: remaining,
      })
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

    const resetSeconds = (phase === 'focus' ? focusDuration : breakDuration) * 60

    setIsRunning(false)
    setTargetEndTime(null)
    setSessionStartTime(null)
    setTimeLeft(resetSeconds)
    audioService.stopBackgroundAudio()
    document.title = DEFAULT_DOC_TITLE

    saveStateToStorage({
      isRunning: false,
      targetEndTime: null,
      sessionStartTime: null,
      timeLeft: resetSeconds,
    })
  }

  const handleSkip = () => {
    handleReset()
    if (phase === 'focus') {
      setPhase('break')
      const breakSecs = breakDuration * 60
      setTimeLeft(breakSecs)
      saveStateToStorage({
        phase: 'break',
        timeLeft: breakSecs,
        isRunning: false,
        targetEndTime: null,
        sessionStartTime: null,
      })
    } else {
      setPhase('focus')
      const focusSecs = focusDuration * 60
      setTimeLeft(focusSecs)
      saveStateToStorage({
        phase: 'focus',
        timeLeft: focusSecs,
        isRunning: false,
        targetEndTime: null,
        sessionStartTime: null,
      })
    }
  }

  const applyCustomDurations = (focusMins: number, breakMins: number) => {
    setFocusDuration(focusMins)
    setBreakDuration(breakMins)
    setIsRunning(false)
    setPhase('focus')
    setTargetEndTime(null)
    setSessionStartTime(null)
    setTimeLeft(focusMins * 60)
    audioService.stopBackgroundAudio()
    document.title = DEFAULT_DOC_TITLE

    saveStateToStorage({
      focusDuration: focusMins,
      breakDuration: breakMins,
      phase: 'focus',
      timeLeft: focusMins * 60,
      isRunning: false,
      targetEndTime: null,
      sessionStartTime: null,
    })
  }

  const totalDuration = (phase === 'focus' ? focusDuration : breakDuration) * 60
  const progressPercent = useMemo(() => {
    if (totalDuration <= 0) return 0
    return Math.min(100, Math.max(0, ((totalDuration - timeLeft) / totalDuration) * 100))
  }, [totalDuration, timeLeft])

  return (
    <FocusTimerContext.Provider
      value={{
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
        applyCustomDurations,
        requestNotificationPermission,
      }}
    >
      {children}
    </FocusTimerContext.Provider>
  )
}

export const useFocusTimer = () => {
  const context = useContext(FocusTimerContext)
  if (!context) {
    throw new Error('useFocusTimer must be used within a FocusTimerProvider')
  }
  return context
}
