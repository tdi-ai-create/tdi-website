'use client';

import QuestionCard from './QuestionCard';

interface Question {
  id: number;
  question: string;
  options: {
    value: string;
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
    <div>
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
          className={`
            px-10 py-4 rounded-full font-semibold text-lg transition-all
            ${allAnswered
              ? 'bg-[#1B4965] text-white hover:bg-[#143a52] shadow-lg hover:shadow-xl'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }
          `}
        >
          See My Results
        </button>
        {!allAnswered && (
          <p className="text-sm mt-3 text-slate-500">
            Answer all {questions.length} questions to see your results
          </p>
        )}
      </div>
    </div>
  );
}
