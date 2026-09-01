import type { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type SemesterGoal = Database['public']['Tables']['semester_goals']['Row']
export type ScheduleEntry = Database['public']['Tables']['schedule_entries']['Row']
export type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']
export type MoodEntry = Database['public']['Tables']['mood_entries']['Row']
export type CustomQuote = Database['public']['Tables']['custom_quotes']['Row']
export type FocusSession = Database['public']['Tables']['focus_sessions']['Row']
export type UserSettings = Database['public']['Tables']['user_settings']['Row']

export type MoodType = 'semangat' | 'lelah' | 'senang' | 'bingung'
export type AlarmSound = 'school_bell' | 'cheerful' | 'nature'
export interface NotificationItem {
  id: string
  kind: 'task' | 'goal' | 'schedule' | 'event' | 'mood'
  title: string
  message: string
  dueDate: string
  createdAt: string
  read: boolean
}
export type BackgroundAudio = 'none' | 'instrumental' | 'soft_rain'
export type EventType = 'exam' | 'assignment' | 'birthday' | 'holiday' | 'group' | 'other'

export interface SubjectPreset {
  name: string
  color: string
}

export const DEFAULT_CUSTOM_SUBJECT_COLOR = '#607D8B'

export const SUBJECT_PRESETS: SubjectPreset[] = [
  { name: 'Matematika', color: '#2196F3' },
  { name: 'IPA (Sains)', color: '#32B94B' },
  { name: 'IPS', color: '#FF9800' },
  { name: 'Bahasa Indonesia', color: '#FF5A4E' },
  { name: 'Bahasa Inggris', color: '#7C4DFF' },
  { name: 'Informatika', color: '#00BCD4' },
  { name: 'Pendidikan Agama', color: '#4CAF50' },
  { name: 'PPKn', color: '#E91E63' },
  { name: 'PJOK', color: '#FF5722' },
  { name: 'Seni Budaya', color: '#9C27B0' },
  { name: 'Prakarya', color: '#795548' },
]

export const STICKER_PRESETS: { key: string; label: string; icon: string }[] = [
  { key: 'pencil', label: 'Ujian / Ulangan', icon: '✏️' },
  { key: 'cake', label: 'Ulang Tahun', icon: '🎂' },
  { key: 'book', label: 'Tugas / PR', icon: '📚' },
  { key: 'holiday', label: 'Liburan', icon: '🏖️' },
  { key: 'group', label: 'Kerja Kelompok', icon: '👥' },
  { key: 'trophy', label: 'Lomba / Prestasi', icon: '🏆' },
  { key: 'star', label: 'Penting', icon: '⭐' },
]

export const DAY_NAMES = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu'
]

export const DAY_NAMES_ID_MAP: { [key: number]: string } = {
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
}
