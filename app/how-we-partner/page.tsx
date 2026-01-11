'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PhaseData {
  id: string;
  number: number;
  badge: string;
  title: string;
  tagline: string;
  keyStat: string;
  keyStatContext?: string;
  shift: string;
  whatYouGet: string[];
  whatYouSee: string[];
  timeline: string;
  cta: { text: string; href: string };
  isStart?: boolean;
}

const phases: PhaseData[] = [
  {
    id: 'ignite',
    number: 1,
    badge: 'START HERE',
    title: 'IGNITE',
    tagline: 'Build buy-in with your leadership team and pilot group',
    keyStat: '95%',
    keyStatContext: 'of pilot teachers report saving planning time',
    shift: 'Awareness → Buy-in',
    whatYouGet: [
      '2 On-Campus PD Days with Rae and the TDI team',
      '4 Virtual Strategy Sessions',
      '2 Leadership Executive Sessions',
      '2 Leadership Impact Sessions',
      'Learning Hub access for your pilot group (10-25 educators)',
      'Teachers Deserve It book for each participant',
    ],
    whatYouSee: [
      'Pilot teachers reduce planning time from 12 to 6-8 hours/week',
      'Leadership alignment on wellness priorities',
      'Foundation for school-wide rollout',
    ],
    timeline: '1 semester to 1 year (flexible based on your school\'s needs)',
    cta: { text: 'See if IGNITE is right for your school →', href: '/for-schools/schedule-call' },
    isStart: true,
  },
  {
    id: 'accelerate',
    number: 2,
    badge: 'SCALE',
    title: 'ACCELERATE',
    tagline: 'Expand support to your full staff',
    keyStat: '65%',
    keyStatContext: 'implementation rate (vs 10% industry average)',
    shift: 'Buy-in → Action',
    whatYouGet: [
      'Everything in IGNITE, plus:',
      'Learning Hub access for ALL staff',
      '6 Executive Impact Sessions',
      'Teachers Deserve It book for every educator',
      'Retention tracking tools',
      'Paraprofessional support options',
    ],
    whatYouSee: [
      'Staff stress levels drop from 9 to 5-7 (on 10-point scale)',
      'Teacher retention intent improves from 2-4 to 5-7',
      'Strategies implemented school-wide, not just talked about',
    ],
    timeline: '1-3 years (many schools stay here for sustained growth)',
    cta: { text: 'See what ACCELERATE could do for your staff →', href: '/for-schools#calculator' },
  },
  {
    id: 'sustain',
    number: 3,
    badge: 'LONG-TERM PARTNERSHIP',
    title: 'SUSTAIN',
    tagline: 'Embed lasting systems that outlive any single initiative',
    keyStat: 'Transformation',
    keyStatContext: 'that becomes part of your school\'s DNA',
    shift: 'Action → Identity',
    whatYouGet: [
      'Everything in ACCELERATE, plus:',
      'Desi AI Assistant (24/7 support for your educators)',
      'Advanced analytics and progress tracking',
      'Ongoing partnership support',
      'Custom implementation coaching',
    ],
    whatYouSee: [
      'Wellness becomes embedded in school culture',
      'Systems sustain even through staff turnover',
      'Your school becomes a model for others',
    ],
    timeline: 'Ongoing partnership (schools in SUSTAIN are long-term partners)',
    cta: { text: 'Let\'s talk about long-term partnership →', href: '/for-schools/schedule-call' },
  },
];

