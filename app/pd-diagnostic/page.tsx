'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PDQuadrant from './components/PDQuadrant';

// GA4 event helper
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const sendGAEvent = (eventName: string, params: Record<string, string | number | boolean>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

const questions = [
  {
    id: 1,
    question: "When PD ends, where does instructional support live the following week?",
    options: [
      { value: "A", label: "Nowhere - teachers are on their own" },
      { value: "B", label: "In the momentum from the session" },
      { value: "C", label: "With instructional coaches (for some staff)" },
      { value: "D", label: "Built into ongoing coaching, PLCs, and role-specific support" }
    ]
  },
  {
    id: 2,
    question: "Is PD concentrated on specific days or distributed throughout the year?",
    options: [
      { value: "A", label: "Concentrated on designated PD days" },
      { value: "B", label: "Intensive whole-staff sessions with limited follow-up" },
      { value: "C", label: "Ongoing for core teams, limited for others" },
      { value: "D", label: "Ongoing and accessible for all staff year-round" }
    ]
  },
  {
    id: 3,
    question: "Which staff groups receive the most consistent PD support?",
    options: [
      { value: "A", label: "Core instructional staff only" },
      { value: "B", label: "Everyone receives the same content" },
      { value: "C", label: "Core staff get coaching; others get minimal support" },
      { value: "D", label: "All staff receive role-specific, aligned support" }
    ]
  },
  {
    id: 4,
    question: "Do specialists, paraprofessionals, and support staff receive role-specific learning?",
    options: [
      { value: "A", label: "Rarely or inconsistently" },
      { value: "B", label: "They attend the same sessions as teachers" },
      { value: "C", label: "Sometimes, but not systematically" },
      { value: "D", label: "Yes, with clear alignment to classroom expectations" }
    ]
  },
  {
    id: 5,
    question: "Can leadership see evidence of PD application in classrooms?",
    options: [
      { value: "A", label: "Limited or inconsistent evidence" },
      { value: "B", label: "Strong evidence immediately after PD, then fades" },
      { value: "C", label: "Clear evidence in coached classrooms only" },
      { value: "D", label: "Consistent evidence across most classrooms" }
    ]
  },
  {
    id: 6,
    question: "Is there a shared instructional and behavioral language across roles?",
    options: [
      { value: "A", label: "Varies significantly by role and classroom" },
      { value: "B", label: "Shared at a conceptual level, inconsistent in practice" },
      { value: "C", label: "Strong among core staff, weak elsewhere" },
      { value: "D", label: "Yes, used consistently building-wide" }
    ]
  },
  {
    id: 7,
    question: "What happens when implementation stalls?",
    options: [
      { value: "A", label: "Nothing systematic - it stays stalled" },
      { value: "B", label: "We schedule another PD session" },
      { value: "C", label: "Coaching helps some teachers, others struggle" },
      { value: "D", label: "Support systems are already in place to address it" }
    ]
  },
  {
    id: 8,
    question: "Would most staff describe PD as relevant to their daily work?",
    options: [
      { value: "A", label: "Not really - it feels like a requirement" },
      { value: "B", label: "Inspiring in the moment, hard to apply later" },
      { value: "C", label: "Core staff say yes, others say no" },
      { value: "D", label: "Yes, most staff find it directly applicable" }
    ]
  }
];

const resultData: Record<string, {
  name: string;
  tagline: string;
  description: string;
  predicts: string;
  implications: string[];
  anchorId: string;
}> = {
  A: {
    name: "Compliance-Focused PD",
    tagline: "Event-Based + Core-Focused",
    description: "PD days happen and boxes get checked, but Monday morning? Teachers are still on their own. Requirements are met, but classroom translation is limited.",
    predicts: "Strong compliance and documentation, but implementation varies widely. Specialists and support staff often operate with different expectations. Predicts slower progress in consistency, retention, and schoolwide culture.",
    implications: [
      "Teachers may feel unsupported after PD events",
      "Implementation of new strategies is inconsistent",
      "ROI on PD spending is difficult to demonstrate"
    ],
    anchorId: "compliance",
  },
  B: {
    name: "Inspiration-Driven PD",
    tagline: "Event-Based + Whole-Staff",
    description: "Everyone leaves PD days fired up and motivated. But by October? Most have returned to old habits. High energy, short-term lift.",
    predicts: "Temporary momentum followed by declining application as daily pressures return. Often leads to repeated cycles of retraining without sustained implementation.",
    implications: [
      "Initial enthusiasm fades without follow-up systems",
      "Teachers struggle to translate inspiration into daily practice",
      "Burnout risk remains high despite PD investment"
    ],
    anchorId: "inspiration",
  },
  C: {
    name: "Fragmented Growth",
    tagline: "System-Based + Core-Focused",
    description: "Some teams are thriving with strong support. Others are still waiting for help that never comes. Strong pockets, uneven experience.",
    predicts: "Strong growth in targeted areas alongside significant variation elsewhere. Creates islands of excellence but inconsistent student experience across classrooms.",
    implications: [
      "Inequity in support across different staff roles",
      "Specialists and paras often left behind",
      "Difficult to build consistent school-wide culture"
    ],
    anchorId: "fragmented",
  },
  D: {
    name: "Embedded Practice",
    tagline: "System-Based + Whole-Staff",
    description: "PD is not an event - it is how your school operates. Consistent support leads to sustained outcomes for everyone.",
    predicts: "Sustainable improvement, stronger culture, and progress without initiative overload. Consistent expectations across classrooms with clear evidence of implementation.",
    implications: [
      "You are doing many things right - TDI can help sustain and scale",
      "Focus on continuous improvement and measurement",
      "Opportunity to become a model for other schools"
    ],
    anchorId: "embedded",
  }
};

// localStorage keys
const STORAGE_KEY = 'tdi_diagnostic_user';
const DIAGNOSTIC_STATE_KEY = 'tdi_diagnostic_state';

export default function PDDiagnosticPage() {
  // Wizard state
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [resultType, setResultType] = useState<string | null>(null);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Email capture state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  // Keyboard navigation state
  const [focusedOption, setFocusedOption] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const allQuestionsAnswered = Object.keys(answers).length === 8;
  const progressPercent = Math.round(((Object.keys(answers).length) / 8) * 100);

  // Keyboard navigation for wizard
  useEffect(() => {
    if (allQuestionsAnswered || showResults) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const optionsCount = questions[currentQuestion - 1].options.length;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedOption((prev) => (prev + 1) % optionsCount);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedOption((prev) => (prev - 1 + optionsCount) % optionsCount);
          break;
        case 'Enter':
          e.preventDefault();
          const selectedValue = questions[currentQuestion - 1].options[focusedOption].value;
          handleAnswerSelect(currentQuestion, selectedValue);
          break;
        case 'Backspace':
          if (currentQuestion > 1) {
            e.preventDefault();
            goToPreviousQuestion();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allQuestionsAnswered, showResults, currentQuestion, focusedOption]);

  // Reset focused option when question changes
  useEffect(() => {
    setFocusedOption(0);
  }, [currentQuestion]);

  // Load saved state on mount
  useEffect(() => {
    try {
      // Load user data
      const storedUser = localStorage.getItem(STORAGE_KEY);
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.email) {
          setEmail(userData.email);
          setName(userData.name || '');
          setSchoolName(userData.schoolName || '');
          setIsReturningUser(true);
        }
      }

      // Load diagnostic state (answers, results)
      const storedState = localStorage.getItem(DIAGNOSTIC_STATE_KEY);
      if (storedState) {
        const state = JSON.parse(storedState);
        if (state.answers && Object.keys(state.answers).length > 0) {
          setAnswers(state.answers);
          setCurrentQuestion(Math.min(Object.keys(state.answers).length + 1, 8));
        }
        if (state.resultType) {
          setResultType(state.resultType);
        }
        if (state.showResults) {
          setShowResults(true);
          setEmailSubmitted(true);
          // Scroll to results on refresh (delay to override ScrollToTop)
          setTimeout(() => {
            const resultsSection = document.getElementById('results');
            if (resultsSection) {
              resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 500);
        }
      }
    } catch {
      // localStorage not available or invalid data
    }
    setIsHydrated(true);
  }, []);

  // Track page view
  useEffect(() => {
    sendGAEvent('diagnostic_page_view', {
      event_category: 'PD Diagnostic',
      event_label: 'Page Load',
    });
  }, []);

  // Track diagnostic completion
  useEffect(() => {
    if (allQuestionsAnswered && !showResults) {
      sendGAEvent('diagnostic_completed', {
        event_category: 'PD Diagnostic',
        event_label: 'All Questions Answered',
      });

      // Calculate result
      const result = calculateResult();
      setResultType(result);

      // For returning users, skip email gate
      if (isReturningUser) {
        sendGAEvent('diagnostic_returning_user', {
          event_category: 'PD Diagnostic',
          event_label: 'Skipped Email Gate',
        });
        submitDiagnosticResult(result);
        setEmailSubmitted(true);
        setShowResults(true);
        // Scroll to results
        setTimeout(() => {
          const resultsSection = document.getElementById('results');
          if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      }
    }
  }, [allQuestionsAnswered, showResults, isReturningUser]);

  // Save diagnostic state to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(DIAGNOSTIC_STATE_KEY, JSON.stringify({
        answers,
        resultType,
        showResults,
      }));
    } catch {
      // localStorage not available
    }
  }, [answers, resultType, showResults, isHydrated]);

  const handleAnswerSelect = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));

    sendGAEvent('diagnostic_question_answered', {
      event_category: 'PD Diagnostic',
      event_label: `Question ${questionId}`,
      value: questionId,
    });

    // Auto-advance to next question with fade animation
    if (questionId < 8) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestion(questionId + 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion - 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const calculateResult = () => {
    const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    Object.values(answers).forEach(answer => {
      counts[answer]++;
    });
    const maxCount = Math.max(...Object.values(counts));
    return Object.entries(counts).find(([, count]) => count === maxCount)?.[0] || 'A';
  };

  // Helper function to submit diagnostic results
  const submitDiagnosticResult = async (result: string) => {
    const pdTypeName = resultData[result].name;

    try {
      await fetch('/api/diagnostic-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || 'Not provided',
          schoolName: schoolName || 'Not provided',
          pdType: result,
          pdTypeName,
          answers,
          completedAt: new Date().toISOString(),
          isReturningUser,
        }),
      });
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultType) return;

    setIsSubmitting(true);

    const pdTypeName = resultData[resultType].name;

    sendGAEvent('diagnostic_email_submitted', {
      event_category: 'PD Diagnostic',
      event_label: pdTypeName,
    });

    // Store user data in localStorage for future visits
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        email,
        name,
        schoolName,
        submittedAt: new Date().toISOString(),
      }));
    } catch {
      // localStorage not available
    }

    await submitDiagnosticResult(resultType);

    setEmailSubmitted(true);
    setShowResults(true);
    setIsSubmitting(false);

    // Scroll to results after state updates
    setTimeout(() => {
      const resultsSection = document.getElementById('results');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  // Track results view
  useEffect(() => {
    if (showResults && resultType) {
      sendGAEvent('diagnostic_results_viewed', {
        event_category: 'PD Diagnostic',
        event_label: resultData[resultType].name,
      });
    }
  }, [showResults, resultType]);

  const handleFrameworkClick = () => {
    if (resultType) {
      sendGAEvent('diagnostic_cta_click', {
        event_category: 'PD Diagnostic',
        event_label: 'Explore Framework',
        pd_type: resultData[resultType].name,
      });
    }
  };

  const handleScheduleClick = () => {
    if (resultType) {
      sendGAEvent('diagnostic_cta_click', {
        event_category: 'PD Diagnostic',
        event_label: 'Schedule Call',
        pd_type: resultData[resultType].name,
      });
    }
  };

  const currentQ = questions[currentQuestion - 1];

  return (
    <main className="min-h-screen">
      {/* INTRO SECTION - Always shows */}
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center py-16">
            {/* Background Image */}
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: 'url(/images/hero-schools.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />

            {/* Gradient Overlay */}
            <div
              className="absolute inset-0 z-10"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 39, 73, 0.92) 0%, rgba(27, 73, 101, 0.88) 100%)',
              }}
            />

            {/* Content */}
            <div className="container mx-auto px-4 relative z-20">
              <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                  <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                    <span className="text-white/80 text-sm font-bold">Free Self-Assessment</span>
                  </div>

                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                    The 4 Types of PD
                  </h1>

                  <p className="text-xl text-white/80 mb-2">
                    Which one is your school running?
                  </p>

                  <p className="text-base text-white/60 max-w-2xl mx-auto">
                    Most leaders can identify their type <em>immediately</em>. This determines what you can expect for teacher retention, student outcomes, and school culture.
                  </p>
                </div>

                {/* Interactive Quadrant in white card */}
                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl">
                  <PDQuadrant
                    interactive={true}
                    onSelect={(id) => {
                      sendGAEvent('quadrant_selected', {
                        event_category: 'PD Diagnostic',
                        event_label: `Quadrant ${id}`,
                      });
                    }}
                  />
                </div>

                {/* Credibility Signals */}
                <div className="mt-10 text-center">
                  <p className="text-sm mb-4 text-white/80">
                    Developed by the Teachers Deserve It team - former teachers, content experts, and PD specialists
                  </p>
                  <div className="flex flex-wrap justify-center gap-6 text-sm text-white/60 mb-6">
                    <span>500+ schools assessed</span>
                    <span>Based on implementation research</span>
                  </div>

                  {/* Testimonial */}
                  <div className="max-w-2xl mx-auto p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                    <p className="text-sm italic mb-2 text-white/90">
                      &quot;This diagnostic helped us see exactly where our PD was falling short. Within 10 minutes,<br />we had a clear picture of what needed to change.&quot;
                    </p>
                    <p className="text-xs font-medium text-white/60">
                      - K-8 Principal, Illinois
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

      {/* WIZARD DIAGNOSTIC - One question at a time */}
      {!allQuestionsAnswered && !showResults && (
        <section className="py-16" style={{ backgroundColor: '#1e2749' }}>
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              {/* Section Header */}
              <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-2">
                Take the Diagnostic
              </h2>
              <p className="text-white/60 text-center mb-8">
                8 questions to discover your PD type
              </p>

              {/* Progress Indicator */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-white">
                    Question {currentQuestion} of 8
                  </span>
                  <span className="text-sm text-white/60">
                    {progressPercent}% complete
                  </span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      backgroundColor: '#ffba06',
                      width: `${progressPercent}%`,
                    }}
                  />
                </div>
              </div>

              {/* Question Dots Preview */}
              <div className="flex justify-center gap-2 mb-8">
                {questions.map((_, index) => {
                  const questionNum = index + 1;
                  const isAnswered = answers[questionNum] !== undefined;
                  const isCurrent = questionNum === currentQuestion;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (isAnswered || questionNum <= Object.keys(answers).length + 1) {
                          setCurrentQuestion(questionNum);
                        }
                      }}
                      disabled={!isAnswered && questionNum > Object.keys(answers).length + 1}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        isCurrent
                          ? 'w-6 bg-yellow-400'
                          : isAnswered
                          ? 'bg-yellow-400/60 hover:bg-yellow-400/80 cursor-pointer'
                          : 'bg-white/20'
                      } ${!isAnswered && questionNum > Object.keys(answers).length + 1 ? 'cursor-not-allowed' : ''}`}
                      title={isAnswered ? `Question ${questionNum} (answered)` : `Question ${questionNum}`}
                    />
                  );
                })}
              </div>

              {/* Single Question Display with Fade Animation */}
              <div
                className={`text-center transition-opacity duration-200 ${
                  isTransitioning ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <h2 className="text-xl md:text-2xl font-bold text-white mb-8">
                  {currentQ.question}
                </h2>

                <div className="space-y-3">
                  {currentQ.options.map((option, index) => {
                    const isSelected = answers[currentQuestion] === option.value;
                    const isFocused = focusedOption === index;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleAnswerSelect(currentQuestion, option.value)}
                        onMouseEnter={() => setFocusedOption(index)}
                        className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                          isSelected
                            ? 'border-yellow-400 bg-yellow-50'
                            : isFocused
                            ? 'border-yellow-400/70 bg-yellow-50/50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-yellow-400 hover:shadow-md'
                        }`}
                        style={{ color: '#1e2749' }}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                {/* Keyboard Hint */}
                <p className="mt-6 text-xs text-white/40 hidden md:block">
                  Use arrow keys to navigate, Enter to select
                </p>

                {/* Back Button */}
                {currentQuestion > 1 && (
                  <button
                    onClick={goToPreviousQuestion}
                    className="mt-4 text-sm font-medium hover:underline text-white/70 hover:text-white"
                  >
                    Back to previous question
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* EMAIL CAPTURE - Shows after all questions answered (for new users) */}
      {allQuestionsAnswered && !isReturningUser && (
        <section className="py-16" style={{ backgroundColor: '#1e2749' }}>
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto text-center">
              {!emailSubmitted ? (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Your results are ready!
                  </h2>
                  <p className="text-white/80 mb-8">
                    Enter your email to see which of the 4 PD types your school is running - and what it means for your teachers.
                  </p>

                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                      <input
                        type="email"
                        required
                        placeholder="you@yourschool.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        style={{ backgroundColor: '#ffffff' }}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Your name (optional)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        style={{ backgroundColor: '#ffffff' }}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="School name (optional)"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        style={{ backgroundColor: '#ffffff' }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-6 py-3 rounded-full font-semibold transition-all hover:shadow-lg"
                      style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                    >
                      {isSubmitting ? 'Loading...' : 'See My Results'}
                    </button>
                  </form>

                  <p className="mt-4 text-xs text-white/50">
                    We respect your privacy. Unsubscribe anytime.
                  </p>
                </>
              ) : (
                <div className="py-4">
                  <p className="text-white/80 text-sm">
                    Results sent to <span className="font-medium text-white">{email}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* RESULTS SECTION */}
      {showResults && resultType && (
        <>
          <section id="results" className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto">
                {/* Results Header */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4" style={{ color: '#ffba06' }}>
                  Results are In
                </h1>

                {/* Curly Arrow */}
                <div className="flex justify-center mb-8">
                  <svg width="60" height="80" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M30 5 C15 5, 10 20, 15 35 C20 50, 35 50, 40 35 C45 20, 35 15, 30 25 C25 35, 30 55, 30 70"
                      stroke="#ffba06"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M22 62 L30 75 L38 62"
                      stroke="#ffba06"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>

                {/* Their PD Type */}
                <div className="text-center mb-8">
                  <p className="text-sm font-medium uppercase tracking-wide mb-2" style={{ color: '#80a4ed' }}>
                    Your School&apos;s PD Type
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1e2749' }}>
                    {resultData[resultType].name}
                  </h2>
                  <p className="text-lg" style={{ color: '#1e2749', opacity: 0.8 }}>
                    {resultData[resultType].description}
                  </p>
                </div>

                {/* What this means */}
                <div className="bg-[#1e2749] rounded-2xl p-6 mb-8 text-left">
                  <h3 className="font-semibold text-white mb-3">
                    What this means for your school:
                  </h3>
                  <ul className="space-y-2 text-sm text-white/80">
                    {resultData[resultType].implications.map((item, index) => (
                      <li key={index}>- {item}</li>
                    ))}
                  </ul>
                </div>

                {/* What this commonly predicts */}
                <div className="bg-[#1e2749] rounded-2xl p-6 mb-8 text-left">
                  <h3 className="font-semibold text-white mb-3">What This Commonly Predicts</h3>
                  <p className="text-white/80">
                    {resultData[resultType].predicts}
                  </p>
                </div>

                {/* Show quadrant with highlight */}
                <div className="bg-slate-50 rounded-3xl p-8 mb-8">
                  <h3 className="text-xl font-bold text-slate-800 text-center mb-6">
                    Your Position on the Framework
                  </h3>
                  <PDQuadrant highlightQuadrant={resultType as 'A' | 'B' | 'C' | 'D'} interactive={false} />
                </div>

                {/* Grant funding mention */}
                <div className="mb-8 p-5 rounded-xl" style={{ backgroundColor: '#E8F0FD' }}>
                  <p className="text-sm mb-2" style={{ color: '#1e2749' }}>
                    <span className="font-semibold">80% of schools we partner with find over $35K in funding for TDI.</span>
                  </p>
                  <p className="text-sm" style={{ color: '#1e2749' }}>
                    Tell us about your school. We&apos;ll handle the rest.{' '}
                    <Link
                      href="/funding?utm_source=diagnostic&utm_medium=results&utm_campaign=funding_cta"
                      className="font-semibold underline hover:no-underline"
                      style={{ color: '#80a4ed' }}
                    >
                      Learn more
                    </Link>
                  </p>
                </div>

                {/* CTAs */}
                <div className="text-center space-y-6">
                  {/* Next Step Label */}
                  <p className="text-xl md:text-2xl font-bold uppercase tracking-widest" style={{ color: '#ffba06' }}>
                    Your Next Step
                  </p>

                  {/* Primary CTA Block */}
                  <div className="bg-[#1e2749] rounded-2xl p-8">
                    <p className="text-white text-2xl md:text-3xl font-bold mb-3">
                      Discover how to move from <span style={{ color: '#ffba06' }}>{resultData[resultType].name}</span> to Embedded Practice.
                    </p>
                    <p className="text-white/70 text-lg md:text-xl mb-6">
                      See the full framework, learn what drives each quadrant,<br />and get a clear roadmap for improvement.
                    </p>
                    <Link
                      href={`/pd-framework?utm_source=diagnostic&utm_medium=results&utm_campaign=framework_cta#${resultData[resultType].anchorId}`}
                      onClick={handleFrameworkClick}
                      className="inline-block px-10 py-5 rounded-full font-bold text-lg transition-all hover:shadow-xl hover:-translate-y-1"
                      style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                    >
                      See the Full PD Framework →
                    </Link>
                  </div>

                  {/* Secondary CTA */}
                  <div>
                    <Link
                      href="/contact?utm_source=diagnostic&utm_medium=results&utm_campaign=schedule_cta"
                      onClick={handleScheduleClick}
                      className="text-sm font-medium hover:underline"
                      style={{ color: '#80a4ed' }}
                    >
                      Or schedule a call with our team
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section - School Leaders */}
          <section className="pt-8 pb-16 md:pt-10 md:pb-20 bg-[#1e2749]">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">
                  What School Leaders Are Saying
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#E8F0FD] rounded-2xl p-6">
                    <p className="text-slate-700 italic mb-4">
                      &quot;This is not sit-and-get. Our teachers are actually learning how to work smarter and feel better doing it.&quot;
                    </p>
                    <p className="text-slate-600 font-semibold text-sm">Lisa M.</p>
                    <p className="text-slate-500 text-sm">K-8 School Director</p>
                  </div>
                  <div className="bg-[#E8F0FD] rounded-2xl p-6">
                    <p className="text-slate-700 italic mb-4">
                      &quot;Before, we got eye rolls. Now, we hear: &apos;When is the team coming next?&apos; That is when you know PD is finally working.&quot;
                    </p>
                    <p className="text-slate-600 font-semibold text-sm">Daniel R.</p>
                    <p className="text-slate-500 text-sm">High School Principal</p>
                  </div>
                  <div className="bg-[#E8F0FD] rounded-2xl p-6">
                    <p className="text-slate-700 italic mb-4">
                      &quot;This was the first PD I did not have to apologize for. Our teachers actually thanked me.&quot;
                    </p>
                    <p className="text-slate-600 font-semibold text-sm">James T.</p>
                    <p className="text-slate-500 text-sm">School Principal</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section - Teachers */}
          <section className="pt-8 pb-16 md:pt-10 md:pb-20 bg-[#1e2749]">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">
                  What Teachers Are Saying
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#E8F0FD] rounded-2xl p-6">
                    <p className="text-slate-700 italic mb-4">
                      &quot;I finally feel like I have strategies that work AND time to breathe. TDI changed how I approach my classroom and myself.&quot;
                    </p>
                    <p className="text-slate-600 font-semibold text-sm">Sarah K.</p>
                    <p className="text-slate-500 text-sm">5th Grade Teacher</p>
                  </div>
                  <div className="bg-[#E8F0FD] rounded-2xl p-6">
                    <p className="text-slate-700 italic mb-4">
                      &quot;Our teachers are actually excited about PD now. I do not have to chase them down or babysit. They are learning because they want to.&quot;
                    </p>
                    <p className="text-slate-600 font-semibold text-sm">Michelle M.</p>
                    <p className="text-slate-500 text-sm">K-8 School Director</p>
                  </div>
                  <div className="bg-[#E8F0FD] rounded-2xl p-6">
                    <p className="text-slate-700 italic mb-4">
                      &quot;TDI did not just drop a slide deck and bounce. Every part of the experience felt personal. Our staff felt understood.&quot;
                    </p>
                    <p className="text-slate-600 font-semibold text-sm">Julie H.</p>
                    <p className="text-slate-500 text-sm">Principal, MI</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
