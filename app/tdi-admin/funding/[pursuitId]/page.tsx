'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

function fmtCurrency(n: number): string {
  return n % 1 === 0
    ? `$${n.toLocaleString()}`
    : `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
import { PhaseChain } from '../components/PhaseChain'
import { OverviewTab } from '../components/panel/OverviewTab'
import { OpportunitiesTab } from '../components/panel/OpportunitiesTab'
import { ActionsTab } from '../components/panel/ActionsTab'
import { TimelineTab } from '../components/panel/TimelineTab'
import { EmailsTab } from '../components/panel/EmailsTab'
import {
  TYPE_PAGE_TITLE,
  TYPE_PAGE_SUBTITLE,
} from '@/components/tdi-admin/ui/design-tokens'
import { computeNextActions, type NextAction } from '@/lib/funding-next-actions'
import { DraftEmailModal, schoolInfoEmailDraft } from '../components/panel/DraftEmailModal'

export default function PursuitDetailPage() {
  const params = useParams()
  const pursuitId = params.pursuitId as string

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pursuit, setPursuit] = useState<any>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Collapsible sections
  const [showOverview, setShowOverview] = useState(false)
  const [showOpportunities, setShowOpportunities] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const [showEmails, setShowEmails] = useState(false)
  const [draftEmail, setDraftEmail] = useState<{ to: string; toName: string; subject: string; body: string; schoolName: string; pursuitId?: string } | null>(null)

  useEffect(() => {
    if (!pursuitId) return
    fetch(`/api/funding/pursuits/${pursuitId}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else { setData(d); setPursuit(d.pursuit) }
        setLoading(false)
      })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [pursuitId])

  if (loading) {
    return (
      <div style={{ padding: '32px 48px', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/tdi-admin/funding" style={{ fontSize: 13, color: '#8B5CF6', textDecoration: 'none' }}>
            &larr; Back to Funding
          </Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ height: 48, background: '#F3F4F6', borderRadius: 12 }} />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data?.pursuit || !pursuit) {
    return (
      <div style={{ padding: '32px 48px', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/tdi-admin/funding" style={{ fontSize: 13, color: '#8B5CF6', textDecoration: 'none' }}>
            &larr; Back to Funding
          </Link>
        </div>
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '16px 20px', color: '#991B1B', fontSize: 13 }}>
          Failed to load pursuit{error ? `: ${error}` : ''}
        </div>
      </div>
    )
  }

  const p = pursuit
  const gate = data.gate

  const patchPursuit = async (fields: Record<string, unknown>) => {
    setPursuit((prev: any) => ({ ...prev, ...fields }))
    await fetch('/api/funding/pursuits', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pursuitId, ...fields }),
    })
  }
  const nextActions = computeNextActions(
    p,
    data.opportunities || [],
    data.actionItems || [],
    gate,
    data.allocations || [],
  )
  const awarded = p.total_awarded || 0
  const gap = p.contract_gap || p.total_amount || 0
  const remaining = gap - awarded
  const gapPct = gap > 0 ? Math.round((awarded / gap) * 100) : 0

  return (
    <div style={{ padding: '32px 48px', fontFamily: "'DM Sans', sans-serif", maxWidth: 1000 }}>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* Back link */}
      <div style={{ marginBottom: 16 }}>
        <Link href="/tdi-admin/funding" style={{ fontSize: 13, color: '#8B5CF6', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          &larr; Back to Funding
        </Link>
      </div>

      {/* ── HEADER: School name + compact stats ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <EditableText
              value={p.pursuit_name}
              onSave={v => patchPursuit({ pursuit_name: v })}
              style={{ ...TYPE_PAGE_TITLE, margin: 0, fontSize: 22 }}
            />
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
              {p.client_contact_name || 'No contact set'}
            </p>
          </div>
          {/* Compact stats inline */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', flexShrink: 0 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>Pipeline</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0a0f1e' }}>{fmtCurrency(p.total_amount || 0)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>Awarded</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: awarded > 0 ? '#065F46' : '#9CA3AF' }}>{fmtCurrency(awarded)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>Funded</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: gapPct >= 100 ? '#065F46' : '#0a0f1e' }}>{gapPct}%</div>
            </div>
          </div>
        </div>

        {/* Phase chain */}
        <PhaseChain currentPhase={p.current_phase} isStalled={p.is_stalled} />
      </div>

      {/* ── SITUATION BRIEFING ── */}
      <PursuitBriefing pursuit={p} opportunities={data.opportunities || []} gate={gate} onRequestInfo={(draft) => setDraftEmail({ ...draft, pursuitId })} />

      {/* Draft email modal */}
      {draftEmail && (
        <DraftEmailModal
          to={draftEmail.to}
          toName={draftEmail.toName}
          subject={draftEmail.subject}
          body={draftEmail.body}
          schoolName={draftEmail.schoolName}
          pursuitId={draftEmail.pursuitId}
          onClose={() => setDraftEmail(null)}
          onSent={() => { setDraftEmail(null); setToast('Email sent') }}
        />
      )}

      {/* ── WHAT'S NEXT: The primary content area ── */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0a0f1e', margin: '0 0 14px' }}>
          What Needs to Happen
        </h2>
        <ActionCards actions={nextActions} onCardClick={(action) => {
          // Open the relevant section and scroll to it
          if (action.tab === 'overview') setShowOverview(true)
          if (action.tab === 'opportunities') setShowOpportunities(true)
          if (action.tab === 'actions') {} // already open by default
          if (action.tab === 'timeline') setShowTimeline(true)
          if (action.tab === 'emails') setShowEmails(true)
          // Scroll to the section after a brief delay for expansion
          setTimeout(() => {
            const sectionId = action.tab === 'actions' ? 'section-all-action-items' : `section-${action.tab}`
            document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 100)
        }} />
      </div>

      {/* ── ALL ACTIONS: Full task list with cancelled hidden ── */}
      <CollapsibleSection
        title="All Action Items"
        defaultOpen={true}
        sectionId="section-all-action-items"
        count={data.actionItems?.filter((a: any) => a.status !== 'cancelled').length}
      >
        <ActionsTab pursuitId={pursuitId} />
      </CollapsibleSection>

      {/* ── DETAIL SECTIONS: Collapsed by default ── */}
      <CollapsibleSection title="School Profile + Gate" sectionId="section-overview" defaultOpen={showOverview} onToggle={setShowOverview}>
        <OverviewTab
          pursuit={p}
          gate={gate}
          onGateUpdate={() => {}}
          partnershipHealth={data.partnershipHealth}
          renewalEligible={data.renewalEligible}
          contract1={data.contract1}
          contract2={data.contract2}
          contract2LineItems={data.contract2LineItems}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Grant Opportunities" sectionId="section-opportunities" defaultOpen={showOpportunities} onToggle={setShowOpportunities}
        count={data.opportunities?.length}
      >
        <OpportunitiesTab
          pursuitId={pursuitId}
          gateOpen={gate?.gate_open === true}
          contract2LineItems={data.contract2LineItems}
          contract2QuotePackageId={data.contract2LineItems?.[0]?.id}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Timeline" sectionId="section-timeline" defaultOpen={showTimeline} onToggle={setShowTimeline}>
        <TimelineTab pursuitId={pursuitId} />
      </CollapsibleSection>

      <CollapsibleSection title="Emails" defaultOpen={showEmails} onToggle={setShowEmails}>
        <EmailsTab pursuitId={pursuitId} pursuit={p} />
      </CollapsibleSection>
    </div>
  )
}

