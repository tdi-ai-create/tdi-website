import { Metadata } from 'next';
import { Section, Container, Button, StatCard } from '@/components/ui';

export const metadata: Metadata = {
  title: 'What We Offer',
  description: '100+ hours of on-demand PD, practical strategies, and wellness support. Built by teachers, for teachers. Explore free tools or bring TDI to your school.',
};

const features = [
  {
    title: '100+ Hours of On-Demand PD',
    description: 'Watch when it works for you. No subs needed. No after-school sessions.',
    icon: '📚',
  },
  {
    title: 'Practical, Ready-to-Use Strategies',
    description: "Every course includes tools you can implement tomorrow—not 'someday.'",
    icon: '🛠️',
  },
  {
    title: 'Wellness & Sustainability Focus',
    description: "Because burned-out teachers can't give their best. We address the whole person, not just the pedagogy.",
    icon: '💚',
  },
  {
    title: 'A Community That Gets It',
    description: "Connect with 87,000+ educators who understand the good days and the 'crying in your car' days.",
    icon: '🤝',
  },
  {
    title: 'Free Tools to Start',
    description: 'Explore free resources before you commit to anything.',
    icon: '🎁',
  },
];

const stats = [
  { number: '38%', label: 'increase in strategy implementation' },
  { number: '95%', label: 'of teachers report time savings' },
  { number: '87,000+', label: 'educators in the community' },
];

export default function WhatWeOfferPage() {
  return (
    <>
      {/* Hero Section */}
      <Section background="white" className="pt-16 md:pt-24">
        <Container width="default">
          <div className="text-center">
            <h1 className="mb-4">Professional Development That Respects Your Time</h1>
            <p className="text-xl mb-8" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
              On-demand courses, practical strategies, and a community of 87,000+ educators—all built by teachers who've been in your shoes.
            </p>
            <Button href="https://tdi.thinkific.com" external>
              Explore the Learning Hub
            </Button>
          </div>
        </Container>
      </Section>

      {/* What You Get Section */}
      <Section background="pink">
        <Container>
          <h2 className="text-center mb-12">Inside the Learning Hub</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="mb-3">{feature.title}</h4>
                <p style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* The TDI Approach */}
      <Section background="white">
        <Container width="default">
          <h2 className="text-center mb-8">This Isn't Sit-and-Get</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="p-6 rounded-xl" style={{ backgroundColor: '#fee2e2' }}>
              <h4 className="mb-3">Traditional PD</h4>
              <p style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
                Someone talks at you for 6 hours. You forget everything by Monday. Maybe there's stale coffee.
              </p>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: '#dcfce7' }}>
              <h4 className="mb-3">TDI's Flipped Model</h4>
              <p style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
                Learn on your own time. Come together to discuss, practice, and actually implement. No wasted hours.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Stats Section */}
      <Section background="pink">
        <Container>
          <h2 className="text-center mb-12">Results Educators Are Seeing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <StatCard key={index} number={stat.number} label={stat.label} />
            ))}
          </div>
        </Container>
      </Section>

      {/* For Schools Teaser */}
      <Section background="white">
        <Container width="default">
          <div className="text-center">
            <h2 className="mb-4">Want TDI for Your Whole School?</h2>
            <p className="text-lg mb-8" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
              We partner with schools and districts to bring sustainable PD at scale—with implementation support, progress tracking, and outcomes you can report to your board.
            </p>
            <Button href="/for-schools" variant="secondary">
              See School Partnership Options
            </Button>
          </div>
        </Container>
      </Section>

      {/* Final CTA */}
      <Section background="pink">
        <Container width="default">
          <div className="text-center">
            <h2 className="mb-8">Ready to Explore?</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Button href="https://tdi.thinkific.com/collections/downloads" external>
                Start with Free Tools
              </Button>
              <Button href="https://tdi.thinkific.com" external variant="secondary">
                Browse All Courses
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
