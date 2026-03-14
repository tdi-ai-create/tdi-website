'use client';

import { Check, Plus } from 'lucide-react';

interface ServiceTrackerProps {
  label: string;
  used: number;
  total: number;
  color: string;
  editMode?: boolean;
  onMarkComplete?: () => void;
}

export function ServiceTracker({
  label,
  used,
  total,
  color,
  editMode,
  onMarkComplete,
}: ServiceTrackerProps) {
  const pct = total > 0 ? (used / total) * 100 : 0;
  const isComplete = used >= total;

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        {editMode && !isComplete && onMarkComplete && (
          <button
            onClick={onMarkComplete}
            className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-all hover:opacity-80"
            style={{ backgroundColor: color, color: 'white' }}
          >
            <Plus size={12} />
            Mark Complete
          </button>
        )}
        {isComplete && (
          <span className="flex items-center gap-1 text-xs font-medium text-green-600">
            <Check size={12} />
            Complete
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-bold" style={{ color }}>
          {used}
        </span>
        <span className="text-gray-400">/</span>
        <span className="text-lg text-gray-500">{total}</span>
      </div>

      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }}
        />
      </div>

      <p className="text-xs text-gray-500 mt-2">
        {total - used} remaining
      </p>
    </div>
  );
}
