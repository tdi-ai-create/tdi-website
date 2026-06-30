'use client'

import { useEffect, useState } from 'react'

const PLAN_COLORS: Record<string, string> = { A: '#0F766E', B: '#1B365D', C: '#7C3AED', D: '#B45309' }
const STATUS_OPTIONS = ['not_started', 'researching', 'applied', 'waiting', 'awarded', 'denied', 'stalled', 'backup']
const NARRATIVE_COLORS: Record<string, string> = {
  not_started: '#EF4444',
  researching: '#F59E0B',
  applied: '#F59E0B',
  waiting: '#F59E0B',
  drafting: '#F59E0B',
  review: '#F59E0B',
  ready: '#10B981',
  awarded: '#10B981',
  denied: '#6B7280',
  stalled: '#6B7280',
  backup: '#6B7280',
}

interface OpportunitiesTabProps {
  pursuitId: string
}

export function OpportunitiesTab({ pursuitId }: OpportunitiesTabProps) {
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newOpp, setNewOpp] = useState({ name: '', amount: '', planCategory: 'A', status: 'not_started' })

  const fetchOpps = () => {
    setLoading(true)
    fetch(`/api/funding/opportunities?pursuitId=${pursuitId}`)
      .then(r => r.json())
      .then(d => {
        const items = Array.isArray(d) ? d : (d.opportunities || [])
        // Sort: waiting_on='client' first, then by application_closes ascending (nulls last)
        items.sort((a: any, b: any) => {
          const aClient = a.waiting_on === 'client' ? 0 : 1
          const bClient = b.waiting_on === 'client' ? 0 : 1
          if (aClient !== bClient) return aClient - bClient
          const aDate = a.application_closes || '9999-12-31'
          const bDate = b.application_closes || '9999-12-31'
          return aDate.localeCompare(bDate)
        })
        setOpportunities(items)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchOpps() }, [pursuitId])

  const handleStatusChange = async (id: string, newStatus: string) => {
    await fetch('/api/funding/opportunities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    })
    fetchOpps()
  }

  const handleAdd = async () => {
    await fetch('/api/funding/opportunities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pursuitId,
        name: newOpp.name,
        amount: parseFloat(newOpp.amount) || 0,
        planCategory: newOpp.planCategory,
        status: newOpp.status,
      }),
    })
    setNewOpp({ name: '', amount: '', planCategory: 'A', status: 'not_started' })
    setShowAddForm(false)
    fetchOpps()
  }

  const totalAmount = opportunities.reduce((sum: number, o: any) => sum + (o.amount || 0), 0)

  if (loading) return <div style={{ padding: 20, textAlign: 'center', color: '#6B7280' }}>Loading...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Count header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
          {opportunities.length} opportunit{opportunities.length === 1 ? 'y' : 'ies'}
          <span style={{ fontWeight: 400, color: '#6B7280', marginLeft: 8 }}>
            ${totalAmount.toLocaleString()} total
          </span>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 6,
            border: 'none', background: '#8B5CF6', color: 'white', cursor: 'pointer',
          }}
        >
          {showAddForm ? 'Cancel' : '+ Add Opportunity'}
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div style={{ padding: 16, background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            value={newOpp.name}
            onChange={e => setNewOpp({ ...newOpp, name: e.target.value })}
            placeholder="Opportunity name"
            style={{ fontSize: 13, padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 6, width: '100%', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="number"
              value={newOpp.amount}
              onChange={e => setNewOpp({ ...newOpp, amount: e.target.value })}
              placeholder="Amount ($)"
              style={{ fontSize: 13, padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 6, flex: 1 }}
            />
            <select
              value={newOpp.planCategory}
              onChange={e => setNewOpp({ ...newOpp, planCategory: e.target.value })}
              style={{ fontSize: 13, padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 6 }}
            >
              <option value="A">Plan A</option>
              <option value="B">Plan B</option>
              <option value="C">Plan C</option>
              <option value="D">Plan D</option>
            </select>
            <select
              value={newOpp.status}
              onChange={e => setNewOpp({ ...newOpp, status: e.target.value })}
              style={{ fontSize: 13, padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 6 }}
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <button
            onClick={handleAdd}
            disabled={!newOpp.name}
            style={{
              fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 6,
              border: 'none', background: '#8B5CF6', color: 'white', cursor: 'pointer',
              opacity: newOpp.name ? 1 : 0.5, alignSelf: 'flex-start',
            }}
          >
            Add Opportunity
          </button>
        </div>
      )}

      {/* Opportunity cards */}
      {opportunities.map((opp: any) => {
        const borderColor = PLAN_COLORS[opp.plan_category] || '#6B7280'
        const narrativeColor = NARRATIVE_COLORS[opp.status] || '#6B7280'

        return (
          <div key={opp.id} style={{
            padding: '12px 16px', background: '#F9FAFB', borderRadius: 10,
            borderLeft: `4px solid ${borderColor}`,
          }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: borderColor, padding: '2px 6px', background: 'white', borderRadius: 4, border: `1px solid ${borderColor}` }}>
                  Plan {opp.plan_category || '?'}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0a0f1e' }}>{opp.name}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0a0f1e' }}>
                {opp.amount > 0 ? `$${opp.amount.toLocaleString()}` : '--'}
              </span>
            </div>

            {/* Middle row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
              {/* Narrative dot */}
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: narrativeColor, flexShrink: 0 }} />

              {/* Status dropdown */}
              <select
                value={opp.status || 'not_started'}
                onChange={e => handleStatusChange(opp.id, e.target.value)}
                style={{ fontSize: 11, padding: '3px 6px', border: '1px solid #E5E7EB', borderRadius: 6, background: 'white', cursor: 'pointer' }}
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>

              {opp.waiting_on && (
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                  background: opp.waiting_on === 'client' ? '#FEF3C7' : '#E0E7FF',
                  color: opp.waiting_on === 'client' ? '#92400E' : '#3730A3',
                }}>
                  Waiting: {opp.waiting_on}
                </span>
              )}

              {opp.application_closes && (
                <span style={{ fontSize: 11, color: '#6B7280' }}>
                  Deadline: {new Date(opp.application_closes + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>

            {/* Contact */}
            {opp.contact_name && (
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>Contact: {opp.contact_name}</div>
            )}
          </div>
        )
      })}

      {opportunities.length === 0 && !showAddForm && (
        <div style={{ textAlign: 'center', padding: 24, color: '#9CA3AF', fontSize: 13 }}>
          No opportunities yet. Click "+ Add Opportunity" to get started.
        </div>
      )}
    </div>
  )
}
