'use client';

import { useState } from 'react';
import { ClipboardCheck, Sparkles, Puzzle, Target, ChevronDown } from 'lucide-react';

interface QuadrantDeepDiveProps {
  onSectionExpand?: (sectionId: string) => void;
}

const quadrants = [
  {
    id: 'compliance',
    icon: ClipboardCheck,
    title: 'Compliance-Focused PD',
    subtitle: null,
    tagline: 'Meets requirements, limited classroom translation',
    gradient: 'from-slate-100 to-slate-200',
    borderColor: 'border-slate-400',
    iconColor: 'text-slate-600',
    iconBg: 'bg-slate-100',
    whatItLooksLike: `PD happens on those five days a year. Everyone sits through it. Then Monday comes and... nothing changes. The content focuses on required initiatives and accountability timelines. Documentation is strong. Boxes get checked. But the connection between what happens in PD and what happens in classrooms? That's where things fall apart.`,
    whatLeadersObserve: `Attendance is high because it's mandatory. But when you walk classrooms the week after PD, you see wildly different implementations. Some teachers try the new strategies. Others go right back to what they were doing before. Specialists and support staff often operate with completely different expectations because they weren't included in the planning.`,
    whatThisPredicts: `Flat assessment scores year after year. Persistent achievement gaps that nobody can explain. Higher turnover among early-career teachers who feel unsupported. And that feeling among your staff that PD is something to endure, not something that actually helps them.`,
  },
  {
    id: 'inspiration',
    icon: Sparkles,
    title: 'Inspiration-Driven PD',
    subtitle: null,
    tagline: 'High energy, short-term lift',
    gradient: 'from-blue-50 to-indigo-100',
    borderColor: 'border-blue-400',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    whatItLooksLike: `Your whole-staff PD days are designed to motivate. You bring in great speakers. The sessions are engaging. People leave feeling excited about teaching again. But here's the thing: follow-through support is limited. There's no coaching structure. No check-ins. No way to help teachers actually implement what they learned.`,
    whatLeadersObserve: `Right after PD, there's genuine momentum. Teachers are trying new things. Conversations in the lounge are positive. But by October? Old habits creep back in. The same topics get retrained year after year because nothing ever sticks. You start to wonder if inspiration alone is enough.`,
    whatThisPredicts: `Temporary enthusiasm without lasting change. Teachers feel inspired in the moment but unsure how to apply it when they're back in their classrooms with 28 kids and a pile of grading. You end up in repeated cycles of retraining the same concepts.`,
  },
  {
    id: 'fragmented',
    icon: Puzzle,
    title: 'Fragmented Growth',
    subtitle: null,
    tagline: 'Strong pockets, uneven experience',
    gradient: 'from-amber-50 to-orange-100',
    borderColor: 'border-amber-400',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
    whatItLooksLike: `You have ongoing coaching or PLCs for some teams. Usually core subjects like math and ELA. Those teachers are growing. They have support structures. But specialists? Paraprofessionals? Support staff? They receive minimal aligned support. Some people are thriving while others are still waiting for help that never comes.`,
    whatLeadersObserve: `Clear growth in certain classrooms. You can point to specific teachers who have transformed their practice. But walk down the hall and the variation is striking. You have islands of excellence, but the student experience depends entirely on which teacher they get. That's not equity. That's luck.`,
    whatThisPredicts: `Strong results in coached areas. But gaps widen for students served by unsupported staff. When something works, it's nearly impossible to scale because you don't have the infrastructure to spread it. Your best practices stay trapped in individual classrooms.`,
  },
  {
    id: 'embedded',
    icon: Target,
    title: 'Embedded Practice',
    subtitle: '(The Goal)',
    tagline: 'Consistent support, sustained outcomes',
    gradient: 'from-emerald-50 to-teal-100',
    borderColor: 'border-emerald-400',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
    whatItLooksLike: `PD isn't an event. It's how your school operates. Learning is ongoing and accessible year-round. All staff receive role-specific support, not just classroom teachers. Common instructional frameworks are used building-wide, and everyone speaks the same language about teaching and learning.`,
    whatLeadersObserve: `Consistent evidence of implementation across classrooms. When you walk the building, you see the same strategies showing up everywhere, adapted for different contexts but clearly connected. Teachers feel supported, not just trained. They have someone to turn to when things get hard.`,
    whatThisPredicts: `Sustainable improvement that doesn't disappear when one strong teacher leaves. Stronger culture because everyone is growing together. Better retention because teachers feel valued and supported. Progress without initiative overload because you're building on what works instead of starting over every year.`,
  },
];

