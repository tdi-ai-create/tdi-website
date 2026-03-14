'use client'
import { Users, CheckCircle, BookOpen, Target } from 'lucide-react'
import { ExampleBanner } from './ExampleBanner'
import { useExampleMode } from '@/lib/dashboard/useExampleMode'

interface StatCardsProps {
  staffEnrolled:       number | null
  hubLoginPct:         number | null
  observationsUsed:    number
  observationsTotal:   number
  virtualUsed:         number
  virtualTotal:        number
  executiveUsed:       number
  executiveTotal:      number
  phase:               string
  defaults:            Record<string, string>
}

export function StatCards({
  staffEnrolled, hubLoginPct,
  observationsUsed, observationsTotal,
  virtualUsed, virtualTotal,
  executiveUsed, executiveTotal,
  phase, defaults,
}: StatCardsProps) {
  const staff    = useExampleMode(staffEnrolled,  'staff_enrolled', defaults)
  const hubLogin = useExampleMode(hubLoginPct,    'hub_login_pct',  defaults)

  const deliverablesDone  = observationsUsed + virtualUsed + executiveUsed
  const deliverablesTotal = observationsTotal + virtualTotal + executiveTotal

  const anyExample = staff.isExample || hubLogin.isExample

  return (
    <div className="mb-6">
      {anyExample && (
        <ExampleBanner message="These numbers will update as your partnership activates." />
      )}
      <div className="grid grid-cols-4 gap-4">

        {/* Staff Enrolled */}
        <div className="bg-white rounded-xl p-5 border border-gray-100"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between mb-3">
            <Users size={20} style={{ color: '#2D7D78' }} />
            {staff.isExample && <ExampleBanner compact />}
          </div>
          <div className="text-3xl font-bold mb-1" style={{ color: '#2D7D78' }}>
            {staff.displayValue}/{staff.displayValue}
          </div>
          <div className="text-sm font-semibold text-gray-700">Staff Enrolled</div>
          <div className="text-xs text-gray-400 mt-1">
            {hubLogin.displayValue}% Hub login rate
          </div>
          <div className="mt-2 h-1 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: '100%', background: '#2D7D78' }} />
          </div>
        </div>

        {/* Deliverables */}
        <div className="bg-white rounded-xl p-5 border border-gray-100"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between mb-3">
            <CheckCircle size={20} style={{ color: '#D97706' }} />
          </div>
          <div className="text-3xl font-bold mb-1" style={{ color: '#D97706' }}>
            {deliverablesDone}/{deliverablesTotal}
          </div>
          <div className="text-sm font-semibold text-gray-700">Deliverables</div>
          <div className="text-xs text-gray-400 mt-1">completed vs. contracted</div>
          <div className="mt-2 h-1 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: deliverablesTotal > 0 ? `${(deliverablesDone/deliverablesTotal)*100}%` : '0%',
                background: '#D97706'
              }}
            />
          </div>
        </div>

        {/* Hub Engagement */}
        <div className="bg-white rounded-xl p-5 border border-gray-100"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between mb-3">
            <BookOpen size={20} style={{ color: '#2D7D78' }} />
            {hubLogin.isExample && <ExampleBanner compact />}
          </div>
          <div className="text-3xl font-bold mb-1" style={{ color: '#2D7D78' }}>
            {hubLogin.displayValue}%
          </div>
          <div className="text-sm font-semibold text-gray-700">Hub Engagement</div>
          <div className="text-xs text-gray-400 mt-1">
            {staff.displayValue} logged in
          </div>
          <div className="mt-2 h-1 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${hubLogin.displayValue}%`, background: '#2D7D78' }}
            />
          </div>
        </div>

        {/* Current Phase */}
        <div className="bg-white rounded-xl p-5 border border-gray-100"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between mb-3">
            <Target size={20} style={{ color: '#1B2A4A' }} />
          </div>
          <div className="text-3xl font-bold mb-1" style={{ color: '#1B2A4A' }}>
            {phase}
          </div>
          <div className="text-sm font-semibold text-gray-700">Current Phase</div>
          <div className="text-xs text-gray-400 mt-1">
            Phase {phase === 'IGNITE' ? 1 : phase === 'ACCELERATE' ? 2 : 3} of 3
          </div>
          <div className="mt-2 flex gap-1">
            {['IGNITE', 'ACCELERATE', 'SUSTAIN'].map((p, i) => (
              <div key={p} className="flex-1 h-1 rounded-full"
                style={{ background: i <= (['IGNITE','ACCELERATE','SUSTAIN'].indexOf(phase)) ? '#1B2A4A' : '#E5E7EB' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
