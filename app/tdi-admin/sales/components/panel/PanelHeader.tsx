'use client'

import { useState } from 'react'
import type { FullOpportunity } from '../OpportunityDetailPanel'

const HEAT_OPTIONS = [
  { id: 'hot', label: 'Hot', emoji: '🔥' },
  { id: 'warm', label: 'Warm', emoji: '🟡' },
  { id: 'cold', label: 'Cold', emoji: '❄️' },
  { id: 'parked', label: 'Parked', emoji: '🅿️' },
]

const TYPE_COLORS: Record<string, string> = {
  renewal: 'bg-amber-100 text-amber-700',
  new_business: 'bg-blue-100 text-blue-700',
  expansion: 'bg-purple-100 text-purple-700',
  upsell: 'bg-purple-100 text-purple-700',
  pilot: 'bg-green-100 text-green-700',
  reactivation: 'bg-orange-100 text-orange-700',
}

interface Props {
  opp: FullOpportunity
  onClose: () => void
  onPatch: (changes: Partial<FullOpportunity>) => void
}

export function PanelHeader({ opp, onClose, onPatch }: Props) {
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(opp.name)

  function commitName() {
    setEditingName(false)
    if (name.trim() && name.trim() !== opp.name) {
      onPatch({ name: name.trim() })
    }
  }

  const heat = HEAT_OPTIONS.find(h => h.id === (opp as any).heat)
  const ownerInitial = opp.assigned_to_email?.charAt(0).toUpperCase() ?? '?'

  return (
    <div className="flex items-start gap-3 px-5 pt-5 pb-3 border-b border-gray-100">
      <div className="flex-1 min-w-0">
        {editingName ? (
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={commitName}
            onKeyDown={e => {
              if (e.key === 'Enter') commitName()
              if (e.key === 'Escape') { setEditingName(false); setName(opp.name) }
            }}
            className="w-full text-lg font-bold text-gray-900 border-b border-indigo-400 outline-none bg-transparent"
          />
        ) : (
          <h2
            className="text-lg font-bold text-gray-900 leading-snug cursor-text hover:text-indigo-700 truncate"
            onClick={() => setEditingName(true)}
            title="Click to edit"
          >
            {opp.name}
          </h2>
        )}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {opp.type && (
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded capitalize ${TYPE_COLORS[opp.type] ?? 'bg-gray-100 text-gray-600'}`}>
              {opp.type.replace(/_/g, ' ')}
            </span>
          )}
          {heat && (
            <span className="text-xs text-gray-600">{heat.emoji} {heat.label}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700" title={opp.assigned_to_email ?? 'Unassigned'}>
          {ownerInitial}
        </div>
        <select
          value={(opp as any).heat ?? ''}
          onChange={e => onPatch({ heat: e.target.value || null } as any)}
          className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          title="Heat"
        >
          <option value="">Heat</option>
          {HEAT_OPTIONS.map(h => (
            <option key={h.id} value={h.id}>{h.emoji} {h.label}</option>
          ))}
        </select>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 text-lg leading-none"
          aria-label="Close panel"
        >
          ×
        </button>
      </div>
    </div>
  )
}
