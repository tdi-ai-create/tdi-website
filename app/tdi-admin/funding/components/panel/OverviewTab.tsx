'use client'

import { OwnerAvatar, ownerName } from '../OwnerAvatar'

interface OverviewTabProps {
  pursuit: any
  gate?: any
}

const GATE_ROLE_LABELS: Record<string, string> = {
  submitter: 'Submitter',
  backup: 'Backup',
  admin_sponsor: 'Admin Sponsor',
}

export function OverviewTab({ pursuit, gate }: OverviewTabProps) {
  const p = pursuit
  const eligibility = p.eligibility_snapshot || {}
  const hasContact = p.client_contact_name || p.client_contact_email || p.client_contact_phone || p.client_contact_role

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Escalation Gate */}
      <Section title="Escalation Gate">
        {gate ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: gate.gate_open ? '#10B981' : '#DC2626',
              }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: gate.gate_open ? '#065F46' : '#991B1B' }}>
                {gate.gate_open ? 'Gate satisfied' : 'Gate not satisfied'}
              </span>
              {!gate.gate_open && (
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                  — submission work should not proceed without a named backup
                </span>
              )}
            </div>
            {['submitter', 'backup', 'admin_sponsor'].map(role => {
              const name = gate[`${role}_name`]
              const email = gate[`${role}_email`]
              const filled = name || email
              return (
                <div key={role} style={{
                  padding: '10px 14px', background: '#F9FAFB', borderRadius: 8,
                  borderLeft: `3px solid ${filled ? '#8B5CF6' : '#E5E7EB'}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
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
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>No gate configured for this pursuit</div>
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
