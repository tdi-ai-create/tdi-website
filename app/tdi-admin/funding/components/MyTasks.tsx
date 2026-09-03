'use client'

import { useEffect, useState } from 'react'

interface Task {
  id: string
  title: string
  client_label: string | null
  description: string | null
  owner_type: 'tdi' | 'client'
  owner_name: string | null
  owner_email: string | null
  status: string
  due_date: string | null
  category: string | null
  nudge_count: number
  color_state: 'green' | 'yellow' | 'red' | null
  escalation_rung: string | null
  prepared_materials: string | null
  requires_answer: boolean | null
  is_overdue: boolean
  days_until_due: number | null
  pursuit: { id: string; pursuit_name: string; district_name: string; client_contact_name: string | null; client_contact_email: string | null } | null
  opportunity: { id: string; name: string; status: string; waiting_on: string | null } | null
}

/**
 * What the server said when it refused to close an item.
 *
 * The refusal is not an error state, it is the system asking a question. Ten of
 * the seventeen open items are questions that cannot close without an answer,
 * so this path is the common one, not the exception.
 */
interface BlockedClose {
  message: string
  field: 'answer' | 'outcome'
  label: string
  options?: string[]
  override?: { field: string; label: string; note: string }
}

interface AnswerDraft {
  answer: string
  outcome: string
  closeWithoutAnswer: string
  showOverride: boolean
}

const OUTCOME_LABELS: Record<string, { label: string; hint: string }> = {
  proceed: { label: 'We can carry on', hint: 'The answer unblocks the work' },
  stop_path: { label: 'This path is closed', hint: 'Not viable, stop pursuing it' },
  still_blocked: { label: 'Still stuck', hint: 'They answered, but it does not unblock us' },
}

const COLOR_DOT: Record<string, string> = {
  green: '#10B981',
  yellow: '#F59E0B',
  red: '#DC2626',
}

const COLOR_DOT_TOOLTIPS: Record<string, string> = {
  green: 'On track — no action needed',
  yellow: 'Approaching deadline — act soon',
  red: 'Overdue or blocked — needs immediate attention',
}

const RUNG_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  submitter: { label: 'Submitter', bg: '#FEF3C7', color: '#92400E' },
  backup: { label: 'Backup', bg: '#FEE2E2', color: '#991B1B' },
  admin_sponsor: { label: 'Admin Sponsor', bg: '#FEE2E2', color: '#991B1B' },
  rae: { label: 'Rae', bg: '#FEE2E2', color: '#991B1B' },
}

