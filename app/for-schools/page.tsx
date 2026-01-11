import Link from 'next/link';
import { CoursesSection } from '@/components/CoursesSection';
import { SchoolsROICalculator } from '@/components/calculators/SchoolsROICalculator';
import { BeforeAfterStats } from '@/components/BeforeAfterStats';

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
            backgroundImage: "url('/images/hero-for-schools.webp')",
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
              Professional development that actually works,<br />with outcomes you can measure and report.
            </p>
            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <a
                href="#blueprint"
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-bold text-lg transition-all hover-glow"
                style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
              >
                Explore the TDI Blueprint
              </a>
              <a
                href="/pd-diagnostic"
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-bold text-lg border-2 transition-all hover-lift"
                style={{ borderColor: '#ffffff', color: '#ffffff' }}
              >
                Take the Free Diagnostic
              </a>
            </div>
            <p className="text-sm mt-4 text-center" style={{ color: '#ffffff', opacity: 0.7 }}>
              Most leaders identify their PD type in under 60 seconds.
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
              <p style={{ color: '#ffffff', opacity: 0.8 }}>more strategies actually<br />used in classrooms</p>
            </div>
            <div>
              <p className="text-5xl md:text-6xl font-bold mb-2" style={{ color: '#ffffff' }}>95%</p>
              <p style={{ color: '#ffffff', opacity: 0.8 }}>of teachers said TDI saved<br />them planning time</p>
            </div>
            <div>
              <p className="text-5xl md:text-6xl font-bold mb-2" style={{ color: '#ffffff' }}>21</p>
              <p style={{ color: '#ffffff', opacity: 0.8 }}>states with TDI educators<br />+ partner schools</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points - Redesigned with Central Stat */}
      <section className="py-12 md:py-14" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
            You Already Know Traditional PD Isn't Working
          </h2>
          <p className="text-center mb-8 max-w-2xl mx-auto" style={{ color: '#1e2749', opacity: 0.7 }}>
            You need something different. So do your teachers.
          </p>

          {/* Desktop Layout: Cards around central stat */}
          <div className="hidden lg:block max-w-5xl mx-auto">
            <div className="grid gap-4 items-center" style={{ gridTemplateColumns: '1.3fr 1fr 1.3fr' }}>
              {/* Left Column - 2 cards stacked */}
              <div className="flex flex-col gap-4">
                {/* Card 1: Teachers dread it */}
                <div className="p-4 rounded-xl text-center shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-lg" style={{ backgroundColor: '#f8f9fa' }}>
                  <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center rounded-full" style={{ backgroundColor: '#80a4ed' }}>
                    <svg className="w-5 h-5" fill="#ffffff" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="#ffffff" strokeWidth="2"/>
                      <circle cx="8" cy="10" r="1.5" fill="#ffffff"/>
                      <circle cx="16" cy="10" r="1.5" fill="#ffffff"/>
                      <path d="M8 16c1.5-2 6.5-2 8 0" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h3 className="font-bold text-sm mb-1 whitespace-nowrap" style={{ color: '#1e2749' }}>Teachers dread it.</h3>
                  <p className="text-xs whitespace-nowrap" style={{ color: '#1e2749', opacity: 0.7 }}>
                    The eye rolls start before the session does.
                  </p>
                </div>

                {/* Card 2: No measurable outcomes */}
                <div className="p-4 rounded-xl text-center shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-lg" style={{ backgroundColor: '#f8f9fa' }}>
                  <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center rounded-full" style={{ backgroundColor: '#80a4ed' }}>
                    <svg className="w-5 h-5" fill="#ffffff" viewBox="0 0 24 24">
                      <rect x="3" y="14" width="4" height="6" rx="1" fill="#ffffff"/>
                      <rect x="10" y="10" width="4" height="10" rx="1" fill="#ffffff"/>
                      <rect x="17" y="6" width="4" height="14" rx="1" fill="#ffffff"/>
                      <line x1="4" y1="4" x2="20" y2="20" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h3 className="font-bold text-sm mb-1 whitespace-nowrap" style={{ color: '#1e2749' }}>No measurable outcomes.</h3>
                  <p className="text-xs whitespace-nowrap" style={{ color: '#1e2749', opacity: 0.7 }}>
                    You can't show the impact to your board.
                  </p>
                </div>
              </div>

              {/* Center - 44% Stat */}
              <div className="flex items-center justify-center">
                <div
                  className="w-44 h-44 rounded-full flex flex-col items-center justify-center animate-fade-in shadow-xl cursor-pointer transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: '#1e2749' }}
                >
                  <span className="text-4xl font-bold mb-1" style={{ color: '#ffba06' }}>44%</span>
                  <span className="text-xs text-center px-3 leading-tight" style={{ color: '#ffffff', opacity: 0.9 }}>
                    of teachers leave<br />within 5 years
                  </span>
                </div>
              </div>

              {/* Right Column - 2 cards stacked */}
              <div className="flex flex-col gap-4">
                {/* Card 3: Burnout drives turnover */}
                <div className="p-4 rounded-xl text-center shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-lg" style={{ backgroundColor: '#f8f9fa' }}>
                  <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center rounded-full" style={{ backgroundColor: '#80a4ed' }}>
                    <svg className="w-5 h-5" fill="#ffffff" viewBox="0 0 24 24">
                      <path d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z" fill="#ffffff"/>
                      <path d="M12 10l4 3-4 3V10z" fill="#ffffff"/>
                    </svg>
                  </div>
                  <h3 className="font-bold text-sm mb-1 whitespace-nowrap" style={{ color: '#1e2749' }}>Burnout drives turnover.</h3>
                  <p className="text-xs whitespace-nowrap" style={{ color: '#1e2749', opacity: 0.7 }}>
                    You're losing good teachers faster than you can hire.
                  </p>
                </div>

                {/* Card 4: Wellness feels fluffy */}
                <div className="p-4 rounded-xl text-center shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-lg" style={{ backgroundColor: '#f8f9fa' }}>
                  <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center rounded-full" style={{ backgroundColor: '#80a4ed' }}>
                    <svg className="w-5 h-5" fill="#ffffff" viewBox="0 0 24 24">
                      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h.71C7.37 7.69 9.48 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3s-1.34 3-3 3z" fill="#ffffff"/>
                      <text x="12" y="15" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">?</text>
                    </svg>
                  </div>
                  <h3 className="font-bold text-sm mb-1 whitespace-nowrap" style={{ color: '#1e2749' }}>Wellness feels fluffy.</h3>
                  <p className="text-xs whitespace-nowrap" style={{ color: '#1e2749', opacity: 0.7 }}>
                    No data, no accountability, no change.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Layout: Stacked */}
          <div className="lg:hidden max-w-md mx-auto">
            {/* Central Stat - Mobile */}
            <div className="flex justify-center mb-6">
              <div
                className="w-44 h-44 rounded-full flex flex-col items-center justify-center animate-fade-in shadow-xl cursor-pointer transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: '#1e2749' }}
              >
                <span className="text-4xl font-bold mb-1" style={{ color: '#ffba06' }}>44%</span>
                <span className="text-xs text-center px-4 leading-tight" style={{ color: '#ffffff', opacity: 0.9 }}>
                  of teachers leave<br />within 5 years
                </span>
              </div>
            </div>

            {/* Cards - Mobile */}
            <div className="flex flex-col gap-3">
              <div className="p-4 rounded-xl text-center shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-lg" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center rounded-full" style={{ backgroundColor: '#80a4ed' }}>
                  <svg className="w-5 h-5" fill="#ffffff" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="#ffffff" strokeWidth="2"/>
                    <circle cx="8" cy="10" r="1.5" fill="#ffffff"/>
                    <circle cx="16" cy="10" r="1.5" fill="#ffffff"/>
                    <path d="M8 16c1.5-2 6.5-2 8 0" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="font-bold text-sm mb-1 whitespace-nowrap" style={{ color: '#1e2749' }}>Teachers dread it.</h3>
                <p className="text-xs whitespace-nowrap" style={{ color: '#1e2749', opacity: 0.7 }}>
                  The eye rolls start before the session does.
                </p>
              </div>

              <div className="p-4 rounded-xl text-center shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-lg" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center rounded-full" style={{ backgroundColor: '#80a4ed' }}>
                  <svg className="w-5 h-5" fill="#ffffff" viewBox="0 0 24 24">
                    <rect x="3" y="14" width="4" height="6" rx="1" fill="#ffffff"/>
                    <rect x="10" y="10" width="4" height="10" rx="1" fill="#ffffff"/>
                    <rect x="17" y="6" width="4" height="14" rx="1" fill="#ffffff"/>
                    <line x1="4" y1="4" x2="20" y2="20" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="font-bold text-sm mb-1 whitespace-nowrap" style={{ color: '#1e2749' }}>No measurable outcomes.</h3>
                <p className="text-xs whitespace-nowrap" style={{ color: '#1e2749', opacity: 0.7 }}>
                  You can't show the impact to your board.
                </p>
              </div>

              <div className="p-4 rounded-xl text-center shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-lg" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center rounded-full" style={{ backgroundColor: '#80a4ed' }}>
                  <svg className="w-5 h-5" fill="#ffffff" viewBox="0 0 24 24">
                    <path d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z" fill="#ffffff"/>
                    <path d="M12 10l4 3-4 3V10z" fill="#ffffff"/>
                  </svg>
                </div>
                <h3 className="font-bold text-sm mb-1 whitespace-nowrap" style={{ color: '#1e2749' }}>Burnout drives turnover.</h3>
                <p className="text-xs whitespace-nowrap" style={{ color: '#1e2749', opacity: 0.7 }}>
                  You're losing good teachers faster than you can hire.
                </p>
              </div>

              <div className="p-4 rounded-xl text-center shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-lg" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center rounded-full" style={{ backgroundColor: '#80a4ed' }}>
                  <svg className="w-5 h-5" fill="#ffffff" viewBox="0 0 24 24">
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h.71C7.37 7.69 9.48 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3s-1.34 3-3 3z" fill="#ffffff"/>
                    <text x="12" y="15" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">?</text>
                  </svg>
                </div>
                <h3 className="font-bold text-sm mb-1 whitespace-nowrap" style={{ color: '#1e2749' }}>Wellness feels fluffy.</h3>
                <p className="text-xs whitespace-nowrap" style={{ color: '#1e2749', opacity: 0.7 }}>
                  No data, no accountability, no change.
                </p>
              </div>
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
              <h3 className="font-bold text-lg mb-3" style={{ color: '#1e2749' }}>Flexible<br />Learning</h3>
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
              <h3 className="font-bold text-lg mb-3" style={{ color: '#1e2749' }}>Wellness<br />That Works</h3>
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
              <h3 className="font-bold text-lg mb-3" style={{ color: '#1e2749' }}>Phased<br />Approach</h3>
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
                  src="/images/leader-principal.webp"
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
                  src="/images/leader-superintendent.webp"
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
                  src="/images/leader-curriculum.webp"
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
                  src="/images/leader-hr.webp"
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
              <p className="text-sm font-medium" style={{ color: '#1e2749' }}>
                Our Promise: 30-day turnaround on custom content requests for partner schools
              </p>
            </div>

            {/* Bottom Text */}
            <div className="mt-10 text-center">
              <p className="text-xl md:text-2xl font-semibold" style={{ color: '#1e2749' }}>
                Personalized support and feedback that drives real change, daily, weekly, monthly.
              </p>
            </div>

            {/* Link to Full Partnership Page */}
            <div className="mt-8 text-center">
              <Link
                href="/how-we-partner"
                className="inline-flex items-center gap-2 text-lg font-semibold transition-all hover:gap-3"
                style={{ color: '#80a4ed' }}
              >
                See how our phased partnerships work in detail
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Not Sure Where to Start */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4" style={{ color: '#1e2749' }}>
            Not Sure Where to Start?
          </h3>
          <p className="text-lg mb-6" style={{ color: '#1e2749', opacity: 0.8 }}>
            Most school leaders can identify their current PD type in under 2 minutes.
            Take our free diagnostic to see where you are today and which phase fits your goals.
          </p>
          <a
            href="/pd-diagnostic"
            className="inline-block px-8 py-3 rounded-full font-semibold transition-all hover:shadow-lg"
            style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
          >
            Take the PD Diagnostic
          </a>
        </div>
      </section>

      {/* Funding & Pricing Support */}
      <section className="py-12 md:py-16" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          <div
            className="rounded-xl p-6 md:p-8 max-w-4xl mx-auto"
            style={{ backgroundColor: '#1e2749' }}
          >
            <h3 className="text-xl md:text-2xl font-bold mb-4" style={{ color: '#ffffff' }}>
              We Help You Find Funding
            </h3>
            <div className="space-y-4">
              <p style={{ color: '#ffffff' }}>
                Most partner schools fund TDI through Title II-A, ESSER, or local professional development budgets. Our team will help you identify the right funding source for your school.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span style={{ color: '#ffffff' }}>Bulk pricing available for Learning Hub memberships</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span style={{ color: '#ffffff' }}>Guidance on Title II-A, ESSER, and grant applications</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span style={{ color: '#ffffff' }}>Flexible partnership structures to fit your budget</span>
                </li>
              </ul>
              {/* Mission Statement - More Prominent */}
              <div className="mt-8 pt-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <p className="text-lg md:text-xl font-semibold mb-4" style={{ color: '#ffffff' }}>
                  We believe cost should never stop a school from giving the best to their staff.
                </p>
                <a
                  href="/funding"
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

      {/* FAQ Callout for Admins */}
      <div className="text-center py-8" style={{ backgroundColor: '#ffffff' }}>
        <p style={{ color: '#1e2749', opacity: 0.8 }}>
          Have questions about implementation, pricing, or funding?{' '}
          <a
            href="/faq"
            className="font-semibold underline hover:opacity-80 transition-opacity"
            style={{ color: '#ffba06' }}
          >
            Check our FAQ
          </a>
        </p>
      </div>

      <CoursesSection />

      {/* Verified Outcomes Stats */}
      <BeforeAfterStats
        title="Verified Outcomes from TDI Partner Schools"
        stats={[
          {
            label: 'Likelihood to stay in teaching (10-point scale)',
            beforeValue: '2-4',
            afterValue: '5-7',
            beforeNum: 3,
          },
          {
            label: 'Reported stress reduction (10-point scale)',
            beforeValue: '9',
            afterValue: '5-7',
            beforeNum: 9,
          },
        ]}
      />

      {/* ROI Calculator Section */}
      <section className="py-16" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-default">
          <SchoolsROICalculator />
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
              style={{ backgroundColor: '#1e2749', color: '#ffffff' }}
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
