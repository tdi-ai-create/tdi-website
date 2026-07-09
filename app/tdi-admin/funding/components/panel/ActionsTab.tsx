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

  const toggleDone = async (actionId: string) => {
    await fetch(`/api/funding/pursuits/${pursuitId}/actions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId, markDone: true }),
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

  const clientActions = actions.filter(a => a.owner_type === 'client')
  const tdiActions = actions.filter(a => a.owner_type !== 'client')

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
              <ActionItem key={action.id} action={action} onToggle={toggleDone} isOverdue={isOverdue(action)} getDueDateColor={getDueDateColor} />
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
              <ActionItem key={action.id} action={action} onToggle={toggleDone} isOverdue={isOverdue(action)} getDueDateColor={getDueDateColor} />
            ))}
          </div>
        )}
      </div>
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

function ActionItem({ action, onToggle, isOverdue, getDueDateColor }: {
  action: any
  onToggle: (id: string) => void
  isOverdue: boolean
  getDueDateColor: (d: string | null) => string
}) {
  const isDone = action.status === 'done' || action.status === 'completed'
  const colorState = action.color_state as string | null
  const escalationRung = action.escalation_rung as string | null
  const displayTitle = action.client_label || action.title

  // Use color_state dot color if available, otherwise fall back to inline overdue calc
  const titleColor = isDone
    ? '#9CA3AF'
    : colorState === 'red'
      ? '#DC2626'
      : colorState === 'yellow'
        ? '#92400E'
        : isOverdue
          ? '#DC2626'
          : '#0a0f1e'

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 12px', background: '#F9FAFB', borderRadius: 8 }}>
      {/* Color state dot */}
      {colorState && !isDone && (
        <div
          title={`Status: ${colorState}`}
          style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
            background: COLOR_STATE_COLORS[colorState] || '#D1D5DB',
          }}
        />
      )}

      {/* Checkbox */}
      <button
        onClick={() => !isDone && onToggle(action.id)}
        style={{
          width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
          border: isDone ? 'none' : '2px solid #D1D5DB',
          background: isDone ? '#8B5CF6' : 'white',
          color: 'white', fontSize: 10, cursor: isDone ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {isDone ? '\u2713' : ''}
      </button>

      <div style={{ flex: 1 }}>
        {/* Title — uses client_label if available */}
        <div style={{
          fontSize: 13, fontWeight: 500,
          color: titleColor,
          textDecoration: isDone ? 'line-through' : 'none',
        }}>
          {displayTitle}
        </div>

        {/* Description */}
        {action.description && (
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
          {/* Escalation rung badge */}
          {escalationRung && escalationRung !== 'none' && !isDone && (() => {
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
        </div>

        {/* Client-specific: prepared materials */}
        {action.owner_type === 'client' && action.prepared_materials && (
          <div style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic', marginTop: 4 }}>
            TDI prepared: {action.prepared_materials}
          </div>
        )}

        {/* Client-specific: nudge count */}
        {action.owner_type === 'client' && action.nudge_count > 0 && (
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
