import { Metadata } from 'next';
import TeamStrip from '@/components/TeamStrip';

export const metadata: Metadata = {
  title: 'FAQ',
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
    category: 'For School Leaders',
    questions: [
      {
        q: 'What are the ways a school can work with TDI?',
        a: 'Four, and they build on each other. The Pulse is a steady signal on how your staff are really doing, and what to do about it. The Focus takes one priority and works it properly, with leadership sessions built in. The Cohort moves a group of your educators through the same work together. The Blueprint is the full build: everything above, across the whole staff, for the year.',
      },
      {
        q: 'What does a partnership actually include?',
        a: 'Learning Hub access for the staff you enroll, live sessions with our team, a dashboard showing what your people are actually doing rather than who signed in, and classroom observation notes written back to your teachers by name. How much of each you get is what separates the four.',
      },
      {
        q: 'How much does a partnership cost?',
        a: 'Partnerships start at 2.5k. Where you land above that depends on how many staff you are bringing in and which of the four fits, so we quote it after one conversation rather than guessing on a webpage.',
      },
      {
        q: 'How do we know which one is right for us?',
        a: 'It usually comes down to two things: how many people you are trying to reach, and whether you already know what you want to fix. If you know the problem, start at The Focus. If you are still working out where the pressure actually is, start with The Pulse.',
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
        a: 'That\'s up to you. Courses are broken into 3-5 minute sections, so you can take one on a lunch break, a planning period, or the drive home and stop whenever you need to. Partner schools get structured implementation time built into their PD calendar. No Saturdays required.',
      },
    ],
  },
  {
    category: 'Getting Support',
    questions: [
      {
        q: 'What if my admin won\'t support it?',
        a: 'We can help with that. TDI gives you things worth forwarding: the partner dashboard showing what staff are actually doing, observation notes written back to teachers by name, and case studies from schools already doing this. Many administrators become our biggest advocates once they see teachers using what they learn.',
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
        a: 'Individual teachers can access free resources through our blog, plus affordable courses in the Learning Hub. For schools, partnerships start at 2.5k, and where you land above that depends on your staff size and which of the four ways of working fits. We believe cost should never be the reason a school can\'t support its teachers.',
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

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.flatMap(category =>
    category.questions.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a,
      },
    }))
  ),
};

export default function FAQPage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
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

      {/* Team Strip */}
      <section style={{ backgroundColor: '#F0FAF6', borderTop: '0.5px solid #D4EDE0', borderBottom: '0.5px solid #D4EDE0' }}>
        <div className="container-default">
          <TeamStrip
            members={[
              { type: 'team', name: 'Jim Ford', imageSlug: 'jim-ford', isHuman: true },
              { type: 'team', name: 'Holly Scott', imageSlug: 'holly-scott' },
              { type: 'team', name: 'Kristin Williams', imageSlug: 'kristin-williams', isHuman: true },
              { type: 'team', name: 'Olivia Smith', imageSlug: 'olivia-smith' },
              { type: 'team', name: 'Dr. Maya Johnson', imageSlug: 'maya-johnson' },
              { type: 'team', name: 'Nora Reeves', imageSlug: 'nora-reeves' },
            ]}
            copy="Real people behind every answer. Our team responds within 24 hours."
          />
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
          <div className="flex flex-col items-center gap-4">
            <a
              href="/get-started"
              className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover-glow"
              style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
            >
              Get Your Free PD Plan
            </a>
            <p style={{ color: '#1e2749', opacity: 0.7 }}>
              Or email us at{' '}
              <a
                href="mailto:hello@teachersdeserveit.com"
                className="underline font-semibold"
                style={{ color: '#1e2749' }}
              >
                hello@teachersdeserveit.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
