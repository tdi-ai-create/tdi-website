'use client'

import { useState } from 'react'
import { OwnerAvatar, ownerName } from '../OwnerAvatar'

interface OverviewTabProps {
  pursuit: any
  gate?: any
  onGateUpdate?: (gate: any) => void
}

const GATE_ROLE_LABELS: Record<string, string> = {
  submitter: 'Submitter',
  backup: 'Backup',
  admin_sponsor: 'Admin Sponsor',
}

export function OverviewTab({ pursuit, gate: initialGate, onGateUpdate }: OverviewTabProps) {
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
              <div style={{ fontSize: 12, color: '#374151', marginTop: 4 }}>{p.client_contact_email}</div>
            )}
            {p.client_contact_phone && (
              <div style={{ fontSize: 12, color: '#374151', marginTop: 2 }}>{p.client_contact_phone}</div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>No client contact set</div>
        )}
      </Section>

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
    </div>
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
