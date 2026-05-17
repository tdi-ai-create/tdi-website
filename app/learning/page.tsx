'use client'

import Link from 'next/link'
import Image from 'next/image'
import TeamStrip from '@/components/TeamStrip'

export default function HubWelcomePage() {
  return (
    <main style={{ backgroundColor: '#ffffff' }}>

      {/* 1. HERO */}
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
            <Link href="/learning/plans" style={{ background: '#ffba06', color: '#1e2749', padding: '14px 28px', borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
              See Membership Plans
            </Link>
            <Link href="#features" style={{ background: 'transparent', color: 'white', padding: '14px 28px', borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}>
              See What's Inside
            </Link>
          </div>
        </div>
      </section>

      {/* 2. WHAT EDUCATORS SEE */}
      <section id="features" style={{ padding: '80px 16px', backgroundColor: 'white' }}>
        <div className="container-default" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#2A9D8F', marginBottom: 12 }}>
              What Educators See
            </p>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1e2749', margin: '0 0 12px 0' }}>Built for the hour they don't have</h2>
            <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 700, margin: '0 auto' }}>
              Quick Wins sorted by topic, time, and effort level. Full courses for deep dives. An AI tutor on standby. And real teacher feedback on every lesson.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 32, alignItems: 'start' }}>
            <div>
              <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
                <Image src="/hub-welcome/hub-user-dashboard.png" alt="Personalized educator dashboard" width={800} height={600} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e2749', margin: '0 0 8px 0' }}>Your Hub, your way</h3>
              <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
                A personalized dashboard that meets you where you are. Continue where you left off, track your growth, find what fits your moment — from a 3-minute win to a full course.
              </p>
            </div>

            <div>
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ padding: 20, background: '#F9FAFB', borderRadius: 12, border: '0.5px solid #E5E7EB' }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600, color: '#1e2749', margin: '0 0 6px 0' }}>Desi, your AI tutor</h4>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
                    24/7 conversational support trained on TDI methodology. Ask a question, get a real answer rooted in your context.
                  </p>
                </div>
                <div style={{ padding: 20, background: '#F9FAFB', borderRadius: 12, border: '0.5px solid #E5E7EB' }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600, color: '#1e2749', margin: '0 0 6px 0' }}>Transformation Tracker</h4>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
                    Watch your own growth. Complete a course, check in, and see how far you've come — not just what's left to do.
                  </p>
                </div>
                <div style={{ padding: 20, background: '#F9FAFB', borderRadius: 12, border: '0.5px solid #E5E7EB' }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600, color: '#1e2749', margin: '0 0 6px 0' }}>What Teachers Are Saying</h4>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
                    Real feedback from real classrooms. Every course shows what worked, what to adapt, and what got stuck.
                  </p>
                </div>
                <div style={{ padding: 20, background: '#F9FAFB', borderRadius: 12, border: '0.5px solid #E5E7EB' }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600, color: '#1e2749', margin: '0 0 6px 0' }}>PD Certificates</h4>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
                    Earn certificates as you complete courses. Track PD hours for licensure and evaluation.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link href="/learning/plans" style={{ display: 'inline-block', background: '#ffba06', color: '#1e2749', padding: '14px 32px', borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
              Join the Hub
            </Link>
          </div>
        </div>
      </section>

      {/* 2.5 TESTIMONIALS */}
      <section style={{ padding: '80px 16px', backgroundColor: '#1e2749' }}>
        <div className="container-default" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#ffba06', marginBottom: 12 }}>
              What Educators Are Saying
            </p>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: 'white', margin: 0 }}>
              Real teachers. Real classrooms. Real results.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>

            <div style={{ padding: 28, background: 'rgba(255,255,255,0.05)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: 16, color: 'white', lineHeight: 1.6, margin: '0 0 20px 0', fontStyle: 'italic' }}>
                "I finally feel like I have strategies that work AND time to breathe. TDI changed how I approach my classroom and myself."
              </p>
              <p style={{ fontSize: 13, color: '#ffba06', margin: 0, fontWeight: 500 }}>Sarah K.</p>
              <p style={{ fontSize: 12, color: 'white', opacity: 0.7, margin: 0 }}>5th Grade Teacher</p>
            </div>

            <div style={{ padding: 28, background: 'rgba(255,255,255,0.05)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: 16, color: 'white', lineHeight: 1.6, margin: '0 0 20px 0', fontStyle: 'italic' }}>
                "Our teachers are actually excited about PD now. I don't have to chase them down or babysit. They're learning because they want to."
              </p>
              <p style={{ fontSize: 13, color: '#ffba06', margin: 0, fontWeight: 500 }}>Michelle M.</p>
              <p style={{ fontSize: 12, color: 'white', opacity: 0.7, margin: 0 }}>K-8 School Director</p>
            </div>

            <div style={{ padding: 28, background: 'rgba(255,255,255,0.05)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: 16, color: 'white', lineHeight: 1.6, margin: '0 0 20px 0', fontStyle: 'italic' }}>
                "This was the first PD I didn\'t have to apologize for. Our teachers actually thanked me."
              </p>
              <p style={{ fontSize: 13, color: '#ffba06', margin: 0, fontWeight: 500 }}>James T.</p>
              <p style={{ fontSize: 12, color: 'white', opacity: 0.7, margin: 0 }}>School Principal</p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. COMMUNITY CHECK-INS */}
      <section style={{ padding: '80px 16px', backgroundColor: '#0F6E56' }}>
        <div className="container-default" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#ffba06', marginBottom: 12 }}>
              Community Built. Community Driven. Community First.
            </p>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: 'white', margin: '0 0 12px 0' }}>How we listen to teachers — without making it feel like a survey.</h2>
            <p style={{ fontSize: 16, color: 'white', opacity: 0.85, maxWidth: 720, margin: '0 auto' }}>
              The Hub collects signal across five dimensions of educator wellbeing. Color scales, two-choice prompts, word clouds, and fill-in-the-blanks. No long forms. No survey burnout. Just honest data on how teachers are really doing.
            </p>
          </div>

          <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto 32px', borderRadius: 12, overflow: 'hidden' }}>
            <Image src="/hub-welcome/hub-checkin-categories.png" alt="Learning Hub Check-In Categories" width={1200} height={750} style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, maxWidth: 1000, margin: '0 auto' }}>
            {[
              { num: '1', label: 'Mood / Stress', signal: 'mood trend alerts' },
              { num: '2', label: 'Energy', signal: 'capacity signal' },
              { num: '3', label: 'Belonging', signal: 'retention intent signal' },
              { num: '4', label: 'Purpose', signal: 'connection-to-why signal' },
              { num: '5', label: 'Needs', signal: 'content + support routing' },
            ].map((cat, i) => (
              <div key={i} style={{ padding: 16, background: 'rgba(255,255,255,0.95)', borderRadius: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#0F6E56', margin: '0 0 4px 0' }}>0{cat.num}</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1e2749', margin: '0 0 4px 0' }}>{cat.label}</p>
                <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>feeds {cat.signal}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. IMPLEMENTATION STAT */}
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
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link href="/learning/plans" style={{ display: 'inline-block', background: '#ffba06', color: '#1e2749', padding: '14px 32px', borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
              Join the Hub
            </Link>
          </div>
        </div>
      </section>

      {/* 5. BUILT WITH EDUCATORS - TeamStrip */}
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

      {/* 6. ONE HUB. TWO VIEWS. */}
      <section style={{ padding: '80px 16px', backgroundColor: '#E6F1FB' }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#1e2749' }}>
                  <span style={{ width: 24, height: 24, borderRadius: 6, background: '#E1F5EE', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#0F6E56', fontWeight: 600, fontSize: 12 }}>✓</span>
                  Full course library + Quick Wins
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#1e2749' }}>
                  <span style={{ width: 24, height: 24, borderRadius: 6, background: '#E1F5EE', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#0F6E56', fontWeight: 600, fontSize: 12 }}>✓</span>
                  Desi AI tutor on call
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#1e2749' }}>
                  <span style={{ width: 24, height: 24, borderRadius: 6, background: '#E1F5EE', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#0F6E56', fontWeight: 600, fontSize: 12 }}>✓</span>
                  Moment Mode for wellness
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#1e2749' }}>
                  <span style={{ width: 24, height: 24, borderRadius: 6, background: '#E1F5EE', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#0F6E56', fontWeight: 600, fontSize: 12 }}>✓</span>
                  PD certificates + transformation tracker
                </div>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '0.5px solid #E5E7EB' }}>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#2A9D8F', margin: '0 0 8px 0' }}>For Admins</p>
              <h3 style={{ fontSize: 22, fontWeight: 600, color: '#1e2749', margin: '0 0 12px 0' }}>See exactly what's working</h3>
              <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: '0 0 20px 0' }}>
                Implementation analytics, board-ready reports, and compliance documentation pulled from real classroom data.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#1e2749' }}>
                  <span style={{ width: 24, height: 24, borderRadius: 6, background: '#E6F1FB', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#185FA5', fontWeight: 600, fontSize: 12 }}>✓</span>
                  Real-time implementation tracking
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#1e2749' }}>
                  <span style={{ width: 24, height: 24, borderRadius: 6, background: '#E6F1FB', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#185FA5', fontWeight: 600, fontSize: 12 }}>✓</span>
                  Board-ready progress reports
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#1e2749' }}>
                  <span style={{ width: 24, height: 24, borderRadius: 6, background: '#E6F1FB', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#185FA5', fontWeight: 600, fontSize: 12 }}>✓</span>
                  Building-level dashboards
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#1e2749' }}>
                  <span style={{ width: 24, height: 24, borderRadius: 6, background: '#E6F1FB', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#185FA5', fontWeight: 600, fontSize: 12 }}>✓</span>
                  Compliance + evaluation evidence
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. IN-LESSON COMMUNITY (Not a quiz) */}
      <section style={{ padding: '80px 16px', backgroundColor: 'white' }}>
        <div className="container-default" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#2A9D8F', marginBottom: 12 }}>
              Every Lesson, A Conversation
            </p>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1e2749', margin: '0 0 12px 0' }}>Not a quiz. A community.</h2>
            <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 700, margin: '0 auto' }}>
              Every lesson opens up a conversation thread. Educators share what they tried, what they adapted, and what got stuck — so the next teacher learns from the last.
            </p>
          </div>

          <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto 32px', borderRadius: 12, overflow: 'hidden' }}>
            <Image src="/hub-welcome/hub-conversation.png" alt="Community conversation per lesson" width={1200} height={675} style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, maxWidth: 900, margin: '0 auto' }}>
            {[
              { label: 'Tried it', color: '#0F6E56', bg: '#E1F5EE' },
              { label: 'Adapted it', color: '#854F0B', bg: '#FAEEDA' },
              { label: 'Still trying', color: '#185FA5', bg: '#E6F1FB' },
              { label: 'Got stuck', color: '#993C1D', bg: '#FAECE7' },
              { label: 'Didn\'t land', color: '#6B7280', bg: '#F1F3F5' },
            ].map((tag, i) => (
              <div key={i} style={{ padding: '12px 8px', borderRadius: 8, background: tag.bg, textAlign: 'center' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: tag.color, margin: 0 }}>{tag.label}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', margin: '16px 0 0 0' }}>
            Five honest contribution types replace star ratings. Real teachers. Real stories. No survey fatigue.
          </p>
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link href="/learning/plans" style={{ display: 'inline-block', background: '#ffba06', color: '#1e2749', padding: '14px 32px', borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
              Join the Hub
            </Link>
          </div>
        </div>
      </section>

      {/* 8. MOMENT MODE */}
      <section style={{ padding: '80px 16px', backgroundColor: '#1e2749' }}>
        <div className="container-default" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 48, alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#ffba06', marginBottom: 16 }}>
                Moment Mode
              </p>
              <h2 style={{ fontSize: 36, fontWeight: 700, color: 'white', margin: '0 0 20px 0', lineHeight: 1.15 }}>
                A sacred space built for the moments you need to pause.
              </h2>
              <p style={{ fontSize: 16, color: 'white', opacity: 0.85, lineHeight: 1.7, margin: '0 0 16px 0' }}>
                Research shows just 3 minutes of intentional pause can lower cortisol and reset your nervous system. So we built one into the Hub.
              </p>
              <p style={{ fontSize: 16, color: 'white', opacity: 0.85, lineHeight: 1.7, margin: '0 0 24px 0' }}>
                No one is tracking this. No one is watching. Just breathing exercises, affirmations, gentle tools, and journaling — for when you need them.
              </p>
              <p style={{ fontSize: 15, color: '#ffba06', fontStyle: 'italic', margin: 0 }}>
                You deserve to pause without guilt.
              </p>
            </div>
            <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden' }}>
              <Image src="/hub-welcome/hub-moment-mode.png" alt="Moment Mode pause space" width={800} height={600} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          </div>
        </div>
      </section>

      {/* 9. IMPLEMENTATION & COMPLIANCE ANALYTICS (text-only) */}
      <section style={{ padding: '80px 16px', backgroundColor: 'white' }}>
        <div className="container-default" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ display: 'inline-block', padding: '6px 14px', background: '#1e2749', color: 'white', borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
              ◆ Included With Every Service
            </span>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1e2749', margin: '0 0 12px 0' }}>Implementation & Compliance Analytics</h2>
            <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 720, margin: '0 auto' }}>
              All data collected from memberships linked to your account flows into your dashboard. Popular topics, survey responses, evidence submitted — board-ready, audit-ready, and built for the people who need to prove it worked.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 48 }}>
            {[
              'Board presentation-ready progress reports',
              'Grant applications & funding renewal evidence',
              'State accountability & compliance documentation',
              'Accreditation review preparation',
              'Teacher & administrator evaluation evidence',
              'ROI documentation for district leadership',
              'Classroom implementation rate tracking',
              'Professional development hours & licensure records',
              'Principal & leadership evaluation support',
              'Continuous improvement documentation year over year',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', background: '#F9FAFB', borderRadius: 8 }}>
                <span style={{ color: '#185FA5', fontSize: 16, fontWeight: 700, flexShrink: 0, marginTop: -2 }}>✓</span>
                <p style={{ fontSize: 13, color: '#1e2749', margin: 0, lineHeight: 1.5 }}>{item}</p>
              </div>
            ))}
          </div>

          <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto 32px', borderRadius: 12, overflow: 'hidden', border: '0.5px solid #E5E7EB' }}>
            <Image src="/hub-welcome/hub-admin-dashboard.png" alt="District-level admin analytics dashboard" width={1200} height={750} style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>

          <div style={{ background: '#F9FAFB', borderRadius: 12, padding: 32, textAlign: 'center', border: '0.5px solid #E5E7EB', maxWidth: 900, margin: '0 auto' }}>
            <p style={{ fontSize: 15, color: '#1e2749', lineHeight: 1.7, margin: 0 }}>
              Building-level dashboards, per-school drill-downs, observation timelines, leading indicators, and Love Note highlights are included with every TDI partnership. <Link href="/for-schools" style={{ color: '#2A9D8F', fontWeight: 500 }}>Explore partnership options →</Link>
            </p>
          </div>
        </div>
      </section>

      {/* 10. PRICING */}
      <section style={{ padding: '80px 16px', backgroundColor: '#f9fafb' }}>
        <div className="container-default" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1e2749', margin: '0 0 12px 0' }}>Membership Plans</h2>
            <p style={{ fontSize: 16, color: '#6B7280' }}>Choose the plan that fits your needs. Upgrade anytime.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>

            <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '0.5px solid #E5E7EB' }}>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: '#1e2749', margin: '0 0 4px 0' }}>Free</h3>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#1e2749', margin: '0 0 16px 0' }}>$0</p>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px 0' }}>Access rotating free content each week.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', fontSize: 13, color: '#4B5563' }}>
                <li style={{ marginBottom: 8 }}>✓ Rotating free content weekly</li>
                <li style={{ marginBottom: 8 }}>✓ Save favorites for later</li>
                <li style={{ marginBottom: 8 }}>✓ Track your PD hours</li>
              </ul>
              <Link href="/learning/plans" style={{ display: 'block', textAlign: 'center', padding: '12px', background: '#F3F4F6', color: '#1e2749', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                Get Started
              </Link>
            </div>

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
              <Link href="/learning/plans" style={{ display: 'block', textAlign: 'center', padding: '12px', background: '#1e2749', color: 'white', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                Choose Essentials
              </Link>
            </div>

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
              <Link href="/learning/plans" style={{ display: 'block', textAlign: 'center', padding: '12px', background: '#2A9D8F', color: 'white', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                Choose Professional
              </Link>
            </div>

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
              <Link href="/learning/plans" style={{ display: 'block', textAlign: 'center', padding: '12px', background: '#1e2749', color: 'white', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                Choose All-Access
              </Link>
            </div>

          </div>

          <p style={{ textAlign: 'center', marginTop: 32, fontSize: 13, color: '#6B7280' }}>
            Bulk pricing available for schools and districts. <Link href="/for-schools" style={{ color: '#2A9D8F', fontWeight: 500 }}>See partnership options →</Link>
          </p>
        </div>
      </section>

      {/* 11. FINAL CTA */}
      <section style={{ padding: '80px 16px', backgroundColor: '#1e2749' }}>
        <div className="container-default" style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: 'white', margin: '0 0 16px 0' }}>Ready to give your team PD that sticks?</h2>
          <p style={{ fontSize: 16, color: 'white', opacity: 0.85, margin: '0 0 32px 0' }}>
            Start free. Upgrade anytime. Join 100,000+ educators already making it work.
          </p>
          <Link href="/learning/plans" style={{ display: 'inline-block', background: '#ffba06', color: '#1e2749', padding: '16px 32px', borderRadius: 8, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
            See Membership Plans
          </Link>
        </div>
      </section>

    </main>
  )
}
