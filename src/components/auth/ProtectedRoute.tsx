import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { DashboardSkeleton } from '../ui/Skeletons'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <DashboardSkeleton />
      </div>
    )
  }

  if (!user) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
