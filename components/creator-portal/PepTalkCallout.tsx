'use client'

import { useState } from 'react'

interface PepTalkCalloutProps {
  creatorId: string
  creatorName: string
  creatorEmail: string
  contentPath: string | null
  pepTalkRequestedAt?: string | null
}

export default function PepTalkCallout({ creatorId, creatorName, creatorEmail, contentPath, pepTalkRequestedAt }: PepTalkCalloutProps) {
  const [sent, setSent] = useState(!!pepTalkRequestedAt)
  const [sending, setSending] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  async function handleRequestPepTalk() {
    setSending(true)
    try {
      const res = await fetch('/api/creator/request-pep-talk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId, creatorName, creatorEmail, contentPath }),
      })
      if (res.ok) setSent(true)
    } catch {}
    setSending(false)
  }

  return (
    <div style={{
      background: '#FFFBF5',
      border: '0.5px solid #E5E7EB',
      borderRadius: 12,
      padding: '24px 28px',
      marginTop: 16,
    }}>
      {sent ? (
        <div>
          <p style={{ fontSize: 16, fontWeight: 500, color: '#1e2749', margin: '0 0 6px 0' }}>
            Request sent
          </p>
          <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.7, margin: 0 }}>
            We&apos;ll be in touch within 24 hours. Feel free to keep going in the meantime &mdash; you don&apos;t need to wait.
          </p>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 18, fontWeight: 500, color: '#1e2749', margin: '0 0 8px 0' }}>
            Path confirmed. What&apos;s next?
          </p>
          <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.7, margin: '0 0 16px 0' }}>
            You can dive straight into the agreement and start building, or &mdash; if you&apos;ve got questions, want to bounce ideas off the team, or just want a pep talk before diving in &mdash; we&apos;re here for that too. Your call. There&apos;s no right answer.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => setDismissed(true)}
              style={{
                padding: '10px 20px', background: '#1e2749', color: 'white',
                border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}
            >
              Keep going
            </button>
            <button
              onClick={handleRequestPepTalk}
              disabled={sending}
              style={{
                padding: '10px 20px', background: 'white', color: '#1e2749',
                border: '1px solid #D1D5DB', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer',
                opacity: sending ? 0.5 : 1,
              }}
            >
              {sending ? 'Sending...' : 'Chat with the team for a pep talk'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
