'use client'

import Link from 'next/link'
import Image from 'next/image'
import TeamStrip from '@/components/TeamStrip'

export default function HubWelcomePage() {
  return (
    <main style={{ backgroundColor: '#ffffff' }}>

      {/* HERO */}
      <section style={{ backgroundColor: '#1e2749', padding: '80px 16px 100px' }}>
        <div className="container-default" style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#ffba06', marginBottom: 16 }}>
            The TDI Learning Hub
          </p>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700, color: 'white', margin: '0 0 20px 0', lineHeight: 1.15 }}>
            The Learning Hub That Proves PD Worked
          </h1>
          <p style={{ fontSize: 18, color: 'white', opacity: 0.85, maxWidth: 720, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Educators learn. Students benefit. Admins get the data. Memberships from $5/month with bulk pricing for schools and districts.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/hub/membership" style={{ background: '#ffba06', color: '#1e2749', padding: '14px 28px', borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
              See Membership Plans
            </Link>
            <Link href="#features" style={{ background: 'transparent', color: 'white', padding: '14px 28px', borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}>
              See What's Inside
            </Link>
          </div>
        </div>
      </section>

      {/* DUAL VIEW: Teacher + Admin */}
      <section style={{ padding: '80px 16px', backgroundColor: '#f9fafb' }}>
        <div className="container-default" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1e2749', margin: '0 0 12px 0' }}>One Hub. Two Views.</h2>
            <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 600, margin: '0 auto' }}>
              Built for the people doing the work, and the people leading them.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 32 }}>
            <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '0.5px solid #E5E7EB' }}>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#2A9D8F', margin: '0 0 8px 0' }}>For Educators</p>
              <h3 style={{ fontSize: 22, fontWeight: 600, color: '#1e2749', margin: '0 0 12px 0' }}>Learn at your own pace</h3>
              <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: '0 0 20px 0' }}>
                Full courses, quick wins, an AI tutor, and a community that knows what your classroom actually looks like.
              </p>
              <div style={{ position: 'relative', width: '100%', borderRadius: 8, overflow: 'hidden', background: '#1e2749', aspectRatio: '16/10' }}>
                <Image src="/hub-welcome/hub-user-dashboard.png" alt="Learning Hub educator view" width={800} height={500} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '0.5px solid #E5E7EB' }}>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#2A9D8F', margin: '0 0 8px 0' }}>For Admins</p>
              <h3 style={{ fontSize: 22, fontWeight: 600, color: '#1e2749', margin: '0 0 12px 0' }}>See exactly what's working</h3>
              <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: '0 0 20px 0' }}>
                Implementation analytics, board-ready reports, and compliance documentation pulled from real classroom data.
              </p>
              <div style={{ position: 'relative', width: '100%', borderRadius: 8, overflow: 'hidden', background: '#1e2749', aspectRatio: '16/10' }}>
                <Image src="/hub-welcome/hub-admin-dashboard.png" alt="Admin analytics dashboard" width={800} height={500} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '80px 16px', backgroundColor: 'white' }}>
        <div className="container-default" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1e2749', margin: '0 0 12px 0' }}>What's Inside</h2>
            <p style={{ fontSize: 16, color: '#6B7280' }}>Everything educators need. Nothing they don't.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              { title: 'Full Course Library', desc: 'Deep-dive courses on classroom management, retention, transitions, and more — built by educators who teach.' },
              { title: 'Quick Wins', desc: 'Short, practical strategies sorted by topic, time, and grade level. For when you need something tomorrow.' },
              { title: 'Desi AI Tutor', desc: 'A built-in AI tutor that answers PD questions 24/7 — trained on TDI methodology.' },
              { title: 'Moment Mode', desc: 'A 3-minute reset space for the moments you need to pause. No log-in. No metrics. Just breathing room.' },
              { title: 'Community Conversation', desc: 'Tried it. Adapted it. Still trying. Real teacher feedback per lesson. No "did you finish" surveys.' },
              { title: 'PD Certificates', desc: 'Earn certificates as you complete courses. Track PD hours for licensure and evaluation.' },
            ].map((f, i) => (
              <div key={i} style={{ padding: 20, background: '#F9FAFB', borderRadius: 12, border: '0.5px solid #E5E7EB' }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e2749', margin: '0 0 8px 0' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPLEMENTATION STAT */}
      <section style={{ padding: '80px 16px', backgroundColor: '#E6F1FB' }}>
        <div className="container-default" style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#185FA5', marginBottom: 16 }}>
            Implementation That Sticks
          </p>
          <h2 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 700, color: '#1e2749', margin: '0 0 16px 0', lineHeight: 1.1 }}>
            75% of teachers implement a strategy within 10 days.
          </h2>
          <p style={{ fontSize: 18, color: '#1e2749', opacity: 0.75, maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            That's over 7x the industry average of just 10% implementation in 180 days. The Hub is one piece of our research-backed approach to educator learning that actually transfers to the classroom.
          </p>
        </div>
      </section>

      {/* BUILT WITH EDUCATORS - TeamStrip */}
      <section style={{ backgroundColor: '#F0FAF6', borderTop: '0.5px solid #D4EDE0', borderBottom: '0.5px solid #D4EDE0' }}>
        <div className="container-default">
          <TeamStrip
            members={[
              { type: 'team', name: 'Dr. Maya Johnson', imageSlug: 'maya-johnson' },
              { type: 'team', name: 'Dr. Jasmine Cole', imageSlug: 'jasmine-cole' },
              { type: 'creator', name: 'Dr. Stephanie Nardi', topic: 'Science' },
              { type: 'creator', name: 'Amy Storer', topic: 'Math' },
              { type: 'creator', name: 'Catherine Dorian', topic: 'Literacy' },
              { type: 'creator', name: 'Lindsay Hall', topic: 'Math' },
              { type: 'creator', name: 'Aitabé Fornés', topic: 'Leadership' },
              { type: 'creator', name: 'Erin Light', topic: 'Art & SEL' },
            ]}
            copy="Every course in the Hub is built by educators who've been in the classroom. Real strategies. Real results."
            linkText="Meet our creators"
            linkHref="/about#creators"
          />
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: '80px 16px', backgroundColor: '#f9fafb' }}>
        <div className="container-default" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1e2749', margin: '0 0 12px 0' }}>Membership Plans</h2>
            <p style={{ fontSize: 16, color: '#6B7280' }}>Choose the plan that fits your needs. Upgrade anytime.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>

            {/* Free */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '0.5px solid #E5E7EB' }}>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: '#1e2749', margin: '0 0 4px 0' }}>Free</h3>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#1e2749', margin: '0 0 16px 0' }}>$0</p>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px 0' }}>Access rotating free content each week.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', fontSize: 13, color: '#4B5563' }}>
                <li style={{ marginBottom: 8 }}>✓ Rotating free content weekly</li>
                <li style={{ marginBottom: 8 }}>✓ Save favorites for later</li>
                <li style={{ marginBottom: 8 }}>✓ Track your PD hours</li>
              </ul>
              <Link href="/hub/membership" style={{ display: 'block', textAlign: 'center', padding: '12px', background: '#F3F4F6', color: '#1e2749', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                Get Started
              </Link>
            </div>

            {/* Essentials */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '0.5px solid #E5E7EB' }}>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: '#1e2749', margin: '0 0 4px 0' }}>Essentials</h3>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#1e2749', margin: '0 0 0 0' }}>$5<span style={{ fontSize: 14, fontWeight: 400, color: '#6B7280' }}>/mo</span></p>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '8px 0 16px 0' }}>Download individual quick wins and resources.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', fontSize: 13, color: '#4B5563' }}>
                <li style={{ marginBottom: 8 }}>✓ Everything in Free</li>
                <li style={{ marginBottom: 8 }}>✓ All individual quick wins</li>
                <li style={{ marginBottom: 8 }}>✓ Download PDFs & templates</li>
                <li style={{ marginBottom: 8 }}>✓ Priority email support</li>
              </ul>
              <Link href="/hub/membership" style={{ display: 'block', textAlign: 'center', padding: '12px', background: '#1e2749', color: 'white', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                Choose Essentials
              </Link>
            </div>

            {/* Professional - MOST POPULAR */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '2px solid #2A9D8F', position: 'relative' }}>
              <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#2A9D8F', color: 'white', padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Most Popular</span>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: '#1e2749', margin: '0 0 4px 0' }}>Professional</h3>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#1e2749', margin: '0 0 0 0' }}>$10<span style={{ fontSize: 14, fontWeight: 400, color: '#6B7280' }}>/mo</span></p>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '8px 0 16px 0' }}>Comprehensive resource packs for your classroom.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', fontSize: 13, color: '#4B5563' }}>
                <li style={{ marginBottom: 8 }}>✓ Everything in Essentials</li>
                <li style={{ marginBottom: 8 }}>✓ Comprehensive resource packs</li>
                <li style={{ marginBottom: 8 }}>✓ Monthly new content drops</li>
                <li style={{ marginBottom: 8 }}>✓ Early access to new courses</li>
                <li style={{ marginBottom: 8 }}>✓ Community discussion access</li>
              </ul>
              <Link href="/hub/membership" style={{ display: 'block', textAlign: 'center', padding: '12px', background: '#2A9D8F', color: 'white', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                Choose Professional
              </Link>
            </div>

            {/* All-Access */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '0.5px solid #E5E7EB' }}>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: '#1e2749', margin: '0 0 4px 0' }}>All-Access</h3>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#1e2749', margin: '0 0 0 0' }}>$25<span style={{ fontSize: 14, fontWeight: 400, color: '#6B7280' }}>/mo</span></p>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '8px 0 16px 0' }}>Unlock everything, including the full course library.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', fontSize: 13, color: '#4B5563' }}>
                <li style={{ marginBottom: 8 }}>✓ Everything in Professional</li>
                <li style={{ marginBottom: 8 }}>✓ Full course library access</li>
                <li style={{ marginBottom: 8 }}>✓ Earn PD certificates</li>
                <li style={{ marginBottom: 8 }}>✓ Exclusive workshops</li>
                <li style={{ marginBottom: 8 }}>✓ Direct creator access</li>
                <li style={{ marginBottom: 8 }}>✓ 1-on-1 coaching sessions</li>
              </ul>
              <Link href="/hub/membership" style={{ display: 'block', textAlign: 'center', padding: '12px', background: '#1e2749', color: 'white', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                Choose All-Access
              </Link>
            </div>

          </div>

          <p style={{ textAlign: 'center', marginTop: 32, fontSize: 13, color: '#6B7280' }}>
            Bulk pricing available for schools and districts. <Link href="/for-schools" style={{ color: '#2A9D8F', fontWeight: 500 }}>See partnership options →</Link>
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '80px 16px', backgroundColor: '#1e2749' }}>
        <div className="container-default" style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: 'white', margin: '0 0 16px 0' }}>Ready to give your team PD that sticks?</h2>
          <p style={{ fontSize: 16, color: 'white', opacity: 0.85, margin: '0 0 32px 0' }}>
            Start free. Upgrade anytime. Join 100,000+ educators already making it work.
          </p>
          <Link href="/hub/membership" style={{ display: 'inline-block', background: '#ffba06', color: '#1e2749', padding: '16px 32px', borderRadius: 8, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
            See Membership Plans
          </Link>
        </div>
      </section>

    </main>
  )
}
