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
      showToast('Say what has to happen next', 'error')
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
            title="Set what has to happen next on this lead, who is doing it, and by when. Everyone sees it, and it is written into the notes."
            style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              fontSize: 12, color: '#2A9D8F', fontWeight: 600,
            }}
          >
            + Set a follow-up
          </button>
        </div>
      )
    }

    const when = shortDate(followup.due)
    const state = urgency(followup.due)
    return (
      <div style={{
        padding: '10px 20px', borderBottom: `1px solid ${tone.border}`,
        background: tone.bg, display: 'flex', alignItems: 'flex-start', gap: 12,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: tone.fg, marginBottom: 3,
          }}>
            {KIND_WORD[followup.kind ?? 'other'] ?? 'Follow up'} owed
            {followup.owner ? ` · ${teamLabel(followup.owner)}` : ' · nobody assigned'}
            {when ? ` · ${state === 'overdue' ? 'was due ' : 'due '}${when}` : ' · no date'}
            {state === 'overdue' && ' · OVERDUE'}
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
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
        <select
          value={kind}
          onChange={e => setKind(e.target.value)}
          title="What kind of follow-up is owed."
          style={{ ...selectStyle, minWidth: 104 }}
        >
          {FOLLOWUP_KINDS.map(k => <option key={k} value={k}>{KIND_WORD[k]}</option>)}
        </select>
        <select
          value={owner}
          onChange={e => setOwner(e.target.value)}
          title="Who is doing it. Separate from who owns the lead."
          style={{ ...selectStyle, minWidth: 148 }}
        >
          <option value="">Who is doing it?</option>
          {SALES_TEAM.map(m => <option key={m.email} value={m.email}>{m.label}</option>)}
        </select>
        <input
          type="date"
          value={due}
          onChange={e => setDue(e.target.value)}
          title="The day it is owed by. Leave blank if there is no deadline."
          style={{ ...selectStyle, minWidth: 150 }}
        />
      </div>
      <textarea
        autoFocus
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="What has to happen next? e.g. Call Jennifer about elementary paras before the board meeting."
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
          {saving ? 'Saving...' : 'Save and write to notes'}
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
