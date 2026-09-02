'use client'

import { ReactNode } from 'react'
import { daysSince, daysUntil, isLivePath } from './lib'

const C = {
  ink: '#0a0f1e', ink2: '#4b5164', ink3: '#8b91a3',
  rule: '#e5e7eb', rule2: '#f1f2f5', sunk: '#f9fafb', card: '#ffffff',
  accent: '#7C5CFC', accentSub: '#f3f0ff',
  red: '#dc2626', redSub: '#fef2f2',
  amber: '#b45309', amberSub: '#fffbeb',
  green: '#059669', greenSub: '#ecfdf5',
}
export { C }

export function Panel({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <div style={{ border: `1px solid ${C.rule}`, borderRadius: 10, background: C.card, overflow: 'hidden' }}>
      <div style={{
        padding: '9px 13px', borderBottom: `1px solid ${C.rule}`, background: C.sunk,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 10.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: C.ink3,
      }}>
        <span>{title}</span>{right}
      </div>
      <div style={{ padding: 13 }}>{children}</div>
    </div>
  )
}

export function KV({ k, v }: { k: string; v: ReactNode }) {
  if (v === null || v === undefined || v === '') return null
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 12, padding: '5px 0', borderBottom: `1px solid ${C.rule2}` }}>
      <span style={{ color: C.ink3, flexShrink: 0 }}>{k}</span>
      <span style={{ fontWeight: 620, textAlign: 'right', fontVariantNumeric: 'tabular-nums', minWidth: 0, wordBreak: 'break-word' }}>{v}</span>
    </div>
  )
}

/** The one thing worth doing, stated with the reason it matters. */
export function TheOneThing({ pick, onOpen }: { pick: any; onOpen: () => void }) {
  if (!pick) {
    return (
      <div style={{ border: `1px solid ${C.rule}`, borderLeft: `3px solid ${C.green}`, background: C.greenSub, borderRadius: 10, padding: '14px 16px' }}>
        <div style={{ fontSize: 9.5, fontWeight: 750, letterSpacing: '.13em', textTransform: 'uppercase', color: C.green, marginBottom: 5 }}>
          Nothing is waiting
        </div>
        <div style={{ fontSize: 13, color: C.ink2 }}>No overdue work and no application past a decision date.</div>
      </div>
    )
  }
  const tone = pick.severity === 'critical' ? C.red : pick.severity === 'warning' ? C.amber : C.accent
  const tint = pick.severity === 'critical' ? C.redSub : pick.severity === 'warning' ? C.amberSub : C.accentSub
  return (
    <div style={{ border: `1px solid ${C.rule}`, borderLeft: `3px solid ${tone}`, background: tint, borderRadius: 10, padding: '15px 17px' }}>
      <div style={{ fontSize: 9.5, fontWeight: 750, letterSpacing: '.13em', textTransform: 'uppercase', color: tone, marginBottom: 6 }}>
        {pick.flag}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.015em', color: C.ink, marginBottom: 6 }}>{pick.title}</div>
      {pick.why && <div style={{ fontSize: 12.5, color: C.ink2, lineHeight: 1.55, maxWidth: '68ch', marginBottom: 12 }}>{pick.why}</div>}
      <button onClick={onOpen} style={{
        fontSize: 12, fontWeight: 620, padding: '6px 13px', borderRadius: 7,
        border: `1px solid ${tone}`, background: tone, color: '#fff', cursor: 'pointer',
      }}>
        {pick.kind === 'funder' ? 'Open this path' : 'Open this task'}
      </button>
    </div>
  )
}

