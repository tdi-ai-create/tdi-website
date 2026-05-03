'use client'

const STAGE_OPTIONS = [
  { id: 'targeting', name: 'Targeting (5%)' },
  { id: 'engaged', name: 'Engaged (10%)' },
  { id: 'qualified', name: 'Qualified (30%)' },
  { id: 'likely_yes', name: 'Likely Yes (50%)' },
  { id: 'proposal_sent', name: 'Proposal Sent (70%)' },
  { id: 'signed', name: 'Signed (90%)' },
  { id: 'paid', name: 'Paid (100%)' },
  { id: 'lost', name: 'Lost' },
]

interface Props {
  current: string
  onSelect: (stage: string) => void
}

export function StageSubmenu({ current, onSelect }: Props) {
  return (
    <div className="absolute left-full top-0 bg-white border border-gray-200 rounded-xl shadow-2xl py-1 min-w-44 z-10">
      {STAGE_OPTIONS.map(s => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
            s.id === current ? 'text-indigo-600 font-medium' : 'text-gray-700'
          }`}
        >
          {s.name}
          {s.id === current && <span className="text-indigo-400 text-xs">✓</span>}
        </button>
      ))}
    </div>
  )
}
