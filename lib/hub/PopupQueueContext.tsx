'use client'

import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QueueEntry {
  id: string
  priority: number
  /** Timestamp of when this entry was enqueued (for stable ordering) */
  enqueuedAt: number
}

interface PopupQueueAPI {
  enqueue: (id: string, priority: number) => void
  dequeue: (id: string) => void
  isActive: (id: string) => boolean
}

// ---------------------------------------------------------------------------
// Priority reference (for documentation only, not enforced here)
//
// 100  Onboarding Tour
//  90  Recognition Celebration / Game Badge Celebration
//  80  Course Completion Modal
//  50  Vibe Check slide-up
//  40  Capacity Feedback / Feedback Prompt
//  20  Add to Home Screen
//  10  Wellbeing popup
//   0  Community Nudge
// ---------------------------------------------------------------------------

const DISMISS_DELAY_MS = 2000

// ---------------------------------------------------------------------------
// External store - avoids unnecessary re-renders by using useSyncExternalStore
// ---------------------------------------------------------------------------

type Listener = () => void

function createPopupStore() {
  let queue: QueueEntry[] = []
  let activeId: string | null = null
  let cooldownUntil = 0
  let cooldownTimer: ReturnType<typeof setTimeout> | null = null
  const listeners = new Set<Listener>()

  function notify() {
    listeners.forEach((l) => l())
  }

  function computeActive(): string | null {
    if (queue.length === 0) return null
    if (Date.now() < cooldownUntil) return null
    // Highest priority first; ties broken by earliest enqueue
    const sorted = [...queue].sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority
      return a.enqueuedAt - b.enqueuedAt
    })
    return sorted[0].id
  }

  function reconcile() {
    const next = computeActive()
    if (next !== activeId) {
      activeId = next
      notify()
    }
  }

  return {
    subscribe(listener: Listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },

    getSnapshot(): string | null {
      return activeId
    },

    enqueue(id: string, priority: number) {
      // Prevent duplicate ids
      if (queue.some((e) => e.id === id)) return
      queue.push({ id, priority, enqueuedAt: Date.now() })
      reconcile()
    },

    dequeue(id: string) {
      const existed = queue.some((e) => e.id === id)
      queue = queue.filter((e) => e.id !== id)
      if (existed) {
        // Start cooldown before next popup shows
        cooldownUntil = Date.now() + DISMISS_DELAY_MS
        activeId = null
        notify()
        if (cooldownTimer) clearTimeout(cooldownTimer)
        cooldownTimer = setTimeout(() => {
          cooldownTimer = null
          reconcile()
        }, DISMISS_DELAY_MS)
      } else {
        reconcile()
      }
    },

    isActive(id: string): boolean {
      return activeId === id
    },
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const PopupQueueContext = createContext<PopupQueueAPI | null>(null)

export function PopupQueueProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<ReturnType<typeof createPopupStore> | null>(null)
  if (!storeRef.current) {
    storeRef.current = createPopupStore()
  }
  const store = storeRef.current

  // Subscribe to the store so we can provide a stable snapshot for isActive
  const currentActive = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    // SSR fallback
    () => null,
  )

  const enqueue = useCallback(
    (id: string, priority: number) => store.enqueue(id, priority),
    [store],
  )

  const dequeue = useCallback(
    (id: string) => store.dequeue(id),
    [store],
  )

  const isActive = useCallback(
    (id: string) => currentActive === id,
    [currentActive],
  )

  return (
    <PopupQueueContext.Provider value={{ enqueue, dequeue, isActive }}>
      {children}
    </PopupQueueContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

// Safe no-op fallback so components never crash if rendered outside the provider
const NOOP_QUEUE: PopupQueueAPI = {
  enqueue: () => {},
  dequeue: () => {},
  isActive: () => true,
}

export function usePopupQueue() {
  const ctx = useContext(PopupQueueContext)
  if (!ctx) return NOOP_QUEUE
  return ctx
}
