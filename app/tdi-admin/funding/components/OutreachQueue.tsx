'use client'

/**
 * Funding outreach approval queue.
 *
 * Agents draft client emails. This is where a human decides whether they go
 * out. It is deliberately not a QA surface: the question is "is this true
 * about this school and does it sound like us", never "is this well written".
 * Narrative quality belongs to Julie.
 *
 * Design notes:
 *  - Body is shown in full, not truncated. Approving something you only half
 *    read is the failure this queue exists to prevent.
 *  - Drafts that can never send (no recipient, not on the allowlist) are shown
 *    disabled with the reason, rather than offering a button that will fail.
 *  - Rejection requires a reason, because the agent redrafts from it.
 */

import { useCallback, useEffect, useState } from 'react'
import { Check, X, Pencil, AlertTriangle, Clock, Inbox } from 'lucide-react'

type Draft = {
  id: string
  subject: string | null
  body: string | null
  toEmail: string | null
  toName: string | null
  emailType: string | null
  createdAt: string
  ageHours: number
  isStale: boolean
  blockedReason: string | null
  school: string | null
  funder: string | null
  grant: string | null
  amount: string | number | null
  closesOn: string | null
}

const NAVY = '#1e2749'

function age(hours: number) {
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  const d = Math.floor(hours / 24)
  return `${d} day${d === 1 ? '' : 's'} ago`
}

