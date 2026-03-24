'use client'
import { Calendar } from 'lucide-react'

interface DashboardHeaderProps {
  schoolName:     string
  location?:      string
  phase:          'IGNITE' | 'ACCELERATE' | 'SUSTAIN'
  dataUpdatedAt?: string
  isAdminView?:   boolean
  showAdminControls?: boolean
  legacyUrl?:     string
  onEditToggle?:  () => void
  editMode?:      boolean
}

const PHASE_COLORS = {
  IGNITE:      { bg: '#D97706', label: 'Phase 1 - IGNITE' },
  ACCELERATE:  { bg: '#2D7D78', label: 'Phase 2 - ACCELERATE' },
  SUSTAIN:     { bg: '#16A34A', label: 'Phase 3 - SUSTAIN' },
}

export function DashboardHeader({
  schoolName, location, phase, dataUpdatedAt,
  isAdminView = false, showAdminControls = true, legacyUrl, onEditToggle, editMode = false,
}: DashboardHeaderProps) {
  const phaseConfig = PHASE_COLORS[phase] || PHASE_COLORS.IGNITE

  return (
    <div
      className="rounded-xl p-8 mb-6 text-white relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2D4A7A 100%)' }}
    >
      {/* Admin controls */}
      {isAdminView && showAdminControls && (
        <div className="flex items-start justify-between mb-4 relative z-10">
          <span className="text-xs font-bold tracking-widest text-white/40 uppercase pt-1">
            Admin View
          </span>
          <div className="flex flex-col items-end gap-2">
            {/* Row 1: Buttons */}
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
            {/* Row 2: Phase badge */}
            <div className="text-right">
              <div className="text-xs text-white/40 mb-1">Status:</div>
              <div
                className="px-4 py-2 rounded-lg text-sm font-bold text-white"
                style={{ background: phaseConfig.bg }}
              >
                {phaseConfig.label}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule button - client view */}
      {!isAdminView && (
        <div className="flex justify-end mb-4">
          <a
            href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: '#FFBA06', color: '#1B2A4A' }}
          >
            <Calendar size={14} />
            Schedule Session
          </a>
        </div>
      )}

      {/* School name + location */}
      <h1 className="text-3xl font-bold text-white mb-1 leading-tight">{schoolName}</h1>
      {location && (
        <p className="text-white/60 text-sm mb-1">{location} | Partner Dashboard</p>
      )}
      {dataUpdatedAt && (
        <p className="text-white/40 text-xs">Data updated {dataUpdatedAt}</p>
      )}

      {/* Phase badge - only show for non-admin view (admin view has inline badge) */}
      {!isAdminView && (
        <div className="absolute top-8 right-8 text-right z-0">
          <div className="text-xs text-white/40 mb-1">Status:</div>
          <div
            className="px-4 py-2 rounded-lg text-sm font-bold text-white"
            style={{ background: phaseConfig.bg }}
          >
            {phaseConfig.label}
          </div>
        </div>
      )}
    </div>
  )
}
