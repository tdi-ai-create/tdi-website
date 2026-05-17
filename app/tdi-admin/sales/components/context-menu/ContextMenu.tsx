'use client'

import { useState } from 'react'
import { StageSubmenu } from './StageSubmenu'
import { HeatSubmenu } from './HeatSubmenu'
import { AssignSubmenu } from './AssignSubmenu'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { LostReasonModal } from './LostReasonModal'
import type { ContextMenuOpportunity } from '../OpportunityContextMenu'

interface Props {
  opportunity: ContextMenuOpportunity
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

function Divider() {
  return <hr className="border-gray-100 my-0.5 mx-3" />
}

function Item({
  icon, label, onClick, danger,
}: {
  icon: string
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
        danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <span className="text-base w-5 text-center">{icon}</span>
      {label}
    </button>
  )
}

type Submenu = 'stage' | 'heat' | 'assign' | null

function SubmenuTrigger({
  icon, label, open, onToggle, children,
}: {
  icon: string
  label: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="w-full text-left flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2.5">
          <span className="text-base w-5 text-center">{icon}</span>
          {label}
        </span>
        <span className="text-gray-400 text-xs">▶</span>
      </button>
      {open && children}
    </div>
  )
}

export function ContextMenu({
  opportunity, onClose, onOpenDetail, onStageChange, onHeatChange,
  onAssignChange, onAddNote, onMarkWon, onMarkLost, onDelete, showToast,
}: Props) {
  const [openSubmenu, setOpenSubmenu] = useState<Submenu>(null)
  const [showDelete, setShowDelete] = useState(false)
  const [showLost, setShowLost] = useState(false)

  function toggle(sub: NonNullable<Submenu>) {
    setOpenSubmenu(o => o === sub ? null : sub)
  }

  function act(fn: () => void) {
    fn()
    onClose()
  }

  return (
    <>
      <div className="py-1">
        <Item icon="🔍" label="Open detail panel" onClick={() => act(() => onOpenDetail(opportunity.supabase_id))} />
        <Item icon="📝" label="Add note..." onClick={() => act(() => onAddNote(opportunity.supabase_id))} />
        <Divider />

        <SubmenuTrigger icon="📊" label="Stage" open={openSubmenu === 'stage'} onToggle={() => toggle('stage')}>
          <StageSubmenu
            current={opportunity.stage}
            onSelect={stage => { onStageChange(opportunity.supabase_id, stage); onClose() }}
          />
        </SubmenuTrigger>

        <SubmenuTrigger icon="🌡️" label="Heat" open={openSubmenu === 'heat'} onToggle={() => toggle('heat')}>
          <HeatSubmenu onSelect={heat => { onHeatChange(opportunity.supabase_id, heat); onClose() }} />
        </SubmenuTrigger>

        <SubmenuTrigger icon="👤" label="Assign to" open={openSubmenu === 'assign'} onToggle={() => toggle('assign')}>
          <AssignSubmenu
            current={opportunity.assigned_to_email ?? null}
            onSelect={email => { onAssignChange(opportunity.supabase_id, email); onClose() }}
          />
        </SubmenuTrigger>

        <Divider />
        <Item icon="✓" label="Mark as Won" onClick={() => act(() => onMarkWon(opportunity.supabase_id))} />
        <Item icon="✗" label="Mark as Lost..." onClick={() => setShowLost(true)} />
        <Divider />

        {opportunity.contact_email && (
          <>
            <Item
              icon="📋"
              label="Copy contact email"
              onClick={() => {
                navigator.clipboard.writeText(opportunity.contact_email!)
                  .then(() => showToast('Email copied', 'success'))
                  .catch(() => showToast('Copy failed', 'error'))
                onClose()
              }}
            />
            <Item
              icon="📧"
              label="Email this contact"
              onClick={() => { window.open(`mailto:${opportunity.contact_email}`); onClose() }}
            />
            <Divider />
          </>
        )}

        <Item icon="🗑️" label="Delete deal..." onClick={() => setShowDelete(true)} danger />
      </div>

      {showDelete && (
        <DeleteConfirmModal
          opportunity={opportunity}
          onConfirm={() => { onDelete(opportunity.supabase_id); onClose() }}
          onCancel={() => setShowDelete(false)}
        />
      )}

      {showLost && (
        <LostReasonModal
          onConfirm={reason => { onMarkLost(opportunity.supabase_id); onClose() }}
          onCancel={() => setShowLost(false)}
        />
      )}
    </>
  )
}
