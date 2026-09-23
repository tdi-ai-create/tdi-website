'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'

/**
 * One school: its log, and the facts we hold about it.
 *
 * The log is not new data. funding_pursuit_timeline already holds 363 entries
 * across the three live schools and 61 arrived in the seven days to 22
 * September as agents worked. It has simply never been shown as a log.
 *
 * The profile is where grant narratives get their numbers, so a fact with no
 * source is marked. On Saunemin that is three of them, and QA rejected all
 * three on attempts 1, 3 and 5 of the same application.
 */

interface Fact { key: string; value: string; source: string | null; needsSource: boolean }
interface LogEntry { id: string; date: string; at: string; title: string; detail: string | null; status: string | null }
interface School {
  id: string; name: string; where: string
  contactName: string | null; contactEmail: string | null; contactRole: string | null
  goal: number | null; earned: number | null
  grantsWon: number; grantsWonWithoutAnAmount: number; livePaths: number
}

const C = {
  ink: '#1e2749', ink2: '#4b5164', ink3: '#8b91a3',
  rule: '#e5e7eb', rule2: '#f1f2f5', sunk: '#f9fafb', card: '#ffffff',
  good: '#1F6B4A', warn: '#b45309', bad: '#9B2C3F', badSub: '#FBE7EF',
  accent: '#ffba06',
}

function money(n: number): string { return `$${n.toLocaleString('en-US')}` }

function label(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/** "22 Sep, 14:32" from a timestamp. */
function stamp(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function SchoolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [tab, setTab] = useState<'log' | 'profile'>('log')
  const [data, setData] = useState<{ school: School; facts: Fact[]; log: LogEntry[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/funding/schools/${id}`)
      .then(async (r) => {
        if (r.status === 404) throw new Error('Not found, or these screens are not switched on yet.')
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `Request failed (${r.status})`)
        return r.json()
      })
      .then((d) => { if (!cancelled) setData(d) })
      .catch((e) => { if (!cancelled) setError(e.message) })
    return () => { cancelled = true }
  }, [id])

  if (error) {
    return <div style={{ maxWidth: 900, margin: '0 auto', padding: 32, color: C.ink2 }}>{error}</div>
  }
  if (!data) {
    return <div style={{ maxWidth: 900, margin: '0 auto', padding: 32, color: C.ink3 }}>Loading.</div>
  }

  const { school: s, facts, log } = data
  const unsourced = facts.filter((f) => f.needsSource).length

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>
      <Link href="/tdi-admin/funding/schools" style={{ fontSize: 13, color: C.ink3, textDecoration: 'none' }}>
        Back to schools
      </Link>

      <h1 style={{ fontSize: 25, fontWeight: 700, color: C.ink, margin: '10px 0 4px', letterSpacing: '-0.02em' }}>
        {s.name}
      </h1>
      <div style={{ fontSize: 13, color: C.ink3, marginBottom: 6 }}>
        {[s.where, s.contactName, s.contactRole].filter(Boolean).join('  ·  ')}
      </div>
      <div style={{ fontSize: 13.5, color: C.ink2, marginBottom: 20 }}>
        {s.earned === null
          ? (s.grantsWon > 0
              ? `${s.grantsWon} grant${s.grantsWon === 1 ? '' : 's'} won, amount never recorded`
              : 'Nothing awarded yet')
          : money(s.earned)}
        {s.goal !== null && ` of ${money(s.goal)}`}
        {`  ·  ${s.livePaths} live path${s.livePaths === 1 ? '' : 's'}`}
      </div>

      <div style={{ display: 'flex', gap: 3, borderBottom: `1px solid ${C.rule}`, marginBottom: 4 }}>
        {(['log', 'profile'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            aria-selected={tab === t}
            role="tab"
            style={{
              appearance: 'none', border: 0, background: 'none', font: 'inherit',
              fontSize: 13.5, fontWeight: 600, cursor: 'pointer', padding: '9px 13px',
              color: tab === t ? C.ink : C.ink3,
              borderBottom: `2px solid ${tab === t ? C.ink : 'transparent'}`,
            }}
          >
            {t === 'log' ? 'Log' : `Profile${unsourced > 0 ? ` (${unsourced} unsourced)` : ''}`}
          </button>
        ))}
      </div>

      {tab === 'log' && (
        <div style={{ marginTop: 18 }}>
          {log.length === 0 && <div style={{ color: C.ink3, fontSize: 14 }}>Nothing recorded yet.</div>}
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, borderLeft: `2px solid ${C.rule}` }}>
            {log.map((e) => (
              <li key={e.id} style={{ position: 'relative', padding: '0 0 15px 18px' }}>
                <span style={{
                  position: 'absolute', left: -5, top: 7, width: 8, height: 8, borderRadius: '50%',
                  background: e.status === 'active' ? C.accent : C.rule,
                }} />
                <div style={{ fontSize: 10.5, color: C.ink3, fontVariantNumeric: 'tabular-nums', letterSpacing: '.03em' }}>
                  {stamp(e.at) || e.date}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink, marginTop: 1 }}>{e.title}</div>
                {e.detail && (
                  <div style={{ fontSize: 12.5, color: C.ink2, marginTop: 2 }}>{e.detail}</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'profile' && (
        <div style={{ marginTop: 18 }}>
          <p style={{ fontSize: 13.5, color: C.ink2, margin: '0 0 14px', maxWidth: '68ch' }}>
            Agents read these when they write a grant application. A fact with no source is marked,
            because an unsourced number here becomes an unsourced number in an application.
          </p>
          {facts.length === 0 && <div style={{ color: C.ink3, fontSize: 14 }}>No profile recorded.</div>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(215px, 1fr))', gap: 10 }}>
            {facts.map((f) => (
              <div
                key={f.key}
                style={{
                  border: `1px solid ${f.needsSource ? C.bad : C.rule}`,
                  background: f.needsSource ? C.badSub : C.card,
                  borderRadius: 8, padding: '11px 13px',
                }}
              >
                <div style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: C.ink3, fontWeight: 600 }}>
                  {label(f.key)}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, marginTop: 3, wordBreak: 'break-word' }}>
                  {f.value || '—'}
                </div>
                <div style={{ fontSize: 11.5, marginTop: 4, color: f.needsSource ? C.bad : C.ink2, fontWeight: f.needsSource ? 600 : 400 }}>
                  {f.source ?? 'No source recorded'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
