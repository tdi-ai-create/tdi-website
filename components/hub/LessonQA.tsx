'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageCircle, Send, ChevronDown, ChevronUp, ThumbsUp, Flag, Bookmark, Pin } from 'lucide-react'
import { useTranslation } from '@/lib/hub/useTranslation'

interface Author {
  name: string
  role: string | null
  avatar_url: string | null
  educator_type?: string | null
}

interface QAReply {
  id: string
  body: string
  helpful_count: number
  posted_at: string
  author: Author
}

interface QAQuestion {
  id: string
  body: string
  helpful_count: number
  posted_at: string
  is_pinned?: boolean
  author: Author
  replies: QAReply[]
}

interface QAData {
  content_id: string
  total_questions: number
  questions: QAQuestion[]
}

const INITIAL_VISIBLE_QUESTIONS = 5

interface LessonQAProps {
  contentId: string
  userId?: string | null
  isAdmin?: boolean
  apiBasePath: string
}

function getTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 5) return `${diffWeeks}w ago`
  const diffMonths = Math.floor(diffDays / 30)
  return `${diffMonths}mo ago`
}

function AuthorAvatar({ name }: { name: string }) {
  return (
    <div
      className="flex-shrink-0 flex items-center justify-center rounded-full"
      style={{
        width: 36,
        height: 36,
        background: '#E8EDF4',
        color: '#2B3A67',
        fontWeight: 700,
        fontSize: 13,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function QAHelpfulButton({ postId, initialCount, userId, tUI }: { postId: string; initialCount: number; userId?: string | null; tUI: (s: string) => string }) {
  const [count, setCount] = useState(initialCount)
  const [marked, setMarked] = useState(false)
  const [toggling, setToggling] = useState(false)

  const toggle = async () => {
    if (!userId || toggling) return
    setToggling(true)
    try {
      const res = await fetch('/api/hub/community/helpful', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_type: 'qa_post', content_id: postId, user_id: userId }),
      })
      if (res.ok) {
        const data = await res.json()
        setMarked(data.marked)
        setCount(data.helpful_count)
      }
    } finally {
      setToggling(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={!userId || toggling}
      className="flex items-center gap-1 text-xs transition-colors disabled:opacity-50"
      style={{ color: marked ? '#2A9D8F' : '#9CA3AF', fontWeight: marked ? 600 : 400 }}
    >
      <ThumbsUp size={13} fill={marked ? '#2A9D8F' : 'none'} />
      {count > 0 && count}
    </button>
  )
}

function QAReportButton({ postId, userId, tUI }: { postId: string; userId?: string | null; tUI: (s: string) => string }) {
  const [reported, setReported] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleReport = async () => {
    if (!userId) return
    try {
      await fetch('/api/hub/community/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_type: 'qa_post', content_id: postId, reporter_id: userId }),
      })
      setReported(true)
      setShowConfirm(false)
    } catch {
      // Silent fail
    }
  }

  if (reported) return <span className="text-xs text-gray-400">{tUI('Reported')}</span>

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">{tUI('Report?')}</span>
        <button onClick={handleReport} className="text-xs font-medium text-red-500 hover:text-red-700">{tUI('Yes')}</button>
        <button onClick={() => setShowConfirm(false)} className="text-xs font-medium text-gray-400 hover:text-gray-600">{tUI('No')}</button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="flex items-center gap-1 text-xs text-gray-300 hover:text-gray-500 transition-colors"
    >
      <Flag size={12} />
    </button>
  )
}

function QABookmarkButton({ postId, userId, title }: { postId: string; userId?: string | null; title: string }) {
  const [bookmarked, setBookmarked] = useState(false)

  const toggle = async () => {
    if (!userId) return
    try {
      const res = await fetch('/api/hub/community/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, content_type: 'qa_post', content_id: postId, title }),
      })
      if (res.ok) {
        const data = await res.json()
        setBookmarked(data.bookmarked)
      }
    } catch { /* silent */ }
  }

  if (!userId) return null

  return (
    <button onClick={toggle} className="flex items-center text-xs transition-colors" style={{ color: bookmarked ? '#E8B84B' : '#D1D5DB' }}>
      <Bookmark size={13} fill={bookmarked ? '#E8B84B' : 'none'} />
    </button>
  )
}

function QAPinButton({ postId, userId, pinned: initialPinned }: { postId: string; userId?: string | null; pinned: boolean }) {
  const [pinned, setPinned] = useState(initialPinned)

  const toggle = async () => {
    if (!userId) return
    try {
      const res = await fetch('/api/hub/community/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_type: 'qa_post', content_id: postId, user_id: userId }),
      })
      if (res.ok) {
        const data = await res.json()
        setPinned(data.pinned)
      }
    } catch { /* silent */ }
  }

  return (
    <button onClick={toggle} className="flex items-center text-xs transition-colors" style={{ color: pinned ? '#E8B84B' : '#D1D5DB' }}>
      <Pin size={12} />
    </button>
  )
}

