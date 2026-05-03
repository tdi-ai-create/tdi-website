'use client'

const ASSIGNEES = [
  { email: 'rae@teachersdeserveit.com', label: 'Rae' },
  { email: 'jim@teachersdeserveit.com', label: 'Jim' },
]

interface Props {
  current: string | null
  onSelect: (email: string | null) => void
}

export function AssignSubmenu({ current, onSelect }: Props) {
  return (
    <div className="absolute left-full top-0 bg-white border border-gray-200 rounded-xl shadow-2xl py-1 min-w-36 z-10">
      {ASSIGNEES.map(a => (
        <button
          key={a.email}
          onClick={() => onSelect(a.email)}
          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
            a.email === current ? 'text-indigo-600 font-medium' : 'text-gray-700'
          }`}
        >
          {a.label}
          {a.email === current && <span className="text-indigo-400 text-xs">✓</span>}
        </button>
      ))}
      <hr className="border-gray-100 my-0.5 mx-3" />
      <button
        onClick={() => onSelect(null)}
        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
          !current ? 'text-indigo-600 font-medium' : 'text-gray-500'
        }`}
      >
        Unassigned
        {!current && <span className="text-indigo-400 text-xs ml-2">✓</span>}
      </button>
    </div>
  )
}
