'use client';

import { useState } from 'react';

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
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("/images/hero-contact.png")',
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#ffffff' }}>
            Get In Touch
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.9 }}>
            Whether you have questions about our programs, want to explore a partnership, or just want to say hello, we would love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="section bg-white">
        <div className="container-default">
          <div className="max-w-xl mx-auto">
            {submitted ? (
              <div className="text-center py-12">
                <h2 className="mb-4">Thanks for reaching out!</h2>
                <p style={{ opacity: 0.7 }}>
                  We'll be in touch soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold mb-2">
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
                  <label htmlFor="email" className="block text-sm font-semibold mb-2">
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
                  <label htmlFor="role" className="block text-sm font-semibold mb-2">
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
                  <label htmlFor="message" className="block text-sm font-semibold mb-2">
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
              </form>
            )}

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-center mb-4" style={{ opacity: 0.7 }}>
                Prefer email? Reach us directly at:
              </p>
              <p className="text-center">
                <a 
                  href="mailto:hello@teachersdeserveit.com" 
                  className="font-semibold"
                  style={{ color: 'var(--tdi-navy)' }}
                >
                  hello@teachersdeserveit.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-16" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-default">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
            More Ways to Connect
          </h2>
          <p className="text-center mb-10 max-w-2xl mx-auto" style={{ color: '#1e2749', opacity: 0.7 }}>
            Explore our resources and join the TDI community.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">

            {/* Take the PD Quiz */}
            <a
              href="/free-pd-plan"
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              style={{ textDecoration: 'none' }}
            >
              <div
                className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: '#ffba06' }}
              >
                <svg className="w-7 h-7" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#1e2749' }}>Take the PD Quiz</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Get a personalized professional development plan in minutes.
              </p>
            </a>

            {/* Join the FB Community */}
            <a
              href="https://www.facebook.com/groups/tdimovement"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              style={{ textDecoration: 'none' }}
            >
              <div
                className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: '#ffba06' }}
              >
                <svg className="w-7 h-7" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#1e2749' }}>Join the Free FB Community</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Connect with thousands of educators who get it.
              </p>
            </a>

            {/* Read the Blog */}
            <a
              href="https://raehughart.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              style={{ textDecoration: 'none' }}
            >
              <div
                className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: '#ffba06' }}
              >
                <svg className="w-7 h-7" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#1e2749' }}>Read the Blog</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Weekly insights for educators who refuse to burn out.
              </p>
            </a>

            {/* Listen to the Podcast */}
            <a
              href="https://podcasts.apple.com/us/podcast/sustainable-teaching-with-rae-hughart/id1792030274"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              style={{ textDecoration: 'none' }}
            >
              <div
                className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: '#ffba06' }}
              >
                <svg className="w-7 h-7" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#1e2749' }}>Listen to the Podcast</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Real conversations about teaching, wellness, and surviving the system.
              </p>
            </a>

            {/* Order the Book */}
            <a
              href="https://www.amazon.com/stores/Rae-Hughart/author/B07B52NR1F"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              style={{ textDecoration: 'none' }}
            >
              <div
                className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: '#ffba06' }}
              >
                <svg className="w-7 h-7" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#1e2749' }}>Order the Book</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Get your copy of Teachers Deserve It on Amazon.
              </p>
            </a>

            {/* Watch the TEDx Talk */}
            <a
              href="https://www.youtube.com/watch?v=OLzaa7Hv3mo"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              style={{ textDecoration: 'none' }}
            >
              <div
                className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: '#ffba06' }}
              >
                <svg className="w-7 h-7" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#1e2749' }}>Watch the TEDx Talk</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                See the talk that sparked a movement.
              </p>
            </a>

          </div>
        </div>
      </section>
    </main>
  );
}
