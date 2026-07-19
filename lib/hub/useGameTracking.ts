'use client'

import { useCallback, useRef } from 'react'
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub'
import { useHub } from '@/components/hub/HubContext'
import { checkGameBadges, type BadgeCheckResult } from './gameBadgeEngine'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GameCompletionData {
  tool: string
  score?: number
  totalRounds?: number
  streak?: number
  timeSpent?: number // seconds
}

export interface GameResponseData {
  itemId: string        // stable identifier for the question/scenario
  roundNumber: number
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  confidence?: number   // 1-5 (Tell or Ask)
  timeSpent?: number    // seconds per round
}

export interface GameSessionSummary {
  id: string
  game_id: string
  started_at: string
  completed_at: string | null
  score: number | null
  total_rounds: number
  best_streak: number
  is_review_mode: boolean
}

export interface WeakItem {
  game_id: string
  item_id: string
  times_seen: number
  times_wrong: number
  last_seen: string
  accuracy: number // 0-1
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useGameTracking() {
  const { user } = useHub()
  const activeSessionId = useRef<string | null>(null)

  // Legacy: log completion to activity log (keeps existing behavior intact)
  const logCompletion = useCallback(async (data: GameCompletionData) => {
    if (!user?.id) return
    const supabase = getSupabase()
    await supabase.from('hub_activity_log').insert({
      user_id: user.id,
      action: 'practice_tool_completed',
      metadata: {
        ...data,
        completed_at: new Date().toISOString(),
      },
    })
  }, [user?.id])

  // Start a new game session — returns session ID
  const startSession = useCallback(async (
    gameId: string,
    totalRounds: number,
    options?: {
      language?: string
      isReviewMode?: boolean
      difficulty?: string
      gradeBand?: string
      role?: string
    }
  ): Promise<string | null> => {
    if (!user?.id) return null
    const supabase = getSupabase()
    const { data, error } = await supabase.from('hub_game_sessions').insert({
      user_id: user.id,
      game_id: gameId,
      total_rounds: totalRounds,
      language: options?.language ?? 'en',
      difficulty: options?.difficulty ?? 'all',
      grade_band: options?.gradeBand ?? 'all',
      role: options?.role ?? 'all',
      is_review_mode: options?.isReviewMode ?? false,
    }).select('id').single()

    if (error || !data) return null
    activeSessionId.current = data.id
    return data.id
  }, [user?.id])

  // Log a single round response
  const logResponse = useCallback(async (response: GameResponseData) => {
    if (!user?.id || !activeSessionId.current) return
    const supabase = getSupabase()
    await supabase.from('hub_game_responses').insert({
      session_id: activeSessionId.current,
      user_id: user.id,
      game_id: response.itemId.split('_')[0] ? undefined : undefined, // set below
      item_id: response.itemId,
      round_number: response.roundNumber,
      user_answer: response.userAnswer,
      correct_answer: response.correctAnswer,
      is_correct: response.isCorrect,
      confidence: response.confidence ?? null,
      time_spent_seconds: response.timeSpent ?? null,
    })
  }, [user?.id])

  // Log a response with explicit game_id (preferred — avoids parsing item_id)
  const logGameResponse = useCallback(async (gameId: string, response: GameResponseData) => {
    if (!user?.id || !activeSessionId.current) return
    const supabase = getSupabase()
    await supabase.from('hub_game_responses').insert({
      session_id: activeSessionId.current,
      user_id: user.id,
      game_id: gameId,
      item_id: response.itemId,
      round_number: response.roundNumber,
      user_answer: response.userAnswer,
      correct_answer: response.correctAnswer,
      is_correct: response.isCorrect,
      confidence: response.confidence ?? null,
      time_spent_seconds: response.timeSpent ?? null,
    })
  }, [user?.id])

  // Complete the session with final stats
  const completeSession = useCallback(async (
    score: number,
    bestStreak: number,
    timeSpentSeconds?: number
  ) => {
    if (!user?.id || !activeSessionId.current) return
    const supabase = getSupabase()
    await supabase.from('hub_game_sessions')
      .update({
        completed_at: new Date().toISOString(),
        score,
        best_streak: bestStreak,
        time_spent_seconds: timeSpentSeconds ?? null,
      })
      .eq('id', activeSessionId.current)

    activeSessionId.current = null
  }, [user?.id])

  // Get session history for a specific game (or all games)
  const getHistory = useCallback(async (
    gameId?: string,
    limit = 20
  ): Promise<GameSessionSummary[]> => {
    if (!user?.id) return []
    const supabase = getSupabase()
    let query = supabase
      .from('hub_game_sessions')
      .select('id, game_id, started_at, completed_at, score, total_rounds, best_streak, is_review_mode')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(limit)

    if (gameId) {
      query = query.eq('game_id', gameId)
    }

    const { data } = await query
    return (data ?? []) as GameSessionSummary[]
  }, [user?.id])

  // Get weak items for spaced repetition — items the user gets wrong most often
  const getWeakItems = useCallback(async (
    gameId: string,
    limit = 10
  ): Promise<WeakItem[]> => {
    if (!user?.id) return []
    const supabase = getSupabase()

    // Get all responses for this game, grouped by item
    const { data: responses } = await supabase
      .from('hub_game_responses')
      .select('item_id, is_correct, answered_at')
      .eq('user_id', user.id)
      .eq('game_id', gameId)
      .order('answered_at', { ascending: false })

    if (!responses || responses.length === 0) return []

    // Aggregate per item
    const itemMap = new Map<string, {
      times_seen: number
      times_wrong: number
      last_seen: string
    }>()

    for (const r of responses) {
      const existing = itemMap.get(r.item_id) ?? {
        times_seen: 0,
        times_wrong: 0,
        last_seen: r.answered_at,
      }
      existing.times_seen++
      if (!r.is_correct) existing.times_wrong++
      if (r.answered_at > existing.last_seen) existing.last_seen = r.answered_at
      itemMap.set(r.item_id, existing)
    }

    // Filter to items with at least one wrong answer, sort by error rate
    const weakItems: WeakItem[] = []
    for (const [item_id, stats] of itemMap) {
      if (stats.times_wrong === 0) continue
      weakItems.push({
        game_id: gameId,
        item_id,
        times_seen: stats.times_seen,
        times_wrong: stats.times_wrong,
        last_seen: stats.last_seen,
        accuracy: 1 - (stats.times_wrong / stats.times_seen),
      })
    }

    // Sort: lowest accuracy first, then least recently seen (prioritize stale weak items)
    weakItems.sort((a, b) => {
      if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy
      return new Date(a.last_seen).getTime() - new Date(b.last_seen).getTime()
    })

    return weakItems.slice(0, limit)
  }, [user?.id])

  // Get aggregate stats across all games for profile display
  const getGameStats = useCallback(async () => {
    if (!user?.id) return null
    const supabase = getSupabase()

    const { data: sessions } = await supabase
      .from('hub_game_sessions')
      .select('game_id, score, total_rounds, best_streak, completed_at, time_spent_seconds')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })

    if (!sessions || sessions.length === 0) return null

    // Per-game stats
    const gameStats = new Map<string, {
      plays: number
      bestScore: number
      bestStreak: number
      totalRounds: number
      avgAccuracy: number
      lastPlayed: string
    }>()

    let totalPlays = 0
    let totalTimeSeconds = 0

    for (const s of sessions) {
      totalPlays++
      totalTimeSeconds += s.time_spent_seconds ?? 0

      const existing = gameStats.get(s.game_id) ?? {
        plays: 0,
        bestScore: 0,
        bestStreak: 0,
        totalRounds: 0,
        avgAccuracy: 0,
        lastPlayed: s.completed_at,
      }

      existing.plays++
      existing.bestScore = Math.max(existing.bestScore, s.score ?? 0)
      existing.bestStreak = Math.max(existing.bestStreak, s.best_streak ?? 0)
      existing.totalRounds += s.total_rounds
      if (s.score != null && s.total_rounds > 0) {
        // Running average
        const prevTotal = existing.avgAccuracy * (existing.plays - 1)
        existing.avgAccuracy = (prevTotal + (s.score / s.total_rounds)) / existing.plays
      }
      if (s.completed_at > existing.lastPlayed) existing.lastPlayed = s.completed_at

      gameStats.set(s.game_id, existing)
    }

    return {
      totalPlays,
      totalTimeMinutes: Math.round(totalTimeSeconds / 60),
      gamesPlayed: gameStats.size,
      perGame: Object.fromEntries(gameStats),
    }
  }, [user?.id])

  // Check badges after game completion — returns newly earned badges for celebration UI
  const checkBadges = useCallback(async (): Promise<BadgeCheckResult | null> => {
    if (!user?.id) return null
    return checkGameBadges(user.id)
  }, [user?.id])

  return {
    logCompletion,
    startSession,
    logResponse,
    logGameResponse,
    completeSession,
    getHistory,
    getWeakItems,
    getGameStats,
    checkBadges,
    activeSessionId: activeSessionId.current,
  }
}
