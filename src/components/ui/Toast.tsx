import React from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

interface ToastProps {
  message: string | null
  type: 'success' | 'error' | 'info' | null
  onClose: () => void
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  if (!message) return null

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: '#E8F7EA',
          border: '#32B94B',
          text: '#1E6B2C',
          icon: <CheckCircle2 size={20} color="#32B94B" />,
        }
      case 'error':
        return {
          bg: '#FFEBEE',
          border: '#FF5A4E',
          text: '#9C2118',
          icon: <AlertCircle size={20} color="#FF5A4E" />,
        }
      default:
        return {
          bg: '#E3F2FD',
          border: '#2196F3',
          text: '#0D47A1',
          icon: <Info size={20} color="#2196F3" />,
        }
    }
  }

  const s = getStyles()

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: s.bg,
        border: `1.5px solid ${s.border}`,
        color: s.text,
        borderRadius: '14px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
        zIndex: 9999,
        maxWidth: '380px',
        animation: 'slideUp 0.25s ease-out',
        fontWeight: 600,
        fontSize: '14px',
      }}
    >
      {s.icon}
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          color: s.text,
          opacity: 0.7,
        }}
        aria-label="Tutup notifikasi"
      >
        <X size={16} />
      </button>
    </div>
  )
}
