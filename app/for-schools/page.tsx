import Link from 'next/link';
import { CoursesSection } from '@/components/CoursesSection';
import { TabbedCalculator } from '@/components/calculators';

export const metadata = {
  title: 'For Schools | Teachers Deserve It',
  description: 'Professional development that actually works, with outcomes you can measure and report.',
};

export default function ForSchoolsPage() {
  return (
    <main>
      {/* Hero Section with Parallax */}
      <section className="relative h-[400px] md:h-[450px] overflow-hidden">
        {/* Parallax Background Image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/hero-for-schools.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center 20%',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          }}
        />

        {/* Light Navy Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(30, 39, 73, 0.5) 0%, rgba(30, 39, 73, 0.65) 100%)'
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center px-4 max-w-3xl mx-auto">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              style={{ color: '#ffffff' }}
            >
              Give Your Teachers What They Deserve
            </h1>
            <p
              className="text-lg md:text-xl mb-8"
              style={{ color: '#ffffff', opacity: 0.9 }}
            >
              Professional development that actually works, with outcomes you can measure and report.
            </p>
            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <a
                href="#blueprint"
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-bold text-lg transition-all hover-glow"
                style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
              >
                Explore the TDI Blueprint
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-bold text-lg border-2 transition-all hover-lift"
                style={{ borderColor: '#ffffff', color: '#ffffff' }}
              >
                Schedule a Call
              </a>
            </div>
            <p className="text-sm mt-4 text-center" style={{ color: '#ffffff', opacity: 0.7 }}>
              Ready to talk? Skip ahead and connect with our team directly.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16" style={{ backgroundColor: '#1e2749' }}>
        <div className="container-default">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-5xl md:text-6xl font-bold mb-2" style={{ color: '#ffffff' }}>38%</p>
              <p style={{ color: '#ffffff', opacity: 0.8 }}>more strategies actually used in classrooms</p>
            </div>
            <div>
              <p className="text-5xl md:text-6xl font-bold mb-2" style={{ color: '#ffffff' }}>95%</p>
              <p style={{ color: '#ffffff', opacity: 0.8 }}>of teachers said TDI saved them planning time</p>
            </div>
            <div>
              <p className="text-5xl md:text-6xl font-bold mb-2" style={{ color: '#ffffff' }}>21</p>
              <p style={{ color: '#ffffff', opacity: 0.8 }}>states with TDI partner schools</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points - EMOJIS REMOVED */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
            You Already Know Traditional PD Isn't Working
          </h2>
          <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: '#1e2749', opacity: 0.7 }}>
            You need something different. So do your teachers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="p-6 rounded-xl text-center" style={{ backgroundColor: '#f5f5f5' }}>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#1e2749' }}>Teachers dread it.</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                The eye rolls start before the session does.
              </p>
            </div>
            <div className="p-6 rounded-xl text-center" style={{ backgroundColor: '#f5f5f5' }}>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#1e2749' }}>No measurable outcomes.</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                You can't show the impact to your board.
              </p>
            </div>
            <div className="p-6 rounded-xl text-center" style={{ backgroundColor: '#f5f5f5' }}>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#1e2749' }}>Burnout drives turnover.</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                You're losing good teachers faster than you can hire.
              </p>
            </div>
            <div className="p-6 rounded-xl text-center" style={{ backgroundColor: '#f5f5f5' }}>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#1e2749' }}>Wellness feels fluffy.</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                No data, no accountability, no change.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Schools Get */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#80a4ed' }}>
        <div className="container-default">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#ffffff' }}>
            What Schools Get with TDI
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm" style={{ borderTop: '4px solid #ffba06' }}>
              <h3 className="font-bold text-lg mb-3" style={{ color: '#1e2749' }}>Flexible Learning</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Teachers learn on their schedule. Come together for what matters: discussion, practice, implementation.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm" style={{ borderTop: '4px solid #ffba06' }}>
              <h3 className="font-bold text-lg mb-3" style={{ color: '#1e2749' }}>Measurable Outcomes</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Track engagement, completion, and how much actually gets used. Report real data to your board, not attendance sheets.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm" style={{ borderTop: '4px solid #ffba06' }}>
              <h3 className="font-bold text-lg mb-3" style={{ color: '#1e2749' }}>Personalized Feedback</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Every teacher receives direct, personalized feedback during visits. Positive, uplifting, and connected to solutions.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm" style={{ borderTop: '4px solid #ffba06' }}>
              <h3 className="font-bold text-lg mb-3" style={{ color: '#1e2749' }}>Wellness That Works</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Address burnout before it becomes a resignation letter. Teachers who feel supported stay longer.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm" style={{ borderTop: '4px solid #ffba06' }}>
              <h3 className="font-bold text-lg mb-3" style={{ color: '#1e2749' }}>Implementation Support</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                We don't just hand you a login. Dedicated support to ensure your teachers actually use and benefit from the platform.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm" style={{ borderTop: '4px solid #ffba06' }}>
              <h3 className="font-bold text-lg mb-3" style={{ color: '#1e2749' }}>Phased Approach</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Start with leadership and a pilot group. Scale to full staff when you're ready. No giant leap required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#1e2749' }}>
            What School Leaders Are Saying
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-6 rounded-xl" style={{ backgroundColor: '#E8F0FD' }}>
              <p className="mb-4 italic" style={{ color: '#1e2749' }}>
                "This isn't sit-and-get. Our teachers are actually learning how to work smarter and feel better doing it."
              </p>
              <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Lisa M.</p>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>K-8 School Director</p>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: '#E8F0FD' }}>
              <p className="mb-4 italic" style={{ color: '#1e2749' }}>
                "Before, we got eye rolls. Now, we hear: 'When's the team coming next?' That's when you know PD is finally working."
              </p>
              <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Daniel R.</p>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>High School Principal</p>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: '#E8F0FD' }}>
              <p className="mb-4 italic" style={{ color: '#1e2749' }}>
                "TDI didn't just drop a slide deck and bounce. Every part of the experience felt personal. Our staff felt understood."
              </p>
              <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Julie H.</p>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>Principal, MI</p>
            </div>
          </div>
        </div>
      </section>

      {/* Built for Every Leader */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#1e2749' }}>
        <div className="container-default">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#ffffff' }}>
            Built for Every Leader in the Building
          </h2>
          <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.8 }}>
            No matter your role, TDI meets you where you are.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">

            {/* Principals */}
            <a
              href="/free-pd-plan"
              className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all flex flex-col"
              style={{ textDecoration: 'none' }}
            >
              <div className="h-[140px] overflow-hidden">
                <img
                  src="/images/leader-principal.png"
                  alt="Principal"
                  className="w-full h-full object-cover object-top transition-transform group-hover:scale-105"
                  style={{ filter: 'grayscale(100%)' }}
                />
              </div>
              <div className="bg-white p-4 flex-1 flex flex-col">
                <p
                  className="font-bold mb-2 uppercase tracking-wide"
                  style={{ color: '#1e2749', fontSize: '11px', letterSpacing: '0.05em' }}
                >
                  Principals
                </p>
                <p className="text-xs mb-3 flex-1" style={{ color: '#1e2749', opacity: 0.7, lineHeight: '1.4' }}>
                  PD your teachers won't dread. Results you can see in classrooms.
                </p>
                <span className="font-semibold text-xs" style={{ color: '#80a4ed' }}>
                  Take the PD Quiz →
                </span>
              </div>
            </a>

            {/* Superintendents */}
            <a
              href="/contact"
              className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all flex flex-col"
              style={{ textDecoration: 'none' }}
            >
              <div className="h-[140px] overflow-hidden">
                <img
                  src="/images/leader-superintendent.png"
                  alt="Superintendent"
                  className="w-full h-full object-cover object-top transition-transform group-hover:scale-105"
                  style={{ filter: 'grayscale(100%)' }}
                />
              </div>
              <div className="bg-white p-4 flex-1 flex flex-col">
                <p
                  className="font-bold mb-2 uppercase tracking-wide"
                  style={{ color: '#1e2749', fontSize: '11px', letterSpacing: '0.05em' }}
                >
                  Superintendents
                </p>
                <p className="text-xs mb-3 flex-1" style={{ color: '#1e2749', opacity: 0.7, lineHeight: '1.4' }}>
                  District-wide scale, board-ready outcomes, budget flexibility.
                </p>
                <span className="font-semibold text-xs" style={{ color: '#80a4ed' }}>
                  Let's talk →
                </span>
              </div>
            </a>

            {/* Curriculum Directors */}
            <a
              href="/free-pd-plan"
              className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all flex flex-col"
              style={{ textDecoration: 'none' }}
            >
              <div className="h-[140px] overflow-hidden">
                <img
                  src="/images/leader-curriculum.png"
                  alt="Curriculum Director"
                  className="w-full h-full object-cover object-center transition-transform group-hover:scale-105"
                  style={{ filter: 'grayscale(100%)' }}
                />
              </div>
              <div className="bg-white p-4 flex-1 flex flex-col">
                <p
                  className="font-bold mb-2 uppercase tracking-wide"
                  style={{ color: '#1e2749', fontSize: '11px', letterSpacing: '0.05em' }}
                >
                  Curriculum
                </p>
                <p className="text-xs mb-3 flex-1" style={{ color: '#1e2749', opacity: 0.7, lineHeight: '1.4' }}>
                  PD that works with what you're already doing—and actually gets used.
                </p>
                <span className="font-semibold text-xs" style={{ color: '#80a4ed' }}>
                  Take the PD Quiz →
                </span>
              </div>
            </a>

            {/* HR Directors */}
            <a
              href="/contact"
              className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all flex flex-col"
              style={{ textDecoration: 'none' }}
            >
              <div className="h-[140px] overflow-hidden">
                <img
                  src="/images/leader-hr.png"
                  alt="HR Director"
                  className="w-full h-full object-cover object-top transition-transform group-hover:scale-105"
                  style={{ filter: 'grayscale(100%)' }}
                />
              </div>
              <div className="bg-white p-4 flex-1 flex flex-col">
                <p
                  className="font-bold mb-2 uppercase tracking-wide"
                  style={{ color: '#1e2749', fontSize: '11px', letterSpacing: '0.05em' }}
                >
                  HR Directors
                </p>
                <p className="text-xs mb-3 flex-1" style={{ color: '#1e2749', opacity: 0.7, lineHeight: '1.4' }}>
                  Data that ties teacher support to retention and turnover.
                </p>
                <span className="font-semibold text-xs" style={{ color: '#80a4ed' }}>
                  Let's talk →
                </span>
              </div>
            </a>

          </div>
        </div>
      </section>

      {/* Partnership Journey */}
      <section id="blueprint" className="py-16 md:py-20" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-default">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
            A Partnership That Grows With You
          </h2>
          <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: '#1e2749', opacity: 0.7 }}>
            Start small, prove impact, scale when you're ready.
          </p>

          {/* Timeline */}
          <div className="max-w-5xl mx-auto">

            {/* Timeline connector line - visible on desktop */}
            <div className="hidden md:block relative">
              <div
                className="absolute top-[24px] left-[16.67%] right-[16.67%] h-1 rounded-full"
                style={{ backgroundColor: '#80a4ed' }}
              />
            </div>

            {/* Timeline Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">

              {/* Phase 1: IGNITE - Full Details */}
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4 relative z-10"
                  style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                >
                  1
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-md w-full" style={{ border: '2px solid #ffba06' }}>
                  <span
                    className="inline-block px-3 py-1 text-xs font-bold rounded-full mb-3"
                    style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                  >
                    START HERE
                  </span>
                  <h3 className="text-2xl font-bold" style={{ color: '#1e2749' }}>IGNITE</h3>
                  <p className="text-sm font-medium mb-4" style={{ color: '#ffba06' }}>Getting Started</p>
                  <p className="text-2xl font-bold mb-4" style={{ color: '#1e2749' }}>~$33,600<span className="text-sm font-normal">/year</span></p>

                  <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
                    Build buy-in with leadership and a pilot group. <strong>95% report saving planning time.</strong>
                  </p>

                  <ul className="text-sm text-left space-y-2 mb-4" style={{ color: '#1e2749', opacity: 0.8 }}>
                    <li>• 2 On-Campus PD Days</li>
                    <li>• 4 Virtual Strategy Sessions</li>
                    <li>• 2 Executive Impact Sessions</li>
                    <li>• Learning Hub for pilot group</li>
                    <li>• Leadership Dashboard</li>
                  </ul>

                  <a
                    href="/free-pd-plan"
                    className="block text-center py-3 rounded-lg font-bold transition-all hover:scale-105"
                    style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                  >
                    Get Your Free PD Plan
                  </a>
                </div>
              </div>

              {/* Phase 2: ACCELERATE - Small Teaser */}
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4 relative z-10"
                  style={{ backgroundColor: '#80a4ed', color: '#ffffff' }}
                >
                  2
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm w-full">
                  <h3 className="text-2xl font-bold" style={{ color: '#1e2749' }}>ACCELERATE</h3>
                  <p className="text-sm font-medium mb-4" style={{ color: '#ffba06' }}>Full Implementation</p>
                  <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                    Expand to your entire staff. Schools see <strong>38% more strategies actually used in classrooms</strong> at this phase.
                  </p>
                </div>
              </div>

              {/* Phase 3: SUSTAIN - Small Teaser */}
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4 relative z-10"
                  style={{ backgroundColor: '#80a4ed', color: '#ffffff' }}
                >
                  3
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm w-full">
                  <h3 className="text-2xl font-bold" style={{ color: '#1e2749' }}>SUSTAIN</h3>
                  <p className="text-sm font-medium mb-4" style={{ color: '#ffba06' }}>Long-Term Partnership</p>
                  <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                    Embed lasting change with advanced analytics and <strong>24/7 support from Desi</strong>, our AI teaching assistant.
                  </p>
                </div>
              </div>

            </div>

            {/* 30-day Promise */}
            <div
              className="flex items-center justify-center gap-3 p-4 rounded-lg mt-8 max-w-2xl mx-auto"
              style={{ backgroundColor: '#ffffff', border: '2px solid #ffba06' }}
            >
              <svg className="w-6 h-6 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <p className="font-medium" style={{ color: '#1e2749' }}>
                Our Promise: 30-day turnaround on custom content requests for partner schools
              </p>
            </div>

            {/* Bottom Text */}
            <div className="mt-10 text-center">
              <p className="text-xl md:text-2xl font-semibold" style={{ color: '#1e2749' }}>
                Personalized support and feedback that drives real change, daily, weekly, monthly.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Funding & Pricing Support */}
      <section className="py-12 md:py-16" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          <div
            className="rounded-xl p-6 md:p-8 max-w-4xl mx-auto"
            style={{ backgroundColor: '#f5f5f5' }}
          >
            <h3 className="text-xl md:text-2xl font-bold mb-4" style={{ color: '#1e2749' }}>
              We Help You Find Funding
            </h3>
            <div className="space-y-4">
              <p style={{ color: '#1e2749' }}>
                Most partner schools fund TDI through Title II-A, ESSER, or local professional development budgets. Our team will help you identify the right funding source for your school.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span style={{ color: '#1e2749' }}>Bulk pricing available for Learning Hub memberships</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span style={{ color: '#1e2749' }}>Guidance on Title II-A, ESSER, and grant applications</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span style={{ color: '#1e2749' }}>Flexible partnership structures to fit your budget</span>
                </li>
              </ul>
              {/* Mission Statement - More Prominent */}
              <div className="mt-8 pt-6 border-t" style={{ borderColor: '#e5e7eb' }}>
                <p className="text-lg md:text-xl font-semibold mb-4" style={{ color: '#1e2749' }}>
                  We believe cost should never stop a school from giving the best to their staff.
                </p>
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 font-semibold transition-all hover:opacity-80"
                  style={{ color: '#ffba06' }}
                >
                  Let's find funding together
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CoursesSection />

      {/* Calculator Section */}
      <section className="py-16" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-default">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
            See the Potential Impact
          </h2>
          <p className="text-center mb-10 max-w-2xl mx-auto" style={{ color: '#1e2749', opacity: 0.7 }}>
            Whether you're exploring for your school or yourself, see what TDI could mean for you.
          </p>
          <TabbedCalculator />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#80a4ed' }}>
        <div className="container-default text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Ready to See What TDI Can Do for Your School?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.8 }}>
            Let's talk through your goals, staff size, and timeline. No pressure, just a conversation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/free-pd-plan"
              className="px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105"
              style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
            >
              Get Your Free PD Plan
            </a>
            <a
              href="/contact"
              className="px-8 py-4 rounded-lg font-bold text-lg border-2 transition-all hover:bg-white/10"
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
