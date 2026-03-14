'use client'
import { useExampleMode } from '@/lib/dashboard/useExampleMode'
import { ExampleBanner } from './ExampleBanner'

interface MomentumBarProps {
  status?:  string | null
  detail?:  string | null
  defaults: Record<string, string>
}

const MOMENTUM_COLORS: Record<string, string> = {
  'Strong':          '#16A34A',
  'Building':        '#D97706',
  'Needs Attention': '#DC2626',
}

export function MomentumBar({ status, detail, defaults }: MomentumBarProps) {
  const momentumStatus = useExampleMode(status, 'momentum_status', defaults)
  const momentumDetail = useExampleMode(detail, 'momentum_detail', defaults)
  const color = MOMENTUM_COLORS[String(momentumStatus.displayValue)] || '#D97706'

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 flex items-start gap-3"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: color }} />
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-sm font-semibold text-gray-700">Partnership Momentum:</span>
        <span className="text-sm font-bold" style={{ color }}>{momentumStatus.displayValue}</span>
        {momentumDetail.displayValue && (
          <span className="text-sm text-gray-400">{momentumDetail.displayValue}</span>
        )}
      </div>
      {(momentumStatus.isExample || momentumDetail.isExample) && (
        <ExampleBanner compact />
      )}
    </div>
  )
}
