'use client'

import { useState, useEffect } from 'react'
import { getTopicConfig } from '@/lib/data/creator-topics'
import {
  BookOpen, BookMarked, PenLine, Activity, Calculator, FlaskConical, Palette,
  GraduationCap, Sparkles, Globe, Languages, HeartHandshake, Music, Library,
  HeartPulse, LayoutGrid, Lightbulb, Route, ClipboardCheck, NotebookPen,
  PencilRuler, Baby, Puzzle, MessagesSquare, Star, Users, Sprout, Clock,
  Target, Home as HomeIcon, Laptop, Scale,
} from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<{ style?: React.CSSProperties }>> = {
  BookOpen, BookMarked, PenLine, Activity, Calculator, FlaskConical, Palette,
  GraduationCap, Sparkles, Globe, Languages, HeartHandshake, Music, Library,
  HeartPulse, LayoutGrid, Lightbulb, Route, ClipboardCheck, NotebookPen,
  PencilRuler, Baby, Puzzle, MessagesSquare, Star, Users, Sprout, Clock,
  Target, HomeIcon, Laptop, Scale,
}

interface Creator {
  id: string
  name: string
  website_display_name: string | null
  topic: string | null
}

function CreatorCircle({ creator }: { creator: Creator }) {
  const config = getTopicConfig(creator.topic)
  const IconComponent = ICON_MAP[config.icon] || Sparkles
  const displayName = creator.website_display_name || creator.name

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%', margin: '0 auto 8px',
        background: config.background,
        border: `2px solid ${config.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <IconComponent style={{ width: 34, height: 34, color: config.iconColor }} />
      </div>
      <p style={{ fontSize: 12, fontWeight: 500, color: '#1e2749', margin: '0 0 2px 0' }}>{displayName}</p>
      {creator.topic && (
        <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>{creator.topic}</p>
      )}
    </div>
  )
}

export default function AboutCreatorsSection() {
  const [creators, setCreators] = useState<Creator[]>([])

  useEffect(() => {
    fetch('/api/public/creators')
      .then(r => r.json())
      .then(data => {
        const list = data.creators || data || []
        setCreators(list.filter((c: Creator) => c.name))
      })
      .catch(() => {})
  }, [])

  if (creators.length === 0) return null

  return (
    <div id="creators" style={{ padding: '16px 0' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
        gap: 16,
      }}>
        {creators.map(creator => (
          <CreatorCircle key={creator.id} creator={creator} />
        ))}

        {/* "YOU?" CTA card */}
        <a
          href="/create-with-us"
          style={{
            textAlign: 'center',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 8px',
            background: 'linear-gradient(135deg, #FFF8E7 0%, #FEF3C7 100%)',
            border: '2px dashed #E8B84B',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#E8B84B' }}>+</span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#E8B84B', margin: '0 0 2px 0' }}>YOU?</p>
          <p style={{ fontSize: 10, color: '#6B7280', margin: 0, lineHeight: 1.3 }}>Apply to become a creator</p>
        </a>
      </div>
    </div>
  )
}
