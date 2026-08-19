import React, { useState } from 'react'
import { Sparkles, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export type AuthMode = 'login' | 'register' | 'forgot-password' | 'update-password'

interface AuthFormProps {
  mode: AuthMode
  onSwitchMode: (mode: AuthMode) => void
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onSwitchMode }) => {
  const { signIn, signUp, resetPassword, updatePassword, loginDemoUser } = useAuth()

  const [identifier, setIdentifier] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [className, setClassName] = useState('Kelas 7B')
  const [showPassword, setShowPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const validatePasswordStrength = (pass: string) => {
    return {
      length: pass.length >= 6,
      hasLetter: /[a-zA-Z]/.test(pass),
      hasNumber: /[0-9]/.test(pass),
    }
  }

  const passValidation = validatePasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    setIsLoading(true)

    try {
      if (mode === 'login') {
        if (!identifier.trim()) {
          setErrorMsg('Masukkan email Anda.')
          setIsLoading(false)
          return
        }

        const { error } = await signIn(identifier.trim(), password)
        if (error) {
          setErrorMsg(error.message || 'Email atau password tidak sesuai. Silakan periksa kembali.')
        }
      } else if (mode === 'register') {
        if (!nickname.trim()) {
          setErrorMsg('Nama panggilan wajib diisi')
          setIsLoading(false)
          return
        }
        if (password !== confirmPassword) {
          setErrorMsg('Konfirmasi password tidak cocok')
          setIsLoading(false)
          return
        }
        if (password.length < 6) {
          setErrorMsg('Password minimal 6 karakter')
          setIsLoading(false)
          return
        }

        const { error, needsEmailConfirmation } = await signUp({
          email: email.trim(),
          password,
          nickname: nickname.trim(),
          className: className.trim(),
        })

        if (error) {
          const signupError = error.message.toLowerCase()
          setErrorMsg(
            signupError.includes('rate limit')
              ? 'Batas pengiriman email Supabase tercapai. Tunggu beberapa menit atau gunakan SMTP sendiri di Supabase.'
              : error.message || 'Gagal mendaftar. Silakan coba lagi.'
          )
        } else if (needsEmailConfirmation) {
          setSuccessMsg('Pendaftaran berhasil! Cek email Anda untuk konfirmasi akun.')
        } else {
          setSuccessMsg('Akun berhasil dibuat. Anda dapat masuk menggunakan email dan password.')
        }
      } else if (mode === 'forgot-password') {
        if (!email.trim()) {
          setErrorMsg('Masukkan email akun Anda')
          setIsLoading(false)
          return
        }
        const { error } = await resetPassword(email.trim())
        if (error) {
          setErrorMsg('Terjadi kendala saat mengirim email pemulihan.')
        } else {
          setSuccessMsg('Tautan pemulihan password telah dikirim ke email Anda.')
        }
      } else if (mode === 'update-password') {
        if (password.length < 6) {
          setErrorMsg('Password baru minimal 6 karakter')
          setIsLoading(false)
          return
        }
        const { error } = await updatePassword(password)
        if (error) {
          setErrorMsg('Gagal memperbarui password.')
        } else {
          setSuccessMsg('Password berhasil diperbarui! Silakan kembali ke Beranda.')
        }
      }
    } catch {
      setErrorMsg('Terjadi kesalahan koneksi. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-card)',
        padding: '36px 32px',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Header Logo & Title */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            marginBottom: '12px',
            boxShadow: '0 6px 16px rgba(33, 150, 243, 0.3)',
          }}
        >
          <Sparkles size={28} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>
          {mode === 'login' && 'Masuk ke LEARN ZONE'}
          {mode === 'register' && 'Daftar Akun Siswa'}
          {mode === 'forgot-password' && 'Lupa Password?'}
          {mode === 'update-password' && 'Atur Password Baru'}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
          {mode === 'login' && 'Atur belajarmu lebih rapi, teratur, dan menyenangkan'}
          {mode === 'register' && 'Buat akun planner belajarmu dalam hitungan detik'}
          {mode === 'forgot-password' && 'Masukkan emailmu untuk menerima instruksi pemulihan'}
          {mode === 'update-password' && 'Masukkan password baru yang aman'}
        </p>
      </div>

      {errorMsg && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: '#FFEBEE',
            border: '1px solid #FFCDD2',
            color: '#C62828',
            borderRadius: '10px',
            fontSize: '13px',
            marginBottom: '18px',
            fontWeight: 600,
          }}
        >
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: '#E8F7EA',
            border: '1px solid #C8E6C9',
            color: '#2E7D32',
            borderRadius: '10px',
            fontSize: '13px',
            marginBottom: '18px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={18} color="#32B94B" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <>
            <div className="lz-form-group">
              <label className="lz-label" htmlFor="auth-nickname">
                Nama Panggilan Siswa <span style={{ color: 'var(--color-action)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="auth-nickname"
                  type="text"
                  placeholder="Contoh: Budi"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  maxLength={40}
                  required
                />
              </div>
            </div>

            <div className="lz-form-group">
              <label className="lz-label" htmlFor="auth-class">
                Kelas
              </label>
              <input
                id="auth-class"
                type="text"
                placeholder="Contoh: Kelas 7B"
                value={className}
                onChange={e => setClassName(e.target.value)}
                maxLength={30}
              />
            </div>
          </>
        )}

        {mode === 'login' && (
          <div className="lz-form-group">
            <label className="lz-label" htmlFor="auth-email">
              Email <span style={{ color: 'var(--color-action)' }}>*</span>
            </label>
            <input
              id="auth-email"
              type="email"
              placeholder="nama@email.com"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
        )}

        {mode === 'register' && (
          <>
            <div className="lz-form-group">
              <label className="lz-label" htmlFor="auth-email">
                Email <span style={{ color: 'var(--color-action)' }}>*</span>
              </label>
              <input
                id="auth-email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </>
        )}

        {mode === 'forgot-password' && (
          <div className="lz-form-group">
            <label className="lz-label" htmlFor="auth-email">
              Email akun Anda <span style={{ color: 'var(--color-action)' }}>*</span>
            </label>
            <input
              id="auth-email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
        )}

        {mode !== 'forgot-password' && (
          <div className="lz-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="lz-label" htmlFor="auth-password">
                {mode === 'update-password' ? 'Password Baru' : 'Password'} <span style={{ color: 'var(--color-action)' }}>*</span>
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => onSwitchMode('forgot-password')}
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    marginBottom: '6px',
                  }}
                >
                  Lupa password?
                </button>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                style={{ paddingRight: '42px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                }}
                aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {mode === 'register' && password && (
              <div style={{ marginTop: '8px', fontSize: '11px', display: 'flex', gap: '10px' }}>
                <span style={{ color: passValidation.length ? '#2E7D32' : 'var(--color-text-muted)' }}>
                  {passValidation.length ? '✓' : '•'} Min. 6 karakter
                </span>
                <span style={{ color: passValidation.hasLetter ? '#2E7D32' : 'var(--color-text-muted)' }}>
                  {passValidation.hasLetter ? '✓' : '•'} Huruf
                </span>
                <span style={{ color: passValidation.hasNumber ? '#2E7D32' : 'var(--color-text-muted)' }}>
                  {passValidation.hasNumber ? '✓' : '•'} Angka
                </span>
              </div>
            )}
          </div>
        )}

        {mode === 'register' && (
          <div className="lz-form-group">
            <label className="lz-label" htmlFor="auth-confirm-password">
              Konfirmasi Password <span style={{ color: 'var(--color-action)' }}>*</span>
            </label>
            <input
              id="auth-confirm-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
        )}

        <button
          type="submit"
          className="lz-btn lz-btn-primary"
          style={{ width: '100%', marginTop: '12px' }}
          disabled={isLoading}
        >
          {isLoading
            ? 'Memproses...'
            : mode === 'login'
            ? 'Masuk Sekarang'
            : mode === 'register'
            ? 'Daftar Akun'
            : mode === 'forgot-password'
            ? 'Kirim Tautan Pemulihan'
            : 'Simpan Password Baru'}
        </button>

        {mode === 'login' && (
          <button
            type="button"
            onClick={loginDemoUser}
            className="lz-btn lz-btn-secondary"
            style={{ width: '100%', marginTop: '10px' }}
          >
            <span>🚀 Masuk Langsung (Mode Demo: Budi · Kelas 7B)</span>
          </button>
        )}

      </form>

      <div
        style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--color-text-muted)',
          borderTop: '1px solid var(--color-border-subtle)',
          paddingTop: '16px',
        }}
      >
        {mode === 'login' && (
          <>
            Belum punya akun?{' '}
            <button
              onClick={() => onSwitchMode('register')}
              style={{
                color: 'var(--color-primary)',
                fontWeight: 700,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Daftar di sini
            </button>
          </>
        )}
        {mode === 'register' && (
          <>
            Sudah punya akun?{' '}
            <button
              onClick={() => onSwitchMode('login')}
              style={{
                color: 'var(--color-primary)',
                fontWeight: 700,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Masuk di sini
            </button>
          </>
        )}
        {(mode === 'forgot-password' || mode === 'update-password') && (
          <button
            onClick={() => onSwitchMode('login')}
            style={{
              color: 'var(--color-primary)',
              fontWeight: 700,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ← Kembali ke Halaman Masuk
          </button>
        )}
      </div>
    </div>
  )
}
