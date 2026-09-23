'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

/**
 * The funding month.
 *
 * Two kinds of entry, and the difference is the whole point. Confirmed means a
 * real obligation on a real date. Predicted means the system's estimate of when
 * the next step lands, and it says how it worked that out.
 *
 * Served only when funding_config.new_pages is on.
 */

type EntryKind = 'send' | 'decide' | 'chase' | 'deadline'

interface Entry {
  id: string
  date: string
  kind: EntryKind
  label: string
  schoolId: string
  schoolName: string
  opportunityId?: string | null
  confirmed: boolean
  derivation?: string
  detail?: string
}

const C = {
  ink: '#1e2749', ink2: '#4b5164', ink3: '#8b91a3',
  rule: '#e5e7eb', rule2: '#f1f2f5', sunk: '#f9fafb', card: '#ffffff',
  send: '#1F6B4A', sendBg: '#E4F1EA',
  decide: '#2C4A8A', decideBg: '#E8F0FD',
  chase: '#8A5F14', chaseBg: '#FFF3D4',
  dead: '#9B2C3F', deadBg: '#FBE7EF',
  predict: '#6B7280', predictBg: '#EFF1F5',
}

const KIND: Record<EntryKind, { fg: string; bg: string; word: string }> = {
  send: { fg: C.send, bg: C.sendBg, word: 'Packet goes to the school' },
  decide: { fg: C.decide, bg: C.decideBg, word: 'Needs a decision' },
  chase: { fg: C.chase, bg: C.chaseBg, word: 'Waiting on the school' },
  deadline: { fg: C.dead, bg: C.deadBg, word: 'Funder deadline' },
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

/** Monday-first weekday index for a yyyy-mm-dd. */
function mondayIndex(y: number, m: number, d: number): number {
  return (new Date(y, m - 1, d).getDay() + 6) % 7
}

function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate()
}

