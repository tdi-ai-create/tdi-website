'use client'

/**
 * The grant pipeline board.
 *
 * Six columns, one per stage a grant actually passes through, so a bottleneck
 * becomes a shape rather than something you infer by reading. The first build
 * of this was a vertical list grouped by who was blocking. That is a different
 * design, and it loses the three decisions below.
 *
 *  1. Closed work collapses to a count, it is not displayed as cards. An
 *     earlier version showed all of Allenwood's closed routes as cards, which
 *     made a school doing perfectly normal grant work look like it was
 *     failing. Denials are the job. Over a year that column would hold thirty
 *     cards and shout about nothing. Nothing is deleted and every reason is
 *     kept, it just stops competing with live work for attention.
 *
 *  2. Only "Ready for you" is coloured. That column sits on white while every
 *     other column is sunk into grey, and blocked or overdue cards are red.
 *     Boards usually fail by making everything look equally like a card, so
 *     you look at them instead of working from them. Bella should be able to
 *     find her items without reading a single card title.
 *
 *  3. The absences are the point. Nothing has ever been awarded, and grants
 *     have sat blocked on one person while nothing flowed between research and
 *     writing. A board shows that as a gap. A list hides it.
 */

import { useState } from 'react'

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

const C = {
  ink: '#1e2749',
  soft: '#525b76',
  faint: '#868ea4',
  card: '#ffffff',
  line: '#e2e6ef',
  sunk: '#f6f8fb',
  pale: '#E8F0FD',
  navy: '#1e2749',
  you: '#8a5500',
  youBg: '#fff2d4',
  youEdge: '#ffba06',
  stuck: '#9b2c3a',
  stuckBg: '#fbe9ec',
  stuckEdge: '#d9808c',
  dead: '#7a8194',
  deadBg: '#eef0f4',
}

const money = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `$${n.toLocaleString()}`

/** Short school label, so a card stays readable at column width. */
const shortName = (s: string) =>
  s
    .replace(/^\(RENEWAL\)\s*/i, '')
    .replace(/\s*[-–]\s*Grant Fund(ing|ed).*$/i, '')
    .trim()

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
  call_school: 'Call',
  complete_action: 'Open',
}

const IN_PLAY = new Set(['applied', 'waiting', 'submitted'])
const ENDED = new Set(['denied', 'closed', 'not_applicable'])

type Tone = 'quiet' | 'you' | 'stuck' | 'dead'

interface Card {
  name: string
  school: string
  amount?: number
  line?: string
  tone: Tone
  action?: string
  onAction?: () => void
}

