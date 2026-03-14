'use client';

import { Check, Edit2, Trash2 } from 'lucide-react';

export interface TimelineEventData {
  id: string;
  event_title: string;
  event_date: string | null;
  event_type: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  details?: string | null;
}

interface TimelineEventProps {
  event: TimelineEventData;
  editMode?: boolean;
  onUpdate?: (updates: Partial<TimelineEventData>) => void;
  onDelete?: () => void;
}

// Color styles based on status
const statusColors = {
  completed: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    dot: 'bg-green-500',
    text: 'text-green-700',
  },
  in_progress: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    text: 'text-amber-700',
  },
  upcoming: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    text: 'text-blue-700',
  },
};

export function TimelineEvent({
  event,
  editMode,
  onUpdate,
  onDelete,
}: TimelineEventProps) {
  const styles = statusColors[event.status] || statusColors.upcoming;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleMarkComplete = () => {
    if (onUpdate) {
      onUpdate({ status: 'completed' });
    }
  };

  const handleStatusChange = (newStatus: 'completed' | 'in_progress' | 'upcoming') => {
    if (onUpdate) {
      onUpdate({ status: newStatus });
    }
  };

  return (
    <div className={`${styles.bg} rounded-lg p-3 border ${styles.border} group relative`}>
      <div className="flex items-start gap-2">
        <div className={`w-2 h-2 rounded-full ${styles.dot} mt-1.5 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${styles.text}`}>{event.event_title}</p>
          {event.event_date && (
            <p className="text-xs text-gray-500 mt-0.5">{formatDate(event.event_date)}</p>
          )}
          {event.details && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{event.details}</p>
          )}
        </div>
      </div>

      {editMode && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {event.status !== 'completed' && onUpdate && (
            <button
              onClick={handleMarkComplete}
              className="p-1 rounded hover:bg-white/50"
              title="Mark complete"
            >
              <Check size={12} className="text-green-600" />
            </button>
          )}
          {onUpdate && (
            <select
              value={event.status}
              onChange={(e) => handleStatusChange(e.target.value as 'completed' | 'in_progress' | 'upcoming')}
              className="text-xs px-1 py-0.5 border border-gray-200 rounded bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="upcoming">Upcoming</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1 rounded hover:bg-white/50"
              title="Delete"
            >
              <Trash2 size={12} className="text-red-500" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
