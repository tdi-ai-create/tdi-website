'use client'
// v3 - Two-column split layout (Option A). Notes left, context right. No tabs.
import { useEffect, useRef, useState } from 'react'
import { PanelHeader } from './panel/PanelHeader'
import { ContractsTab } from './panel/ContractsTab'
import { IntelligenceTab } from './panel/IntelligenceTab'
import { MuckBar, type MuckPanelScore } from './panel/MuckBar'
import { FollowupBar } from './panel/FollowupBar'
import type { Followup } from '@/lib/sales/followup'
import { SALES_TEAM, teamLabel } from '@/lib/sales/team'

export interface OppNote {
  id: string
  opportunity_id: string
  author_email: string
  note_text: string
  note_type: 'call' | 'email' | 'meeting' | 'demo' | 'update' | 'system'
  created_at: string
  /**
   * Set when the note was written somewhere other than this lead: a merged
   * duplicate, a renewal row, or the client's partnership file. Shown as a
   * badge so a note's origin is never a guess.
   */
  source_label?: string | null
  /** Only this lead's own rows can be deleted from here. */
  deletable?: boolean
}

export interface RelatedRecord {
  kind: 'opportunity' | 'partnership'
  id: string
  label: string
  note_count: number
}

export interface OppActivity {
  id: string
  opportunity_id: string
  actor_email: string
  activity_type: string
  old_value: string | null
  new_value: string | null
  description: string | null
  created_at: string
}

export interface FullOpportunity {
  /** Which of the four offerings is being pitched. Null until decided. */
  offering?: 'PULSE' | 'FOCUS' | 'COHORT' | 'BLUEPRINT' | null
  id: string
  name: string
  stage: string
  value: number | null
  probability: number | null
  assigned_to_email: string | null
  type: string
  source: string | null
  notes: string | null
  last_activity_at: string | null
  is_contact_only: boolean
  created_at: string
  updated_at: string
  notes_list?: OppNote[]
  related_records?: RelatedRecord[]
  activity?: OppActivity[]
  /** Confirmed, never predicted: 25 of the 100 muck points ride on this. */
  grant_support?: boolean | null
  /** The board and the scorer both filter on this. Wrong year means invisible. */
  school_year?: string | null
  /** The live follow-up alert. Written by /followup, never by PATCH. */
  followup_text?: string | null
  followup_kind?: string | null
  followup_owner?: string | null
  followup_due?: string | null
  followup_set_by?: string | null
  followup_set_at?: string | null
  // Optional fields pending DB migration
  [key: string]: unknown
}

const NOTE_TYPES = ['call', 'email', 'meeting', 'demo', 'update'] as const
type NoteType = typeof NOTE_TYPES[number]

const NOTE_TYPE_TOOLTIPS: Record<string, string> = {
  call: 'Log a phone call with this lead',
  email: 'Log an email sent or received',
  meeting: 'Log a meeting (virtual or in-person)',
  demo: 'Log a product demo or Hub walkthrough',
  update: 'Log a general status update or internal note',
}

const STAGE_OPTIONS = [
  { id: 'unassigned', name: 'Unassigned' },
  { id: 'targeting', name: 'Targeting (5%)' },
  { id: 'engaged', name: 'Engaged (20%)' },
  { id: 'qualified', name: 'Qualified (45%)' },
  { id: 'in_conversation', name: 'In Conversation (55%)' },
  { id: 'likely_yes', name: 'Likely Yes (65%)' },
  { id: 'proposal_sent', name: 'Proposal Sent (80%)' },
  { id: 'signed', name: 'Signed (95%)' },
  { id: 'paid', name: 'Paid (100%)' },
  // No "Lost". The pipeline rule is that a lead is never marked lost: in K-12 a
  // no is almost always a not-this-budget-year, and "Not this year" in the
  // footer is what replaced it, writing a reason and a return date and moving
  // the lead to engaged. Leaving the option in the dropdown meant the rule
  // could be broken with one click, which is what was happening.
  //
  // The stage still exists in the database and in STAGE_PROBABILITY below, so
  // any historical row carrying it still renders. It just cannot be chosen.
]

const STAGE_PROBABILITY: Record<string, number> = {
  unassigned: 0, targeting: 5, engaged: 20, qualified: 45,
  in_conversation: 55, likely_yes: 65, proposal_sent: 80, signed: 95, paid: 100, lost: 0,
}

/**
 * Why a district is not moving now.
 *
 * This used to be a "lost" reason list. Rae's rule of 14 August 2026: a no in
 * K-12 is almost always a not-this-budget-year, districts that pass in August
 * are often live again the following spring, and marking them lost takes them
 * out of view until the relationship has gone cold. So the control records a
 * reason, a date to come back, and leaves the lead in the engaged stage, which
 * is where a not-now belongs.
 *
 * "Not a fit" and "Competitor" are kept because they are real and they are not
 * timing, but they still do not close the record.
 */
const PAUSE_REASONS = [
  'Budget year, not this one',
  'No budget at all',
  'Leadership transition',
  'Already committed elsewhere',
  'Not a fit',
  'No response',
  'Other',
]

/** Sensible default: most timing passes come back at the next budget cycle. */
function defaultRevisitDate(): string {
  const d = new Date()
  d.setMonth(d.getMonth() + 4)
  return d.toISOString().slice(0, 10)
}

/** One colour per person on the roster. Grey for anyone not on it. */
const NOTE_AUTHOR_COLOR: Record<string, string> = {
  'rae@teachersdeserveit.com': '#C9A84C',
  'hello@teachersdeserveit.com': '#7C3AED',
  'kristin@whatwilllast.com': '#059669',
  'jim@teachersdeserveit.com': '#3B82F6',
}

const TYPE_BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  system: { bg: '#2A9D8F', color: 'white' },
  meeting: { bg: '#7C3AED', color: 'white' },
  email: { bg: '#3B82F6', color: 'white' },
  call: { bg: '#C9A84C', color: 'white' },
  demo: { bg: '#F59E0B', color: 'white' },
  update: { bg: '#6B7280', color: 'white' },
}

