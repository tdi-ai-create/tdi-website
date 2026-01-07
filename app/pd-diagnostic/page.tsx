'use client';

import { useState } from 'react';
import PDQuadrant from '@/components/PDQuadrant';

type QuadrantType = 'compliance' | 'inspiration' | 'fragmented' | 'embedded';

interface Question {
  id: number;
  question: string;
  options: {
    text: string;
    type: QuadrantType;
  }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "How are PD topics typically selected at your school?",
    options: [
      { text: "Based on district mandates or compliance requirements", type: "compliance" },
      { text: "By bringing in outside speakers on trending topics", type: "inspiration" },
      { text: "Teachers choose from a menu of unconnected options", type: "fragmented" },
      { text: "Aligned to school goals with teacher input on delivery", type: "embedded" },
    ],
  },
  {
    id: 2,
    question: "What happens after a PD session ends?",
    options: [
      { text: "Teachers return to classrooms with no follow-up", type: "compliance" },
      { text: "Excitement fades within a week", type: "inspiration" },
      { text: "Some teachers try things, others don't—no tracking", type: "fragmented" },
      { text: "Ongoing coaching and check-ins support implementation", type: "embedded" },
    ],
  },
  {
    id: 3,
    question: "How do teachers generally feel about PD at your school?",
    options: [
      { text: "It's something to endure, not engage with", type: "compliance" },
      { text: "They enjoy the day but question the relevance", type: "inspiration" },
      { text: "Mixed—depends on the topic and presenter", type: "fragmented" },
      { text: "They see it as valuable and connected to their work", type: "embedded" },
    ],
  },
  {
    id: 4,
    question: "How would you describe your PD calendar?",
    options: [
      { text: "Filled with required trainings and box-checking", type: "compliance" },
      { text: "A few big events with motivational speakers", type: "inspiration" },
      { text: "A scattered mix of topics with no clear thread", type: "fragmented" },
      { text: "Strategically sequenced with built-in practice time", type: "embedded" },
    ],
  },
  {
    id: 5,
    question: "When you evaluate PD success, what do you measure?",
    options: [
      { text: "Attendance and completion certificates", type: "compliance" },
      { text: "Post-session satisfaction surveys", type: "inspiration" },
      { text: "We don't have a consistent way to measure", type: "fragmented" },
      { text: "Classroom implementation and student outcomes", type: "embedded" },
    ],
  },
  {
    id: 6,
    question: "How much of what's taught in PD actually gets used in classrooms?",
    options: [
      { text: "Very little—teachers do what they were already doing", type: "compliance" },
      { text: "Initial enthusiasm, but it rarely sticks", type: "inspiration" },
      { text: "Inconsistent—depends on the individual teacher", type: "fragmented" },
      { text: "Most strategies are implemented with support", type: "embedded" },
    ],
  },
  {
    id: 7,
    question: "How is PD connected to your school improvement goals?",
    options: [
      { text: "It's not—PD and goals exist separately", type: "compliance" },
      { text: "Loosely—we hope inspiration translates to results", type: "inspiration" },
      { text: "Some sessions align, others are disconnected", type: "fragmented" },
      { text: "Every PD session directly supports our priorities", type: "embedded" },
    ],
  },
  {
    id: 8,
    question: "What role do teachers play in shaping PD?",
    options: [
      { text: "None—decisions come from above", type: "compliance" },
      { text: "They're the audience, not the planners", type: "inspiration" },
      { text: "Some input, but no systematic process", type: "fragmented" },
      { text: "Active partners in design and delivery", type: "embedded" },
    ],
  },
];

