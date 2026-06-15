'use client'

const DEAL_TYPES = [
  { value: 'renewal', label: 'Renewal' },
  { value: 'new_business', label: 'New Business' },
  { value: 'expansion', label: 'Expansion' },
  { value: 'pilot', label: 'Pilot' },
]

const TIER_FILTERS = [
  { value: 'T1', label: 'Tier 1', color: '#10B981' },
  { value: 'T2', label: 'Tier 2', color: '#F59E0B' },
  { value: 'T3', label: 'Tier 3', color: '#9CA3AF' },
  { value: 'unscored', label: 'Unscored', color: '#D1D5DB' },
]

export interface ActiveFilters {
  deal_types: string[]
  sources: string[]
  tiers: string[]
  search: string
}

export const EMPTY_FILTERS: ActiveFilters = {
  deal_types: [],
  sources: [],
  tiers: [],
  search: '',
}

export function countActiveFilters(f: ActiveFilters): number {
  return f.deal_types.length + f.sources.length + f.tiers.length + (f.search ? 1 : 0)
}

export function FilterPanel({
  activeFilters,
  setActiveFilters,
  sources,
  dealTypeCounts,
  sourceCounts,
  tierCounts,
}: {
  activeFilters: ActiveFilters
  setActiveFilters: (f: ActiveFilters) => void
  sources: string[]
  dealTypeCounts: Record<string, number>
  sourceCounts: Record<string, number>
  tierCounts?: Record<string, number>
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

  function toggleTier(value: string) {
    const arr = activeFilters.tiers
    setActiveFilters({
      ...activeFilters,
      tiers: arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value],
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
        placeholder="Search by name, contact, email, city..."
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
                background: active ? '#10B981' : 'white',
                color: active ? 'white' : '#0a0f1e',
                border: `1.5px solid ${active ? '#10B981' : '#D1D5DB'}`,
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
                background: active ? '#10B981' : 'white',
                color: active ? 'white' : '#374151',
                border: `1.5px solid ${active ? '#10B981' : '#D1D5DB'}`,
                borderRadius: 20,
                cursor: 'pointer',
              }}
            >
              {s} &middot; {count}
            </button>
          )
        })}
      </div>

      {/* Tier Filter */}
      {tierCounts && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, flexShrink: 0 }}>
            Fit Tier:
          </span>
          {TIER_FILTERS.map(t => {
            const count = tierCounts[t.value] || 0
            const active = activeFilters.tiers.includes(t.value)
            return (
              <button
                key={t.value}
                onClick={() => toggleTier(t.value)}
                style={{
                  padding: '5px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  background: active ? t.color : 'white',
                  color: active ? 'white' : '#374151',
                  border: `1.5px solid ${active ? t.color : '#D1D5DB'}`,
                  borderRadius: 20,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? 'white' : t.color, display: 'inline-block' }} />
                {t.label} &middot; {count}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
