'use client'

const PHASE_LABELS: Record<string, string> = {
  all: 'All',
  intake: 'Intake',
  researching: 'Researching',
  strategy: 'Strategy',
  writing: 'Writing',
  in_review: 'In Review',
  delivered: 'Delivered',
  submitted: 'Submitted',
  awaiting_decision: 'Awaiting',
  awarded: 'Awarded',
}

const PHASE_ORDER = ['all', 'intake', 'researching', 'strategy', 'writing', 'in_review', 'delivered', 'submitted', 'awaiting_decision', 'awarded']

export function PhaseTabs({
  activePhase,
  onSelect,
  counts,
}: {
  activePhase: string
  onSelect: (phase: string) => void
  counts: Record<string, number>
}) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
      {PHASE_ORDER.map(phase => {
        const count = counts[phase] || 0
        const active = activePhase === phase
        return (
          <button
            key={phase}
            onClick={() => onSelect(phase)}
            style={{
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              background: active ? '#8B5CF6' : '#F3F4F6',
              color: active ? 'white' : '#374151',
              transition: 'all 0.15s',
            }}
          >
            {PHASE_LABELS[phase] || phase} {count > 0 && `(${count})`}
          </button>
        )
      })}
    </div>
  )
}