const quadrantInfo: Record<QuadrantType, {
  name: string;
  description: string;
  predictions: string[];
  color: string;
}> = {
  compliance: {
    name: "Compliance-Driven",
    description: "Your PD structure prioritizes meeting requirements over building capacity. Sessions check boxes but rarely change practice. Teachers feel talked at, not invested in.",
    predictions: [
      "High teacher turnover due to feeling undervalued",
      "Low implementation of new strategies (under 10%)",
      "Cynicism toward any new initiative",
      "Stagnant student outcomes despite PD investment",
    ],
    color: "#ef4444",
  },
  inspiration: {
    name: "Inspiration-Based",
    description: "Your PD brings energy and excitement through dynamic speakers and events. Teachers leave feeling motivated—but without systems to sustain change, that energy dissipates quickly.",
    predictions: [
      "Initial enthusiasm followed by return to old habits",
      "Teachers asking 'when's the next speaker?' instead of implementing",
      "Disconnection between PD days and daily instruction",
      "Budget spent on events with little lasting ROI",
    ],
    color: "#f59e0b",
  },
  fragmented: {
    name: "Fragmented",
    description: "Your PD offers variety but lacks coherence. Teachers experience a buffet of unconnected sessions. Some find value; many feel overwhelmed by competing priorities.",
    predictions: [
      "Initiative fatigue among staff",
      "Inconsistent practices across classrooms",
      "Difficulty measuring what's working",
      "Teachers feeling 'trained' but not supported",
    ],
    color: "#8b5cf6",
  },
  embedded: {
    name: "Embedded & Sustained",
    description: "Your PD is strategically aligned, job-embedded, and supported by ongoing coaching. Teachers are partners in the process, and implementation is the expectation—not the exception.",
    predictions: [
      "High implementation rates (60%+ of strategies used)",
      "Improved teacher retention and morale",
      "Measurable impact on student outcomes",
      "Culture of continuous improvement",
    ],
    color: "#22c55e",
  },
};

