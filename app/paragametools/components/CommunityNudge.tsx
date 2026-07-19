'use client'

import { useState, useEffect } from 'react'
import { X, MessageCircle, Share2, HelpCircle } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const STORAGE_KEY = 'tdi_community_nudge_last'
const COOLDOWN_MS = 24 * 60 * 60 * 1000 // 24 hours
const SHOW_CHANCE = 0.3 // 30% chance per completion

interface CommunityNudgeProps {
  gameSlug: string
  score?: number
  totalRounds?: number
  onDismiss?: () => void
}

const NUDGE_VARIANTS = {
  en: [
    { icon: Share2, title: 'How did it go?', body: 'Share your experience to help other educators decide if this game is for them.' },
    { icon: MessageCircle, title: 'Got a tip?', body: 'Something you learned that could help the next player? Post it in the community.' },
    { icon: HelpCircle, title: 'Have a question?', body: 'Something tricky come up? Ask the community. Someone has been there.' },
    { icon: Share2, title: 'Your take matters', body: 'A quick note about your experience helps educators like you find the right tools.' },
    { icon: MessageCircle, title: 'How would you use this?', body: 'Planning to try something from this game in your classroom? Share the idea.' },
  ],
  es: [
    { icon: Share2, title: 'Como te fue?', body: 'Comparte tu experiencia para ayudar a otros educadores a decidir si este juego es para ellos.' },
    { icon: MessageCircle, title: 'Tienes un consejo?', body: 'Algo que aprendiste que podria ayudar al siguiente jugador? Publicalo en la comunidad.' },
    { icon: HelpCircle, title: 'Tienes una pregunta?', body: 'Algo complicado surgio? Pregunta a la comunidad. Alguien ha estado ahi.' },
    { icon: Share2, title: 'Tu opinion importa', body: 'Una nota rapida sobre tu experiencia ayuda a educadores como tu a encontrar las herramientas correctas.' },
    { icon: MessageCircle, title: 'Como usarias esto?', body: 'Planeas probar algo de este juego en tu salon? Comparte la idea.' },
  ],
}

function shouldShowNudge(): boolean {
  if (typeof window === 'undefined') return false

  // Check cooldown
  const lastShown = localStorage.getItem(STORAGE_KEY)
  if (lastShown) {
    const elapsed = Date.now() - parseInt(lastShown, 10)
    if (elapsed < COOLDOWN_MS) return false
  }

  // Random chance
  return Math.random() < SHOW_CHANCE
}

function markNudgeShown() {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, String(Date.now()))
}

export function CommunityNudge({ gameSlug, score, totalRounds, onDismiss }: CommunityNudgeProps) {
  const { language } = useLanguage()
  const lang = language === 'es' ? 'es' : 'en'
  const [visible, setVisible] = useState(false)
  const [variant, setVariant] = useState(0)

  useEffect(() => {
    if (!shouldShowNudge()) return

    // Pick a random variant
    const variants = NUDGE_VARIANTS[lang]
    setVariant(Math.floor(Math.random() * variants.length))

    // Delay appearance so it doesn't compete with confetti/badges
    const timer = setTimeout(() => {
      setVisible(true)
      markNudgeShown()
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  const nudge = NUDGE_VARIANTS[lang][variant]
  const Icon = nudge.icon
  const communityUrl = `/hub/quick-wins/${gameSlug}#community`

  const handleDismiss = () => {
    setVisible(false)
    onDismiss?.()
  }

  const handleAction = () => {
    // Navigate to the game's landing page community section
    window.location.href = communityUrl
  }

  return (
    <div
      className="w-full max-w-lg mx-auto mt-6 rounded-xl overflow-hidden animate-slide-up"
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="flex items-start gap-3 p-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: 'rgba(232, 184, 75, 0.15)' }}
        >
          <Icon size={16} style={{ color: '#E8B84B' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white mb-0.5">{nudge.title}</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
            {nudge.body}
          </p>
          <button
            onClick={handleAction}
            className="mt-2 text-xs font-semibold px-4 py-1.5 rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#E8B84B', color: '#1B2A4A' }}
          >
            {lang === 'es' ? 'Compartir' : 'Share'}
          </button>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-full transition-opacity hover:opacity-80 flex-shrink-0"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
