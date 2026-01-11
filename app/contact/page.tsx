'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to form handling service
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("/images/hero-contact.webp")',
            backgroundPosition: 'center 100%',
            backgroundAttachment: 'fixed',
          }}
        />

        {/* Navy Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 39, 73, 0.92) 0%, rgba(30, 39, 73, 0.85) 100%)'
          }}
        />

        {/* Content */}
        <div className="relative z-10 container-default text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Let's Connect
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.9 }}>
            Whether you want to schedule a call, ask a question,<br />or just say hello, we are here for you.
          </p>
        </div>
      </section>

      {/* Rae's Photo + Quote */}
      <section className="py-6" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
              {/* Rae's Photo */}
              <div className="flex-shrink-0">
                <Image
                  src="/images/rae-headshot.webp"
                  alt="Rae Hughart, Founder of Teachers Deserve It"
                  width={128}
                  height={128}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover"
                  style={{ border: '4px solid #ffba06' }}
                />
              </div>
              {/* Message */}
              <div className="text-center md:text-left">
                <p className="text-lg italic mb-3" style={{ color: '#1e2749' }}>
                  "I read every message that comes through. Whether you have a question, an idea, or just want to say hi, I'd love to hear from you."
                </p>
                <p className="font-bold" style={{ color: '#1e2749' }}>
                  Rae Hughart
                </p>
                <p className="text-sm" style={{ color: '#1e2749', opacity: 0.6 }}>
                  Founder, Teachers Deserve It
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Column Layout: Calendar + Form */}
      <section className="py-12 md:py-16" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* Left Column: Schedule a Call */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#1e2749' }}>
                Schedule a Call
              </h2>
              <p className="text-lg mb-6" style={{ color: '#1e2749', opacity: 0.8 }}>
                A 15-minute conversation to explore what is possible for your school. No pressure, no pitch.
              </p>

              {/* Calendly Embed */}
              <div className="rounded-xl overflow-hidden border border-gray-200" style={{ minHeight: '550px' }}>
                <iframe
                  src="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat?embed_domain=teachersdeserveit.com&embed_type=Inline"
                  width="100%"
                  height="550"
                  frameBorder="0"
                  title="Schedule a call with Teachers Deserve It"
                />
              </div>

              <p className="text-center mt-4 text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                <span className="font-semibold">Time: 15 minutes</span> | With: Rae Hughart, Founder
              </p>
            </div>

            {/* Right Column: Send a Message */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#1e2749' }}>
                Send a Message
              </h2>
              <p className="text-lg mb-6" style={{ color: '#1e2749', opacity: 0.8 }}>
                Have a question or not ready to talk yet?<br />Send us a message.
              </p>

              {submitted ? (
                <div className="text-center py-12 px-6 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#22c55e' }}>
                    <svg className="w-8 h-8" fill="#ffffff" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#1e2749' }}>Thanks for reaching out!</h3>
                  <p style={{ color: '#1e2749', opacity: 0.7 }}>
                    We will be in touch within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                      I am a...
                    </label>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                    >
                      <option value="">Select one</option>
                      <option value="teacher">Teacher</option>
                      <option value="paraprofessional">Paraprofessional</option>
                      <option value="principal">Principal</option>
                      <option value="assistant-principal">Assistant Principal</option>
                      <option value="curriculum-director">Curriculum Director</option>
                      <option value="superintendent">Superintendent</option>
                      <option value="district-admin">District Administrator</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full">
                    Send Message
                  </button>

                  <p className="text-xs text-center" style={{ color: '#1e2749', opacity: 0.6 }}>
                    Your data is encrypted and never sold. We respect your privacy.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Not Ready Yet Section */}
      <section className="py-12 md:py-16" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
            Not Ready to Talk Yet?
          </h2>
          <p className="text-center mb-10 max-w-2xl mx-auto" style={{ color: '#1e2749', opacity: 0.7 }}>
            Explore these resources first.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {/* Card 1: See Your School's Impact */}
            <a
              href="/for-schools#calculator"
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              style={{ textDecoration: 'none' }}
            >
              <div className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#ffba06' }}>
                <svg className="w-6 h-6" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
                </svg>
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>See Your School's Impact</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Estimate improvements in teacher retention, stress, and student outcomes.
              </p>
            </a>

            {/* Card 2: Find Your Starting Point */}
            <a
              href="/pd-diagnostic"
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              style={{ textDecoration: 'none' }}
            >
              <div className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#ffba06' }}>
                <svg className="w-6 h-6" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Find Your Starting Point</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                A quick assessment to see which type of support your staff needs most.
              </p>
            </a>

            {/* Card 3: Get a Free PD Eval */}
            <a
              href="/free-pd-plan"
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              style={{ textDecoration: 'none' }}
            >
              <div className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#ffba06' }}>
                <svg className="w-6 h-6" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H6v-2h6v2zm4-4H6v-2h10v2zm0-4H6V7h10v2z"/>
                </svg>
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Get a Free PD Eval</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Answer 5 questions and receive a tailored plan within 24 hours.
              </p>
            </a>

            {/* Card 4: Find Funding */}
            <a
              href="/funding"
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              style={{ textDecoration: 'none' }}
            >
              <div className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#ffba06' }}>
                <svg className="w-6 h-6" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                </svg>
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Find Funding for Your School</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                80% of our partner schools secure grants or external funding.
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* More Ways to Connect */}
      <section className="py-12 md:py-16" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-default">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10" style={{ color: '#1e2749' }}>
            More Ways to Connect
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {/* Join FB Community */}
            <a
              href="https://www.facebook.com/groups/tdimovement"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              style={{ textDecoration: 'none' }}
            >
              <div className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#ffba06' }}>
                <svg className="w-6 h-6" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Join the Free FB Community</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Connect with thousands of educators who get it.
              </p>
            </a>

            {/* Read Our Blog */}
            <a
              href="https://raehughart.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              style={{ textDecoration: 'none' }}
            >
              <div className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#ffba06' }}>
                <svg className="w-6 h-6" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/>
                </svg>
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Read Our Blog</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Weekly insights for educators who refuse to burn out.
              </p>
            </a>

            {/* Listen to Podcast */}
            <a
              href="https://podcasts.apple.com/us/podcast/sustainable-teaching-with-rae-hughart/id1792030274"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              style={{ textDecoration: 'none' }}
            >
              <div className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#ffba06' }}>
                <svg className="w-6 h-6" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
                </svg>
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Listen to Our Podcast</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Real conversations about sustainable teaching.
              </p>
            </a>

            {/* Order Our Book */}
            <a
              href="https://www.amazon.com/stores/Rae-Hughart/author/B07B52NR1F"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              style={{ textDecoration: 'none' }}
            >
              <div className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#ffba06' }}>
                <svg className="w-6 h-6" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
                </svg>
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Order Our Book</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Get your copy of Teachers Deserve It on Amazon.
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="py-8" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          <div className="max-w-2xl mx-auto">
            <a
              href="/faq"
              className="flex items-center justify-between p-4 rounded-lg transition-all hover:shadow-md"
              style={{ backgroundColor: '#fffbeb', border: '1px solid #ffba06' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ffba06' }}>
                  <svg className="w-5 h-5" fill="#1e2749" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold" style={{ color: '#1e2749' }}>Looking for quick answers?</p>
                  <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>Check our FAQ first</p>
                </div>
              </div>
              <svg className="w-5 h-5" fill="none" stroke="#1e2749" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Email Fallback */}
      <section className="py-8 border-t border-gray-200" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          <p className="text-center" style={{ color: '#1e2749', opacity: 0.7 }}>
            Prefer email? Reach us directly at{' '}
            <a
              href="mailto:hello@teachersdeserveit.com"
              className="font-semibold underline"
              style={{ color: '#1e2749' }}
            >
              hello@teachersdeserveit.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
