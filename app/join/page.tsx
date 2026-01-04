import Link from 'next/link';

export default function JoinPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="section" style={{ backgroundColor: 'var(--tdi-navy)' }}>
        <div className="container-default text-center">
          <h1 className="mb-4" style={{ color: 'white' }}>Join the Movement</h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: 'white', opacity: 0.9 }}>
            Find your path — whether you're a teacher looking for support or a leader building a healthier school.
          </p>
        </div>
      </section>

      {/* Free Ways to Get Started */}
      <section className="section bg-white">
        <div className="container-default">
          <h2 className="text-center mb-4">Free Ways to Get Started</h2>
          <p className="text-center mb-12" style={{ opacity: 0.7 }}>
            No commitment. Just value.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <a 
              href="https://raehughart.substack.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="card hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl mb-3">Weekly Strategies in Your Inbox</h3>
              <p style={{ opacity: 0.7 }}>
                3x/week, practical ideas you can use immediately. Join 87,000+ educators already getting them.
              </p>
              <span className="inline-block mt-4 font-semibold" style={{ color: 'var(--tdi-teal)' }}>
                Read the latest →
              </span>
            </a>

            <a 
              href="https://podcasts.apple.com/us/podcast/sustainable-teaching-with-rae-hughart/id1792030274" 
              target="_blank" 
              rel="noopener noreferrer"
              className="card hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl mb-3">Listen While You Commute</h3>
              <p style={{ opacity: 0.7 }}>
                The Teachers Deserve It podcast — real talk about sustainable teaching from people who get it.
              </p>
              <span className="inline-block mt-4 font-semibold" style={{ color: 'var(--tdi-teal)' }}>
                Start listening →
              </span>
            </a>

            <Link href="/resources" className="card hover:shadow-lg transition-shadow">
              <h3 className="text-xl mb-3">Grab a Free Resource</h3>
              <p style={{ opacity: 0.7 }}>
                Ready-to-use downloads for your classroom — for teachers and paras alike.
              </p>
              <span className="inline-block mt-4 font-semibold" style={{ color: 'var(--tdi-teal)' }}>
                Browse downloads →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* For Teachers */}
      <section className="section" style={{ backgroundColor: 'var(--tdi-peach)' }}>
        <div className="container-default">
          <h2 className="text-center mb-4">For Teachers</h2>
          <p className="text-center mb-12" style={{ opacity: 0.7 }}>
            PD that respects your time and actually helps.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <a 
              href="https://tdi.thinkific.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="card hover:shadow-lg transition-shadow"
              style={{ borderTop: '4px solid var(--tdi-coral)' }}
            >
              <h3 className="text-xl mb-3">Learning Hub All-Access</h3>
              <p className="mb-4" style={{ opacity: 0.7 }}>
                100+ hours of on-demand PD. Bite-sized videos you can finish in one sitting. Strategies you'll actually use Monday morning.
              </p>
              <span className="inline-block font-semibold" style={{ color: 'var(--tdi-coral)' }}>
                Explore the Learning Hub →
              </span>
            </a>

            <a 
              href="https://raehughart.substack.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="card hover:shadow-lg transition-shadow"
              style={{ borderTop: '4px solid var(--tdi-coral)' }}
            >
              <h3 className="text-xl mb-3">Go Deeper with Exclusive Content</h3>
              <p className="mb-4" style={{ opacity: 0.7 }}>
                Premium strategies, behind-the-scenes access, and a community of educators who are done settling for the status quo.
              </p>
              <span className="inline-block font-semibold" style={{ color: 'var(--tdi-coral)' }}>
                See premium options →
              </span>
            </a>
          </div>

          {/* Request for Your School */}
          <div className="mt-12 text-center">
            <p className="mb-4" style={{ opacity: 0.7 }}>
              Love what you see? Think your whole school could benefit?
            </p>
            <Link 
              href="/for-schools/request" 
              className="btn-secondary inline-block"
            >
              Request TDI for Your School
            </Link>
          </div>
        </div>
      </section>

      {/* For School Leaders */}
      <section className="section bg-white">
        <div className="container-default">
          <h2 className="text-center mb-4">For School Leaders</h2>
          <p className="text-center mb-12" style={{ opacity: 0.7 }}>
            Support your whole building — teachers and paraprofessionals — with PD they'll actually use.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Link 
              href="/for-schools" 
              className="card hover:shadow-lg transition-shadow"
              style={{ borderTop: '4px solid var(--tdi-teal)' }}
            >
              <h3 className="text-xl mb-3">Bring TDI to Your Team</h3>
              <p className="mb-4" style={{ opacity: 0.7 }}>
                PD your teachers will thank you for. Implementation support from day one. Outcomes you can measure and report.
              </p>
              <span className="inline-block font-semibold" style={{ color: 'var(--tdi-teal)' }}>
                Learn about partnerships →
              </span>
            </Link>

            <Link 
              href="/calculator" 
              className="card hover:shadow-lg transition-shadow"
              style={{ borderTop: '4px solid var(--tdi-teal)' }}
            >
              <h3 className="text-xl mb-3">See What's Possible</h3>
              <p className="mb-4" style={{ opacity: 0.7 }}>
                Try the impact calculator. Input your school's current state and see projected improvements in budget, morale, and outcomes.
              </p>
              <span className="inline-block font-semibold" style={{ color: 'var(--tdi-teal)' }}>
                Try the calculator →
              </span>
            </Link>

            <Link 
              href="/for-schools/schedule-call" 
              className="card hover:shadow-lg transition-shadow"
              style={{ borderTop: '4px solid var(--tdi-teal)' }}
            >
              <h3 className="text-xl mb-3">Let's Talk</h3>
              <p className="mb-4" style={{ opacity: 0.7 }}>
                Schedule a conversation with our team. No pitch, no pressure — just a real discussion about what your school needs.
              </p>
              <span className="inline-block font-semibold" style={{ color: 'var(--tdi-teal)' }}>
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
