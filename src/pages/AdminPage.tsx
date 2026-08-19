import React, { useEffect, useMemo, useState } from 'react'
import { Download, ShieldCheck, Users, BookOpen, CheckCircle2 } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Profile, SemesterGoal, Task } from '../types/planner'
import { useAuth } from '../context/AuthContext'

interface AdminPageProps {
  onBackToPlanner: () => void
}

interface StudentSummaryRow {
  id: string
  nama: string
  email: string
  kelas: string
  target: number
  tugasSelesai: number
  totalTugas: number
  progres: string
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToPlanner }) => {
  const { signOut, profile } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [goals, setGoals] = useState<SemesterGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [exportedAt, setExportedAt] = useState<string | null>(null)

  useEffect(() => {
    const loadAdminData = async () => {
      if (!isSupabaseConfigured) {
        setErrorMessage('Halaman Admin membutuhkan koneksi Supabase aktif.')
        setIsLoading(false)
        return
      }

      const [profilesResult, tasksResult, goalsResult] = await Promise.all([
        (supabase as any).from('profiles').select('*').eq('role', 'student').order('nickname'),
        (supabase as any).from('tasks').select('*'),
        (supabase as any).from('semester_goals').select('*'),
      ])

      const firstError = profilesResult.error || tasksResult.error || goalsResult.error
      if (firstError) {
        setErrorMessage(firstError.message)
      } else {
        setProfiles((profilesResult.data || []) as Profile[])
        setTasks((tasksResult.data || []) as Task[])
        setGoals((goalsResult.data || []) as SemesterGoal[])
      }
      setIsLoading(false)
    }

    loadAdminData()
  }, [])

  const students = useMemo<StudentSummaryRow[]>(() => profiles.map(student => {
    const studentTasks = tasks.filter(task => task.user_id === student.id)
    const studentGoals = goals.filter(goal => goal.user_id === student.id)
    const completedGoals = studentGoals.filter(goal => goal.progress_percent >= 100).length

    return {
      id: student.id,
      nama: student.nickname,
      email: student.email,
      kelas: student.class_name,
      target: studentGoals.length,
      tugasSelesai: studentTasks.filter(task => task.is_completed).length,
      totalTugas: studentTasks.length,
      progres: `${studentGoals.length ? Math.round((completedGoals / studentGoals.length) * 100) : 0}%`,
    }
  }), [profiles, tasks, goals])

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.is_completed).length
  const totalGoals = goals.length

  const exportCsv = () => {
    const headers = ['Nama', 'Email', 'Kelas', 'Target', 'Tugas Selesai', 'Total Tugas', 'Progres']
    const rows = students.map(student => [
      student.nama,
      student.email,
      student.kelas,
      String(student.target),
      String(student.tugasSelesai),
      String(student.totalTugas),
      student.progres,
    ])
    const csv = [headers, ...rows]
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `rekap-siswa-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    setExportedAt(new Date().toLocaleString('id-ID'))
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ShieldCheck size={20} color="var(--color-primary)" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)' }}>Halaman Admin</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>Monitoring Siswa</h1>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>{profile?.email}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={exportCsv} className="lz-btn lz-btn-primary" disabled={isLoading || Boolean(errorMessage)}>
            <Download size={16} />
            <span>Export Rekap Data</span>
          </button>
          <button onClick={signOut} className="lz-btn lz-btn-ghost">Keluar Admin</button>
          <button onClick={onBackToPlanner} className="lz-btn lz-btn-ghost">Kembali ke Planner</button>
        </div>
      </div>

      {errorMessage && <div className="lz-input-error" style={{ marginBottom: '16px' }}>{errorMessage}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '22px' }}>
        <div className="lz-card" style={{ padding: '18px' }}><div className="lz-help-text">Total Siswa</div><strong style={{ fontSize: '24px' }}><Users size={20} color="#2196F3" /> {isLoading ? '...' : students.length}</strong></div>
        <div className="lz-card" style={{ padding: '18px' }}><div className="lz-help-text">Tugas Selesai</div><strong style={{ fontSize: '24px' }}><CheckCircle2 size={20} color="#32B94B" /> {isLoading ? '...' : completedTasks}</strong></div>
        <div className="lz-card" style={{ padding: '18px' }}><div className="lz-help-text">Total Tugas</div><strong style={{ fontSize: '24px' }}><BookOpen size={20} color="#FF9800" /> {isLoading ? '...' : totalTasks}</strong></div>
        <div className="lz-card" style={{ padding: '18px' }}><div className="lz-help-text">Total Target</div><strong style={{ fontSize: '24px' }}>{isLoading ? '...' : totalGoals}</strong></div>
      </div>

      <div className="lz-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '12px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Data Siswa</h2>
          {exportedAt && <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Terakhir diexport: {exportedAt}</span>}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '850px' }}>
            <thead><tr style={{ backgroundColor: '#F7F9FC' }}>{['Nama', 'Email', 'Kelas', 'Target', 'Tugas Selesai', 'Total Tugas', 'Progres'].map(header => <th key={header} style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid var(--color-border)' }}>{header}</th>)}</tr></thead>
            <tbody>
              {students.map(student => <tr key={student.id}>{[student.nama, student.email, student.kelas, student.target, student.tugasSelesai, student.totalTugas, student.progres].map((value, index) => <td key={`${student.id}-${index}`} style={{ padding: '12px', borderBottom: '1px solid var(--color-border-subtle)' }}>{value}</td>)}</tr>)}
              {!isLoading && !students.length && <tr><td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Belum ada data siswa.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
