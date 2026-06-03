'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Sparkle, ChevronRight } from 'lucide-react'
import { useHub } from '@/components/hub/HubContext'
import { useTranslation } from '@/lib/hub/useTranslation'
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub'

// Shows a subtle quiz nudge on courses/quick-wins pages
// Only appears if user has < 3 quiz results and hasn't dismissed recently

const NUDGE_MESSAGES = [
  { en: 'Not sure where to start? Take a quick quiz to learn about yourself.', es: 'No estas seguro por donde empezar? Haz un quiz rapido para conocerte.' },
  { en: 'Discover your educator superpowers. 2 minutes, zero judgment.', es: 'Descubre tus superpoderes como educador. 2 minutos, cero juicios.' },
  { en: 'Fun fact: a quick self-discovery quiz can help us recommend the right tools for you.', es: 'Dato curioso: un quiz rapido de autodescubrimiento nos ayuda a recomendarte las herramientas correctas.' },
]

export default function QuizNudge() {
  const { user } = useHub()
  const { tUI } = useTranslation()
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState(NUDGE_MESSAGES[0])

  useEffect(() => {
    if (!user?.id) return

    // Check if dismissed recently (24h cooldown)
    const lastDismissed = localStorage.getItem('tdi_quiz_nudge_dismissed')
    if (lastDismissed) {
      const dismissedAt = new Date(lastDismissed).getTime()
      const hoursSince = (Date.now() - dismissedAt) / (1000 * 60 * 60)
      if (hoursSince < 24) return
    }

    // Check quiz count
    const checkQuizzes = async () => {
      const supabase = getSupabase()
      const { count } = await supabase
        .from('hub_quiz_results')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Only show if they have fewer than 3 quizzes
      if ((count || 0) < 3) {
        // Pick a random message based on day
        const dayIdx = new Date().getDate() % NUDGE_MESSAGES.length
        setMessage(NUDGE_MESSAGES[dayIdx])
        setVisible(true)
      }
    }
    checkQuizzes()
  }, [user?.id])

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem('tdi_quiz_nudge_dismissed', new Date().toISOString())
  }

  if (!visible) return null

  const lang = (typeof window !== 'undefined' && localStorage.getItem('tdi_hub_language') === 'es') ? 'es' : 'en'

  return (
    <div
      className="rounded-xl p-4 mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2"
      style={{
        background: 'linear-gradient(135deg, #1B2A4A 0%, #2d3a5c 100%)',
        border: '1px solid rgba(232,184,75,0.2)',
      }}
    >
      <Sparkle size={18} style={{ color: '#E8B84B', flexShrink: 0 }} />
      <p className="flex-1 text-sm" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: "'DM Sans', sans-serif" }}>
        {message[lang]}
      </p>
      <Link
        href="/hub/settings/profile?tab=educator_profile"
        className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#E8B84B', color: '#1B2A4A', fontFamily: "'DM Sans', sans-serif" }}
      >
        {tUI('Try a quiz')}
        <ChevronRight size={12} />
      </Link>
      <button
        onClick={dismiss}
        className="flex-shrink-0 p-1 rounded-md transition-opacity hover:opacity-70"
        style={{ color: 'rgba(255,255,255,0.4)' }}
      >
        <X size={14} />
      </button>
    </div>
  )
}
