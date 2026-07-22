'use client'
// v3 - Two-column split layout (Option A). Notes left, context right. No tabs.
import { useEffect, useRef, useState } from 'react'
import { PanelHeader } from './panel/PanelHeader'
import { ContractsTab } from './panel/ContractsTab'
import { IntelligenceTab } from './panel/IntelligenceTab'
import { IntelligenceBar } from './panel/IntelligenceBar'

export interface OppNote {
  id: string
  opportunity_id: string
  author_email: string
  note_text: string
  note_type: 'call' | 'email' | 'meeting' | 'demo' | 'update' | 'system'
  created_at: string
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
  activity?: OppActivity[]
  // Optional fields pending DB migration
  [key: string]: unknown
}

const NOTE_TYPES = ['call', 'email', 'meeting', 'demo', 'update'] as const
type NoteType = typeof NOTE_TYPES[number]

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
  { id: 'lost', name: 'Lost' },
]

const STAGE_PROBABILITY: Record<string, number> = {
  unassigned: 0, targeting: 5, engaged: 20, qualified: 45,
  in_conversation: 55, likely_yes: 65, proposal_sent: 80, signed: 95, paid: 100, lost: 0,
}

const LOST_REASONS = ['Not a fit', 'Budget', 'Timing', 'Competitor', 'No response', 'Other']

const TYPE_BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  system: { bg: '#2A9D8F', color: 'white' },
  meeting: { bg: '#7C3AED', color: 'white' },
  email: { bg: '#3B82F6', color: 'white' },
  call: { bg: '#C9A84C', color: 'white' },
  demo: { bg: '#F59E0B', color: 'white' },
  update: { bg: '#6B7280', color: 'white' },
}

interface Props {
  opportunityId: string | null
  onClose: () => void
  onUpdate: (id: string, changes: Partial<FullOpportunity>) => void
  onDelete?: (id: string) => void
  showToast: (message: string, type: 'success' | 'error') => void
}

