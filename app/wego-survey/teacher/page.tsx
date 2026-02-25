'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';

// Type definitions
interface EmojiOption {
  value: number;
  emoji: string;
  label: string;
}

interface BaseQuestion {
  id: string;
  question: string;
  subtitle?: string;
  required: boolean;
}

interface NameQuestion extends BaseQuestion {
  type: 'name';
}

interface TextQuestion extends BaseQuestion {
  type: 'text';
  placeholder?: string;
}

interface EmojiScaleQuestion extends BaseQuestion {
  type: 'emoji-scale';
  options: EmojiOption[];
}

interface SingleSelectQuestion extends BaseQuestion {
  type: 'single-select';
  options: string[];
}

interface MultiSelectQuestion extends BaseQuestion {
  type: 'multi-select';
  options: string[];
}

interface MultiSelectLimitQuestion extends BaseQuestion {
  type: 'multi-select-limit';
  options: string[];
  limit: number;
}

interface TextareaQuestion extends BaseQuestion {
  type: 'textarea';
  placeholder?: string;
}

type Question = NameQuestion | TextQuestion | EmojiScaleQuestion | SingleSelectQuestion | MultiSelectQuestion | MultiSelectLimitQuestion | TextareaQuestion;

// Question definitions
const QUESTIONS: Question[] = [
  {
    id: 'name',
    type: 'name',
    question: "Before we begin — what's your name?",
    subtitle: 'First and last name',
    required: true,
  },
  {
    id: 'pa_names',
    type: 'text',
    question: 'Which PA(s) do you work with?',
    subtitle: "Last name is fine — helps us match feedback to the right support",
    placeholder: 'e.g. Castellanos, Treu',
    required: true,
  },
  {
    id: 'partnership_quality',
    type: 'emoji-scale',
    question: 'How would you rate your overall partnership with your PA(s)?',
    options: [
      { value: 1, emoji: '😟', label: 'Struggling' },
      { value: 2, emoji: '😐', label: 'Developing' },
      { value: 3, emoji: '🙂', label: 'Good' },
      { value: 4, emoji: '😊', label: 'Strong' },
      { value: 5, emoji: '🤩', label: 'Excellent' },
    ],
    required: true,
  },
  {
    id: 'pa_strengths',
    type: 'multi-select',
    question: 'What does your PA do well?',
    subtitle: "Select all that apply — we'll celebrate these!",
    options: [
      'Builds great relationships with students',
      'Takes initiative without being asked',
      'Follows through on directions',
      'Manages small groups effectively',
      'Keeps students on task',
      'Communicates well with me',
      'Adapts to changes quickly',
      'Shows professionalism',
      'Supports students with specific needs',
      'Is reliable and consistent',
    ],
    required: true,
  },
  {
    id: 'pa_growth',
    type: 'multi-select-limit',
    question: 'Where would you love to see your PA grow?',
    subtitle: 'Select up to 3 — this helps us target support',
    limit: 3,
    options: [
      'Taking more initiative',
      'Asking questions vs. giving answers',
      'Managing behavior independently',
      'Understanding lesson flow',
      'Anticipating student needs',
      'Professional communication',
      'Staying engaged during instruction',
      'Working with specific student populations',
      'Time management',
      'Following classroom routines',
    ],
    required: true,
  },
  {
    id: 'communication',
    type: 'emoji-scale',
    question: 'How well do you and your PA communicate?',
    options: [
      { value: 1, emoji: '🔇', label: 'Rarely' },
      { value: 2, emoji: '😕', label: 'Could improve' },
      { value: 3, emoji: '🤷', label: 'Okay' },
      { value: 4, emoji: '💬', label: 'Well' },
      { value: 5, emoji: '🤝', label: 'Seamlessly' },
    ],
    required: true,
  },
  {
    id: 'planning_time',
    type: 'single-select',
    question: 'Do you and your PA have dedicated time to plan or debrief?',
    options: [
      'Yes, regularly',
      'Sometimes',
      'Rarely',
      'Never — I wish we did',
      "It's not needed",
    ],
    required: true,
  },
  {
    id: 'challenges',
    type: 'multi-select',
    question: "What's your biggest challenge working with a PA?",
    subtitle: 'Select all that apply',
    options: [
      'No time to plan together',
      'Unclear role boundaries',
      'Different approaches to behavior',
      'PA needs more training',
      "I don't know how to delegate effectively",
      'Personality/communication differences',
      'PA is shared with other classrooms',
      'Schedule changes disrupt our rhythm',
    ],
    required: true,
  },
  {
    id: 'dream_support',
    type: 'multi-select-limit',
    question: 'In a perfect world, what would your PA help with most?',
    subtitle: 'Select your top 3',
    limit: 3,
    options: [
      'Leading small groups independently',
      'Pulling students for targeted practice',
      'Behavior support & de-escalation',
      'Tracking student data/progress',
      'Running classroom routines',
      'Supporting EL students',
      'Supporting students with IEPs',
      'Prep & materials management',
    ],
    required: true,
  },
  {
    id: 'hub_awareness',
    type: 'single-select',
    question: 'Did you know your PA has access to professional development through the TDI Learning Hub?',
    options: [
      "Yes, and I've seen them use it",
      "Yes, but I haven't noticed a change",
      'I had no idea!',
      "I'd love to learn more",
    ],
    required: true,
  },
  {
    id: 'teacher_pd',
    type: 'emoji-scale',
    question: 'Would YOU find value in resources about working effectively with a PA?',
    options: [
      { value: 1, emoji: '🙅', label: 'No thanks' },
      { value: 2, emoji: '🤷', label: 'Maybe' },
      { value: 3, emoji: '👍', label: 'Sure' },
      { value: 4, emoji: '🙋', label: 'Yes please!' },
      { value: 5, emoji: '🎉', label: 'Absolutely!' },
    ],
    required: true,
  },
  {
    id: 'comments',
    type: 'textarea',
    question: "Anything else you'd like us to know?",
    subtitle: 'Your feedback shapes how we support your classroom',
    placeholder: 'Type here... (optional)',
    required: false,
  },
];