export default function LessonQA({ contentId, userId, isAdmin, apiBasePath }: LessonQAProps) {
  const { tUI } = useTranslation()
  const [data, setData] = useState<QAData | null>(null)
  const [loading, setLoading] = useState(true)
  const [newQuestion, setNewQuestion] = useState('')
  const [posting, setPosting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_QUESTIONS)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(apiBasePath)
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      setData(json)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [apiBasePath])

  useEffect(() => { fetchData() }, [fetchData])

  const handlePostQuestion = async () => {
    if (!newQuestion.trim() || !userId || posting) return
    setPosting(true)
    try {
      const res = await fetch(apiBasePath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newQuestion.trim(), user_id: userId }),
      })
      if (res.ok) {
        setNewQuestion('')
        fetchData()
      }
    } finally {
      setPosting(false)
    }
  }

  const handlePostReply = async (parentId: string) => {
    if (!replyText.trim() || !userId || posting) return
    setPosting(true)
    try {
      const res = await fetch(apiBasePath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: replyText.trim(), user_id: userId, parent_id: parentId }),
      })
      if (res.ok) {
        setReplyText('')
        setReplyingTo(null)
        fetchData()
      }
    } finally {
      setPosting(false)
    }
  }

  const toggleReplies = (qId: string) => {
    setExpandedReplies(prev => {
      const next = new Set(prev)
      if (next.has(qId)) next.delete(qId)
      else next.add(qId)
      return next
    })
  }

  if (loading) {
    return (
      <div className="space-y-4 mt-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl p-5 animate-pulse" style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}>
            <div className="flex gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-48" />
              </div>
            </div>
            <div className="h-4 bg-gray-100 rounded w-full mb-2" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
          </div>
        ))}
      </div>
    )
  }

  const questions = data?.questions || []
  const totalQuestions = data?.total_questions || 0

  return (
    <div className="mt-2">
      {/* Ask a question */}
      {userId && (
        <div
          className="bg-white rounded-xl p-4 mb-6"
          style={{ border: '0.5px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        >
          <p className="text-sm font-semibold mb-3" style={{ color: '#1B2A4A', fontFamily: "'DM Sans', sans-serif" }}>
            {tUI('Have a question? Ask the community.')}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handlePostQuestion() }}
              placeholder={tUI('Type your question...')}
              className="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{
                border: '1px solid #E5E7EB',
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            <button
              onClick={handlePostQuestion}
              disabled={posting || !newQuestion.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-opacity"
              style={{
                background: '#1B2A4A',
                color: 'white',
                fontFamily: "'DM Sans', sans-serif",
                opacity: posting || !newQuestion.trim() ? 0.5 : 1,
              }}
            >
              <Send size={14} />
              {tUI('Post')}
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {questions.length === 0 && (
        <div
          className="bg-white rounded-xl p-8 text-center"
          style={{ border: '0.5px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        >
          <MessageCircle size={32} style={{ color: '#D1D5DB', margin: '0 auto 12px' }} />
          <p className="text-sm font-semibold mb-1" style={{ color: '#1B2A4A', fontFamily: "'DM Sans', sans-serif" }}>
            {tUI('No questions yet')}
          </p>
          <p className="text-xs" style={{ color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif" }}>
            {tUI('Be the first to ask something. Your question helps the next teacher.')}
          </p>
        </div>
      )}

      {/* Questions list */}
      {questions.length > 0 && (
        <div className="space-y-4">
          {[...questions]
            .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
            .slice(0, visibleCount)
            .map((q) => {
            const hasReplies = q.replies.length > 0
            const isExpanded = expandedReplies.has(q.id)

            return (
              <div
                key={q.id}
                className="bg-white rounded-xl overflow-hidden"
                style={{
                  border: q.is_pinned ? '1px solid #E8B84B' : '0.5px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {/* Question */}
                <div className="p-5">
                  {q.is_pinned && (
                    <div className="flex items-center gap-1 mb-2">
                      <Pin size={11} style={{ color: '#E8B84B' }} />
                      <span className="text-xs font-medium" style={{ color: '#E8B84B' }}>{tUI('Pinned')}</span>
                    </div>
                  )}
                  <div className="flex gap-3 mb-3">
                    <AuthorAvatar name={q.author.name} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-sm font-semibold" style={{ color: '#2B3A67', fontFamily: "'DM Sans', sans-serif" }}>
                          {q.author.name}
                        </span>
                        {q.author.educator_type && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                            The {q.author.educator_type}
                          </span>
                        )}
                        {q.author.role && (
                          <span className="text-xs" style={{ color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif" }}>
                            {q.author.role}
                          </span>
                        )}
                        <span className="text-xs" style={{ color: '#D1D5DB' }}>&middot;</span>
                        <span className="text-xs" style={{ color: '#9CA3AF' }}>{getTimeAgo(q.posted_at)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>
                    {q.body}
                  </p>

                  {/* Actions row */}
                  <div className="flex items-center gap-4 mt-3">
                    <QAHelpfulButton postId={q.id} initialCount={q.helpful_count} userId={userId} tUI={tUI} />
                    {hasReplies && (
                      <button
                        onClick={() => toggleReplies(q.id)}
                        className="flex items-center gap-1 text-xs font-medium transition-colors"
                        style={{ color: '#2B3A67', fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {q.replies.length} {q.replies.length === 1 ? tUI('reply') : tUI('replies')}
                      </button>
                    )}
                    {userId && (
                      <button
                        onClick={() => setReplyingTo(replyingTo === q.id ? null : q.id)}
                        className="text-xs font-medium transition-colors"
                        style={{ color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {tUI('Reply')}
                      </button>
                    )}
                    <QABookmarkButton postId={q.id} userId={userId} title={q.body.slice(0, 80)} />
                    {isAdmin && <QAPinButton postId={q.id} userId={userId} pinned={q.is_pinned || false} />}
                    {userId && <QAReportButton postId={q.id} userId={userId} tUI={tUI} />}
                  </div>
                </div>

                {/* Replies */}
                {hasReplies && isExpanded && (
                  <div style={{ borderTop: '1px solid #F3F4F6', background: '#FAFAFA' }}>
                    {q.replies.map((r) => (
                      <div key={r.id} className="px-5 py-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <div className="flex gap-3 ml-6">
                          <div
                            className="w-1 rounded-full flex-shrink-0"
                            style={{ background: '#E8B84B' }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 flex-wrap mb-1">
                              <span className="text-sm font-semibold" style={{ color: '#2B3A67', fontFamily: "'DM Sans', sans-serif" }}>
                                {r.author.name}
                              </span>
                              {r.author.educator_type && (
                                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                                  The {r.author.educator_type}
                                </span>
                              )}
                              {r.author.role && (
                                <span className="text-xs" style={{ color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif" }}>
                                  {r.author.role}
                                </span>
                              )}
                              <span className="text-xs" style={{ color: '#D1D5DB' }}>&middot;</span>
                              <span className="text-xs" style={{ color: '#9CA3AF' }}>{getTimeAgo(r.posted_at)}</span>
                            </div>
                            <p className="text-sm leading-relaxed" style={{ color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>
                              {r.body}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <QAHelpfulButton postId={r.id} initialCount={r.helpful_count} userId={userId} tUI={tUI} />
                              {userId && <QAReportButton postId={r.id} userId={userId} tUI={tUI} />}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply input */}
                {replyingTo === q.id && (
                  <div className="px-5 py-3" style={{ borderTop: '1px solid #F3F4F6', background: '#FAFAFA' }}>
                    <div className="flex gap-2 ml-6">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handlePostReply(q.id) }}
                        placeholder={tUI('Share your thoughts...')}
                        className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                        style={{ border: '1px solid #E5E7EB', fontFamily: "'DM Sans', sans-serif" }}
                        autoFocus
                      />
                      <button
                        onClick={() => handlePostReply(q.id)}
                        disabled={posting || !replyText.trim()}
                        className="px-3 py-2 rounded-lg text-sm font-semibold transition-opacity"
                        style={{
                          background: '#E8B84B',
                          color: '#1B2A4A',
                          fontFamily: "'DM Sans', sans-serif",
                          opacity: posting || !replyText.trim() ? 0.5 : 1,
                        }}
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* See more / Show less */}
          {questions.length > INITIAL_VISIBLE_QUESTIONS && (
            <div className="text-center pt-2">
              {visibleCount < questions.length ? (
                <button
                  onClick={() => setVisibleCount(prev => prev + INITIAL_VISIBLE_QUESTIONS)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50"
                  style={{ color: '#2B3A67', fontFamily: "'DM Sans', sans-serif" }}
                >
                  <ChevronDown size={16} />
                  {tUI('See more')} ({questions.length - visibleCount} {tUI('remaining')})
                </button>
              ) : (
                <button
                  onClick={() => setVisibleCount(INITIAL_VISIBLE_QUESTIONS)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {tUI('Show less')}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