export default function QuadrantDeepDive({ onSectionExpand }: QuadrantDeepDiveProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, Record<string, boolean>>>({});

  const toggleSection = (quadrantId: string, section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [quadrantId]: {
        ...prev[quadrantId],
        [section]: !prev[quadrantId]?.[section],
      },
    }));
    onSectionExpand?.(`${quadrantId}_${section}`);
  };

  const isExpanded = (quadrantId: string, section: string) => {
    return expandedSections[quadrantId]?.[section] ?? false;
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
            Understanding Each Type
          </h2>
          <p className="text-center text-lg mb-12" style={{ color: '#1e2749', opacity: 0.7 }}>
            Click to expand and learn more about each quadrant.
          </p>

          <div className="space-y-8">
            {quadrants.map((quad) => {
              const Icon = quad.icon;
              return (
                <div
                  key={quad.id}
                  id={quad.id}
                  className={`rounded-2xl p-6 md:p-8 bg-gradient-to-br ${quad.gradient} border-2 ${quad.borderColor} scroll-mt-24`}
                >
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-xl ${quad.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={quad.iconColor} size={24} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold" style={{ color: '#1e2749' }}>
                        {quad.title}
                        {quad.subtitle && (
                          <span className="text-lg font-normal ml-2" style={{ color: '#1e2749', opacity: 0.6 }}>
                            {quad.subtitle}
                          </span>
                        )}
                      </h3>
                      <p className="text-sm italic" style={{ color: '#1e2749', opacity: 0.7 }}>
                        {quad.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Expandable Sections */}
                  <div className="space-y-4">
                    {/* What it looks like */}
                    <div className="bg-white/60 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection(quad.id, 'looks')}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/80 transition-colors"
                      >
                        <span className="font-semibold" style={{ color: '#1e2749' }}>
                          What it looks like
                        </span>
                        <ChevronDown
                          className={`transition-transform ${isExpanded(quad.id, 'looks') ? 'rotate-180' : ''}`}
                          style={{ color: '#1e2749' }}
                          size={20}
                        />
                      </button>
                      {isExpanded(quad.id, 'looks') && (
                        <div className="px-4 pb-4">
                          <p className="text-sm leading-relaxed" style={{ color: '#1e2749', opacity: 0.8 }}>
                            {quad.whatItLooksLike}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* What leaders observe */}
                    <div className="bg-white/60 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection(quad.id, 'observe')}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/80 transition-colors"
                      >
                        <span className="font-semibold" style={{ color: '#1e2749' }}>
                          What leaders typically observe
                        </span>
                        <ChevronDown
                          className={`transition-transform ${isExpanded(quad.id, 'observe') ? 'rotate-180' : ''}`}
                          style={{ color: '#1e2749' }}
                          size={20}
                        />
                      </button>
                      {isExpanded(quad.id, 'observe') && (
                        <div className="px-4 pb-4">
                          <p className="text-sm leading-relaxed" style={{ color: '#1e2749', opacity: 0.8 }}>
                            {quad.whatLeadersObserve}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* What this predicts */}
                    <div className="bg-white/60 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection(quad.id, 'predicts')}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/80 transition-colors"
                      >
                        <span className="font-semibold" style={{ color: '#1e2749' }}>
                          What this commonly predicts
                        </span>
                        <ChevronDown
                          className={`transition-transform ${isExpanded(quad.id, 'predicts') ? 'rotate-180' : ''}`}
                          style={{ color: '#1e2749' }}
                          size={20}
                        />
                      </button>
                      {isExpanded(quad.id, 'predicts') && (
                        <div className="px-4 pb-4">
                          <p className="text-sm leading-relaxed" style={{ color: '#1e2749', opacity: 0.8 }}>
                            {quad.whatThisPredicts}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
