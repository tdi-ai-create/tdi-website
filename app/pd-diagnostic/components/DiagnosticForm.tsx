'use client';

import QuestionCard from './QuestionCard';

type QuadrantType = 'A' | 'B' | 'C' | 'D';

interface Question {
  id: number;
  question: string;
  options: {
    value: QuadrantType;
    label: string;
  }[];
}

interface DiagnosticFormProps {
  questions: Question[];
  answers: Record<number, string>;
  onAnswer: (questionId: number, value: string) => void;
  onSubmit: () => void;
  allAnswered: boolean;
}

export default function DiagnosticForm({
  questions,
  answers,
  onAnswer,
  onSubmit,
  allAnswered,
}: DiagnosticFormProps) {
  return (
    <section className="py-16 md:py-20" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="container-default max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ color: '#1e2749' }}>
          PD Structure Diagnostic
        </h2>
        <p className="text-center mb-8" style={{ color: '#1e2749', opacity: 0.7 }}>
          Answer each question honestly based on your current reality, not aspirations.
        </p>

        <div className="space-y-6">
          {questions.map((q, index) => (
            <QuestionCard
              key={q.id}
              id={q.id}
              index={index}
              question={q.question}
              options={q.options}
              selectedValue={answers[q.id]}
              onAnswer={onAnswer}
            />
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-10 text-center">
          <button
            onClick={onSubmit}
            disabled={!allAnswered}
            className={`px-10 py-4 rounded-xl font-bold text-lg transition-all ${allAnswered ? 'hover:scale-105 hover:shadow-lg' : ''}`}
            style={{
              backgroundColor: allAnswered ? '#1e2749' : '#E0E9F9',
              color: allAnswered ? '#ffffff' : '#9ca3af',
              cursor: allAnswered ? 'pointer' : 'not-allowed',
            }}
          >
            See My Results
          </button>
          {!allAnswered && (
            <p className="text-sm mt-3" style={{ color: '#1e2749', opacity: 0.6 }}>
              Answer all {questions.length} questions to see your results
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
