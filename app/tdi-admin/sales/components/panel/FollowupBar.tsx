'use client'

import { useEffect, useState } from 'react'
import { SALES_TEAM, teamLabel } from '@/lib/sales/team'
import {
  FOLLOWUP_KINDS, URGENCY_COLOR, hasFollowup, shortDate, urgency,
  type Followup,
} from '@/lib/sales/followup'

interface Props {
  opportunityId: string
  followup: Followup
  /** Called with the saved alert so the board can update without a reload. */
  onSaved: (next: Followup) => void
  showToast: (message: string, type: 'success' | 'error') => void
}

const KIND_WORD: Record<string, string> = {
  call: 'Call',
  email: 'Email',
  meeting: 'Meeting',
  other: 'Follow up',
}

/**
 * The follow-up alert, at the top of the lead panel.
 *
 * Reads as a banner when something is owed and as a quiet "add" link when
 * nothing is. It sits above the notes rather than inside them on purpose: the
 * alert is what has to happen next, and it stops being useful the moment you
 * have to scroll a history to find it.
 *
 * Saving writes a note as well as the alert. That is the whole point of the
 * feature, so the button says so.
 */
export function FollowupBar({ opportunityId, followup, onSaved, showToast }: Props) {
  const live = hasFollowup(followup)
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(followup.text ?? '')
  const [kind, setKind] = useState(followup.kind ?? 'call')
  const [owner, setOwner] = useState(followup.owner ?? '')
  const [due, setDue] = useState(followup.due ?? '')
  const [saving, setSaving] = useState(false)

  // Reset the form when the panel switches to a different lead. Without this
  // the draft alert for one district follows you onto the next one.
  useEffect(() => {
    setEditing(false)
    setText(followup.text ?? '')
    setKind(followup.kind ?? 'call')
    setOwner(followup.owner ?? '')
    setDue(followup.due ?? '')
  }, [opportunityId, followup.text, followup.kind, followup.owner, followup.due])

  const tone = URGENCY_COLOR[urgency(followup.due)]

  async function save() {
    if (!text.trim()) {
      showToast('Say what they are taking on', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/sales/opportunities/${opportunityId}/followup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), kind, owner: owner || null, due: due || null }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload.error || 'Save failed')
      onSaved({
        text: payload.followup_text ?? null,
        kind: payload.followup_kind ?? null,
        owner: payload.followup_owner ?? null,
        due: payload.followup_due ?? null,
        setBy: payload.followup_set_by ?? null,
        setAt: payload.followup_set_at ?? null,
      })
      // The alert saved either way. Saying so separately means a missing note is
      // never read as a failed save, and never goes unnoticed either.
      showToast(
        payload.noteWritten === false
          ? 'Follow-up saved, but the note did not write'
          : 'Follow-up saved and written to notes',
        payload.noteWritten === false ? 'error' : 'success'
      )
      setEditing(false)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not save the follow-up', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function clear() {
    setSaving(true)
    try {
      const res = await fetch(`/api/sales/opportunities/${opportunityId}/followup`, { method: 'DELETE' })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload.error || 'Could not clear it')
      onSaved({ text: null, kind: null, owner: null, due: null, setBy: null, setAt: null })
      setText(''); setKind('call'); setOwner(''); setDue('')
      setEditing(false)
      showToast('Follow-up cleared and written to notes', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not clear the follow-up', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    if (!live) {
      return (
        <div style={{ padding: '8px 20px', borderBottom: '1px solid #E5E7EB', background: '#FAFAFA' }}>
          <button
            onClick={() => setEditing(true)}
            title="Put someone's name against the next thing this lead needs. Everyone sees it, it posts to Slack, and it is written into the notes."
            style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              fontSize: 12, color: '#2A9D8F', fontWeight: 600,
            }}
          >
            + Give this to someone
          </button>
        </div>
      )
    }

    const when = shortDate(followup.due)
    const state = urgency(followup.due)
    const who = followup.owner ? teamLabel(followup.owner) : null
    return (
      <div style={{
        padding: '10px 20px', borderBottom: `1px solid ${tone.border}`,
        background: tone.bg, display: 'flex', alignItems: 'flex-start', gap: 12,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* The name leads. A follow-up is a person taking something on, and
              the deadline is a detail of that rather than the headline. Rae, 24
              September 2026: this is "less about date and more about this is
              your responsibility to follow up with". An unclaimed one says so
              in plain words, because that is the state worth fixing. */}
          <div style={{
            fontSize: 12, fontWeight: 800, letterSpacing: '0.01em',
            color: who ? tone.fg : '#B45309', marginBottom: 3,
          }}>
            {who ? `${who} is on this` : 'Nobody has taken this on'}
            <span style={{ fontWeight: 600, marginLeft: 6, opacity: 0.85 }}>
              {(KIND_WORD[followup.kind ?? 'other'] ?? 'Follow up').toLowerCase()}
              {when ? `, by ${when}` : ''}
            </span>
            {state === 'overdue' && (
              <span style={{
                marginLeft: 8, fontSize: 9, fontWeight: 800, letterSpacing: '0.06em',
                border: `1px solid ${tone.border}`, borderRadius: 4, padding: '1px 5px',
              }}>
                PAST DUE
              </span>
            )}
          </div>
          <div style={{ fontSize: 13, color: '#1F2937', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
            {followup.text}
          </div>
          {followup.setBy && followup.setAt && (
            <div style={{ fontSize: 11, color: tone.fg, opacity: 0.8, marginTop: 3 }}>
              Set by {teamLabel(followup.setBy)} on{' '}
              {new Date(followup.setAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, paddingTop: 2 }}>
          <button
            onClick={() => setEditing(true)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12, color: tone.fg, fontWeight: 600 }}
          >
            Edit
          </button>
          <button
            onClick={clear}
            disabled={saving}
            title="Clears the alert and writes what it said into the notes."
            style={{ background: 'none', border: 'none', padding: 0, cursor: saving ? 'default' : 'pointer', fontSize: 12, color: tone.fg, opacity: saving ? 0.5 : 0.75 }}
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '12px 20px', borderBottom: '1px solid #E5E7EB', background: '#FAFAFA' }}>
      {/* Responsibility first, deadline last.
          Rae, 24 September 2026: this is "less about date and more about this
          is your responsibility to follow up with". So the sentence the form
          makes reads person, then action, and the date is an optional trailing
          clause rather than the second thing you are asked for. */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: '#6B7280', flex: '0 0 auto' }}>Responsible</span>
        <select
          value={owner}
          onChange={e => setOwner(e.target.value)}
          title="Who is taking this on. Separate from who owns the lead."
          style={{ ...selectStyle, minWidth: 148, fontWeight: 600 }}
        >
          <option value="">Pick a person</option>
          {SALES_TEAM.map(m => <option key={m.email} value={m.email}>{m.label}</option>)}
        </select>
        <span style={{ fontSize: 12, color: '#6B7280', flex: '0 0 auto' }}>for the</span>
        <select
          value={kind}
          onChange={e => setKind(e.target.value)}
          title="What they are taking on."
          style={{ ...selectStyle, minWidth: 104 }}
        >
          {FOLLOWUP_KINDS.map(k => <option key={k} value={k}>{KIND_WORD[k].toLowerCase()}</option>)}
        </select>
        <span style={{ fontSize: 12, color: '#9CA3AF', flex: '0 0 auto' }}>by (optional)</span>
        <input
          type="date"
          value={due}
          onChange={e => setDue(e.target.value)}
          title="A deadline, if there is one. Leave it blank and the job still belongs to whoever is named."
          style={{ ...selectStyle, minWidth: 150 }}
        />
      </div>
      <textarea
        autoFocus
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="What are they taking on? e.g. Call Jennifer about elementary paras before the board meeting."
        rows={2}
        style={{
          width: '100%', fontSize: 13, padding: '8px 10px', borderRadius: 8,
          border: '1px solid #D1D5DB', outline: 'none', resize: 'vertical',
          fontFamily: 'inherit', lineHeight: 1.45,
        }}
      />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8 }}>
        <button
          onClick={save}
          disabled={saving || !text.trim()}
          style={{
            background: '#1B2A4A', color: 'white', border: 'none', borderRadius: 8,
            padding: '6px 14px', fontSize: 12, fontWeight: 600,
            cursor: saving || !text.trim() ? 'default' : 'pointer',
            opacity: saving || !text.trim() ? 0.5 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Assign and write to notes'}
        </button>
        <button
          onClick={() => {
            setEditing(false)
            setText(followup.text ?? ''); setKind(followup.kind ?? 'call')
            setOwner(followup.owner ?? ''); setDue(followup.due ?? '')
          }}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12, color: '#6B7280' }}
        >
          Cancel
        </button>
        <span style={{ fontSize: 11, color: '#9CA3AF' }}>
          Everyone on the board sees this, and it posts to Slack.
        </span>
      </div>
    </div>
  )
}

/**
 * Widths are explicit because they have to be.
 *
 * With no width these three sat on three separate rows rather than side by
 * side: a base stylesheet gives `select` a full width, so each one filled the
 * flex line and pushed the next one down. Measured on production, both selects
 * came back 1112px wide inside a 1152px panel. Seen, then fixed.
 */
const selectStyle: React.CSSProperties = {
  fontSize: 12, color: '#374151', border: '1px solid #D1D5DB',
  borderRadius: 6, padding: '4px 8px', background: 'white', outline: 'none',
  width: 'auto', flex: '0 0 auto', maxWidth: '100%',
}
