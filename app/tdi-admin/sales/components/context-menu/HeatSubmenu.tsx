'use client'

const HEAT_OPTIONS = [
  { id: 'hot', label: 'Hot', emoji: '🔥' },
  { id: 'warm', label: 'Warm', emoji: '🟡' },
  { id: 'cold', label: 'Cold', emoji: '❄️' },
  { id: 'parked', label: 'Parked', emoji: '🅿️' },
]

interface Props {
  onSelect: (heat: string) => void
}

export function HeatSubmenu({ onSelect }: Props) {
  return (
    <div className="absolute left-full top-0 bg-white border border-gray-200 rounded-xl shadow-2xl py-1 min-w-36 z-10">
      {HEAT_OPTIONS.map(h => (
        <button
          key={h.id}
          onClick={() => onSelect(h.id)}
          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <span>{h.emoji}</span>
          {h.label}
        </button>
      ))}
    </div>
  )
}
