'use client'

import { useEffect, useState } from 'react'
import { PhaseChain } from './PhaseChain'
import { OwnerAvatar, ownerName } from './OwnerAvatar'

interface PanelProps {
  pursuitId: string
  onClose: () => void
}

export function PursuitDetailPanel({ pursuitId, onClose }: PanelProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/funding/pursuits/${pursuitId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })

    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [pursuitId, onClose])

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 500 }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 520,
        background: 'white', boxShadow: '-8px 0 24px rgba(0,0,0,0.12)',
        overflowY: 'auto', zIndex: 501, padding: 0,
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Loading...</div>
        ) : !data?.pursuit ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#991B1B' }}>Failed to load pursuit.</div>
        ) : (
          <PanelContent data={data} onClose={onClose} />
        )}
      </div>
    </>
  )
}

function PanelContent({ data, onClose }: { data: any; onClose: () => void }) {
  const p = data.pursuit
  const sources = Array.isArray(p.funding_sources) ? p.funding_sources : []
  const eligibility = p.eligibility_snapshot || {}
  const timeline = data.timeline || []
  const touchpoints = data.touchpoints || []

  // Funding paths (Plan A/B/C/D)
  const [paths, setPaths] = useState<{ plan: string; label: string; amount: number; status: string; deadline: string | null; contact: string; notes: string }[]>(() => {
    try {
      return typeof p.funding_paths === 'string' ? JSON.parse(p.funding_paths) : (p.funding_paths || [])
    } catch { return [] }
  })
  const [editingPaths, setEditingPaths] = useState(false)
  const [savingPaths, setSavingPaths] = useState(false)

  const planColors: Record<string, string> = { A: '#0F766E', B: '#1B365D', C: '#7C3AED', D: '#B45309' }
  const statusOptions = ['not_started', 'researching', 'pursuing', 'submitted', 'awarded', 'denied', 'on_hold']

  const savePaths = async () => {
    setSavingPaths(true)
    try {
      await fetch('/api/funding/pursuits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pursuitId: p.id, funding_paths: paths }),
      })
      setEditingPaths(false)
    } catch {} finally { setSavingPaths(false) }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0a0f1e' }}>{p.pursuit_name}</div>
            {p.funder_label && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{p.funder_label}</div>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6B7280', padding: '0 4px' }}>x</button>
        </div>
        <div style={{ marginTop: 12 }}>
          <PhaseChain currentPhase={p.current_phase} isStalled={p.is_stalled} />
        </div>
      </div>

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Amount + deadline */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: '#F9FAFB', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>Total Amount</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0a0f1e', marginTop: 4 }}>${p.total_amount.toLocaleString()}</div>
          </div>
          <div style={{ background: '#F9FAFB', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>Deadline</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0a0f1e', marginTop: 4 }}>
              {p.submission_deadline ? new Date(p.submission_deadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--'}
            </div>
          </div>
        </div>

        {/* Funding sources */}
        {sources.length > 0 && (
          <Section title="Funding Stack">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sources.map((s: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#F9FAFB', borderRadius: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0a0f1e' }}>{s.source}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0a0f1e' }}>${s.amount?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Funding Paths (Plan A/B/C/D) */}
        {paths.length > 0 && (
          <Section title={<span>Funding Paths <button onClick={() => setEditingPaths(!editingPaths)} style={{ fontSize: 10, color: '#6B7280', marginLeft: 8, cursor: 'pointer', background: 'none', border: 'none', textDecoration: 'underline' }}>{editingPaths ? 'cancel' : 'edit'}</button></span>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {paths.map((path, i) => (
                <div key={i} style={{ padding: '10px 14px', background: '#F9FAFB', borderRadius: 10, borderLeft: `4px solid ${planColors[path.plan] || '#6B7280'}` }}>
                  {editingPaths ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: 12, color: planColors[path.plan], width: 40 }}>Plan {path.plan}</span>
                        <input value={path.label} onChange={e => { const u = [...paths]; u[i] = { ...u[i], label: e.target.value }; setPaths(u); }}
                          style={{ flex: 1, fontSize: 13, padding: '4px 8px', border: '1px solid #E5E7EB', borderRadius: 6 }} placeholder="Path name" />
                        <input type="number" value={path.amount || ''} onChange={e => { const u = [...paths]; u[i] = { ...u[i], amount: parseFloat(e.target.value) || 0 }; setPaths(u); }}
                          style={{ width: 80, fontSize: 13, padding: '4px 8px', border: '1px solid #E5E7EB', borderRadius: 6 }} placeholder="$" />
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <select value={path.status} onChange={e => { const u = [...paths]; u[i] = { ...u[i], status: e.target.value }; setPaths(u); }}
                          style={{ fontSize: 11, padding: '3px 6px', border: '1px solid #E5E7EB', borderRadius: 6 }}>
                          {statusOptions.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                        </select>
                        <input value={path.contact || ''} onChange={e => { const u = [...paths]; u[i] = { ...u[i], contact: e.target.value }; setPaths(u); }}
                          style={{ flex: 1, fontSize: 11, padding: '3px 6px', border: '1px solid #E5E7EB', borderRadius: 6 }} placeholder="Contact name/email" />
                        <input type="date" value={path.deadline || ''} onChange={e => { const u = [...paths]; u[i] = { ...u[i], deadline: e.target.value || null }; setPaths(u); }}
                          style={{ fontSize: 11, padding: '3px 6px', border: '1px solid #E5E7EB', borderRadius: 6 }} />
                      </div>
                      <input value={path.notes || ''} onChange={e => { const u = [...paths]; u[i] = { ...u[i], notes: e.target.value }; setPaths(u); }}
                        style={{ fontSize: 11, padding: '3px 6px', border: '1px solid #E5E7EB', borderRadius: 6 }} placeholder="Notes..." />
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0a0f1e' }}>
                          <span style={{ color: planColors[path.plan], fontWeight: 700, marginRight: 6 }}>Plan {path.plan}</span>
                          {path.label}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0a0f1e' }}>{path.amount > 0 ? `$${path.amount.toLocaleString()}` : '--'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4, fontSize: 11, color: '#6B7280' }}>
                        <span style={{ padding: '1px 6px', borderRadius: 4, background: path.status === 'awarded' ? '#D1FAE5' : path.status === 'denied' ? '#FEE2E2' : '#F3F4F6',
                          color: path.status === 'awarded' ? '#065F46' : path.status === 'denied' ? '#991B1B' : '#374151' }}>
                          {path.status.replace(/_/g, ' ')}
                        </span>
                        {path.contact && <span>Contact: {path.contact}</span>}
                        {path.deadline && <span>Due: {new Date(path.deadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                      </div>
                      {path.notes && <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{path.notes}</p>}
                    </div>
                  )}
                </div>
              ))}
              {editingPaths && (
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button onClick={savePaths} disabled={savingPaths}
                    style={{ fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 6, border: 'none', background: '#8B5CF6', color: 'white', cursor: 'pointer', opacity: savingPaths ? 0.5 : 1 }}>
                    {savingPaths ? 'Saving...' : 'Save paths'}
                  </button>
                  <button onClick={() => { const u = [...paths]; u.push({ plan: 'C', label: '', amount: 0, status: 'not_started', deadline: null, contact: '', notes: '' }); setPaths(u); }}
                    style={{ fontSize: 12, padding: '6px 14px', borderRadius: 6, border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', cursor: 'pointer' }}>
                    + Add path
                  </button>
                </div>
              )}
            </div>
          </Section>
        )}

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

        {/* Eligibility */}
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

        {/* Timeline */}
        {timeline.length > 0 && (
          <Section title="Timeline">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
              {/* Vertical line */}
              <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: '#E5E7EB' }} />
              {timeline.map((evt: any) => {
                const dotColor = evt.status === 'complete' ? '#10B981'
                  : evt.status === 'active' ? '#EF4444'
                  : '#D1D5DB'
                return (
                  <div key={evt.id} style={{ display: 'flex', gap: 14, paddingBottom: 14, position: 'relative' }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%',
                      background: dotColor, flexShrink: 0,
                      border: '2px solid white', zIndex: 1,
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0a0f1e' }}>{evt.event_title}</span>
                        <span style={{ fontSize: 10, color: '#9CA3AF', flexShrink: 0 }}>
                          {new Date(evt.event_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      {evt.event_detail && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{evt.event_detail}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>
        )}

        {/* Touchpoints */}
        {touchpoints.length > 0 && (
          <Section title="Scheduled Touchpoints">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {touchpoints.map((tp: any) => {
                const statusColor = tp.status === 'sent' ? '#10B981' : tp.status === 'draft' ? '#6B7280' : '#3B82F6'
                return (
                  <div key={tp.id} style={{ background: '#F9FAFB', borderRadius: 10, padding: 14, borderLeft: `3px solid ${statusColor}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0a0f1e' }}>{tp.title}</span>
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                        background: tp.status === 'sent' ? '#D1FAE5' : tp.status === 'draft' ? '#F3F4F6' : '#DBEAFE',
                        color: statusColor,
                        textTransform: 'uppercase',
                      }}>
                        {tp.status}
                      </span>
                    </div>
                    {tp.meta_text && <div style={{ fontSize: 10, color: '#6B7280', marginBottom: 6 }}>{tp.meta_text}</div>}
                    {tp.preview_body && (
                      <div style={{ fontSize: 11, color: '#374151', background: 'white', padding: '8px 10px', borderRadius: 6, lineHeight: 1.5, fontStyle: 'italic' }}>
                        {tp.preview_body.length > 200 ? tp.preview_body.slice(0, 197) + '...' : tp.preview_body}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); alert('Touchpoint sending ships in Phase B - Gmail integration is next') }}
                        style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', color: '#374151' }}
                      >
                        Send now
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); alert('Draft editing ships in Phase B') }}
                        style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', color: '#374151' }}
                      >
                        Edit draft
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>
        )}

        {/* Internal notes */}
        {p.internal_notes && (
          <Section title="Internal Notes">
            <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6, background: '#F9FAFB', padding: '12px 14px', borderRadius: 8 }}>
              {p.internal_notes}
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
        {title}
      </div>
      {children}
    </div>
  )
}
