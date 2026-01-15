'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

// Current Content Creators
const creators = [
  { name: 'Erin Light', role: 'Content Creator' },
  { name: 'Katie Welch', role: 'Content Creator' },
  { name: 'Sue Thompson', role: 'Content Creator' },
  { name: 'Paige Roberts', role: 'Content Creator' },
  { name: 'Walter Cullin Jr', role: 'Content Creator' },
  { name: 'Kimberelle Martin', role: 'Content Creator' },
  { name: 'Paige Griffin', role: 'Content Creator' },
  { name: 'Kayla Brown', role: 'Content Creator' },
  { name: 'Ian Bowen', role: 'Content Creator' },
  { name: 'Amanda Duffy', role: 'Content Creator' },
  { name: 'Jay Jackson', role: 'Content Creator' },
  { name: 'Holly Stuart', role: 'Content Creator' },
];

// Content type options
const contentTypes = [
  { id: 'blog', label: 'Write blog posts' },
  { id: 'download', label: 'Create digital downloads' },
  { id: 'course', label: 'Create a Learning Hub course' },
];

// How did you hear options
const referralSources = [
  'TDI Social Media',
  'TDI Newsletter/Substack',
  'Current TDI Creator',
  'TDI Learning Hub',
  'Facebook Community',
  'Conference/Event',
  'Friend or Colleague',
  'Other',
];

