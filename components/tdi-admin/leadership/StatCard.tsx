'use client';

import { Edit2 } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  sublabel?: string;
  color: string;
  editMode?: boolean;
  onEdit?: (value: string) => void;
  progress?: number; // 0-100 for progress bar
}

export function StatCard({
  icon,
  value,
  label,
  sublabel,
  color,
  editMode,
  onEdit,
  progress,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative group">
      <div className="flex items-center justify-between mb-3">
        <div style={{ color }}>{icon}</div>
        {editMode && onEdit && (
          <button
            onClick={() => {
              const newVal = prompt(`Enter new value for ${label}:`, String(value));
              if (newVal !== null) onEdit(newVal);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 transition-all"
          >
            <Edit2 size={12} className="text-gray-400" />
          </button>
        )}
      </div>
      <div className="text-3xl font-bold mb-1" style={{ color }}>
        {value}
      </div>
      <div className="text-sm font-semibold text-gray-900 mb-0.5">{label}</div>
      {sublabel && <div className="text-xs text-gray-500">{sublabel}</div>}
      {typeof progress === 'number' && (
        <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: color }}
          />
        </div>
      )}
    </div>
  );
}
