'use client'

import Image from 'next/image'
import { featuredTeam, supportingTeam, getInitials } from '@/lib/data/team'
import { useState } from 'react'

function FeaturedCard({ member }: { member: typeof featuredTeam[0] }) {
  const [imgError, setImgError] = useState(false)
  const initials = getInitials(member.name)

  return (
    <div style={{
      background: 'white', border: '0.5px solid #E5E7EB', borderRadius: 12,
      padding: 16, textAlign: 'center',
    }}>
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
          fontSize: 28, fontWeight: 500,
        }}>
          {initials}
        </div>
      )}
      <p style={{ fontSize: 15, fontWeight: 500, color: '#1e2749', margin: '0 0 2px 0' }}>{member.name}</p>
      <p style={{ fontSize: 13, fontWeight: 500, color: '#2A9D8F', margin: '0 0 6px 0' }}>{member.title}</p>
      <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5, margin: 0 }}>{member.description}</p>
    </div>
  )
}

function SupportingCircle({ member }: { member: typeof supportingTeam[0] }) {
  const initials = getInitials(member.name)

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%', margin: '0 auto 6px',
        background: '#E1F5EE', color: '#0F6E56',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 500,
      }}>
        {initials}
      </div>
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

      {/* Featured cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }}>
        {featuredTeam.map(member => (
          <FeaturedCard key={member.name} member={member} />
        ))}
      </div>

      {/* Supporting team circles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
        gap: 12,
      }}>
        {supportingTeam.map(member => (
          <SupportingCircle key={member.name} member={member} />
        ))}
      </div>
    </section>
  )
}
