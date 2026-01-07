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
    taglineColor: 'text-slate-600',
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
    taglineColor: 'text-slate-600',
  },
  {
    id: 'C',
    name: 'FRAGMENTED GROWTH',
    tagline: 'Strong pockets, uneven experience',
    hoverDetail: 'Coaching works for some teams, but specialists and support staff receive minimal aligned support.',
    textColor: 'text-slate-800',
    taglineColor: 'text-slate-600',
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
      return '0 20px 40px -12px rgba(27, 73, 101, 0.35)';
    case 'B':
      return '0 20px 40px -12px rgba(191, 219, 254, 0.5)';
    case 'A':
      return '0 20px 40px -12px rgba(156, 163, 175, 0.4)';
    case 'C':
      return '0 20px 40px -12px rgba(148, 163, 184, 0.4)';
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
        ? 'translateY(-8px) scale(1.02)'
        : isHighlighted
        ? 'scale(1.03)'
        : isOtherHighlighted
        ? 'scale(0.95)'
        : 'none',
      opacity: isOtherHighlighted ? 0.4 : 1,
      zIndex: isHighlighted ? 10 : 1,
    };
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Title */}
      <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 text-[#1B4965]">
        The 4 Types of PD
      </h3>

      {/* Main Grid Container */}
      <div className="relative">

        {/* Y-Axis Label - Left Side */}
        <div className="hidden md:flex absolute -left-20 top-0 bottom-0 items-center">
          <div className="transform -rotate-90 whitespace-nowrap">
            <span className="text-sm font-semibold tracking-widest text-slate-400 uppercase">
              Staff Coverage
            </span>
          </div>
        </div>

        {/* Y-Axis Range Labels */}
        <div className="hidden md:block absolute -left-6 top-8 text-xs text-slate-400 font-medium transform -rotate-90 origin-center">
          Whole-Staff
        </div>
        <div className="hidden md:block absolute -left-6 bottom-8 text-xs text-slate-400 font-medium transform -rotate-90 origin-center">
          Core-Focused
        </div>

        {/* The 2x2 Grid */}
        <div className="grid grid-cols-2 gap-4 md:gap-5">

          {/* Top Row: Inspiration (B) | Embedded (D) */}
          {[quadrantData[0], quadrantData[1]].map((quad) => (
            <div
              key={quad.id}
              className={`
                relative overflow-hidden rounded-2xl p-6 md:p-8
                flex flex-col justify-center items-center text-center
                transition-all duration-300 ease-out
                ${interactive ? 'cursor-pointer' : ''}
                ${highlightQuadrant === quad.id ? 'ring-4 ring-blue-500 ring-offset-4' : ''}
              `}
              style={{
                minHeight: '220px',
                ...getQuadrantStyles(quad)
              }}
              onMouseEnter={() => interactive && setHoveredQuadrant(quad.id)}
              onMouseLeave={() => interactive && setHoveredQuadrant(null)}
            >
              {/* Subtle shine effect */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
                }}
              />

              <h4 className={`text-base md:text-lg font-bold leading-tight mb-3 ${quad.textColor} relative z-10`}>
                {quad.name}
              </h4>
              <p className={`text-sm ${quad.taglineColor} italic relative z-10`}>
                {quad.tagline}
              </p>

              {/* Hover detail - appears on hover */}
              {interactive && (
                <div
                  className="absolute inset-x-0 bottom-0 p-4 transition-all duration-300"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                    opacity: hoveredQuadrant === quad.id ? 1 : 0,
                    transform: hoveredQuadrant === quad.id ? 'translateY(0)' : 'translateY(16px)',
                  }}
                >
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
                relative overflow-hidden rounded-2xl p-6 md:p-8
                flex flex-col justify-center items-center text-center
                transition-all duration-300 ease-out
                ${interactive ? 'cursor-pointer' : ''}
                ${highlightQuadrant === quad.id ? 'ring-4 ring-blue-500 ring-offset-4' : ''}
              `}
              style={{
                minHeight: '220px',
                ...getQuadrantStyles(quad)
              }}
              onMouseEnter={() => interactive && setHoveredQuadrant(quad.id)}
              onMouseLeave={() => interactive && setHoveredQuadrant(null)}
            >
              {/* Subtle shine effect */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%)',
                }}
              />

              <h4 className={`text-base md:text-lg font-bold leading-tight mb-3 ${quad.textColor} relative z-10`}>
                {quad.name}
              </h4>
              <p className={`text-sm ${quad.taglineColor} italic relative z-10`}>
                {quad.tagline}
              </p>

              {/* Hover detail */}
              {interactive && (
                <div
                  className="absolute inset-x-0 bottom-0 p-4 transition-all duration-300"
                  style={{
                    background: 'linear-gradient(to top, rgba(30,39,73,0.8) 0%, transparent 100%)',
                    opacity: hoveredQuadrant === quad.id ? 1 : 0,
                    transform: hoveredQuadrant === quad.id ? 'translateY(0)' : 'translateY(16px)',
                  }}
                >
                  <p className="text-xs text-white/90 leading-relaxed">
                    {quad.hoverDetail}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* X-Axis Labels - Below Grid */}
        <div className="mt-8 flex justify-between items-center px-2">
          <span className="text-xs text-slate-400 font-medium">Event-Based</span>
          <span className="text-sm font-semibold tracking-widest text-slate-400 uppercase">
            PD Structure
          </span>
          <span className="text-xs text-slate-400 font-medium">System-Based</span>
        </div>

        {/* Diagonal Arrow (subtle) */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0.1 }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
            </marker>
          </defs>
          <line
            x1="18" y1="82" x2="82" y2="18"
            stroke="#64748b"
            strokeWidth="0.8"
            strokeDasharray="3,3"
            markerEnd="url(#arrowhead)"
          />
        </svg>
      </div>

      {/* Footer Note */}
      <p className="text-center text-sm mt-8 text-slate-500 italic">
        Most schools don't start in Embedded Practice — they move there over time.
      </p>

      {/* Mobile hint */}
      {interactive && (
        <p className="text-center text-xs mt-2 text-slate-400 md:hidden">
          Tap a quadrant to learn more
        </p>
      )}
    </div>
  );
}
