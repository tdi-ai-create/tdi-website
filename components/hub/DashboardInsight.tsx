'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'
import { useTranslation } from '@/lib/hub/useTranslation'

interface DashboardInsightProps {
  userId?: string | null
  toolsExplored: number
  hoursSaved: string
  daysActive: number
  recognitionsEarned: number
}

export default function DashboardInsight({
  userId,
  toolsExplored,
  hoursSaved,
  daysActive,
  recognitionsEarned,
}: DashboardInsightProps) {
  const { tUI } = useTranslation()
  const [insight, setInsight] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId || toolsExplored === 0) return

    setLoading(true)
    fetch('/api/hub/insights/achievements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'reflection_prompt',
        data: {
          name: '',
          role: '',
          toolsExplored,
          hoursSaved,
          daysActive,
          recognitionsEarned,
          earnedNames: [],
          topCategories: [],
          communityPosts: 0,
          coursesCompleted: 0,
          pdHours: 0,
        },
      }),
    })
      .then(res => res.json())
      .then(data => setInsight(data.insight || null))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId, toolsExplored, hoursSaved, daysActive, recognitionsEarned])

  if (!userId || (toolsExplored === 0 && !loading)) return null

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1B2A4A 0%, #2d3a5c 60%, #38618C 100%)',
        border: '1px solid rgba(27,42,74,0.08)',
      }}
    >
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} style={{ color: '#E8B84B' }} />
          <span
            className="text-xs font-semibold tracking-wide uppercase"
            style={{ color: '#E8B84B', fontFamily: "'DM Sans', sans-serif" }}
          >
            {tUI('AI Reflection')}
          </span>
        </div>

        {loading ? (
          <div className="space-y-2">
            <div className="h-3 bg-white/10 rounded w-full animate-pulse" />
            <div className="h-3 bg-white/10 rounded w-4/5 animate-pulse" />
          </div>
        ) : insight ? (
          <p
            className="text-sm leading-relaxed mb-3"
            style={{ color: 'rgba(255,255,255,0.85)', fontFamily: "'DM Sans', sans-serif" }}
          >
            {insight}
          </p>
        ) : null}

        <Link
          href="/hub/settings/profile"
          className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-80"
          style={{ color: '#E8B84B', fontFamily: "'DM Sans', sans-serif" }}
        >
          {tUI('View full growth insights')}
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  )
}
