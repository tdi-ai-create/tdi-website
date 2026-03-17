'use client';

import React, { useState, useCallback, useEffect, memo } from 'react';

const SURVEY_DEADLINE = new Date('2026-03-31T23:59:59');
const SECTIONS = [
  'Getting Started',
  'Onboarding & the Portal',
  'The Creation Process',
  'Compensation & Expectations',
  'Communication & Team',
  'Overall Experience',
];

type FormData = {
  // Identity (for non-logged-in users)
  name: string;
  email: string;
  creator_id: string | null;
  content_path: string | null;

  // Section 1
  q1_referral: string;
  q1_referral_other: string;
  q1_clarity_score: number | null;
  q1_clarity_followup: string;
  q1_reason: string;
  q1_reason_other: string;

  // Section 2
  q2_portal_clarity_score: number | null;
  q2_portal_clarity_followup: string;
  q2_stuck: boolean | null;
  q2_stuck_detail: string;
  q2_support_score: number | null;
  q2_support_followup: string;
  q2_improvement: string;

  // Section 3
  q3_workload_score: number | null;
  q3_workload_followup: string;
  q3_hard_stage: string;
  q3_production_score: number | null;
  q3_production_followup: string;
  q3_feedback_score: number | null;
  q3_feedback_followup: string;

  // Section 4
  q4_comp_clarity_score: number | null;
  q4_comp_clarity_followup: string;
  q4_revshare_clear: string;
  q4_revshare_clear_followup: string;
  q4_revshare_fair_score: number | null;
  q4_revshare_fair_followup: string;
  q4_payment_score: number | null;
  q4_payment_followup: string;

  // Section 5
  q5_responsiveness_score: number | null;
  q5_responsiveness_followup: string;
  q5_comms_channel: string;
  q5_fell_through: boolean | null;
  q5_fell_through_detail: string;

  // Section 6
  q6_overall_score: number | null;
  q6_overall_followup: string;
  q6_return_score: number | null;
  q6_return_followup: string;
  q6_nps: number | null;
  q6_nps_followup: string;
  q6_open_feedback: string;
};

const initialFormData: FormData = {
  name: '',
  email: '',
  creator_id: null,
  content_path: null,
  q1_referral: '',
  q1_referral_other: '',
  q1_clarity_score: null,
  q1_clarity_followup: '',
  q1_reason: '',
  q1_reason_other: '',
  q2_portal_clarity_score: null,
  q2_portal_clarity_followup: '',
  q2_stuck: null,
  q2_stuck_detail: '',
  q2_support_score: null,
  q2_support_followup: '',
  q2_improvement: '',
  q3_workload_score: null,
  q3_workload_followup: '',
  q3_hard_stage: '',
  q3_production_score: null,
  q3_production_followup: '',
  q3_feedback_score: null,
  q3_feedback_followup: '',
  q4_comp_clarity_score: null,
  q4_comp_clarity_followup: '',
  q4_revshare_clear: '',
  q4_revshare_clear_followup: '',
  q4_revshare_fair_score: null,
  q4_revshare_fair_followup: '',
  q4_payment_score: null,
  q4_payment_followup: '',
  q5_responsiveness_score: null,
  q5_responsiveness_followup: '',
  q5_comms_channel: '',
  q5_fell_through: null,
  q5_fell_through_detail: '',
  q6_overall_score: null,
  q6_overall_followup: '',
  q6_return_score: null,
  q6_return_followup: '',
  q6_nps: null,
  q6_nps_followup: '',
  q6_open_feedback: '',
};

