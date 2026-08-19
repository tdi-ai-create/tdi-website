'use client'

// ---------------------------------------------------------------------------
// The application queue.
//
// This page is the source of truth, not the notification email. An email that
// is never opened is indistinguishable from no application, which is exactly
// how seven of them accumulated between June and August with nobody answering.
//
// Nothing here acts on arrival. Every decision needs a click on this page while
// signed in, so a mail scanner following a link can never accept anyone.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { TYPE_PAGE_TITLE, TYPE_PAGE_SUBTITLE } from '@/components/tdi-admin/ui/design-tokens'

interface Prior {
  existingCreator: {
    id: string
    name: string | null
    status: string | null
    lifecycle_state: string | null
    publish_status: string | null
    created_at: string
  } | null
  earlierApplications: Array<{
    id: string
    submitted_at: string
    status: string
    decision_reason: string | null
  }>
}

interface Application {
  id: string
  name: string | null
  email: string | null
  strategy: string | null
  content_types: string | null
  referral_dropdown: string | null
  other_referral: string | null
  submitted_at: string
  status: string
  reviewed_by: string | null
  reviewed_at: string | null
  decision_reason: string | null
  revisit_on: string | null
  created_creator_id: string | null
  waitingDays: number
  acceptEffect: string
  prior: Prior
}

const CARD: React.CSSProperties = {
  background: 'white',
  borderRadius: 12,
  border: '1px solid #E5E7EB',
  padding: '18px 20px',
}

const LABEL: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#6B7280',
}

const BTN: React.CSSProperties = {
  padding: '9px 16px',
  borderRadius: 8,
  border: '1px solid transparent',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
}

function daysLabel(d: number): string {
  if (d === 0) return 'today'
  if (d === 1) return '1 day'
  return `${d} days`
}

