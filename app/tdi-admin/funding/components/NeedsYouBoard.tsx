'use client'

/**
 * The grant board, arranged by who is blocking rather than by school.
 *
 * The portal has always grouped by school, which means the first question a
 * person asks, "what is mine to do today", can only be answered by opening
 * every school in turn and working it out. This inverts that: the three or
 * four things only Bella can move sit at the top, and everything else is
 * below them.
 *
 * Four rules this layout exists to enforce, each one traceable to something
 * that actually went wrong:
 *
 *  1. Sorted by who is blocking. Not by school, not by amount.
 *  2. Nothing is hidden. There is no collapsed "done" section. Title II-A
 *     vanished into one for nine days because the system treated "emailed to
 *     the school" as finished.
 *  3. Every row says why in a sentence. Not a status word. "Needs Gary to
 *     name a teacher who is a current NEA member" tells you what to do;
 *     "escalated" does not.
 *  4. Money is the first thing on screen, including the awarded figure while
 *     it still reads zero. That number is the one that says whether any of
 *     this is working.
 *
 * The action button carries the verb of the real next step and opens the
 * school card where that step is completed. It deliberately does not perform
 * sends itself: those live in one place, on the grant row, and duplicating
 * them here would mean two code paths that can email a school.
 */

import type { CSSProperties } from 'react'

// ── Types mirrored from the page, kept local so the board has one input ──

interface BoardQueueItem {
  id: string
  label: string
  why: string
  owner: 'team' | 'agent' | 'school' | 'auto'
  urgency: 'critical' | 'high' | 'normal' | 'low'
  actionType: string
  inProgress?: boolean
  pursuitId: string
}

interface BoardGrant {
  name: string
  id: string
  amount: number
  status: string
  narrativeStatus: string
  forwardingStatus: string | null
}

export interface BoardSchool {
  id: string
  name: string
  contact: string
  pipeline: number
  nextSteps: BoardQueueItem[]
  grants: BoardGrant[]
}

// ── Palette. Each lane owns a hue so the eye can sort before it reads. ──

const C = {
  ink: '#1e2749',
  soft: '#4e5773',
  faint: '#7b8399',
  card: '#ffffff',
  line: '#e3e7ef',
  waitUs: '#8a5a00',
  waitUsBg: '#fff3d6',
  waitThem: '#4a5aa8',
  waitThemBg: '#e9ecfb',
  moving: '#1f6b52',
  movingBg: '#e3f3ec',
  stopped: '#6d7385',
  stoppedBg: '#eceef3',
  alert: '#9b2c3a',
  alertBg: '#fbe9ec',
}

/** Statuses that mean the application is with a funder and out of our hands. */
const IN_PLAY = new Set(['applied', 'waiting', 'submitted'])
/** Statuses that mean this path has ended. Kept visible, never deleted. */
const ENDED = new Set(['denied', 'closed', 'not_applicable'])

const money = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `$${n.toLocaleString()}`

/**
 * The verb for a row's button, taken from the step the engine actually
 * computed. Every row saying "Open" throws away the one piece of information
 * that makes a board scannable: what the next move is. The button still opens
 * the school card, because that is where the move is completed and sends must
 * live in exactly one place.
 */
const VERBS: Record<string, string> = {
  send_nudge: 'Nudge',
  send_to_client: 'Review and send',
  send_to_qa: 'Send to Julie',
  resolve_escalation: 'Decide',
  request_draft: 'Request draft',
  approve_draft: 'Approve',
  request_research: 'Request research',
  verify_window: 'Verify window',
  verify_contact: 'Check contact',
  prepare_submission: 'Prepare',
  complete_profile: 'Complete profile',
  complete_gate: 'Open gate',
  allocate_award: 'Record award',
  unblock_qa: 'Unblock',
  unblock_draft: 'Unblock',
  resume_drafting: 'Resume',
  setup_pursuit: 'Send intro',
  complete_action: 'Open',
}
const verbFor = (actionType: string) => VERBS[actionType] ?? 'Open'

// ── Row ──

