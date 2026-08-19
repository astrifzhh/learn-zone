import React from 'react'
import { GreetingHeader } from '../components/layout/GreetingHeader'
import { DailyTaskCard } from '../components/dashboard/DailyTaskCard'
import { FocusTimerCard } from '../components/dashboard/FocusTimerCard'
import { DailySummaryCard } from '../components/dashboard/DailySummaryCard'
import type { NavTab } from '../components/layout/Sidebar'

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header Greeting with student illustration */}
      <GreetingHeader />

      {/* 2. Primary Row: Daily Tasks (62%) + Focus Timer (35%) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.75fr) minmax(0, 1.15fr)',
          gap: '24px',
          alignItems: 'stretch',
        }}
        className="dashboard-primary-grid"
      >
        <DailyTaskCard />
        <FocusTimerCard />
      </div>

      {/* 3. Secondary Row: Consolidated Daily Summary (Jadwal, Target, Mood) */}
      <div>
        <DailySummaryCard onNavigate={onNavigate} />
      </div>
    </div>
  )
}
