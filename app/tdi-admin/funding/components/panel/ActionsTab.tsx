'use client'

import { useEffect, useState } from 'react'
import { NudgePreviewModal } from './NudgePreviewModal'

const CATEGORY_OPTIONS = ['research', 'writing', 'submission', 'follow_up', 'approval', 'documentation']

interface ActionsTabProps {
  pursuitId: string
}

interface BlockedClose {
  message: string
  field: 'answer' | 'outcome'
  options?: string[]
  override?: { label: string; note: string }
}

const OUTCOME_WORDS: Record<string, string> = {
  proceed: 'We can carry on',
  stop_path: 'This path is closed',
  still_blocked: 'Still stuck',
}

export function ActionsTab({ pursuitId }: ActionsTabProps) {
  // What the server said when it refused to close an item, keyed by item.
  const [blocked, setBlocked] = useState<Record<string, BlockedClose>>({})
  const [answers, setAnswers] = useState<Record<string, { answer: string; outcome: string; skip: string; showSkip: boolean }>>({})

  const [actions, setActions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAction, setNewAction] = useState({ title: '', ownerType: 'tdi', dueDate: '', category: 'research', actionSize: 'standard', ownerName: '', ownerEmail: '', description: '' })
  const [nudgeActionId, setNudgeActionId] = useState<string | null>(null)
  const [addingAction, setAddingAction] = useState(false)

  const fetchActions = () => {
    setLoading(true)
    fetch(`/api/funding/pursuits/${pursuitId}/actions`)
      .then(r => r.json())
      .then(d => {
        const items = Array.isArray(d) ? d : (d.actions || [])
        setActions(items)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchActions() }, [pursuitId])

  /**
   * Tick an item, and show what the server says when it will not close.
   *
   * This fired the request, ignored the reply and reloaded. The route refuses
   * to close a question without an answer and returns a sentence written for
   * the person clicking, and all of it went in the bin. The item came back
   * unchanged, which reads as "the tick does nothing", which is exactly how
   * Bella reported it.
   *
   * Ten of the seventeen open items are questions, so the silent refusal was
   * the usual outcome rather than an edge case.
   */
  const toggleDone = async (actionId: string, currentStatus: string, extra?: Record<string, unknown>) => {
    const isDone = currentStatus === 'done' || currentStatus === 'completed'
    setBlocked(b => { const n = { ...b }; delete n[actionId]; return n })
    try {
      const res = await fetch(`/api/funding/pursuits/${pursuitId}/actions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isDone ? { actionId, reopen: true } : { actionId, markDone: true, ...(extra || {}) },
        ),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setBlocked(b => ({
          ...b,
          [actionId]: {
            message: data.error || 'This could not be closed, and the reason did not come through.',
            field: data.requires?.field === 'outcome' ? 'outcome' : 'answer',
            options: data.requires?.options as string[] | undefined,
            override: data.override ? { label: data.override.label, note: data.override.note } : undefined,
          },
        }))
        return
      }
      fetchActions()
    } catch {
      setBlocked(b => ({
        ...b,
        [actionId]: { message: 'Could not reach the server. Nothing was changed, so try again.', field: 'answer' },
      }))
    }
  }

  const cancelAction = async (actionId: string, reason: string) => {
    const res = await fetch(`/api/funding/pursuits/${pursuitId}/actions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId, cancel: true, cancelReason: reason }),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setBlocked(b => ({ ...b, [actionId]: { message: d.error || 'That did not cancel. Nothing was changed.', field: 'answer' } }))
      return
    }
    fetchActions()
  }

  const updateNotes = async (actionId: string, notes: string) => {
    const res = await fetch(`/api/funding/pursuits/${pursuitId}/actions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId, notes }),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setBlocked(b => ({ ...b, [actionId]: { message: d.error || 'Your note was not saved.', field: 'answer' } }))
      return
    }
    fetchActions()
  }

  const updateClientLabel = async (actionId: string, clientLabel: string) => {
    await fetch(`/api/funding/pursuits/${pursuitId}/actions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId, client_label: clientLabel }),
    })
    fetchActions()
  }

  const handleAdd = async () => {
    if (!newAction.title.trim()) return
    setAddingAction(true)
    await fetch(`/api/funding/pursuits/${pursuitId}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAction),
    })
    setNewAction({ title: '', ownerType: 'tdi', dueDate: '', category: 'research', actionSize: 'standard', ownerName: '', ownerEmail: '', description: '' })
    setShowAddForm(false)
    setAddingAction(false)
    fetchActions()
  }

  const today = new Date().toISOString().split('T')[0]

  const isOverdue = (action: any) => {
    if (!action.due_date) return false
    const status = action.status || 'pending'
    return action.due_date < today && (status === 'pending' || status === 'in_progress')
  }

  const getDueDateColor = (dueDate: string | null) => {
    if (!dueDate) return '#6B7280'
    const diff = Math.ceil((new Date(dueDate + 'T00:00:00').getTime() - new Date(today + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return '#DC2626'
    if (diff < 7) return '#DC2626'
    if (diff <= 14) return '#F59E0B'
    return '#10B981'
  }

  // Filter out system-level Rae tasks that aren't school-specific
  const schoolActions = actions.filter(a => !(a.owner_email === 'rae@teachersdeserveit.com' && a.category === 'approval' && !a.opportunity_id))
  const activeActions = schoolActions.filter(a => a.status !== 'cancelled')
  const cancelledActions = schoolActions.filter(a => a.status === 'cancelled')
  const clientActions = activeActions.filter(a => a.owner_type === 'client')
  const tdiActions = activeActions.filter(a => a.owner_type !== 'client')

  if (loading) return <div style={{ padding: 20, textAlign: 'center', color: '#6B7280' }}>Loading...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Add button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 6,
            border: 'none', background: '#8B5CF6', color: 'white', cursor: 'pointer',
          }}
        >
          {showAddForm ? 'Cancel' : '+ Add Action'}
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div style={{ padding: 16, background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            value={newAction.title}
            onChange={e => setNewAction({ ...newAction, title: e.target.value })}
            placeholder="Action title"
            style={{ fontSize: 13, padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 6, width: '100%', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Owner type toggle */}
            <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
              <button
                onClick={() => setNewAction({ ...newAction, ownerType: 'tdi' })}
                style={{
                  fontSize: 12, padding: '6px 14px', border: 'none', cursor: 'pointer',
                  background: newAction.ownerType === 'tdi' ? '#8B5CF6' : 'white',
                  color: newAction.ownerType === 'tdi' ? 'white' : '#374151',
                  fontWeight: 600,
                }}
              >
                TDI
              </button>
              <button
                onClick={() => setNewAction({ ...newAction, ownerType: 'client' })}
                style={{
                  fontSize: 12, padding: '6px 14px', border: 'none', cursor: 'pointer',
                  background: newAction.ownerType === 'client' ? '#F59E0B' : 'white',
                  color: newAction.ownerType === 'client' ? 'white' : '#374151',
                  fontWeight: 600,
                }}
              >
                Client
              </button>
            </div>
            <input
              type="date"
              value={newAction.dueDate}
              onChange={e => setNewAction({ ...newAction, dueDate: e.target.value })}
              style={{ fontSize: 13, padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: 6 }}
            />
            <select
              value={newAction.category}
              onChange={e => setNewAction({ ...newAction, category: e.target.value })}
              style={{ fontSize: 13, padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: 6 }}
            >
              {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          {/* Row 3: action size, owner name/email, description */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={newAction.actionSize}
              onChange={e => setNewAction({ ...newAction, actionSize: e.target.value })}
              style={{ fontSize: 13, padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: 6 }}
            >
              <option value="light">Light (1-2d lead)</option>
              <option value="standard">Standard (3d lead)</option>
              <option value="heavy">Heavy (5-7d lead)</option>
            </select>
            <input
              value={newAction.ownerName}
              onChange={e => setNewAction({ ...newAction, ownerName: e.target.value })}
              placeholder="Owner name"
              style={{ fontSize: 13, padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: 6, flex: 1 }}
            />
            <input
              value={newAction.ownerEmail}
              onChange={e => setNewAction({ ...newAction, ownerEmail: e.target.value })}
              placeholder="Owner email"
              style={{ fontSize: 13, padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: 6, flex: 1 }}
            />
          </div>
          <input
            value={newAction.description}
            onChange={e => setNewAction({ ...newAction, description: e.target.value })}
            placeholder="Description (optional)"
            style={{ fontSize: 13, padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 6, width: '100%', boxSizing: 'border-box' }}
          />
          <button
            onClick={handleAdd}
            disabled={!newAction.title || addingAction}
            style={{
              fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 6,
              border: 'none', background: addingAction ? '#9CA3AF' : '#8B5CF6', color: 'white',
              cursor: !newAction.title || addingAction ? 'default' : 'pointer',
              opacity: newAction.title && !addingAction ? 1 : 0.5, alignSelf: 'flex-start',
            }}
          >
            {addingAction ? 'Adding...' : 'Add Action'}
          </button>
        </div>
      )}

      {/* Client Tasks */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 4, height: 18, background: '#F59E0B', borderRadius: 2 }} />
          <span style={{ fontSize: 13, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Client Tasks ({clientActions.length})
          </span>
        </div>
        {clientActions.length === 0 ? (
          <div style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', paddingLeft: 12 }}>No client tasks</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {clientActions.map(action => (
              <ActionItem key={action.id} action={action} onToggle={toggleDone} onCancel={cancelAction} onUpdateClientLabel={updateClientLabel} onNudge={setNudgeActionId} onUpdateNotes={updateNotes} blocked={blocked[action.id]} draft={answers[action.id]} onDraft={(patch) => setAnswers(a => ({ ...a, [action.id]: { ...{ answer: '', outcome: '', skip: '', showSkip: false }, ...a[action.id], ...patch } }))} isOverdue={isOverdue(action)} getDueDateColor={getDueDateColor} />
            ))}
          </div>
        )}
      </div>

      {/* TDI Tasks */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 4, height: 18, background: '#8B5CF6', borderRadius: 2 }} />
          <span style={{ fontSize: 13, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            TDI Tasks ({tdiActions.length})
          </span>
        </div>
        {tdiActions.length === 0 ? (
          <div style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', paddingLeft: 12 }}>No TDI tasks</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {tdiActions.map(action => (
              <ActionItem key={action.id} action={action} onToggle={toggleDone} onCancel={cancelAction} onUpdateClientLabel={updateClientLabel} onNudge={setNudgeActionId} onUpdateNotes={updateNotes} blocked={blocked[action.id]} draft={answers[action.id]} onDraft={(patch) => setAnswers(a => ({ ...a, [action.id]: { ...{ answer: '', outcome: '', skip: '', showSkip: false }, ...a[action.id], ...patch } }))} isOverdue={isOverdue(action)} getDueDateColor={getDueDateColor} />
            ))}
          </div>
        )}
      </div>

      {/* Cancelled — hidden by default */}
      {cancelledActions.length > 0 && (
        <CancelledSection count={cancelledActions.length}>
          {cancelledActions.map(action => (
            <ActionItem key={action.id} action={action} onToggle={toggleDone} onCancel={cancelAction} onUpdateClientLabel={updateClientLabel} onNudge={setNudgeActionId} onUpdateNotes={updateNotes} blocked={blocked[action.id]} draft={answers[action.id]} onDraft={(patch) => setAnswers(a => ({ ...a, [action.id]: { ...{ answer: '', outcome: '', skip: '', showSkip: false }, ...a[action.id], ...patch } }))} isOverdue={false} getDueDateColor={() => '#9CA3AF'} />
          ))}
        </CancelledSection>
      )}

      {/* Nudge preview modal */}
      {nudgeActionId && (
        <NudgePreviewModal
          actionId={nudgeActionId}
          onClose={() => setNudgeActionId(null)}
          onSent={() => { setNudgeActionId(null); fetchActions() }}
        />
      )}
    </div>
  )
}

function CancelledSection({ count, children }: { count: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0',
          background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <div style={{ width: 4, height: 18, background: '#D1D5DB', borderRadius: 2 }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {count} Cancelled
        </span>
        <span style={{ fontSize: 10, color: '#9CA3AF' }}>{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
          {children}
        </div>
      )}
    </div>
  )
}

const COLOR_STATE_COLORS: Record<string, string> = {
  green: '#10B981',
  yellow: '#F59E0B',
  red: '#DC2626',
}

const COLOR_STATE_TOOLTIPS: Record<string, string> = {
  green: 'On track — no action needed',
  yellow: 'Approaching deadline — act soon',
  red: 'Overdue or blocked — needs immediate attention',
}

const RUNG_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  submitter: { label: 'Submitter', bg: '#FEF3C7', color: '#92400E' },
  backup: { label: 'Backup', bg: '#FEE2E2', color: '#991B1B' },
  admin_sponsor: { label: 'Admin Sponsor', bg: '#FEE2E2', color: '#991B1B' },
  rae: { label: 'Rae', bg: '#FEE2E2', color: '#991B1B' },
}

function ActionItem({ action, onToggle, onCancel, onUpdateClientLabel, onNudge, onUpdateNotes, isOverdue, getDueDateColor, blocked, draft, onDraft }: {
  blocked?: BlockedClose
  draft?: { answer: string; outcome: string; skip: string; showSkip: boolean }
  onDraft?: (patch: Partial<{ answer: string; outcome: string; skip: string; showSkip: boolean }>) => void
  action: any
  onToggle: (id: string, currentStatus: string, extra?: Record<string, unknown>) => void
  onCancel: (id: string, reason: string) => void
  onUpdateClientLabel: (id: string, label: string) => void
  onNudge: (id: string) => void
  onUpdateNotes: (id: string, notes: string) => void
  isOverdue: boolean
  getDueDateColor: (d: string | null) => string
}) {
  const [showCancelInput, setShowCancelInput] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [editingLabel, setEditingLabel] = useState(false)
  const [labelDraft, setLabelDraft] = useState(action.client_label || '')
  const [showNotes, setShowNotes] = useState(false)
  const [notesDraft, setNotesDraft] = useState(action.notes || '')
  const [notesSaved, setNotesSaved] = useState(false)

  const isDone = action.status === 'done' || action.status === 'completed'
  const isCancelled = action.status === 'cancelled'
  const isInactive = isDone || isCancelled
  const colorState = action.color_state as string | null
  const escalationRung = action.escalation_rung as string | null
  const displayTitle = action.client_label || action.title

  const titleColor = isInactive
    ? '#9CA3AF'
    : colorState === 'red'
      ? '#DC2626'
      : colorState === 'yellow'
        ? '#92400E'
        : isOverdue
          ? '#DC2626'
          : '#0a0f1e'

  const d = draft || { answer: '', outcome: '', skip: '', showSkip: false }

  return (
    <div>
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 12px', background: blocked ? '#FEF2F2' : isCancelled ? '#FAFAFA' : '#F9FAFB', borderRadius: 8, opacity: isCancelled ? 0.6 : 1 }}>
      {/* Color state dot */}
      {colorState && !isInactive && (
        <div
          title={COLOR_STATE_TOOLTIPS[colorState] || `Status: ${colorState}`}
          style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
            background: COLOR_STATE_COLORS[colorState] || '#D1D5DB',
          }}
        />
      )}

      {/* Checkbox — toggles done/reopen */}
      <button
        onClick={() => onToggle(action.id, action.status)}
        title={isDone ? 'Reopen' : isCancelled ? 'Reopen' : 'Mark done'}
        style={{
          width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
          border: isInactive ? 'none' : '2px solid #D1D5DB',
          background: isDone ? '#8B5CF6' : isCancelled ? '#D1D5DB' : 'white',
          color: 'white', fontSize: 10, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {isDone ? '\u2713' : isCancelled ? '\u2715' : ''}
      </button>

      <div style={{ flex: 1 }}>
        {/* Title row — with inline edit for client_label */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {editingLabel ? (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', flex: 1 }}>
              <input
                value={labelDraft}
                onChange={e => setLabelDraft(e.target.value)}
                placeholder="Client-facing label..."
                autoFocus
                style={{
                  fontSize: 12, padding: '3px 8px', border: '1px solid #8B5CF6', borderRadius: 4,
                  flex: 1, outline: 'none',
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') { onUpdateClientLabel(action.id, labelDraft); setEditingLabel(false) }
                  if (e.key === 'Escape') { setLabelDraft(action.client_label || ''); setEditingLabel(false) }
                }}
              />
              <button
                onClick={() => { onUpdateClientLabel(action.id, labelDraft); setEditingLabel(false) }}
                style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4, border: 'none', background: '#8B5CF6', color: 'white', cursor: 'pointer' }}
              >
                Save
              </button>
              <button
                onClick={() => { setLabelDraft(action.client_label || ''); setEditingLabel(false) }}
                style={{ fontSize: 10, padding: '3px 6px', borderRadius: 4, border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <div style={{
                fontSize: 14, fontWeight: 600,
                color: titleColor,
                textDecoration: isInactive ? 'line-through' : 'none',
                flex: 1,
              }}>
                {displayTitle}
              </div>
              {!isCancelled && (
                <button
                  onClick={() => { setLabelDraft(action.client_label || ''); setEditingLabel(true) }}
                  title="Edit client label"
                  style={{
                    fontSize: 9, padding: '1px 5px', borderRadius: 3,
                    border: '1px solid #E5E7EB', background: 'white', color: '#9CA3AF',
                    cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  label
                </button>
              )}
            </>
          )}
        </div>

        {/* Internal title shown small if client_label differs */}
        {action.client_label && action.client_label !== action.title && !editingLabel && (
          <div style={{ fontSize: 10, color: '#C4B5FD', marginTop: 1 }}>{action.title}</div>
        )}

        {/* Cancel reason for cancelled items */}
        {isCancelled && action.cancel_reason && (
          <div style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic', marginTop: 2 }}>
            Cancelled: {action.cancel_reason}
          </div>
        )}

        {/* Description */}
        {action.description && !isCancelled && (
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4, lineHeight: 1.5 }}>{action.description}</div>
        )}

        {/* Meta row */}
        <div style={{ display: 'flex', gap: 10, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {action.due_date && (
            <span style={{ fontSize: 11, fontWeight: 600, color: getDueDateColor(action.due_date) }}>
              Due: {new Date(action.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {action.owner_name && (
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
              background: action.owner_type === 'client' ? '#FFF7ED' : '#F5F3FF',
              color: action.owner_type === 'client' ? '#C2410C' : '#6D28D9',
            }}>
              {action.owner_type === 'client' ? `Waiting on ${action.owner_name}` : `${action.owner_name} needs to do this`}
            </span>
          )}
          {escalationRung && escalationRung !== 'none' && !isInactive && (() => {
            const rungStyle = RUNG_LABELS[escalationRung]
            return rungStyle ? (
              <span style={{
                fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                background: rungStyle.bg, color: rungStyle.color,
              }}>
                Escalated: {rungStyle.label}
              </span>
            ) : null
          })()}
          {/* Send nudge button */}
          {!isInactive && action.owner_email && (
            <button
              onClick={() => onNudge(action.id)}
              style={{
                fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                border: '1px solid #8B5CF6', background: '#F5F3FF', color: '#6D28D9',
                cursor: 'pointer',
              }}
            >
              Send nudge
            </button>
          )}
          {/* Cancel button */}
          {!isInactive && (
            <button
              onClick={() => setShowCancelInput(!showCancelInput)}
              style={{
                fontSize: 11, padding: '4px 8px', borderRadius: 6,
                border: '1px solid #E5E7EB', background: 'white', color: '#9CA3AF',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          )}
        </div>

        {/* Cancel input */}
        {showCancelInput && (
          <div style={{ display: 'flex', gap: 4, marginTop: 6, alignItems: 'center' }}>
            <input
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Reason (e.g. window closed, path dead)"
              autoFocus
              style={{
                fontSize: 11, padding: '4px 8px', border: '1px solid #E5E7EB', borderRadius: 4,
                flex: 1, outline: 'none',
              }}
              onKeyDown={e => { if (e.key === 'Enter' && cancelReason) { onCancel(action.id, cancelReason); setShowCancelInput(false); setCancelReason('') } }}
            />
            <button
              onClick={() => { if (cancelReason) { onCancel(action.id, cancelReason); setShowCancelInput(false); setCancelReason('') } }}
              disabled={!cancelReason}
              style={{
                fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 4,
                border: 'none', background: cancelReason ? '#DC2626' : '#E5E7EB',
                color: 'white', cursor: cancelReason ? 'pointer' : 'default',
              }}
            >
              Cancel item
            </button>
          </div>
        )}

        {/* Client-specific: prepared materials */}
        {action.owner_type === 'client' && action.prepared_materials && !isCancelled && (
          <div style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic', marginTop: 4 }}>
            TDI prepared: {action.prepared_materials}
          </div>
        )}

        {/* Client-specific: nudge count */}
        {action.owner_type === 'client' && action.nudge_count > 0 && !isCancelled && (
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
            background: '#FEF3C7', color: '#92400E', marginTop: 4, display: 'inline-block',
          }}>
            Nudged {action.nudge_count} time{action.nudge_count > 1 ? 's' : ''}
          </span>
        )}

        {/* Notes section */}
        {!isCancelled && (
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => setShowNotes(!showNotes)}
              style={{
                fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
                border: '1px solid #E5E7EB', background: action.notes ? '#F0FDF4' : '#F9FAFB',
                color: action.notes ? '#065F46' : '#9CA3AF', cursor: 'pointer',
              }}
            >
              {action.notes ? 'Notes' : '+ Add notes'}
            </button>
            {showNotes && (
              <div style={{ marginTop: 6 }}>
                <textarea
                  value={notesDraft}
                  onChange={e => setNotesDraft(e.target.value)}
                  placeholder="Log a note... (e.g. Called Teri, she said the PayPal issue is with Deed support)"
                  rows={3}
                  style={{
                    fontSize: 12, padding: '8px 10px', borderRadius: 6,
                    border: '1px solid #E5E7EB', width: '100%', boxSizing: 'border-box',
                    fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, resize: 'vertical',
                  }}
                />
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <button
                    onClick={() => { onUpdateNotes(action.id, notesDraft); setNotesSaved(true); setTimeout(() => setNotesSaved(false), 2000) }}
                    disabled={notesDraft === (action.notes || '')}
                    style={{
                      fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 6,
                      border: 'none', background: notesSaved ? '#065F46' : notesDraft !== (action.notes || '') ? '#8B5CF6' : '#E5E7EB',
                      color: 'white', cursor: notesDraft !== (action.notes || '') ? 'pointer' : 'default',
                    }}
                  >
                    {notesSaved ? 'Saved' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setNotesDraft(action.notes || ''); setShowNotes(false) }}
                    style={{
                      fontSize: 11, padding: '4px 8px', borderRadius: 6,
                      border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', cursor: 'pointer',
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {/* The refusal, shown on the item it belongs to. */}
    {blocked && (
      <div style={{ margin: '6px 0 10px 40px', padding: 12, background: 'white', border: '1px solid #FCA5A5', borderRadius: 8 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#991B1B', marginBottom: 9 }}>{blocked.message}</div>

        {blocked.field === 'answer' && (
          <textarea
            value={d.answer}
            onChange={e => onDraft?.({ answer: e.target.value })}
            placeholder="What were you told?"
            rows={2}
            style={{ width: '100%', fontSize: 12.5, padding: '7px 9px', borderRadius: 6, border: '1px solid #D1D5DB', fontFamily: 'inherit', resize: 'vertical', marginBottom: 9 }}
          />
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
          {(blocked.options || ['proceed', 'stop_path', 'still_blocked']).map(opt => (
            <button
              key={opt}
              onClick={() => onDraft?.({ outcome: opt })}
              style={{
                fontSize: 11.5, fontWeight: 600, padding: '5px 9px', borderRadius: 6,
                border: d.outcome === opt ? '1px solid #1D4ED8' : '1px solid #D1D5DB',
                background: d.outcome === opt ? '#EFF6FF' : 'white',
                color: d.outcome === opt ? '#1D4ED8' : '#374151', cursor: 'pointer',
              }}
            >{OUTCOME_WORDS[opt] || opt}</button>
          ))}
        </div>

        <button
          onClick={() => onToggle(action.id, action.status, { answer: d.answer, outcome: d.outcome })}
          disabled={!d.answer.trim() || !d.outcome}
          style={{
            fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 6, border: 'none',
            color: 'white', marginRight: 10,
            background: (!d.answer.trim() || !d.outcome) ? '#D1D5DB' : '#059669',
            cursor: (!d.answer.trim() || !d.outcome) ? 'not-allowed' : 'pointer',
          }}
        >Record it and close</button>

        {blocked.override && !d.showSkip && (
          <button
            onClick={() => onDraft?.({ showSkip: true })}
            style={{ fontSize: 11.5, background: 'none', border: 'none', color: '#6B7280', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
          >{blocked.override.label}</button>
        )}

        {d.showSkip && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #F3F4F6' }}>
            <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 5 }}>{blocked.override?.note}</div>
            <input
              value={d.skip}
              onChange={e => onDraft?.({ skip: e.target.value })}
              placeholder="Why is no answer coming?"
              style={{ width: '100%', fontSize: 12.5, padding: '7px 9px', borderRadius: 6, border: '1px solid #D1D5DB', marginBottom: 7 }}
            />
            <button
              onClick={() => onToggle(action.id, action.status, { closeWithoutAnswer: d.skip })}
              disabled={!d.skip.trim()}
              style={{
                fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 6,
                border: '1px solid #D1D5DB', background: 'white', color: '#374151',
                cursor: d.skip.trim() ? 'pointer' : 'not-allowed',
              }}
            >Close without an answer</button>
          </div>
        )}
      </div>
    )}
    </div>
  )
}
