'use client'

import { useState } from 'react'
import { SalesCard, type SalesCardOpp } from './SalesCard'

const HEAT_ORDER = ['hot', 'warm', 'cold', 'parked'] as const
const HEAT_LABELS: Record<string, { label: string; color: string }> = {
  hot: { label: 'Hot', color: '#EF4444' },
  warm: { label: 'Warm', color: '#F59E0B' },
  cold: { label: 'Cold', color: '#3B82F6' },
  parked: { label: 'Parked', color: '#6B7280' },
}

export function KanbanColumn({
  stage,
  label,
  opportunities,
  onCardClick,
  onDrop,
  onCardContextMenu,
}: {
  stage: string
  label: string
  opportunities: SalesCardOpp[]
  onCardClick: (opp: SalesCardOpp) => void
  onDrop?: (oppId: string, toStage: string) => void
  onCardContextMenu?: (e: React.MouseEvent, oppId: string) => void
}) {
  const [isDragOver, setIsDragOver] = useState(false)
  const total = opportunities.reduce((s, o) => s + (o.value || 0), 0)
  const factored = opportunities.reduce((s, o) => s + (o.value || 0) * (o.probability || 0) / 100, 0)

  const byHeat: Record<string, SalesCardOpp[]> = { hot: [], warm: [], cold: [], parked: [] }
  opportunities.forEach(o => {
    const h = o.heat || 'warm'
    if (byHeat[h]) byHeat[h].push(o)
    else byHeat.warm.push(o)
  })
  Object.values(byHeat).forEach(arr =>
    arr.sort((a, b) => ((b.value || 0) * (b.probability || 0)) - ((a.value || 0) * (a.probability || 0)))
  )

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
        background: isDragOver ? '#DBEAFE' : '#F3F4F6',
        borderRadius: '8px 8px 0 0',
        transition: 'background 0.15s',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0a0f1e' }}>{label}</span>
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
          HEAT_ORDER.map(heat => {
            const cards = byHeat[heat]
            if (cards.length === 0) return null
            const isCollapsible = heat === 'cold' || heat === 'parked'
            return (
              <CollapsibleHeatGroup
                key={heat}
                heat={heat}
                cards={cards}
                isCollapsible={isCollapsible}
                onCardClick={onCardClick}
                onCardContextMenu={onCardContextMenu}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

function CollapsibleHeatGroup({
  heat,
  cards,
  isCollapsible,
  onCardClick,
  onCardContextMenu,
}: {
  heat: string
  cards: SalesCardOpp[]
  isCollapsible: boolean
  onCardClick: (opp: SalesCardOpp) => void
  onCardContextMenu?: (e: React.MouseEvent, oppId: string) => void
}) {
  const [isOpen, setIsOpen] = useState(!isCollapsible)
  const meta = HEAT_LABELS[heat] || HEAT_LABELS.warm

  return (
    <div style={{ marginBottom: 8 }}>
      <div
        onClick={isCollapsible ? () => setIsOpen(!isOpen) : undefined}
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: meta.color,
          padding: '6px 4px',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          cursor: isCollapsible ? 'pointer' : 'default',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {isCollapsible && <span style={{ fontSize: 8, display: 'inline-block', transition: 'transform 0.15s', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>&#9654;</span>}
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, display: 'inline-block' }} />
        {meta.label} &middot; {cards.length}
      </div>
      {isOpen && cards.map(opp => (
        <SalesCard key={opp.id} opp={opp} onClick={() => onCardClick(opp)} draggable onContextMenu={onCardContextMenu ? (e) => onCardContextMenu(e, opp.id) : undefined} />
      ))}
    </div>
  )
}
