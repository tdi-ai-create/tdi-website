'use client'

/**
 * Board filters.
 *
 * These used to be Deal Type and Source. Measured on the live board 21 Sep
 * 2026, that row offered nine chips and could narrow almost nothing:
 *
 *   Deal Type had four chips. Expansion and Pilot matched zero leads, so they
 *   were dead controls, and New Business matched 202 of 213, so it selected
 *   the board. Only Renewal (9) filtered anything.
 *
 *   Source had 34 distinct values across 213 leads, of which the row showed
 *   eight, so 26 values covering 27 leads could not be reached at all. The
 *   largest real category was split five ways: "PD Plan Request (website)" 91,
 *   "pd_plan_request" 3, "PD Plan Request" 2, "pd plan" 1,
 *   "inbound_pd_plan_request" 1. Renewal was spelled three ways. Referrals were
 *   four separate chips because each carried a person's name and a date. Raw
 *   column values were leaking in as labels: cold_inbound, rfp, other, website,
 *   and one reading "Outreach (TEA-844)".
 *
 * So provenance filtering is gone. What is here instead is the three questions
 * a person actually opens this board to answer: what is going to be heavy, what
 * cannot be ranked yet, and who has not been contacted. Renewal survives
 * because it was the one chip that worked.
 *
 * Source is still on the record and still searchable through the box above.
 * Nothing was deleted to make this change.
 */

export type FilterKey =
  | 'band:light'
  | 'band:moderate'
  | 'band:heavy'
  | 'not_valued'
  | 'needs_outreach'
  | 'renewal'

interface ChipDef {
  key: FilterKey
  label: string
  title: string
}

/** Grouped so the row reads as two ideas rather than six chips. */
const EFFORT_CHIPS: ChipDef[] = [
  { key: 'band:light', label: 'Light', title: 'Bottom half of the board by muck points.' },
  { key: 'band:moderate', label: 'Moderate', title: 'The middle 30 percent by muck points.' },
  { key: 'band:heavy', label: 'Heavy', title: 'The heaviest fifth of the board by muck points.' },
  {
    key: 'not_valued',
    label: 'Not valued',
    title: 'No offering recorded, so there is no muck score and no value per point. These cannot be ranked until somebody records what the school is likely to buy.',
  },
]

const STATE_CHIPS: ChipDef[] = [
  {
    key: 'needs_outreach',
    label: 'Needs outreach',
    title: 'No activity for 14 days or more, or never contacted at all.',
  },
  { key: 'renewal', label: 'Renewal', title: 'An existing partner with a renewal open.' },
]

export interface ActiveFilters {
  keys: FilterKey[]
  search: string
}

export const EMPTY_FILTERS: ActiveFilters = {
  keys: [],
  search: '',
}

export function countActiveFilters(f: ActiveFilters): number {
  return f.keys.length + (f.search ? 1 : 0)
}

export function FilterPanel({
  activeFilters,
  setActiveFilters,
  counts,
}: {
  activeFilters: ActiveFilters
  setActiveFilters: (f: ActiveFilters) => void
  counts: Record<string, number>
}) {
  function toggle(key: FilterKey) {
    const arr = activeFilters.keys
    setActiveFilters({
      ...activeFilters,
      keys: arr.includes(key) ? arr.filter(x => x !== key) : [...arr, key],
    })
  }

  function Chip({ def }: { def: ChipDef }) {
    const count = counts[def.key] ?? 0
    const active = activeFilters.keys.includes(def.key)
    // A chip that matches nothing is shown disabled rather than hidden, so the
    // row does not silently reshape itself as the board changes, and rather
    // than live and clickable, which is what Expansion and Pilot were.
    const dead = count === 0 && !active
    return (
      <button
        onClick={() => !dead && toggle(def.key)}
        disabled={dead}
        title={dead ? `${def.title} Nothing on the board matches this right now.` : def.title}
        style={{
          padding: '5px 12px',
          fontSize: 12,
          fontWeight: 600,
          background: active ? '#10B981' : 'white',
          color: active ? 'white' : dead ? '#C2C7D0' : '#0a0f1e',
          border: `1.5px solid ${active ? '#10B981' : dead ? '#EDEFF3' : '#D1D5DB'}`,
          borderRadius: 20,
          cursor: dead ? 'default' : 'pointer',
        }}
      >
        {def.label} &middot; {count}
      </button>
    )
  }

  const anyActive = countActiveFilters(activeFilters) > 0

  return (
    <div style={{
      background: 'white',
      border: '1px solid #E5E7EB',
      borderRadius: 12,
      padding: '16px 20px',
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <input
          type="text"
          value={activeFilters.search}
          onChange={e => setActiveFilters({ ...activeFilters, search: e.target.value })}
          placeholder="Search by name, contact, email, city, source..."
          style={{
            border: '1px solid #D1D5DB',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 13,
            width: '100%',
            maxWidth: 320,
            outline: 'none',
          }}
        />
        {anyActive && (
          <button
            onClick={() => setActiveFilters(EMPTY_FILTERS)}
            style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Clear filters
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, flexShrink: 0 }}>
          How heavy:
        </span>
        {EFFORT_CHIPS.map(c => <Chip key={c.key} def={c} />)}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, flexShrink: 0 }}>
          Where it stands:
        </span>
        {STATE_CHIPS.map(c => <Chip key={c.key} def={c} />)}
      </div>
    </div>
  )
}
