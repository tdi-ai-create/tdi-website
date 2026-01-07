'use client';

import { useState } from 'react';
import PDQuadrant from './components/PDQuadrant';
import DiagnosticForm from './components/DiagnosticForm';
import DiagnosticResults from './components/DiagnosticResults';

const questions = [
  {
    id: 1,
    question: "When PD ends, where does instructional support live the following week?",
    options: [
      { value: "A", label: "Nowhere — teachers are on their own" },
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
      { value: "A", label: "Nothing systematic — it stays stalled" },
      { value: "B", label: "We schedule another PD session" },
      { value: "C", label: "Coaching helps some teachers, others struggle" },
      { value: "D", label: "Support systems are already in place to address it" }
    ]
  },
  {
    id: 8,
    question: "Would most staff describe PD as relevant to their daily work?",
    options: [
      { value: "A", label: "Not really — it feels like a requirement" },
      { value: "B", label: "Inspiring in the moment, hard to apply later" },
      { value: "C", label: "Core staff say yes, others say no" },
      { value: "D", label: "Yes, most staff find it directly applicable" }
    ]
  }
];

const resultData = {
  A: {
    name: "Compliance-Focused PD",
    tagline: "Event-Based + Core-Focused",
    description: "Your PD structure is primarily delivered on designated days, focused on core instructional staff and aligned to required initiatives.",
    predicts: "Strong compliance and documentation, but implementation varies widely. Specialists and support staff often operate with different expectations. Predicts slower progress in consistency, retention, and schoolwide culture.",
  },
  B: {
    name: "Inspiration-Driven PD",
    tagline: "Event-Based + Whole-Staff",
    description: "Your whole-staff PD days are designed to build shared understanding and motivation. Sessions are engaging but follow-through support is limited.",
    predicts: "Temporary momentum followed by declining application as daily pressures return. Often leads to repeated cycles of retraining without sustained implementation.",
  },
  C: {
    name: "Fragmented Growth",
    tagline: "System-Based + Core-Focused",
    description: "You have ongoing coaching or PLC systems for select teams—typically in core subject areas. Specialists and support staff receive minimal aligned PD.",
    predicts: "Strong growth in targeted areas alongside significant variation elsewhere. Creates islands of excellence but inconsistent student experience across classrooms.",
  },
  D: {
    name: "Embedded Practice",
    tagline: "System-Based + Whole-Staff",
    description: "Your PD is ongoing, accessible year-round, and tailored by role. All staff share common instructional frameworks supported beyond designated PD days.",
    predicts: "Sustainable improvement, stronger culture, and progress without initiative overload. Consistent expectations across classrooms with clear evidence of implementation.",
  }
};

export default function PDDiagnosticPage() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [resultType, setResultType] = useState<string | null>(null);

  const handleAnswer = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateResult = () => {
    const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    Object.values(answers).forEach(answer => {
      counts[answer]++;
    });
    const maxCount = Math.max(...Object.values(counts));
    return Object.entries(counts).find(([_, count]) => count === maxCount)?.[0] || 'A';
  };

  const handleSubmit = () => {
    const result = calculateResult();
    setResultType(result);
    setShowResults(true);
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <main className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative min-h-[700px] flex items-center py-20">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/images/hero-schools.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Gradient Overlay - darker for better text contrast */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 39, 73, 0.95) 0%, rgba(27, 73, 101, 0.92) 100%)',
          }}
        />

        {/* Content */}
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-4xl mx-auto text-center">

            {/* Title - WHITE text for contrast */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              The 4 Types of PD
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/90 mb-6">
              A Self-Assessment for School and District Leaders
            </p>

            {/* Intro Text */}
            <p className="text-lg text-white/80 mb-12 max-w-2xl mx-auto">
              Is your current PD structure producing the outcomes you expect?
              This diagnostic helps you see where your PD sits — and what that typically predicts for growth, retention, and culture.
            </p>

            {/* Quadrant Visual in white card */}
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
              <PDQuadrant interactive={true} />
            </div>

            {/* Scroll prompt */}
            <p className="text-white/70 text-base mt-10">
              ↓ Take the diagnostic below to confirm your position
            </p>

          </div>
        </div>
      </section>

      {/* DIAGNOSTIC FORM SECTION */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 text-center mb-4">
              PD Structure Diagnostic
            </h2>
            <p className="text-slate-600 text-center mb-12">
              Answer based on what happens most often — not what is intended.
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

      {/* RESULTS SECTION */}
      {showResults && resultType && (
        <section id="results" className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <DiagnosticResults
                resultType={resultType}
                resultData={resultData[resultType as keyof typeof resultData]}
              />

              {/* Show quadrant with highlight */}
              <div className="mt-12 bg-slate-50 rounded-3xl p-8">
                <h3 className="text-xl font-semibold text-slate-800 text-center mb-6">
                  Your Position on the Framework
                </h3>
                <PDQuadrant highlightQuadrant={resultType as 'A' | 'B' | 'C' | 'D'} interactive={false} />
              </div>

              {/* CTAs */}
              <div className="mt-12 text-center">
                <p className="text-slate-600 mb-6">
                  Want to explore what shifting positions would require?
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/contact"
                    className="inline-block px-8 py-4 bg-[#1B4965] text-white font-semibold rounded-full hover:bg-[#143a52] transition-colors"
                  >
                    Schedule a Conversation
                  </a>
                  <a
                    href="/downloads/PD_Outcome_Diagnostic.pdf"
                    className="inline-block px-8 py-4 bg-white text-[#1B4965] font-semibold rounded-full border-2 border-[#1B4965] hover:bg-slate-50 transition-colors"
                  >
                    Download Full Framework
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