interface FormData {
  first_name: string;
  last_name: string;
  pa_names: string;
  [key: string]: string | number | string[] | null;
}

export default function WegoTeacherSurvey() {
  const [currentStep, setCurrentStep] = useState(-1); // -1 is landing page
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    pa_names: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Load saved progress
  useEffect(() => {
    const saved = sessionStorage.getItem('wego-teacher-survey-draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.formData || { first_name: '', last_name: '', pa_names: '' });
        if (parsed.currentStep !== undefined && parsed.currentStep >= 0) {
          setCurrentStep(parsed.currentStep);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Save progress
  useEffect(() => {
    if (!isSubmitted && currentStep >= 0) {
      sessionStorage.setItem('wego-teacher-survey-draft', JSON.stringify({ formData, currentStep }));
    }
  }, [formData, currentStep, isSubmitted]);

  const totalQuestions = QUESTIONS.length;
  const progress = currentStep >= 0 ? ((currentStep + 1) / totalQuestions) * 100 : 0;

  const currentQuestion = currentStep >= 0 ? QUESTIONS[currentStep] : null;

  const canProceed = () => {
    if (!currentQuestion) return true;
    if (!currentQuestion.required) return true;

    const value = formData[currentQuestion.id];

    if (currentQuestion.type === 'name') {
      return formData.first_name?.trim() && formData.last_name?.trim();
    }

    if (currentQuestion.type === 'text') {
      return typeof value === 'string' && value.trim().length > 0;
    }

    if (currentQuestion.type === 'multi-select' || currentQuestion.type === 'multi-select-limit') {
      return Array.isArray(value) && value.length > 0;
    }

    return value !== undefined && value !== null && value !== '';
  };

  const handleNext = () => {
    if (!canProceed()) return;

    setIsTransitioning(true);
    setTimeout(() => {
      if (currentStep < totalQuestions - 1) {
        setCurrentStep(currentStep + 1);
      }
      setIsTransitioning(false);
    }, 150);
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      } else if (currentStep === 0) {
        setCurrentStep(-1);
      }
      setIsTransitioning(false);
    }, 150);
  };

  const handleStart = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(0);
      setIsTransitioning(false);
    }, 150);
  };

  const handleSelectOption = (questionId: string, value: string | number, isMulti: boolean = false, limit?: number) => {
    if (isMulti) {
      const current = (formData[questionId] as string[]) || [];
      if (current.includes(value as string)) {
        setFormData({ ...formData, [questionId]: current.filter(v => v !== value) });
      } else {
        if (limit && current.length >= limit) {
          // Remove first item and add new one
          setFormData({ ...formData, [questionId]: [...current.slice(1), value as string] });
        } else {
          setFormData({ ...formData, [questionId]: [...current, value as string] });
        }
      }
    } else {
      setFormData({ ...formData, [questionId]: value });
      // Auto-advance after 300ms for single selections
      setTimeout(() => {
        if (currentStep < totalQuestions - 1) {
          handleNext();
        }
      }, 300);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/wego-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          survey_type: 'teacher',
          first_name: formData.first_name,
          last_name: formData.last_name,
          pa_names: formData.pa_names,
          responses: {
            partnership_quality: formData.partnership_quality,
            pa_strengths: formData.pa_strengths,
            pa_growth: formData.pa_growth,
            communication: formData.communication,
            planning_time: formData.planning_time,
            challenges: formData.challenges,
            dream_support: formData.dream_support,
            hub_awareness: formData.hub_awareness,
            teacher_pd: formData.teacher_pd,
            comments: formData.comments || null,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit survey');
      }

      sessionStorage.removeItem('wego-teacher-survey-draft');
      setIsSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Thank you screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf9f7] to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-fade-in">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#1e2749] mb-4">Thank You!</h1>
          <p className="text-gray-600 mb-6">
            Your feedback helps us better support the partnership between teachers and paraprofessionals.
          </p>
          <div className="bg-[#38618C]/10 rounded-xl p-4 border border-[#38618C]/30">
            <p className="text-[#1e2749] font-medium">We appreciate your insights.</p>
            <p className="text-sm text-gray-600 mt-1">The TDI team will use this to improve resources for your classroom.</p>
          </div>
        </div>
      </div>
    );
  }

  // Landing page
  if (currentStep === -1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf9f7] to-white flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className={`text-center max-w-md transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            {/* Logo */}
            <div className="mb-6">
              <Image
                src="/images/TDI-logo-navy.png"
                alt="Teachers Deserve It"
                width={180}
                height={60}
                className="mx-auto"
              />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-[#1e2749] mb-2">
              WEGO Teacher Check-In
            </h1>
            <p className="text-gray-600 mb-6">
              Help us understand how we can better support your classroom partnership
            </p>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#38618C]/10 flex items-center justify-center">
                  <span className="text-sm">⏱️</span>
                </div>
                <span className="text-gray-700">~2 minutes to complete</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#38618C]/10 flex items-center justify-center">
                  <span className="text-sm">🔒</span>
                </div>
                <span className="text-gray-700">Your responses are confidential</span>
              </div>
            </div>

            <div className="bg-[#1e2749]/5 rounded-xl p-4 mb-8 text-sm text-gray-600">
              <strong className="text-[#1e2749]">Confidentiality Notice:</strong> Your responses are shared only with the Teachers Deserve It team to help improve support. They will not be shared with PAs or administration.
            </div>

            <button
              onClick={handleStart}
              className="w-full bg-[#38618C] hover:bg-[#2d4e70] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Survey
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Question screens
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf9f7] to-white flex flex-col">
      {/* Progress bar */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-gray-100 z-10">
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-[#38618C] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-gray-600 hover:text-[#1e2749] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          <span className="text-sm text-gray-500">
            {currentStep + 1} of {totalQuestions}
          </span>
        </div>
      </div>

      {/* Question content */}
      <div className="flex-1 flex flex-col px-4 py-6">
        <div className={`flex-1 max-w-lg mx-auto w-full transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {currentQuestion && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#1e2749] mb-2">
                {currentQuestion.question}
              </h2>
              {currentQuestion.subtitle && (
                <p className="text-gray-500 mb-6">{currentQuestion.subtitle}</p>
              )}

              {/* Name input */}
              {currentQuestion.type === 'name' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="First name"
                    value={formData.first_name || ''}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#38618C] focus:ring-2 focus:ring-[#38618C]/20 outline-none text-lg"
                    autoFocus
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={formData.last_name || ''}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#38618C] focus:ring-2 focus:ring-[#38618C]/20 outline-none text-lg"
                  />
                </div>
              )}

              {/* Text input */}
              {currentQuestion.type === 'text' && (
                <input
                  type="text"
                  placeholder={currentQuestion.placeholder || ''}
                  value={(formData[currentQuestion.id] as string) || ''}
                  onChange={(e) => setFormData({ ...formData, [currentQuestion.id]: e.target.value })}
                  className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#38618C] focus:ring-2 focus:ring-[#38618C]/20 outline-none text-lg"
                  autoFocus
                />
              )}

              {/* Emoji scale */}
              {currentQuestion.type === 'emoji-scale' && (
                <div className="grid grid-cols-5 gap-2">
                  {(currentQuestion as EmojiScaleQuestion).options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSelectOption(currentQuestion.id, opt.value)}
                      className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 ${
                        formData[currentQuestion.id] === opt.value
                          ? 'border-[#38618C] bg-[#38618C]/10 scale-105'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <span className="text-2xl md:text-3xl mb-1">{opt.emoji}</span>
                      <span className="text-xs text-gray-600 text-center leading-tight">{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Single select */}
              {currentQuestion.type === 'single-select' && (
                <div className="space-y-2">
                  {(currentQuestion as SingleSelectQuestion).options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleSelectOption(currentQuestion.id, opt)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        formData[currentQuestion.id] === opt
                          ? 'border-[#38618C] bg-[#38618C]/10'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <span className="text-[#1e2749]">{opt}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Multi-select */}
              {(currentQuestion.type === 'multi-select' || currentQuestion.type === 'multi-select-limit') && (
                <div className="space-y-2">
                  {currentQuestion.type === 'multi-select-limit' && (
                    <p className="text-sm text-[#38618C] mb-3">
                      Selected: {((formData[currentQuestion.id] as string[]) || []).length}/{(currentQuestion as MultiSelectLimitQuestion).limit}
                    </p>
                  )}
                  {(currentQuestion as MultiSelectQuestion | MultiSelectLimitQuestion).options.map((opt) => {
                    const isSelected = ((formData[currentQuestion.id] as string[]) || []).includes(opt);
                    return (
                      <button
                        key={opt}
                        onClick={() => handleSelectOption(
                          currentQuestion.id,
                          opt,
                          true,
                          currentQuestion.type === 'multi-select-limit' ? (currentQuestion as MultiSelectLimitQuestion).limit : undefined
                        )}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3 ${
                          isSelected
                            ? 'border-[#38618C] bg-[#38618C]/10'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'border-[#38618C] bg-[#38618C]' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-[#1e2749]">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Textarea */}
              {currentQuestion.type === 'textarea' && (
                <textarea
                  placeholder={currentQuestion.placeholder || 'Type here...'}
                  value={(formData[currentQuestion.id] as string) || ''}
                  onChange={(e) => setFormData({ ...formData, [currentQuestion.id]: e.target.value })}
                  rows={5}
                  className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#38618C] focus:ring-2 focus:ring-[#38618C]/20 outline-none text-lg resize-none"
                />
              )}
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="max-w-lg mx-auto w-full mt-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {currentStep === totalQuestions - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !canProceed()}
              className="w-full bg-[#38618C] hover:bg-[#2d4e70] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Survey'
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="w-full bg-[#38618C] hover:bg-[#2d4e70] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
