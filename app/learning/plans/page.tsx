'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Crown, Sparkles, Zap, Check, ArrowRight, Mail, User, Phone, Briefcase } from 'lucide-react'

const ROLES = ['Teacher', 'Admin', 'Para', 'Other'] as const

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: '',
    icon: Sparkles,
    accent: '#6B7280',
    description: 'Access rotating free content each week.',
    features: [
      { text: 'Rotating free content weekly', included: true },
      { text: 'Save favorites for later', included: true },
      { text: 'Track your PD hours', included: true },
      { text: 'Individual quick wins', included: false },
      { text: 'Resource packs', included: false },
      { text: 'Full course library', included: false },
    ],
    highlight: false,
  },
  {
    id: 'essentials',
    name: 'Essentials',
    price: 5,
    period: '/mo',
    icon: Zap,
    accent: '#185FA5',
    description: 'Download individual quick wins and resources.',
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'All individual quick wins', included: true },
      { text: 'Download PDFs & templates', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Resource packs', included: false },
      { text: 'Full course library', included: false },
    ],
    highlight: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 10,
    period: '/mo',
    icon: Crown,
    accent: '#2A9D8F',
    description: 'Comprehensive resource packs for your classroom.',
    features: [
      { text: 'Everything in Essentials', included: true },
      { text: 'Comprehensive resource packs', included: true },
      { text: 'Monthly new content drops', included: true },
      { text: 'Early access to new courses', included: true },
      { text: 'Community discussion access', included: true },
      { text: 'Full course library', included: false },
    ],
    highlight: true,
  },
  {
    id: 'allaccess',
    name: 'All-Access',
    price: 25,
    period: '/mo',
    icon: Crown,
    accent: '#1e2749',
    description: 'Unlock everything, including the full course library.',
    features: [
      { text: 'Everything in Professional', included: true },
      { text: 'Full course library access', included: true },
      { text: 'Earn PD certificates', included: true },
      { text: 'Exclusive workshops', included: true },
      { text: 'Direct creator access', included: true },
      { text: '1-on-1 coaching sessions', included: true },
    ],
    highlight: false,
  },
]

