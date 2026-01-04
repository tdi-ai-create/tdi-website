'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What makes TDI different from other PD?",
    answer: "TDI uses a flipped model — you learn strategies on your own time through bite-sized videos, then we focus live sessions on implementation and problem-solving. No more sitting through hours of PowerPoints. Our content is created by teachers who've been in the trenches, not consultants who haven't been in a classroom in years."
  },
  {
    question: "Is this just for teachers, or can paraprofessionals participate too?",
    answer: "Both! Our content is designed for everyone who works directly with students. When schools partner with us, we encourage including the whole building — teachers and paras alike. Everyone deserves support."
  },
  {
    question: "How much does it cost?",
    answer: "Individual teachers can access the Learning Hub starting at $25/month. For schools and districts, pricing depends on your team size and goals. The good news? 80% of schools we work with secure external funding to cover the cost. We'll help you find it."
  },
  {
    question: "We don't have budget for PD. Can you still help?",
    answer: "Yes! We specialize in helping schools identify and apply for grants — Title II, state funds, foundation grants, and more. We'll align your PD plan with funding opportunities and even draft the grant language for you."
  },
  {
    question: "How much time does this take?",
    answer: "That's up to you. Most of our courses are 30-60 minutes and designed to be completed in one sitting. For school partnerships, we work around your calendar — no multi-day workshops that pull teachers away from students."
  },
  {
    question: "Do you offer live workshops or just online content?",
    answer: "Both. School partners get access to live workshops, coaching sessions, and ongoing support in addition to the full Learning Hub. Individual teachers can start with on-demand content anytime."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="section bg-white">
      <div className="container-default">
        <h2 className="text-center mb-4">Frequently Asked Questions</h2>
        <p className="text-center mb-12" style={{ opacity: 0.7 }}>
          Got questions? We've got answers.
        </p>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
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
                  style={{ color: 'var(--tdi-teal)' }}
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

        <div className="text-center mt-8">
          <p style={{ opacity: 0.7 }}>
            Still have questions?{' '}
            <a 
              href="/contact" 
              className="font-semibold underline"
              style={{ color: 'var(--tdi-teal)' }}
            >
              Get in touch
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
