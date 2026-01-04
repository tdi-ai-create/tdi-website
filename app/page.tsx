import Link from 'next/link';
import { TDICalculator } from '@/components/calculators';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="section bg-white">
        <div className="container-wide">
          <h1 className="mb-6 max-w-4xl">
            Teachers Deserve More Than Survival
          </h1>
          <p className="text-xl mb-8 max-w-2xl" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
            You became a teacher to make a difference. Not to drown in lesson plans, sit through pointless PD, and count down to summer. We get it. We've been there.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://tdi.thinkific.com"
              className="btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore the Learning Hub
            </a>
            <Link href="/for-schools" className="btn-secondary">
              Bring TDI to Your School
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="section py-12" style={{ backgroundColor: 'var(--tdi-yellow)' }}>
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold mb-2" style={{ color: 'var(--tdi-charcoal)' }}>87,000+</p>
              <p style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>educators in our community</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2" style={{ color: 'var(--tdi-charcoal)' }}>100+</p>
              <p style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>hours of on-demand PD</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2" style={{ color: 'var(--tdi-charcoal)' }}>21</p>
              <p style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>states with TDI partner schools</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="section bg-white">
        <div className="container-default">
          <h2 className="text-center mb-12">Traditional PD Is Broken</h2>
          <div className="max-w-3xl mx-auto text-lg">
            <p className="mb-6">
              You know the drill. Someone who hasn't been in a classroom in years reads PowerPoint slides at you for three hours. You nod along, check your phone under the table, and forget everything by Monday.
            </p>
            <p className="mb-6">
              Meanwhile, you're still figuring out how to differentiate for 30 kids, manage behaviors, contact parents, grade papers, and somehow take care of yourself.
            </p>
            <p className="font-semibold" style={{ color: 'var(--tdi-teal)' }}>
              Teachers deserve better. So do the leaders trying to support them.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="section" style={{ backgroundColor: 'var(--tdi-peach)' }}>
        <div className="container-wide">
          <h2 className="text-center mb-4">This Isn't Sit-and-Get</h2>
          <p className="text-center text-lg mb-12 max-w-2xl mx-auto" style={{ opacity: 0.8 }}>
            TDI was born from burnout. Built by teachers who get it.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl mb-3">Practical Strategies</h3>
              <p style={{ opacity: 0.8 }}>
                Stuff you can actually use Monday morning. No fluff, no theory for theory's sake.
              </p>
            </div>

            <div className="card text-center">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl mb-3">Respects Your Time</h3>
              <p style={{ opacity: 0.8 }}>
                Flipped PD model. Learn on your schedule. No more losing Saturdays to workshops.
              </p>
            </div>

            <div className="card text-center">
              <div className="text-4xl mb-4">💪</div>
              <h3 className="text-xl mb-3">Wellness Built In</h3>
              <p style={{ opacity: 0.8 }}>
                Because you can't pour from an empty cup. Self-care isn't selfish, it's survival.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Two Paths Section */}
      <section className="section bg-white">
        <div className="container-wide">
          <h2 className="text-center mb-12">Two Ways to Work With Us</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Teachers Path */}
            <div className="card" style={{ borderTop: '4px solid var(--tdi-coral)' }}>
              <h3 className="text-2xl mb-4">For Teachers</h3>
              <p className="mb-6" style={{ opacity: 0.8 }}>
                Jump into the Learning Hub on your own. Hundreds of bite-sized videos, downloadable resources, and a community that actually gets what you're going through.
              </p>
              <ul className="mb-6 space-y-2">
                <li>✓ On-demand courses you finish in one sitting</li>
                <li>✓ Ready-to-use classroom resources</li>
                <li>✓ Wellness strategies that actually work</li>
                <li>✓ Free downloads to get you started</li>
              </ul>
              <a
                href="https://tdi.thinkific.com"
                className="btn-primary inline-block"
                target="_blank"
                rel="noopener noreferrer"
              >
                Explore the Learning Hub
              </a>
            </div>

            {/* Schools Path */}
            <div className="card" style={{ borderTop: '4px solid var(--tdi-teal)' }}>
              <h3 className="text-2xl mb-4">For Schools & Districts</h3>
              <p className="mb-6" style={{ opacity: 0.8 }}>
                Bring TDI to your whole team. We partner with schools to deliver PD that teachers actually want, with outcomes you can measure and report.
              </p>
              <ul className="mb-6 space-y-2">
                <li>✓ Full Learning Hub access for your staff</li>
                <li>✓ Live workshops and coaching</li>
                <li>✓ Leadership dashboard with real data</li>
                <li>✓ Implementation support from day one</li>
              </ul>
              <Link href="/for-schools" className="btn-secondary inline-block">
                Learn About Partnerships
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Calculator Section */}
      <section className="section" style={{ backgroundColor: 'var(--tdi-peach)' }}>
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <TDICalculator />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section bg-white">
        <div className="container-wide">
          <h2 className="text-center mb-12">What Educators Are Saying</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card-testimonial">
              <p className="text-lg italic mb-4">
                "I finally feel like I have strategies that work AND time to breathe. TDI changed how I approach my classroom and myself."
              </p>
              <p className="text-sm font-semibold">Sarah K.</p>
              <p className="text-sm" style={{ opacity: 0.7 }}>5th Grade Teacher, IL</p>
            </div>

            <div className="card-testimonial">
              <p className="text-lg italic mb-4">
                "Our teachers are actually excited about PD now. I don't have to chase them down or babysit. They're learning because they want to."
              </p>
              <p className="text-sm font-semibold">Lisa M.</p>
              <p className="text-sm" style={{ opacity: 0.7 }}>K-8 School Director, WA</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section" style={{ backgroundColor: 'var(--tdi-navy)' }}>
        <div className="container-default text-center">
          <h2 className="mb-6" style={{ color: 'white' }}>Ready to Feel Like a Teacher Again?</h2>
          <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'white', opacity: 0.8 }}>
            Whether you're a teacher looking for support or a leader trying to keep your team from burning out, we've got you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://tdi.thinkific.com"
              className="btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Start Learning Now
            </a>
            <Link
              href="/for-schools/schedule-call"
              className="btn-secondary"
              style={{ borderColor: 'white', color: 'white' }}
            >
              Talk to Our Team
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
