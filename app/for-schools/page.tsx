import Link from 'next/link';

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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/for-schools/pricing"
                className="px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105"
                style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
              >
                See Pricing
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
        </div>
      </section>

      {/* Stats Section - MOVED UP */}
      <section className="py-16" style={{ backgroundColor: '#ffba06' }}>
        <div className="container-default">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-5xl md:text-6xl font-bold mb-2" style={{ color: '#1e2749' }}>38%</p>
              <p style={{ color: '#1e2749', opacity: 0.8 }}>increase in strategy implementation</p>
            </div>
            <div>
              <p className="text-5xl md:text-6xl font-bold mb-2" style={{ color: '#1e2749' }}>95%</p>
              <p style={{ color: '#1e2749', opacity: 0.8 }}>of teachers said TDI saved them planning time</p>
            </div>
            <div>
              <p className="text-5xl md:text-6xl font-bold mb-2" style={{ color: '#1e2749' }}>21</p>
              <p style={{ color: '#1e2749', opacity: 0.8 }}>states with TDI partner schools</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points - EMOJIS REMOVED */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container-default">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
            You Already Know Traditional PD Isn't Working
          </h2>
          <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: '#1e2749', opacity: 0.7 }}>
            You need something different. So do your teachers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="p-6 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#1e2749' }}>Teachers dread it.</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                The eye rolls start before the session does.
              </p>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#1e2749' }}>No measurable outcomes.</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                You can't prove ROI to your board.
              </p>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#1e2749' }}>Burnout drives turnover.</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                You're losing good teachers faster than you can hire.
              </p>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#1e2749' }}>Wellness feels fluffy.</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                No data, no accountability, no change.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Schools Get */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-default">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#1e2749' }}>
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
                Track engagement, completion, and implementation rates. Report real data to your board, not attendance sheets.
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

      {/* Testimonials - MOVED UP */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#80a4ed' }}>
        <div className="container-default">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#ffffff' }}>
            What School Leaders Are Saying
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-xl">
              <p className="mb-4 italic" style={{ color: '#1e2749' }}>
                "This isn't sit-and-get. Our teachers are actually learning how to work smarter and feel better doing it."
              </p>
              <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Lisa M.</p>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>K-8 School Director, WA</p>
            </div>
            <div className="bg-white p-6 rounded-xl">
              <p className="mb-4 italic" style={{ color: '#1e2749' }}>
                "Before, we got eye rolls. Now, we hear: 'When's the team coming next?' That's when you know PD is finally working."
              </p>
              <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Daniel R.</p>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>High School Principal, CA</p>
            </div>
            <div className="bg-white p-6 rounded-xl">
              <p className="mb-4 italic" style={{ color: '#1e2749' }}>
                "TDI didn't just drop a slide deck and bounce. Every part of the experience felt personal. Our staff felt understood."
              </p>
              <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Julie H.</p>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>Principal, MI</p>
            </div>
          </div>
        </div>
      </section>

      {/* Built for Every Leader - EMOJIS REMOVED, CTAs ADDED */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container-default">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
            Built for Every Leader in the Building
          </h2>
          <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: '#1e2749', opacity: 0.7 }}>
            No matter your role, TDI meets you where you are.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="p-6 rounded-xl text-center" style={{ backgroundColor: '#f5f5f5' }}>
              <h3 className="font-bold text-lg mb-3" style={{ color: '#1e2749' }}>Principals</h3>
              <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
                PD your teachers won't dread. Results you can see in classrooms.
              </p>
              <Link
                href="/contact"
                className="text-sm font-semibold"
                style={{ color: '#80a4ed' }}
              >
                Let's talk →
              </Link>
            </div>
            <div className="p-6 rounded-xl text-center" style={{ backgroundColor: '#f5f5f5' }}>
              <h3 className="font-bold text-lg mb-3" style={{ color: '#1e2749' }}>Superintendents</h3>
              <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
                District-wide scale, board-ready outcomes, and budget flexibility.
              </p>
              <Link
                href="/contact"
                className="text-sm font-semibold"
                style={{ color: '#80a4ed' }}
              >
                Let's talk →
              </Link>
            </div>
            <div className="p-6 rounded-xl text-center" style={{ backgroundColor: '#f5f5f5' }}>
              <h3 className="font-bold text-lg mb-3" style={{ color: '#1e2749' }}>Curriculum Directors</h3>
              <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
                PD that integrates with existing initiatives and shows measurable implementation.
              </p>
              <Link
                href="/contact"
                className="text-sm font-semibold"
                style={{ color: '#80a4ed' }}
              >
                Let's talk →
              </Link>
            </div>
            <div className="p-6 rounded-xl text-center" style={{ backgroundColor: '#f5f5f5' }}>
              <h3 className="font-bold text-lg mb-3" style={{ color: '#1e2749' }}>HR Directors</h3>
              <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
                Data that ties teacher support to retention and turnover reduction.
              </p>
              <Link
                href="/contact"
                className="text-sm font-semibold"
                style={{ color: '#80a4ed' }}
              >
                Let's talk →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-default">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
            Transparent Pricing for Schools
          </h2>
          <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: '#1e2749', opacity: 0.7 }}>
            We don't hide our pricing behind a sales call. Our phased approach grows with your school.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* IGNITE */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-xl mb-1" style={{ color: '#1e2749' }}>IGNITE</h3>
              <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>Phase 1: Leadership + Pilot Group</p>
              <p className="text-3xl font-bold mb-4" style={{ color: '#1e2749' }}>~$33,600<span className="text-sm font-normal">/year</span></p>
              <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
                Start with buy-in. Build momentum with leadership and a pilot group before full rollout.
              </p>
              <ul className="text-sm space-y-2 mb-6" style={{ color: '#1e2749', opacity: 0.8 }}>
                <li>• 2 On-Campus PD Days</li>
                <li>• 4 Virtual Strategy Sessions</li>
                <li>• 2 Executive Impact Sessions</li>
                <li>• Learning Hub access for pilot group</li>
                <li>• Leadership Dashboard</li>
              </ul>
              <Link
                href="/contact"
                className="block text-center py-3 rounded-lg font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: '#1e2749', color: '#ffffff' }}
              >
                Schedule a Call
              </Link>
            </div>

            {/* ACCELERATE */}
            <div className="bg-white p-6 rounded-xl shadow-md relative" style={{ border: '2px solid #ffba06' }}>
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold rounded-full"
                style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
              >
                Most Popular
              </span>
              <h3 className="font-bold text-xl mb-1" style={{ color: '#1e2749' }}>ACCELERATE</h3>
              <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>Phase 2: Full Staff Rollout</p>
              <p className="text-3xl font-bold mb-4" style={{ color: '#1e2749' }}>~$54,240<span className="text-sm font-normal">/year</span></p>
              <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
                Expand to your entire staff with proven strategies and deeper support.
              </p>
              <ul className="text-sm space-y-2 mb-6" style={{ color: '#1e2749', opacity: 0.8 }}>
                <li>• Everything in IGNITE</li>
                <li>• Learning Hub for ALL staff</li>
                <li>• 6 Executive Impact Sessions</li>
                <li>• Teachers Deserve It book per staff</li>
                <li>• Expanded virtual support</li>
              </ul>
              <Link
                href="/contact"
                className="block text-center py-3 rounded-lg font-semibold transition-all hover:scale-105"
                style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
              >
                Schedule a Call
              </Link>
            </div>

            {/* SUSTAIN */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-xl mb-1" style={{ color: '#1e2749' }}>SUSTAIN</h3>
              <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>Phase 3: Embedded Systems</p>
              <p className="text-3xl font-bold mb-4" style={{ color: '#1e2749' }}>~$84,240<span className="text-sm font-normal">/year</span></p>
              <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
                Embed lasting change with advanced tools and ongoing support.
              </p>
              <ul className="text-sm space-y-2 mb-6" style={{ color: '#1e2749', opacity: 0.8 }}>
                <li>• Everything in ACCELERATE</li>
                <li>• 12 Virtual PD Sessions</li>
                <li>• 4 Leadership Executive Sessions</li>
                <li>• Desi AI Assistant</li>
                <li>• Priority support</li>
              </ul>
              <Link
                href="/contact"
                className="block text-center py-3 rounded-lg font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: '#1e2749', color: '#ffffff' }}
              >
                Schedule a Call
              </Link>
            </div>
          </div>

          <p className="text-center mt-8 text-sm" style={{ color: '#1e2749', opacity: 0.6 }}>
            *Pricing shown is for a typical 60-staff school. Varies based on staff size and customization.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#1e2749' }}>
        <div className="container-default text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Ready to See What TDI Can Do for Your School?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.8 }}>
            Let's talk through your goals, staff size, and timeline. No pressure, just a conversation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105"
              style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
            >
              Schedule a Call
            </Link>
            <Link
              href="/for-schools/pricing"
              className="px-8 py-4 rounded-lg font-bold text-lg border-2 transition-all hover:bg-white/10"
              style={{ borderColor: '#ffffff', color: '#ffffff' }}
            >
              See Full Pricing Details
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
