'use client'
import { CheckCircle, Clock, Calendar } from 'lucide-react'
import { ExampleBanner } from './ExampleBanner'

interface TimelineEvent {
  id:          string
  event_title: string
  event_date?: string
  event_type:  string
  status:      'completed' | 'in_progress' | 'upcoming'
  notes?:      string
}

interface PartnershipTimelineProps {
  events:      TimelineEvent[]
  isAdminView?: boolean
  onAddEvent?:  () => void
  onEditEvent?: (event: TimelineEvent) => void
  onDeleteEvent?: (id: string) => void
  onMoveEvent?: (id: string, newStatus: string) => void
}

const COLUMN_CONFIG = {
  completed:   { label: 'Done',         icon: CheckCircle, color: '#16A34A', bg: '#DCFCE7' },
  in_progress: { label: 'In Progress',  icon: Clock,       color: '#D97706', bg: '#FEF3C7' },
  upcoming:    { label: 'Coming Soon',  icon: Calendar,    color: '#2563EB', bg: '#EFF6FF' },
}

function EventRow({
  event, color, isAdminView, onEdit, onDelete, onMove
}: {
  event: TimelineEvent
  color: string
  isAdminView?: boolean
  onEdit?: (e: TimelineEvent) => void
  onDelete?: (id: string) => void
  onMove?: (id: string, status: string) => void
}) {
  return (
    <div className="flex items-start gap-2 mb-3 group">
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: color }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 leading-snug">{event.event_title}</p>
        {event.event_date && (
          <p className="text-xs text-gray-400 mt-0.5">{event.event_date}</p>
        )}
      </div>
      {isAdminView && (
        <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
          {onEdit && (
            <button onClick={() => onEdit(event)}
              className="text-xs text-violet-500 hover:text-violet-700 px-1">✎</button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(event.id)}
              className="text-xs text-red-400 hover:text-red-600 px-1">✕</button>
          )}
        </div>
      )}
    </div>
  )
}

export function PartnershipTimeline({
  events, isAdminView = false, onAddEvent, onEditEvent, onDeleteEvent, onMoveEvent
}: PartnershipTimelineProps) {
  const completedEvents   = events.filter(e => e.status === 'completed')
  const inProgressEvents  = events.filter(e => e.status === 'in_progress')
  const upcomingEvents    = events.filter(e => e.status === 'upcoming')

  const hasNoRealEvents = events.length <= 3 // only defaults

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Partnership Timeline</h2>
        {isAdminView && onAddEvent && (
          <button onClick={onAddEvent}
            className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800">
            + Add Event
          </button>
        )}
      </div>

      {hasNoRealEvents && (
        <ExampleBanner message="Your timeline will fill in as we deliver sessions and reach milestones together." />
      )}

      <div className="grid grid-cols-3 gap-6">
        {(['completed', 'in_progress', 'upcoming'] as const).map(status => {
          const config  = COLUMN_CONFIG[status]
          const colEvents = status === 'completed' ? completedEvents
            : status === 'in_progress' ? inProgressEvents : upcomingEvents
          const Icon = config.icon

          return (
            <div key={status}>
              <div className="flex items-center gap-2 mb-4">
                <Icon size={15} style={{ color: config.color }} />
                <span className="text-sm font-bold" style={{ color: config.color }}>
                  {config.label}
                </span>
                <span className="text-xs ml-auto" style={{ color: config.color }}>
                  {colEvents.length} {status === 'completed' ? 'completed' : status === 'in_progress' ? 'active' : 'ahead'}
                </span>
              </div>
              {colEvents.map(event => (
                <EventRow
                  key={event.id}
                  event={event}
                  color={config.color}
                  isAdminView={isAdminView}
                  onEdit={onEditEvent}
                  onDelete={onDeleteEvent}
                  onMove={onMoveEvent}
                />
              ))}
              {colEvents.length === 0 && (
                <p className="text-xs text-gray-300 italic">Nothing here yet</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