function Row({
  stripe,
  pillBg,
  pillColor,
  name,
  pill,
  amount,
  why,
  action,
  onAction,
}: {
  stripe: string
  pillBg: string
  pillColor: string
  name: string
  pill: string
  amount?: number
  why: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
        padding: '11px 0',
        borderBottom: `1px solid ${C.line}`,
      }}
    >
      <div style={{ width: 3, borderRadius: 2, alignSelf: 'stretch', flexShrink: 0, background: stripe }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: C.ink }}>{name}</span>
          {amount ? (
            <span style={{ fontSize: 13, color: C.faint, fontVariantNumeric: 'tabular-nums' }}>
              {money(amount)}
            </span>
          ) : null}
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '.07em',
              textTransform: 'uppercase',
              padding: '3px 8px',
              borderRadius: 999,
              whiteSpace: 'nowrap',
              background: pillBg,
              color: pillColor,
            }}
          >
            {pill}
          </span>
        </div>
        {/* Clamped to three lines. One escalation note runs to a full
            paragraph and pushed every other row off the screen, which defeats
            the point of a board you can scan. The full text is on the school
            card behind Open. */}
        <div
          style={{
            fontSize: 13.5,
            color: C.soft,
            marginTop: 3,
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {why}
        </div>
      </div>
      {action && (
        <button
          onClick={onAction}
          style={{
            flexShrink: 0,
            fontSize: 12.5,
            fontWeight: 700,
            padding: '7px 13px',
            borderRadius: 7,
            background: C.ink,
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            alignSelf: 'center',
          }}
        >
          {action}
        </button>
      )}
    </div>
  )
}

