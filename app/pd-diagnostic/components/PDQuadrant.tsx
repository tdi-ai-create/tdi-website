'use client';

import { useState } from 'react';

const quadrants = [
  {
    id: 'B',
    name: 'INSPIRATION-DRIVEN PD',
    tagline: 'High energy, short-term lift',
    bg: '#E8EEF4', // light slate blue
  },
  {
    id: 'D',
    name: 'EMBEDDED PRACTICE',
    tagline: 'Consistent support, sustained outcomes',
    bg: '#C9D6E3', // slightly darker - the "goal"
  },
  {
    id: 'A',
    name: 'COMPLIANCE-FOCUSED PD',
    tagline: 'Meets requirements, limited translation',
    bg: '#F1F3F5', // lightest gray
  },
  {
    id: 'C',
    name: 'FRAGMENTED GROWTH',
    tagline: 'Strong pockets, uneven experience',
    bg: '#E2E8F0', // light slate
  },
];

export default function PDQuadrant({
  highlightQuadrant,
  interactive = true,
}: {
  highlightQuadrant?: 'A' | 'B' | 'C' | 'D' | null;
  interactive?: boolean;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const getStyles = (id: string, bg: string) => {
    const isHighlighted = highlightQuadrant === id;
    const isDimmed = highlightQuadrant && highlightQuadrant !== id;
    const isHovered = hovered === id && interactive;

    return {
      backgroundColor: bg,
      transform: isHovered ? 'translateY(-2px)' : isHighlighted ? 'scale(1.02)' : 'none',
      opacity: isDimmed ? 0.4 : 1,
      boxShadow: isHovered
        ? '0 8px 20px rgba(0,0,0,0.08)'
        : isHighlighted
        ? '0 0 0 3px #3b82f6'
        : 'none',
      transition: 'all 0.2s ease',
    };
  };

  return (
    <div className="w-full max-w-2xl mx-auto">

      {/* MATRIX CONTAINER */}
      <div className="flex">

        {/* Y-AXIS LABEL (rotated, on left side) */}
        <div className="flex flex-col justify-center items-center w-10 mr-3">
          <span
            className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap"
            style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
            }}
          >
            Staff Coverage
          </span>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1">

          {/* Y-axis top label */}
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-[10px] text-slate-400">Whole-Staff</span>
            <span></span>
          </div>

          {/* THE 2x2 GRID with arrow overlay */}
          <div className="relative">

            {/* Grid */}
            <div className="grid grid-cols-2 gap-3">

              {/* TOP LEFT: Inspiration-Driven (B) */}
              <div
                className={`rounded-xl p-5 text-center min-h-[120px] flex flex-col justify-center ${interactive ? 'cursor-pointer' : ''}`}
                style={getStyles('B', quadrants[0].bg)}
                onMouseEnter={() => interactive && setHovered('B')}
                onMouseLeave={() => setHovered(null)}
              >
                <h4 className="text-sm font-bold text-slate-700 mb-1">
                  {quadrants[0].name}
                </h4>
                <p className="text-xs text-slate-500 italic">{quadrants[0].tagline}</p>
              </div>

              {/* TOP RIGHT: Embedded Practice (D) - slightly emphasized */}
              <div
                className={`rounded-xl p-5 text-center min-h-[120px] flex flex-col justify-center ${interactive ? 'cursor-pointer' : ''}`}
                style={getStyles('D', quadrants[1].bg)}
                onMouseEnter={() => interactive && setHovered('D')}
                onMouseLeave={() => setHovered(null)}
              >
                <h4 className="text-sm font-bold text-slate-700 mb-1">
                  {quadrants[1].name}
                </h4>
                <p className="text-xs text-slate-500 italic">{quadrants[1].tagline}</p>
              </div>

              {/* BOTTOM LEFT: Compliance-Focused (A) */}
              <div
                className={`rounded-xl p-5 text-center min-h-[120px] flex flex-col justify-center ${interactive ? 'cursor-pointer' : ''}`}
                style={getStyles('A', quadrants[2].bg)}
                onMouseEnter={() => interactive && setHovered('A')}
                onMouseLeave={() => setHovered(null)}
              >
                <h4 className="text-sm font-bold text-slate-700 mb-1">
                  {quadrants[2].name}
                </h4>
                <p className="text-xs text-slate-500 italic">{quadrants[2].tagline}</p>
              </div>

              {/* BOTTOM RIGHT: Fragmented Growth (C) */}
              <div
                className={`rounded-xl p-5 text-center min-h-[120px] flex flex-col justify-center ${interactive ? 'cursor-pointer' : ''}`}
                style={getStyles('C', quadrants[3].bg)}
                onMouseEnter={() => interactive && setHovered('C')}
                onMouseLeave={() => setHovered(null)}
              >
                <h4 className="text-sm font-bold text-slate-700 mb-1">
                  {quadrants[3].name}
                </h4>
                <p className="text-xs text-slate-500 italic">{quadrants[3].tagline}</p>
              </div>

            </div>

            {/* DIAGONAL ARROW OVERLAY */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                </marker>
              </defs>
              <line
                x1="15"
                y1="85"
                x2="85"
                y2="15"
                stroke="#94a3b8"
                strokeWidth="0.8"
                strokeDasharray="4,3"
                markerEnd="url(#arrowhead)"
                opacity="0.6"
              />
            </svg>

          </div>

          {/* Y-axis bottom label */}
          <div className="flex justify-between items-center mt-2 px-1">
            <span className="text-[10px] text-slate-400">Core-Focused</span>
            <span></span>
          </div>

          {/* X-AXIS */}
          <div className="mt-4 pt-3 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400">Event-Based</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                PD Structure
              </span>
              <span className="text-[10px] text-slate-400">System-Based</span>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-[11px] text-slate-400 italic mt-5">
        Most schools don't start in Embedded Practice — they move there over time.
      </p>
    </div>
  );
}
