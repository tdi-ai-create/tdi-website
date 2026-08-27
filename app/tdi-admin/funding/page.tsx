'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DraftEmailModal, introEmailDraft, gateBlockerEmailDraft } from './components/panel/DraftEmailModal'
import { ImpactEvidence } from './components/ImpactEvidence'
import NeedsYouBoard from './components/NeedsYouBoard'
import FundersTab from './components/FundersTab'
import AwardedTab from './components/AwardedTab'

/**
 * One next-step item, exactly as computed by lib/funding-next-actions.ts and
 * served by /api/funding/queue. This page does NOT compute its own — that is
 * how it used to end up telling Bella to approve things it had no button for.
 */
interface QueueItem {
  id: string
  label: string
  why: string
  owner: 'team' | 'agent' | 'school' | 'auto'
  urgency: 'critical' | 'high' | 'normal' | 'low'
  actionType: string
  targetId?: string | null
  inProgress?: boolean
  pursuitId: string
}

interface SchoolData {
  id: string
  name: string
  contact: string
  email: string
  pipeline: number
  introSent: boolean
  nextSteps: QueueItem[]
  grants: {
    name: string
    id: string
    amount: number
    status: string
    windowOpen: boolean
    windowOpens: string | null
    windowCloses: string | null
    hasDraft: boolean
    narrativeStatus: string
    narrativeUrl: string | null
    qaPassed: boolean | null
    forwardingStatus: string | null
  }[]
  actions: {
    id: string
    title: string
    clientLabel: string | null
    description: string | null
    dueDate: string | null
    ownerName: string | null
    ownerType: string
    category: string | null
  }[]
}

