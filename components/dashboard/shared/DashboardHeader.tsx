'use client'

interface DashboardHeaderProps {
  schoolName: string
  location?: string
  phase: 'IGNITE' | 'ACCELERATE' | 'SUSTAIN'
  contractStart?: string | null
  contractEnd?: string | null
  partnershipGoal?: string | null
  partnershipType?: 'school' | 'district'
  isAdminView?: boolean
  showAdminControls?: boolean
  legacyUrl?: string
  onEditToggle?: () => void
  editMode?: boolean
  // Legacy props for backward compatibility
  dataUpdatedAt?: string
}

const PHASE_CONFIG = {
  IGNITE: {
    dot: '#FBBF24',
    glow: 'rgba(251,191,36,0.6)',
    bg: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,191,36,0.1))',
    border: 'rgba(251,191,36,0.4)',
    shadow: '0 0 20px rgba(251,191,36,0.2)',
    text: '#FBBF24',
    label: 'Phase 1 · IGNITE',
  },
  ACCELERATE: {
    dot: '#4ecdc4',
    glow: 'rgba(78,205,196,0.6)',
    bg: 'linear-gradient(135deg, rgba(78,205,196,0.2), rgba(78,205,196,0.1))',
    border: 'rgba(78,205,196,0.4)',
    shadow: '0 0 20px rgba(78,205,196,0.2)',
    text: '#4ecdc4',
    label: 'Phase 2 · ACCELERATE',
  },
  SUSTAIN: {
    dot: '#8B5CF6',
    glow: 'rgba(139,92,246,0.6)',
    bg: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.1))',
    border: 'rgba(139,92,246,0.4)',
    shadow: '0 0 20px rgba(139,92,246,0.2)',
    text: '#A78BFA',
    label: 'Phase 3 · SUSTAIN',
  },
}

export function DashboardHeader({
  schoolName,
  location,
  phase,
  contractStart,
  contractEnd,
  partnershipGoal,
  partnershipType = 'school',
  isAdminView = false,
  showAdminControls = true,
  legacyUrl,
  onEditToggle,
  editMode = false,
}: DashboardHeaderProps) {
  const phaseConfig = PHASE_CONFIG[phase] || PHASE_CONFIG.IGNITE

  // Format year range
  const yearBadge = contractStart
    ? `${new Date(contractStart).getFullYear()}-${contractEnd ? new Date(contractEnd).getFullYear() : 'Present'}`
    : null

  return (
    <section className="relative text-white overflow-hidden">
      {/* Full-width gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #1B2A4A 0%, #2d3a5c 50%, #38618C 100%)',
        }}
      />
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Admin controls */}
        {isAdminView && showAdminControls && (
          <div className="flex items-start justify-between mb-4">
            <span className="text-xs font-bold tracking-widest text-white/40 uppercase pt-1">
              Admin View
            </span>
            <div className="flex items-center gap-2">
              {onEditToggle && (
                <button
                  onClick={onEditToggle}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: editMode ? '#FFBA06' : 'rgba(255,255,255,0.1)',
                    color: editMode ? '#1B2A4A' : '#fff',
                  }}
                >
                  {editMode ? '✓ Editing...' : '✎ Edit Data'}
                </button>
              )}
              {legacyUrl && (
                <a
                  href={legacyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
                >
                  ↗ View Client Dashboard
                </a>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{schoolName}</h1>
              {/* Partnership year badge */}
              {yearBadge && (
                <span
                  className="hidden md:inline-flex px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,186,6,0.2), rgba(255,186,6,0.1))',
                    border: '1px solid rgba(255,186,6,0.4)',
                    color: '#FFBA06',
                  }}
                >
                  {yearBadge}
                </span>
              )}
            </div>
            <p className="text-white/60 text-sm md:text-base">
              {location || `${partnershipType === 'district' ? 'District' : 'School'} Partnership`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Phase badge with glow */}
            <div
              className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
              style={{
                background: phaseConfig.bg,
                border: `1px solid ${phaseConfig.border}`,
                boxShadow: phaseConfig.shadow,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: phaseConfig.dot,
                  boxShadow: `0 0 8px ${phaseConfig.glow}`,
                }}
              />
              <span style={{ color: phaseConfig.text }}>{phaseConfig.label}</span>
            </div>
          </div>
        </div>

        {/* Partnership goal - if available */}
        {partnershipGoal && (
          <div
            className="mt-6 p-4 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Partnership Goal</p>
            <p className="text-white/90 text-sm md:text-base leading-relaxed">{partnershipGoal}</p>
          </div>
        )}
      </div>
    </section>
  )
}
