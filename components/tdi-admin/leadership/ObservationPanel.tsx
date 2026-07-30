'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface ObservationNote {
  id: string
  educator_name: string
  matched_staff_id: string | null
  matched_email: string | null
  love_note_draft: string
  love_note_final: string | null
  strategy_tags: string[]
  growth_indicators: string[]
  hub_resources: string[]
  email_sent_at: string | null
}

interface ObservationSummary {
  coaching_themes: string[]
  key_wins: string[]
  areas_to_watch: string[]
  board_summary: string
}

interface Visit {
  id: string
  visit_date: string
  visit_number: number
  status: string
  observer: string
  buildings_visited: string[]
  notepad_photos: { url: string; storage_path: string; uploaded_at: string }[]
  note_count: number
  sent_count: number
  processed_at: string | null
}

const ALL_STRATEGY_TAGS = [
  'Proximity', 'Small Group Facilitation', 'De-escalation', 'Checking for Understanding',
  'Routine Building', 'Communication with Teacher', 'Student Engagement', 'Differentiation',
  'Positive Reinforcement', 'Hub Content in Action', 'Independent Initiative', 'Questioning Techniques',
]

const ALL_GROWTH_INDICATORS = [
  'Saw Confidence', 'Saw Independence', 'Saw Collaboration',
  'Saw Hub Content Applied', 'Saw Student Responsiveness', 'Saw Reflection/Self-Awareness',
]

const STATUS_COLORS: Record<string, string> = {
  uploaded: '#9CA3AF',
  processing: '#3B82F6',
  processed: '#EAB308',
  reviewed: '#8B5CF6',
  sent: '#10B981',
}

const STRATEGY_TAG_COLORS: Record<string, string> = {
  Proximity: '#3B82F6',
  'Small Group Facilitation': '#8B5CF6',
  'De-escalation': '#EF4444',
  'Checking for Understanding': '#F59E0B',
  'Routine Building': '#10B981',
  'Communication with Teacher': '#6366F1',
  'Student Engagement': '#EC4899',
  Differentiation: '#14B8A6',
  'Positive Reinforcement': '#22C55E',
  'Hub Content in Action': '#E8B84B',
  'Independent Initiative': '#0EA5E9',
  'Questioning Techniques': '#A855F7',
}

