'use client'

import { useEffect, useState } from 'react'

interface NudgePreviewModalProps {
  actionId: string
  onClose: () => void
  onSent: () => void
}

interface PreviewData {
  to: string
  from: string
  replyTo?: string
  subject: string
  html: string
  tone: string
  emailType: string
  blocked: boolean
  blockReasons: string[]
}

export function NudgePreviewModal({ actionId, onClose, onSent }: NudgePreviewModalProps) {
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  // Fetch preview on mount
  useEffect(() => {
    fetch(`/api/funding/actions/${actionId}/send-nudge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preview: true }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setPreview(d)
        setLoading(false)
      })
      .catch(e => { setError(e.message); setLoading(false) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSend = async () => {
    setSending(true)
    setError('')
    try {
      const res = await fetch(`/api/funding/actions/${actionId}/send-nudge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ send: true }),
      })
      const result = await res.json()
      if (result.sent) {
        setSent(true)
        setTimeout(() => onSent(), 1500)
      } else if (result.blocked) {
        setError(result.blockReason)
      } else if (result.error) {
        setError(result.error)
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* Modal */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'white', borderRadius: 14, width: 620, maxHeight: '90vh',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid #E5E7EB',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0a0f1e' }}>
              Send nudge — preview
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
            {loading && (
              <div style={{ textAlign: 'center', padding: 40, color: '#6B7280', fontSize: 13 }}>
                Loading preview...
              </div>
            )}

            {error && !preview && (
              <div style={{
                padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA',
                borderRadius: 8, color: '#991B1B', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            {preview && (
              <>
                {/* Blocked warnings */}
                {preview.blocked && preview.blockReasons.length > 0 && (
                  <div style={{
                    padding: '12px 16px', background: '#FEF3C7', border: '1px solid #FDE68A',
                    borderRadius: 8, marginBottom: 16,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E', marginBottom: 6 }}>
                      This send is blocked:
                    </div>
                    {preview.blockReasons.map((r, i) => (
                      <div key={i} style={{ fontSize: 12, color: '#92400E', marginTop: 2 }}>
                        {r}
                      </div>
                    ))}
                  </div>
                )}

                {/* Email metadata */}
                <div style={{
                  padding: '12px 16px', background: '#F9FAFB', borderRadius: 8,
                  marginBottom: 16, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                  <div>
                    <span style={{ color: '#6B7280', fontWeight: 600 }}>To: </span>
                    <span style={{ color: '#0a0f1e' }}>{preview.to}</span>
                  </div>
                  <div>
                    <span style={{ color: '#6B7280', fontWeight: 600 }}>From: </span>
                    <span style={{ color: '#0a0f1e' }}>{preview.from}</span>
                  </div>
                  {preview.replyTo && (
                    <div>
                      <span style={{ color: '#6B7280', fontWeight: 600 }}>Reply-To: </span>
                      <span style={{ color: '#0a0f1e' }}>{preview.replyTo}</span>
                    </div>
                  )}
                  <div>
                    <span style={{ color: '#6B7280', fontWeight: 600 }}>Subject: </span>
                    <span style={{ color: '#0a0f1e', fontWeight: 500 }}>{preview.subject}</span>
                  </div>
                  <div>
                    <span style={{ color: '#6B7280', fontWeight: 600 }}>Tone: </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 3,
                      background: preview.tone === 'client' ? '#D1FAE5' : '#DBEAFE',
                      color: preview.tone === 'client' ? '#065F46' : '#1D4ED8',
                    }}>
                      {preview.tone === 'client' ? 'Client (Bella)' : 'Internal (TDI)'}
                    </span>
                  </div>
                </div>

                {/* Rendered email preview */}
                <div style={{
                  border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '6px 12px', background: '#F3F4F6', fontSize: 10,
                    fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB',
                  }}>
                    Email body preview
                  </div>
                  <div
                    style={{ padding: 0 }}
                    dangerouslySetInnerHTML={{ __html: preview.html }}
                  />
                </div>

                {/* Send error */}
                {error && (
                  <div style={{
                    padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA',
                    borderRadius: 8, color: '#991B1B', fontSize: 12, marginTop: 12,
                  }}>
                    {error}
                  </div>
                )}

                {/* Sent success */}
                {sent && (
                  <div style={{
                    padding: '10px 14px', background: '#D1FAE5', border: '1px solid #6EE7B7',
                    borderRadius: 8, color: '#065F46', fontSize: 12, fontWeight: 600, marginTop: 12,
                  }}>
                    Sent successfully to {preview.to}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '12px 20px', borderTop: '1px solid #E5E7EB',
            display: 'flex', justifyContent: 'flex-end', gap: 8,
          }}>
            <button
              onClick={onClose}
              style={{
                fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 6,
                border: '1px solid #E5E7EB', background: 'white', color: '#374151',
                cursor: 'pointer',
              }}
            >
              {sent ? 'Close' : 'Cancel'}
            </button>
            {!sent && preview && !preview.blocked && (
              <button
                onClick={handleSend}
                disabled={sending}
                style={{
                  fontSize: 12, fontWeight: 700, padding: '8px 20px', borderRadius: 6,
                  border: 'none', background: sending ? '#9CA3AF' : '#8B5CF6',
                  color: 'white', cursor: sending ? 'default' : 'pointer',
                }}
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
