'use client'

import Image from 'next/image'
import { founder, leadership, team, getInitials } from '@/lib/data/team'
import { useState, useCallback, useEffect } from 'react'
import { Linkedin, Instagram, Music2, BookOpen, X } from 'lucide-react'

const socialLinks: Record<string, { href: string; label: string; icon: typeof Linkedin }[]> = {
  'Rae Hughart': [
    { href: 'https://www.linkedin.com/in/rae-hughart/', label: 'Rae Hughart on LinkedIn', icon: Linkedin },
    { href: 'https://instagram.com/raehughart', label: 'Rae Hughart on Instagram', icon: Instagram },
    { href: 'https://tiktok.com/@RaehughartEDU', label: 'Rae Hughart on TikTok', icon: Music2 },
    { href: 'https://raehughart.substack.com/', label: 'Rae Hughart on Substack', icon: BookOpen },
  ],
  'Kristin Williams': [
    { href: 'https://www.linkedin.com/in/she-is-kristin/', label: 'Kristin Williams on LinkedIn', icon: Linkedin },
  ],
  'Omar Garcia': [
    { href: 'https://www.linkedin.com/in/ogtaxstrategy/', label: 'Omar Garcia on LinkedIn', icon: Linkedin },
  ],
}

function SocialIconRow({ name, centered }: { name: string; centered?: boolean }) {
  const links = socialLinks[name]
  if (!links) return null
  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 8, marginBottom: 4, alignItems: 'center', justifyContent: centered ? 'center' : undefined }}>
      {links.map(({ href, label, icon: Icon }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          style={{ color: '#1e2749', transition: 'color 0.2s ease', display: 'inline-flex' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ffba06')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#1e2749')}
        >
          <Icon size={18} strokeWidth={1.75} />
        </a>
      ))}
    </div>
  )
}

function HeroStrip({ onPhotoClick }: { onPhotoClick: (slug: string, name: string) => void }) {
  const [imgError, setImgError] = useState(false)
  const initials = getInitials(founder.name)

  return (
    <div style={{
      background: 'white', border: '0.5px solid #E5E7EB', borderRadius: 12,
      padding: 28, marginBottom: 20,
      display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap',
    }}>
      <div onClick={() => onPhotoClick(founder.imageSlug, founder.name)} style={{ cursor: 'pointer', flexShrink: 0 }}>
        {!imgError ? (
          <Image
            src={`/team/${founder.imageSlug}.jpg`}
            alt={founder.name}
            width={140} height={140}
            style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 0 3px #C9A961' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{
            width: 140, height: 140, borderRadius: '50%',
            background: '#1B365D', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 38, fontWeight: 500,
            boxShadow: '0 0 0 3px #C9A961',
          }}>{initials}</div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 240 }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#2A9D8F', margin: '0 0 6px 0' }}>A note from the founder</p>
        <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 4px 0', fontStyle: 'italic' }}>{founder.credentials}</p>
        <p style={{ fontSize: 20, fontWeight: 500, color: '#1e2749', margin: '0 0 4px 0' }}>{founder.name}</p>
        <p style={{ fontSize: 13, color: '#2A9D8F', margin: '0 0 4px 0', fontWeight: 500 }}>{founder.title}</p>
        <SocialIconRow name={founder.name} />
        <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6, margin: 0 }}>{founder.description}</p>
      </div>
    </div>
  )
}