export default function CreatorApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'open' | 'all'>('open')
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<{ tone: 'ok' | 'bad'; text: string } | null>(null)
  const [drafting, setDrafting] = useState<{ id: string; decision: 'hold' | 'decline' } | null>(null)
  const [reason, setReason] = useState('')
  const [revisitOn, setRevisitOn] = useState('')

  const [reloadKey, setReloadKey] = useState(0)
  const reload = useCallback(() => setReloadKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch(`/api/tdi-admin/creator-applications?status=${view}`)
        const data = await res.json()
        if (!cancelled) setApps(data.applications || [])
      } catch {
        if (!cancelled) setMessage({ tone: 'bad', text: 'Could not load applications.' })
      }
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [view, reloadKey])

  const decide = async (
    app: Application,
    decision: 'accept' | 'hold' | 'decline',
    extra: { reason?: string; revisitOn?: string } = {}
  ) => {
    setBusy(app.id)
    setMessage(null)
    try {
      const res = await fetch('/api/tdi-admin/creator-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: app.id, decision, ...extra }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setMessage({ tone: 'bad', text: data.error || 'That did not go through.' })
      } else {
        setMessage({ tone: 'ok', text: `${app.name || app.email}: ${data.effect}` })
        setDrafting(null)
        setReason('')
        setRevisitOn('')
        reload()
      }
    } catch {
      setMessage({ tone: 'bad', text: 'That did not go through.' })
    }
    setBusy(null)
  }

  const confirmAccept = (app: Application) => {
    const warning =
      app.acceptEffect === 'creates a new creator'
        ? ''
        : `\n\nNote: this ${app.acceptEffect}.`
    const ok = window.confirm(
      `Accept ${app.name || app.email}?\n\nThis creates their account and emails them a welcome with a sign in link straight away.${warning}`
    )
    if (ok) decide(app, 'accept')
  }

  const open = apps.filter((a) => a.status === 'pending' || a.status === 'held')

  return (
    <div style={{ padding: '24px 32px', fontFamily: "'DM Sans', sans-serif", maxWidth: 900 }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/tdi-admin/creators" style={{ fontSize: 13, color: '#8B5CF6', textDecoration: 'none' }}>
          &larr; Back to Creators
        </Link>
      </div>

      <h1 style={{ ...TYPE_PAGE_TITLE, margin: '0 0 4px' }}>Applications</h1>
      <p style={{ ...TYPE_PAGE_SUBTITLE, marginBottom: 20 }}>
        Everyone who has asked to create with us and is waiting on an answer
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {(['open', 'all'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              ...BTN,
              background: view === v ? '#0a0f1e' : 'white',
              color: view === v ? 'white' : '#374151',
              borderColor: view === v ? '#0a0f1e' : '#E5E7EB',
            }}
          >
            {v === 'open' ? 'Waiting' : 'Everything'}
          </button>
        ))}
        {view === 'open' && open.length > 0 && (
          <div style={{ alignSelf: 'center', marginLeft: 6, fontSize: 13, color: '#6B7280' }}>
            {open.length} waiting, oldest {daysLabel(Math.max(...open.map((a) => a.waitingDays)))}
          </div>
        )}
      </div>

      {message && (
        <div
          style={{
            marginBottom: 16,
            padding: '12px 14px',
            borderRadius: 10,
            fontSize: 14,
            background: message.tone === 'ok' ? '#ECFDF5' : '#FEF2F2',
            border: `1px solid ${message.tone === 'ok' ? '#A7F3D0' : '#FECACA'}`,
            color: message.tone === 'ok' ? '#065F46' : '#991B1B',
          }}
        >
          {message.text}
        </div>
      )}

      {loading && <div style={{ color: '#6B7280', fontSize: 14 }}>Loading...</div>}

      {!loading && apps.length === 0 && (
        <div style={{ ...CARD, color: '#6B7280', fontSize: 14 }}>
          Nothing waiting. New applications land here the moment someone submits the form.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {apps.map((app) => {
          const decided = app.status !== 'pending' && app.status !== 'held'
          const blocked = app.acceptEffect === 'blocked, already active'
          return (
            <div key={app.id} style={CARD}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0a0f1e' }}>
                    {app.name || 'No name given'}
                  </div>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>{app.email}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={LABEL}>{app.status === 'held' ? 'Held' : app.status === 'pending' ? 'Waiting' : app.status}</div>
                  <div style={{ fontSize: 13, color: app.waitingDays >= 7 ? '#B45309' : '#6B7280' }}>
                    {app.status === 'pending' ? `${daysLabel(app.waitingDays)} without an answer` : ''}
                    {app.status === 'held' && app.revisit_on ? `back on ${app.revisit_on}` : ''}
                    {decided && app.reviewed_by ? `${app.status} by ${app.reviewed_by}` : ''}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
                <div>
                  <div style={LABEL}>What they want to make</div>
                  <div style={{ fontSize: 14, color: '#374151' }}>{app.strategy || 'Not given'}</div>
                </div>
                <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                  <div>
                    <div style={LABEL}>Content types</div>
                    <div style={{ fontSize: 14, color: '#374151' }}>{app.content_types || 'Not selected'}</div>
                  </div>
                  <div>
                    <div style={LABEL}>How they found us</div>
                    <div style={{ fontSize: 14, color: '#374151' }}>
                      {app.referral_dropdown || 'Not given'}{app.other_referral ? `, ${app.other_referral}` : ''}
                    </div>
                  </div>
                  <div>
                    <div style={LABEL}>Applied</div>
                    <div style={{ fontSize: 14, color: '#374151' }}>
                      {new Date(app.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {(app.prior.existingCreator || app.prior.earlierApplications.length > 0) && (
                <div
                  style={{
                    marginTop: 14,
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    fontSize: 13,
                    color: '#78350F',
                  }}
                >
                  <div style={{ ...LABEL, color: '#92400E' }}>We have met before</div>
                  {app.prior.existingCreator && (
                    <div style={{ marginTop: 4 }}>
                      Already a creator record, {app.prior.existingCreator.status}
                      {app.prior.existingCreator.lifecycle_state === 'paused' ? ' and paused' : ''}, created{' '}
                      {new Date(app.prior.existingCreator.created_at).toLocaleDateString()}.{' '}
                      <Link
                        href={`/tdi-admin/creators/${app.prior.existingCreator.id}`}
                        style={{ color: '#8B5CF6', fontWeight: 600 }}
                      >
                        Open their record
                      </Link>
                    </div>
                  )}
                  {app.prior.earlierApplications.map((e) => (
                    <div key={e.id} style={{ marginTop: 4 }}>
                      Applied before on {new Date(e.submitted_at).toLocaleDateString()}, {e.status}
                      {e.decision_reason ? `: ${e.decision_reason}` : ''}
                    </div>
                  ))}
                </div>
              )}

              {decided && app.decision_reason && (
                <div style={{ marginTop: 12, fontSize: 13, color: '#6B7280' }}>
                  Reason on file: {app.decision_reason}
                </div>
              )}

              {!decided && (
                <>
                  <div style={{ marginTop: 16, fontSize: 12, color: '#6B7280' }}>
                    Accepting {app.acceptEffect}.
                  </div>

                  {drafting?.id === app.id ? (
                    <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                      <div>
                        <div style={LABEL}>
                          {drafting.decision === 'hold' ? 'Why are we holding this' : 'Why are we declining'}
                        </div>
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          rows={2}
                          placeholder={
                            drafting.decision === 'hold'
                              ? 'Good fit, no capacity until the new term'
                              : 'Not a fit for what we publish'
                          }
                          style={{
                            width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E7EB',
                            fontSize: 14, fontFamily: 'inherit', resize: 'vertical',
                          }}
                        />
                        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                          {drafting.decision === 'hold'
                            ? 'Only we see this. Nothing is sent to the applicant.'
                            : 'Only we see this. The applicant gets a warm note inviting them to apply again.'}
                        </div>
                      </div>

                      {drafting.decision === 'hold' && (
                        <div>
                          <div style={LABEL}>Bring it back on</div>
                          <input
                            type="date"
                            value={revisitOn}
                            onChange={(e) => setRevisitOn(e.target.value)}
                            style={{
                              padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E7EB',
                              fontSize: 14, fontFamily: 'inherit',
                            }}
                          />
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          disabled={busy === app.id || !reason.trim() || (drafting.decision === 'hold' && !revisitOn)}
                          onClick={() =>
                            decide(app, drafting.decision, {
                              reason,
                              revisitOn: drafting.decision === 'hold' ? revisitOn : undefined,
                            })
                          }
                          style={{
                            ...BTN,
                            background: '#0a0f1e',
                            color: 'white',
                            opacity: !reason.trim() || (drafting.decision === 'hold' && !revisitOn) ? 0.4 : 1,
                          }}
                        >
                          {drafting.decision === 'hold' ? 'Hold it' : 'Send the decline'}
                        </button>
                        <button
                          onClick={() => { setDrafting(null); setReason(''); setRevisitOn('') }}
                          style={{ ...BTN, background: 'white', color: '#374151', borderColor: '#E5E7EB' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        disabled={busy === app.id || blocked}
                        onClick={() => confirmAccept(app)}
                        title={blocked ? 'They are already an active creator' : undefined}
                        style={{
                          ...BTN,
                          background: blocked ? '#E5E7EB' : '#047857',
                          color: blocked ? '#9CA3AF' : 'white',
                          cursor: blocked ? 'not-allowed' : 'pointer',
                        }}
                      >
                        Accept
                      </button>
                      <button
                        disabled={busy === app.id}
                        onClick={() => { setDrafting({ id: app.id, decision: 'hold' }); setReason(''); setRevisitOn('') }}
                        style={{ ...BTN, background: 'white', color: '#374151', borderColor: '#E5E7EB' }}
                      >
                        Hold for later
                      </button>
                      <button
                        disabled={busy === app.id}
                        onClick={() => { setDrafting({ id: app.id, decision: 'decline' }); setReason('') }}
                        style={{ ...BTN, background: 'white', color: '#B91C1C', borderColor: '#FECACA' }}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
