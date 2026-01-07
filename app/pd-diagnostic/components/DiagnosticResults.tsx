'use client';

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

export default function DiagnosticResults({
  resultType,
  resultData,
}: DiagnosticResultsProps) {
  const isEmbedded = resultType === 'D';

  return (
    <div className="text-center">
      {/* Result Badge */}
      <div className="inline-block mb-6">
        <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
          Your PD Structure
        </span>
      </div>

      {/* Result Name */}
      <h2 className={`text-3xl md:text-4xl font-bold mb-2 ${isEmbedded ? 'text-[#1B4965]' : 'text-slate-800'}`}>
        {resultData.name}
      </h2>

      {/* Tagline */}
      <p className="text-lg text-slate-500 italic mb-8">
        {resultData.tagline}
      </p>

      {/* Description Card */}
      <div className="bg-slate-50 rounded-2xl p-6 md:p-8 text-left mb-6">
        <p className="text-slate-700 text-base md:text-lg leading-relaxed">
          {resultData.description}
        </p>
      </div>

      {/* Predicts Section */}
      <div className={`rounded-2xl p-6 md:p-8 text-left ${isEmbedded ? 'bg-[#1B4965]' : 'bg-slate-100'}`}>
        <h3 className={`font-semibold mb-3 ${isEmbedded ? 'text-white' : 'text-slate-800'}`}>
          What This Typically Predicts:
        </h3>
        <p className={`text-base leading-relaxed ${isEmbedded ? 'text-white/90' : 'text-slate-600'}`}>
          {resultData.predicts}
        </p>
      </div>
    </div>
  );
}