export function WorkGroup({ title, count, tone, children }: { title: string; count: number; tone: string; children: ReactNode }) {
  if (count === 0) return null
  return (
    <div style={{ border: `1px solid ${C.rule}`, borderRadius: 10, overflow: 'hidden', marginTop: 12 }}>
      <div style={{
        padding: '9px 14px', background: C.sunk, borderBottom: `1px solid ${C.rule}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 10.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: tone,
      }}>
        <span>{title}</span>
        <span style={{ color: C.ink3, fontVariantNumeric: 'tabular-nums' }}>{count}</span>
      </div>
      <div>{children}</div>
    </div>
  )
}

export function TaskRow({ item, onOpen }: { item: any; onOpen: () => void }) {
  const late = daysUntil(item.due_date)
  const overdue = late !== null && late < 0
  const pip = overdue ? C.red : item.owner_type === 'client' ? C.amber : C.ink3
  return (
    <div onClick={onOpen} style={{
      display: 'flex', alignItems: 'flex-start', gap: 11, padding: '10px 14px',
      borderBottom: `1px solid ${C.rule2}`, cursor: 'pointer',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: pip, flexShrink: 0, marginTop: 5 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: C.ink, fontWeight: 550 }}>{item.client_label || item.title}</div>
        {item.description && (
          <div style={{ fontSize: 11, color: C.ink3, marginTop: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {item.description}
          </div>
        )}
      </div>
      <span style={{ fontSize: 10.5, color: overdue ? C.red : C.ink3, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', flexShrink: 0, marginTop: 2 }}>
        {late === null ? 'no date' : overdue ? `${Math.abs(late)}d late` : `${late}d`}
      </span>
    </div>
  )
}

export function AgentRow({ opp }: { opp: any }) {
  const label: Record<string, string> = {
    requested: 'queued for a writer', qa_review: 'with Julie for review',
  }
  const since = daysSince(opp.narrative_status_changed_at)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px', borderBottom: `1px solid ${C.rule2}` }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.ink3, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: C.ink, fontWeight: 550 }}>{opp.name}</div>
        <div style={{ fontSize: 11, color: C.ink3, marginTop: 2 }}>
          {label[opp.narrative_status] ?? opp.narrative_status}
          {opp.assigned_agent ? `, ${opp.assigned_agent}` : ''}
        </div>
      </div>
      {since !== null && (
        <span style={{ fontSize: 10.5, color: since >= 3 ? C.amber : C.ink3, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
          {since}d
        </span>
      )}
    </div>
  )
}

/** One path, with its money and the reason it is stuck if it is. */
export function PathRow({ opp }: { opp: any }) {
  const live = isLivePath(opp)
  const stopped = opp.eligibility_verdict && opp.eligibility_verdict !== 'clear' && opp.eligibility_overridden !== true
  const withFunder = opp.client_submitted && opp.waiting_on === 'funder'
  const days = withFunder ? daysSince(opp.client_submitted_at) : null

  const pip = !live ? C.ink3 : withFunder ? C.amber : C.accent
  return (
    <div style={{ opacity: live ? 1 : .48, padding: '7px 0', borderBottom: `1px solid ${C.rule2}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: pip, flexShrink: 0 }} />
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opp.name}</span>
        <span style={{ fontSize: 11, color: C.ink3, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
          {!live ? opp.status : opp.amount ? `$${Number(opp.amount).toLocaleString()}` : ''}
        </span>
      </div>
      {days !== null && days >= 30 && (
        <div style={{ fontSize: 10.5, color: C.amber, marginLeft: 16, marginTop: 2 }}>
          no decision in {days} days
        </div>
      )}
      {stopped && (
        <div style={{
          marginLeft: 16, marginTop: 5, padding: '7px 9px', borderRadius: 6,
          background: C.redSub, borderLeft: `2px solid ${C.red}`,
        }}>
          <div style={{ fontSize: 9, fontWeight: 750, letterSpacing: '.1em', textTransform: 'uppercase', color: C.red }}>
            {opp.eligibility_verdict === 'stop' ? 'Stopped before drafting' : 'Needs a check first'}
          </div>
          <div style={{ fontSize: 11, color: C.ink2, marginTop: 2, lineHeight: 1.45 }}>{opp.eligibility_reason}</div>
        </div>
      )}
    </div>
  )
}
