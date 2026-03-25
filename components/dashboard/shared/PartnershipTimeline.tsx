'use client'
import { useState, useRef } from 'react'
import { CheckCircle, Clock, Calendar, GripVertical, Plus, Trash2 } from 'lucide-react'
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
  events:         TimelineEvent[]
  isAdminView?:   boolean
  onAddEvent?:    () => void
  onEditEvent?:   (event: TimelineEvent) => void
  onDeleteEvent?: (id: string) => void
  onMoveEvent?:   (id: string, newStatus: string) => void
}

const COLUMN_CONFIG = {
  completed:   { label: 'Done',        icon: CheckCircle, color: '#16A34A', bg: '#DCFCE7', count_bg: '#BBF7D0' },
  in_progress: { label: 'In Progress', icon: Clock,       color: '#D97706', bg: '#FEF3C7', count_bg: '#FDE68A' },
  upcoming:    { label: 'Coming Soon', icon: Calendar,    color: '#2563EB', bg: '#EFF6FF', count_bg: '#BFDBFE' },
}

const STATUS_ORDER = ['completed', 'in_progress', 'upcoming'] as const
type StatusKey = typeof STATUS_ORDER[number]

function EventCard({
  event,
  color,
  isAdminView,
  onDelete,
  onMove,
  onDragStart,
}: {
  event: TimelineEvent
  color: string
  isAdminView: boolean
  onDelete?: (id: string) => void
  onMove?: (id: string, newStatus: string) => void
  onDragStart?: (e: React.DragEvent, eventId: string) => void
}) {
  const otherStatuses = STATUS_ORDER.filter(s => s !== event.status)

  const STATUS_LABELS: Record<string, string> = {
    completed:   'Done',
    in_progress: 'In Progress',
    upcoming:    'Coming Soon',
  }

  return (
    <div
      draggable={isAdminView}
      onDragStart={isAdminView && onDragStart ? (e) => onDragStart(e, event.id) : undefined}
      className={`group flex items-start gap-2 p-2.5 rounded-lg mb-2 border border-transparent transition-all ${
        isAdminView
          ? 'cursor-grab hover:border-gray-200 hover:bg-gray-50 active:cursor-grabbing active:opacity-60'
          : ''
      }`}
    >
      {/* Drag handle - admin only */}
      {isAdminView && (
        <div className="flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-40 transition-opacity">
          <GripVertical size={14} className="text-gray-400" />
        </div>
      )}

      {/* Dot */}
      <div
        className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
        style={{ background: color }}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 leading-snug">{event.event_title}</p>
        {event.event_date && (
          <p className="text-xs text-gray-400 mt-0.5">{event.event_date}</p>
        )}
      </div>

      {/* Admin action buttons - visible on hover */}
      {isAdminView && (
        <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Move to dropdown */}
          {onMove && (
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) onMove(event.id, e.target.value)
              }}
              onClick={(e) => e.stopPropagation()}
              className="text-xs border border-gray-200 rounded px-1 py-0.5 text-gray-500 bg-white cursor-pointer"
              title="Move to column"
            >
              <option value="" disabled>Move to...</option>
              {otherStatuses.map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          )}
          {/* Delete */}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(event.id) }}
              className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
              title="Delete event"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function DropZone({
  status,
  isOver,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
}: {
  status: StatusKey
  isOver: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent, status: StatusKey) => void
  children: React.ReactNode
}) {
  const cfg = COLUMN_CONFIG[status]
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, status)}
      className="min-h-[80px] rounded-lg transition-all duration-150 p-2 -m-2"
      style={isOver ? { background: cfg.bg, outline: `2px dashed ${cfg.color}` } : {}}
    >
      {children}
      {isOver && (
        <div
          className="text-xs font-medium text-center py-2 rounded mt-1"
          style={{ color: cfg.color }}
        >
          Drop here to move to {cfg.label}
        </div>
      )}
    </div>
  )
}

export function PartnershipTimeline({
  events,
  isAdminView = false,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  onMoveEvent,
}: PartnershipTimelineProps) {
  const [dragOverColumn, setDragOverColumn] = useState<StatusKey | null>(null)
  const dragEventId = useRef<string | null>(null)

  const completedEvents  = events.filter(e => e.status === 'completed')
  const inProgressEvents = events.filter(e => e.status === 'in_progress')
  const upcomingEvents   = events.filter(e => e.status === 'upcoming')

  const eventsByStatus: Record<StatusKey, TimelineEvent[]> = {
    completed:   completedEvents,
    in_progress: inProgressEvents,
    upcoming:    upcomingEvents,
  }

  const hasNoRealEvents = events.length === 0

  function handleDragStart(e: React.DragEvent, eventId: string) {
    dragEventId.current = eventId
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent, status: StatusKey) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(status)
  }

  function handleDragLeave() {
    setDragOverColumn(null)
  }

  function handleDrop(e: React.DragEvent, targetStatus: StatusKey) {
    e.preventDefault()
    setDragOverColumn(null)
    if (!dragEventId.current || !onMoveEvent) return
    const event = events.find(ev => ev.id === dragEventId.current)
    if (event && event.status !== targetStatus) {
      onMoveEvent(dragEventId.current, targetStatus)
    }
    dragEventId.current = null
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Partnership Timeline</h2>
        {isAdminView && onAddEvent && (
          <button
            onClick={onAddEvent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
            style={{ background: '#8B5CF6', color: '#fff' }}
          >
            <Plus size={13} />
            Add Event
          </button>
        )}
      </div>

      {hasNoRealEvents && (
        <ExampleBanner message="Your timeline will fill in as we deliver sessions and milestones together." />
      )}

      {isAdminView && (
        <p className="text-xs text-gray-400 mb-4">
          Drag events between columns to update their status, or use the Move dropdown on hover.
        </p>
      )}

      <div className="grid grid-cols-3 gap-6">
        {STATUS_ORDER.map(status => {
          const cfg = COLUMN_CONFIG[status]
          const colEvents = eventsByStatus[status]

          return (
            <div key={status}>
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3">
                <cfg.icon size={15} style={{ color: cfg.color }} />
                <span className="text-sm font-bold text-gray-700">{cfg.label}</span>
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded-full ml-auto"
                  style={{ background: cfg.count_bg, color: cfg.color }}
                >
                  {colEvents.length}
                </span>
              </div>

              {/* Drop zone wrapping the events */}
              {isAdminView ? (
                <DropZone
                  status={status}
                  isOver={dragOverColumn === status}
                  onDragOver={(e) => handleDragOver(e, status)}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {colEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      color={cfg.color}
                      isAdminView={isAdminView}
                      onDelete={onDeleteEvent}
                      onMove={onMoveEvent}
                      onDragStart={handleDragStart}
                    />
                  ))}
                  {colEvents.length === 0 && !dragOverColumn && (
                    <p className="text-xs text-gray-300 italic px-2">Nothing here yet</p>
                  )}
                </DropZone>
              ) : (
                <div>
                  {colEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      color={cfg.color}
                      isAdminView={false}
                      onDelete={undefined}
                      onMove={undefined}
                    />
                  ))}
                  {colEvents.length === 0 && (
                    <p className="text-xs text-gray-300 italic">Nothing here yet</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
