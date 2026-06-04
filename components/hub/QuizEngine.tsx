'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, Share2, RotateCcw, ArrowRight } from 'lucide-react'
import UniversalShareModal from './UniversalShareModal'
import { useTranslation } from '@/lib/hub/useTranslation'
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub'
import { getQuizRecommendations, getCourseKeywords } from '@/lib/hub/quizRecommendations'
import type { QuizConfig, QuizResult } from '@/lib/hub/quizConfigs'

// ── Component ──────────────────────────────────────────────────────────

interface QuizEngineProps {
  quiz: QuizConfig
  onComplete?: (resultKey: string) => void
}

export default function QuizEngine({ quiz, onComplete }: QuizEngineProps) {
  const { tUI } = useTranslation()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    Object.keys(quiz.results).forEach(k => { initial[k] = 0 })
    return initial
  })
  const [result, setResult] = useState<QuizResult | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [recommendedQW, setRecommendedQW] = useState<{ id: string; slug: string; title: string; category: string }[]>([])
  const [recommendedCourses, setRecommendedCourses] = useState<{ id: string; slug: string; title: string; category: string }[]>([])

  // Fetch recommended Quick Wins + Courses when result is determined
  useEffect(() => {
    if (!result) return
    const rec = getQuizRecommendations(quiz.id, result.key)
    if (!rec || rec.categories.length === 0) return
    const supabase = getSupabase()

    // Fetch Quick Wins
    supabase
      .from('hub_quick_wins')
      .select('id, slug, title, category')
      .eq('is_published', true)
      .in('category', rec.categories)
      .limit(3)
      .then(({ data }) => { if (data) setRecommendedQW(data) })

    // Fetch Courses by keyword matching
    const keywords = getCourseKeywords(quiz.id, result.key)
    if (keywords.length > 0) {
      supabase
        .from('hub_courses')
        .select('id, slug, title, category')
        .eq('is_published', true)
        .limit(20)
        .then(({ data }) => {
          if (!data) return
          // Filter courses whose title or category matches any keyword
          const matches = data.filter(course => {
            const text = `${course.title} ${course.category}`.toLowerCase()
            return keywords.some(kw => text.includes(kw))
          }).slice(0, 2)
          setRecommendedCourses(matches)
        })
    }
  }, [result, quiz.id])

  const handleAnswer = (answerTypes: string[], answerIdx: number) => {
    if (transitioning) return
    setSelectedAnswer(answerIdx)
    setTransitioning(true)

    const newScores = { ...scores }
    answerTypes.forEach(t => { newScores[t] = (newScores[t] || 0) + 1 })
    setScores(newScores)

    setTimeout(() => {
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setTransitioning(false)
      } else {
        const winner = Object.entries(newScores)
          .sort((a, b) => b[1] - a[1])[0][0]
        setResult(quiz.results[winner])
        onComplete?.(winner)
      }
    }, 600)
  }

  const restart = () => {
    setCurrentQuestion(0)
    const initial: Record<string, number> = {}
    Object.keys(quiz.results).forEach(k => { initial[k] = 0 })
    setScores(initial)
    setResult(null)
    setSelectedAnswer(null)
    setTransitioning(false)
  }

  // ── Result Screen ──
  if (result) {
    return (
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(27,42,74,0.06)', boxShadow: '0 4px 16px rgba(27,42,74,0.08)' }}
      >
        <div className="p-8 text-center" style={{ background: result.bg }}>
          <div
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: result.color }}
          >
            <span className="text-3xl font-bold text-white" style={{ fontFamily: "'Source Serif 4', serif" }}>
              {result.icon}
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: result.color, fontFamily: "'DM Sans', sans-serif" }}>
            {tUI('You are')}
          </p>
          <h2 className="text-2xl font-bold mb-2" style={{ color: result.color, fontFamily: "'Source Serif 4', serif" }}>
            {result.title}
          </h2>
          <p className="text-sm font-medium mb-4" style={{ color: result.color, opacity: 0.8, fontFamily: "'DM Sans', sans-serif" }}>
            {result.subtitle}
          </p>
        </div>
        <div className="bg-white p-6">
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>
            {result.description}
          </p>
          {result.ctaLabel && result.ctaLink && (
            <Link
              href={result.ctaLink}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 mb-4"
              style={{ backgroundColor: result.color, color: 'white', fontFamily: "'DM Sans', sans-serif" }}
            >
              {result.ctaLabel}
              <ArrowRight size={16} />
            </Link>
          )}
          {/* Recommended Quick Wins */}
          {recommendedQW.length > 0 && (() => {
            const rec = getQuizRecommendations(quiz.id, result.key)
            return (
              <div className="mb-5 p-4 rounded-xl" style={{ backgroundColor: '#FAFAF8', border: '1px solid rgba(27,42,74,0.06)' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>
                  {tUI('Recommended for you')}
                </p>
                {rec && (
                  <p className="text-xs mb-3" style={{ color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}>
                    {rec.message}
                  </p>
                )}
                <div className="space-y-2">
                  {recommendedQW.map(qw => (
                    <Link
                      key={qw.id}
                      href={`/hub/quick-wins/${qw.slug}`}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-white hover:shadow-sm transition-shadow"
                      style={{ border: '1px solid rgba(27,42,74,0.06)' }}
                    >
                      <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: result.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: '#1B2A4A' }}>{qw.title}</p>
                        <p className="text-xs" style={{ color: '#9CA3AF' }}>{qw.category}</p>
                      </div>
                      <ChevronRight size={14} style={{ color: '#D1D5DB' }} />
                    </Link>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Recommended Courses */}
          {recommendedCourses.length > 0 && (
            <div className="mb-5 p-4 rounded-xl" style={{ backgroundColor: '#FAFAF8', border: '1px solid rgba(27,42,74,0.06)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>
                {tUI('Courses for you')}
              </p>
              <div className="space-y-2">
                {recommendedCourses.map(course => (
                  <Link
                    key={course.id}
                    href={`/hub/courses/${course.slug}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-white hover:shadow-sm transition-shadow"
                    style={{ border: '1px solid rgba(27,42,74,0.06)' }}
                  >
                    <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: '#1B2A4A' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#1B2A4A' }}>{course.title}</p>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>{course.category}</p>
                    </div>
                    <ChevronRight size={14} style={{ color: '#D1D5DB' }} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShareOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: result.color, color: 'white', fontFamily: "'DM Sans', sans-serif" }}
            >
              <Share2 size={14} />
              {tUI('Share My Result')}
            </button>
            {shareOpen && (
              <UniversalShareModal
                isOpen={shareOpen}
                onClose={() => setShareOpen(false)}
                title={`Share your ${quiz.shortTitle} result`}
                subtitle={`Let other educators find out theirs`}
                message={quiz.shareMessage(result.title, result.subtitle)}
              />
            )}
            <button
              onClick={restart}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-100"
              style={{ backgroundColor: '#F3F4F6', color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}
            >
              <RotateCcw size={14} />
              {tUI('Take It Again')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Question Screen ──
  const q = quiz.questions[currentQuestion]
  const progress = (currentQuestion / quiz.questions.length) * 100

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(27,42,74,0.06)', boxShadow: '0 4px 16px rgba(27,42,74,0.08)' }}
    >
      {/* Progress bar */}
      <div style={{ height: 4, backgroundColor: '#F3F4F6' }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: '#E8B84B',
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      <div className="bg-white p-6">
        {/* Question counter */}
        <p className="text-xs font-medium mb-4" style={{ color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif" }}>
          {tUI('Question')} {currentQuestion + 1} {tUI('of')} {quiz.questions.length}
        </p>

        {/* Question */}
        <h3
          className="text-lg font-bold mb-6"
          style={{ color: '#1B2A4A', fontFamily: "'Source Serif 4', serif", lineHeight: 1.3 }}
        >
          {q.question}
        </h3>

        {/* Answers */}
        <div className="space-y-3">
          {q.answers.map((answer, idx) => {
            const isSelected = selectedAnswer === idx
            return (
              <button
                key={idx}
                onClick={() => handleAnswer(answer.types, idx)}
                disabled={transitioning}
                className="w-full text-left p-4 rounded-xl transition-all"
                style={{
                  backgroundColor: isSelected ? '#1B2A4A' : '#FAFAF8',
                  border: isSelected ? '1px solid #1B2A4A' : '1px solid #F3F4F6',
                  color: isSelected ? 'white' : '#374151',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  cursor: transitioning ? 'default' : 'pointer',
                  transform: isSelected ? 'scale(0.98)' : 'scale(1)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span>{answer.text}</span>
                  {isSelected && <ChevronRight size={16} style={{ color: '#E8B84B' }} />}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Result Badge (compact display for profile/dashboard) ───────────────

interface QuizResultBadgeProps {
  quiz: QuizConfig
  resultKey: string
  compact?: boolean
}

export function QuizResultBadge({ quiz, resultKey, compact }: QuizResultBadgeProps) {
  const result = quiz.results[resultKey]
  if (!result) return null

  if (compact) {
    return (
      <div
        className="rounded-xl p-3 flex items-center gap-3"
        style={{ backgroundColor: result.bg, border: '1px solid rgba(27,42,74,0.06)' }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: result.color }}
        >
          <span className="text-sm font-bold text-white" style={{ fontFamily: "'Source Serif 4', serif" }}>
            {result.icon}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
            {quiz.shortTitle}
          </p>
          <p className="text-sm font-bold truncate" style={{ color: result.color, fontFamily: "'Source Serif 4', serif" }}>
            {result.title}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(27,42,74,0.06)', boxShadow: '0 2px 8px rgba(27,42,74,0.06)' }}
    >
      <div className="p-5 flex items-center gap-4" style={{ backgroundColor: result.bg }}>
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: result.color }}
        >
          <span className="text-xl font-bold text-white" style={{ fontFamily: "'Source Serif 4', serif" }}>
            {result.icon}
          </span>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: '#9CA3AF' }}>
            {quiz.shortTitle}
          </p>
          <p className="text-lg font-bold" style={{ color: result.color, fontFamily: "'Source Serif 4', serif" }}>
            {result.title}
          </p>
          <p className="text-xs mt-0.5" style={{ color: result.color, opacity: 0.7, fontFamily: "'DM Sans', sans-serif" }}>
            {result.subtitle}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Quiz Invitation Card (for untaken quizzes) ─────────────────────────

interface QuizInviteCardProps {
  quiz: QuizConfig
  onStart: () => void
  compact?: boolean
}

export function QuizInviteCard({ quiz, onStart, compact }: QuizInviteCardProps) {
  if (compact) {
    return (
      <button
        onClick={onStart}
        className="w-full text-left rounded-xl p-3 flex items-center gap-3 transition-all hover:shadow-md"
        style={{
          backgroundColor: quiz.accentBg,
          border: '1px solid rgba(27,42,74,0.06)',
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: quiz.accentColor }}
        >
          <span className="text-sm font-bold text-white" style={{ fontFamily: "'Source Serif 4', serif" }}>?</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate" style={{ color: '#1B2A4A', fontFamily: "'DM Sans', sans-serif" }}>
            {quiz.shortTitle}
          </p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>{quiz.durationLabel}</p>
        </div>
        <ChevronRight size={16} style={{ color: quiz.accentColor }} />
      </button>
    )
  }

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all hover:shadow-md cursor-pointer"
      style={{ border: '1px solid rgba(27,42,74,0.06)', boxShadow: '0 2px 8px rgba(27,42,74,0.06)' }}
      onClick={onStart}
    >
      {/* Colored gradient header strip */}
      <div
        className="px-5 py-4"
        style={{ background: quiz.accentGradient }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <span className="text-lg font-bold text-white" style={{ fontFamily: "'Source Serif 4', serif" }}>?</span>
          </div>
          <div>
            <h3
              className="text-base font-bold text-white leading-snug"
              style={{ fontFamily: "'Source Serif 4', serif" }}
            >
              {quiz.title}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: "'DM Sans', sans-serif" }}>
              {quiz.questionCount} questions {'\u00B7'} {quiz.durationLabel}
            </p>
          </div>
        </div>
      </div>
      {/* Body */}
      <div className="bg-white px-5 py-4">
        <p className="text-sm mb-3" style={{ color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}>
          {quiz.description}
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); onStart(); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
          style={{ backgroundColor: quiz.accentColor, color: 'white', fontFamily: "'DM Sans', sans-serif" }}
        >
          {quiz.category === 'needs' ? 'Check In' : 'Take the Quiz'}
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
