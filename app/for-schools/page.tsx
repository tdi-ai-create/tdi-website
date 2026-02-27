'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// GA4 scroll tracking hook
function useScrollTracking() {
  const sectionsRef = useRef<Map<string, boolean>>(new Map());

  useEffect(() => {
    const sections = [
      { id: 'section-hero', name: 'Hero Pain' },
      { id: 'section-feature', name: 'Feature Blueprint' },
      { id: 'section-advantage', name: 'Advantage Changes' },
      { id: 'section-benefit', name: 'Benefit Math' },
      { id: 'section-midcta', name: 'Mid-Page CTA' },
      { id: 'section-proof', name: 'Proof Results' },
      { id: 'section-funding', name: 'Funding' },
      { id: 'section-faq', name: 'Objections FAQ' },
      { id: 'section-finalcta', name: 'Final CTA' },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            const sectionName = sections.find((s) => s.id === sectionId)?.name;

            // Only fire once per section per session
            if (sectionName && !sectionsRef.current.get(sectionId)) {
              sectionsRef.current.set(sectionId, true);

              // Fire GA4 event
              if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
                (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'scroll_depth', {
                  page_location: window.location.href,
                  page_title: 'For Schools',
                  section_name: sectionName,
                  section_id: sectionId,
                });
              }
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);
}

// FAQ Accordion Component
function FAQAccordion({ items }: { items: { question: string; answer: React.ReactNode }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-6 py-5 text-left flex items-start justify-between gap-4"
          >
            <span className="font-semibold" style={{ color: '#1e2749' }}>
              {item.question}
            </span>
            <svg
              className={`w-5 h-5 flex-shrink-0 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
              fill="none"
              stroke="#1e2749"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openIndex === index && (
            <div className="px-6 pb-5">
              <div className="text-sm leading-relaxed" style={{ color: '#1e2749', opacity: 0.8 }}>
                {item.answer}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ForSchoolsPage() {
  useScrollTracking();

  const faqItems = [
    {
      question: 'We have tried coaching partnerships before and they did not stick.',
      answer: (
        <>
          Traditional PD produces 5-10% implementation because it is event-based, not sustained. TDI&apos;s phased model (Ignite, Accelerate, Sustain) builds habits over months with embedded coaching, real-time analytics, and between-visit virtual support. Our 65% implementation rate is anchored in Joyce & Showers&apos; foundational research on sustained coaching and validated by our partner data.
        </>
      ),
    },
    {
      question: 'We do not have the budget for this.',
      answer: (
        <>
          Most districts are already spending $15-20K annually on PD that produces 10% implementation - that means a significant portion is effectively lost. TDI partnerships start at $6,600 and deliver 6.5x the classroom impact. And 80% of our partner schools secure external funding through Title II-A, Title IV-A, or state PD grants.{' '}
          <a
            href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline"
            style={{ color: '#35A7FF' }}
          >
            Schedule a 15-minute funding consultation
          </a>{' '}
          and we will identify which sources apply to your school.
        </>
      ),
    },
    {
      question: 'Our union will not support observation-based PD.',
      answer: (
        <>
          TDI observations are growth-focused, not evaluative. Teachers receive Love Notes - personalized feedback highlighting what they are doing well. 94% of our partners would recommend TDI to a colleague. The concern typically dissolves once teachers experience the first visit and realize this is support, not surveillance.
        </>
      ),
    },
    {
      question: 'We need to see results before committing to a full partnership.',
      answer: (
        <>
          That is exactly what Ignite is designed for. It starts with a pilot group of 10-25 educators and your leadership team. You see early wins within the first semester before expanding to full staff. The dashboard shows your board real data, not promises.
        </>
      ),
    },
    {
      question: 'We already have an instructional coach on staff.',
      answer: (
        <>
          TDI does not replace your coach - we amplify them. A full-time coach costs $60-80K+ and is one person. TDI provides external perspective, research-backed strategies, and a support infrastructure (Hub + Dashboard + Observations) that makes your existing coach more effective.
        </>
      ),
    },
    {
      question: 'How do we know this will work for our specific context?',
      answer: (
        <>
          TDI serves 87,000+ educators across 21 states in schools ranging from rural single-building districts to multi-school urban systems. Every partnership is customized - your dashboard, your goals, your pace. Start with the{' '}
          <Link href="/pd-diagnostic" className="font-semibold underline" style={{ color: '#35A7FF' }}>
            free PD Diagnostic
          </Link>{' '}
          or{' '}
          <Link href="/calculator" className="font-semibold underline" style={{ color: '#35A7FF' }}>
            Impact Calculator
          </Link>{' '}
          to see what is possible for your school.
        </>
      ),
    },
  ];

  return (
    <main>
      {/* SECTION 1: Hero (Pain) */}
      <section
        id="section-hero"
        className="relative py-20 md:py-32 overflow-hidden"
      >
        {/* Background Image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/hero-for-schools.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(30, 39, 73, 0.92) 0%, rgba(30, 39, 73, 0.85) 50%, rgba(30, 39, 73, 0.95) 100%)',
          }}
        />
        {/* Subtle texture overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, #ffffff 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
        <div className="container-default relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full mb-6"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.7)' }}
            >
              For School Leaders
            </span>
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8"
              style={{ color: '#ffffff' }}
            >
              Your PD Budget Deserves Better Results
            </h1>
            <div className="flex flex-col md:flex-row gap-4 justify-center mb-10">
              <div className="px-6 py-4 rounded-lg text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(4px)' }}>
                <div className="text-2xl md:text-3xl font-bold" style={{ color: '#ffba06' }}>$15-20K</div>
                <div className="text-sm" style={{ color: '#ffffff', opacity: 0.9 }}>spent on PD yearly</div>
              </div>
              <div className="px-6 py-4 rounded-lg text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(4px)' }}>
                <div className="text-2xl md:text-3xl font-bold" style={{ color: '#ef4444' }}>10%</div>
                <div className="text-sm" style={{ color: '#ffffff', opacity: 0.9 }}>implementation rate</div>
              </div>
              <div className="px-6 py-4 rounded-lg text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(4px)' }}>
                <div className="text-2xl md:text-3xl font-bold" style={{ color: '#ef4444' }}>90%</div>
                <div className="text-sm" style={{ color: '#ffffff', opacity: 0.9 }}>not reaching classrooms</div>
              </div>
            </div>
            <p className="text-xl md:text-2xl font-semibold mb-10" style={{ color: '#ffba06' }}>
              It is not your teachers. It is the model.
            </p>
            <Link
              href="/free-pd-plan"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105"
              style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
            >
              See what is possible for your school
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2: Feature (What You Get) */}
      <section
        id="section-feature"
        className="py-20 md:py-28"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="container-default">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1e2749' }}>
                The TDI Blueprint
              </h2>
              <p className="text-lg" style={{ color: '#1e2749', opacity: 0.8 }}>
                A three-phase partnership that meets your school where you are and grows with you.
              </p>
            </div>

            {/* Three Phases */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow" style={{ borderTop: '4px solid #ffba06' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fef3c7' }}>
                    <svg className="w-5 h-5" fill="none" stroke="#f59e0b" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                    </svg>
                  </div>
                  <div
                    className="px-2 py-0.5 text-xs font-bold rounded"
                    style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                  >
                    PHASE 1
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#1e2749' }}>Ignite</h3>
                <p className="text-sm" style={{ color: '#1e2749', opacity: 0.8 }}>
                  Build buy-in with your leadership team and a pilot group of 10-25 educators. See early wins. Lay the foundation.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow" style={{ borderTop: '4px solid #80a4ed' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
                    <svg className="w-5 h-5" fill="none" stroke="#3b82f6" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div
                    className="px-2 py-0.5 text-xs font-bold rounded"
                    style={{ backgroundColor: '#80a4ed', color: '#ffffff' }}
                  >
                    PHASE 2
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#1e2749' }}>Accelerate</h3>
                <p className="text-sm" style={{ color: '#1e2749', opacity: 0.8 }}>
                  Expand support to your full staff. Strategies get implemented school-wide, not just talked about.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow" style={{ borderTop: '4px solid #38618C' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e0e7ff' }}>
                    <svg className="w-5 h-5" fill="none" stroke="#4f46e5" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div
                    className="px-2 py-0.5 text-xs font-bold rounded"
                    style={{ backgroundColor: '#38618C', color: '#ffffff' }}
                  >
                    PHASE 3
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#1e2749' }}>Sustain</h3>
                <p className="text-sm" style={{ color: '#1e2749', opacity: 0.8 }}>
                  Systems sustain through staff turnover. Your school becomes a model for others.
                </p>
              </div>
            </div>

            <div className="text-center mb-10">
              <Link
                href="/how-we-partner"
                className="inline-flex items-center gap-2 font-semibold transition-all hover:gap-3"
                style={{ color: '#35A7FF' }}
              >
                See exactly what each phase includes
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="p-6 rounded-xl text-center" style={{ backgroundColor: '#f5f5f5' }}>
              <p className="text-sm md:text-base" style={{ color: '#1e2749', opacity: 0.85 }}>
                Every phase includes in-person classroom observations with personalized teacher feedback, virtual coaching sessions, Learning Hub access, a Leadership Dashboard with real-time progress tracking, and Executive Impact Sessions for leadership alignment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Advantage (What Changes) */}
      <section
        id="section-advantage"
        className="py-20 md:py-28"
        style={{ backgroundColor: '#f8f9fa' }}
      >
        <div className="container-default">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
              What Changes in Your Building
            </h2>
            <p className="text-center text-lg mb-12" style={{ color: '#1e2749', opacity: 0.7 }}>
              This is not about checking boxes. Here is what partner schools report within the first year:
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#f0f9ff' }}>
                  <svg className="w-6 h-6" fill="none" stroke="#38618C" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <p className="font-semibold" style={{ color: '#1e2749' }}>
                  Habits over months, not inspiration for a day
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#f0f9ff' }}>
                  <svg className="w-6 h-6" fill="none" stroke="#38618C" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="font-semibold" style={{ color: '#1e2749' }}>
                  Dashboard builds compliance data automatically
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#f0f9ff' }}>
                  <svg className="w-6 h-6" fill="none" stroke="#38618C" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <p className="font-semibold" style={{ color: '#1e2749' }}>
                  Observations teachers look forward to
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#f0f9ff' }}>
                  <svg className="w-6 h-6" fill="none" stroke="#38618C" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="font-semibold" style={{ color: '#1e2749' }}>
                  One aligned playbook, not random resources
                </p>
              </div>

              {/* Card 5 */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#f0f9ff' }}>
                  <svg className="w-6 h-6" fill="none" stroke="#38618C" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="font-semibold" style={{ color: '#1e2749' }}>
                  Leadership aligned before spending begins
                </p>
              </div>

              {/* Card 6 */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#f0f9ff' }}>
                  <svg className="w-6 h-6" fill="none" stroke="#38618C" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className="font-semibold" style={{ color: '#1e2749' }}>
                  Stress and burnout data you can track
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Benefit (The Math) */}
      <section
        id="section-benefit"
        className="py-20 md:py-28"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="container-default">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
              The Math
            </h2>
            <p className="text-center text-lg mb-12" style={{ color: '#1e2749', opacity: 0.7 }}>
              Compare your current PD investment to a TDI partnership.
            </p>

            {/* Side-by-side comparison */}
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-10">
              {/* Traditional PD */}
              <div className="p-8 rounded-2xl" style={{ backgroundColor: '#fef2f2', border: '2px solid #fecaca' }}>
                <h3 className="text-xl font-bold mb-6 text-center" style={{ color: '#991b1b' }}>Traditional PD</h3>
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#1e2749', opacity: 0.8 }}>Annual cost</span>
                    <span className="text-xl font-bold" style={{ color: '#1e2749' }}>$15-20K</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#1e2749', opacity: 0.8 }}>Implementation rate</span>
                    <span className="text-xl font-bold" style={{ color: '#ef4444' }}>10%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#1e2749', opacity: 0.8 }}>Retention tracking</span>
                    <span className="text-xl font-bold" style={{ color: '#1e2749' }}>None</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#1e2749', opacity: 0.8 }}>Sustained coaching</span>
                    <span className="text-xl font-bold" style={{ color: '#1e2749' }}>Rare</span>
                  </div>
                </div>
              </div>

              {/* TDI Partnership */}
              <div className="p-8 rounded-2xl" style={{ backgroundColor: '#f0fdf4', border: '2px solid #86efac' }}>
                <h3 className="text-xl font-bold mb-6 text-center" style={{ color: '#166534' }}>TDI Partnership</h3>
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#1e2749', opacity: 0.8 }}>Starting at</span>
                    <span className="text-xl font-bold" style={{ color: '#1e2749' }}>$6,600</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#1e2749', opacity: 0.8 }}>Implementation rate</span>
                    <span className="text-xl font-bold" style={{ color: '#22c55e' }}>65%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#1e2749', opacity: 0.8 }}>Retention savings</span>
                    <span className="text-xl font-bold" style={{ color: '#1e2749' }}>$20-25K/teacher</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#1e2749', opacity: 0.8 }}>Sustained coaching</span>
                    <span className="text-xl font-bold" style={{ color: '#22c55e' }}>Built-in</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-lg font-semibold mb-6" style={{ color: '#38618C' }}>
              6.5x the classroom impact at a fraction of the cost
            </p>

            <p className="text-center text-sm mb-8" style={{ color: '#1e2749', opacity: 0.5 }}>
              (Learning Policy Institute, 2024; urban district average)
            </p>

            <div className="text-center">
              <Link
                href="/free-pd-plan"
                className="inline-flex items-center gap-2 font-semibold transition-all hover:gap-3"
                style={{ color: '#35A7FF' }}
              >
                See your school&apos;s specific numbers
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Mid-Page CTA */}
      <section
        id="section-midcta"
        className="py-16 md:py-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #38618C 0%, #80a4ed 100%)' }}
      >
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, #ffffff 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
        <div className="container-default text-center relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: '#ffffff' }}>
            Ready to see the numbers for your school?
          </h2>
          <Link
            href="/free-pd-plan"
            className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
          >
            Get Your Free PD Plan
          </Link>
        </div>
      </section>

      {/* SECTION 6: Proof (Verified Results) */}
      <section
        id="section-proof"
        className="py-20 md:py-28"
        style={{ backgroundColor: '#f8f9fa' }}
      >
        <div className="container-default">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#1e2749' }}>
              Verified Results from Partner Schools
            </h2>

            {/* Results Table */}
            <div className="rounded-xl overflow-hidden mb-4 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
              <div className="grid grid-cols-3 text-sm font-bold" style={{ backgroundColor: '#1e2749', color: '#ffffff' }}>
                <div className="p-3 border-r border-white/20">Before TDI</div>
                <div className="p-3 border-r border-white/20">After TDI</div>
                <div className="p-3">What Changed</div>
              </div>
              <div className="grid grid-cols-3 text-sm border-b" style={{ borderColor: '#e5e7eb' }}>
                <div className="p-3 border-r" style={{ borderColor: '#e5e7eb', color: '#ef4444' }}>12 hours/week</div>
                <div className="p-3 border-r" style={{ borderColor: '#e5e7eb', color: '#22c55e' }}>6-8 hours/week</div>
                <div className="p-3" style={{ color: '#1e2749' }}>Weekly planning time</div>
              </div>
              <div className="grid grid-cols-3 text-sm border-b" style={{ borderColor: '#e5e7eb', backgroundColor: '#f5f5f5' }}>
                <div className="p-3 border-r" style={{ borderColor: '#e5e7eb', color: '#ef4444' }}>9 out of 10</div>
                <div className="p-3 border-r" style={{ borderColor: '#e5e7eb', color: '#22c55e' }}>5-7 out of 10</div>
                <div className="p-3" style={{ color: '#1e2749' }}>Staff stress levels</div>
              </div>
              <div className="grid grid-cols-3 text-sm border-b" style={{ borderColor: '#e5e7eb' }}>
                <div className="p-3 border-r" style={{ borderColor: '#e5e7eb', color: '#ef4444' }}>2-4 out of 10</div>
                <div className="p-3 border-r" style={{ borderColor: '#e5e7eb', color: '#22c55e' }}>5-7 out of 10</div>
                <div className="p-3" style={{ color: '#1e2749' }}>Teacher retention intent</div>
              </div>
              <div className="grid grid-cols-3 text-sm" style={{ backgroundColor: '#f5f5f5' }}>
                <div className="p-3 border-r" style={{ borderColor: '#e5e7eb', color: '#ef4444' }}>10% industry average</div>
                <div className="p-3 border-r" style={{ borderColor: '#e5e7eb', color: '#22c55e' }}>65% with TDI</div>
                <div className="p-3" style={{ color: '#1e2749' }}>Strategy implementation rate</div>
              </div>
            </div>

            {/* Research Footnote */}
            <p className="text-xs mb-10" style={{ color: '#1e2749', opacity: 0.5 }}>
              Implementation baseline: Joyce & Showers (1980, 2002) found that traditional &quot;sit-and-get&quot; PD produces 5-10% classroom transfer. Sustained coaching models produce 80-90%. TDI&apos;s 65% reflects real partner data within this research-backed range.
            </p>

            {/* Partner Success Stories - Stat Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Card 1: Stress Score */}
              <div className="p-6 rounded-xl h-full bg-white shadow-md hover:shadow-lg transition-shadow" style={{ borderLeft: '4px solid #38618C' }}>
                <div className="text-3xl font-bold mb-2" style={{ color: '#38618C' }}>
                  8.2 → 5.4
                </div>
                <div className="text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                  Teacher Stress Score
                </div>
                <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                  A 6-school district in Illinois reduced average teacher stress scores within one academic year of their Ignite partnership.
                </p>
              </div>

              {/* Card 2: Implementation */}
              <div className="p-6 rounded-xl h-full bg-white shadow-md hover:shadow-lg transition-shadow" style={{ borderLeft: '4px solid #38618C' }}>
                <div className="text-3xl font-bold mb-2" style={{ color: '#38618C' }}>
                  12% → 58%
                </div>
                <div className="text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                  Strategy Implementation
                </div>
                <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                  A K-8 school in the Midwest grew implementation across their first Ignite semester and continued through Year 2 in Accelerate.
                </p>
              </div>

              {/* Card 3: Retention */}
              <div className="p-6 rounded-xl h-full bg-white shadow-md hover:shadow-lg transition-shadow" style={{ borderLeft: '4px solid #38618C' }}>
                <div className="text-3xl font-bold mb-2" style={{ color: '#38618C' }}>
                  0 departures
                </div>
                <div className="text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                  Teacher Retention
                </div>
                <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                  A rural elementary school reported zero voluntary teacher departures in the year following their TDI partnership, after losing 4 the previous year.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: Funding */}
      <section
        id="section-funding"
        className="py-20 md:py-28"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="container-default">
          <div className="max-w-3xl mx-auto">
            {/* Heading with icon */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f0fdf4' }}>
                <svg className="w-6 h-6" fill="none" stroke="#22c55e" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#1e2749' }}>
                80% of Partner Schools Secure External Funding
              </h2>
            </div>

            {/* Content with checkmarks */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-1 flex-shrink-0" fill="#22c55e" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <p className="text-lg" style={{ color: '#1e2749', opacity: 0.85 }}>
                  TDI services qualify under Title II-A, Title IV-A, and most state professional development grants. We help you identify which sources apply and provide alignment language for your application.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-1 flex-shrink-0" fill="#22c55e" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <p className="text-lg" style={{ color: '#1e2749', opacity: 0.85 }}>
                  Some districts may still have unspent ESSER funds available through September 2026. Check with your business office.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-1 flex-shrink-0" fill="#22c55e" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <p className="text-lg" style={{ color: '#1e2749', opacity: 0.85 }}>
                  Need help writing the grant language? Your TDI partner can provide alignment documentation and evidence summaries.
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/funding"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:gap-3"
                style={{ backgroundColor: '#f0fdf4', color: '#15803d' }}
              >
                Explore Funding Options
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: Objections FAQ */}
      <section
        id="section-faq"
        className="py-20 md:py-28"
        style={{ backgroundColor: '#f8f9fa' }}
      >
        <div className="container-default">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
            What Other School Leaders Asked<br />Before Partnering
          </h2>
          <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: '#1e2749', opacity: 0.7 }}>
            Real questions from administrators just like you.
          </p>
          <FAQAccordion items={faqItems} />
        </div>
      </section>

      {/* SECTION 9: Final CTA */}
      <section
        id="section-finalcta"
        className="py-20 md:py-28 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e2749 0%, #2d3a5f 50%, #1e2749 100%)' }}
      >
        {/* Subtle animated gradient overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(ellipse at 30% 20%, #38618C 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, #80a4ed 0%, transparent 50%)',
          }}
        />
        <div className="container-default text-center relative z-10">
          <h2 className="text-2xl md:text-4xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Ready to Start the Conversation?
          </h2>
          <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.9 }}>
            No pressure. No pitch. Just a conversation about what is possible for your school.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/free-pd-plan"
              className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105 hover:shadow-lg"
              style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
            >
              Get Your Free PD Plan
            </Link>
            <Link
              href="/contact"
              className="inline-block px-8 py-4 rounded-lg font-bold text-lg border-2 transition-all hover:bg-white/10"
              style={{ borderColor: 'rgba(255, 255, 255, 0.5)', color: '#ffffff' }}
            >
              Start the Conversation
            </Link>
          </div>
          <p className="mt-8 text-sm" style={{ color: '#ffffff' }}>
            Or email us at{' '}
            <a href="mailto:hello@teachersdeserveit.com" className="underline" style={{ color: '#ffffff' }}>
              hello@teachersdeserveit.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
