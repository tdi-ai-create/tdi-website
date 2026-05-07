'use client'

interface TopBarStats {
  totalPipeline: number
  activeCount: number
  hotCount: number
  invoiceCount: number
  callSheetCount: number
  callSheetValue: number
}

export function StickyTopBar({
  stats,
  onAddLead,
  onExport,
  onExportJimsList,
  showCallSheetOnly,
  onToggleCallSheet,
}: {
  stats: TopBarStats
  onAddLead: () => void
  onExport?: () => void
  onExportJimsList?: () => void
  showCallSheetOnly?: boolean
  onToggleCallSheet?: () => void
}) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #E5E7EB',
      borderTop: '3px solid #10B981',
      borderRadius: 12,
      padding: '14px 20px',
      marginBottom: 16,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 16,
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, color: '#0a0f1e' }}>
          ${(stats.totalPipeline / 1000000).toFixed(2)}M
          <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500, marginLeft: 8 }}>pipeline</span>
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
          {stats.activeCount} active
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <div style={{ borderLeft: '1px solid #E5E7EB', paddingLeft: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EF4444, #F97316)', display: 'inline-block' }} />
            {stats.hotCount} hot
          </div>
          <div style={{ fontSize: 11, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
            {stats.invoiceCount} invoices
          </div>
        </div>

        {/* Jim's call sheet count */}
        {stats.callSheetCount > 0 && (
          <button
            onClick={onToggleCallSheet}
            style={{
              borderLeft: '1px solid #E5E7EB',
              paddingLeft: 20,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{
              fontSize: 13, fontWeight: 600,
              color: showCallSheetOnly ? '#F97316' : '#0a0f1e',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              Jim's list: {stats.callSheetCount}
            </div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>
              ${(stats.callSheetValue / 1000).toFixed(0)}K
            </div>
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {onExportJimsList && (
          <button onClick={onExportJimsList} style={{
            fontSize: 12, padding: '8px 14px', borderRadius: 8,
            border: 'none', background: '#059669', color: 'white',
            cursor: 'pointer', fontWeight: 600,
          }}>
            Export Jim&apos;s List
          </button>
        )}
        {onExport && (
          <button onClick={onExport} style={{
            fontSize: 12, padding: '8px 14px', borderRadius: 8,
            border: '1px solid #D1D5DB', background: 'white', color: '#374151',
            cursor: 'pointer', fontWeight: 500,
          }}>
            Export All
          </button>
        )}
        <button onClick={onAddLead} style={{
          fontSize: 13, padding: '8px 16px', borderRadius: 8,
          border: 'none', background: '#10B981', color: 'white',
          cursor: 'pointer', fontWeight: 700,
        }}>
          + Add lead
        </button>
      </div>
    </div>
  )
}
