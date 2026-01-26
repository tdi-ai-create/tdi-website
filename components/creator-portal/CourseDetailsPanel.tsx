'use client';

import { BookOpen, Users, Calendar, Tag } from 'lucide-react';
import type { Creator } from '@/types/creator-portal';

interface CourseDetailsPanelProps {
  creator: Creator;
}

export function CourseDetailsPanel({ creator }: CourseDetailsPanelProps) {
  const details = [
    {
      icon: BookOpen,
      label: 'Course Title',
      value: creator.course_title || 'Not set yet',
      isEmpty: !creator.course_title,
    },
    {
      icon: Users,
      label: 'Target Audience',
      value: creator.course_audience || 'Not set yet',
      isEmpty: !creator.course_audience,
    },
    {
      icon: Calendar,
      label: 'Target Launch',
      value: creator.target_launch_month || 'Not set yet',
      isEmpty: !creator.target_launch_month,
    },
    {
      icon: Tag,
      label: 'Your Discount Code',
      value: creator.discount_code || 'Coming soon',
      isEmpty: !creator.discount_code,
      isCode: true,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-[#1e2749] mb-4">Course Details</h3>

      <div className="space-y-4">
        {details.map((detail) => {
          const Icon = detail.icon;
          return (
            <div key={detail.label} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#80a4ed]/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-[#80a4ed]" />
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {detail.label}
                </p>
                <p
                  className={`text-sm mt-0.5 ${
                    detail.isEmpty
                      ? 'text-gray-400 italic'
                      : detail.isCode
                      ? 'font-mono bg-[#ffba06]/20 px-2 py-1 rounded text-[#1e2749] inline-block'
                      : 'text-[#1e2749] font-medium'
                  }`}
                >
                  {detail.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-gray-100">
        Need to update these details? Reach out to your TDI contact.
      </p>
    </div>
  );
}