// Memoized components to prevent re-renders
const ScaleSelector = memo(({
  value,
  onChange,
  min,
  max,
  lowLabel,
  highLabel,
}: {
  value: number | null;
  onChange: (v: number) => void;
  min: number;
  max: number;
  lowLabel: string;
  highLabel: string;
}) => (
  <div className="space-y-2">
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: max - min + 1 }, (_, i) => min + i).map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`w-10 h-10 rounded-lg font-medium transition-all ${
            value === n
              ? 'bg-[#1D9E75] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
    <div className="flex justify-between text-xs text-slate-500 px-1">
      <span>{min} = {lowLabel}</span>
      <span>{max} = {highLabel}</span>
    </div>
  </div>
));
ScaleSelector.displayName = 'ScaleSelector';

const RadioGroup = memo(({
  value,
  onChange,
  options,
}: {
  value: string | boolean | null;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <div className="flex flex-wrap gap-3">
    {options.map(opt => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          String(value) === opt.value
            ? 'bg-[#1D9E75] text-white shadow-md'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
));
RadioGroup.displayName = 'RadioGroup';

const TextArea = memo(({
  value,
  onChange,
  placeholder,
  required = false,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
}) => (
  <div>
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={4}
      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1D9E75] focus:border-[#1D9E75] resize-none transition-all"
    />
    {required && <span className="text-red-500 text-sm">* Required</span>}
  </div>
));
TextArea.displayName = 'TextArea';

const FollowUpBox = memo(({
  show,
  value,
  onChange,
  placeholder,
}: {
  show: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
}) => {
  if (!show) return null;
  return (
    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg animate-in slide-in-from-top-2 duration-300">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Help us improve <span className="text-red-500">*</span>
      </label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none bg-white"
      />
    </div>
  );
});
FollowUpBox.displayName = 'FollowUpBox';

const QuestionBlock = memo(({
  number,
  question,
  children,
  subtext,
}: {
  number: string;
  question: string;
  children: React.ReactNode;
  subtext?: string;
}) => (
  <div className="space-y-3 pb-6 border-b border-slate-100 last:border-0">
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">
        {number}. {question}
      </span>
      {subtext && <p className="text-sm text-slate-500 mt-1">{subtext}</p>}
    </label>
    {children}
  </div>
));
QuestionBlock.displayName = 'QuestionBlock';

export default function CreatorSurveyPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  // Check if survey is closed
  useEffect(() => {
    if (new Date() > SURVEY_DEADLINE) {
      setIsClosed(true);
    }
  }, []);

  // Check for logged-in creator session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/creator-portal/dashboard');
        if (res.ok) {
          const data = await res.json();
          if (data.creator) {
            setIsLoggedIn(true);
            setFormData(prev => ({
              ...prev,
              creator_id: data.creator.id,
              name: data.creator.name || '',
              email: data.creator.email || '',
              content_path: data.creator.content_path || null,
            }));
          }
        }
      } catch {
        // Not logged in, that's fine
      }
    };
    checkSession();
  }, []);

  const handleTextChange = useCallback((field: keyof FormData) => (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  }, []);

  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Check if course creator (for Section 4 conditional questions)
  const isCourseCreator = formData.content_path === 'course' || formData.content_path === null;

  // Validation for each section
  const validateSection = (section: number): boolean => {
    switch (section) {
      case 0: // Section 1
        if (!isLoggedIn && (!formData.name.trim() || !formData.email.trim())) return false;
        if (!formData.q1_referral) return false;
        if (formData.q1_referral === 'Other' && !formData.q1_referral_other.trim()) return false;
        if (formData.q1_clarity_score === null) return false;
        if (formData.q1_clarity_score < 5 && !formData.q1_clarity_followup.trim()) return false;
        if (!formData.q1_reason) return false;
        if (formData.q1_reason === 'Other' && !formData.q1_reason_other.trim()) return false;
        return true;

      case 1: // Section 2
        if (formData.q2_portal_clarity_score === null) return false;
        if (formData.q2_portal_clarity_score < 5 && !formData.q2_portal_clarity_followup.trim()) return false;
        if (formData.q2_stuck === null) return false;
        if (formData.q2_stuck === true && !formData.q2_stuck_detail.trim()) return false;
        if (formData.q2_support_score === null) return false;
        if (formData.q2_support_score < 5 && !formData.q2_support_followup.trim()) return false;
        if (!formData.q2_improvement.trim()) return false;
        return true;

      case 2: // Section 3
        if (formData.q3_workload_score === null) return false;
        if (formData.q3_workload_score < 5 && !formData.q3_workload_followup.trim()) return false;
        if (!formData.q3_hard_stage) return false;
        if (formData.q3_production_score === null) return false;
        if (formData.q3_production_score < 5 && !formData.q3_production_followup.trim()) return false;
        if (formData.q3_feedback_score === null) return false;
        if (formData.q3_feedback_score < 5 && !formData.q3_feedback_followup.trim()) return false;
        return true;

      case 3: // Section 4
        if (formData.q4_comp_clarity_score === null) return false;
        if (formData.q4_comp_clarity_score < 5 && !formData.q4_comp_clarity_followup.trim()) return false;
        if (isCourseCreator) {
          if (!formData.q4_revshare_clear) return false;
          if ((formData.q4_revshare_clear === 'Somewhat' || formData.q4_revshare_clear === 'No') && !formData.q4_revshare_clear_followup.trim()) return false;
          if (formData.q4_revshare_fair_score === null) return false;
          if (formData.q4_revshare_fair_score < 5 && !formData.q4_revshare_fair_followup.trim()) return false;
          if (formData.q4_payment_score === null) return false;
          if (formData.q4_payment_score < 5 && !formData.q4_payment_followup.trim()) return false;
        }
        return true;

      case 4: // Section 5
        if (formData.q5_responsiveness_score === null) return false;
        if (formData.q5_responsiveness_score < 5 && !formData.q5_responsiveness_followup.trim()) return false;
        if (!formData.q5_comms_channel) return false;
        if (formData.q5_fell_through === null) return false;
        if (formData.q5_fell_through === true && !formData.q5_fell_through_detail.trim()) return false;
        return true;

      case 5: // Section 6
        if (formData.q6_overall_score === null) return false;
        if (formData.q6_overall_score < 10 && !formData.q6_overall_followup.trim()) return false;
        if (formData.q6_return_score === null) return false;
        if (formData.q6_return_score < 5 && !formData.q6_return_followup.trim()) return false;
        if (formData.q6_nps === null) return false;
        if (formData.q6_nps < 9 && !formData.q6_nps_followup.trim()) return false;
        return true;

      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateSection(currentSection)) {
      setCurrentSection(prev => Math.min(prev + 1, SECTIONS.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentSection(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateSection(currentSection)) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = {
        creator_id: formData.creator_id,
        name: formData.name,
        email: formData.email,
        content_path: formData.content_path,
        q1_referral: formData.q1_referral === 'Other' ? formData.q1_referral_other : formData.q1_referral,
        q1_clarity_score: formData.q1_clarity_score,
        q1_clarity_followup: formData.q1_clarity_followup || null,
        q1_reason: formData.q1_reason === 'Other' ? formData.q1_reason_other : formData.q1_reason,
        q2_portal_clarity_score: formData.q2_portal_clarity_score,
        q2_portal_clarity_followup: formData.q2_portal_clarity_followup || null,
        q2_stuck: formData.q2_stuck,
        q2_stuck_detail: formData.q2_stuck_detail || null,
        q2_support_score: formData.q2_support_score,
        q2_support_followup: formData.q2_support_followup || null,
        q2_improvement: formData.q2_improvement,
        q3_workload_score: formData.q3_workload_score,
        q3_workload_followup: formData.q3_workload_followup || null,
        q3_hard_stage: formData.q3_hard_stage,
        q3_production_score: formData.q3_production_score,
        q3_production_followup: formData.q3_production_followup || null,
        q3_feedback_score: formData.q3_feedback_score,
        q3_feedback_followup: formData.q3_feedback_followup || null,
        q4_comp_clarity_score: formData.q4_comp_clarity_score,
        q4_comp_clarity_followup: formData.q4_comp_clarity_followup || null,
        q4_revshare_clear: isCourseCreator ? formData.q4_revshare_clear : null,
        q4_revshare_clear_followup: isCourseCreator ? formData.q4_revshare_clear_followup || null : null,
        q4_revshare_fair_score: isCourseCreator ? formData.q4_revshare_fair_score : null,
        q4_revshare_fair_followup: isCourseCreator ? formData.q4_revshare_fair_followup || null : null,
        q4_payment_score: isCourseCreator ? formData.q4_payment_score : null,
        q4_payment_followup: isCourseCreator ? formData.q4_payment_followup || null : null,
        q5_responsiveness_score: formData.q5_responsiveness_score,
        q5_responsiveness_followup: formData.q5_responsiveness_followup || null,
        q5_comms_channel: formData.q5_comms_channel,
        q5_fell_through: formData.q5_fell_through,
        q5_fell_through_detail: formData.q5_fell_through_detail || null,
        q6_overall_score: formData.q6_overall_score,
        q6_overall_followup: formData.q6_overall_followup || null,
        q6_return_score: formData.q6_return_score,
        q6_return_followup: formData.q6_return_followup || null,
        q6_nps: formData.q6_nps,
        q6_nps_followup: formData.q6_nps_followup || null,
        q6_open_feedback: formData.q6_open_feedback || null,
      };

      const response = await fetch('/api/creator-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
        // Mark as completed in localStorage for popup
        if (typeof window !== 'undefined') {
          localStorage.setItem('tdi_survey_completed', 'true');
        }
      } else {
        setError(result.error || 'Failed to submit survey');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Survey closed screen
  if (isClosed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6">
        <div className="max-w-lg text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">This survey is now closed</h1>
          <p className="text-slate-600 leading-relaxed">
            Thank you to everyone who responded. Your feedback helps us improve the Creator Program for educators everywhere.
          </p>
        </div>
      </div>
    );
  }

  // Thank you screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6">
        <div className="max-w-lg text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Thank you for your feedback</h1>
          <p className="text-slate-600 leading-relaxed mb-6">
            Your responses help us make the Creator Program better for you and every educator who comes after you.
          </p>
          <p className="text-slate-500 text-sm">
            You can close this page now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-[#1D9E75] text-white py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-wider text-white/70 mb-1">Creator Feedback</p>
          <h1 className="text-xl font-bold">TDI Creator Experience Survey</h1>
        </div>
      </div>

      {/* Deadline Banner */}
      <div className="bg-amber-50 border-b border-amber-200 py-3 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-2 text-amber-800 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Survey closes March 31, 2026</span>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">
              Section {currentSection + 1} of {SECTIONS.length}
            </span>
            <span className="text-sm text-slate-500">
              {SECTIONS[currentSection]}
            </span>
          </div>
          <div className="flex gap-1">
            {SECTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i < currentSection
                    ? 'bg-[#1D9E75]'
                    : i === currentSection
                    ? 'bg-[#1D9E75]/50'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Intro (only on first section) */}
        {currentSection === 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8">
            <p className="text-slate-700 leading-relaxed mb-3">
              We want to hear what worked, what didn&apos;t, and what we can do better &mdash; from your first interaction with TDI through content launch.
            </p>
            <p className="text-slate-600 text-sm">
              This takes about 5&ndash;7 minutes. Your honest answers help us improve the program for every creator.
            </p>
          </div>
        )}

        {/* Section Header */}
        <h2 className="text-xl font-bold text-slate-800 mb-6">
          Section {currentSection + 1}: {SECTIONS[currentSection]}
        </h2>

        {/* Section Content */}
        <div className="space-y-8">
          {/* Section 1: Getting Started */}
          {currentSection === 0 && (
            <>
              {/* Name/Email for non-logged-in users */}
              {!isLoggedIn && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                  <p className="text-sm text-slate-600 mb-2">So we can connect your feedback to your creator profile:</p>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={handleTextChange('name')}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1D9E75] focus:border-[#1D9E75]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={handleTextChange('email')}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1D9E75] focus:border-[#1D9E75]"
                    />
                  </div>
                </div>
              )}

              <QuestionBlock number="1.1" question="How did you first hear about the TDI Creator Program?">
                <RadioGroup
                  value={formData.q1_referral}
                  onChange={v => updateField('q1_referral', v)}
                  options={[
                    { value: 'Podcast', label: 'Podcast' },
                    { value: 'LinkedIn', label: 'LinkedIn' },
                    { value: 'Colleague', label: 'Colleague' },
                    { value: 'Social media', label: 'Social media' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />
                {formData.q1_referral === 'Other' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={formData.q1_referral_other}
                      onChange={handleTextChange('q1_referral_other')}
                      placeholder="Please specify..."
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1D9E75] focus:border-[#1D9E75]"
                    />
                  </div>
                )}
              </QuestionBlock>

              <QuestionBlock
                number="1.2"
                question="Before you applied, did you have a clear sense of what the program involved — including time commitment, compensation, and what TDI would handle?"
              >
                <ScaleSelector
                  value={formData.q1_clarity_score}
                  onChange={v => updateField('q1_clarity_score', v)}
                  min={1}
                  max={5}
                  lowLabel="Not clear at all"
                  highLabel="Very clear"
                />
                <FollowUpBox
                  show={formData.q1_clarity_score !== null && formData.q1_clarity_score < 5}
                  value={formData.q1_clarity_followup}
                  onChange={handleTextChange('q1_clarity_followup')}
                  placeholder="What information were you missing, and when would you have wanted to know it?"
                />
              </QuestionBlock>

              <QuestionBlock number="1.3" question="What was the main reason you decided to apply?">
                <RadioGroup
                  value={formData.q1_reason}
                  onChange={v => updateField('q1_reason', v)}
                  options={[
                    { value: 'Earn income', label: 'Earn income' },
                    { value: 'Share expertise', label: 'Share expertise' },
                    { value: 'Build credibility', label: 'Build credibility' },
                    { value: 'Reach educators', label: 'Reach educators' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />
                {formData.q1_reason === 'Other' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={formData.q1_reason_other}
                      onChange={handleTextChange('q1_reason_other')}
                      placeholder="Please specify..."
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1D9E75] focus:border-[#1D9E75]"
                    />
                  </div>
                )}
              </QuestionBlock>
            </>
          )}

          {/* Section 2: Onboarding & the Portal */}
          {currentSection === 1 && (
            <>
              <QuestionBlock
                number="2.1"
                question="How easy was it to understand what you needed to do when you first logged into the Creator Portal?"
              >
                <ScaleSelector
                  value={formData.q2_portal_clarity_score}
                  onChange={v => updateField('q2_portal_clarity_score', v)}
                  min={1}
                  max={5}
                  lowLabel="Very confusing"
                  highLabel="Very clear"
                />
                <FollowUpBox
                  show={formData.q2_portal_clarity_score !== null && formData.q2_portal_clarity_score < 5}
                  value={formData.q2_portal_clarity_followup}
                  onChange={handleTextChange('q2_portal_clarity_followup')}
                  placeholder="Which part was confusing? What would have made it clearer?"
                />
              </QuestionBlock>

              <QuestionBlock
                number="2.2"
                question="Were there any steps where you felt stuck or unsure what to do next?"
              >
                <RadioGroup
                  value={formData.q2_stuck === null ? null : formData.q2_stuck ? 'true' : 'false'}
                  onChange={v => updateField('q2_stuck', v === 'true')}
                  options={[
                    { value: 'true', label: 'Yes' },
                    { value: 'false', label: 'No' },
                  ]}
                />
                <FollowUpBox
                  show={formData.q2_stuck === true}
                  value={formData.q2_stuck_detail}
                  onChange={handleTextChange('q2_stuck_detail')}
                  placeholder="Which step, and what was confusing? What should we have provided?"
                />
              </QuestionBlock>

              <QuestionBlock
                number="2.3"
                question="How would you rate the support from the TDI team during onboarding?"
              >
                <ScaleSelector
                  value={formData.q2_support_score}
                  onChange={v => updateField('q2_support_score', v)}
                  min={1}
                  max={5}
                  lowLabel="Not supportive"
                  highLabel="Very supportive"
                />
                <FollowUpBox
                  show={formData.q2_support_score !== null && formData.q2_support_score < 5}
                  value={formData.q2_support_followup}
                  onChange={handleTextChange('q2_support_followup')}
                  placeholder="What kind of support did you need that you didn't get?"
                />
              </QuestionBlock>

              <QuestionBlock
                number="2.4"
                question="What is one thing that would have made onboarding easier or faster?"
              >
                <TextArea
                  value={formData.q2_improvement}
                  onChange={handleTextChange('q2_improvement')}
                  placeholder="Share your thoughts..."
                  required
                />
              </QuestionBlock>
            </>
          )}

          {/* Section 3: The Creation Process */}
          {currentSection === 2 && (
            <>
              <QuestionBlock
                number="3.1"
                question="Overall, how manageable was the workload involved in creating your content?"
              >
                <ScaleSelector
                  value={formData.q3_workload_score}
                  onChange={v => updateField('q3_workload_score', v)}
                  min={1}
                  max={5}
                  lowLabel="Overwhelming"
                  highLabel="Very manageable"
                />
                <FollowUpBox
                  show={formData.q3_workload_score !== null && formData.q3_workload_score < 5}
                  value={formData.q3_workload_followup}
                  onChange={handleTextChange('q3_workload_followup')}
                  placeholder="Which parts took more time than expected? What could we do to reduce that?"
                />
              </QuestionBlock>

              <QuestionBlock
                number="3.2"
                question="Which stage of the process felt most time-consuming or difficult?"
              >
                <RadioGroup
                  value={formData.q3_hard_stage}
                  onChange={v => updateField('q3_hard_stage', v)}
                  options={[
                    { value: 'Application', label: 'Application' },
                    { value: 'Choosing content type', label: 'Choosing content type' },
                    { value: 'Outline', label: 'Outline' },
                    { value: 'Recording', label: 'Recording' },
                    { value: 'Editing', label: 'Editing' },
                    { value: 'Branding', label: 'Branding' },
                    { value: 'Review', label: 'Review' },
                    { value: 'Launch', label: 'Launch' },
                  ]}
                />
              </QuestionBlock>

              <QuestionBlock
                number="3.3"
                question="How well did TDI support you during the production phase (editing, design, branding, publishing)?"
              >
                <ScaleSelector
                  value={formData.q3_production_score}
                  onChange={v => updateField('q3_production_score', v)}
                  min={1}
                  max={5}
                  lowLabel="Not supportive"
                  highLabel="Very supportive"
                />
                <FollowUpBox
                  show={formData.q3_production_score !== null && formData.q3_production_score < 5}
                  value={formData.q3_production_followup}
                  onChange={handleTextChange('q3_production_followup')}
                  placeholder="Where did you feel unsupported? What should TDI have handled differently?"
                />
              </QuestionBlock>

              <QuestionBlock
                number="3.4"
                question="How clear was the feedback you received from the team during reviews?"
              >
                <ScaleSelector
                  value={formData.q3_feedback_score}
                  onChange={v => updateField('q3_feedback_score', v)}
                  min={1}
                  max={5}
                  lowLabel="Unclear"
                  highLabel="Very clear"
                />
                <FollowUpBox
                  show={formData.q3_feedback_score !== null && formData.q3_feedback_score < 5}
                  value={formData.q3_feedback_followup}
                  onChange={handleTextChange('q3_feedback_followup')}
                  placeholder="What made the feedback hard to act on? What would clearer feedback look like?"
                />
              </QuestionBlock>
            </>
          )}

          {/* Section 4: Compensation & Expectations */}
          {currentSection === 3 && (
            <>
              <QuestionBlock
                number="4.1"
                question="Before you started, did you have a clear understanding of whether and how creators are compensated?"
              >
                <ScaleSelector
                  value={formData.q4_comp_clarity_score}
                  onChange={v => updateField('q4_comp_clarity_score', v)}
                  min={1}
                  max={5}
                  lowLabel="Not clear"
                  highLabel="Very clear"
                />
                <FollowUpBox
                  show={formData.q4_comp_clarity_score !== null && formData.q4_comp_clarity_score < 5}
                  value={formData.q4_comp_clarity_followup}
                  onChange={handleTextChange('q4_comp_clarity_followup')}
                  placeholder="What was unclear? When and how would you have wanted it explained?"
                />
              </QuestionBlock>

              {/* Course creator only questions */}
              {isCourseCreator && (
                <>
                  <QuestionBlock
                    number="4.2"
                    question="Did you feel the 30% revenue share structure was clearly explained before you committed to the program?"
                    subtext="Course creators only"
                  >
                    <RadioGroup
                      value={formData.q4_revshare_clear}
                      onChange={v => updateField('q4_revshare_clear', v)}
                      options={[
                        { value: 'Yes', label: 'Yes' },
                        { value: 'Somewhat', label: 'Somewhat' },
                        { value: 'No', label: 'No' },
                      ]}
                    />
                    <FollowUpBox
                      show={formData.q4_revshare_clear === 'Somewhat' || formData.q4_revshare_clear === 'No'}
                      value={formData.q4_revshare_clear_followup}
                      onChange={handleTextChange('q4_revshare_clear_followup')}
                      placeholder="What was unclear? When and how would you have wanted it explained?"
                    />
                  </QuestionBlock>

                  <QuestionBlock
                    number="4.3"
                    question="Do you feel the revenue share reflects the effort and value you contributed?"
                    subtext="Course creators only"
                  >
                    <ScaleSelector
                      value={formData.q4_revshare_fair_score}
                      onChange={v => updateField('q4_revshare_fair_score', v)}
                      min={1}
                      max={5}
                      lowLabel="Not at all"
                      highLabel="Absolutely"
                    />
                    <FollowUpBox
                      show={formData.q4_revshare_fair_score !== null && formData.q4_revshare_fair_score < 5}
                      value={formData.q4_revshare_fair_followup}
                      onChange={handleTextChange('q4_revshare_fair_followup')}
                      placeholder="What would feel more equitable to you given the work involved?"
                    />
                  </QuestionBlock>

                  <QuestionBlock
                    number="4.4"
                    question="How satisfied are you with how payment is tracked and communicated to you?"
                    subtext="Course creators only"
                  >
                    <ScaleSelector
                      value={formData.q4_payment_score}
                      onChange={v => updateField('q4_payment_score', v)}
                      min={1}
                      max={5}
                      lowLabel="Not satisfied"
                      highLabel="Very satisfied"
                    />
                    <FollowUpBox
                      show={formData.q4_payment_score !== null && formData.q4_payment_score < 5}
                      value={formData.q4_payment_followup}
                      onChange={handleTextChange('q4_payment_followup')}
                      placeholder="What information are you missing? How would you want to see your earnings reported?"
                    />
                  </QuestionBlock>
                </>
              )}
            </>
          )}

          {/* Section 5: Communication & Team */}
          {currentSection === 4 && (
            <>
              <QuestionBlock
                number="5.1"
                question="How responsive was the TDI team when you had questions or needed feedback?"
              >
                <ScaleSelector
                  value={formData.q5_responsiveness_score}
                  onChange={v => updateField('q5_responsiveness_score', v)}
                  min={1}
                  max={5}
                  lowLabel="Not responsive"
                  highLabel="Very responsive"
                />
                <FollowUpBox
                  show={formData.q5_responsiveness_score !== null && formData.q5_responsiveness_score < 5}
                  value={formData.q5_responsiveness_followup}
                  onChange={handleTextChange('q5_responsiveness_followup')}
                  placeholder="Can you give an example? What turnaround time would feel reasonable?"
                />
              </QuestionBlock>

              <QuestionBlock
                number="5.2"
                question="Where did most of your communication with the TDI team happen?"
              >
                <RadioGroup
                  value={formData.q5_comms_channel}
                  onChange={v => updateField('q5_comms_channel', v)}
                  options={[
                    { value: 'Email', label: 'Email' },
                    { value: 'Portal messages', label: 'Portal messages' },
                    { value: 'Slack', label: 'Slack' },
                    { value: 'Phone', label: 'Phone' },
                    { value: 'Multiple channels', label: 'Multiple channels' },
                  ]}
                />
              </QuestionBlock>

              <QuestionBlock
                number="5.3"
                question="Was there ever a time when you felt like your content or request fell through the cracks?"
              >
                <RadioGroup
                  value={formData.q5_fell_through === null ? null : formData.q5_fell_through ? 'true' : 'false'}
                  onChange={v => updateField('q5_fell_through', v === 'true')}
                  options={[
                    { value: 'true', label: 'Yes' },
                    { value: 'false', label: 'No' },
                  ]}
                />
                <FollowUpBox
                  show={formData.q5_fell_through === true}
                  value={formData.q5_fell_through_detail}
                  onChange={handleTextChange('q5_fell_through_detail')}
                  placeholder="What happened, and what should we put in place to prevent it?"
                />
              </QuestionBlock>
            </>
          )}

          {/* Section 6: Overall Experience */}
          {currentSection === 5 && (
            <>
              <QuestionBlock
                number="6.1"
                question="Overall, how satisfied are you with your experience as a TDI Creator?"
              >
                <ScaleSelector
                  value={formData.q6_overall_score}
                  onChange={v => updateField('q6_overall_score', v)}
                  min={1}
                  max={10}
                  lowLabel="Not satisfied"
                  highLabel="Extremely satisfied"
                />
                <FollowUpBox
                  show={formData.q6_overall_score !== null && formData.q6_overall_score < 10}
                  value={formData.q6_overall_followup}
                  onChange={handleTextChange('q6_overall_followup')}
                  placeholder="What would have made this a 10 out of 10 experience for you?"
                />
              </QuestionBlock>

              <QuestionBlock
                number="6.2"
                question="How likely are you to create another piece of content with TDI?"
              >
                <ScaleSelector
                  value={formData.q6_return_score}
                  onChange={v => updateField('q6_return_score', v)}
                  min={1}
                  max={5}
                  lowLabel="Not likely"
                  highLabel="Very likely"
                />
                <FollowUpBox
                  show={formData.q6_return_score !== null && formData.q6_return_score < 5}
                  value={formData.q6_return_followup}
                  onChange={handleTextChange('q6_return_followup')}
                  placeholder="What would need to change for you to want to create with us again?"
                />
              </QuestionBlock>

              <QuestionBlock
                number="6.3"
                question="How likely are you to recommend the TDI Creator Program to a fellow educator?"
                subtext="0 = Not at all likely, 10 = Extremely likely"
              >
                <ScaleSelector
                  value={formData.q6_nps}
                  onChange={v => updateField('q6_nps', v)}
                  min={0}
                  max={10}
                  lowLabel="Not likely"
                  highLabel="Extremely likely"
                />
                <FollowUpBox
                  show={formData.q6_nps !== null && formData.q6_nps < 9}
                  value={formData.q6_nps_followup}
                  onChange={handleTextChange('q6_nps_followup')}
                  placeholder="What would need to be different for you to recommend us without hesitation?"
                />
              </QuestionBlock>

              <QuestionBlock
                number="6.4"
                question="Is there anything else you'd like us to know — good or bad?"
                subtext="Optional"
              >
                <TextArea
                  value={formData.q6_open_feedback}
                  onChange={handleTextChange('q6_open_feedback')}
                  placeholder="Share any additional thoughts..."
                />
              </QuestionBlock>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentSection === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              currentSection === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Back
          </button>

          {currentSection < SECTIONS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!validateSection(currentSection)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                validateSection(currentSection)
                  ? 'bg-[#1D9E75] text-white hover:bg-[#178a64]'
                  : 'bg-[#1D9E75]/40 text-white cursor-not-allowed'
              }`}
            >
              Next Section
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!validateSection(currentSection) || isSubmitting}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                validateSection(currentSection) && !isSubmitting
                  ? 'bg-[#1D9E75] text-white hover:bg-[#178a64]'
                  : 'bg-[#1D9E75]/40 text-white cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Survey'}
            </button>
          )}
        </div>

        {/* Validation hint */}
        {!validateSection(currentSection) && (
          <p className="mt-4 text-center text-sm text-slate-500">
            Please complete all required questions to continue.
          </p>
        )}
      </div>
    </div>
  );
}
