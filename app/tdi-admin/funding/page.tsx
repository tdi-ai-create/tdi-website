'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DraftEmailModal, introEmailDraft } from './components/panel/DraftEmailModal'

interface SchoolData {
  id: string
  name: string
  contact: string
  email: string
  pipeline: number
  introSent: boolean
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
  }[]
}

export default function FundingPage() {
  const [schools, setSchools] = useState<SchoolData[]>([])
  const [loading, setLoading] = useState(true)
  const [draftEmail, setDraftEmail] = useState<any>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/funding/dashboard')
      .then(r => r.json())
      .then(d => {
        const pursuits = (d.pursuits || []).filter((p: any) => !p.archived)
        // Fetch opportunities for each pursuit
        Promise.all(pursuits.map((p: any) =>
          fetch(`/api/funding/opportunities?pursuitId=${p.id}`)
            .then(r => r.json())
            .then(od => ({
              id: p.id,
              name: p.pursuit_name || p.district_name,
              contact: p.client_contact_name || 'No contact',
              email: p.client_contact_email || '',
              pipeline: p.total_amount || 0,
              introSent: !!p.intro_sent_at,
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
              })),
            }))
        )).then(data => {
          // Sort: schools with drafts ready first, then by pipeline value
          data.sort((a: SchoolData, b: SchoolData) => {
            const aReady = a.grants.filter(g => ['review', 'qa_review'].includes(g.narrativeStatus)).length
            const bReady = b.grants.filter(g => ['review', 'qa_review'].includes(g.narrativeStatus)).length
            if (aReady > 0 && bReady === 0) return -1
            if (bReady > 0 && aReady === 0) return 1
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
  const readyToReview = schools.reduce((s, sc) => s + sc.grants.filter(g => ['review', 'qa_review'].includes(g.narrativeStatus)).length, 0)

  return (
    <div style={{ padding: '32px 48px', fontFamily: "'DM Sans', sans-serif", maxWidth: 1000 }}>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      {draftEmail && (
        <DraftEmailModal {...draftEmail} onClose={() => setDraftEmail(null)} onSent={() => { setDraftEmail(null); setToast('Email sent') }} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e2749', margin: 0 }}>Grant Funding</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/tdi-admin/funding/queue" style={{ fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', color: '#374151', textDecoration: 'none' }}>
            Work Queue
          </Link>
          <Link href="/tdi-admin/funding/portfolio" style={{ fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', color: '#374151', textDecoration: 'none' }}>
            All Pursuits
          </Link>
        </div>
      </div>
      <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>
        {schools.length} schools | ${(totalPipeline / 1000).toFixed(0)}K pipeline | {totalGrants} grants tracked{readyToReview > 0 ? ` | ${readyToReview} ready to review` : ''}
      </p>

      {/* School cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {schools.map(school => (
          <SchoolCard
            key={school.id}
            school={school}
            onDraftEmail={(to, toName, subject, body, schoolName, pursuitId) => {
              setDraftEmail({ to, toName, subject, body, schoolName, pursuitId })
            }}
            onToast={setToast}
          />
        ))}
      </div>
    </div>
  )
}

function SchoolCard({ school, onDraftEmail, onToast }: {
  school: SchoolData
  onDraftEmail: (to: string, toName: string, subject: string, body: string, schoolName: string, pursuitId: string) => void
  onToast: (msg: string) => void
}) {
  const activeGrants = school.grants.filter(g => g.status !== 'denied')
  const deniedGrants = school.grants.filter(g => g.status === 'denied')
  const openWindowGrants = activeGrants.filter(g => g.windowOpen)
  const draftsReady = activeGrants.filter(g => ['review', 'qa_review'].includes(g.narrativeStatus))
  const draftsInProgress = activeGrants.filter(g => g.narrativeStatus === 'drafting' || g.narrativeStatus === 'requested')
  const needsDraft = openWindowGrants.filter(g => g.narrativeStatus === 'not_started')

  // Determine next action
  let nextAction = ''
  let nextActionType: 'email' | 'review' | 'draft' | 'info' | 'none' = 'none'

  if (!school.introSent && school.email) {
    nextAction = `Send intro email to ${school.contact.split(' ')[0]}`
    nextActionType = 'email'
  } else if (draftsReady.length > 0) {
    nextAction = `Review ${draftsReady.length} narrative${draftsReady.length > 1 ? 's' : ''} and approve`
    nextActionType = 'review'
  } else if (needsDraft.length > 0) {
    nextAction = `Request narrative drafts for ${needsDraft.length} open-window grant${needsDraft.length > 1 ? 's' : ''}`
    nextActionType = 'draft'
  } else if (openWindowGrants.length === 0 && activeGrants.length > 0) {
    nextAction = 'Verify which grant windows are open'
    nextActionType = 'info'
  } else if (draftsInProgress.length > 0) {
    nextAction = `${draftsInProgress.length} draft${draftsInProgress.length > 1 ? 's' : ''} in progress with agents`
    nextActionType = 'none'
  }

  return (
    <div style={{
      background: 'white', border: '1px solid #E5E7EB', borderRadius: 14,
      borderLeft: draftsReady.length > 0 ? '4px solid #8B5CF6' : nextActionType === 'email' ? '4px solid #3B82F6' : '4px solid #E5E7EB',
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

      {/* Next action banner */}
      {nextAction && (
        <div style={{
          padding: '12px 22px',
          background: nextActionType === 'review' ? '#F5F3FF' : nextActionType === 'email' ? '#EFF6FF' : '#F9FAFB',
          borderBottom: '1px solid #F3F4F6',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
              Next Step
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: nextActionType === 'review' ? '#6D28D9' : '#1e2749' }}>
              {nextAction}
            </div>
          </div>
          {nextActionType === 'email' && school.email && (
            <button
              onClick={() => {
                const draft = introEmailDraft(school.contact, school.name.replace(/ - Grant Funding$/, ''))
                onDraftEmail(school.email, school.contact, draft.subject, draft.body, school.name, school.id)
              }}
              style={{
                fontSize: 12, fontWeight: 700, padding: '8px 16px', borderRadius: 8,
                border: 'none', background: '#3B82F6', color: 'white', cursor: 'pointer',
              }}
            >
              Draft Email
            </button>
          )}
          {nextActionType === 'review' && (
            <div style={{ display: 'flex', gap: 6 }}>
              {draftsReady.map(g => (
                g.narrativeUrl ? (
                  <a
                    key={g.id}
                    href={g.narrativeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 12, fontWeight: 700, padding: '8px 16px', borderRadius: 8,
                      border: 'none', background: '#8B5CF6', color: 'white', textDecoration: 'none',
                    }}
                  >
                    Open {g.name.split(' ')[0]} Doc
                  </a>
                ) : null
              ))}
            </div>
          )}
          {nextActionType === 'draft' && (
            <Link
              href={`/tdi-admin/funding/${school.id}`}
              style={{
                fontSize: 12, fontWeight: 700, padding: '8px 16px', borderRadius: 8,
                border: 'none', background: '#10B981', color: 'white', textDecoration: 'none',
              }}
            >
              Request Drafts
            </Link>
          )}
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
        {deniedGrants.length > 0 && (
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>
            {deniedGrants.length} denied grant{deniedGrants.length > 1 ? 's' : ''} (not shown)
          </div>
        )}
      </div>
    </div>
  )
}

function GrantRow({ grant, school, onDraftEmail, onToast, onRefresh }: {
  grant: SchoolData['grants'][0]
  school: SchoolData
  onDraftEmail: (to: string, toName: string, subject: string, body: string, schoolName: string, pursuitId: string) => void
  onToast: (msg: string) => void
  onRefresh: () => void
}) {
  const [approving, setApproving] = useState(false)
  const [approved, setApproved] = useState(grant.narrativeStatus === 'ready')

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

    onDraftEmail(
      school.email,
      school.contact,
      `Your ${grant.name} application is ready. Here is your timeline.`,
      `Hi ${firstName},\n\nYour ${grant.name} grant application for ${schoolName} is complete. We wrote everything for you. You will copy, paste, and submit. Nothing to write from scratch.\n\nHere is your application package:\n${docLink}\n\nHere is your timeline:\n\nTHIS WEEK: Set up your Deed account (Step 1 in the document). This takes about 5 minutes but verification takes 1 to 2 weeks, so please do this now. Your deadline to have Deed set up is ${deedDeadlineStr}.\n\n${windowOpensStr.toUpperCase()}: The application window opens. We will email you a reminder that day with a link to your application package so you can submit. Submitting takes about 15 minutes.\n\n${windowClosesStr ? windowClosesStr.toUpperCase() + ': The window closes. We need to submit before this date.\n\n' : ''}You do not need to remember any of these dates. We will follow up at every step. If you miss something, we will reach out.\n\nIf you want to set up your Deed account together on a call this week, reply to this email and I will schedule 15 minutes. I am happy to walk you through it.\n\nBest,\nBella\nTeachers Deserve It`,
      school.name,
      school.id
    )
  }

  const isReviewable = ['review', 'qa_review'].includes(grant.narrativeStatus) && !approved
  const isApproved = approved || grant.narrativeStatus === 'ready'
  const isDrafting = grant.narrativeStatus === 'drafting' || grant.narrativeStatus === 'requested'

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

          {isReviewable && grant.narrativeUrl && (
            <>
              <a href={grant.narrativeUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 8, background: '#8B5CF6', color: 'white', textDecoration: 'none' }}>
                Open Doc
              </a>
              <button onClick={handleApprove} disabled={approving}
                style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 8, border: 'none', background: approving ? '#9CA3AF' : '#10B981', color: 'white', cursor: 'pointer' }}>
                {approving ? '...' : 'Approve'}
              </button>
            </>
          )}

          {isApproved && (
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

          {!isDrafting && !isReviewable && !isApproved && grant.windowOpen && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: '#D1FAE5', color: '#065F46' }}>
              Window open
            </span>
          )}

          {!isDrafting && !isReviewable && !isApproved && !grant.windowOpen && (
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
  if (grant.narrativeStatus === 'review' || grant.narrativeStatus === 'qa_review') {
    return <Badge label="Draft ready" color="#6D28D9" bg="#F5F3FF" />
  }
  if (grant.narrativeStatus === 'ready') {
    return <Badge label="Approved" color="#065F46" bg="#D1FAE5" />
  }
  if (grant.narrativeStatus === 'drafting' || grant.narrativeStatus === 'requested') {
    return <Badge label="Agent drafting" color="#1D4ED8" bg="#DBEAFE" />
  }
  if (grant.status === 'applied' || grant.status === 'waiting') {
    return <Badge label={grant.status === 'applied' ? 'Applied' : 'Waiting'} color="#D97706" bg="#FEF3C7" />
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
