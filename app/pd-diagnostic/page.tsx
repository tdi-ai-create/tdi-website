'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PDQuadrant from './components/PDQuadrant';
import DiagnosticForm from './components/DiagnosticForm';

// GA4 event helper
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const sendGAEvent = (eventName: string, params: Record<string, string | number>) => {
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

// localStorage key for returning users
const STORAGE_KEY = 'tdi_diagnostic_user';

export default function PDDiagnosticPage() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [resultType, setResultType] = useState<string | null>(null);
  const [isReturningUser, setIsReturningUser] = useState(false);

  // Email capture state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for returning user on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const userData = JSON.parse(stored);
        if (userData.email) {
          setEmail(userData.email);
          setName(userData.name || '');
          setSchoolName(userData.schoolName || '');
          setIsReturningUser(true);
        }
      }
    } catch {
      // localStorage not available or invalid data
    }
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
    if (Object.keys(answers).length === questions.length) {
      sendGAEvent('diagnostic_completed', {
        event_category: 'PD Diagnostic',
        event_label: 'All Questions Answered',
      });
    }
  }, [answers]);

  const handleAnswer = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));

    sendGAEvent('diagnostic_question_answered', {
      event_category: 'PD Diagnostic',
      event_label: `Question ${questionId}`,
      value: questionId,
    });
  };

  const calculateResult = () => {
    const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    Object.values(answers).forEach(answer => {
      counts[answer]++;
    });
    const maxCount = Math.max(...Object.values(counts));
    return Object.entries(counts).find(([, count]) => count === maxCount)?.[0] || 'A';
  };

  const handleSubmit = () => {
    const result = calculateResult();
    setResultType(result);

    // Skip email gate for returning users
    if (isReturningUser) {
      sendGAEvent('diagnostic_returning_user', {
        event_category: 'PD Diagnostic',
        event_label: 'Skipped Email Gate',
      });

      // Still submit to track the new diagnostic result
      submitDiagnosticResult(result);
      setShowResults(true);
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setShowEmailGate(true);
      setTimeout(() => {
        document.getElementById('email-gate')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
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

    setShowEmailGate(false);
    setShowResults(true);
    setIsSubmitting(false);

    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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

  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <main className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative min-h-[800px] flex items-center py-16">
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
          </div>
        </div>
      </section>

      {/* CREDIBILITY SIGNALS */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          {/* Credibility info */}
          <div className="max-w-3xl mx-auto mb-8 text-center">
            <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.8 }}>
              Developed by the Teachers Deserve It team - former teachers, content experts, and PD specialists
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
              <span>500+ schools assessed</span>
              <span>Based on implementation research</span>
            </div>
          </div>

          {/* Testimonial */}
          <div className="max-w-2xl mx-auto p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
            <p className="text-sm italic mb-2" style={{ color: '#1e2749' }}>
              "This diagnostic helped us see exactly where our PD was falling short. Within 10 minutes, we had a clear picture of what needed to change."
            </p>
            <p className="text-xs font-medium" style={{ color: '#1e2749', opacity: 0.7 }}>
              - K-8 Principal, Illinois
            </p>
          </div>
        </div>
      </section>

      {/* DIAGNOSTIC FORM SECTION */}
      {!showEmailGate && !showResults && (
        <section className="py-16 md:py-24 bg-[#1e2749]">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
                PD Structure Diagnostic
              </h2>
              <p className="text-white/80 text-center mb-12">
                Answer based on what happens most often... <em>not what is intended.</em>
              </p>

              <DiagnosticForm
                questions={questions}
                answers={answers}
                onAnswer={handleAnswer}
                onSubmit={handleSubmit}
                allAnswered={allAnswered}
              />
            </div>
          </div>
        </section>
      )}

      {/* EMAIL GATE SECTION */}
      {showEmailGate && !showResults && (
        <section id="email-gate" className="py-16 md:py-24 bg-[#1e2749]">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto text-center">
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
            </div>
          </div>
        </section>
      )}

      {/* RESULTS SECTION */}
      {showResults && resultType && (
        <section id="results" className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
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
              <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
                <h3 className="font-bold mb-3" style={{ color: '#1e2749' }}>
                  What this means for your school:
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: '#1e2749', opacity: 0.8 }}>
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
              <div className="mb-8 p-4 rounded-xl" style={{ backgroundColor: '#E8F0FD' }}>
                <p className="text-sm" style={{ color: '#1e2749' }}>
                  Think you cannot afford to fix this?{' '}
                  <span className="font-medium">73% of our partners use grant funding.</span>{' '}
                  <Link
                    href="/funding?utm_source=diagnostic&utm_medium=results&utm_campaign=funding_cta"
                    className="font-semibold underline hover:no-underline"
                    style={{ color: '#80a4ed' }}
                  >
                    Explore funding options
                  </Link>
                </p>
              </div>

              {/* CTAs */}
              <div className="text-center space-y-4">
                {/* Primary CTA */}
                <Link
                  href={`/pd-framework?utm_source=diagnostic&utm_medium=results&utm_campaign=framework_cta#${resultData[resultType].anchorId}`}
                  onClick={handleFrameworkClick}
                  className="inline-block px-8 py-4 rounded-full font-semibold transition-all hover:shadow-lg"
                  style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                >
                  Explore the Full PD Framework
                </Link>

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
      )}

      {/* Testimonials Section - School Leaders */}
      {showResults && (
        <section className="py-16 md:py-20 bg-[#1e2749]">
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
                    &quot;Before, we got eye rolls. Now, we hear: &apos;When&apos;s the team coming next?&apos; That&apos;s when you know PD is finally working.&quot;
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
      )}

      {/* Testimonials Section - Teachers */}
      {showResults && (
        <section className="py-16 md:py-20 bg-[#1e2749]">
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
      )}
    </main>
  );
}
