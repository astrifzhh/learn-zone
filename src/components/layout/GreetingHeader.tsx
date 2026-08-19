import React, { useState } from 'react'
import { Bell, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { DAY_NAMES } from '../../types/planner'

export const GreetingHeader: React.FC<{ notificationCount?: number }> = ({ notificationCount = 2 }) => {
  const { profile } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)

  // Localized Indonesian date
  const now = new Date()
  const dayName = DAY_NAMES[now.getDay()]
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  const formattedDate = `${dayName}, ${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        position: 'relative',
      }}
    >
      {/* Left Greeting & Date */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '26px',
              fontWeight: 700,
              color: 'var(--color-text)',
            }}
          >
            Hai {profile?.nickname || 'Budi'}, siap belajar?
          </h2>
          <span style={{ fontSize: '22px' }}>👋</span>
        </div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Sparkles size={14} color="#FFB800" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Right Area: Student Illustration & Notifications */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Custom Handcrafted SVG of Students */}
        <div
          className="header-illustration"
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            height: '70px',
            userSelect: 'none',
          }}
        >
          <svg width="170" height="70" viewBox="0 0 170 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Student 1 (Left - Boy with Navy tie & glasses) */}
            <g transform="translate(10, 8)">
              {/* Hair */}
              <ellipse cx="20" cy="18" rx="12" ry="11" fill="#3D2314"/>
              <path d="M9 19C10 12 17 9 24 10C29 11 31 16 31 20C28 17 22 17 19 19C15 20 12 21 9 19Z" fill="#24140A"/>
              {/* Head */}
              <circle cx="20" cy="22" r="10" fill="#FFDFC4"/>
              {/* Glasses */}
              <circle cx="16" cy="22" r="3.5" stroke="#1F1F1F" strokeWidth="1.2" fill="none"/>
              <circle cx="24" cy="22" r="3.5" stroke="#1F1F1F" strokeWidth="1.2" fill="none"/>
              <line x1="19.5" y1="22" x2="20.5" y2="22" stroke="#1F1F1F" strokeWidth="1.2"/>
              {/* Smile */}
              <path d="M18 27C19 28.5 21 28.5 22 27" stroke="#8A4B29" strokeWidth="1" strokeLinecap="round"/>
              {/* Body / White shirt with blue collar */}
              <path d="M8 48C8 36 32 36 32 48Z" fill="#FFFFFF"/>
              <path d="M17 34L20 44L23 34" fill="#1C3879"/>
              <path d="M19 40L20 48L21 40" fill="#1C3879"/>
            </g>

            {/* Student 2 (Center - Girl with Hijab / Ribbon) */}
            <g transform="translate(60, 2)">
              {/* Hijab White/Cream with Navy trim */}
              <path d="M22 6C13 6 8 13 8 26C8 38 10 46 12 56H32C34 46 36 38 36 26C36 13 31 6 22 6Z" fill="#FFFFFF"/>
              {/* Face Opening */}
              <ellipse cx="22" cy="22" rx="8" ry="9.5" fill="#FFE2CB"/>
              {/* Eyes & Smile */}
              <circle cx="18.5" cy="21" r="1.5" fill="#24140A"/>
              <circle cx="25.5" cy="21" r="1.5" fill="#24140A"/>
              {/* Cheeks */}
              <circle cx="16.5" cy="24" r="1.5" fill="#FFAAA6" opacity="0.6"/>
              <circle cx="27.5" cy="24" r="1.5" fill="#FFAAA6" opacity="0.6"/>
              <path d="M20 25.5C21 27 23 27 24 25.5" stroke="#8A4B29" strokeWidth="1" strokeLinecap="round"/>
              {/* Hijab folds and Navy Pin */}
              <circle cx="22" cy="35" r="2.5" fill="#2196F3"/>
              {/* Body */}
              <path d="M10 56C10 46 34 46 34 56Z" fill="#FFFFFF"/>
            </g>

            {/* Student 3 (Right - Cheerful Boy with Pencil / Book) */}
            <g transform="translate(112, 10)">
              {/* Hair */}
              <ellipse cx="20" cy="18" rx="12" ry="11" fill="#423126"/>
              <path d="M10 18C12 11 20 8 26 10C30 12 30 16 30 19C28 17 24 16 20 18C17 19 14 20 10 18Z" fill="#1E130B"/>
              {/* Head */}
              <circle cx="20" cy="21" r="9.5" fill="#FCD2B2"/>
              {/* Wink Eyes */}
              <circle cx="16" cy="20" r="1.5" fill="#24140A"/>
              <path d="M23 20L26 21" stroke="#24140A" strokeWidth="1.5" strokeLinecap="round"/>
              {/* Cheerful Mouth */}
              <path d="M18 24.5C18.5 27 21.5 27 22 24.5Z" fill="#E65100"/>
              {/* Body with Navy Badge */}
              <path d="M8 46C8 35 32 35 32 46Z" fill="#FFFFFF"/>
              <rect x="23" y="38" width="6" height="4" rx="1" fill="#1C3879"/>
              {/* Holding Pencil */}
              <rect x="29" y="24" width="3" height="12" rx="1" transform="rotate(25 29 24)" fill="#FFB800"/>
              <polygon points="32.5,21.5 35,27 30,27" fill="#FF5A4E"/>
            </g>

          </svg>
        </div>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-icon)',
              position: 'relative',
              boxShadow: 'var(--shadow-card)',
            }}
            aria-label="Lihat Notifikasi"
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-action)',
                  border: '2px solid #FFFFFF',
                }}
              />
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '52px',
                right: 0,
                width: '280px',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-modal)',
                padding: '16px',
                zIndex: 100,
                animation: 'slideUp 0.2s ease',
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  marginBottom: '10px',
                  color: 'var(--color-text)',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  paddingBottom: '6px',
                }}
              >
                Pemberitahuan Hari Ini
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '12px', padding: '6px', backgroundColor: '#F9F7F1', borderRadius: '8px' }}>
                  ⏰ <strong>PR Matematika</strong> jatuh tempo hari ini pukul 16:00.
                </div>
                <div style={{ fontSize: '12px', padding: '6px', backgroundColor: '#F9F7F1', borderRadius: '8px' }}>
                  🎯 <strong>Target Semester:</strong> Kamu sudah menyelesaikan 75% target!
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