interface Props {
  /** Muck score for this lead, computed board-wide by /api/sales/muck. */
  muck?: MuckPanelScore | null
  opportunityId: string | null
  onClose: () => void
  onUpdate: (id: string, changes: Partial<FullOpportunity>) => void
  onDelete?: (id: string) => void
  showToast: (message: string, type: 'success' | 'error') => void
  /**
   * Ask the board to re-read /api/sales/muck.
   *
   * Muck is computed board-wide and fetched once on load, and the value it
   * returns is what this panel displays. So editing a deal value wrote the new
   * number to the database and then went on showing the old one, on both the
   * panel and the card, until a full page reload. Rae hit this on Morenci on 24
   * September 2026 and reasonably read it as the field refusing to save.
   */
  onMuckStale?: () => void
}

export function OpportunityDetailPanel({
  muck, opportunityId, onClose, onUpdate, onDelete, showToast, onMuckStale }: Props) {
  const [opp, setOpp] = useState<FullOpportunity | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [expanded, setExpanded] = useState(false)
  const prevIdRef = useRef<string | null>(null)
  const intelSectionRef = useRef<HTMLDivElement>(null)
  const rightColRef = useRef<HTMLDivElement>(null)

  // Note input state
  const [noteText, setNoteText] = useState('')
  const [noteType, setNoteType] = useState<NoteType>('update')
  const [noteSaving, setNoteSaving] = useState(false)

  // Right column: inline editing state
  const [editingValue, setEditingValue] = useState(false)
  const [valueInput, setValueInput] = useState('')
  // Set once the value is edited in this session, cleared when the panel opens
  // another lead. See the comment on `shownValue`.
  const [valueJustEdited, setValueJustEdited] = useState(false)

  // Intelligence collapsible
  const [intelOpen, setIntelOpen] = useState(false)

  // Lost modal
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [pauseReason, setPauseReason] = useState('Budget year, not this one')
  const [revisitOn, setRevisitOn] = useState(defaultRevisitDate())

  // Partnership modal state
  const [showPartnershipModal, setShowPartnershipModal] = useState(false)
  const [creatingPartnership, setCreatingPartnership] = useState(false)
  const [partnershipCreated, setPartnershipCreated] = useState(false)
  const [linkedPartnership, setLinkedPartnership] = useState<{
    id: string
    slug: string
    orgName: string
    createdAt?: string
    observationDays?: number
    virtualSessions?: number
    executiveSessions?: number
    staffEnrolled?: number
    baseObservationDays?: number | null
    baseVirtualSessions?: number | null
    baseExecutiveSessions?: number | null
    baseStaffEnrolled?: number | null
  } | null>(null)
  const [pType, setPType] = useState<'school' | 'district'>('school')
  const [pStaff, setPStaff] = useState('')
  const [pObsDays, setPObsDays] = useState('2')
  const [pVirtual, setPVirtual] = useState('4')
  const [pExecutive, setPExecutive] = useState('2')
  const [pBuildings, setPBuildings] = useState('1')
  const [pStart, setPStart] = useState(new Date().toISOString().split('T')[0])
  const [pEnd, setPEnd] = useState('')

  useEffect(() => {
    // Closing clears the lead AND the marker saying which lead is loaded.
    //
    // It used to clear only the lead. So closing a record and opening the same
    // record again left `opp` null while `prevIdRef` still held its id, the
    // guard below decided nothing had changed, `loadOpp` never ran, and the
    // panel rendered as a blank white sheet with no error and no spinner. The
    // only way out was to open a different lead first. Found by pressing it on
    // production, 24 September 2026.
    if (!opportunityId) { setOpp(null); prevIdRef.current = null; return }
    if (opportunityId !== prevIdRef.current) {
      prevIdRef.current = opportunityId
      loadOpp(opportunityId)
    }
  }, [opportunityId])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function loadOpp(id: string) {
    setLoading(true)
    setFetchError('')
    setLinkedPartnership(null)
    setPartnershipCreated(false)
    // A different lead gets the board-wide score again, not the last one's edit.
    setValueJustEdited(false)
    try {
      const res = await fetch(`/api/sales/opportunities/${id}`)
      if (!res.ok) throw new Error('Failed to load opportunity')
      const data = await res.json()
      setOpp({
        ...data,
        notes_list: data.notes_list ?? [],
        related_records: data.related_records ?? [],
        activity: data.activity ?? [],
      })
      // Look up any existing linked partnership
      void fetchLinkedPartnership(id)
    } catch (e: unknown) {
      setFetchError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  async function fetchLinkedPartnership(dealId: string) {
    try {
      const res = await fetch(`/api/admin/partnerships/by-deal?dealId=${encodeURIComponent(dealId)}`)
      if (!res.ok) return
      const data = await res.json()
      if (data && data.id) {
        setLinkedPartnership({
          id: data.id,
          slug: data.slug,
          orgName: data.org_name || data.contact_name || '',
          createdAt: data.created_at,
          observationDays: data.observation_days_total ?? 0,
          virtualSessions: data.virtual_sessions_total ?? 0,
          executiveSessions: data.executive_sessions_total ?? 0,
          staffEnrolled: data.staff_enrolled ?? 0,
          baseObservationDays: data.base_observation_days ?? null,
          baseVirtualSessions: data.base_virtual_sessions ?? null,
          baseExecutiveSessions: data.base_executive_sessions ?? null,
          baseStaffEnrolled: data.base_staff_enrolled ?? null,
        })
        setPartnershipCreated(true)
      }
    } catch {
      // Non-fatal: partnership lookup failure doesn't break the panel
    }
  }

  async function patchOpp(changes: Partial<FullOpportunity>): Promise<boolean> {
    if (!opp) return false
    const prev = { ...opp }
    setOpp(o => o ? { ...o, ...changes } : o)
    try {
      const res = await fetch(`/api/sales/opportunities/${opp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      })
      if (!res.ok) throw new Error('Save failed')
      const updated = await res.json()
      setOpp(o => o ? { ...o, ...updated } : o)
      onUpdate(opp.id, changes)
      // These four are the model's inputs. Change one and every muck number on
      // screen, here and on the card, is stale until the board re-reads it.
      if (['value', 'offering', 'stage', 'state', 'grant_support'].some(k => k in changes)) onMuckStale?.()
      return true
    } catch {
      setOpp(prev)
      showToast('Failed to save changes', 'error')
      return false
    }
  }

  async function addNote(note_text: string, note_type: string) {
    if (!opp) return
    try {
      const res = await fetch(`/api/sales/opportunities/${opp.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_text, note_type }),
      })
      if (!res.ok) throw new Error('Save failed')
      const newNote: OppNote = await res.json()
      setOpp(o => o ? { ...o, notes_list: [newNote, ...(o.notes_list ?? [])] } : o)
      showToast('Note saved', 'success')
    } catch {
      showToast('Failed to save note', 'error')
    }
  }

  async function deleteNote(noteId: string) {
    if (!opp) return
    const prevNotes = opp.notes_list ?? []
    setOpp(o => o ? { ...o, notes_list: prevNotes.filter(n => n.id !== noteId) } : o)
    try {
      const res = await fetch(`/api/sales/opportunities/${opp.id}/notes/${noteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
    } catch {
      setOpp(o => o ? { ...o, notes_list: prevNotes } : o)
      showToast('Failed to delete note', 'error')
    }
  }

  async function handleNoteSave() {
    if (!noteText.trim()) return
    setNoteSaving(true)
    await addNote(noteText.trim(), noteType)
    setNoteText('')
    setNoteSaving(false)
  }

  function commitValue() {
    setEditingValue(false)
    const parsed = parseInt(valueInput.replace(/[^0-9]/g, ''), 10)
    if (!isNaN(parsed) && parsed !== opp?.value) {
      setValueJustEdited(true)
      patchOpp({ value: parsed })
    }
  }

  /**
   * Who wrote it, by colour.
   *
   * Matched against the roster rather than by testing whether the address
   * contains "rae" or "jim". Bella writes from hello@teachersdeserveit.com and
   * Kristin from kristin@whatwilllast.com, and neither substring test would
   * have found either of them.
   */
  function getNoteBarColor(note: OppNote): string {
    if (note.note_type === 'system') return '#2A9D8F'
    return NOTE_AUTHOR_COLOR[note.author_email.toLowerCase().trim()] ?? '#9CA3AF'
  }

  async function markWon() {
    const result = await patchOpp({ stage: 'paid' })
    if (result === false) return
    showToast('Deal marked as Won', 'success')
    onClose()
  }

  /**
   * Not this year. The replacement for "Mark as Lost".
   *
   * Moves the lead to engaged rather than lost, stores the date to come back,
   * and writes the reason into the note history so the next person to open the
   * card can see why without asking anyone.
   */
  async function markNotThisYear() {
    if (!opp) return
    const pretty = new Date(revisitOn + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    })
    const result = await patchOpp({ stage: 'engaged', revisit_on: revisitOn } as any)
    if (result === false) return
    // The note is the part the rule actually asks for, so it is not optional
    // and it is not silent: if it fails the toast says so rather than implying
    // the reason was recorded.
    const noted = await fetch(`/api/sales/opportunities/${opp.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        note_text: `Not this year: ${pauseReason}. Reach back out on ${pretty}. Moved to Engaged rather than closed.`,
        note_type: 'update',
      }),
    }).then(r => r.ok).catch(() => false)
    showToast(
      noted
        ? `Paused until ${pretty}`
        : `Paused until ${pretty}, but the note did not save. Add it by hand.`,
      noted ? 'success' : 'error',
    )
    setShowPauseModal(false)
    onClose()
  }

  async function createPartnership() {
    if (!opp) return
    setCreatingPartnership(true)
    try {
      const res = await fetch('/api/admin/deal-to-partnership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId: (opp as any).supabase_id || opp.id,
          partnershipType: pType,
          contractPhase: 'IGNITE',
          staffCount: parseInt(pStaff) || 0,
          observationDays: parseInt(pObsDays) || 0,
          virtualSessions: parseInt(pVirtual) || 0,
          executiveSessions: parseInt(pExecutive) || 0,
          contractStart: pStart || null,
          contractEnd: pEnd || null,
          buildingCount: parseInt(pBuildings) || 1,
        }),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        showToast(`Partnership created! Dashboard: ${result.partnership.slug}`, 'success')
        setPartnershipCreated(true)
        setLinkedPartnership({
          id: result.partnership.id,
          slug: result.partnership.slug,
          orgName: result.partnership.orgName || opp.name,
          createdAt: new Date().toISOString(),
          observationDays: parseInt(pObsDays) || 0,
          virtualSessions: parseInt(pVirtual) || 0,
          executiveSessions: parseInt(pExecutive) || 0,
          staffEnrolled: parseInt(pStaff) || 0,
          baseObservationDays: null,
          baseVirtualSessions: null,
          baseExecutiveSessions: null,
          baseStaffEnrolled: null,
        })
        setShowPartnershipModal(false)
        patchOpp({ stage: 'signed' })
      } else {
        showToast(result.error || 'Failed to create partnership', 'error')
      }
    } catch {
      showToast('Failed to create partnership', 'error')
    } finally {
      setCreatingPartnership(false)
    }
  }

  if (!opportunityId) return null

  const prob = opp ? (STAGE_PROBABILITY[opp.stage] ?? 0) : 0
  // Until a contract exists the deal value is a prediction, so this tile shows
  // the same figure the card and the pipeline headline show.
  /**
   * Which number to show.
   *
   * Muck's figure, normally: it falls back to list price where a recorded value
   * contradicts the offering, and that correction is the point of it. But the
   * board fetches muck once, so straight after an edit `muck.value` is the OLD
   * number while `opp.value` is what was just saved. Preferring the freshly
   * saved value for the rest of the session stops the panel arguing with the
   * person typing into it. `onMuckStale` re-reads the model right behind this,
   * so the correction still lands, a moment later, on a number that exists.
   */
  const shownValue = valueJustEdited ? (opp?.value ?? null) : (muck?.value ?? opp?.value ?? null)
  const valuePredicted = Boolean(muck?.valuePredicted)
  const factored = shownValue ? Math.round(shownValue * prob / 100) : null
  const o = opp as any

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full ${expanded ? 'sm:w-[95vw]' : 'sm:w-[80vw]'} bg-white z-50 shadow-2xl flex flex-col transition-all duration-200`}
        role="dialog"
        aria-modal="true"
        style={{ overflow: 'hidden' }}
      >
        {/* Expand/collapse toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 bg-white border border-gray-200 rounded-l-lg px-1 py-3 shadow-md hover:bg-gray-50 z-10 hidden sm:block"
          title={expanded ? 'Collapse panel' : 'Expand panel'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {expanded ? <path d="M13 17l5-5-5-5M6 17l5-5-5-5" /> : <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />}
          </svg>
        </button>

        {loading && (
          <div className="flex-1 p-6 space-y-4 animate-pulse">
            <div className="h-7 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="h-24 bg-gray-100 rounded" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
          </div>
        )}

        {!loading && fetchError && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4 text-center">
            <p className="text-red-600 text-sm">{fetchError}</p>
            <button
              onClick={() => opportunityId && loadOpp(opportunityId)}
              className="text-sm text-indigo-600 hover:underline"
            >
              Retry
            </button>
            <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600">
              Close
            </button>
          </div>
        )}

        {!loading && !fetchError && opp && (
          <>
            <PanelHeader opp={opp} onClose={onClose} onPatch={patchOpp} />

            {/* Muck breakdown. Replaces the retired T1 fit score bar. */}
            <MuckBar score={muck ?? null} />

            {/* What is owed on this lead next, and who owes it. Above the notes
                because it is an instruction, not a record. */}
            <FollowupBar
              opportunityId={opp.id}
              followup={{
                text: opp.followup_text ?? null,
                kind: opp.followup_kind ?? null,
                owner: opp.followup_owner ?? null,
                due: opp.followup_due ?? null,
                setBy: opp.followup_set_by ?? null,
                setAt: opp.followup_set_at ?? null,
              }}
              onSaved={(next: Followup) => {
                const changes = {
                  followup_text: next.text,
                  followup_kind: next.kind,
                  followup_owner: next.owner,
                  followup_due: next.due,
                  followup_set_by: next.setBy,
                  followup_set_at: next.setAt,
                }
                setOpp(o => o ? { ...o, ...changes } : o)
                onUpdate(opp.id, changes)
                // The route writes the note server side, so the timeline on
                // screen is now one note short. Re-read rather than guess at
                // what it wrote.
                void loadOpp(opp.id)
              }}
              showToast={showToast}
            />

            {/* Two-column body */}
            <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

              {/* ===== LEFT COLUMN: Notes (60%) ===== */}
              <div style={{ flex: '0 0 60%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #E5E7EB', height: '100%' }}>
                {/* Note input bar */}
                <div style={{ padding: '10px 16px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="text"
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleNoteSave() }
                      }}
                      placeholder="Add a note about a call, email, meeting, or update..."
                      style={{
                        flex: 1, height: 36, border: '1px solid #D1D5DB', borderRadius: 8,
                        padding: '0 12px', fontSize: 13, background: 'white', outline: 'none',
                      }}
                    />
                    <div style={{ display: 'flex', gap: 4 }}>
                      {NOTE_TYPES.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setNoteType(t)}
                          title={NOTE_TYPE_TOOLTIPS[t] || ''}
                          style={{
                            fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 500,
                            whiteSpace: 'nowrap', cursor: 'pointer',
                            border: noteType === t ? '1px solid #1B2A4A' : '1px solid #D1D5DB',
                            background: noteType === t ? '#1B2A4A' : 'white',
                            color: noteType === t ? 'white' : '#4B5563',
                          }}
                        >
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleNoteSave}
                      disabled={noteSaving || !noteText.trim()}
                      title="Save note (or press Cmd+Enter)"
                      style={{
                        height: 36, padding: '0 16px', borderRadius: 8, border: 'none',
                        background: '#2A9D8F', color: 'white', fontSize: 13, fontWeight: 600,
                        cursor: noteSaving || !noteText.trim() ? 'default' : 'pointer',
                        opacity: noteSaving || !noteText.trim() ? 0.5 : 1,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {noteSaving ? '...' : 'Save'}
                    </button>
                  </div>
                </div>

                {/* Notes timeline (scrollable) */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                  {(opp.notes_list ?? []).length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, paddingTop: 40 }}>No notes yet</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {/* Say where a merged timeline came from, so a note from
                          another record is never a surprise. */}
                      {(opp.related_records ?? []).length > 0 && (
                        <div style={{
                          fontSize: 12, color: '#4B5563', background: '#F3F4F6',
                          border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px',
                          lineHeight: 1.5,
                        }}>
                          <span style={{ fontWeight: 600 }}>Full client history.</span>{' '}
                          Includes {(opp.related_records ?? []).reduce((sum, r) => sum + r.note_count, 0)} notes from{' '}
                          {(opp.related_records ?? []).map(r => `${r.label} (${r.note_count})`).join(', ')}.
                        </div>
                      )}
                      {(opp.notes_list ?? []).map(note => (
                          <NoteCardInline
                            key={note.id}
                            note={note}
                            barColor={getNoteBarColor(note)}
                            onDelete={canDeleteNote(note) ? () => deleteNote(note.id) : undefined}
                          />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ===== RIGHT COLUMN: Context (40%) ===== */}
              <div ref={rightColRef} style={{ flex: '0 0 40%', overflowY: 'auto', height: '100%' }}>

                {/* Status card */}
                <div style={{ padding: 16 }}>
                  <div style={{
                    background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB', padding: 16,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                      {/* Value */}
                      <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9CA3AF', fontWeight: 600, marginBottom: 4 }}>Value</div>
                        {editingValue ? (
                          <input
                            autoFocus
                            value={valueInput}
                            onChange={e => setValueInput(e.target.value)}
                            onBlur={commitValue}
                            onKeyDown={e => { if (e.key === 'Enter') commitValue() }}
                            style={{ width: '100%', fontSize: 22, fontWeight: 800, color: '#1B2A4A', border: 'none', borderBottom: '2px solid #2A9D8F', outline: 'none', background: 'transparent', textAlign: 'center' }}
                          />
                        ) : (
                          <div
                            onClick={() => { setValueInput(String(opp.value ?? '')); setEditingValue(true) }}
                            title="Expected deal value. Click to edit."
                            style={{ fontSize: 22, fontWeight: 800, color: '#1B2A4A', cursor: 'text' }}
                          >
                            {shownValue ? `$${shownValue.toLocaleString()}` : '$0'}
                            {valuePredicted && (
                              <span
                                title="No contract yet, so this is a prediction. Where the recorded figure contradicted the offering it falls back to list price."
                                style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: '#FFF4D6', color: '#7A5A00', padding: '1px 5px', borderRadius: 4, verticalAlign: 'middle' }}
                              >
                                predicted
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Stage */}
                      <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9CA3AF', fontWeight: 600, marginBottom: 4 }}>Stage</div>
                        <select
                          value={opp.stage}
                          onChange={e => patchOpp({ stage: e.target.value })}
                          title="Where is this lead in the sales pipeline? Moves left to right as the deal progresses."
                          style={{
                            background: '#1B2A4A', color: 'white', padding: '5px 14px',
                            borderRadius: 20, fontSize: 13, fontWeight: 600, border: 'none',
                            cursor: 'pointer', outline: 'none', appearance: 'none',
                            WebkitAppearance: 'none', textAlign: 'center',
                            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'6\' fill=\'white\'%3E%3Cpath d=\'M0 0l5 6 5-6z\'/%3E%3C/svg%3E")',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 10px center',
                            paddingRight: 28,
                          }}
                        >
                          {STAGE_OPTIONS.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                          {/* A historical row already sitting on a retired
                              stage still has to render its own value, or the
                              select silently shows the first option and the
                              next save moves the lead somewhere nobody chose. */}
                          {!STAGE_OPTIONS.some(o => o.id === opp.stage) && (
                            <option value={opp.stage}>{opp.stage}</option>
                          )}
                        </select>
                      </div>
                      {/* Factored */}
                      <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9CA3AF', fontWeight: 600, marginBottom: 4 }}>Factored</div>
                        <div title="Value multiplied by stage probability. Represents weighted pipeline contribution." style={{ fontSize: 18, fontWeight: 700, color: '#6B7280' }}>
                          {factored !== null ? `$${factored.toLocaleString()}` : '$0'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contracts section */}
                <div style={{ borderTop: '1px solid #E5E7EB' }}>
                  <div style={{ padding: '14px 16px 0' }}>
                    <div title="Quotes and proposals sent to this contact. Matched by email address." style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9CA3AF', fontWeight: 700, marginBottom: 4 }}>Contracts</div>
                  </div>
                  <ContractsTab opp={opp} />
                </div>

                <div style={{ margin: '0 16px', height: 1, background: '#E5E7EB' }} />

                {/* Contact section */}
                <div style={{ padding: '14px 16px' }}>
                  <div title="Contact information. Click any field to edit." style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9CA3AF', fontWeight: 700, marginBottom: 10 }}>Contact</div>

                  {/* Contact Name */}
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>Name</label>
                    <input
                      key={`contact_name-${opp.id}`}
                      defaultValue={o.contact_name ?? ''}
                      onBlur={e => { if (e.target.value.trim() !== (o.contact_name ?? '')) patchOpp({ contact_name: e.target.value.trim() || null } as any) }}
                      style={{ display: 'block', width: '100%', fontSize: 13, color: '#374151', borderBottom: '1px solid #E5E7EB', border: 'none', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#E5E7EB', outline: 'none', padding: '4px 0', background: 'transparent' }}
                      placeholder="Contact name..."
                    />
                  </div>

                  {/* Email. Always an input: a filled email used to render as a
                      mailto link only, so a typo in a contact's address could
                      never be corrected from the panel. The link moved beside
                      the field instead of replacing it. */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4B5563', marginBottom: 6 }}>
                    <span style={{ width: 16, textAlign: 'center', color: '#9CA3AF', fontSize: 12 }}>&#9993;</span>
                    <input
                      key={`contact_email-${opp.id}`}
                      type="email"
                      defaultValue={o.contact_email ?? ''}
                      onBlur={e => { if (e.target.value.trim() !== (o.contact_email ?? '')) patchOpp({ contact_email: e.target.value.trim() || null } as any) }}
                      style={{ flex: 1, fontSize: 13, color: '#374151', border: 'none', borderBottom: '1px solid #E5E7EB', outline: 'none', padding: '2px 0', background: 'transparent' }}
                      placeholder="email@example.com"
                      title="Click to edit. Blank the field to clear it."
                    />
                    {o.contact_email && (
                      <a href={`mailto:${o.contact_email}`} title="Send an email" style={{ color: '#2A9D8F', textDecoration: 'none', fontSize: 12, whiteSpace: 'nowrap' }}>Email</a>
                    )}
                  </div>

                  {/* Phone */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4B5563', marginBottom: 6 }}>
                    <span style={{ width: 16, textAlign: 'center', color: '#9CA3AF', fontSize: 12 }}>&#9742;</span>
                    <input
                      key={`contact_phone-${opp.id}`}
                      type="tel"
                      defaultValue={o.contact_phone ?? ''}
                      onBlur={e => { if (e.target.value.trim() !== (o.contact_phone ?? '')) patchOpp({ contact_phone: e.target.value.trim() || null } as any) }}
                      style={{ flex: 1, fontSize: 13, color: '#374151', border: 'none', borderBottom: '1px solid #E5E7EB', outline: 'none', padding: '2px 0', background: 'transparent' }}
                      placeholder="Phone number"
                      title="Click to edit. Blank the field to clear it."
                    />
                    {o.contact_phone && (
                      <a href={`tel:${o.contact_phone}`} title="Call this contact" style={{ color: '#2A9D8F', textDecoration: 'none', fontSize: 12, whiteSpace: 'nowrap' }}>Call</a>
                    )}
                  </div>

                  {/* City, State */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4B5563', marginBottom: 6 }}>
                    <span style={{ width: 16, textAlign: 'center', color: '#9CA3AF', fontSize: 12 }}>&#9679;</span>
                    <input
                      key={`city-${opp.id}`}
                      defaultValue={o.city ?? ''}
                      onBlur={e => { if (e.target.value.trim() !== (o.city ?? '')) patchOpp({ city: e.target.value.trim() || null } as any) }}
                      style={{ width: 100, fontSize: 13, color: '#374151', border: 'none', borderBottom: '1px solid #E5E7EB', outline: 'none', padding: '2px 0', background: 'transparent' }}
                      placeholder="City"
                    />
                    <span style={{ color: '#D1D5DB' }}>,</span>
                    <input
                      key={`state-${opp.id}`}
                      defaultValue={o.state ?? ''}
                      onBlur={e => { if (e.target.value.trim() !== (o.state ?? '')) patchOpp({ state: e.target.value.trim().toUpperCase() || null } as any) }}
                      style={{ width: 40, fontSize: 13, color: '#374151', border: 'none', borderBottom: '1px solid #E5E7EB', outline: 'none', padding: '2px 0', background: 'transparent' }}
                      placeholder="ST"
                    />
                  </div>
                </div>

                <div style={{ margin: '0 16px', height: 1, background: '#E5E7EB' }} />

                {/* Details section */}
                <div style={{ padding: '14px 16px' }}>
                  <div title="Deal metadata. Type, source, dates, and assignment." style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9CA3AF', fontWeight: 700, marginBottom: 10 }}>Details</div>

                  {/* Type */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>Type</span>
                    <select
                      defaultValue={opp.type}
                      onChange={e => patchOpp({ type: e.target.value } as any)}
                      style={{ fontSize: 12, color: '#374151', border: '1px solid #E5E7EB', borderRadius: 6, padding: '3px 8px', background: 'white', outline: 'none' }}
                    >
                      {['new_business', 'renewal', 'upsell', 'reactivation', 'pilot', 'expansion'].map(t => (
                        <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>

                  {/* Source */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>Source</span>
                    <input
                      defaultValue={opp.source ?? ''}
                      onBlur={e => { if (e.target.value !== (opp.source ?? '')) patchOpp({ source: e.target.value }) }}
                      style={{ fontSize: 12, color: '#374151', border: 'none', borderBottom: '1px solid #E5E7EB', outline: 'none', padding: '2px 4px', background: 'transparent', textAlign: 'right', width: 160 }}
                      placeholder="Lead source"
                    />
                  </div>

                  {/* School Year / Expected Close */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>Expected Close</span>
                    <input
                      type="date"
                      defaultValue={o.expected_close_date?.split('T')[0] ?? ''}
                      onBlur={e => { if (e.target.value) patchOpp({ expected_close_date: e.target.value } as any) }}
                      style={{ fontSize: 12, color: '#374151', border: '1px solid #E5E7EB', borderRadius: 6, padding: '3px 8px', background: 'white', outline: 'none' }}
                    />
                  </div>

                  {/* Created */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>Created</span>
                    <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>
                      {new Date(opp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {/* School year.
                      The board and the muck scorer both filter on this, so a
                      lead carrying the wrong year is simply not on the board
                      and nothing says why. It had no control anywhere, so the
                      only fix was a SQL update. */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: '#6B7280' }} title="Which school year this deal belongs to. The board only shows the current year, so changing this can make a lead disappear from it.">School year</span>
                    <select
                      key={`school_year-${opp.id}`}
                      defaultValue={(opp.school_year as string | null) ?? ''}
                      onChange={e => patchOpp({ school_year: e.target.value || null } as Partial<FullOpportunity>)}
                      style={{ fontSize: 12, color: '#374151', border: '1px solid #E5E7EB', borderRadius: 6, padding: '3px 8px', background: 'white', outline: 'none' }}
                    >
                      <option value="">Not set</option>
                      <option value="2025-26">2025-26</option>
                      <option value="2026-27">2026-27 (current)</option>
                      <option value="2027-28">2027-28</option>
                    </select>
                  </div>

                  {/* Contact, not a deal.
                      Takes a record off the board without deleting it, which is
                      what a person who books a call with no district and no
                      title actually needs. The column was already writable; no
                      screen offered it. */}
                  <div style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #F3F4F6' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(opp.is_contact_only)}
                        onChange={e => patchOpp({ is_contact_only: e.target.checked } as Partial<FullOpportunity>)}
                        style={{ marginTop: 2, width: 14, height: 14, cursor: 'pointer', accentColor: '#2A9D8F' }}
                      />
                      <span>
                        <span style={{ fontSize: 12, color: '#374151', fontWeight: 600, display: 'block' }}>
                          This is a person, not a deal
                        </span>
                        <span style={{ fontSize: 11, color: '#9CA3AF', display: 'block', lineHeight: 1.4 }}>
                          Takes it off the board and out of every total without deleting anything. Use it
                          for a contact with no school behind them yet.
                        </span>
                      </span>
                    </label>
                  </div>

                  {/* Grant funding.

                      Grant is 25 of the 100 muck points and until now there was
                      no way to set it from any screen a person can reach. The
                      only path was dragging a card into Signed with Grant,
                      which also changes the stage, so an unsigned lead could
                      never carry it. Measured on 24 September 2026: 4 leads of
                      213 had it set and 3 of those were already signed, which
                      means a quarter of the model was a constant.

                      A checkbox for it did exist, in panel/DetailsTab.tsx.
                      Nothing imported that file. It is deleted in this change
                      rather than left sitting there for the next person to
                      edit by mistake. */}
                  <div style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #F3F4F6' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(opp.grant_support)}
                        onChange={e => patchOpp({ grant_support: e.target.checked } as Partial<FullOpportunity>)}
                        style={{ marginTop: 2, width: 14, height: 14, cursor: 'pointer', accentColor: '#2A9D8F' }}
                      />
                      <span>
                        <span style={{ fontSize: 12, color: '#374151', fontWeight: 600, display: 'block' }}>
                          This school needs grant funding
                        </span>
                        <span style={{ fontSize: 11, color: '#9CA3AF', display: 'block', lineHeight: 1.4 }}>
                          Tick this only once somebody has said so. It adds 25 muck points and moves the lead
                          up the outreach queue, so a guess here changes what everyone calls first.
                        </span>
                      </span>
                    </label>
                  </div>

                  {/* Assigned to */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>Assigned to</span>
                    <select
                      // Keyed by lead: a bare defaultValue kept showing the
                      // previous lead's owner when the panel switched records.
                      key={`assigned-${opp.id}`}
                      defaultValue={opp.assigned_to_email ?? ''}
                      onChange={e => patchOpp({ assigned_to_email: e.target.value || null })}
                      style={{ fontSize: 12, color: '#374151', border: '1px solid #E5E7EB', borderRadius: 6, padding: '3px 8px', background: 'white', outline: 'none' }}
                    >
                      <option value="">Unassigned</option>
                      {SALES_TEAM.map(m => (
                        <option key={m.email} value={m.email}>{m.label}</option>
                      ))}
                      {/* An assignee that is not on the roster is kept as an
                          option so the dropdown cannot silently rewrite one to
                          Unassigned just by being opened. No live lead has one
                          today; 79 rows with a junk id from an old import are
                          all soft deleted. */}
                      {opp.assigned_to_email &&
                        !SALES_TEAM.some(m => m.email === opp.assigned_to_email) && (
                        <option value={opp.assigned_to_email}>{opp.assigned_to_email}</option>
                      )}
                    </select>
                  </div>
                </div>

                <div style={{ margin: '0 16px', height: 1, background: '#E5E7EB' }} />

                {/* Intelligence (collapsible) */}
                <div ref={intelSectionRef} style={{ padding: '14px 16px' }}>
                  <button
                    onClick={() => setIntelOpen(!intelOpen)}
                    style={{
                      width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    }}
                  >
                    <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9CA3AF', fontWeight: 700 }}>Intelligence</span>
                    <svg
                      width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"
                      style={{ transform: intelOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {intelOpen && (
                    <div style={{ marginTop: 8 }}>
                      <IntelligenceTab opp={opp} onRefresh={() => loadOpp(opp.id)} />
                    </div>
                  )}
                </div>

                {/* Create Partnership (for signed/paid deals) */}
                {(opp.stage === 'signed' || opp.stage === 'signed_no_grant' || opp.stage === 'signed_with_grant' || opp.stage === 'paid') && !partnershipCreated && (
                  <>
                    <div style={{ margin: '0 16px', height: 1, background: '#E5E7EB' }} />
                    <div style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => setShowPartnershipModal(true)}
                        style={{
                          width: '100%', fontSize: 13, padding: '10px 0', borderRadius: 12,
                          fontWeight: 600, border: 'none', cursor: 'pointer',
                          background: '#1e2749', color: 'white',
                        }}
                      >
                        Create Partnership + Dashboard
                      </button>
                      <p style={{ fontSize: 10, color: '#9CA3AF', textAlign: 'center', marginTop: 6 }}>
                        Creates Leadership Dashboard, provisions Hub access, sends welcome email
                      </p>
                    </div>
                  </>
                )}
                {partnershipCreated && linkedPartnership && (
                  <>
                    <div style={{ margin: '0 16px', height: 1, background: '#E5E7EB' }} />
                    <div style={{ padding: '12px 16px' }}>
                      {/* Partnership header card */}
                      <div style={{
                        background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8,
                        padding: '10px 12px', marginBottom: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4caf50', flexShrink: 0 }} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e2749', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {linkedPartnership.orgName}
                            </div>
                            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>
                              Partnership active.{linkedPartnership.createdAt ? ` Created ${new Date(linkedPartnership.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.` : ''}
                            </div>
                          </div>
                        </div>
                        <a
                          href={`/admin/partnerships/${linkedPartnership.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open partnership dashboard"
                          style={{
                            flexShrink: 0, marginLeft: 8, color: '#c9a84c', textDecoration: 'none',
                            display: 'flex', alignItems: 'center',
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </a>
                      </div>

                      {/* Contract deliverables grid */}
                      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9CA3AF', fontWeight: 700, marginBottom: 6 }}>
                        Contract Deliverables
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        {[
                          { label: 'Observations', value: linkedPartnership.observationDays ?? 0, base: linkedPartnership.baseObservationDays },
                          { label: 'Virtual', value: linkedPartnership.virtualSessions ?? 0, base: linkedPartnership.baseVirtualSessions },
                          { label: 'Executive', value: linkedPartnership.executiveSessions ?? 0, base: linkedPartnership.baseExecutiveSessions },
                          { label: 'Hub Seats', value: linkedPartnership.staffEnrolled ?? 0, base: linkedPartnership.baseStaffEnrolled },
                        ].map(({ label, value, base }) => {
                          const isRenewal = opp.type === 'renewal' || opp.name?.toUpperCase().includes('RENEWAL')
                          let diffEl = null
                          if (isRenewal && base !== null && base !== undefined) {
                            const diff = value - base
                            if (diff > 0) {
                              diffEl = <div style={{ fontSize: 10, color: '#2e7d32', fontWeight: 600, marginTop: 2 }}>+{diff} from last year</div>
                            } else {
                              diffEl = <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>Same as last year</div>
                            }
                          }
                          return (
                            <div key={label} style={{
                              background: '#F9FAFB', borderRadius: 6, border: '1px solid #E5E7EB',
                              padding: '8px 6px', textAlign: 'center',
                            }}>
                              <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, marginBottom: 2 }}>{label}</div>
                              <div style={{ fontSize: 18, fontWeight: 800, color: '#1e2749' }}>{value}</div>
                              {diffEl}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '8px 20px', borderTop: '1px solid #E5E7EB',
              display: 'flex', justifyContent: 'flex-end', gap: 16, alignItems: 'center',
              background: '#F9FAFB', flexShrink: 0,
            }}>
              {/* The buyer facing Hub catalogue, here so it can be grabbed while
                  looking at the deal rather than hunted for or asked after. It is
                  what to send when a school asks what they would actually be
                  getting, and it needs no login, so it survives being forwarded
                  round a district. Pushed left, away from the three controls that
                  change the deal, because it only opens a tab. */}
              <a
                href="/for-schools/whats-inside"
                target="_blank"
                rel="noopener noreferrer"
                title="What is inside the Hub. Opens the page we send a school before they sign. No login needed, so it can go straight into a follow up."
                style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, textDecoration: 'none', marginRight: 'auto' }}
              >
                What is inside the Hub
              </a>
              {opp.stage !== 'paid' && opp.stage !== 'lost' && (
                <button
                  onClick={markWon}
                  title="This lead signed a contract. Move to Won."
                  style={{ fontSize: 12, color: '#0F766E', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Mark as Won
                </button>
              )}
              {opp.stage !== 'lost' && (
                <button
                  onClick={() => setShowPauseModal(true)}
                  title="They are not moving forward right now. Record why and pick a date to come back. The lead stays in Engaged rather than being closed."
                  style={{ fontSize: 12, color: '#B45309', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Not this year
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => { onDelete(opp.id); onClose() }}
                  title="Move to trash. Can be restored later."
                  style={{ fontSize: 12, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Trash
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Not this year. Deliberately not a "lost" modal; see PAUSE_REASONS. */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Not this year</h3>
            <p className="text-sm text-gray-600 truncate">{opp?.name}</p>
            <p className="text-xs text-gray-500">
              They stay in Engaged. Nothing is closed, and they keep getting the educator emails.
            </p>
            <div>
              <label className="text-xs text-gray-500 font-medium">Why not now</label>
              <select
                value={pauseReason}
                onChange={e => setPauseReason(e.target.value)}
                className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                {PAUSE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Reach back out on</label>
              <input
                type="date"
                value={revisitOn}
                onChange={e => setRevisitOn(e.target.value)}
                className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Defaults to four months out, which is roughly the next budget conversation.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPauseModal(false)}
                className="flex-1 text-sm border border-gray-200 text-gray-600 py-2 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={markNotThisYear}
                className="flex-1 text-sm bg-amber-600 text-white py-2 rounded-xl hover:bg-amber-700 font-medium"
              >
                Save and pause
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Partnership Creation Modal */}
      {showPartnershipModal && opp && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <h3 className="font-bold text-gray-900 text-lg">Create Partnership from Deal</h3>
            <p className="text-sm text-gray-500">{opp.name}</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Type</label>
                <select value={pType} onChange={e => setPType(e.target.value as 'school' | 'district')}
                  className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400">
                  <option value="school">School</option>
                  <option value="district">District</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Staff count (Hub memberships)</label>
                <input type="number" value={pStaff} onChange={e => setPStaff(e.target.value)} placeholder="e.g. 45"
                  className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">On-site observation days</label>
                <input type="number" value={pObsDays} onChange={e => setPObsDays(e.target.value)}
                  className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Virtual sessions</label>
                <input type="number" value={pVirtual} onChange={e => setPVirtual(e.target.value)}
                  className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Executive sessions</label>
                <input type="number" value={pExecutive} onChange={e => setPExecutive(e.target.value)}
                  className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
              {pType === 'district' && (
                <div>
                  <label className="text-xs text-gray-500 font-medium">Buildings</label>
                  <input type="number" value={pBuildings} onChange={e => setPBuildings(e.target.value)}
                    className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
                </div>
              )}
              <div>
                <label className="text-xs text-gray-500 font-medium">Contract start</label>
                <input type="date" value={pStart} onChange={e => setPStart(e.target.value)}
                  className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Contract end</label>
                <input type="date" value={pEnd} onChange={e => setPEnd(e.target.value)}
                  className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
              <p className="font-medium text-gray-700">This will automatically:</p>
              <p>1. Create the Leadership Dashboard at /partners/{opp.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}</p>
              <p>2. Provision Hub All-Access for {String(opp.contact_email || 'contact')}</p>
              <p>3. Send a welcome email to the principal</p>
              <p>4. Create onboarding action items (Phase 0)</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowPartnershipModal(false)}
                className="flex-1 text-sm border border-gray-200 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={createPartnership} disabled={creatingPartnership}
                className="flex-1 text-sm bg-[#1e2749] text-white py-2.5 rounded-xl font-medium hover:bg-[#2d3a5c] disabled:opacity-50">
                {creatingPartnership ? 'Creating...' : 'Create Partnership'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Inline note card with colored left border ──

/**
 * A note can be deleted from this panel only if it is one of this lead's own
 * rows. Imported text columns have no row, and notes belonging to a merged
 * record or the partnership file get deleted where they live — the API rejects
 * those, so offering the button here would only produce an error.
 */
function canDeleteNote(note: OppNote): boolean {
  if (note.deletable === false) return false
  if (note.id === 'legacy' || note.id.startsWith('legacy:') || note.id.startsWith('pn:')) return false
  return true
}

function NoteCardInline({ note, barColor, onDelete }: { note: OppNote; barColor: string; onDelete?: () => void }) {
  const [showAll, setShowAll] = useState(false)
  const isLong = note.note_text.length > 500
  const display = isLong && !showAll ? note.note_text.slice(0, 500) + '...' : note.note_text
  const typeBadge = TYPE_BADGE_COLORS[note.note_type] ?? TYPE_BADGE_COLORS.update

  return (
    <div style={{
      display: 'flex', gap: 0, background: 'white', borderRadius: 8,
      border: '1px solid #E5E7EB', overflow: 'hidden',
    }} className="group">
      {/* Colored left bar */}
      <div style={{ width: 4, flexShrink: 0, background: barColor }} />
      {/* Body */}
      <div style={{ padding: '10px 14px', flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'capitalize' }}>
            {note.note_type === 'system' ? 'System' : teamLabel(note.author_email)}
          </span>
          <span style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.3px',
            background: typeBadge.bg, color: typeBadge.color,
          }}>
            {note.note_type}
          </span>
          {note.source_label && (
            <span
              title={`Written on ${note.source_label}, shown here because it is the same client`}
              style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
                background: '#EEF2FF', color: '#4338CA', maxWidth: 220,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
            >
              {note.source_label}
            </span>
          )}
          <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 'auto' }}>
            {new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          {onDelete && (
            <button
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ fontSize: 11, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4 }}
            >
              Delete
            </button>
          )}
        </div>
        <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{display}</div>
        {isLong && (
          <button
            onClick={() => setShowAll(v => !v)}
            style={{ fontSize: 12, color: '#2A9D8F', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4 }}
          >
            {showAll ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    </div>
  )
}
