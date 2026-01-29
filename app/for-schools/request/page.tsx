'use client';

import { useState } from 'react';

export default function RequestForSchoolPage() {
  const [formData, setFormData] = useState({
    teacherName: '',
    teacherEmail: '',
    schoolName: '',
    principalName: '',
    principalEmail: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to form handling service
    console.log('Request submitted:', formData);
    setSubmitted(true);

    // GA4 tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'form_submission', {
        form_name: 'school_inquiry_form',
        form_location: window.location.pathname
      });
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="section" style={{ backgroundColor: 'var(--tdi-navy)' }}>
        <div className="container-default text-center">
          <h1 className="mb-4" style={{ color: 'white' }}>Request TDI for Your School</h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: 'white', opacity: 0.9 }}>
            Love what you're experiencing? Help us connect with your school leader so your whole building can benefit.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="section bg-white">
        <div className="container-default">
          <div className="max-w-xl mx-auto">
            {submitted ? (
              <div className="text-center py-12">
                <h2 className="mb-4">Thank you!</h2>
                <p className="mb-6" style={{ opacity: 0.7 }}>
                  We've received your request. We'll reach out to your school leader with information about how TDI can support your whole building, including teachers and paraprofessionals.
                </p>
                <p style={{ opacity: 0.7 }}>
                  In the meantime, keep exploring the Learning Hub and sharing what you're learning with your colleagues.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: 'var(--tdi-gray)' }}>
                  <p className="text-sm" style={{ opacity: 0.8 }}>
                    <strong>How this works:</strong> Fill out the form below, and we'll send a friendly email to your school leader introducing TDI and offering a no-pressure conversation about supporting your staff.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="teacherName" className="block text-sm font-semibold mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="teacherName"
                      required
                      value={formData.teacherName}
                      onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="teacherEmail" className="block text-sm font-semibold mb-2">
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="teacherEmail"
                      required
                      value={formData.teacherEmail}
                      onChange={(e) => setFormData({ ...formData, teacherEmail: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="schoolName" className="block text-sm font-semibold mb-2">
                      School Name
                    </label>
                    <input
                      type="text"
                      id="schoolName"
                      required
                      value={formData.schoolName}
                      onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="principalName" className="block text-sm font-semibold mb-2">
                      Principal or School Leader's Name
                    </label>
                    <input
                      type="text"
                      id="principalName"
                      required
                      value={formData.principalName}
                      onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="principalEmail" className="block text-sm font-semibold mb-2">
                      Principal or School Leader's Email
                    </label>
                    <input
                      type="email"
                      id="principalEmail"
                      required
                      value={formData.principalEmail}
                      onChange={(e) => setFormData({ ...formData, principalEmail: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold mb-2">
                      Why do you think TDI would help your school? (Optional)
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                      placeholder="E.g., Our staff is burned out and we need PD that actually helps..."
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full">
                    Submit Request
                  </button>

                  <p className="text-xs text-center" style={{ opacity: 0.5 }}>
                    We'll only use this information to connect with your school leader about TDI. We won't spam them or share their information.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
