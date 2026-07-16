'use client'

import { useState } from 'react'
import { OwnerAvatar, ownerName } from '../OwnerAvatar'

interface OverviewTabProps {
  pursuit: any
  gate?: any
  onGateUpdate?: (gate: any) => void
  partnershipHealth?: any
  renewalEligible?: boolean
  contract1?: any
  contract2?: any
  contract2LineItems?: any[]
}

const GATE_ROLE_LABELS: Record<string, string> = {
  submitter: 'Submitter',
  backup: 'Backup',
  admin_sponsor: 'Admin Sponsor',
}

export function OverviewTab({ pursuit, gate: initialGate, onGateUpdate, partnershipHealth, renewalEligible, contract1, contract2, contract2LineItems }: OverviewTabProps) {
  const p = pursuit
  const eligibility = p.eligibility_snapshot || {}
  const hasContact = p.client_contact_name || p.client_contact_email || p.client_contact_phone || p.client_contact_role

  const [gate, setGate] = useState<any>(initialGate ?? null)
  const [editingGate, setEditingGate] = useState(false)
  const [gateDraft, setGateDraft] = useState({
    submitter_name: '', submitter_email: '',
    backup_name: '', backup_email: '',
    admin_sponsor_name: '', admin_sponsor_email: '',
    contract1_signed: false, contract2_signed: false,
  })
  const [savingGate, setSavingGate] = useState(false)

  // 5 gate conditions for the checklist
  const gateConditions = gate ? [
    { label: 'Submitter named', met: !!(gate.submitter_name && gate.submitter_email) },
    { label: 'Backup named', met: !!(gate.backup_name && gate.backup_email) },
    { label: 'Admin sponsor named', met: !!(gate.admin_sponsor_name && gate.admin_sponsor_email) },
    { label: 'Contract 1 signed', met: gate.contract1_signed === true },
    { label: 'Contract 2 signed', met: gate.contract2_signed === true },
  ] : []
  const conditionsMet = gateConditions.filter(c => c.met).length
  const conditionsTotal = gateConditions.length

  const startEditGate = () => {
    setGateDraft({
      submitter_name: gate?.submitter_name || '',
      submitter_email: gate?.submitter_email || '',
      backup_name: gate?.backup_name || '',
      backup_email: gate?.backup_email || '',
      admin_sponsor_name: gate?.admin_sponsor_name || '',
      admin_sponsor_email: gate?.admin_sponsor_email || '',
      contract1_signed: gate?.contract1_signed || false,
      contract2_signed: gate?.contract2_signed || false,
    })
    setEditingGate(true)
  }

  const saveGate = async () => {
    setSavingGate(true)
    const res = await fetch(`/api/funding/pursuits/${p.id}/gate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gateDraft),
    })
    const result = await res.json()
    if (result.gate) {
      setGate(result.gate)
      onGateUpdate?.(result.gate)
    }
    setSavingGate(false)
    setEditingGate(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Escalation Gate */}
      <Section title="Alignment Gate">
        {editingGate ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16, background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB' }}>
            {(['submitter', 'backup', 'admin_sponsor'] as const).map(role => (
              <div key={role}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  {GATE_ROLE_LABELS[role]}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    value={gateDraft[`${role}_name` as keyof typeof gateDraft] as string}
                    onChange={e => setGateDraft({ ...gateDraft, [`${role}_name`]: e.target.value })}
                    placeholder="Name"
                    style={{ fontSize: 12, padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: 6, flex: 1 }}
                  />
                  <input
                    value={gateDraft[`${role}_email` as keyof typeof gateDraft] as string}
                    onChange={e => setGateDraft({ ...gateDraft, [`${role}_email`]: e.target.value })}
                    placeholder="Email"
                    style={{ fontSize: 12, padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: 6, flex: 1 }}
                  />
                </div>
              </div>
            ))}
            {/* Contract signed toggles */}
            <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={gateDraft.contract1_signed as boolean}
                  onChange={e => setGateDraft({ ...gateDraft, contract1_signed: e.target.checked })}
                  style={{ accentColor: '#8B5CF6' }}
                />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Contract 1 signed</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={gateDraft.contract2_signed as boolean}
                  onChange={e => setGateDraft({ ...gateDraft, contract2_signed: e.target.checked })}
                  style={{ accentColor: '#8B5CF6' }}
                />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Contract 2 signed</span>
              </label>
            </div>
            <div style={{ fontSize: 10, color: '#9CA3AF', fontStyle: 'italic', marginTop: 2 }}>
              Gate status is computed automatically from the 5 conditions above
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <button
                onClick={saveGate}
                disabled={savingGate}
                style={{
                  fontSize: 12, fontWeight: 600, padding: '6px 16px', borderRadius: 6,
                  border: 'none', background: '#8B5CF6', color: 'white', cursor: 'pointer',
                  opacity: savingGate ? 0.6 : 1,
                }}
              >
                {savingGate ? 'Saving...' : 'Save gate'}
              </button>
              <button
                onClick={() => setEditingGate(false)}
                style={{
                  fontSize: 12, padding: '6px 12px', borderRadius: 6,
                  border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : gate ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Overall gate status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: gate.gate_open ? '#10B981' : '#DC2626',
              }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: gate.gate_open ? '#065F46' : '#991B1B' }}>
                {gate.gate_open
                  ? 'Gate: OPEN'
                  : `Gate: not yet satisfied — ${conditionsTotal - conditionsMet} of ${conditionsTotal} condition${conditionsTotal - conditionsMet !== 1 ? 's' : ''} remaining`
                }
              </span>
              <button
                onClick={startEditGate}
                style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 4,
                  border: '1px solid #E5E7EB', background: 'white', color: '#6B7280',
                  cursor: 'pointer', marginLeft: 'auto',
                }}
              >
                Edit
              </button>
            </div>

            {/* 5-condition checklist */}
            <div style={{
              padding: '10px 14px', background: '#F9FAFB', borderRadius: 8,
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              {gateConditions.map((cond, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: cond.met ? '#10B981' : '#D1D5DB' }}>
                    {cond.met ? '\u2713' : '\u2717'}
                  </span>
                  <span style={{ fontSize: 12, color: cond.met ? '#374151' : '#9CA3AF' }}>
                    {cond.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Continuity check (1.5) */}
            <ContinuityCheck gate={gate} pursuitId={p.id} onUpdate={(g: any) => setGate(g)} />

            {/* Contact details */}
            {['submitter', 'backup', 'admin_sponsor'].map(role => {
              const name = gate[`${role}_name`]
              const email = gate[`${role}_email`]
              const filled = name || email
              return (
                <div key={role} style={{
                  padding: '10px 14px', background: '#F9FAFB', borderRadius: 8,
                  borderLeft: `3px solid ${filled ? '#8B5CF6' : '#E5E7EB'}`,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {GATE_ROLE_LABELS[role] || role}
                  </div>
                  {filled ? (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0a0f1e', marginTop: 2 }}>{name || '—'}</div>
                      {email && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>{email}</div>}
                    </>
                  ) : (
                    <div style={{ fontSize: 12, color: '#D1D5DB', fontStyle: 'italic', marginTop: 2 }}>Not assigned</div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>No gate configured</span>
            <button
              onClick={startEditGate}
              style={{
                fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 6,
                border: 'none', background: '#8B5CF6', color: 'white', cursor: 'pointer',
              }}
            >
              Set up gate
            </button>
          </div>
        )}
      </Section>

      {/* Two-Contract Scoping */}
      <TwoContractSection
        pursuit={p}
        gate={gate}
        contract1={contract1}
        contract2={contract2}
        contract2LineItems={contract2LineItems}
        onGateUpdate={(g: any) => setGate(g)}
      />

      {/* Client Contact */}
      <Section title="Client Contact">
        {hasContact ? (
          <div style={{
            padding: '14px 16px', background: '#F9FAFB', borderRadius: 10,
            borderLeft: '4px solid #8B5CF6',
          }}>
            {p.client_contact_name && (
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0a0f1e' }}>{p.client_contact_name}</div>
            )}
            {p.client_contact_role && (
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{p.client_contact_role}</div>
            )}
            {p.client_contact_email && (
              <div style={{ fontSize: 12, color: '#374151', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                {p.client_contact_email}
                <CopyButton text={p.client_contact_email} />
              </div>
            )}
            {p.client_contact_phone && (
              <div style={{ fontSize: 12, color: '#374151', marginTop: 2 }}>{p.client_contact_phone}</div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>No client contact set</div>
        )}
      </Section>

      {/* School Profile + Data Quality */}
      <SchoolProfileSection pursuit={p} />

      {/* Funding Stats */}
      <Section title="Funding Stats">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: '#F9FAFB', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>Total Amount</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0a0f1e', marginTop: 4 }}>
              ${p.total_amount?.toLocaleString() || '0'}
            </div>
          </div>
          <div style={{ background: '#F9FAFB', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>Deadline</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0a0f1e', marginTop: 4 }}>
              {p.submission_deadline
                ? new Date(p.submission_deadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : '--'}
            </div>
          </div>
        </div>
      </Section>

      {/* Strategy Notes */}
      <Section title="Strategy Notes">
        {p.internal_notes ? (
          <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6, background: '#F9FAFB', padding: '12px 14px', borderRadius: 8 }}>
            {p.internal_notes}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>No notes</div>
        )}
      </Section>

      {/* Owners */}
      <Section title="Owners">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { role: 'Operations', email: p.operational_owner_email },
            { role: 'Strategy', email: p.strategy_owner_email },
            { role: 'Drafting', email: p.drafting_owner_email },
            { role: 'Final Approver', email: p.final_approver_email },
          ].map(o => (
            <div key={o.role} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#F9FAFB', borderRadius: 8 }}>
              <OwnerAvatar email={o.email} size={28} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0a0f1e' }}>{ownerName(o.email)}</div>
                <div style={{ fontSize: 10, color: '#6B7280' }}>{o.role}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Eligibility Snapshot */}
      {Object.keys(eligibility).length > 0 && (
        <Section title="Eligibility Snapshot">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {Object.entries(eligibility).map(([key, val]) => (
              <div key={key} style={{ padding: '8px 12px', background: '#F9FAFB', borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>{key.replace(/_/g, ' ')}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0a0f1e', marginTop: 2 }}>{String(val)}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Delivery & Health (from linked partnership) ── */}
      <DeliveryHealthSection partnershipHealth={partnershipHealth} />

      {/* ── Renewal eligibility ── */}
      <RenewalSection
        pursuit={p}
        renewalEligible={renewalEligible}
        hasPartnership={!!partnershipHealth}
      />
    </div>
  )
}

// ── Two-Contract Scoping ──

const CONTRACT_STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  signed: { bg: '#D1FAE5', color: '#065F46' },
  sent: { bg: '#DBEAFE', color: '#1D4ED8' },
  viewed: { bg: '#FEF3C7', color: '#92400E' },
  expired: { bg: '#FEE2E2', color: '#991B1B' },
  draft: { bg: '#F3F4F6', color: '#6B7280' },
}

function TwoContractSection({ pursuit, gate, contract1, contract2, contract2LineItems, onGateUpdate }: {
  pursuit: any; gate: any; contract1: any; contract2: any; contract2LineItems?: any[]; onGateUpdate: (g: any) => void
}) {
  const [linking, setLinking] = useState<'c1' | 'c2' | null>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const searchQuotes = async (term: string) => {
    setSearchTerm(term)
    if (term.length < 2) { setSearchResults([]); return }
    setSearching(true)
    const res = await fetch(`/api/funding/quotes-search?q=${encodeURIComponent(term)}`)
    const data = await res.json()
    setSearchResults(data.quotes || [])
    setSearching(false)
  }

  const linkContract = async (slotKey: 'contract1_quote_id' | 'contract2_quote_id', quoteId: string, contractType: 'minimum' | 'grant_funded') => {
    // Update gate with the quote id
    const gateRes = await fetch(`/api/funding/pursuits/${pursuit.id}/gate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [slotKey]: quoteId }),
    })
    const gateResult = await gateRes.json()
    if (gateResult.gate) onGateUpdate(gateResult.gate)

    // Set the quote's contract_type
    await fetch('/api/funding/opportunities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      // Reuse a simple direct patch — but we need a quotes patch. Use inline.
      body: JSON.stringify({ id: quoteId }),
    })
    // Direct supabase update for contract_type via a lightweight endpoint
    await fetch(`/api/quotes/${quoteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contract_type: contractType }),
    }).catch(() => {})

    setLinking(null)
    setSearchResults([])
    setSearchTerm('')
  }

  const slots = [
    { key: 'c1' as const, label: 'Contract 1 — Minimum', subtitle: 'Own-budget, guaranteed scope', contract: contract1, gateField: 'contract1_quote_id' as const, type: 'minimum' as const, signedField: 'contract1_signed' },
    { key: 'c2' as const, label: 'Contract 2 — Grant Funded', subtitle: 'Dream scope, funding-contingent, independently-priced line items', contract: contract2, gateField: 'contract2_quote_id' as const, type: 'grant_funded' as const, signedField: 'contract2_signed' },
  ]

  return (
    <Section title="Two-Contract Scoping">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {slots.map(slot => {
          const c = slot.contract
          const isSigned = c?.status === 'signed'
          const gateSigned = gate?.[slot.signedField] === true
          const statusStyle = c ? (CONTRACT_STATUS_STYLES[c.status] || CONTRACT_STATUS_STYLES.draft) : null

          return (
            <div key={slot.key} style={{
              padding: '12px 14px', background: '#F9FAFB', borderRadius: 8,
              borderLeft: `3px solid ${c ? (isSigned ? '#10B981' : '#8B5CF6') : '#E5E7EB'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{slot.label}</div>
                  <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>{slot.subtitle}</div>
                </div>
                {c && statusStyle && (
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: statusStyle.bg, color: statusStyle.color }}>
                    {c.status}
                  </span>
                )}
              </div>

              {c ? (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0a0f1e' }}>{c.title}</div>
                  {isSigned && !gateSigned && (
                    <div style={{ fontSize: 10, color: '#065F46', marginTop: 4 }}>
                      Signed — gate should reflect this
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ marginTop: 8 }}>
                  {linking === slot.key ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <input
                        value={searchTerm}
                        onChange={e => searchQuotes(e.target.value)}
                        placeholder="Search quotes by title..."
                        autoFocus
                        style={{ fontSize: 12, padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: 6 }}
                      />
                      {searching && <span style={{ fontSize: 10, color: '#9CA3AF' }}>Searching...</span>}
                      {searchResults.map(q => (
                        <button
                          key={q.id}
                          onClick={() => linkContract(slot.gateField, q.id, slot.type)}
                          style={{
                            fontSize: 11, padding: '6px 10px', background: 'white', border: '1px solid #E5E7EB',
                            borderRadius: 6, textAlign: 'left', cursor: 'pointer', display: 'flex',
                            justifyContent: 'space-between', alignItems: 'center',
                          }}
                        >
                          <span>{q.title}</span>
                          <span style={{ fontSize: 10, color: '#6B7280' }}>{q.status}</span>
                        </button>
                      ))}
                      <button onClick={() => { setLinking(null); setSearchResults([]); setSearchTerm('') }} style={{ fontSize: 10, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setLinking(slot.key)}
                      style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 4, border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', cursor: 'pointer' }}
                    >
                      Link contract
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Contract 2 line items preview */}
        {contract2LineItems && contract2LineItems.length > 0 && (
          <div style={{ padding: '10px 14px', background: 'white', borderRadius: 8, border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              Contract 2 — Line Items (allocatable)
            </div>
            {contract2LineItems.flatMap((pkg: any) =>
              (pkg.line_items || []).map((li: any, i: number) => (
                <div key={`${pkg.id}-${i}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #F3F4F6', fontSize: 12 }}>
                  <span style={{ color: '#374151' }}>{li.label}</span>
                  <span style={{ fontWeight: 600, color: '#0a0f1e' }}>${(li.total || 0).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Section>
  )
}

// ── School Profile (display + edit + data quality) ──

const PROFILE_FIELDS = [
  { key: 'school_name', label: 'School Name' },
  { key: 'district', label: 'District' },
  { key: 'nces_id', label: 'NCES ID' },
  { key: 'address', label: 'Address' },
  { key: 'ein', label: 'EIN' },
  { key: 'educator_count', label: 'Educator Count', type: 'number' },
  { key: 'paraprofessionals', label: 'Paraprofessionals', type: 'number' },
  { key: 'iep_students', label: 'IEP Students', type: 'number' },
  { key: 'title_i_status', label: 'Title I Status' },
  { key: 'atsi_status', label: 'ATSI/CSI Status' },
  { key: 'frl_pct', label: 'FRL %' },
  { key: 'reading_proficiency', label: 'Reading Proficiency' },
  { key: 'math_proficiency', label: 'Math Proficiency' },
  { key: 'budget_holder', label: 'Budget Holder' },
]

const REQUIRED_FOR_QUALITY = ['school_name', 'district', 'educator_count', 'title_i_status', 'frl_pct', 'budget_holder', 'atsi_status']

function SchoolProfileSection({ pursuit }: { pursuit: any }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  let profile: Record<string, any> = {}
  try {
    profile = typeof pursuit.school_profile === 'string'
      ? JSON.parse(pursuit.school_profile)
      : (pursuit.school_profile || {})
  } catch { profile = {} }

  const [draft, setDraft] = useState<Record<string, any>>({ ...profile })
  const [ncesSearching, setNcesSearching] = useState(false)
  const [ncesResults, setNcesResults] = useState<any[] | null>(null)

  const searchNces = async () => {
    const searchTerm = pursuit.district_name || pursuit.pursuit_name || ''
    if (!searchTerm) return
    setNcesSearching(true)
    setNcesResults(null)
    try {
      const res = await fetch(`/api/funding/nces-lookup?q=${encodeURIComponent(searchTerm.replace(/- Grant Funding$/, '').trim())}`)
      const data = await res.json()
      setNcesResults(data.results || [])
    } catch { setNcesResults([]) }
    setNcesSearching(false)
  }

  const applyNcesData = (school: any) => {
    const updated = { ...draft }
    if (school.school_name) updated.school_name = school.school_name
    if (school.district) updated.district = school.district
    if (school.nces_id) updated.nces_id = school.nces_id
    if (school.address) updated.address = school.address
    if (school.educator_count) updated.educator_count = school.educator_count
    if (school.title_i_status) updated.title_i_status = school.title_i_status
    if (school.frl_pct) updated.frl_pct = school.frl_pct
    if (school.atsi_status) updated.atsi_status = school.atsi_status
    setDraft(updated)
    setNcesResults(null)
  }

  const missingFields = REQUIRED_FOR_QUALITY.filter(k => {
    const v = profile[k]
    return v == null || v === '' || v === false
  })
  const completePct = Math.round(((REQUIRED_FOR_QUALITY.length - missingFields.length) / REQUIRED_FOR_QUALITY.length) * 100)

  const saveProfile = async () => {
    setSaving(true)
    // Merge draft with existing to preserve unknown keys
    const merged = { ...profile, ...draft }
    const res = await fetch('/api/funding/pursuits', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pursuitId: pursuit.id, school_profile: merged }),
    })
    setSaving(false)
    setEditing(false)
    // Force page-level data to reflect the change
    pursuit.school_profile = JSON.stringify(merged)
    if (res.ok) {
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2000)
    }
  }

  const startEdit = () => {
    setDraft({ ...profile })
    setEditing(true)
  }

  return (
    <Section title="School Profile">
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 14, background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: '#6B7280', fontStyle: 'italic' }}>
              Fields marked <span style={{ color: '#DC2626', fontWeight: 700 }}>*</span> are needed for grant eligibility checks.
            </div>
            <button
              onClick={searchNces}
              disabled={ncesSearching}
              style={{
                fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 6,
                border: 'none', background: ncesSearching ? '#9CA3AF' : '#0F766E', color: 'white',
                cursor: ncesSearching ? 'default' : 'pointer',
              }}
            >
              {ncesSearching ? 'Searching...' : 'Auto-fill from NCES'}
            </button>
          </div>

          {/* NCES search results */}
          {ncesResults && ncesResults.length > 0 && (
            <div style={{ marginBottom: 8, padding: 10, background: '#F0FDFA', borderRadius: 8, border: '1px solid #99F6E4' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0F766E', marginBottom: 6 }}>
                Select a school to auto-fill:
              </div>
              {ncesResults.map((r: any, i: number) => (
                <button
                  key={i}
                  onClick={() => applyNcesData(r)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px',
                    marginBottom: 4, borderRadius: 6, border: '1px solid #E5E7EB',
                    background: 'white', cursor: 'pointer', fontSize: 12,
                  }}
                >
                  <strong>{r.school_name}</strong> — {r.district}
                  <span style={{ color: '#6B7280', marginLeft: 8 }}>
                    {r.enrollment ? `${r.enrollment} students` : ''} {r.frl_pct ? `| ${r.frl_pct}% FRL` : ''} {r.title_i_status ? `| ${r.title_i_status}` : ''}
                  </span>
                </button>
              ))}
            </div>
          )}
          {ncesResults && ncesResults.length === 0 && (
            <div style={{ marginBottom: 8, fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>
              No NCES results found. Try a different search term.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {PROFILE_FIELDS.map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 9, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 2 }}>
                  {f.label}{REQUIRED_FOR_QUALITY.includes(f.key) && <span style={{ color: '#DC2626', marginLeft: 2 }}>*</span>}
                </label>
                {f.key === 'atsi_status' ? (
                  <select
                    value={draft[f.key] === true ? 'yes' : draft[f.key] === false ? 'no' : ''}
                    onChange={e => setDraft({ ...draft, [f.key]: e.target.value === 'yes' ? true : e.target.value === 'no' ? false : null })}
                    style={{ fontSize: 12, padding: '5px 8px', border: '1px solid #E5E7EB', borderRadius: 4, width: '100%' }}
                  >
                    <option value="">Not set</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                ) : (
                  <input
                    type={f.type === 'number' ? 'number' : 'text'}
                    value={draft[f.key] ?? ''}
                    onChange={e => setDraft({ ...draft, [f.key]: f.type === 'number' ? (e.target.value ? parseInt(e.target.value) : null) : e.target.value })}
                    style={{ fontSize: 12, padding: '5px 8px', border: '1px solid #E5E7EB', borderRadius: 4, width: '100%', boxSizing: 'border-box' }}
                  />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <button onClick={saveProfile} disabled={saving} style={{ fontSize: 12, fontWeight: 600, padding: '6px 16px', borderRadius: 6, border: 'none', background: '#8B5CF6', color: 'white', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving...' : 'Save profile'}
            </button>
            <button onClick={() => setEditing(false)} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 6, border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Data quality indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ height: 4, flex: 1, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${completePct}%`, background: completePct === 100 ? '#10B981' : completePct >= 60 ? '#F59E0B' : '#EF4444', borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, color: completePct === 100 ? '#065F46' : '#92400E' }}>
              {completePct}% complete
            </span>
            {justSaved && <span style={{ fontSize: 10, fontWeight: 600, color: '#10B981' }}>Saved</span>}
            <button onClick={startEdit} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 4, border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', cursor: 'pointer' }}>
              Edit
            </button>
          </div>

          {/* Missing fields callout */}
          {missingFields.length > 0 && (
            <div style={{ padding: '6px 10px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 6, fontSize: 10, color: '#92400E' }}>
              {missingFields.length} field{missingFields.length !== 1 ? 's' : ''} need{missingFields.length === 1 ? 's' : ''} verification: {missingFields.map(k => PROFILE_FIELDS.find(f => f.key === k)?.label || k).join(', ')}
            </div>
          )}

          {/* Profile data grid */}
          <div style={{ fontSize: 11, color: '#6B7280', fontStyle: 'italic', marginBottom: 4 }}>
            Fields marked <span style={{ color: '#DC2626', fontWeight: 700 }}>*</span> are needed for grant eligibility checks.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {PROFILE_FIELDS.map(f => {
              const val = profile[f.key]
              const display = val === true ? 'Yes' : val === false ? 'No' : val != null && val !== '' ? String(val) : null
              return (
                <div key={f.key} style={{ padding: '6px 10px', background: '#F9FAFB', borderRadius: 6 }}>
                  <div style={{ fontSize: 9, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {f.label}{REQUIRED_FOR_QUALITY.includes(f.key) && <span style={{ color: '#DC2626', marginLeft: 2 }}>*</span>}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: display ? '#0a0f1e' : '#D1D5DB', marginTop: 1, fontStyle: display ? 'normal' : 'italic' }}>
                    {display || 'Not set'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Section>
  )
}

// ── Continuity check (1.5) ──

function ContinuityCheck({ gate, pursuitId, onUpdate }: { gate: any; pursuitId: string; onUpdate: (g: any) => void }) {
  if (!gate) return null

  const verified = gate.submitter_employment_verified_at
  const verifiedDate = verified ? new Date(verified) : null
  const daysSinceVerified = verifiedDate ? Math.floor((Date.now() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24)) : null
  const stale = daysSinceVerified !== null && daysSinceVerified > 90

  const handleVerify = async () => {
    const res = await fetch(`/api/funding/pursuits/${pursuitId}/gate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submitter_employment_verified_at: new Date().toISOString() }),
    })
    const result = await res.json()
    if (result.gate) onUpdate(result.gate)
  }

  const handleToggleLogin = async (v: boolean) => {
    const res = await fetch(`/api/funding/pursuits/${pursuitId}/gate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submitter_portal_login_capable: v }),
    })
    const result = await res.json()
    if (result.gate) onUpdate(result.gate)
  }

  return (
    <div style={{
      padding: '8px 10px', background: (!verified || stale) ? '#FFFBEB' : '#F0FDF4',
      border: `1px solid ${(!verified || stale) ? '#FDE68A' : '#BBF7D0'}`,
      borderRadius: 6, marginBottom: 8,
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Contact continuity
        </span>
        {verified && !stale ? (
          <span style={{ fontSize: 10, color: '#065F46', fontWeight: 600 }}>
            {'\u2713'} Verified employed {verifiedDate!.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {daysSinceVerified !== null && daysSinceVerified > 30 && (
              <span style={{ color: '#92400E' }}> ({daysSinceVerified}d ago)</span>
            )}
          </span>
        ) : stale ? (
          <>
            <span style={{ fontSize: 10, color: '#DC2626', fontWeight: 600 }}>
              Verification stale ({daysSinceVerified}d ago) — re-verify
            </span>
            <button onClick={handleVerify} style={{ fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 4, border: 'none', background: '#F59E0B', color: 'white', cursor: 'pointer' }}>
              Re-verify now
            </button>
          </>
        ) : (
          <>
            <span style={{ fontSize: 10, color: '#DC2626', fontWeight: 600 }}>
              Not verified — confirm this contact still works here
            </span>
            <button onClick={handleVerify} style={{ fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 4, border: 'none', background: '#8B5CF6', color: 'white', cursor: 'pointer' }}>
              Verify employed
            </button>
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={gate.submitter_portal_login_capable || false}
            onChange={e => handleToggleLogin(e.target.checked)}
            style={{ accentColor: '#8B5CF6' }}
          />
          <span style={{ fontSize: 10, color: '#374151' }}>Portal login capable</span>
        </label>
        {gate.submitter_availability_window && (
          <span style={{ fontSize: 10, color: '#6B7280' }}>
            Available: {gate.submitter_availability_window}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Delivery & Health (read-only from partnership) ──

function DeliveryHealthSection({ partnershipHealth }: { partnershipHealth: any }) {
  if (!partnershipHealth) return null

  const ph = partnershipHealth
  const metrics = [
    { label: 'Phase', value: ph.contract_phase || '—', color: '#0a0f1e' },
    { label: 'Momentum', value: ph.momentum_status || '—', color: ph.momentum_status === 'Thriving' ? '#065F46' : ph.momentum_status === 'Building' ? '#92400E' : '#6B7280' },
    { label: 'Strategy Implementation', value: ph.strategy_implementation_pct != null ? `${ph.strategy_implementation_pct}%` : 'Not yet tracked', color: ph.strategy_implementation_pct != null ? '#0a0f1e' : '#9CA3AF' },
    { label: 'Retention Intent', value: ph.retention_intent_score != null ? `${ph.retention_intent_score}/10` : 'Not yet tracked', color: ph.retention_intent_score != null ? '#0a0f1e' : '#9CA3AF' },
    { label: 'Hub Login %', value: ph.hub_login_pct != null ? `${ph.hub_login_pct}%` : 'Not yet tracked', color: ph.hub_login_pct != null ? '#0a0f1e' : '#9CA3AF' },
  ]

  // Delivery sessions
  const sessions = [
    { label: 'Observations', used: ph.observation_days_used || 0, total: ph.observation_days_total || 0 },
    { label: 'Virtual', used: ph.virtual_sessions_used || 0, total: ph.virtual_sessions_total || 0 },
    { label: 'Executive', used: ph.executive_sessions_used || 0, total: ph.executive_sessions_total || 0 },
  ].filter(s => s.total > 0)

  return (
    <Section title="Delivery & Health">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {metrics.map(m => (
            <div key={m.label} style={{ padding: '8px 12px', background: '#F9FAFB', borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>{m.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: m.color, marginTop: 2 }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Session delivery progress */}
        {sessions.length > 0 && (
          <div style={{ display: 'flex', gap: 12 }}>
            {sessions.map(s => (
              <div key={s.label} style={{ flex: 1, padding: '8px 12px', background: '#F9FAFB', borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0a0f1e', marginTop: 2 }}>{s.used}/{s.total}</div>
                <div style={{ height: 3, background: '#E5E7EB', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.total > 0 ? Math.min((s.used / s.total) * 100, 100) : 0}%`, background: '#8B5CF6', borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Link to full detail */}
        <a
          href={`/tdi-admin/leadership/${ph.id}`}
          style={{ fontSize: 11, color: '#8B5CF6', textDecoration: 'underline' }}
        >
          View full partnership detail
        </a>
      </div>
    </Section>
  )
}

// ── Renewal section ──

function RenewalSection({ pursuit, renewalEligible, hasPartnership }: { pursuit: any; renewalEligible?: boolean; hasPartnership: boolean }) {
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState(false)

  if (!hasPartnership) return null

  const handleStartRenewal = async () => {
    setCreating(true)
    const res = await fetch('/api/funding/pursuits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        districtName: pursuit.district_name,
        totalAmount: pursuit.total_amount || pursuit.contract_gap || 0,
        implementationDate: null,
        clientContactName: pursuit.client_contact_name,
        clientContactEmail: pursuit.client_contact_email,
        clientContactPhone: pursuit.client_contact_phone,
        clientContactRole: pursuit.client_contact_role,
        partnershipId: pursuit.partnership_id,
        pursuitName: `(RENEWAL) ${pursuit.district_name || pursuit.pursuit_name} - Next Cycle`,
      }),
    })
    const result = await res.json()
    setCreating(false)
    if (result.pursuit || result.success) setCreated(true)
  }

  return (
    <Section title="Renewal">
      {renewalEligible ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{
            padding: '10px 14px', background: '#D1FAE5', border: '1px solid #6EE7B7',
            borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 13, color: '#065F46' }}>{'\u2713'}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#065F46' }}>
              Ready for renewal cycle
            </span>
            <span style={{ fontSize: 10, color: '#065F46' }}>
              All allocations delivered/invoiced
            </span>
          </div>
          {!created ? (
            <button
              onClick={handleStartRenewal}
              disabled={creating}
              style={{
                fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 6,
                border: 'none', background: creating ? '#9CA3AF' : '#8B5CF6',
                color: 'white', cursor: creating ? 'default' : 'pointer',
                alignSelf: 'flex-start',
              }}
            >
              {creating ? 'Creating...' : 'Start renewal pursuit'}
            </button>
          ) : (
            <div style={{ fontSize: 12, color: '#065F46', fontWeight: 600 }}>
              {'\u2713'} Renewal pursuit created — check the funding list
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' }}>
          Not yet eligible for renewal — all allocations must be delivered or invoiced first
        </div>
      )}
    </Section>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      title="Copy to clipboard"
      style={{
        fontSize: 10, padding: '1px 6px', borderRadius: 4,
        border: '1px solid #E5E7EB', background: copied ? '#D1FAE5' : 'white',
        color: copied ? '#065F46' : '#9CA3AF', cursor: 'pointer',
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}
