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

const TYPE_LABELS: Record<string, string> = {
  renewal: 'Renewal',
  new_business: 'New Business',
  expansion: 'Expansion',
  upsell: 'Upsell',
  pilot: 'Pilot',
  reactivation: 'Reactivation',
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
  const typeLabel = TYPE_LABELS[opp.type] || opp.type?.replace(/_/g, ' ') || ''

  const recencyLabel = daysSince === null ? '' : daysSince === 0 ? 'Today' : daysSince === 1 ? '1d ago' : `${daysSince}d ago`
  const recencyColor = daysSince === null ? '' : daysSince > 14 ? '#EF4444' : daysSince > 7 ? '#F59E0B' : '#10B981'

  return (
    <div>
      {/* Navy header band */}
      <div style={{ background: 'linear-gradient(135deg, #1B2A4A, #2d3f66)', padding: '20px 24px 16px', position: 'relative' }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 12, right: 12,
            width: 28, height: 28, borderRadius: '50%',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)',
            fontSize: 16, lineHeight: 1,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.2)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)' }}
          aria-label="Close panel"
        >
          x
        </button>

        {/* Name */}
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
            style={{ width: '90%', fontSize: 16, fontWeight: 700, color: 'white', borderBottom: '1px solid rgba(255,255,255,0.4)', outline: 'none', background: 'transparent', padding: 0 }}
          />
        ) : (
          <h2
            onClick={() => setEditingName(true)}
            title="Click to edit"
            style={{ fontSize: 16, fontWeight: 700, color: 'white', lineHeight: 1.3, cursor: 'text', margin: 0, paddingRight: 32 }}
          >
            {opp.name}
          </h2>
        )}

        {/* Contact + location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
          {contactName && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{contactName}</span>}
          {location && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{location}</span>}
        </div>

        {/* Email + phone */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
          {contactEmail && (
            <a href={`mailto:${contactEmail}`} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)' }}
            >
              {contactEmail}
            </a>
          )}
          {contactPhone && (
            <a href={`tel:${contactPhone}`} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)' }}
            >
              {contactPhone}
            </a>
          )}
        </div>
      </div>

      {/* Tags + heat bar */}
      <div style={{ padding: '10px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {typeLabel && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: opp.type === 'renewal' ? '#FEF3C7' : '#EFF6FF', color: opp.type === 'renewal' ? '#854D0E' : '#1E40AF' }}>
              {typeLabel}
            </span>
          )}
          {isPdPlan && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: '#DBEAFE', color: '#1E40AF' }}>
              PD Plan
            </span>
          )}
          {recencyLabel && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: `${recencyColor}15`, color: recencyColor }}>
              {recencyLabel}
            </span>
          )}
          <Link
            href={`/tdi-admin/leadership?search=${encodeURIComponent(opp.name)}`}
            style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: '#F0FDFA', color: '#0F766E', textDecoration: 'none' }}
          >
            Leadership
          </Link>
          <Link
            href={`/tdi-admin/hub?tab=schools&search=${encodeURIComponent(opp.name)}`}
            style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: '#FFFBEB', color: '#A16207', textDecoration: 'none' }}
          >
            Hub Data
          </Link>
        </div>
        {/* Heat selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {heat && <span style={{ width: 8, height: 8, borderRadius: '50%', background: heat.color, display: 'inline-block' }} />}
          <select
            value={(opp as any).heat ?? ''}
            onChange={e => onPatch({ heat: e.target.value || null } as any)}
            style={{ fontSize: 12, border: '1px solid #E5E7EB', borderRadius: 6, padding: '3px 8px', background: 'white', color: heat?.color || '#6B7280', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
            title="Heat"
          >
            <option value="">Heat</option>
            {HEAT_OPTIONS.map(h => (
              <option key={h.id} value={h.id}>{h.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
