'use client'

import type { TDISuggestion } from '@/lib/dashboard/generateSuggestions'

interface TDISuggestionsProps {
  suggestions: TDISuggestion[]
  isAdminView?: boolean
}

const PRIORITY_STYLES = {
  high: {
    border: '#FCA5A5',
    bg: '#FFF5F5',
    dot: '#DC2626',
    label: 'Priority',
    labelBg: '#FEE2E2',
    labelText: '#991B1B',
  },
  medium: {
    border: '#FCD34D',
    bg: '#FFFBEB',
    dot: '#D97706',
    label: 'Suggested',
    labelBg: '#FEF3C7',
    labelText: '#92400E',
  },
  low: {
    border: '#BBF7D0',
    bg: '#F0FDF4',
    dot: '#16A34A',
    label: 'On Track',
    labelBg: '#DCFCE7',
    labelText: '#166534',
  },
}

export function TDISuggestions({ suggestions, isAdminView = false }: TDISuggestionsProps) {
  if (!suggestions || suggestions.length === 0) return null

  // On principal view, skip purely internal suggestions
  const visible = isAdminView
    ? suggestions
    : suggestions.filter((s) => s.category !== 'action' || s.cta)

  if (visible.length === 0) return null

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-6 mb-4"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">TDI Suggestions</h2>
          <p className="text-sm text-gray-400 mt-0.5">Based on your current partnership data</p>
        </div>
        {isAdminView && (
          <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-semibold">
            Auto-generated
          </span>
        )}
      </div>

      <div className="space-y-3">
        {visible.map((suggestion) => {
          const style = PRIORITY_STYLES[suggestion.priority]
          return (
            <div
              key={suggestion.id}
              className="rounded-xl p-4 border"
              style={{ background: style.bg, borderColor: style.border }}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5">{suggestion.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">{suggestion.title}</span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: style.labelBg, color: style.labelText }}
                    >
                      {style.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{suggestion.body}</p>
                  {suggestion.cta && suggestion.ctaUrl && (
                    <a
                      href={suggestion.ctaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
                      style={{ background: '#1B2A4A', color: '#FFFFFF' }}
                    >
                      {suggestion.cta} →
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
