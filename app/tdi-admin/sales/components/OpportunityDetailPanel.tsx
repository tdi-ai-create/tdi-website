'use client'
// v2 - intelligence tab with fit sliders + quick log
import { useEffect, useRef, useState } from 'react'
import { PanelHeader } from './panel/PanelHeader'
import { PanelStats } from './panel/PanelStats'
import { NotesTab } from './panel/NotesTab'
import { ContactTab } from './panel/ContactTab'
import { DetailsTab } from './panel/DetailsTab'
import { ActivityTab } from './panel/ActivityTab'
import { IntelligenceTab } from './panel/IntelligenceTab'
import { ContractsTab } from './panel/ContractsTab'
import { PanelFooter } from './panel/PanelFooter'

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

type TabId = 'notes' | 'contracts' | 'contact' | 'details' | 'intelligence' | 'activity'

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
  const [activeTab, setActiveTab] = useState<TabId>('notes')
  const [expanded, setExpanded] = useState(false)
  const prevIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!opportunityId) { setOpp(null); return }
    if (opportunityId !== prevIdRef.current) {
      prevIdRef.current = opportunityId
      setActiveTab('notes')
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

  if (!opportunityId) return null

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
            <PanelStats
              opp={opp}
              stageProbability={STAGE_PROBABILITY}
              stageOptions={STAGE_OPTIONS}
              onPatch={patchOpp}
            />

            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-4 shrink-0">
              {(['notes', 'contracts', 'contact', 'details', 'intelligence', 'activity'] as TabId[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
                    activeTab === tab
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'notes' && (
                <NotesTab
                  notes={opp.notes_list ?? []}
                  onAddNote={addNote}
                  onDeleteNote={deleteNote}
                />
              )}
              {activeTab === 'contracts' && (
                <ContractsTab opp={opp} />
              )}
              {activeTab === 'contact' && (
                <ContactTab opp={opp} onPatch={patchOpp} />
              )}
              {activeTab === 'details' && (
                <DetailsTab opp={opp} onPatch={patchOpp} stageOptions={STAGE_OPTIONS} />
              )}
              {activeTab === 'intelligence' && (
                <IntelligenceTab opp={opp} onRefresh={() => loadOpp(opp.id)} />
              )}
              {activeTab === 'activity' && (
                <ActivityTab activity={opp.activity ?? []} />
              )}
            </div>

            <PanelFooter opp={opp} onPatch={patchOpp} onClose={onClose} onDelete={onDelete && opp ? () => { onDelete(opp.id); onClose() } : undefined} showToast={showToast} />
          </>
        )}
      </div>
    </>
  )
}
