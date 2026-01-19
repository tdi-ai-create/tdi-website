'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Send,
  Users,
  Target,
  MessageSquare,
  Loader2
} from 'lucide-react';

export default function ASD4PartnerDataForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    // Section 1: About Your Paras
    paraTypes: [] as string[],
    buildingsServed: '',
    biggestChallenge: '',
    pdInclusion: '',
    teacherResponse: '',

    // Section 2: Partnership Goals
    successMetrics: '',
    topConcerns: '',
    quickWins: '',

    // Section 3: Scheduling
    virtualSessionTimes: [] as string[],
    preferredObservationWeek1: '',
    preferredObservationWeek2: '',
    execSessionMonth1: '',
    execSessionMonth2: '',

    // Section 4: Anything Else
    additionalNotes: ''
  });

  const totalSteps = 4;

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: string, value: string) => {
    const currentValues = formData[field as keyof typeof formData] as string[];
    if (currentValues.includes(value)) {
      handleInputChange(field, currentValues.filter(v => v !== value));
    } else {
      handleInputChange(field, [...currentValues, value]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: 'c62a3d76-61c6-4168-938b-5271c96755bf',
          subject: 'ASD4 Partner Data Form Submission',
          from_name: 'Addison SD4 Dashboard',
          ...formData,
          paraTypes: formData.paraTypes.join(', '),
          virtualSessionTimes: formData.virtualSessionTimes.join(', '),
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#1e2749] mb-2">Thank You!</h1>
          <p className="text-gray-600 mb-6">
            Your partnership data has been submitted. Rae will review this and reach out soon to discuss next steps.
          </p>
          <Link
            href="/asd4-dashboard"
            className="inline-flex items-center gap-2 bg-[#38618C] hover:bg-[#2d4e73] text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <nav className="bg-[#1e2749] sticky top-0 z-50 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-3">
              <span className="bg-white text-[#1e2749] px-2 py-1 rounded text-xs font-extrabold tracking-wide">TDI</span>
              <span className="text-white font-semibold hidden sm:inline">Partner Data Form</span>
            </div>
            <Link
              href="/asd4-dashboard"
              className="text-white/80 hover:text-white text-sm flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1e2749]">Addison School District 4</h1>
          <p className="text-gray-600">Partnership Data Form</p>
          <p className="text-sm text-gray-500 mt-2">
            Help us personalize your dashboard and prepare for our partnership
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  step < currentStep
                    ? 'bg-green-500 text-white'
                    : step === currentStep
                      ? 'bg-[#38618C] text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
              </div>
              {step < 4 && (
                <div className={`w-8 h-1 mx-1 ${step < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">

            {/* Step 1: About Your Paras */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#38618C]/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#38618C]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#1e2749]">About Your Paras</h2>
                    <p className="text-sm text-gray-500">Help us understand your paraprofessional team</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What type of support do your paras primarily provide? (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Special Education / IEP', 'English Learners (EL)', '504 Support', 'General Classroom Support', 'Behavioral Support', 'Other'].map((type) => (
                      <label key={type} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.paraTypes.includes(type)}
                          onChange={() => handleCheckboxChange('paraTypes', type)}
                          className="rounded border-gray-300 text-[#38618C] focus:ring-[#38618C]"
                        />
                        <span className="text-sm">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Which buildings do paras work in? (9 schools in district)
                  </label>
                  <textarea
                    value={formData.buildingsServed}
                    onChange={(e) => handleInputChange('buildingsServed', e.target.value)}
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#38618C] focus:border-transparent"
                    rows={2}
                    placeholder="List the schools or indicate 'All schools'"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's the biggest challenge facing your paras right now?
                  </label>
                  <textarea
                    value={formData.biggestChallenge}
                    onChange={(e) => handleInputChange('biggestChallenge', e.target.value)}
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#38618C] focus:border-transparent"
                    rows={3}
                    placeholder="Describe the main challenges..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do paras feel included in professional development opportunities?
                  </label>
                  <select
                    value={formData.pdInclusion}
                    onChange={(e) => handleInputChange('pdInclusion', e.target.value)}
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#38618C] focus:border-transparent"
                  >
                    <option value="">Select an option</option>
                    <option value="Yes, fully included">Yes, fully included in all PD</option>
                    <option value="Sometimes included">Sometimes included, depends on the topic</option>
                    <option value="Rarely included">Rarely included in PD</option>
                    <option value="Not included">Not typically included in PD</option>
                    <option value="Have their own PD">Have their own separate PD opportunities</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How do teachers generally respond to para support in their classrooms?
                  </label>
                  <select
                    value={formData.teacherResponse}
                    onChange={(e) => handleInputChange('teacherResponse', e.target.value)}
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#38618C] focus:border-transparent"
                  >
                    <option value="">Select an option</option>
                    <option value="Very collaborative">Very collaborative - true partnership</option>
                    <option value="Generally positive">Generally positive - work well together</option>
                    <option value="Mixed">Mixed - varies by teacher</option>
                    <option value="Some friction">Some friction - room for improvement</option>
                    <option value="Significant challenges">Significant challenges in collaboration</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Partnership Goals */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#38618C]/10 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-[#38618C]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#1e2749]">Partnership Goals</h2>
                    <p className="text-sm text-gray-500">What does success look like for your district?</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How will you measure success for this partnership? What metrics matter most?
                  </label>
                  <textarea
                    value={formData.successMetrics}
                    onChange={(e) => handleInputChange('successMetrics', e.target.value)}
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#38618C] focus:border-transparent"
                    rows={3}
                    placeholder="e.g., Para retention rates, confidence scores, teacher feedback..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What are your top 2-3 concerns heading into this partnership?
                  </label>
                  <textarea
                    value={formData.topConcerns}
                    onChange={(e) => handleInputChange('topConcerns', e.target.value)}
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#38618C] focus:border-transparent"
                    rows={3}
                    placeholder="Be honest - we want to address these directly..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Are there any quick wins you'd like to see early in our partnership?
                  </label>
                  <textarea
                    value={formData.quickWins}
                    onChange={(e) => handleInputChange('quickWins', e.target.value)}
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#38618C] focus:border-transparent"
                    rows={3}
                    placeholder="Small victories that would build momentum..."
                  />
                </div>

                <div className="bg-[#38618C]/5 border border-[#38618C]/20 rounded-lg p-4">
                  <h4 className="font-medium text-[#1e2749] mb-2">Proposed Shared Goal</h4>
                  <p className="text-sm text-gray-600 italic">
                    "Empower paraprofessionals to become confident, skilled partners in student success - equipped with real strategies, valued by their teams, and making measurable impact with IEP, EL, and 504 students."
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    We'll refine this together during our Executive Impact Session
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Scheduling */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#38618C]/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#38618C]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#1e2749]">Scheduling Preferences</h2>
                    <p className="text-sm text-gray-500">Help us plan our partnership calendar</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Best times for virtual sessions (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'Early morning (before school)',
                      'During school hours',
                      'Lunchtime',
                      'After school (3-5pm)',
                      'Evening (after 5pm)'
                    ].map((time) => (
                      <label key={time} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.virtualSessionTimes.includes(time)}
                          onChange={() => handleCheckboxChange('virtualSessionTimes', time)}
                          className="rounded border-gray-300 text-[#38618C] focus:ring-[#38618C]"
                        />
                        <span className="text-sm">{time}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred week for Observation Day 1 (Target: February)
                  </label>
                  <select
                    value={formData.preferredObservationWeek1}
                    onChange={(e) => handleInputChange('preferredObservationWeek1', e.target.value)}
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#38618C] focus:border-transparent"
                  >
                    <option value="">Select a week</option>
                    <option value="Feb 3-7, 2026">Feb 3-7, 2026</option>
                    <option value="Feb 10-14, 2026">Feb 10-14, 2026</option>
                    <option value="Feb 17-21, 2026">Feb 17-21, 2026</option>
                    <option value="Feb 24-28, 2026">Feb 24-28, 2026</option>
                    <option value="Flexible">Flexible - let's discuss</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred week for Observation Day 2 (Target: April)
                  </label>
                  <select
                    value={formData.preferredObservationWeek2}
                    onChange={(e) => handleInputChange('preferredObservationWeek2', e.target.value)}
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#38618C] focus:border-transparent"
                  >
                    <option value="">Select a week</option>
                    <option value="April 6-10, 2026">April 6-10, 2026</option>
                    <option value="April 13-17, 2026">April 13-17, 2026</option>
                    <option value="April 20-24, 2026">April 20-24, 2026</option>
                    <option value="April 27 - May 1, 2026">April 27 - May 1, 2026</option>
                    <option value="Flexible">Flexible - let's discuss</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Executive Impact Session 1 (Target: Late Jan/Early Feb)
                    </label>
                    <select
                      value={formData.execSessionMonth1}
                      onChange={(e) => handleInputChange('execSessionMonth1', e.target.value)}
                      className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#38618C] focus:border-transparent"
                    >
                      <option value="">Select timing</option>
                      <option value="Late January 2026">Late January 2026</option>
                      <option value="Early February 2026">Early February 2026</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Executive Impact Session 2 (Target: Mid-May)
                    </label>
                    <select
                      value={formData.execSessionMonth2}
                      onChange={(e) => handleInputChange('execSessionMonth2', e.target.value)}
                      className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#38618C] focus:border-transparent"
                    >
                      <option value="">Select timing</option>
                      <option value="Early May 2026">Early May 2026</option>
                      <option value="Mid-May 2026">Mid-May 2026</option>
                      <option value="Late May 2026">Late May 2026</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2 text-sm">Proposed Timeline Overview</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>• <strong>Feb 2026:</strong> Exec Session 1, Observation 1</p>
                    <p>• <strong>Late Feb - March:</strong> Virtual Sessions 1 & 2</p>
                    <p>• <strong>April:</strong> Observation 2, Virtual Session 3</p>
                    <p>• <strong>May:</strong> Virtual Session 4, Exec Session 2</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Anything Else */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#38618C]/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-[#38618C]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#1e2749]">Anything Else</h2>
                    <p className="text-sm text-gray-500">Share anything we should know</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Is there anything else you'd like us to know about your district, your paras, or your goals for this partnership?
                  </label>
                  <textarea
                    value={formData.additionalNotes}
                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#38618C] focus:border-transparent"
                    rows={6}
                    placeholder="Anything that would help us serve your district better..."
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Almost Done!
                  </h4>
                  <p className="text-sm text-green-700">
                    After you submit, Rae will review your responses and reach out to confirm scheduling.
                    Your dashboard will be updated with personalized content based on what you've shared.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="flex items-center gap-2 bg-[#38618C] hover:bg-[#2d4e73] text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-[#ffba06] hover:bg-[#e5a805] text-[#1e2749] px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Form
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
