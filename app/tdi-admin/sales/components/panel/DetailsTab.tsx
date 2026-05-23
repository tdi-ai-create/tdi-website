'use client'

import type { FullOpportunity } from '../OpportunityDetailPanel'

interface Props {
  opp: FullOpportunity
  onPatch: (changes: Partial<FullOpportunity>) => void
  stageOptions: { id: string; name: string }[]
}

function FieldWrapper({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</label>
      <div className="mt-0.5">{children}</div>
    </div>
  )
}

const inputCls = 'block w-full text-sm text-gray-800 border-b border-gray-200 outline-none py-1.5 hover:border-indigo-300 focus:border-indigo-500 bg-transparent transition-colors'
const selectCls = 'text-sm text-gray-800 border border-gray-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400'

export function DetailsTab({ opp, onPatch, stageOptions }: Props) {
  const o = opp as any
  return (
    <div className="p-4 space-y-5">
      <FieldWrapper label="Source">
        <input
          defaultValue={opp.source ?? ''}
          onBlur={e => { if (e.target.value !== (opp.source ?? '')) onPatch({ source: e.target.value }) }}
          className={inputCls}
          placeholder="Lead source..."
        />
      </FieldWrapper>

      <FieldWrapper label="Expected Close Date">
        <input
          type="date"
          defaultValue={o.expected_close_date?.split('T')[0] ?? ''}
          onBlur={e => { if (e.target.value) onPatch({ expected_close_date: e.target.value } as any) }}
          className={inputCls}
        />
      </FieldWrapper>

      <FieldWrapper label="Type">
        <select
          defaultValue={opp.type}
          onChange={e => onPatch({ type: e.target.value } as any)}
          className={selectCls}
        >
          {['new_business', 'renewal', 'upsell', 'reactivation', 'pilot', 'expansion'].map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </FieldWrapper>

      <FieldWrapper label="Assigned To">
        <select
          defaultValue={opp.assigned_to_email ?? ''}
          onChange={e => onPatch({ assigned_to_email: e.target.value || null })}
          className={selectCls}
        >
          <option value="">Unassigned</option>
          <option value="rae@teachersdeserveit.com">Rae</option>
          <option value="jim@teachersdeserveit.com">Jim</option>
        </select>
      </FieldWrapper>

      <FieldWrapper label="Contact Only">
        <label className="flex items-center gap-2 cursor-pointer mt-1">
          <input
            type="checkbox"
            checked={opp.is_contact_only}
            onChange={e => onPatch({ is_contact_only: e.target.checked } as any)}
            className="rounded"
          />
          <span className="text-sm text-gray-600">Mark as contact only</span>
        </label>
      </FieldWrapper>
    </div>
  )
}
