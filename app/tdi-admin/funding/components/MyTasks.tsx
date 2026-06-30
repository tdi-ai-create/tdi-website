'use client'

import { useEffect, useState } from 'react'

interface Task {
  id: string
  title: string
  description: string | null
  owner_type: 'tdi' | 'client'
  owner_name: string | null
  owner_email: string | null
  status: string
  due_date: string | null
  category: string | null
  nudge_count: number
  prepared_materials: string | null
  is_overdue: boolean
  days_until_due: number | null
  pursuit: { id: string; pursuit_name: string; district_name: string; client_contact_name: string | null; client_contact_email: string | null } | null
  opportunity: { id: string; name: string; status: string; waiting_on: string | null } | null
}

export function MyTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [summary, setSummary] = useState({ total: 0, overdue: 0, due_this_week: 0, waiting_on_client: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'overdue' | 'client' | 'tdi'>('all')
  const [nudging, setNudging] = useState<string | null>(null)
  const [completing, setCompleting] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  const loadTasks = () => {
    fetch('/api/funding/tasks?status=open')
      .then(r => r.json())
      .then(d => {
        setTasks(d.tasks || [])
        setSummary(d.summary || { total: 0, overdue: 0, due_this_week: 0, waiting_on_client: 0 })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadTasks() }, [])

  const filtered = tasks.filter(t => {
    if (filter === 'overdue') return t.is_overdue
    if (filter === 'client') return t.owner_type === 'client'
    if (filter === 'tdi') return t.owner_type === 'tdi'
    return true
  })

  const markDone = async (taskId: string, pursuitId: string) => {
    setCompleting(taskId)
    try {
      await fetch(`/api/funding/pursuits/${pursuitId}/actions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId: taskId, markDone: true }),
      })
      loadTasks()
    } catch {} finally { setCompleting(null) }
  }

  const nudge = async (taskId: string) => {
    setNudging(taskId)
    try {
      const res = await fetch('/api/funding/nudge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId: taskId, sendImmediately: true }),
      })
      const result = await res.json()
      if (result.success) {
        loadTasks()
      } else {
        console.error('Nudge failed:', result.error)
      }
    } catch {} finally { setNudging(null) }
  }

  if (loading) return null
  if (tasks.length === 0) return null

  const filterButtons = [
    { key: 'all', label: `All (${summary.total})` },
    { key: 'overdue', label: `Overdue (${summary.overdue})`, color: '#DC2626' },
    { key: 'client', label: `Client (${summary.waiting_on_client})`, color: '#C2410C' },
    { key: 'tdi', label: 'TDI', color: '#6D28D9' },
  ] as const

  return (
    <div style={{
      background: 'white', border: '1px solid #E5E7EB', borderRadius: 14,
      marginBottom: 24, overflow: 'hidden',
    }}>
      {/* Header */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          padding: '16px 20px', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: collapsed ? 'none' : '1px solid #E5E7EB',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: summary.overdue > 0 ? '#DC2626' : '#10B981',
          }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0a0f1e' }}>
            Action Items
          </span>
          <span style={{ fontSize: 12, color: '#6B7280' }}>
            {summary.total} open{summary.overdue > 0 ? ` / ${summary.overdue} overdue` : ''}
          </span>
        </div>
        <span style={{ fontSize: 18, color: '#9CA3AF', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0)', transition: 'transform 0.15s' }}>
          v
        </span>
      </div>

      {!collapsed && (
        <>
          {/* Filter tabs */}
          <div style={{ padding: '8px 20px', display: 'flex', gap: 6, borderBottom: '1px solid #F3F4F6' }}>
            {filterButtons.map(fb => (
              <button
                key={fb.key}
                onClick={() => setFilter(fb.key)}
                style={{
                  fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                  border: filter === fb.key ? '1px solid #8B5CF6' : '1px solid #E5E7EB',
                  background: filter === fb.key ? '#F5F3FF' : 'white',
                  color: filter === fb.key ? '#6D28D9' : '#6B7280',
                  cursor: 'pointer',
                }}
              >
                {fb.label}
              </button>
            ))}
          </div>

          {/* Task list */}
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#9CA3AF', fontSize: 12 }}>
                No tasks match this filter.
              </div>
            ) : (
              filtered.map(task => {
                const isOverdue = task.is_overdue
                const daysText = task.days_until_due !== null
                  ? task.days_until_due === 0 ? 'today'
                  : task.days_until_due < 0 ? `${Math.abs(task.days_until_due)}d overdue`
                  : `${task.days_until_due}d`
                  : null

                return (
                  <div key={task.id} style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid #F3F4F6',
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                    background: isOverdue ? '#FFFBEB' : 'transparent',
                  }}>
                    {/* Checkbox */}
                    <button
                      onClick={() => task.pursuit && markDone(task.id, task.pursuit.id)}
                      disabled={completing === task.id}
                      style={{
                        width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 2,
                        border: '2px solid #D1D5DB', background: 'white',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, color: '#6B7280',
                      }}
                    >
                      {completing === task.id ? '..' : ''}
                    </button>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Owner type badge */}
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
                          textTransform: 'uppercase', letterSpacing: 0.5,
                          background: task.owner_type === 'client' ? '#FFF7ED' : '#F5F3FF',
                          color: task.owner_type === 'client' ? '#C2410C' : '#6D28D9',
                        }}>
                          {task.owner_type}
                        </span>
                        {/* Title */}
                        <span style={{
                          fontSize: 13, fontWeight: 600,
                          color: isOverdue ? '#DC2626' : '#0a0f1e',
                        }}>
                          {task.title}
                        </span>
                      </div>

                      {/* Pursuit name */}
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                        {task.pursuit?.pursuit_name || task.pursuit?.district_name || ''}
                        {task.opportunity ? ` / ${task.opportunity.name}` : ''}
                      </div>

                      {/* Prepared materials for client tasks */}
                      {task.owner_type === 'client' && task.prepared_materials && (
                        <div style={{ fontSize: 10, color: '#9CA3AF', fontStyle: 'italic', marginTop: 3 }}>
                          TDI prepared: {task.prepared_materials.length > 100 ? task.prepared_materials.slice(0, 97) + '...' : task.prepared_materials}
                        </div>
                      )}
                    </div>

                    {/* Right side: due date + actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {/* Due date */}
                      {daysText && (
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                          background: isOverdue ? '#FEF2F2'
                            : task.days_until_due !== null && task.days_until_due <= 3 ? '#FEF2F2'
                            : task.days_until_due !== null && task.days_until_due <= 7 ? '#FFFBEB'
                            : '#F3F4F6',
                          color: isOverdue ? '#DC2626'
                            : task.days_until_due !== null && task.days_until_due <= 3 ? '#DC2626'
                            : task.days_until_due !== null && task.days_until_due <= 7 ? '#D97706'
                            : '#6B7280',
                        }}>
                          {daysText}
                        </span>
                      )}

                      {/* Nudge count */}
                      {task.owner_type === 'client' && task.nudge_count > 0 && (
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                          background: '#FFF7ED', color: '#C2410C',
                        }}>
                          {task.nudge_count}x
                        </span>
                      )}

                      {/* Nudge button for client tasks */}
                      {task.owner_type === 'client' && task.pursuit?.client_contact_email && (
                        <button
                          onClick={(e) => { e.stopPropagation(); nudge(task.id) }}
                          disabled={nudging === task.id}
                          style={{
                            fontSize: 10, fontWeight: 600, padding: '4px 8px', borderRadius: 6,
                            border: '1px solid #E5E7EB', background: nudging === task.id ? '#F3F4F6' : 'white',
                            color: '#6B7280', cursor: 'pointer',
                          }}
                        >
                          {nudging === task.id ? 'Sending...' : 'Nudge'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}
    </div>
  )
}
