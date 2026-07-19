'use client'

import type { WeakItem } from './useGameTracking'

/**
 * Builds a review-mode item list by prioritizing weak items.
 *
 * For games with correct/incorrect answers (Tell or Ask, Feedback Level Up, etc.),
 * this function takes the full pool of items and the user's weak items from the DB,
 * then returns a selection that front-loads items the user has gotten wrong before.
 *
 * Items the user hasn't seen yet are mixed in after weak items.
 * Items the user has mastered (seen multiple times, always correct) are deprioritized.
 */
export function buildReviewPool<T>(
  allItems: T[],
  weakItems: WeakItem[],
  targetCount: number,
  getItemId: (item: T, index: number) => string
): { items: T[]; isReviewMode: boolean } {
  if (weakItems.length === 0) {
    // No weak items — standard shuffle
    return { items: shuffleArray(allItems).slice(0, targetCount), isReviewMode: false }
  }

  const weakSet = new Set(weakItems.map(w => w.item_id))

  // Split into weak and other
  const weak: T[] = []
  const other: T[] = []

  allItems.forEach((item, idx) => {
    const id = getItemId(item, idx)
    if (weakSet.has(id)) {
      weak.push(item)
    } else {
      other.push(item)
    }
  })

  // Sort weak items by accuracy (lowest first) to match WeakItem ordering
  const weakItemMap = new Map(weakItems.map(w => [w.item_id, w]))
  weak.sort((a, b) => {
    const aIdx = allItems.indexOf(a)
    const bIdx = allItems.indexOf(b)
    const aWeak = weakItemMap.get(getItemId(a, aIdx))
    const bWeak = weakItemMap.get(getItemId(b, bIdx))
    return (aWeak?.accuracy ?? 1) - (bWeak?.accuracy ?? 1)
  })

  // Take weak items first (up to target), fill remainder with shuffled others
  const selected: T[] = []
  selected.push(...weak.slice(0, targetCount))

  if (selected.length < targetCount) {
    const shuffledOther = shuffleArray(other)
    selected.push(...shuffledOther.slice(0, targetCount - selected.length))
  }

  // Shuffle the final selection so weak items aren't always first
  return {
    items: shuffleArray(selected),
    isReviewMode: weak.length > 0,
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
