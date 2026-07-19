'use client'

import { useState } from 'react'
import { Settings, ChevronDown, ChevronUp } from 'lucide-react'
import {
  type GameSettings,
  type Difficulty,
  type GradeBand,
  type EducatorRole,
  DEFAULT_SETTINGS,
  DIFFICULTY_CONFIG,
  GRADE_BAND_CONFIG,
  ROLE_CONFIG,
} from '../data/gameSettings'
import { COLORS } from '../data/gameConfig'

interface GameSettingsPanelProps {
  settings: GameSettings
  onChange: (settings: GameSettings) => void
  language: 'en' | 'es'
  accentColor?: string
  /** Which setting rows to show (default: all three) */
  show?: ('difficulty' | 'gradeBand' | 'role')[]
}

export function GameSettingsPanel({
  settings,
  onChange,
  language,
  accentColor = '#7C9CBF',
  show = ['difficulty', 'gradeBand', 'role'],
}: GameSettingsPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const lang = language === 'es' ? 'es' : 'en'

  const hasNonDefault =
    settings.difficulty !== 'all' ||
    settings.gradeBand !== 'all' ||
    settings.role !== 'all'

  return (
    <div
      className="w-full max-w-lg rounded-xl mb-6 overflow-hidden transition-all"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Toggle header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3 transition-colors hover:bg-white/5"
      >
        <div className="flex items-center gap-2">
          <Settings size={16} style={{ color: hasNonDefault ? accentColor : '#8899aa' }} />
          <span className="text-sm font-medium" style={{ color: hasNonDefault ? 'white' : '#8899aa' }}>
            {lang === 'es' ? 'Configuracion del juego' : 'Game Settings'}
          </span>
          {hasNonDefault && (
            <span
              className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
            >
              {lang === 'es' ? 'personalizado' : 'custom'}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp size={16} style={{ color: '#8899aa' }} />
        ) : (
          <ChevronDown size={16} style={{ color: '#8899aa' }} />
        )}
      </button>

      {/* Expandable settings */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Difficulty */}
          {show.includes('difficulty') && (
            <div className="pt-4">
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8899aa' }}>
                {lang === 'es' ? 'Nivel de dificultad' : 'Difficulty'}
              </p>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTY_CONFIG.map((d) => {
                  const isSelected = settings.difficulty === d.value
                  return (
                    <button
                      key={d.value}
                      onClick={() => onChange({ ...settings, difficulty: d.value })}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        backgroundColor: isSelected ? `${d.accent}25` : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${isSelected ? d.accent : 'rgba(255,255,255,0.1)'}`,
                        color: isSelected ? d.accent : '#8899aa',
                      }}
                    >
                      {d.label[lang]}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Grade Band */}
          {show.includes('gradeBand') && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8899aa' }}>
                {lang === 'es' ? 'Nivel de grado' : 'Grade Level'}
              </p>
              <div className="flex flex-wrap gap-2">
                {GRADE_BAND_CONFIG.map((g) => {
                  const isSelected = settings.gradeBand === g.value
                  return (
                    <button
                      key={g.value}
                      onClick={() => onChange({ ...settings, gradeBand: g.value })}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        backgroundColor: isSelected ? `${accentColor}25` : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${isSelected ? accentColor : 'rgba(255,255,255,0.1)'}`,
                        color: isSelected ? accentColor : '#8899aa',
                      }}
                    >
                      {g.label[lang]}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Role */}
          {show.includes('role') && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8899aa' }}>
                {lang === 'es' ? 'Tu rol' : 'Your Role'}
              </p>
              <div className="flex flex-wrap gap-2">
                {ROLE_CONFIG.map((r) => {
                  const isSelected = settings.role === r.value
                  return (
                    <button
                      key={r.value}
                      onClick={() => onChange({ ...settings, role: r.value })}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        backgroundColor: isSelected ? `${accentColor}25` : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${isSelected ? accentColor : 'rgba(255,255,255,0.1)'}`,
                        color: isSelected ? accentColor : '#8899aa',
                      }}
                    >
                      {r.label[lang]}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Reset */}
          {hasNonDefault && (
            <button
              onClick={() => onChange(DEFAULT_SETTINGS)}
              className="text-xs underline transition-opacity hover:opacity-80"
              style={{ color: '#8899aa' }}
            >
              {lang === 'es' ? 'Restablecer a predeterminados' : 'Reset to defaults'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
