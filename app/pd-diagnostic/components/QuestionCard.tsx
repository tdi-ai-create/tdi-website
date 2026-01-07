'use client';

interface QuestionCardProps {
  id: number;
  index: number;
  question: string;
  options: {
    value: string;
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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <p className="font-semibold text-slate-800 mb-4 flex items-start gap-3">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#1B4965] text-white text-sm font-bold flex-shrink-0">
          {index + 1}
        </span>
        <span className="pt-1">{question}</span>
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
