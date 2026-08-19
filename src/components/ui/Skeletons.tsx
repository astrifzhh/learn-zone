import React from 'react'

export const Skeleton: React.FC<{
  width?: string | number
  height?: string | number
  borderRadius?: string
  style?: React.CSSProperties
}> = ({ width = '100%', height = '20px', borderRadius = '10px', style }) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#EBE5D8',
        animation: 'pulse 1.5s infinite ease-in-out',
        ...style,
      }}
    />
  )
}

export const DashboardSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Skeleton width="220px" height="32px" borderRadius="8px" style={{ marginBottom: '8px' }} />
          <Skeleton width="160px" height="18px" borderRadius="6px" />
        </div>
        <Skeleton width="180px" height="60px" borderRadius="14px" />
      </div>

      {/* Main Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '62% 35%', gap: '24px' }}>
        <Skeleton height="320px" borderRadius="18px" />
        <Skeleton height="320px" borderRadius="18px" />
      </div>

      {/* Secondary Row */}
      <Skeleton height="180px" borderRadius="18px" />
    </div>
  )
}