function LeadershipCard({ member, onPhotoClick }: { member: typeof leadership[0]; onPhotoClick: (slug: string, name: string) => void }) {
  const [imgError, setImgError] = useState(false)
  const initials = getInitials(member.name)

  return (
    <div style={{ background: 'white', border: '0.5px solid #E5E7EB', borderRadius: 12, padding: 16, textAlign: 'center' }}>
      <div onClick={() => onPhotoClick(member.imageSlug, member.name)} style={{ cursor: 'pointer' }}>
        {!imgError ? (
          <Image
            src={`/team/${member.imageSlug}.jpg`}
            alt={member.name}
            width={96} height={96}
            style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', boxShadow: '0 0 0 3px #C9A961' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{
            width: 96, height: 96, borderRadius: '50%', margin: '0 auto 12px',
            background: '#1B365D', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 500,
            boxShadow: '0 0 0 3px #C9A961',
          }}>{initials}</div>
        )}
      </div>
      <p style={{ fontSize: 16, fontWeight: 500, color: '#1e2749', margin: '0 0 2px 0' }}>{member.name}</p>
      <p style={{ fontSize: 13, fontWeight: 500, color: '#2A9D8F', margin: '0 0 2px 0' }}>{member.title}</p>
      <SocialIconRow name={member.name} centered />
      <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5, margin: 0 }}>{member.description}</p>
    </div>
  )
}

function TeamCircle({ member, onPhotoClick }: { member: typeof team[0]; onPhotoClick: (slug: string, name: string) => void }) {
  const [imgError, setImgError] = useState(false)
  const initials = getInitials(member.name)
  const ringStyle = member.isMascot
    ? { boxShadow: '0 0 0 4.5px #2A9D8F' }
    : member.isHuman
      ? { boxShadow: '0 0 0 4.5px #C9A961' }
      : {}

  return (
    <div style={{ textAlign: 'center' }}>
      <div onClick={() => onPhotoClick(member.imageSlug, member.name)} style={{ cursor: 'pointer' }}>
        {!imgError ? (
          <Image
            src={`/team/${member.imageSlug}.jpg`}
            alt={member.name}
            width={110} height={110}
            style={{ width: 110, height: 110, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 8px', ...ringStyle }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{
            width: 110, height: 110, borderRadius: '50%', margin: '0 auto 8px',
            background: member.isHuman ? '#1B365D' : '#E1F5EE',
            color: member.isHuman ? 'white' : '#0F6E56',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 500,
            ...ringStyle,
          }}>{initials}</div>
        )}
      </div>
      <p style={{ fontSize: 12, fontWeight: 500, color: '#1e2749', margin: '0 0 2px 0' }}>{member.name}</p>
      <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>{member.title}</p>
    </div>
  )
}

function PhotoLightbox({ src, name, onClose }: { src: string; name: string; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
          width: 40, height: 40, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <X style={{ width: 20, height: 20, color: 'white' }} />
      </button>
      <div onClick={(e) => e.stopPropagation()} style={{ cursor: 'default', textAlign: 'center' }}>
        <Image
          src={src}
          alt={name}
          width={400} height={400}
          style={{ width: 400, height: 400, maxWidth: '85vw', maxHeight: '85vw', borderRadius: 16, objectFit: 'cover' }}
        />
        <p style={{ color: 'white', fontSize: 16, fontWeight: 500, marginTop: 12 }}>{name}</p>
      </div>
    </div>
  )
}

export default function AboutTeamSection() {
  const [lightbox, setLightbox] = useState<{ src: string; name: string } | null>(null)
  const openPhoto = useCallback((imageSlug: string, name: string) => {
    setLightbox({ src: `/team/${imageSlug}.jpg`, name })
  }, [])

  return (
    <section id="team" style={{ padding: '48px 0' }}>
      <h2 style={{ fontSize: 28, fontWeight: 500, color: '#1e2749', marginBottom: 32, fontFamily: "'Source Serif 4', Georgia, serif" }}>
        Team
      </h2>

      <HeroStrip onPhotoClick={openPhoto} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 16,
        marginBottom: 32,
      }}>
        {leadership.map(member => (
          <LeadershipCard key={member.name} member={member} onPhotoClick={openPhoto} />
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 16,
      }}>
        {team.map(member => (
          <TeamCircle key={member.name} member={member} onPhotoClick={openPhoto} />
        ))}
      </div>

      {lightbox && (
        <PhotoLightbox src={lightbox.src} name={lightbox.name} onClose={() => setLightbox(null)} />
      )}
    </section>
  )
}
