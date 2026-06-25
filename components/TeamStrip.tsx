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
  const firstName = member.name.replace('Dr. ', '').split(' ')[0]
  const initials = member.name.split(' ').filter(p => !['Dr.'].includes(p)).map(p => p[0]).join('').toUpperCase().slice(0, 2)
  const goldRing = member.isHuman ? { boxShadow: '0 0 0 2.5px #C9A961' } : {}

  if (!imgError) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Image
          src={`/team/${member.imageSlug}.jpg`}
          alt={member.name}
          width={64} height={64}
          className="rounded-full object-cover"
          style={{ width: 64, height: 64, border: '3px solid white', ...goldRing }}
          onError={() => setImgError(true)}
        />
        <span style={{ fontSize: 12, color: '#1e2749', fontWeight: 500, opacity: 0.7 }}>{firstName}</span>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{
        width: 64, height: 64, borderRadius: '50%', border: '3px solid white',
        background: member.isHuman ? '#1B365D' : '#E1F5EE',
        color: member.isHuman ? 'white' : '#0F6E56',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 600,
        ...goldRing,
      }}>{initials}</div>
      <span style={{ fontSize: 12, color: '#1e2749', fontWeight: 500, opacity: 0.7 }}>{firstName}</span>
    </div>
  )
}

function CreatorAvatar({ member }: { member: CreatorStripMember }) {
  const config = getTopicConfig(member.topic)
  const Icon = ICON_COMPONENTS[config.icon] || Sparkles
  const firstName = member.name.replace('Dr. ', '').split(' ')[0]
  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{
        width: 64, height: 64, borderRadius: '50%', border: '3px solid white',
        background: config.background, color: config.iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `inset 0 0 0 2px ${config.border}`,
      }}>
        <Icon size={24} />
      </div>
      <span style={{ fontSize: 12, color: '#1e2749', fontWeight: 500, opacity: 0.7 }}>{firstName}</span>
    </div>
  )
}

export default function TeamStrip({ members, copy, linkText = 'Meet the team', linkHref = '/about#team' }: TeamStripProps) {
  return (
    <div style={{ padding: '40px 16px', textAlign: 'center' }}>
      <p style={{ fontSize: 15, color: '#1e2749', margin: '0 0 24px 0', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
        {copy}
      </p>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
        {members.map((m, i) => m.type === 'team' ? (
          <TeamAvatar key={`team-${m.name}-${i}`} member={m} />
        ) : (
          <CreatorAvatar key={`creator-${m.name}-${i}`} member={m} />
        ))}
      </div>
      <Link
        href={linkHref}
        style={{
          fontSize: 13, fontWeight: 600, color: '#1e2749',
          padding: '10px 20px', borderRadius: 999,
          background: 'white', border: '1.5px solid #2A9D8F',
          textDecoration: 'none', whiteSpace: 'nowrap',
          display: 'inline-block',
        }}
      >
        {linkText}
      </Link>
    </div>
  )
}
