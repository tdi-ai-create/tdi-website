'use client'

import type { OppActivity } from '../OpportunityDetailPanel'

const ACTIVITY_ICONS: Record<string, string> = {
  stage_changed: '🔄',
  value_changed: '💰',
  note_added: '📝',
  assigned_to_email_changed: '👤',
  heat_changed: '🌡️',
}

interface Props {
  activity: OppActivity[]
}

export function ActivityTab({ activity }: Props) {
  if (activity.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">
        No activity yet. Stage changes, value edits, and notes will appear here.
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      {activity.map(a => (
        <div key={a.id} className="flex items-start gap-3 text-sm">
          <span className="text-base mt-0.5 shrink-0">
            {ACTIVITY_ICONS[a.activity_type] ?? '•'}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-gray-700">{a.description ?? a.activity_type}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {a.actor_email.split('@')[0]}
              {' · '}
              {new Date(a.created_at).toLocaleString('en-US', {
                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
