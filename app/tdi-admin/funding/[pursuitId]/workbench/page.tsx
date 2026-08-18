'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { PhaseChain } from '../../components/PhaseChain'
import { OpportunitiesTab } from '../../components/panel/OpportunitiesTab'
import { ActionsTab } from '../../components/panel/ActionsTab'
import { RecordTab } from '../../components/panel/RecordTab'
import { pickTheOneThing, groupWork, isLivePath, daysSince } from './lib'
import { C, Panel, KV, TheOneThing, WorkGroup, TaskRow, AgentRow, PathRow } from './parts'

/**
 * The pursuit workbench.
 *
 * Work on the left, the school on the right, permanently. It replaces a layout
 * that opened with every action item expanded, roughly two thousand pixels of
 * wall, with the five useful sections collapsed underneath it.
 *
 * One fetch feeds the whole view. The page it replaces fetched overlapping data
 * five to seven times, once per tab, which is how the action count and the
 * action list came to disagree: the badge read the page's copy, the list read
 * the tab's, and the tab had no way to tell the page it had changed.
 *
 * Built alongside the existing page rather than over it, so both can be opened
 * on the same school and compared before anything is swapped.
 */
export default function WorkbenchPage() {
  const params = useParams()
  const pursuitId = params.pursuitId as string

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState<string | null>(null)

  const load = () => {
    fetch(`/api/funding/pursuits/${pursuitId}`)
      .then(r => r.json())
      .then(d => { if (!d.error) setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(load, [pursuitId])

  if (loading) return <div style={{ padding: 40, color: C.ink3 }}>Loading...</div>
  if (!data?.pursuit) return <div style={{ padding: 40, color: C.ink3 }}>Could not load this school.</div>

  const p = data.pursuit
  const opportunities: any[] = data.opportunities ?? []
  const actionItems: any[] = data.actionItems ?? []
  const gate = data.gate

  const pick = pickTheOneThing(opportunities, actionItems)
  const work = groupWork(actionItems, opportunities)

  const livePaths = opportunities.filter(isLivePath)
  const awarded = opportunities
    .filter(o => o.status === 'awarded')
    .reduce((s, o) => s + Number(o.awarded_amount || o.amount || 0), 0)
  const pipeline = Number(p.total_amount || 0)

  const sortedPaths = [...opportunities].sort((a, b) => {
    const la = isLivePath(a) ? 0 : 1, lb = isLivePath(b) ? 0 : 1
    if (la !== lb) return la - lb
    return Number(b.amount || 0) - Number(a.amount || 0)
  })

  const section = (id: string, title: string, body: React.ReactNode) => (
    <div style={{ border: `1px solid ${C.rule}`, borderRadius: 10, marginTop: 10, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(open === id ? null : id)}
        style={{
          width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none',
          background: open === id ? C.sunk : C.card, padding: '11px 14px',
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 620, color: C.ink,
        }}
      >
        <span style={{ fontSize: 10, color: C.ink3, transform: open === id ? 'rotate(90deg)' : 'none' }}>&#9654;</span>
        {title}
      </button>
      {open === id && <div style={{ borderTop: `1px solid ${C.rule}`, padding: 14 }}>{body}</div>}
    </div>
  )

  return (
    <div style={{ padding: '20px 22px 60px', maxWidth: 1320, margin: '0 auto' }}>
      <Link href="/tdi-admin/funding" style={{ fontSize: 12, color: C.accent, textDecoration: 'none' }}>
        &#8592; Back to Funding
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap', marginTop: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: 21, fontWeight: 750, letterSpacing: '-.02em', color: C.ink, margin: '0 0 3px' }}>
            {p.district_name || p.pursuit_name}
          </h1>
          <div style={{ fontSize: 12, color: C.ink3 }}>
            {p.client_contact_name}
            {gate ? (gate.gate_open ? ' · gate open' : ' · gate shut') : ''}
            {` · ${livePaths.length} live path${livePaths.length === 1 ? '' : 's'}`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 22, textAlign: 'right' }}>
          <div>
            <div style={{ fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', color: C.ink3 }}>Pipeline</div>
            <div style={{ fontSize: 17, fontWeight: 750, fontVariantNumeric: 'tabular-nums', letterSpacing: '-.02em' }}>
              ${pipeline.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', color: C.ink3 }}>Awarded</div>
            <div style={{ fontSize: 17, fontWeight: 750, fontVariantNumeric: 'tabular-nums', letterSpacing: '-.02em', color: awarded > 0 ? C.green : C.ink3 }}>
              ${awarded.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div style={{ margin: '14px 0 18px' }}>
        <PhaseChain currentPhase={p.current_phase} isStalled={p.is_stalled} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 18, alignItems: 'start' }} className="wb-grid">
        <div style={{ minWidth: 0 }}>
          <TheOneThing pick={pick} onOpen={() => setOpen(pick?.kind === 'funder' ? 'paths' : 'actions')} />

          <WorkGroup title="Waiting on you" count={work.you.length} tone={C.red}>
            {work.you.map(a => <TaskRow key={a.id} item={a} onOpen={() => setOpen('actions')} />)}
          </WorkGroup>

          <WorkGroup title="Waiting on the school" count={work.school.length} tone={C.amber}>
            {work.school.map(a => <TaskRow key={a.id} item={a} onOpen={() => setOpen('actions')} />)}
          </WorkGroup>

          <WorkGroup title="Running by itself" count={work.agent.length} tone={C.ink3}>
            {work.agent.map(o => <AgentRow key={o.id} opp={o} />)}
          </WorkGroup>

          {section('actions', `All action items (${actionItems.length}, ${work.finished.length} finished)`,
            <ActionsTab pursuitId={pursuitId} />)}
          {section('paths', `Grant paths (${opportunities.length})`,
            <OpportunitiesTab
              pursuitId={pursuitId}
              gateOpen={gate?.gate_open === true}
              contract2LineItems={data.contract2LineItems}
              contract2QuotePackageId={data.contract2LineItems?.[0]?.id}
            />)}
          {section('record', 'Record', <RecordTab pursuitId={pursuitId} />)}
        </div>

        <aside style={{ display: 'grid', gap: 12, minWidth: 0 }}>
          <Panel
            title="The school"
            right={gate ? (
              <span style={{ color: gate.gate_open ? C.green : C.red, fontSize: 10 }}>
                {gate.gate_open ? 'Gate open' : 'Gate shut'}
              </span>
            ) : undefined}
          >
            <KV k="Contact" v={p.client_contact_name} />
            <KV k="Email" v={p.client_contact_email} />
            <KV k="Contract" v={pipeline ? `$${pipeline.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : null} />
            <KV k="County" v={[p.county, p.state_code].filter(Boolean).join(', ') || null} />
            <KV k="Sector" v={p.sector} />
            <KV k="Implementation" v={p.implementation_date} />
          </Panel>

          <Panel title="Paths" right={<span style={{ color: C.ink3 }}>{opportunities.length}</span>}>
            {sortedPaths.length === 0
              ? <div style={{ fontSize: 12, color: C.ink3 }}>No paths yet.</div>
              : sortedPaths.map(o => <PathRow key={o.id} opp={o} />)}
          </Panel>

          <Panel title="Record">
            <div style={{ fontSize: 12, color: C.ink2, marginBottom: 9 }}>
              Every note, email, review and reason written about this school.
            </div>
            <button
              onClick={() => setOpen('record')}
              style={{
                width: '100%', fontSize: 12, fontWeight: 620, padding: '7px 12px', borderRadius: 7,
                border: `1px solid ${C.rule}`, background: C.card, color: C.ink2, cursor: 'pointer',
              }}
            >
              Open the full record
            </button>
          </Panel>
        </aside>
      </div>

      <style>{`@media (max-width: 900px) { .wb-grid { grid-template-columns: minmax(0,1fr) !important; } }`}</style>
    </div>
  )
}
