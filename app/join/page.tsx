'use client';

import Link from 'next/link';

export default function JoinPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section with Parallax */}
      <section className="relative h-[320px] md:h-[360px] overflow-hidden">
        {/* Parallax Background Image */}
        <div
          className="absolute inset-0 parallax-bg"
          style={{
            backgroundImage: "url('/images/hero-join.png')",
            backgroundSize: 'cover',
            backgroundPosition: '30% center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          }}
        />

        {/* Navy Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(30, 39, 73, 0.5) 0%, rgba(30, 39, 73, 0.6) 100%)'
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center px-4 max-w-3xl mx-auto">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              style={{ color: '#ffffff' }}
            >
              Join the Movement
            </h1>
            <p
              className="text-lg md:text-xl"
              style={{ color: '#ffffff', opacity: 0.9 }}
            >
              Find your path. Whether you're a teacher looking for support or a leader building a healthier school, we're here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Free Ways to Get Started */}
      <section className="section bg-white">
        <div className="container-default">
          <h2 className="text-center mb-2">Free Ways to Get Started</h2>
          <p className="text-center mb-12" style={{ opacity: 0.6 }}>
            No commitment. Just value.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">

            {/* Card 1: Blog/Newsletter */}
            <a
              href="https://raehughart.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
            >
              <div
                className="h-[160px] flex items-center justify-center p-6"
                style={{ backgroundColor: '#ffba06' }}
              >
                {/* Substack/Newsletter Icon */}
                <svg
                  className="w-16 h-16"
                  fill="white"
                  viewBox="0 0 24 24"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                >
                  <path d="M22 4H2v2h20V4zm0 4H2v10l10 4 10-4V8zm-10 9.18L6 15.62v-5.24l6 2.4 6-2.4v5.24l-6 1.56z"/>
                </svg>
              </div>
              <div className="bg-white p-5">
                <h3
                  className="text-lg font-bold mb-2 uppercase tracking-wide"
                  style={{ color: '#1e2749' }}
                >
                  Weekly Strategies in Your Inbox
                </h3>
                <p className="text-sm mb-3" style={{ color: '#1e2749', opacity: 0.7 }}>
                  3x/week, practical ideas you can use immediately. Join 87,000+ educators already getting them.
                </p>
                <span className="font-semibold text-sm" style={{ color: '#1e2749' }}>
                  Read the latest →
                </span>
              </div>
            </a>

            {/* Card 2: Podcast */}
            <a
              href="https://podcasts.apple.com/us/podcast/sustainable-teaching-with-rae-hughart/id1792030274"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
            >
              <div
                className="h-[160px] flex items-center justify-center p-6"
                style={{ backgroundColor: '#ffba06' }}
              >
                {/* Headphones/Podcast Icon */}
                <svg
                  className="w-16 h-16"
                  fill="white"
                  viewBox="0 0 24 24"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                >
                  <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
                </svg>
              </div>
              <div className="bg-white p-5">
                <h3
                  className="text-lg font-bold mb-2 uppercase tracking-wide"
                  style={{ color: '#1e2749' }}
                >
                  Listen While You Commute
                </h3>
                <p className="text-sm mb-3" style={{ color: '#1e2749', opacity: 0.7 }}>
                  The Sustainable Teaching podcast. Real talk about sustainable teaching from people who get it.
                </p>
                <span className="font-semibold text-sm" style={{ color: '#1e2749' }}>
                  Start listening →
                </span>
              </div>
            </a>

            {/* Card 3: Free Resources */}
            <a
              href="/resources"
              className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
            >
              <div
                className="h-[160px] flex items-center justify-center p-6"
                style={{ backgroundColor: '#ffba06' }}
              >
                {/* Download Icon */}
                <svg
                  className="w-16 h-16"
                  fill="white"
                  viewBox="0 0 24 24"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                >
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
              </div>
              <div className="bg-white p-5">
                <h3
                  className="text-lg font-bold mb-2 uppercase tracking-wide"
                  style={{ color: '#1e2749' }}
                >
                  Grab a Free Resource
                </h3>
                <p className="text-sm mb-3" style={{ color: '#1e2749', opacity: 0.7 }}>
                  Ready-to-use downloads for your classroom, for teachers and paras alike.
                </p>
                <span className="font-semibold text-sm" style={{ color: '#1e2749' }}>
                  Browse downloads →
                </span>
              </div>
            </a>

          </div>
        </div>
      </section>

      {/* For Teachers & Paraprofessionals */}
      <section className="section" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-default">
          <h2 className="text-center mb-2">For Teachers & Paraprofessionals</h2>
          <p className="text-center mb-12" style={{ opacity: 0.6 }}>
            PD that respects your time and actually helps.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

            {/* Card 1: Go Deeper */}
            <a
              href="https://raehughart.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              style={{ borderTop: '4px solid #ffba06' }}
            >
              <h3
                className="text-xl font-bold mb-3"
                style={{ color: '#1e2749' }}
              >
                Go Deeper with Exclusive Content
              </h3>
              <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
                Premium strategies, behind-the-scenes access, and a community of educators who are done settling for the status quo.
              </p>
              <span className="font-semibold text-sm" style={{ color: '#ffba06' }}>
                See premium options →
              </span>
            </a>

            {/* Card 2: Learning Hub */}
            <a
              href="https://tdi.thinkific.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              style={{ borderTop: '4px solid #ffba06' }}
            >
              <h3
                className="text-xl font-bold mb-3"
                style={{ color: '#1e2749' }}
              >
                Learning Hub
                <span className="block">All-Access</span>
              </h3>
              <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
                100+ hours of on-demand PD. Bite-sized videos you can finish in one sitting. Strategies you'll actually use Monday morning.
              </p>
              <span className="font-semibold text-sm" style={{ color: '#ffba06' }}>
                Explore the Learning Hub →
              </span>
            </a>

          </div>

          {/* Request for School CTA */}
          <div className="mt-12 text-center">
            <p className="mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
              Love what you see? Think your whole school could benefit?
            </p>
            <a
              href="/for-schools/request"
              className="inline-block px-6 py-3 rounded-lg font-semibold border-2 transition-all hover:bg-gray-100"
              style={{ borderColor: '#1e2749', color: '#1e2749' }}
            >
              Request TDI for Your School
            </a>
          </div>
        </div>
      </section>

      {/* For School Leaders */}
      <section className="section bg-white">
        <div className="container-default">
          <h2 className="text-center mb-2">For School Leaders</h2>
          <p className="text-center mb-12" style={{ opacity: 0.6 }}>
            Support your whole building, teachers and paraprofessionals, with PD they'll actually use.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">

            {/* Card 1: Bring TDI */}
            <a
              href="/free-pd-plan"
              className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
            >
              <div
                className="h-[160px] flex items-center justify-center p-6"
                style={{ backgroundColor: '#80a4ed' }}
              >
                {/* Team/Group Icon */}
                <svg
                  className="w-16 h-16"
                  fill="white"
                  viewBox="0 0 24 24"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                >
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
              </div>
              <div className="bg-white p-5">
                <h3
                  className="text-lg font-bold mb-2 uppercase tracking-wide"
                  style={{ color: '#1e2749' }}
                >
                  Bring TDI to Your Team
                </h3>
                <p className="text-sm mb-3" style={{ color: '#1e2749', opacity: 0.7 }}>
                  Whole-school PD designed for real implementation.
                </p>
                <span className="font-semibold text-sm" style={{ color: '#1e2749' }}>
                  Learn more →
                </span>
              </div>
            </a>

            {/* Card 2: Explore What's Possible */}
            <a
              href="/contact"
              className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
            >
              <div
                className="h-[160px] flex items-center justify-center p-6"
                style={{ backgroundColor: '#80a4ed' }}
              >
                {/* Compass/Explore Icon */}
                <svg
                  className="w-16 h-16"
                  fill="white"
                  viewBox="0 0 24 24"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z"/>
                </svg>
              </div>
              <div className="bg-white p-5">
                <h3
                  className="text-lg font-bold mb-2 uppercase tracking-wide"
                  style={{ color: '#1e2749' }}
                >
                  Explore What's Possible
                </h3>
                <p className="text-sm mb-3" style={{ color: '#1e2749', opacity: 0.7 }}>
                  Let's discuss partnership models for your school.
                </p>
                <span className="font-semibold text-sm" style={{ color: '#1e2749' }}>
                  Get in touch →
                </span>
              </div>
            </a>

            {/* Card 3: Chat with Team */}
            <a
              href="/contact"
              className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
            >
              <div
                className="h-[160px] flex items-center justify-center p-6"
                style={{ backgroundColor: '#80a4ed' }}
              >
                {/* Chat/Message Icon */}
                <svg
                  className="w-16 h-16"
                  fill="white"
                  viewBox="0 0 24 24"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                >
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
              </div>
              <div className="bg-white p-5">
                <h3
                  className="text-lg font-bold mb-2 uppercase tracking-wide"
                  style={{ color: '#1e2749' }}
                >
                  Chat with a Member of the Team
                </h3>
                <p className="text-sm mb-3" style={{ color: '#1e2749', opacity: 0.7 }}>
                  Have questions? Let's talk.
                </p>
                <span className="font-semibold text-sm" style={{ color: '#1e2749' }}>
                  Contact us →
                </span>
              </div>
            </a>

          </div>
        </div>
      </section>

      {/* Budget CTA */}
      <section className="section" style={{ backgroundColor: '#80a4ed' }}>
        <div className="container-default text-center">
          <h2 className="mb-4" style={{ color: '#1e2749' }}>Think You Don't Have Budget?</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto" style={{ color: '#1e2749', opacity: 0.8 }}>
            80% of schools we work with secure external funds to cover PD. We help you find the funding and draft the language.
          </p>
          <Link
            href="/funding"
            className="inline-block px-8 py-4 rounded-lg font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: '#1e2749', color: '#ffffff' }}
          >
            See How Funding Works
          </Link>
        </div>
      </section>
    </main>
  );
}
