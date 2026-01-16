'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  // Priority questions - Admin-focused (shown on homepage)
  {
    question: "My teachers already have so much on their plate. How does TDI avoid adding more?",
    answer: "TDI replaces ineffective PD—it doesn't pile on top of it. Our micro-learning format fits into existing schedules with daily 5-10 minute sessions instead of day-long workshops that pull teachers from classrooms."
  },
  {
    question: "I'm trying to avoid teacher burnout. How does TDI address this?",
    answer: "Burnout happens when teachers feel unsupported and overwhelmed. TDI builds wellness into every course, teaches practical time-saving strategies, and creates a community where educators feel seen. Our partner schools report stress levels dropping from 9/10 to 5-7/10 within months."
  },
  {
    question: "How do I get teacher buy-in for another PD program?",
    answer: "Teachers resist PD that wastes their time. TDI's 65% implementation rate (vs. 10% industry average) exists because our content is immediately applicable. We also recommend starting with teacher input surveys so staff feel heard from day one."
  },
  {
    question: "What makes TDI different from other PD?",
    answer: "TDI uses a flipped model. You learn strategies on your own time through bite-sized videos, then we focus live sessions on implementation and problem-solving. No more sitting through hours of PowerPoints. Our content is created by teachers who've been in the trenches, not consultants who haven't been in a classroom in years."
  },
  {
    question: "How much does it cost?",
    answer: "Individual teachers can access the Learning Hub starting at $25/month. For schools and districts, pricing depends on your team size and goals. The good news? 80% of schools we work with secure external funding to cover the cost. We'll help you find it."
  },
  {
    question: "We don't have budget for PD. Can you still help?",
    answer: "Yes! We specialize in helping schools identify and apply for grants including Title II, state funds, foundation grants, and more. We'll align your PD plan with funding opportunities and even draft the grant language for you."
  },
  // Additional questions (shown on /faq page)
  {
    question: "Is this just for teachers, or can paraprofessionals participate too?",
    answer: "Both! Our content is designed for everyone who works directly with students. When schools partner with us, we encourage including the whole building, teachers and paras alike. Everyone deserves support."
  },
  {
    question: "How much time does this take?",
    answer: "Courses range from 20-45 minutes and are action-driven to ensure easy implementation for the educator. Learn on your schedule, apply it the next day."
  },
  {
    question: "Do you offer live workshops or just online content?",
    answer: "Both. School partners get access to live workshops, coaching sessions, and ongoing support in addition to the full Learning Hub. Individual teachers can start with on-demand content anytime."
  },
  {
    question: "How does TDI develop its content?",
    answer: "Every resource starts with a real need from teachers or partner schools. We recruit specialists and practitioners to collaborate on solutions, ground everything in current research, and shape it into actionable tools. Courses, downloads, and resource packets go live in the Learning Hub. For partner schools, we guarantee 30-day turnaround on custom requests. The result: targeted, ready-to-use resources when educators need them."
  },
  {
    question: "Does TDI support all types of educators?",
    answer: "Yes. TDI supports the whole education ecosystem. Whether you're an elementary teacher, middle school specialist, high school instructor, art teacher, music teacher, PE teacher, paraprofessional, or instructional coach, our strategies are designed to be adaptable and relevant to your role."
  }
];

interface FAQProps {
  limit?: number;
  showSeeAll?: boolean;
}

export function FAQ({ limit, showSeeAll = false }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const displayedQuestions = limit ? faqs.slice(0, limit) : faqs;

  return (
    <section className="section bg-white">
      <div className="container-default">
        <h2 className="text-center mb-4">Frequently Asked Questions</h2>
        <p className="text-center mb-12" style={{ opacity: 0.7 }}>
          Got questions? We've got answers.
        </p>

        <div className="max-w-3xl mx-auto space-y-4">
          {displayedQuestions.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center gap-4 hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold">{faq.question}</span>
                <span
                  className="flex-shrink-0 text-2xl"
                  style={{ color: 'var(--tdi-navy)' }}
                >
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p style={{ opacity: 0.7 }}>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {showSeeAll && (
          <div className="text-center mt-8">
            <a
              href="/faq"
              className="inline-flex items-center gap-2 font-semibold transition-all hover:opacity-80"
              style={{ color: '#ffba06' }}
            >
              See all frequently asked questions
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        )}

        <div className="text-center mt-8">
          <p style={{ opacity: 0.7 }}>
            Still have questions?{' '}
            <a
              href="/contact"
              className="font-semibold underline"
              style={{ color: 'var(--tdi-navy)' }}
            >
              Get in touch
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
