'use client';

import { useState } from 'react';
import Link from 'next/link';

// Update this number as spots fill
const VIP_SPOTS_REMAINING = 5;

type Track = 'partner-leader-referral' | 'partner-teacher-nomination' | 'non-partner-nomination' | null;

interface FormData {
  name: string;
  email: string;
  yourSchool: string;
  nominatedSchool: string;
  schoolCityState: string;
  principalName: string;
  pdChallenge: string;
  relationship: string;
  notes: string;
}

export default function NominatePage() {
  // Form routing state
  const [isPartner, setIsPartner] = useState<boolean | null>(null);
  const [role, setRole] = useState<'leader' | 'teacher' | null>(null);
  const [track, setTrack] = useState<Track>(null);

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    yourSchool: '',
    nominatedSchool: '',
    schoolCityState: '',
    principalName: '',
    pdChallenge: '',
    relationship: '',
    notes: '',
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  // Determine track based on selections
  const getTrack = (): Track => {
    if (isPartner === false) return 'non-partner-nomination';
    if (isPartner === true && role === 'leader') return 'partner-leader-referral';
    if (isPartner === true && role === 'teacher') return 'partner-teacher-nomination';
    return null;
  };

  const currentTrack = getTrack();

  // Get subject line based on track
  const getSubjectLine = (): string => {
    switch (currentTrack) {
      case 'partner-leader-referral':
        return `New Referral (Track 1: Partner Leader) - ${formData.nominatedSchool}`;
      case 'partner-teacher-nomination':
        return `New Nomination (Track 2: Partner Teacher) - ${formData.nominatedSchool}`;
      case 'non-partner-nomination':
        return `New Nomination (Track 3: Non-Partner) - ${formData.nominatedSchool}`;
      default:
        return 'New Nomination - TDI Website';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(false);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: '6533e850-3216-4ba6-bdd3-3d1273ce353b',
          subject: getSubjectLine(),
          from_name: 'TDI Nomination Form',
          to: 'Rae@TeachersDeserveIt.com',
          track: currentTrack,
          name: formData.name,
          email: formData.email,
          your_school: formData.yourSchool || undefined,
          nominated_school: formData.nominatedSchool,
          school_city_state: formData.schoolCityState || undefined,
          principal_name: formData.principalName || undefined,
          pd_challenge: formData.pdChallenge || undefined,
          relationship: formData.relationship || undefined,
          additional_notes: formData.notes || undefined,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTrack(currentTrack);

        // GA4 tracking
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'form_submission', {
            form_name: 'nomination_form',
            form_track: currentTrack,
            form_location: window.location.pathname,
          });
        }
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsPartner(null);
    setRole(null);
    setTrack(null);
    setFormData({
      name: '',
      email: '',
      yourSchool: '',
      nominatedSchool: '',
      schoolCityState: '',
      principalName: '',
      pdChallenge: '',
      relationship: '',
      notes: '',
    });
    setSubmitted(false);
    setError(false);
  };

  // Get confirmation content based on track
  const getConfirmationContent = () => {
    const schoolName = formData.nominatedSchool || 'the school';

    switch (track) {
      case 'partner-leader-referral':
        return {
          heading: 'Thank you for the referral.',
          body: `Your recommendation means a lot. We'll reach out to ${schoolName} within 48 hours and we'll mention your name.`,
        };
      case 'partner-teacher-nomination':
        return {
          heading: 'Your nomination is in.',
          body: `Thanks for advocating for your school. We'll reach out to ${schoolName}'s admin within 48 hours. They'll know you started this.`,
        };
      case 'non-partner-nomination':
      default:
        return {
          heading: 'Your nomination is in.',
          body: `Thanks for nominating ${schoolName}. We'll reach out to their admin within 48 hours to start the conversation.`,
        };
    }
  };

  return (
    <main className="min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Navy Gradient Background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #1e2749 0%, #2a3a5c 50%, #1e2749 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 container-default text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Know a School That Deserves Better PD?
          </h1>
          <p className="text-xl md:text-2xl mb-6 max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.9 }}>
            Nominate them. If it leads to a partnership, we celebrate you.
          </p>

          {/* VIP Spots Counter */}
          <div
            className="inline-block px-6 py-3 rounded-lg"
            style={{ backgroundColor: 'rgba(53, 167, 255, 0.2)', border: '1px solid #35A7FF' }}
          >
            <p className="font-semibold" style={{ color: '#35A7FF' }}>
              Only <span className="text-2xl font-bold">{VIP_SPOTS_REMAINING}</span> Blueprint Founders Circle spots available for Fall 2026
            </p>
          </div>
        </div>
      </section>

      {/* 2. How It Works */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#1e2749' }}>
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#ffba06' }}
              >
                <span className="text-2xl font-bold" style={{ color: '#1e2749' }}>1</span>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1e2749' }}>You Nominate</h3>
              <p style={{ color: '#1e2749', opacity: 0.7 }}>
                Tell us about a school that needs better PD. Takes 2 minutes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#ffba06' }}
              >
                <span className="text-2xl font-bold" style={{ color: '#1e2749' }}>2</span>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1e2749' }}>We Reach Out</h3>
              <p style={{ color: '#1e2749', opacity: 0.7 }}>
                We contact their admin team within 48 hours to start the conversation.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#ffba06' }}
              >
                <span className="text-2xl font-bold" style={{ color: '#1e2749' }}>3</span>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1e2749' }}>You Get Celebrated</h3>
              <p style={{ color: '#1e2749', opacity: 0.7 }}>
                When a nomination leads to a partnership, we make sure you're celebrated for starting it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Form */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-default">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-2" style={{ color: '#1e2749' }}>
              Nominate a School
            </h2>
            <p className="text-center mb-8" style={{ color: '#35A7FF' }}>
              <span className="font-semibold">{VIP_SPOTS_REMAINING} of 5</span> Blueprint Founders Circle spots remaining for Fall 2026
            </p>

            {/* Confirmation Message */}
            {submitted ? (
              <div
                className="bg-white rounded-xl p-8 text-center shadow-md"
                style={{ border: '2px solid #22c55e' }}
              >
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: '#22c55e' }}
                >
                  <svg className="w-8 h-8" fill="#ffffff" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: '#1e2749' }}>
                  {getConfirmationContent().heading}
                </h3>
                <p className="text-lg mb-6" style={{ color: '#1e2749', opacity: 0.8 }}>
                  {getConfirmationContent().body}
                </p>
                <p className="text-sm mb-6" style={{ color: '#1e2749', opacity: 0.7 }}>
                  When a nomination leads to a partnership, we celebrate the person who started the conversation.
                </p>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                  style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                >
                  Nominate Another School
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 md:p-8 shadow-md">
                {/* Question 1: Is your school a TDI partner? */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                    Is your school currently a TDI partner? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isPartner"
                        checked={isPartner === true}
                        onChange={() => {
                          setIsPartner(true);
                          setRole(null);
                        }}
                        className="w-5 h-5"
                        style={{ accentColor: '#1e2749' }}
                      />
                      <span style={{ color: '#1e2749' }}>Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isPartner"
                        checked={isPartner === false}
                        onChange={() => {
                          setIsPartner(false);
                          setRole(null);
                        }}
                        className="w-5 h-5"
                        style={{ accentColor: '#1e2749' }}
                      />
                      <span style={{ color: '#1e2749' }}>No</span>
                    </label>
                  </div>
                </div>

                {/* Question 2: Role (only if partner) */}
                {isPartner === true && (
                  <div
                    className="mb-6 p-4 rounded-lg transition-all duration-300"
                    style={{ backgroundColor: '#f5f5f5' }}
                  >
                    <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                      What is your role? <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="role"
                          checked={role === 'leader'}
                          onChange={() => setRole('leader')}
                          className="w-5 h-5"
                          style={{ accentColor: '#1e2749' }}
                        />
                        <span style={{ color: '#1e2749' }}>School Leader (principal, AP, admin)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="role"
                          checked={role === 'teacher'}
                          onChange={() => setRole('teacher')}
                          className="w-5 h-5"
                          style={{ accentColor: '#1e2749' }}
                        />
                        <span style={{ color: '#1e2749' }}>Teacher or Staff</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Track-specific fields */}
                {currentTrack && (
                  <div className="space-y-5 transition-all duration-300">
                    {/* Common fields: Name and Email */}
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                        Your name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                        Your email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                      />
                    </div>

                    {/* Track 1 & 2: Your school name */}
                    {(currentTrack === 'partner-leader-referral' || currentTrack === 'partner-teacher-nomination') && (
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                          Your school name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.yourSchool}
                          onChange={(e) => setFormData({ ...formData, yourSchool: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                        />
                      </div>
                    )}

                    {/* Track 3: Relationship to school */}
                    {currentTrack === 'non-partner-nomination' && (
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                          Your relationship to this school <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={formData.relationship}
                          onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                        >
                          <option value="">Select one</option>
                          <option value="I teach there">I teach there</option>
                          <option value="I used to teach there">I used to teach there</option>
                          <option value="I know someone who teaches there">I know someone who teaches there</option>
                          <option value="I'm a parent">I'm a parent</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    )}

                    {/* Nominated school name */}
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                        {currentTrack === 'partner-leader-referral' ? 'School you\'re referring' : 'School you\'re nominating'}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nominatedSchool}
                        onChange={(e) => setFormData({ ...formData, nominatedSchool: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                      />
                    </div>

                    {/* Track 3: City and State */}
                    {currentTrack === 'non-partner-nomination' && (
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                          School city and state <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Chicago, IL"
                          value={formData.schoolCityState}
                          onChange={(e) => setFormData({ ...formData, schoolCityState: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                        />
                      </div>
                    )}

                    {/* Principal name (Track 2 & 3) */}
                    {(currentTrack === 'partner-teacher-nomination' || currentTrack === 'non-partner-nomination') && (
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                          Do you know the principal's name?
                        </label>
                        <input
                          type="text"
                          value={formData.principalName}
                          onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                        />
                      </div>
                    )}

                    {/* PD Challenge (Track 2 & 3) */}
                    {(currentTrack === 'partner-teacher-nomination' || currentTrack === 'non-partner-nomination') && (
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                          What's the biggest PD challenge at that school?
                        </label>
                        <textarea
                          rows={3}
                          placeholder="This helps us start a better conversation with their admin."
                          value={formData.pdChallenge}
                          onChange={(e) => setFormData({ ...formData, pdChallenge: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                        />
                      </div>
                    )}

                    {/* Additional notes (Track 1 only) */}
                    {currentTrack === 'partner-leader-referral' && (
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
                          Anything else we should know?
                        </label>
                        <textarea
                          rows={3}
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                        />
                      </div>
                    )}

                    {/* Error message */}
                    {error && (
                      <div
                        className="p-4 rounded-lg"
                        style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444' }}
                      >
                        <p style={{ color: '#ef4444' }}>
                          Something went wrong. Please try again or email us at{' '}
                          <a href="mailto:info@teachersdeserveit.com" className="underline">
                            info@teachersdeserveit.com
                          </a>
                        </p>
                      </div>
                    )}

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-lg font-bold text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Nomination'}
                    </button>

                    <p className="text-xs text-center" style={{ color: '#1e2749', opacity: 0.6 }}>
                      Your data is encrypted and never sold. We respect your privacy.
                    </p>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 4. What Is Blueprint Founders Circle? */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
              What's Blueprint Founders Circle?
            </h2>
            <p className="text-center mb-8" style={{ color: '#1e2749', opacity: 0.8 }}>
              Schools that join TDI through a referral or nomination are eligible for Blueprint Founders Circle status.
              Only 5 schools per semester. Founders Circle schools receive:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Benefit 1 */}
              <div className="text-center p-6 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: '#35A7FF' }}
                >
                  <svg className="w-6 h-6" fill="#ffffff" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <p className="font-semibold" style={{ color: '#1e2749' }}>
                  A bonus executive coaching session
                </p>
              </div>

              {/* Benefit 2 */}
              <div className="text-center p-6 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: '#35A7FF' }}
                >
                  <svg className="w-6 h-6" fill="#ffffff" viewBox="0 0 24 24">
                    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
                  </svg>
                </div>
                <p className="font-semibold" style={{ color: '#1e2749' }}>
                  Early access to Desi, our AI-powered teacher support tool
                </p>
              </div>

              {/* Benefit 3 */}
              <div className="text-center p-6 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: '#35A7FF' }}
                >
                  <svg className="w-6 h-6" fill="#ffffff" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </div>
                <p className="font-semibold" style={{ color: '#1e2749' }}>
                  A spotlight feature on the TDI website
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#1e2749' }}>
        <div className="container-default text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Not ready to nominate? That's okay.
          </h2>
          <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: '#ffffff', opacity: 0.8 }}>
            Follow us to see what TDI schools are doing.
          </p>

          {/* Social Links */}
          <div className="flex justify-center gap-4 mb-8">
            <a
              href="https://www.facebook.com/groups/tdimovement"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: '#ffba06' }}
              aria-label="Facebook"
            >
              <svg className="w-6 h-6" fill="#1e2749" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/teachersdeserveit"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: '#ffba06' }}
              aria-label="Instagram"
            >
              <svg className="w-6 h-6" fill="#1e2749" viewBox="0 0 24 24">
                <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/company/teachersdeserveit"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: '#ffba06' }}
              aria-label="LinkedIn"
            >
              <svg className="w-6 h-6" fill="#1e2749" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </a>
          </div>

          <Link
            href="/for-schools"
            className="inline-flex items-center gap-2 font-semibold transition-all hover:gap-3"
            style={{ color: '#ffba06' }}
          >
            Learn more about TDI partnerships
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}
