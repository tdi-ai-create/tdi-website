import Link from 'next/link';
import { TDICalculator } from '@/components/calculators/TDICalculator';
import { FAQ } from '@/components/FAQ';
import { ParallaxHero } from '@/components/ParallaxHero';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* SECTION 1: Hero */}
      <ParallaxHero />

      {/* SECTION 2: Stats Bar */}
      <section className="py-12 md:py-16" style={{ backgroundColor: '#1e2749' }}>
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold mb-2" style={{ color: '#ffffff' }}>87,000+</p>
              <p style={{ color: '#ffffff', opacity: 0.8 }}>Educators in Our Community</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold mb-2" style={{ color: '#ffffff' }}>100+</p>
              <p style={{ color: '#ffffff', opacity: 0.8 }}>Hours of On-Demand PD</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold mb-2" style={{ color: '#ffffff' }}>21</p>
              <p style={{ color: '#ffffff', opacity: 0.8 }}>States with TDI Partner Schools</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Testimonials (moved up) */}
      <section className="section" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-wide">
          <h2 className="text-center mb-12" style={{ color: '#1e2749' }}>What Educators Are Saying</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-xl p-8" style={{ backgroundColor: '#80a4ed' }}>
              <p className="text-lg italic mb-4" style={{ color: '#ffffff' }}>
                "I finally feel like I have strategies that work AND time to breathe. TDI changed how I approach my classroom and myself."
              </p>
              <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>Ms. K., 5th Grade Teacher</p>
            </div>

            <div className="rounded-xl p-8" style={{ backgroundColor: '#80a4ed' }}>
              <p className="text-lg italic mb-4" style={{ color: '#ffffff' }}>
                "Our teachers are actually excited about PD now. I don't have to chase them down or babysit. They're learning because they want to."
              </p>
              <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>Ms. M., K-8 School Director</p>
            </div>

            <div className="rounded-xl p-8" style={{ backgroundColor: '#80a4ed' }}>
              <p className="text-lg italic mb-4" style={{ color: '#ffffff' }}>
                "This was the first PD I didn't have to apologize for. Our teachers actually thanked me."
              </p>
              <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>School Principal</p>
            </div>

            <div className="rounded-xl p-8" style={{ backgroundColor: '#80a4ed' }}>
              <p className="text-lg italic mb-4" style={{ color: '#ffffff' }}>
                "TDI helped us unlock funding we didn't even know was possible."
              </p>
              <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>District Leader</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Problem Section */}
      <section className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-6 whitespace-nowrap" style={{ color: '#1e2749' }}>Traditional Educator Learning Is Broken</h2>
            <p className="text-lg mb-4" style={{ color: '#1e2749', opacity: 0.8 }}>
              Someone who hasn't been in a classroom in years reads PowerPoints at you for three hours. You nod along, check your phone under the table, and forget everything by Monday.
            </p>
            <p className="text-lg font-semibold" style={{ color: '#1e2749' }}>
              Teachers deserve better. So do the leaders trying to support them.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: Solution Section */}
      <section className="section" style={{ backgroundColor: '#80a4ed' }}>
        <div className="container-wide">
          <h2 className="text-center mb-4">This Isn't Sit-and-Get</h2>
          <p className="text-center text-lg mb-12 max-w-2xl mx-auto" style={{ opacity: 0.8 }}>
            TDI was born from burnout. Built by teachers who get it.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <h3 className="text-xl mb-3">Action-Focused Strategies</h3>
              <p style={{ opacity: 0.8 }}>
                Tools you can actually use Monday morning. No fluff, no theory for theory's sake.
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

      {/* SECTION 6: How We Build Content (NEW) */}
      <section className="section bg-white">
        <div className="container-wide">
          <h2 className="text-center mb-4">How We Build What Teachers Need</h2>
          <p className="text-center text-lg mb-12" style={{ color: 'var(--tdi-navy)' }}>
            Research-Backed. Expert-Designed. Educator-Focused.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-white" style={{ backgroundColor: 'var(--tdi-navy)' }}>1</div>
              <h4 className="text-lg font-semibold mb-2">A Need Emerges</h4>
              <p className="text-sm" style={{ opacity: 0.7 }}>
                Teachers or partner schools identify a pain point or topic they need support with
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-white" style={{ backgroundColor: 'var(--tdi-navy)' }}>2</div>
              <h4 className="text-lg font-semibold mb-2">Experts Assemble</h4>
              <p className="text-sm" style={{ opacity: 0.7 }}>
                TDI recruits specialists and practitioners in the field to collaborate on solutions
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-white" style={{ backgroundColor: 'var(--tdi-navy)' }}>3</div>
              <h4 className="text-lg font-semibold mb-2">Research & Design</h4>
              <p className="text-sm" style={{ opacity: 0.7 }}>
                Solutions are grounded in current research and shaped into actionable tools
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-white" style={{ backgroundColor: 'var(--tdi-navy)' }}>4</div>
              <h4 className="text-lg font-semibold mb-2">Publish to the Hub</h4>
              <p className="text-sm" style={{ opacity: 0.7 }}>
                Courses, downloads, and resource packets go live in the TDI Learning Hub
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-white" style={{ backgroundColor: 'var(--tdi-navy)' }}>5</div>
              <h4 className="text-lg font-semibold mb-2">Delivered to Teachers</h4>
              <p className="text-sm" style={{ opacity: 0.7 }}>
                Educators access targeted, ready-to-use resources when they need them
              </p>
            </div>
          </div>

          <p className="text-center text-sm mt-8" style={{ color: 'var(--tdi-coral)', fontWeight: 600 }}>
            Partner schools: 30-day turnaround guarantee on custom requests
          </p>
        </div>
      </section>

      {/* SECTION 7: Two Ways to Work With Us */}
      <section className="section" style={{ backgroundColor: '#80a4ed' }}>
        <div className="container-wide">
          <h2 className="text-center mb-12" style={{ color: '#1e2749' }}>Two Ways to Work With Us</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Teachers Path */}
            <div className="card" style={{ backgroundColor: '#ffffff', borderTop: '4px solid #1e2749', color: '#1e2749' }}>
              <h3 className="text-2xl mb-4" style={{ color: '#1e2749' }}>For Teachers</h3>
              <p className="mb-6" style={{ color: '#1e2749', opacity: 0.8 }}>
                Action-focused tools to help you be more efficient and effective in your classroom. Access ready-to-use strategies, weekly blog insights, podcast episodes, and downloadable resources.
              </p>
              <ul className="mb-6 space-y-2" style={{ color: '#1e2749' }}>
                <li>Classroom tools you can use Monday morning</li>
                <li>Weekly strategies from our blog</li>
                <li>Podcast episodes for your commute</li>
                <li>Free downloadable resources for teachers and paras</li>
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
            <div className="card" style={{ backgroundColor: '#ffffff', borderTop: '4px solid #1e2749', color: '#1e2749' }}>
              <h3 className="text-2xl mb-4" style={{ color: '#1e2749' }}>For Schools & Districts</h3>
              <p className="mb-6" style={{ color: '#1e2749', opacity: 0.8 }}>
                Use the TDI Blueprint to transform your building. We partner with you to achieve measurable implementation, improved teacher happiness scores, and student growth.
              </p>
              <ul className="mb-6 space-y-2" style={{ color: '#1e2749' }}>
                <li>Measurable PD implementation, not just seat time</li>
                <li>Improved teacher satisfaction and retention</li>
                <li>Student achievement gains you can report</li>
                <li>Full support for teachers and paraprofessionals</li>
              </ul>
              <Link href="/for-schools" className="btn-secondary inline-block">
                Learn About the TDI Blueprint
              </Link>
              <p className="text-sm mt-4" style={{ color: '#1e2749', opacity: 0.6 }}>
                80% of schools we work with secure external funding.{' '}
                <Link href="/funding" className="underline">See how</Link>
              </p>
              <p className="text-sm mt-2" style={{ color: '#1e2749', opacity: 0.6 }}>
                Your data is protected.{' '}
                <Link href="/security" className="underline">See our security practices</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: Most Popular Courses */}
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
                Practical systems for building a classroom culture where students want to be, without losing your voice or your sanity.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-2">The Sustainable Teacher</h3>
              <p style={{ opacity: 0.7 }}>
                How to set boundaries, protect your time, and actually leave school at a reasonable hour without feeling guilty.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-2">Differentiation Without the Overwhelm</h3>
              <p style={{ opacity: 0.7 }}>
                Real strategies for meeting every student where they are, even when you have 30 kids and no aide.
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <a
              href="https://tdi.thinkific.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline"
              style={{ color: 'var(--tdi-navy)' }}
            >
              Explore all 100+ hours in the Learning Hub
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 9: Substack/Newsletter Section */}
      <section className="section" style={{ backgroundColor: 'var(--tdi-navy)' }}>
        <div className="container-default text-center">
          <h2 className="mb-4" style={{ color: 'white' }}>Practical Strategies, 3x a Week</h2>
          <p className="text-lg mb-6 max-w-xl mx-auto" style={{ color: 'white', opacity: 0.8 }}>
            Join 87,000+ educators getting real strategies delivered to their inbox. Not theory, not fluff, just stuff that works.
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

      {/* SECTION 10: Calculator */}
      <section className="section" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-wide">
          <TDICalculator />
          <p className="text-center text-sm mt-4" style={{ opacity: 0.6 }}>
            80% of schools we work with secure external funding for PD.{' '}
            <Link href="/funding" className="underline">See how</Link>
          </p>
        </div>
      </section>

      {/* SECTION 11: FAQ */}
      <FAQ />

      {/* SECTION 12: Final CTA */}
      <section className="section" style={{ backgroundColor: '#ffba06' }}>
        <div className="container-default text-center">
          <h2 className="mb-4" style={{ color: '#1e2749' }}>Ready to Feel Like a Teacher Again?</h2>
          <p className="text-lg mb-2 max-w-xl mx-auto" style={{ color: '#1e2749', opacity: 0.8 }}>
            Whether you're a teacher looking for support or a leader trying to keep your team from burning out, we've got you.
          </p>
          <p className="text-sm mb-8" style={{ color: '#1e2749', opacity: 0.6 }}>
            Join 87,000+ educators who've already taken the first step.
          </p>
          <Link href="/join" className="btn-primary inline-block" style={{ backgroundColor: '#1e2749', color: '#ffffff' }}>
            Join the Movement
          </Link>
        </div>
      </section>
    </main>
  );
}
