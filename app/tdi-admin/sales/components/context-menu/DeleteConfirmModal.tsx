'use client'

import type { ContextMenuOpportunity } from '../OpportunityContextMenu'

interface Props {
  opportunity: ContextMenuOpportunity
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmModal({ opportunity, onConfirm, onCancel }: Props) {
  const isClosedDeal = opportunity.stage === 'paid' || opportunity.stage === 'signed'

  return (
    <div className="fixed inset-0 bg-black/40 z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4">
        <h3 className="font-semibold text-gray-900">Delete this deal?</h3>
        <div className="bg-gray-50 rounded-xl px-3 py-2.5 space-y-0.5">
          <p className="text-sm font-medium text-gray-800 truncate">{opportunity.name}</p>
          {opportunity.value && (
            <p className="text-sm text-gray-500">
              ${opportunity.value.toLocaleString()} in {opportunity.stage}
            </p>
          )}
        </div>
        {isClosedDeal && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <p className="text-xs text-amber-700 font-medium">
              This is a closed deal. Are you sure you want to delete it?
            </p>
          </div>
        )}
        <p className="text-xs text-gray-500">
          This will remove the opportunity, all notes, and all activity history. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 text-sm border border-gray-200 text-gray-600 py-2 rounded-xl hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 text-sm bg-red-600 text-white py-2 rounded-xl hover:bg-red-700 font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
