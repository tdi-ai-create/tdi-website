'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ClipboardList, Check, Paperclip, ExternalLink, Loader2 } from 'lucide-react'

/**
 * Visit prep for an upcoming observation day.
 *
 * The SOP asks a school for a roster, bell times and a schedule about three
 * weeks out. Their answers used to land in an inbox and stop there, so this is
 * the place to put them: notes for anything pasted from an email, files for
 * anything attached, and one control to say the prep is handled.
 *
 * Marking it done is what silences the reminder email and drops the urgent card
 * off the partnership, so it is deliberately a toggle rather than a one way
 * door. Somebody will tick it early.
 */

interface PrepFile {
  name: string
  url: string
  size: number
  uploaded_at: string
  uploaded_by: string
}

interface Prep {
  id: string
  visit_date: string
  prep_notes: string | null
  prep_files: PrepFile[]
  prep_done_at: string | null
}

export function VisitPrepPanel({
  eventId,
  daysUntil,
  onDoneChange,
}: {
  eventId: string
  daysUntil: number
  onDoneChange?: (done: boolean) => void
}) {
  const [prep, setPrep] = useState<Prep | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/tdi-admin/visit-prep/${eventId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Could not load')
        return r.json()
      })
      .then((data: Prep) => {
        if (cancelled) return
        setPrep(data)
        setNotes(data.prep_notes || '')
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [eventId])

  const saveNotes = useCallback(async () => {
    if (!prep) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/tdi-admin/visit-prep/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prep_notes: notes }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Could not save')
      setSavedAt(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }, [eventId, notes, prep])

  const toggleDone = useCallback(async () => {
    if (!prep) return
    const next = !prep.prep_done_at
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/tdi-admin/visit-prep/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: next }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Could not save')
      const updated = await res.json()
      setPrep({ ...prep, prep_done_at: updated.prep_done_at })
      onDoneChange?.(Boolean(updated.prep_done_at))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }, [eventId, prep, onDoneChange])

  const attach = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || !prep) return
      setUploading(true)
      setError(null)
      try {
        const form = new FormData()
        Array.from(files).forEach((f) => form.append('files', f))
        const res = await fetch(`/api/tdi-admin/visit-prep/${eventId}`, {
          method: 'POST',
          body: form,
        })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Upload failed')
        const data = await res.json()
        setPrep({ ...prep, prep_files: data.prep_files })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Upload failed')
      } finally {
        setUploading(false)
        if (fileInput.current) fileInput.current.value = ''
      }
    },
    [eventId, prep]
  )

  if (loading) {
    return (
      <div style={panel}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6B7280', fontSize: 13 }}>
          <Loader2 size={14} className="animate-spin" /> Loading visit prep...
        </div>
      </div>
    )
  }

  if (!prep) {
    return (
      <div style={panel}>
        <p style={{ color: '#991B1B', fontSize: 13, margin: 0 }}>
          {error || 'No observation day found for this event.'}
        </p>
      </div>
    )
  }

  const done = Boolean(prep.prep_done_at)

  return (
    <div style={{ ...panel, borderColor: done ? '#BBF7D0' : daysUntil <= 14 ? '#FECACA' : '#E5E7EB' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ClipboardList size={16} color="#1e2749" />
          <strong style={{ fontSize: 15, color: '#1e2749' }}>Visit prep</strong>
          <span style={{ fontSize: 12, color: '#6B7280' }}>
            {done
              ? 'Handled'
              : daysUntil === 0
                ? 'Observation day is today'
                : `Observation day in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a
            href="/tdi-admin/docs?doc=visit-prep-sop"
            target="_blank"
            rel="noreferrer"
            style={linkBtn}
          >
            <ExternalLink size={13} /> SOP and email template
          </a>
          <button onClick={toggleDone} disabled={saving} style={done ? doneBtnOn : doneBtn}>
            <Check size={13} /> {done ? 'Prep done' : 'Mark prep done'}
          </button>
        </div>
      </div>

      <p style={{ fontSize: 12.5, color: '#6B7280', margin: '10px 0 0' }}>
        What the school has sent back. Paste anything that arrived by email, and attach the
        schedule if they sent one.
      </p>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={saveNotes}
        placeholder="Roster notes, bell times, who to look out for, anything they replied with..."
        rows={4}
        style={textarea}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={() => fileInput.current?.click()} disabled={uploading} style={linkBtn}>
          <Paperclip size={13} /> {uploading ? 'Attaching...' : 'Attach a file'}
        </button>
        <input
          ref={fileInput}
          type="file"
          multiple
          onChange={(e) => attach(e.target.files)}
          style={{ display: 'none' }}
        />
        {saving && <span style={{ fontSize: 12, color: '#6B7280' }}>Saving...</span>}
        {!saving && savedAt && <span style={{ fontSize: 12, color: '#059669' }}>Saved {savedAt}</span>}
        {error && <span style={{ fontSize: 12, color: '#991B1B' }}>{error}</span>}
      </div>

      {prep.prep_files.length > 0 && (
        <ul style={{ listStyle: 'none', margin: '4px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {prep.prep_files.map((f) => (
            <li key={f.url} style={{ fontSize: 13 }}>
              <a href={f.url} target="_blank" rel="noreferrer" style={{ color: '#1e2749' }}>
                {f.name}
              </a>
              <span style={{ color: '#9CA3AF', fontSize: 11, marginLeft: 8 }}>
                {Math.round(f.size / 1024)} KB
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const panel: React.CSSProperties = {
  background: 'white',
  border: '1px solid #E5E7EB',
  borderRadius: 12,
  padding: '16px 18px',
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
}

const linkBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 12.5,
  fontWeight: 600,
  color: '#1e2749',
  background: '#F3F4F6',
  border: '1px solid #E5E7EB',
  borderRadius: 8,
  padding: '6px 10px',
  cursor: 'pointer',
  textDecoration: 'none',
}

const doneBtn: React.CSSProperties = { ...linkBtn, background: '#1e2749', color: 'white', borderColor: '#1e2749' }
const doneBtnOn: React.CSSProperties = { ...linkBtn, background: '#F0FDF4', color: '#166534', borderColor: '#BBF7D0' }

const textarea: React.CSSProperties = {
  width: '100%',
  fontFamily: 'inherit',
  fontSize: 13.5,
  lineHeight: 1.5,
  padding: '10px 12px',
  border: '1px solid #E5E7EB',
  borderRadius: 8,
  resize: 'vertical',
  color: '#1e2749',
}
