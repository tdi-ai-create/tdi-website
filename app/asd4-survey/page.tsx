'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckCircle } from 'lucide-react';

// Schools in ASD4
const SCHOOLS = [
  'Army Trail Elementary',
  'Fullerton Elementary',
  'Lake Park Elementary',
  'Lincoln Elementary',
  'Stone Elementary',
  'Wesley Elementary',
  'Addison Trail High School',
  'Indian Trail Junior High',
  'Other',
];

const GRADE_OPTIONS = [
  'Pre-K / Kindergarten',
  'Grades 1-2',
  'Grades 3-5',
  'Grades 6-8',
  'Multiple / Varies',
];

const TRIED_OPTIONS = [
  'Yes, multiple times',
  'Yes, once or twice',
  'No, but I plan to',
  "No, I wasn't sure how",
  "I wasn't at the January session",
];

const HUB_LOGIN_OPTIONS = [
  "Yes, I've completed some courses",
  "Yes, I've logged in and looked around",
  "I logged in once but haven't gone back",
  "No, I haven't logged in yet",
  "I'm not sure what the Learning Hub is",
];

const HUB_HELP_OPTIONS = [
  'Dedicated time during work hours',
  'A walkthrough of how to use it',
  'Knowing which courses to start with',
  'Reminders or accountability check-ins',
  "I'm already using it regularly",
];

const GAME_OPTIONS = [
  { id: 'knockout', label: 'Question Knockout (partner question practice)', icon: '🎯' },
  { id: 'tellorask', label: 'Tell or Ask? (spotting disguised commands)', icon: '⚡' },
  { id: 'levelup', label: 'Feedback Level Up (rating feedback quality)', icon: '📈' },
  { id: 'madlibs', label: 'Feedback Madlibs (silly + serious formula practice)', icon: '😂' },
  { id: 'makeover', label: 'Feedback Makeover (rewriting bad feedback)', icon: '🔧' },
  { id: 'all', label: 'They were all equally helpful', icon: '✨' },
];

interface FormData {
  name: string;
  school: string;
  gradeLevels: string[];
  confidenceAsking: string;
  confidenceFeedback: string;
  triedAsking: string;
  triedFeedback: string;
  hubLogin: string;
  hubHelp: string[];
  hubHelpOther: string;
  bestGame: string;
  commitment: string;
  openFeedback: string;
}

interface FormErrors {
  [key: string]: string;
}

// Section Label Component
function SectionLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div
      className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {children}
    </div>
  );
}

// Scale Input Component (1-5)
function ScaleInput({
  value,
  onChange,
  color,
  error,
}: {
  value: string;
  onChange: (val: string) => void;
  color: string;
  error?: string;
}) {
  const labels = [
    'Not confident',
    'Slightly',
    'Somewhat',
    'Confident',
    'Very confident',
  ];

  return (
    <div>
      <div className="flex gap-2 justify-between">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num.toString())}
            className="flex-1 min-h-[56px] rounded-lg font-semibold transition-all duration-150 border-2 flex flex-col items-center justify-center gap-1"
            style={{
              backgroundColor: value === num.toString() ? color : 'transparent',
              borderColor: value === num.toString() ? color : 'rgba(255,255,255,0.2)',
              color: value === num.toString() ? '#ffffff' : '#8899aa',
            }}
          >
            <span className="text-lg">{num}</span>
            <span className="text-[10px] leading-tight hidden sm:block">{labels[num - 1]}</span>
          </button>
        ))}
      </div>
      {/* Mobile labels */}
      <div className="flex justify-between mt-2 sm:hidden">
        <span className="text-xs text-slate-500">Not confident</span>
        <span className="text-xs text-slate-500">Very confident</span>
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}

// Radio Group Component
function RadioGroup({
  options,
  value,
  onChange,
  error,
}: {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) {
  return (
    <div>
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className="w-full p-4 rounded-lg text-left transition-all duration-150 border flex items-center gap-3"
            style={{
              backgroundColor: value === option ? 'rgba(255,123,71,0.15)' : 'rgba(255,255,255,0.03)',
              borderColor: value === option ? '#FF7B47' : 'rgba(255,255,255,0.1)',
            }}
          >
            <div
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
              style={{
                borderColor: value === option ? '#FF7B47' : 'rgba(255,255,255,0.3)',
              }}
            >
              {value === option && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF7B47]" />
              )}
            </div>
            <span className="text-white text-sm">{option}</span>
          </button>
        ))}
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}

