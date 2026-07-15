'use client'

import { useState } from 'react'

interface DraftEmailModalProps {
  to: string
  toName: string
  subject: string
  body: string
  schoolName: string
  pursuitId?: string
  onClose: () => void
  onSent: () => void
}

export function DraftEmailModal({ to, toName, subject: initialSubject, body: initialBody, schoolName, pursuitId, onClose, onSent }: DraftEmailModalProps) {
  const [subject, setSubject] = useState(initialSubject)
  const [body, setBody] = useState(initialBody)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async () => {
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/funding/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, toName, subject, body, schoolName, pursuitId }),
      })
      const result = await res.json()
      if (result.sent) {
        setSent(true)
        setTimeout(() => onSent(), 1500)
      } else {
        setError(result.error || 'Failed to send')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'white', borderRadius: 14, width: 640, maxHeight: '90vh',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid #E5E7EB',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0a0f1e' }}>
              Draft Email
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', fontSize: 18, color: '#6B7280', cursor: 'pointer' }}
            >
              x
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
            {/* To */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 4 }}>
                To
              </label>
              <div style={{
                fontSize: 14, padding: '8px 12px', background: '#F9FAFB', borderRadius: 8,
                border: '1px solid #E5E7EB', color: '#0a0f1e',
              }}>
                {toName} &lt;{to}&gt;
              </div>
            </div>

            {/* From */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 4 }}>
                From
              </label>
              <div style={{
                fontSize: 14, padding: '8px 12px', background: '#F9FAFB', borderRadius: 8,
                border: '1px solid #E5E7EB', color: '#6B7280',
              }}>
                Bella -- Teachers Deserve It &lt;noreply@teachersdeserveit.com&gt;
              </div>
            </div>

            {/* Subject — editable */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 4 }}>
                Subject
              </label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                style={{
                  fontSize: 14, padding: '8px 12px', borderRadius: 8,
                  border: '1px solid #E5E7EB', width: '100%', boxSizing: 'border-box',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </div>

            {/* Body — editable */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 4 }}>
                Message <span style={{ fontWeight: 400, textTransform: 'none' }}>(edit as needed before sending)</span>
              </label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={12}
                style={{
                  fontSize: 14, padding: '12px 14px', borderRadius: 8,
                  border: '1px solid #E5E7EB', width: '100%', boxSizing: 'border-box',
                  fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, resize: 'vertical',
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA',
                borderRadius: 8, color: '#991B1B', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            {/* Sent success */}
            {sent && (
              <div style={{
                padding: '10px 14px', background: '#D1FAE5', border: '1px solid #6EE7B7',
                borderRadius: 8, color: '#065F46', fontSize: 13, fontWeight: 600,
              }}>
                Sent to {toName} ({to})
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '12px 20px', borderTop: '1px solid #E5E7EB',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>
              Reply-To: hello@teachersdeserveit.com
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={onClose}
                style={{
                  fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 8,
                  border: '1px solid #E5E7EB', background: 'white', color: '#374151', cursor: 'pointer',
                }}
              >
                {sent ? 'Close' : 'Cancel'}
              </button>
              {!sent && (
                <button
                  onClick={handleSend}
                  disabled={sending || !subject || !body}
                  style={{
                    fontSize: 13, fontWeight: 700, padding: '8px 24px', borderRadius: 8,
                    border: 'none', background: sending ? '#9CA3AF' : '#8B5CF6',
                    color: 'white', cursor: sending ? 'default' : 'pointer',
                  }}
                >
                  {sending ? 'Sending...' : 'Send Email'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Email templates ──

export function introEmailDraft(contactName: string, schoolName: string): { subject: string; body: string } {
  const firstName = contactName.split(' ')[0]
  return {
    subject: `Grant funding support for ${schoolName}`,
    body: `Hi ${firstName},

I'm Bella, and I'll be your point of contact at Teachers Deserve It for grant funding support.

We're putting together a grant funding plan for ${schoolName} to help cover professional development services. Over the next week, I'll be identifying specific grant opportunities your school is eligible for and preparing application materials.

Here's what you can expect from me:
- A list of 3-5 grants we're targeting for your school
- Draft application narratives ready for your review
- Guidance on any account setup or submissions needed on your end

If you have any questions or there are specific grants you've had success with in the past, I'd love to hear about them.

Looking forward to working with you!

Bella
Teachers Deserve It`,
  }
}

export function schoolInfoEmailDraft(contactName: string, schoolName: string, missingFields: string[]): { subject: string; body: string } {
  const firstName = contactName.split(' ')[0]
  const fieldList = missingFields.map(f => `- ${f}`).join('\n')
  return {
    subject: `Quick info needed for ${schoolName} grant applications`,
    body: `Hi ${firstName},

I'm getting started on identifying grant opportunities for ${schoolName}, and I need a few pieces of information to make sure we're targeting the right funding sources.

Could you help me with the following?

${fieldList}

Most of this is quick -- if you have a staff directory page or school profile handy, that would cover most of it. I can also look up some of this on my end if you point me in the right direction.

No rush on a formal response -- a quick reply with whatever you have is perfect.

Thanks!
Bella
Teachers Deserve It`,
  }
}

export function followUpEmailDraft(contactName: string, schoolName: string, topic: string): { subject: string; body: string } {
  const firstName = contactName.split(' ')[0]
  return {
    subject: `Following up: ${topic}`,
    body: `Hi ${firstName},

I wanted to follow up on ${topic} for ${schoolName}.

Is there anything I can help with on this? Happy to jump on a quick call if that's easier.

Best,
Bella
Teachers Deserve It`,
  }
}
