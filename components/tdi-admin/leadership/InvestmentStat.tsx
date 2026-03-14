'use client';

import { Edit2 } from 'lucide-react';

interface InvestmentStatProps {
  value: string | number;
  label: string;
  sublabel: string;
  prefix?: string;
  suffix?: string;
  editMode?: boolean;
  onEdit?: (value: string) => void;
}

export function InvestmentStat({
  value,
  label,
  sublabel,
  prefix = '',
  suffix = '',
  editMode,
  onEdit,
}: InvestmentStatProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 relative group">
      <div className="text-3xl font-bold text-gray-900 mb-1">
        {prefix}{value}{suffix}
      </div>
      <div className="text-sm font-semibold text-gray-700 mb-1">{label}</div>
      <div className="text-xs text-gray-500 leading-relaxed">{sublabel}</div>

      {editMode && onEdit && (
        <button
          onClick={() => {
            const newVal = prompt(`Enter new value for ${label}:`, String(value));
            if (newVal !== null) onEdit(newVal);
          }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-all"
        >
          <Edit2 size={12} className="text-gray-400" />
        </button>
      )}
    </div>
  );
}
