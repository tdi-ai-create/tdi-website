'use client'

import { useParams, useRouter } from 'next/navigation'
import { useHub } from '@/components/hub/HubContext'
import { LanguageProvider } from '@/app/paragametools/context/LanguageContext'
import { QuestionKnockout } from '@/app/paragametools/components/QuestionKnockout'
import { TellOrAsk } from '@/app/paragametools/components/TellOrAsk'
import { FeedbackLevelUp } from '@/app/paragametools/components/FeedbackLevelUp'
import { FeedbackMadlibs } from '@/app/paragametools/components/FeedbackMadlibs'
import { FeedbackMakeover } from '@/app/paragametools/components/FeedbackMakeover'
import { WhatsYourMove } from '@/app/paragametools/components/WhatsYourMove'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub'
import { useEffect } from 'react'
import { useTranslation } from '@/lib/hub/useTranslation'

const PRACTICE_TOOLS: Record<string, {
  component: React.ComponentType<{ onBack: () => void }>
  title: string
  category: string
}> = {
  'question-knockout': {
    component: QuestionKnockout,
    title: 'Question Knockout',
    category: 'Questioning Skills',
  },
  'tell-or-ask': {
    component: TellOrAsk,
    title: 'Tell or Ask?',
    category: 'Questioning Skills',
  },
  'feedback-level-up': {
    component: FeedbackLevelUp,
    title: 'Feedback Level Up',
    category: 'Feedback Practice',
  },
  'feedback-madlibs': {
    component: FeedbackMadlibs,
    title: 'Feedback Madlibs',
    category: 'Feedback Practice',
  },
  'feedback-makeover': {
    component: FeedbackMakeover,
    title: 'Feedback Makeover',
    category: 'Feedback Practice',
  },
  'whats-your-move': {
    component: WhatsYourMove,
    title: "What's Your Move?",
    category: 'Classroom Scenarios',
  },
}

export default function PracticeToolPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useHub()
  const { tUI } = useTranslation()
  const slug = params.slug as string
  const tool = PRACTICE_TOOLS[slug]

  // Log activity for streak tracking
  useEffect(() => {
    if (user?.id && tool) {
      const supabase = getSupabase()
      void supabase.from('hub_activity_log').insert({
        user_id: user.id,
        action: 'practice_tool_started',
        metadata: { tool: slug, started_at: new Date().toISOString() },
      })
    }
  }, [user?.id, slug, tool])

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F9FAFB' }}>
        <div className="text-center">
          <p className="text-lg font-semibold mb-2" style={{ color: '#1B2A4A' }}>{tUI('Practice tool not found')}</p>
          <Link href="/hub/quick-wins" className="text-sm font-medium" style={{ color: '#38618C' }}>
            {tUI('Back to Quick Wins')}
          </Link>
        </div>
      </div>
    )
  }

  const GameComponent = tool.component

  return (
    <LanguageProvider>
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f1a2e 0%, #1a2744 40%, #1e3254 100%)' }}>
        {/* Hub nav breadcrumb */}
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <button
              onClick={() => router.push('/hub/quick-wins')}
              className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              <ArrowLeft size={16} />
              {tUI('Back to Quick Wins')}
            </button>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{tUI(tool.title)}</span>
          </div>
        </div>

        {/* Game component */}
        <GameComponent onBack={() => router.push('/hub/quick-wins')} />
      </div>
    </LanguageProvider>
  )
}
