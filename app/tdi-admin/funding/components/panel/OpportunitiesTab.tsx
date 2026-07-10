'use client'

import { useEffect, useState } from 'react'

const PLAN_COLORS: Record<string, string> = { A: '#0F766E', B: '#1B365D', C: '#7C3AED', D: '#B45309' }
const PLAN_LABELS: Record<string, string> = {
  A: 'Federal / formula (slow, big)',
  B: 'State / local pathway',
  C: 'Association / competitive',
  D: 'Corporate / foundation / local (fast, small)',
}
const STATUS_OPTIONS = ['not_started', 'researching', 'applied', 'waiting', 'awarded', 'denied', 'stalled', 'backup']

const WINDOW_STATUS_OPTIONS = [
  { value: 'unknown', label: 'Unknown' },
  { value: 'open', label: 'Open' },
  { value: 'closed_missed', label: 'Missed' },
  { value: 'closed_awarded', label: 'Awarded' },
  { value: 'closed_denied', label: 'Denied' },
]

const WINDOW_STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  open: { bg: '#D1FAE5', color: '#065F46' },
  unknown: { bg: '#F3F4F6', color: '#6B7280' },
  closed_missed: { bg: '#FEE2E2', color: '#991B1B' },
  closed_awarded: { bg: '#DBEAFE', color: '#1D4ED8' },
  closed_denied: { bg: '#DBEAFE', color: '#1D4ED8' },
}

const NARRATIVE_COLORS: Record<string, string> = {
  not_started: '#EF4444', researching: '#F59E0B', applied: '#F59E0B',
  waiting: '#F59E0B', drafting: '#F59E0B', review: '#F59E0B',
  ready: '#10B981', awarded: '#10B981', denied: '#6B7280',
  stalled: '#6B7280', backup: '#6B7280',
}

function defaultAgent(planCategory: string | null): string {
  const cat = (planCategory || '').toUpperCase()
  return (cat === 'A' || cat === 'B') ? 'vanessa' : 'amara'
}

const AGENT_OPTIONS = [
  { value: 'vanessa', label: 'Vanessa (federal/state)' },
  { value: 'amara', label: 'Amara (local/foundation)' },
]

// ── Empty form state ──

function emptyForm() {
  return {
    name: '', amount: '', planCategory: 'A', status: 'not_started',
    applicationOpens: '', applicationCloses: '',
    internalDeadline: '', awardNeededBy: '',
    windowStatus: 'unknown',
    contactName: '', contactEmail: '',
  }
}

interface OpportunitiesTabProps {
  pursuitId: string
}

