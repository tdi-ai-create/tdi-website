'use client'

import { useState } from 'react'
import { PhaseChain } from '../PhaseChain'
import { OverviewTab } from './OverviewTab'
import { OpportunitiesTab } from './OpportunitiesTab'
import { ActionsTab } from './ActionsTab'
import { TimelineTab } from './TimelineTab'
import { EmailsTab } from './EmailsTab'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'opportunities', label: 'Opportunities' },
  { id: 'actions', label: 'Actions' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'emails', label: 'Emails' },
]

interface PanelShellProps {
  pursuit: any
  onClose: () => void
  pursuitId: string
  gate?: any
}

export function PanelShell({ pursuit, onClose, pursuitId, gate }: PanelShellProps) {
  const [activeTab, setActiveTab] = useState('opportunities')

  return (
    <div>
      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0, background: 'white', zIndex: 1,
        borderBottom: '1px solid #E5E7EB',
      }}>
        <div style={{ padding: '20px 24px 0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0a0f1e' }}>{pursuit.pursuit_name}</div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6B7280', padding: '0 4px' }}
            >
              x
            </button>
          </div>
          <div style={{ marginTop: 12 }}>
            <PhaseChain currentPhase={pursuit.current_phase} isStalled={pursuit.is_stalled} />
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E5E7EB', marginTop: 16, paddingLeft: 24 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '8px 16px',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${activeTab === tab.id ? '#8B5CF6' : 'transparent'}`,
                color: activeTab === tab.id ? '#8B5CF6' : '#6B7280',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: '20px 24px' }}>
        {activeTab === 'overview' && <OverviewTab pursuit={pursuit} gate={gate} onGateUpdate={() => {}} />}
        {activeTab === 'opportunities' && <OpportunitiesTab pursuitId={pursuitId} gateOpen={gate?.gate_open === true} />}
        {activeTab === 'actions' && <ActionsTab pursuitId={pursuitId} />}
        {activeTab === 'timeline' && <TimelineTab pursuitId={pursuitId} />}
        {activeTab === 'emails' && <EmailsTab pursuitId={pursuitId} pursuit={pursuit} />}
      </div>
    </div>
  )
}
