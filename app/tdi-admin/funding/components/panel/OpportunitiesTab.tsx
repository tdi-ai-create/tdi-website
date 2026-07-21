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
  gateOpen?: boolean
  contract2LineItems?: any[]
  contract2QuotePackageId?: string
}

export function OpportunitiesTab({ pursuitId, gateOpen = false, contract2LineItems, contract2QuotePackageId }: OpportunitiesTabProps) {
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formMode, setFormMode] = useState<'closed' | 'add' | 'edit'>('closed')
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [savedField, setSavedField] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const showSaved = (field: string) => {
    setSavedField(field)
    setTimeout(() => setSavedField(null), 2000)
  }

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
    const res = await fetch('/api/funding/opportunities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    })
    if (res.ok) showSaved(`status-${id}`)
    fetchOpps()
  }

  const patchOpp = async (id: string, fields: Record<string, unknown>) => {
    setOpportunities(prev => prev.map(o => o.id === id ? { ...o, ...fields } : o))
    const fieldKey = Object.keys(fields)[0] || 'field'
    const res = await fetch('/api/funding/opportunities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...fields }),
    })
    if (res.ok) showSaved(`${fieldKey}-${id}`)
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
    // Validation
    if (!form.name.trim()) { setFormError('Grant name is required'); return }
    if (formMode === 'add' && !form.amount && !form.applicationCloses && !form.internalDeadline) {
      setFormError('Add at least an amount or a deadline'); return
    }
    setFormError('')
    setSubmitting(true)

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
    setSubmitting(false)
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
              <DateField label="Window opens" value={form.applicationOpens} onChange={v => setForm({ ...form, applicationOpens: v })} />
              <DateField label="Window closes (submission deadline)" value={form.applicationCloses} onChange={v => setForm({ ...form, applicationCloses: v })} />
              <DateField label="Our internal deadline" value={form.internalDeadline} onChange={v => setForm({ ...form, internalDeadline: v })} />
              <DateField label="School needs funds by" value={form.awardNeededBy} onChange={v => setForm({ ...form, awardNeededBy: v })} />
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

          {formError && (
            <div style={{ fontSize: 12, color: '#DC2626', marginBottom: 8 }}>{formError}</div>
          )}
          <button
            onClick={handleSubmit}
            disabled={!form.name || submitting}
            style={{
              fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 6,
              border: 'none', background: submitting ? '#9CA3AF' : '#8B5CF6', color: 'white', cursor: submitting ? 'default' : 'pointer',
              opacity: form.name && !submitting ? 1 : 0.5, alignSelf: 'flex-start',
            }}
          >
            {submitting ? 'Saving...' : formMode === 'edit' ? 'Save changes' : 'Add Opportunity'}
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
              {savedField === `status-${opp.id}` && <span style={{ fontSize: 10, fontWeight: 600, color: '#10B981' }}>Saved</span>}

              {opp.waiting_on && (
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                  background: opp.waiting_on === 'client' ? '#FEF3C7' : '#E0E7FF',
                  color: opp.waiting_on === 'client' ? '#92400E' : '#3730A3',
                }}>
                  Waiting: {opp.waiting_on}
                </span>
              )}

              {opp.application_closes && (() => {
                const days = Math.ceil((new Date(opp.application_closes + 'T00:00:00').getTime() - Date.now()) / 86400000)
                const color = days < 0 ? '#DC2626' : days <= 3 ? '#DC2626' : days <= 7 ? '#D97706' : '#6B7280'
                return (
                  <span style={{ fontSize: 11, fontWeight: days <= 7 ? 700 : 400, color }}>
                    Deadline: {new Date(opp.application_closes + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {days < 0 ? ' (passed)' : days <= 3 ? ` (${days}d left)` : ''}
                  </span>
                )
              })()}

              {/* Window status */}
              {(() => {
                const ws = opp.window_status || 'unknown'
                const wsStyle = WINDOW_STATUS_STYLES[ws] || WINDOW_STATUS_STYLES.unknown
                return (
                  <>
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
                    {savedField === `window_status-${opp.id}` && <span style={{ fontSize: 10, fontWeight: 600, color: '#10B981' }}>Saved</span>}
                  </>
                )
              })()}
            </div>

            {/* Date details row */}
            {(opp.internal_deadline || opp.award_needed_by) && (
              <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
                {opp.internal_deadline && (() => {
                  const days = Math.ceil((new Date(opp.internal_deadline + 'T00:00:00').getTime() - Date.now()) / 86400000)
                  const color = days < 0 ? '#DC2626' : days <= 3 ? '#DC2626' : days <= 7 ? '#D97706' : '#6B7280'
                  return (
                    <span style={{ fontSize: 10, color, fontWeight: 600 }}>
                      Internal: {new Date(opp.internal_deadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {days < 0 ? ' (passed)' : days <= 3 ? ` (${days}d)` : ''}
                    </span>
                  )
                })()}
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
              gateOpen={gateOpen}
              onRequestDraft={(agent) => patchOpp(opp.id, { narrative_status: 'requested', assigned_agent: agent })}
              onApprove={() => patchOpp(opp.id, { narrative_status: 'ready' })}
              onPatch={(fields) => patchOpp(opp.id, fields)}
            />

            {/* Research control */}
            <ResearchControl
              opp={opp}
              onRequest={() => patchOpp(opp.id, { research_status: 'requested', assigned_agent: defaultAgent(opp.plan_category) })}
            />

            {/* Submission panel */}
            <SubmissionPanel
              opp={opp}
              gateOpen={gateOpen}
              onPatch={(fields) => patchOpp(opp.id, fields)}
            />

            {/* Outcome + allocation (post-decision) */}
            <OutcomePanel
              opp={opp}
              onPatch={(fields) => patchOpp(opp.id, fields)}
            />
            {opp.status === 'awarded' && (
              <AllocationPanel opp={opp} pursuitId={pursuitId} contract2LineItems={contract2LineItems} contract2QuotePackageId={contract2QuotePackageId} />
            )}
          </div>
        )
      })}

      {opportunities.length === 0 && formMode === 'closed' && (
        <div style={{ padding: 24, background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
            No grant opportunities mapped yet.
          </div>
          <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, marginBottom: 12 }}>
            Research and add 3-5 grants this school is eligible for. Common sources:
          </div>
          <ul style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.8, margin: '0 0 12px 0', paddingLeft: 20 }}>
            <li>Walmart Spark Good (most schools, window Aug-Sep)</li>
            <li>Title II-A (federal, most public schools)</li>
            <li>NEA Foundation (educator-focused, rolling deadlines)</li>
            <li>Local community foundations (search by district/state)</li>
            <li>IDEA/CEIS (special education, public schools)</li>
          </ul>
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>
            Click &quot;+ Add Opportunity&quot; to start.
          </div>
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

function NarrativeControl({ opp, gateOpen, onRequestDraft, onApprove, onPatch }: {
  opp: any
  gateOpen: boolean
  onRequestDraft: (agent: string) => void
  onApprove: () => void
  onPatch: (fields: Record<string, unknown>) => void
}) {
  const [agentPick, setAgentPick] = useState(defaultAgent(opp.plan_category))
  const [showContent, setShowContent] = useState(false)
  const [qaReviewer, setQaReviewer] = useState(opp.qa_reviewer || '')
  const [qaNotes, setQaNotes] = useState(opp.qa_notes || '')

  const ns = opp.narrative_status || 'not_started'
  const agent = opp.assigned_agent || ''
  const windowOpen = opp.window_status === 'open'
  const hasContent = !!opp.narrative_content
  const hasUrl = !!opp.narrative_url
  const showReader = ['review', 'qa_review', 'ready'].includes(ns) && hasContent

  const handleQaPass = () => {
    onPatch({ narrative_status: 'qa_review', qa_passed: true, qa_reviewer: qaReviewer, qa_notes: qaNotes })
  }

  const handleQaFail = () => {
    onPatch({ narrative_status: 'drafting', qa_passed: false, qa_reviewer: qaReviewer, qa_notes: qaNotes })
  }

  return (
    <div style={{
      marginTop: 8, padding: '10px 12px', background: '#FAFAFA',
      borderRadius: 6, border: '1px solid #F3F4F6',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Narrative
        </span>

        {/* ── not_started / ready: request draft ── */}
        {(ns === 'not_started' || ns === 'ready') && opp.window_status === 'open' && (
          <>
            <select
              value={agentPick}
              onChange={e => setAgentPick(e.target.value)}
              style={{ fontSize: 10, padding: '2px 4px', border: '1px solid #E5E7EB', borderRadius: 4, background: 'white', cursor: 'pointer' }}
            >
              {AGENT_OPTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
            <button onClick={() => onRequestDraft(agentPick)} style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 4, border: 'none', background: '#8B5CF6', color: 'white', cursor: 'pointer' }}>
              {ns === 'ready' ? 'Request new draft' : 'Request draft'}
            </button>
            {ns === 'ready' && <span style={{ fontSize: 10, fontWeight: 600, color: '#10B981' }}>Approved</span>}
          </>
        )}
        {(ns === 'not_started') && opp.window_status !== 'open' && (
          <span style={{ fontSize: 10, color: '#DC2626', fontWeight: 600 }}>
            Window must be verified open before requesting a draft
          </span>
        )}

        {/* ── requested ── */}
        {ns === 'requested' && (
          <>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: '#FEF3C7', color: '#92400E' }}>
              Draft requested — waiting for {agent || 'agent'}
            </span>
            {(!windowOpen || !gateOpen) && (
              <span style={{ fontSize: 9, color: '#9CA3AF', fontStyle: 'italic' }}>
                {!gateOpen && !windowOpen
                  ? 'Draft won\'t start until the alignment gate is satisfied and the funding window is verified open'
                  : !gateOpen ? 'Draft won\'t start until the alignment gate is satisfied'
                  : 'Draft won\'t start until the funding window is verified open'}
              </span>
            )}
          </>
        )}

        {/* ── drafting ── */}
        {ns === 'drafting' && (
          <>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: '#DBEAFE', color: '#1D4ED8' }}>
              {agent || 'Agent'} is drafting...
            </span>
            {/* Show QA feedback if returning from a fail */}
            {opp.qa_passed === false && opp.qa_notes && (
              <span style={{ fontSize: 9, color: '#DC2626', fontStyle: 'italic' }}>
                QA feedback: {opp.qa_notes}
              </span>
            )}
          </>
        )}

        {/* ── review: send to QA ── */}
        {ns === 'review' && (
          <>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: '#FEF3C7', color: '#92400E' }}>
              Draft ready — needs QA
            </span>
            {hasUrl && (
              <a href={opp.narrative_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 10, color: '#8B5CF6', textDecoration: 'underline' }}>
                Open external
              </a>
            )}
            {hasContent && (
              <button onClick={() => setShowContent(!showContent)} style={{ fontSize: 9, padding: '1px 6px', borderRadius: 3, border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', cursor: 'pointer' }}>
                {showContent ? 'Hide' : 'Read inline'}
              </button>
            )}
            <button onClick={() => onPatch({ narrative_status: 'qa_review' })} style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 4, border: 'none', background: '#F59E0B', color: 'white', cursor: 'pointer' }}>
              Send to QA
            </button>
          </>
        )}

        {/* ── qa_review: QA pass/fail ── */}
        {ns === 'qa_review' && (
          <>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: '#EDE9FE', color: '#6D28D9' }}>
              In QA review
            </span>
            {hasUrl && (
              <a href={opp.narrative_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 10, color: '#8B5CF6', textDecoration: 'underline' }}>
                Open external
              </a>
            )}
            {hasContent && (
              <button onClick={() => setShowContent(!showContent)} style={{ fontSize: 9, padding: '1px 6px', borderRadius: 3, border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', cursor: 'pointer' }}>
                {showContent ? 'Hide' : 'Read inline'}
              </button>
            )}
            {opp.qa_passed === true && (
              <button onClick={onApprove} style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 4, border: 'none', background: '#10B981', color: 'white', cursor: 'pointer' }}>
                Approve (QA passed)
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Inline narrative reader ── */}
      {showReader && showContent && (
        <NarrativeReader content={opp.narrative_content} url={opp.narrative_url} />
      )}

      {/* ── Inline reader fallback: URL only ── */}
      {['review', 'qa_review', 'ready'].includes(ns) && !hasContent && hasUrl && !showContent && (
        <div style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>
          No inline content — <a href={opp.narrative_url} target="_blank" rel="noopener noreferrer" style={{ color: '#8B5CF6' }}>open external document</a>
        </div>
      )}

      {/* ── QA panel (shown during qa_review when QA hasn't passed yet) ── */}
      {ns === 'qa_review' && opp.qa_passed !== true && (
        <div style={{
          padding: '10px 14px', background: '#F5F3FF', border: '1px solid #DDD6FE',
          borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#6D28D9', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            QA Review
          </div>
          <input
            value={qaReviewer}
            onChange={e => setQaReviewer(e.target.value)}
            placeholder="Reviewer name (e.g. Julie)"
            style={{ fontSize: 12, padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: 6 }}
          />
          <textarea
            value={qaNotes}
            onChange={e => setQaNotes(e.target.value)}
            placeholder="QA notes (required for fail, optional for pass)"
            rows={3}
            style={{ fontSize: 12, padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: 6, resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleQaPass}
              disabled={!qaReviewer}
              style={{
                fontSize: 11, fontWeight: 600, padding: '5px 14px', borderRadius: 6,
                border: 'none', background: qaReviewer ? '#10B981' : '#D1D5DB',
                color: 'white', cursor: qaReviewer ? 'pointer' : 'default',
              }}
            >
              Pass
            </button>
            <button
              onClick={handleQaFail}
              disabled={!qaReviewer || !qaNotes}
              style={{
                fontSize: 11, fontWeight: 600, padding: '5px 14px', borderRadius: 6,
                border: 'none', background: (qaReviewer && qaNotes) ? '#DC2626' : '#D1D5DB',
                color: 'white', cursor: (qaReviewer && qaNotes) ? 'pointer' : 'default',
              }}
            >
              Fail (return to drafting)
            </button>
          </div>
          {!qaReviewer && <div style={{ fontSize: 9, color: '#9CA3AF' }}>Enter reviewer name to enable pass/fail</div>}
          {qaReviewer && !qaNotes && <div style={{ fontSize: 9, color: '#9CA3AF' }}>Notes required to fail — agent needs feedback</div>}
        </div>
      )}

      {/* QA passed confirmation */}
      {ns === 'qa_review' && opp.qa_passed === true && (
        <div style={{ fontSize: 11, color: '#065F46', background: '#D1FAE5', padding: '6px 10px', borderRadius: 6 }}>
          QA passed{opp.qa_reviewer ? ` by ${opp.qa_reviewer}` : ''}{opp.qa_notes ? ` — ${opp.qa_notes}` : ''}. Ready for final approval.
        </div>
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

// ── Submission panel ──

const FWD_OPTIONS = [
  { value: 'not_started', label: 'Not started', bg: '#F3F4F6', color: '#6B7280' },
  { value: 'drafted', label: 'Drafted', bg: '#FEF3C7', color: '#92400E' },
  { value: 'sent', label: 'Sent', bg: '#D1FAE5', color: '#065F46' },
]

function SubmissionPanel({ opp, gateOpen, onPatch }: {
  opp: any
  gateOpen: boolean
  onPatch: (fields: Record<string, unknown>) => void
}) {
  const [proofInput, setProofInput] = useState('')
  const [showSubmitForm, setShowSubmitForm] = useState(false)

  const submitted = opp.client_submitted === true
  const districtRouted = opp.routed_through_district === true
  const routingConfirmed = opp.district_routing_confirmed === true
  const fwdStatus = opp.forwarding_email_status || 'not_started'

  // Anti-bounce: block submission for district-routed paths until routing confirmed
  const submitBlocked = districtRouted && !routingConfirmed

  // Deadline checkpoints
  const deadline = opp.application_closes || opp.internal_deadline
  let daysLeft: number | null = null
  if (deadline) {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    daysLeft = Math.floor((new Date(deadline + 'T00:00:00').getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  const narrativeReady = opp.narrative_status === 'ready'
  const fwdSent = fwdStatus === 'sent'

  // Don't show for awarded/denied
  if (['awarded', 'denied'].includes(opp.status)) return null

  const handleSubmit = () => {
    onPatch({
      client_submitted: true,
      client_submitted_proof: proofInput || null,
    })
    setShowSubmitForm(false)
    setProofInput('')
  }

  const handleUnsubmit = () => {
    onPatch({
      client_submitted: false,
      client_submitted_proof: null,
    })
  }

  return (
    <div style={{
      marginTop: 8, padding: '10px 12px', background: '#FAFAFA',
      borderRadius: 6, border: '1px solid #F3F4F6',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Submission
        </span>

        {/* Submission status */}
        {submitted ? (
          <>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: '#D1FAE5', color: '#065F46' }}>
              Submitted
            </span>
            {opp.client_submitted_at && (
              <span style={{ fontSize: 10, color: '#6B7280' }}>
                {new Date(opp.client_submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
            {opp.client_submitted_proof && (
              <span style={{ fontSize: 10, color: '#6B7280', fontStyle: 'italic' }}>
                {opp.client_submitted_proof}
              </span>
            )}
            <button onClick={handleUnsubmit} style={{ fontSize: 9, padding: '1px 6px', borderRadius: 3, border: '1px solid #E5E7EB', background: 'white', color: '#9CA3AF', cursor: 'pointer' }}>
              Correct
            </button>
          </>
        ) : (
          <>
            {!showSubmitForm ? (
              <button
                onClick={() => submitBlocked ? null : setShowSubmitForm(true)}
                disabled={submitBlocked}
                style={{
                  fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 4,
                  border: 'none', background: submitBlocked ? '#E5E7EB' : '#10B981',
                  color: submitBlocked ? '#9CA3AF' : 'white',
                  cursor: submitBlocked ? 'default' : 'pointer',
                }}
              >
                Mark submitted
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <input
                  value={proofInput}
                  onChange={e => setProofInput(e.target.value)}
                  placeholder="Proof (confirmation #, person + date)"
                  style={{ fontSize: 11, padding: '4px 8px', border: '1px solid #E5E7EB', borderRadius: 4, width: 220 }}
                  onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
                />
                <button onClick={handleSubmit} style={{ fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 4, border: 'none', background: '#10B981', color: 'white', cursor: 'pointer' }}>
                  Confirm
                </button>
                <button onClick={() => { setShowSubmitForm(false); setProofInput('') }} style={{ fontSize: 10, padding: '4px 8px', borderRadius: 4, border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Anti-bounce warning */}
      {submitBlocked && !submitted && (
        <div style={{
          padding: '8px 12px', background: '#FEF3C7', border: '1px solid #FDE68A',
          borderRadius: 6, fontSize: 11, color: '#92400E', lineHeight: 1.5,
        }}>
          This path routes through the district office. Confirm it advanced past district routing to the funder before marking submitted — an email to a district inbox is not a submission to the funder (the Title II-A lesson).
        </div>
      )}

      {/* District routing + forwarding email + readiness row */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* District routing toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={districtRouted}
            onChange={e => onPatch({ routed_through_district: e.target.checked, ...(!e.target.checked ? { district_routing_confirmed: false } : {}) })}
            style={{ accentColor: '#8B5CF6' }}
          />
          <span style={{ fontSize: 10, color: '#374151' }}>District-routed</span>
        </label>

        {districtRouted && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={routingConfirmed}
              onChange={e => onPatch({ district_routing_confirmed: e.target.checked })}
              style={{ accentColor: '#10B981' }}
            />
            <span style={{ fontSize: 10, color: routingConfirmed ? '#065F46' : '#92400E', fontWeight: 600 }}>
              {routingConfirmed ? 'Routing confirmed' : 'Routing not confirmed'}
            </span>
          </label>
        )}

        {/* Forwarding email status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10, color: '#6B7280' }}>Fwd email:</span>
          <select
            value={fwdStatus}
            onChange={e => onPatch({ forwarding_email_status: e.target.value })}
            style={{
              fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
              border: '1px solid #E5E7EB', cursor: 'pointer',
              background: FWD_OPTIONS.find(o => o.value === fwdStatus)?.bg || '#F3F4F6',
              color: FWD_OPTIONS.find(o => o.value === fwdStatus)?.color || '#6B7280',
            }}
          >
            {FWD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Deadline readiness checkpoints */}
      {daysLeft !== null && daysLeft <= 14 && daysLeft >= 0 && !submitted && (
        <div style={{
          padding: '8px 12px', background: daysLeft <= 2 ? '#FEF2F2' : daysLeft <= 7 ? '#FFFBEB' : '#F9FAFB',
          border: `1px solid ${daysLeft <= 2 ? '#FECACA' : daysLeft <= 7 ? '#FDE68A' : '#E5E7EB'}`,
          borderRadius: 6, fontSize: 10, color: '#374151',
        }}>
          <div style={{ fontWeight: 700, marginBottom: 4, color: daysLeft <= 2 ? '#DC2626' : daysLeft <= 7 ? '#92400E' : '#374151' }}>
            {daysLeft === 0 ? 'DEADLINE TODAY' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} to deadline`} — readiness check
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ color: narrativeReady ? '#065F46' : '#9CA3AF' }}>
              {narrativeReady ? '\u2713' : '\u2717'} Narrative {narrativeReady ? 'ready' : 'not ready'}
            </span>
            <span style={{ color: gateOpen ? '#065F46' : '#9CA3AF' }}>
              {gateOpen ? '\u2713' : '\u2717'} Gate {gateOpen ? 'open' : 'not open'}
            </span>
            <span style={{ color: fwdSent ? '#065F46' : '#9CA3AF' }}>
              {fwdSent ? '\u2713' : '\u2717'} Fwd email {fwdSent ? 'sent' : 'not sent'}
            </span>
            {districtRouted && (
              <span style={{ color: routingConfirmed ? '#065F46' : '#DC2626' }}>
                {routingConfirmed ? '\u2713' : '\u2717'} District routing {routingConfirmed ? 'confirmed' : 'not confirmed'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Outcome panel (record award/denial) ──

function OutcomePanel({ opp, onPatch }: { opp: any; onPatch: (fields: Record<string, unknown>) => void }) {
  const [mode, setMode] = useState<'idle' | 'award' | 'deny'>('idle')
  const [awardedAmt, setAwardedAmt] = useState(String(opp.amount || ''))
  const [decisionDate, setDecisionDate] = useState(new Date().toISOString().split('T')[0])
  const [denialReason, setDenialReason] = useState('')

  // Already decided — show the outcome
  if (opp.status === 'awarded') {
    return (
      <div style={{ marginTop: 8, padding: '8px 12px', background: '#D1FAE5', borderRadius: 6, border: '1px solid #6EE7B7', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#065F46', textTransform: 'uppercase', letterSpacing: 0.5 }}>Awarded</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#065F46' }}>
          ${(opp.awarded_amount ?? opp.amount ?? 0).toLocaleString()}
        </span>
        {opp.decision_date && (
          <span style={{ fontSize: 10, color: '#065F46' }}>
            on {new Date(opp.decision_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        )}
        <button onClick={() => onPatch({ status: 'waiting', awarded_amount: null, decision_date: null })} style={{ fontSize: 9, padding: '1px 6px', borderRadius: 3, border: '1px solid #6EE7B7', background: 'white', color: '#065F46', cursor: 'pointer', marginLeft: 'auto' }}>
          Correct
        </button>
      </div>
    )
  }

  if (opp.status === 'denied') {
    return (
      <div style={{ marginTop: 8, padding: '8px 12px', background: '#FEF2F2', borderRadius: 6, border: '1px solid #FECACA', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Denied</span>
        {opp.decision_date && (
          <span style={{ fontSize: 10, color: '#991B1B' }}>
            on {new Date(opp.decision_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        )}
        {opp.denial_reason && <span style={{ fontSize: 11, color: '#991B1B', fontStyle: 'italic' }}>{opp.denial_reason}</span>}
        <button onClick={() => onPatch({ status: 'waiting', denial_reason: null, decision_date: null })} style={{ fontSize: 9, padding: '1px 6px', borderRadius: 3, border: '1px solid #FECACA', background: 'white', color: '#991B1B', cursor: 'pointer', marginLeft: 'auto' }}>
          Correct
        </button>
      </div>
    )
  }

  // Not yet decided — show record buttons or form
  if (!['applied', 'waiting', 'submitted'].includes(opp.status) && opp.status !== 'stalled') return null

  return (
    <div style={{ marginTop: 8, padding: '10px 12px', background: '#FAFAFA', borderRadius: 6, border: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Outcome</span>
        {mode === 'idle' && (
          <>
            <button onClick={() => { setAwardedAmt(String(opp.amount || '')); setMode('award') }} style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 4, border: 'none', background: '#10B981', color: 'white', cursor: 'pointer' }}>
              Record award
            </button>
            <button onClick={() => setMode('deny')} style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 4, border: 'none', background: '#DC2626', color: 'white', cursor: 'pointer' }}>
              Record denial
            </button>
          </>
        )}
      </div>

      {mode === 'award' && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: 9, color: '#6B7280', display: 'block', marginBottom: 2 }}>Awarded amount ($)</label>
            <input type="number" value={awardedAmt} onChange={e => setAwardedAmt(e.target.value)} style={{ fontSize: 12, padding: '5px 8px', border: '1px solid #E5E7EB', borderRadius: 4, width: 120 }} />
          </div>
          <div>
            <label style={{ fontSize: 9, color: '#6B7280', display: 'block', marginBottom: 2 }}>Decision date</label>
            <input type="date" value={decisionDate} onChange={e => setDecisionDate(e.target.value)} style={{ fontSize: 12, padding: '5px 8px', border: '1px solid #E5E7EB', borderRadius: 4 }} />
          </div>
          <button onClick={() => { onPatch({ status: 'awarded', awarded_amount: parseFloat(awardedAmt) || 0, decision_date: decisionDate }); setMode('idle') }} style={{ fontSize: 10, fontWeight: 600, padding: '5px 12px', borderRadius: 4, border: 'none', background: '#10B981', color: 'white', cursor: 'pointer' }}>
            Confirm award
          </button>
          <button onClick={() => setMode('idle')} style={{ fontSize: 10, padding: '5px 8px', borderRadius: 4, border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', cursor: 'pointer' }}>
            Cancel
          </button>
          {awardedAmt && parseFloat(awardedAmt) < (opp.amount || 0) && (
            <span style={{ fontSize: 9, color: '#D97706' }}>Partial award (requested ${(opp.amount || 0).toLocaleString()})</span>
          )}
        </div>
      )}

      {mode === 'deny' && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 9, color: '#6B7280', display: 'block', marginBottom: 2 }}>Reason</label>
            <input value={denialReason} onChange={e => setDenialReason(e.target.value)} placeholder="e.g. Not eligible, underfunded cycle" style={{ fontSize: 12, padding: '5px 8px', border: '1px solid #E5E7EB', borderRadius: 4, width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: 9, color: '#6B7280', display: 'block', marginBottom: 2 }}>Decision date</label>
            <input type="date" value={decisionDate} onChange={e => setDecisionDate(e.target.value)} style={{ fontSize: 12, padding: '5px 8px', border: '1px solid #E5E7EB', borderRadius: 4 }} />
          </div>
          <button onClick={() => { onPatch({ status: 'denied', denial_reason: denialReason, decision_date: decisionDate }); setMode('idle') }} style={{ fontSize: 10, fontWeight: 600, padding: '5px 12px', borderRadius: 4, border: 'none', background: '#DC2626', color: 'white', cursor: 'pointer' }}>
            Confirm denial
          </button>
          <button onClick={() => setMode('idle')} style={{ fontSize: 10, padding: '5px 8px', borderRadius: 4, border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

// ── Allocation panel (map award to line items + handoff) ──

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  allocated: { bg: '#DBEAFE', color: '#1D4ED8' },
  delivered: { bg: '#FEF3C7', color: '#92400E' },
  invoiced: { bg: '#D1FAE5', color: '#065F46' },
}

function AllocationPanel({ opp, pursuitId, contract2LineItems, contract2QuotePackageId }: {
  opp: any; pursuitId: string; contract2LineItems?: any[]; contract2QuotePackageId?: string
}) {
  const [allocations, setAllocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newAmount, setNewAmount] = useState('')

  // Extract line items from Contract 2 packages
  const c2Items = (contract2LineItems || []).flatMap((pkg: any) =>
    (pkg.line_items || []).map((li: any) => ({ ...li, packageId: pkg.id }))
  )

  const fetchAllocations = () => {
    fetch(`/api/funding/allocations?opportunityId=${opp.id}`)
      .then(r => r.json())
      .then(d => { setAllocations(d.allocations || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchAllocations() }, [opp.id])

  const awardedAmt = opp.awarded_amount ?? opp.amount ?? 0
  const allocatedTotal = allocations.reduce((sum: number, a: any) => sum + (a.allocated_amount || 0), 0)
  const remaining = awardedAmt - allocatedTotal

  const handleAdd = async () => {
    // If selected from Contract 2 line items, include the package id
    const selectedC2 = c2Items.find(li => li.label === newLabel)
    await fetch('/api/funding/allocations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pursuitId,
        opportunityId: opp.id,
        lineItemKey: newLabel,
        allocatedAmount: parseFloat(newAmount) || 0,
        quotePackageId: selectedC2?.packageId || contract2QuotePackageId || null,
      }),
    })
    setNewLabel('')
    setNewAmount('')
    setShowAdd(false)
    fetchAllocations()
  }

  const handleHandoff = async (id: string, type: 'trainer' | 'finance') => {
    await fetch('/api/funding/allocations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...(type === 'trainer' ? { handToTrainer: true } : { handToFinance: true }) }),
    })
    fetchAllocations()
  }

  const handleDelete = async (id: string) => {
    await fetch('/api/funding/allocations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchAllocations()
  }

  if (loading) return null

  return (
    <div style={{ marginTop: 8, padding: '10px 12px', background: '#FAFAFA', borderRadius: 6, border: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Header with totals */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Allocations</span>
        <span style={{ fontSize: 11, color: '#374151' }}>
          ${awardedAmt.toLocaleString()} awarded
        </span>
        <span style={{ fontSize: 11, color: '#1D4ED8', fontWeight: 600 }}>
          ${allocatedTotal.toLocaleString()} allocated
        </span>
        {remaining > 0 && (
          <span style={{ fontSize: 11, color: '#D97706', fontWeight: 600 }}>
            ${remaining.toLocaleString()} to allocate
          </span>
        )}
        {remaining === 0 && allocations.length > 0 && (
          <span style={{ fontSize: 10, color: '#065F46', fontWeight: 600 }}>Fully allocated</span>
        )}
        <button onClick={() => setShowAdd(!showAdd)} style={{ fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 4, border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', cursor: 'pointer', marginLeft: 'auto' }}>
          {showAdd ? 'Cancel' : '+ Allocate'}
        </button>
      </div>

      {/* Progress bar */}
      {awardedAmt > 0 && (
        <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min((allocatedTotal / awardedAmt) * 100, 100)}%`, background: remaining <= 0 ? '#10B981' : '#3B82F6', borderRadius: 2, transition: 'width 0.2s' }} />
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 9, color: '#6B7280', display: 'block', marginBottom: 2 }}>Line item{c2Items.length > 0 ? ' (from Contract 2)' : ''}</label>
            {c2Items.length > 0 ? (
              <select
                value={newLabel}
                onChange={e => {
                  const label = e.target.value
                  setNewLabel(label)
                  const li = c2Items.find(i => i.label === label)
                  if (li) setNewAmount(String(li.total || ''))
                }}
                style={{ fontSize: 12, padding: '5px 8px', border: '1px solid #E5E7EB', borderRadius: 4, width: '100%' }}
              >
                <option value="">Select line item...</option>
                {c2Items.map((li: any, i: number) => (
                  <option key={i} value={li.label}>{li.label} (${(li.total || 0).toLocaleString()})</option>
                ))}
                <option value="__custom">Other (custom)</option>
              </select>
            ) : (
              <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="e.g. On-Campus Observation Visit" style={{ fontSize: 12, padding: '5px 8px', border: '1px solid #E5E7EB', borderRadius: 4, width: '100%' }} />
            )}
            {newLabel === '__custom' && (
              <input
                value=""
                onChange={e => setNewLabel(e.target.value)}
                placeholder="Custom line item name"
                autoFocus
                style={{ fontSize: 12, padding: '5px 8px', border: '1px solid #E5E7EB', borderRadius: 4, width: '100%', marginTop: 4 }}
              />
            )}
          </div>
          <div>
            <label style={{ fontSize: 9, color: '#6B7280', display: 'block', marginBottom: 2 }}>Amount ($)</label>
            <input type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder={String(remaining)} style={{ fontSize: 12, padding: '5px 8px', border: '1px solid #E5E7EB', borderRadius: 4, width: 100 }} />
          </div>
          <button onClick={handleAdd} disabled={!newLabel || !newAmount} style={{ fontSize: 10, fontWeight: 600, padding: '5px 12px', borderRadius: 4, border: 'none', background: (newLabel && newAmount) ? '#8B5CF6' : '#D1D5DB', color: 'white', cursor: (newLabel && newAmount) ? 'pointer' : 'default' }}>
            Add
          </button>
        </div>
      )}

      {/* Allocation rows */}
      {allocations.map((alloc: any) => {
        const st = alloc.line_item_status || 'allocated'
        const stStyle = STATUS_COLORS[st] || STATUS_COLORS.allocated
        return (
          <div key={alloc.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'white', borderRadius: 6, border: '1px solid #F3F4F6' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#0a0f1e', flex: 1 }}>{alloc.line_item_key}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0a0f1e' }}>${(alloc.allocated_amount || 0).toLocaleString()}</span>
            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: stStyle.bg, color: stStyle.color }}>
              {st}
            </span>

            {/* Handoff buttons */}
            {st === 'allocated' && (
              <button onClick={() => handleHandoff(alloc.id, 'trainer')} title="Hand to trainer (delivery)" style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', cursor: 'pointer' }}>
                Deliver
              </button>
            )}
            {st === 'delivered' && (
              <>
                <span style={{ fontSize: 9, color: '#6B7280' }}>
                  {alloc.handed_to_trainer_at ? new Date(alloc.handed_to_trainer_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                </span>
                <button onClick={() => handleHandoff(alloc.id, 'finance')} title="Hand to finance (invoicing)" style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', cursor: 'pointer' }}>
                  Invoice
                </button>
              </>
            )}
            {st === 'invoiced' && (
              <span style={{ fontSize: 9, color: '#065F46' }}>
                {alloc.handed_to_finance_at ? new Date(alloc.handed_to_finance_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
              </span>
            )}

            {/* Delete (only if allocated, not yet handed off) */}
            {st === 'allocated' && (
              <button onClick={() => handleDelete(alloc.id)} style={{ fontSize: 9, padding: '1px 4px', borderRadius: 3, border: '1px solid #E5E7EB', background: 'white', color: '#D1D5DB', cursor: 'pointer' }}>
                x
              </button>
            )}
          </div>
        )
      })}

      {allocations.length === 0 && !showAdd && (
        <div style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>No allocations yet — click "+ Allocate" to map award to line items</div>
      )}
    </div>
  )
}

function NarrativeReader({ content, url }: { content: string; url?: string | null }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div>
      <div style={{
        padding: '12px 14px', background: 'white', border: '1px solid #E5E7EB',
        borderRadius: 8, maxHeight: expanded ? 'none' : 300, overflowY: expanded ? 'visible' : 'auto',
        fontSize: 13, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap',
      }}>
        {content}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ fontSize: 11, color: '#8B5CF6', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
        >
          {expanded ? 'Collapse' : 'Read full narrative'}
        </button>
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#8B5CF6', textDecoration: 'underline' }}>
            Open Google Doc
          </a>
        )}
        <button
          onClick={() => { navigator.clipboard.writeText(content); }}
          style={{ fontSize: 11, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
        >
          Copy text
        </button>
      </div>
    </div>
  )
}
