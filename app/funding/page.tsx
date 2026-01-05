import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Funding Options | Teachers Deserve It',
  description: 'Discover how 80% of schools fund TDI professional development through grants like Title II, ESSER, and state-specific opportunities.',
};

const fundingSources = [
  {
    name: 'Title II-A',
    description: 'Federal funds specifically designated for improving teacher quality and professional development.',
    bestFor: 'All schools',
    typical: '$5,000 - $50,000+',
  },
  {
    name: 'ESSER / ARP',
    description: 'COVID relief funds that can be used for teacher support, retention initiatives, and PD through 2024.',
    bestFor: 'Schools with remaining ESSER allocation',
    typical: 'Varies widely',
  },
  {
    name: 'Title I',
    description: 'Schools with high percentages of low-income students can use these funds for staff development.',
    bestFor: 'Title I schools',
    typical: '$10,000 - $100,000+',
  },
  {
    name: 'State-Specific Grants',
    description: 'Many states offer dedicated PD funding, teacher retention grants, or innovation funds.',
    bestFor: 'Varies by state',
    typical: '$2,500 - $25,000',
  },
  {
    name: 'Foundation Grants',
    description: 'Local education foundations and community organizations often fund teacher development initiatives.',
    bestFor: 'Community-connected schools',
    typical: '$1,000 - $10,000',
  },
  {
    name: 'General Fund / PD Budget',
    description: 'Your existing professional development allocation—TDI often costs less than traditional PD.',
    bestFor: 'All schools',
    typical: 'Existing budget',
  },
];

export default function FundingPage() {
  return (
    <main>
      {/* Hero with Parallax Image */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: 'url(/images/hero-funding.png)',
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
            Funding Your PD Shouldn't Be This Hard
          </h1>
          <p className="max-w-2xl mx-auto text-lg" style={{ color: '#ffffff', opacity: 0.9 }}>
            80% of the schools we work with secure external funding for TDI. We'll help you find yours.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: '#1e2749' }}>
            Cost Should Never Stop a School
          </h2>
          <p className="text-lg mb-4" style={{ color: '#1e2749', opacity: 0.8 }}>
            We've heard it too many times: "We'd love to work with TDI, but we just don't have the budget."
          </p>
          <p className="text-lg" style={{ color: '#1e2749', opacity: 0.8 }}>
            Here's the truth: the money is often already there. It's just buried in grant applications, federal allocations, and funding streams you might not know about. That's where we come in.
          </p>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-12" style={{ backgroundColor: '#1e2749' }}>
        <div className="container-default">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold" style={{ color: '#ffba06' }}>80%</p>
              <p className="mt-2" style={{ color: '#ffffff', opacity: 0.8 }}>of partner schools secure external funding</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold" style={{ color: '#ffba06' }}>$0</p>
              <p className="mt-2" style={{ color: '#ffffff', opacity: 0.8 }}>cost to explore funding options with us</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold" style={{ color: '#ffba06' }}>100%</p>
              <p className="mt-2" style={{ color: '#ffffff', opacity: 0.8 }}>of the paperwork headache—we help</p>
            </div>
          </div>
        </div>
      </section>

      {/* Funding Sources */}
      <section className="py-16" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-default">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#1e2749' }}>
              Common Funding Sources
            </h2>
            <p className="max-w-2xl mx-auto" style={{ color: '#1e2749', opacity: 0.7 }}>
              These are the most common ways schools fund TDI partnerships. Not sure which applies to you? We'll figure it out together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {fundingSources.map((source, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                style={{ border: '1px solid #e5e7eb' }}
              >
                <h3 className="text-lg font-bold mb-2" style={{ color: '#1e2749' }}>
                  {source.name}
                </h3>
                <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
                  {source.description}
                </p>
                <div className="pt-4 border-t" style={{ borderColor: '#e5e7eb' }}>
                  <p className="text-xs" style={{ color: '#1e2749', opacity: 0.5 }}>
                    <span className="font-semibold">Best for:</span> {source.bestFor}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#1e2749', opacity: 0.5 }}>
                    <span className="font-semibold">Typical range:</span> {source.typical}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Help */}
      <section className="py-16" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#1e2749' }}>
              We Do the Heavy Lifting
            </h2>
            <p style={{ color: '#1e2749', opacity: 0.7 }}>
              You've got enough on your plate. Here's how we help with funding:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#ffba06' }}
              >
                <span className="font-bold" style={{ color: '#1e2749' }}>1</span>
              </div>
              <div>
                <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Identify Your Options</h3>
                <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                  We review your school's profile and identify which funding sources you're eligible for.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#ffba06' }}
              >
                <span className="font-bold" style={{ color: '#1e2749' }}>2</span>
              </div>
              <div>
                <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Provide Documentation</h3>
                <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                  Need a proposal for your board? Grant language for an application? We've got templates ready.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#ffba06' }}
              >
                <span className="font-bold" style={{ color: '#1e2749' }}>3</span>
              </div>
              <div>
                <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Support Your Application</h3>
                <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                  We'll review your grant application, provide research citations, and help you make the case.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#ffba06' }}
              >
                <span className="font-bold" style={{ color: '#1e2749' }}>4</span>
              </div>
              <div>
                <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Flexible Timing</h3>
                <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                  Funding cycles don't always align with school years. We work with your timeline.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16" style={{ backgroundColor: '#1e2749' }}>
        <div className="container-default text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Let's Find Your Funding
          </h2>
          <p className="mb-8 max-w-xl mx-auto" style={{ color: '#ffffff', opacity: 0.8 }}>
            Schedule a free call and we'll help you identify the best funding options for your school. No obligation, no pressure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover-glow"
              style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
            >
              Schedule a Funding Call
            </a>
            <a
              href="/for-schools"
              className="inline-block px-8 py-4 rounded-lg font-bold text-lg border-2 transition-all hover-lift"
              style={{ borderColor: '#ffffff', color: '#ffffff' }}
            >
              Learn About Partnerships
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
