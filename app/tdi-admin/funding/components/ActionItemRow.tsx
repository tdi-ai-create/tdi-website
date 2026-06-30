'use client'

interface ActionItemRowProps {
  id: string
  title: string
  description?: string
  ownerType: 'tdi' | 'client'
  ownerName?: string
  dueDate?: string | null
  status: 'pending' | 'in_progress' | 'done' | 'blocked' | 'skipped'
  preparedMaterials?: string
  nudgeCount?: number
  onToggleDone: (id: string) => void
  onNudge?: (id: string) => void
}

function isOverdue(dueDate: string | null | undefined, status: string): boolean {
  if (!dueDate || (status !== 'pending' && status !== 'in_progress')) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00')
  return due < today
}

function getDueDateStyle(dueDate: string | null | undefined): { color: string; bg: string } {
  if (!dueDate) return { color: '#9CA3AF', bg: 'transparent' }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00')
  const diff = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return { color: '#DC2626', bg: '#FEF2F2' }
  if (diff <= 3) return { color: '#DC2626', bg: '#FEF2F2' }
  if (diff <= 7) return { color: '#C2410C', bg: '#FFF7ED' }
  if (diff <= 14) return { color: '#D97706', bg: '#FFFBEB' }
  return { color: '#6B7280', bg: 'transparent' }
}

export function ActionItemRow({
  id,
  title,
  description,
  ownerType,
  ownerName,
  dueDate,
  status,
  preparedMaterials,
  nudgeCount,
  onToggleDone,
  onNudge,
}: ActionItemRowProps) {
  const isDone = status === 'done' || status === 'skipped'
  const overdue = isOverdue(dueDate, status)
  const dueDateStyle = getDueDateStyle(dueDate)

  return (
    <div
      style={{
        padding: '10px 14px',
        borderBottom: '1px solid #F3F4F6',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        borderLeft: status === 'blocked' ? '3px solid #F59E0B' : 'none',
      }}
    >
      {/* Checkbox */}
      <div
        onClick={() => onToggleDone(id)}
        style={{
          width: 18,
          height: 18,
          minWidth: 18,
          borderRadius: 4,
          border: isDone ? 'none' : '2px solid #D1D5DB',
          background: isDone ? '#8B5CF6' : 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 2,
        }}
      >
        {isDone && (
          <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: isDone ? '#9CA3AF' : overdue ? '#DC2626' : '#0a0f1e',
            textDecoration: isDone ? 'line-through' : 'none',
          }}
        >
          {title}
        </div>
        {description && (
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{description}</div>
        )}
        {ownerType === 'client' && preparedMaterials && (
          <div style={{ fontSize: 10, color: '#9CA3AF', fontStyle: 'italic', marginTop: 3 }}>
            TDI prepared: {preparedMaterials}
          </div>
        )}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, whiteSpace: 'nowrap' }}>
        {ownerName && (
          <span style={{ fontSize: 11, color: '#6B7280' }}>{ownerName}</span>
        )}
        {dueDate && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: dueDateStyle.color,
              background: dueDateStyle.bg,
              padding: '1px 6px',
              borderRadius: 4,
            }}
          >
            {dueDate}
          </span>
        )}
        {ownerType === 'client' && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {(nudgeCount ?? 0) > 0 && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 8,
                  background: '#FFF7ED',
                  color: '#C2410C',
                }}
              >
                Nudged {nudgeCount}x
              </span>
            )}
            {onNudge && !isDone && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onNudge(id)
                }}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 6,
                  border: '1px solid #E5E7EB',
                  background: 'white',
                  color: '#6B7280',
                  cursor: 'pointer',
                }}
              >
                Nudge
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
