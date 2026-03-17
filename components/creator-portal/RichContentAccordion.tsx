'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, ListChecks, Lightbulb, BookOpen, AlertTriangle, ArrowRight } from 'lucide-react';
import type { MilestoneRichContent } from '@/types/creator-portal';

interface RichContentAccordionProps {
  richContent: MilestoneRichContent | null;
}

// Section configuration with colors and icons
const sectionConfig = {
  what_to_do: {
    label: 'What To Do',
    icon: ListChecks,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-600',
    hoverBg: 'hover:bg-blue-100/50',
  },
  why_it_matters: {
    label: 'Why It Matters',
    icon: Lightbulb,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    iconColor: 'text-amber-600',
    hoverBg: 'hover:bg-amber-100/50',
  },
  examples: {
    label: 'Examples',
    icon: BookOpen,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-600',
    hoverBg: 'hover:bg-green-100/50',
  },
  watch_out_for: {
    label: 'Watch Out For',
    icon: AlertTriangle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-600',
    hoverBg: 'hover:bg-red-100/50',
  },
  whats_next: {
    label: "What's Next",
    icon: ArrowRight,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    iconColor: 'text-purple-600',
    hoverBg: 'hover:bg-purple-100/50',
  },
} as const;

type SectionKey = keyof typeof sectionConfig;

function AccordionSection({
  sectionKey,
  content,
}: {
  sectionKey: SectionKey;
  content: string[] | string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = sectionConfig[sectionKey];
  const Icon = config.icon;

  // Convert string to array for consistent rendering
  const contentArray = Array.isArray(content) ? content : [content];

  // Don't render if no content
  if (!content || (Array.isArray(content) && content.length === 0)) {
    return null;
  }

  return (
    <div className={`rounded-lg border ${config.borderColor} overflow-hidden`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between px-4 py-3 ${config.bgColor} ${config.hoverBg} transition-colors`}
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${config.iconColor}`} />
          <span className={`text-sm font-medium ${config.textColor}`}>
            {config.label}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className={`w-4 h-4 ${config.iconColor}`} />
        ) : (
          <ChevronDown className={`w-4 h-4 ${config.iconColor}`} />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 py-3 bg-white border-t border-gray-100">
          {sectionKey === 'whats_next' ? (
            // What's Next is a single string, render as paragraph
            <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
          ) : (
            // Other sections are arrays, render as list
            <ul className="space-y-2">
              {contentArray.map((item, index) => (
                <li key={index} className="text-sm text-gray-700 leading-relaxed flex items-start gap-2">
                  <span className={`${config.iconColor} mt-1.5 flex-shrink-0`}>
                    <svg className="w-1.5 h-1.5" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function RichContentAccordion({ richContent }: RichContentAccordionProps) {
  if (!richContent) {
    return null;
  }

  // Check if any section has content
  const hasContent =
    (richContent.what_to_do && richContent.what_to_do.length > 0) ||
    (richContent.why_it_matters && richContent.why_it_matters.length > 0) ||
    (richContent.examples && richContent.examples.length > 0) ||
    (richContent.watch_out_for && richContent.watch_out_for.length > 0) ||
    richContent.whats_next;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      {richContent.what_to_do && richContent.what_to_do.length > 0 && (
        <AccordionSection sectionKey="what_to_do" content={richContent.what_to_do} />
      )}
      {richContent.why_it_matters && richContent.why_it_matters.length > 0 && (
        <AccordionSection sectionKey="why_it_matters" content={richContent.why_it_matters} />
      )}
      {richContent.examples && richContent.examples.length > 0 && (
        <AccordionSection sectionKey="examples" content={richContent.examples} />
      )}
      {richContent.watch_out_for && richContent.watch_out_for.length > 0 && (
        <AccordionSection sectionKey="watch_out_for" content={richContent.watch_out_for} />
      )}
      {richContent.whats_next && (
        <AccordionSection sectionKey="whats_next" content={richContent.whats_next} />
      )}
    </div>
  );
}
