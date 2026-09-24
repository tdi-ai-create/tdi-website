'use client'

interface TopBarStats {
  totalPipeline: number
  activeCount: number
  /** Leads the muck model cannot value, because no offering is recorded. They
   *  count as zero in totalPipeline, so the count is shown alongside it. */
  unvaluedCount?: number
  hotCount: number
  invoiceCount: number
  callSheetCount: number
  callSheetValue: number
  /** Factored muck across the board. Deliberately not split by person: Rae's
   *  rule of 15 September 2026 is that Bella and Rae are one role, and this bar
   *  read "N you" off the Rae field no matter who was signed in. */
  factoredMuck?: number
  heavyCount?: number
}

export function StickyTopBar({
  stats,
  onAddLead,
  onExport,
  onExportCallList,
  exportCount,
  isFiltered,
  exporting = false,
  showCallSheetOnly,
  onToggleCallSheet,
}: {
  stats: TopBarStats
  onAddLead: () => void
  onExport?: () => void
  onExportCallList?: () => void
  /** How many rows the export will actually contain, so the button can say so. */
  exportCount?: number
  /** True when a filter or a search is narrowing the board. */
  isFiltered?: boolean
  /** The export loads the full note history first, which takes a moment. */
  exporting?: boolean
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
          {/* "in pipeline", because the filter chip below says 96 and this says
              74 and both are right: the chip counts the whole board, this
              excludes Targeting. Two numbers under one word on one screen is
              what makes a board unreadable, so the word is no longer the same. */}
          {stats.unvaluedCount ? (
            <span title="Leads with no offering recorded, so there is nothing to predict a value from. They count as zero in the figure above rather than pulling in a stale pre-restructure number. This counts the pipeline only. The filter row below counts the whole board including Targeting, which is why its number is larger." style={{ marginLeft: 8, color: '#9CA3AF' }}>
              {stats.unvaluedCount} not valued in pipeline
            </span>
          ) : null}
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

        {/* Muck across the board. Factored by stage probability, for the same
            reason pipeline value is: a lead at five percent should not put its
            full weight on the total. */}
        {(stats.factoredMuck ?? 0) > 0 && (
          <div style={{ borderLeft: '1px solid #E5E7EB', paddingLeft: 20 }}>
            <div
              title="Muck points across the board, factored by stage probability. A relative weight, so it shows whether this month is heavier than last. It cannot tell you that you are full."
              style={{ fontSize: 14, fontWeight: 700, color: '#1e2749', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              {stats.factoredMuck} muck
              {(stats.heavyCount ?? 0) > 0 && (
                <span style={{ fontSize: 11, fontWeight: 600, color: '#6B7280' }}>
                  &middot; {stats.heavyCount} heavy
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>
              TDI admin load, factored by stage
            </div>
          </div>
        )}

        {/* The call list.
            Was labelled "Jim's list" everywhere. It is one shared flag on the
            lead, not a list belonging to a person: of the 20 leads carrying it
            on 24 September 2026, two were not assigned to Jim at all. Rae,
            same day: "didn't we change this to all of us?" Who makes a given
            call is now the follow-up owner on the lead itself. */}
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
              Call list: {stats.callSheetCount}
            </div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>
              ${(stats.callSheetValue / 1000).toFixed(0)}K
            </div>
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {onExportCallList && (
          <button onClick={onExportCallList} disabled={exporting} style={{
            fontSize: 12, padding: '8px 14px', borderRadius: 8,
            border: 'none', background: '#059669', color: 'white',
            cursor: exporting ? 'default' : 'pointer', fontWeight: 600,
            opacity: exporting ? 0.6 : 1,
          }}>
            {exporting ? 'Exporting...' : 'Export call list'}
          </button>
        )}
        {onExport && (
          <button onClick={onExport} disabled={exporting} style={{
            fontSize: 12, padding: '8px 14px', borderRadius: 8,
            border: '1px solid #D1D5DB', background: 'white', color: '#374151',
            cursor: exporting ? 'default' : 'pointer', fontWeight: 500,
            opacity: exporting ? 0.6 : 1,
          }}>
            {/* Say the number. The button used to read "Export All" and
                hand over the whole board no matter what was filtered, so you
                could not tell from the label what you were about to get. */}
            {exporting
              ? 'Exporting...'
              : exportCount === undefined
                ? 'Export'
                : isFiltered
                  ? `Export these ${exportCount}`
                  : `Export all ${exportCount}`}
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
