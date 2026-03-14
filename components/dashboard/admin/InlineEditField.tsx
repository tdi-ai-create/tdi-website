'use client'
import { useState } from 'react'
import { updateDashboardField } from '@/lib/dashboard/updateDashboardField'

interface InlineEditFieldProps {
  partnershipId: string
  field:         string
  value:         any
  type:          'text' | 'number' | 'select' | 'date' | 'textarea'
  options?:      string[]
  prefix?:       string
  suffix?:       string
  label?:        string
  onSaved?:      (newValue: any) => void
}

export function InlineEditField({
  partnershipId, field, value, type, options = [],
  prefix, suffix, label, onSaved,
}: InlineEditFieldProps) {
  const [editing,  setEditing]  = useState(false)
  const [localVal, setLocalVal] = useState(value ?? '')
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const result = await updateDashboardField(partnershipId, field, localVal)
    setSaving(false)
    if (result.success) {
      setSaved(true)
      setEditing(false)
      onSaved?.(localVal)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2 group">
        <span className="text-sm text-gray-700">
          {prefix}{value ?? <span className="text-gray-300 italic">Not set</span>}{suffix}
        </span>
        <button
          onClick={() => setEditing(true)}
          className="opacity-0 group-hover:opacity-100 text-xs text-violet-500 hover:text-violet-700 transition-opacity"
        >
          ✎
        </button>
        {saved && <span className="text-xs text-green-600 font-semibold">Saved ✓</span>}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {type === 'select' ? (
        <select
          value={localVal}
          onChange={e => setLocalVal(e.target.value)}
          className="text-sm border border-violet-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-500"
          autoFocus
        >
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          value={localVal}
          onChange={e => setLocalVal(e.target.value)}
          className="text-sm border border-violet-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-500 w-full"
          rows={2}
          autoFocus
        />
      ) : (
        <div className="flex items-center gap-1">
          {prefix && <span className="text-sm text-gray-500">{prefix}</span>}
          <input
            type={type}
            value={localVal}
            onChange={e => setLocalVal(e.target.value)}
            className="text-sm border border-violet-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-500 w-20"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false) }}
          />
          {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
        </div>
      )}
      <button
        onClick={handleSave}
        disabled={saving}
        className="text-xs font-semibold text-white px-2 py-1 rounded transition-all"
        style={{ background: saving ? '#C4B5FD' : '#8B5CF6' }}
      >
        {saving ? '...' : 'Save'}
      </button>
      <button
        onClick={() => setEditing(false)}
        className="text-xs text-gray-400 hover:text-gray-600"
      >
        Cancel
      </button>
    </div>
  )
}
