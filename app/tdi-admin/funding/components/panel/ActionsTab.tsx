'use client'

import { useEffect, useState } from 'react'

const CATEGORY_OPTIONS = ['research', 'writing', 'submission', 'follow_up', 'approval', 'documentation']

interface ActionsTabProps {
  pursuitId: string
}

export function ActionsTab({ pursuitId }: ActionsTabProps) {
  const [actions, setActions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAction, setNewAction] = useState({ title: '', ownerType: 'tdi', dueDate: '', category: 'research' })

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

  const toggleDone = async (actionId: string, currentStatus: string) => {
    const isDone = currentStatus === 'done' || currentStatus === 'completed'
    await fetch(`/api/funding/pursuits/${pursuitId}/actions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isDone ? { actionId, reopen: true } : { actionId, markDone: true }),
    })
    fetchActions()
  }

  const cancelAction = async (actionId: string, reason: string) => {
    await fetch(`/api/funding/pursuits/${pursuitId}/actions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId, cancel: true, cancelReason: reason }),
    })
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
    await fetch(`/api/funding/pursuits/${pursuitId}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAction),
    })
    setNewAction({ title: '', ownerType: 'tdi', dueDate: '', category: 'research' })
    setShowAddForm(false)
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

  const activeActions = actions.filter(a => a.status !== 'cancelled')
  const cancelledActions = actions.filter(a => a.status === 'cancelled')
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
          <button
            onClick={handleAdd}
            disabled={!newAction.title}
            style={{
              fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 6,
              border: 'none', background: '#8B5CF6', color: 'white', cursor: 'pointer',
              opacity: newAction.title ? 1 : 0.5, alignSelf: 'flex-start',
            }}
          >
            Add Action
          </button>
        </div>
      )}

      {/* Client Tasks */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 4, height: 18, background: '#F59E0B', borderRadius: 2 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Client Tasks ({clientActions.length})
          </span>
        </div>
        {clientActions.length === 0 ? (
          <div style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', paddingLeft: 12 }}>No client tasks</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {clientActions.map(action => (
              <ActionItem key={action.id} action={action} onToggle={toggleDone} onCancel={cancelAction} onUpdateClientLabel={updateClientLabel} isOverdue={isOverdue(action)} getDueDateColor={getDueDateColor} />
            ))}
          </div>
        )}
      </div>

      {/* TDI Tasks */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 4, height: 18, background: '#8B5CF6', borderRadius: 2 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            TDI Tasks ({tdiActions.length})
          </span>
        </div>
        {tdiActions.length === 0 ? (
          <div style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', paddingLeft: 12 }}>No TDI tasks</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {tdiActions.map(action => (
              <ActionItem key={action.id} action={action} onToggle={toggleDone} onCancel={cancelAction} onUpdateClientLabel={updateClientLabel} isOverdue={isOverdue(action)} getDueDateColor={getDueDateColor} />
            ))}
          </div>
        )}
      </div>

      {/* Cancelled */}
      {cancelledActions.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 4, height: 18, background: '#D1D5DB', borderRadius: 2 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Cancelled ({cancelledActions.length})
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {cancelledActions.map(action => (
              <ActionItem key={action.id} action={action} onToggle={toggleDone} onCancel={cancelAction} onUpdateClientLabel={updateClientLabel} isOverdue={false} getDueDateColor={() => '#9CA3AF'} />
            ))}
          </div>
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

const RUNG_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  submitter: { label: 'Submitter', bg: '#FEF3C7', color: '#92400E' },
  backup: { label: 'Backup', bg: '#FEE2E2', color: '#991B1B' },
  admin_sponsor: { label: 'Admin Sponsor', bg: '#FEE2E2', color: '#991B1B' },
  rae: { label: 'Rae', bg: '#FEE2E2', color: '#991B1B' },
}

function ActionItem({ action, onToggle, onCancel, onUpdateClientLabel, isOverdue, getDueDateColor }: {
  action: any
  onToggle: (id: string, currentStatus: string) => void
  onCancel: (id: string, reason: string) => void
  onUpdateClientLabel: (id: string, label: string) => void
  isOverdue: boolean
  getDueDateColor: (d: string | null) => string
}) {
  const [showCancelInput, setShowCancelInput] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [editingLabel, setEditingLabel] = useState(false)
  const [labelDraft, setLabelDraft] = useState(action.client_label || '')

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

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 12px', background: isCancelled ? '#FAFAFA' : '#F9FAFB', borderRadius: 8, opacity: isCancelled ? 0.6 : 1 }}>
      {/* Color state dot */}
      {colorState && !isInactive && (
        <div
          title={`Status: ${colorState}`}
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
                fontSize: 13, fontWeight: 500,
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
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{action.description}</div>
        )}

        {/* Meta row */}
        <div style={{ display: 'flex', gap: 10, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
          {action.due_date && (
            <span style={{ fontSize: 10, fontWeight: 600, color: getDueDateColor(action.due_date) }}>
              Due: {new Date(action.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {action.owner_name && (
            <span style={{ fontSize: 10, color: '#6B7280' }}>{action.owner_name}</span>
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
          {/* Cancel button */}
          {!isInactive && (
            <button
              onClick={() => setShowCancelInput(!showCancelInput)}
              style={{
                fontSize: 9, padding: '1px 5px', borderRadius: 3,
                border: '1px solid #E5E7EB', background: 'white', color: '#9CA3AF',
                cursor: 'pointer',
              }}
            >
              cancel
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
      </div>
    </div>
  )
}