export default function OutreachQueue() {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editSubject, setEditSubject] = useState('')
  const [editBody, setEditBody] = useState('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/funding/outreach-queue')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not load the queue')
      setDrafts(json.drafts ?? [])
      setError(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not load the queue')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function act(id: string, action: 'approve' | 'reject', extra: Record<string, unknown> = {}) {
    setBusyId(id)
    setError(null)
    try {
      const res = await fetch('/api/funding/outreach-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, ...extra }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'That did not work')
      if (json.warning) setError(json.warning)
      setEditingId(null)
      setRejectingId(null)
      setRejectReason('')
      setDrafts(prev => prev.filter(d => d.id !== id))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'That did not work')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return <div style={{ padding: 24, color: '#6B7280', fontSize: 14 }}>Loading outreach queue…</div>
  }

  if (!drafts.length) {
    return (
      <div
        style={{
          padding: '28px 24px',
          background: '#F9FAFB',
          border: '1px dashed #D1D5DB',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: '#6B7280',
          fontSize: 14,
        }}
      >
        <Inbox className="w-5 h-5" />
        Nothing waiting. Drafted grant emails show up here for approval before they send.
      </div>
    )
  }

  const staleCount = drafts.filter(d => d.isStale).length

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: 0 }}>
          Ready to send ({drafts.length})
        </h2>
        {staleCount > 0 && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#B4472F',
              background: '#FDECE8',
              padding: '3px 10px',
              borderRadius: 20,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Clock className="w-3 h-3" />
            {staleCount} waiting over 48 hours
          </span>
        )}
      </div>

      {error && (
        <div
          role="alert"
          style={{
            background: '#FDECE8',
            border: '1px solid #F3C4B8',
            color: '#8A3520',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 13.5,
            marginBottom: 14,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {drafts.map(d => {
          const busy = busyId === d.id
          const editing = editingId === d.id
          const rejecting = rejectingId === d.id
          return (
            <article
              key={d.id}
              style={{
                background: 'white',
                border: '1px solid #E5E7EB',
                borderLeft: `4px solid ${d.blockedReason ? '#B4472F' : d.isStale ? '#D4A843' : NAVY}`,
                borderRadius: 10,
                padding: 20,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>
                    {d.school || 'Unknown school'}
                  </div>
                  <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                    {[d.grant, d.funder].filter(Boolean).join(' · ') || 'No grant route recorded'}
                    {d.amount ? ` · $${Number(d.amount).toLocaleString()}` : ''}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: d.isStale ? '#B4472F' : '#9CA3AF', whiteSpace: 'nowrap' }}>
                  drafted {age(d.ageHours)}
                </div>
              </div>

              <div style={{ fontSize: 13, color: '#374151', margin: '12px 0 6px' }}>
                <strong style={{ color: '#6B7280', fontWeight: 600 }}>To:</strong>{' '}
                {d.toEmail ? `${d.toName ? `${d.toName} · ` : ''}${d.toEmail}` : <em>no recipient</em>}
              </div>

              {editing ? (
                <>
                  <input
                    value={editSubject}
                    onChange={e => setEditSubject(e.target.value)}
                    aria-label="Subject"
                    style={{
                      width: '100%', padding: '8px 10px', border: '1px solid #D1D5DB',
                      borderRadius: 6, fontSize: 14, fontWeight: 600, marginBottom: 8,
                    }}
                  />
                  <textarea
                    value={editBody}
                    onChange={e => setEditBody(e.target.value)}
                    rows={10}
                    aria-label="Body"
                    style={{
                      width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB',
                      borderRadius: 6, fontSize: 14, lineHeight: 1.6, fontFamily: 'inherit',
                    }}
                  />
                </>
              ) : (
                <>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
                    {d.subject || <em style={{ color: '#B4472F' }}>No subject</em>}
                  </div>
                  <div
                    style={{
                      fontSize: 14, lineHeight: 1.65, color: '#374151', whiteSpace: 'pre-wrap',
                      background: '#F9FAFB', border: '1px solid #F0F1F4', borderRadius: 8, padding: '14px 16px',
                    }}
                  >
                    {d.body || <em>Empty body</em>}
                  </div>
                </>
              )}

              {d.blockedReason && (
                <div
                  style={{
                    marginTop: 12, display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 13, color: '#8A3520', background: '#FDECE8',
                    border: '1px solid #F3C4B8', borderRadius: 8, padding: '9px 12px',
                  }}
                >
                  <AlertTriangle className="w-4 h-4" />
                  {d.blockedReason}. Fix this before it can send.
                </div>
              )}

              {rejecting && (
                <div style={{ marginTop: 12 }}>
                  <label
                    htmlFor={`reason-${d.id}`}
                    style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 6 }}
                  >
                    What should change? The agent redrafts from this.
                  </label>
                  <textarea
                    id={`reason-${d.id}`}
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB',
                      borderRadius: 6, fontSize: 14, fontFamily: 'inherit',
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                {rejecting ? (
                  <>
                    <button
                      onClick={() => act(d.id, 'reject', { reason: rejectReason })}
                      disabled={busy || !rejectReason.trim()}
                      style={btn('#B4472F', !rejectReason.trim() || busy)}
                    >
                      {busy ? 'Sending back…' : 'Send back to the agent'}
                    </button>
                    <button onClick={() => { setRejectingId(null); setRejectReason('') }} style={btnGhost()}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() =>
                        act(d.id, 'approve', editing ? { subject: editSubject, body: editBody } : {})
                      }
                      disabled={busy || !!d.blockedReason}
                      style={btn('#2A9D8F', busy || !!d.blockedReason)}
                    >
                      <Check className="w-4 h-4" />
                      {busy ? 'Sending…' : editing ? 'Save and send' : 'Approve and send'}
                    </button>
                    {!editing && (
                      <button
                        onClick={() => {
                          setEditingId(d.id)
                          setEditSubject(d.subject ?? '')
                          setEditBody(d.body ?? '')
                        }}
                        disabled={busy}
                        style={btnGhost()}
                      >
                        <Pencil className="w-4 h-4" />
                        Edit first
                      </button>
                    )}
                    <button onClick={() => setRejectingId(d.id)} disabled={busy} style={btnGhost('#B4472F')}>
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

function btn(bg: string, disabled: boolean): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: disabled ? '#D1D5DB' : bg, color: 'white', border: 'none',
    borderRadius: 7, padding: '9px 16px', fontSize: 13.5, fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
  }
}

function btnGhost(color = '#374151'): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'white', color, border: '1px solid #D1D5DB',
    borderRadius: 7, padding: '9px 14px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
  }
}
