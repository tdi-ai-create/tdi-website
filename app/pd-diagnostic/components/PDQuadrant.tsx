'use client';

import { useState } from 'react';
import { ClipboardCheck, Sparkles, Puzzle, Target } from 'lucide-react';

const quadrants = [
  {
    id: 'A',
    icon: ClipboardCheck,
    name: 'Compliance-Focused',
    tagline: 'Meets requirements, limited classroom translation',
    description: 'PD days happen. Boxes get checked. But Monday morning? Teachers are still on their own.',
    gradient: 'from-slate-100 to-slate-200',
    borderColor: 'border-slate-300',
    selectedGradient: 'from-slate-200 to-slate-300',
    iconColor: 'text-slate-500',
  },
  {
    id: 'B',
    icon: Sparkles,
    name: 'Inspiration-Driven',
    tagline: 'High energy, short-term lift',
    description: 'Everyone leaves PD days fired up. But by October? Back to old habits.',
    gradient: 'from-blue-50 to-indigo-100',
    borderColor: 'border-blue-300',
    selectedGradient: 'from-blue-100 to-indigo-200',
    iconColor: 'text-blue-500',
  },
  {
    id: 'C',
    icon: Puzzle,
    name: 'Fragmented Growth',
    tagline: 'Strong pockets, uneven experience',
    description: 'Some teams are thriving. Others? Still waiting for support that never comes.',
    gradient: 'from-amber-50 to-orange-100',
    borderColor: 'border-amber-300',
    selectedGradient: 'from-amber-100 to-orange-200',
    iconColor: 'text-amber-500',
  },
  {
    id: 'D',
    icon: Target,
    name: 'Embedded Practice',
    tagline: 'Consistent support, sustained outcomes',
    description: 'PD isn\'t an event — it\'s how your school operates. Everyone grows, all year.',
    gradient: 'from-emerald-50 to-teal-100',
    borderColor: 'border-emerald-300',
    selectedGradient: 'from-emerald-100 to-teal-200',
    iconColor: 'text-emerald-500',
  },
];

export default function PDQuadrant({
  highlightQuadrant,
  interactive = true,
  onSelect,
}: {
  highlightQuadrant?: 'A' | 'B' | 'C' | 'D' | null;
  interactive?: boolean;
  onSelect?: (id: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(highlightQuadrant || null);

  const handleClick = (id: string) => {
    if (!interactive) return;
    setSelected(id);
    onSelect?.(id);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">

      {/* Prompt - only show in interactive mode */}
      {interactive && (
        <div className="text-center mb-8">
          <p className="text-xl md:text-2xl text-slate-700 font-bold">
            Which one sounds most like your school? (Select One Below)
          </p>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quadrants.map((quad) => {
          const isSelected = selected === quad.id;
          const isHovered = hovered === quad.id;
          const isDimmed = selected && selected !== quad.id;
          const Icon = quad.icon;

          return (
            <div
              key={quad.id}
              onClick={() => handleClick(quad.id)}
              onMouseEnter={() => setHovered(quad.id)}
              onMouseLeave={() => setHovered(null)}
              className={`
                relative overflow-hidden rounded-2xl p-6
                border-2 transition-all duration-300 ease-out
                ${interactive ? 'cursor-pointer' : ''}
                ${isSelected ? quad.borderColor + ' shadow-lg' : 'border-transparent'}
                ${isDimmed ? 'opacity-50 scale-95' : ''}
                ${isHovered && !isSelected ? 'scale-[1.02] shadow-md' : ''}
                bg-gradient-to-br ${isSelected ? quad.selectedGradient : quad.gradient}
              `}
            >
              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center mb-4 ${quad.iconColor}`}>
                <Icon size={24} strokeWidth={2} />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                {quad.name}
              </h3>

              {/* Tagline */}
              <p className="text-sm text-slate-500 italic mb-3">
                {quad.tagline}
              </p>

              {/* Description */}
              <p className={`
                text-sm text-slate-600 leading-relaxed
                transition-all duration-300
                ${isHovered || isSelected ? 'opacity-100' : 'opacity-70'}
              `}>
                {quad.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Axis Labels - below the grid */}
      <div className="mt-8 pt-4 border-t border-slate-200">
        <div className="flex justify-between text-slate-600">
          <div className="text-center">
            <div className="text-base font-bold">← Event-Based PD</div>
            <div className="text-sm font-bold">Core staff only</div>
          </div>
          <div className="text-center">
            <div className="text-base font-bold">System-Based PD →</div>
            <div className="text-sm font-bold">Whole staff supported</div>
          </div>
        </div>
      </div>

      {/* Selection prompt */}
      {selected && (
        <div className="mt-6 text-center">
          <p className="text-slate-600 mb-4">
            Your true evaluation shows you are a <span className="font-semibold">{quadrants.find(q => q.id === selected)?.name}</span>
          </p>
          <p className="text-lg md:text-xl text-slate-700 font-bold">
            ↓ Take the full diagnostic below to confirm and see what this predicts
          </p>
        </div>
      )}

      {/* Footer note */}
      <p className="text-center text-xs text-slate-400 italic mt-6">
        Most schools don't start in Embedded Practice... they move there over time.
      </p>
    </div>
  );
}
