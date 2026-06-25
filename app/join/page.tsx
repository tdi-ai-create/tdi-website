'use client';

import Link from 'next/link';
import Image from 'next/image';
import CertifiedStatesMap from '@/components/learning/CertifiedStatesMap';
import { CompactBurnout } from '@/components/calculators/v2/compact/CompactBurnout';
import TeamStrip from '@/components/TeamStrip';

export default function JoinPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section with Parallax */}
      <section className="relative h-[320px] md:h-[360px] overflow-hidden">
        {/* Parallax Background Image */}
        <div
          className="absolute inset-0 parallax-bg"
          style={{
            backgroundImage: "url('/images/hero-join.webp')",
            backgroundSize: 'cover',
            backgroundPosition: '30% center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          }}
        />

        {/* Navy Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(30, 39, 73, 0.5) 0%, rgba(30, 39, 73, 0.6) 100%)'
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center px-4 max-w-3xl mx-auto">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              style={{ color: '#ffffff' }}
            >
              Join the Movement
            </h1>
            <p
              className="text-lg md:text-xl"
              style={{ color: '#ffffff', opacity: 0.9 }}
            >
              Find your path. Whether you're a teacher looking for support or<br />a leader building a healthier school, we're here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Certified in All 50 States */}
      <section style={{ padding: '56px 16px', backgroundColor: '#E6F1FB' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#2A9D8F', marginBottom: 12 }}>
              YES, THIS COUNTS IN YOUR STATE
            </p>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: '#1e2749', margin: '0 0 16px 0', lineHeight: 1.2 }}>
              Approved PD in all 50 states
            </h2>
            <p style={{ fontSize: 17, color: '#6B7280', maxWidth: 640, margin: '0 auto', lineHeight: 1.5 }}>
              Every hour you spend with TDI counts toward your PD recertification. Hover any state to confirm. Click for your state Department of Education link.
            </p>
          </div>
          <CertifiedStatesMap />
        </div>
      </section>

      {/* Not a quiz, A community */}
      <section style={{ padding: '56px 16px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#2A9D8F', marginBottom: 12 }}>
              REAL CONVERSATIONS
            </p>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: '#1e2749', margin: '0 0 16px 0', lineHeight: 1.2 }}>
              Not a quiz. A community.
            </h2>
            <p style={{ fontSize: 17, color: '#6B7280', maxWidth: 700, margin: '0 auto', lineHeight: 1.5 }}>
              Every lesson opens up a conversation thread. Educators share what they tried, what they adapted, and what got stuck, so the next teacher learns from the last.
            </p>
          </div>
          <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 32px rgba(30,39,73,0.08)' }}>
            <Image
              src="/hub-welcome/hub-conversation.png"
              alt="Community conversation per lesson"
              width={1200}
              height={675}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        </div>
      </section>

      {/* Implementation Stat */}
      <section style={{ padding: '56px 16px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#2A9D8F', marginBottom: 16 }}>
            REAL CLASSROOM IMPACT
          </p>
          <p style={{ fontSize: 72, fontWeight: 800, color: '#1e2749', margin: '0 0 8px 0', lineHeight: 1 }}>
            74%
          </p>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e2749', margin: '0 0 16px 0', lineHeight: 1.2 }}>
            Classroom application rate within 30 days
          </h2>
          <p style={{ fontSize: 17, color: '#6B7280', maxWidth: 640, margin: '0 auto', lineHeight: 1.5 }}>
            Most PD ends when the slide deck closes. TDI's average educator applies what they learned in their classroom within the first 30 days, because the strategies are built for the hour you don't have.
          </p>
        </div>
      </section>

      {/* What's Inside the Hub */}
      <section style={{ padding: '56px 16px', backgroundColor: '#f8f9fa' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#2B8C96', marginBottom: 12 }}>
              THE LEARNING HUB
            </p>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: '#1e2749', margin: '0 0 16px 0', lineHeight: 1.2 }}>
              What is actually inside
            </h2>
            <p style={{ fontSize: 17, color: '#6B7280', maxWidth: 700, margin: '0 auto', lineHeight: 1.5 }}>
              Not a video library. Not a course catalog. A place built for how educators actually learn -- in short bursts, between classes, when they need it most.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, maxWidth: 1000, margin: '0 auto' }}>
            {/* Vibe Checks */}
            <div style={{ padding: 28, background: '#ffffff', borderRadius: 12, borderLeft: '4px solid #2B8C96' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#E6F7F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2B8C96" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e2749', margin: 0 }}>Vibe Checks</h3>
              </div>
              <p style={{ fontSize: 15, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                Quick wellness check-ins that track how you are actually doing -- stress, energy, workload. Your data stays private. Over time, you see patterns and get personalized suggestions.
              </p>
            </div>

            {/* Quick Wins */}
            <div style={{ padding: 28, background: '#ffffff', borderRadius: 12, borderLeft: '4px solid #ffba06' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#FEF9E7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4A006" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e2749', margin: 0 }}>Quick Wins</h3>
              </div>
              <p style={{ fontSize: 15, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                Downloadable PDFs you can use the same day. Classroom strategies, planning templates, conversation starters -- no prep required. Many are free.
              </p>
            </div>

            {/* Courses */}
            <div style={{ padding: 28, background: '#ffffff', borderRadius: 12, borderLeft: '4px solid #80a4ed' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#EBF0FC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A7BD4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e2749', margin: 0 }}>Short Courses</h3>
              </div>
              <p style={{ fontSize: 15, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                Focused courses built for educators -- teachers, paras, coaches, and leaders. Each one is designed to finish in real time, not aspirational time.
              </p>
            </div>

            {/* Community */}
            <div style={{ padding: 28, background: '#ffffff', borderRadius: 12, borderLeft: '4px solid #38618C' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#E8EEF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38618C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e2749', margin: 0 }}>Community Conversations</h3>
              </div>
              <p style={{ fontSize: 15, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                Every lesson has a thread. Educators share what they tried, what worked, and what they adapted. You learn from the teacher who used it yesterday.
              </p>
            </div>

            {/* Goal Setting */}
            <div style={{ padding: 28, background: '#ffffff', borderRadius: 12, borderLeft: '4px solid #E8713A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#FDF2EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8713A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e2749', margin: 0 }}>Personal Goals</h3>
              </div>
              <p style={{ fontSize: 15, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                Set your own professional goals and track progress with quarterly check-ins. Your growth plan, on your terms.
              </p>
            </div>

            {/* Certificates */}
            <div style={{ padding: 28, background: '#ffffff', borderRadius: 12, borderLeft: '4px solid #7C3AED' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#F3EEFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e2749', margin: 0 }}>PD Certificates</h3>
              </div>
              <p style={{ fontSize: 15, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                Earn certificates for every course you complete. Approved for PD credit in all 50 states. Download and submit to your district.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <p style={{ fontSize: 15, color: '#1e2749', fontWeight: 600, marginBottom: 16 }}>
              Free accounts get access to quick wins, vibe checks, community threads, and select courses.
            </p>
            <a
              href="https://www.teachersdeserveit.com/hub"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-block', padding: '14px 32px', borderRadius: 8, fontWeight: 700, fontSize: 16, backgroundColor: '#2B8C96', color: '#ffffff', textDecoration: 'none', transition: 'opacity 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              Create a Free Account
            </a>
          </div>
        </div>
      </section>

      {/* Free Ways to Get Started + Go Deeper */}
      <section style={{ padding: '56px 16px', backgroundColor: '#E6F1FB' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#2A9D8F', marginBottom: 12 }}>
              NO COMMITMENT, JUST VALUE
            </p>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: '#1e2749', margin: '0 0 16px 0', lineHeight: 1.2 }}>
              Free ways to get started
            </h2>
            <p style={{ fontSize: 17, color: '#6B7280', maxWidth: 700, margin: '0 auto', lineHeight: 1.5 }}>
              Three ways to start using TDI today. Pick whichever fits the hour you have.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, maxWidth: 1000, margin: '0 auto' }}>
            <a
              href="https://raehughart.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', padding: 28, background: '#ffffff', borderRadius: 12, borderTop: '3px solid #ffba06', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(30,39,73,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: '#2A9D8F', margin: '0 0 12px 0' }}>
                Weekly strategies
              </p>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: '#1e2749', margin: '0 0 12px 0', lineHeight: 1.25 }}>
                Three ideas a week, straight to your inbox
              </h3>
              <p style={{ fontSize: 15, color: '#6B7280', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                Practical ideas you can use immediately. Join 100,000+ educators already getting them.
              </p>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#1e2749' }}>
                Read the latest →
              </span>
            </a>

            <a
              href="https://podcasts.apple.com/us/podcast/sustainable-teaching-with-rae-hughart/id1792030274"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', padding: 28, background: '#ffffff', borderRadius: 12, borderTop: '3px solid #ffba06', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(30,39,73,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: '#2A9D8F', margin: '0 0 12px 0' }}>
                Listen and learn
              </p>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: '#1e2749', margin: '0 0 12px 0', lineHeight: 1.25 }}>
                Sustainable Teaching, the podcast
              </h3>
              <p style={{ fontSize: 15, color: '#6B7280', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                Real talk about sustainable teaching from people who get it. New episodes every Friday.
              </p>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#1e2749' }}>
                Start listening →
              </span>
            </a>

            <a
              href="https://www.teachersdeserveit.com/hub"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', padding: 28, background: '#ffffff', borderRadius: 12, borderTop: '3px solid #ffba06', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(30,39,73,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: '#2A9D8F', margin: '0 0 12px 0' }}>
                Free downloads
              </p>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: '#1e2749', margin: '0 0 12px 0', lineHeight: 1.25 }}>
                Ready for Monday morning
              </h3>
              <p style={{ fontSize: 15, color: '#6B7280', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                Ready-to-use downloads for your classroom. Built for teachers and paras alike.
              </p>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#1e2749' }}>
                Browse downloads →
              </span>
            </a>
          </div>

          {/* Divider */}
          <div style={{ maxWidth: 1000, margin: '48px auto 40px', borderTop: '1px solid rgba(30, 39, 73, 0.15)' }} />

          {/* Go Deeper */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <p style={{ fontSize: 17, fontWeight: 600, color: '#1e2749', margin: '0 0 8px 0' }}>
              Ready to go deeper?
            </p>
            <p style={{ fontSize: 15, color: '#6B7280' }}>
              When you are ready for more, here is where to go next.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, maxWidth: 900, margin: '0 auto' }}>
            <a
              href="https://raehughart.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', padding: 32, background: '#ffffff', borderRadius: 12, border: '1px solid #E5E7EB', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(30,39,73,0.08)'; e.currentTarget.style.borderColor = '#ffba06'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
            >
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: '#ffba06', margin: '0 0 12px 0' }}>
                Exclusive content
              </p>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: '#1e2749', margin: '0 0 12px 0', lineHeight: 1.25 }}>
                Premium strategies and the inside view
              </h3>
              <p style={{ fontSize: 15, color: '#6B7280', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                Behind-the-scenes access and a community of educators who are done settling for the status quo.
              </p>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#1e2749' }}>
                See premium options →
              </span>
            </a>

            <a
              href="https://www.teachersdeserveit.com/hub"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', padding: 32, background: '#ffffff', borderRadius: 12, border: '1px solid #E5E7EB', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(30,39,73,0.08)'; e.currentTarget.style.borderColor = '#ffba06'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
            >
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: '#ffba06', margin: '0 0 12px 0' }}>
                Learning Hub all-access
              </p>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: '#1e2749', margin: '0 0 12px 0', lineHeight: 1.25 }}>
                100+ hours of on-demand PD
              </h3>
              <p style={{ fontSize: 15, color: '#6B7280', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                Bite-sized videos you can finish in one sitting. Strategies you will actually use Monday morning.
              </p>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#1e2749' }}>
                Explore the Learning Hub →
              </span>
            </a>
          </div>

          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <p style={{ fontSize: 16, color: '#6B7280', margin: '0 0 16px 0' }}>
              Love what you see? Think your whole school could benefit?
            </p>
            <a
              href="/for-schools/request"
              style={{ display: 'inline-block', padding: '12px 24px', borderRadius: 8, fontWeight: 600, fontSize: 15, border: '2px solid #1e2749', color: '#1e2749', textDecoration: 'none', transition: 'background-color 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1e2749'; e.currentTarget.style.color = '#ffffff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#1e2749'; }}
            >
              Request TDI for your school
            </a>
          </div>
        </div>
      </section>

      {/* For School Leaders */}
      <section style={{ padding: '56px 16px', backgroundColor: '#1e2749', color: '#ffffff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#ffba06', marginBottom: 12 }}>
              FOR SCHOOL LEADERS
            </p>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: '#ffffff', margin: '0 0 16px 0', lineHeight: 1.2 }}>
              Support your whole building
            </h2>
            <p style={{ fontSize: 17, color: '#cbd5e1', maxWidth: 700, margin: '0 auto', lineHeight: 1.5 }}>
              Teachers and paraprofessionals, with PD they will actually use. Pick the door that fits where you are.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, maxWidth: 1000, margin: '0 auto' }}>
            <a
              href="/get-started"
              style={{ display: 'block', padding: 28, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, textDecoration: 'none', transition: 'background-color 0.2s, border-color 0.2s, transform 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,186,6,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: '#ffba06', margin: '0 0 12px 0' }}>
                Work with the team
              </p>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: '#ffffff', margin: '0 0 12px 0', lineHeight: 1.25 }}>
                Whole-school PD, real implementation
              </h3>
              <p style={{ fontSize: 15, color: '#cbd5e1', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                Designed for the building, not just the binder. Start the conversation about what TDI looks like for your school.
              </p>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#ffba06' }}>
                Learn more →
              </span>
            </a>

            <a
              href="/contact"
              style={{ display: 'block', padding: 28, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, textDecoration: 'none', transition: 'background-color 0.2s, border-color 0.2s, transform 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,186,6,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: '#ffba06', margin: '0 0 12px 0' }}>
                Explore what is possible
              </p>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: '#ffffff', margin: '0 0 12px 0', lineHeight: 1.25 }}>
                See the partnership models
              </h3>
              <p style={{ fontSize: 15, color: '#cbd5e1', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                Ignite, Accelerate, Sustain. Three phases that meet your school where it is and grow from there.
              </p>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#ffba06' }}>
                Get in touch →
              </span>
            </a>

            <a
              href="/contact"
              style={{ display: 'block', padding: 28, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, textDecoration: 'none', transition: 'background-color 0.2s, border-color 0.2s, transform 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,186,6,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: '#ffba06', margin: '0 0 12px 0' }}>
                Schedule a chat
              </p>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: '#ffffff', margin: '0 0 12px 0', lineHeight: 1.25 }}>
                Have questions? Let us talk
              </h3>
              <p style={{ fontSize: 15, color: '#cbd5e1', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                Not sure where to start? Book a no-pressure conversation with the team and we will help you find the right path.
              </p>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#ffba06' }}>
                Contact us →
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-center mb-8" style={{ color: '#1e2749' }}>
              What Teachers Are Saying
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Testimonial 1 */}
              <div className="p-6 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
                <p className="text-sm mb-4" style={{ color: '#1e2749' }}>
                  "I showed the vibe check data to my principal and she finally understood why our team was struggling. It gave us a shared language for what was happening."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: '#ffba06', color: '#1e2749' }}>
                    AN
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Angela N.</p>
                    <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>3rd Grade Teacher</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="p-6 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
                <p className="text-sm mb-4" style={{ color: '#1e2749' }}>
                  "I used to spend my entire Sunday planning. Now I batch everything in 2 hours. TDI gave me my weekends back."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: '#ffba06', color: '#1e2749' }}>
                    MR
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Marcus R.</p>
                    <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>High School Math Teacher</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="p-6 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
                <p className="text-sm mb-4" style={{ color: '#1e2749' }}>
                  "TDI didn't just drop a slide deck and bounce. Every part of the experience felt personal. Our staff felt understood, and I finally felt like I wasn't on an island trying to figure this out alone."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: '#ffba06', color: '#1e2749' }}>
                    JH
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Julie H.</p>
                    <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>K-8 Principal</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 4 */}
              <div className="p-6 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
                <p className="text-sm mb-4" style={{ color: '#1e2749' }}>
                  "As a para, I never had PD that was actually for me. TDI was the first time someone built something for my role instead of handing me a watered-down version of what teachers got."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: '#ffba06', color: '#1e2749' }}>
                    DM
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Diana M.</p>
                    <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Paraprofessional</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 5 */}
              <div className="p-6 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
                <p className="text-sm mb-4" style={{ color: '#1e2749' }}>
                  "The quick wins alone were worth it. I downloaded one resource during lunch and used it in my next class. That never happens with PD."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: '#ffba06', color: '#1e2749' }}>
                    TW
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Terrence W.</p>
                    <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Middle School ELA Teacher</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 6 */}
              <div className="p-6 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
                <p className="text-sm mb-4" style={{ color: '#1e2749' }}>
                  "We rolled TDI out to 42 teachers and our instructional coaches. The dashboard gave me data I could actually bring to our board without spending a weekend building a report."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: '#ffba06', color: '#1e2749' }}>
                    RL
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Rachel L.</p>
                    <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>District Curriculum Director</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stress Check Section */}
      <section className="py-16 md:py-20 px-6" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
            What Could Change for You?
          </h2>
          <p className="text-center mb-10 max-w-2xl mx-auto text-lg" style={{ color: '#4b5563' }}>
            See the potential impact on your stress, time, and joy in teaching.
          </p>
          <CompactBurnout />
        </div>
      </section>

      {/* Team Strip */}
      <section style={{ backgroundColor: '#F0FAF6', borderTop: '0.5px solid #D4EDE0', borderBottom: '0.5px solid #D4EDE0' }}>
        <div className="container-default">
          <TeamStrip
            members={[
              { type: 'team', name: 'Holly Scott', imageSlug: 'holly-scott' },
              { type: 'team', name: 'Kristin Williams', imageSlug: 'kristin-williams', isHuman: true },
              { type: 'team', name: 'Dr. Maya Johnson', imageSlug: 'maya-johnson' },
              { type: 'team', name: 'Bella Dailey', imageSlug: 'bella-dailey', isHuman: true },
              { type: 'team', name: 'Mel Martinez', imageSlug: 'mel-martinez', isHuman: true },
              { type: 'creator', name: 'Dr. Stephanie Nardi', topic: 'Science' },
              { type: 'creator', name: 'Catherine Dorian', topic: 'Literacy' },
            ]}
            copy="Built by a team of educators, coaches, and specialists who know what it takes to support teachers and paras every day."
          />
        </div>
      </section>

      {/* Want TDI for Your School? */}
      <section className="section" style={{ backgroundColor: '#80a4ed' }}>
        <div className="container-default text-center">
          <h2 className="mb-4" style={{ color: '#ffffff' }}>Want TDI for Your Whole Building?</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.9 }}>
            Love what you see? Share it with your admin. 80% of partner schools secure external funding, and we help with the paperwork.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/for-schools"
              className="inline-block px-8 py-4 rounded-lg font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: '#1e2749', color: '#ffffff' }}
            >
              Share With Your Admin
            </Link>
            <Link
              href="/get-started"
              className="inline-block px-8 py-4 rounded-lg font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: '#ffffff', color: '#1e2749' }}
            >
              Request TDI for Your School
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
