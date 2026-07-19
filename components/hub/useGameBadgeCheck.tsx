'use client'

import { useState, useEffect, useCallback } from 'react'
import { useHub } from '@/components/hub/HubContext'
import { checkGameBadges } from '@/lib/hub/gameBadgeEngine'
import type { EarnedBadge } from '@/lib/hub/gameBadges'
import GameBadgeCelebration from './GameBadgeCelebration'

/**
 * Hook for game done screens.
 * Call once when the done screen mounts.
 * Returns a React element to render (celebration overlay or null).
 *
 * Usage:
 *   const badgeCelebration = useGameBadgeCheck(isGameDone)
 *   return <>{badgeCelebration}<DoneScreen ... /></>
 */
export function useGameBadgeCheck(trigger: boolean) {
  const { user } = useHub()
  const [newBadges, setNewBadges] = useState<EarnedBadge[]>([])
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!trigger || !user?.id) return
    let mounted = true

    // Small delay to let the session complete write settle
    const timer = setTimeout(() => {
      checkGameBadges(user.id).then((result) => {
        if (mounted && result.newlyEarned.length > 0) {
          setNewBadges(result.newlyEarned)
        }
      })
    }, 500)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [trigger, user?.id])

  const handleDismiss = useCallback(() => {
    setDismissed(true)
  }, [])

  if (dismissed || newBadges.length === 0) return null

  return <GameBadgeCelebration badges={newBadges} onDismiss={handleDismiss} />
}
