'use client';

import PDQuadrant from './PDQuadrant';

type QuadrantType = 'A' | 'B' | 'C' | 'D';

interface QuadrantInfo {
  name: string;
  tagline: string;
  description: string;
  predicts: string;
  color: string;
}

interface DiagnosticResultsProps {
  result: QuadrantType;
  quadrantInfo: Record<QuadrantType, QuadrantInfo>;
  onRetake: () => void;
}

export default function DiagnosticResults({
  result,
  quadrantInfo,
  onRetake,
}: DiagnosticResultsProps) {
  const info = quadrantInfo[result];

  return (
    <section id="results" className="py-16 md:py-20" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="container-default max-w-3xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Result Header */}
          <div
            className="p-8 text-center"
            style={{ backgroundColor: info.color }}
          >
            <p
              className="text-sm font-semibold uppercase tracking-wide mb-2"
              style={{ color: result === 'D' ? 'rgba(255,255,255,0.8)' : 'rgba(30,39,73,0.6)' }}
            >
              Your PD Structure
            </p>
            <h3
              className="text-3xl md:text-4xl font-bold mb-2"
              style={{ color: result === 'D' ? '#ffffff' : '#1e2749' }}
            >
              {info.name}
            </h3>
            <p
              className="text-base italic"
              style={{ color: result === 'D' ? 'rgba(255,255,255,0.8)' : 'rgba(30,39,73,0.7)' }}
            >
              {info.tagline}
            </p>
          </div>

          {/* Result Content */}
          <div className="p-8">
            <p className="text-base md:text-lg mb-6" style={{ color: '#1e2749' }}>
              {info.description}
            </p>

            <div className="mb-8 p-5 rounded-xl" style={{ backgroundColor: '#E0E9F9' }}>
              <h4 className="font-bold mb-2" style={{ color: '#1e2749' }}>
                What This Commonly Predicts:
              </h4>
              <p style={{ color: '#1e2749', opacity: 0.85 }}>
                {info.predicts}
              </p>
            </div>

            {/* Quadrant Visual with Highlight */}
            <div className="mb-8 p-6 rounded-xl" style={{ backgroundColor: '#C7D7F5' }}>
              <PDQuadrant highlightQuadrant={result} interactive={false} />
            </div>

            {/* CTA */}
            <div className="border-t pt-8" style={{ borderColor: '#E0E9F9' }}>
              <p className="text-center font-semibold mb-6" style={{ color: '#1e2749' }}>
                Want to explore what shifting to Embedded Practice would require?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="inline-block px-8 py-4 rounded-xl font-bold text-center transition-all hover:scale-105 hover:shadow-lg"
                  style={{ backgroundColor: '#1e2749', color: '#ffffff' }}
                >
                  Schedule a Call
                </a>
                <a
                  href="/for-schools"
                  className="inline-block px-8 py-4 rounded-xl font-bold text-center border-2 transition-all hover:scale-105"
                  style={{ borderColor: '#80a4ed', color: '#1e2749', backgroundColor: '#ffffff' }}
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
            onClick={onRetake}
            className="text-sm underline transition-opacity hover:opacity-70"
            style={{ color: '#1e2749' }}
          >
            Retake the Diagnostic
          </button>
        </div>
      </div>
    </section>
  );
}
