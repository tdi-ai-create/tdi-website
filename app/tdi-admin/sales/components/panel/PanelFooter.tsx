'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FullOpportunity } from '../OpportunityDetailPanel'

const LOST_REASONS = ['Not a fit', 'Budget', 'Timing', 'Competitor', 'No response', 'Other']

interface Props {
  opp: FullOpportunity
  onPatch: (changes: Partial<FullOpportunity>) => void
  onClose: () => void
  showToast: (msg: string, type: 'success' | 'error') => void
}

export function PanelFooter({ opp, onPatch, onClose, showToast }: Props) {
  const router = useRouter()
  const [showLostModal, setShowLostModal] = useState(false)
  const [lostReason, setLostReason] = useState('Not a fit')
  const [provisioning, setProvisioning] = useState(false)
  const [provisioned, setProvisioned] = useState(false)
  const [creatingPartnership, setCreatingPartnership] = useState(false)
  const [showPartnershipModal, setShowPartnershipModal] = useState(false)
  const [partnershipCreated, setPartnershipCreated] = useState(false)

  // Partnership creation form state
  const [pType, setPType] = useState<'school' | 'district'>('school')
  const [pStaff, setPStaff] = useState('')
  const [pObsDays, setPObsDays] = useState('2')
  const [pVirtual, setPVirtual] = useState('4')
  const [pExecutive, setPExecutive] = useState('2')
  const [pBuildings, setPBuildings] = useState('1')
  const [pStart, setPStart] = useState(new Date().toISOString().split('T')[0])
  const [pEnd, setPEnd] = useState('')

  async function createPartnership() {
    setCreatingPartnership(true)
    try {
      const res = await fetch('/api/admin/deal-to-partnership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId: (opp as any).supabase_id || opp.id,
          partnershipType: pType,
          contractPhase: 'IGNITE',
          staffCount: parseInt(pStaff) || 0,
          observationDays: parseInt(pObsDays) || 0,
          virtualSessions: parseInt(pVirtual) || 0,
          executiveSessions: parseInt(pExecutive) || 0,
          contractStart: pStart || null,
          contractEnd: pEnd || null,
          buildingCount: parseInt(pBuildings) || 1,
        }),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        showToast(`Partnership created! Dashboard: ${result.partnership.slug}`, 'success')
        setPartnershipCreated(true)
        setShowPartnershipModal(false)
        // Update deal stage
        onPatch({ stage: 'signed' })
      } else {
        showToast(result.error || 'Failed to create partnership', 'error')
      }
    } catch {
      showToast('Failed to create partnership', 'error')
    } finally {
      setCreatingPartnership(false)
    }
  }

  async function provisionHubAccess() {
    if (!opp.contact_email) {
      showToast('No contact email on this deal', 'error')
      return
    }
    setProvisioning(true)
    try {
      const res = await fetch('/api/hub/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: opp.contact_email,
          name: opp.contact_name || opp.name,
          tier: 'all_access',
          source: 'sales_deal',
          dealId: opp.id,
        }),
      })
      const result = await res.json()
      if (res.ok) {
        showToast(`Hub All-Access provisioned for ${opp.contact_email}`, 'success')
        setProvisioned(true)
      } else {
        showToast(result.error || 'Provisioning failed', 'error')
      }
    } catch {
      showToast('Provisioning failed', 'error')
    } finally {
      setProvisioning(false)
    }
  }

  async function markWon() {
    await onPatch({ stage: 'paid' })
    showToast('Deal marked as Won', 'success')
    onClose()
  }

  async function markLost() {
    await onPatch({ stage: 'lost' })
    showToast('Deal marked as Lost', 'success')
    setShowLostModal(false)
    onClose()
  }

  if (opp.stage === 'lost') return null

  return (
    <>
      {/* Create Partnership -- shows on signed/paid deals that don't have a partnership yet */}
      {(opp.stage === 'signed' || opp.stage === 'paid') && !partnershipCreated && (
        <div className="border-t border-gray-100 px-5 py-3">
          <button
            onClick={() => setShowPartnershipModal(true)}
            className="w-full text-sm py-2.5 rounded-xl font-medium transition-colors"
            style={{ background: '#1e2749', color: 'white' }}
          >
            Create Partnership + Dashboard
          </button>
          <p className="text-[10px] text-center mt-1.5" style={{ color: '#9CA3AF' }}>
            Creates Leadership Dashboard, provisions Hub access, sends welcome email, sets up onboarding
          </p>
        </div>
      )}
      {partnershipCreated && (
        <div className="border-t border-gray-100 px-5 py-3 text-center">
          <p className="text-xs font-medium" style={{ color: '#2A9D8F' }}>Partnership created. Dashboard live.</p>
        </div>
      )}

      {/* Legacy: Provision Hub Access only (for deals that already have a partnership) */}
      {(opp.stage === 'signed' || opp.stage === 'paid') && partnershipCreated && !provisioned && (
        <div className="border-t border-gray-100 px-5 py-3">
          <button
            onClick={provisionHubAccess}
            disabled={provisioning}
            className="w-full text-sm py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
            style={{ background: '#E8B84B', color: '#1e2749' }}
          >
            {provisioning ? 'Provisioning...' : 'Provision Additional Hub Access'}
          </button>
        </div>
      )}
      {provisioned && (
        <div className="border-t border-gray-100 px-5 py-3 text-center">
          <p className="text-xs font-medium" style={{ color: '#2A9D8F' }}>Hub access provisioned</p>
        </div>
      )}

      <div className="border-t border-gray-100 px-5 py-3 flex items-center gap-3">
        {opp.stage !== 'paid' && (
          <button
            onClick={markWon}
            className="flex-1 text-sm bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl font-medium transition-colors"
          >
            Mark as Won
          </button>
        )}
        <button
          onClick={() => setShowLostModal(true)}
          className="flex-1 text-sm bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-xl font-medium border border-red-200 transition-colors"
        >
          Mark as Lost
        </button>
      </div>

      {/* Partnership Creation Modal */}
      {showPartnershipModal && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <h3 className="font-bold text-gray-900 text-lg">Create Partnership from Deal</h3>
            <p className="text-sm text-gray-500">{opp.name}</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Type</label>
                <select value={pType} onChange={e => setPType(e.target.value as 'school' | 'district')}
                  className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400">
                  <option value="school">School</option>
                  <option value="district">District</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Staff count (Hub memberships)</label>
                <input type="number" value={pStaff} onChange={e => setPStaff(e.target.value)} placeholder="e.g. 45"
                  className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">On-site observation days</label>
                <input type="number" value={pObsDays} onChange={e => setPObsDays(e.target.value)}
                  className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Virtual sessions</label>
                <input type="number" value={pVirtual} onChange={e => setPVirtual(e.target.value)}
                  className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Executive sessions</label>
                <input type="number" value={pExecutive} onChange={e => setPExecutive(e.target.value)}
                  className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
              {pType === 'district' && (
                <div>
                  <label className="text-xs text-gray-500 font-medium">Buildings</label>
                  <input type="number" value={pBuildings} onChange={e => setPBuildings(e.target.value)}
                    className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
                </div>
              )}
              <div>
                <label className="text-xs text-gray-500 font-medium">Contract start</label>
                <input type="date" value={pStart} onChange={e => setPStart(e.target.value)}
                  className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Contract end</label>
                <input type="date" value={pEnd} onChange={e => setPEnd(e.target.value)}
                  className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
              <p className="font-medium text-gray-700">This will automatically:</p>
              <p>1. Create the Leadership Dashboard at /partners/{opp.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}</p>
              <p>2. Provision Hub All-Access for {String(opp.contact_email || 'contact')}</p>
              <p>3. Send a welcome email to the principal</p>
              <p>4. Create onboarding action items (Phase 0)</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowPartnershipModal(false)}
                className="flex-1 text-sm border border-gray-200 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={createPartnership} disabled={creatingPartnership}
                className="flex-1 text-sm bg-[#1e2749] text-white py-2.5 rounded-xl font-medium hover:bg-[#2d3a5c] disabled:opacity-50">
                {creatingPartnership ? 'Creating...' : 'Create Partnership'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLostModal && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Mark as Lost</h3>
            <p className="text-sm text-gray-600 truncate">{opp.name}</p>
            <div>
              <label className="text-xs text-gray-500 font-medium">Reason</label>
              <select
                value={lostReason}
                onChange={e => setLostReason(e.target.value)}
                className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                {LOST_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLostModal(false)}
                className="flex-1 text-sm border border-gray-200 text-gray-600 py-2 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={markLost}
                className="flex-1 text-sm bg-red-600 text-white py-2 rounded-xl hover:bg-red-700 font-medium"
              >
                Confirm Lost
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
