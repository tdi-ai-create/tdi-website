'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ProductionLesson {
  id: string;
  title: string;
  type: string;
  video_id?: string | null;
  content?: Record<string, unknown>;
}

interface ProductionModule {
  id: string;
  title: string;
  lessons: ProductionLesson[];
}

interface ProductionDashboardProps {
  course: {
    modules: ProductionModule[];
  };
}

function getVideoId(lesson: ProductionLesson): string | null {
  // Check top-level video_id first
  if (lesson.video_id) return lesson.video_id;
  // Check inside content JSONB
  if (lesson.content && typeof lesson.content === 'object' && 'video_id' in lesson.content) {
    return (lesson.content as Record<string, unknown>).video_id as string | null;
  }
  return null;
}

export default function ProductionDashboard({ course }: ProductionDashboardProps) {
  const [expanded, setExpanded] = useState(true);

  // Collect all video-type lessons across modules
  const videoLessons: Array<{ lesson: ProductionLesson; moduleName: string; hasVideo: boolean }> = [];
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      if (lesson.type === 'video') {
        videoLessons.push({
          lesson,
          moduleName: mod.title,
          hasVideo: !!getVideoId(lesson),
        });
      }
    }
  }

  const totalVideo = videoLessons.length;
  const withVideo = videoLessons.filter((l) => l.hasVideo).length;
  const percentage = totalVideo > 0 ? Math.round((withVideo / totalVideo) * 100) : 0;

  // Group by module for display
  const moduleGroups: Array<{ title: string; lessons: typeof videoLessons }> = [];
  let currentModule = '';
  for (const item of videoLessons) {
    if (item.moduleName !== currentModule) {
      currentModule = item.moduleName;
      moduleGroups.push({ title: currentModule, lessons: [] });
    }
    moduleGroups[moduleGroups.length - 1].lessons.push(item);
  }

  if (totalVideo === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">Production Progress</h3>
          <span className="text-xs font-medium text-gray-500">
            {withVideo} of {totalVideo} video lessons have videos
          </span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: percentage === 100 ? '#D1FAE5' : '#E0F7F6',
              color: percentage === 100 ? '#065F46' : '#00857F',
            }}
          >
            {percentage}%
          </span>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
        )}
      </button>

      {/* Progress bar */}
      <div className="px-5 pb-3">
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${percentage}%`,
              backgroundColor: '#00B5AD',
            }}
          />
        </div>
      </div>

      {/* Checklist */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4">
          {moduleGroups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {group.title}
              </p>
              <div className="space-y-1.5">
                {group.lessons.map(({ lesson, hasVideo }) => (
                  <div key={lesson.id} className="flex items-center gap-2.5">
                    {hasVideo ? (
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#10B981' }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    ) : (
                      <span
                        className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                        style={{ borderColor: '#EF4444' }}
                      />
                    )}
                    <span className={`text-sm ${hasVideo ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                      {lesson.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
