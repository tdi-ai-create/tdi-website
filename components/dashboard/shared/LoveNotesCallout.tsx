'use client'
import { useExampleMode } from '@/lib/dashboard/useExampleMode'
import { ExampleBanner } from './ExampleBanner'

interface LoveNotesCalloutProps {
  loveNotesCount?: number | null
  schoolName:      string
  observationDays: number
  defaults:        Record<string, string>
}

export function LoveNotesCallout({
  loveNotesCount, schoolName, observationDays, defaults
}: LoveNotesCalloutProps) {
  const notes = useExampleMode(loveNotesCount, 'love_notes_count', defaults)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4 text-center"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      {notes.isExample && (
        <ExampleBanner message="After your first observation day, this will show your real Love Notes count." />
      )}
      <div className="text-4xl mb-2">🎉</div>
      <p className="text-base font-semibold text-gray-800">
        <span className="font-bold text-lg">{notes.displayValue}</span> personalized Love Notes delivered
        to {schoolName} educators across {observationDays} observation {observationDays === 1 ? 'day' : 'days'}.
      </p>
      <p className="text-sm text-gray-400 mt-2">
        Every educator observed - seen, celebrated, and connected to targeted Hub resources.
      </p>
    </div>
  )
}
