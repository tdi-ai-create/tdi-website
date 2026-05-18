'use client';

import Link from 'next/link';
import Image from 'next/image';
import TeamStrip from '@/components/TeamStrip';
import CertifiedStatesMap from '@/components/learning/CertifiedStatesMap';
import { CoursesSection } from '@/components/CoursesSection';
import { TabbedCalculator } from '@/components/calculators';

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

{/* 7. IN-LESSON COMMUNITY (Not a quiz) */}
 <section style={{ padding: '56px 16px', backgroundColor: 'white' }}>
 <div className="container-default" style={{ maxWidth: 1200, margin: '0 auto' }}>
 <div style={{ textAlign: 'center', marginBottom: 48 }}>
 <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#2A9D8F', marginBottom: 12 }}>
 Every Lesson, A Conversation
 </p>
 <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1e2749', margin: '0 0 12px 0' }}>Not a quiz. A community.</h2>
 <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 700, margin: '0 auto' }}>
 Every lesson opens up a conversation thread. Educators share what they tried, what they adapted, and what got stuck - so the next teacher learns from the last.
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
 <section style={{ padding: '56px 16px', backgroundColor: '#1e2749' }}>
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
 No one is tracking this. No one is watching. Just breathing exercises, affirmations, gentle tools, and journaling - for when you need them.
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

 {/* 4. IMPLEMENTATION STAT */}
 <section style={{ padding: '56px 16px', backgroundColor: '#E6F1FB' }}>
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

 {/* 2.5 TESTIMONIALS */}
 <section style={{ padding: '56px 16px', backgroundColor: '#1e2749' }}>
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
 <section style={{ padding: '56px 16px', backgroundColor: '#0F6E56' }}>
 <div className="container-default" style={{ maxWidth: 1200, margin: '0 auto' }}>
 <div style={{ textAlign: 'center', marginBottom: 48 }}>
 <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#ffba06', marginBottom: 12 }}>
 Community Built. Community Driven. Community First.
 </p>
 <h2 style={{ fontSize: 32, fontWeight: 700, color: 'white', margin: '0 0 12px 0' }}>How we listen to teachers - without making it feel like a survey.</h2>
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

      {/* Free Ways to Get Started */}
      <section className="section bg-white">
        <div className="container-default">
          <h2 className="text-center mb-2">Free Ways to Get Started</h2>
          <p className="text-center mb-12" style={{ opacity: 0.6 }}>
            No commitment. Just value.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">

            {/* Card 1: Blog/Newsletter */}
            <a
              href="https://raehughart.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
            >
              <div
                className="h-[160px] flex items-center justify-center p-6"
                style={{ backgroundColor: '#ffba06' }}
              >
                {/* Substack/Newsletter Icon */}
                <svg
                  className="w-16 h-16"
                  fill="white"
                  viewBox="0 0 24 24"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                >
                  <path d="M22 4H2v2h20V4zm0 4H2v10l10 4 10-4V8zm-10 9.18L6 15.62v-5.24l6 2.4 6-2.4v5.24l-6 1.56z"/>
                </svg>
              </div>
              <div className="bg-white p-5">
                <h3
                  className="text-lg font-bold mb-2 uppercase tracking-wide"
                  style={{ color: '#1e2749' }}
                >
                  Weekly Strategies
                </h3>
                <p className="text-sm mb-3" style={{ color: '#1e2749', opacity: 0.7 }}>
                  3x/week, practical ideas you can use immediately. Join 100,000+ educators already getting them.
                </p>
                <span className="font-semibold text-sm" style={{ color: '#1e2749' }}>
                  Read the latest →
                </span>
              </div>
            </a>

            {/* Card 2: Podcast */}
            <a
              href="https://podcasts.apple.com/us/podcast/sustainable-teaching-with-rae-hughart/id1792030274"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
            >
              <div
                className="h-[160px] flex items-center justify-center p-6"
                style={{ backgroundColor: '#ffba06' }}
              >
                {/* Headphones/Podcast Icon */}
                <svg
                  className="w-16 h-16"
                  fill="white"
                  viewBox="0 0 24 24"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                >
                  <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
                </svg>
              </div>
              <div className="bg-white p-5">
                <h3
                  className="text-lg font-bold mb-2 uppercase tracking-wide"
                  style={{ color: '#1e2749' }}
                >
                  Listen<br />& Learn
                </h3>
                <p className="text-sm mb-3" style={{ color: '#1e2749', opacity: 0.7 }}>
                  The Sustainable Teaching podcast. Real talk about sustainable teaching from people who get it.
                </p>
                <span className="font-semibold text-sm" style={{ color: '#1e2749' }}>
                  Start listening →
                </span>
              </div>
            </a>

            {/* Card 3: Free Resources */}
            <a
              href="https://tdi.thinkific.com/collections/downloads"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
            >
              <div
                className="h-[160px] flex items-center justify-center p-6"
                style={{ backgroundColor: '#ffba06' }}
              >
                {/* Download Icon */}
                <svg
                  className="w-16 h-16"
                  fill="white"
                  viewBox="0 0 24 24"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                >
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
              </div>
              <div className="bg-white p-5">
                <h3
                  className="text-lg font-bold mb-2 uppercase tracking-wide"
                  style={{ color: '#1e2749' }}
                >
                  Free<br />Resource
                </h3>
                <p className="text-sm mb-3" style={{ color: '#1e2749', opacity: 0.7 }}>
                  Ready-to-use downloads for your classroom, for teachers and paras alike.
                </p>
                <span className="font-semibold text-sm" style={{ color: '#1e2749' }}>
                  Browse downloads →
                </span>
              </div>
            </a>

          </div>
        </div>
      </section>

      {/* For Teachers & Paraprofessionals */}
      <section className="section" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-default">
          <h2 className="text-center mb-2">For Teachers & Paraprofessionals</h2>
          <p className="text-center mb-12" style={{ opacity: 0.6 }}>
            PD that respects your time and actually helps.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

            {/* Card 1: Go Deeper */}
            <a
              href="https://raehughart.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              style={{ borderTop: '4px solid #ffba06' }}
            >
              <h3
                className="text-xl font-bold mb-3"
                style={{ color: '#1e2749' }}
              >
                Exclusive<br />Content
              </h3>
              <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
                Premium strategies, behind-the-scenes access, and a community of educators who are done settling for the status quo.
              </p>
              <span className="font-semibold text-sm" style={{ color: '#ffba06' }}>
                See premium options →
              </span>
            </a>

            {/* Card 2: Learning Hub */}
            <a
              href="https://tdi.thinkific.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              style={{ borderTop: '4px solid #ffba06' }}
            >
              <h3
                className="text-xl font-bold mb-3"
                style={{ color: '#1e2749' }}
              >
                Learning Hub
                <span className="block">All-Access</span>
              </h3>
              <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
                100+ hours of on-demand PD. Bite-sized videos you can finish in one sitting. Strategies you'll actually use Monday morning.
              </p>
              <span className="font-semibold text-sm" style={{ color: '#ffba06' }}>
                Explore the Learning Hub →
              </span>
            </a>

          </div>

          {/* Request for School CTA */}
          <div className="mt-12 text-center">
            <p className="mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
              Love what you see? Think your whole school could benefit?
            </p>
            <a
              href="/for-schools/request"
              className="inline-block px-6 py-3 rounded-lg font-semibold border-2 transition-all hover:bg-gray-100"
              style={{ borderColor: '#1e2749', color: '#1e2749' }}
            >
              Request TDI for Your School
            </a>
          </div>
        </div>
      </section>

      {/* For School Leaders */}
      <section className="section bg-white">
        <div className="container-default">
          <h2 className="text-center mb-2">For School Leaders</h2>
          <p className="text-center mb-12" style={{ opacity: 0.6 }}>
            Support your whole building, teachers and paraprofessionals, with PD they'll actually use.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">

            {/* Card 1: Bring TDI */}
            <a
              href="/get-started"
              className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
            >
              <div
                className="h-[160px] flex items-center justify-center p-6"
                style={{ backgroundColor: '#80a4ed' }}
              >
                {/* Team/Group Icon */}
                <svg
                  className="w-16 h-16"
                  fill="white"
                  viewBox="0 0 24 24"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                >
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
              </div>
              <div className="bg-white p-5">
                <h3
                  className="text-lg font-bold mb-2 uppercase tracking-wide"
                  style={{ color: '#1e2749' }}
                >
                  Work With<br />the Team
                </h3>
                <p className="text-sm mb-3" style={{ color: '#1e2749', opacity: 0.7 }}>
                  Whole-school PD designed for real implementation.
                </p>
                <span className="font-semibold text-sm" style={{ color: '#1e2749' }}>
                  Learn more →
                </span>
              </div>
            </a>

            {/* Card 2: Explore What's Possible */}
            <a
              href="/contact"
              className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
            >
              <div
                className="h-[160px] flex items-center justify-center p-6"
                style={{ backgroundColor: '#80a4ed' }}
              >
                {/* Compass/Explore Icon */}
                <svg
                  className="w-16 h-16"
                  fill="white"
                  viewBox="0 0 24 24"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z"/>
                </svg>
              </div>
              <div className="bg-white p-5">
                <h3
                  className="text-lg font-bold mb-2 uppercase tracking-wide"
                  style={{ color: '#1e2749' }}
                >
                  Explore What's Possible
                </h3>
                <p className="text-sm mb-3" style={{ color: '#1e2749', opacity: 0.7 }}>
                  Let's discuss partnership models for your school.
                </p>
                <span className="font-semibold text-sm" style={{ color: '#1e2749' }}>
                  Get in touch →
                </span>
              </div>
            </a>

            {/* Card 3: Chat with Team */}
            <a
              href="/contact"
              className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
            >
              <div
                className="h-[160px] flex items-center justify-center p-6"
                style={{ backgroundColor: '#80a4ed' }}
              >
                {/* Chat/Message Icon */}
                <svg
                  className="w-16 h-16"
                  fill="white"
                  viewBox="0 0 24 24"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                >
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
              </div>
              <div className="bg-white p-5">
                <h3
                  className="text-lg font-bold mb-2 uppercase tracking-wide"
                  style={{ color: '#1e2749' }}
                >
                  Schedule a Chat
                </h3>
                <p className="text-sm mb-3" style={{ color: '#1e2749', opacity: 0.7 }}>
                  Have questions? Let's talk.
                </p>
                <span className="font-semibold text-sm" style={{ color: '#1e2749' }}>
                  Contact us →
                </span>
              </div>
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

      {/* Calculator Section with Parallax Background */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Parallax Background Image */}
        <div
          className="absolute inset-0 parallax-calc-bg"
          style={{
            backgroundImage: "url('/images/calculator-background.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          }}
        />

        {/* Dark Overlay for readability */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: 'rgba(30, 39, 73, 0.85)'
          }}
        />

        {/* Calculator Content */}
        <div className="relative z-10 container-default">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4" style={{ color: '#ffffff' }}>
            What Could Change for You?
          </h2>
          <p className="text-center mb-10 max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.8 }}>
            See the potential impact on your stress, time, and joy in teaching.
          </p>
          <TabbedCalculator />
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
