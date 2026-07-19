'use client'

// Re-export the hub CommunityNudge with game-specific wrapper
import HubCommunityNudge from '@/components/hub/CommunityNudge'
import type { WeakItem } from '@/lib/hub/useGameTracking'

interface GameCommunityNudgeProps {
  gameSlug: string
  score?: number
  totalRounds?: number
  onDismiss?: () => void
}

export function CommunityNudge({ gameSlug, onDismiss }: GameCommunityNudgeProps) {
  return <HubCommunityNudge contentSlug={gameSlug} contentType="game" onDismiss={onDismiss} />
}