export default function PDDiagnosticPage() {
  const [answers, setAnswers] = useState<Record<number, QuadrantType>>({});
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<QuadrantType | null>(null);

  const handleAnswer = (questionId: number, type: QuadrantType) => {
    setAnswers(prev => ({ ...prev, [questionId]: type }));
  };

  const calculateResult = () => {
    const counts: Record<QuadrantType, number> = {
      compliance: 0,
      inspiration: 0,
      fragmented: 0,
      embedded: 0,
    };

    Object.values(answers).forEach(type => {
      counts[type]++;
    });

    const maxCount = Math.max(...Object.values(counts));
    const resultType = (Object.keys(counts) as QuadrantType[]).find(
      key => counts[key] === maxCount
    ) || 'fragmented';

    setResult(resultType);
    setShowResults(true);

    // Scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const allAnswered = Object.keys(answers).length === questions.length;

  // Map result type to quadrant ID for PDQuadrant component
  const quadrantIdMap: Record<QuadrantType, 'A' | 'B' | 'C' | 'D'> = {
    compliance: 'A',
    inspiration: 'B',
    fragmented: 'C',
    embedded: 'D',
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/hero-workshop.webp)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(30, 39, 73, 0.9)' }}
        />

        {/* Content */}
        <div className="container-default relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#ffffff' }}>
              The 4 Types of PD
            </h1>
            <p className="text-xl md:text-2xl font-semibold mb-6" style={{ color: '#ffba06' }}>
              A Self-Assessment for School Leaders
            </p>
            <p className="text-base md:text-lg mb-8" style={{ color: '#ffffff', opacity: 0.9 }}>
              Not all professional development is created equal. Research shows that PD structures fall into four distinct quadrants—each with predictable outcomes for teacher practice and student achievement.
            </p>

            {/* 2x2 Quadrant Visual */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-xl max-w-xl mx-auto mb-8">
              <PDQuadrant />
            </div>

            <p className="text-sm md:text-base font-medium" style={{ color: '#ffffff', opacity: 0.8 }}>
              Most leaders can identify their position immediately.<br />
              Take the diagnostic below to confirm.
            </p>
          </div>
        </div>
      </section>

      {/* Diagnostic Section */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center" style={{ color: '#1e2749' }}>
            PD Structure Diagnostic
          </h2>

          <div className="space-y-8">
            {questions.map((q, index) => (
              <div
                key={q.id}
                className="p-6 rounded-xl border"
                style={{ borderColor: answers[q.id] ? '#ffba06' : '#e5e7eb' }}
              >
                <p className="font-semibold mb-4" style={{ color: '#1e2749' }}>
                  <span className="inline-block w-8 h-8 rounded-full text-center leading-8 mr-3 text-sm font-bold" style={{ backgroundColor: '#1e2749', color: '#ffffff' }}>
                    {index + 1}
                  </span>
                  {q.question}
                </p>
                <div className="space-y-3 ml-11">
                  {q.options.map((option, optIndex) => (
                    <label
                      key={optIndex}
                      className="flex items-start gap-3 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        checked={answers[q.id] === option.type}
                        onChange={() => handleAnswer(q.id, option.type)}
                        className="mt-1 w-4 h-4 accent-amber-500"
                      />
                      <span
                        className="text-sm transition-colors"
                        style={{
                          color: answers[q.id] === option.type ? '#1e2749' : '#6b7280',
                          fontWeight: answers[q.id] === option.type ? 600 : 400,
                        }}
                      >
                        {option.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-10 text-center">
            <button
              onClick={calculateResult}
              disabled={!allAnswered}
              className="px-8 py-4 rounded-lg font-bold text-lg transition-all"
              style={{
                backgroundColor: allAnswered ? '#ffba06' : '#e5e7eb',
                color: allAnswered ? '#1e2749' : '#9ca3af',
                cursor: allAnswered ? 'pointer' : 'not-allowed',
              }}
            >
              See My Results
            </button>
            {!allAnswered && (
              <p className="text-sm mt-3" style={{ color: '#6b7280' }}>
                Answer all {questions.length} questions to see your results
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      {showResults && result && (
        <section id="results" className="py-16 md:py-20" style={{ backgroundColor: '#f5f5f5' }}>
          <div className="container-default max-w-3xl">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Result Header */}
              <div
                className="p-8 text-center"
                style={{ backgroundColor: quadrantInfo[result].color }}
              >
                <p className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Your PD Structure
                </p>
                <h3 className="text-3xl md:text-4xl font-bold" style={{ color: '#ffffff' }}>
                  {quadrantInfo[result].name}
                </h3>
              </div>

              {/* Result Content */}
              <div className="p-8">
                <p className="text-base md:text-lg mb-6" style={{ color: '#1e2749' }}>
                  {quadrantInfo[result].description}
                </p>

                <div className="mb-8">
                  <h4 className="font-bold mb-4" style={{ color: '#1e2749' }}>
                    What This Commonly Predicts:
                  </h4>
                  <ul className="space-y-3">
                    {quadrantInfo[result].predictions.map((prediction, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 mt-0.5 flex-shrink-0"
                          fill={quadrantInfo[result].color}
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <span style={{ color: '#1e2749', opacity: 0.8 }}>{prediction}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quadrant Visual with Highlight */}
                <div className="mb-8 p-6 rounded-xl" style={{ backgroundColor: '#f9fafb' }}>
                  <PDQuadrant highlightQuadrant={quadrantIdMap[result]} />
                </div>

                {/* CTA */}
                <div className="border-t pt-8" style={{ borderColor: '#e5e7eb' }}>
                  <p className="text-center font-semibold mb-6" style={{ color: '#1e2749' }}>
                    Want to explore what shifting to Embedded & Sustained would require?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="/contact"
                      className="inline-block px-8 py-4 rounded-lg font-bold text-center transition-all hover-glow"
                      style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                    >
                      Schedule a Call
                    </a>
                    <a
                      href="/for-schools"
                      className="inline-block px-8 py-4 rounded-lg font-bold text-center border-2 transition-all hover-lift"
                      style={{ borderColor: '#1e2749', color: '#1e2749' }}
                    >
                      Explore Our Approach
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Retake Option */}
            <div className="text-center mt-8">
              <button
                onClick={() => {
                  setAnswers({});
                  setShowResults(false);
                  setResult(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-sm underline transition-opacity hover:opacity-70"
                style={{ color: '#1e2749' }}
              >
                Retake the Diagnostic
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
