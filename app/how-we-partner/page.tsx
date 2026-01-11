'use client';

import { useState } from 'react';
import Link from 'next/link';

type PhaseId = 'ignite' | 'accelerate' | 'sustain';

interface PhaseTab {
  id: PhaseId;
  number: number;
  name: string;
  badge: string;
  tagline: string;
  stat: string;
}

const phaseTabs: PhaseTab[] = [
  {
    id: 'ignite',
    number: 1,
    name: 'IGNITE',
    badge: 'Start Here',
    tagline: 'Build buy-in with leadership and a pilot group',
    stat: '95% of pilot teachers report saving planning time',
  },
  {
    id: 'accelerate',
    number: 2,
    name: 'ACCELERATE',
    badge: 'Scale',
    tagline: 'Expand support to your full staff',
    stat: '65% implementation rate vs 10% industry average',
  },
  {
    id: 'sustain',
    number: 3,
    name: 'SUSTAIN',
    badge: 'Embed',
    tagline: 'Systems that last beyond any single initiative',
    stat: 'Transformation that becomes part of your culture',
  },
];

function IgnitePanel() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1e2749' }}>
          IGNITE: Build Buy-In
        </h2>
        <p className="text-lg font-medium" style={{ color: '#ffba06' }}>
          The Shift: Awareness to Buy-in
        </p>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-3" style={{ color: '#1e2749' }}>Who We Support</h3>
        <p style={{ color: '#1e2749', opacity: 0.8 }}>
          Every phase includes support for your full team: teachers, paraprofessionals, instructional coaches, and administrators. We meet each role where they are.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-3" style={{ color: '#1e2749' }}>What Your School Gets</h3>
        <ul className="space-y-2">
          {[
            '2 On-Campus Observation Days with the TDI team',
            '4 Virtual Strategy Sessions',
            '2 Executive Impact Sessions',
            'Leadership Dashboard (included)',
            'Learning Hub access for your pilot group (typically 10-25 educators)',
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span style={{ color: '#1e2749' }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-3" style={{ color: '#1e2749' }}>What You Will See</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#f5f5f5' }}>
            <p className="text-2xl font-bold" style={{ color: '#ffba06' }}>12 → 6-8 hrs</p>
            <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>Weekly planning time reduction</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#f5f5f5' }}>
            <p className="text-2xl font-bold" style={{ color: '#ffba06' }}>9 → 5-7</p>
            <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>Stress levels (10-point scale)</p>
          </div>
        </div>
        <ul className="mt-4 space-y-2">
          <li className="flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="#22c55e" viewBox="0 0 24 24">
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
            </svg>
            <span style={{ color: '#1e2749' }}>Leadership alignment on wellness priorities</span>
          </li>
          <li className="flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="#22c55e" viewBox="0 0 24 24">
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
            </svg>
            <span style={{ color: '#1e2749' }}>Foundation for school-wide rollout</span>
          </li>
        </ul>
      </div>

      <div className="p-4 rounded-lg" style={{ backgroundColor: '#fffbeb', border: '1px solid #ffba06' }}>
        <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Typical Timeline</h3>
        <p className="text-sm" style={{ color: '#1e2749' }}>
          Most schools complete IGNITE in one semester to one year, but your pace depends on your school's needs and readiness.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-3" style={{ color: '#1e2749' }}>Tools to Explore</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/for-schools#calculator" className="text-sm px-4 py-2 rounded-full transition-all hover:scale-105" style={{ backgroundColor: '#e5e7eb', color: '#1e2749' }}>
            ROI Calculator
          </Link>
          <Link href="/pd-diagnostic" className="text-sm px-4 py-2 rounded-full transition-all hover:scale-105" style={{ backgroundColor: '#e5e7eb', color: '#1e2749' }}>
            PD Diagnostic
          </Link>
          <Link href="/free-pd-plan" className="text-sm px-4 py-2 rounded-full transition-all hover:scale-105" style={{ backgroundColor: '#e5e7eb', color: '#1e2749' }}>
            Free PD Plan
          </Link>
        </div>
      </div>

      <Link
        href="/for-schools/schedule-call"
        className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-[1.02] hover:shadow-lg"
        style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
      >
        See if IGNITE is right for your school
      </Link>
    </div>
  );
}

function AcceleratePanel() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1e2749' }}>
          ACCELERATE: Scale to Full Staff
        </h2>
        <p className="text-lg font-medium" style={{ color: '#ffba06' }}>
          The Shift: Buy-in to Action
        </p>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-3" style={{ color: '#1e2749' }}>Who We Support</h3>
        <p style={{ color: '#1e2749', opacity: 0.8 }}>
          Every phase includes support for your full team: teachers, paraprofessionals, instructional coaches, and administrators. We meet each role where they are.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-3" style={{ color: '#1e2749' }}>What Your School Gets</h3>
        <p className="text-sm italic mb-3" style={{ color: '#1e2749', opacity: 0.6 }}>Everything in IGNITE, plus:</p>
        <ul className="space-y-2">
          {[
            '4 Executive Impact Sessions (increased from 2)',
            'Learning Hub access for ALL staff',
            'Teachers Deserve It book for every educator',
            'Retention tracking tools',
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span style={{ color: '#1e2749' }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-3" style={{ color: '#1e2749' }}>What You Will See</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#f5f5f5' }}>
            <p className="text-2xl font-bold" style={{ color: '#ffba06' }}>65%</p>
            <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>Implementation rate vs 10% industry average</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#f5f5f5' }}>
            <p className="text-2xl font-bold" style={{ color: '#ffba06' }}>2-4 → 5-7</p>
            <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>Teacher retention intent</p>
          </div>
        </div>
        <ul className="mt-4 space-y-2">
          <li className="flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="#22c55e" viewBox="0 0 24 24">
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
            </svg>
            <span style={{ color: '#1e2749' }}>Staff stress levels continue to drop</span>
          </li>
          <li className="flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="#22c55e" viewBox="0 0 24 24">
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
            </svg>
            <span style={{ color: '#1e2749' }}>Strategies implemented school-wide, not just talked about</span>
          </li>
        </ul>
      </div>

      <div className="p-4 rounded-lg" style={{ backgroundColor: '#fffbeb', border: '1px solid #ffba06' }}>
        <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Typical Timeline</h3>
        <p className="text-sm" style={{ color: '#1e2749' }}>
          Many schools stay in ACCELERATE for 1-3 years. There is no rush to move to the next phase. Growth at the right pace is more important than speed.
        </p>
      </div>

      <Link
        href="/for-schools#calculator"
        className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-[1.02] hover:shadow-lg"
        style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
      >
        See what ACCELERATE could do for your staff
      </Link>
    </div>
  );
}

function SustainPanel() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1e2749' }}>
          SUSTAIN: Embed Lasting Change
        </h2>
        <p className="text-lg font-medium" style={{ color: '#ffba06' }}>
          The Shift: Action to Identity
        </p>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-3" style={{ color: '#1e2749' }}>Who We Support</h3>
        <p style={{ color: '#1e2749', opacity: 0.8 }}>
          Every phase includes support for your full team: teachers, paraprofessionals, instructional coaches, and administrators. We meet each role where they are.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-3" style={{ color: '#1e2749' }}>What Your School Gets</h3>
        <p className="text-sm italic mb-3" style={{ color: '#1e2749', opacity: 0.6 }}>Everything in ACCELERATE, plus:</p>
        <ul className="space-y-2">
          {[
            'Desi AI Assistant providing 24/7 support for your educators',
            'Advanced analytics and progress tracking',
            'Ongoing partnership support',
            'Custom implementation coaching',
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span style={{ color: '#1e2749' }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-3" style={{ color: '#1e2749' }}>What You Will See</h3>
        <ul className="space-y-2">
          {[
            'Wellness becomes embedded in school culture',
            'Systems sustain even through staff turnover',
            'Your school becomes a model for others',
            'Teachers identify as professionals who prioritize their own growth',
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="#22c55e" viewBox="0 0 24 24">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
              </svg>
              <span style={{ color: '#1e2749' }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 rounded-lg" style={{ backgroundColor: '#fffbeb', border: '1px solid #ffba06' }}>
        <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Typical Timeline</h3>
        <p className="text-sm" style={{ color: '#1e2749' }}>
          Schools in SUSTAIN are long-term partners. This phase is designed for schools ready to make educator wellness part of their identity.
        </p>
      </div>

      <Link
        href="/for-schools/schedule-call"
        className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-[1.02] hover:shadow-lg"
        style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
      >
        Start a conversation about long-term partnership
      </Link>
    </div>
  );
}

export default function HowWePartnerPage() {
  const [activePhase, setActivePhase] = useState<PhaseId>('ignite');
  const [mobileExpanded, setMobileExpanded] = useState<PhaseId | null>('ignite');

  const toggleMobilePhase = (phaseId: PhaseId) => {
    setMobileExpanded(mobileExpanded === phaseId ? null : phaseId);
    setActivePhase(phaseId);
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24" style={{ backgroundColor: '#1e2749' }}>
        <div className="container-default text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6" style={{ color: '#ffffff' }}>
            We Don't Do Workshops.<br />We Do Partnerships.
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto" style={{ color: '#ffffff', opacity: 0.9 }}>
            Your school is not one-size-fits-all. Neither is our approach. Our phased model meets you where you are and grows at your pace, whether that is a semester pilot or a multi-year transformation.
          </p>
        </div>
      </section>

      {/* Side Tabs + Detail Panel Section */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
            Our Partnership Phases
          </h2>
          <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: '#1e2749', opacity: 0.7 }}>
            Click a phase to see what is included. Phases are flexible, move at the pace that is right for your school.
          </p>

          {/* Desktop Layout: Side Tabs + Panel */}
          <div className="hidden lg:flex gap-8 max-w-6xl mx-auto">
            {/* Left Side: Vertical Tabs with Timeline */}
            <div className="w-80 flex-shrink-0">
              <div className="relative">
                {/* Vertical timeline line */}
                <div
                  className="absolute left-6 top-12 bottom-12 w-1 rounded-full"
                  style={{ backgroundColor: '#e5e7eb' }}
                />
                <div
                  className="absolute left-6 top-12 w-1 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: '#ffba06',
                    height: activePhase === 'ignite' ? '0%' : activePhase === 'accelerate' ? '50%' : '100%',
                    maxHeight: 'calc(100% - 96px)',
                  }}
                />

                {/* Tabs */}
                <div className="space-y-4">
                  {phaseTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActivePhase(tab.id)}
                      className={`w-full text-left transition-all duration-200 ${
                        activePhase === tab.id ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Timeline circle */}
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 relative z-10 transition-all ${
                            activePhase === tab.id ? 'ring-4 ring-offset-2 ring-yellow-400' : ''
                          }`}
                          style={{
                            backgroundColor: activePhase === tab.id ? '#ffba06' : '#e5e7eb',
                            color: activePhase === tab.id ? '#1e2749' : '#6b7280',
                          }}
                        >
                          {tab.number}
                        </div>

                        {/* Tab content */}
                        <div
                          className={`flex-1 p-4 rounded-xl transition-all ${
                            activePhase === tab.id ? 'shadow-lg' : 'shadow-sm hover:shadow-md'
                          }`}
                          style={{
                            backgroundColor: activePhase === tab.id ? '#ffffff' : '#f5f5f5',
                            border: activePhase === tab.id ? '2px solid #ffba06' : '1px solid #e5e7eb',
                          }}
                        >
                          <span
                            className="text-xs font-bold uppercase tracking-wide"
                            style={{ color: activePhase === tab.id ? '#ffba06' : '#6b7280' }}
                          >
                            {tab.badge}
                          </span>
                          <h3
                            className="text-lg font-bold"
                            style={{ color: '#1e2749' }}
                          >
                            {tab.name}
                          </h3>
                          <p className="text-sm mt-1" style={{ color: '#1e2749', opacity: 0.7 }}>
                            {tab.tagline}
                          </p>
                          <p className="text-xs mt-2 font-medium" style={{ color: '#ffba06' }}>
                            {tab.stat}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: Detail Panel */}
            <div className="flex-1 bg-white rounded-2xl p-8 shadow-lg" style={{ border: '1px solid #e5e7eb' }}>
              {activePhase === 'ignite' && <IgnitePanel />}
              {activePhase === 'accelerate' && <AcceleratePanel />}
              {activePhase === 'sustain' && <SustainPanel />}
            </div>
          </div>

          {/* Mobile Layout: Accordion Style */}
          <div className="lg:hidden space-y-4">
            {phaseTabs.map((tab, index) => (
              <div key={tab.id} className="relative">
                {/* Vertical line connector */}
                {index < phaseTabs.length - 1 && (
                  <div
                    className="absolute left-6 top-16 w-1 h-8"
                    style={{ backgroundColor: mobileExpanded === tab.id || mobileExpanded === phaseTabs[index + 1]?.id ? '#ffba06' : '#e5e7eb' }}
                  />
                )}

                <button
                  onClick={() => toggleMobilePhase(tab.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-start gap-4">
                    {/* Timeline circle */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 ${
                        mobileExpanded === tab.id ? 'ring-4 ring-offset-2 ring-yellow-400' : ''
                      }`}
                      style={{
                        backgroundColor: mobileExpanded === tab.id ? '#ffba06' : '#e5e7eb',
                        color: mobileExpanded === tab.id ? '#1e2749' : '#6b7280',
                      }}
                    >
                      {tab.number}
                    </div>

                    {/* Tab header */}
                    <div
                      className="flex-1 p-4 rounded-xl transition-all"
                      style={{
                        backgroundColor: mobileExpanded === tab.id ? '#ffffff' : '#f5f5f5',
                        border: mobileExpanded === tab.id ? '2px solid #ffba06' : '1px solid #e5e7eb',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span
                            className="text-xs font-bold uppercase tracking-wide"
                            style={{ color: mobileExpanded === tab.id ? '#ffba06' : '#6b7280' }}
                          >
                            {tab.badge}
                          </span>
                          <h3 className="text-lg font-bold" style={{ color: '#1e2749' }}>
                            {tab.name}
                          </h3>
                        </div>
                        <svg
                          className={`w-5 h-5 transition-transform ${mobileExpanded === tab.id ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="#1e2749"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <p className="text-sm mt-1" style={{ color: '#1e2749', opacity: 0.7 }}>
                        {tab.tagline}
                      </p>
                    </div>
                  </div>
                </button>

                {/* Expanded content */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    mobileExpanded === tab.id ? 'max-h-[2000px] opacity-100 mt-4 ml-16' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="bg-white rounded-xl p-6 shadow-md" style={{ border: '1px solid #e5e7eb' }}>
                    {tab.id === 'ignite' && <IgnitePanel />}
                    {tab.id === 'accelerate' && <AcceleratePanel />}
                    {tab.id === 'sustain' && <SustainPanel />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Your Whole Team */}
      <section className="py-16" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-default">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#1e2749' }}>
              Built for Your Whole Team
            </h2>
            <p className="text-lg" style={{ color: '#1e2749', opacity: 0.8 }}>
              TDI supports teachers, paraprofessionals, instructional coaches, and administrators at every phase. Whether you are starting with a small pilot or rolling out school-wide, we have resources designed for each role on your team.
            </p>
          </div>
        </div>
      </section>

      {/* Every School's Path is Different */}
      <section className="py-16" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: '#1e2749' }}>
              Every School's Path is Different
            </h2>
            <p className="text-lg mb-4" style={{ color: '#1e2749', opacity: 0.8 }}>
              Some schools complete IGNITE in a semester and move quickly to ACCELERATE. Others stay in ACCELERATE for three years before they are ready for SUSTAIN. A few start with a summer pilot. There is no single timeline, just the right pace for your staff.
            </p>
            <p className="text-lg font-medium" style={{ color: '#1e2749' }}>
              What matters is the outcome: teachers who stay, students who thrive, and a school culture that supports both.
            </p>
          </div>
        </div>
      </section>

      {/* The Data Behind the Approach */}
      <section className="py-16" style={{ backgroundColor: '#1e2749' }}>
        <div className="container-default">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10" style={{ color: '#ffffff' }}>
            The Data Behind the Approach
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 max-w-4xl mx-auto">
            <div className="text-center p-6 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <p className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#ffba06' }}>65%</p>
              <p className="text-sm" style={{ color: '#ffffff', opacity: 0.8 }}>Implementation rate</p>
              <p className="text-xs mt-1" style={{ color: '#ffffff', opacity: 0.5 }}>vs 10% industry average</p>
            </div>

            <div className="text-center p-6 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <p className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#ffba06' }}>12 → 6-8</p>
              <p className="text-sm" style={{ color: '#ffffff', opacity: 0.8 }}>Hours per week</p>
              <p className="text-xs mt-1" style={{ color: '#ffffff', opacity: 0.5 }}>Planning time reduction</p>
            </div>

            <div className="text-center p-6 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <p className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#ffba06' }}>9 → 5-7</p>
              <p className="text-sm" style={{ color: '#ffffff', opacity: 0.8 }}>Stress levels</p>
              <p className="text-xs mt-1" style={{ color: '#ffffff', opacity: 0.5 }}>On 10-point scale</p>
            </div>

            <div className="text-center p-6 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <p className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#ffba06' }}>2-4 → 5-7</p>
              <p className="text-sm" style={{ color: '#ffffff', opacity: 0.8 }}>Retention intent</p>
              <p className="text-xs mt-1" style={{ color: '#ffffff', opacity: 0.5 }}>Teacher retention score</p>
            </div>
          </div>

          <p className="text-center text-xs" style={{ color: '#ffffff', opacity: 0.5 }}>
            Based on verified survey data from TDI partner schools
          </p>
        </div>
      </section>

      {/* See What is Possible */}
      <section className="py-16" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
            See What is Possible for Your School
          </h2>
          <p className="text-center mb-10" style={{ color: '#1e2749', opacity: 0.7 }}>
            Explore your options
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Link
              href="/for-schools#calculator"
              className="block p-6 rounded-xl transition-all hover:shadow-lg hover:scale-[1.02]"
              style={{ backgroundColor: '#f5f5f5' }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#ffba06' }}>
                <svg className="w-6 h-6" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2v-4H8v-2h4V7h2v4h4v2h-4v4z" />
                </svg>
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Calculate Your ROI</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                See the potential impact on retention, stress, and student outcomes.
              </p>
            </Link>

            <Link
              href="/pd-diagnostic"
              className="block p-6 rounded-xl transition-all hover:shadow-lg hover:scale-[1.02]"
              style={{ backgroundColor: '#f5f5f5' }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#ffba06' }}>
                <svg className="w-6 h-6" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Take the PD Diagnostic</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Find out which type of PD your school needs most.
              </p>
            </Link>

            <Link
              href="/free-pd-plan"
              className="block p-6 rounded-xl transition-all hover:shadow-lg hover:scale-[1.02]"
              style={{ backgroundColor: '#f5f5f5' }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#ffba06' }}>
                <svg className="w-6 h-6" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                </svg>
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Get a Free PD Plan</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Answer 5 questions and receive a customized plan within 24 hours.
              </p>
            </Link>

            <Link
              href="/funding"
              className="block p-6 rounded-xl transition-all hover:shadow-lg hover:scale-[1.02]"
              style={{ backgroundColor: '#f5f5f5' }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#ffba06' }}>
                <svg className="w-6 h-6" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                </svg>
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Explore Funding Options</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                80% of our partner schools secure external funding.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#80a4ed' }}>
        <div className="container-default text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Ready to Start the Conversation?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.9 }}>
            No pressure. No pitch. Just a conversation about what is possible for your school.
          </p>
          <Link
            href="/for-schools/schedule-call"
            className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-[1.02] hover:shadow-lg"
            style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
          >
            Schedule a Call
          </Link>
          <p className="mt-6 text-sm" style={{ color: '#ffffff', opacity: 0.8 }}>
            Or email us at{' '}
            <a href="mailto:info@teachersdeserveit.com" className="underline">
              info@teachersdeserveit.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
