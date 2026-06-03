'use client'

import { useCallback } from 'react'
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub'
import { useHub } from '@/components/hub/HubContext'

interface GameCompletionData {
  tool: string
  score?: number
  totalRounds?: number
  streak?: number
  timeSpent?: number // seconds
}

export function useGameTracking() {
  const { user } = useHub()

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

  return { logCompletion }
}
