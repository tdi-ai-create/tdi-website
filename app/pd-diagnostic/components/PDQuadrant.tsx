'use client';

import { useState } from 'react';

interface QuadrantData {
  id: 'A' | 'B' | 'C' | 'D';
  name: string;
  tagline: string;
  hoverDetail: string;
  textColor: string;
  taglineColor: string;
}

const quadrantData: QuadrantData[] = [
  {
    id: 'B',
    name: 'INSPIRATION-DRIVEN PD',
    tagline: 'High energy, short-term lift',
    hoverDetail: 'Strong momentum after PD days, but application fades as daily pressures return.',
    textColor: 'text-slate-800',
    taglineColor: 'text-slate-500',
  },
  {
    id: 'D',
    name: 'EMBEDDED PRACTICE',
    tagline: 'Consistent support, sustained outcomes',
    hoverDetail: 'PD integrated into daily practice. Clear alignment, consistent expectations, measurable results.',
    textColor: 'text-white',
    taglineColor: 'text-blue-200',
  },
  {
    id: 'A',
    name: 'COMPLIANCE-FOCUSED PD',
    tagline: 'Meets requirements, limited translation',
    hoverDetail: 'Strong documentation, but implementation varies widely. Teachers often on their own after PD ends.',
    textColor: 'text-slate-800',
    taglineColor: 'text-slate-500',
  },
  {
    id: 'C',
    name: 'FRAGMENTED GROWTH',
    tagline: 'Strong pockets, uneven experience',
    hoverDetail: 'Coaching works for some teams, but specialists and support staff receive minimal aligned support.',
    textColor: 'text-slate-800',
    taglineColor: 'text-slate-500',
  }
];

const getBackgroundStyle = (id: string) => {
  switch (id) {
    case 'D':
      return 'linear-gradient(135deg, #1B4965 0%, #0D3347 100%)';
    case 'B':
      return 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)';
    case 'A':
      return 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)';
    case 'C':
      return 'linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 100%)';
    default:
      return '';
  }
};

const getShadow = (id: string) => {
  switch (id) {
    case 'D':
      return '0 10px 30px -8px rgba(27, 73, 101, 0.4)';
    case 'B':
      return '0 10px 30px -8px rgba(191, 219, 254, 0.5)';
    case 'A':
      return '0 10px 30px -8px rgba(156, 163, 175, 0.4)';
    case 'C':
      return '0 10px 30px -8px rgba(148, 163, 184, 0.4)';
    default:
      return '';
  }
};

export default function PDQuadrant({
  highlightQuadrant,
  interactive = true
}: {
  highlightQuadrant?: 'A' | 'B' | 'C' | 'D' | null;
  interactive?: boolean;
}) {
  const [hoveredQuadrant, setHoveredQuadrant] = useState<string | null>(null);

  const getQuadrantStyles = (quad: QuadrantData) => {
    const isHighlighted = highlightQuadrant === quad.id;
    const isOtherHighlighted = highlightQuadrant && highlightQuadrant !== quad.id;
    const isHovered = hoveredQuadrant === quad.id;

    return {
      background: getBackgroundStyle(quad.id),
      boxShadow: getShadow(quad.id),
      transform: isHovered && interactive
        ? 'translateY(-4px) scale(1.02)'
        : isHighlighted
        ? 'scale(1.03)'
        : isOtherHighlighted
        ? 'scale(0.97)'
        : 'none',
      opacity: isOtherHighlighted ? 0.5 : 1,
    };
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Title removed - it's redundant since page already has title */}

      {/* Y-Axis Label - ABOVE the grid, clearly visible */}
      <div className="flex justify-between items-center mb-2 px-4">
        <span className="text-xs font-medium text-slate-400">Whole-Staff</span>
        <span></span>
      </div>

      {/* The 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3 relative">
        {/* Subtle progression arrow - dashed line from bottom-left to top-right */}
        <svg
          className="absolute inset-0 pointer-events-none z-0"
          style={{ opacity: 0.15 }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
            </marker>
          </defs>
          <line
            x1="15" y1="85" x2="85" y2="15"
            stroke="#64748b"
            strokeWidth="1"
            strokeDasharray="4,4"
            markerEnd="url(#arrowhead)"
          />
        </svg>
        {/* Top Row: Inspiration (B) | Embedded (D) */}
        {[quadrantData[0], quadrantData[1]].map((quad) => (
          <div
            key={quad.id}
            className={`
              relative overflow-hidden rounded-2xl p-5 md:p-6
              flex flex-col justify-center items-center text-center
              transition-all duration-300 ease-out
              ${interactive ? 'cursor-pointer' : ''}
              ${highlightQuadrant === quad.id ? 'ring-4 ring-blue-500 ring-offset-2' : ''}
            `}
            style={{
              minHeight: '160px',
              ...getQuadrantStyles(quad)
            }}
            onMouseEnter={() => interactive && setHoveredQuadrant(quad.id)}
            onMouseLeave={() => interactive && setHoveredQuadrant(null)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

            <h4 className={`text-sm md:text-base font-bold leading-tight mb-2 ${quad.textColor} relative z-10`}>
              {quad.name}
            </h4>
            <p className={`text-xs md:text-sm ${quad.taglineColor} italic relative z-10`}>
              {quad.tagline}
            </p>

            {interactive && hoveredQuadrant === quad.id && (
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-xs text-white/90 leading-relaxed">
                  {quad.hoverDetail}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Bottom Row: Compliance (A) | Fragmented (C) */}
        {[quadrantData[2], quadrantData[3]].map((quad) => (
          <div
            key={quad.id}
            className={`
              relative overflow-hidden rounded-2xl p-5 md:p-6
              flex flex-col justify-center items-center text-center
              transition-all duration-300 ease-out
              ${interactive ? 'cursor-pointer' : ''}
              ${highlightQuadrant === quad.id ? 'ring-4 ring-blue-500 ring-offset-2' : ''}
            `}
            style={{
              minHeight: '160px',
              ...getQuadrantStyles(quad)
            }}
            onMouseEnter={() => interactive && setHoveredQuadrant(quad.id)}
            onMouseLeave={() => interactive && setHoveredQuadrant(null)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

            <h4 className={`text-sm md:text-base font-bold leading-tight mb-2 ${quad.textColor} relative z-10`}>
              {quad.name}
            </h4>
            <p className={`text-xs md:text-sm ${quad.taglineColor} italic relative z-10`}>
              {quad.tagline}
            </p>

            {interactive && hoveredQuadrant === quad.id && (
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-800/70 to-transparent">
                <p className="text-xs text-white/90 leading-relaxed">
                  {quad.hoverDetail}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Y-Axis Label */}
      <div className="flex justify-between items-center mt-2 px-4">
        <span className="text-xs font-medium text-slate-400">Core-Focused</span>
        <span></span>
      </div>

      {/* X-Axis Labels - Clean row below */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
        <div className="text-center flex-1">
          <span className="text-xs font-medium text-slate-400 block">Event-Based</span>
        </div>
        <div className="text-center px-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PD Structure →</span>
        </div>
        <div className="text-center flex-1">
          <span className="text-xs font-medium text-slate-400 block">System-Based</span>
        </div>
      </div>

      {/* Footer Note */}
      <p className="text-center text-xs mt-6 text-slate-400 italic">
        Most schools don't start in Embedded Practice — they move there over time.
      </p>
    </div>
  );
}
