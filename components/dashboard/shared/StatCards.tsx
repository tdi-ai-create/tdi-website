'use client'
import { Users, Eye, CheckCircle, AlertCircle, Zap, Rocket, Target, ArrowRight } from 'lucide-react'

interface StatCardsProps {
  // New props
  staffTotal?: number
  staffHubLoggedIn?: number
  partnershipType?: 'school' | 'district'
  buildingCount?: number
  observationsUsed?: number
  observationsTotal?: number
  virtualUsed?: number
  virtualTotal?: number
  executiveUsed?: number
  executiveTotal?: number
  phase: 'IGNITE' | 'ACCELERATE' | 'SUSTAIN'
  pendingItemsCount?: number
  onStaffClick?: () => void
  onObservationClick?: () => void
  onAttentionClick?: () => void
  onPhaseClick?: () => void
  observationStatusText?: string
  observationStatusColor?: string
  // Legacy props for backward compatibility
  staffEnrolled?: number | null
  hubLoginPct?: number | null
  defaults?: Record<string, string>
}

const COLORS = {
  TEAL: {
    grad: 'linear-gradient(90deg, #4ecdc4, #38618C)',
    icon: '#4ecdc4',
    iconBg: 'linear-gradient(135deg, rgba(78,205,196,0.15), rgba(56,97,140,0.1))',
  },
  AMBER: {
    grad: 'linear-gradient(90deg, #FBBF24, #F59E0B)',
    icon: '#F59E0B',
    iconBg: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.1))',
  },
  GREEN: {
    grad: 'linear-gradient(90deg, #10B981, #059669)',
    icon: '#10B981',
    iconBg: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))',
  },
  PURPLE: {
    grad: 'linear-gradient(90deg, #8B5CF6, #7C3AED)',
    icon: '#8B5CF6',
    iconBg: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(124,58,237,0.1))',
  },
}

const PHASE_CONFIG = {
  IGNITE: {
    grad: 'linear-gradient(90deg, #FBBF24, #F59E0B)',
    iconBg: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.1))',
    icon: '#FBBF24',
    text: '#FBBF24',
    Icon: Zap,
  },
  ACCELERATE: {
    grad: 'linear-gradient(90deg, #4ecdc4, #38618C)',
    iconBg: 'linear-gradient(135deg, rgba(78,205,196,0.15), rgba(56,97,140,0.1))',
    icon: '#4ecdc4',
    text: '#4ecdc4',
    Icon: Rocket,
  },
  SUSTAIN: {
    grad: 'linear-gradient(90deg, #8B5CF6, #7C3AED)',
    iconBg: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(124,58,237,0.1))',
    icon: '#8B5CF6',
    text: '#8B5CF6',
    Icon: Target,
  },
}

const cardStyle = {
  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  border: '1px solid rgba(0,0,0,0.04)',
}

