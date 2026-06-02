'use client'

import { useEffect, useState } from 'react'
import { AlertsBanner } from './components/AlertsBanner'
import { USChoroplethMap } from '@/components/tdi-admin/shared/USChoroplethMap'
import { MetricsRow } from './components/MetricsRow'
import { RevenuePipeline } from './components/RevenuePipeline'
import { InvoicesTab } from './components/InvoicesTab'
import { RenewalPipelineTab } from './components/RenewalPipelineTab'
import { DistrictsTab } from './components/DistrictsTab'
import {
  TYPE_PAGE_TITLE,
  TYPE_PAGE_SUBTITLE,
  TYPE_SECTION_HEADER,
  TYPE_SMALL,
} from '@/components/tdi-admin/ui/design-tokens'

type Tab = 'analytics' | 'invoices' | 'renewals' | 'districts' | 'hub-fulfillment'

export default function OperationsPage() {
  const [data, setData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<Tab>('analytics')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Hub fulfillment data
  const [hubOps, setHubOps] = useState<{
    partnerFulfillment: { provisioned: number; active: number; district: string; state: string; usageRate: number }[];
    summary: { totalPartnerUsers: number; activePartnerUsers: number; overallUsageRate: number; totalDistricts: number };
  } | null>(null)
  const [hubOpsLoading, setHubOpsLoading] = useState(false)

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
        <h1 style={{ ...TYPE_PAGE_TITLE, margin: 0 }}>Operations</h1>
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
        <h1 style={{ ...TYPE_PAGE_TITLE, margin: 0 }}>Operations</h1>
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
    { id: 'hub-fulfillment', label: 'Hub Fulfillment' },
  ]

  // Load Hub data when fulfillment tab is active
  if (activeTab === 'hub-fulfillment' && !hubOps && !hubOpsLoading) {
    setHubOpsLoading(true)
    fetch('/api/tdi-admin/hub-connections?section=operations')
      .then(r => r.json())
      .then(d => { setHubOps(d); setHubOpsLoading(false) })
      .catch(() => setHubOpsLoading(false))
  }

  return (
    <div style={{ padding: '24px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ ...TYPE_PAGE_TITLE, margin: 0 }}>Operations</h1>
        <p style={{ ...TYPE_PAGE_SUBTITLE, marginTop: 4 }}>
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
                <div style={TYPE_SECTION_HEADER}>Geography</div>
                <div style={{ ...TYPE_SMALL, marginTop: 2 }}>Where TDI partnerships are active</div>
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

      {/* Hub Fulfillment tab */}
      {activeTab === 'hub-fulfillment' && (
        <div>
          {hubOpsLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF', fontSize: 13 }}>Loading Hub fulfillment data...</div>
          ) : !hubOps ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF', fontSize: 13 }}>No data available</div>
          ) : (
            <>
              {/* Summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
                <div style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #E5E7EB', textAlign: 'center' }}>
                  <p style={{ fontSize: 28, fontWeight: 700, color: '#F97316' }}>{hubOps.summary.totalPartnerUsers}</p>
                  <p style={{ fontSize: 12, color: '#6B7280' }}>Provisioned Users</p>
                  <p style={{ fontSize: 10, color: '#9CA3AF' }}>Partner/admin-assigned accounts</p>
                </div>
                <div style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #E5E7EB', textAlign: 'center' }}>
                  <p style={{ fontSize: 28, fontWeight: 700, color: '#2A9D8F' }}>{hubOps.summary.activePartnerUsers}</p>
                  <p style={{ fontSize: 12, color: '#6B7280' }}>Active (30d)</p>
                  <p style={{ fontSize: 10, color: '#9CA3AF' }}>Used Hub in last 30 days</p>
                </div>
                <div style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #E5E7EB', textAlign: 'center' }}>
                  <p style={{ fontSize: 28, fontWeight: 700, color: hubOps.summary.overallUsageRate >= 50 ? '#2A9D8F' : hubOps.summary.overallUsageRate >= 25 ? '#EAB308' : '#EF4444' }}>{hubOps.summary.overallUsageRate}%</p>
                  <p style={{ fontSize: 12, color: '#6B7280' }}>Usage Rate</p>
                  <p style={{ fontSize: 10, color: '#9CA3AF' }}>Active / provisioned</p>
                </div>
                <div style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #E5E7EB', textAlign: 'center' }}>
                  <p style={{ fontSize: 28, fontWeight: 700, color: '#2563EB' }}>{hubOps.summary.totalDistricts}</p>
                  <p style={{ fontSize: 12, color: '#6B7280' }}>Partner Districts</p>
                  <p style={{ fontSize: 10, color: '#9CA3AF' }}>With Hub accounts</p>
                </div>
              </div>

              {/* Fulfillment table */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F97316' }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contract Fulfillment by District</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, backgroundColor: '#FFF7ED', color: '#C2410C' }}>LIVE FROM HUB</span>
              </div>
              <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 16 }}>Hub access vs actual usage per partner district. Low usage may indicate underutilized partnerships before renewal.</p>

              {hubOps.partnerFulfillment.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF', fontSize: 13 }}>No partner fulfillment data. Partner memberships (source: district_partner or admin_assigned) will appear here.</div>
              ) : (
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>District</th>
                        <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>State</th>
                        <th style={{ textAlign: 'center', padding: '10px 16px', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Provisioned</th>
                        <th style={{ textAlign: 'center', padding: '10px 16px', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active (30d)</th>
                        <th style={{ textAlign: 'center', padding: '10px 16px', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Usage Rate</th>
                        <th style={{ textAlign: 'center', padding: '10px 16px', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hubOps.partnerFulfillment.map((d, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #F9FAFB' }}>
                          <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#1e2749' }}>{d.district}</td>
                          <td style={{ padding: '10px 16px', fontSize: 13, color: '#6B7280' }}>{d.state || '--'}</td>
                          <td style={{ padding: '10px 16px', fontSize: 13, color: '#374151', textAlign: 'center' }}>{d.provisioned}</td>
                          <td style={{ padding: '10px 16px', fontSize: 13, color: '#374151', textAlign: 'center' }}>{d.active}</td>
                          <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                              <div style={{ width: 48, height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${d.usageRate}%`, borderRadius: 3, backgroundColor: d.usageRate >= 50 ? '#2A9D8F' : d.usageRate >= 25 ? '#EAB308' : '#EF4444' }} />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 600, color: d.usageRate >= 50 ? '#2A9D8F' : d.usageRate >= 25 ? '#EAB308' : '#EF4444' }}>{d.usageRate}%</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                            <span style={{
                              fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase',
                              backgroundColor: d.usageRate >= 50 ? '#D1FAE5' : d.usageRate >= 25 ? '#FEF3C7' : '#FEE2E2',
                              color: d.usageRate >= 50 ? '#065F46' : d.usageRate >= 25 ? '#92400E' : '#991B1B',
                            }}>
                              {d.usageRate >= 50 ? 'On Track' : d.usageRate >= 25 ? 'Monitor' : 'At Risk'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
