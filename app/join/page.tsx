'use client';

import Link from 'next/link';

export default function JoinPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section with Parallax */}
      <section className="relative h-[400px] md:h-[450px] overflow-hidden">
        {/* Parallax Background Image */}
        <div
          className="absolute inset-0 parallax-bg"
          style={{
            backgroundImage: "url('/images/hero-join.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          }}
        />

        {/* Navy Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(30, 39, 73, 0.75) 0%, rgba(30, 39, 73, 0.85) 100%)'
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center px-4 max-w-3xl mx-auto">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              style={{ color: '#ffffff' }}
            >
              Join the Movement
            </h1>
            <p
              className="text-lg md:text-xl"
              style={{ color: '#ffffff', opacity: 0.9 }}
            >
              Find your path. Whether you're a teacher looking for support or a leader building a healthier school, we're here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Free Ways to Get Started */}
      <section className="section bg-white">
        <div className="container-default">
          <h2 className="text-center mb-2">Free Ways to Get Started</h2>
          <p className="text-center mb-12" style={{ opacity: 0.6 }}>
            No commitment. Just value.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">

            {/* Card 1: Blog/Newsletter - Light Yellow */}
            <a
              href="https://raehughart.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center group"
            >
              <div
                className="w-full h-[280px] rounded-3xl flex items-center justify-center p-8 transition-transform group-hover:scale-105"
                style={{ backgroundColor: '#FEF3C7' }}
              >
                <h3
                  className="text-xl md:text-2xl font-bold text-center uppercase tracking-wide"
                  style={{ color: '#1e2749' }}
                >
                  Weekly Strategies in Your Inbox
                </h3>
              </div>
              <p className="mt-4 text-center text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                3x/week, practical ideas you can use immediately. Join 87,000+ educators.
              </p>
            </a>

            {/* Card 2: Podcast - Yellow */}
            <a
              href="https://podcasts.apple.com/us/podcast/sustainable-teaching-with-rae-hughart/id1792030274"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center group"
            >
              <div
                className="w-full h-[280px] rounded-3xl flex items-center justify-center p-8 transition-transform group-hover:scale-105"
                style={{ backgroundColor: '#ffba06' }}
              >
                <h3
                  className="text-xl md:text-2xl font-bold text-center uppercase tracking-wide"
                  style={{ color: '#1e2749' }}
                >
                  Listen While You Commute
                </h3>
              </div>
              <p className="mt-4 text-center text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                The Sustainable Teaching podcast. Real talk from people who get it.
              </p>
            </a>

            {/* Card 3: Free Resources - Lightest Yellow */}
            <a
              href="/resources"
              className="flex flex-col items-center group"
            >
              <div
                className="w-full h-[280px] rounded-3xl flex items-center justify-center p-8 transition-transform group-hover:scale-105"
                style={{ backgroundColor: '#FEF9E7' }}
              >
                <h3
                  className="text-xl md:text-2xl font-bold text-center uppercase tracking-wide"
                  style={{ color: '#1e2749' }}
                >
                  Grab Your Ready to Use Free Resource
                </h3>
              </div>
              <p className="mt-4 text-center text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Ready-to-use downloads for teachers and paras alike.
              </p>
            </a>

          </div>
        </div>
      </section>

      {/* For Teachers & Paraprofessionals */}
      <section className="section" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-default">
          <h2 className="text-center mb-2">For Teachers & Paraprofessionals</h2>
          <p className="text-center mb-12" style={{ opacity: 0.6 }}>
            PD that respects your time and actually helps.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

            {/* Card 1: Go Deeper */}
            <a
              href="https://raehughart.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              style={{ borderTop: '4px solid #F96767' }}
            >
              <h3
                className="text-xl font-bold mb-3 underline"
                style={{ color: '#1e2749' }}
              >
                Go Deeper with Exclusive Content
              </h3>
              <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
                Premium strategies, behind-the-scenes access, and a community of educators who are done settling for the status quo.
              </p>
              <span className="font-semibold text-sm" style={{ color: '#F96767' }}>
                See premium options →
              </span>
            </a>

            {/* Card 2: Learning Hub */}
            <a
              href="https://tdi.thinkific.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              style={{ borderTop: '4px solid #F96767' }}
            >
              <h3
                className="text-xl font-bold mb-3"
                style={{ color: '#1e2749' }}
              >
                Learning Hub All-Access
              </h3>
              <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
                100+ hours of on-demand PD. Bite-sized videos you can finish in one sitting. Strategies you'll actually use Monday morning.
              </p>
              <span className="font-semibold text-sm" style={{ color: '#F96767' }}>
                Explore the Learning Hub →
              </span>
            </a>

          </div>

          {/* Request for School CTA */}
          <div className="mt-12 text-center">
            <p className="mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
              Love what you see? Think your whole school could benefit?
            </p>
            <a
              href="/for-schools/request"
              className="inline-block px-6 py-3 rounded-lg font-semibold border-2 transition-all hover:bg-gray-100"
              style={{ borderColor: '#1e2749', color: '#1e2749' }}
            >
              Request TDI for Your School
            </a>
          </div>
        </div>
      </section>

      {/* For School Leaders */}
      <section className="section bg-white">
        <div className="container-default">
          <h2 className="text-center mb-4">For School Leaders</h2>
          <p className="text-center mb-12" style={{ opacity: 0.7 }}>
            Support your whole building, teachers and paraprofessionals, with PD they'll actually use.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Link 
              href="/for-schools" 
              className="card hover:shadow-lg transition-shadow"
              style={{ borderTop: '4px solid var(--tdi-navy)' }}
            >
              <h3 className="text-xl mb-3">Bring TDI to Your Team</h3>
              <p className="mb-4" style={{ opacity: 0.7 }}>
                PD your teachers will thank you for. Implementation support from day one. Outcomes you can measure and report.
              </p>
              <span className="inline-block font-semibold" style={{ color: 'var(--tdi-navy)' }}>
                Learn about partnerships →
              </span>
            </Link>

            <Link 
              href="/calculator" 
              className="card hover:shadow-lg transition-shadow"
              style={{ borderTop: '4px solid var(--tdi-navy)' }}
            >
              <h3 className="text-xl mb-3">See What's Possible</h3>
              <p className="mb-4" style={{ opacity: 0.7 }}>
                Try the impact calculator. Input your school's current state and see projected improvements in budget, morale, and outcomes.
              </p>
              <span className="inline-block font-semibold" style={{ color: 'var(--tdi-navy)' }}>
                Try the calculator →
              </span>
            </Link>

            <Link 
              href="/for-schools/schedule-call" 
              className="card hover:shadow-lg transition-shadow"
              style={{ borderTop: '4px solid var(--tdi-navy)' }}
            >
              <h3 className="text-xl mb-3">Let's Talk</h3>
              <p className="mb-4" style={{ opacity: 0.7 }}>
                Schedule a conversation with our team. No pitch, no pressure. Just a real discussion about what your school needs.
              </p>
              <span className="inline-block font-semibold" style={{ color: 'var(--tdi-navy)' }}>
                Schedule a conversation →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Funding Callout */}
      <section className="section" style={{ backgroundColor: 'var(--tdi-yellow)' }}>
        <div className="container-default text-center">
          <h2 className="mb-4">Think You Don't Have Budget?</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto" style={{ opacity: 0.8 }}>
            80% of schools we work with secure external funds to cover PD. We help you find the funding and draft the language.
          </p>
          <Link href="/funding" className="btn-primary inline-block">
            See How Funding Works
          </Link>
        </div>
      </section>
    </main>
  );
}
