'use client'
import { useExampleMode } from '@/lib/dashboard/useExampleMode'
import { ExampleBanner } from './ExampleBanner'

interface LeadingIndicatorsProps {
  teacherStress?:         number | null
  strategyImplementation?: number | null
  retentionIntent?:       number | null
  defaults:               Record<string, string>
}

function IndicatorBar({ label, value, direction, industryLow, industryHigh, tdiAvgLow, tdiAvgHigh, isExample }: {
  label: string
  value: string | number
  direction: 'lower' | 'higher'
  industryLow: number
  industryHigh: number
  tdiAvgLow: number
  tdiAvgHigh: number
  isExample?: boolean
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">{label}</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: '#F0F9FF', color: '#0369A1' }}>
            {direction === 'lower' ? '↓ Lower is better' : '↑ Higher is better'}
          </span>
        </div>
        {isExample && <ExampleBanner compact />}
      </div>
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div>
          <div className="text-gray-400 mb-1">Industry</div>
          <div className="h-2 rounded-full bg-red-200 w-full" />
          <div className="text-gray-500 mt-1">{industryLow}-{industryHigh}/10</div>
        </div>
        <div>
          <div className="text-gray-400 mb-1">TDI Partners</div>
          <div className="h-2 rounded-full bg-gray-700 w-3/4" />
          <div className="text-gray-500 mt-1">{tdiAvgLow}-{tdiAvgHigh}/10</div>
        </div>
        <div>
          <div className="text-gray-400 mb-1">This District</div>
          <div className="h-2 rounded-full w-2/3" style={{ background: '#2D7D78' }} />
          <div className="font-bold mt-1" style={{ color: '#2D7D78' }}>{value}/10</div>
        </div>
      </div>
    </div>
  )
}

export function LeadingIndicators({
  teacherStress, strategyImplementation, retentionIntent, defaults,
}: LeadingIndicatorsProps) {
  const stress   = useExampleMode(teacherStress,           'teacher_stress',           defaults)
  const strategy = useExampleMode(strategyImplementation,  'strategy_implementation',  defaults)
  const retention = useExampleMode(retentionIntent,        'retention_intent',         defaults)

  const anyExample = stress.isExample || strategy.isExample || retention.isExample

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: anyExample ? '1px dashed #D97706' : undefined }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Leading Indicators</h2>
        <a href="#" className="text-xs font-semibold" style={{ color: '#2D7D78' }}>View Impact →</a>
      </div>

      {anyExample && (
        <ExampleBanner message="Example from a real TDI district - your indicators will appear after your baseline survey." />
      )}

      <IndicatorBar
        label="Teacher Stress"
        value={stress.displayValue}
        direction="lower"
        industryLow={8} industryHigh={9}
        tdiAvgLow={5} tdiAvgHigh={7}
        isExample={stress.isExample}
      />
      <IndicatorBar
        label="Strategy Implementation"
        value={`${strategy.displayValue}%`}
        direction="higher"
        industryLow={10} industryHigh={10}
        tdiAvgLow={65} tdiAvgHigh={65}
        isExample={strategy.isExample}
      />
      <IndicatorBar
        label="Retention Intent"
        value={retention.displayValue}
        direction="higher"
        industryLow={2} industryHigh={4}
        tdiAvgLow={5} tdiAvgHigh={7}
        isExample={retention.isExample}
      />

      <p className="text-xs text-gray-400 mt-4">
        Industry data: RAND 2025, Learning Policy Institute - TDI data: Partner school surveys
      </p>
    </div>
  )
}
