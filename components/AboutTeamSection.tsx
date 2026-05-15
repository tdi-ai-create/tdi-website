'use client'

import Image from 'next/image'
import { founder, leadership, team, getInitials } from '@/lib/data/team'
import { useState } from 'react'

function HeroStrip() {
  const [imgError, setImgError] = useState(false)
  const initials = getInitials(founder.name)

  return (
    <div style={{
      background: 'white', border: '0.5px solid #E5E7EB', borderRadius: 12,
      padding: 28, marginBottom: 20,
      display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap',
    }}>
      {!imgError ? (
        <Image
          src={`/team/${founder.imageSlug}.jpg`}
          alt={founder.name}
          width={140} height={140}
          style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div style={{
          width: 140, height: 140, borderRadius: '50%', flexShrink: 0,
          background: '#1B365D', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 38, fontWeight: 500,
        }}>{initials}</div>
      )}
      <div style={{ flex: 1, minWidth: 240 }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#2A9D8F', margin: '0 0 4px 0' }}>A note from the founder</p>
        <p style={{ fontSize: 20, fontWeight: 500, color: '#1e2749', margin: '0 0 4px 0' }}>{founder.name}</p>
        <p style={{ fontSize: 13, color: '#2A9D8F', margin: '0 0 12px 0', fontWeight: 500 }}>{founder.title}</p>
        <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6, margin: 0 }}>{founder.description}</p>
      </div>
    </div>
  )
}

function LeadershipCard({ member }: { member: typeof leadership[0] }) {
  const [imgError, setImgError] = useState(false)
  const initials = getInitials(member.name)

  return (
    <div style={{ background: 'white', border: '0.5px solid #E5E7EB', borderRadius: 12, padding: 16, textAlign: 'center' }}>
      {!imgError ? (
        <Image
          src={`/team/${member.imageSlug}.jpg`}
          alt={member.name}
          width={96} height={96}
          style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px' }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div style={{
          width: 96, height: 96, borderRadius: '50%', margin: '0 auto 12px',
          background: '#1B365D', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, fontWeight: 500,
        }}>{initials}</div>
      )}
      <p style={{ fontSize: 16, fontWeight: 500, color: '#1e2749', margin: '0 0 2px 0' }}>{member.name}</p>
      <p style={{ fontSize: 13, fontWeight: 500, color: '#2A9D8F', margin: '0 0 6px 0' }}>{member.title}</p>
      <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5, margin: 0 }}>{member.description}</p>
    </div>
  )
}

function TeamCircle({ member }: { member: typeof team[0] }) {
  const [imgError, setImgError] = useState(false)
  const initials = getInitials(member.name)
  const goldRing = member.isHuman ? { boxShadow: '0 0 0 3px #C9A961' } : {}

  return (
    <div style={{ textAlign: 'center' }}>
      {!imgError ? (
        <Image
          src={`/team/${member.imageSlug}.jpg`}
          alt={member.name}
          width={110} height={110}
          style={{ width: 110, height: 110, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 8px', ...goldRing }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div style={{
          width: 110, height: 110, borderRadius: '50%', margin: '0 auto 8px',
          background: member.isHuman ? '#1B365D' : '#E1F5EE',
          color: member.isHuman ? 'white' : '#0F6E56',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 500,
          ...goldRing,
        }}>{initials}</div>
      )}
      <p style={{ fontSize: 12, fontWeight: 500, color: '#1e2749', margin: '0 0 2px 0' }}>{member.name}</p>
      <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>{member.title}</p>
    </div>
  )
}

export default function AboutTeamSection() {
  return (
    <section id="team" style={{ padding: '48px 0' }}>
      <h2 style={{ fontSize: 28, fontWeight: 500, color: '#1e2749', marginBottom: 32, fontFamily: "'Source Serif 4', Georgia, serif" }}>
        Team
      </h2>

      <HeroStrip />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 16,
        marginBottom: 32,
      }}>
        {leadership.map(member => (
          <LeadershipCard key={member.name} member={member} />
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 16,
      }}>
        {team.map(member => (
          <TeamCircle key={member.name} member={member} />
        ))}
      </div>
    </section>
  )
}
