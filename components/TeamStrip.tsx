'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { getTopicConfig } from '@/lib/data/creator-topics'
import {
  BookOpen, BookMarked, PenLine, Activity, Calculator, FlaskConical, Palette,
  GraduationCap, Sparkles, Globe, Languages, HeartHandshake, Music, Library,
  HeartPulse, LayoutGrid, Lightbulb, Route, ClipboardCheck, NotebookPen,
  PencilRuler, Baby, Puzzle, MessagesSquare, Star, Users, Sprout, Clock,
  Target, Home as HomeIcon, Laptop, Scale,
} from 'lucide-react'

const ICON_COMPONENTS: Record<string, any> = {
  BookOpen, BookMarked, PenLine, Activity, Calculator, FlaskConical, Palette,
  GraduationCap, Sparkles, Globe, Languages, HeartHandshake, Music, Library,
  HeartPulse, LayoutGrid, Lightbulb, Route, ClipboardCheck, NotebookPen,
  PencilRuler, Baby, Puzzle, MessagesSquare, Star, Users, Sprout, Clock,
  Target, HomeIcon, Laptop, Scale,
}

interface TeamStripMember {
  type: 'team'
  name: string
  imageSlug: string
  isHuman?: boolean
}

interface CreatorStripMember {
  type: 'creator'
  name: string
  topic: string
}

type StripMember = TeamStripMember | CreatorStripMember

interface TeamStripProps {
  members: StripMember[]
  copy: string
  linkText?: string
  linkHref?: string
}

function TeamAvatar({ member }: { member: TeamStripMember }) {
  const [imgError, setImgError] = useState(false)
  const initials = member.name.split(' ').filter(p => !['Dr.'].includes(p)).map(p => p[0]).join('').toUpperCase().slice(0, 2)
  const goldRing = member.isHuman ? { boxShadow: '0 0 0 2px #C9A961' } : {}

  if (!imgError) {
    return (
      <Image
        src={`/team/${member.imageSlug}.jpg`}
        alt={member.name}
        width={48} height={48}
        style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid white', marginLeft: -8, ...goldRing }}
        onError={() => setImgError(true)}
      />
    )
  }
  return (
    <div style={{
      width: 48, height: 48, borderRadius: '50%', border: '2px solid white', marginLeft: -8,
      background: member.isHuman ? '#1B365D' : '#E1F5EE',
      color: member.isHuman ? 'white' : '#0F6E56',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 500,
      ...goldRing,
    }}>{initials}</div>
  )
}

function CreatorAvatar({ member }: { member: CreatorStripMember }) {
  const config = getTopicConfig(member.topic)
  const Icon = ICON_COMPONENTS[config.icon] || Sparkles
  return (
    <div style={{
      width: 48, height: 48, borderRadius: '50%', border: '2px solid white', marginLeft: -8,
      background: config.background, color: config.iconColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `inset 0 0 0 2px ${config.border}`,
    }}>
      <Icon size={20} />
    </div>
  )
}

export default function TeamStrip({ members, copy, linkText = 'Meet the team', linkHref = '/about#team' }: TeamStripProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20,
      padding: '24px 16px', flexWrap: 'wrap', textAlign: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
        {members.map((m, i) => m.type === 'team' ? (
          <TeamAvatar key={`team-${m.name}-${i}`} member={m} />
        ) : (
          <CreatorAvatar key={`creator-${m.name}-${i}`} member={m} />
        ))}
      </div>
      <p style={{ fontSize: 14, color: '#1e2749', margin: 0, maxWidth: 520 }}>
        {copy}
      </p>
      <Link
        href={linkHref}
        style={{
          fontSize: 13, fontWeight: 500, color: '#1e2749',
          padding: '8px 16px', borderRadius: 999,
          background: 'white', border: '1px solid #2A9D8F',
          textDecoration: 'none', whiteSpace: 'nowrap',
        }}
      >
        {linkText}
      </Link>
    </div>
  )
}
