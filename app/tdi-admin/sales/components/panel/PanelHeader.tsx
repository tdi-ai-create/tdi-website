'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { FullOpportunity } from '../OpportunityDetailPanel'

const HEAT_OPTIONS = [
  { id: 'hot', label: 'Hot', color: '#EF4444' },
  { id: 'warm', label: 'Warm', color: '#F59E0B' },
  { id: 'cold', label: 'Cold', color: '#3B82F6' },
  { id: 'parked', label: 'Parked', color: '#9CA3AF' },
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
  const contactName = (opp as any).contact_name || ''
  const contactEmail = (opp as any).contact_email || ''
  const contactPhone = (opp as any).contact_phone || ''
  const city = (opp as any).city || ''
  const state = (opp as any).state || ''
  const source = opp.source || ''
  const location = [city, state].filter(Boolean).join(', ')
  const lastActivity = opp.last_activity_at ? new Date(opp.last_activity_at) : null
  const daysSince = lastActivity ? Math.floor((Date.now() - lastActivity.getTime()) / 86400000) : null
  const isPdPlan = /pd.plan|website/i.test(source)

  return (
    <div className="px-5 pt-4 pb-3 border-b border-gray-100">
      {/* Row 1: Name + close */}
      <div className="flex items-start gap-2 mb-2">
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
              className="w-full text-sm font-bold text-gray-900 border-b border-indigo-400 outline-none bg-transparent"
            />
          ) : (
            <h2
              className="text-sm font-bold text-gray-900 leading-snug cursor-text hover:text-indigo-700"
              onClick={() => setEditingName(true)}
              title="Click to edit"
            >
              {opp.name}
            </h2>
          )}
          {/* Contact + location on same line */}
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 flex-wrap">
            {contactName && <span className="font-medium text-gray-700">{contactName}</span>}
            {location && <span>{location}</span>}
          </div>
        </div>
        {/* Heat selector + close */}
        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={(opp as any).heat ?? ''}
            onChange={e => onPatch({ heat: e.target.value || null } as any)}
            className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
            style={{ color: heat?.color || '#6B7280' }}
            title="Heat"
          >
            <option value="">Heat</option>
            {HEAT_OPTIONS.map(h => (
              <option key={h.id} value={h.id} style={{ color: h.color }}>{h.label}</option>
            ))}
          </select>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 text-base leading-none"
            aria-label="Close panel"
          >
            x
          </button>
        </div>
      </div>

      {/* Row 2: Contact info (visible without clicking tab) */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
        {contactEmail && (
          <a href={`mailto:${contactEmail}`} className="hover:text-indigo-600 truncate max-w-[200px]" title={contactEmail}>
            {contactEmail}
          </a>
        )}
        {contactPhone && (
          <a href={`tel:${contactPhone}`} className="hover:text-indigo-600 whitespace-nowrap">
            {contactPhone}
          </a>
        )}
      </div>

      {/* Row 3: Tags */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {opp.type && (
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded capitalize ${TYPE_COLORS[opp.type] ?? 'bg-gray-100 text-gray-600'}`}>
            {opp.type.replace(/_/g, ' ')}
          </span>
        )}
        {isPdPlan && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
            PD Plan
          </span>
        )}
        {heat && (
          <span className="flex items-center gap-1 text-[10px] text-gray-500">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: heat.color }} />
            {heat.label}
          </span>
        )}
        {daysSince !== null && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${daysSince > 14 ? 'bg-red-50 text-red-600' : daysSince > 7 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
            {daysSince === 0 ? 'Today' : daysSince === 1 ? '1d ago' : `${daysSince}d ago`}
          </span>
        )}
        <Link
          href={`/tdi-admin/leadership?search=${encodeURIComponent(opp.name)}`}
          className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
        >
          Leadership
        </Link>
        <Link
          href={`/tdi-admin/hub?tab=schools&search=${encodeURIComponent(opp.name)}`}
          className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
        >
          Hub Data
        </Link>
      </div>
    </div>
  )
}
