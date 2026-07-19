'use client'

import { useState, useEffect } from 'react'
import { Gamepad2, TrendingUp, Flame, RotateCcw, Target, Clock, ChevronRight } from 'lucide-react'
import { useGameTracking } from '@/lib/hub/useGameTracking'
import { useTranslation } from '@/lib/hub/useTranslation'
import Link from 'next/link'

// Maps session game_id to display info
const GAME_DISPLAY: Record<string, { title: string; accent: string }> = {
  'tell-or-ask': { title: 'Tell or Ask?', accent: '#F1C40F' },
  'feedback-level-up': { title: 'Feedback Level Up', accent: '#27AE60' },
  'question-knockout': { title: 'Question Knockout', accent: '#FF7847' },
  'feedback-makeover': { title: 'Feedback Makeover', accent: '#E74C3C' },
  'feedback-madlibs': { title: 'Feedback Madlibs', accent: '#9333EA' },
  'whats-your-move': { title: "What's Your Move?", accent: '#22b8bd' },
  'classroom-shuffle': { title: 'Classroom Shuffle', accent: '#3498DB' },
  'prioritize-this': { title: 'Prioritize This', accent: '#9333EA' },
  'energy-budget': { title: 'Energy Budget', accent: '#22b8bd' },
}

interface PerGameStats {
  plays: number
  bestScore: number
  bestStreak: number
  totalRounds: number
  avgAccuracy: number
  lastPlayed: string
}

interface AggregateStats {
  totalPlays: number
  totalTimeMinutes: number
  gamesPlayed: number
  perGame: Record<string, PerGameStats>
}

export default function GameStatsCard() {
  const { getGameStats } = useGameTracking()
  const { tUI } = useTranslation()
  const [stats, setStats] = useState<AggregateStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    getGameStats().then((data) => {
      if (mounted) {
        setStats(data)
        setLoading(false)
      }
    })
    return () => { mounted = false }
  }, [getGameStats])

  if (loading) {
    return (
      <div
        className="bg-white rounded-2xl"
        style={{ border: '1px solid rgba(27,42,74,0.06)', boxShadow: '0 1px 3px rgba(27,42,74,0.04), 0 4px 16px rgba(27,42,74,0.03)' }}
      >
        <div className="px-6 py-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
          <div className="flex items-center gap-2">
            <Gamepad2 size={16} style={{ color: '#1B2A4A' }} />
            <h3 className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>
              {tUI('Practice Games')}
            </h3>
          </div>
        </div>
        <div className="px-6 py-8">
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div
        className="bg-white rounded-2xl"
        style={{ border: '1px solid rgba(27,42,74,0.06)', boxShadow: '0 1px 3px rgba(27,42,74,0.04), 0 4px 16px rgba(27,42,74,0.03)' }}
      >
        <div className="px-6 py-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
          <div className="flex items-center gap-2">
            <Gamepad2 size={16} style={{ color: '#1B2A4A' }} />
            <h3 className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>
              {tUI('Practice Games')}
            </h3>
          </div>
        </div>
        <div className="px-6 py-8 text-center">
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            {tUI('No games played yet. Try a practice game from Quick Wins!')}
          </p>
          <Link
            href="/hub/quick-wins"
            className="inline-flex items-center gap-1 mt-3 text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: '#E8B84B' }}
          >
            {tUI('Browse games')} <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  // Sort games by most recently played
  const sortedGames = Object.entries(stats.perGame)
    .sort(([, a], [, b]) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime())

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(27,42,74,0.06)', boxShadow: '0 1px 3px rgba(27,42,74,0.04), 0 4px 16px rgba(27,42,74,0.03)' }}
    >
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #F3F4F6' }}>
        <div className="flex items-center gap-2">
          <Gamepad2 size={16} style={{ color: '#1B2A4A' }} />
          <h3 className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>
            {tUI('Practice Games')}
          </h3>
        </div>
        <span className="text-xs" style={{ color: '#9CA3AF' }}>
          {stats.totalPlays} {stats.totalPlays === 1 ? tUI('session') : tUI('sessions')}
        </span>
      </div>

      {/* Summary row */}
      <div className="px-6 py-4 grid grid-cols-3 gap-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Target size={14} style={{ color: '#FFBA06' }} />
          </div>
          <p className="font-bold text-lg" style={{ fontFamily: "'Source Serif 4', serif", color: '#1B2A4A' }}>
            {stats.gamesPlayed}
          </p>
          <p className="text-[10px] uppercase tracking-wide" style={{ color: '#9CA3AF' }}>
            {tUI('Games tried')}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <RotateCcw size={14} style={{ color: '#4A9A8B' }} />
          </div>
          <p className="font-bold text-lg" style={{ fontFamily: "'Source Serif 4', serif", color: '#1B2A4A' }}>
            {stats.totalPlays}
          </p>
          <p className="text-[10px] uppercase tracking-wide" style={{ color: '#9CA3AF' }}>
            {tUI('Total plays')}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock size={14} style={{ color: '#7C9CBF' }} />
          </div>
          <p className="font-bold text-lg" style={{ fontFamily: "'Source Serif 4', serif", color: '#1B2A4A' }}>
            {stats.totalTimeMinutes > 0 ? `${stats.totalTimeMinutes}m` : '--'}
          </p>
          <p className="text-[10px] uppercase tracking-wide" style={{ color: '#9CA3AF' }}>
            {tUI('Time played')}
          </p>
        </div>
      </div>

      {/* Per-game breakdown */}
      <div>
        {sortedGames.map(([gameId, game], idx) => {
          const display = GAME_DISPLAY[gameId] ?? { title: gameId, accent: '#9CA3AF' }
          const accuracyPct = Math.round(game.avgAccuracy * 100)
          const daysAgo = Math.floor(
            (Date.now() - new Date(game.lastPlayed).getTime()) / (1000 * 60 * 60 * 24)
          )
          const lastPlayedLabel = daysAgo === 0
            ? tUI('Today')
            : daysAgo === 1
            ? tUI('Yesterday')
            : `${daysAgo}d ago`

          return (
            <div
              key={gameId}
              className="px-6 py-4 flex items-center gap-4"
              style={idx < sortedGames.length - 1 ? { borderBottom: '1px solid #F3F4F6' } : undefined}
            >
              {/* Color dot */}
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: display.accent }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#1B2A4A' }}>
                  {display.title}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[11px]" style={{ color: '#9CA3AF' }}>
                    {game.plays}x {tUI('played')}
                  </span>
                  {game.bestStreak > 0 && (
                    <span className="text-[11px] flex items-center gap-0.5" style={{ color: '#F59E0B' }}>
                      <Flame size={10} /> {game.bestStreak}
                    </span>
                  )}
                  <span className="text-[11px]" style={{ color: '#9CA3AF' }}>
                    {lastPlayedLabel}
                  </span>
                </div>
              </div>

              {/* Accuracy bar (only for scoreable games) */}
              {game.bestScore > 0 && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#F3F4F6' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${accuracyPct}%`,
                        backgroundColor: accuracyPct >= 80 ? '#27AE60' : accuracyPct >= 50 ? '#F1C40F' : '#E74C3C',
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium w-8 text-right" style={{ color: '#1B2A4A' }}>
                    {accuracyPct}%
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