function Section({
  title,
  count,
  empty,
  children,
}: {
  title: string
  count: number
  empty: string
  children: React.ReactNode
}) {
  return (
    <div style={{ padding: '16px 18px', borderTop: `1px solid ${C.line}` }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <h3
          style={{
            fontSize: 11,
            letterSpacing: '.11em',
            textTransform: 'uppercase',
            color: C.faint,
            margin: 0,
            fontWeight: 800,
          }}
        >
          {title}
        </h3>
        <span style={{ fontSize: 11.5, color: C.faint, fontVariantNumeric: 'tabular-nums' }}>{count}</span>
      </div>
      {count === 0 ? (
        <div style={{ fontSize: 13.5, color: C.faint, padding: '6px 0' }}>{empty}</div>
      ) : (
        children
      )}
    </div>
  )
}

function Metric({ label, value, sub, alarming }: { label: string; value: string; sub: string; alarming?: boolean }) {
  const cell: CSSProperties = {
    flex: 1,
    minWidth: 140,
    padding: '14px 18px',
    borderRight: `1px solid ${C.line}`,
  }
  return (
    <div style={cell}>
      <div
        style={{
          fontSize: 10.5,
          letterSpacing: '.09em',
          textTransform: 'uppercase',
          color: C.faint,
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 800,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-.02em',
          marginTop: 2,
          color: alarming ? C.alert : C.ink,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: C.faint, marginTop: 1 }}>{sub}</div>
    </div>
  )
}

// ── Board ──

export default function NeedsYouBoard({
  schools,
  onOpenSchool,
}: {
  schools: BoardSchool[]
  onOpenSchool: (pursuitId: string) => void
}) {
  const nameOf = (pursuitId: string) => schools.find(s => s.id === pursuitId)?.name ?? ''

  const steps = schools.flatMap(s => s.nextSteps)

  // Only the "waiting on you" lane filters out in-progress work. Everywhere
  // else, inProgress means "in flight, nothing for you to do right now",
  // which is the definition of the other three lanes rather than a reason to
  // hide the row.
  //
  // Filtering it everywhere made "waiting on the school" structurally empty:
  // the engine marks a client task inProgress the moment it is nudged, so
  // chasing a school caused the item to disappear from the board. Both of
  // Gary's outstanding questions at Saunemin were invisible for that reason,
  // and they are what two grants are blocked on. That is the same shape as
  // Title II-A vanishing for nine days once it was emailed.
  const waitingOnUs = steps.filter(i => i.owner === 'team' && !i.inProgress)
  const waitingOnSchool = steps.filter(i => i.owner === 'school')
  const movingAlone = steps.filter(i => i.owner === 'agent' || i.owner === 'auto')

  const allGrants = schools.flatMap(s => s.grants.map(g => ({ ...g, school: s.name, pursuitId: s.id })))
  const inPlay = allGrants.filter(g => IN_PLAY.has(g.status))
  const ended = allGrants.filter(g => ENDED.has(g.status))
  const awardedTotal = allGrants
    .filter(g => g.status === 'awarded')
    .reduce((sum, g) => sum + (g.amount || 0), 0)
  const inPlayTotal = inPlay.reduce((sum, g) => sum + (g.amount || 0), 0)
  const stillNeeded = Math.max(0, schools.reduce((sum, s) => sum + s.pipeline, 0) - awardedTotal)

  return (
    <div>
      {/* Money first, including the awarded figure while it still reads zero. */}
      <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: `1px solid ${C.line}` }}>
        <Metric
          label="Still needed"
          value={money(stillNeeded)}
          sub={`across ${schools.length} school${schools.length === 1 ? '' : 's'}`}
        />
        <Metric
          label="Awarded"
          value={money(awardedTotal)}
          sub={awardedTotal === 0 ? 'nothing yet' : 'received'}
          alarming={awardedTotal === 0}
        />
        <Metric
          label="In play"
          value={money(inPlayTotal)}
          sub={`${inPlay.length} with funders`}
        />
        <Metric label="Needs you" value={String(waitingOnUs.length)} sub="today" />
      </div>

      <Section
        title="Waiting on you"
        count={waitingOnUs.length}
        empty="Nothing is waiting on you. That is genuinely all of it, not a filtered view."
      >
        {waitingOnUs.map(i => (
          <Row
            key={i.id}
            stripe={i.urgency === 'critical' ? C.alert : C.waitUs}
            pillBg={i.urgency === 'critical' ? C.alertBg : C.waitUsBg}
            pillColor={i.urgency === 'critical' ? C.alert : C.waitUs}
            name={i.label}
            pill={i.urgency === 'critical' ? 'Needs you now' : 'Waiting on you'}
            why={`${nameOf(i.pursuitId)}. ${i.why}`}
            action={verbFor(i.actionType)}
            onAction={() => onOpenSchool(i.pursuitId)}
          />
        ))}
      </Section>

      <Section
        title="Waiting on the school"
        count={waitingOnSchool.length}
        empty="Nothing is sitting with a school right now."
      >
        {waitingOnSchool.map(i => (
          <Row
            key={i.id}
            stripe={C.waitThem}
            pillBg={C.waitThemBg}
            pillColor={C.waitThem}
            name={i.label}
            pill="Asked, not answered"
            why={`${nameOf(i.pursuitId)}. ${i.why}`}
            action="Nudge"
            onAction={() => onOpenSchool(i.pursuitId)}
          />
        ))}
      </Section>

      <Section
        title="Moving without you"
        count={movingAlone.length + inPlay.length}
        empty="Nothing is in motion on its own."
      >
        {inPlay.map(g => (
          <Row
            key={`g-${g.id}`}
            stripe={C.moving}
            pillBg={C.movingBg}
            pillColor={C.moving}
            name={g.name}
            amount={g.amount}
            pill="With the funder"
            why={`${g.school}. Submitted and awaiting a decision. The school tells us when they hear.`}
          />
        ))}
        {movingAlone.map(i => (
          <Row
            key={i.id}
            stripe={C.moving}
            pillBg={C.movingBg}
            pillColor={C.moving}
            name={i.label}
            pill="With an agent"
            why={`${nameOf(i.pursuitId)}. ${i.why}`}
          />
        ))}
      </Section>

      <Section
        title="Stopped"
        count={ended.length}
        empty="Nothing has been stopped or denied."
      >
        {ended.map(g => (
          <Row
            key={`e-${g.id}`}
            stripe={C.stopped}
            pillBg={C.stoppedBg}
            pillColor={C.stopped}
            name={g.name}
            amount={g.amount}
            pill={g.status === 'denied' ? 'Denied' : 'Closed'}
            why={`${g.school}. Kept with its reason so it can be reopened if circumstances change.`}
          />
        ))}
      </Section>
    </div>
  )
}
