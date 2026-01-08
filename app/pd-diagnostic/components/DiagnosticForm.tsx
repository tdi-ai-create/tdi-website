interface Question {
  id: number;
  question: string;
  options: { value: string; label: string }[];
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
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-white">
            Question {Math.min(answeredCount + 1, totalQuestions)} of {totalQuestions}
          </span>
          <span className="text-sm text-white/60">
            {progressPercent}% complete
          </span>
        </div>
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              backgroundColor: '#ffba06',
              width: `${progressPercent}%`,
            }}
          />
        </div>
      </div>

      {questions.map((question, index) => (
        <div key={question.id} className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-lg font-semibold text-slate-800 mb-4">
            <span className="text-slate-400 mr-2">{index + 1}.</span>
            {question.question}
          </p>
          <div className="space-y-2">
            {question.options.map((option) => (
              <label
                key={option.value}
                className={`
                  flex items-center gap-4 p-4 rounded-xl cursor-pointer
                  transition-all duration-200
                  ${answers[question.id] === option.value
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                  }
                `}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.value}
                  checked={answers[question.id] === option.value}
                  onChange={() => onAnswer(question.id, option.value)}
                  className="w-5 h-5 text-blue-600 flex-shrink-0 mr-3"
                />
                <span className="text-slate-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* Submit Button */}
      <div className="text-center pt-8">
        <button
          onClick={onSubmit}
          disabled={!allAnswered}
          className={`
            px-10 py-4 rounded-full font-semibold text-lg
            transition-all duration-200
            ${allAnswered
              ? 'bg-[#ffba06] text-[#1e2749] hover:shadow-lg cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }
          `}
        >
          {allAnswered ? 'See My Results' : `Answer all ${totalQuestions} questions to continue`}
        </button>
      </div>
    </div>
  );
}
