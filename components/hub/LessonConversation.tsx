'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageCircle, HelpCircle, X } from 'lucide-react'

// ─── TYPES ──────────────────────────────────────────────────────────────────

export type ContributionType = 'tried_it' | 'adapted_it' | 'still_trying' | 'got_stuck' | 'didnt_land'

interface ConversationPost {
  id: string
  contribution_type: ContributionType
  title: string | null
  body: string
  helpful_count: number
  posted_at: string
  author: {
    name: string
    role: string | null
    avatar_url: string | null
  }
}

interface PulseCounts {
  tried_it: number
  adapted_it: number
  still_trying: number
  got_stuck: number
  didnt_land: number
}

interface ConversationData {
  lesson_id: string
  total_contributions: number
  pulse: PulseCounts
  posts: ConversationPost[]
}

// ─── CONTRIBUTION TYPE CONFIG ───────────────────────────────────────────────

const CONTRIBUTION_TYPES: {
  id: ContributionType
  label: string
  description: string
  color: string
}[] = [
  { id: 'tried_it', label: 'Tried it', description: 'Used the lesson as written', color: '#2A9D8F' },
  { id: 'adapted_it', label: 'Adapted it', description: 'Changed something to make it work', color: '#F4C430' },
  { id: 'still_trying', label: 'Still trying', description: 'In progress, not yet finished', color: '#7BB6D9' },
  { id: 'got_stuck', label: 'Got stuck', description: 'Hit a wall, need a second brain', color: '#F4A28C' },
  { id: 'didnt_land', label: "Didn't land", description: "Tried it, didn't work, here's why", color: '#64748B' },
]

function getTypeConfig(type: ContributionType) {
  return CONTRIBUTION_TYPES.find(t => t.id === type) || CONTRIBUTION_TYPES[0]
}

// ─── PULSE COMPONENT ────────────────────────────────────────────────────────

