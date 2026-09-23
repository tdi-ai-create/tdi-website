'use client'

/**
 * Funding Home.
 *
 * This is the port of the Funding Home mockup. It replaces the old board as
 * what `/tdi-admin/funding` shows. The old board still exists at
 * `/tdi-admin/funding/board` because it holds every control that changes a
 * grant, and those are not wired into this screen yet. Removing it before they
 * are would take away 35 of the 36 ways to change anything in funding.
 *
 * Three views, the same three the mockup has:
 *   Calendar  what has to happen and when, confirmed and predicted
 *   Schools   what each school is trying to raise against what landed
 *   Detail    the live notes log, and the profile with a source on every fact
 *
 * Every figure on this page is read from the funding API. Nothing here is
 * seeded, and nothing is computed twice: the calendar rules live in
 * lib/funding-calendar.ts and the profile rules in lib/funding/school-profile.ts.
 */

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import FundingChrome from './FundingChrome'
import { ESCALATION_OPTIONS } from '@/lib/funding-qa'
import './funding-home.css'

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

interface Grant {
  id: string
  name: string
  status: string
  narrativeStatus: string
  attempts: number | null
  escalation: {
    summary?: string
    root_cause?: string
    recommended_option?: string
    recommendation_reason?: string
    awaiting_client?: boolean
    client_ask?: string
  } | null
}

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

interface Fact {
  key: string
  value: string
  source: string | null
  superseded: string | null
  needsSource: boolean
}

interface LogRow {
  id: string
  date: string
  title: string
  detail: string | null
}

interface Detail {
  school: School & { contactEmail: string | null; contactRole: string | null }
  facts: Fact[]
  log: LogRow[]
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

/**
 * The mockup has five colours where the data has four kinds. The fifth,
 * "internal step", is not a new field: it is a predicted entry for work that
 * happens inside TDI rather than at the school. The calendar builder names
 * those ids, so the distinction is read rather than invented.
 */
function toneOf(e: Entry): string {
  if (e.kind === 'send') return 'send'
  if (e.kind === 'chase') return 'client'
  if (e.kind === 'deadline') return 'close'
  const internal = /^pred-(draft|qa|approve)-/.test(e.id)
  return internal ? 'step' : 'decide'
}

const TONE_WORD: Record<string, string> = {
  send: 'To the school',
  step: 'Internal step',
  client: 'Waiting on school',
  close: 'Closing or overdue',
  decide: 'Decision due',
}

function money(n: number): string {
  return '$' + n.toLocaleString('en-US', {
    minimumFractionDigits: n % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  })
}

/** yyyy-mm-dd in local terms. Matches how the calendar API dates entries. */
function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function prettyKey(k: string): string {
  return k.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase())
}