// Checkbox Group Component
function CheckboxGroup({
  options,
  values,
  onChange,
  error,
}: {
  options: string[];
  values: string[];
  onChange: (vals: string[]) => void;
  error?: string;
}) {
  const toggle = (option: string) => {
    if (values.includes(option)) {
      onChange(values.filter((v) => v !== option));
    } else {
      onChange([...values, option]);
    }
  };

  return (
    <div>
      <div className="space-y-2">
        {options.map((option) => {
          const isChecked = values.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className="w-full p-4 rounded-lg text-left transition-all duration-150 border flex items-center gap-3"
              style={{
                backgroundColor: isChecked ? 'rgba(39,174,96,0.15)' : 'rgba(255,255,255,0.03)',
                borderColor: isChecked ? '#27AE60' : 'rgba(255,255,255,0.1)',
              }}
            >
              <div
                className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0"
                style={{
                  borderColor: isChecked ? '#27AE60' : 'rgba(255,255,255,0.3)',
                  backgroundColor: isChecked ? '#27AE60' : 'transparent',
                }}
              >
                {isChecked && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <span className="text-white text-sm">{option}</span>
            </button>
          );
        })}
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}

// Game Radio Group Component
function GameRadioGroup({
  options,
  value,
  onChange,
  error,
}: {
  options: { id: string; label: string; icon: string }[];
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) {
  return (
    <div>
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className="w-full p-4 rounded-lg text-left transition-all duration-150 border flex items-center gap-3"
            style={{
              backgroundColor: value === option.id ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
              borderColor: value === option.id ? '#7C3AED' : 'rgba(255,255,255,0.1)',
            }}
          >
            <span className="text-2xl">{option.icon}</span>
            <span className="text-white text-sm flex-1">{option.label}</span>
            <div
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
              style={{
                borderColor: value === option.id ? '#7C3AED' : 'rgba(255,255,255,0.3)',
              }}
            >
              {value === option.id && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
              )}
            </div>
          </button>
        ))}
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}

