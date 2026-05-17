'use client'

import type { FullOpportunity } from '../OpportunityDetailPanel'

interface FieldProps {
  label: string
  value: string | null | undefined
  onSave: (v: string) => void
  type?: string
}

function EditableField({ label, value, onSave, type = 'text' }: FieldProps) {
  return (
    <div>
      <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</label>
      <input
        type={type}
        defaultValue={value ?? ''}
        onBlur={e => {
          if (e.target.value !== (value ?? '')) onSave(e.target.value)
        }}
        className="block w-full mt-0.5 text-sm text-gray-800 border-b border-gray-200 outline-none py-1.5 hover:border-indigo-300 focus:border-indigo-500 bg-transparent transition-colors"
        placeholder={`Enter ${label.toLowerCase()}...`}
      />
    </div>
  )
}

interface Props {
  opp: FullOpportunity
  onPatch: (changes: Partial<FullOpportunity>) => void
}

export function ContactTab({ opp, onPatch }: Props) {
  const o = opp as any
  return (
    <div className="p-4 space-y-5">
      <EditableField
        label="Contact Name"
        value={o.contact_name}
        onSave={v => onPatch({ contact_name: v } as any)}
      />
      <EditableField
        label="Title"
        value={o.contact_title}
        onSave={v => onPatch({ contact_title: v } as any)}
      />
      <EditableField
        label="Email"
        value={o.contact_email}
        type="email"
        onSave={v => onPatch({ contact_email: v } as any)}
      />
      <EditableField
        label="Phone"
        value={o.contact_phone}
        type="tel"
        onSave={v => onPatch({ contact_phone: v } as any)}
      />
      {o.contact_email && (
        <a
          href={`mailto:${o.contact_email}`}
          className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline"
        >
          Email this contact →
        </a>
      )}
    </div>
  )
}
