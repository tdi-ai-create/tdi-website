'use client'

import { useState, useEffect } from 'react'
import { getTopicConfig } from '@/lib/data/creator-topics'
import {
  BookOpen, Activity, Calculator, FlaskConical, Palette,
  GraduationCap, Sparkles,
} from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<{ style?: React.CSSProperties }>> = {
  BookOpen, Activity, Calculator, FlaskConical, Palette, GraduationCap, Sparkles,
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
        <IconComponent style={{ width: 28, height: 28, color: config.iconColor }} />
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
    <section id="creators" style={{ padding: '48px 0' }}>
      <h2 style={{ fontSize: 28, fontWeight: 500, color: '#1e2749', marginBottom: 32, fontFamily: "'Source Serif 4', Georgia, serif" }}>
        Creators
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
        gap: 16,
      }}>
        {creators.map(creator => (
          <CreatorCircle key={creator.id} creator={creator} />
        ))}
      </div>
    </section>
  )
}
