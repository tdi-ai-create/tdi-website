'use client'

interface ExampleBannerProps {
  message?: string
  compact?: boolean
}

export function ExampleBanner({
  message = 'Example - updates when your data is entered',
  compact = false,
}: ExampleBannerProps) {
  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold"
        style={{ background: '#FEF3C7', color: '#92400E', border: '1px dashed #D97706' }}
      >
        Example
      </span>
    )
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold mb-3"
      style={{ background: '#FEF3C7', color: '#92400E', border: '1px dashed #D97706' }}
    >
      <span>⚡</span>
      {message}
    </div>
  )
}
