import React, { useState } from 'react'
import { Modal } from '../ui/Modal'

interface CustomQuoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (quoteText: string) => Promise<void>
}

export const CustomQuoteModal: React.FC<CustomQuoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) {
      setError('Tuliskan kalimat motivasi favoritmu')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await onSave(text.trim())
      setText('')
      onClose()
    } catch {
      setError('Gagal menyimpan kata motivasi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tulis Kata Motivasimu Sendiri"
    >
      <form onSubmit={handleSubmit}>
        <div className="lz-form-group">
          <label className="lz-label" htmlFor="custom-quote-text">
            Kalimat Penyemangat Belajar <span style={{ color: 'var(--color-action)' }}>*</span>
          </label>
          <textarea
            id="custom-quote-text"
            rows={3}
            placeholder="Contoh: Jika orang lain bisa, aku pasti juga bisa asalkan terus berlatih!"
            value={text}
            onChange={e => setText(e.target.value)}
            maxLength={280}
            autoFocus
          />
          {error && <div className="lz-input-error">{error}</div>}
          <div className="lz-help-text">
            Kata motivasi ini akan ditampilkan di beranda untuk menyemangatimu setiap hari.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button
            type="button"
            className="lz-btn lz-btn-ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            type="submit"
            className="lz-btn lz-btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan & Pasang'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
