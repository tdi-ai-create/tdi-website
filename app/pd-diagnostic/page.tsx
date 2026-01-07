'use client';

import { useState } from 'react';
import DiagnosticHero from './components/DiagnosticHero';
import DiagnosticForm from './components/DiagnosticForm';
import DiagnosticResults from './components/DiagnosticResults';

type QuadrantType = 'A' | 'B' | 'C' | 'D';

const questions = [
  {
    id: 1,
    question: "When PD ends, where does instructional support live the following week?",
    options: [
      { value: "A" as QuadrantType, label: "Nowhere — teachers are on their own" },
      { value: "B" as QuadrantType, label: "In the momentum from the session" },
      { value: "C" as QuadrantType, label: "With instructional coaches (for some staff)" },
      { value: "D" as QuadrantType, label: "Built into ongoing coaching, PLCs, and role-specific support" }
    ]
  },
  {
    id: 2,
    question: "Is PD concentrated on specific days or distributed throughout the year?",
    options: [
      { value: "A" as QuadrantType, label: "Concentrated on designated PD days" },
      { value: "B" as QuadrantType, label: "Intensive whole-staff sessions with limited follow-up" },
      { value: "C" as QuadrantType, label: "Ongoing for core teams, limited for others" },
      { value: "D" as QuadrantType, label: "Ongoing and accessible for all staff year-round" }
    ]
  },
  {
    id: 3,
    question: "Which staff groups receive the most consistent PD support?",
    options: [
      { value: "A" as QuadrantType, label: "Core instructional staff only" },
      { value: "B" as QuadrantType, label: "Everyone receives the same content" },
      { value: "C" as QuadrantType, label: "Core staff get coaching; others get minimal support" },
      { value: "D" as QuadrantType, label: "All staff receive role-specific, aligned support" }
    ]
  },
  {
    id: 4,
    question: "Do specialists, paraprofessionals, and support staff receive role-specific learning?",
    options: [
      { value: "A" as QuadrantType, label: "Rarely or inconsistently" },
      { value: "B" as QuadrantType, label: "They attend the same sessions as teachers" },
      { value: "C" as QuadrantType, label: "Sometimes, but not systematically" },
      { value: "D" as QuadrantType, label: "Yes, with clear alignment to classroom expectations" }
    ]
  },
  {
    id: 5,
    question: "Can leadership see evidence of PD application in classrooms?",
    options: [
      { value: "A" as QuadrantType, label: "Limited or inconsistent evidence" },
      { value: "B" as QuadrantType, label: "Strong evidence immediately after PD, then fades" },
      { value: "C" as QuadrantType, label: "Clear evidence in coached classrooms only" },
      { value: "D" as QuadrantType, label: "Consistent evidence across most classrooms" }
    ]
  },
  {
    id: 6,
    question: "Is there a shared instructional and behavioral language across roles?",
    options: [
      { value: "A" as QuadrantType, label: "Varies significantly by role and classroom" },
      { value: "B" as QuadrantType, label: "Shared at a conceptual level, inconsistent in practice" },
      { value: "C" as QuadrantType, label: "Strong among core staff, weak elsewhere" },
      { value: "D" as QuadrantType, label: "Yes, used consistently building-wide" }
    ]
  },
  {
    id: 7,
    question: "What happens when implementation stalls?",
    options: [
      { value: "A" as QuadrantType, label: "Nothing systematic — it stays stalled" },
      { value: "B" as QuadrantType, label: "We schedule another PD session" },
      { value: "C" as QuadrantType, label: "Coaching helps some teachers, others struggle" },
      { value: "D" as QuadrantType, label: "Support systems are already in place to address it" }
    ]
  },
  {
    id: 8,
    question: "Would most staff describe PD as relevant to their daily work?",
    options: [
      { value: "A" as QuadrantType, label: "Not really — it feels like a requirement" },
      { value: "B" as QuadrantType, label: "Inspiring in the moment, hard to apply later" },
      { value: "C" as QuadrantType, label: "Core staff say yes, others say no" },
      { value: "D" as QuadrantType, label: "Yes, most staff find it directly applicable" }
    ]
  }
];

const quadrantInfo: Record<QuadrantType, {
  name: string;
  tagline: string;
  description: string;
  predicts: string;
  color: string;
}> = {
  A: {
    name: "Compliance-Focused PD",
    tagline: "Meets requirements, limited classroom translation",
    description: "Your PD structure is primarily event-based and focused on core instructional staff. PD is delivered on designated days, aligned to required initiatives and accountability timelines.",
    predicts: "Strong compliance stability with slower progress in consistency, retention, and schoolwide culture. Implementation varies widely by role, and specialists often operate with different expectations.",
    color: "#E8E8E8",
  },
  B: {
    name: "Inspiration-Driven PD",
    tagline: "High energy, short-term lift",
    description: "Your whole-staff PD days are designed to build shared understanding and motivation. Sessions are engaging and idea-rich, but follow-through support is limited.",
    predicts: "Temporary momentum followed by inconsistent implementation. Strong initial satisfaction that declines as daily pressures return, often leading to repeated cycles of retraining.",
    color: "#D4E4ED",
  },
  C: {
    name: "Fragmented Growth",
    tagline: "Strong pockets, uneven experience",
    description: "You have ongoing coaching or PLC systems for select teams—typically in core subject areas. Specialists and support staff receive minimal aligned PD.",
    predicts: "Targeted growth in coached areas alongside significant variation in expectations across classrooms. Islands of excellence with inconsistent instructional language building-wide.",
    color: "#DDE3E8",
  },
  D: {
    name: "Embedded Practice",
    tagline: "Consistent support, sustained outcomes",
    description: "Your PD is ongoing, accessible year-round, and tailored by role. All staff share common instructional frameworks supported beyond designated PD days.",
    predicts: "Sustainable improvement, stronger culture, and progress without initiative overload. Consistent expectations across classrooms with clear evidence of PD application.",
    color: "#1B4965",
  },
};

export default function PDDiagnosticPage() {
  const [answers, setAnswers] = useState<Record<number, QuadrantType>>({});
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<QuadrantType | null>(null);

  const handleAnswer = (questionId: number, value: QuadrantType) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  // A = Compliance-Focused, B = Inspiration-Driven, C = Fragmented Growth, D = Embedded Practice
  const calculateResult = () => {
    const counts = { A: 0, B: 0, C: 0, D: 0 };

    Object.values(answers).forEach(answer => {
      counts[answer as keyof typeof counts]++;
    });

    // Find the type with highest count
    const maxCount = Math.max(...Object.values(counts));
    const resultType = Object.entries(counts).find(([_, count]) => count === maxCount)?.[0] as QuadrantType || 'A';

    setResult(resultType);
    setShowResults(true);

    // Scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleRetake = () => {
    setAnswers({});
    setShowResults(false);
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <main>
      <DiagnosticHero />

      <DiagnosticForm
        questions={questions}
        answers={answers}
        onAnswer={handleAnswer}
        onSubmit={calculateResult}
        allAnswered={allAnswered}
      />

      {showResults && result && (
        <DiagnosticResults
          result={result}
          quadrantInfo={quadrantInfo}
          onRetake={handleRetake}
        />
      )}
    </main>
  );
}
