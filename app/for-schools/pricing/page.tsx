import { Metadata } from 'next';
import { Section, Container, Button, PricingCard } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Transparent, phased pricing for school PD partnerships. IGNITE starts at ~$33,600/year. No hidden fees. See what\'s included.',
};

const pricingTiers = [
  {
    name: 'IGNITE',
    phase: 'Phase 1 — Leadership + Pilot Group',
    price: '~$33,600',
    description: 'Start with buy-in. Build momentum with leadership and a pilot group before full rollout.',
    features: [
      '2 On-Campus PD Days',
      '4 Virtual Strategy Sessions',
      '2 Executive Impact Sessions',
      'Learning Hub access for pilot group',
      'Leadership Dashboard',
      'Implementation support',
    ],
  },
  {
    name: 'ACCELERATE',
    phase: 'Phase 2 — Full Staff Rollout',
    price: '~$54,240',
    description: 'Expand to your entire staff with proven strategies and deeper support.',
    features: [
      'Everything in IGNITE',
      'Learning Hub for ALL staff',
      '6 Executive Impact Sessions',
      'Teachers Deserve It book per staff',
      'Expanded virtual support',
    ],
    featured: true,
  },
  {
    name: 'SUSTAIN',
    phase: 'Phase 3 — Embedded Systems',
    price: '~$84,240',
    description: 'Embed lasting change with advanced tools and ongoing support.',
    features: [
      'Everything in ACCELERATE',
      '12 Virtual PD Sessions',
      '4 Leadership Executive Sessions',
      'Desi AI Assistant',
      'Advanced analytics',
      'Priority support',
    ],
  },
];

const faqs = [
  {
    question: "What's the contract length?",
    answer: "Each phase is typically one school year. Schools can continue, pause, or move to the next phase based on results.",
  },
  {
    question: "Can we start with one school and expand?",
    answer: "Absolutely. Many districts pilot with one school before rolling out district-wide.",
  },
  {
    question: "Do you offer district-wide pricing?",
    answer: "Yes. District packages include volume discounts and centralized support. Schedule a call to discuss.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "Purchase orders, credit card, and ACH. We work with your procurement process.",
  },
  {
    question: "What if it doesn't work for our school?",
    answer: "We're confident in our model, which is why we start with a pilot group. If IGNITE doesn't show results, you're not locked into ACCELERATE.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero Section */}
      <Section background="white" className="pt-16 md:pt-24">
        <Container width="default">
          <div className="text-center">
            <h1 className="mb-4">Transparent Pricing for Schools</h1>
            <p className="text-xl" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
              No surprises. No hidden fees. A phased approach that grows with your school.
            </p>
          </div>
        </Container>
      </Section>

      {/* Pricing Model Explanation */}
      <Section background="pink">
        <Container width="default">
          <div className="text-center">
            <h2 className="mb-6">How Our Pricing Works</h2>
            <p className="text-lg mb-8">
              TDI uses a phased partnership model—not a one-and-done workshop. Start with leadership buy-in and a pilot group, then scale to full staff when you're ready. Each phase builds on the last.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl mb-2">1️⃣</div>
                <h4 className="mb-2">IGNITE</h4>
                <p className="text-sm" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
                  Awareness → Buy-in
                </p>
              </div>
              <div>
                <div className="text-4xl mb-2">2️⃣</div>
                <h4 className="mb-2">ACCELERATE</h4>
                <p className="text-sm" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
                  Buy-in → Action
                </p>
              </div>
              <div>
                <div className="text-4xl mb-2">3️⃣</div>
                <h4 className="mb-2">SUSTAIN</h4>
                <p className="text-sm" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
                  Action → Identity
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Pricing Tiers */}
      <Section background="white">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <PricingCard
                key={index}
                name={tier.name}
                phase={tier.phase}
                price={tier.price}
                description={tier.description}
                features={tier.features}
                featured={tier.featured}
              />
            ))}
          </div>
          <p className="text-center mt-8 text-sm" style={{ color: 'var(--tdi-charcoal)', opacity: 0.6 }}>
            *Pricing shown is for a typical 60-staff school. Includes fixed costs (visits, sessions, support) plus variable costs based on staff size ($180/person for Learning Hub access, $24/person for books).
          </p>
        </Container>
      </Section>

      {/* What's Included */}
      <Section background="pink">
        <Container width="default">
          <h2 className="text-center mb-8">What's Included in All Phases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--tdi-sage)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p>Access to Learning Hub (100+ hours of content)</p>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--tdi-sage)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p>Implementation support from day one</p>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--tdi-sage)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p>Progress tracking dashboard</p>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--tdi-sage)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p>Dedicated success manager</p>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--tdi-sage)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p>Personalized teacher feedback during visits</p>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--tdi-sage)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p>Ongoing virtual support</p>
            </div>
          </div>
        </Container>
      </Section>

      {/* FAQ Section */}
      <Section background="white">
        <Container width="default">
          <h2 className="text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="card">
                <h4 className="mb-2">{faq.question}</h4>
                <p style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Final CTA Section */}
      <Section background="pink">
        <Container width="default">
          <div className="text-center">
            <h2 className="mb-4">Not Sure Which Phase Is Right for Your School?</h2>
            <p className="text-lg mb-8" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
              Let's talk through your goals, staff size, and timeline. No pressure—just a conversation to see if TDI is the right fit.
            </p>
            <Button href="/for-schools/schedule-call">Schedule a Call</Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
