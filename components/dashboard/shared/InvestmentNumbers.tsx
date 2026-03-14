'use client'
import { useExampleMode } from '@/lib/dashboard/useExampleMode'
import { ExampleBanner } from './ExampleBanner'

interface InvestmentNumbersProps {
  costPerEducator?:    number | null
  hubLoginPct?:        number | null
  loveNotesCount?:     number | null
  highEngagementPct?:  number | null
  perEducatorNote?:    string | null
  defaults:            Record<string, string>
}

function InvestmentStat({ value, label, sublabel, isExample }: {
  value: string | number
  label: string
  sublabel?: string
  isExample?: boolean
}) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1">
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        {isExample && <ExampleBanner compact />}
      </div>
      <div className="text-sm font-semibold text-gray-600 mt-1">{label}</div>
      {sublabel && <div className="text-xs text-gray-400 mt-0.5 leading-snug">{sublabel}</div>}
    </div>
  )
}

export function InvestmentNumbers({
  costPerEducator, hubLoginPct, loveNotesCount,
  highEngagementPct, perEducatorNote, defaults,
}: InvestmentNumbersProps) {
  const cost     = useExampleMode(costPerEducator,   'cost_per_educator',    defaults)
  const hubLogin = useExampleMode(hubLoginPct,       'hub_login_pct',        defaults)
  const notes    = useExampleMode(loveNotesCount,    'love_notes_count',     defaults)
  const highEng  = useExampleMode(highEngagementPct, 'high_engagement_pct',  defaults)
  const noteText = perEducatorNote || defaults.per_educator_value_note || 'per educator'

  const anyExample = cost.isExample || notes.isExample || highEng.isExample

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Your Investment, By The Numbers</h2>
      <p className="text-sm text-gray-400 mb-6">What this partnership delivers - in impact and value</p>

      {anyExample && (
        <ExampleBanner message="Your investment numbers will appear here after your first observation day." />
      )}

      <div className="grid grid-cols-4 gap-6">
        <InvestmentStat
          value={`$${cost.displayValue}`}
          label="per educator"
          sublabel={noteText}
          isExample={cost.isExample}
        />
        <InvestmentStat
          value={`${hubLogin.displayValue}%`}
          label="Hub login rate"
          sublabel="Hub login rate - every educator activated"
          isExample={hubLogin.isExample}
        />
        <InvestmentStat
          value={String(notes.displayValue)}
          label="Love Notes"
          sublabel="personalized Love Notes delivered across observation days"
          isExample={notes.isExample}
        />
        <InvestmentStat
          value={`${highEng.displayValue}%`}
          label="high engagement"
          sublabel="of observed educators showing high Hub engagement"
          isExample={highEng.isExample}
        />
      </div>
    </div>
  )
}
