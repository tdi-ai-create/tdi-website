'use client'

import { useEffect, useState } from 'react'
import { AlertsBanner } from './components/AlertsBanner'
import { USChoroplethMap } from '@/components/tdi-admin/shared/USChoroplethMap'
import { MetricsRow } from './components/MetricsRow'
import { RevenuePipeline } from './components/RevenuePipeline'
import { InvoicesTab } from './components/InvoicesTab'
import { RenewalPipelineTab } from './components/RenewalPipelineTab'
import { DistrictsTab } from './components/DistrictsTab'

type Tab = 'analytics' | 'invoices' | 'renewals' | 'districts'

export default function OperationsPage() {
  const [data, setData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<Tab>('analytics')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/operations/dashboard')
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setData(d)
        setLoading(false)
      })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '24px 32px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: '#2B3A67', fontFamily: "'Source Serif 4', Georgia, serif" }}>Operations</h1>
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: 48, background: '#F3F4F6', borderRadius: 8 }} />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={{ padding: '24px 32px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: '#2B3A67', fontFamily: "'Source Serif 4', Georgia, serif" }}>Operations</h1>
        <div style={{ marginTop: 24, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '16px 20px', color: '#991B1B', fontSize: 13 }}>
          Failed to load operations data{error ? `: ${error}` : ''}
        </div>
      </div>
    )
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'analytics', label: 'Analytics' },
    { id: 'invoices', label: `Invoices (${data.invoicesData?.length || 0})` },
    { id: 'renewals', label: `Renewals (${data.renewalsData?.length || 0})` },
    { id: 'districts', label: `Districts (${data.districtsData?.length || 0})` },
  ]

  return (
    <div style={{ padding: '24px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: '#2B3A67', fontFamily: "'Source Serif 4', Georgia, serif" }}>Operations</h1>
        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
          District Command Center · Contracts, Renewals, Collections
        </p>
      </div>

      {/* Tab navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', marginBottom: 24 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? '#0a0f1e' : '#6B7280',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #F97316' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alerts (always visible) */}
      <AlertsBanner alerts={data.alerts || []} />

      {/* Analytics tab */}
      {activeTab === 'analytics' && (
        <>
          <MetricsRow metrics={data.metrics} />
          <RevenuePipeline revenue={data.revenue} />
          {data.byState && Object.keys(data.byState).length > 0 && (
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 16, padding: 24, marginTop: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#2B3A67', fontFamily: "'Source Serif 4', Georgia, serif" }}>Geography</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Where TDI partnerships are active</div>
              </div>
              <USChoroplethMap byState={data.byState} valueLabel="partnerships" accentColor="#F97316" />
            </div>
          )}
        </>
      )}

      {/* Invoices tab */}
      {activeTab === 'invoices' && (
        <InvoicesTab invoicesData={data.invoicesData || []} />
      )}

      {/* Renewals tab */}
      {activeTab === 'renewals' && (
        <RenewalPipelineTab renewalsData={data.renewalsData || []} />
      )}

      {/* Districts tab */}
      {activeTab === 'districts' && (
        <DistrictsTab districtsData={data.districtsData || []} />
      )}
    </div>
  )
}