function Pulse({ pulse, total }: { pulse: PulseCounts; total: number }) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const maxCount = Math.max(...Object.values(pulse), 1)

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-6"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      <p className="text-sm font-semibold text-gray-900 mb-1">
        What teachers are doing with this lesson
      </p>
      <p className="text-xs text-gray-400 mb-5">
        {total.toLocaleString()} teacher{total !== 1 ? 's' : ''} in the conversation
      </p>

      <div className="space-y-3">
        {CONTRIBUTION_TYPES.map((type, typeIdx) => {
          const count = pulse[type.id]
          const widthPct = maxCount > 0 ? (count / maxCount) * 100 : 0

          return (
            <div key={type.id} className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-24 flex-shrink-0 text-right">
                {type.label}
              </span>
              <div className="flex-1 h-3 bg-gray-50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: type.color,
                    width: animated ? `${widthPct}%` : '0%',
                    transition: `width 600ms cubic-bezier(0.34, 1.56, 0.64, 1) ${typeIdx * 80}ms`,
                    opacity: count > 0 ? 1 : 0.3,
                  }}
                />
              </div>
              <span className="text-xs text-gray-500 w-8 flex-shrink-0 tabular-nums">
                {count}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── FILTER CHIPS ───────────────────────────────────────────────────────────

function FilterChips({
  pulse,
  total,
  activeFilter,
  onFilterChange,
}: {
  pulse: PulseCounts
  total: number
  activeFilter: ContributionType | null
  onFilterChange: (type: ContributionType | null) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onFilterChange(null)}
        className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
        style={{
          backgroundColor: activeFilter === null ? '#2B3A67' : '#F3F4F6',
          color: activeFilter === null ? 'white' : '#6B7280',
        }}
      >
        All {total}
      </button>
      {CONTRIBUTION_TYPES.map(type => {
        const count = pulse[type.id]
        const isActive = activeFilter === type.id
        return (
          <button
            key={type.id}
            onClick={() => onFilterChange(isActive ? null : type.id)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{
              backgroundColor: isActive ? type.color : '#F3F4F6',
              color: isActive ? 'white' : '#6B7280',
            }}
          >
            {type.label} {count}
          </button>
        )
      })}
    </div>
  )
}

// ─── POST CARD ──────────────────────────────────────────────────────────────

function PostCard({ post }: { post: ConversationPost }) {
  const config = getTypeConfig(post.contribution_type)
  const [showTooltip, setShowTooltip] = useState(false)

  const timeAgo = getTimeAgo(post.posted_at)

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      <div className="flex">
        {/* Accent bar */}
        <div className="w-1 flex-shrink-0" style={{ backgroundColor: config.color }} />

        <div className="flex-1 p-5">
          {/* Tag */}
          <span
            className="inline-block text-xs font-medium px-2 py-0.5 rounded mb-2"
            style={{
              backgroundColor: `${config.color}18`,
              color: config.color,
            }}
          >
            {config.label}
          </span>

          {/* Title */}
          {post.title && (
            <p className="text-sm font-semibold text-gray-900 mb-1">{post.title}</p>
          )}

          {/* Author line */}
          <p className="text-xs text-gray-400 mb-3">
            {post.author.name}
            {post.author.role && <span> · {formatRole(post.author.role)}</span>}
            <span> · {timeAgo}</span>
          </p>

          {/* Body */}
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {post.body}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-4">
            <div className="relative">
              <button
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                Helpful ({post.helpful_count})
                <HelpCircle size={12} className="opacity-50" />
              </button>
              {showTooltip && (
                <div className="absolute bottom-full left-0 mb-2 w-56 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                  &ldquo;Helpful&rdquo; means another teacher learned something from this story. It&rsquo;s a signal to others, not a rating of the post.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── COMPOSE MODAL ──────────────────────────────────────────────────────────

function ComposeModal({
  onClose,
  onSubmit,
  submitting,
}: {
  onClose: () => void
  onSubmit: (data: { contribution_type: ContributionType; title: string; body: string }) => void
  submitting: boolean
}) {
  const [selectedType, setSelectedType] = useState<ContributionType | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const canSubmit = selectedType && body.trim().length > 0 && !submitting

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">
            What happened when you tried this lesson?
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Type selector */}
          <div className="space-y-2">
            {CONTRIBUTION_TYPES.map(type => {
              const isSelected = selectedType === type.id
              return (
                <label
                  key={type.id}
                  className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                  style={{
                    backgroundColor: isSelected ? `${type.color}10` : 'transparent',
                    border: isSelected ? `1px solid ${type.color}40` : '1px solid transparent',
                  }}
                >
                  <input
                    type="radio"
                    name="contribution_type"
                    checked={isSelected}
                    onChange={() => setSelectedType(type.id)}
                    className="mt-0.5 accent-current"
                    style={{ accentColor: type.color }}
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">{type.label}</span>
                    <span className="text-sm text-gray-500"> — {type.description}</span>
                  </div>
                </label>
              )
            })}
          </div>

          {/* Body */}
          <div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tell us what happened. What worked? What did you change? What would you tell another teacher about to try this?"
              rows={5}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          {/* Optional title */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Optional: Title for your post
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (canSubmit) {
                onSubmit({ contribution_type: selectedType, title, body })
              }
            }}
            disabled={!canSubmit}
            className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-all"
            style={{
              backgroundColor: canSubmit ? '#2B3A67' : '#D1D5DB',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
            }}
          >
            {submitting ? 'Sharing...' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CTA CARD ───────────────────────────────────────────────────────────────

function CTACard({ onShare }: { onShare: () => void }) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-6 transition-shadow hover:shadow-md"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      <p className="text-sm font-semibold text-gray-900 mb-1">
        Tried it? Adapted it? Still working through it?
      </p>
      <p className="text-sm text-gray-500 mb-4">
        Tell us what happened — your story helps the next teacher.
      </p>
      <div className="flex justify-end">
        <button
          onClick={onShare}
          className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ backgroundColor: '#2B3A67' }}
        >
          Share my experience
        </button>
      </div>
    </div>
  )
}

