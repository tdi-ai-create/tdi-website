'use client'

const DEAL_TYPES = [
  { value: 'renewal', label: 'Renewal', emoji: '🔄' },
  { value: 'new_business', label: 'New Business', emoji: '🆕' },
  { value: 'expansion', label: 'Expansion', emoji: '📈' },
  { value: 'pilot', label: 'Pilot', emoji: '🧪' },
]

const HEAT_LEVELS = [
  { value: 'hot', label: 'Hot', emoji: '🔥', color: '#EF4444' },
  { value: 'warm', label: 'Warm', emoji: '🟡', color: '#F59E0B' },
  { value: 'cold', label: 'Cold', emoji: '❄️', color: '#3B82F6' },
  { value: 'parked', label: 'Parked', emoji: '🅿️', color: '#6B7280' },
]

const STAGE_GROUPS = [
  { value: 'pipeline', label: 'Pipeline (targeting + engaged)' },
  { value: 'active_deals', label: 'Active Deals (qualified + likely yes)' },
  { value: 'closing', label: 'Closing (proposal + signed)' },
]

const QUICK_PRESETS = [
  { id: 'hot_renewals', label: '🔥 Hot Renewals', filters: { deal_types: ['renewal'], heat: ['hot'] } },
  { id: 'jim_active', label: "Jim's active deals", filters: { owners: ['jim@teachersdeserveit.com'], stage_groups: ['active_deals'] } },
  { id: 'rae_active', label: "Rae's active deals", filters: { owners: ['rae@teachersdeserveit.com'], stage_groups: ['active_deals'] } },
  { id: 'invoices', label: '⚠️ Needs invoicing', filters: { needs_invoice: true } },
  { id: 'stale', label: 'Stale 30d+', filters: { heat: ['cold', 'parked'] } },
]

export interface ActiveFilters {
  deal_types: string[]
  heat: string[]
  stage_groups: string[]
  owners: string[]
  sources: string[]
  search: string
  needs_invoice?: boolean
}

export const EMPTY_FILTERS: ActiveFilters = {
  deal_types: [],
  heat: [],
  stage_groups: [],
  owners: [],
  sources: [],
  search: '',
  needs_invoice: false,
}

export function countActiveFilters(f: ActiveFilters): number {
  return f.deal_types.length + f.heat.length + f.stage_groups.length +
    f.owners.length + f.sources.length + (f.search ? 1 : 0) + (f.needs_invoice ? 1 : 0)
}

export function FilterPanel({
  isOpen,
  onClose,
  activeFilters,
  setActiveFilters,
  sources,
}: {
  isOpen: boolean
  onClose: () => void
  activeFilters: ActiveFilters
  setActiveFilters: (f: ActiveFilters) => void
  sources: string[]
}) {
  if (!isOpen) return null

  function toggleArray(key: keyof ActiveFilters, value: string) {
    const arr = activeFilters[key] as string[]
    setActiveFilters({
      ...activeFilters,
      [key]: arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value],
    })
  }

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100,
      }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 380,
        background: 'white', boxShadow: '-4px 0 12px rgba(0,0,0,0.1)',
        padding: 24, overflowY: 'auto', zIndex: 101,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Filters</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6B7280' }}>×</button>
        </div>

        <FilterSection title="Quick presets">
          {QUICK_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => setActiveFilters({ ...EMPTY_FILTERS, ...preset.filters })}
              style={chipStyle(false)}
            >
              {preset.label}
            </button>
          ))}
        </FilterSection>

        <FilterSection title="Deal Type">
          {DEAL_TYPES.map(t => (
            <Chip
              key={t.value}
              active={activeFilters.deal_types.includes(t.value)}
              onClick={() => toggleArray('deal_types', t.value)}
              label={`${t.emoji} ${t.label}`}
            />
          ))}
        </FilterSection>

        <FilterSection title="Heat">
          {HEAT_LEVELS.map(h => (
            <Chip
              key={h.value}
              active={activeFilters.heat.includes(h.value)}
              onClick={() => toggleArray('heat', h.value)}
              label={`${h.emoji} ${h.label}`}
              color={h.color}
            />
          ))}
        </FilterSection>

        <FilterSection title="Stage Group">
          {STAGE_GROUPS.map(s => (
            <Chip
              key={s.value}
              active={activeFilters.stage_groups.includes(s.value)}
              onClick={() => toggleArray('stage_groups', s.value)}
              label={s.label}
            />
          ))}
        </FilterSection>

        <FilterSection title="Owner">
          {[
            { v: 'rae@teachersdeserveit.com', label: 'Rae' },
            { v: 'jim@teachersdeserveit.com', label: 'Jim' },
          ].map(o => (
            <Chip
              key={o.v}
              active={activeFilters.owners.includes(o.v)}
              onClick={() => toggleArray('owners', o.v)}
              label={o.label}
            />
          ))}
        </FilterSection>

        <FilterSection title="Source">
          {sources.slice(0, 8).map(s => (
            <Chip
              key={s}
              active={activeFilters.sources.includes(s)}
              onClick={() => toggleArray('sources', s)}
              label={s}
            />
          ))}
        </FilterSection>

        <FilterSection title="Flags">
          <Chip
            active={activeFilters.needs_invoice || false}
            onClick={() => setActiveFilters({ ...activeFilters, needs_invoice: !activeFilters.needs_invoice })}
            label="⚠️ Needs Invoicing"
            color="#92400E"
          />
        </FilterSection>

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #E5E7EB', display: 'flex', gap: 8 }}>
          <button
            onClick={() => setActiveFilters(EMPTY_FILTERS)}
            style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', fontSize: 13 }}
          >
            Clear all
          </button>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none', background: '#0a0f1e', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
          >
            Apply
          </button>
        </div>
      </div>
    </>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {children}
      </div>
    </div>
  )
}

function Chip({ active, onClick, label, color = '#0a0f1e' }: { active: boolean; onClick: () => void; label: string; color?: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 12px',
        fontSize: 12,
        fontWeight: 600,
        background: active ? color : 'white',
        color: active ? 'white' : color,
        border: `1px solid ${color}`,
        borderRadius: 16,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

function chipStyle(active: boolean): React.CSSProperties {
  return {
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 500,
    background: active ? '#0a0f1e' : '#F9FAFB',
    color: active ? 'white' : '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: 16,
    cursor: 'pointer',
  }
}
