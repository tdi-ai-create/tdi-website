'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, Clock, Eye, EyeOff, Trash2, Plus, ChevronDown, Target } from 'lucide-react'

const CATEGORY_COLORS: Record<string, string> = {
  general: '#6B7280', onboarding: '#8B5CF6', hub: '#3B82F6',
  coaching: '#F59E0B', billing: '#EF4444', follow_up: '#10B981',
}

interface ActionItemsSidebarProps {
  partnershipId: string
  actionItems: any[]
  onActionItemsChange: (items: any[]) => void
  showToast: (message: string, type: 'success' | 'error') => void
}

export default function ActionItemsSidebar({ partnershipId, actionItems, onActionItemsChange, showToast }: ActionItemsSidebarProps) {
  const [showAddAction, setShowAddAction] = useState(false)
  const [newAction, setNewAction] = useState({ title: '', description: '', due_date: '', category: 'general', visible_to_partner: false })
  const [savingAction, setSavingAction] = useState(false)
  const [expandedActionId, setExpandedActionId] = useState<string | null>(null)
  const [editingActionField, setEditingActionField] = useState<{ id: string; field: string } | null>(null)
  const [editingActionValue, setEditingActionValue] = useState('')
  const [showCompletedActions, setShowCompletedActions] = useState(false)
  const [deletingActionId, setDeletingActionId] = useState<string | null>(null)

  const statusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle2 size={16} style={{ color: '#10B981' }} />
    if (status === 'in_progress') return <Clock size={16} style={{ color: '#EAB308' }} />
    return <Circle size={16} style={{ color: '#9CA3AF' }} />
  }

  const nextStatus = (s: string) => s === 'pending' ? 'in_progress' : s === 'in_progress' ? 'completed' : 'pending'

  const updateActionItem = async (id: string, fields: Record<string, any>) => {
    try {
      const res = await fetch(`/api/tdi-admin/leadership/${partnershipId}/action-items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...fields }),
      })
      if (res.ok) {
        onActionItemsChange(actionItems.map(a => a.id === id ? { ...a, ...fields } : a))
      }
    } catch { showToast('Failed to update', 'error') }
  }

  const deleteActionItem = async (id: string) => {
    try {
      const res = await fetch(`/api/tdi-admin/leadership/${partnershipId}/action-items`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        onActionItemsChange(actionItems.filter(a => a.id !== id))
        setDeletingActionId(null)
      }
    } catch { showToast('Failed to delete', 'error') }
  }

  const inProgress = actionItems.filter(a => a.status === 'in_progress')
  const pending = actionItems.filter(a => a.status === 'pending')
  const completed = actionItems.filter(a => a.status === 'completed')

  const renderItem = (item: any) => {
    const isOverdue = item.status !== 'completed' && item.due_date && new Date(item.due_date) < new Date()
    return (
      <div key={item.id} className="group flex items-start gap-2 py-1.5 px-1 rounded-lg hover:bg-gray-50 transition" style={{ borderBottom: '1px solid #F9FAFB' }}>
        <button
          onClick={() => updateActionItem(item.id, { status: nextStatus(item.status) })}
          className="mt-0.5 flex-shrink-0 hover:opacity-70"
        >
          {statusIcon(item.status)}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            {editingActionField?.id === item.id && editingActionField?.field === 'title' ? (
              <input
                autoFocus
                className="text-xs font-medium bg-white border border-blue-300 rounded px-1 py-0.5 flex-1"
                value={editingActionValue}
                onChange={e => setEditingActionValue(e.target.value)}
                onBlur={() => {
                  if (editingActionValue.trim() && editingActionValue !== item.title) {
                    updateActionItem(item.id, { title: editingActionValue })
                  }
                  setEditingActionField(null)
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') { (e.target as HTMLInputElement).blur() }
                  if (e.key === 'Escape') { setEditingActionField(null) }
                }}
              />
            ) : (
              <span
                className="text-xs font-medium text-gray-900 cursor-pointer hover:text-blue-600 truncate"
                style={item.status === 'completed' ? { textDecoration: 'line-through', color: '#9CA3AF' } : isOverdue ? { color: '#DC2626' } : {}}
                onClick={() => { setEditingActionField({ id: item.id, field: 'title' }); setEditingActionValue(item.title) }}
              >
                {item.title}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {editingActionField?.id === item.id && editingActionField?.field === 'due_date' ? (
              <input
                autoFocus
                type="date"
                className="text-[10px] bg-white border border-blue-300 rounded px-1 py-0.5"
                value={editingActionValue}
                onChange={e => setEditingActionValue(e.target.value)}
                onBlur={() => {
                  updateActionItem(item.id, { due_date: editingActionValue || null })
                  setEditingActionField(null)
                }}
              />
            ) : (
              <span
                className="text-[10px] cursor-pointer hover:text-blue-500"
                style={{ color: isOverdue ? '#DC2626' : '#9CA3AF' }}
                onClick={() => { setEditingActionField({ id: item.id, field: 'due_date' }); setEditingActionValue(item.due_date || '') }}
              >
                {item.due_date ? new Date(item.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date'}
              </span>
            )}
            <span
              className="text-[9px] font-medium px-1 py-0.5 rounded-full"
              style={{ background: (CATEGORY_COLORS[item.category] || '#6B7280') + '18', color: CATEGORY_COLORS[item.category] || '#6B7280' }}
            >
              {(item.category || 'general').replace('_', '-')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
          <button
            onClick={() => updateActionItem(item.id, { visible_to_partner: !item.visible_to_partner })}
            className="p-0.5 rounded hover:bg-gray-100"
          >
            {item.visible_to_partner ? <Eye size={12} style={{ color: '#3B82F6' }} /> : <EyeOff size={12} style={{ color: '#D1D5DB' }} />}
          </button>
          {deletingActionId === item.id ? (
            <div className="flex items-center gap-0.5">
              <button onClick={() => deleteActionItem(item.id)} className="text-[9px] text-red-600 font-medium px-1 py-0.5 rounded bg-red-50 hover:bg-red-100">Delete</button>
              <button onClick={() => setDeletingActionId(null)} className="text-[9px] text-gray-500 px-1 py-0.5">No</button>
            </div>
          ) : (
            <button
              onClick={() => setDeletingActionId(item.id)}
              className="p-0.5 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100 transition"
            >
              <Trash2 size={11} style={{ color: '#EF4444' }} />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div id="sidebar-action-items" className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target size={14} style={{ color: '#1e2749' }} />
          <h3 className="text-sm font-bold text-gray-900">Action Items</h3>
          {actionItems.length > 0 && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{actionItems.filter(a => a.status !== 'completed').length} open</span>
          )}
        </div>
        <button
          onClick={() => setShowAddAction(!showAddAction)}
          className="text-gray-400 hover:text-gray-600"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Add action form */}
      {showAddAction && (
        <div className="border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Title"
              value={newAction.title}
              onChange={e => setNewAction({ ...newAction, title: e.target.value })}
              className="w-full text-xs border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <textarea
              placeholder="Description (optional)"
              value={newAction.description}
              onChange={e => setNewAction({ ...newAction, description: e.target.value })}
              className="w-full text-xs border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
              rows={2}
            />
            <div className="flex gap-2 items-center flex-wrap">
              <input
                type="date"
                value={newAction.due_date}
                onChange={e => setNewAction({ ...newAction, due_date: e.target.value })}
                className="text-[10px] border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <select
                value={newAction.category}
                onChange={e => setNewAction({ ...newAction, category: e.target.value })}
                className="text-[10px] border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="general">General</option>
                <option value="onboarding">Onboarding</option>
                <option value="hub">Hub</option>
                <option value="coaching">Coaching</option>
                <option value="billing">Billing</option>
                <option value="follow_up">Follow-up</option>
              </select>
              <label className="flex items-center gap-1 text-[10px] text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAction.visible_to_partner}
                  onChange={e => setNewAction({ ...newAction, visible_to_partner: e.target.checked })}
                  className="rounded border-gray-300"
                />
                Visible
              </label>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => { setShowAddAction(false); setNewAction({ title: '', description: '', due_date: '', category: 'general', visible_to_partner: false }) }}
                className="text-[10px] px-2.5 py-1.5 rounded-md text-gray-500 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                disabled={!newAction.title.trim() || savingAction}
                onClick={async () => {
                  setSavingAction(true)
                  try {
                    const res = await fetch(`/api/tdi-admin/leadership/${partnershipId}/action-items`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(newAction),
                    })
                    if (res.ok) {
                      const data = await res.json()
                      onActionItemsChange([data.item || data, ...actionItems])
                      setNewAction({ title: '', description: '', due_date: '', category: 'general', visible_to_partner: false })
                      setShowAddAction(false)
                    }
                  } catch { showToast('Failed to create action item', 'error') }
                  setSavingAction(false)
                }}
                className="text-[10px] px-2.5 py-1.5 rounded-md text-white font-medium disabled:opacity-40"
                style={{ background: '#1e2749' }}
              >
                {savingAction ? 'Saving...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action items list */}
      {actionItems.length === 0 && !showAddAction && (
        <p className="text-[10px] text-gray-400 text-center py-3">No action items yet.</p>
      )}

      <div>
        {inProgress.length > 0 && (
          <div className="mb-1">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5 px-1">In Progress</p>
            {inProgress.map(renderItem)}
          </div>
        )}
        {pending.length > 0 && (
          <div className="mb-1">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5 px-1">Pending</p>
            {pending.map(renderItem)}
          </div>
        )}
        {completed.length > 0 && (
          <div className="mt-1">
            <button
              onClick={() => setShowCompletedActions(!showCompletedActions)}
              className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5 px-1 hover:text-gray-600"
            >
              <ChevronDown size={10} style={{ transform: showCompletedActions ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
              Completed ({completed.length})
            </button>
            {showCompletedActions && completed.map(renderItem)}
          </div>
        )}
      </div>
    </div>
  )
}
