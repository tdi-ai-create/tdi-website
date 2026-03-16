'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { LanguageToggle } from '@/components/LanguageToggle';
import { paTranslations, Language } from '@/lib/wego-survey-translations';

// Type definitions
interface EmojiOption {
  value: number;
  emoji: string;
  labelKey: string;
}

interface BaseQuestion {
  id: string;
  questionKey: string;
  subtitleKey?: string;
  required: boolean;
}

interface NameQuestion extends BaseQuestion {
  type: 'name';
}

interface EmojiScaleQuestion extends BaseQuestion {
  type: 'emoji-scale';
  options: EmojiOption[];
}

interface StarRatingQuestion extends BaseQuestion {
  type: 'star-rating';
}

interface SingleSelectQuestion extends BaseQuestion {
  type: 'single-select';
  optionKeys: string[];
}

interface MultiSelectQuestion extends BaseQuestion {
  type: 'multi-select';
  optionKeys: string[];
}

interface MultiSelectLimitQuestion extends BaseQuestion {
  type: 'multi-select-limit';
  optionKeys: string[];
  limit: number;
}

interface TextareaQuestion extends BaseQuestion {
  type: 'textarea';
  placeholderKey?: string;
}

type Question = NameQuestion | EmojiScaleQuestion | StarRatingQuestion | SingleSelectQuestion | MultiSelectQuestion | MultiSelectLimitQuestion | TextareaQuestion;

// Question definitions with translation keys
const QUESTIONS: Question[] = [
  {
    id: 'name',
    type: 'name',
    questionKey: 'q0_question',
    subtitleKey: 'q0_subtitle',
    required: true,
  },
  {
    id: 'stress',
    type: 'emoji-scale',
    questionKey: 'q1_question',
    subtitleKey: 'q1_subtitle',
    options: [
      { value: 1, emoji: '😌', labelKey: 'q1_opt1' },
      { value: 2, emoji: '🙂', labelKey: 'q1_opt2' },
      { value: 3, emoji: '😐', labelKey: 'q1_opt3' },
      { value: 4, emoji: '😓', labelKey: 'q1_opt4' },
      { value: 5, emoji: '🥵', labelKey: 'q1_opt5' },
    ],
    required: true,
  },
  {
    id: 'stress_time',
    type: 'multi-select',
    questionKey: 'q2_question',
    subtitleKey: 'q2_subtitle',
    optionKeys: ['q2_opt1', 'q2_opt2', 'q2_opt3', 'q2_opt4', 'q2_opt5', 'q2_opt6'],
    required: true,
  },
  {
    id: 'challenges',
    type: 'multi-select-limit',
    questionKey: 'q3_question',
    subtitleKey: 'q3_subtitle',
    limit: 3,
    optionKeys: ['q3_opt1', 'q3_opt2', 'q3_opt3', 'q3_opt4', 'q3_opt5', 'q3_opt6', 'q3_opt7', 'q3_opt8', 'q3_opt9', 'q3_opt10'],
    required: true,
  },
  {
    id: 'supported',
    type: 'emoji-scale',
    questionKey: 'q4_question',
    subtitleKey: 'q4_subtitle',
    options: [
      { value: 1, emoji: '😔', labelKey: 'q4_opt1' },
      { value: 2, emoji: '😕', labelKey: 'q4_opt2' },
      { value: 3, emoji: '🤷', labelKey: 'q4_opt3' },
      { value: 4, emoji: '😊', labelKey: 'q4_opt4' },
      { value: 5, emoji: '🤗', labelKey: 'q4_opt5' },
    ],
    required: true,
  },
  {
    id: 'teacher_relationship',
    type: 'single-select',
    questionKey: 'q5_question',
    optionKeys: ['q5_opt1', 'q5_opt2', 'q5_opt3', 'q5_opt4', 'q5_opt5'],
    required: true,
  },
  {
    id: 'hub_value',
    type: 'star-rating',
    questionKey: 'q6_question',
    subtitleKey: 'q6_subtitle',
    required: true,
  },
  {
    id: 'pd_topics',
    type: 'multi-select',
    questionKey: 'q7_question',
    subtitleKey: 'q7_subtitle',
    optionKeys: ['q7_opt1', 'q7_opt2', 'q7_opt3', 'q7_opt4', 'q7_opt5', 'q7_opt6', 'q7_opt7', 'q7_opt8', 'q7_opt9', 'q7_opt10'],
    required: true,
  },
  {
    id: 'best_part',
    type: 'multi-select',
    questionKey: 'q8_question',
    subtitleKey: 'q8_subtitle',
    optionKeys: ['q8_opt1', 'q8_opt2', 'q8_opt3', 'q8_opt4', 'q8_opt5', 'q8_opt6', 'q8_opt7'],
    required: true,
  },
  {
    id: 'retention',
    type: 'emoji-scale',
    questionKey: 'q9_question',
    options: [
      { value: 1, emoji: '👋', labelKey: 'q9_opt1' },
      { value: 2, emoji: '🤔', labelKey: 'q9_opt2' },
      { value: 3, emoji: '😊', labelKey: 'q9_opt3' },
      { value: 4, emoji: '💪', labelKey: 'q9_opt4' },
      { value: 5, emoji: '❤️', labelKey: 'q9_opt5' },
    ],
    required: true,
  },
  {
    id: 'stay_factors',
    type: 'multi-select',
    questionKey: 'q10_question',
    subtitleKey: 'q10_subtitle',
    optionKeys: ['q10_opt1', 'q10_opt2', 'q10_opt3', 'q10_opt4', 'q10_opt5', 'q10_opt6', 'q10_opt7', 'q10_opt8'],
    required: true,
  },
  {
    id: 'comments',
    type: 'textarea',
    questionKey: 'q11_question',
    subtitleKey: 'q11_subtitle',
    placeholderKey: 'q11_placeholder',
    required: false,
  },
];

