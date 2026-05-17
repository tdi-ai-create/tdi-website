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

      {/* SOCIAL PROOF STRIP */}
      <section style={{ padding: '40px 16px', backgroundColor: 'white', borderTop: '0.5px solid #E5E7EB' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#2A9D8F', marginBottom: 12 }}>
            Trusted by 100,000+ educators
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 32, maxWidth: 800, margin: '24px auto 0', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#1e2749', margin: 0 }}>100K+</p>
              <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>Educators</p>
            </div>
            <div>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#1e2749', margin: 0 }}>All 50</p>
              <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>States</p>
            </div>
            <div>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#1e2749', margin: 0 }}>100+</p>
              <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>Countries</p>
            </div>
            <div>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#1e2749', margin: 0 }}>75%</p>
              <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>Implementation rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER NOTE */}
      <section style={{ padding: '80px 16px', backgroundColor: '#FAF3E0' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#1e2749', marginBottom: 16, opacity: 0.7 }}>
            A note from our founder
          </p>
          <p style={{ fontSize: 18, color: '#1e2749', lineHeight: 1.7, margin: '0 0 24px 0', fontStyle: 'italic' }}>
            "I built the Learning Hub because I watched too many incredible educators burn out alone. Not because they didn't care. Because the system was never built to actually support them. This is the PD I wish I had as a 6th grade teacher — practical, honest, and respectful of your time. We can't wait to share it with you."
          </p>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#1e2749', margin: 0 }}>Rae Hughart</p>
          <p style={{ fontSize: 13, color: '#1e2749', opacity: 0.7, margin: 0 }}>CEO & Founder, Teachers Deserve It</p>
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

      {/* FAQ */}
      <section style={{ padding: '80px 16px', backgroundColor: '#F9FAFB' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#2A9D8F', marginBottom: 12 }}>
              Frequently Asked Questions
            </p>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1e2749', margin: 0 }}>
              Real questions from real educators
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              {
                q: "How is this different from free PD I can find on YouTube?",
                a: "Free PD is everywhere — but it's scattered, unverified, and rarely tied to real classroom implementation. The Hub is built by classroom-tested educators, organized by what you actually need (not what's trending), and gives you community feedback on every lesson. You're not searching alone, you're learning with 100,000+ educators who've tried it before you."
              },
              {
                q: "What if my staff won't actually use it?",
                a: "We hear you. That's why we built the LIFT filter — strategies sorted by effort, so teachers can find a 5-minute win on a hard day. 75% of teachers implement a strategy within 10 days of joining. The Hub is designed for the educator who doesn't have an hour, not for the one with all the time in the world."
              },
              {
                q: "Can this count toward PD hours or licensure?",
                a: "Yes. All-Access members earn PD certificates that document hours completed. We can also generate compliance documentation for state requirements when schools partner with us at the district level."
              },
              {
                q: "What's your stance on creator pay?",
                a: "Every creator earns ongoing revenue when educators enroll in their content. They keep ownership of their work, and we handle production, marketing, and distribution. We pay our community because we believe teachers deserve better — and that includes the teachers building this with us."
              },
              {
                q: "Can my admin see what I'm learning?",
                a: "Only if your school partners with us. In that case, admins see implementation data and aggregate trends — not individual transcripts or check-in responses. Personal wellness check-ins are private to you. Always."
              },
              {
                q: "What happens if I cancel?",
                a: "Cancel anytime, no questions. You keep access through the end of your billing period and lose nothing you've already downloaded or earned. We're not in the business of trapping people."
              },
              {
                q: "Why are you launching now?",
                a: "We've spent two years building this with educators, and after 100K+ teachers told us what they needed, it's time to deliver. June 2026 is when we open the doors — and the waitlist gets first access."
              },
              {
                q: "What does my school or district get?",
                a: "Bulk pricing, dashboards to track implementation, compliance and board-ready reports, and the full TDI partnership infrastructure. Schools and districts get more than memberships — they get our team. See partnership options on the For Schools page."
              },
            ].map((item, i) => (
              <details
                key={i}
                style={{
                  background: 'white',
                  borderRadius: 12,
                  border: '0.5px solid #E5E7EB',
                  padding: 0,
                }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    padding: '20px 24px',
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#1e2749',
                    listStyle: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  {item.q}
                  <span style={{ fontSize: 20, color: '#2A9D8F', fontWeight: 400, flexShrink: 0 }}>+</span>
                </summary>
                <div style={{ padding: '0 24px 20px', fontSize: 14, color: '#4B5563', lineHeight: 1.7 }}>
                  {item.a}
                </div>
              </details>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
              Still have questions? <Link href="/contact" style={{ color: '#2A9D8F', fontWeight: 500 }}>Get in touch →</Link>
            </p>
          </div>
        </div>
      </section>

    </main>
  )
}
