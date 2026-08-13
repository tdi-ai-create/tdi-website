'use client'

/**
 * Quiz page: /hub/quiz/[slug]
 *
 * The quiz system was already complete before this route existed. QuizEngine
 * handles scoring, results, sharing and recommendations, and the configs live in
 * lib/hub/quizConfigs. What was missing was any URL an educator could reach, so
 * every quiz sat in the database invisible while the Quick Win detail page
 * showed "Quiz coming soon".
 *
 * This route is that missing piece. It resolves a Quick Win slug to a quiz
 * config and renders the engine.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import QuizEngine from '@/components/hub/QuizEngine'
import { getQuizBySlug } from '@/lib/hub/quizConfigs'
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub'
import { useTranslation } from '@/lib/hub/useTranslation'

export default function QuizPage() {
  const params = useParams()
  const slug = typeof params?.slug === 'string' ? params.slug : ''
  const { tUI } = useTranslation()
  const quiz = getQuizBySlug(slug)

  const [checked, setChecked] = useState(false)
  const [available, setAvailable] = useState(false)

  // A quiz is only reachable if its Quick Win row is published. That keeps the
  // Hub's single source of truth for visibility (is_published) authoritative
  // here too, rather than letting a config alone expose unpublished content.
  useEffect(() => {
    if (!quiz) { setChecked(true); return }
    let cancelled = false
    getSupabase()
      .from('hub_quick_wins')
      .select('id')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        setAvailable(!!data)
        setChecked(true)
      })
    return () => { cancelled = true }
  }, [quiz, slug])

  if (!quiz || (checked && !available)) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-serif text-[#1B365D] mb-3">
            {tUI('This quiz is not available')}
          </h1>
          <p className="text-[#5A5A5A] mb-6">
            {tUI('It may have been unpublished or moved. Browse the full collection instead.')}
          </p>
          <Link
            href="/hub/quick-wins"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1B365D] text-white font-medium hover:bg-[#16294a] transition-colors"
          >
            {tUI('Browse Quick Wins')}
          </Link>
        </div>
      </div>
    )
  }

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[#1B365D] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link
          href={`/hub/quick-wins/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-[#5A5A5A] hover:text-[#1B365D] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {tUI('Back')}
        </Link>
        <QuizEngine quiz={quiz} />
      </div>
    </div>
  )
}