export function StatCards({
  staffTotal,
  staffHubLoggedIn,
  partnershipType = 'school',
  buildingCount = 0,
  observationsUsed,
  observationsTotal,
  phase,
  pendingItemsCount = 0,
  onStaffClick,
  onObservationClick,
  onAttentionClick,
  onPhaseClick,
  observationStatusText,
  observationStatusColor,
  // Legacy props
  staffEnrolled,
  hubLoginPct,
  defaults: _defaults,
}: StatCardsProps) {
  // Support legacy props for backward compatibility
  const staff = staffTotal ?? staffEnrolled ?? 0
  const hubLogins = staffHubLoggedIn ?? (hubLoginPct && staffEnrolled ? Math.round((hubLoginPct / 100) * staffEnrolled) : 0)
  const obsUsed = observationsUsed ?? 0
  const obsTotal = observationsTotal ?? 0

  const phaseConfig = PHASE_CONFIG[phase]
  const PhaseIcon = phaseConfig.Icon
  const phaseIndex = ['IGNITE', 'ACCELERATE', 'SUSTAIN'].indexOf(phase)
  const hasObservations = obsTotal > 0
  const allCaughtUp = pendingItemsCount === 0

  return (
    <div id="stat-cards" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Staff Enrolled Card */}
      <div
        onClick={onStaffClick}
        className={`bg-white rounded-2xl overflow-hidden group relative ${onStaffClick ? 'cursor-pointer' : ''}`}
        style={cardStyle}
      >
        <div className="h-1" style={{ background: COLORS.TEAL.grad }} />
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: COLORS.TEAL.iconBg }}
            >
              <Users className="w-5 h-5" style={{ color: COLORS.TEAL.icon }} />
            </div>
            {partnershipType === 'district' && onStaffClick && (
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#4ecdc4] transition-colors" />
            )}
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Staff Enrolled</p>
          <p className="text-3xl font-bold" style={{ color: '#1B2A4A' }}>{staff}</p>
          <p className="text-xs text-gray-500 mt-1">
            {partnershipType === 'district' && buildingCount > 0
              ? `across ${buildingCount} school${buildingCount > 1 ? 's' : ''}`
              : 'staff members'}
          </p>
          {/* Hub login progress */}
          {staff > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Hub Access</span>
                <span className="font-medium" style={{ color: '#4ecdc4' }}>
                  {hubLogins}/{staff}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(hubLogins / staff) * 100}%`,
                    background: COLORS.TEAL.grad,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Observations Card - only show if partnership has observation days */}
      {hasObservations && (
        <div
          onClick={onObservationClick}
          className={`bg-white rounded-2xl overflow-hidden group relative ${onObservationClick ? 'cursor-pointer' : ''}`}
          style={cardStyle}
        >
          <div className="h-1" style={{ background: COLORS.AMBER.grad }} />
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: COLORS.AMBER.iconBg }}
              >
                <Eye className="w-5 h-5" style={{ color: COLORS.AMBER.icon }} />
              </div>
              {onObservationClick && (
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#F59E0B] transition-colors" />
              )}
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Observations</p>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-bold" style={{ color: '#1B2A4A' }}>{obsUsed}</p>
              <span className="text-lg text-gray-400">/{obsTotal}</span>
            </div>
            {observationStatusText && (
              <p className="text-xs mt-1 font-medium" style={{ color: observationStatusColor || '#F59E0B' }}>
                {observationStatusText}
              </p>
            )}
            {/* Progress bar */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Progress</span>
                <span className="font-medium" style={{ color: '#F59E0B' }}>
                  {Math.round((obsUsed / (obsTotal || 1)) * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(obsUsed / (obsTotal || 1)) * 100}%`,
                    background: COLORS.AMBER.grad,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Needs Attention Card */}
      <div
        onClick={onAttentionClick}
        className={`bg-white rounded-2xl overflow-hidden group relative ${onAttentionClick ? 'cursor-pointer' : ''}`}
        style={cardStyle}
      >
        <div
          className="h-1"
          style={{
            background: allCaughtUp ? COLORS.GREEN.grad : COLORS.AMBER.grad,
          }}
        />
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: allCaughtUp ? COLORS.GREEN.iconBg : COLORS.AMBER.iconBg,
              }}
            >
              {allCaughtUp ? (
                <CheckCircle className="w-5 h-5" style={{ color: COLORS.GREEN.icon }} />
              ) : (
                <AlertCircle className="w-5 h-5" style={{ color: COLORS.AMBER.icon }} />
              )}
            </div>
            {onAttentionClick && (
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#F59E0B] transition-colors" />
            )}
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            {allCaughtUp ? 'Status' : 'Needs Attention'}
          </p>
          <p
            className="text-3xl font-bold"
            style={{ color: allCaughtUp ? '#10B981' : '#F59E0B' }}
          >
            {allCaughtUp ? '✓' : pendingItemsCount}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {allCaughtUp ? 'All caught up!' : `${pendingItemsCount} item${pendingItemsCount !== 1 ? 's' : ''} pending`}
          </p>
        </div>
      </div>

      {/* Current Phase Card */}
      <div
        onClick={onPhaseClick}
        className={`bg-white rounded-2xl overflow-hidden group relative ${onPhaseClick ? 'cursor-pointer' : ''}`}
        style={cardStyle}
      >
        <div className="h-1" style={{ background: phaseConfig.grad }} />
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: phaseConfig.iconBg }}
            >
              <PhaseIcon className="w-5 h-5" style={{ color: phaseConfig.icon }} />
            </div>
            {onPhaseClick && (
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#38618C] transition-colors" />
            )}
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Current Phase</p>
          <p className="text-3xl font-bold" style={{ color: '#1B2A4A' }}>Phase {phaseIndex + 1}</p>
          <p className="text-xs mt-1 font-semibold" style={{ color: phaseConfig.text }}>{phase}</p>
          {/* Phase progress */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex gap-2">
              {['IGNITE', 'ACCELERATE', 'SUSTAIN'].map((p, idx) => (
                <div
                  key={p}
                  className="flex-1 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    background: idx <= phaseIndex ? phaseConfig.icon : '#E5E7EB',
                  }}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1 text-center">Phase {phaseIndex + 1} of 3</p>
          </div>
        </div>
      </div>
    </div>
  )
}
