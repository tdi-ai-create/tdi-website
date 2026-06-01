'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sparkles, FileText, Mail, Target, Eye, MessageCircle, ChevronDown, Copy, Check, RefreshCw } from 'lucide-react'

interface InsightData {
  name: string
  role: string
  toolsExplored: number
  hoursSaved: string
  daysActive: number
  recognitionsEarned: number
  earnedNames: string[]
  topCategories: string[]
  communityPosts: number
  coursesCompleted: number
  pdHours: number
}

interface InsightSection {
  id: string
  title: string
  description: string
  icon: typeof Sparkles
  type: string
  accentColor: string
}

const SECTIONS: InsightSection[] = [
  {
    id: 'growth_patterns',
    title: 'Growth Insights',
    description: 'AI-spotted patterns in your learning journey',
    icon: Eye,
    type: 'growth_patterns',
    accentColor: '#2A9D8F',
  },
  {
    id: 'strength_spotter',
    title: 'Your Strengths',
    description: 'What your activity reveals about your teaching',
    icon: Target,
    type: 'strength_spotter',
    accentColor: '#E8B84B',
  },
  {
    id: 'next_steps',
    title: 'Recommended Next Steps',
    description: 'Personalized suggestions based on your patterns',
    icon: Sparkles,
    type: 'next_steps',
    accentColor: '#7C9CBF',
  },
  {
    id: 'reflection_prompt',
    title: 'Reflection',
    description: 'A question just for you',
    icon: MessageCircle,
    type: 'reflection_prompt',
    accentColor: '#9B7CB8',
  },
]

function InsightCard({
  section,
  data,
}: {
  section: InsightSection
  data: InsightData
}) {
  const [insight, setInsight] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const Icon = section.icon

  const fetchInsight = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hub/insights/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: section.type, data }),
      })
      if (res.ok) {
        const result = await res.json()
        setInsight(result.insight || 'No insights available right now.')
      }
    } catch {
      setInsight('Unable to generate insight right now.')
    } finally {
      setLoading(false)
    }
  }, [section.type, data])

  const handleExpand = () => {
    if (!expanded) {
      setExpanded(true)
      if (!insight) fetchInsight()
    } else {
      setExpanded(false)
    }
  }

  return (
    <div
      className="bg-white rounded-xl overflow-hidden transition-shadow hover:shadow-md"
      style={{ border: '1px solid rgba(27,42,74,0.08)' }}
    >
      <button
        onClick={handleExpand}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: section.accentColor + '18' }}
        >
          <Icon size={18} style={{ color: section.accentColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: '#1B2A4A', fontFamily: "'DM Sans', sans-serif" }}>
            {section.title}
          </p>
          <p className="text-xs" style={{ color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif" }}>
            {section.description}
          </p>
        </div>
        <ChevronDown
          size={16}
          style={{
            color: '#9CA3AF',
            transition: 'transform 200ms',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4" style={{ borderTop: '1px solid #F3F4F6' }}>
          {loading ? (
            <div className="py-4 flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin" />
              <span className="text-xs" style={{ color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif" }}>
                Analyzing your journey...
              </span>
            </div>
          ) : (
            <div className="pt-3">
              <p
                className="text-sm leading-relaxed whitespace-pre-line"
                style={{ color: '#374151', fontFamily: "'DM Sans', sans-serif" }}
              >
                {insight}
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); fetchInsight() }}
                className="mt-3 flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-70"
                style={{ color: section.accentColor }}
              >
                <RefreshCw size={12} />
                Regenerate
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function GeneratorCard({
  title,
  description,
  icon: Icon,
  accentColor,
  type,
  data,
  buttonLabel,
}: {
  title: string
  description: string
  icon: typeof FileText
  accentColor: string
  type: string
  data: InsightData
  buttonLabel: string
}) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const generate = async () => {
    setLoading(true)
    setCopied(false)
    try {
      const res = await fetch('/api/hub/insights/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data }),
      })
      if (res.ok) {
        const result = await res.json()
        setContent(result.insight || '')
      }
    } catch {
      setContent('Unable to generate right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div
      className="bg-white rounded-xl p-5"
      style={{ border: '1px solid rgba(27,42,74,0.08)' }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: accentColor + '18' }}
        >
          <Icon size={20} style={{ color: accentColor }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: '#1B2A4A', fontFamily: "'DM Sans', sans-serif" }}>
            {title}
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif" }}>
            {description}
          </p>
        </div>
      </div>

      {!content ? (
        <button
          onClick={generate}
          disabled={loading}
          className="w-full py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          style={{
            backgroundColor: loading ? '#F3F4F6' : accentColor,
            color: loading ? '#6B7280' : 'white',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {loading ? 'Generating...' : buttonLabel}
        </button>
      ) : (
        <div>
          <div
            className="p-4 rounded-lg mb-3 text-sm leading-relaxed whitespace-pre-line"
            style={{
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              color: '#374151',
              fontFamily: "'DM Sans', sans-serif",
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            {content}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                backgroundColor: copied ? '#E1F5EE' : accentColor,
                color: copied ? '#0F6E56' : 'white',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy to clipboard'}
            </button>
            <button
              onClick={generate}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-gray-100"
              style={{ color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}
            >
              <RefreshCw size={12} />
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AchievementInsights({ data }: { data: InsightData }) {
  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} style={{ color: '#E8B84B' }} />
        <h2
          className="text-xl font-bold"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: '#1B2A4A' }}
        >
          AI Growth Insights
        </h2>
      </div>
      <p className="text-sm mb-6" style={{ color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif" }}>
        Powered by AI, personalized to your journey. Click any section to explore.
      </p>

      {/* Quick Insight Cards */}
      <div className="space-y-2 mb-6">
        {SECTIONS.map(section => (
          <InsightCard key={section.id} section={section} data={data} />
        ))}
      </div>

      {/* Generator Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <GeneratorCard
          title="PD Growth Narrative"
          description="A ready-to-paste paragraph for your evaluation portfolio"
          icon={FileText}
          accentColor="#1B2A4A"
          type="growth_narrative"
          data={data}
          buttonLabel="Generate My Narrative"
        />
        <GeneratorCard
          title="Email to Admin"
          description="A professional email to share your growth with leadership"
          icon={Mail}
          accentColor="#38618C"
          type="admin_email"
          data={data}
          buttonLabel="Generate Email"
        />
      </div>
    </div>
  )
}
