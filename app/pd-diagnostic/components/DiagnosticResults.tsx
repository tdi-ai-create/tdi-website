interface ResultData {
  name: string;
  tagline: string;
  description: string;
  predicts: string;
}

interface DiagnosticResultsProps {
  resultType: string;
  resultData: ResultData;
}

export default function DiagnosticResults({ resultType, resultData }: DiagnosticResultsProps) {
  const isEmbedded = resultType === 'D';

  return (
    <div className="text-center">
      <p className="text-slate-500 uppercase tracking-wider text-sm mb-2">
        Your PD Structure
      </p>

      <h2 className={`text-3xl md:text-4xl font-bold mb-2 ${isEmbedded ? 'text-[#1B4965]' : 'text-slate-800'}`}>
        {resultData.name}
      </h2>

      <p className="text-lg text-slate-500 italic mb-8">
        {resultData.tagline}
      </p>

      <div className="bg-slate-50 rounded-2xl p-8 text-left">
        <h3 className="font-semibold text-slate-800 mb-3">What This Looks Like</h3>
        <p className="text-slate-600 mb-6">
          {resultData.description}
        </p>

        <h3 className="font-semibold text-slate-800 mb-3">What This Commonly Predicts</h3>
        <p className="text-slate-600">
          {resultData.predicts}
        </p>
      </div>
    </div>
  );
}
