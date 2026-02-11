'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';

export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

export interface LessonProgress {
  lesson_id: string;
  status: LessonStatus;
  progress_pct: number;
  completed_at: string | null;
}

export interface CourseProgress {
  totalLessons: number;
  completedLessons: number;
  progressPct: number;
  isComplete: boolean;
  lessonProgress: Map<string, LessonProgress>;
}

interface UseProgressTrackingReturn {
  progress: CourseProgress;
  isLoading: boolean;
  error: string | null;
  toggleLessonComplete: (lessonId: string) => Promise<boolean>;
  markLessonStatus: (lessonId: string, status: LessonStatus) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useProgressTracking(
  courseId: string | null,
  userId: string | null
): UseProgressTrackingReturn {
  const [progress, setProgress] = useState<CourseProgress>({
    totalLessons: 0,
    completedLessons: 0,
    progressPct: 0,
    isComplete: false,
    lessonProgress: new Map(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!courseId || !userId) {
      setIsLoading(false);
      return;
    }

    const supabase = getSupabase();

    try {
      // Get all lessons for the course
      const { data: lessons, error: lessonsError } = await supabase
        .from('hub_lessons')
        .select('id')
        .eq('course_id', courseId);

      if (lessonsError) {
        throw lessonsError;
      }

      const totalLessons = lessons?.length || 0;
      const lessonIds = lessons?.map((l) => l.id) || [];

      // Get progress for these lessons
      const { data: progressData, error: progressError } = await supabase
        .from('hub_lesson_progress')
        .select('lesson_id, status, progress_pct, completed_at')
        .eq('user_id', userId)
        .in('lesson_id', lessonIds.length > 0 ? lessonIds : ['__none__']);

      if (progressError && progressError.code !== 'PGRST116') {
        throw progressError;
      }

      // Build progress map
      const lessonProgressMap = new Map<string, LessonProgress>();
      let completedCount = 0;

      // Initialize all lessons as not_started
      lessonIds.forEach((id) => {
        lessonProgressMap.set(id, {
          lesson_id: id,
          status: 'not_started',
          progress_pct: 0,
          completed_at: null,
        });
      });

      // Update with actual progress data
      progressData?.forEach((p) => {
        lessonProgressMap.set(p.lesson_id, {
          lesson_id: p.lesson_id,
          status: p.status as LessonStatus,
          progress_pct: p.progress_pct || 0,
          completed_at: p.completed_at,
        });
        if (p.status === 'completed') {
          completedCount++;
        }
      });

      const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
      const isComplete = totalLessons > 0 && completedCount === totalLessons;

      setProgress({
        totalLessons,
        completedLessons: completedCount,
        progressPct,
        isComplete,
        lessonProgress: lessonProgressMap,
      });
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError('Failed to load progress');
    } finally {
      setIsLoading(false);
    }
  }, [courseId, userId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const updateEnrollmentProgress = async (newProgressPct: number, isComplete: boolean) => {
    if (!courseId || !userId) return;

    const supabase = getSupabase();

    const updateData: Record<string, unknown> = {
      progress_pct: newProgressPct,
      updated_at: new Date().toISOString(),
    };

    if (isComplete) {
      updateData.status = 'completed';
      updateData.completed_at = new Date().toISOString();
    }

    await supabase
      .from('hub_enrollments')
      .update(updateData)
      .eq('course_id', courseId)
      .eq('user_id', userId);
  };

  const markLessonStatus = async (lessonId: string, status: LessonStatus): Promise<boolean> => {
    if (!courseId || !userId) {
      setError('Missing course or user information');
      return false;
    }

    const supabase = getSupabase();

    try {
      const now = new Date().toISOString();
      const completedAt = status === 'completed' ? now : null;

      // Upsert the lesson progress
      const { error: upsertError } = await supabase
        .from('hub_lesson_progress')
        .upsert(
          {
            user_id: userId,
            lesson_id: lessonId,
            status,
            progress_pct: status === 'completed' ? 100 : status === 'in_progress' ? 50 : 0,
            completed_at: completedAt,
            updated_at: now,
          },
          {
            onConflict: 'user_id,lesson_id',
          }
        );

      if (upsertError) {
        throw upsertError;
      }

      // Update local state
      const newLessonProgress = new Map(progress.lessonProgress);
      const currentLesson = newLessonProgress.get(lessonId);
      const wasCompleted = currentLesson?.status === 'completed';
      const isNowCompleted = status === 'completed';

      newLessonProgress.set(lessonId, {
        lesson_id: lessonId,
        status,
        progress_pct: status === 'completed' ? 100 : status === 'in_progress' ? 50 : 0,
        completed_at: completedAt,
      });

      // Recalculate course progress
      let newCompletedCount = progress.completedLessons;
      if (wasCompleted && !isNowCompleted) {
        newCompletedCount--;
      } else if (!wasCompleted && isNowCompleted) {
        newCompletedCount++;
      }

      const newProgressPct =
        progress.totalLessons > 0
          ? Math.round((newCompletedCount / progress.totalLessons) * 100)
          : 0;
      const isComplete = progress.totalLessons > 0 && newCompletedCount === progress.totalLessons;

      setProgress({
        totalLessons: progress.totalLessons,
        completedLessons: newCompletedCount,
        progressPct: newProgressPct,
        isComplete,
        lessonProgress: newLessonProgress,
      });

      // Update enrollment progress
      await updateEnrollmentProgress(newProgressPct, isComplete);

      return true;
    } catch (err) {
      console.error('Error updating lesson status:', err);
      setError('Failed to update progress');
      return false;
    }
  };

  const toggleLessonComplete = async (lessonId: string): Promise<boolean> => {
    const currentStatus = progress.lessonProgress.get(lessonId)?.status || 'not_started';
    const newStatus: LessonStatus = currentStatus === 'completed' ? 'not_started' : 'completed';
    return markLessonStatus(lessonId, newStatus);
  };

  return {
    progress,
    isLoading,
    error,
    toggleLessonComplete,
    markLessonStatus,
    refetch: fetchProgress,
  };
}

// Utility function to calculate progress from lesson data
export function calculateProgress(
  lessonProgress: { status: string }[]
): { completed: number; total: number; pct: number } {
  const total = lessonProgress.length;
  const completed = lessonProgress.filter((l) => l.status === 'completed').length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, pct };
}
