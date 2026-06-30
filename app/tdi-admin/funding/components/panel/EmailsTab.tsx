'use client'

import { useEffect, useState } from 'react'

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
      await fetch(`/api/funding/pursuits/${pursuitId}/emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
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
      const created = await res.json()
      // Now send it
      await fetch(`/api/funding/pursuits/${pursuitId}/emails`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId: created.id || created.emailId, send: true }),
      })
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

  const handleSendExisting = async (emailId: string) => {
    await fetch(`/api/funding/pursuits/${pursuitId}/emails`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailId, send: true }),
    })
    fetchEmails()
  }

  const statusBadgeStyle = (status: string): React.CSSProperties => {
    if (status === 'sent') return { background: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600 }
    if (status === 'failed') return { background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600 }
    return { background: '#F3F4F6', color: '#6B7280', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600 }
  }

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
              onClick={handleSendNow}
              style={{
                fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 6,
                border: 'none', background: '#8B5CF6', color: 'white', cursor: 'pointer',
              }}
            >
              Send Now
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
                    onClick={() => handleSendExisting(email.id)}
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
