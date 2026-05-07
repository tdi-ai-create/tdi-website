'use client'

const OWNER_COLORS: Record<string, { bg: string; initial: string; textColor?: string }> = {
  'olivia@teachersdeserveit.com': { bg: '#8B5CF6', initial: 'O' },
  'vanessa@teachersdeserveit.com': { bg: '#2A9D8F', initial: 'V' },
  'marcus@teachersdeserveit.com': { bg: '#3B82F6', initial: 'M' },
  'amara@teachersdeserveit.com': { bg: '#3B82F6', initial: 'A' },
  'erin@teachersdeserveit.com': { bg: '#F4C430', initial: 'E', textColor: '#0a0f1e' },
  'rae@teachersdeserveit.com': { bg: '#E76F51', initial: 'R' },
}

export function OwnerAvatar({ email, size = 28 }: { email: string | null; size?: number }) {
  const config = email ? OWNER_COLORS[email] : null
  const initial = config?.initial || (email ? email.charAt(0).toUpperCase() : '?')
  const bg = config?.bg || '#6B7280'
  const textColor = config?.textColor || 'white'

  return (
    <div
      title={email || 'Unassigned'}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color: textColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  )
}

export function ownerName(email: string | null): string {
  if (!email) return 'Unassigned'
  return email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)
}