export function MyTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [summary, setSummary] = useState({ total: 0, overdue: 0, due_this_week: 0, waiting_on_client: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'overdue' | 'client' | 'tdi'>('all')
  const [nudging, setNudging] = useState<string | null>(null)
  const [completing, setCompleting] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  // Which task is expanded, and any answer the server is holding out for.
  const [openTask, setOpenTask] = useState<string | null>(null)
  const [blocked, setBlocked] = useState<Record<string, BlockedClose>>({})
  const [answerDraft, setAnswerDraft] = useState<Record<string, AnswerDraft>>({})
  const [justDone, setJustDone] = useState<{ id: string; title: string } | null>(null)

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

  /**
   * Close an item, and show what the server says when it will not.
   *
   * This used to fire the request, ignore the reply and reload. The route
   * refuses to close a question without an answer and returns a sentence
   * written for the person clicking, and all of that went in the bin. The
   * item then reappeared unchanged, which read as "the tick does nothing".
   * Ten of seventeen open items are questions, so that was the usual outcome
   * rather than an edge case.
   */
  const markDone = async (taskId: string, pursuitId: string, extra?: Record<string, unknown>) => {
    setCompleting(taskId)
    try {
      const res = await fetch(`/api/funding/pursuits/${pursuitId}/actions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId: taskId, markDone: true, ...(extra || {}) }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setBlocked(b => ({
          ...b,
          [taskId]: {
            message: data.error || 'This could not be closed, and the reason did not come through.',
            field: data.requires?.field === 'outcome' ? 'outcome' : 'answer',
            label: data.requires?.label || 'What did they say?',
            options: data.requires?.options,
            override: data.override,
          },
        }))
        setOpenTask(taskId)
        return
      }

      // Closed for real. Say so, because the row is about to vanish and a row
      // disappearing on its own is indistinguishable from a page refresh.
      const closed = tasks.find(t => t.id === taskId)
      setJustDone({ id: taskId, title: closed?.client_label || closed?.title || 'Task' })
      setTimeout(() => setJustDone(cur => (cur?.id === taskId ? null : cur)), 6000)

      setBlocked(b => { const n = { ...b }; delete n[taskId]; return n })
      setAnswerDraft(d => { const n = { ...d }; delete n[taskId]; return n })
      setOpenTask(cur => (cur === taskId ? null : cur))
      loadTasks()
    } catch {
      setBlocked(b => ({
        ...b,
        [taskId]: {
          message: 'Could not reach the server. Nothing was changed, so try again.',
          field: 'answer',
          label: 'What did they say?',
        },
      }))
      setOpenTask(taskId)
    } finally { setCompleting(null) }
  }

  const draftFor = (id: string): AnswerDraft =>
    answerDraft[id] || { answer: '', outcome: '', closeWithoutAnswer: '', showOverride: false }

  const setDraftFor = (id: string, patch: Partial<AnswerDraft>) =>
    setAnswerDraft(d => ({ ...d, [id]: { ...draftFor(id), ...patch } }))

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
          <span style={{ fontSize: 16, fontWeight: 700, color: '#0a0f1e' }}>
            Action Items
          </span>
          <span style={{ fontSize: 13, color: '#6B7280' }}>
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

          {/* A closed item leaves the list, and a row vanishing on its own is
              indistinguishable from a refresh. Say what happened to it. */}
          {justDone && (
            <div style={{
              padding: '10px 20px', background: '#ECFDF5', borderBottom: '1px solid #A7F3D0',
              fontSize: 12, color: '#065F46', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
              <span><strong>{justDone.title}</strong> is closed and has moved out of this list.</span>
            </div>
          )}

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
                  <div key={task.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <div style={{
                    padding: '12px 20px',
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                    background: blocked[task.id] ? '#FEF2F2' : isOverdue ? '#FFFBEB' : 'transparent',
                  }}>
                    {/* Color state dot */}
                    {task.color_state && (
                      <div
                        title={COLOR_DOT_TOOLTIPS[task.color_state] || `Follow-up: ${task.color_state}`}
                        style={{
                          width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 7,
                          background: COLOR_DOT[task.color_state] || '#D1D5DB',
                        }}
                      />
                    )}

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
                          fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4,
                          textTransform: 'uppercase', letterSpacing: 0.5,
                          background: task.owner_type === 'client' ? '#FFF7ED' : '#F5F3FF',
                          color: task.owner_type === 'client' ? '#C2410C' : '#6D28D9',
                        }}>
                          {task.owner_type === 'client' ? 'School' : 'TDI'}
                        </span>
                        {/* Title. Opens the detail rather than being inert text,
                            because "what do I actually do here" was the question. */}
                        <button
                          onClick={() => setOpenTask(cur => (cur === task.id ? null : task.id))}
                          style={{
                            fontSize: 14, fontWeight: 600, textAlign: 'left',
                            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 5,
                            color: task.color_state === 'red' ? '#DC2626' : task.color_state === 'yellow' ? '#92400E' : isOverdue ? '#DC2626' : '#0a0f1e',
                          }}
                        >
                          <span style={{
                            fontSize: 9, color: '#9CA3AF', transition: 'transform .12s',
                            transform: openTask === task.id ? 'rotate(90deg)' : 'none',
                          }}>&#9654;</span>
                          {task.client_label || task.title}
                        </button>
                        {task.requires_answer && (
                          <span
                            title="This is a question. Closing it needs what you were told."
                            style={{
                              fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                              background: '#EFF6FF', color: '#1D4ED8', letterSpacing: 0.4,
                            }}
                          >QUESTION</span>
                        )}
                      </div>

                      {/* Pursuit name */}
                      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>
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

                      {/* Escalation rung badge */}
                      {task.escalation_rung && task.escalation_rung !== 'none' && (() => {
                        const rs = RUNG_BADGE[task.escalation_rung]
                        return rs ? (
                          <span style={{
                            fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                            background: rs.bg, color: rs.color,
                          }}>
                            Escalated: {rs.label}
                          </span>
                        ) : null
                      })()}

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

                  {/* Detail. What this is, what TDI already did, and what closing it needs. */}
                  {openTask === task.id && (
                    <div style={{ padding: '0 20px 16px 56px', background: blocked[task.id] ? '#FEF2F2' : '#FAFAFA' }}>
                      {task.description && (
                        <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.55, marginBottom: 10 }}>
                          {task.description}
                        </div>
                      )}

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12, color: '#6B7280', marginBottom: 12 }}>
                        <span><strong style={{ color: '#374151' }}>Owner</strong> {task.owner_name || (task.owner_type === 'client' ? 'The school' : 'TDI')}</span>
                        {task.owner_email && <span><strong style={{ color: '#374151' }}>Contact</strong> {task.owner_email}</span>}
                        {task.due_date && <span><strong style={{ color: '#374151' }}>Due</strong> {task.due_date}</span>}
                        {task.category && <span><strong style={{ color: '#374151' }}>Category</strong> {task.category}</span>}
                      </div>

                      {task.prepared_materials && (
                        <div style={{
                          fontSize: 12, color: '#374151', background: 'white', padding: '10px 12px',
                          borderRadius: 8, border: '1px solid #E5E7EB', marginBottom: 12,
                        }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', letterSpacing: 0.5, marginBottom: 4 }}>
                            WHAT TDI HAS ALREADY PREPARED
                          </div>
                          {task.prepared_materials}
                        </div>
                      )}

                      {/* The refusal, shown where it happened. */}
                      {blocked[task.id] && (
                        <div style={{
                          background: 'white', border: '1px solid #FCA5A5', borderRadius: 8,
                          padding: 14, marginBottom: 4,
                        }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#991B1B', marginBottom: 10 }}>
                            {blocked[task.id].message}
                          </div>

                          <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>
                            {blocked[task.id].field === 'outcome' ? 'What does this mean for the work?' : blocked[task.id].label}
                          </label>

                          {blocked[task.id].field === 'answer' && (
                            <textarea
                              value={draftFor(task.id).answer}
                              onChange={e => setDraftFor(task.id, { answer: e.target.value })}
                              placeholder="What were you told?"
                              rows={2}
                              style={{
                                width: '100%', fontSize: 13, padding: '8px 10px', borderRadius: 6,
                                border: '1px solid #D1D5DB', fontFamily: 'inherit', resize: 'vertical',
                                marginBottom: 10,
                              }}
                            />
                          )}

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                            {(blocked[task.id].options || ['proceed', 'stop_path', 'still_blocked']).map(opt => {
                              const meta = OUTCOME_LABELS[opt] || { label: opt, hint: '' }
                              const picked = draftFor(task.id).outcome === opt
                              return (
                                <button
                                  key={opt}
                                  onClick={() => setDraftFor(task.id, { outcome: opt })}
                                  title={meta.hint}
                                  style={{
                                    fontSize: 12, fontWeight: 600, padding: '6px 10px', borderRadius: 6,
                                    border: picked ? '1px solid #1D4ED8' : '1px solid #D1D5DB',
                                    background: picked ? '#EFF6FF' : 'white',
                                    color: picked ? '#1D4ED8' : '#374151', cursor: 'pointer',
                                  }}
                                >{meta.label}</button>
                              )
                            })}
                          </div>

                          <button
                            onClick={() => task.pursuit && markDone(task.id, task.pursuit.id, {
                              answer: draftFor(task.id).answer,
                              outcome: draftFor(task.id).outcome,
                            })}
                            disabled={completing === task.id || !draftFor(task.id).answer.trim() || !draftFor(task.id).outcome}
                            style={{
                              fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 6,
                              border: 'none', color: 'white', marginRight: 10,
                              background: (!draftFor(task.id).answer.trim() || !draftFor(task.id).outcome) ? '#D1D5DB' : '#059669',
                              cursor: (!draftFor(task.id).answer.trim() || !draftFor(task.id).outcome) ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {completing === task.id ? 'Closing...' : 'Record it and close'}
                          </button>

                          {/* The way out, when an answer is never coming. */}
                          {blocked[task.id].override && !draftFor(task.id).showOverride && (
                            <button
                              onClick={() => setDraftFor(task.id, { showOverride: true })}
                              style={{
                                fontSize: 12, background: 'none', border: 'none', color: '#6B7280',
                                textDecoration: 'underline', cursor: 'pointer', padding: 0,
                              }}
                            >{blocked[task.id].override!.label}</button>
                          )}

                          {draftFor(task.id).showOverride && (
                            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #F3F4F6' }}>
                              <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 6 }}>
                                {blocked[task.id].override?.note}
                              </div>
                              <input
                                value={draftFor(task.id).closeWithoutAnswer}
                                onChange={e => setDraftFor(task.id, { closeWithoutAnswer: e.target.value })}
                                placeholder="Why is no answer coming?"
                                style={{
                                  width: '100%', fontSize: 13, padding: '8px 10px', borderRadius: 6,
                                  border: '1px solid #D1D5DB', marginBottom: 8,
                                }}
                              />
                              <button
                                onClick={() => task.pursuit && markDone(task.id, task.pursuit.id, {
                                  closeWithoutAnswer: draftFor(task.id).closeWithoutAnswer,
                                })}
                                disabled={completing === task.id || !draftFor(task.id).closeWithoutAnswer.trim()}
                                style={{
                                  fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 6,
                                  border: '1px solid #D1D5DB', background: 'white', color: '#374151',
                                  cursor: draftFor(task.id).closeWithoutAnswer.trim() ? 'pointer' : 'not-allowed',
                                }}
                              >Close without an answer</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
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
