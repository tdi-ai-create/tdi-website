'use client'

import { Language } from '@/lib/wego-survey-translations'

interface LanguageToggleProps {
  language: Language
  onToggle: (lang: Language) => void
}

export function LanguageToggle({ language, onToggle }: LanguageToggleProps) {
  return (
    <div className="inline-flex rounded-full overflow-hidden border border-gray-200 bg-white shadow-sm">
      <button
        onClick={() => onToggle('en')}
        className={`px-3 py-1.5 text-sm font-medium transition-colors ${
          language === 'en'
            ? 'bg-[#0ABFB8] text-white'
            : 'bg-white text-[#1e2749] hover:bg-gray-50'
        }`}
      >
        English
      </button>
      <button
        onClick={() => onToggle('es')}
        className={`px-3 py-1.5 text-sm font-medium transition-colors ${
          language === 'es'
            ? 'bg-[#0ABFB8] text-white'
            : 'bg-white text-[#1e2749] hover:bg-gray-50'
        }`}
      >
        Espanol
      </button>
    </div>
  )
}
