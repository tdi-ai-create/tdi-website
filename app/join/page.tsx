'use client';

import Link from 'next/link';
import Image from 'next/image';
import CertifiedStatesMap from '@/components/learning/CertifiedStatesMap';
import { CoursesSection } from '@/components/CoursesSection';
import { CompactBurnout } from '@/components/calculators/v2/compact/CompactBurnout';

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

      {/* Moment Mode */}
      <section style={{ padding: '56px 16px', backgroundColor: '#1e2749', color: '#ffffff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#ffba06', marginBottom: 12 }}>
              FOR THE HARD DAYS
            </p>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: '#ffffff', margin: '0 0 16px 0', lineHeight: 1.2 }}>
              Moment Mode
            </h2>
            <p style={{ fontSize: 17, color: '#cbd5e1', maxWidth: 700, margin: '0 auto', lineHeight: 1.5 }}>
              For the moment you need it most. One quick strategy. One small win. Sometimes that's all you have time for, and that's enough.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, maxWidth: 900, margin: '0 auto' }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', padding: 24, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#ffba06', margin: '0 0 8px 0' }}>5 min</p>
              <p style={{ fontSize: 15, color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>Watch one quick strategy between classes</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', padding: 24, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#ffba06', margin: '0 0 8px 0' }}>1 take</p>
              <p style={{ fontSize: 15, color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>Try it tomorrow morning, see if it lands</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', padding: 24, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#ffba06', margin: '0 0 8px 0' }}>0 prep</p>
              <p style={{ fontSize: 15, color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>Strategies you can use without rewriting your plan</p>
            </div>
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

      {/* Free Ways to Get Started */}
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
              href="https://tdi.thinkific.com/collections/downloads"
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
        </div>
      </section>

      {/* For Teachers & Paraprofessionals */}
      <section style={{ padding: '56px 16px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#2A9D8F', marginBottom: 12 }}>
              FOR TEACHERS AND PARAPROFESSIONALS
            </p>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: '#1e2749', margin: '0 0 16px 0', lineHeight: 1.2 }}>
              PD that respects your time and actually helps
            </h2>
            <p style={{ fontSize: 17, color: '#6B7280', maxWidth: 700, margin: '0 auto', lineHeight: 1.5 }}>
              When you are ready to go deeper, here is where to go next.
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
              href="https://tdi.thinkific.com"
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

      <CoursesSection />

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
                  "I finally feel like I have strategies that work AND time to breathe. TDI changed how I approach my classroom and myself."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: '#ffba06', color: '#1e2749' }}>
                    SK
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Sarah K.</p>
                    <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>5th Grade Teacher</p>
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

      {/* Budget CTA */}
      <section className="section" style={{ backgroundColor: '#80a4ed' }}>
        <div className="container-default text-center">
          <h2 className="mb-4" style={{ color: '#ffffff' }}>Think You Don't Have Budget?</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.9 }}>
            80% of schools we work with secure external funds to cover PD. We help you find the funding and draft the language.
          </p>
          <Link
            href="/funding"
            className="inline-block px-8 py-4 rounded-lg font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: '#1e2749', color: '#ffffff' }}
          >
            See How Funding Works
          </Link>
        </div>
      </section>
    </main>
  );
}
