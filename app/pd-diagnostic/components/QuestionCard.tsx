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
  selectedValue: QuadrantType | undefined;
  onAnswer: (questionId: number, value: QuadrantType) => void;
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
      <div className="space-y-3 ml-11">
        {options.map((option, optIndex) => (
          <label
            key={optIndex}
            className="flex items-start gap-3 cursor-pointer group p-3 rounded-lg transition-all hover:bg-gray-50"
            style={{
              backgroundColor: selectedValue === option.value ? '#E0E9F9' : 'transparent',
            }}
          >
            {/* Custom Radio Circle */}
            <div
              className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                borderColor: selectedValue === option.value ? '#80a4ed' : '#d1d5db',
                backgroundColor: selectedValue === option.value ? '#80a4ed' : 'transparent',
              }}
            >
              {selectedValue === option.value && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
            <input
              type="radio"
              name={`question-${id}`}
              checked={selectedValue === option.value}
              onChange={() => onAnswer(id, option.value)}
              className="sr-only"
            />
            <span
              className="text-sm transition-colors"
              style={{
                color: '#1e2749',
                fontWeight: selectedValue === option.value ? 600 : 400,
                opacity: selectedValue === option.value ? 1 : 0.8,
              }}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
