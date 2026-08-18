'use client'

import { useEffect, useState } from 'react'

interface RecordTabProps {
  pursuitId: string
}

/**
 * Everything anyone has written about one school, in one place.
 *
 * The record view and its API have existed since 17 Aug and nothing called
 * them, so 272 entries were queryable and unreadable. This is the screen.
 *
 * Groups are collapsed by default and expand to the records themselves rather
 * than to a longer paraphrase. The summary on each group header is computed,
 * never generated: every clause in it is a count or a date, so it cannot be
 * wrong about what it is summarising.
 */

// Colour carries the kind, so a long record can be scanned for the two things
// people actually look for: what we said to the school, and what is unsent.
const KIND_COLOR: Record<string, string> = {
  'event': '#9CA3AF',
  'email': '#3B82F6',
  'email draft': '#F59E0B',
  'task note': '#8B5CF6',
  'qa review': '#14B8A6',
  'school note': '#64748B',
  'path note': '#A78BFA',
  'answer': '#10B981',
  'cancelled': '#9CA3AF',
  'denied': '#EF4444',
  'stopped': '#EA580C',
}

function fmtDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function RecordTab({ pursuitId }: RecordTabProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [kindFilter, setKindFilter] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/funding/pursuits/${pursuitId}/record`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [pursuitId])

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#6B7280' }}>Loading...</div>
  }

  if (!data || data.total === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF', fontSize: 13 }}>
        Nothing has been written about this school yet
      </div>
    )
  }

  const allKinds = Object.keys(data.facts?.byKind ?? {}).sort()

  return (
    <div>
      {/* What the whole record contains, computed rather than described */}
      <div style={{
        background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8,
        padding: '12px 14px', marginBottom: 14,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0a0f1e', marginBottom: 4 }}>
          {data.total} record{data.total === 1 ? '' : 's'}
        </div>
        <div style={{ fontSize: 12, color: '#4B5563', lineHeight: 1.5 }}>
          {data.summary}
        </div>
        {data.note && (
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6, lineHeight: 1.5 }}>
            {data.note}
          </div>
        )}
      </div>

      {/* Filter by kind. Bella's most common question is "what did we send
          them", and that should not require reading everything else. */}
      {allKinds.length > 1 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          <button
            onClick={() => setKindFilter(null)}
            style={{
              fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999,
              cursor: 'pointer',
              border: `1px solid ${kindFilter === null ? '#8B5CF6' : '#E5E7EB'}`,
              background: kindFilter === null ? '#F5F3FF' : 'white',
              color: kindFilter === null ? '#8B5CF6' : '#6B7280',
            }}
          >
            Everything
          </button>
          {allKinds.map(k => (
            <button
              key={k}
              onClick={() => setKindFilter(kindFilter === k ? null : k)}
              style={{
                fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                border: `1px solid ${kindFilter === k ? '#8B5CF6' : '#E5E7EB'}`,
                background: kindFilter === k ? '#F5F3FF' : 'white',
                color: kindFilter === k ? '#8B5CF6' : '#6B7280',
              }}
            >
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: KIND_COLOR[k] ?? '#9CA3AF', flexShrink: 0,
              }} />
              {k} ({data.facts.byKind[k]})
            </button>
          ))}
        </div>
      )}

      {/* One group per funding path, plus the school overall */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(data.groups ?? []).map((g: any) => {
          const records = kindFilter
            ? (g.records ?? []).filter((r: any) => r.kind === kindFilter)
            : (g.records ?? [])
          if (kindFilter && records.length === 0) return null

          const isOpen = open[g.key] === true

          return (
            <div key={g.key} style={{ border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
              <button
                onClick={() => setOpen(o => ({ ...o, [g.key]: !isOpen }))}
                style={{
                  width: '100%', textAlign: 'left', cursor: 'pointer',
                  background: isOpen ? '#F9FAFB' : 'white',
                  border: 'none', padding: '11px 14px',
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                }}
              >
                <span style={{
                  fontSize: 11, color: '#9CA3AF', marginTop: 2, flexShrink: 0,
                  transform: isOpen ? 'rotate(90deg)' : 'none',
                  transition: 'transform 120ms',
                }}>
                  &#9654;
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{
                    display: 'block', fontSize: 13, fontWeight: 700, color: '#0a0f1e',
                  }}>
                    {g.label}
                  </span>
                  <span style={{
                    display: 'block', fontSize: 11, color: '#6B7280', marginTop: 3, lineHeight: 1.5,
                  }}>
                    {kindFilter
                      ? `${records.length} ${kindFilter}${records.length === 1 ? '' : 's'}`
                      : g.summary}
                  </span>
                </span>
              </button>

              {isOpen && (
                <div style={{ borderTop: '1px solid #E5E7EB', padding: '4px 14px 10px 14px' }}>
                  {records.map((r: any, i: number) => (
                    <div
                      key={`${r.kind}-${r.occurred_at}-${i}`}
                      style={{
                        display: 'flex', gap: 10, padding: '10px 0',
                        borderBottom: i < records.length - 1 ? '1px solid #F3F4F6' : 'none',
                      }}
                    >
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                        background: KIND_COLOR[r.kind] ?? '#9CA3AF',
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'baseline', gap: 10,
                        }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#0a0f1e' }}>
                            {r.subject || '(no subject)'}
                          </span>
                          <span style={{ fontSize: 10, color: '#9CA3AF', flexShrink: 0, whiteSpace: 'nowrap' }}>
                            {fmtDate(r.occurred_at)}
                          </span>
                        </div>
                        <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>
                          {r.kind} &middot; {r.author || 'unknown'}
                        </div>
                        {r.body && (
                          <div style={{
                            fontSize: 12, color: '#4B5563', marginTop: 5, lineHeight: 1.55,
                            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                          }}>
                            {r.body}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
