import Link from 'next/link';
import { TDICalculator } from '@/components/calculators/TDICalculator';
import { FAQ } from '@/components/FAQ';

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
          <p className="text-sm mb-4" style={{ opacity: 0.6 }}>
            Join 87,000+ educators who are done accepting the status quo.
          </p>
          <Link href="/join" className="btn-primary inline-block">
            Join the Movement
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="section py-12" style={{ backgroundColor: 'var(--tdi-yellow)' }}>
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold mb-1" style={{ color: 'var(--tdi-charcoal)' }}>87,000+</p>
              <p className="text-lg" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>Educators in Our Community</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-1" style={{ color: 'var(--tdi-charcoal)' }}>100+</p>
              <p className="text-lg" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>Hours of On-Demand PD</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-1" style={{ color: 'var(--tdi-charcoal)' }}>21</p>
              <p className="text-lg" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>States with TDI Partner Schools</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section - Cut in half */}
      <section className="section bg-white">
        <div className="container-default">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-6">Traditional PD Is Broken</h2>
            <p className="text-lg mb-4" style={{ opacity: 0.8 }}>
              Someone who hasn't been in a classroom in years reads PowerPoints at you for three hours. You nod along, check your phone under the table, and forget everything by Monday.
            </p>
            <p className="text-lg font-semibold" style={{ color: 'var(--tdi-teal)' }}>
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
              <h3 className="text-xl mb-3">Practical Strategies</h3>
              <p style={{ opacity: 0.8 }}>
                Stuff you can actually use Monday morning. No fluff, no theory for theory's sake.
              </p>
            </div>
            
            <div className="card text-center">
              <h3 className="text-xl mb-3">Respects Your Time</h3>
              <p style={{ opacity: 0.8 }}>
                Flipped PD model. Learn on your schedule. No more losing Saturdays to workshops.
              </p>
            </div>
            
            <div className="card text-center">
              <h3 className="text-xl mb-3">Wellness Built In</h3>
              <p style={{ opacity: 0.8 }}>
                Because you can't pour from an empty cup. Self-care isn't selfish, it's survival.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Most Popular Courses Section */}
      <section className="section bg-white">
        <div className="container-default">
          <h2 className="text-center mb-4">What Educators Are Learning Right Now</h2>
          <p className="text-center mb-12" style={{ opacity: 0.7 }}>
            The strategies teachers and paras are using to take back their time and their classrooms.
          </p>

          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-2">Classroom Management That Actually Works</h3>
              <p style={{ opacity: 0.7 }}>
                Practical systems for building a classroom culture where students want to be — without losing your voice or your sanity.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-2">The Sustainable Teacher</h3>
              <p style={{ opacity: 0.7 }}>
                How to set boundaries, protect your time, and actually leave school at a reasonable hour — without feeling guilty.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-2">Differentiation Without the Overwhelm</h3>
              <p style={{ opacity: 0.7 }}>
                Real strategies for meeting every student where they are — even when you have 30 kids and no aide.
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <a 
              href="https://tdi.thinkific.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold underline"
              style={{ color: 'var(--tdi-teal)' }}
            >
              Explore all 100+ hours in the Learning Hub
            </a>
          </div>
        </div>
      </section>

      {/* Two Paths Section */}
      <section className="section" style={{ backgroundColor: 'var(--tdi-peach)' }}>
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
                <li>On-demand courses you finish in one sitting</li>
                <li>Ready-to-use classroom resources</li>
                <li>Wellness strategies that actually work</li>
                <li>Free downloads to get you started</li>
              </ul>
              <a 
                href="https://tdi.thinkific.com" 
                className="btn-primary inline-block"
                target="_blank" 
                rel="noopener noreferrer"
              >
                Join 87K+ Educators in the Hub
              </a>
            </div>

            {/* Schools Path */}
            <div className="card" style={{ borderTop: '4px solid var(--tdi-teal)' }}>
              <h3 className="text-2xl mb-4">For Schools & Districts</h3>
              <p className="mb-6" style={{ opacity: 0.8 }}>
                Bring TDI to your whole team — teachers and paraprofessionals. PD they'll actually use, with outcomes you can measure and report.
              </p>
              <ul className="mb-6 space-y-2">
                <li>Full Learning Hub access for your staff</li>
                <li>Live workshops and coaching</li>
                <li>Leadership dashboard with real data</li>
                <li>Implementation support from day one</li>
              </ul>
              <Link href="/for-schools" className="btn-secondary inline-block">
                Learn About Partnerships
              </Link>
              <p className="text-sm mt-4" style={{ opacity: 0.6 }}>
                Your data is protected. <Link href="/security" className="underline">See our security practices</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Calculator Section */}
      <section className="section bg-white">
        <div className="container-wide">
          <TDICalculator />
          <p className="text-center text-sm mt-4" style={{ opacity: 0.6 }}>
            80% of schools we work with secure external funding for PD.{' '}
            <Link href="/funding" className="underline">See how</Link>
          </p>
        </div>
      </section>

      {/* Substack Section */}
      <section className="section" style={{ backgroundColor: 'var(--tdi-navy)' }}>
        <div className="container-default text-center">
          <h2 className="mb-4" style={{ color: 'white' }}>Practical Strategies, 3x a Week</h2>
          <p className="text-lg mb-6 max-w-xl mx-auto" style={{ color: 'white', opacity: 0.8 }}>
            Join 87,000+ educators getting real strategies delivered to their inbox — not theory, not fluff, just stuff that works.
          </p>
          <a 
            href="https://raehughart.substack.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-primary inline-block"
          >
            Join 87,000+ Educators
          </a>
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
              <p className="text-sm font-semibold">Ms. K., 5th Grade Teacher</p>
            </div>
            
            <div className="card-testimonial">
              <p className="text-lg italic mb-4">
                "Our teachers are actually excited about PD now. I don't have to chase them down or babysit. They're learning because they want to."
              </p>
              <p className="text-sm font-semibold">Ms. M., K-8 School Director</p>
            </div>

            <div className="card-testimonial">
              <p className="text-lg italic mb-4">
                "This was the first PD I didn't have to apologize for. Our teachers actually thanked me."
              </p>
              <p className="text-sm font-semibold">School Principal</p>
            </div>

            <div className="card-testimonial">
              <p className="text-lg italic mb-4">
                "TDI helped us unlock funding we didn't even know was possible."
              </p>
              <p className="text-sm font-semibold">District Leader</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* Final CTA */}
      <section className="section" style={{ backgroundColor: 'var(--tdi-teal)' }}>
        <div className="container-default text-center">
          <h2 className="mb-4" style={{ color: 'white' }}>Ready to Feel Like a Teacher Again?</h2>
          <p className="text-lg mb-2 max-w-xl mx-auto" style={{ color: 'white', opacity: 0.8 }}>
            Whether you're a teacher looking for support or a leader trying to keep your team from burning out, we've got you.
          </p>
          <p className="text-sm mb-8" style={{ color: 'white', opacity: 0.6 }}>
            Join 87,000+ educators who've already taken the first step.
          </p>
          <Link href="/join" className="btn-primary inline-block" style={{ backgroundColor: 'var(--tdi-yellow)', color: 'var(--tdi-charcoal)' }}>
            Join the Movement
          </Link>
        </div>
      </section>
    </main>
  );
}
