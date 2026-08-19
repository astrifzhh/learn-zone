import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { useAuth } from '../../context/AuthContext'
import { usePlanner } from '../../context/PlannerContext'
import { isSupabaseConfigured } from '../../lib/supabase'
import { ShieldCheck } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile, signOut } = useAuth()
  const { settings, updateSettings, showToast } = usePlanner()

  const [nickname, setNickname] = useState('')
  const [className, setClassName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname)
      setClassName(profile.class_name)
    }
  }, [profile, isOpen])

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(word => word[0]?.toUpperCase())
      .join('')
      .slice(0, 2) || 'NA'
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim()) return

    setIsSaving(true)
    const { error } = await updateProfile({
      nickname: nickname.trim(),
      class_name: className.trim(),
    })

    setIsSaving(false)
    if (!error) {
      setSaveSuccess(true)
      showToast('Profil berhasil disimpan!', 'success')
      setTimeout(() => setSaveSuccess(false), 2000)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profil & Pengaturan Siswa">
      <form onSubmit={handleSave}>
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: isSupabaseConfigured ? '#E8F7EA' : 'var(--color-achievement-soft)',
            border: `1px solid ${isSupabaseConfigured ? '#C8E6C9' : '#FFE082'}`,
            borderRadius: '10px',
            fontSize: '12px',
            color: isSupabaseConfigured ? '#2E7D32' : '#8A5300',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            fontWeight: 600,
          }}
        >
          <ShieldCheck size={16} />
          <span>
            {isSupabaseConfigured
              ? 'Terhubung dengan Supabase Postgres & Auth'
              : 'Mode Demo Offline — Data tersimpan di browser Anda'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid var(--color-primary)',
              backgroundColor: 'var(--color-primary-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontWeight: 700,
              fontSize: '24px',
              color: 'var(--color-primary)',
            }}
          >
            {getInitials(nickname)}
          </div>

          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Inisial dari nama panggilan kamu
          </div>
        </div>

        <div className="lz-form-group">
          <label className="lz-label" htmlFor="student-nickname">
            Nama Panggilan Siswa <span style={{ color: 'var(--color-action)' }}>*</span>
          </label>
          <input
            id="student-nickname"
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            placeholder="Contoh: Budi"
            maxLength={40}
            required
          />
        </div>

        <div className="lz-form-group">
          <label className="lz-label" htmlFor="student-class">
            Kelas
          </label>
          <input
            id="student-class"
            type="text"
            value={className}
            onChange={e => setClassName(e.target.value)}
            placeholder="Contoh: Kelas 7B"
            maxLength={30}
          />
        </div>

        <div className="lz-form-group">
          <label className="lz-label" htmlFor="student-email">
            Email
          </label>
          <input
            id="student-email"
            type="email"
            value={profile?.email || ''}
            readOnly
            disabled
          />
        </div>

        <div
          style={{
            borderTop: '1px solid var(--color-border-subtle)',
            paddingTop: '16px',
            marginTop: '16px',
          }}
        >
          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>
            Preferensi Suara & Animasi
          </h4>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>Efek Suara Bel & Bintang</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Bunyikan lonceng saat selesai tugas & timer
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.sound_enabled}
              onChange={e => updateSettings({ sound_enabled: e.target.checked })}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>Kurangi Animasi (Reduced Motion)</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Matikan animasi konfeti dan transisi bergerak
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.reduced_motion}
              onChange={e => updateSettings({ reduced_motion: e.target.checked })}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '24px',
            borderTop: '1px solid var(--color-border-subtle)',
            paddingTop: '16px',
          }}
        >
          <button
            type="button"
            onClick={signOut}
            className="lz-btn lz-btn-ghost lz-btn-sm"
            style={{ color: 'var(--color-action)' }}
          >
            Keluar dari Akun
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="lz-btn lz-btn-ghost"
              onClick={onClose}
            >
              Tutup
            </button>
            <button
              type="submit"
              className="lz-btn lz-btn-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Menyimpan...' : saveSuccess ? 'Tersimpan!' : 'Simpan Profil'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