export default function PlansPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<typeof ROLES[number] | ''>('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name || !email || !role) {
      setError('Please fill in your name, email, and role.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/hub-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, role }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <main style={{ backgroundColor: '#ffffff' }}>

      {/* HERO */}
      <section style={{ backgroundColor: '#1e2749', padding: '80px 16px 60px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', padding: '6px 14px', background: 'rgba(255,186,6,0.15)', color: '#ffba06', borderRadius: 999, fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>
            ★ Launching June 2026
          </span>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700, color: 'white', margin: '0 0 16px 0', lineHeight: 1.15 }}>
            Membership Plans
          </h1>
          <p style={{ fontSize: 18, color: 'white', opacity: 0.85, maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
            Choose what fits your needs. Get on the launch list now to be first in line — and the first to know when it's live.
          </p>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section style={{ padding: '60px 16px', backgroundColor: '#F9FAFB' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
            {TIERS.map((tier) => {
              const Icon = tier.icon
              return (
                <div
                  key={tier.id}
                  style={{
                    background: 'white',
                    borderRadius: 16,
                    padding: 28,
                    border: tier.highlight ? `2px solid ${tier.accent}` : '0.5px solid #E5E7EB',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {tier.highlight && (
                    <span style={{
                      position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                      background: tier.accent, color: 'white',
                      padding: '5px 14px', borderRadius: 999,
                      fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase',
                    }}>
                      Most Popular
                    </span>
                  )}

                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `${tier.accent}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                    <Icon style={{ width: 24, height: 24, color: tier.accent }} />
                  </div>

                  <h3 style={{ fontSize: 22, fontWeight: 700, color: '#1e2749', margin: '0 0 4px 0' }}>{tier.name}</h3>

                  <div style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 36, fontWeight: 700, color: '#1e2749' }}>
                      {tier.price === 0 ? 'Free' : `$${tier.price}`}
                    </span>
                    {tier.period && (
                      <span style={{ fontSize: 14, fontWeight: 400, color: '#6B7280', marginLeft: 4 }}>{tier.period}</span>
                    )}
                  </div>

                  <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 20px 0', lineHeight: 1.5 }}>{tier.description}</p>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', flexGrow: 1 }}>
                    {tier.features.map((feature, i) => (
                      <li
                        key={i}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: 8,
                          fontSize: 13,
                          color: feature.included ? '#1e2749' : '#9CA3AF',
                          marginBottom: 10,
                          lineHeight: 1.4,
                        }}
                      >
                        <Check style={{
                          width: 16, height: 16,
                          color: feature.included ? tier.accent : '#D1D5DB',
                          flexShrink: 0, marginTop: 2,
                        }} />
                        <span style={{ textDecoration: feature.included ? 'none' : 'line-through' }}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    disabled
                    style={{
                      width: '100%', padding: '12px',
                      background: '#F3F4F6', color: '#6B7280',
                      border: '1px solid #E5E7EB', borderRadius: 8,
                      fontWeight: 600, fontSize: 13,
                      cursor: 'not-allowed',
                    }}
                  >
                    Launching June 2026
                  </button>
                </div>
              )
            })}
          </div>

          <p style={{ textAlign: 'center', fontSize: 14, color: '#6B7280', maxWidth: 700, margin: '0 auto' }}>
            Bulk pricing available for schools and districts at launch. <Link href="/for-schools" style={{ color: '#2A9D8F', fontWeight: 500 }}>Explore partnership options →</Link>
          </p>
        </div>
      </section>

      {/* WAITLIST FORM */}
      <section id="waitlist" style={{ padding: '80px 16px', backgroundColor: '#1e2749' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {!submitted ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#ffba06', marginBottom: 12 }}>
                  Get on the List
                </p>
                <h2 style={{ fontSize: 32, fontWeight: 700, color: 'white', margin: '0 0 12px 0' }}>
                  Be the first to know when we launch.
                </h2>
                <p style={{ fontSize: 16, color: 'white', opacity: 0.85, lineHeight: 1.6 }}>
                  We'll let you know the moment the Hub goes live in June 2026. No spam, no pressure — just one email.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, background: 'rgba(255,255,255,0.05)', padding: 28, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: 'white', marginBottom: 6 }}>
                    <User style={{ width: 14, height: 14 }} /> Your name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                    style={{
                      width: '100%', padding: '12px 14px',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8,
                      background: 'rgba(255,255,255,0.95)',
                      fontSize: 14, color: '#1e2749',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: 'white', marginBottom: 6 }}>
                    <Mail style={{ width: 14, height: 14 }} /> Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@school.edu"
                    style={{
                      width: '100%', padding: '12px 14px',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8,
                      background: 'rgba(255,255,255,0.95)',
                      fontSize: 14, color: '#1e2749',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: 'white', marginBottom: 6 }}>
                    <Phone style={{ width: 14, height: 14 }} /> Phone <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    style={{
                      width: '100%', padding: '12px 14px',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8,
                      background: 'rgba(255,255,255,0.95)',
                      fontSize: 14, color: '#1e2749',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: 'white', marginBottom: 6 }}>
                    <Briefcase style={{ width: 14, height: 14 }} /> I am a
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {ROLES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 8,
                          border: role === r ? '2px solid #ffba06' : '1px solid rgba(255,255,255,0.2)',
                          background: role === r ? 'rgba(255,186,6,0.15)' : 'rgba(255,255,255,0.05)',
                          color: 'white',
                          fontSize: 13, fontWeight: 500,
                          cursor: 'pointer',
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <p style={{ fontSize: 13, color: '#FCA5A5', margin: 0 }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '14px',
                    background: submitting ? '#9CA3AF' : '#ffba06',
                    color: '#1e2749',
                    border: 'none', borderRadius: 8,
                    fontWeight: 600, fontSize: 15,
                    cursor: submitting ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  {submitting ? 'Joining...' : 'Notify me at launch'}
                  {!submitting && <ArrowRight style={{ width: 16, height: 16 }} />}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 24px', background: 'rgba(255,255,255,0.05)', borderRadius: 16, border: '1px solid rgba(255,186,6,0.3)' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ffba06', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Check style={{ width: 32, height: 32, color: '#1e2749' }} />
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: 'white', margin: '0 0 12px 0' }}>You're on the list!</h2>
              <p style={{ fontSize: 16, color: 'white', opacity: 0.85, lineHeight: 1.6 }}>
                We'll email you the moment the TDI Learning Hub launches in June 2026. Until then, take a look around the rest of <Link href="/" style={{ color: '#ffba06', fontWeight: 500 }}>teachersdeserveit.com</Link>.
              </p>
            </div>
          )}
        </div>
      </section>

    </main>
  )
}
