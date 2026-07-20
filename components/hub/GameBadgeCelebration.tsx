'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { ConfettiBurst } from '@/app/paragametools/components/ConfettiBurst'
import type { EarnedBadge } from '@/lib/hub/gameBadges'
import { useTranslation } from '@/lib/hub/useTranslation'
import { getLucideIcon } from './gameBadgeIcons'
import { usePopupQueue } from '@/lib/hub/PopupQueueContext'

const POPUP_ID = 'game-badge'
const POPUP_PRIORITY = 90

const TIER_LABELS: Record<number, string> = {
  1: 'Bronze',
  2: 'Silver',
  3: 'Gold',
}

const TIER_RING: Record<number, string> = {
  1: 'linear-gradient(135deg, #CD7F32, #E8A862)',
  2: 'linear-gradient(135deg, #C0C0C0, #E8E8E8)',
  3: 'linear-gradient(135deg, #E8B84B, #FFD700)',
}

interface GameBadgeCelebrationProps {
  badges: EarnedBadge[]
  onDismiss: () => void
}

export default function GameBadgeCelebration({ badges, onDismiss }: GameBadgeCelebrationProps) {
  const { tUI } = useTranslation()
  const { enqueue, dequeue, isActive: isQueueActive } = usePopupQueue()
  const [visible, setVisible] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)

  // Register with popup queue on mount
  useEffect(() => {
    if (badges.length > 0) {
      enqueue(POPUP_ID, POPUP_PRIORITY)
    }
    return () => { dequeue(POPUP_ID) }
  }, [enqueue, dequeue, badges.length])

  useEffect(() => {
    if (!isQueueActive(POPUP_ID)) return
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [isQueueActive])

  if (badges.length === 0) return null
  if (!isQueueActive(POPUP_ID)) return null

  const badge = badges[currentIdx].badge
  const isLast = currentIdx >= badges.length - 1
  const Icon = getLucideIcon(badge.icon)

  const handleNext = () => {
    if (isLast) {
      setVisible(false)
      dequeue(POPUP_ID)
      setTimeout(onDismiss, 300)
    } else {
      setCurrentIdx((i) => i + 1)
    }
  }

  const handleDismiss = () => {
    setVisible(false)
    dequeue(POPUP_ID)
    setTimeout(onDismiss, 300)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: visible ? 'rgba(30, 39, 73, 0.7)' : 'rgba(30, 39, 73, 0)',
        transition: 'background 0.3s ease',
        padding: 20,
      }}
      onClick={handleDismiss}
    >
      {visible && (
        <ConfettiBurst
          colors={[badge.accent, '#E8B84B', '#FFFFFF', '#3498DB', '#27AE60']}
          particleCount={80}
        />
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          background: 'white',
          borderRadius: 24,
          maxWidth: 400,
          width: '100%',
          overflow: 'hidden',
          boxShadow: visible
            ? `0 24px 80px rgba(30,39,73,0.3), 0 0 60px ${badge.accent}40`
            : 'none',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
          opacity: visible ? 1 : 0,
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Close */}
        <button
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#9CA3AF',
            padding: 4,
          }}
        >
          <X size={20} />
        </button>

        {/* Badge visual */}
        <div style={{ padding: '40px 32px 24px', textAlign: 'center' }}>
          {/* Tier label */}
          <div
            style={{
              display: 'inline-block',
              padding: '2px 12px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: badge.accent,
              backgroundColor: `${badge.accent}15`,
              marginBottom: 16,
            }}
          >
            {TIER_LABELS[badge.tier]}
          </div>

          {/* Icon ring */}
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: TIER_RING[badge.tier],
              padding: 4,
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={36} style={{ color: badge.accent }} />
            </div>
          </div>

          <h2
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: '#1B2A4A',
              marginBottom: 8,
              fontFamily: "'Source Serif 4', serif",
            }}
          >
            {badge.title}
          </h2>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>
            {badge.description}
          </p>
        </div>

        {/* Personal note */}
        <div
          style={{
            margin: '0 24px 24px',
            padding: 20,
            borderRadius: 16,
            backgroundColor: `${badge.accent}08`,
            border: `1px solid ${badge.accent}20`,
          }}
        >
          <p
            style={{
              fontSize: 14,
              color: '#1B2A4A',
              lineHeight: 1.6,
              fontStyle: 'italic',
              textAlign: 'center',
            }}
          >
            "{badge.personalNote}"
          </p>
        </div>

        {/* Action */}
        <div style={{ padding: '0 24px 24px', textAlign: 'center' }}>
          <button
            onClick={handleNext}
            style={{
              padding: '12px 32px',
              borderRadius: 12,
              border: 'none',
              backgroundColor: badge.accent,
              color: 'white',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {isLast
              ? tUI('Keep going')
              : `${tUI('Next badge')} (${currentIdx + 1}/${badges.length})`}
          </button>
        </div>
      </div>
    </div>
  )
}
