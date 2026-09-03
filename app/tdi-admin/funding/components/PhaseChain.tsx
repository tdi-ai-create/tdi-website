'use client'

import { useEffect, useState } from 'react'
import { FUNDING_PHASES } from '@/lib/funding-phases'

/**
 * The nine phases, and what a person knows about each one.
 *
 * These squares used to be decoration: a label and a hover tooltip, with
 * nowhere to record what was actually happening. Bella asked to be able to open
 * one and either add detail, say what happens next, or say it does not need to
 * happen for this school at all.
 *
 * A phase marked not applicable is struck through rather than hidden. A skipped
 * step that disappears looks the same as one nobody ever considered, and the
 * whole point of marking it is to show the decision was made.
 */

const STATUS_COLORS = {
  complete: { bg: '#D1FAE5', text: '#065F46', border: '#10B981' },
  active: { bg: '#DBEAFE', text: '#1E40AF', border: '#3B82F6' },
  stalled: { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' },
  upcoming: { bg: '#F3F4F6', text: '#9CA3AF', border: '#E5E7EB' },
  skipped: { bg: '#FAFAFA', text: '#B0B6BE', border: '#E5E7EB' },
}

interface PhaseRow {
  phase_id: string
  applicable: boolean
  detail: string | null
  next_step: string | null
  updated_by: string | null
  updated_at: string | null
}

export function PhaseChain({
  currentPhase,
  isStalled,
  pursuitId,
}: {
  currentPhase: string
  isStalled: boolean
  /** Omit to keep the old read-only chain, which is what the dead panels pass. */
  pursuitId?: string
}) {
  const currentIdx = FUNDING_PHASES.findIndex(p => p.id === currentPhase)
  const [rows, setRows] = useState<Record<string, PhaseRow>>({})
  const [open, setOpen] = useState<string | null>(null)
  const [draft, setDraft] = useState({ detail: '', nextStep: '', applicable: true })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!pursuitId) return
    fetch(`/api/funding/pursuits/${pursuitId}/phases`)
      .then(r => r.json())
      .then(d => {
        const byPhase: Record<string, PhaseRow> = {}
        for (const row of d.phases || []) byPhase[row.phase_id] = row
        setRows(byPhase)
      })
      .catch(() => {})
  }, [pursuitId])

  const openPhase = (phaseId: string) => {
    if (!pursuitId) return
    const existing = rows[phaseId]
    setDraft({
      detail: existing?.detail || '',
      nextStep: existing?.next_step || '',
      applicable: existing?.applicable ?? true,
    })
    setError(null)
    setOpen(cur => (cur === phaseId ? null : phaseId))
  }

  const save = async (phaseId: string, patch?: Partial<typeof draft>) => {
    if (!pursuitId) return
    const payload = { ...draft, ...(patch || {}) }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/funding/pursuits/${pursuitId}/phases`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phaseId,
          detail: payload.detail,
          nextStep: payload.nextStep,
          applicable: payload.applicable,
        }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(d.error || 'That did not save. Nothing was changed.')
        return
      }
      setRows(r => ({ ...r, [phaseId]: d.phase }))
      setDraft(payload)
      if (!patch) setOpen(null)
    } catch {
      setError('Could not reach the server. Nothing was changed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        {FUNDING_PHASES.map((phase, idx) => {
          const row = rows[phase.id]
          const skipped = row && row.applicable === false

          let status: keyof typeof STATUS_COLORS
          if (skipped) status = 'skipped'
          else if (idx < currentIdx) status = 'complete'
          else if (idx === currentIdx) status = isStalled ? 'stalled' : 'active'
          else status = 'upcoming'

          const colors = STATUS_COLORS[status]
          const hasNotes = !!(row?.detail || row?.next_step)

          const label = (
            <>
              {phase.label}
              {hasNotes && (
                <span
                  style={{
                    marginLeft: 5, width: 5, height: 5, borderRadius: '50%',
                    background: colors.text, display: 'inline-block', verticalAlign: 'middle',
                  }}
                />
              )}
            </>
          )

          const boxStyle: React.CSSProperties = {
            padding: '5px 10px',
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 10,
            background: colors.bg,
            color: colors.text,
            border: `1px solid ${open === phase.id ? colors.text : colors.border}`,
            whiteSpace: 'nowrap',
            letterSpacing: 0.3,
            textDecoration: skipped ? 'line-through' : 'none',
            fontFamily: 'inherit',
          }

          if (!pursuitId) {
            return <div key={phase.id} title={`${phase.label}: ${phase.tip}`} style={boxStyle}>{label}</div>
          }

          return (
            <button
              key={phase.id}
              onClick={() => openPhase(phase.id)}
              title={skipped ? `${phase.label}: marked as not needed for this school` : `${phase.label}: ${phase.tip}`}
              style={{ ...boxStyle, cursor: 'pointer' }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {open && pursuitId && (() => {
        const phase = FUNDING_PHASES.find(p => p.id === open)!
        const row = rows[open]
        return (
          <div style={{
            marginTop: 10, padding: 16, background: '#FAFAFA',
            border: '1px solid #E5E7EB', borderRadius: 10, maxWidth: 620,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0a0f1e', marginBottom: 3 }}>
              {phase.label}
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 14 }}>{phase.tip}</div>

            <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>
              What is happening here
            </label>
            <textarea
              value={draft.detail}
              onChange={e => setDraft(d => ({ ...d, detail: e.target.value }))}
              placeholder="Anything worth knowing about this phase for this school"
              rows={2}
              style={{
                width: '100%', fontSize: 13, padding: '8px 10px', borderRadius: 6,
                border: '1px solid #D1D5DB', fontFamily: 'inherit', resize: 'vertical', marginBottom: 12,
              }}
            />

            <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>
              What happens next
            </label>
            <textarea
              value={draft.nextStep}
              onChange={e => setDraft(d => ({ ...d, nextStep: e.target.value }))}
              placeholder="The next concrete step, and who takes it"
              rows={2}
              style={{
                width: '100%', fontSize: 13, padding: '8px 10px', borderRadius: 6,
                border: '1px solid #D1D5DB', fontFamily: 'inherit', resize: 'vertical', marginBottom: 12,
              }}
            />

            {error && (
              <div style={{
                fontSize: 12, color: '#991B1B', background: '#FEF2F2', border: '1px solid #FCA5A5',
                borderRadius: 6, padding: '8px 10px', marginBottom: 12,
              }}>{error}</div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => save(open)}
                disabled={saving}
                style={{
                  fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 6,
                  border: 'none', background: saving ? '#D1D5DB' : '#1e2749', color: 'white',
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >{saving ? 'Saving...' : 'Save'}</button>

              <button
                onClick={() => save(open, { applicable: !draft.applicable })}
                disabled={saving}
                style={{
                  fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 6,
                  border: '1px solid #D1D5DB', background: 'white', color: '#374151',
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {draft.applicable ? 'This does not need to happen' : 'Actually, this does apply'}
              </button>

              <button
                onClick={() => setOpen(null)}
                style={{
                  fontSize: 12, background: 'none', border: 'none', color: '#6B7280',
                  cursor: 'pointer', padding: 0, textDecoration: 'underline',
                }}
              >Close</button>

              {row?.updated_by && row.updated_at && (
                <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 'auto' }}>
                  Last saved by {row.updated_by} on {String(row.updated_at).slice(0, 10)}
                </span>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