// ─── EMPTY STATE ────────────────────────────────────────────────────────────

function ConversationEmptyState({ onShare }: { onShare: () => void }) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-8 text-center"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      {/* Line-art illustration — hand with note */}
      <div className="w-16 h-16 mx-auto mb-5 flex items-center justify-center">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#2B3A67" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="12" y="6" width="24" height="32" rx="2" />
          <line x1="18" y1="14" x2="30" y2="14" />
          <line x1="18" y1="20" x2="30" y2="20" />
          <line x1="18" y1="26" x2="26" y2="26" />
          <path d="M28 38 L34 44 L40 34" />
        </svg>
      </div>

      <h3
        className="font-semibold mb-2"
        style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontSize: '18px',
          color: '#2B3A67',
        }}
      >
        Be the first teacher in this conversation
      </h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
        When you try this lesson — even part of it — share what happened.
        What worked? What did you change? Your story is what makes the next
        teacher&apos;s experience better.
      </p>
      <button
        onClick={onShare}
        className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
        style={{ backgroundColor: '#2B3A67' }}
      >
        Share my experience
      </button>
    </div>
  )
}

// ─── MAIN CONVERSATION COMPONENT ────────────────────────────────────────────

interface LessonConversationProps {
  lessonId: string
  courseId: string
  userId?: string | null
}

export default function LessonConversation({
  lessonId,
  courseId,
  userId,
}: LessonConversationProps) {
  const [data, setData] = useState<ConversationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState<ContributionType | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchConversation = useCallback(async (typeFilter?: ContributionType | null) => {
    try {
      const url = `/api/hub/lessons/${lessonId}/conversation${
        typeFilter ? `?type=${typeFilter}` : ''
      }`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to load conversation')
      const json = await res.json()

      if (typeFilter) {
        // Only update posts, keep pulse from full load
        setData(prev => prev ? { ...prev, posts: json.posts } : json)
      } else {
        setData(json)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [lessonId])

  useEffect(() => {
    fetchConversation()
  }, [fetchConversation])

  function handleFilterChange(type: ContributionType | null) {
    setActiveFilter(type)
    fetchConversation(type)
  }

  async function handleSubmit(submission: {
    contribution_type: ContributionType
    title: string
    body: string
  }) {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/hub/lessons/${lessonId}/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...submission,
          user_id: userId,
          course_id: courseId,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to post')
      }

      setShowCompose(false)
      setActiveFilter(null)
      // Refetch full data
      await fetchConversation()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
            <div className="h-3 bg-gray-100 rounded w-1/3 mb-3" />
            <div className="h-2 bg-gray-100 rounded w-full mb-2" />
            <div className="h-2 bg-gray-100 rounded w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    )
  }

  const isEmpty = !data || data.total_contributions === 0

  if (isEmpty) {
    return <ConversationEmptyState onShare={() => setShowCompose(true)} />
  }

  return (
    <div className="space-y-5">
      {/* Pulse */}
      <Pulse pulse={data!.pulse} total={data!.total_contributions} />

      {/* CTA */}
      {userId && <CTACard onShare={() => setShowCompose(true)} />}

      {/* Filter chips */}
      <FilterChips
        pulse={data!.pulse}
        total={data!.total_contributions}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Posts */}
      <div className="space-y-3">
        {data!.posts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No posts match this filter.
          </p>
        ) : (
          data!.posts.map(post => <PostCard key={post.id} post={post} />)
        )}
      </div>

      {/* Compose modal */}
      {showCompose && (
        <ComposeModal
          onClose={() => setShowCompose(false)}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </div>
  )
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

function getTimeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)
  const diffWeek = Math.floor(diffDay / 7)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  if (diffWeek < 5) return `${diffWeek}w ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatRole(role: string): string {
  return role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
