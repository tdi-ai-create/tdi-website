'use client'

import { useEffect, useState } from 'react'
import { findInternalText } from '@/lib/funding-draft-warnings'

const EMAIL_TYPE_OPTIONS = ['nudge', 'submission_instructions', 'deadline_reminder', 'status_update', 'follow_up', 'custom']

interface EmailsTabProps {
  pursuitId: string
  pursuit: any
}

export function EmailsTab({ pursuitId, pursuit }: EmailsTabProps) {
  const [emails, setEmails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [composing, setComposing] = useState(false)
  const [draft, setDraft] = useState({
    subject: '',
    body: '',
    toEmail: pursuit.client_contact_email || '',
    emailType: 'custom',
  })
  const [sendStatus, setSendStatus] = useState<string | null>(null)

  const fetchEmails = () => {
    setLoading(true)
    fetch(`/api/funding/pursuits/${pursuitId}/emails`)
      .then(r => r.json())
      .then(d => {
        const items = Array.isArray(d) ? d : (d.emails || [])
        setEmails(items)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchEmails() }, [pursuitId])

  const handleSaveDraft = async () => {
    setSendStatus('sending...')
    try {
      // Was reporting "saved!" without reading the reply, so a refused save
      // looked identical to a successful one and the text was gone either way.
      const res = await fetch(`/api/funding/pursuits/${pursuitId}/emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setSendStatus(`not saved: ${d.error || res.status}`)
        setTimeout(() => setSendStatus(null), 6000)
        return
      }
      setSendStatus('saved!')
      setComposing(false)
      setDraft({ subject: '', body: '', toEmail: pursuit.client_contact_email || '', emailType: 'custom' })
      fetchEmails()
      setTimeout(() => setSendStatus(null), 2000)
    } catch {
      setSendStatus('error')
      setTimeout(() => setSendStatus(null), 3000)
    }
  }

  const handleSendNow = async () => {
    setSendStatus('sending...')
    try {
      const res = await fetch(`/api/funding/pursuits/${pursuitId}/emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setSendStatus(`not sent: ${d.error || res.status}`)
        setTimeout(() => setSendStatus(null), 6000)
        return
      }
      const created = await res.json()

      // Now send it. This leg was also unchecked, so a failed send still
      // reported "sent!". That is the worst version of this bug on the page:
      // it claims something reached a school when it may not have left.
      const sendRes = await fetch(`/api/funding/pursuits/${pursuitId}/emails`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId: created.id || created.emailId, send: true }),
      })
      if (!sendRes.ok) {
        const d = await sendRes.json().catch(() => ({}))
        setSendStatus(`saved as a draft, but NOT sent: ${d.error || sendRes.status}`)
        setComposing(false)
        fetchEmails()
        setTimeout(() => setSendStatus(null), 8000)
        return
      }
      setSendStatus('sent!')
      setComposing(false)
      setDraft({ subject: '', body: '', toEmail: pursuit.client_contact_email || '', emailType: 'custom' })
      fetchEmails()
      setTimeout(() => setSendStatus(null), 2000)
    } catch {
      setSendStatus('error')
      setTimeout(() => setSendStatus(null), 3000)
    }
  }

  const handleSendExisting = async (emailId: string, to?: string | null, subject?: string | null) => {
    // Same confirm as the composer. Sending is the one action on this page that
    // reaches a person outside TDI and cannot be taken back.
    const ok = window.confirm(
      `Send this to ${to || 'the saved recipient'}?\n\nSubject: ${subject || '(no subject)'}\n\nThis cannot be undone.`
    )
    if (!ok) return

    const res = await fetch(`/api/funding/pursuits/${pursuitId}/emails`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailId, send: true }),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setSendStatus(`NOT sent: ${d.error || res.status}`)
      setTimeout(() => setSendStatus(null), 8000)
    }
    fetchEmails()
  }

  const statusBadgeStyle = (status: string): React.CSSProperties => {
    if (status === 'sent') return { background: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600 }
    if (status === 'failed') return { background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600 }
    return { background: '#F3F4F6', color: '#6B7280', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600 }
  }

  // The same check the outreach board runs, on the same function the server
  // uses. It existed there and not here, so whether our pricing language was
  // caught before reaching a funder depended on which screen you happened to
  // start from. Same recipient, same kind of email, no check.
  const warnings = findInternalText(draft.subject, draft.body)
  const blockedByWording = warnings.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Composer */}
      {composing && (
        <div style={{ padding: 16, background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <select
            value={draft.emailType}
            onChange={e => setDraft({ ...draft, emailType: e.target.value })}
            style={{ fontSize: 13, padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 6 }}
          >
            {EMAIL_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
          <input
            value={draft.toEmail}
            onChange={e => setDraft({ ...draft, toEmail: e.target.value })}
            placeholder="To email"
            style={{ fontSize: 13, padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 6, width: '100%', boxSizing: 'border-box' }}
          />
          <input
            value={draft.subject}
            onChange={e => setDraft({ ...draft, subject: e.target.value })}
            placeholder="Subject"
            style={{ fontSize: 13, padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 6, width: '100%', boxSizing: 'border-box' }}
          />
          <textarea
            value={draft.body}
            onChange={e => setDraft({ ...draft, body: e.target.value })}
            placeholder="Email body..."
            rows={8}
            style={{ fontSize: 13, padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 6, width: '100%', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }}
          />
          {blockedByWording && (
            <div style={{ padding: '12px 14px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E', marginBottom: 4 }}>
                This reads like a note we wrote to ourselves
              </div>
              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>
                They would read the words below as written. Reword them, then send.
              </div>
              {warnings.map(w => (
                <div key={w.phrase} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1e2749' }}>&ldquo;{w.phrase}&rdquo;</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>{w.explain}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={handleSaveDraft}
              style={{
                fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 6,
                border: '1px solid #E5E7EB', background: 'white', color: '#374151', cursor: 'pointer',
              }}
            >
              Save Draft
            </button>
            <button
              onClick={() => {
                // Sending an email cannot be undone, and this button had less
                // friction than Mark submitted, which only changes a database
                // field. Name the recipient, because that is the part a person
                // gets wrong.
                const ok = window.confirm(
                  `Send this to ${draft.toEmail}?\n\nSubject: ${draft.subject}\n\nThis cannot be undone.`
                )
                if (ok) handleSendNow()
              }}
              disabled={blockedByWording}
              title={blockedByWording ? 'Reword the flagged phrases first' : undefined}
              style={{
                fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 6,
                border: 'none',
                background: blockedByWording ? '#C7C9D1' : '#8B5CF6',
                color: 'white',
                cursor: blockedByWording ? 'not-allowed' : 'pointer',
              }}
            >
              {blockedByWording ? 'Reword before sending' : 'Send Now'}
            </button>
            <button
              onClick={() => setComposing(false)}
              style={{
                fontSize: 12, padding: '8px 16px', borderRadius: 6,
                border: 'none', background: 'none', color: '#6B7280', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            {sendStatus && (
              <span style={{
                fontSize: 12, fontWeight: 600,
                color: sendStatus === 'sent!' || sendStatus === 'saved!' ? '#065F46'
                  : sendStatus === 'error' ? '#991B1B' : '#6B7280',
              }}>
                {sendStatus}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Email Log */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Email History ({emails.length})
          </span>
          {!composing && (
            <button
              onClick={() => setComposing(true)}
              style={{
                fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 6,
                border: 'none', background: '#8B5CF6', color: 'white', cursor: 'pointer',
              }}
            >
              + Compose
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#6B7280' }}>Loading...</div>
        ) : emails.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24, color: '#9CA3AF', fontSize: 13 }}>
            No emails sent yet. Click Compose to draft your first message.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {emails.map((email: any) => (
              <div key={email.id} style={{ padding: '12px 14px', background: '#F9FAFB', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0a0f1e' }}>{email.subject || '(no subject)'}</span>
                  <span style={statusBadgeStyle(email.status)}>{email.status || 'draft'}</span>
                </div>
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>
                  To: {email.to_email || email.toEmail || '--'}
                </div>
                {email.created_at && (
                  <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>
                    {new Date(email.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </div>
                )}
                {(email.status === 'draft' || !email.status) && (
                  <button
                    onClick={() => handleSendExisting(email.id, email.to_email || email.toEmail, email.subject)}
                    style={{
                      fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                      border: '1px solid #D1D5DB', background: 'white', color: '#374151',
                      cursor: 'pointer', marginTop: 8,
                    }}
                  >
                    Send
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
