'use client';

type QuadrantType = 'A' | 'B' | 'C' | 'D';

interface QuestionCardProps {
  id: number;
  index: number;
  question: string;
  options: {
    value: QuadrantType;
    label: string;
  }[];
  selectedValue: string | undefined;
  onAnswer: (questionId: number, value: string) => void;
}

export default function QuestionCard({
  id,
  index,
  question,
  options,
  selectedValue,
  onAnswer,
}: QuestionCardProps) {
  return (
    <div
      className="p-6 rounded-xl shadow-sm transition-all hover:shadow-md"
      style={{
        backgroundColor: '#ffffff',
        border: selectedValue ? '2px solid #80a4ed' : '2px solid #E0E9F9',
      }}
    >
      <p className="font-semibold mb-4" style={{ color: '#1e2749' }}>
        <span
          className="inline-block w-8 h-8 rounded-full text-center leading-8 mr-3 text-sm font-bold"
          style={{ backgroundColor: selectedValue ? '#80a4ed' : '#1e2749', color: '#ffffff' }}
        >
          {index + 1}
        </span>
        {question}
      </p>
      <div className="space-y-2 ml-11">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
          >
            <input
              type="radio"
              name={`question-${id}`}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={() => onAnswer(id, option.value)}
              className="w-5 h-5 text-blue-600 accent-blue-600 flex-shrink-0"
            />
            <span className="text-slate-700 text-sm md:text-base">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
