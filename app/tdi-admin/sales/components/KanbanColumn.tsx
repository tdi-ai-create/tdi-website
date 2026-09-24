'use client'

import { useState } from 'react'
import { SalesCard, type SalesCardOpp } from './SalesCard'


export function KanbanColumn({
  stage,
  label,
  opportunities,
  onCardClick,
  onDrop,
  onCardContextMenu,
  onFieldSaved,
  onToggleCallSheet,
  onAddNote,
  getNoteForOpp,
}: {
  stage: string
  label: string
  opportunities: SalesCardOpp[]
  onCardClick: (opp: SalesCardOpp) => void
  onDrop?: (oppId: string, toStage: string) => void
  onCardContextMenu?: (e: React.MouseEvent, oppId: string) => void
  onFieldSaved?: (oppId: string, field: string, newValue: any) => void
  onToggleCallSheet?: (oppId: string) => void
  onAddNote?: (oppId: string) => void
  getNoteForOpp?: (oppId: string) => { body: string; created_at: string } | null
}) {
  const [isDragOver, setIsDragOver] = useState(false)
  const total = opportunities.reduce((s, o) => s + (o.value || 0), 0)
  const factored = opportunities.reduce((s, o) => s + (o.value || 0) * (o.probability || 0) / 100, 0)

  /**
   * One flat list per stage, ordered by value per muck point.
   *
   * These used to be grouped into HOT / WARM / COLD / PARKED bands. Rae, 24
   * September 2026: "remove hot warm and cold. we dont need that. its just
   * creating confusion." A lead with no muck score yet sorts below the scored
   * ones rather than above them, because unknown is not the same as cheap.
   */
  const ordered = [...opportunities].sort((a, b) => {
    const ra = a.muck?.total ? (a.value || 0) / a.muck.total : -1
    const rb = b.muck?.total ? (b.value || 0) / b.muck.total : -1
    if (rb !== ra) return rb - ra
    return ((b.value || 0) * (b.probability || 0)) - ((a.value || 0) * (a.probability || 0))
  })

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  function handleDragLeave() {
    setIsDragOver(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
    const oppId = e.dataTransfer.getData('text/plain')
    if (oppId && onDrop) {
      onDrop(oppId, stage)
    }
  }

  return (
    <div
      style={{ minWidth: 300, flex: 1, display: 'flex', flexDirection: 'column' }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div style={{
        padding: '10px 12px',
        background: isDragOver ? '#D1FAE5' : '#ECFDF5',
        borderTop: '3px solid #10B981',
        borderRadius: '8px 8px 0 0',
        transition: 'background 0.15s',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#065F46' }}>{label}</span>
          <span style={{ fontSize: 12, color: '#6B7280' }}>{opportunities.length}</span>
        </div>
        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>
          ${(total / 1000).toFixed(0)}K · ${(factored / 1000).toFixed(0)}K factored
        </div>
      </div>

      <div style={{
        background: isDragOver ? '#EFF6FF' : '#F3F4F6',
        border: isDragOver ? '2px dashed #3B82F6' : '2px solid transparent',
        padding: 8,
        borderRadius: '0 0 8px 8px',
        flex: 1,
        minHeight: 200,
        maxHeight: 'calc(100vh - 280px)',
        overflowY: 'auto',
        transition: 'background 0.15s, border-color 0.15s',
      }}>
        {opportunities.length === 0 ? (
          <p style={{ fontSize: 12, color: isDragOver ? '#3B82F6' : '#9CA3AF', textAlign: 'center', padding: 16 }}>
            {isDragOver ? 'Drop here' : 'No opportunities'}
          </p>
        ) : (
          ordered.map(opp => (
            <SalesCard
              key={opp.id}
              opp={opp}
              onClick={() => onCardClick(opp)}
              draggable
              onContextMenu={onCardContextMenu ? (e) => onCardContextMenu(e, opp.id) : undefined}
              onFieldSaved={onFieldSaved}
              onToggleCallSheet={onToggleCallSheet}
              onAddNote={onAddNote}
              latestNote={getNoteForOpp ? getNoteForOpp(opp.id) : null}
            />
          ))
        )}
      </div>
    </div>
  )
}
