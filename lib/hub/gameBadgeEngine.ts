'use client'

import { getHubSupabase as getSupabase } from '@/lib/supabase-hub'
import {
  GAME_BADGES,
  type BadgeCheckContext,
  type EarnedBadge,
  type BadgeProgress,
  type GameBadge,
} from './gameBadges'

export interface BadgeCheckResult {
  earned: EarnedBadge[]
  progress: BadgeProgress[]
  newlyEarned: EarnedBadge[]  // badges earned THIS check (not previously saved)
}

/**
 * Evaluate all game badges for a user.
 * - Queries session data to build context
 * - Checks each badge definition
 * - Persists newly earned badges to hub_game_badges
 * - Returns full state including which badges are new (for celebration UI)
 */
export async function checkGameBadges(userId: string): Promise<BadgeCheckResult> {
  const supabase = getSupabase()

  // Fetch all completed sessions
  const { data: sessions } = await supabase
    .from('hub_game_sessions')
    .select('game_id, score, total_rounds, best_streak, completed_at')
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })

  // Fetch already-earned badges
  const { data: existingBadges } = await supabase
    .from('hub_game_badges')
    .select('badge_id, earned_at')
    .eq('user_id', userId)

  const existingSet = new Map(
    (existingBadges ?? []).map((b: { badge_id: string; earned_at: string }) => [b.badge_id, b.earned_at])
  )

  // Build check context
  const ctx = buildContext(sessions ?? [])

  // Evaluate each badge
  const earned: EarnedBadge[] = []
  const progress: BadgeProgress[] = []
  const newlyEarned: EarnedBadge[] = []

  for (const badgeDef of GAME_BADGES) {
    const result = badgeDef.check(ctx)
    const badge: GameBadge = {
      id: badgeDef.id,
      title: badgeDef.title,
      description: badgeDef.description,
      personalNote: badgeDef.personalNote,
      category: badgeDef.category,
      icon: badgeDef.icon,
      accent: badgeDef.accent,
      tier: badgeDef.tier,
    }

    if (result.earned) {
      const existingDate = existingSet.get(badgeDef.id)
      const earnedBadge: EarnedBadge = {
        badge,
        earnedAt: existingDate ?? new Date().toISOString(),
      }
      earned.push(earnedBadge)

      // Persist if not already saved
      if (!existingDate) {
        newlyEarned.push(earnedBadge)
        await supabase.from('hub_game_badges').insert({
          user_id: userId,
          badge_id: badgeDef.id,
        })
      }
    } else if (result.current > 0) {
      progress.push({
        badge,
        current: result.current,
        target: result.target,
        pct: Math.min(100, Math.round((result.current / result.target) * 100)),
      })
    }
  }

  return { earned, progress, newlyEarned }
}

// ── Helpers ──────────────────────────────────────────────────────────────

function buildContext(
  sessions: {
    game_id: string
    score: number | null
    total_rounds: number
    best_streak: number
    completed_at: string
  }[]
): BadgeCheckContext {
  const perGame = new Map<string, {
    plays: number
    totalCorrect: number
    totalRounds: number
    bestStreak: number
    bestAccuracy: number
  }>()

  for (const s of sessions) {
    const existing = perGame.get(s.game_id) ?? {
      plays: 0,
      totalCorrect: 0,
      totalRounds: 0,
      bestStreak: 0,
      bestAccuracy: 0,
    }

    existing.plays++
    existing.totalCorrect += s.score ?? 0
    existing.totalRounds += s.total_rounds
    existing.bestStreak = Math.max(existing.bestStreak, s.best_streak ?? 0)

    if (s.score != null && s.total_rounds > 0) {
      const sessionAccuracy = s.score / s.total_rounds
      existing.bestAccuracy = Math.max(existing.bestAccuracy, sessionAccuracy)
    }

    perGame.set(s.game_id, existing)
  }

  return {
    sessions,
    perGame,
    uniqueGames: perGame.size,
    totalSessions: sessions.length,
  }
}