export default function FundingHome() {
  const [view, setView] = useState<'cal' | 'schools' | 'school'>('cal')

  // The board links back here with ?view=schools, because it is its own route
  // and cannot switch a view it does not have. Read after mount rather than
  // with useSearchParams, which would force this route to opt out of
  // prerendering and can fail the build instead of just working.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('view') === 'schools') {
      setView('schools')
    }
  }, [])

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)

  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [coverage, setCoverage] = useState<{ livePaths: number; withDate: number } | null>(null)
  const [grants, setGrants] = useState<Record<string, Grant>>({})
  const [calError, setCalError] = useState<string | null>(null)

  const [schools, setSchools] = useState<School[] | null>(null)
  const [openDay, setOpenDay] = useState<string | null>(null)

  const [schoolId, setSchoolId] = useState<string | null>(null)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [pane, setPane] = useState<'log' | 'profile'>('log')

  // Bumped after a decision so the month reloads and the entry moves or goes.
  const [reloadAt, setReloadAt] = useState(0)

  useEffect(() => {
    let live = true
    setEntries(null)
    setCalError(null)
    fetch(`/api/funding/calendar?year=${year}&month=${month}`)
      .then(r => r.json())
      .then(d => {
        if (!live) return
        if (d.error) { setCalError(d.error); return }
        setEntries(d.entries ?? [])
        setGrants(d.grants ?? {})
        setCoverage(d.coverage ?? null)
      })
      .catch(() => live && setCalError('The calendar could not be read.'))
    return () => { live = false }
  }, [year, month, reloadAt])

  useEffect(() => {
    let live = true
    fetch('/api/funding/schools')
      .then(r => r.json())
      .then(d => live && setSchools(d.schools ?? []))
      .catch(() => live && setSchools([]))
    return () => { live = false }
  }, [])

  const loadSchool = useCallback((id: string) => {
    setSchoolId(id)
    setDetail(null)
    setPane('log')
    setView('school')
    setOpenDay(null)
    fetch(`/api/funding/schools/${id}`)
      .then(r => r.json())
      .then(d => { if (!d.error) setDetail(d) })
      .catch(() => {})
  }, [])

  function step(by: number) {
    const d = new Date(year, month - 1 + by, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth() + 1)
    setOpenDay(null)
  }

  // Monday first, which is how the mockup reads and how a work week reads.
  const first = new Date(year, month - 1, 1)
  const pad = (first.getDay() + 6) % 7
  const days = new Date(year, month, 0).getDate()
  const cells: (string | null)[] = []
  for (let i = 0; i < pad; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(iso(new Date(year, month - 1, d)))
  while (cells.length % 7 !== 0) cells.push(null)

  const byDay = new Map<string, Entry[]>()
  for (const e of entries ?? []) {
    const list = byDay.get(e.date) ?? []
    list.push(e)
    byDay.set(e.date, list)
  }

  const todayIso = iso(today)
  const dayItems = openDay ? (byDay.get(openDay) ?? []) : []

  return (
    <div className="fh">
      <FundingChrome
        active={view === 'cal' ? 'cal' : 'schools'}
        onView={v => { setView(v); setOpenDay(null) }}
      />

      <div className="wrap">

        <section className="view" id="v-cal" hidden={view !== 'cal'}>
          <div className="head">
            <div>
              <h1>What has to happen, and when</h1>
              <p className="sub">
                Confirmed work sits on its real date. Predicted work is derived from where each
                narrative is now and how long that step is allowed to take.
              </p>
            </div>
            <div className="legend">
              {(['send', 'step', 'client', 'close', 'decide'] as const).map(t => (
                <div className="lg" key={t}>
                  <i className="sw" style={{ background: `var(--${t})` }} />{TONE_WORD[t]}
                </div>
              ))}
              <div className="lg pred"><i className="sw" />Predicted</div>
            </div>
          </div>

          <div className="monthbar">
            <button className="mbtn" onClick={() => step(-1)} aria-label="Previous month">&#8249;</button>
            <button className="mbtn" onClick={() => step(1)} aria-label="Next month">&#8250;</button>
            <h2>{MONTHS[month - 1]} {year}</h2>
            <span className="today-chip">
              today · {today.getDate()} {MONTHS[today.getMonth()].slice(0, 3)} {today.getFullYear()}
            </span>
          </div>

          {coverage && (
            <p className="sub" style={{ margin: '0 0 12px' }}>
              {coverage.withDate} of {coverage.livePaths} live grant paths have a confirmed deadline.
              The rest have no date yet, so they cannot appear here until somebody confirms a window.
            </p>
          )}

          {calError && <p className="sub">{calError}</p>}
          {!calError && entries === null && <p className="sub">Loading.</p>}

          <div className="cal">
            <div className="dow">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid">
              {cells.map((date, i) => {
                if (!date) return <div className="day pad" key={`p${i}`}><span className="dnum" /></div>
                const items = byDay.get(date) ?? []
                const shown = items.slice(0, 3)
                const rest = items.length - shown.length
                const classes = ['day']
                if (items.length) classes.push('has')
                if (date === todayIso) classes.push('today')
                return (
                  <button
                    className={classes.join(' ')}
                    key={date}
                    onClick={() => items.length && setOpenDay(date)}
                    aria-label={`${date}, ${items.length} item${items.length === 1 ? '' : 's'}`}
                  >
                    <span className="dnum">{Number(date.slice(-2))}</span>
                    {shown.map(e => (
                      <span
                        className={`pill t-${toneOf(e)}${e.confirmed ? '' : ' predicted'}`}
                        key={e.id}
                      >
                        <i className="dot" /><span>{e.label}</span>
                      </span>
                    ))}
                    {rest > 0 && <span className="more">{rest} more</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <section className="view" id="v-schools" hidden={view !== 'schools'}>
          <div className="head">
            <div>
              <h1>Partnership schools</h1>
              <p className="sub">What each school is trying to raise, and what has actually landed.</p>
            </div>
          </div>
          <div className="schools">
            {schools === null && <p className="sub">Loading.</p>}
            {schools?.length === 0 && <p className="sub">No active partnership schools.</p>}
            {(schools ?? []).map(s => {
              const pct = s.goal && s.earned ? Math.min(100, (s.earned / s.goal) * 100) : 0
              return (
                <button className="scard" key={s.id} onClick={() => loadSchool(s.id)}>
                  <div>
                    <h3>{s.name}</h3>
                    <div className="loc">{s.where}{s.contactName ? ` · ${s.contactName}` : ''}</div>
                  </div>
                  <div className="money">
                    {/* Never a false zero. A school with a win we never priced
                        reads as that, not as having earned nothing. */}
                    {s.earned === null
                      ? <span className="big" style={{ fontSize: 15, color: 'var(--client)' }}>
                          {s.grantsWon > 0 ? `${s.grantsWon} won, amount not recorded` : 'nothing awarded yet'}
                        </span>
                      : <><span className="big">{money(s.earned)}</span>
                         {s.goal !== null && <span className="of">of {money(s.goal)}</span>}</>}
                  </div>
                  <div className="bar"><i style={{ width: `${pct}%` }} /></div>
                  <div className="meta">
                    <span><b>{s.livePaths}</b> live paths</span>
                    <span><b>{s.grantsWon}</b> won</span>
                    {s.grantsWonWithoutAnAmount > 0 &&
                      <span><b>{s.grantsWonWithoutAnAmount}</b> without an amount</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="view" id="v-school" hidden={view !== 'school'}>
          <button className="back" onClick={() => setView('schools')}>&#8249; All schools</button>
          <div className="head">
            <div>
              <h1>{detail?.school.name ?? 'Loading.'}</h1>
              {detail && (
                <p className="sub">
                  {detail.school.where}
                  {detail.school.contactName ? ` · ${detail.school.contactName}` : ''}
                  {detail.school.contactRole ? ` · ${detail.school.contactRole}` : ''}
                </p>
              )}
            </div>
          </div>

          <div className="tabs" role="tablist">
            <button role="tab" aria-selected={pane === 'log'} onClick={() => setPane('log')}>Notes log</button>
            <button role="tab" aria-selected={pane === 'profile'} onClick={() => setPane('profile')}>
              Profile{detail ? ` (${detail.facts.filter(f => f.needsSource).length} unsourced)` : ''}
            </button>
          </div>

          <div className="pane" id="p-log" hidden={pane !== 'log'}>
            <div className="live"><i /> live, updates as Paperclip moves</div>
            <ul className="log">
              {(detail?.log ?? []).map(r => (
                <li key={r.id}>
                  <time>{r.date}</time>
                  <div className="ev">{r.title}</div>
                  {r.detail && <div className="de">{r.detail}</div>}
                </li>
              ))}
            </ul>
          </div>

          <div className="pane" id="p-profile" hidden={pane !== 'profile'}>
            {detail && schoolId && (
              <ProfileFields
                schoolId={schoolId}
                facts={detail.facts}
                onSaved={() => loadSchool(schoolId)}
              />
            )}
          </div>
        </section>
      </div>

      <div className="scrim" hidden={!openDay} onClick={() => setOpenDay(null)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="mhead">
            <h3>{openDay}</h3>
            <button className="x" onClick={() => setOpenDay(null)} aria-label="Close">&times;</button>
          </div>
          <div className="mbody">
            {dayItems.map(e => {
              const tone = toneOf(e)
              return (
                <div className="card" key={e.id}>
                  <div className="cbar" style={{ background: `var(--${tone})` }} />
                  <div className="cbody">
                    <div className="ctop">
                      <span className="tag" style={{ background: `var(--${tone}-soft)`, color: `var(--${tone})` }}>
                        {TONE_WORD[tone]}
                      </span>
                      {!e.confirmed && <span className="tag pred">Predicted</span>}
                      <span className="school">{e.schoolName}</span>
                    </div>
                    <h4>{e.label}</h4>
                    {e.detail && <p>{e.detail}</p>}
                    {e.derivation && <div className="why">{e.derivation}</div>}
                    <GrantAction
                      entry={e}
                      grant={e.opportunityId ? grants[e.opportunityId] : undefined}
                      schoolId={e.schoolId}
                      schoolName={e.schoolName}
                      onDone={() => setReloadAt(n => n + 1)}
                      onOpenSchool={() => loadSchool(e.schoolId)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * The profile, with the one rule the screen exists to enforce: a fact that
 * needs a source cannot be saved without one. The route enforces it too, and
 * this shows the refusal rather than swallowing it.
 */
function ProfileFields({ schoolId, facts, onSaved }: {
  schoolId: string
  facts: Fact[]
  onSaved: () => void
}) {
  const [editing, setEditing] = useState<string | null>(null)
  const [value, setValue] = useState('')
  const [source, setSource] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function save(key: string) {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/funding/schools/${schoolId}/facts`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, source }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) { setError(body.error ?? 'That did not save.'); return }
      setEditing(null)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="fields">
        {facts.map(f => (
          <div className="f" key={f.key}>
            <label>{prettyKey(f.key)}</label>
            {editing === f.key ? (
              <>
                <input value={value} onChange={e => setValue(e.target.value)} autoFocus />
                <input
                  value={source}
                  onChange={e => setSource(e.target.value)}
                  placeholder="Where this came from"
                  style={{ marginTop: 6 }}
                />
                <div className="row" style={{ marginTop: 8 }}>
                  <button className="btn primary" disabled={saving} onClick={() => save(f.key)}>
                    {saving ? 'Saving' : 'Save'}
                  </button>
                  <button className="btn" onClick={() => { setEditing(null); setError(null) }}>Cancel</button>
                </div>
              </>
            ) : (
              <input
                readOnly
                value={f.value}
                onClick={() => { setEditing(f.key); setValue(f.value); setSource(f.source ?? ''); setError(null) }}
              />
            )}
            <div className={`src${f.needsSource ? ' warn' : ''}`}>
              {f.source ? f.source : 'No source recorded'}
            </div>
            {f.superseded && <div className="src">Replaced {f.superseded}</div>}
          </div>
        ))}
      </div>
      {error && <div className="src warn" style={{ marginTop: 10 }}>{error}</div>}
    </>
  )
}

/**
 * The controls the mockup put inside the popup.
 *
 * Only decisions live here. Nothing on this screen sends an email: drafting and
 * sending stay on the board behind their existing review step, because a send
 * is not something to make one click away from a calendar.
 *
 * Every contract here is the one the board already uses, so there is one answer
 * to what approving or escalating means:
 *   escalation   POST  /api/funding/escalation  { opportunityId, option, detail }
 *   approve      PATCH /api/funding/opportunities { id, narrative_status: 'ready' }
 *   send back    PATCH /api/funding/opportunities { id, narrative_status: 'requested', redraft_guidance }
 */
function GrantAction({ entry, grant, schoolId, schoolName, onDone, onOpenSchool }: {
  entry: Entry
  grant?: Grant
  schoolId: string
  schoolName: string
  onDone: () => void
  onOpenSchool: () => void
}) {
  const [choice, setChoice] = useState<string>(grant?.escalation?.recommended_option ?? '')
  const [detail, setDetail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  const ns = grant?.narrativeStatus
  const esc = grant?.escalation ?? null

  // A control appears only on the entry that means it, never on any entry that
  // happens to share a grant. Found by looking: an action item reading "Ask
  // BRAF for the Ourso form fields" was offering "Approve and release", purely
  // because that grant's narrative sat at approval. That is a different
  // decision, one click away, on the wrong card.
  const isApprovalEntry = entry.id.startsWith('pred-approve-')

  const escalated = ns === 'escalated' && !!esc && entry.id.startsWith('pred-escalate-')
  const awaitingClient = escalated && esc?.awaiting_client === true
  const atApproval = ns === 'approval' && isApprovalEntry

  async function post(url: string, body: unknown, ok: string) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(url, {
        method: url.includes('escalation') ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const text = await res.text()
      let out: Record<string, unknown> = {}
      try { out = text ? JSON.parse(text) : {} } catch { /* not json, kept below */ }
      // The route answers 200 with an error body in some paths, so both are
      // checked. When it fails without one, say what actually came back rather
      // than a sentence that tells the reader nothing.
      if (!res.ok || out.error) {
        const why = typeof out.error === 'string' ? out.error : null
        setError(why ?? `The server answered ${res.status}. ${text.slice(0, 200) || 'No detail.'}`)
        return
      }
      setDone(typeof out.message === 'string' ? out.message : ok)
      onDone()
    } catch {
      setError('That did not go through.')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return <div className="act"><div className="doneflag">{done}</div></div>
  }

  const links = (
    <div className="row">
      <Link className="btn" href={`/tdi-admin/funding/${schoolId}`} style={{ textDecoration: 'none' }}>
        Open this grant
      </Link>
      <button className="btn" onClick={onOpenSchool}>Open {schoolName}</button>
    </div>
  )

  if (awaitingClient) {
    return (
      <div className="act">
        <label>Waiting on the school</label>
        {esc?.client_ask && <p style={{ margin: 0, fontSize: 12.5 }}>We asked for: {esc.client_ask}</p>}
        <div className="row">
          <button
            className="btn primary"
            disabled={busy}
            onClick={() => post('/api/funding/escalation',
              { opportunityId: grant!.id, option: 'resume_drafting', detail: detail || 'The school replied.' },
              'Drafting resumed.')}
          >
            {busy ? 'Working' : 'The school replied, resume drafting'}
          </button>
        </div>
        {error && <div className="src warn">{error}</div>}
        {links}
      </div>
    )
  }

  if (escalated) {
    const selected = ESCALATION_OPTIONS.find(o => o.key === choice)
    const needsDetail = !!selected?.requires && detail.trim().length < 3
    return (
      <div className="act">
        <label>QA could not get this through{grant?.attempts ? ` after ${grant.attempts} attempts` : ''}</label>
        {esc?.summary && <p style={{ margin: 0, fontSize: 12.5 }}>{esc.summary}</p>}
        {esc?.root_cause && <div className="why">Why it keeps failing: {esc.root_cause}</div>}

        <label htmlFor={`opt-${grant!.id}`}>Your decision</label>
        <select id={`opt-${grant!.id}`} value={choice} onChange={ev => setChoice(ev.target.value)}>
          <option value="">Choose one</option>
          {ESCALATION_OPTIONS.map(o => (
            <option key={o.key} value={o.key}>
              {o.label}{o.key === esc?.recommended_option ? ' (recommended)' : ''}
            </option>
          ))}
        </select>
        {selected && (
          <>
            <p style={{ margin: 0, fontSize: 12 }}>{selected.whatHappens}</p>
            {selected.requires && (
              <>
                <label htmlFor={`d-${grant!.id}`}>{selected.requires.label}</label>
                <textarea
                  id={`d-${grant!.id}`}
                  value={detail}
                  placeholder={selected.requires.placeholder}
                  onChange={ev => setDetail(ev.target.value)}
                />
              </>
            )}
          </>
        )}
        <div className="row">
          <button
            className="btn primary"
            disabled={busy || !choice || needsDetail}
            onClick={() => post('/api/funding/escalation',
              { opportunityId: grant!.id, option: choice, detail: detail.trim() },
              'Decision recorded.')}
          >
            {busy ? 'Working' : 'Record this decision'}
          </button>
        </div>
        {error && <div className="src warn">{error}</div>}
        {links}
      </div>
    )
  }

  if (atApproval) {
    return (
      <div className="act">
        <label>This has passed QA and is waiting on you</label>
        <label htmlFor={`note-${grant!.id}`}>Note, required to send it back</label>
        <textarea
          id={`note-${grant!.id}`}
          value={detail}
          placeholder="Lead with the reading results from last spring. The draft buries them."
          onChange={ev => setDetail(ev.target.value)}
        />
        <div className="row">
          <button
            className="btn primary"
            disabled={busy}
            onClick={() => post('/api/funding/opportunities',
              { id: grant!.id, narrative_status: 'ready' },
              'Approved. It is ready to go to the school.')}
          >
            {busy ? 'Working' : 'Approve and release'}
          </button>
          <button
            className="btn"
            disabled={busy || detail.trim().length < 3}
            onClick={() => post('/api/funding/opportunities',
              { id: grant!.id, narrative_status: 'requested', redraft_guidance: detail.trim() },
              'Sent back to the writer with your note.')}
          >
            Send back with your direction
          </button>
        </div>
        {error && <div className="src warn">{error}</div>}
        {links}
      </div>
    )
  }

  // Nothing on this entry is a decision, so it only has to lead somewhere.
  return <div className="act">{links}</div>
}
