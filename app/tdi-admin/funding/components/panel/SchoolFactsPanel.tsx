'use client'

import { useEffect, useState } from 'react'

/**
 * What we know about a school, and how much of it we can actually use.
 *
 * The profile above this panel shows values. This shows whether any of them
 * can be cited in an application. Those turned out to be very different
 * questions: of 42 facts across three schools, 9 have a source.
 */

type Fact = {
  key: string
  status: 'known' | 'unverified' | 'not_checked' | 'not_published'
  value: string | null
  origin: 'contract' | 'researched' | 'school_stated' | null
  source: string | null
  verifiedOn: string | null
  stale: boolean
  citeable: boolean
  blocked: string | null
}

type Summary = {
  total: number
  citeable: number
  unverified: number
  stale: number
  notChecked: number
  notPublished: number
}

const LABEL: Record<string, string> = {
  contract: 'from the contract',
  researched: 'researched',
  school_stated: 'the school told us',
}

function prettyKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\bpct\b/, '%')
}

export function SchoolFactsPanel({ pursuitId }: { pursuitId: string }) {
  const [facts, setFacts] = useState<Fact[] | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [failed, setFailed] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/funding/pursuits/${pursuitId}/facts`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(d => { if (!cancelled) { setFacts(d.facts); setSummary(d.summary) } })
      // Says so rather than rendering an empty panel. An empty panel and a
      // failed request look identical, and that ambiguity is most of why
      // problems here went unnoticed for months.
      .catch(e => { if (!cancelled) setFailed(String(e.message || e)) })
    return () => { cancelled = true }
  }, [pursuitId])

  if (failed) {
    return (
      <div style={{ background: '#FBE9EC', border: '1px solid #D9808C', borderRadius: 10, padding: 14, marginTop: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#9B2C3A' }}>Could not load what we know about this school</div>
        <div style={{ fontSize: 12, color: '#9B2C3A', marginTop: 4 }}>{failed}</div>
      </div>
    )
  }

  if (!facts || !summary) {
    return <div style={{ fontSize: 12, color: '#6B7280', marginTop: 12 }}>Loading what we know…</div>
  }

  if (facts.length === 0) {
    return (
      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 12 }}>
        Nothing recorded about this school yet.
      </div>
    )
  }

  // Usable first, then things a person could fix, then dead ends.
  const order = { known: 0, unverified: 1, not_checked: 2, not_published: 3 }
  const sorted = [...facts].sort(
    (a, b) => (order[a.status] - order[b.status]) || a.key.localeCompare(b.key)
  )

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', color: '#6B7280' }}>
          What we know
        </div>
        <div style={{ fontSize: 12, color: summary.citeable === 0 ? '#9B2C3A' : '#6B7280', fontWeight: summary.citeable === 0 ? 700 : 400 }}>
          {summary.citeable} of {summary.total} can be cited in an application
        </div>
      </div>

      <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
        {sorted.map((f, i) => (
          <div
            key={f.key}
            style={{
              display: 'flex', gap: 10, alignItems: 'baseline', padding: '8px 12px',
              borderTop: i === 0 ? 'none' : '1px solid #F3F4F6',
              background: f.citeable ? '#FFFFFF' : '#FAFAFB',
            }}
          >
            <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, flexShrink: 0,
                          background: f.citeable ? '#1F6B52' : f.status === 'unverified' ? '#8A5500' : '#C7CBD4' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: '#0a0f1e' }}>
                <span style={{ color: '#6B7280' }}>{prettyKey(f.key)}: </span>
                <span style={{ fontWeight: 700 }}>{f.value ?? '—'}</span>
                {f.origin && (
                  <span style={{ color: '#6B7280', fontWeight: 400 }}> · {LABEL[f.origin]}</span>
                )}
                {f.verifiedOn && (
                  <span style={{ color: '#9CA3AF', fontWeight: 400 }}> · checked {f.verifiedOn}</span>
                )}
              </div>
              {f.source && f.status === 'known' && (
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{f.source}</div>
              )}
              {f.blocked && (
                <div style={{ fontSize: 11, color: f.stale ? '#9B2C3A' : '#8A5500', marginTop: 2 }}>
                  {f.blocked}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