export function OpportunitiesTab({ pursuitId }: OpportunitiesTabProps) {
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formMode, setFormMode] = useState<'closed' | 'add' | 'edit'>('closed')
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm())

  const fetchOpps = () => {
    setLoading(true)
    fetch(`/api/funding/opportunities?pursuitId=${pursuitId}`)
      .then(r => r.json())
      .then(d => {
        const items = Array.isArray(d) ? d : (d.opportunities || [])
        items.sort((a: any, b: any) => {
          const aClient = a.waiting_on === 'client' ? 0 : 1
          const bClient = b.waiting_on === 'client' ? 0 : 1
          if (aClient !== bClient) return aClient - bClient
          const aDate = a.application_closes || '9999-12-31'
          const bDate = b.application_closes || '9999-12-31'
          return aDate.localeCompare(bDate)
        })
        setOpportunities(items)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchOpps() }, [pursuitId])

  const handleStatusChange = async (id: string, newStatus: string) => {
    await fetch('/api/funding/opportunities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    })
    fetchOpps()
  }

  const patchOpp = async (id: string, fields: Record<string, unknown>) => {
    setOpportunities(prev => prev.map(o => o.id === id ? { ...o, ...fields } : o))
    await fetch('/api/funding/opportunities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...fields }),
    })
    fetchOpps()
  }

  const openAdd = () => {
    setForm(emptyForm())
    setEditId(null)
    setFormMode('add')
  }

  const openEdit = (opp: any) => {
    setForm({
      name: opp.name || '',
      amount: opp.amount ? String(opp.amount) : '',
      planCategory: opp.plan_category || 'A',
      status: opp.status || 'not_started',
      applicationOpens: opp.application_opens || '',
      applicationCloses: opp.application_closes || '',
      internalDeadline: opp.internal_deadline || '',
      awardNeededBy: opp.award_needed_by || '',
      windowStatus: opp.window_status || 'unknown',
      contactName: opp.contact_name || '',
      contactEmail: opp.contact_email || '',
    })
    setEditId(opp.id)
    setFormMode('edit')
  }

  const handleSubmit = async () => {
    if (formMode === 'add') {
      await fetch('/api/funding/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pursuitId,
          name: form.name,
          amount: parseFloat(form.amount) || 0,
          planCategory: form.planCategory,
          status: form.status,
          applicationOpens: form.applicationOpens || null,
          applicationCloses: form.applicationCloses || null,
          internalDeadline: form.internalDeadline || null,
          awardNeededBy: form.awardNeededBy || null,
          windowStatus: form.windowStatus,
          contactName: form.contactName || null,
          contactEmail: form.contactEmail || null,
        }),
      })
    } else if (formMode === 'edit' && editId) {
      await fetch('/api/funding/opportunities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editId,
          name: form.name,
          amount: parseFloat(form.amount) || null,
          plan_category: form.planCategory,
          status: form.status,
          application_opens: form.applicationOpens || null,
          application_closes: form.applicationCloses || null,
          internal_deadline: form.internalDeadline || null,
          award_needed_by: form.awardNeededBy || null,
          window_status: form.windowStatus,
          contact_name: form.contactName || null,
          contact_email: form.contactEmail || null,
        }),
      })
    }
    setFormMode('closed')
    setEditId(null)
    setForm(emptyForm())
    fetchOpps()
  }

  const totalAmount = opportunities.reduce((sum: number, o: any) => sum + (o.amount || 0), 0)

  if (loading) return <div style={{ padding: 20, textAlign: 'center', color: '#6B7280' }}>Loading...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* ── Diversification summary ── */}
      <DiversificationView opportunities={opportunities} />

      {/* Count header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
          {opportunities.length} opportunit{opportunities.length === 1 ? 'y' : 'ies'}
          <span style={{ fontWeight: 400, color: '#6B7280', marginLeft: 8 }}>
            ${totalAmount.toLocaleString()} total
          </span>
        </div>
        <button
          onClick={() => formMode === 'closed' ? openAdd() : setFormMode('closed')}
          style={{
            fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 6,
            border: 'none', background: '#8B5CF6', color: 'white', cursor: 'pointer',
          }}
        >
          {formMode !== 'closed' ? 'Cancel' : '+ Add Opportunity'}
        </button>
      </div>

      {/* ── Add / Edit form ── */}
      {formMode !== 'closed' && (
        <div style={{ padding: 16, background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0a0f1e' }}>
            {formMode === 'edit' ? 'Edit opportunity' : 'New opportunity'}
          </div>

          {/* Basics */}
          <FieldGroup label="Basics">
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Opportunity name"
              style={inputStyle}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                placeholder="Amount ($)"
                style={{ ...inputStyle, flex: 1 }}
              />
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                style={{ ...inputStyle, flex: 1 }}
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </FieldGroup>

          {/* Tier */}
          <FieldGroup label="Funding Tier (A/B/C/D)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {['A', 'B', 'C', 'D'].map(cat => (
                <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="planCategory"
                    value={cat}
                    checked={form.planCategory === cat}
                    onChange={() => setForm({ ...form, planCategory: cat })}
                    style={{ accentColor: PLAN_COLORS[cat] }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 700, color: PLAN_COLORS[cat] }}>Plan {cat}</span>
                  <span style={{ fontSize: 11, color: '#6B7280' }}>{PLAN_LABELS[cat]}</span>
                </label>
              ))}
            </div>
          </FieldGroup>

          {/* Dates */}
          <FieldGroup label="Dates & Window">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <DateField label="Application opens" value={form.applicationOpens} onChange={v => setForm({ ...form, applicationOpens: v })} />
              <DateField label="Application closes" value={form.applicationCloses} onChange={v => setForm({ ...form, applicationCloses: v })} />
              <DateField label="Internal deadline (our real date)" value={form.internalDeadline} onChange={v => setForm({ ...form, internalDeadline: v })} />
              <DateField label="Award needed by" value={form.awardNeededBy} onChange={v => setForm({ ...form, awardNeededBy: v })} />
            </div>
            <div style={{ marginTop: 8 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Window status</label>
              <select
                value={form.windowStatus}
                onChange={e => setForm({ ...form, windowStatus: e.target.value })}
                style={inputStyle}
              >
                {WINDOW_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </FieldGroup>

          {/* Contact */}
          <FieldGroup label="Grant Contact">
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={form.contactName}
                onChange={e => setForm({ ...form, contactName: e.target.value })}
                placeholder="Contact name"
                style={{ ...inputStyle, flex: 1 }}
              />
              <input
                value={form.contactEmail}
                onChange={e => setForm({ ...form, contactEmail: e.target.value })}
                placeholder="Contact email"
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
          </FieldGroup>

          <button
            onClick={handleSubmit}
            disabled={!form.name}
            style={{
              fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 6,
              border: 'none', background: '#8B5CF6', color: 'white', cursor: 'pointer',
              opacity: form.name ? 1 : 0.5, alignSelf: 'flex-start',
            }}
          >
            {formMode === 'edit' ? 'Save changes' : 'Add Opportunity'}
          </button>
        </div>
      )}

      {/* ── Opportunity cards ── */}
      {opportunities.map((opp: any) => {
        const borderColor = PLAN_COLORS[opp.plan_category] || '#6B7280'
        const narrativeColor = NARRATIVE_COLORS[opp.status] || '#6B7280'

        return (
          <div key={opp.id} style={{
            padding: '12px 16px', background: '#F9FAFB', borderRadius: 10,
            borderLeft: `4px solid ${borderColor}`,
          }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: borderColor, padding: '2px 6px', background: 'white', borderRadius: 4, border: `1px solid ${borderColor}` }}>
                  Plan {opp.plan_category || '?'}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0a0f1e' }}>{opp.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0a0f1e' }}>
                  {opp.amount > 0 ? `$${opp.amount.toLocaleString()}` : '--'}
                </span>
                <button
                  onClick={() => openEdit(opp)}
                  style={{
                    fontSize: 9, padding: '2px 6px', borderRadius: 3,
                    border: '1px solid #E5E7EB', background: 'white', color: '#9CA3AF',
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Middle row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: narrativeColor, flexShrink: 0 }} />
              <select
                value={opp.status || 'not_started'}
                onChange={e => handleStatusChange(opp.id, e.target.value)}
                style={{ fontSize: 11, padding: '3px 6px', border: '1px solid #E5E7EB', borderRadius: 6, background: 'white', cursor: 'pointer' }}
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>

              {opp.waiting_on && (
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                  background: opp.waiting_on === 'client' ? '#FEF3C7' : '#E0E7FF',
                  color: opp.waiting_on === 'client' ? '#92400E' : '#3730A3',
                }}>
                  Waiting: {opp.waiting_on}
                </span>
              )}

              {opp.application_closes && (
                <span style={{ fontSize: 11, color: '#6B7280' }}>
                  Deadline: {new Date(opp.application_closes + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}

              {/* Window status */}
              {(() => {
                const ws = opp.window_status || 'unknown'
                const wsStyle = WINDOW_STATUS_STYLES[ws] || WINDOW_STATUS_STYLES.unknown
                return (
                  <select
                    value={ws}
                    onChange={e => patchOpp(opp.id, { window_status: e.target.value })}
                    style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                      background: wsStyle.bg, color: wsStyle.color,
                      border: '1px solid #E5E7EB', cursor: 'pointer',
                    }}
                  >
                    {WINDOW_STATUS_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                )
              })()}
            </div>

            {/* Date details row */}
            {(opp.internal_deadline || opp.award_needed_by) && (
              <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
                {opp.internal_deadline && (
                  <span style={{ fontSize: 10, color: '#DC2626', fontWeight: 600 }}>
                    Internal deadline: {new Date(opp.internal_deadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
                {opp.award_needed_by && (
                  <span style={{ fontSize: 10, color: '#6B7280' }}>
                    Award needed by: {new Date(opp.award_needed_by + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            )}

            {/* Contact */}
            {opp.contact_name && (
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>Contact: {opp.contact_name}{opp.contact_email ? ` (${opp.contact_email})` : ''}</div>
            )}

            {/* Narrative control */}
            <NarrativeControl
              opp={opp}
              onRequestDraft={(agent) => patchOpp(opp.id, { narrative_status: 'requested', assigned_agent: agent })}
              onApprove={() => patchOpp(opp.id, { narrative_status: 'ready' })}
            />

            {/* Research control */}
            <ResearchControl
              opp={opp}
              onRequest={() => patchOpp(opp.id, { research_status: 'requested', assigned_agent: defaultAgent(opp.plan_category) })}
            />
          </div>
        )
      })}

      {opportunities.length === 0 && formMode === 'closed' && (
        <div style={{ textAlign: 'center', padding: 24, color: '#9CA3AF', fontSize: 13 }}>
          No opportunities yet. Click "+ Add Opportunity" to get started.
        </div>
      )}
    </div>
  )
}

// ── Shared styles ──

const inputStyle: React.CSSProperties = {
  fontSize: 13, padding: '8px 12px', border: '1px solid #E5E7EB',
  borderRadius: 6, width: '100%', boxSizing: 'border-box' as const,
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 3 }}>{label}</label>
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={inputStyle}
      />
    </div>
  )
}

// ── Diversification summary ──

function DiversificationView({ opportunities }: { opportunities: any[] }) {
  if (opportunities.length === 0) return null

  const tiers: Record<string, { count: number; total: number }> = { A: { count: 0, total: 0 }, B: { count: 0, total: 0 }, C: { count: 0, total: 0 }, D: { count: 0, total: 0 } }

  for (const opp of opportunities) {
    const cat = (opp.plan_category || '').toUpperCase()
    if (tiers[cat]) {
      tiers[cat].count++
      tiers[cat].total += opp.amount || 0
    }
  }

  const hasSlow = tiers.A.count > 0 || tiers.B.count > 0
  const hasFast = tiers.C.count > 0 || tiers.D.count > 0
  const needsWarning = (hasSlow && !hasFast) || (!hasSlow && hasFast)

  return (
    <div style={{
      padding: '12px 16px', background: 'white', borderRadius: 10,
      border: '1px solid #E5E7EB',
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
        Funding Diversification
      </div>

      {/* Tier counts */}
      <div style={{ display: 'flex', gap: 12, marginBottom: needsWarning ? 10 : 0 }}>
        {(['A', 'B', 'C', 'D'] as const).map(cat => {
          const t = tiers[cat]
          return (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: t.count > 0 ? PLAN_COLORS[cat] : '#D1D5DB',
              }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: t.count > 0 ? '#0a0f1e' : '#9CA3AF' }}>
                {cat}: {t.count}
              </span>
              {t.total > 0 && (
                <span style={{ fontSize: 10, color: '#6B7280' }}>
                  (${t.total.toLocaleString()})
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Diversification warning */}
      {needsWarning && (
        <div style={{
          padding: '8px 12px', background: '#FFFBEB', border: '1px solid #FDE68A',
          borderRadius: 6, fontSize: 11, color: '#92400E', lineHeight: 1.5,
        }}>
          {hasSlow && !hasFast && (
            <>No fast funding sources (Plan C/D). Consider adding a quick local or foundation source to protect the timeline — a $2-5K grant that lands fast beats a large federal path that decides too late.</>
          )}
          {!hasSlow && hasFast && (
            <>No federal/state sources (Plan A/B). Consider pairing with a formula path (Title II-A, IDEA) for larger sustained funding alongside the quick wins.</>
          )}
        </div>
      )}
    </div>
  )
}

// ── Narrative draft control ──

function NarrativeControl({ opp, onRequestDraft, onApprove }: {
  opp: any
  onRequestDraft: (agent: string) => void
  onApprove: () => void
}) {
  const [agentPick, setAgentPick] = useState(defaultAgent(opp.plan_category))
  const ns = opp.narrative_status || 'not_started'
  const agent = opp.assigned_agent || ''
  const windowOpen = opp.window_status === 'open'

  return (
    <div style={{
      marginTop: 8, padding: '8px 10px', background: '#FAFAFA',
      borderRadius: 6, border: '1px solid #F3F4F6',
      display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Narrative
      </span>

      {(ns === 'not_started' || ns === 'ready') && (
        <>
          <select
            value={agentPick}
            onChange={e => setAgentPick(e.target.value)}
            style={{
              fontSize: 10, padding: '2px 4px', border: '1px solid #E5E7EB',
              borderRadius: 4, background: 'white', cursor: 'pointer',
            }}
          >
            {AGENT_OPTIONS.map(a => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
          <button
            onClick={() => onRequestDraft(agentPick)}
            style={{
              fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 4,
              border: 'none', background: '#8B5CF6', color: 'white', cursor: 'pointer',
            }}
          >
            {ns === 'ready' ? 'Request new draft' : 'Request draft'}
          </button>
          {ns === 'ready' && (
            <span style={{ fontSize: 10, fontWeight: 600, color: '#10B981' }}>Approved</span>
          )}
        </>
      )}

      {ns === 'requested' && (
        <>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
            background: '#FEF3C7', color: '#92400E',
          }}>
            Draft requested — waiting for {agent || 'agent'}
          </span>
          {!windowOpen && (
            <span style={{ fontSize: 9, color: '#9CA3AF', fontStyle: 'italic' }}>
              Draft won't start until the funding window is verified open
            </span>
          )}
        </>
      )}

      {ns === 'drafting' && (
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
          background: '#DBEAFE', color: '#1D4ED8',
        }}>
          {agent || 'Agent'} is drafting...
        </span>
      )}

      {ns === 'review' && (
        <>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
            background: '#FEF3C7', color: '#92400E',
          }}>
            Draft ready — review
          </span>
          {opp.narrative_url && (
            <a
              href={opp.narrative_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ fontSize: 10, color: '#8B5CF6', textDecoration: 'underline' }}
            >
              Open draft
            </a>
          )}
          <button
            onClick={onApprove}
            style={{
              fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 4,
              border: 'none', background: '#10B981', color: 'white', cursor: 'pointer',
            }}
          >
            Approve
          </button>
        </>
      )}
    </div>
  )
}

// ── Research funders control ──

function ResearchControl({ opp, onRequest }: {
  opp: any
  onRequest: () => void
}) {
  const rs = opp.research_status || null
  const agent = opp.assigned_agent || ''

  if (['awarded', 'denied'].includes(opp.status)) return null

  return (
    <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
      {(!rs || rs === 'complete') && (
        <button
          onClick={onRequest}
          style={{
            fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
            border: '1px solid #E5E7EB', background: 'white', color: '#6B7280',
            cursor: 'pointer',
          }}
        >
          Find more funders
        </button>
      )}

      {rs === 'requested' && (
        <span style={{
          fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
          background: '#F3F4F6', color: '#6B7280',
        }}>
          Research requested — {agent || 'amara'}
        </span>
      )}

      {rs === 'in_progress' && (
        <span style={{
          fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
          background: '#DBEAFE', color: '#1D4ED8',
        }}>
          {agent || 'Agent'} researching...
        </span>
      )}
    </div>
  )
}
