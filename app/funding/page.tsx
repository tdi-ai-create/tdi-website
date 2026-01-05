import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Funding Options | Teachers Deserve It',
  description: '80% of schools we work with find over $35K in funding for TDI. We find the funding—you focus on your teachers.',
};

export default function FundingPage() {
  return (
    <main>
      {/* Hero with Parallax Image */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-fixed"
          style={{
            backgroundImage: 'url(/images/hero-funding.png)',
            backgroundPosition: 'center 100%',
          }}
        />
        {/* Dark Overlay */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(30, 39, 73, 0.85)' }}
        />

        {/* Content */}
        <div className="container-default relative z-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide mb-4" style={{ color: '#ffba06' }}>
            No Budget? No Problem.
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" style={{ color: '#ffffff' }}>
            We Find the Funding.<br />You Focus on Teaching.
          </h1>
          <p className="max-w-2xl mx-auto text-lg" style={{ color: '#ffffff', opacity: 0.9 }}>
            80% of schools we partner with find over $35K in funding for TDI.<br />Tell us about your school. We'll handle the rest.
          </p>
        </div>
      </section>

      {/* What You Do vs What We Do - Visual Comparison */}
      <section className="py-16" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12" style={{ color: '#1e2749' }}>
            Here's How Easy This Is
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* What You Do */}
            <div className="rounded-xl p-8 text-center" style={{ backgroundColor: '#f5f5f5' }}>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#e5e7eb' }}
              >
                <svg className="w-8 h-8" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#1e2749' }}>What You Do</h3>
              <ul className="space-y-3 text-left max-w-xs mx-auto">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="#22c55e" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span style={{ color: '#1e2749' }}>Tell us about your school</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="#22c55e" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span style={{ color: '#1e2749' }}>Say "yes" to the plan</span>
                </li>
              </ul>
              <p className="mt-6 text-sm font-semibold" style={{ color: '#22c55e' }}>That's it. Seriously.</p>
            </div>

            {/* What We Do */}
            <div className="rounded-xl p-8 text-center" style={{ backgroundColor: '#1e2749' }}>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#ffba06' }}
              >
                <svg className="w-8 h-8" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#ffffff' }}>What We Do</h3>
              <ul className="space-y-3 text-left max-w-xs mx-auto">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span style={{ color: '#ffffff' }}>Identify your funding options</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span style={{ color: '#ffffff' }}>Write the grant language</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span style={{ color: '#ffffff' }}>Prepare board proposals</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span style={{ color: '#ffffff' }}>Provide research citations</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span style={{ color: '#ffffff' }}>Support your application</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span style={{ color: '#ffffff' }}>Work with your timeline</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Clean and Simple */}
      <section className="py-12" style={{ backgroundColor: '#ffba06' }}>
        <div className="container-default">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-5xl md:text-6xl font-bold" style={{ color: '#1e2749' }}>80%</p>
              <p className="mt-2 font-medium" style={{ color: '#1e2749', opacity: 0.8 }}>find over $35K in funding</p>
            </div>
            <div>
              <p className="text-5xl md:text-6xl font-bold" style={{ color: '#1e2749' }}>$0</p>
              <p className="mt-2 font-medium" style={{ color: '#1e2749', opacity: 0.8 }}>to explore your options</p>
            </div>
            <div>
              <p className="text-5xl md:text-6xl font-bold" style={{ color: '#1e2749' }}>24hr</p>
              <p className="mt-2 font-medium" style={{ color: '#1e2749', opacity: 0.8 }}>response time</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process - Horizontal Flow */}
      <section className="py-16" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
            Three Steps. That's It.
          </h2>
          <p className="text-center mb-12" style={{ color: '#1e2749', opacity: 0.7 }}>
            From first call to funded partnership.
          </p>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold"
                  style={{ backgroundColor: '#1e2749', color: '#ffba06' }}
                >
                  1
                </div>
                {/* Arrow (hidden on mobile) */}
                <div className="hidden md:block absolute top-10 -right-3 w-6">
                  <svg fill="#ffba06" viewBox="0 0 24 24">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                  </svg>
                </div>
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Schedule a Call</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                15 minutes. Tell us about your school and goals.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold"
                  style={{ backgroundColor: '#1e2749', color: '#ffba06' }}
                >
                  2
                </div>
                {/* Arrow (hidden on mobile) */}
                <div className="hidden md:block absolute top-10 -right-3 w-6">
                  <svg fill="#ffba06" viewBox="0 0 24 24">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                  </svg>
                </div>
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>We Do the Research</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                We identify Title II, ESSER, state grants,<br />and other options.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold"
                style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
              >
                3
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>You Get Funded</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                We provide everything you need<br />to secure approval.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Line - Simple mention of funding types */}
      <section className="py-8" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-default text-center">
          <p className="font-semibold mb-2" style={{ color: '#1e2749' }}>Common funding sources we help with:</p>
          <p style={{ color: '#1e2749', opacity: 0.7 }}>
            Title II-A • Title I • ESSER/ARP • State Grants • Foundation Grants • General PD Budgets • Private & Public Funding Sources
          </p>
        </div>
      </section>

      {/* CTA - Standard Admin CTAs */}
      <section className="py-16" style={{ backgroundColor: '#1e2749' }}>
        <div className="container-default text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Ready to Find Your Funding?
          </h2>
          <p className="mb-8 max-w-xl mx-auto" style={{ color: '#ffffff', opacity: 0.8 }}>
            One conversation. No obligation. We'll tell you exactly what's possible for your school.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/free-pd-plan"
              className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover-glow"
              style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
            >
              Get Your Free PD Plan
            </a>
            <a
              href="/contact"
              className="inline-block px-8 py-4 rounded-lg font-bold text-lg border-2 transition-all hover-lift"
              style={{ borderColor: '#ffffff', color: '#ffffff' }}
            >
              Schedule a Call
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
