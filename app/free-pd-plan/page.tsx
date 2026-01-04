'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FormData {
  // Step 1: About Your Team
  staffCount: string;
  pdSetup: string;
  roleBasedApproach: string;
  // Step 2: Current Challenges
  strugglingArea: string;
  pdImpactConfidence: number;
  surveyUsage: string;
  // Step 3: Your Goals
  urgentGoal: string;
  urgentGoalOther: string;
  successfulPDYear: string;
  easierPDCycle: string[];
  // Step 4: Your Reality
  measureROI: string;
  biggestFrustration: string;
  whereToStart: string;
  // Step 5: Your Information
  email: string;
  name: string;
  title: string;
  schoolName: string;
  schoolAddress: string;
  howConnected: string;
  anythingElse: string;
}

export default function FreePDPlanPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    staffCount: '',
    pdSetup: '',
    roleBasedApproach: '',
    strugglingArea: '',
    pdImpactConfidence: 0,
    surveyUsage: '',
    urgentGoal: '',
    urgentGoalOther: '',
    successfulPDYear: '',
    easierPDCycle: [],
    measureROI: '',
    biggestFrustration: '',
    whereToStart: '',
    email: '',
    name: '',
    title: '',
    schoolName: '',
    schoolAddress: '',
    howConnected: '',
    anythingElse: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 5;

  const updateFormData = (field: keyof FormData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCheckbox = (field: keyof FormData, value: string) => {
    const currentValues = formData[field] as string[];
    if (currentValues.includes(value)) {
      updateFormData(field, currentValues.filter(v => v !== value));
    } else {
      updateFormData(field, [...currentValues, value]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: 'c5ce0165-a022-418f-92d4-9bdcfbd60a37',
          subject: 'New PD Evaluation Request',
          from_name: 'TDI Website',
          to: 'Info@teachersdeserveit.com',
          // Form data
          'Staff Count': formData.staffCount,
          'PD Setup': formData.pdSetup,
          'Role-Based Approach': formData.roleBasedApproach,
          'Struggling Area': formData.strugglingArea,
          'PD Impact Confidence': formData.pdImpactConfidence,
          'Survey Usage': formData.surveyUsage,
          'Urgent Goal': formData.urgentGoal === 'Other' ? formData.urgentGoalOther : formData.urgentGoal,
          'Successful PD Year Vision': formData.successfulPDYear,
          'Easier PD Cycle Needs': formData.easierPDCycle.join(', '),
          'Measure ROI': formData.measureROI,
          'Biggest Frustration': formData.biggestFrustration,
          'Where to Start': formData.whereToStart,
          'Email': formData.email,
          'Name': formData.name,
          'Title': formData.title,
          'School Name': formData.schoolName,
          'School Address': formData.schoolAddress,
          'How Connected': formData.howConnected,
          'Anything Else': formData.anythingElse,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 5:
        return formData.email && formData.name && formData.schoolName;
      default:
        return true;
    }
  };

  // Radio button component
  const RadioOption = ({
    name,
    value,
    label,
    checked,
    onChange
  }: {
    name: string;
    value: string;
    label: string;
    checked: boolean;
    onChange: () => void;
  }) => (
    <label className="flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-gray-300"
      style={{
        borderColor: checked ? '#ffba06' : '#e5e5e5',
        backgroundColor: checked ? '#fffbeb' : 'white'
      }}
    >
      <div className="flex-shrink-0 mt-0.5">
        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
          style={{ borderColor: checked ? '#ffba06' : '#ccc' }}
        >
          {checked && (
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ffba06' }} />
          )}
        </div>
      </div>
      <span className="text-sm" style={{ color: '#1e2749' }}>{label}</span>
    </label>
  );

  // Checkbox component
  const CheckboxOption = ({
    value,
    label,
    checked,
    onChange
  }: {
    value: string;
    label: string;
    checked: boolean;
    onChange: () => void;
  }) => (
    <label className="flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-gray-300"
      style={{
        borderColor: checked ? '#ffba06' : '#e5e5e5',
        backgroundColor: checked ? '#fffbeb' : 'white'
      }}
    >
      <div className="flex-shrink-0 mt-0.5">
        <div className="w-5 h-5 rounded border-2 flex items-center justify-center"
          style={{ borderColor: checked ? '#ffba06' : '#ccc', backgroundColor: checked ? '#ffba06' : 'white' }}
        >
          {checked && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <span className="text-sm" style={{ color: '#1e2749' }}>{label}</span>
    </label>
  );

  // Scale selector component
  const ScaleSelector = ({
    value,
    onChange,
    lowLabel,
    highLabel
  }: {
    value: number;
    onChange: (val: number) => void;
    lowLabel: string;
    highLabel: string;
  }) => (
    <div>
      <div className="flex justify-between gap-2 mb-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className="flex-1 py-3 rounded-lg font-semibold transition-all"
            style={{
              backgroundColor: value === num ? '#ffba06' : '#f5f5f5',
              color: value === num ? '#1e2749' : '#666',
            }}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs" style={{ color: '#666' }}>
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );

  // Step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold" style={{ color: '#1e2749' }}>About Your Team</h2>

            {/* Q1 */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                How many teachers, paraprofessionals, and support staff do you oversee? (Ball park it)
              </label>
              <input
                type="number"
                value={formData.staffCount}
                onChange={(e) => updateFormData('staffCount', e.target.value)}
                placeholder="e.g., 50"
                className="w-full px-4 py-3 rounded-lg border-2 text-base transition-all focus:outline-none"
                style={{ borderColor: '#e5e5e5' }}
                onFocus={(e) => e.target.style.borderColor = '#ffba06'}
                onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
              />
            </div>

            {/* Q2 */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                Which best describes your current professional learning setup?
              </label>
              <div className="space-y-3">
                {[
                  'We do most PD in-house',
                  'We bring in outside presenters occasionally',
                  'We use a mix of online and in-person PD',
                  "We're figuring it out as we go"
                ].map((option) => (
                  <RadioOption
                    key={option}
                    name="pdSetup"
                    value={option}
                    label={option}
                    checked={formData.pdSetup === option}
                    onChange={() => updateFormData('pdSetup', option)}
                  />
                ))}
              </div>
            </div>

            {/* Q3 */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                Our PD approach actually changes based on role (teachers vs. paras vs. specialists).
              </label>
              <div className="space-y-3">
                {['Yes', 'No', 'Somewhat'].map((option) => (
                  <RadioOption
                    key={option}
                    name="roleBasedApproach"
                    value={option}
                    label={option}
                    checked={formData.roleBasedApproach === option}
                    onChange={() => updateFormData('roleBasedApproach', option)}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold" style={{ color: '#1e2749' }}>Current Challenges</h2>

            {/* Q4 */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                What's one area your teachers or paras are struggling with right now?
              </label>
              <textarea
                value={formData.strugglingArea}
                onChange={(e) => updateFormData('strugglingArea', e.target.value)}
                placeholder="Tell us what you're seeing..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border-2 text-base transition-all focus:outline-none resize-none"
                style={{ borderColor: '#e5e5e5' }}
                onFocus={(e) => e.target.style.borderColor = '#ffba06'}
                onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
              />
            </div>

            {/* Q5 */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                How confident are you that your PD days lead to real classroom impact?
              </label>
              <ScaleSelector
                value={formData.pdImpactConfidence}
                onChange={(val) => updateFormData('pdImpactConfidence', val)}
                lowLabel="Not confident"
                highLabel="Very confident"
              />
            </div>

            {/* Q6 */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                Our staff surveys after PD give us data we can actually use to plan what's next.
              </label>
              <div className="space-y-3">
                {['Yes', 'No', "We don't survey"].map((option) => (
                  <RadioOption
                    key={option}
                    name="surveyUsage"
                    value={option}
                    label={option}
                    checked={formData.surveyUsage === option}
                    onChange={() => updateFormData('surveyUsage', option)}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold" style={{ color: '#1e2749' }}>Your Goals</h2>

            {/* Q7 */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                When you think about your PD goals this year, what feels most urgent?
              </label>
              <div className="space-y-3">
                {[
                  'Teacher retention & morale',
                  'Instructional strategies',
                  'Student engagement',
                  'Staff wellness & burnout',
                  'Building leadership capacity',
                  'Other'
                ].map((option) => (
                  <div key={option}>
                    <RadioOption
                      name="urgentGoal"
                      value={option}
                      label={option}
                      checked={formData.urgentGoal === option}
                      onChange={() => updateFormData('urgentGoal', option)}
                    />
                    {option === 'Other' && formData.urgentGoal === 'Other' && (
                      <input
                        type="text"
                        value={formData.urgentGoalOther}
                        onChange={(e) => updateFormData('urgentGoalOther', e.target.value)}
                        placeholder="Please specify..."
                        className="w-full mt-2 px-4 py-3 rounded-lg border-2 text-base transition-all focus:outline-none"
                        style={{ borderColor: '#e5e5e5' }}
                        onFocus={(e) => e.target.style.borderColor = '#ffba06'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Q8 */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                Paint us a quick picture - what does a successful PD year look like to you?
              </label>
              <textarea
                value={formData.successfulPDYear}
                onChange={(e) => updateFormData('successfulPDYear', e.target.value)}
                placeholder="Dream big..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border-2 text-base transition-all focus:outline-none resize-none"
                style={{ borderColor: '#e5e5e5' }}
                onFocus={(e) => e.target.style.borderColor = '#ffba06'}
                onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
              />
            </div>

            {/* Q9 */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                Which of these would make your next PD cycle easier (and saner)? <span style={{ color: '#666', fontWeight: 'normal' }}>Select all that apply</span>
              </label>
              <div className="space-y-3">
                {[
                  'Ready-made PD content I can trust',
                  "Someone to facilitate so I don't have to",
                  "Data to prove it's working",
                  'Personalized support for different roles',
                  'Ongoing coaching, not just one-and-done',
                  'Flexible scheduling options'
                ].map((option) => (
                  <CheckboxOption
                    key={option}
                    value={option}
                    label={option}
                    checked={formData.easierPDCycle.includes(option)}
                    onChange={() => toggleCheckbox('easierPDCycle', option)}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold" style={{ color: '#1e2749' }}>Your Reality</h2>

            {/* Q10 */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                We currently have a clear process for measuring PD ROI (like retention, satisfaction, or 5Essentials data).
              </label>
              <div className="space-y-3">
                {['Yes', 'No', 'Working on it'].map((option) => (
                  <RadioOption
                    key={option}
                    name="measureROI"
                    value={option}
                    label={option}
                    checked={formData.measureROI === option}
                    onChange={() => updateFormData('measureROI', option)}
                  />
                ))}
              </div>
            </div>

            {/* Q11 */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                Be honest... what's your biggest frustration about PD planning right now? <span style={{ color: '#666', fontWeight: 'normal' }}>(No judgment. We've heard it all.)</span>
              </label>
              <textarea
                value={formData.biggestFrustration}
                onChange={(e) => updateFormData('biggestFrustration', e.target.value)}
                placeholder="Let it out..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border-2 text-base transition-all focus:outline-none resize-none"
                style={{ borderColor: '#e5e5e5' }}
                onFocus={(e) => e.target.style.borderColor = '#ffba06'}
                onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
              />
            </div>

            {/* Q12 */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                If TDI could build your custom PD plan in 24 hours, where would you start?
              </label>
              <div className="space-y-3">
                {[
                  'A quick win to get staff buy-in',
                  'Deep dive into one focus area',
                  'Full-year PD calendar',
                  'Not sure yet - help me figure it out'
                ].map((option) => (
                  <RadioOption
                    key={option}
                    name="whereToStart"
                    value={option}
                    label={option}
                    checked={formData.whereToStart === option}
                    onChange={() => updateFormData('whereToStart', option)}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold" style={{ color: '#1e2749' }}>Your Information</h2>

            {/* Q13 - Email */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                What's the best email to send your custom PD Evaluation Plan to? <span style={{ color: '#f96767' }}>*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="you@school.edu"
                required
                className="w-full px-4 py-3 rounded-lg border-2 text-base transition-all focus:outline-none"
                style={{ borderColor: '#e5e5e5' }}
                onFocus={(e) => e.target.style.borderColor = '#ffba06'}
                onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
              />
            </div>

            {/* Q14 - Name */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                Your Name <span style={{ color: '#f96767' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="First and last name"
                required
                className="w-full px-4 py-3 rounded-lg border-2 text-base transition-all focus:outline-none"
                style={{ borderColor: '#e5e5e5' }}
                onFocus={(e) => e.target.style.borderColor = '#ffba06'}
                onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
              />
            </div>

            {/* Q15 - Title */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                Your Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                placeholder="e.g., Principal, Director of PD"
                className="w-full px-4 py-3 rounded-lg border-2 text-base transition-all focus:outline-none"
                style={{ borderColor: '#e5e5e5' }}
                onFocus={(e) => e.target.style.borderColor = '#ffba06'}
                onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
              />
            </div>

            {/* Q16 - School Name */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                School Name <span style={{ color: '#f96767' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => updateFormData('schoolName', e.target.value)}
                placeholder="Your school or district name"
                required
                className="w-full px-4 py-3 rounded-lg border-2 text-base transition-all focus:outline-none"
                style={{ borderColor: '#e5e5e5' }}
                onFocus={(e) => e.target.style.borderColor = '#ffba06'}
                onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
              />
            </div>

            {/* Q17 - School Address */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                School Address
              </label>
              <input
                type="text"
                value={formData.schoolAddress}
                onChange={(e) => updateFormData('schoolAddress', e.target.value)}
                placeholder="City, State"
                className="w-full px-4 py-3 rounded-lg border-2 text-base transition-all focus:outline-none"
                style={{ borderColor: '#e5e5e5' }}
                onFocus={(e) => e.target.style.borderColor = '#ffba06'}
                onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
              />
            </div>

            {/* Q18 - How Connected */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                How did you connect to Teachers Deserve It?
              </label>
              <div className="space-y-3">
                {[
                  'Google search',
                  'Social media',
                  'Colleague recommendation',
                  'Conference or event',
                  'Substack/Newsletter',
                  'Podcast',
                  'Other'
                ].map((option) => (
                  <RadioOption
                    key={option}
                    name="howConnected"
                    value={option}
                    label={option}
                    checked={formData.howConnected === option}
                    onChange={() => updateFormData('howConnected', option)}
                  />
                ))}
              </div>
            </div>

            {/* Q19 - Anything Else */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                Anything else we should know before we get to work? <span style={{ color: '#666', fontWeight: 'normal' }}>(This is your "wish list" space - dream big.)</span>
              </label>
              <textarea
                value={formData.anythingElse}
                onChange={(e) => updateFormData('anythingElse', e.target.value)}
                placeholder="Your wish list..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border-2 text-base transition-all focus:outline-none resize-none"
                style={{ borderColor: '#e5e5e5' }}
                onFocus={(e) => e.target.style.borderColor = '#ffba06'}
                onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Success/Confirmation view
  if (isSubmitted) {
    return (
      <main className="min-h-screen">
        {/* Hero */}
        <section className="py-12 md:py-16" style={{ backgroundColor: '#1e2749' }}>
          <div className="container-default text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#ffffff' }}>
              Get Your Free PD Evaluation Plan
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.9 }}>
              Answer a few questions and we'll send you a custom PD evaluation plan within 24 hours.
            </p>
          </div>
        </section>

        {/* Success Message */}
        <section className="py-16 md:py-24" style={{ backgroundColor: '#f5f5f5' }}>
          <div className="container-default max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
              {/* Checkmark Icon */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f5e9' }}>
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="#4caf50" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#1e2749' }}>
                You're all set!
              </h2>
              <p className="text-lg mb-8" style={{ color: '#1e2749', opacity: 0.8 }}>
                Check your inbox within 24 hours for your custom PD Evaluation Plan.
              </p>

              <div className="pt-6 border-t" style={{ borderColor: '#e5e5e5' }}>
                <p className="text-sm mb-4" style={{ color: '#666' }}>
                  Want to talk sooner?
                </p>
                <Link
                  href="/contact"
                  className="inline-block px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105"
                  style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                >
                  Schedule a Call
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="py-12 md:py-16" style={{ backgroundColor: '#1e2749' }}>
        <div className="container-default text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Get Your Free PD Evaluation Plan
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.9 }}>
            Answer a few questions and we'll send you a custom PD evaluation plan within 24 hours.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 md:py-16" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-default max-w-2xl mx-auto px-4">

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2" style={{ color: '#1e2749' }}>
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}% complete</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(currentStep / totalSteps) * 100}%`,
                  backgroundColor: '#ffba06'
                }}
              />
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
            {renderStepContent()}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t" style={{ borderColor: '#e5e5e5' }}>
              {currentStep > 1 ? (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-3 rounded-lg font-semibold border-2 transition-all hover:bg-gray-50"
                  style={{ borderColor: '#1e2749', color: '#1e2749' }}
                >
                  Back
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={() => currentStep < totalSteps ? setCurrentStep(currentStep + 1) : handleSubmit()}
                disabled={!canProceed() || isSubmitting}
                className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
              >
                {isSubmitting ? 'Submitting...' : currentStep === totalSteps ? 'Get My Plan' : 'Next'}
              </button>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
