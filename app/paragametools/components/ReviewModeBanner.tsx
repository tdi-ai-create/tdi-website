'use client'

import { useState, useEffect } from 'react'
import { RotateCcw } from 'lucide-react'
import { useGameTracking, type WeakItem } from '@/lib/hub/useGameTracking'
import { useLanguage } from '../context/LanguageContext'

interface ReviewModeBannerProps {
  gameId: string
  accentColor?: string
  onStartReview: (weakItems: WeakItem[]) => void
}

export function ReviewModeBanner({ gameId, accentColor = '#E8B84B', onStartReview }: ReviewModeBannerProps) {
  const { getWeakItems } = useGameTracking()
  const { language } = useLanguage()
  const [weakItems, setWeakItems] = useState<WeakItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    getWeakItems(gameId).then((items) => {
      if (mounted) {
        setWeakItems(items)
        setLoading(false)
      }
    })
    return () => { mounted = false }
  }, [gameId, getWeakItems])

  if (loading || weakItems.length === 0) return null

  const count = weakItems.length
  const label = language === 'es'
    ? `Modo Repaso: ${count} ${count === 1 ? 'item para practicar' : 'items para practicar'}`
    : `Review Mode: ${count} ${count === 1 ? 'item to practice' : 'items to practice'}`
  const sub = language === 'es'
    ? 'Enfocate en lo que fallaste la ultima vez'
    : 'Focus on items you missed last time'

  return (
    <button
      onClick={() => onStartReview(weakItems)}
      className="w-full max-w-lg mx-auto mb-6 flex items-center gap-3.5 px-5 py-4 rounded-xl transition-all hover:scale-[1.02]"
      style={{
        backgroundColor: `${accentColor}15`,
        border: `1px solid ${accentColor}40`,
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${accentColor}20` }}
      >
        <RotateCcw size={18} style={{ color: accentColor }} />
      </div>
      <div className="text-left flex-1">
        <p className="text-sm font-bold" style={{ color: accentColor }}>{label}</p>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{sub}</p>
      </div>
      <span className="text-lg" style={{ color: accentColor }}>&#8250;</span>
    </button>
  )
}