// Success Screen Component
function SuccessScreen({ commitment }: { commitment: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="text-center max-w-md animate-fade-in">
        {/* Checkmark */}
        <div className="mb-6 animate-bounce-once">
          <div className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle size={56} className="text-green-400" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-4">THANK YOU!</h1>

        <p className="text-slate-300 mb-8">
          Your responses help us make Late Start Days and future sessions better for YOU.
        </p>

        {/* Commitment echo */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <p className="text-sm uppercase tracking-wider text-orange-400/70 mb-2">
            Remember your commitment:
          </p>
          <p className="text-xl text-white italic">"{commitment}"</p>
        </div>

        <p className="text-2xl font-bold text-white mb-8">YOUR MOVES MATTER.</p>

        {/* Practice link */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-2">Keep practicing anytime:</p>
          <a
            href="/paragametools"
            className="text-orange-400 hover:text-orange-300 font-medium"
          >
            teachersdeserveit.com/paragametools
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-once {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-bounce-once {
          animation: bounce-once 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

// Main Survey Page
export default function ASD4SurveyPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    school: '',
    gradeLevels: [],
    confidenceAsking: '',
    confidenceFeedback: '',
    triedAsking: '',
    triedFeedback: '',
    hubLogin: '',
    hubHelp: [],
    hubHelpOther: '',
    bestGame: '',
    commitment: '',
    openFeedback: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  // Persist form data to sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('asd4-survey-draft');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  useEffect(() => {
    if (!isSubmitted) {
      sessionStorage.setItem('asd4-survey-draft', JSON.stringify(formData));
    }
  }, [formData, isSubmitted]);

  // Track "Other" checkbox state
  useEffect(() => {
    setShowOtherInput(formData.hubHelp.includes('Other'));
  }, [formData.hubHelp]);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Please enter your name';
    if (!formData.school) newErrors.school = 'Please select your school';
    if (formData.gradeLevels.length === 0) newErrors.gradeLevels = 'Please select at least one grade level';
    if (!formData.confidenceAsking) newErrors.confidenceAsking = 'Please rate your confidence';
    if (!formData.confidenceFeedback) newErrors.confidenceFeedback = 'Please rate your confidence';
    if (!formData.triedAsking) newErrors.triedAsking = 'Please select an option';
    if (!formData.triedFeedback) newErrors.triedFeedback = 'Please select an option';
    if (!formData.hubLogin) newErrors.hubLogin = 'Please select an option';
    if (!formData.bestGame) newErrors.bestGame = 'Please select a game';
    if (!formData.commitment.trim()) {
      newErrors.commitment = "This one matters most — what will you try this week?";
    }

    setErrors(newErrors);

    // Scroll to first error
    if (Object.keys(newErrors).length > 0) {
      const firstErrorKey = Object.keys(newErrors)[0];
      const element = document.getElementById(`field-${firstErrorKey}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/asd4-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      sessionStorage.removeItem('asd4-survey-draft');
      setIsSubmitted(true);
    } catch (error) {
      console.error('Submit error:', error);
      alert('There was an error submitting your response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return <SuccessScreen commitment={formData.commitment} />;
  }

  return (
    <div className="min-h-screen px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8 max-w-xl mx-auto">
        <p
          className="text-xs uppercase tracking-widest mb-2"
          style={{ color: 'rgba(255, 123, 71, 0.5)' }}
        >
          The Moves That Matter
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">SESSION SURVEY</h1>
        <p className="text-slate-400 text-sm mb-2">
          Addison School District 4 | February 13, 2025
        </p>
        <p className="text-slate-500 text-sm italic">
          12 questions · 5 minutes · Your answers shape what comes next.
        </p>
      </div>

      {/* Form Container */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="max-w-[640px] mx-auto rounded-2xl p-6 md:p-8"
        style={{
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* SECTION 1: About You */}
        <section className="mb-10">
          <SectionLabel color="#8899aa">About You</SectionLabel>

          {/* Q1: Name */}
          <div className="mb-6" id="field-name">
            <label className="block text-white font-medium mb-2">
              1. First and Last Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Your name"
              className="w-full p-4 rounded-lg bg-white/5 border text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-400"
              style={{ borderColor: errors.name ? '#ef4444' : 'rgba(255,255,255,0.1)' }}
            />
            {errors.name && <p className="text-red-400 text-sm mt-2">{errors.name}</p>}
          </div>

          {/* Q2: School */}
          <div className="mb-6" id="field-school">
            <label className="block text-white font-medium mb-2">
              2. Which school do you work at? <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.school}
              onChange={(e) => updateField('school', e.target.value)}
              className="w-full p-4 rounded-lg bg-white/5 border text-white focus:outline-none focus:border-orange-400 appearance-none cursor-pointer"
              style={{
                borderColor: errors.school ? '#ef4444' : 'rgba(255,255,255,0.1)',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%238899aa' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
              }}
            >
              <option value="" className="bg-slate-800">Select your school</option>
              {SCHOOLS.map((school) => (
                <option key={school} value={school} className="bg-slate-800">
                  {school}
                </option>
              ))}
            </select>
            {errors.school && <p className="text-red-400 text-sm mt-2">{errors.school}</p>}
          </div>

          {/* Q3: Grade Levels */}
          <div id="field-gradeLevels">
            <label className="block text-white font-medium mb-2">
              3. What grade level(s) do you primarily support? <span className="text-red-400">*</span>
            </label>
            <CheckboxGroup
              options={GRADE_OPTIONS}
              values={formData.gradeLevels}
              onChange={(vals) => updateField('gradeLevels', vals)}
              error={errors.gradeLevels}
            />
          </div>
        </section>

        {/* SECTION 2: Your Confidence */}
        <section className="mb-10">
          <SectionLabel color="#FF7B47">Your Confidence</SectionLabel>

          {/* Q4: Confidence - Questions */}
          <div className="mb-6" id="field-confidenceAsking">
            <label className="block text-white font-medium mb-2">
              4. How confident do you feel using QUESTIONS instead of TELLING when a student is stuck? <span className="text-red-400">*</span>
            </label>
            <p className="text-sm text-slate-400 italic mb-3 pl-3 border-l-2 border-slate-600">
              Example: Instead of saying "The answer is 5," asking "What have you tried so far?"
            </p>
            <ScaleInput
              value={formData.confidenceAsking}
              onChange={(val) => updateField('confidenceAsking', val)}
              color="#FF7B47"
              error={errors.confidenceAsking}
            />
          </div>

          {/* Q5: Confidence - Feedback */}
          <div className="mb-6" id="field-confidenceFeedback">
            <label className="block text-white font-medium mb-2">
              5. How confident do you feel giving SPECIFIC feedback using Notice + Name + Next Step? <span className="text-red-400">*</span>
            </label>
            <p className="text-sm text-slate-400 italic mb-3 pl-3 border-l-2 border-slate-600">
              Example: "I see you started each sentence with a capital letter (Notice). That's correct capitalization (Name). Now check your proper nouns (Next Step)."
            </p>
            <ScaleInput
              value={formData.confidenceFeedback}
              onChange={(val) => updateField('confidenceFeedback', val)}
              color="#27AE60"
              error={errors.confidenceFeedback}
            />
          </div>

          {/* Q6: Tried Questions */}
          <div className="mb-6" id="field-triedAsking">
            <label className="block text-white font-medium mb-3">
              6. Since the January session, have you tried using questions instead of giving answers with a student? <span className="text-red-400">*</span>
            </label>
            <RadioGroup
              options={TRIED_OPTIONS}
              value={formData.triedAsking}
              onChange={(val) => updateField('triedAsking', val)}
              error={errors.triedAsking}
            />
          </div>

          {/* Q7: Tried Feedback */}
          <div id="field-triedFeedback">
            <label className="block text-white font-medium mb-3">
              7. Since the January session, have you tried giving feedback using the Notice/Name/Next Step formula? <span className="text-red-400">*</span>
            </label>
            <RadioGroup
              options={TRIED_OPTIONS}
              value={formData.triedFeedback}
              onChange={(val) => updateField('triedFeedback', val)}
              error={errors.triedFeedback}
            />
          </div>
        </section>

        {/* SECTION 3: Learning Hub */}
        <section className="mb-10">
          <SectionLabel color="#27AE60">Learning Hub</SectionLabel>

          {/* Q8: Hub Login */}
          <div className="mb-6" id="field-hubLogin">
            <label className="block text-white font-medium mb-3">
              8. Have you logged into the TDI Learning Hub? <span className="text-red-400">*</span>
            </label>
            <RadioGroup
              options={HUB_LOGIN_OPTIONS}
              value={formData.hubLogin}
              onChange={(val) => updateField('hubLogin', val)}
              error={errors.hubLogin}
            />
          </div>

          {/* Q9: Hub Help */}
          <div id="field-hubHelp">
            <label className="block text-white font-medium mb-3">
              9. What would help you use the Learning Hub more?
            </label>
            <CheckboxGroup
              options={[...HUB_HELP_OPTIONS, 'Other']}
              values={formData.hubHelp}
              onChange={(vals) => updateField('hubHelp', vals)}
            />
            {showOtherInput && (
              <input
                type="text"
                value={formData.hubHelpOther}
                onChange={(e) => updateField('hubHelpOther', e.target.value)}
                placeholder="Please specify..."
                className="w-full mt-3 p-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-green-400"
              />
            )}
          </div>
        </section>

        {/* SECTION 4: Today's Session */}
        <section className="mb-10">
          <SectionLabel color="#7C3AED">Today's Session</SectionLabel>

          {/* Q10: Best Game */}
          <div className="mb-6" id="field-bestGame">
            <label className="block text-white font-medium mb-3">
              10. Which game was MOST helpful for your learning today? <span className="text-red-400">*</span>
            </label>
            <GameRadioGroup
              options={GAME_OPTIONS}
              value={formData.bestGame}
              onChange={(val) => updateField('bestGame', val)}
              error={errors.bestGame}
            />
          </div>

          {/* Q11: Commitment */}
          <div className="mb-6" id="field-commitment">
            <label className="block text-white font-medium mb-3">
              11. What is ONE thing you will try with a student this week? <span className="text-red-400">*</span>
            </label>
            <div
              className="rounded-lg overflow-hidden"
              style={{ borderLeft: '4px solid #FF7B47' }}
            >
              <input
                type="text"
                value={formData.commitment}
                onChange={(e) => updateField('commitment', e.target.value)}
                placeholder="This week I will try _____ when a student _____"
                className="w-full p-4 bg-white/5 border-y border-r text-white placeholder:text-slate-500 focus:outline-none text-lg"
                style={{
                  borderColor: errors.commitment ? '#ef4444' : 'rgba(255,255,255,0.1)',
                }}
              />
            </div>
            {errors.commitment && <p className="text-red-400 text-sm mt-2">{errors.commitment}</p>}
          </div>

          {/* Q12: Open Feedback */}
          <div id="field-openFeedback">
            <label className="block text-white font-medium mb-3">
              12. Any feedback for us? What would make the next session even better?
            </label>
            <textarea
              value={formData.openFeedback}
              onChange={(e) => updateField('openFeedback', e.target.value)}
              placeholder="Optional — but we'd love to hear from you"
              rows={4}
              className="w-full p-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 resize-none"
            />
          </div>
        </section>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full min-h-[56px] text-lg font-bold rounded-xl transition-all duration-150 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: '#FF7B47',
            color: '#ffffff',
          }}
        >
          {isSubmitting ? 'SUBMITTING...' : 'SUBMIT MY RESPONSES'}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center mt-8 text-xs text-slate-600">
        Teachers Deserve It | Addison School District 4
      </p>
    </div>
  );
}
