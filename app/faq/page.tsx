import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ | Teachers Deserve It',
  description: 'Frequently asked questions about Teachers Deserve It professional development.',
};

const faqs = [
  {
    category: 'About TDI',
    questions: [
      {
        q: 'What makes TDI different from other PD?',
        a: 'TDI was built by teachers who got tired of sitting through PD that had nothing to do with real classroom challenges. Everything we create is action-focused, designed to be used Monday morning, not "someday." We also respect your time with a flipped model that lets you learn on your schedule.',
      },
      {
        q: 'How is this different from other PD I\'ve sat through?',
        a: 'No PowerPoint marathons. No "turn to your partner and discuss." TDI content is created by practicing educators, backed by research, and built for immediate implementation. You\'ll walk away with tools you can use, not binders you\'ll never open.',
      },
      {
        q: 'How does TDI develop its content?',
        a: 'We start by listening to teachers about what they actually need. Then our team of educators and experts collaborate to design research-backed, actionable tools. Everything goes through real classroom testing before it hits the Learning Hub.',
      },
    ],
  },
  {
    category: 'Time & Energy',
    questions: [
      {
        q: 'Is this just another thing on my plate?',
        a: 'We get it. Teachers are stretched thin. TDI is designed to save you time, not add to your load. Our strategies focus on working smarter: better systems, more efficient planning, and sustainable practices that reduce the Sunday Scaries.',
      },
      {
        q: 'I\'m already burned out. Do I have the energy for this?',
        a: 'If you\'re burned out, you\'re exactly who we built this for. TDI isn\'t about doing more. It\'s about doing better with less effort. Start small. Even one strategy that saves you 30 minutes a week adds up to 18 hours over a semester.',
      },
      {
        q: 'How much time does this take?',
        a: 'That\'s up to you. Courses are broken into 3-5 minute sections, with full courses taking 20-45 minutes to explore. Easy to fit into lunch, planning periods, or your commute. Partner schools get structured implementation time built into their PD calendar. No Saturdays required.',
      },
    ],
  },
  {
    category: 'Getting Support',
    questions: [
      {
        q: 'What if my admin won\'t support it?',
        a: 'We can help with that. TDI provides resources to share with leadership, including ROI data, implementation research, and case studies from partner schools. Many administrators become our biggest advocates once they see teachers actually using what they learn.',
      },
      {
        q: 'Do you offer live workshops or just online content?',
        a: 'Both! Individual teachers can access our full Learning Hub online anytime. Partner schools get live workshops, coaching sessions, and ongoing support tailored to their specific needs and goals.',
      },
    ],
  },
  {
    category: 'Cost & Access',
    questions: [
      {
        q: 'How much does it cost?',
        a: 'Individual teachers can access free resources through our blog and podcast, plus affordable courses in the Learning Hub. Schools partner with us through customized packages based on their size and needs. We believe cost should never be the reason a school can\'t support its teachers.',
      },
      {
        q: 'We don\'t have budget for PD. Can you still help?',
        a: 'Absolutely. 80% of the schools we work with secure external funding for TDI. We help identify grants like Title II, ESSER, and state-specific opportunities. Our team can even help with the paperwork.',
      },
    ],
  },
  {
    category: 'Who It\'s For',
    questions: [
      {
        q: 'Is this just for teachers, or can paraprofessionals participate too?',
        a: 'Paras are essential, and often overlooked in PD. TDI content is designed for all educators, including paraprofessionals, instructional aides, and support staff. Partner schools can include their full team.',
      },
      {
        q: 'Does TDI support all types of educators?',
        a: 'Yes. We work with elementary, middle, and high school teachers across all subjects. Our strategies are adaptable whether you teach kindergarten or AP Physics. We also support specialists, interventionists, and instructional coaches.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <main>
      {/* Hero with Parallax Image */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-fixed"
          style={{
            backgroundImage: 'url(/images/hero-faq.webp)',
            backgroundPosition: 'center 110%',
          }}
        />
        {/* Dark Overlay */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(30, 39, 73, 0.85)' }}
        />

        {/* Content */}
        <div className="container-default relative z-10 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Frequently Asked Questions
          </h1>
          <p className="max-w-2xl mx-auto text-lg" style={{ color: '#ffffff', opacity: 0.9 }}>
            Got questions? We've got answers. If you don't see what you're looking for, reach out. We're real people who actually respond.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default max-w-3xl">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-12 last:mb-0">
              {/* Category Header */}
              <h2
                className="text-xl font-bold mb-6 pb-2 border-b-2"
                style={{ color: '#1e2749', borderColor: '#ffba06' }}
              >
                {category.category}
              </h2>

              {/* Questions */}
              <div className="space-y-6">
                {category.questions.map((faq, faqIndex) => (
                  <details
                    key={faqIndex}
                    className="group rounded-lg border transition-all"
                    style={{ borderColor: '#e5e7eb' }}
                  >
                    <summary
                      className="flex items-center justify-between cursor-pointer p-4 font-semibold list-none"
                      style={{ color: '#1e2749' }}
                    >
                      <span className="pr-4">{faq.q}</span>
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-transform group-open:rotate-45"
                        style={{ backgroundColor: '#ffba06' }}
                      >
                        <svg className="w-4 h-4" fill="#1e2749" viewBox="0 0 24 24">
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                      </span>
                    </summary>
                    <div
                      className="px-4 pb-4 pt-2"
                      style={{ color: '#1e2749', opacity: 0.8 }}
                    >
                      <p>{faq.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="py-16" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-default text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#1e2749' }}>
            Still Have Questions?
          </h2>
          <p className="mb-8 max-w-xl mx-auto" style={{ color: '#1e2749', opacity: 0.7 }}>
            We're here to help. Reach out and a real human will get back to you within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover-glow"
              style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
            >
              Get in Touch
            </a>
            <a
              href="mailto:hello@teachersdeserveit.com"
              className="inline-block px-8 py-4 rounded-lg font-bold text-lg border-2 transition-all hover-lift"
              style={{ borderColor: '#1e2749', color: '#1e2749' }}
            >
              Email Us Directly
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
