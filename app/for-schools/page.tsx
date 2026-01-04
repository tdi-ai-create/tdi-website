import { Metadata } from 'next';
import { Section, Container, Button, StatCard, TestimonialCard, PricingCard } from '@/components/ui';

export const metadata: Metadata = {
  title: 'For Schools',
  description: 'Professional development with measurable outcomes. Track engagement, reduce burnout, improve retention. Phased pricing starting at ~$33,600/year.',
};

const stats = [
  { number: '38%', label: 'increase in strategy implementation' },
  { number: '95%', label: 'of teachers said TDI saved them planning time' },
  { number: '21', label: 'states with TDI partner schools' },
];

const testimonials = [
  {
    quote: "This isn't sit-and-get. Our teachers are actually learning how to work smarter and feel better doing it. I don't have to babysit.",
    author: "Lisa M.",
    role: "K-8 School Director",
    location: "WA",
  },
  {
    quote: "Before, we got eye rolls. Now, we hear: 'When's the team coming next?' That's the clearest sign to me that we're finally doing PD right.",
    author: "Daniel R.",
    role: "High School Principal",
    location: "CA",
  },
  {
    quote: "TDI didn't just drop a slide deck and bounce. Every part of the experience felt personal. Our staff felt understood, and I finally felt like I wasn't on an island trying to figure this out alone.",
    author: "Julie H.",
    role: "Principal",
    location: "MI",
  },
];

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

export default function ForSchoolsPage() {
  return (
    <>
      {/* Hero Section */}
      <Section background="white" className="pt-16 md:pt-24">
        <Container>
          <div className="max-w-3xl">
            <h1 className="mb-6">Give Your Teachers What They Deserve</h1>
            <p className="text-xl mb-8" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
              Professional development that actually works—with outcomes you can measure and report.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button href="/for-schools/pricing">See Pricing</Button>
              <Button href="/for-schools/schedule-call" variant="secondary">
                Schedule a Call
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* Problem Section */}
      <Section background="pink">
        <Container width="default">
          <h2 className="text-center mb-8">You Already Know Traditional PD Isn't Working</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <span className="text-2xl">😒</span>
              <p><strong>Teachers dread it.</strong> The eye rolls start before the session does.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <p><strong>No measurable outcomes.</strong> You can't prove ROI to your board.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚪</span>
              <p><strong>Burnout is driving turnover.</strong> You're losing good teachers faster than you can hire.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">☁️</span>
              <p><strong>Wellness programs feel "fluffy."</strong> No data, no accountability, no change.</p>
            </div>
          </div>
          <p className="text-center mt-8 text-lg font-semibold">
            You need something different. So do your teachers.
          </p>
        </Container>
      </Section>

      {/* Solution Section */}
      <Section background="white">
        <Container>
          <h2 className="text-center mb-12">What Schools Get with TDI</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card">
              <h4 className="mb-3">On-Demand + Live PD Hybrid</h4>
              <p style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
                Teachers learn on their schedule. Come together for what matters: discussion, practice, implementation.
              </p>
            </div>
            <div className="card">
              <h4 className="mb-3">Measurable Outcomes Dashboard</h4>
              <p style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
                Track engagement, completion, and implementation rates. Report real data to your board—not attendance sheets.
              </p>
            </div>
            <div className="card">
              <h4 className="mb-3">Personalized Teacher Feedback</h4>
              <p style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
                Every teacher receives direct, personalized feedback during visits—positive, uplifting, and connected to solutions.
              </p>
            </div>
            <div className="card">
              <h4 className="mb-3">Wellness That Ties to Retention</h4>
              <p style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
                Address burnout before it becomes a resignation letter. Teachers who feel supported stay longer.
              </p>
            </div>
            <div className="card">
              <h4 className="mb-3">Implementation Support from Day One</h4>
              <p style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
                We don't just hand you a login. Dedicated support to ensure your teachers actually use and benefit from the platform.
              </p>
            </div>
            <div className="card">
              <h4 className="mb-3">Phased Approach</h4>
              <p style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
                Start with leadership and a pilot group. Scale to full staff when you're ready. No giant leap required.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Stats Section */}
      <Section background="pink">
        <Container>
          <h2 className="text-center mb-12">Results Schools Are Seeing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <StatCard key={index} number={stat.number} label={stat.label} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Who It's For Section */}
      <Section background="white">
        <Container>
          <h2 className="text-center mb-12">Built for Every Leader in the Building</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card text-center">
              <div className="text-4xl mb-4">👩‍💼</div>
              <h4 className="mb-2">Principals</h4>
              <p className="text-sm" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
                Looking for PD your teachers won't dread? Something you can actually see working in classrooms?
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🏛️</div>
              <h4 className="mb-2">Superintendents</h4>
              <p className="text-sm" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
                Need district-wide scale, board-ready outcomes, and budget flexibility?
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">📚</div>
              <h4 className="mb-2">Curriculum Directors</h4>
              <p className="text-sm" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
                Want PD that integrates with your existing initiatives and shows measurable implementation?
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">❤️</div>
              <h4 className="mb-2">HR Directors</h4>
              <p className="text-sm" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
                Focused on retention and wellness? Looking for data that ties teacher support to turnover reduction?
              </p>
            </div>
          </div>
          <p className="text-center mt-8 text-lg">
            All paths lead to the same place: a call with our team to find the right fit.
          </p>
        </Container>
      </Section>

      {/* Testimonials Section */}
      <Section background="pink">
        <Container>
          <h2 className="text-center mb-12">What School Leaders Are Saying</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                quote={testimonial.quote}
                author={testimonial.author}
                role={testimonial.role}
                location={testimonial.location}
              />
            ))}
          </div>
        </Container>
      </Section>

      {/* Pricing Preview Section */}
      <Section background="white">
        <Container>
          <div className="text-center mb-12">
            <h2 className="mb-4">Transparent Pricing for Schools</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
              We don't hide our pricing behind a sales call. Our phased approach grows with your school—start with leadership and a pilot group, then expand when you're ready.
            </p>
          </div>
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
            *Pricing shown is for a typical 60-staff school. Varies based on staff size and customization.
          </p>
        </Container>
      </Section>

      {/* Final CTA Section */}
      <Section background="pink">
        <Container width="default">
          <div className="text-center">
            <h2 className="mb-4">Ready to See What TDI Can Do for Your School?</h2>
            <p className="text-lg mb-8" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
              Let's talk through your goals, staff size, and timeline. No pressure—just a conversation.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button href="/for-schools/schedule-call">Schedule a Call</Button>
              <Button href="/for-schools/pricing" variant="secondary">
                See Full Pricing Details
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
