'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What makes TDI different from other PD?",
    answer: "TDI uses a flipped model. You learn strategies on your own time through bite-sized videos, then we focus live sessions on implementation and problem-solving. No more sitting through hours of PowerPoints. Our content is created by teachers who've been in the trenches, not consultants who haven't been in a classroom in years."
  },
  {
    question: "How is this different from other PD I've sat through?",
    answer: "Traditional PD is often theory-heavy, one-size-fits-all, and disconnected from your actual classroom. TDI is built by teachers who've been in your shoes. Every strategy is practical, immediately applicable, and respects your time. No more 'someday you'll use this.' Everything we create answers one question: Will this help a teacher be better for their students on Monday?"
  },
  {
    question: "Is this just another thing on my plate?",
    answer: "We get it. Teachers are already stretched thin. TDI is designed to save you time, not add to your workload. Our resources are ready to use Monday morning with zero prep required. Most educators tell us they actually reclaim hours each week by implementing our strategies. This is about working smarter, not harder."
  },
  {
    question: "I'm already burned out. Do I have the energy for this?",
    answer: "If you're burned out, you're exactly who we built this for. TDI started because our founder hit that wall too. We don't ask you to do more. We help you do things differently so you can breathe again. Start small. One strategy. One course. Many teachers tell us that's all it took to feel a shift."
  },
  {
    question: "What if my admin won't support it?",
    answer: "Many teachers start with TDI on their own and see results that speak for themselves. When administrators see improved classroom management, reduced stress, and better student outcomes, they often become advocates. We also offer resources specifically for sharing TDI's value with school leadership, and our team is happy to connect with your admin directly."
  },
  {
    question: "Is this just for teachers, or can paraprofessionals participate too?",
    answer: "Both! Our content is designed for everyone who works directly with students. When schools partner with us, we encourage including the whole building, teachers and paras alike. Everyone deserves support."
  },
  {
    question: "How much does it cost?",
    answer: "Individual teachers can access the Learning Hub starting at $25/month. For schools and districts, pricing depends on your team size and goals. The good news? 80% of schools we work with secure external funding to cover the cost. We'll help you find it."
  },
  {
    question: "We don't have budget for PD. Can you still help?",
    answer: "Yes! We specialize in helping schools identify and apply for grants including Title II, state funds, foundation grants, and more. We'll align your PD plan with funding opportunities and even draft the grant language for you."
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
    question: "Can paraprofessionals learn with TDI?",
    answer: "Absolutely. Our content is designed for everyone who works directly with students. Paraprofessionals play a critical role in schools, and they deserve quality professional development too. When schools partner with us, we encourage including the whole building."
  },
  {
    question: "Does TDI support all types of educators?",
    answer: "Yes. TDI supports the whole education ecosystem. Whether you're an elementary teacher, middle school specialist, high school instructor, art teacher, music teacher, PE teacher, paraprofessional, or instructional coach, our strategies are designed to be adaptable and relevant to your role."
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
