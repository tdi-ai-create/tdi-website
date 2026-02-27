'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

const schoolLeaderFAQs: FAQItem[] = [
  {
    question: "We have tried coaching partnerships before and they did not stick.",
    answer: "Traditional PD produces 5-10% implementation because it is event-based, not sustained. TDI's phased model (Ignite, Accelerate, Sustain) builds habits over months with embedded coaching, real-time analytics, and between-visit virtual support. Our 65% implementation rate is anchored in Joyce & Showers' foundational research on sustained coaching and validated by our partner data."
  },
  {
    question: "We do not have the budget for this.",
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
    )
  },
  {
    question: "Our union will not support observation-based PD.",
    answer: "TDI observations are growth-focused, not evaluative. Teachers receive Love Notes - personalized feedback highlighting what they are doing well. 94% of our partners would recommend TDI to a colleague. The concern typically dissolves once teachers experience the first visit and realize this is support, not surveillance."
  },
  {
    question: "We need to see results before committing to a full partnership.",
    answer: "That is exactly what Ignite is designed for. It starts with a pilot group of 10-25 educators and your leadership team. You see early wins within the first semester before expanding to full staff. The dashboard shows your board real data, not promises."
  },
  {
    question: "We already have an instructional coach on staff.",
    answer: "TDI does not replace your coach - we amplify them. A full-time coach costs $60-80K+ and is one person. TDI provides external perspective, research-backed strategies, and a support infrastructure (Hub + Dashboard + Observations) that makes your existing coach more effective."
  },
  {
    question: "How do we know this will work for our specific context?",
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
    )
  }
];

export function SchoolLeadersFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 md:py-20" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="container-default">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
          What Other School Leaders Asked<br />Before Partnering
        </h2>
        <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: '#1e2749', opacity: 0.7 }}>
          Real questions from administrators just like you.
        </p>

        <div className="max-w-3xl mx-auto space-y-4">
          {schoolLeaderFAQs.map((faq, index) => (
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
                  &quot;{faq.question}&quot;
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
                  <p className="text-sm leading-relaxed" style={{ color: '#1e2749', opacity: 0.8 }}>
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
