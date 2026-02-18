'use client';

import Link from 'next/link';
import { PenLine, Package, GraduationCap, Clock, HelpCircle } from 'lucide-react';

// Types
interface EnrichedCreator {
  id: string;
  name: string;
  email: string;
  course_title: string | null;
  content_path: string | null;
  current_phase: string;
  currentMilestoneName: string | null;
  waitingOn: 'creator' | 'tdi' | 'stalled' | 'launched';
  isStalled: boolean;
  lastActivityDate: string;
  progressPercentage: number;
  created_at: string;
  post_launch_notes?: string | null;
}

interface CreatorSwimlaneProps {
  creators: EnrichedCreator[];
  filterPath: string;
  filterWaitingOn: string;
}

// Phase definitions with order
const phases = [
  { key: 'onboarding', label: 'Onboarding', color: 'bg-[#1e2749]' },
  { key: 'agreement', label: 'Agreement', color: 'bg-[#3d5a99]' },
  { key: 'course_design', label: 'Prep & Resources', color: 'bg-[#5b7bb8]' },
  { key: 'test_prep', label: 'Production', color: 'bg-[#F5A623]' },
  { key: 'launch', label: 'Launch', color: 'bg-green-500' },
  { key: 'published', label: 'Published', color: 'bg-emerald-600' },
];

// Get days since date
function getDaysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

// Content path badge helper
function getPathBadge(path: string | null) {
  switch (path) {
    case 'blog':
      return { icon: <PenLine className="w-3 h-3" />, label: 'Blog', color: 'bg-blue-100 text-blue-700' };
    case 'download':
      return { icon: <Package className="w-3 h-3" />, label: 'Download', color: 'bg-green-100 text-green-700' };
    case 'course':
      return { icon: <GraduationCap className="w-3 h-3" />, label: 'Course', color: 'bg-purple-100 text-purple-700' };
    default:
      return { icon: <HelpCircle className="w-3 h-3" />, label: 'Not Set', color: 'bg-gray-100 text-gray-500' };
  }
}

export default function CreatorSwimlane({ creators, filterPath, filterWaitingOn }: CreatorSwimlaneProps) {
  // Filter creators
  let filteredCreators = [...creators];

  if (filterPath !== 'all') {
    if (filterPath === 'notSet') {
      filteredCreators = filteredCreators.filter((c) => !c.content_path);
    } else {
      filteredCreators = filteredCreators.filter((c) => c.content_path === filterPath);
    }
  }

  if (filterWaitingOn !== 'all') {
    filteredCreators = filteredCreators.filter((c) => c.waitingOn === filterWaitingOn);
  }

  // Group creators by phase
  const creatorsByPhase: Record<string, EnrichedCreator[]> = {};
  phases.forEach((p) => {
    creatorsByPhase[p.key] = [];
  });

  filteredCreators.forEach((creator) => {
    // Published = 100% complete
    if (creator.progressPercentage === 100) {
      creatorsByPhase['published'].push(creator);
    } else {
      const phase = creator.current_phase;
      if (creatorsByPhase[phase]) {
        creatorsByPhase[phase].push(creator);
      } else {
        // Fallback to onboarding if unknown phase
        creatorsByPhase['onboarding'].push(creator);
      }
    }
  });

  // Sort within each phase by days in phase (longest first)
  Object.keys(creatorsByPhase).forEach((phaseKey) => {
    creatorsByPhase[phaseKey].sort((a, b) => {
      const daysA = getDaysSince(a.lastActivityDate);
      const daysB = getDaysSince(b.lastActivityDate);
      return daysB - daysA; // Longest first
    });
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Swimlane Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#1e2749]">Creator Pipeline</h2>
        <p className="text-sm text-gray-500">{filteredCreators.length} creators</p>
      </div>

      {/* Swimlane Columns */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {phases.map((phase) => {
          const phaseCreators = creatorsByPhase[phase.key];
          const count = phaseCreators.length;

          return (
            <div
              key={phase.key}
              className="flex-shrink-0 w-64 bg-gray-50 rounded-lg"
            >
              {/* Column Header */}
              <div className={`${phase.color} text-white px-3 py-2 rounded-t-lg flex items-center justify-between`}>
                <span className="font-medium text-sm">{phase.label}</span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-medium">
                  {count}
                </span>
              </div>

              {/* Cards Container */}
              <div className="p-2 space-y-2 min-h-[200px] max-h-[500px] overflow-y-auto">
                {count === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No creators</p>
                ) : (
                  phaseCreators.map((creator) => {
                    const pathBadge = getPathBadge(creator.content_path);
                    const daysInPhase = getDaysSince(creator.lastActivityDate);
                    const isWaitingOnTeam = creator.waitingOn === 'tdi';

                    return (
                      <Link
                        key={creator.id}
                        href={`/admin/creators/${creator.id}`}
                        className={`block bg-white rounded-lg p-3 border transition-all hover:shadow-md ${
                          isWaitingOnTeam
                            ? 'border-amber-300 bg-amber-50/50'
                            : creator.isStalled
                            ? 'border-red-300 bg-red-50/50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* Creator Name & Avatar */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-full bg-[#1e2749] text-white flex items-center justify-center text-xs font-medium flex-shrink-0">
                            {creator.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-sm text-[#1e2749] truncate">
                            {creator.name}
                          </span>
                        </div>

                        {/* Content Path Badge */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full ${pathBadge.color}`}>
                            {pathBadge.icon}
                            {pathBadge.label}
                          </span>
                          {isWaitingOnTeam && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                              <Clock className="w-2.5 h-2.5" />
                              Team
                            </span>
                          )}
                        </div>

                        {/* Current Milestone */}
                        {creator.currentMilestoneName && phase.key !== 'published' && (
                          <p className="text-xs text-gray-600 truncate mb-1">
                            {creator.currentMilestoneName}
                          </p>
                        )}

                        {/* Post-launch notes for Published cards */}
                        {phase.key === 'published' && creator.post_launch_notes && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mb-1">
                            <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                            <span className="truncate">{creator.post_launch_notes}</span>
                          </div>
                        )}

                        {/* Days in phase indicator */}
                        <div className="flex items-center justify-between text-[10px]">
                          <span className={`${
                            daysInPhase > 14 ? 'text-red-500' : daysInPhase > 7 ? 'text-amber-500' : 'text-gray-400'
                          }`}>
                            {daysInPhase === 0 ? 'Today' : daysInPhase === 1 ? '1 day' : `${daysInPhase} days`}
                          </span>
                          {phase.key === 'published' && creator.course_title && (
                            <span className="text-green-600 truncate max-w-[100px]" title={creator.course_title}>
                              {creator.course_title}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded border-2 border-amber-300 bg-amber-50"></span>
          Waiting on Team
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded border-2 border-red-300 bg-red-50"></span>
          Stalled (14+ days)
        </span>
      </div>
    </div>
  );
}
