'use client';

import { useState } from 'react';

const quadrants = [
  {
    id: 'B',
    name: 'INSPIRATION-DRIVEN PD',
    tagline: 'High energy, short-term lift',
    position: 'top-left',
    bg: 'bg-blue-100',
    hoverBg: 'hover:bg-blue-150',
    textColor: 'text-slate-800',
  },
  {
    id: 'D',
    name: 'EMBEDDED PRACTICE',
    tagline: 'Consistent support, sustained outcomes',
    position: 'top-right',
    bg: 'bg-[#1B4965]',
    hoverBg: 'hover:bg-[#234d6b]',
    textColor: 'text-white',
  },
  {
    id: 'A',
    name: 'COMPLIANCE-FOCUSED PD',
    tagline: 'Meets requirements, limited translation',
    position: 'bottom-left',
    bg: 'bg-gray-100',
    hoverBg: 'hover:bg-gray-200',
    textColor: 'text-slate-800',
  },
  {
    id: 'C',
    name: 'FRAGMENTED GROWTH',
    tagline: 'Strong pockets, uneven experience',
    position: 'bottom-right',
    bg: 'bg-slate-200',
    hoverBg: 'hover:bg-slate-300',
    textColor: 'text-slate-800',
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

  const getQuadrantClass = (quad: typeof quadrants[0]) => {
    const isHighlighted = highlightQuadrant === quad.id;
    const isDimmed = highlightQuadrant && highlightQuadrant !== quad.id;
    const isHovered = hovered === quad.id && interactive;

    let classes = `
      rounded-2xl p-6 flex flex-col justify-center items-center text-center
      transition-all duration-300 ease-out
      ${quad.bg} ${quad.textColor}
    `;

    if (interactive) {
      classes += ` cursor-pointer ${quad.hoverBg}`;
    }

    if (isHovered) {
      classes += ' transform -translate-y-1 shadow-lg';
    }

    if (isHighlighted) {
      classes += ' ring-4 ring-blue-500 ring-offset-4 scale-105 z-10';
    }

    if (isDimmed) {
      classes += ' opacity-40';
    }

    return classes;
  };

  return (
    <div className="w-full max-w-xl mx-auto">

      {/* Y-AXIS LABEL: STAFF COVERAGE */}
      <div className="flex items-center mb-6">
        <div className="flex-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Staff Coverage
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>↑ Whole-Staff</span>
          </div>
        </div>
      </div>

      {/* THE 2x2 GRID */}
      <div className="grid grid-cols-2 gap-4">
        {/* Top Row */}
        {quadrants.filter(q => q.position.includes('top')).map((quad) => (
          <div
            key={quad.id}
            className={getQuadrantClass(quad)}
            style={{ minHeight: '140px' }}
            onMouseEnter={() => interactive && setHovered(quad.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <h4 className="text-sm md:text-base font-bold leading-tight mb-2">
              {quad.name}
            </h4>
            <p className={`text-xs md:text-sm italic ${quad.id === 'D' ? 'text-blue-200' : 'text-slate-500'}`}>
              {quad.tagline}
            </p>
          </div>
        ))}

        {/* Bottom Row */}
        {quadrants.filter(q => q.position.includes('bottom')).map((quad) => (
          <div
            key={quad.id}
            className={getQuadrantClass(quad)}
            style={{ minHeight: '140px' }}
            onMouseEnter={() => interactive && setHovered(quad.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <h4 className="text-sm md:text-base font-bold leading-tight mb-2">
              {quad.name}
            </h4>
            <p className="text-xs md:text-sm italic text-slate-500">
              {quad.tagline}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom Y-Axis label */}
      <div className="flex justify-between text-xs text-slate-400 mt-2">
        <span>↓ Core-Focused</span>
      </div>

      {/* X-AXIS LABEL: PD STRUCTURE */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Event-Based</span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            PD Structure →
          </span>
          <span className="text-xs text-slate-400">System-Based</span>
        </div>
      </div>

      {/* FOOTER NOTE */}
      <p className="text-center text-xs text-slate-400 italic mt-6">
        Most schools don't start in Embedded Practice — they move there over time.
      </p>
    </div>
  );
}