export default function FundingPage() {
  const [schools, setSchools] = useState<SchoolData[]>([])
  // Replaces the Work Queue page. Its only real contribution was letting a
  // person ask "what is waiting on us" without reading every school, and that
  // is a filter, not a destination.
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'team' | 'agent' | 'school'>('all')
  // Which lens the portal opens on. The board answers "what is mine today"
  // without opening a single school, which is the question the school-grouped
  // view could never answer directly.
  const [view, setView] = useState<'board' | 'schools' | 'funders' | 'awarded'>('board')
  const [highlight, setHighlight] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [draftEmail, setDraftEmail] = useState<any & { opportunityId?: string; windowOpens?: string; windowCloses?: string } | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/funding/dashboard').then(r => r.json()),
      fetch('/api/funding/queue').then(r => r.json()).catch(() => ({ items: [] })),
    ])
      .then(([d, q]) => {
        const pursuits = (d.pursuits || []).filter((p: any) => !p.archived)

        // Group the engine's next-step items by pursuit. Already sorted
        // critical → high → normal → low by the queue API.
        const stepsByPursuit = new Map<string, QueueItem[]>()
        for (const item of (q.items || []) as QueueItem[]) {
          const list = stepsByPursuit.get(item.pursuitId) ?? []
          list.push(item)
          stepsByPursuit.set(item.pursuitId, list)
        }

        // Fetch opportunities for each pursuit
        Promise.all(pursuits.map((p: any) =>
          Promise.all([
            fetch(`/api/funding/opportunities?pursuitId=${p.id}`).then(r => r.json()),
            fetch(`/api/funding/pursuits/${p.id}/actions`).then(r => r.json()).catch(() => []),
          ]).then(([od, actionsData]) => {
            const actions = (Array.isArray(actionsData) ? actionsData : actionsData.actions || [])
              .filter((a: any) => a.status === 'pending')
            return {
              id: p.id,
              name: p.pursuit_name || p.district_name,
              contact: p.client_contact_name || 'No contact',
              email: p.client_contact_email || '',
              pipeline: p.total_amount || 0,
              introSent: !!p.intro_sent_at,
              nextSteps: stepsByPursuit.get(p.id) ?? [],
              grants: (od.opportunities || []).map((o: any) => ({
                name: o.name,
                id: o.id,
                amount: o.amount || 0,
                status: o.status,
                windowOpen: o.window_status === 'open',
                windowOpens: o.application_opens,
                windowCloses: o.application_closes,
                hasDraft: !!o.narrative_content,
                narrativeStatus: o.narrative_status,
                narrativeUrl: o.narrative_url,
                qaPassed: o.qa_passed ?? null,
                forwardingStatus: o.forwarding_email_status,
              })),
              actions: actions.map((a: any) => ({
                id: a.id,
                title: a.title,
                clientLabel: a.client_label ?? null,
                description: a.description,
                dueDate: a.due_date,
                ownerName: a.owner_name,
                ownerType: a.owner_type,
                category: a.category,
              })),
            }})
        )).then(data => {
          // Sort by whether anything actually needs a person, then pipeline value
          data.sort((a: SchoolData, b: SchoolData) => {
            const aOpen = a.nextSteps.filter(s => !s.inProgress).length
            const bOpen = b.nextSteps.filter(s => !s.inProgress).length
            if (aOpen > 0 && bOpen === 0) return -1
            if (bOpen > 0 && aOpen === 0) return 1
            return b.pipeline - a.pipeline
          })
          setSchools(data)
          setLoading(false)
        })
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '32px 48px', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ color: '#9CA3AF', fontSize: 14 }}>Loading...</div>
      </div>
    )
  }

  const totalPipeline = schools.reduce((s, sc) => s + sc.pipeline, 0)
  const totalGrants = schools.reduce((s, sc) => s + sc.grants.length, 0)
  const needsYou = schools.reduce((s, sc) => s + sc.nextSteps.filter(i => !i.inProgress && i.owner === 'team').length, 0)

  const openFor = (sc: SchoolData, owner: 'team' | 'agent' | 'school') =>
    sc.nextSteps.filter(i => !i.inProgress && i.owner === owner).length

  const ownerCounts = {
    all: schools.length,
    team: schools.filter(sc => openFor(sc, 'team') > 0).length,
    agent: schools.filter(sc => openFor(sc, 'agent') > 0).length,
    school: schools.filter(sc => openFor(sc, 'school') > 0).length,
  }

  const visibleSchools = ownerFilter === 'all'
    ? schools
    : schools.filter(sc => openFor(sc, ownerFilter) > 0)

  return (
    <div style={{ padding: '32px 48px', fontFamily: "'DM Sans', sans-serif", maxWidth: 1000 }}>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      {draftEmail && (
        <DraftEmailModal {...draftEmail} onClose={() => setDraftEmail(null)} onSent={async () => {
          // If this was a grant send, mark opportunity as sent and create milestones
          if (draftEmail.opportunityId) {
            await fetch('/api/funding/send-to-client', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                opportunityId: draftEmail.opportunityId,
                pursuitId: draftEmail.pursuitId,
                contactName: draftEmail.toName,
                contactEmail: draftEmail.to,
                windowOpens: draftEmail.windowOpens,
                windowCloses: draftEmail.windowCloses,
              }),
            }).catch(() => {})
          }
          setDraftEmail(null)
          setToast('Application sent. Follow-up milestones created.')
          // Refresh after short delay
          setTimeout(() => window.location.reload(), 1500)
        }} />
      )}

      {/* One card, with the tabs living in its topbar. The page had a title
          and a stats line above this that repeated the money strip word for
          word, so both are gone: the strip is the header. */}
      <div style={{
        background: '#fff', border: '1px solid #e3e7ef', borderRadius: 14,
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(30,39,73,.06)',
      }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '12px 18px',
        borderBottom: '1px solid #e3e7ef', flexWrap: 'wrap',
      }}>
        <span style={{ fontWeight: 800, fontSize: 15, color: '#1e2749', letterSpacing: '-.01em' }}>Grants</span>
        <div style={{ display: 'flex', gap: 2, marginLeft: 'auto', flexWrap: 'wrap' }}>
          {([
            { key: 'board' as const, label: 'Needs you' },
            { key: 'schools' as const, label: 'Schools' },
            { key: 'funders' as const, label: 'Funders' },
            { key: 'awarded' as const, label: 'Awarded' },
          ]).map(t => (
            <button
              key={t.key}
              onClick={() => setView(t.key)}
              style={{
                fontSize: 13, padding: '6px 12px', borderRadius: 7, border: 'none',
                cursor: 'pointer',
                background: view === t.key ? '#E8F0FD' : 'transparent',
                color: view === t.key ? '#1e2749' : '#7b8399',
                fontWeight: view === t.key ? 700 : 500,
              }}
            >
              {t.label}{t.key === 'board' && needsYou > 0 ? ` ${needsYou}` : ''}
            </button>
          ))}
        </div>
      </div>

      {view === 'board' && (
        <NeedsYouBoard
          schools={schools}
          onOpenSchool={id => {
            setView('schools')
            setOwnerFilter('all')
            setHighlight(id)
            setTimeout(() => {
              document.getElementById(`school-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 60)
          }}
        />
      )}

      {view === 'funders' && <FundersTab />}

      {view === 'awarded' && (
        <AwardedTab
          grants={schools.flatMap(sc => sc.grants.map(g => ({
            id: g.id, name: g.name, amount: g.amount, status: g.status, school: sc.name,
          })))}
        />
      )}

      </div>

      {view === 'schools' && (
        <>
      {/* Who the next move belongs to. This is the Work Queue, as a filter. */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {([
          { key: 'all' as const,    label: 'All schools' },
          { key: 'team' as const,   label: 'Waiting on us' },
          { key: 'agent' as const,  label: 'With agents' },
          { key: 'school' as const, label: 'Waiting on the school' },
        ]).map(f => (
          <button
            key={f.key}
            onClick={() => setOwnerFilter(f.key)}
            style={{
              fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 999,
              border: `1px solid ${ownerFilter === f.key ? '#1e2749' : '#E5E7EB'}`,
              background: ownerFilter === f.key ? '#1e2749' : 'white',
              color: ownerFilter === f.key ? 'white' : '#374151',
              cursor: 'pointer',
            }}
          >
            {f.label} {ownerCounts[f.key]}
          </button>
        ))}
      </div>
        </>
      )}

      {/* School cards */}
      {view === 'schools' && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {visibleSchools.map(school => (
          <div
            key={school.id}
            id={`school-${school.id}`}
            style={{
              // Arriving here from the board, the row you clicked should be
              // obvious without you having to hunt for it.
              outline: highlight === school.id ? '2px solid #ffba06' : 'none',
              outlineOffset: 4,
              borderRadius: 12,
              transition: 'outline-color .3s',
            }}
          >
          <SchoolCard
            school={school}
            onDraftEmail={(to, toName, subject, body, schoolName, pursuitId, extra) => {
              setDraftEmail({ to, toName, subject, body, schoolName, pursuitId, ...extra })
            }}
            onToast={setToast}
          />
          </div>
        ))}

        {visibleSchools.length === 0 && (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: '#6B7280', fontSize: 14, background: 'white', borderRadius: 12, border: '1px solid #E5E7EB' }}>
            Nothing is in that state right now.
          </div>
        )}
      </div>
      )}

      {/* Reference material, from the Portfolio page that used to hold it.
          Collapsed by default: it is something you reach for while writing an
          application, not something you read on the way past. */}
      <div style={{ marginTop: 28 }}>
        <ImpactEvidence />
      </div>
    </div>
  )
}

function SchoolCard({ school, onDraftEmail, onToast }: {
  school: SchoolData
  onDraftEmail: (to: string, toName: string, subject: string, body: string, schoolName: string, pursuitId: string, extra?: any) => void
  onToast: (msg: string) => void
}) {
  const [showCompleted, setShowCompleted] = useState(false)
  // A grant is finished when it has actually been submitted or decided. It was
  // previously counted as complete the moment the forwarding email was sent,
  // which meant emailing a school closed the grant on screen while its real
  // status stayed not_started. Title II-A for Saunemin sat in this collapsed
  // section for nine days: written, QA passed, forwarded, never submitted.
  //
  // Emailing someone is not an outcome. Only these are.
  const FINISHED = new Set(['applied', 'submitted', 'awarded', 'closed'])
  const completedGrants = school.grants.filter(g => g.status !== 'denied' && FINISHED.has(g.status))
  const activeGrants = school.grants.filter(g => g.status !== 'denied' && !FINISHED.has(g.status))
  const deniedGrants = school.grants.filter(g => g.status === 'denied')

  // The next step comes from the shared engine, never from logic local to this
  // page. Prefer the top item a person can act on; fall back to the top
  // in-progress item so a waiting pursuit still says what it is waiting for.
  const nextStep = school.nextSteps.find(i => !i.inProgress) ?? school.nextSteps[0] ?? null
  const isWaiting = !!nextStep?.inProgress
  const isIntro = nextStep?.actionType === 'setup_pursuit'
  const isBlocked = nextStep?.actionType === 'unblock_draft'

  // What the school still owes us, in the words they will actually read.
  // Maintained by lib/funding-gate-sync.ts, so this stays in step automatically.
  const gateGapLabels = school.actions
    .filter(a => a.category === 'gate' && a.ownerType === 'client')
    .map(a => a.clientLabel || a.title)

  const bannerBg = isBlocked ? '#FEF2F2' : isWaiting ? '#F0FDF4' : isIntro ? '#EFF6FF' : '#F5F3FF'
  const bannerFg = isBlocked ? '#B91C1C' : isWaiting ? '#1e2749' : isIntro ? '#1e2749' : '#6D28D9'
  const needsAttention = !!nextStep && !isWaiting

  return (
    <div style={{
      background: 'white', border: '1px solid #E5E7EB', borderRadius: 14,
      borderLeft: isBlocked ? '4px solid #DC2626' : needsAttention ? '4px solid #8B5CF6' : '4px solid #E5E7EB',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '18px 22px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Link href={`/tdi-admin/funding/${school.id}`} style={{ fontSize: 18, fontWeight: 700, color: '#1e2749', textDecoration: 'none' }}>
              {school.name.replace(/ - Grant Funding$/, '').replace(/ - Grant Funded Funding$/, '')}
            </Link>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
              {school.contact} {school.email && <span style={{ color: '#9CA3AF' }}>({school.email})</span>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1e2749' }}>
              ${school.pipeline.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>pipeline</div>
          </div>
        </div>
      </div>

      {/* Next action banner — label, reason, and a control that always works */}
      {nextStep && (
        <div style={{
          padding: '12px 22px',
          background: bannerBg,
          borderBottom: '1px solid #F3F4F6',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
              {isBlocked ? 'Blocked' : isWaiting ? 'Waiting' : 'Next Step'}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: bannerFg }}>
              {nextStep.label}
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3, lineHeight: 1.45 }}>
              {nextStep.why}
            </div>
          </div>

          {/* Blocked on the school: offer the email that names exactly what we need */}
          {isBlocked && school.email && gateGapLabels.length > 0 ? (
            <button
              onClick={() => {
                const draft = gateBlockerEmailDraft(
                  school.contact,
                  school.name.replace(/ - Grant Funding$/, '').replace(/ - Grant Funded Funding$/, ''),
                  gateGapLabels,
                )
                onDraftEmail(school.email, school.contact, draft.subject, draft.body, school.name, school.id)
              }}
              style={{
                fontSize: 12, fontWeight: 700, padding: '8px 16px', borderRadius: 8,
                border: 'none', background: '#DC2626', color: 'white', cursor: 'pointer', flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              Email {school.contact.split(' ')[0]}
            </button>
          ) : isIntro && school.email ? (
            <button
              onClick={() => {
                const draft = introEmailDraft(school.contact, school.name.replace(/ - Grant Funding$/, ''))
                onDraftEmail(school.email, school.contact, draft.subject, draft.body, school.name, school.id)
              }}
              style={{
                fontSize: 12, fontWeight: 700, padding: '8px 16px', borderRadius: 8,
                border: 'none', background: '#3B82F6', color: 'white', cursor: 'pointer', flexShrink: 0,
              }}
            >
              Draft Email
            </button>
          ) : !isWaiting ? (
            <Link
              href={`/tdi-admin/funding/${school.id}`}
              style={{
                fontSize: 12, fontWeight: 700, padding: '8px 16px', borderRadius: 8,
                border: 'none', background: isBlocked ? '#DC2626' : '#8B5CF6', color: 'white',
                textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap',
              }}
            >
              {isBlocked ? 'Fix This' : 'Open School'}
            </Link>
          ) : null}
        </div>
      )}

      {/* Grant list with inline actions */}
      <div style={{ padding: '12px 22px' }}>
        {activeGrants.map(grant => (
          <GrantRow
            key={grant.id}
            grant={grant}
            school={school}
            onDraftEmail={onDraftEmail}
            onToast={onToast}
            onRefresh={() => window.location.reload()}
          />
        ))}
        {completedGrants.length > 0 && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #F3F4F6' }}>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              style={{
                fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <span style={{ transform: showCompleted ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s', display: 'inline-block', fontSize: 10 }}>&#9654;</span>
              Completed ({completedGrants.length})
            </button>
            {showCompleted && (
              <div style={{ marginTop: 8 }}>
                {completedGrants.map(grant => (
                  <GrantRow
                    key={grant.id}
                    grant={grant}
                    school={school}
                    onDraftEmail={onDraftEmail}
                    onToast={onToast}
                    onRefresh={() => window.location.reload()}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        {deniedGrants.length > 0 && (
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>
            {deniedGrants.length} denied grant{deniedGrants.length > 1 ? 's' : ''} (not shown)
          </div>
        )}

        {/* Pending action items for this school - separated by owner */}
        {school.actions.length > 0 && (() => {
          const bellaActions = school.actions.filter(a => a.ownerType === 'tdi' && ['submission', 'follow_up', 'approval'].includes(a.category || ''))
          const clientActions = school.actions.filter(a => a.ownerType === 'client')
          const agentActions = school.actions.filter(a => a.ownerType === 'tdi' && !['submission', 'follow_up', 'approval'].includes(a.category || ''))
          const myActions = [...bellaActions, ...clientActions]

          const ownerBadge = (ownerType: string, category?: string) => {
            if (ownerType === 'client') return { bg: '#FEF3C7', color: '#92400E', label: 'School' }
            if (['research', 'writing'].includes(category || '')) return { bg: '#DBEAFE', color: '#1E40AF', label: 'Agent' }
            return { bg: '#F5F3FF', color: '#6D28D9', label: 'You' }
          }

          return (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #F3F4F6' }}>
              {myActions.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                    Ready for You ({myActions.length})
                  </div>
                  {myActions.slice(0, 5).map(action => {
                    const daysUntil = action.dueDate ? Math.ceil((new Date(action.dueDate + 'T00:00:00').getTime() - Date.now()) / 86400000) : null
                    const badge = ownerBadge(action.ownerType, action.category || undefined)
                    return (
                      <div key={action.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '6px 0', borderBottom: '1px solid #FAFAFA',
                      }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#1e2749' }}>{action.title}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          {daysUntil !== null && (
                            <span style={{
                              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                              background: daysUntil <= 3 ? '#FEF2F2' : '#F3F4F6',
                              color: daysUntil <= 3 ? '#DC2626' : '#6B7280',
                            }}>
                              {daysUntil <= 0 ? 'Overdue' : `${daysUntil}d`}
                            </span>
                          )}
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                            background: badge.bg, color: badge.color,
                          }}>
                            {badge.label}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
              {agentActions.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: myActions.length > 0 ? 12 : 0 }}>
                    Agent Pipeline ({agentActions.length})
                  </div>
                  {agentActions.slice(0, 3).map(action => (
                    <div key={action.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '4px 0', borderBottom: '1px solid #FAFAFA', opacity: 0.6,
                    }}>
                      <span style={{ fontSize: 12, color: '#6B7280' }}>{action.title}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: '#DBEAFE', color: '#1E40AF' }}>Agent</span>
                    </div>
                  ))}
                </>
              )}
              {school.actions.length > 8 && (
                <Link href={`/tdi-admin/funding/${school.id}`} style={{ fontSize: 11, color: '#8B5CF6', textDecoration: 'none', marginTop: 4, display: 'block' }}>
                  +{school.actions.length - 8} more
                </Link>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}

function GrantRow({ grant, school, onDraftEmail, onToast, onRefresh }: {
  grant: SchoolData['grants'][0]
  school: SchoolData
  onDraftEmail: (to: string, toName: string, subject: string, body: string, schoolName: string, pursuitId: string, extra?: any) => void
  onToast: (msg: string) => void
  onRefresh: () => void
}) {
  const [approving, setApproving] = useState(false)
  const [approved, setApproved] = useState(grant.narrativeStatus === 'ready')
  const [sent, setSent] = useState(grant.forwardingStatus === 'sent')

  const handleApprove = async () => {
    setApproving(true)
    await fetch('/api/funding/opportunities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: grant.id, narrative_status: 'ready' }),
    })
    setApproved(true)
    setApproving(false)
    onToast('Narrative approved')
  }

  const handleSendToClient = () => {
    const firstName = school.contact.split(' ')[0]
    const schoolName = school.name.replace(/ - Grant Funding$/, '').replace(/ - Grant Funded Funding$/, '')
    const docLink = grant.narrativeUrl || ''

    // Calculate dates
    const windowOpens = grant.windowOpens ? new Date(grant.windowOpens + 'T00:00:00') : null
    const windowCloses = grant.windowCloses ? new Date(grant.windowCloses + 'T00:00:00') : null
    const deedDeadline = windowOpens ? new Date(windowOpens.getTime() - 14 * 86400000) : null // 2 weeks before
    const deedDeadlineStr = deedDeadline ? deedDeadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'as soon as possible'
    const windowOpensStr = windowOpens ? windowOpens.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'soon'
    const windowClosesStr = windowCloses ? windowCloses.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : ''

    // Pass extra tracking fields for post-send processing
    onDraftEmail(
      school.email,
      school.contact,
      `Your ${grant.name} application is ready. Here is your timeline.`,
      `Hi ${firstName},\n\nYour ${grant.name} grant application for ${schoolName} is complete. We wrote everything for you. You will copy, paste, and submit. Nothing to write from scratch.\n\nHere is your application package:\n${docLink}\n\nHere is your timeline:\n\nTHIS WEEK: Set up your Deed account (Step 1 in the document). This takes about 5 minutes but verification takes 1 to 2 weeks, so please do this now. Your deadline to have Deed set up is ${deedDeadlineStr}.\n\n${windowOpensStr.toUpperCase()}: The application window opens. We will email you a reminder that day with a link to your application package so you can submit. Submitting takes about 15 minutes.\n\n${windowClosesStr ? windowClosesStr.toUpperCase() + ': The window closes. We need to submit before this date.\n\n' : ''}You do not need to remember any of these dates. We will follow up at every step. If you miss something, we will reach out.\n\nIf you want to set up your Deed account together on a call this week, reply to this email and I will schedule 15 minutes. I am happy to walk you through it.\n\nBest,\nBella\nTeachers Deserve It`,
      school.name,
      school.id,
      { opportunityId: grant.id, windowOpens: grant.windowOpens, windowCloses: grant.windowCloses }
    )
  }

  const ns = grant.narrativeStatus
  // QA passed, waiting on Bella. Legacy rows sit in qa_review + qa_passed
  // rather than the 'approval' state, so both count.
  const awaitingApproval = !approved && (ns === 'approval' || (ns === 'qa_review' && grant.qaPassed === true))
  const inQa = ns === 'qa_review' && grant.qaPassed !== true
  const isEscalated = ns === 'escalated'
  const isApproved = approved || ns === 'ready'
  const isDrafting = ns === 'drafting' || ns === 'requested'

  return (
    <div style={{
      padding: '10px 0', borderBottom: '1px solid #F3F4F6',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1e2749' }}>{grant.name}</span>
            {grant.amount > 0 && (
              <span style={{ fontSize: 12, color: '#6B7280' }}>${grant.amount.toLocaleString()}</span>
            )}
          </div>
          {grant.windowOpens && (
            <span style={{ fontSize: 11, color: '#6B7280' }}>
              Window: {new Date(grant.windowOpens + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {grant.windowCloses && ` - ${new Date(grant.windowCloses + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            </span>
          )}
        </div>

        {/* Action buttons — ALL steps visible */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {isDrafting && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: '#DBEAFE', color: '#1D4ED8' }}>
              Agent drafting
            </span>
          )}

          {/* An external doc link when one exists — but never a precondition for acting */}
          {(awaitingApproval || inQa) && grant.narrativeUrl && (
            <a href={grant.narrativeUrl} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', textDecoration: 'none' }}>
              Open Doc
            </a>
          )}

          {/* With QA running, nobody is waiting on a person here */}
          {inQa && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: '#EDE9FE', color: '#6D28D9' }}>
              In QA review
            </span>
          )}

          {/* QA failed twice. The options live on the pursuit page. */}
          {isEscalated && (
            <Link href={`/tdi-admin/funding/${school.id}`}
              style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 8, background: '#DC2626', color: 'white', textDecoration: 'none' }}>
              Needs your decision
            </Link>
          )}

          {/* QA passed — approving is one click, with or without a doc URL */}
          {awaitingApproval && (
            <button onClick={handleApprove} disabled={approving}
              style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 8, border: 'none', background: approving ? '#9CA3AF' : '#10B981', color: 'white', cursor: 'pointer' }}>
              {approving ? '...' : 'Approve'}
            </button>
          )}

          {isApproved && !sent && (
            <>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: '#D1FAE5', color: '#065F46' }}>
                Approved
              </span>
              {grant.narrativeUrl && (
                <a href={grant.narrativeUrl} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', textDecoration: 'none' }}>
                  View Doc
                </a>
              )}
              <button onClick={handleSendToClient}
                style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 8, border: 'none', background: '#3B82F6', color: 'white', cursor: 'pointer' }}>
                Send to {school.contact.split(' ')[0]}
              </button>
            </>
          )}

          {sent && (
            <>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: '#DBEAFE', color: '#1D4ED8' }}>
                Sent to {school.contact.split(' ')[0]}
              </span>
              <span style={{ fontSize: 11, color: '#6B7280' }}>
                Waiting on Deed setup
              </span>
            </>
          )}

          {!isDrafting && !inQa && !isEscalated && !awaitingApproval && !isApproved && grant.windowOpen && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: '#D1FAE5', color: '#065F46' }}>
              Window open
            </span>
          )}

          {!isDrafting && !inQa && !isEscalated && !awaitingApproval && !isApproved && !grant.windowOpen && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: '#F3F4F6', color: '#6B7280' }}>
              Not started
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function GrantStatusBadge({ grant }: { grant: SchoolData['grants'][0] }) {
  // What actually happened in the world comes first. This used to be checked
  // last, so a grant the school had already submitted still read "Approved"
  // because its narrative happened to be ready.
  if (grant.status === 'applied' || grant.status === 'waiting') {
    return <Badge label={grant.status === 'applied' ? 'Submitted' : 'Waiting'} color="#065F46" bg="#D1FAE5" />
  }

  // Sent to the school and not submitted. Previously this rendered as
  // "Approved", which reads like an ending. It is the opposite: it is the one
  // state where somebody still has to do something and nobody is being told.
  if (grant.forwardingStatus === 'sent' && grant.narrativeStatus === 'ready') {
    return <Badge label="Sent, not submitted" color="#9B2C3A" bg="#FBE9EC" />
  }

  if (grant.narrativeStatus === 'review' || grant.narrativeStatus === 'qa_review') {
    return <Badge label="Draft ready" color="#6D28D9" bg="#F5F3FF" />
  }
  if (grant.narrativeStatus === 'ready') {
    return <Badge label="Ready to send" color="#8A5500" bg="#FFF2D4" />
  }
  if (grant.narrativeStatus === 'drafting' || grant.narrativeStatus === 'requested') {
    return <Badge label="Agent drafting" color="#1D4ED8" bg="#DBEAFE" />
  }
  if (grant.windowOpen) {
    return <Badge label="Window open" color="#065F46" bg="#D1FAE5" />
  }
  return <Badge label="Not started" color="#6B7280" bg="#F3F4F6" />
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: bg, color }}>
      {label}
    </span>
  )
}

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t) }, [onDone])
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: '#065F46', color: 'white', padding: '12px 20px',
      borderRadius: 10, fontSize: 13, fontWeight: 600,
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    }}>
      {message}
    </div>
  )
}
