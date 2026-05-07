'use client'

const PHASES = [
  { id: 'intake', label: 'Intake' },
  { id: 'researching', label: 'Research' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'writing', label: 'Writing' },
  { id: 'in_review', label: 'Review' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'awaiting_decision', label: 'Awaiting' },
  { id: 'awarded', label: 'Awarded' },
]

const STATUS_COLORS = {
  complete: { bg: '#D1FAE5', text: '#065F46', border: '#10B981' },
  active: { bg: '#DBEAFE', text: '#1E40AF', border: '#3B82F6' },
  stalled: { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' },
  upcoming: { bg: '#F3F4F6', text: '#9CA3AF', border: '#E5E7EB' },
}

export function PhaseChain({ currentPhase, isStalled }: { currentPhase: string; isStalled: boolean }) {
  const currentIdx = PHASES.findIndex(p => p.id === currentPhase)

  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {PHASES.map((phase, idx) => {
        let status: keyof typeof STATUS_COLORS
        if (idx < currentIdx) status = 'complete'
        else if (idx === currentIdx) status = isStalled ? 'stalled' : 'active'
        else status = 'upcoming'

        const colors = STATUS_COLORS[status]
        return (
          <div
            key={phase.id}
            title={phase.label}
            style={{
              padding: '4px 8px',
              fontSize: 9,
              fontWeight: 700,
              borderRadius: 10,
              background: colors.bg,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              whiteSpace: 'nowrap',
              letterSpacing: 0.3,
            }}
          >
            {phase.label}
          </div>
        )
      })}
    </div>
  )
}
