'use client';

import { Sparkles } from 'lucide-react';
import type { Creator } from '@/types/creator-portal';

interface CreatorDashboardHeaderProps {
  creator: Creator;
  completedMilestones: number;
  totalMilestones: number;
  progressPercentage: number;
}

export function CreatorDashboardHeader({
  creator,
  completedMilestones,
  totalMilestones,
  progressPercentage,
}: CreatorDashboardHeaderProps) {
  // Get first name for greeting
  const firstName = creator.name.split(' ')[0];

  // Determine greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Progress circle dimensions
  const circleSize = 120;
  const strokeWidth = 8;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="bg-gradient-to-r from-[#1e2749] to-[#2a3459] rounded-2xl p-6 md:p-8 text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex-grow">
          <div className="flex items-center gap-2 text-[#ffba06] mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">Creator Portal</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold">
            {greeting}, {firstName}!
          </h1>

          {creator.course_title ? (
            <p className="text-white/80 mt-2 text-lg">
              Working on: <span className="text-white font-medium">{creator.course_title}</span>
            </p>
          ) : (
            <p className="text-white/80 mt-2">
              Let&apos;s get your course set up!
            </p>
          )}

          <p className="text-white/60 text-sm mt-4">
            You&apos;ve completed {completedMilestones} of {totalMilestones} milestones.
            {progressPercentage === 100
              ? " Congratulations on completing your course journey!"
              : progressPercentage >= 75
              ? " You're almost there!"
              : progressPercentage >= 50
              ? " Great progress, keep it up!"
              : progressPercentage >= 25
              ? " You're making good progress!"
              : " Let's get started!"}
          </p>
        </div>

        <div className="flex-shrink-0 flex justify-center">
          <div className="relative" style={{ width: circleSize, height: circleSize }}>
            <svg
              className="transform -rotate-90"
              width={circleSize}
              height={circleSize}
            >
              {/* Background circle */}
              <circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                stroke="#ffba06"
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{progressPercentage}%</span>
              <span className="text-xs text-white/60">Complete</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
