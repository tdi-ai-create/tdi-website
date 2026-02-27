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
        className="py-16 md:py-24"
        style={{ backgroundColor: '#1e2749' }}
      >
        <div className="container-default">
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
            <div className="space-y-4 mb-10">
              <p className="text-lg md:text-xl" style={{ color: '#ffffff', opacity: 0.9 }}>
                You are spending $15-20K a year on professional development.
              </p>
              <p className="text-lg md:text-xl" style={{ color: '#ffffff', opacity: 0.9 }}>
                Your implementation rate is probably around 10%.
              </p>
              <p className="text-lg md:text-xl" style={{ color: '#ffffff', opacity: 0.9 }}>
                That means 90% of your investment is not reaching classrooms.
              </p>
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
        className="py-16 md:py-20"
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
              <div className="p-6 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
                <div
                  className="inline-block px-3 py-1 text-xs font-bold rounded-full mb-3"
                  style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                >
                  PHASE 1
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#1e2749' }}>Ignite</h3>
                <p className="text-sm" style={{ color: '#1e2749', opacity: 0.8 }}>
                  Build buy-in with your leadership team and a pilot group of 10-25 educators. See early wins. Lay the foundation.
                </p>
              </div>

              <div className="p-6 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
                <div
                  className="inline-block px-3 py-1 text-xs font-bold rounded-full mb-3"
                  style={{ backgroundColor: '#80a4ed', color: '#ffffff' }}
                >
                  PHASE 2
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#1e2749' }}>Accelerate</h3>
                <p className="text-sm" style={{ color: '#1e2749', opacity: 0.8 }}>
                  Expand support to your full staff. Strategies get implemented school-wide, not just talked about.
                </p>
              </div>

              <div className="p-6 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
                <div
                  className="inline-block px-3 py-1 text-xs font-bold rounded-full mb-3"
                  style={{ backgroundColor: '#38618C', color: '#ffffff' }}
                >
                  PHASE 3
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
        className="py-16 md:py-20"
        style={{ backgroundColor: '#f5f5f5' }}
      >
        <div className="container-default">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8" style={{ color: '#1e2749' }}>
              What Changes in Your Building
            </h2>
            <div className="space-y-4">
              <p className="text-lg" style={{ color: '#1e2749', opacity: 0.85 }}>
                This is not about checking boxes. Here is what partner schools report within the first year:
              </p>
              <p className="text-lg leading-relaxed" style={{ color: '#1e2749', opacity: 0.85 }}>
                Teachers build habits over months, not just inspiration for a day. Your admin team stops assembling compliance data manually - the dashboard builds the evidence as the partnership runs. Observation becomes something teachers look forward to, not dread. Every teacher pulls from the same aligned playbook instead of random internet resources. Leadership aligns on priorities before spending begins, not after.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Benefit (The Math) */}
      <section
        id="section-benefit"
        className="py-16 md:py-20"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="container-default">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8" style={{ color: '#1e2749' }}>
              The Math
            </h2>
            <div className="space-y-6">
              <p className="text-lg" style={{ color: '#1e2749', opacity: 0.85 }}>
                <strong style={{ color: '#1e2749' }}>65% implementation rate</strong> vs. the 10% industry average. That is 6.5x the classroom impact.
              </p>
              <p className="text-lg" style={{ color: '#1e2749', opacity: 0.85 }}>
                If you are already spending $15-20K on PD that produces 10% implementation, a significant portion of that investment is not converting to classroom change. TDI partnerships start at $6,600 and deliver 6.5x the return.
              </p>
              <p className="text-lg" style={{ color: '#1e2749', opacity: 0.85 }}>
                Retaining even one additional teacher saves $20-25K in replacement costs. <span style={{ opacity: 0.6 }}>(Learning Policy Institute, 2024; urban district average)</span>
              </p>
            </div>
            <div className="text-center mt-10">
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
        className="py-12 md:py-16"
        style={{ backgroundColor: '#80a4ed' }}
      >
        <div className="container-default text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: '#ffffff' }}>
            Ready to see the numbers for your school?
          </h2>
          <Link
            href="/free-pd-plan"
            className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105"
            style={{ backgroundColor: '#1e2749', color: '#ffffff' }}
          >
            Get Your Free PD Plan
          </Link>
        </div>
      </section>

      {/* SECTION 6: Proof (Verified Results) */}
      <section
        id="section-proof"
        className="py-16 md:py-20"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="container-default">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#1e2749' }}>
              Verified Results from Partner Schools
            </h2>

            {/* Results Table */}
            <div className="rounded-xl overflow-hidden mb-4" style={{ border: '1px solid #e5e7eb' }}>
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
              <div className="flex gap-4 p-5 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
                <div className="flex-shrink-0">
                  <div className="text-2xl font-bold" style={{ color: '#38618C' }}>
                    8.2 → 5.4
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-1" style={{ color: '#1e2749' }}>
                    Teacher Stress Score
                  </div>
                  <p className="text-xs" style={{ color: '#1e2749', opacity: 0.7 }}>
                    A 6-school district in Illinois reduced average teacher stress scores within one academic year of their Ignite partnership.
                  </p>
                </div>
              </div>

              {/* Card 2: Implementation */}
              <div className="flex gap-4 p-5 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
                <div className="flex-shrink-0">
                  <div className="text-2xl font-bold" style={{ color: '#38618C' }}>
                    12% → 58%
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-1" style={{ color: '#1e2749' }}>
                    Strategy Implementation
                  </div>
                  <p className="text-xs" style={{ color: '#1e2749', opacity: 0.7 }}>
                    A K-8 school in the Midwest grew implementation across their first Ignite semester and continued through Year 2 in Accelerate.
                  </p>
                </div>
              </div>

              {/* Card 3: Retention */}
              <div className="flex gap-4 p-5 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
                <div className="flex-shrink-0">
                  <div className="text-2xl font-bold" style={{ color: '#38618C' }}>
                    0 departures
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-1" style={{ color: '#1e2749' }}>
                    Teacher Retention
                  </div>
                  <p className="text-xs" style={{ color: '#1e2749', opacity: 0.7 }}>
                    A rural elementary school reported zero voluntary teacher departures in the year following their TDI partnership, after losing 4 the previous year.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: Funding */}
      <section
        id="section-funding"
        className="py-16 md:py-20"
        style={{ backgroundColor: '#f5f5f5' }}
      >
        <div className="container-default">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8" style={{ color: '#1e2749' }}>
              80% of Partner Schools Secure External Funding
            </h2>
            <div className="space-y-4 mb-8">
              <p className="text-lg" style={{ color: '#1e2749', opacity: 0.85 }}>
                TDI services qualify under Title II-A, Title IV-A, and most state professional development grants. We help you identify which sources apply and provide alignment language for your application.
              </p>
              <p className="text-lg" style={{ color: '#1e2749', opacity: 0.85 }}>
                Some districts may still have unspent ESSER funds available through September 2026. Check with your business office.
              </p>
              <p className="text-lg" style={{ color: '#1e2749', opacity: 0.85 }}>
                Need help writing the grant language? Your TDI partner can provide alignment documentation and evidence summaries.
              </p>
            </div>
            <div className="text-center">
              <Link
                href="/funding"
                className="inline-flex items-center gap-2 font-semibold transition-all hover:gap-3"
                style={{ color: '#35A7FF' }}
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
        className="py-16 md:py-20"
        style={{ backgroundColor: '#ffffff' }}
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
        className="py-16 md:py-20"
        style={{ backgroundColor: '#80a4ed' }}
      >
        <div className="container-default text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Ready to Start the Conversation?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.9 }}>
            No pressure. No pitch. Just a conversation about what is possible for your school.
          </p>
          <Link
            href="/free-pd-plan"
            className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105"
            style={{ backgroundColor: '#1e2749', color: '#ffffff' }}
          >
            Get Your Free PD Plan
          </Link>
          <p className="mt-6 text-sm" style={{ color: '#ffffff', opacity: 0.8 }}>
            Or email us at{' '}
            <a href="mailto:hello@teachersdeserveit.com" className="underline">
              hello@teachersdeserveit.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
