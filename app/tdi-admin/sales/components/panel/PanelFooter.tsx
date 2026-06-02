'use client'

import { useState } from 'react'
import type { FullOpportunity } from '../OpportunityDetailPanel'

const LOST_REASONS = ['Not a fit', 'Budget', 'Timing', 'Competitor', 'No response', 'Other']

interface Props {
  opp: FullOpportunity
  onPatch: (changes: Partial<FullOpportunity>) => void
  onClose: () => void
  showToast: (msg: string, type: 'success' | 'error') => void
}

export function PanelFooter({ opp, onPatch, onClose, showToast }: Props) {
  const [showLostModal, setShowLostModal] = useState(false)
  const [lostReason, setLostReason] = useState('Not a fit')
  const [provisioning, setProvisioning] = useState(false)
  const [provisioned, setProvisioned] = useState(false)

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
      {/* Provision Hub Access -- shows on signed/paid deals */}
      {(opp.stage === 'signed' || opp.stage === 'paid') && !provisioned && (
        <div className="border-t border-gray-100 px-5 py-3">
          <button
            onClick={provisionHubAccess}
            disabled={provisioning}
            className="w-full text-sm py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
            style={{ background: '#E8B84B', color: '#1e2749' }}
          >
            {provisioning ? 'Provisioning...' : 'Provision Hub All-Access'}
          </button>
          <p className="text-[10px] text-center mt-1.5" style={{ color: '#9CA3AF' }}>
            Creates a Hub account with All-Access for {String(opp.contact_email || 'contact')}
          </p>
        </div>
      )}
      {provisioned && (
        <div className="border-t border-gray-100 px-5 py-3 text-center">
          <p className="text-xs font-medium" style={{ color: '#2A9D8F' }}>Hub All-Access provisioned</p>
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
