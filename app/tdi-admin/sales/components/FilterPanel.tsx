'use client'

const DEAL_TYPES = [
  { value: 'renewal', label: 'Renewal' },
  { value: 'new_business', label: 'New Business' },
  { value: 'expansion', label: 'Expansion' },
  { value: 'pilot', label: 'Pilot' },
]

export interface ActiveFilters {
  deal_types: string[]
  sources: string[]
  search: string
}

export const EMPTY_FILTERS: ActiveFilters = {
  deal_types: [],
  sources: [],
  search: '',
}

export function countActiveFilters(f: ActiveFilters): number {
  return f.deal_types.length + f.sources.length + (f.search ? 1 : 0)
}

export function FilterPanel({
  activeFilters,
  setActiveFilters,
  sources,
  dealTypeCounts,
  sourceCounts,
}: {
  activeFilters: ActiveFilters
  setActiveFilters: (f: ActiveFilters) => void
  sources: string[]
  dealTypeCounts: Record<string, number>
  sourceCounts: Record<string, number>
}) {
  function toggleType(value: string) {
    const arr = activeFilters.deal_types
    setActiveFilters({
      ...activeFilters,
      deal_types: arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value],
    })
  }

  function toggleSource(value: string) {
    const arr = activeFilters.sources
    setActiveFilters({
      ...activeFilters,
      sources: arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value],
    })
  }

  return (
    <div style={{
      background: 'white',
      border: '1px solid #E5E7EB',
      borderRadius: 12,
      padding: '16px 20px',
      marginBottom: 12,
    }}>
      {/* Search */}
      <input
        type="text"
        value={activeFilters.search}
        onChange={e => setActiveFilters({ ...activeFilters, search: e.target.value })}
        placeholder="Search opportunities..."
        style={{
          border: '1px solid #D1D5DB',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 13,
          width: '100%',
          maxWidth: 320,
          outline: 'none',
          marginBottom: 14,
        }}
      />

      {/* Deal Type */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, flexShrink: 0 }}>
          Deal Type:
        </span>
        {DEAL_TYPES.map(t => {
          const count = dealTypeCounts[t.value] || 0
          const active = activeFilters.deal_types.includes(t.value)
          return (
            <button
              key={t.value}
              onClick={() => toggleType(t.value)}
              style={{
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: 600,
                background: active ? '#0a0f1e' : 'white',
                color: active ? 'white' : '#0a0f1e',
                border: `1.5px solid ${active ? '#0a0f1e' : '#D1D5DB'}`,
                borderRadius: 20,
                cursor: 'pointer',
              }}
            >
              {t.label} &middot; {count}
            </button>
          )
        })}
      </div>

      {/* Source */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, flexShrink: 0 }}>
          Source:
        </span>
        {sources.slice(0, 8).map(s => {
          const count = sourceCounts[s] || 0
          const active = activeFilters.sources.includes(s)
          return (
            <button
              key={s}
              onClick={() => toggleSource(s)}
              style={{
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: 500,
                background: active ? '#0a0f1e' : 'white',
                color: active ? 'white' : '#374151',
                border: `1.5px solid ${active ? '#0a0f1e' : '#D1D5DB'}`,
                borderRadius: 20,
                cursor: 'pointer',
              }}
            >
              {s} &middot; {count}
            </button>
          )
        })}
      </div>
    </div>
  )
}