export function OpportunityDetailPanel({ opportunityId, onClose, onUpdate, onDelete, showToast }: Props) {
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

  // Intelligence collapsible
  const [intelOpen, setIntelOpen] = useState(false)

  // Lost modal
  const [showLostModal, setShowLostModal] = useState(false)
  const [lostReason, setLostReason] = useState('Not a fit')

  // Partnership modal state (from PanelFooter)
  const [showPartnershipModal, setShowPartnershipModal] = useState(false)
  const [creatingPartnership, setCreatingPartnership] = useState(false)
  const [partnershipCreated, setPartnershipCreated] = useState(false)
  const [pType, setPType] = useState<'school' | 'district'>('school')
  const [pStaff, setPStaff] = useState('')
  const [pObsDays, setPObsDays] = useState('2')
  const [pVirtual, setPVirtual] = useState('4')
  const [pExecutive, setPExecutive] = useState('2')
  const [pBuildings, setPBuildings] = useState('1')
  const [pStart, setPStart] = useState(new Date().toISOString().split('T')[0])
  const [pEnd, setPEnd] = useState('')

  useEffect(() => {
    if (!opportunityId) { setOpp(null); return }
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
    try {
      const res = await fetch(`/api/sales/opportunities/${id}`)
      if (!res.ok) throw new Error('Failed to load opportunity')
      const data = await res.json()
      setOpp({
        ...data,
        notes_list: data.notes_list ?? [],
        activity: data.activity ?? [],
      })
    } catch (e: unknown) {
      setFetchError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
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
      patchOpp({ value: parsed })
    }
  }

  function getNoteBarColor(note: OppNote): string {
    if (note.note_type === 'system') return '#2A9D8F'
    const email = note.author_email.toLowerCase()
    if (email.includes('rae')) return '#C9A84C'
    if (email.includes('jim')) return '#3B82F6'
    return '#9CA3AF'
  }

  async function markWon() {
    const result = await patchOpp({ stage: 'paid' })
    if (result === false) return
    showToast('Deal marked as Won', 'success')
    onClose()
  }

  async function markLost() {
    const result = await patchOpp({ stage: 'lost', deletion_reason: lostReason } as any)
    if (result === false) return
    showToast(`Deal marked as Lost (${lostReason})`, 'success')
    setShowLostModal(false)
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
  const factored = opp?.value ? Math.round(opp.value * prob / 100) : null
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

            {/* Intelligence summary bar */}
            <IntelligenceBar
              opp={opp}
              onExpandIntelligence={() => {
                if (!intelOpen) setIntelOpen(true)
                // Scroll the right column to the intelligence section after a tick
                setTimeout(() => {
                  if (intelSectionRef.current && rightColRef.current) {
                    intelSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }, 100)
              }}
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
                      placeholder="Add a note..."
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
                      {(opp.notes_list ?? []).map(note => (
                          <NoteCardInline
                            key={note.id}
                            note={note}
                            barColor={getNoteBarColor(note)}
                            onDelete={note.id === 'legacy' ? undefined : () => deleteNote(note.id)}
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
                            style={{ fontSize: 22, fontWeight: 800, color: '#1B2A4A', cursor: 'text' }}
                          >
                            {opp.value ? `$${opp.value.toLocaleString()}` : '$0'}
                          </div>
                        )}
                      </div>
                      {/* Stage */}
                      <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9CA3AF', fontWeight: 600, marginBottom: 4 }}>Stage</div>
                        <select
                          value={opp.stage}
                          onChange={e => patchOpp({ stage: e.target.value })}
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
                        </select>
                      </div>
                      {/* Factored */}
                      <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9CA3AF', fontWeight: 600, marginBottom: 4 }}>Factored</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#6B7280' }}>
                          {factored !== null ? `$${factored.toLocaleString()}` : '$0'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contracts section */}
                <div style={{ borderTop: '1px solid #E5E7EB' }}>
                  <div style={{ padding: '14px 16px 0' }}>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9CA3AF', fontWeight: 700, marginBottom: 4 }}>Contracts</div>
                  </div>
                  <ContractsTab opp={opp} />
                </div>

                <div style={{ margin: '0 16px', height: 1, background: '#E5E7EB' }} />

                {/* Contact section */}
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9CA3AF', fontWeight: 700, marginBottom: 10 }}>Contact</div>

                  {/* Contact Name */}
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>Name</label>
                    <input
                      defaultValue={o.contact_name ?? ''}
                      onBlur={e => { if (e.target.value !== (o.contact_name ?? '')) patchOpp({ contact_name: e.target.value } as any) }}
                      style={{ display: 'block', width: '100%', fontSize: 13, color: '#374151', borderBottom: '1px solid #E5E7EB', border: 'none', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#E5E7EB', outline: 'none', padding: '4px 0', background: 'transparent' }}
                      placeholder="Contact name..."
                    />
                  </div>

                  {/* Email */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4B5563', marginBottom: 6 }}>
                    <span style={{ width: 16, textAlign: 'center', color: '#9CA3AF', fontSize: 12 }}>&#9993;</span>
                    {o.contact_email ? (
                      <a href={`mailto:${o.contact_email}`} style={{ color: '#2A9D8F', textDecoration: 'none' }}>{o.contact_email}</a>
                    ) : (
                      <input
                        defaultValue=""
                        onBlur={e => { if (e.target.value) patchOpp({ contact_email: e.target.value } as any) }}
                        style={{ flex: 1, fontSize: 13, color: '#374151', border: 'none', borderBottom: '1px solid #E5E7EB', outline: 'none', padding: '2px 0', background: 'transparent' }}
                        placeholder="email@example.com"
                      />
                    )}
                  </div>

                  {/* Phone */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4B5563', marginBottom: 6 }}>
                    <span style={{ width: 16, textAlign: 'center', color: '#9CA3AF', fontSize: 12 }}>&#9742;</span>
                    {o.contact_phone ? (
                      <a href={`tel:${o.contact_phone}`} style={{ color: '#2A9D8F', textDecoration: 'none' }}>{o.contact_phone}</a>
                    ) : (
                      <input
                        defaultValue=""
                        onBlur={e => { if (e.target.value) patchOpp({ contact_phone: e.target.value } as any) }}
                        style={{ flex: 1, fontSize: 13, color: '#374151', border: 'none', borderBottom: '1px solid #E5E7EB', outline: 'none', padding: '2px 0', background: 'transparent' }}
                        placeholder="Phone number"
                      />
                    )}
                  </div>

                  {/* City, State */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4B5563', marginBottom: 6 }}>
                    <span style={{ width: 16, textAlign: 'center', color: '#9CA3AF', fontSize: 12 }}>&#9679;</span>
                    <input
                      defaultValue={o.city ?? ''}
                      onBlur={e => { if (e.target.value !== (o.city ?? '')) patchOpp({ city: e.target.value } as any) }}
                      style={{ width: 100, fontSize: 13, color: '#374151', border: 'none', borderBottom: '1px solid #E5E7EB', outline: 'none', padding: '2px 0', background: 'transparent' }}
                      placeholder="City"
                    />
                    <span style={{ color: '#D1D5DB' }}>,</span>
                    <input
                      defaultValue={o.state ?? ''}
                      onBlur={e => { if (e.target.value !== (o.state ?? '')) patchOpp({ state: e.target.value } as any) }}
                      style={{ width: 40, fontSize: 13, color: '#374151', border: 'none', borderBottom: '1px solid #E5E7EB', outline: 'none', padding: '2px 0', background: 'transparent' }}
                      placeholder="ST"
                    />
                  </div>
                </div>

                <div style={{ margin: '0 16px', height: 1, background: '#E5E7EB' }} />

                {/* Details section */}
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9CA3AF', fontWeight: 700, marginBottom: 10 }}>Details</div>

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

                  {/* Assigned to */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>Assigned to</span>
                    <select
                      defaultValue={opp.assigned_to_email ?? ''}
                      onChange={e => patchOpp({ assigned_to_email: e.target.value || null })}
                      style={{ fontSize: 12, color: '#374151', border: '1px solid #E5E7EB', borderRadius: 6, padding: '3px 8px', background: 'white', outline: 'none' }}
                    >
                      <option value="">Unassigned</option>
                      <option value="rae@teachersdeserveit.com">Rae</option>
                      <option value="jim@teachersdeserveit.com">Jim</option>
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
                {partnershipCreated && (
                  <>
                    <div style={{ margin: '0 16px', height: 1, background: '#E5E7EB' }} />
                    <div style={{ padding: '10px 16px', textAlign: 'center' }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#2A9D8F', margin: 0 }}>Partnership created. Dashboard live.</p>
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
              {opp.stage !== 'paid' && opp.stage !== 'lost' && (
                <button
                  onClick={markWon}
                  style={{ fontSize: 12, color: '#0F766E', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Mark as Won
                </button>
              )}
              {opp.stage !== 'lost' && (
                <button
                  onClick={() => setShowLostModal(true)}
                  style={{ fontSize: 12, color: '#EF4444', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Mark as Lost
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => { onDelete(opp.id); onClose() }}
                  style={{ fontSize: 12, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Trash
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Lost modal */}
      {showLostModal && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Mark as Lost</h3>
            <p className="text-sm text-gray-600 truncate">{opp?.name}</p>
            <div>
              <label className="text-xs text-gray-500 font-medium">Reason</label>
              <select
                value={lostReason}
                onChange={e => setLostReason(e.target.value)}
                className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                {LOST_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLostModal(false)}
                className="flex-1 text-sm border border-gray-200 text-gray-600 py-2 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={markLost}
                className="flex-1 text-sm bg-red-600 text-white py-2 rounded-xl hover:bg-red-700 font-medium"
              >
                Confirm Lost
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
            {note.note_type === 'system' ? 'System' : note.author_email.split('@')[0]}
          </span>
          <span style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.3px',
            background: typeBadge.bg, color: typeBadge.color,
          }}>
            {note.note_type}
          </span>
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
