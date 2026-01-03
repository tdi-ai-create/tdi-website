import { Metadata } from 'next';
import { Section, Container, Button, StatCard } from '@/components/ui';

export const metadata: Metadata = {
  title: 'About',
  description: "TDI was founded by a burned-out teacher who asked: what if PD actually worked? Now serving 87,000+ educators in 21 states. Meet the team behind the movement.",
};

const stats = [
  { number: '38%', label: 'increase in strategy implementation' },
  { number: '95%', label: 'of teachers saved planning time' },
  { number: '87,000+', label: 'educators in our community' },
];

const values = [
  { emoji: '💪', text: 'Empowerment over overwhelm' },
  { emoji: '🎯', text: 'Strategy over survival' },
  { emoji: '👑', text: 'Leadership at every level' },
  { emoji: '💚', text: 'Wellness as non-negotiable' },
  { emoji: '✨', text: "Creativity that fits your time, not takes all of it" },
];

const team = [
  { name: 'Rae Hughart', role: 'CEO & Founder' },
  { name: 'Omar Garcia', role: 'CFO' },
  { name: 'Kristin Williams', role: 'CMO' },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <Section background="white" className="pt-16 md:pt-24">
        <Container width="default">
          <div className="text-center">
            <h1 className="mb-4">We Believe Teaching Shouldn't Feel Like Survival</h1>
            <p className="text-xl" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
              We're on a mission to build a system that actually supports the educators inside it.
            </p>
          </div>
        </Container>
      </Section>

      {/* Rae's Story */}
      <Section background="peach">
        <Container width="default">
          <h2 className="text-center mb-8">How It Started</h2>
          <div className="max-w-2xl mx-auto">
            <p className="text-lg mb-6">
              Teachers Deserve It was born from burnout.
            </p>
            <p className="text-lg mb-6">
              Rae Hughart was a passionate, high-performing educator—who was ready to walk away from the classroom. The system wasn't built to sustain passionate teachers. It was built to stretch them thin.
            </p>
            <p className="text-lg mb-6">
              So she started asking new questions:
            </p>
            <div className="pl-6 border-l-4 mb-6" style={{ borderColor: 'var(--tdi-yellow)' }}>
              <p className="text-lg italic mb-2">What if professional development didn't take up your entire weekend?</p>
              <p className="text-lg italic mb-2">What if creativity wasn't a luxury—but the norm?</p>
              <p className="text-lg italic">What if we gave teachers the tools they actually needed to thrive?</p>
            </div>
            <p className="text-lg mb-6">
              And what started as a personal mission quickly became a movement.
            </p>
            <p className="text-lg font-semibold">
              Today, TDI serves 87,000+ educators across 21 states, proving that teachers don't have to choose between doing great work and having a life.
            </p>
          </div>
        </Container>
      </Section>

      {/* Stats Section */}
      <Section background="white">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <StatCard key={index} number={stat.number} label={stat.label} />
            ))}
          </div>
          <p className="text-center mt-8" style={{ color: 'var(--tdi-charcoal)', opacity: 0.7 }}>
            Administrators report stronger morale, greater trust, and improved retention after TDI Support Sessions.
          </p>
        </Container>
      </Section>

      {/* Values Section */}
      <Section background="peach">
        <Container width="default">
          <h2 className="text-center mb-8">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {values.map((value, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-white rounded-lg">
                <span className="text-2xl">{value.emoji}</span>
                <span className="font-medium">{value.text}</span>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Team Section */}
      <Section background="white">
        <Container width="default">
          <h2 className="text-center mb-4">The Team Behind TDI</h2>
          <p className="text-center mb-12" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
            We're a diverse team of passionate professionals dedicated to supporting educators and enhancing the teaching experience.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div 
                  className="w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl"
                  style={{ backgroundColor: 'var(--tdi-peach)' }}
                >
                  👤
                </div>
                <h4 className="mb-1">{member.name}</h4>
                <p className="text-sm" style={{ color: 'var(--tdi-charcoal)', opacity: 0.7 }}>
                  {member.role}
                </p>
              </div>
            ))}
          </div>
          
          <p className="text-center mt-8 text-sm" style={{ color: 'var(--tdi-charcoal)', opacity: 0.7 }}>
            Plus content creators, district liaisons, and administrative support—all working toward one goal: helping teachers thrive.
          </p>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section background="peach">
        <Container width="default">
          <div className="text-center">
            <h2 className="mb-4">Want to See What TDI Can Do for Your School?</h2>
            <p className="text-lg mb-8" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
              Whether you're a teacher ready to take back your time or a district leader searching for sustainable PD that actually sticks—we're here to help.
            </p>
            <Button href="/contact">Contact the Team</Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
