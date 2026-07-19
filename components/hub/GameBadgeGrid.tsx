'use client'

import { useState, useEffect } from 'react'
import { Award, Lock, ChevronRight } from 'lucide-react'
import { useHub } from '@/components/hub/HubContext'
import { useTranslation } from '@/lib/hub/useTranslation'
import { checkGameBadges, type BadgeCheckResult } from '@/lib/hub/gameBadgeEngine'
import type { EarnedBadge, BadgeProgress } from '@/lib/hub/gameBadges'
import { getLucideIcon } from './gameBadgeIcons'
import Link from 'next/link'

const TIER_RING: Record<number, string> = {
  1: 'linear-gradient(135deg, #CD7F32, #E8A862)',
  2: 'linear-gradient(135deg, #C0C0C0, #E8E8E8)',
  3: 'linear-gradient(135deg, #E8B84B, #FFD700)',
}

const CATEGORY_LABELS: Record<string, string> = {
  explorer: 'Explorer',
  mastery: 'Mastery',
  streak: 'Streaks',
  dedication: 'Dedication',
}

export default function GameBadgeGrid() {
  const { user } = useHub()
  const { tUI } = useTranslation()
  const [result, setResult] = useState<BadgeCheckResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    let mounted = true
    checkGameBadges(user.id).then((data) => {
      if (mounted) {
        setResult(data)
        setLoading(false)
      }
    })
    return () => { mounted = false }
  }, [user?.id])

  if (loading) {
    return (
      <div
        className="bg-white rounded-2xl"
        style={{ border: '1px solid rgba(27,42,74,0.06)', boxShadow: '0 1px 3px rgba(27,42,74,0.04), 0 4px 16px rgba(27,42,74,0.03)' }}
      >
        <div className="px-6 py-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
          <div className="flex items-center gap-2">
            <Award size={16} style={{ color: '#1B2A4A' }} />
            <h3 className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>
              {tUI('Game Badges')}
            </h3>
          </div>
        </div>
        <div className="px-6 py-8">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-gray-100 animate-pulse" />
                <div className="h-3 w-12 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!result || (result.earned.length === 0 && result.progress.length === 0)) {
    return (
      <div
        className="bg-white rounded-2xl"
        style={{ border: '1px solid rgba(27,42,74,0.06)', boxShadow: '0 1px 3px rgba(27,42,74,0.04), 0 4px 16px rgba(27,42,74,0.03)' }}
      >
        <div className="px-6 py-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
          <div className="flex items-center gap-2">
            <Award size={16} style={{ color: '#1B2A4A' }} />
            <h3 className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>
              {tUI('Game Badges')}
            </h3>
          </div>
        </div>
        <div className="px-6 py-8 text-center">
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            {tUI('Play practice games to start earning badges!')}
          </p>
          <Link
            href="/hub/quick-wins"
            className="inline-flex items-center gap-1 mt-3 text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: '#E8B84B' }}
          >
            {tUI('Start playing')} <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  // Group earned + progress by category
  const categories = ['explorer', 'mastery', 'streak', 'dedication'] as const

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(27,42,74,0.06)', boxShadow: '0 1px 3px rgba(27,42,74,0.04), 0 4px 16px rgba(27,42,74,0.03)' }}
    >
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #F3F4F6' }}>
        <div className="flex items-center gap-2">
          <Award size={16} style={{ color: '#1B2A4A' }} />
          <h3 className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>
            {tUI('Game Badges')}
          </h3>
        </div>
        <span className="text-xs" style={{ color: '#9CA3AF' }}>
          {result.earned.length} {tUI('earned')}
        </span>
      </div>

      <div className="px-6 py-5 space-y-6">
        {categories.map((cat) => {
          const earned = result.earned.filter(e => e.badge.category === cat)
          const inProgress = result.progress.filter(p => p.badge.category === cat)
          if (earned.length === 0 && inProgress.length === 0) return null

          return (
            <div key={cat}>
              <p
                className="text-[10px] font-bold uppercase tracking-wider mb-3"
                style={{ color: '#9CA3AF' }}
              >
                {tUI(CATEGORY_LABELS[cat])}
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {earned.map((e) => (
                  <EarnedBadgeIcon key={e.badge.id} badge={e} />
                ))}
                {inProgress.map((p) => (
                  <ProgressBadgeIcon key={p.badge.id} progress={p} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EarnedBadgeIcon({ badge: earned }: { badge: EarnedBadge }) {
  const { tUI } = useTranslation()
  const Icon = getLucideIcon(earned.badge.icon)

  return (
    <div className="flex flex-col items-center gap-1.5 group relative">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center p-[3px]"
        style={{ background: TIER_RING[earned.badge.tier] }}
      >
        <div
          className="w-full h-full rounded-full bg-white flex items-center justify-center"
        >
          <Icon size={22} style={{ color: earned.badge.accent }} />
        </div>
      </div>
      <p
        className="text-[10px] font-medium text-center leading-tight"
        style={{ color: '#1B2A4A' }}
      >
        {earned.badge.title}
      </p>

      {/* Tooltip */}
      <div
        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10"
        style={{
          backgroundColor: '#1B2A4A',
          borderRadius: 8,
          padding: '8px 12px',
          width: 180,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <p className="text-[11px] font-semibold text-white mb-1">{earned.badge.title}</p>
        <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {earned.badge.description}
        </p>
      </div>
    </div>
  )
}

function ProgressBadgeIcon({ progress }: { progress: BadgeProgress }) {
  const Icon = getLucideIcon(progress.badge.icon)

  return (
    <div className="flex flex-col items-center gap-1.5 group relative">
      <div className="relative w-14 h-14">
        {/* Progress ring background */}
        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
          <circle
            cx="28" cy="28" r="25"
            fill="none"
            stroke="#F3F4F6"
            strokeWidth="3"
          />
          <circle
            cx="28" cy="28" r="25"
            fill="none"
            stroke={progress.badge.accent}
            strokeWidth="3"
            strokeDasharray={`${(progress.pct / 100) * 157} 157`}
            strokeLinecap="round"
            opacity={0.4}
          />
        </svg>
        {/* Icon center */}
        <div
          className="absolute inset-0 flex items-center justify-center"
        >
          <Icon size={20} style={{ color: '#D1D5DB' }} />
        </div>
      </div>
      <p
        className="text-[10px] font-medium text-center leading-tight"
        style={{ color: '#9CA3AF' }}
      >
        {progress.badge.title}
      </p>

      {/* Tooltip */}
      <div
        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10"
        style={{
          backgroundColor: '#1B2A4A',
          borderRadius: 8,
          padding: '8px 12px',
          width: 180,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <p className="text-[11px] font-semibold text-white mb-1">{progress.badge.title}</p>
        <p className="text-[10px] mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {progress.badge.description}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${progress.pct}%`, backgroundColor: progress.badge.accent }}
            />
          </div>
          <span className="text-[9px] font-bold" style={{ color: progress.badge.accent }}>
            {progress.current}/{progress.target}
          </span>
        </div>
      </div>
    </div>
  )
}
