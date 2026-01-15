import Link from 'next/link';

export default function AboutPage() {
  return (
    <main>
      {/* Hero Section with Background Image */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/hero-about.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          }}
        />

        {/* Navy Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(30, 39, 73, 0.65) 0%, rgba(30, 39, 73, 0.85) 100%)'
          }}
        />

        {/* Content */}
        <div className="relative z-10 container-default text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#ffffff' }}>
            We Believe Teaching<br />Shouldn't Feel Like Survival
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.9 }}>
            We're on a mission to build a system that actually supports the educators inside it.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16" style={{ backgroundColor: '#80a4ed' }}>
        <div className="container-default">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-5xl mx-auto">
            <div>
              <p className="text-5xl md:text-6xl font-bold mb-2" style={{ color: '#ffffff' }}>87K+</p>
              <p style={{ color: '#ffffff', opacity: 0.9 }}>educators in our community</p>
            </div>
            <div className="md:col-span-1">
              <p className="text-3xl md:text-4xl font-bold mb-2 whitespace-nowrap" style={{ color: '#ffffff' }}>Improved Retention</p>
              <p className="text-sm" style={{ color: '#ffffff', opacity: 0.9 }}>Administrators report stronger morale,<br />greater trust, and improved retention<br />after TDI Support Sessions</p>
            </div>
            <div>
              <p className="text-5xl md:text-6xl font-bold mb-2" style={{ color: '#ffffff' }}>95%</p>
              <p style={{ color: '#ffffff', opacity: 0.9 }}>of teachers saved planning time</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Started */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("/images/about-teacher-pointing.webp")',
            backgroundPosition: 'right 15%',
            backgroundAttachment: 'fixed',
          }}
        />

        {/* Dark Gradient Overlay - darker on left for text */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(30, 39, 73, 0.97) 0%, rgba(30, 39, 73, 0.92) 40%, rgba(30, 39, 73, 0.75) 70%, rgba(30, 39, 73, 0.6) 100%)'
          }}
        />

        {/* Content */}
        <div className="relative z-10 container-default">
          <div className="max-w-6xl mx-auto">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

              {/* Left: The Story */}
              <div className="text-left">
                <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: '#ffffff' }}>
                  How It Started
                </h2>

                <div className="space-y-4" style={{ color: '#ffffff' }}>
                  <p className="text-xl font-semibold" style={{ color: '#ffba06' }}>
                    Teachers Deserve It was born from burnout.
                  </p>

                  <p style={{ opacity: 0.85 }}>
                    We all knew the feeling... Walking into another teacher institute day (or teacher work day) and you're greeted with donuts. As you settle into the auditorium for sessions, you're not surprised to see a full agenda, with limited breaks, and a 45-minute lunch. The topics? Ones that have nothing to do with what you actually needed in your classrooms. Hours of "someday you'll use this" and "you'll need time for outside planning."
                  </p>

                  <p className="font-semibold" style={{ opacity: 0.9 }}>
                    None of it helped us be better for our students on Monday.
                  </p>

                  <p style={{ opacity: 0.85 }}>
                    That system was not built with teachers in mind. TDI was - with teachers at its core, in every decision we make, building a movement that's changing education from the inside out.
                  </p>

                  <p style={{ opacity: 0.85 }}>
                    School leaders noticed too. Principals started asking: how do we bring this to our whole building? How do we keep our best teachers from leaving?
                  </p>
                </div>
              </div>

              {/* Right: The Blueprint */}
              <div className="text-left">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                  <h3 className="text-xl font-bold mb-6" style={{ color: '#ffba06' }}>
                    The TDI Blueprint
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#ffba06' }}
                      >
                        <span className="font-bold" style={{ color: '#1e2749' }}>1</span>
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: '#ffffff' }}>Respect Teachers' Time</p>
                        <p className="text-sm" style={{ color: '#ffffff', opacity: 0.7 }}>PD that fits into real life, not consumes it</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#ffba06' }}
                      >
                        <span className="font-bold" style={{ color: '#1e2749' }}>2</span>
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: '#ffffff' }}>Deliver Real Strategies</p>
                        <p className="text-sm" style={{ color: '#ffffff', opacity: 0.7 }}>Practical tools that work Monday morning</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#ffba06' }}
                      >
                        <span className="font-bold" style={{ color: '#1e2749' }}>3</span>
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: '#ffffff' }}>Prioritize Wellness</p>
                        <p className="text-sm" style={{ color: '#ffffff', opacity: 0.7 }}>Sustainable teaching starts with supported teachers</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#ffba06' }}
                      >
                        <span className="font-bold" style={{ color: '#1e2749' }}>4</span>
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: '#ffffff' }}>Measure What Matters</p>
                        <p className="text-sm" style={{ color: '#ffffff', opacity: 0.7 }}>Real impact, not just attendance sheets</p>
                      </div>
                    </div>
                  </div>

                  {/* Admin Outcomes */}
                  <div className="mt-6 pt-6 border-t border-white/20">
                    <p className="text-sm font-semibold mb-3" style={{ color: '#ffba06' }}>Built for District Success:</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(255,186,6,0.2)', color: '#ffba06' }}>Staff Retention</span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(255,186,6,0.2)', color: '#ffba06' }}>Culture Building</span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(255,186,6,0.2)', color: '#ffba06' }}>Measurable ROI</span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(255,186,6,0.2)', color: '#ffba06' }}>Scalable PD</span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(255,186,6,0.2)', color: '#ffba06' }}>Teacher Morale</span>
                    </div>
                  </div>

                  <p className="text-sm italic mt-4" style={{ color: '#ffffff', opacity: 0.8 }}>
                    We stand behind our work with a 30-day turnaround guarantee on custom requests for partner schools.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* TEDx Video */}
      <section className="py-12" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-default">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-6">
              <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#ffba06' }}>
                Watch Rae's Story
              </p>
              <h3 className="text-xl font-bold mt-2" style={{ color: '#1e2749' }}>
                TEDx Talk: Why Teachers Deserve Better
              </h3>
            </div>
            <div className="relative w-full rounded-xl overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/OLzaa7Hv3mo"
                title="Rae Hughart TEDx Talk"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <p className="text-center text-sm mt-4" style={{ color: '#1e2749', opacity: 0.6 }}>
              This talk has inspired thousands of educators to rethink professional development.
            </p>
          </div>
        </div>
      </section>

      {/* Our Impact Section */}
      <section className="py-16" style={{ backgroundColor: '#ffba06' }}>
        <div className="container-default">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10" style={{ color: '#1e2749' }}>
            Our Impact So Far
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold" style={{ color: '#1e2749' }}>87,000+</p>
              <p className="text-sm md:text-base font-medium" style={{ color: '#1e2749' }}>Educators in Our Community</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold" style={{ color: '#1e2749' }}>21</p>
              <p className="text-sm md:text-base font-medium" style={{ color: '#1e2749' }}>States with Partner Schools</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold" style={{ color: '#1e2749' }}>65%</p>
              <p className="text-sm md:text-base font-medium" style={{ color: '#1e2749' }}>Implementation Rate</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold" style={{ color: '#1e2749' }}>4.8/5</p>
              <p className="text-sm md:text-base font-medium" style={{ color: '#1e2749' }}>Average Course Rating</p>
            </div>
          </div>

          <p className="text-center text-sm mt-8 max-w-2xl mx-auto" style={{ color: '#1e2749', opacity: 0.8 }}>
            Industry average PD implementation is just 10%.<br />Our teachers actually use what they learn because<br />it's built for Monday morning, not "someday."
          </p>
        </div>
      </section>

      {/* Meet Rae Section */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-default">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#1e2749' }}>
            Meet the Founder
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            {/* Photo */}
            <div className="flex justify-center">
              <img
                src="/images/rae-headshot.webp"
                alt="Rae Hughart"
                className="rounded-2xl shadow-lg w-full max-w-md"
                style={{ filter: 'grayscale(100%)' }}
              />
            </div>

            {/* Bio */}
            <div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#1e2749' }}>Rae Hughart</h3>
              <p className="text-lg mb-4" style={{ color: '#80a4ed' }}>CEO & Founder</p>

              <p className="mb-4" style={{ color: '#1e2749', opacity: 0.8 }}>
                Rae Hughart is an award-winning educator, internationally recognized speaker, and bestselling author dedicated to transforming how we support teachers.
              </p>
              <p className="mb-6" style={{ color: '#1e2749', opacity: 0.8 }}>
                After experiencing burnout firsthand, she founded Teachers Deserve It to create sustainable professional development that respects educators' time while delivering real results.
              </p>

              {/* Links */}
              <div className="space-y-3">
                <a
                  href="https://www.youtube.com/watch?v=OLzaa7Hv3mo&list=PPSV"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 font-semibold transition-colors hover:opacity-80"
                  style={{ color: '#1e2749' }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  Watch the TEDx Talk
                </a>

                <a
                  href="https://www.amazon.com/dp/1951600401?ref=cm_sw_r_ffobk_cp_ud_dp_QE98EJQJZH2CF260TPNZ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 font-semibold transition-colors hover:opacity-80"
                  style={{ color: '#1e2749' }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L3 7l1.63 1.27A2 2 0 0 0 4 10v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-.63-1.73L21 7l-9-5zM6 10h12v8H6v-8zm6-5.5L17.5 8H6.5L12 4.5z"/>
                  </svg>
                  Books on Amazon
                </a>
              </div>

{/* Social Links */}
<div className="flex gap-4 mt-6">
  <a
    href="https://www.instagram.com/raehughart/"
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
    style={{ backgroundColor: '#1e2749' }}
  >
    <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  </a>
  <a
    href="https://www.tiktok.com/@raehughartedu"
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
    style={{ backgroundColor: '#1e2749' }}
  >
    <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  </a>
  <a
    href="https://www.linkedin.com/in/rae-hughart/"
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
    style={{ backgroundColor: '#1e2749' }}
  >
    <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  </a>
  <a
    href="https://www.facebook.com/TeachFurther/"
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
    style={{ backgroundColor: '#1e2749' }}
  >
    <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  </a>
</div>
            </div>
          </div>

        </div>
      </section>

      {/* Our Community */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#1e2749' }}>
        <div className="container-default">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: '#ffba06' }}>
              The educators in our community share something.
            </h2>
            <p className="text-lg md:text-xl" style={{ color: '#ffffff', opacity: 0.9 }}>
              They're done pretending burnout is a badge of honor. They're practical optimists who believe there's a smarter way to do this work. They're still here because they still believe in teaching. They just refuse to destroy themselves doing it.
            </p>
          </div>
        </div>
      </section>

      {/* The Team */}
      <section className="py-20" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-default">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
            The Team That Makes It Possible
          </h2>
          <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: '#1e2749', opacity: 0.7 }}>
            A passionate group of educators, strategists, and creatives<br />committed to transforming professional development.
          </p>

          {/* Leadership Team with Bios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-12">

            {/* Kristin Williams */}
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div
                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: '#ffba06' }}
              >
                <svg className="w-10 h-10" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <h4 className="font-bold text-lg mb-1" style={{ color: '#1e2749' }}>Kristin Williams</h4>
              <p className="text-sm font-medium mb-3" style={{ color: '#ffba06' }}>Chief Marketing Officer</p>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Shapes the voice and visibility of TDI, turning eight years of cross-industry marketing expertise into meaningful connections with educators nationwide.
              </p>
            </div>

            {/* Omar Garcia */}
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div
                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: '#ffba06' }}
              >
                <svg className="w-10 h-10" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <h4 className="font-bold text-lg mb-1" style={{ color: '#1e2749' }}>Omar Garcia</h4>
              <p className="text-sm font-medium mb-3" style={{ color: '#ffba06' }}>Chief Financial Officer</p>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Drives financial strategy and operational systems that allow TDI to scale sustainably while delivering measurable ROI for every partner district.
              </p>
            </div>

          </div>

          {/* Team Members (no bios, card style like Content Creators) */}
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-12">
            {/* Rachel Patragas */}
            <div className="text-center p-3">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                style={{ backgroundColor: '#1A6B6B' }}
              >
                <span className="text-white font-bold text-sm">RP</span>
              </div>
              <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Rachel Patragas</p>
              <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Director of Creative Solutions</p>
            </div>

            {/* Jim Ford */}
            <div className="text-center p-3">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                style={{ backgroundColor: '#1A6B6B' }}
              >
                <span className="text-white font-bold text-sm">JF</span>
              </div>
              <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Jim Ford</p>
              <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Business Development Coordinator</p>
            </div>

            {/* Olivia Smith */}
            <div className="text-center p-3">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                style={{ backgroundColor: '#1A6B6B' }}
              >
                <span className="text-white font-bold text-sm">OS</span>
              </div>
              <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Olivia Smith</p>
              <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Executive Communication Coordinator</p>
            </div>
          </div>

          {/* Content Creators */}
          <div className="bg-white rounded-xl p-8 max-w-4xl mx-auto">
            <h3 className="font-bold text-lg mb-6 text-center" style={{ color: '#1e2749' }}>
              Content Creators and Contributors
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: '#80a4ed' }}
                >
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Erin Light</p>
                <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Content Creator</p>
              </div>
              <div className="text-center p-3">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: '#80a4ed' }}
                >
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Katie Welch</p>
                <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Content Creator</p>
              </div>
              <div className="text-center p-3">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: '#80a4ed' }}
                >
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Sue Thompson</p>
                <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Content Creator</p>
              </div>
              <div className="text-center p-3">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: '#80a4ed' }}
                >
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Paige Roberts</p>
                <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Content Creator</p>
              </div>
              <div className="text-center p-3">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: '#80a4ed' }}
                >
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Walter Cullin Jr</p>
                <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Content Creator</p>
              </div>
              <div className="text-center p-3">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: '#80a4ed' }}
                >
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Kimberelle Martin</p>
                <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Content Creator</p>
              </div>
              <div className="text-center p-3">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: '#80a4ed' }}
                >
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Paige Griffin</p>
                <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Content Creator</p>
              </div>
              <div className="text-center p-3">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: '#80a4ed' }}
                >
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Kayla Brown</p>
                <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Content Creator</p>
              </div>
              <div className="text-center p-3">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: '#80a4ed' }}
                >
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Ian Bowen</p>
                <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Content Creator</p>
              </div>
              <div className="text-center p-3">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: '#80a4ed' }}
                >
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Amanda Duffy</p>
                <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Content Creator</p>
              </div>
              <div className="text-center p-3">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: '#80a4ed' }}
                >
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Jay Jackson</p>
                <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Content Creator</p>
              </div>
              <div className="text-center p-3">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: '#80a4ed' }}
                >
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Holly Stuart</p>
                <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Content Creator</p>
              </div>
            </div>

            <p className="text-center mt-6 text-sm" style={{ color: '#1e2749', opacity: 0.6 }}>
              Plus district liaisons and facilitators nationwide.
            </p>

            {/* Become a Content Creator */}
            <div className="mt-8 p-6 rounded-xl text-center max-w-2xl mx-auto border" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
              <h4 className="font-bold text-lg mb-2" style={{ color: '#1e2749' }}>
                Interested in Becoming a Content Creator?
              </h4>
              <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
                We are always looking for passionate educators to join our team. Share your classroom-tested strategies with our community.
              </p>
              <Link
                  href="/create-with-us"
                  className="inline-block px-5 py-2 rounded-lg font-medium text-sm border-2 transition-all hover:bg-gray-50"
                  style={{ borderColor: '#1e2749', color: '#1e2749' }}
                >
                  Apply to Be a Creator
                </Link>
            </div>
          </div>

        </div>
      </section>

      {/* General CTA Section */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#1e2749' }}>
        <div className="container-default text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Ready to See What TDI Can Do for You?
          </h2>
          <p className="max-w-2xl mx-auto mb-8" style={{ color: '#ffffff', opacity: 0.8 }}>
            Whether you're a teacher looking for strategies that actually work, or a leader who wants PD your team will thank you for, we're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/free-pd-plan"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-bold text-lg transition-all hover-glow"
              style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
            >
              Get Your Free PD Plan
            </a>
            <a
              href="/for-schools"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-bold text-lg border-2 transition-all hover-lift"
              style={{ borderColor: '#ffffff', color: '#ffffff' }}
            >
              Explore School Partnerships
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