function PhaseCard({ phase, isExpanded, onToggle }: { phase: PhaseData; isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="flex-1 relative">
      {/* Timeline connector line - desktop */}
      <div className="hidden md:block absolute top-8 left-0 right-0 h-1" style={{ backgroundColor: '#e5e7eb' }}>
        <div
          className="absolute top-0 h-full"
          style={{
            backgroundColor: '#ffba06',
            left: phase.number === 1 ? '50%' : '0',
            right: phase.number === 3 ? '50%' : '0',
          }}
        />
      </div>

      {/* Timeline dot */}
      <div className="relative z-10 flex justify-center mb-4">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all ${
            phase.isStart ? 'ring-4 ring-offset-2 ring-yellow-400' : ''
          }`}
          style={{
            backgroundColor: '#ffba06',
            color: '#1e2749',
          }}
        >
          {phase.number}
        </div>
      </div>

      {/* Badge */}
      <div className="flex justify-center mb-3">
        <span
          className="text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full"
          style={{
            backgroundColor: phase.isStart ? '#1e2749' : '#e5e7eb',
            color: phase.isStart ? '#ffffff' : '#1e2749',
          }}
        >
          {phase.badge}
        </span>
      </div>

      {/* Card */}
      <div
        className={`rounded-xl transition-all cursor-pointer ${
          isExpanded ? 'shadow-xl' : 'shadow-md hover:shadow-lg'
        }`}
        style={{
          backgroundColor: '#ffffff',
          border: isExpanded ? '2px solid #ffba06' : '1px solid #e5e7eb',
        }}
        onClick={onToggle}
      >
        {/* Collapsed View */}
        <div className="p-5">
          <h3 className="text-2xl font-bold text-center mb-2" style={{ color: '#1e2749' }}>
            {phase.title}
          </h3>
          <p className="text-sm text-center mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
            {phase.tagline}
          </p>

          {/* Key Stat */}
          <div className="text-center mb-4 p-3 rounded-lg" style={{ backgroundColor: '#f5f5f5' }}>
            <p className="text-2xl font-bold" style={{ color: '#ffba06' }}>
              {phase.keyStat}
            </p>
            <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>
              {phase.keyStatContext}
            </p>
          </div>

          <p
            className="text-sm text-center font-medium"
            style={{ color: '#80a4ed' }}
          >
            {isExpanded ? 'Click to collapse −' : 'Click to learn more +'}
          </p>
        </div>

        {/* Expanded View */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-5 pb-5 border-t" style={{ borderColor: '#e5e7eb' }}>
            {/* The Shift */}
            <div className="py-4 text-center">
              <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#1e2749', opacity: 0.5 }}>
                The Shift
              </p>
              <p className="text-lg font-bold" style={{ color: '#1e2749' }}>
                {phase.shift}
              </p>
            </div>

            {/* What You Get */}
            <div className="mb-4">
              <h4 className="font-bold mb-2" style={{ color: '#1e2749' }}>
                What Your School Gets:
              </h4>
              <ul className="space-y-2">
                {phase.whatYouGet.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: '#1e2749' }}>
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <span style={{ opacity: item.includes('Everything in') ? 0.7 : 1, fontStyle: item.includes('Everything in') ? 'italic' : 'normal' }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What You'll See */}
            <div className="mb-4">
              <h4 className="font-bold mb-2" style={{ color: '#1e2749' }}>
                What You'll See:
              </h4>
              <ul className="space-y-2">
                {phase.whatYouSee.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: '#1e2749' }}>
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="#22c55e" viewBox="0 0 24 24">
                      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Timeline */}
            <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: '#f5f5f5' }}>
              <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#1e2749', opacity: 0.5 }}>
                Typical Timeline
              </p>
              <p className="text-sm" style={{ color: '#1e2749' }}>
                {phase.timeline}
              </p>
            </div>

            {/* CTA */}
            <Link
              href={phase.cta.href}
              className="block w-full py-3 rounded-lg font-bold text-center transition-all hover:scale-[1.02]"
              style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
              onClick={(e) => e.stopPropagation()}
            >
              {phase.cta.text}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HowWePartnerPage() {
  const [expandedPhase, setExpandedPhase] = useState<string | null>('ignite');

  const togglePhase = (phaseId: string) => {
    setExpandedPhase(expandedPhase === phaseId ? null : phaseId);
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
            Your school isn't one-size-fits-all. Neither is our approach. Our phased model meets you where you are and grows at your pace — whether that's a semester pilot or a multi-year transformation.
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
            Our Partnership Phases
          </h2>
          <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: '#1e2749', opacity: 0.7 }}>
            Click each phase to see what's included. Phases are flexible — move at the pace that's right for your school.
          </p>

          {/* Desktop Timeline */}
          <div className="hidden md:flex gap-6 items-start">
            {phases.map((phase) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                isExpanded={expandedPhase === phase.id}
                onToggle={() => togglePhase(phase.id)}
              />
            ))}
          </div>

          {/* Mobile Timeline - Vertical */}
          <div className="md:hidden space-y-6">
            {phases.map((phase, index) => (
              <div key={phase.id} className="relative">
                {/* Vertical connector line */}
                {index < phases.length - 1 && (
                  <div
                    className="absolute left-8 top-16 w-1 h-full -mb-6"
                    style={{ backgroundColor: '#ffba06' }}
                  />
                )}

                <div className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                        phase.isStart ? 'ring-4 ring-offset-2 ring-yellow-400' : ''
                      }`}
                      style={{
                        backgroundColor: '#ffba06',
                        color: '#1e2749',
                      }}
                    >
                      {phase.number}
                    </div>
                  </div>

                  {/* Card */}
                  <div className="flex-1">
                    {/* Badge */}
                    <span
                      className="inline-block text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-2"
                      style={{
                        backgroundColor: phase.isStart ? '#1e2749' : '#e5e7eb',
                        color: phase.isStart ? '#ffffff' : '#1e2749',
                      }}
                    >
                      {phase.badge}
                    </span>

                    <div
                      className={`rounded-xl transition-all cursor-pointer ${
                        expandedPhase === phase.id ? 'shadow-xl' : 'shadow-md'
                      }`}
                      style={{
                        backgroundColor: '#ffffff',
                        border: expandedPhase === phase.id ? '2px solid #ffba06' : '1px solid #e5e7eb',
                      }}
                      onClick={() => togglePhase(phase.id)}
                    >
                      <div className="p-4">
                        <h3 className="text-xl font-bold mb-1" style={{ color: '#1e2749' }}>
                          {phase.title}
                        </h3>
                        <p className="text-sm mb-3" style={{ color: '#1e2749', opacity: 0.7 }}>
                          {phase.tagline}
                        </p>

                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl font-bold" style={{ color: '#ffba06' }}>
                            {phase.keyStat}
                          </span>
                          <span className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>
                            {phase.keyStatContext}
                          </span>
                        </div>

                        <p className="text-sm font-medium" style={{ color: '#80a4ed' }}>
                          {expandedPhase === phase.id ? 'Tap to collapse −' : 'Tap to learn more +'}
                        </p>
                      </div>

                      {/* Expanded content */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          expandedPhase === phase.id ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="px-4 pb-4 border-t" style={{ borderColor: '#e5e7eb' }}>
                          <div className="py-3">
                            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#1e2749', opacity: 0.5 }}>
                              The Shift
                            </p>
                            <p className="font-bold" style={{ color: '#1e2749' }}>{phase.shift}</p>
                          </div>

                          <div className="mb-3">
                            <h4 className="font-bold text-sm mb-2" style={{ color: '#1e2749' }}>What Your School Gets:</h4>
                            <ul className="space-y-1">
                              {phase.whatYouGet.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs" style={{ color: '#1e2749' }}>
                                  <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                  </svg>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="mb-3">
                            <h4 className="font-bold text-sm mb-2" style={{ color: '#1e2749' }}>What You'll See:</h4>
                            <ul className="space-y-1">
                              {phase.whatYouSee.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs" style={{ color: '#1e2749' }}>
                                  <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="#22c55e" viewBox="0 0 24 24">
                                    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                                  </svg>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-2 rounded-lg mb-3" style={{ backgroundColor: '#f5f5f5' }}>
                            <p className="text-xs" style={{ color: '#1e2749' }}>
                              <strong>Timeline:</strong> {phase.timeline}
                            </p>
                          </div>

                          <Link
                            href={phase.cta.href}
                            className="block w-full py-2 rounded-lg font-bold text-sm text-center"
                            style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {phase.cta.text}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Your School's Journey Section */}
      <section className="py-16" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-default">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: '#1e2749' }}>
              Every School's Path is Different
            </h2>
            <p className="text-lg mb-4" style={{ color: '#1e2749', opacity: 0.8 }}>
              Some schools complete IGNITE in a semester and move quickly to ACCELERATE. Others stay in ACCELERATE for three years before they're ready for SUSTAIN. A few start with a summer pilot. There's no single timeline — just the right pace for your staff.
            </p>
            <p className="text-lg font-medium" style={{ color: '#1e2749' }}>
              What matters is the outcome: teachers who stay, students who thrive, and a school culture that supports both.
            </p>
          </div>
        </div>
      </section>

      {/* Data/Proof Section */}
      <section className="py-16" style={{ backgroundColor: '#1e2749' }}>
        <div className="container-default">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10" style={{ color: '#ffffff' }}>
            The Data Behind the Approach
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center p-6 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <p className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#ffba06' }}>65%</p>
              <p className="text-sm font-medium" style={{ color: '#ffffff' }}>Implementation Rate</p>
              <p className="text-xs mt-1" style={{ color: '#ffffff', opacity: 0.6 }}>vs 10% industry average</p>
            </div>

            <div className="text-center p-6 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <p className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#ffba06' }}>12 → 6-8</p>
              <p className="text-sm font-medium" style={{ color: '#ffffff' }}>Hours/Week</p>
              <p className="text-xs mt-1" style={{ color: '#ffffff', opacity: 0.6 }}>Planning time reduction</p>
            </div>

            <div className="text-center p-6 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <p className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#ffba06' }}>9 → 5-7</p>
              <p className="text-sm font-medium" style={{ color: '#ffffff' }}>Stress Levels</p>
              <p className="text-xs mt-1" style={{ color: '#ffffff', opacity: 0.6 }}>On 10-point scale</p>
            </div>

            <div className="text-center p-6 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <p className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#ffba06' }}>2-4 → 5-7</p>
              <p className="text-sm font-medium" style={{ color: '#ffffff' }}>Retention Intent</p>
              <p className="text-xs mt-1" style={{ color: '#ffffff', opacity: 0.6 }}>Teacher retention score</p>
            </div>
          </div>

          <p className="text-center text-xs" style={{ color: '#ffffff', opacity: 0.5 }}>
            Based on verified survey data from TDI partner schools
          </p>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-16" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
            See What's Possible for Your School
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
                80% of our partner schools secure external funding. See how.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#80a4ed' }}>
        <div className="container-default text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Ready to Start the Conversation?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.9 }}>
            No pressure. No pitch. Just a conversation about what's possible for your school.
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