export default function FundingCalendarPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [coverage, setCoverage] = useState<{ livePaths: number; withDate: number } | null>(null)
  const [open, setOpen] = useState<Entry | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setEntries(null)
    fetch(`/api/funding/calendar?year=${year}&month=${month}`)
      .then(async (r) => {
        if (r.status === 404) throw new Error('These screens are not switched on yet.')
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `Request failed (${r.status})`)
        return r.json()
      })
      .then((d) => { setEntries(d.entries ?? []); setCoverage(d.coverage ?? null); setError(null) })
      .catch((e) => setError(e.message))
  }, [year, month])

  useEffect(() => { load() }, [load])

  const step = (by: number) => {
    const m = month + by
    if (m < 1) { setMonth(12); setYear(year - 1) }
    else if (m > 12) { setMonth(1); setYear(year + 1) }
    else setMonth(m)
    setOpen(null)
  }

  const total = daysInMonth(year, month)
  const lead = mondayIndex(year, month, 1)
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const byDay = new Map<string, Entry[]>()
  for (const e of entries ?? []) {
    const list = byDay.get(e.date) ?? []
    list.push(e)
    byDay.set(e.date, list)
  }

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 24px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap', marginBottom: 4 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.ink, margin: 0, letterSpacing: '-0.02em' }}>
          {MONTHS[month - 1]} {year}
        </h1>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => step(-1)} style={navBtn}>Previous</button>
          <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth() + 1); setOpen(null) }} style={navBtn}>Today</button>
          <button onClick={() => step(1)} style={navBtn}>Next</button>
        </div>
        <Link href="/tdi-admin/funding/schools" style={{ marginLeft: 'auto', fontSize: 13, color: C.ink3, textDecoration: 'none' }}>
          Schools
        </Link>
      </div>

      {coverage && (
        <p style={{ fontSize: 13, color: C.ink3, margin: '0 0 14px' }}>
          {coverage.withDate} of {coverage.livePaths} live grant paths have a confirmed deadline.
          {coverage.withDate < coverage.livePaths && ' The rest have no date yet, so they cannot appear here until somebody confirms a window.'}
        </p>
      )}

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', margin: '0 0 14px', fontSize: 12 }}>
        {(Object.keys(KIND) as EntryKind[]).map((k) => (
          <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.ink2 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: KIND[k].fg }} />
            {KIND[k].word}
          </span>
        ))}
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.ink2 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: C.predict }} />
          Predicted, not confirmed
        </span>
      </div>

      {error && <div style={{ border: `1px solid ${C.rule}`, borderRadius: 10, padding: 16, color: C.ink2, fontSize: 14 }}>{error}</div>}
      {!error && entries === null && <div style={{ color: C.ink3, fontSize: 14 }}>Loading.</div>}

      {!error && entries && (
        <div style={{ overflowX: 'auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1,
            background: C.rule, border: `1px solid ${C.rule}`, borderRadius: 9,
            overflow: 'hidden', minWidth: 700,
          }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} style={{
                background: C.sunk, padding: '7px 8px', fontSize: 10, letterSpacing: '.08em',
                textTransform: 'uppercase', color: C.ink3, textAlign: 'center', fontWeight: 600,
              }}>{d}</div>
            ))}

            {Array.from({ length: lead }).map((_, i) => (
              <div key={`lead-${i}`} style={{ background: C.sunk, minHeight: 94 }} />
            ))}

            {Array.from({ length: total }).map((_, i) => {
              const day = i + 1
              const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const isToday = date === todayIso
              const list = byDay.get(date) ?? []
              return (
                <div key={date} style={{
                  background: isToday ? C.decideBg : C.card, minHeight: 94,
                  padding: '6px 7px', display: 'flex', flexDirection: 'column', gap: 3,
                }}>
                  <span style={{ fontSize: 11, color: isToday ? C.ink : C.ink3, fontWeight: isToday ? 700 : 400, fontVariantNumeric: 'tabular-nums' }}>
                    {day}{isToday ? ' today' : ''}
                  </span>
                  {list.map((e) => {
                    const look = e.confirmed ? KIND[e.kind] : { fg: C.predict, bg: C.predictBg }
                    return (
                      <button
                        key={e.id}
                        onClick={() => setOpen(e)}
                        title={e.label}
                        style={{
                          appearance: 'none', border: 0, textAlign: 'left', width: '100%',
                          font: 'inherit', fontSize: 10.5, lineHeight: 1.3, padding: '3px 5px',
                          borderRadius: 4, cursor: 'pointer', fontWeight: e.confirmed ? 600 : 500,
                          fontStyle: e.confirmed ? 'normal' : 'italic',
                          background: look.bg, color: look.fg,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}
                      >
                        {e.label}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {open && (
        <div style={{ border: `1px solid ${C.rule}`, borderRadius: 10, background: C.card, marginTop: 16, overflow: 'hidden' }}>
          <div style={{ padding: '13px 16px', borderBottom: `1px solid ${C.rule}`, display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', fontWeight: 700,
              padding: '2px 8px', borderRadius: 20,
              background: open.confirmed ? KIND[open.kind].bg : C.predictBg,
              color: open.confirmed ? KIND[open.kind].fg : C.predict,
            }}>
              {open.confirmed ? KIND[open.kind].word : 'Predicted, not confirmed'}
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.ink, flex: 1, minWidth: 200 }}>{open.label}</span>
            <button onClick={() => setOpen(null)} style={navBtn}>Close</button>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 13, color: C.ink3, marginBottom: 10 }}>
              {open.schoolName}  ·  {open.date}
            </div>
            {open.detail && <p style={{ fontSize: 14, color: C.ink2, margin: '0 0 12px', maxWidth: '68ch' }}>{open.detail}</p>}
            {open.derivation && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', color: C.ink3, fontWeight: 600, marginBottom: 5 }}>
                  How this date was worked out
                </div>
                <div style={{ border: `1px solid ${C.rule}`, borderRadius: 7, padding: '11px 13px', background: C.sunk, fontSize: 13.5, color: C.ink2 }}>
                  {open.derivation}
                </div>
              </div>
            )}
            {!open.confirmed && (
              <p style={{ fontSize: 13, color: C.ink2, margin: '0 0 12px', maxWidth: '68ch' }}>
                Nothing is due on this date. A predicted entry never chases anyone and disappears
                the moment a real date exists.
              </p>
            )}
            <Link
              href={`/tdi-admin/funding/schools/${open.schoolId}`}
              style={{ fontSize: 13, fontWeight: 600, color: C.ink, textDecoration: 'none' }}
            >
              Open {open.schoolName}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

const navBtn: React.CSSProperties = {
  appearance: 'none', font: 'inherit', fontSize: 12.5, fontWeight: 600,
  padding: '5px 11px', borderRadius: 6, border: `1px solid ${C.rule}`,
  background: C.card, color: C.ink, cursor: 'pointer',
}
