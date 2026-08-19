import React, { useState } from 'react'
import { AuthForm } from '../components/auth/AuthForm'
import type { AuthMode } from '../components/auth/AuthForm'

export const AuthPage: React.FC<{ initialMode?: AuthMode }> = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode)

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <AuthForm mode={mode} onSwitchMode={setMode} />
    </div>
  )
}