interface FormData {
  first_name: string;
  last_name: string;
  [key: string]: string | number | string[] | null;
}

export default function WegoPASurvey() {
  const [language, setLanguage] = useState<Language>('en');
  const [currentStep, setCurrentStep] = useState(-1); // -1 is landing page
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Translation helper
  const t = paTranslations[language];

  // Load saved progress
  useEffect(() => {
    const saved = sessionStorage.getItem('wego-pa-survey-draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.formData || { first_name: '', last_name: '' });
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
      sessionStorage.setItem('wego-pa-survey-draft', JSON.stringify({ formData, currentStep }));
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
          survey_type: 'pa',
          first_name: formData.first_name,
          last_name: formData.last_name,
          language: language,
          responses: {
            stress: formData.stress,
            stress_time: formData.stress_time,
            challenges: formData.challenges,
            supported: formData.supported,
            teacher_relationship: formData.teacher_relationship,
            hub_value: formData.hub_value,
            pd_topics: formData.pd_topics,
            best_part: formData.best_part,
            retention: formData.retention,
            stay_factors: formData.stay_factors,
            comments: formData.comments || null,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit survey');
      }

      sessionStorage.removeItem('wego-pa-survey-draft');
      setIsSubmitted(true);
    } catch (err) {
      setError(t.errorMessage);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Thank you screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf9f7] to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-fade-in relative">
          <div className="absolute top-0 right-0">
            <LanguageToggle language={language} onToggle={setLanguage} />
          </div>
          <div className="mb-6 pt-12">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#1e2749] mb-4">{t.thankYouTitle}</h1>
          <p className="text-gray-600 mb-6">
            {t.thankYouMessage}
          </p>
          <div className="bg-[#ffba06]/10 rounded-xl p-4 border border-[#ffba06]/30">
            <p className="text-[#1e2749] font-medium">{t.thankYouHighlight}</p>
            <p className="text-sm text-gray-600 mt-1">{t.thankYouDetail}</p>
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
            {/* Language Toggle */}
            <div className="flex justify-end mb-4">
              <LanguageToggle language={language} onToggle={setLanguage} />
            </div>

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
              {t.landingTitle}
            </h1>
            <p className="text-gray-600 mb-6">
              {t.landingSubtitle}
            </p>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#35A7FF]/10 flex items-center justify-center">
                  <span className="text-sm">⏱️</span>
                </div>
                <span className="text-gray-700">{t.timeBadge}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#35A7FF]/10 flex items-center justify-center">
                  <span className="text-sm">🔒</span>
                </div>
                <span className="text-gray-700">{t.lockBadge}</span>
              </div>
            </div>

            <div className="bg-[#1e2749]/5 rounded-xl p-4 mb-8 text-sm text-gray-600">
              <strong className="text-[#1e2749]">{language === 'en' ? 'Confidentiality Notice:' : 'Aviso de Confidencialidad:'}</strong> {t.confidentialityNotice}
            </div>

            <button
              onClick={handleStart}
              className="w-full bg-[#38618C] hover:bg-[#2d4e70] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {t.startButton}
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
            <span className="text-sm">{t.back}</span>
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {currentStep + 1} {t.questionOf} {totalQuestions}
            </span>
            <LanguageToggle language={language} onToggle={setLanguage} />
          </div>
        </div>
      </div>

      {/* Question content */}
      <div className="flex-1 flex flex-col px-4 py-6">
        <div className={`flex-1 max-w-lg mx-auto w-full transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {currentQuestion && (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-[#1e2749] mb-2">
                {t[currentQuestion.questionKey as keyof typeof t]}
              </h2>
              {currentQuestion.subtitleKey && (
                <p className="text-gray-500 mb-6">{t[currentQuestion.subtitleKey as keyof typeof t]}</p>
              )}

              {/* Name input */}
              {currentQuestion.type === 'name' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder={t.firstName}
                    value={formData.first_name || ''}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#38618C] focus:ring-2 focus:ring-[#38618C]/20 outline-none text-lg"
                    autoFocus
                  />
                  <input
                    type="text"
                    placeholder={t.lastName}
                    value={formData.last_name || ''}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#38618C] focus:ring-2 focus:ring-[#38618C]/20 outline-none text-lg"
                  />
                </div>
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
                      <span className="text-xs text-gray-600 text-center leading-tight">{t[opt.labelKey as keyof typeof t]}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Star rating */}
              {currentQuestion.type === 'star-rating' && (
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleSelectOption(currentQuestion.id, star)}
                      className={`text-4xl transition-all duration-200 ${
                        (formData[currentQuestion.id] as number) >= star
                          ? 'text-[#ffba06] scale-110'
                          : 'text-gray-300 hover:text-gray-400'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              )}

              {/* Single select */}
              {currentQuestion.type === 'single-select' && (
                <div className="space-y-2">
                  {(currentQuestion as SingleSelectQuestion).optionKeys.map((optKey) => {
                    const optText = t[optKey as keyof typeof t];
                    return (
                      <button
                        key={optKey}
                        onClick={() => handleSelectOption(currentQuestion.id, optKey)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                          formData[currentQuestion.id] === optKey
                            ? 'border-[#38618C] bg-[#38618C]/10'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <span className="text-[#1e2749]">{optText}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Multi-select */}
              {(currentQuestion.type === 'multi-select' || currentQuestion.type === 'multi-select-limit') && (
                <div className="space-y-2">
                  {currentQuestion.type === 'multi-select-limit' && (
                    <p className="text-sm text-[#38618C] mb-3">
                      {t.selected}: {((formData[currentQuestion.id] as string[]) || []).length}/{(currentQuestion as MultiSelectLimitQuestion).limit}
                    </p>
                  )}
                  {(currentQuestion as MultiSelectQuestion | MultiSelectLimitQuestion).optionKeys.map((optKey) => {
                    const optText = t[optKey as keyof typeof t];
                    const isSelected = ((formData[currentQuestion.id] as string[]) || []).includes(optKey);
                    return (
                      <button
                        key={optKey}
                        onClick={() => handleSelectOption(
                          currentQuestion.id,
                          optKey,
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
                        <span className="text-[#1e2749]">{optText}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Textarea */}
              {currentQuestion.type === 'textarea' && (
                <textarea
                  placeholder={currentQuestion.placeholderKey ? t[currentQuestion.placeholderKey as keyof typeof t] : ''}
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
                  {t.submitting}
                </>
              ) : (
                t.submit
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="w-full bg-[#38618C] hover:bg-[#2d4e70] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              {t.next}
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
