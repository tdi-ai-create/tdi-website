'use client';

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

interface DataUploadFieldProps {
  label: string;
  field: string;
  type: 'text' | 'number' | 'select' | 'date';
  value: string | number | null | undefined;
  unit?: string;
  options?: string[];
  onSave: (field: string, value: string | number) => Promise<void>;
}

export function DataUploadField({
  label,
  field,
  type,
  value,
  unit,
  options,
  onSave,
}: DataUploadFieldProps) {
  const [localValue, setLocalValue] = useState(String(value ?? ''));
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const saveValue = type === 'number' ? parseFloat(localValue) || 0 : localValue;
      await onSave(field, saveValue);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-violet-700">{label}</label>
      <div className="flex items-center gap-2">
        {unit && <span className="text-sm text-violet-500">{unit}</span>}

        {type === 'select' && options ? (
          <select
            value={localValue}
            onChange={(e) => {
              setLocalValue(e.target.value);
              setSaved(false);
            }}
            onBlur={handleSave}
            className="flex-1 px-3 py-2 text-sm border border-violet-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-300 focus:border-transparent outline-none"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
            value={localValue}
            onChange={(e) => {
              setLocalValue(e.target.value);
              setSaved(false);
            }}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="flex-1 px-3 py-2 text-sm border border-violet-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-300 focus:border-transparent outline-none"
          />
        )}

        <div className="w-6 flex items-center justify-center">
          {isSaving && <Loader2 size={14} className="animate-spin text-violet-500" />}
          {saved && !isSaving && <Check size={14} className="text-green-500" />}
        </div>
      </div>
    </div>
  );
}
