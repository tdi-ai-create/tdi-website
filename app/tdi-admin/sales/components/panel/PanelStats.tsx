'use client'

import { useState } from 'react'
import type { FullOpportunity } from '../OpportunityDetailPanel'

interface Props {
  opp: FullOpportunity
  stageProbability: Record<string, number>
  stageOptions: { id: string; name: string }[]
  onPatch: (changes: Partial<FullOpportunity>) => void
}

export function PanelStats({ opp, stageProbability, stageOptions, onPatch }: Props) {
  const [editingValue, setEditingValue] = useState(false)
  const [valueInput, setValueInput] = useState(String(opp.value ?? ''))

  const prob = stageProbability[opp.stage] ?? 0
  const factored = opp.value ? Math.round(opp.value * prob / 100) : null

  function commitValue() {
    setEditingValue(false)
    const parsed = parseInt(valueInput.replace(/[^0-9]/g, ''), 10)
    if (!isNaN(parsed) && parsed !== opp.value) {
      onPatch({ value: parsed })
    }
  }

  return (
    <div className="flex items-center gap-5 px-5 py-3 bg-gray-50 border-b border-gray-100 flex-wrap">
      <div>
        <p className="text-xs text-gray-500 mb-0.5">Value</p>
        {editingValue ? (
          <input
            autoFocus
            value={valueInput}
            onChange={e => setValueInput(e.target.value)}
            onBlur={commitValue}
            onKeyDown={e => { if (e.key === 'Enter') commitValue() }}
            className="w-28 text-sm font-bold text-gray-800 border-b border-indigo-400 outline-none bg-transparent"
          />
        ) : (
          <p
            className="text-sm font-bold text-gray-800 cursor-text hover:text-indigo-700"
            onClick={() => { setValueInput(String(opp.value ?? '')); setEditingValue(true) }}
          >
            {opp.value ? `$${opp.value.toLocaleString()}` : 'No value'}
          </p>
        )}
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">Stage</p>
        <select
          value={opp.stage}
          onChange={e => onPatch({ stage: e.target.value })}
          className="text-sm font-medium text-gray-800 border border-gray-200 rounded px-1.5 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
        >
          {stageOptions.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      {factored !== null && (
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Factored</p>
          <p className="text-sm font-bold text-gray-500">${factored.toLocaleString()}</p>
        </div>
      )}
    </div>
  )
}
