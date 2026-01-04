import Link from 'next/link';
import { TDICalculator } from '@/components/calculators/TDICalculator';
import { FAQ } from '@/components/FAQ';
import { ParallaxHero } from '@/components/ParallaxHero';
import { CoursesSection } from '@/components/CoursesSection';

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

      {/* How We Build What Teachers Need */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
            How We Build What Teachers Need
          </h2>
          <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: '#1e2749', opacity: 0.7 }}>
            A process designed by educators, for educators.
          </p>

          {/* Floating Bubbles Container */}
          <div className="relative max-w-5xl mx-auto px-4">

            {/* Connecting Line with Traveling Pulse */}
            <div className="absolute top-12 left-[10%] right-[10%] h-1 hidden md:block" style={{ backgroundColor: '#e5e7eb' }}>
              {/* Animated Pulse */}
              <div
                className="absolute top-0 left-0 h-full w-20 rounded-full animate-travel-pulse"
                style={{
                  background: 'linear-gradient(90deg, transparent, #ffba06, transparent)'
                }}
              />
            </div>

            {/* Bubbles Row */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4">

              {/* Bubble 1 */}
              <div
                className="group flex flex-col items-center text-center animate-float"
              >
                <div
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4 transition-all duration-300 cursor-pointer group-hover:scale-110 group-hover:shadow-lg relative z-10"
                  style={{
                    backgroundColor: '#1e2749',
                    boxShadow: '0 4px 15px rgba(30, 39, 73, 0.3)'
                  }}
                >
                  <span className="text-2xl md:text-3xl font-bold" style={{ color: '#ffba06' }}>1</span>
                </div>
                <h3 className="font-bold text-sm md:text-base mb-1 transition-colors group-hover:text-yellow-500" style={{ color: '#1e2749' }}>
                  Listen
                </h3>
                <p className="text-xs md:text-sm max-w-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: '#1e2749' }}>
                  Teachers identify what they need
                </p>
              </div>

              {/* Bubble 2 */}
              <div
                className="group flex flex-col items-center text-center animate-float-delay-1"
              >
                <div
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4 transition-all duration-300 cursor-pointer group-hover:scale-110 group-hover:shadow-lg relative z-10"
                  style={{
                    backgroundColor: '#1e2749',
                    boxShadow: '0 4px 15px rgba(30, 39, 73, 0.3)'
                  }}
                >
                  <span className="text-2xl md:text-3xl font-bold" style={{ color: '#ffba06' }}>2</span>
                </div>
                <h3 className="font-bold text-sm md:text-base mb-1 transition-colors group-hover:text-yellow-500" style={{ color: '#1e2749' }}>
                  Collaborate
                </h3>
                <p className="text-xs md:text-sm max-w-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: '#1e2749' }}>
                  Experts and practitioners team up
                </p>
              </div>

              {/* Bubble 3 */}
              <div
                className="group flex flex-col items-center text-center animate-float-delay-2"
              >
                <div
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4 transition-all duration-300 cursor-pointer group-hover:scale-110 group-hover:shadow-lg relative z-10"
                  style={{
                    backgroundColor: '#1e2749',
                    boxShadow: '0 4px 15px rgba(30, 39, 73, 0.3)'
                  }}
                >
                  <span className="text-2xl md:text-3xl font-bold" style={{ color: '#ffba06' }}>3</span>
                </div>
                <h3 className="font-bold text-sm md:text-base mb-1 transition-colors group-hover:text-yellow-500" style={{ color: '#1e2749' }}>
                  Design
                </h3>
                <p className="text-xs md:text-sm max-w-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: '#1e2749' }}>
                  Research-backed, actionable tools
                </p>
              </div>

              {/* Bubble 4 */}
              <div
                className="group flex flex-col items-center text-center animate-float-delay-3"
              >
                <div
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4 transition-all duration-300 cursor-pointer group-hover:scale-110 group-hover:shadow-lg relative z-10"
                  style={{
                    backgroundColor: '#1e2749',
                    boxShadow: '0 4px 15px rgba(30, 39, 73, 0.3)'
                  }}
                >
                  <span className="text-2xl md:text-3xl font-bold" style={{ color: '#ffba06' }}>4</span>
                </div>
                <h3 className="font-bold text-sm md:text-base mb-1 transition-colors group-hover:text-yellow-500" style={{ color: '#1e2749' }}>
                  Publish
                </h3>
                <p className="text-xs md:text-sm max-w-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: '#1e2749' }}>
                  Live in the Learning Hub
                </p>
              </div>

              {/* Bubble 5 */}
              <div
                className="group flex flex-col items-center text-center animate-float-delay-4"
              >
                <div
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4 transition-all duration-300 cursor-pointer group-hover:scale-110 group-hover:shadow-lg relative z-10"
                  style={{
                    backgroundColor: '#1e2749',
                    boxShadow: '0 4px 15px rgba(30, 39, 73, 0.3)'
                  }}
                >
                  <span className="text-2xl md:text-3xl font-bold" style={{ color: '#ffba06' }}>5</span>
                </div>
                <h3 className="font-bold text-sm md:text-base mb-1 transition-colors group-hover:text-yellow-500" style={{ color: '#1e2749' }}>
                  Deliver
                </h3>
                <p className="text-xs md:text-sm max-w-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: '#1e2749' }}>
                  Ready to use Monday morning
                </p>
              </div>

            </div>

            {/* 30-day guarantee note */}
            <div className="text-center">
              <p className="text-center mt-8 text-sm font-medium" style={{ color: '#ffba06', backgroundColor: '#1e2749', display: 'inline-block', padding: '8px 16px', borderRadius: '9999px', marginLeft: 'auto', marginRight: 'auto' }}>
                Partner schools: 30-day turnaround guarantee on custom requests
              </p>
            </div>
          </div>
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

      {/* SECTION 8: Dynamic Courses from Thinkific */}
      <CoursesSection />

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
          <div className="mt-4">
            <a
              href="https://www.facebook.com/groups/tdimovement"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
              style={{ color: '#ffba06' }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
              Or join our free Facebook community
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 10: Calculator with Parallax Background */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Parallax Background Image */}
        <div
          className="absolute inset-0 parallax-calc-bg"
          style={{
            backgroundImage: "url('/images/calculator-background.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          }}
        />

        {/* Dark Overlay for readability */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: 'rgba(30, 39, 73, 0.85)'
          }}
        />

        {/* Calculator Content */}
        <div className="relative z-10 container-default">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#ffffff' }}>
            See What's Possible for Your School
          </h2>
          <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.8 }}>
            Input your school's current state and see the potential impact of partnering with TDI.
          </p>

          {/* Calculator Component */}
          <TDICalculator />

          <p className="text-center text-sm mt-4" style={{ color: '#ffffff', opacity: 0.6 }}>
            80% of schools we work with secure external funding for PD.{' '}
            <Link href="/funding" className="underline" style={{ color: '#ffffff' }}>See how</Link>
          </p>
        </div>
      </section>

      {/* SECTION 11: FAQ */}
      <FAQ />

      {/* SECTION 12: Final CTA */}
      <section className="section" style={{ backgroundColor: '#80a4ed' }}>
        <div className="container-default text-center">
          <h2 className="mb-4" style={{ color: '#1e2749' }}>Ready to Feel Like a Teacher Again?</h2>
          <p className="text-lg mb-2 max-w-xl mx-auto" style={{ color: '#1e2749', opacity: 0.8 }}>
            Whether you're a teacher looking for support or a leader trying to keep your team from burning out, we've got you.
          </p>
          <p className="text-sm mb-8" style={{ color: '#1e2749', opacity: 0.6 }}>
            Join 87,000+ educators who've already taken the first step.
          </p>
          <Link href="/join" className="btn-primary inline-block" style={{ backgroundColor: '#ffba06', color: '#1e2749' }}>
            Join the Movement
          </Link>
        </div>
      </section>
    </main>
  );
}
