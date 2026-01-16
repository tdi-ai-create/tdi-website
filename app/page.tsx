import Link from 'next/link';
import { TabbedCalculator } from '@/components/calculators/TabbedCalculator';
import { FAQ } from '@/components/FAQ';
import { ParallaxHero } from '@/components/ParallaxHero';
import { CoursesSection } from '@/components/CoursesSection';
import { AnimatedStatsBar } from '@/components/AnimatedStatsBar';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* SECTION 1: Hero */}
      <ParallaxHero />

      {/* SECTION 1.5: TDI helps you support your entire team */}
      <section className="py-12 md:py-16" style={{ backgroundColor: '#1e2749' }}>
        <div className="container-default">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: '#ffba06' }}>
              TDI helps you support your entire team
            </h2>
            <p className="text-lg md:text-xl mb-6" style={{ color: '#ffffff', opacity: 0.9 }}>
              Teachers. Administrators. Paraprofessionals. Instructional coaches. All kinds of educators who refuse to accept that professional development is only for core teachers and one-day trainings that don't clearly affect school and student outcomes.
            </p>
            <p className="text-base md:text-lg" style={{ color: '#ffffff', opacity: 0.75 }}>
              We help admins support their staff in building 20-year careers in education—not just surviving semesters—through measurable outcomes that matter.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: Problem + Solution Section */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          {/* Problem */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#1e2749' }}>
              Traditional PD<br />Wastes Time and Money
            </h2>
            <p className="text-lg" style={{ color: '#1e2749', opacity: 0.8 }}>
              Someone who hasn't been in a classroom in years reads PowerPoints at you for three hours. You nod along, check your phone under the table, and forget everything by Monday.
            </p>
            <p className="text-lg mt-4" style={{ color: '#1e2749', opacity: 0.8 }}>
              Teachers deserve better. So do the leaders trying to support them.
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="h-px w-16" style={{ backgroundColor: '#ffba06' }}></div>
            <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#ffba06' }}>Here's the difference</span>
            <div className="h-px w-16" style={{ backgroundColor: '#ffba06' }}></div>
          </div>

          {/* Solution */}
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#1e2749' }}>
              Learning That Actually Gets Implemented
            </h3>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#1e2749', opacity: 0.8 }}>
              Born from burnout. Built by teachers. Trusted by schools.
            </p>
          </div>

          {/* Three Differentiators */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-50 rounded-xl p-6 text-center flex flex-col items-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#ffba06' }}>
                <svg className="w-6 h-6" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <h4 className="font-bold mb-3" style={{ color: '#1e2749' }}>Action-Focused Strategies</h4>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Real tools you can use Monday morning. We present theory and help teachers see exactly how to apply it to their classroom in real time.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center flex flex-col items-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#ffba06' }}>
                <svg className="w-6 h-6" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
              </div>
              <h4 className="font-bold mb-3" style={{ color: '#1e2749' }}>Bottom-Up Approach</h4>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                A PD model that isn't just created by admins but actually asks teachers what they need. Customized support for individual departments or groups of staff. Daily, easy-to-digest learning happens all year round.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center flex flex-col items-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#ffba06' }}>
                <svg className="w-6 h-6" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <h4 className="font-bold mb-3" style={{ color: '#1e2749' }}>Wellness Built In</h4>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Where most PD fails, TDI leans in. We focus on the whole teacher—which supports better student outcomes in addition to curriculum and teaching theory.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Stats Bar */}
      <AnimatedStatsBar
        stats={[
          { value: 87000, suffix: '+', label: 'Educators in Our Community' },
          { value: 65, suffix: '%', label: 'Implementation Rate', subtext: 'vs 10% industry average' },
          { value: 94, suffix: '%', label: 'Would Recommend' },
          { value: 21, label: 'States with Partner Schools' },
        ]}
      />

      {/* SECTION 5a: What Admins Are Saying */}
      <section className="py-12 md:py-16" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-wide">
          <h2 className="text-center mb-8" style={{ color: '#1e2749' }}>What Admins Are Saying</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl p-6 hover-card" style={{ backgroundColor: '#1e2749' }}>
              <p className="text-base italic mb-4" style={{ color: '#ffffff' }}>
                "TDI transformed how our teachers engage with professional development."
              </p>
              <p className="text-sm font-semibold" style={{ color: '#ffba06' }}>— Principal, Louisiana</p>
            </div>

            <div className="rounded-xl p-6 hover-card" style={{ backgroundColor: '#1e2749' }}>
              <p className="text-base italic mb-4" style={{ color: '#ffffff' }}>
                "Finally, PD that my staff actually looks forward to."
              </p>
              <p className="text-sm font-semibold" style={{ color: '#ffba06' }}>— Assistant Superintendent, Illinois</p>
            </div>

            <div className="rounded-xl p-6 hover-card" style={{ backgroundColor: '#1e2749' }}>
              <p className="text-base italic mb-4" style={{ color: '#ffffff' }}>
                "The implementation support made all the difference."
              </p>
              <p className="text-sm font-semibold" style={{ color: '#ffba06' }}>— Curriculum Director, Texas</p>
            </div>

            <div className="rounded-xl p-6 hover-card" style={{ backgroundColor: '#1e2749' }}>
              <p className="text-base italic mb-4" style={{ color: '#ffffff' }}>
                "Our retention improved within the first year."
              </p>
              <p className="text-sm font-semibold" style={{ color: '#ffba06' }}>— School Administrator, California</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5b: What Educators Are Saying */}
      <section className="py-12 md:py-16" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-wide">
          <h2 className="text-center mb-8" style={{ color: '#1e2749' }}>What Educators Are Saying</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl p-8 hover-card" style={{ backgroundColor: '#80a4ed' }}>
              <p className="text-lg italic mb-4" style={{ color: '#ffffff' }}>
                "I finally feel like I have strategies that work AND time to breathe. TDI changed how I approach my classroom and myself."
              </p>
              <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>Sarah K., 5th Grade Teacher</p>
            </div>

            <div className="rounded-xl p-8 hover-card" style={{ backgroundColor: '#80a4ed' }}>
              <p className="text-lg italic mb-4" style={{ color: '#ffffff' }}>
                "Our teachers are actually excited about PD now. I don't have to chase them down or babysit. They're learning because they want to."
              </p>
              <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>Michelle M., K-8 School Director</p>
            </div>

            <div className="rounded-xl p-8 hover-card" style={{ backgroundColor: '#80a4ed' }}>
              <p className="text-lg italic mb-4" style={{ color: '#ffffff' }}>
                "This was the first PD I didn't have to apologize for. Our teachers actually thanked me."
              </p>
              <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>James T., School Principal</p>
            </div>

            <div className="rounded-xl p-8 hover-card" style={{ backgroundColor: '#80a4ed' }}>
              <p className="text-lg italic mb-4" style={{ color: '#ffffff' }}>
                "TDI helped us unlock funding we didn't even know was possible."
              </p>
              <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>Patricia L., District Leader</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: How We Build What Teachers Need */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
            How TDI Helps Admins Create Real Solutions
          </h2>
          <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: '#1e2749', opacity: 0.7 }}>
            Built by educators. Measured for impact.
          </p>

          {/* Floating Bubbles Container */}
          <div className="relative max-w-5xl mx-auto px-4">

            {/* Connecting Line with Traveling Pulse */}
            <div className="absolute top-12 left-[10%] right-[10%] h-1 hidden md:block z-0" style={{ backgroundColor: '#e5e7eb' }}>
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

              {/* Step 1 - Listen */}
              <div className="flex flex-col items-center text-center group relative z-10">
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold mb-3 transition-all group-hover:scale-110"
                  style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                >
                  1
                </div>
                <h4 className="font-bold mb-1" style={{ color: '#1e2749' }}>Listen</h4>
                {/* Description - always visible on mobile, hover on desktop */}
                <p
                  className="text-sm max-w-32 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200"
                  style={{ color: '#1e2749', opacity: 0.7 }}
                >
                  TDI helps teachers identify what they need
                </p>
              </div>

              {/* Step 2 - Collaborate */}
              <div className="flex flex-col items-center text-center group relative z-10">
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold mb-3 transition-all group-hover:scale-110"
                  style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                >
                  2
                </div>
                <h4 className="font-bold mb-1" style={{ color: '#1e2749' }}>Collaborate</h4>
                <p
                  className="text-sm max-w-32 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200"
                  style={{ color: '#1e2749', opacity: 0.7 }}
                >
                  TDI curates education experts and industry leaders
                </p>
              </div>

              {/* Step 3 - Implement */}
              <div className="flex flex-col items-center text-center group relative z-10">
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold mb-3 transition-all group-hover:scale-110"
                  style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                >
                  3
                </div>
                <h4 className="font-bold mb-1" style={{ color: '#1e2749' }}>Implement</h4>
                <p
                  className="text-sm max-w-32 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200"
                  style={{ color: '#1e2749', opacity: 0.7 }}
                >
                  Year-round support ensures teachers use what they learn
                </p>
              </div>

              {/* Step 4 - Measure */}
              <div className="flex flex-col items-center text-center group relative z-10">
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold mb-3 transition-all group-hover:scale-110"
                  style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                >
                  4
                </div>
                <h4 className="font-bold mb-1" style={{ color: '#1e2749' }}>Measure</h4>
                <p
                  className="text-sm max-w-32 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200"
                  style={{ color: '#1e2749', opacity: 0.7 }}
                >
                  Ongoing feedback loops and KPI tracking show real progress
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
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span style={{ color: '#1e2749' }}>Classroom tools you can use Monday morning</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span style={{ color: '#1e2749' }}>Weekly strategies from our blog and podcast</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span style={{ color: '#1e2749' }}>Free resources for teachers and paras</span>
                </li>
              </ul>
              <a
                href="https://raehughart.substack.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-lg font-bold transition-all hover-glow"
                style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
              >
                Join 87,000+ Educators
              </a>
              <p className="text-sm mt-4" style={{ color: '#1e2749', opacity: 0.6 }}>
                Or{' '}
                <a
                  href="https://tdi.thinkific.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  explore the Learning Hub
                </a>
              </p>
            </div>

            {/* Schools Path */}
            <div className="card" style={{ backgroundColor: '#ffffff', borderTop: '4px solid #1e2749', color: '#1e2749' }}>
              <h3 className="text-2xl mb-4" style={{ color: '#1e2749' }}>For Schools & Districts</h3>
              <p className="mb-6" style={{ color: '#1e2749', opacity: 0.8 }}>
                Use the TDI Blueprint to transform your building. We partner with you to achieve measurable implementation, improved teacher happiness scores, and student growth.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span style={{ color: '#1e2749' }}>PD that actually gets used in classrooms</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span style={{ color: '#1e2749' }}>Improved teacher satisfaction and retention</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span style={{ color: '#1e2749' }}>Student achievement gains you can report</span>
                </li>
              </ul>
              <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
                Most leaders identify their PD type in under 60 seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <Link
                  href="/pd-diagnostic"
                  className="inline-block px-6 py-3 rounded-lg font-bold transition-all hover-glow"
                  style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                >
                  Take the Free Diagnostic
                </Link>
                <Link
                  href="/contact"
                  className="font-semibold transition-colors hover:opacity-80"
                  style={{ color: '#1e2749' }}
                >
                  Or schedule a call →
                </Link>
              </div>
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

      {/* SECTION 8: Calculator with Parallax Background */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Parallax Background Image */}
        <div
          className="absolute inset-0 parallax-calc-bg"
          style={{
            backgroundImage: "url('/images/calculator-background.webp')",
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
            See What's Possible
          </h2>
          <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.8 }}>
            Whether you're a school leader or a teacher,<br />explore the potential impact of partnering with TDI.
          </p>

          {/* Calculator Component */}
          <TabbedCalculator />

          <p className="text-center text-sm mt-4" style={{ color: '#ffffff', opacity: 0.6 }}>
            80% of schools we work with secure external funding for PD.{' '}
            <Link href="/funding" className="underline" style={{ color: '#ffffff' }}>See how</Link>
          </p>
        </div>
      </section>

      {/* SECTION 9: Dynamic Courses from Thinkific */}
      <CoursesSection />

      {/* SECTION 10: Substack/Newsletter Section */}
      <section className="section" style={{ backgroundColor: 'var(--tdi-navy)' }}>
        <div className="container-default text-center">
          <h2 className="mb-4" style={{ color: 'white' }}>Practical Strategies, 3x a Week</h2>
          <p className="text-lg mb-2 max-w-xl mx-auto" style={{ color: 'white', opacity: 0.8 }}>
            Join 87,000+ educators getting real strategies delivered to their inbox. Not theory, not fluff, just stuff that works.
          </p>
          <p className="text-base mb-6" style={{ color: '#ffba06' }}>
            Join 87,000+ educators who decided they deserved better.
          </p>
          <a
            href="https://raehughart.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-block"
          >
            Join the Movement
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

      {/* SECTION 11: FAQ */}
      <FAQ limit={6} showSeeAll={true} />

      {/* SECTION 12: Final CTA */}
      <section className="section" style={{ backgroundColor: '#80a4ed' }}>
        <div className="container-default text-center">
          <h2 className="mb-4" style={{ color: '#1e2749' }}>Ready to Reimagine PD?</h2>
          <p className="text-lg mb-2 max-w-xl mx-auto" style={{ color: '#1e2749', opacity: 0.8 }}>
            Whether you're a teacher looking for support or a leader trying to keep your team from burning out, we've got you.
          </p>
          <p className="text-sm mb-8" style={{ color: '#1e2749', opacity: 0.6 }}>
            Join 87,000+ educators who've already taken the first step.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/free-pd-plan"
              className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover-lift"
              style={{ backgroundColor: '#ffffff', color: '#1e2749' }}
            >
              Get Your Free PD Plan
            </Link>
            <Link
              href="/contact"
              className="inline-block px-8 py-4 rounded-lg font-bold text-lg border-2 transition-all hover-lift"
              style={{ borderColor: '#1e2749', color: '#1e2749', backgroundColor: 'transparent' }}
            >
              Start the Conversation
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