function CardView({ c }: { c: Card }) {
  const bg =
    c.tone === 'you' ? C.youBg : c.tone === 'stuck' ? C.stuckBg : c.tone === 'dead' ? C.deadBg : C.card
  const edge = c.tone === 'you' ? C.youEdge : c.tone === 'stuck' ? C.stuckEdge : C.line
  const lineColor = c.tone === 'you' ? C.you : c.tone === 'stuck' ? C.stuck : C.soft

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${edge}`,
        borderRadius: 9,
        padding: '9px 10px',
        marginBottom: 7,
        opacity: c.tone === 'dead' ? 0.72 : 1,
      }}
    >
      {/* Titles clamp to two lines. Some task titles are a full instruction,
          not a name: one runs to sixty words explaining what to ask Gary and
          what to do with each possible answer. As a card heading that buries
          every other card in the column. The full text is on the school card
          behind the button. */}
      <div
        style={{
          fontWeight: c.tone === 'dead' ? 600 : 700,
          fontSize: 13,
          lineHeight: 1.3,
          color: c.tone === 'dead' ? C.dead : C.ink,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {c.name}
      </div>
      <div style={{ fontSize: 11.5, color: C.faint, marginTop: 2 }}>
        {c.school}
        {c.amount ? (
          <>
            {' · '}
            <span style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: C.soft }}>
              {money(c.amount)}
            </span>
          </>
        ) : null}
      </div>
      {c.line && (
        <div
          style={{
            fontSize: 12,
            color: lineColor,
            fontWeight: c.tone === 'you' || c.tone === 'stuck' ? 700 : 400,
            marginTop: 5,
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {c.line}
        </div>
      )}
      {c.action && (
        <button
          onClick={c.onAction}
          style={{
            marginTop: 7,
            fontSize: 11.5,
            fontWeight: 800,
            padding: '4px 9px',
            borderRadius: 6,
            background: c.tone === 'dead' ? 'transparent' : C.navy,
            color: c.tone === 'dead' ? C.faint : C.card,
            border: c.tone === 'dead' ? `1px solid ${C.line}` : 'none',
            cursor: 'pointer',
          }}
        >
          {c.action}
        </button>
      )}
    </div>
  )
}

function Column({
  name,
  count,
  active,
  children,
  empty,
}: {
  name: string
  count: number
  active?: boolean
  children: React.ReactNode
  empty: string
}) {
  return (
    <div
      style={{
        minWidth: '11.5rem',
        flex: '1 0 11.5rem',
        borderRight: `1px solid ${C.line}`,
        padding: '11px 9px 18px',
        background: active ? C.card : C.sunk,
      }}
    >
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 3px 9px' }}
      >
        <span
          style={{
            fontSize: 10.5,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            fontWeight: 800,
            color: active ? C.you : C.faint,
          }}
        >
          {name}
        </span>
        <span
          style={{ fontSize: 11.5, fontWeight: 800, color: C.faint, fontVariantNumeric: 'tabular-nums' }}
        >
          {count}
        </span>
      </div>
      {count === 0 ? (
        <div style={{ fontSize: 12, color: C.faint, padding: 3, fontStyle: 'italic' }}>{empty}</div>
      ) : (
        children
      )}
    </div>
  )
}

function Stat({ k, v, n, hot }: { k: string; v: string; n: string; hot?: boolean }) {
  return (
    <div style={{ flex: 1, minWidth: '8rem', padding: '12px 16px', borderRight: `1px solid ${C.line}` }}>
      <div
        style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: C.faint, fontWeight: 800 }}
      >
        {k}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-.02em',
          marginTop: 1,
          color: hot ? C.you : C.ink,
        }}
      >
        {v}
      </div>
      <div style={{ fontSize: 11.5, color: C.faint }}>{n}</div>
    </div>
  )
}

export default function NeedsYouBoard({
  schools,
  onOpenSchool,
}: {
  schools: BoardSchool[]
  onOpenSchool: (pursuitId: string) => void
}) {
  const [filter, setFilter] = useState<string>('all')
  const [showClosed, setShowClosed] = useState(false)

  const visible = filter === 'all' ? schools : schools.filter(s => s.id === filter)
  const nameOf = (id: string) => shortName(schools.find(s => s.id === id)?.name ?? '')

  const steps = visible.flatMap(s => s.nextSteps)
  const grants = visible.flatMap(s => s.grants.map(g => ({ ...g, school: shortName(s.name) })))

  const researching = grants.filter(g => g.status === 'researching')

  // Anything with a narrative under way that is not yet ours to act on.
  // Escalated shows red: that is the case that sat on one person for nine days.
  const writing = grants.filter(
    g =>
      g.status !== 'researching' &&
      !IN_PLAY.has(g.status) &&
      !ENDED.has(g.status) &&
      ['requested', 'drafting', 'qa_review', 'review', 'escalated'].includes(g.narrativeStatus || ''),
  )

  const readyForYou = steps.filter(i => i.owner === 'team' && !i.inProgress)
  const withSchool = steps.filter(i => i.owner === 'school')
  const submitted = grants.filter(g => IN_PLAY.has(g.status))
  const closed = grants.filter(g => ENDED.has(g.status))

  const awardedTotal = grants.filter(g => g.status === 'awarded').reduce((s, g) => s + (g.amount || 0), 0)
  const withFunders = submitted.reduce((s, g) => s + (g.amount || 0), 0)
  const stillToFind = Math.max(0, visible.reduce((s, sc) => s + sc.pipeline, 0) - awardedTotal)
  const schoolsNeedingYou = new Set(readyForYou.map(i => i.pursuitId)).size

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          borderBottom: `1px solid ${C.line}`,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: '-.01em', color: C.ink }}>
          Grant pipeline
        </span>
        <div style={{ display: 'flex', gap: 3, marginLeft: 'auto', flexWrap: 'wrap' }}>
          {[{ id: 'all', label: 'All schools' }, ...schools.map(s => ({ id: s.id, label: shortName(s.name) }))].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                fontSize: 12.5,
                padding: '4px 10px',
                borderRadius: 7,
                border: '1px solid transparent',
                cursor: 'pointer',
                background: filter === f.id ? C.pale : 'transparent',
                color: filter === f.id ? C.navy : C.faint,
                fontWeight: filter === f.id ? 700 : 500,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: `1px solid ${C.line}`, flexWrap: 'wrap' }}>
        <Stat
          k="Needs you"
          v={String(readyForYou.length)}
          n={`across ${schoolsNeedingYou} school${schoolsNeedingYou === 1 ? '' : 's'}`}
          hot
        />
        <Stat
          k="Still to find"
          v={money(stillToFind)}
          n={`${visible.length} school${visible.length === 1 ? '' : 's'}`}
        />
        <Stat k="Awarded" v={money(awardedTotal)} n={awardedTotal === 0 ? 'nothing yet' : 'received'} />
        <Stat k="With funders" v={money(withFunders)} n={`${submitted.length} submitted`} />
      </div>

      <div style={{ display: 'flex', overflowX: 'auto', background: C.sunk }}>
        <Column name="Researching" count={researching.length} empty="nothing in research">
          {researching.map(g => (
            <CardView
              key={g.id}
              c={{ name: g.name, school: g.school, tone: 'quiet', line: 'Agent checking eligibility and dates.' }}
            />
          ))}
        </Column>

        <Column name="Writing" count={writing.length} empty="nothing being written">
          {writing.map(g => (
            <CardView
              key={g.id}
              c={{
                name: g.name,
                school: g.school,
                amount: g.amount,
                tone: g.narrativeStatus === 'escalated' ? 'stuck' : 'quiet',
                line:
                  g.narrativeStatus === 'escalated'
                    ? 'Blocked. QA could not get this through.'
                    : g.narrativeStatus === 'qa_review' || g.narrativeStatus === 'review'
                      ? 'With Julie for QA.'
                      : 'Being drafted.',
              }}
            />
          ))}
        </Column>

        <Column name="Ready for you" count={readyForYou.length} active empty="nothing waiting on you">
          {readyForYou.map(i => (
            <CardView
              key={i.id}
              c={{
                name: i.label,
                school: nameOf(i.pursuitId),
                tone: i.urgency === 'critical' ? 'stuck' : 'you',
                line: i.why,
                action: VERBS[i.actionType] ?? 'Open',
                onAction: () => onOpenSchool(i.pursuitId),
              }}
            />
          ))}
        </Column>

        <Column name="With the school" count={withSchool.length} empty="nothing with a school">
          {withSchool.map(i => (
            <CardView
              key={i.id}
              c={{
                name: i.label,
                school: nameOf(i.pursuitId),
                tone: 'stuck',
                line: i.why,
                action: 'Chase',
                onAction: () => onOpenSchool(i.pursuitId),
              }}
            />
          ))}
        </Column>

        <Column name="Submitted" count={submitted.length} empty="nothing with a funder">
          {submitted.map(g => (
            <CardView
              key={g.id}
              c={{
                name: g.name,
                school: g.school,
                amount: g.amount,
                tone: 'quiet',
                line: 'With the funder. The school tells us when they hear.',
              }}
            />
          ))}
        </Column>

        <Column name="Closed" count={closed.length} empty="nothing closed">
          {!showClosed ? (
            <CardView
              c={{
                name: `${closed.length} route${closed.length === 1 ? '' : 's'} closed`,
                school: `${closed.filter(g => g.status === 'denied').length} denied`,
                tone: 'dead',
                line: 'Normal. Each keeps its reason and can be reopened.',
                action: 'See them',
                onAction: () => setShowClosed(true),
              }}
            />
          ) : (
            <>
              {closed.map(g => (
                <CardView
                  key={g.id}
                  c={{
                    name: g.name,
                    school: g.school,
                    amount: g.amount,
                    tone: 'dead',
                    line: g.status === 'denied' ? 'Denied.' : 'Closed.',
                  }}
                />
              ))}
              <button
                onClick={() => setShowClosed(false)}
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: C.faint,
                  background: 'transparent',
                  border: `1px solid ${C.line}`,
                  borderRadius: 6,
                  padding: '4px 9px',
                  cursor: 'pointer',
                }}
              >
                Collapse
              </button>
            </>
          )}
        </Column>
      </div>
    </div>
  )
}