export default function CreateWithUsPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    strategy: '',
    contentTypes: [] as string[],
    referral: '',
    otherReferral: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleContentTypeChange = (typeId: string) => {
    setFormState(prev => ({
      ...prev,
      contentTypes: prev.contentTypes.includes(typeId)
        ? prev.contentTypes.filter(t => t !== typeId)
        : [...prev.contentTypes, typeId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const formData = new FormData(e.currentTarget);

    // Add the content types as a formatted string
    const selectedTypes = contentTypes
      .filter(t => formState.contentTypes.includes(t.id))
      .map(t => t.label)
      .join(', ');
    formData.set('content_types', selectedTypes || 'None selected');

    // Add referral source
    const referralValue = formState.referral === 'Other'
      ? `Other: ${formState.otherReferral}`
      : formState.referral;
    formData.set('referral_source', referralValue);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setFormState({
          name: '',
          email: '',
          strategy: '',
          contentTypes: [],
          referral: '',
          otherReferral: '',
        });
        // Reset the file input
        const fileInput = document.getElementById('headshot') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-creator.png"
            alt="Educator creating content"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1e2749]/95 to-[#1e2749]/80" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Create With Us
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Share your classroom-tested strategies with educators who need them most.
            Join our team of teacher creators making a real difference.
          </p>
          <a
            href="#apply"
            className="inline-block bg-[#ffba06] text-[#1e2749] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#e5a800] transition-colors"
          >
            Apply to Be a Creator
          </a>
        </div>
      </section>

      {/* Why Create for TDI */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e2749] mb-4">
              Why Create for TDI?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              You don't need to be an 'expert.' If you do something in your classroom that works for you and your students, that's worth sharing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-[#80a4ed]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#80a4ed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#1e2749] mb-3">You Already Have Something to Share</h3>
              <p className="text-gray-600">
                That morning routine that settles your class. The grading hack that saves you hours. The parent communication strategy that actually works. If you do it regularly and it helps, other teachers need to hear about it.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-[#ffba06]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#ffba06]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#1e2749] mb-3">A True Partnership</h3>
              <p className="text-gray-600">
                This isn't just about creating content for us. Promote your social media, website, podcast, or other offerings directly within your content. We highlight you, and you grow your own platform too.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-[#1e2749]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#1e2749]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#1e2749] mb-3">Reach 87,000+ Educators</h3>
              <p className="text-gray-600">
                Your strategies reach our engaged community of teachers across 21 states who are actively looking for practical, real-world solutions from educators like you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Creators */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e2749] mb-4">
              Meet Our Creators
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join these incredible educators who are already making an impact through TDI.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {creators.map((creator) => (
              <span key={creator.name} className="bg-white px-4 py-2 rounded-full text-[#1e2749] font-medium shadow-sm">
                {creator.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Your Guide Through the Process */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1e2749] mb-12">
            Your Guide Through the Process
          </h2>

          <div className="max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-[#80a4ed] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#1e2749] mb-1">Rachel Patragas</h3>
            <p className="text-[#80a4ed] font-medium mb-6">Director of Creative Solutions</p>
            <p className="text-lg text-gray-600 italic">
              "Feeling unsure where to start? That's exactly why I'm here. I walk every creator through the entire process—from your first idea to your published course. You bring the strategy, and I'll handle the rest."
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Timeline */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1e2749] mb-12 text-center">
            How It Works
          </h2>

          {/* Desktop Timeline */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Connecting Line */}
              <div className="absolute top-8 left-0 right-0 h-0.5 bg-[#1e2749]/20" />

              <div className="grid grid-cols-5 gap-4">
                {/* Phase 1: Apply */}
                <div className="relative text-center">
                  <div className="w-16 h-16 bg-[#1e2749] rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-[#1e2749] mb-2">Apply</h3>
                  <p className="text-sm text-gray-600">Submit the quick intake form below</p>
                </div>

                {/* Phase 2: Connect */}
                <div className="relative text-center">
                  <div className="w-16 h-16 bg-[#1e2749] rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-[#1e2749] mb-2">Connect</h3>
                  <p className="text-sm text-gray-600">Meet with Rachel and Rae to discuss your idea and vision</p>
                </div>

                {/* Phase 3: Design */}
                <div className="relative text-center">
                  <div className="w-16 h-16 bg-[#1e2749] rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-[#1e2749] mb-2">Design</h3>
                  <p className="text-sm text-gray-600">Outline your course with templates and feedback from our team</p>
                </div>

                {/* Phase 4: Create */}
                <div className="relative text-center">
                  <div className="w-16 h-16 bg-[#1e2749] rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-[#1e2749] mb-2">Create</h3>
                  <p className="text-sm text-gray-600">Record your content—we provide tech support, editing, and design help</p>
                </div>

                {/* Phase 5: Launch */}
                <div className="relative text-center">
                  <div className="w-16 h-16 bg-[#ffba06] rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                    <svg className="w-8 h-8 text-[#1e2749]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-[#1e2749] mb-2">Launch</h3>
                  <p className="text-sm text-gray-600">We handle the platform, you celebrate and share with your audience</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Timeline */}
          <div className="md:hidden space-y-6">
            {/* Phase 1 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#1e2749] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div className="w-0.5 flex-1 bg-[#1e2749]/20 mt-2" />
              </div>
              <div className="pb-6">
                <h3 className="font-bold text-[#1e2749]">Apply</h3>
                <p className="text-sm text-gray-600">Submit the quick intake form below</p>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#1e2749] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="w-0.5 flex-1 bg-[#1e2749]/20 mt-2" />
              </div>
              <div className="pb-6">
                <h3 className="font-bold text-[#1e2749]">Connect</h3>
                <p className="text-sm text-gray-600">Meet with Rachel and Rae to discuss your idea and vision</p>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#1e2749] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="w-0.5 flex-1 bg-[#1e2749]/20 mt-2" />
              </div>
              <div className="pb-6">
                <h3 className="font-bold text-[#1e2749]">Design</h3>
                <p className="text-sm text-gray-600">Outline your course with templates and feedback from our team</p>
              </div>
            </div>

            {/* Phase 4 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#1e2749] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="w-0.5 flex-1 bg-[#1e2749]/20 mt-2" />
              </div>
              <div className="pb-6">
                <h3 className="font-bold text-[#1e2749]">Create</h3>
                <p className="text-sm text-gray-600">Record your content—we provide tech support, editing, and design help</p>
              </div>
            </div>

            {/* Phase 5 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#ffba06] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#1e2749]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-[#1e2749]">Launch</h3>
                <p className="text-sm text-gray-600">We handle the platform, you celebrate and share with your audience</p>
              </div>
            </div>
          </div>

          {/* Note */}
          <p className="text-center text-gray-500 mt-12 max-w-2xl mx-auto">
            Every creator moves at their own pace. Whether you finish in 4 weeks or 4 months, we're with you every step of the way.
          </p>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-16 md:py-20 bg-white scroll-mt-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e2749] mb-4">
              Ready to Create?
            </h2>
            <p className="text-lg text-gray-600">
              Tell us about yourself and the strategies you'd love to share.
              Rachel from our team will be in touch within a few days.
            </p>
          </div>

          {submitStatus === 'success' ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">Application Received!</h3>
              <p className="text-green-700">
                Thanks for your interest in creating with TDI. Rachel will review your application and reach out soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Web3Forms Access Key */}
              <input type="hidden" name="access_key" value="91989992-61ab-470e-8c39-6156e23acaf4" />
              <input type="hidden" name="subject" value="New Content Creator Application - TDI" />
              <input type="hidden" name="from_name" value="TDI Content Creator Form" />

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent transition-colors"
                  placeholder="Jane Smith"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formState.email}
                  onChange={(e) => setFormState(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent transition-colors"
                  placeholder="jane@school.edu"
                />
              </div>

              {/* Headshot Upload */}
              <div>
                <label htmlFor="headshot" className="block text-sm font-medium text-gray-700 mb-2">
                  Headshot *
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Upload a professional photo we can use on the website if you join our team.
                </p>
                <input
                  type="file"
                  id="headshot"
                  name="headshot"
                  required
                  accept="image/*"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#80a4ed]/10 file:text-[#1e2749] file:font-medium hover:file:bg-[#80a4ed]/20 file:cursor-pointer"
                />
              </div>

              {/* Strategy/Topic */}
              <div>
                <label htmlFor="strategy" className="block text-sm font-medium text-gray-700 mb-2">
                  What small strategy or topic do you love to share with others? *
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Think about what colleagues always ask you about or what you're known for in your school.
                </p>
                <textarea
                  id="strategy"
                  name="strategy"
                  required
                  rows={4}
                  value={formState.strategy}
                  onChange={(e) => setFormState(prev => ({ ...prev, strategy: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent transition-colors resize-none"
                  placeholder="I've developed a 5-minute morning routine that helps my students settle in and start focused..."
                />
              </div>

              {/* Content Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What type of content do you want to create? *
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Select all that interest you.
                </p>
                <div className="space-y-4">
                  {contentTypes.map((type) => (
                    <label key={type.id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formState.contentTypes.includes(type.id)}
                        onChange={() => handleContentTypeChange(type.id)}
                        className="w-5 h-5 rounded border-gray-300 text-[#80a4ed] focus:ring-[#80a4ed] cursor-pointer"
                      />
                      <span className="text-gray-700 group-hover:text-[#1e2749] transition-colors">
                        {type.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* How Did You Hear */}
              <div>
                <label htmlFor="referral" className="block text-sm font-medium text-gray-700 mb-2">
                  How did you hear about this opportunity? *
                </label>
                <select
                  id="referral"
                  name="referral_dropdown"
                  required
                  value={formState.referral}
                  onChange={(e) => setFormState(prev => ({ ...prev, referral: e.target.value, otherReferral: '' }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent transition-colors bg-white"
                >
                  <option value="">Select an option</option>
                  {referralSources.map((source) => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>

                {formState.referral === 'Other' && (
                  <input
                    type="text"
                    name="other_referral"
                    value={formState.otherReferral}
                    onChange={(e) => setFormState(prev => ({ ...prev, otherReferral: e.target.value }))}
                    className="w-full mt-3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent transition-colors"
                    placeholder="Please specify..."
                    required
                  />
                )}
              </div>

              {/* Error Message */}
              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  Something went wrong. Please try again or email us directly at hello@teachersdeserveit.com
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || formState.contentTypes.length === 0}
                className="w-full bg-[#ffba06] text-[#1e2749] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#e5a800] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>

              <p className="text-sm text-gray-500 text-center">
                Your information is secure and never shared. Questions? Email us at{' '}
                <a href="mailto:hello@teachersdeserveit.com" className="text-[#80a4ed] hover:underline">
                  hello@teachersdeserveit.com
                </a>
              </p>
            </form>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-[#1e2749]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Not Ready to Create Yet?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join our community first and see what we're all about.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/join"
              className="bg-[#ffba06] text-[#1e2749] px-8 py-4 rounded-lg font-semibold hover:bg-[#e5a800] transition-colors"
            >
              Join the Movement
            </Link>
            <a
              href="https://www.facebook.com/groups/tdimovement"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-[#1e2749] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Join Free FB Community
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
