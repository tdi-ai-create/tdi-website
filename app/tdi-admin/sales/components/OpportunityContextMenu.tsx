'use client'

import { useEffect, useRef, useState } from 'react'
import { ContextMenu } from './context-menu/ContextMenu'

export interface ContextMenuOpportunity {
  supabase_id: string
  ghl_id: string | null
  name: string
  stage: string
  value: number | null
  assigned_to_email?: string | null
  contact_email?: string | null
}

interface Props {
  opportunity: ContextMenuOpportunity | null
  position: { x: number; y: number } | null
  onClose: () => void
  onOpenDetail: (id: string) => void
  onStageChange: (id: string, stage: string) => void
  onHeatChange: (id: string, heat: string) => void
  onAssignChange: (id: string, email: string | null) => void
  onAddNote: (id: string) => void
  onMarkWon: (id: string) => void
  onMarkLost: (id: string) => void
  onDelete: (id: string) => void
  showToast: (message: string, type: 'success' | 'error') => void
}

export function OpportunityContextMenu(props: Props) {
  const { opportunity, position, onClose } = props
  const menuRef = useRef<HTMLDivElement>(null)
  const [adjustedPos, setAdjustedPos] = useState<{ x: number; y: number } | null>(null)

  // Flip position to stay within viewport after mount
  useEffect(() => {
    if (!position || !menuRef.current) { setAdjustedPos(position); return }
    const el = menuRef.current
    const vw = window.innerWidth
    const vh = window.innerHeight
    const mw = el.offsetWidth || 220
    const mh = el.offsetHeight || 360
    let { x, y } = position
    if (x + mw > vw - 8) x = Math.max(8, x - mw)
    if (y + mh > vh - 8) y = Math.max(8, y - mh)
    setAdjustedPos({ x, y })
  }, [position])

  // Close on outside click or Escape
  useEffect(() => {
    if (!opportunity) return
    function onMouse(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onMouse)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouse)
      document.removeEventListener('keydown', onKey)
    }
  }, [opportunity, onClose])

  if (!opportunity || !position) return null

  const pos = adjustedPos ?? position

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-visible"
      style={{ left: pos.x, top: pos.y, minWidth: 220 }}
    >
      <ContextMenu
        opportunity={opportunity}
        onClose={props.onClose}
        onOpenDetail={props.onOpenDetail}
        onStageChange={props.onStageChange}
        onHeatChange={props.onHeatChange}
        onAssignChange={props.onAssignChange}
        onAddNote={props.onAddNote}
        onMarkWon={props.onMarkWon}
        onMarkLost={props.onMarkLost}
        onDelete={props.onDelete}
        showToast={props.showToast}
      />
    </div>
  )
}