export default function ObservationPanel({
  partnershipId,
  showToast,
}: {
  partnershipId: string
  showToast: (msg: string, type: 'success' | 'error') => void
}) {
  const [visits, setVisits] = useState<Visit[]>([])
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null)
  const [expandedNotes, setExpandedNotes] = useState<ObservationNote[]>([])
  const [expandedSummary, setExpandedSummary] = useState<ObservationSummary | null>(null)
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({})

  // Form state
  const [visitDate, setVisitDate] = useState('')
  const [buildings, setBuildings] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Loading states
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendingNoteId, setSendingNoteId] = useState<string | null>(null)
  const [loadingVisits, setLoadingVisits] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Zoom state
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null)

  const fetchVisits = useCallback(async () => {
    try {
      const res = await fetch(`/api/tdi-admin/observations?partnershipId=${partnershipId}`)
      const data = await res.json()
      if (data.visits) setVisits(data.visits)
    } catch {
      console.error('[ObservationPanel] Failed to fetch visits')
    } finally {
      setLoadingVisits(false)
    }
  }, [partnershipId])

  useEffect(() => {
    fetchVisits()
  }, [fetchVisits])

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
    setSelectedFiles((prev) => [...prev, ...newFiles])

    // Generate previews
    for (const file of newFiles) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (!visitDate || selectedFiles.length === 0) {
      showToast('Please select a date and at least one photo', 'error')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('partnershipId', partnershipId)
      formData.append('visitDate', visitDate)
      if (buildings) formData.append('buildings', buildings)
      for (const file of selectedFiles) {
        formData.append('photos', file)
      }

      const res = await fetch('/api/tdi-admin/observations/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      showToast(`Visit uploaded with ${selectedFiles.length} photos. Starting AI processing...`, 'success')

      // Reset form
      setVisitDate('')
      setBuildings('')
      setSelectedFiles([])
      setPreviews([])

      // Refresh visits list
      await fetchVisits()

      // Auto-start processing
      handleProcess(data.visit.id)
    } catch (err: any) {
      showToast(err.message || 'Upload failed', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleProcess = async (visitId: string) => {
    setProcessing(true)
    try {
      const res = await fetch('/api/tdi-admin/observations/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitId }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      showToast(`Processed! Found ${data.educators_found} educators.`, 'success')
      await fetchVisits()

      // Auto-expand the processed visit
      setExpandedVisitId(visitId)
      await loadVisitDetails(visitId)
    } catch (err: any) {
      showToast(err.message || 'Processing failed', 'error')
    } finally {
      setProcessing(false)
    }
  }

  const loadVisitDetails = async (visitId: string) => {
    setLoadingDetails(true)
    try {
      const res = await fetch(`/api/tdi-admin/observations?visitId=${visitId}`)
      const data = await res.json()
      setExpandedNotes(data.notes || [])
      setExpandedSummary(data.summary || null)
    } catch {
      showToast('Failed to load visit details', 'error')
    } finally {
      setLoadingDetails(false)
    }
  }

  const toggleVisit = async (visitId: string) => {
    if (expandedVisitId === visitId) {
      setExpandedVisitId(null)
      setExpandedNotes([])
      setExpandedSummary(null)
      return
    }
    setExpandedVisitId(visitId)
    await loadVisitDetails(visitId)
  }

  const handleNoteEdit = async (noteId: string, field: string, value: any) => {
    try {
      const res = await fetch('/api/tdi-admin/observations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, [field]: value }),
      })
      if (!res.ok) throw new Error('Update failed')

      // Update local state
      setExpandedNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, [field]: value } : n))
      )
    } catch {
      showToast('Failed to save changes', 'error')
    }
  }

  const handleSendAll = async (visitId: string) => {
    setSending(true)
    try {
      const res = await fetch('/api/tdi-admin/observations/send-love-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      showToast(`Sent ${data.sent} Love Notes${data.failed > 0 ? ` (${data.failed} failed)` : ''}`, data.failed > 0 ? 'error' : 'success')
      await fetchVisits()
      await loadVisitDetails(visitId)
    } catch (err: any) {
      showToast(err.message || 'Send failed', 'error')
    } finally {
      setSending(false)
    }
  }

  const handleSendOne = async (visitId: string, noteId: string) => {
    setSendingNoteId(noteId)
    try {
      const res = await fetch('/api/tdi-admin/observations/send-love-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitId, noteIds: [noteId] }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      showToast(data.sent > 0 ? 'Love Note sent!' : 'Could not send (no email on file)', data.sent > 0 ? 'success' : 'error')
      await loadVisitDetails(visitId)
    } catch (err: any) {
      showToast(err.message || 'Send failed', 'error')
    } finally {
      setSendingNoteId(null)
    }
  }

  const handleDelete = async (visitId: string) => {
    if (!confirm('Delete this observation visit and all its notes? This cannot be undone.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/tdi-admin/observations?visitId=${visitId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      showToast('Visit deleted', 'success')
      setExpandedVisitId(null)
      await fetchVisits()
    } catch {
      showToast('Failed to delete visit', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const toggleTag = (noteId: string, tag: string, currentTags: string[]) => {
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag]
    handleNoteEdit(noteId, 'strategy_tags', newTags)
  }

  const toggleIndicator = (noteId: string, indicator: string, currentIndicators: string[]) => {
    const newIndicators = currentIndicators.includes(indicator)
      ? currentIndicators.filter((i) => i !== indicator)
      : [...currentIndicators, indicator]
    handleNoteEdit(noteId, 'growth_indicators', newIndicators)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFilesSelected(e.dataTransfer.files)
  }

  return (
    <div>
      {/* New Observation Form */}
      <div className="border border-gray-200 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">New Observation</h3>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Visit Date *</label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Buildings Visited</label>
            <input
              type="text"
              value={buildings}
              onChange={(e) => setBuildings(e.target.value)}
              placeholder="e.g. Main, Annex B"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* Photo upload zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-amber-400 transition mb-3"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFilesSelected(e.target.files)}
            className="hidden"
          />
          <div className="text-sm text-gray-500">
            {selectedFiles.length === 0
              ? 'Drop notepad photos here or click to browse'
              : `${selectedFiles.length} photo${selectedFiles.length > 1 ? 's' : ''} selected`}
          </div>
        </div>

        {/* Thumbnails */}
        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {previews.map((src, i) => (
              <div key={i} className="relative group">
                <img
                  src={src}
                  alt={`Photo ${i + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(i)
                  }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || !visitDate || selectedFiles.length === 0}
          className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition disabled:opacity-50"
          style={{ backgroundColor: '#E8B84B' }}
        >
          {uploading ? 'Uploading...' : 'Upload & Start Processing'}
        </button>
      </div>

      {/* Visit History */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Visit History</h3>

        {loadingVisits ? (
          <div className="text-center py-8 text-sm text-gray-400">Loading visits...</div>
        ) : visits.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-400">No observation visits yet</div>
        ) : (
          <div className="space-y-2">
            {visits.map((visit) => (
              <div key={visit.id} className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Visit header */}
                <button
                  onClick={() => toggleVisit(visit.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-800">
                      Visit #{visit.visit_number}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(visit.visit_date + 'T12:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: STATUS_COLORS[visit.status] || '#9CA3AF' }}
                    >
                      {visit.status}
                    </span>
                    {visit.note_count > 0 && (
                      <span className="text-xs text-gray-400">
                        {visit.sent_count}/{visit.note_count} sent
                      </span>
                    )}
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400 transition"
                    style={{
                      transform: expandedVisitId === visit.id ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.15s',
                    }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Expanded visit details */}
                {expandedVisitId === visit.id && (
                  <div className="border-t border-gray-100 px-4 py-4">
                    {loadingDetails ? (
                      <div className="text-center py-6 text-sm text-gray-400">Loading details...</div>
                    ) : (
                      <>
                        {/* Notepad photos */}
                        {visit.notepad_photos && visit.notepad_photos.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-medium text-gray-500 mb-2">Notepad Photos</p>
                            <div className="flex flex-wrap gap-2">
                              {visit.notepad_photos.map((photo, i) => (
                                <img
                                  key={i}
                                  src={photo.url}
                                  alt={`Notepad ${i + 1}`}
                                  onClick={() => setZoomedPhoto(photo.url)}
                                  className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:ring-2 hover:ring-amber-400 transition"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Process button for uploaded visits */}
                        {visit.status === 'uploaded' && (
                          <button
                            onClick={() => handleProcess(visit.id)}
                            disabled={processing}
                            className="mb-4 px-4 py-2 rounded-lg text-sm font-medium text-white transition disabled:opacity-50"
                            style={{ backgroundColor: '#3B82F6' }}
                          >
                            {processing ? 'Processing with AI...' : 'Process Notes'}
                          </button>
                        )}

                        {/* Processing indicator */}
                        {visit.status === 'processing' && (
                          <div className="mb-4 px-4 py-3 rounded-lg bg-blue-50 text-sm text-blue-700">
                            AI is reading your notes. This may take a minute...
                          </div>
                        )}

                        {/* Educator cards */}
                        {(visit.status === 'processed' || visit.status === 'reviewed' || visit.status === 'sent') && expandedNotes.length > 0 && (
                          <div className="space-y-4 mb-4">
                            {expandedNotes.map((note) => (
                              <div key={note.id} className="border border-gray-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <div
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: note.matched_staff_id ? '#10B981' : '#9CA3AF' }}
                                    title={note.matched_staff_id ? 'Matched to roster' : 'Not matched'}
                                  />
                                  <span className="text-sm font-semibold text-gray-800">
                                    {note.educator_name}
                                  </span>
                                  {note.matched_email && (
                                    <span className="text-xs text-gray-400">{note.matched_email}</span>
                                  )}
                                  {note.email_sent_at && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                      Sent {new Date(note.email_sent_at).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>

                                {/* Love Note */}
                                <div className="mb-3">
                                  <label className="text-xs font-medium text-gray-500 mb-1 block">Love Note</label>
                                  <textarea
                                    value={
                                      editingNotes[note.id] !== undefined
                                        ? editingNotes[note.id]
                                        : note.love_note_final || note.love_note_draft || ''
                                    }
                                    onChange={(e) =>
                                      setEditingNotes((prev) => ({ ...prev, [note.id]: e.target.value }))
                                    }
                                    onBlur={() => {
                                      if (editingNotes[note.id] !== undefined) {
                                        handleNoteEdit(note.id, 'love_note_final', editingNotes[note.id])
                                      }
                                    }}
                                    rows={6}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y"
                                    disabled={!!note.email_sent_at}
                                  />
                                </div>

                                {/* Strategy Tags */}
                                <div className="mb-3">
                                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Strategy Tags</label>
                                  <div className="flex flex-wrap gap-1.5">
                                    {ALL_STRATEGY_TAGS.map((tag) => {
                                      const active = (note.strategy_tags || []).includes(tag)
                                      return (
                                        <button
                                          key={tag}
                                          onClick={() => toggleTag(note.id, tag, note.strategy_tags || [])}
                                          className="text-[10px] px-2 py-1 rounded-full font-medium transition"
                                          style={{
                                            backgroundColor: active ? STRATEGY_TAG_COLORS[tag] || '#6B7280' : '#F3F4F6',
                                            color: active ? 'white' : '#6B7280',
                                          }}
                                          disabled={!!note.email_sent_at}
                                        >
                                          {tag}
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>

                                {/* Growth Indicators */}
                                <div className="mb-3">
                                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Growth Indicators</label>
                                  <div className="flex flex-wrap gap-1.5">
                                    {ALL_GROWTH_INDICATORS.map((indicator) => {
                                      const active = (note.growth_indicators || []).includes(indicator)
                                      return (
                                        <button
                                          key={indicator}
                                          onClick={() => toggleIndicator(note.id, indicator, note.growth_indicators || [])}
                                          className="text-[10px] px-2 py-1 rounded-full font-medium transition"
                                          style={{
                                            backgroundColor: active ? '#1e2749' : '#F3F4F6',
                                            color: active ? 'white' : '#6B7280',
                                          }}
                                          disabled={!!note.email_sent_at}
                                        >
                                          {indicator}
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>

                                {/* Hub Resources */}
                                {note.hub_resources && note.hub_resources.length > 0 && (
                                  <div className="mb-3">
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Suggested Hub Resources</label>
                                    <ul className="text-xs text-gray-600 space-y-0.5">
                                      {note.hub_resources.map((r, i) => (
                                        <li key={i} className="flex items-start gap-1.5">
                                          <span className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: '#E8B84B' }} />
                                          {r}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Send button per educator */}
                                {!note.email_sent_at && note.matched_email && (
                                  <button
                                    onClick={() => handleSendOne(visit.id, note.id)}
                                    disabled={sendingNoteId === note.id}
                                    className="text-xs font-medium px-3 py-1.5 rounded-lg text-white transition disabled:opacity-50"
                                    style={{ backgroundColor: '#10B981' }}
                                  >
                                    {sendingNoteId === note.id ? 'Sending...' : 'Send Love Note'}
                                  </button>
                                )}
                              </div>
                            ))}

                            {/* Send All button */}
                            {expandedNotes.some((n) => !n.email_sent_at && n.matched_email) && (
                              <button
                                onClick={() => handleSendAll(visit.id)}
                                disabled={sending}
                                className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition disabled:opacity-50"
                                style={{ backgroundColor: '#10B981' }}
                              >
                                {sending ? 'Sending All...' : 'Send All Love Notes'}
                              </button>
                            )}
                          </div>
                        )}

                        {/* Visit Summary */}
                        {expandedSummary && (
                          <div className="border border-gray-200 rounded-xl p-4 mb-4" style={{ borderLeftColor: '#E8B84B', borderLeftWidth: 3 }}>
                            <h4 className="text-xs font-semibold text-gray-800 mb-2">Visit Summary</h4>

                            {expandedSummary.coaching_themes.length > 0 && (
                              <div className="mb-2">
                                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Coaching Themes</span>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {expandedSummary.coaching_themes.map((t, i) => (
                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {expandedSummary.key_wins.length > 0 && (
                              <div className="mb-2">
                                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Key Wins</span>
                                <ul className="text-xs text-gray-600 mt-1 space-y-0.5">
                                  {expandedSummary.key_wins.map((w, i) => (
                                    <li key={i} className="flex items-start gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 bg-green-400" />
                                      {w}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {expandedSummary.areas_to_watch.length > 0 && (
                              <div className="mb-2">
                                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Areas to Watch</span>
                                <ul className="text-xs text-gray-600 mt-1 space-y-0.5">
                                  {expandedSummary.areas_to_watch.map((a, i) => (
                                    <li key={i} className="flex items-start gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 bg-amber-400" />
                                      {a}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {expandedSummary.board_summary && (
                              <div>
                                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Board Summary</span>
                                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{expandedSummary.board_summary}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Delete button */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleDelete(visit.id)}
                            disabled={deleting}
                            className="text-xs text-red-500 hover:text-red-700 transition"
                          >
                            {deleting ? 'Deleting...' : 'Delete Visit'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo zoom modal */}
      {zoomedPhoto && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setZoomedPhoto(null)}
        >
          <div className="max-w-4xl max-h-[90vh] p-2">
            <img
              src={zoomedPhoto}
              alt="Notepad photo"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}
