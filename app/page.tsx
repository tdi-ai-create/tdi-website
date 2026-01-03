import { Section, Container, Button, StatCard, TestimonialCard } from '@/components/ui';

const stats = [
  { number: '87,000+', label: 'educators in our community' },
  { number: '100+', label: 'hours of PD content' },
  { number: '21', label: 'states with TDI schools' },
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
    quote: "I used to spend weekends patching together PD plans. TDI gave us ready-to-use tools, real support, and content that hit exactly what our team needed. It saved me so much damn time.",
    author: "Melissa T.",
    role: "Assistant Superintendent",
    location: "NC",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <Section background="white" className="pt-16 md:pt-24">
        <Container>
          <div className="max-w-3xl">
            <h1 className="mb-6">Teachers Deserve More Than Survival</h1>
            <p className="text-xl mb-8" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
              Professional development that actually works—practical strategies, real support, and a community that gets it.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button href="https://tdi.thinkific.com" external>
                Explore the Learning Hub
              </Button>
              <Button href="/for-schools" variant="secondary">
                Bring TDI to Your School
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* Stats Section */}
      <Section background="peach">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <StatCard key={index} number={stat.number} label={stat.label} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Problem Section */}
      <Section background="white">
        <Container width="default">
          <h2 className="text-center mb-8">Traditional PD Is Broken</h2>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg mb-6">
              You've sat through the sit-and-get sessions. The ones where someone who hasn't been in a classroom in years reads PowerPoint slides at you. Meanwhile, you're drowning in grading, parent emails, and lesson plans—and somehow you're supposed to "implement with fidelity" by Monday.
            </p>
            <p className="text-lg font-semibold">
              Teachers deserve better. So do the leaders trying to support them.
            </p>
          </div>
        </Container>
      </Section>

      {/* Solution Section */}
      <Section background="white">
        <Container>
          <h2 className="text-center mb-4">PD That Meets You Where You Are</h2>
          <p className="text-center text-lg mb-12 max-w-2xl mx-auto" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
            Teachers Deserve It was born from burnout. Rae Hughart was that teacher—overwhelmed, exhausted, wondering if she'd make it to June. So she built something different.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="card">
              <h4 className="mb-3">Flipped PD Model</h4>
              <p className="text-base" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
                Learn on your schedule, not in a stuffy room. Come together for what matters.
              </p>
            </div>
            <div className="card">
              <h4 className="mb-3">Practical Strategies</h4>
              <p className="text-base" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
                Ideas you can use tomorrow, not someday. Every course includes ready-to-use tools.
              </p>
            </div>
            <div className="card">
              <h4 className="mb-3">Wellness Built In</h4>
              <p className="text-base" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
                Because you can't pour from an empty cup. We address the whole person.
              </p>
            </div>
            <div className="card">
              <h4 className="mb-3">Real Community</h4>
              <p className="text-base" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
                87,000+ educators who actually get it—the good days and the "crying in your car" days.
              </p>
            </div>
          </div>
          
          <p className="text-center mt-12 text-lg">
            <strong>For schools:</strong> Measurable outcomes, implementation support, and teachers who actually want to engage.
          </p>
        </Container>
      </Section>

      {/* Testimonials Section */}
      <Section background="peach">
        <Container>
          <h2 className="text-center mb-12">What Educators Are Saying</h2>
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

      {/* Final CTA Section */}
      <Section background="white">
        <Container width="default">
          <div className="text-center">
            <h2 className="mb-8">Ready to See What's Possible?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <div className="p-8 rounded-xl" style={{ backgroundColor: 'var(--tdi-peach)' }}>
                <h3 className="text-xl mb-4">For Teachers</h3>
                <p className="mb-6" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
                  Explore the Learning Hub for free tools, courses, and a community that gets it.
                </p>
                <Button href="https://tdi.thinkific.com" external>
                  Explore the Learning Hub
                </Button>
              </div>
              
              <div className="p-8 rounded-xl" style={{ backgroundColor: 'var(--tdi-peach)' }}>
                <h3 className="text-xl mb-4">For School Leaders</h3>
                <p className="mb-6" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
                  Bring TDI to your school with transparent pricing and implementation support.
                </p>
                <Button href="/for-schools/pricing" variant="secondary">
                  See School Pricing
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
