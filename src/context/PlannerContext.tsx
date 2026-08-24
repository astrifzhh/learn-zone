import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type {
  Task,
  SemesterGoal,
  ScheduleEntry,
  CalendarEvent,
  MoodEntry,
  CustomQuote,
  FocusSession,
  UserSettings,
  MoodType,
  NotificationItem,
} from '../types/planner'
import { getRecommendedQuote } from '../lib/quotes'
import { buildActiveNotifications } from '../lib/notifications'
import { audioService } from '../lib/audio'
import { triggerTaskStarConfetti, triggerGoalUnlockConfetti } from '../lib/confetti'

interface PlannerContextType {
  tasks: Task[]
  goals: SemesterGoal[]
  schedule: ScheduleEntry[]
  events: CalendarEvent[]
  currentMood: MoodEntry | null
  customQuotes: CustomQuote[]
  focusSessions: FocusSession[]
  settings: UserSettings
  notifications: NotificationItem[]
  notificationHistory: NotificationItem[]
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  isLoadingData: boolean
  
  addTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed_at'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  toggleTaskComplete: (id: string, clientCoords?: { x: number; y: number }) => Promise<void>
  deleteTask: (id: string) => Promise<void>

  addGoal: (goal: Omit<SemesterGoal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'badge_awarded'>) => Promise<void>
  updateGoalProgress: (id: string, progress: number) => Promise<void>
  updateGoal: (id: string, updates: Partial<SemesterGoal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>

  addScheduleEntry: (entry: Omit<ScheduleEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateScheduleEntry: (id: string, updates: Partial<ScheduleEntry>) => Promise<void>
  deleteScheduleEntry: (id: string) => Promise<void>

  addEvent: (event: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>

  setDailyMood: (mood: MoodType) => Promise<void>

  addCustomQuote: (text: string, setActive?: boolean) => Promise<void>
  deleteCustomQuote: (id: string) => Promise<void>
  setActiveQuote: (id: string) => Promise<void>

  logFocusSession: (session: { focus_minutes: number; break_minutes: number; started_at: string; ended_at?: string; status: 'completed' | 'cancelled' }) => Promise<void>

  updateSettings: (updates: Partial<UserSettings>) => Promise<void>

  toastMessage: string | null
  toastType: 'success' | 'error' | 'info' | null
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  clearToast: () => void
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined)

const DEFAULT_SETTINGS: UserSettings = {
  user_id: 'default',
  alarm_sound: 'school_bell',
  background_audio: 'none',
  reduced_motion: false,
  sound_enabled: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const SEED_TASKS: Omit<Task, 'user_id'>[] = [
  {
    id: 'task-1',
    title: 'Mengerjakan LKS Matematika Hal 45 (Aljabar)',
    subject_name: 'Matematika',
    subject_color: '#2196F3',
    due_at: new Date(Date.now() + 4 * 3600000).toISOString(),
    is_completed: false,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Merangkum Bab Ekosistem & Rantai Makanan',
    subject_name: 'IPA (Sains)',
    subject_color: '#32B94B',
    due_at: new Date(Date.now() + 8 * 3600000).toISOString(),
    is_completed: false,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Hafalan Vocabulary Unit 2 (Daily Activities)',
    subject_name: 'Bahasa Inggris',
    subject_color: '#7C4DFF',
    due_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    is_completed: true,
    completed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const SEED_GOALS: Omit<SemesterGoal, 'user_id'>[] = [
  {
    id: 'goal-1',
    goal_text: 'Mendapatkan nilai rata-rata rapor minimal 88 di Semester 1',
    progress_percent: 75,
    badge_awarded: false,
    semester_label: 'Semester Ganjil 2026/2027',
    deadline_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'goal-2',
    goal_text: 'Menghafal rumus luas & volume bangun ruang dan aljabar dasar',
    progress_percent: 100,
    badge_awarded: true,
    semester_label: 'Semester Ganjil 2026/2027',
    deadline_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'goal-3',
    goal_text: 'Membaca 5 buku cerita Bahasa Inggris untuk tingkat lanjutan',
    progress_percent: 40,
    badge_awarded: false,
    semester_label: 'Semester Ganjil 2026/2027',
    deadline_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const SEED_SCHEDULE: Omit<ScheduleEntry, 'user_id'>[] = [
  { id: 'sch-1', day_of_week: 1, start_time: '07:30', end_time: '09:00', subject_name: 'Upacara & PPKn', subject_color: '#E91E63', created_at: '', updated_at: '' },
  { id: 'sch-2', day_of_week: 1, start_time: '09:15', end_time: '11:15', subject_name: 'Matematika', subject_color: '#2196F3', created_at: '', updated_at: '' },
  { id: 'sch-3', day_of_week: 1, start_time: '12:30', end_time: '14:00', subject_name: 'Bahasa Indonesia', subject_color: '#FF5A4E', created_at: '', updated_at: '' },
  { id: 'sch-4', day_of_week: 2, start_time: '07:30', end_time: '09:30', subject_name: 'IPA (Sains)', subject_color: '#32B94B', created_at: '', updated_at: '' },
  { id: 'sch-5', day_of_week: 2, start_time: '10:00', end_time: '11:30', subject_name: 'Bahasa Inggris', subject_color: '#7C4DFF', created_at: '', updated_at: '' },
  { id: 'sch-6', day_of_week: 2, start_time: '12:30', end_time: '14:00', subject_name: 'Seni Budaya', subject_color: '#9C27B0', created_at: '', updated_at: '' },
  { id: 'sch-7', day_of_week: 3, start_time: '07:30', end_time: '09:30', subject_name: 'IPS', subject_color: '#FF9800', created_at: '', updated_at: '' },
  { id: 'sch-8', day_of_week: 3, start_time: '10:00', end_time: '11:30', subject_name: 'Informatika', subject_color: '#00BCD4', created_at: '', updated_at: '' },
  { id: 'sch-9', day_of_week: 3, start_time: '12:30', end_time: '14:00', subject_name: 'Pendidikan Agama', subject_color: '#4CAF50', created_at: '', updated_at: '' },
  { id: 'sch-10', day_of_week: 4, start_time: '07:30', end_time: '09:30', subject_name: 'PJOK (Olahraga)', subject_color: '#FF5722', created_at: '', updated_at: '' },
  { id: 'sch-11', day_of_week: 4, start_time: '10:00', end_time: '11:30', subject_name: 'Matematika', subject_color: '#2196F3', created_at: '', updated_at: '' },
  { id: 'sch-12', day_of_week: 4, start_time: '12:30', end_time: '14:00', subject_name: 'Prakarya', subject_color: '#795548', created_at: '', updated_at: '' },
  { id: 'sch-13', day_of_week: 5, start_time: '07:30', end_time: '09:00', subject_name: 'Senam / Pembiasaan', subject_color: '#32B94B', created_at: '', updated_at: '' },
  { id: 'sch-14', day_of_week: 5, start_time: '09:15', end_time: '11:00', subject_name: 'Bahasa Indonesia', subject_color: '#FF5A4E', created_at: '', updated_at: '' },
]

const todayStr = new Date().toISOString().split('T')[0]

const SEED_EVENTS: Omit<CalendarEvent, 'user_id'>[] = [
  {
    id: 'evt-1',
    event_date: todayStr,
    title: 'Ulangan Harian Matematika Bab 1',
    event_type: 'exam',
    sticker_key: 'pencil',
    created_at: '',
    updated_at: '',
  },
  {
    id: 'evt-2',
    event_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    title: 'Kerja Kelompok Poster IPA',
    event_type: 'group',
    sticker_key: 'group',
    created_at: '',
    updated_at: '',
  },
  {
    id: 'evt-3',
    event_date: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0],
    title: 'Ulang Tahun Doni (Teman Sekelas)',
    event_type: 'birthday',
    sticker_key: 'cake',
    created_at: '',
    updated_at: '',
  },
]

export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isDemoMode } = useAuth()

  const [tasks, setTasks] = useState<Task[]>([])
  const [goals, setGoals] = useState<SemesterGoal[]>([])
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentMood, setCurrentMood] = useState<MoodEntry | null>(null)
  const [customQuotes, setCustomQuotes] = useState<CustomQuote[]>([])
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([])
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true)
  const [notificationHistory, setNotificationHistory] = useState<NotificationItem[]>([])

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | null>(null)

  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(msg)
    setToastType(type)
    setTimeout(() => {
      setToastMessage(null)
      setToastType(null)
    }, 4000)
  }, [])

  const clearToast = useCallback(() => {
    setToastMessage(null)
    setToastType(null)
  }, [])

  const notifications = buildActiveNotifications(tasks, goals, schedule, events, Boolean(currentMood)).map(notification => ({
    ...notification,
    read: notificationHistory.find(item => item.id === notification.id)?.read ?? false,
  }))

  useEffect(() => {
    if (!user || isLoadingData) return
    const previous = new Map(notificationHistory.map(item => [item.id, item]))
    const merged = [...notificationHistory]
    notifications.forEach(notification => {
      const existing = previous.get(notification.id)
      if (!existing) merged.unshift(notification)
    })
    if (merged.length !== notificationHistory.length) {
      setNotificationHistory(merged)
      localStorage.setItem(`lz_notifications_${user.id}`, JSON.stringify(merged))
    }
  }, [events, goals, isLoadingData, notificationHistory, schedule, tasks, currentMood, user, notifications])

  const markNotificationRead = useCallback((id: string) => {
    setNotificationHistory(previous => {
      const updated = previous.map(item => item.id === id ? { ...item, read: true } : item)
      if (user) localStorage.setItem(`lz_notifications_${user.id}`, JSON.stringify(updated))
      return updated
    })
  }, [user])

  const markAllNotificationsRead = useCallback(() => {
    setNotificationHistory(previous => {
      const updated = previous.map(item => ({ ...item, read: true }))
      if (user) localStorage.setItem(`lz_notifications_${user.id}`, JSON.stringify(updated))
      return updated
    })
  }, [user])

  useEffect(() => {
    if (!user) {
      setTasks([])
      setGoals([])
      setSchedule([])
      setEvents([])
      setCurrentMood(null)
      setCustomQuotes([])
      setFocusSessions([])
      setNotificationHistory([])
      setIsLoadingData(false)
      return
    }

    const loadData = async () => {
      setIsLoadingData(true)

      if (isDemoMode || !isSupabaseConfigured) {
        const storedTasks = localStorage.getItem(`lz_tasks_${user.id}`)
        const storedGoals = localStorage.getItem(`lz_goals_${user.id}`)
        const storedSchedule = localStorage.getItem(`lz_sched_${user.id}`)
        const storedEvents = localStorage.getItem(`lz_events_${user.id}`)
        const storedMood = localStorage.getItem(`lz_mood_${user.id}_${todayStr}`)
        const storedQuotes = localStorage.getItem(`lz_quotes_${user.id}`)
        const storedSessions = localStorage.getItem(`lz_sessions_${user.id}`)
        const storedSettings = localStorage.getItem(`lz_settings_${user.id}`)
        const storedNotifications = localStorage.getItem(`lz_notifications_${user.id}`)

        setTasks(storedTasks ? JSON.parse(storedTasks) : SEED_TASKS.map(t => ({ ...t, user_id: user.id } as Task)))
        setGoals(storedGoals ? JSON.parse(storedGoals) : SEED_GOALS.map(g => ({ ...g, user_id: user.id } as SemesterGoal)))
        setSchedule(storedSchedule ? JSON.parse(storedSchedule) : SEED_SCHEDULE.map(s => ({ ...s, user_id: user.id } as ScheduleEntry)))
        setEvents(storedEvents ? JSON.parse(storedEvents) : SEED_EVENTS.map(e => ({ ...e, user_id: user.id } as CalendarEvent)))
        setCurrentMood(storedMood ? JSON.parse(storedMood) : null)
        setCustomQuotes(storedQuotes ? JSON.parse(storedQuotes) : [])
        setFocusSessions(storedSessions ? JSON.parse(storedSessions) : [])
        setSettings(storedSettings ? JSON.parse(storedSettings) : { ...DEFAULT_SETTINGS, user_id: user.id })
        setNotificationHistory(storedNotifications ? JSON.parse(storedNotifications) : [])

        setIsLoadingData(false)
        return
      }

      try {
        const [
          tasksRes,
          goalsRes,
          schedRes,
          eventsRes,
          moodRes,
          quotesRes,
          sessionsRes,
          settingsRes,
        ] = await Promise.all([
          (supabase as any).from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          (supabase as any).from('semester_goals').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
          (supabase as any).from('schedule_entries').select('*').eq('user_id', user.id).order('day_of_week').order('start_time'),
          (supabase as any).from('calendar_events').select('*').eq('user_id', user.id).order('event_date'),
          (supabase as any).from('mood_entries').select('*').eq('user_id', user.id).eq('entry_date', todayStr).maybeSingle(),
          (supabase as any).from('custom_quotes').select('*').eq('user_id', user.id),
          (supabase as any).from('focus_sessions').select('*').eq('user_id', user.id).order('started_at', { ascending: false }).limit(20),
          (supabase as any).from('user_settings').select('*').eq('user_id', user.id).maybeSingle(),
        ])

        const remoteResults = [tasksRes, goalsRes, schedRes, eventsRes, moodRes, quotesRes, sessionsRes, settingsRes]
        if (remoteResults.some(result => result.error)) {
          const storedTasks = localStorage.getItem(`lz_tasks_${user.id}`)
          const storedGoals = localStorage.getItem(`lz_goals_${user.id}`)
          const storedSchedule = localStorage.getItem(`lz_sched_${user.id}`)
          const storedEvents = localStorage.getItem(`lz_events_${user.id}`)
          const storedMood = localStorage.getItem(`lz_mood_${user.id}_${todayStr}`)
          const storedQuotes = localStorage.getItem(`lz_quotes_${user.id}`)
          const storedSessions = localStorage.getItem(`lz_sessions_${user.id}`)
          const storedSettings = localStorage.getItem(`lz_settings_${user.id}`)

          if (storedTasks) setTasks(JSON.parse(storedTasks))
          if (storedGoals) setGoals(JSON.parse(storedGoals))
          if (storedSchedule) setSchedule(JSON.parse(storedSchedule))
          if (storedEvents) setEvents(JSON.parse(storedEvents))
          if (storedMood) setCurrentMood(JSON.parse(storedMood))
          if (storedQuotes) setCustomQuotes(JSON.parse(storedQuotes))
          if (storedSessions) setFocusSessions(JSON.parse(storedSessions))
          if (storedSettings) setSettings(JSON.parse(storedSettings))
          const storedNotifications = localStorage.getItem(`lz_notifications_${user.id}`)
          if (storedNotifications) setNotificationHistory(JSON.parse(storedNotifications))
          showToast('Server tidak dapat diakses. Data lokal tetap digunakan.', 'info')
          setIsLoadingData(false)
          return
        }

        if (tasksRes.data) setTasks(tasksRes.data as Task[])
        if (goalsRes.data) setGoals(goalsRes.data as SemesterGoal[])
        if (schedRes.data) setSchedule(schedRes.data as ScheduleEntry[])
        if (eventsRes.data) setEvents(eventsRes.data as CalendarEvent[])
        if (moodRes.data) setCurrentMood(moodRes.data as MoodEntry)
        if (quotesRes.data) setCustomQuotes(quotesRes.data as CustomQuote[])
        if (sessionsRes.data) setFocusSessions(sessionsRes.data as FocusSession[])
        if (settingsRes.data) setSettings(settingsRes.data as UserSettings)
      } catch (err) {
        console.error('Error fetching planner data:', err)
        showToast('Gagal memuat data dari server. Silakan coba lagi.', 'error')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [user, isDemoMode, showToast])

  const syncLocal = (key: string, data: unknown) => {
    if (!user) return
    localStorage.setItem(`lz_${key}_${user.id}`, JSON.stringify(data))
  }

  // --- Task Methods ---
  const addTask = async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed_at'>) => {
    if (!user) return
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      user_id: user.id,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setTasks([newTask, ...tasks])

    if (isDemoMode || !isSupabaseConfigured) {
      syncLocal('tasks', [newTask, ...tasks])
      showToast('Tugas berhasil ditambahkan!', 'success')
      return
    }

    try {
      const { data, error } = await (supabase as any)
        .from('tasks')
        .insert({
          user_id: user.id,
          title: taskData.title,
          subject_name: taskData.subject_name,
          subject_color: taskData.subject_color,
          due_at: taskData.due_at,
          is_completed: taskData.is_completed || false,
        })
        .select()
        .single()

      if (error) throw error
      if (data) {
        setTasks(prev => prev.map(t => (t.id === newTask.id ? (data as Task) : t)))
      }
      showToast('Tugas berhasil ditambahkan!', 'success')
    } catch {
      syncLocal('tasks', [newTask, ...tasks])
      showToast('Tugas tersimpan di perangkat, tetapi belum tersinkron ke server.', 'info')
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const updated = tasks.map(t => (t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t))
    setTasks(updated)

    if (isDemoMode || !isSupabaseConfigured) {
      syncLocal('tasks', updated)
      showToast('Tugas berhasil diperbarui!', 'success')
      return
    }

    try {
      const { error } = await (supabase as any).from('tasks').update(updates).eq('id', id)
      if (error) throw error
      showToast('Tugas berhasil diperbarui!', 'success')
    } catch {
      syncLocal('tasks', updated)
      showToast('Perubahan tugas tersimpan di perangkat, tetapi belum tersinkron ke server.', 'info')
    }
  }

  const toggleTaskComplete = async (id: string, clientCoords?: { x: number; y: number }) => {
    const targetTask = tasks.find(t => t.id === id)
    if (!targetTask) return

    const willBeCompleted = !targetTask.is_completed
    const completed_at = willBeCompleted ? new Date().toISOString() : null

    if (willBeCompleted) {
      audioService.playTaskStarSound(settings.sound_enabled)
      const x = clientCoords ? clientCoords.x / window.innerWidth : 0.5
      const y = clientCoords ? clientCoords.y / window.innerHeight : 0.5
      triggerTaskStarConfetti(x, y, settings.reduced_motion)
    }

    const updated = tasks.map(t =>
      t.id === id ? { ...t, is_completed: willBeCompleted, completed_at, updated_at: new Date().toISOString() } : t
    )
    setTasks(updated)

    if (isDemoMode || !isSupabaseConfigured) {
      syncLocal('tasks', updated)
      return
    }

    try {
      const { error } = await (supabase as any)
        .from('tasks')
        .update({ is_completed: willBeCompleted, completed_at })
        .eq('id', id)
      if (error) throw error
    } catch {
      syncLocal('tasks', updated)
      showToast('Status tugas tersimpan di perangkat, tetapi belum tersinkron ke server.', 'info')
    }
  }

  const deleteTask = async (id: string) => {
    const updated = tasks.filter(t => t.id !== id)
    setTasks(updated)

    if (isDemoMode || !isSupabaseConfigured) {
      syncLocal('tasks', updated)
      showToast('Tugas dihapus.', 'info')
      return
    }

    try {
      const { error } = await (supabase as any).from('tasks').delete().eq('id', id)
      if (error) throw error
      showToast('Tugas dihapus.', 'info')
    } catch {
      syncLocal('tasks', updated)
      showToast('Tugas dihapus dari perangkat, tetapi belum tersinkron ke server.', 'info')
    }
  }

  // --- Goal Methods ---
  const addGoal = async (goalData: Omit<SemesterGoal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'badge_awarded'>) => {
    if (!user) return
    const is100 = (goalData.progress_percent || 0) >= 100
    const newGoal: SemesterGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      user_id: user.id,
      progress_percent: Math.min(100, Math.max(0, goalData.progress_percent || 0)),
      badge_awarded: is100,
      semester_label: goalData.semester_label || 'Semester 1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setGoals([...goals, newGoal])

    if (is100) {
      audioService.playGoalFanfare(settings.sound_enabled)
      triggerGoalUnlockConfetti(settings.reduced_motion)
    }

    if (isDemoMode || !isSupabaseConfigured) {
      syncLocal('goals', [...goals, newGoal])
      showToast('Target semester berhasil disimpan!', 'success')
      return
    }

    try {
      const { data, error } = await (supabase as any)
        .from('semester_goals')
        .insert({
          user_id: user.id,
          goal_text: goalData.goal_text,
          progress_percent: newGoal.progress_percent,
          semester_label: newGoal.semester_label,
          deadline_date: newGoal.deadline_date,
        })
        .select()
        .single()

      if (error) throw error
      if (data) {
        setGoals(prev => prev.map(g => (g.id === newGoal.id ? (data as SemesterGoal) : g)))
      }
      showToast('Target semester berhasil disimpan!', 'success')
    } catch {
      syncLocal('goals', [...goals, newGoal])
      showToast('Target tersimpan di perangkat, tetapi belum tersinkron ke server.', 'info')
    }
  }

  const updateGoalProgress = async (id: string, progress: number) => {
    const validProgress = Math.min(100, Math.max(0, Math.round(progress)))
    const targetGoal = goals.find(g => g.id === id)
    const isNow100 = validProgress === 100 && (!targetGoal || targetGoal.progress_percent < 100)

    if (isNow100) {
      audioService.playGoalFanfare(settings.sound_enabled)
      triggerGoalUnlockConfetti(settings.reduced_motion)
      showToast('🎉 Selamat! Target tercapai 100%! Lencana terbuka!', 'success')
    }

    const updated = goals.map(g =>
      g.id === id
        ? {
            ...g,
            progress_percent: validProgress,
            badge_awarded: validProgress === 100,
            updated_at: new Date().toISOString(),
          }
        : g
    )
    setGoals(updated)

    if (isDemoMode || !isSupabaseConfigured) {
      syncLocal('goals', updated)
      return
    }

    try {
      const { error } = await (supabase as any)
        .from('semester_goals')
        .update({ progress_percent: validProgress })
        .eq('id', id)
      if (error) throw error
    } catch {
      syncLocal('goals', updated)
      showToast('Progres tersimpan di perangkat, tetapi belum tersinkron ke server.', 'info')
    }
  }

  const updateGoal = async (id: string, updates: Partial<SemesterGoal>) => {
    const updated = goals.map(g => (g.id === id ? { ...g, ...updates, updated_at: new Date().toISOString() } : g))
    setGoals(updated)

    if (isDemoMode || !isSupabaseConfigured) {
      syncLocal('goals', updated)
      showToast('Target berhasil diperbarui!', 'success')
      return
    }

    try {
      const { error } = await (supabase as any).from('semester_goals').update(updates).eq('id', id)
      if (error) throw error
      showToast('Target berhasil diperbarui!', 'success')
    } catch {
      syncLocal('goals', updated)
      showToast('Perubahan target tersimpan di perangkat, tetapi belum tersinkron ke server.', 'info')
    }
  }

  const deleteGoal = async (id: string) => {
    const updated = goals.filter(g => g.id !== id)
    setGoals(updated)

    if (isDemoMode || !isSupabaseConfigured) {
      syncLocal('goals', updated)
      showToast('Target dihapus.', 'info')
      return
    }

    try {
      const { error } = await (supabase as any).from('semester_goals').delete().eq('id', id)
      if (error) throw error
      showToast('Target dihapus.', 'info')
    } catch {
      syncLocal('goals', updated)
      showToast('Target dihapus dari perangkat, tetapi belum tersinkron ke server.', 'info')
    }
  }

  // --- Schedule Methods ---
  const addScheduleEntry = async (entryData: Omit<ScheduleEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return
    const newEntry: ScheduleEntry = {
      ...entryData,
      id: `sch-${Date.now()}`,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const updated = [...schedule, newEntry].sort((a, b) => {
      if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week
      return a.start_time.localeCompare(b.start_time)
    })
    setSchedule(updated)

    if (isDemoMode || !isSupabaseConfigured) {
      syncLocal('sched', updated)
      showToast('Jadwal pelajaran ditambahkan!', 'success')
      return
    }

    try {
      const { data, error } = await (supabase as any)
        .from('schedule_entries')
        .insert({
          user_id: user.id,
          day_of_week: entryData.day_of_week,
          start_time: entryData.start_time,
          end_time: entryData.end_time,
          subject_name: entryData.subject_name,
          subject_color: entryData.subject_color,
        })
        .select()
        .single()

      if (error) throw error
      if (data) {
        setSchedule(prev => prev.map(s => (s.id === newEntry.id ? (data as ScheduleEntry) : s)))
      }
      showToast('Jadwal pelajaran ditambahkan!', 'success')
    } catch {
      syncLocal('sched', updated)
      showToast('Jadwal tersimpan di perangkat, tetapi belum tersinkron ke server.', 'info')
    }
  }

  const updateScheduleEntry = async (id: string, updates: Partial<ScheduleEntry>) => {
    const updated = schedule.map(s => (s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s))
    setSchedule(updated)

    if (isDemoMode || !isSupabaseConfigured) {
      syncLocal('sched', updated)
      showToast('Jadwal diperbarui!', 'success')
      return
    }

    try {
      const { error } = await (supabase as any).from('schedule_entries').update(updates).eq('id', id)
      if (error) throw error
      showToast('Jadwal diperbarui!', 'success')
    } catch {
      syncLocal('sched', updated)
      showToast('Perubahan jadwal tersimpan di perangkat, tetapi belum tersinkron ke server.', 'info')
    }
  }

  const deleteScheduleEntry = async (id: string) => {
    const updated = schedule.filter(s => s.id !== id)
    setSchedule(updated)

    if (isDemoMode || !isSupabaseConfigured) {
      syncLocal('sched', updated)
      showToast('Jadwal dihapus.', 'info')
      return
    }

    try {
      const { error } = await (supabase as any).from('schedule_entries').delete().eq('id', id)
      if (error) throw error
      showToast('Jadwal dihapus.', 'info')
    } catch {
      syncLocal('sched', updated)
      showToast('Jadwal dihapus dari perangkat, tetapi belum tersinkron ke server.', 'info')
    }
  }

  // --- Calendar Event Methods ---
  const addEvent = async (eventData: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setEvents([...events, newEvent])

    if (isDemoMode || !isSupabaseConfigured) {
      syncLocal('events', [...events, newEvent])
      showToast('Kegiatan kalender ditambahkan!', 'success')
      return
    }

    try {
      const { data, error } = await (supabase as any)
        .from('calendar_events')
        .insert({
          user_id: user.id,
          event_date: eventData.event_date,
          title: eventData.title,
          event_type: eventData.event_type,
          sticker_key: eventData.sticker_key,
        })
        .select()
        .single()

      if (error) throw error
      if (data) {
        setEvents(prev => prev.map(e => (e.id === newEvent.id ? (data as CalendarEvent) : e)))
      }
      showToast('Kegiatan kalender ditambahkan!', 'success')
    } catch {
      syncLocal('events', [...events, newEvent])
      showToast('Kegiatan tersimpan di perangkat, tetapi belum tersinkron ke server.', 'info')
    }
  }

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    const updated = events.map(e => (e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e))
    setEvents(updated)

    if (isDemoMode || !isSupabaseConfigured) {
      syncLocal('events', updated)
      showToast('Kegiatan kalender diperbarui!', 'success')
      return
    }

    try {
      const { error } = await (supabase as any).from('calendar_events').update(updates).eq('id', id)
      if (error) throw error
      showToast('Kegiatan kalender diperbarui!', 'success')
    } catch {
      syncLocal('events', updated)
      showToast('Perubahan kegiatan tersimpan di perangkat, tetapi belum tersinkron ke server.', 'info')
    }
  }

  const deleteEvent = async (id: string) => {
    const updated = events.filter(e => e.id !== id)
    setEvents(updated)

    if (isDemoMode || !isSupabaseConfigured) {
      syncLocal('events', updated)
      showToast('Kegiatan dihapus.', 'info')
      return
    }

    try {
      const { error } = await (supabase as any).from('calendar_events').delete().eq('id', id)
      if (error) throw error
      showToast('Kegiatan dihapus.', 'info')
    } catch {
      syncLocal('events', updated)
      showToast('Kegiatan dihapus dari perangkat, tetapi belum tersinkron ke server.', 'info')
    }
  }

  // --- Mood Methods ---
  const setDailyMood = async (mood: MoodType) => {
    if (!user) return
    const recQuote = getRecommendedQuote(mood)

    const newMoodEntry: MoodEntry = {
      id: currentMood?.id || `mood-${todayStr}`,
      user_id: user.id,
      entry_date: todayStr,
      mood,
      recommended_quote: recQuote,
      created_at: currentMood?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setCurrentMood(newMoodEntry)

    if (isDemoMode || !isSupabaseConfigured) {
      localStorage.setItem(`lz_mood_${user.id}_${todayStr}`, JSON.stringify(newMoodEntry))
      showToast(`Mood hari ini tercatat: ${mood.toUpperCase()} ✨`, 'success')
      return
    }

    try {
      const { error } = await (supabase as any)
        .from('mood_entries')
        .upsert({
          user_id: user.id,
          entry_date: todayStr,
          mood,
          recommended_quote: recQuote,
        })
      if (error) throw error
      showToast(`Mood hari ini tercatat: ${mood.toUpperCase()} ✨`, 'success')
    } catch {
      localStorage.setItem(`lz_mood_${user.id}_${todayStr}`, JSON.stringify(newMoodEntry))
      showToast('Mood tersimpan di perangkat, tetapi belum tersinkron ke server.', 'info')
    }
  }

  // --- Custom Quote Methods ---
  const addCustomQuote = async (quote_text: string, setActive = true) => {
    if (!user) return
    const newQuote: CustomQuote = {
      id: `quote-${Date.now()}`,
      user_id: user.id,
      quote_text: quote_text.trim(),
      is_active: setActive,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const updated = customQuotes.map(q => (setActive ? { ...q, is_active: false } : q))
    updated.push(newQuote)
    setCustomQuotes(updated)

    if (isDemoMode || !isSupabaseConfigured) {
      syncLocal('quotes', updated)
      showToast('Kata motivasimu tersimpan!', 'success')
      return
    }

    try {
      if (setActive) {
        await (supabase as any).from('custom_quotes').update({ is_active: false }).eq('user_id', user.id)
      }
      const { data, error } = await (supabase as any)
        .from('custom_quotes')
        .insert({
          user_id: user.id,
          quote_text: quote_text.trim(),
          is_active: setActive,
        })
        .select()
        .single()

      if (error) throw error
      if (data) {
        setCustomQuotes(prev => prev.map(q => (q.id === newQuote.id ? (data as CustomQuote) : q)))
      }
      showToast('Kata motivasimu tersimpan!', 'success')
    } catch {
      syncLocal('quotes', updated)
      showToast('Motivasi tersimpan di perangkat, tetapi belum tersinkron ke server.', 'info')
    }
  }

  const deleteCustomQuote = async (id: string) => {
    const updated = customQuotes.filter(q => q.id !== id)
    setCustomQuotes(updated)

    if (isDemoMode || !isSupabaseConfigured) {
      syncLocal('quotes', updated)
      return
    }

    try {
      const { error } = await (supabase as any).from('custom_quotes').delete().eq('id', id)
      if (error) throw error
    } catch {
      syncLocal('quotes', updated)
      showToast('Motivasi dihapus dari perangkat, tetapi belum tersinkron ke server.', 'info')
    }
  }

  const setActiveQuote = async (id: string) => {
    const updated = customQuotes.map(q => ({ ...q, is_active: q.id === id }))
    setCustomQuotes(updated)

    if (isDemoMode || !isSupabaseConfigured) {
      syncLocal('quotes', updated)
      showToast('Motivasi aktif diperbarui!', 'success')
      return
    }

    try {
      const { error: deactivateError } = await (supabase as any).from('custom_quotes').update({ is_active: false }).eq('user_id', user!.id)
      if (deactivateError) throw deactivateError
      const { error: activateError } = await (supabase as any).from('custom_quotes').update({ is_active: true }).eq('id', id)
      if (activateError) throw activateError
      showToast('Motivasi aktif diperbarui!', 'success')
    } catch {
      syncLocal('quotes', updated)
      showToast('Motivasi tersimpan di perangkat, tetapi belum tersinkron ke server.', 'info')
    }
  }

  // --- Focus Session Logging ---
  const logFocusSession = async (sess: { focus_minutes: number; break_minutes: number; started_at: string; ended_at?: string; status: 'completed' | 'cancelled' }) => {
    if (!user) return
    const newSession: FocusSession = {
      id: `sess-${Date.now()}`,
      user_id: user.id,
      focus_minutes: sess.focus_minutes,
      break_minutes: sess.break_minutes,
      started_at: sess.started_at,
      ended_at: sess.ended_at || new Date().toISOString(),
      status: sess.status,
      created_at: new Date().toISOString(),
    }

    const updated = [newSession, ...focusSessions]
    setFocusSessions(updated)

    if (isDemoMode || !isSupabaseConfigured) {
      syncLocal('sessions', updated)
      return
    }

    try {
      const { error } = await (supabase as any).from('focus_sessions').insert(newSession)
      if (error) throw error
    } catch (err) {
      console.error('Focus session save error:', err)
      syncLocal('sessions', updated)
      showToast('Sesi fokus tersimpan di perangkat, tetapi belum tersinkron ke server.', 'info')
    }
  }

  // --- Settings Methods ---
  const updateSettings = async (updates: Partial<UserSettings>) => {
    const updated = { ...settings, ...updates, updated_at: new Date().toISOString() }
    setSettings(updated)

    if (isDemoMode || !isSupabaseConfigured) {
      syncLocal('settings', updated)
      showToast('Pengaturan disimpan!', 'success')
      return
    }

    try {
      const { error } = await (supabase as any)
        .from('user_settings')
        .upsert({
          user_id: user!.id,
          alarm_sound: updated.alarm_sound,
          background_audio: updated.background_audio,
          reduced_motion: updated.reduced_motion,
          sound_enabled: updated.sound_enabled,
        })
      if (error) throw error
      showToast('Pengaturan disimpan!', 'success')
    } catch {
      syncLocal('settings', updated)
      showToast('Pengaturan tersimpan di perangkat, tetapi belum tersinkron ke server.', 'info')
    }
  }

  return (
    <PlannerContext.Provider
      value={{
        tasks,
        goals,
        schedule,
        events,
        currentMood,
        customQuotes,
        focusSessions,
        settings,
        notifications,
        notificationHistory,
        markNotificationRead,
        markAllNotificationsRead,
        isLoadingData,
        addTask,
        updateTask,
        toggleTaskComplete,
        deleteTask,
        addGoal,
        updateGoalProgress,
        updateGoal,
        deleteGoal,
        addScheduleEntry,
        updateScheduleEntry,
        deleteScheduleEntry,
        addEvent,
        updateEvent,
        deleteEvent,
        setDailyMood,
        addCustomQuote,
        deleteCustomQuote,
        setActiveQuote,
        logFocusSession,
        updateSettings,
        toastMessage,
        toastType,
        showToast,
        clearToast,
      }}
    >
      {children}
    </PlannerContext.Provider>
  )
}

export const usePlanner = () => {
  const context = useContext(PlannerContext)
  if (!context) {
    throw new Error('usePlanner must be used within a PlannerProvider')
  }
  return context
}
