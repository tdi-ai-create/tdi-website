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
      {/* Hero */}
      <section className="section" style={{ backgroundColor: 'var(--tdi-navy)' }}>
        <div className="container-default text-center">
          <h1 className="mb-4" style={{ color: 'white' }}>Get in Touch</h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: 'white', opacity: 0.9 }}>
            Questions? Ideas? Just want to say hi? We'd love to hear from you.
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
                  We'll get back to you within 24 hours.
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

      {/* Response Time */}
      <section className="section" style={{ backgroundColor: 'var(--tdi-gray)' }}>
        <div className="container-default text-center">
          <p className="text-lg">
            We respond to all inquiries within <strong>24 hours</strong>.
          </p>
        </div>
      </section>
    </main>
  );
}