// ── Action Cards: The main "what to do" display ──

const URGENCY_STYLES: Record<string, { border: string; bg: string; label: string; labelBg: string }> = {
  critical: { border: '#DC2626', bg: '#FEF2F2', label: 'OVERDUE', labelBg: '#DC2626' },
  high: { border: '#F59E0B', bg: '#FFFBEB', label: 'URGENT', labelBg: '#D97706' },
  normal: { border: '#3B82F6', bg: '#F0F7FF', label: '', labelBg: '' },
  low: { border: '#E5E7EB', bg: '#FAFAFA', label: '', labelBg: '' },
}

const OWNER_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  bella: { label: 'Bella', color: '#6D28D9', bg: '#F5F3FF' },
  rae: { label: 'Rae', color: '#0F766E', bg: '#F0FDFA' },
  agent: { label: 'Agent', color: '#1D4ED8', bg: '#EFF6FF' },
  school: { label: 'School', color: '#92400E', bg: '#FFFBEB' },
  auto: { label: 'Auto', color: '#6B7280', bg: '#F3F4F6' },
}

function ActionCards({ actions, onCardClick }: { actions: NextAction[]; onCardClick?: (action: NextAction) => void }) {
  const actionable = actions.filter(a => !a.inProgress)
  const inFlight = actions.filter(a => a.inProgress)
  const [showInFlight, setShowInFlight] = useState(false)

  if (actionable.length === 0 && inFlight.length === 0) {
    return (
      <div style={{
        padding: '24px 20px', background: '#F0FDF4', border: '1px solid #BBF7D0',
        borderRadius: 12, textAlign: 'center', color: '#065F46', fontSize: 14, fontWeight: 600,
      }}>
        Nothing needs attention right now. All tasks are on track.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {actionable.map(action => {
        const urgency = URGENCY_STYLES[action.urgency] || URGENCY_STYLES.normal
        const owner = OWNER_BADGES[action.owner] || OWNER_BADGES.auto

        // Calculate days overdue/until
        let daysLabel = ''
        if (action.dueDate) {
          const diff = Math.ceil(
            (new Date(action.dueDate + 'T00:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )
          if (diff < 0) daysLabel = `${Math.abs(diff)} day${Math.abs(diff) > 1 ? 's' : ''} overdue`
          else if (diff === 0) daysLabel = 'Due today'
          else if (diff <= 7) daysLabel = `Due in ${diff} day${diff > 1 ? 's' : ''}`
          else daysLabel = `Due ${new Date(action.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        }

        return (
          <div
            key={action.id}
            onClick={() => {
              if (action.link) {
                window.open(action.link, '_blank')
              } else {
                onCardClick?.(action)
              }
            }}
            style={{
              background: urgency.bg,
              border: `1px solid ${urgency.border}`,
              borderLeft: `4px solid ${urgency.border}`,
              borderRadius: 10,
              padding: '14px 18px',
              cursor: (action.tab || action.link) ? 'pointer' : 'default',
              transition: 'box-shadow 0.15s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  {/* Urgency label */}
                  {urgency.label && (
                    <span style={{
                      fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 3,
                      background: urgency.labelBg, color: 'white', letterSpacing: 0.5,
                    }}>
                      {urgency.label}
                    </span>
                  )}
                  {/* Owner */}
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                    background: owner.bg, color: owner.color,
                  }}>
                    {owner.label}
                  </span>
                  {/* Due date */}
                  {daysLabel && (
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      color: action.urgency === 'critical' ? '#DC2626' : '#6B7280',
                    }}>
                      {daysLabel}
                    </span>
                  )}
                </div>
                {/* Action title — the instruction */}
                <div style={{ fontSize: 14, fontWeight: 600, color: action.link ? '#8B5CF6' : '#0a0f1e', marginBottom: 2, textDecoration: action.link ? 'underline' : 'none' }}>
                  {action.label} {action.link && <span style={{ fontSize: 11, fontWeight: 400 }}>&#8599;</span>}
                </div>
                {/* Why / context — one line */}
                <div style={{ fontSize: 12, color: '#6B7280' }}>
                  {action.why}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* In-flight summary */}
      {inFlight.length > 0 && (
        <div style={{ marginTop: 4 }}>
          <button
            onClick={() => setShowInFlight(!showInFlight)}
            style={{
              fontSize: 11, color: '#6B7280', background: 'none', border: 'none',
              cursor: 'pointer', padding: '4px 0',
            }}
          >
            {showInFlight ? 'Hide' : 'Show'} {inFlight.length} in progress
          </button>
          {showInFlight && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
              {inFlight.map(action => {
                const owner = OWNER_BADGES[action.owner] || OWNER_BADGES.auto
                return (
                  <div key={action.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 14px', background: '#F9FAFB', borderRadius: 8,
                    border: '1px solid #F3F4F6', opacity: 0.7,
                  }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                      background: owner.bg, color: owner.color,
                    }}>
                      {owner.label}
                    </span>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>{action.label}</span>
                    <span style={{ fontSize: 10, color: '#9CA3AF', marginLeft: 'auto' }}>{action.why}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Collapsible Section ──

function CollapsibleSection({ title, children, defaultOpen = false, onToggle, count, sectionId }: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  onToggle?: (open: boolean) => void
  count?: number
  sectionId?: string
}) {
  const [open, setOpen] = useState(defaultOpen)

  const toggle = () => {
    const next = !open
    setOpen(next)
    onToggle?.(next)
  }

  return (
    <div id={sectionId} style={{ marginBottom: 12, borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
      <button
        onClick={toggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 18px', background: open ? 'white' : '#FAFAFA',
          border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{
          fontSize: 10, color: '#6B7280', fontWeight: 700, width: 16,
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.15s',
          display: 'inline-block',
        }}>
          &#9654;
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0a0f1e' }}>{title}</span>
        {count !== undefined && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 8,
            background: '#F3F4F6', color: '#6B7280',
          }}>
            {count}
          </span>
        )}
      </button>
      {open && (
        <div style={{ padding: '0 18px 18px' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ── Toast notification ──

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

// ── StatCard (kept for potential reuse) ──

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: '14px 18px' }}>
      <div style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || '#0a0f1e', marginTop: 4 }}>{value}</div>
    </div>
  )
}

// ── EditableText — click-to-edit text field ──

function EditableText({ value, onSave, style }: { value: string; onSave: (v: string) => void; style?: React.CSSProperties }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  if (editing) {
    return (
      <input
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={() => { if (draft !== value) onSave(draft); setEditing(false) }}
        onKeyDown={e => { if (e.key === 'Enter') { if (draft !== value) onSave(draft); setEditing(false) } if (e.key === 'Escape') { setDraft(value); setEditing(false) } }}
        autoFocus
        style={{ ...style, border: '2px solid #8B5CF6', borderRadius: 6, padding: '4px 8px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
      />
    )
  }

  return (
    <div
      onClick={() => { setDraft(value); setEditing(true) }}
      style={{ ...style, cursor: 'pointer' }}
      title="Click to edit"
    >
      {value}
    </div>
  )
}

// ── Pursuit Briefing — auto-generated context summary ──

function PursuitBriefing({ pursuit, opportunities, gate, onRequestInfo }: { pursuit: any; opportunities: any[]; gate: any; onRequestInfo?: (draft: { to: string; toName: string; subject: string; body: string; schoolName: string }) => void }) {
  const contact = pursuit.client_contact_name || 'No contact set'
  const email = pursuit.client_contact_email || ''
  const phone = pursuit.client_contact_phone || ''
  const school = pursuit.district_name || pursuit.pursuit_name
  const total = pursuit.total_amount || 0

  const denied = opportunities.filter((o: any) => o.status === 'denied').length
  const open = opportunities.filter((o: any) => ['not_started', 'researching', 'applied', 'waiting'].includes(o.status)).length
  const awarded = opportunities.filter((o: any) => o.status === 'awarded').length
  const totalOpps = opportunities.length

  const gateOpen = gate?.gate_open === true
  const gateMissing = gate ? [
    !gate.submitter_name && 'submitter',
    !gate.backup_name && 'backup',
    !gate.admin_sponsor_name && 'admin sponsor',
    !gate.submitter_employment_verified_at && 'employment verification',
  ].filter(Boolean) : []

  // Build summary sentences
  const lines: string[] = []

  if (totalOpps === 0) {
    lines.push(`No grant opportunities mapped yet. Bella needs to research and add 3-5 grants this school is eligible for.`)
  } else {
    const parts = []
    if (open > 0) parts.push(`${open} active`)
    if (awarded > 0) parts.push(`${awarded} awarded`)
    if (denied > 0) parts.push(`${denied} denied`)
    lines.push(`${totalOpps} grant opportunities: ${parts.join(', ')}.`)
  }

  if (!gateOpen && gateMissing.length > 0) {
    lines.push(`Gate is blocked — missing: ${(gateMissing as string[]).join(', ')}. Must be completed before outreach.`)
  }

  if (pursuit.internal_notes) {
    lines.push(pursuit.internal_notes)
  }

  return (
    <div style={{
      marginBottom: 20, padding: '16px 20px',
      background: '#F8FAFC', border: '1px solid #E2E8F0',
      borderRadius: 12, borderLeft: '4px solid #8B5CF6',
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
        About This School
      </div>
      <div style={{ display: 'flex', gap: 24, marginBottom: 10, flexWrap: 'wrap' }}>
        <div>
          <span style={{ fontSize: 12, color: '#6B7280' }}>Contact: </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#0a0f1e' }}>{contact}</span>
        </div>
        {email && (
          <div>
            <span style={{ fontSize: 12, color: '#6B7280' }}>Email: </span>
            <a href={`mailto:${email}`} style={{ fontSize: 13, color: '#8B5CF6', textDecoration: 'none' }}>{email}</a>
          </div>
        )}
        {phone && (
          <div>
            <span style={{ fontSize: 12, color: '#6B7280' }}>Phone: </span>
            <span style={{ fontSize: 13, color: '#0a0f1e' }}>{phone}</span>
          </div>
        )}
        <div>
          <span style={{ fontSize: 12, color: '#6B7280' }}>Contract: </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0a0f1e' }}>{fmtCurrency(total)}</span>
        </div>
      </div>
      {lines.map((line, i) => (
        <p key={i} style={{ fontSize: 13, color: '#374151', margin: '4px 0', lineHeight: 1.5 }}>{line}</p>
      ))}

      {/* Request info button when gate has missing fields */}
      {onRequestInfo && email && gateMissing.length > 0 && (
        <button
          onClick={() => {
            const missingLabels = (gateMissing as string[]).map(f => {
              if (f === 'submitter') return 'Who will be submitting grant applications? (name, title, email)'
              if (f === 'backup') return 'Who is the backup contact if the submitter is unavailable? (name, email)'
              if (f === 'admin sponsor') return 'Which administrator approved participation in grant funding? (name, title)'
              if (f === 'employment verification') return 'Can you confirm the submitter currently works at the school?'
              return f
            })
            const draft = schoolInfoEmailDraft(contact, school, missingLabels)
            onRequestInfo({ to: email, toName: contact, subject: draft.subject, body: draft.body, schoolName: school })
          }}
          style={{
            marginTop: 10, fontSize: 13, fontWeight: 600, padding: '8px 16px',
            borderRadius: 8, border: 'none', background: '#8B5CF6', color: 'white',
            cursor: 'pointer',
          }}
        >
          Request missing info from {contact.split(' ')[0]}
        </button>
      )}
    </div>
  )
}
