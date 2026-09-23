'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

/**
 * Partnership schools.
 *
 * Deliberately almost empty. The old portal answered every question on one
 * screen and buried the one being asked. This answers one: which schools do we
 * work with, and how much have they actually been awarded against their goal.
 *
 * Served only when funding_config.new_pages is on. The API returns 404
 * otherwise, so this ships long before it is switched on.
 */

interface School {
  id: string
  name: string
  where: string
  contactName: string | null
  goal: number | null
  earned: number | null
  grantsWon: number
  grantsWonWithoutAnAmount: number
  livePaths: number
}

const C = {
  ink: '#1e2749', ink2: '#4b5164', ink3: '#8b91a3',
  rule: '#e5e7eb', sunk: '#f9fafb', card: '#ffffff',
  good: '#1F6B4A', warn: '#b45309',
}

function money(n: number): string {
  return `$${n.toLocaleString('en-US')}`
}

export default function FundingSchoolsPage() {
  const [schools, setSchools] = useState<School[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/funding/schools')
      .then(async (r) => {
        if (r.status === 404) throw new Error('These screens are not switched on yet.')
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `Request failed (${r.status})`)
        return r.json()
      })
      .then((d) => { if (!cancelled) setSchools(d.schools ?? []) })
      .catch((e) => { if (!cancelled) setError(e.message) })
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: C.ink, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
        Partnership schools
      </h1>
      <p style={{ color: C.ink3, fontSize: 13.5, margin: '0 0 24px' }}>
        What each school has been awarded, against what their grant plan is worth.
      </p>

      {error && (
        <div style={{ border: `1px solid ${C.rule}`, borderRadius: 10, padding: 16, color: C.ink2, fontSize: 14 }}>
          {error}
        </div>
      )}

      {!error && schools === null && (
        <div style={{ color: C.ink3, fontSize: 14 }}>Loading.</div>
      )}

      {schools?.length === 0 && (
        <div style={{ color: C.ink3, fontSize: 14 }}>No active partnership schools.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(schools ?? []).map((s) => {
          const pct = s.goal && s.earned ? Math.min(100, (s.earned / s.goal) * 100) : 0
          return (
            <Link
              key={s.id}
              href={`/tdi-admin/funding/schools/${s.id}`}
              style={{
                display: 'block', textDecoration: 'none', background: C.card,
                border: `1px solid ${C.rule}`, borderRadius: 10, padding: '15px 17px',
              }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <span style={{ flex: 1, minWidth: 180, fontSize: 15, fontWeight: 700, color: C.ink }}>{s.name}</span>
                {s.earned === null ? (
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: C.warn, whiteSpace: 'nowrap' }}>
                    {s.grantsWon > 0
                      ? `${s.grantsWon} won, amount not recorded`
                      : 'nothing awarded yet'}
                  </span>
                ) : (
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.good, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                    {money(s.earned)}
                    {s.grantsWonWithoutAnAmount > 0 && (
                      <span style={{ color: C.warn, fontWeight: 600, fontSize: 12 }}>
                        {' '}plus {s.grantsWonWithoutAnAmount} not recorded
                      </span>
                    )}
                  </span>
                )}
                <span style={{ fontSize: 12.5, color: C.ink3, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                  of {s.goal === null ? 'no goal set' : money(s.goal)}
                </span>
              </div>

              <div style={{ height: 6, borderRadius: 4, background: C.sunk, overflow: 'hidden', margin: '9px 0 8px' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: C.good, borderRadius: 4 }} />
              </div>

              <div style={{ fontSize: 12, color: C.ink3 }}>
                {[s.where, s.contactName, `${s.livePaths} live path${s.livePaths === 1 ? '' : 's'}`]
                  .filter(Boolean)
                  .join('  ·  ')}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
