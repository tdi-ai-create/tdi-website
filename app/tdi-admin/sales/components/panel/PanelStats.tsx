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
    <div className="grid grid-cols-3 gap-0 border-b border-gray-100">
      {/* Value */}
      <div className="px-5 py-2.5 border-r border-gray-100">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Value</p>
        {editingValue ? (
          <input
            autoFocus
            value={valueInput}
            onChange={e => setValueInput(e.target.value)}
            onBlur={commitValue}
            onKeyDown={e => { if (e.key === 'Enter') commitValue() }}
            className="w-full text-base font-bold text-gray-800 border-b border-indigo-400 outline-none bg-transparent"
          />
        ) : (
          <p
            className="text-base font-bold text-gray-800 cursor-text hover:text-indigo-700"
            onClick={() => { setValueInput(String(opp.value ?? '')); setEditingValue(true) }}
          >
            {opp.value ? `$${opp.value.toLocaleString()}` : '$0'}
          </p>
        )}
      </div>
      {/* Stage */}
      <div className="px-4 py-2.5 border-r border-gray-100">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Stage</p>
        <select
          value={opp.stage}
          onChange={e => onPatch({ stage: e.target.value })}
          className="text-sm font-semibold text-gray-800 border-none outline-none bg-transparent cursor-pointer p-0 -ml-0.5 w-full focus:ring-0"
        >
          {stageOptions.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      {/* Factored */}
      <div className="px-4 py-2.5">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Factored</p>
        <p className="text-base font-bold text-gray-400">
          {factored !== null ? `$${factored.toLocaleString()}` : '$0'}
        </p>
      </div>
    </div>
  )
}
