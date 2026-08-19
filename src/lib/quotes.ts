import type { MoodType } from '../types/planner'

export const MOOD_QUOTES: Record<MoodType, string[]> = {
  semangat: [
    'Hari ini penuh energi! Ayo selesaikan target belajarmu dengan hebat!',
    'Langkah kecil yang konsisten setiap hari membawamu ke puncak impian.',
    'Fokus pada prosesnya, hasil terbaik pasti akan mengikuti semangatmu!',
    'Kamu punya potensi luar biasa. Tunjukkan kemampuan terbaikmu hari ini!'
  ],
  lelah: [
    'Istirahat sejenak itu bagian dari belajar. Tarik napas, tenangkan pikiran.',
    'Jangan memaksakan diri. Rehat 10 menit, lalu kita lanjut dengan segar!',
    'Kamu sudah berusaha keras hari ini, banggalah pada usahamu.',
    'Tidur cukup dan rileks akan membuat otakmu bekerja jauh lebih tajam besok.'
  ],
  senang: [
    'Pertahankan senyuman dan keceriaanmu! Belajar jadi jauh lebih ringan.',
    'Suasana hati yang bahagia adalah kunci untuk menyerap ilmu dengan cepat.',
    'Bagikan energi positifmu ke teman-teman di kelas hari ini!',
    'Keceriaanmu hari ini membuat setiap tantangan belajar terasa seru.'
  ],
  bingung: [
    'Wajar jika merasa bingung. Rasa ingin tahu adalah awal dari kepintaran.',
    'Pecah materi yang sulit jadi bagian-bagian kecil, kamu pasti bisa memahaminya.',
    'Jangan ragu bertanya pada guru atau teman. Bertanya tanda kamu berpikir!',
    'Setiap ahli dulunya juga pernah bingung. Teruslah mencoba!'
  ]
}

export function getRecommendedQuote(mood: MoodType): string {
  const list = MOOD_QUOTES[mood] || MOOD_QUOTES.semangat
  // Deterministic quote based on day of year to keep it fresh yet stable for the day
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return list[dayOfYear % list.length]
}

export const DEFAULT_STUDENT_QUOTES = [
  'Belajar hari ini, memimpin di masa depan.',
  'Sukses adalah jumlah dari usaha-usaha kecil yang diulangi hari demi hari.',
  'Jangan takut salah, karena kesalahan adalah cara terbaik untuk belajar.'
]
