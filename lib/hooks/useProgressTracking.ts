'use client';

import { useState, useEffect, useCallback } from 'react';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import { createCertificate } from '@/lib/certificate';

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
  totalChecks: number;
  completedChecks: number;
}

export interface CertificateInfo {
  verificationCode: string;
  pdHours: number;
}

interface UseProgressTrackingReturn {
  progress: CourseProgress;
  isLoading: boolean;
  error: string | null;
  certificateEarned: CertificateInfo | null;
  clearCertificateEarned: () => void;
  toggleLessonComplete: (lessonId: string) => Promise<boolean>;
  markLessonStatus: (lessonId: string, status: LessonStatus) => Promise<boolean>;
  refetch: () => Promise<void>;
}

interface CourseTotals {
  totalLessons: number;
  completedLessons: number;
  totalChecks: number;
  completedChecks: number;
  progressPct: number;
  isComplete: boolean;
  lessonProgress: Map<string, LessonProgress>;
}

/**
 * Read course progress straight from the database.
 *
 * Anything that decides completion must read from here rather than from React
 * state. The lesson page calls markLessonStatus and then refetch, in that
 * order, so a completion decided from state is computed before the refetch
 * lands and is short by whatever the learner just did on the current lesson.
 * In practice the final check-in of a course never counted: isComplete
 * requires exact equality, so it was never true, and the certificate was
 * never created. Every course was affected.
 *
 * is_active must stay in sync with the lesson player. getCourseQuestions
 * filters on it, so a deactivated question is never shown to the learner and
 * must not sit in the denominator.
 */
async function readCourseProgress(
  supabase: ReturnType<typeof getSupabase>,
  courseId: string,
  userId: string
): Promise<CourseTotals> {
  // Lessons hang off modules; hub_lessons.course_id is frequently null.
  const { data: modules, error: modulesError } = await supabase
    .from('hub_modules')
    .select('id')
    .eq('course_id', courseId);

  if (modulesError) throw modulesError;

  const moduleIds = (modules || []).map((m) => m.id);

  const { data: lessons, error: lessonsError } = moduleIds.length > 0
    ? await supabase.from('hub_lessons').select('id').in('module_id', moduleIds)
    : { data: [] as { id: string }[], error: null };

  if (lessonsError) throw lessonsError;

  const lessonIds = (lessons || []).map((l) => l.id);
  const totalLessons = lessonIds.length;
  const lessonFilter = lessonIds.length > 0 ? lessonIds : ['__none__'];

  const { data: progressData, error: progressError } = await supabase
    .from('hub_lesson_progress')
    .select('lesson_id, status, progress_pct, completed_at')
    .eq('user_id', userId)
    .in('lesson_id', lessonFilter);

  if (progressError && progressError.code !== 'PGRST116') throw progressError;

  const lessonProgress = new Map<string, LessonProgress>();
  lessonIds.forEach((id) => {
    lessonProgress.set(id, {
      lesson_id: id,
      status: 'not_started',
      progress_pct: 0,
      completed_at: null,
    });
  });

  let completedLessons = 0;
  progressData?.forEach((p) => {
    lessonProgress.set(p.lesson_id, {
      lesson_id: p.lesson_id,
      status: p.status as LessonStatus,
      progress_pct: p.progress_pct || 0,
      completed_at: p.completed_at,
    });
    if (p.status === 'completed') completedLessons++;
  });

  const { data: courseQuestions, error: questionsError } = await supabase
    .from('hub_quiz_questions')
    .select('id')
    .eq('is_active', true)
    .in('lesson_id', lessonFilter);

  if (questionsError) throw questionsError;

  const questionIds = (courseQuestions || []).map((q) => q.id);
  const totalChecks = questionIds.length;
  let completedChecks = 0;

  if (totalChecks > 0) {
    const { data: responses, error: responsesError } = await supabase
      .from('hub_quiz_responses')
      .select('question_id')
      .eq('user_id', userId)
      .in('question_id', questionIds);

    if (responsesError) throw responsesError;

    // Distinct questions answered. Duplicate rows for the same question must
    // not push completedChecks past totalChecks and fake a completion.
    completedChecks = new Set((responses || []).map((r) => r.question_id)).size;
  }

  const totalItems = totalLessons + totalChecks;
  const completedItems = completedLessons + completedChecks;

  return {
    totalLessons,
    completedLessons,
    totalChecks,
    completedChecks,
    progressPct: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
    isComplete: totalItems > 0 && completedItems >= totalItems,
    lessonProgress,
  };
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
    totalChecks: 0,
    completedChecks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certificateEarned, setCertificateEarned] = useState<CertificateInfo | null>(null);

  const clearCertificateEarned = () => setCertificateEarned(null);

  const updateEnrollmentProgress = useCallback(async (newProgressPct: number, isComplete: boolean) => {
    if (!courseId || !userId) return;

    const supabase = getSupabase();

    // This runs after every lesson update, so it fires again on any later
    // interaction with an already-finished course. Only the first transition
    // into completed should stamp completed_at and write the activity row.
    // Re-stamping would re-count an old completion in the weekly briefing and
    // inflate time-to-complete; a second activity row would inflate the
    // course-completions KPI, which counts rows without deduping.
    let alreadyComplete = false;
    if (isComplete) {
      const { data: existing } = await supabase
        .from('hub_enrollments')
        .select('status, completed_at')
        .eq('course_id', courseId)
        .eq('user_id', userId)
        .maybeSingle();
      alreadyComplete = existing?.status === 'completed' && !!existing?.completed_at;
    }

    const updateData: Record<string, unknown> = {
      progress_pct: newProgressPct,
      updated_at: new Date().toISOString(),
    };

    if (isComplete) {
      updateData.status = 'completed';
      if (!alreadyComplete) {
        updateData.completed_at = new Date().toISOString();
      }
    }

    await supabase
      .from('hub_enrollments')
      .update(updateData)
      .eq('course_id', courseId)
      .eq('user_id', userId);

    // Auto-generate certificate when course is completed
    if (isComplete) {
      // Log course completion to activity log. Supabase reports row-level
      // failures in `error` rather than throwing, so both paths need handling
      // or a broken insert disappears silently.
      if (!alreadyComplete) {
        try {
          const { error: logError } = await supabase.from('hub_activity_log').insert({
            user_id: userId,
            action: 'course_completed',
            metadata: {
              course_id: courseId,
              completed_at: new Date().toISOString(),
            },
          });
          if (logError) console.warn('[hub] course_completed log failed:', logError.message);
        } catch (err) {
          console.warn('[hub] course_completed log threw:', err);
        }
      }

      const result = await createCertificate(userId, courseId);
      // Do not gate on pdHours. Every published course currently has pd_hours
      // of 0, which is falsy, so requiring it here meant the certificate row
      // was written but the learner was never told they had earned it.
      if (result.success && result.verificationCode) {
        setCertificateEarned({
          verificationCode: result.verificationCode,
          pdHours: result.pdHours ?? 0,
        });
      }
    }
  }, [courseId, userId]);

  const fetchProgress = useCallback(async () => {
    if (!courseId || !userId) {
      setIsLoading(false);
      return;
    }

    try {
      const totals = await readCourseProgress(getSupabase(), courseId, userId);

      setProgress({
        totalLessons: totals.totalLessons,
        completedLessons: totals.completedLessons,
        progressPct: totals.progressPct,
        isComplete: totals.isComplete,
        lessonProgress: totals.lessonProgress,
        totalChecks: totals.totalChecks,
        completedChecks: totals.completedChecks,
      });

      // Self-heal. Learners who finished while completion was decided from
      // stale state have a finished course and no certificate, and revisiting
      // used to do nothing because only a lesson status change wrote anything.
      // updateEnrollmentProgress is idempotent: it will not re-stamp
      // completed_at and createCertificate returns early if one exists.
      if (totals.isComplete) {
        await updateEnrollmentProgress(totals.progressPct, true);
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError('Failed to load progress');
    } finally {
      setIsLoading(false);
    }
  }, [courseId, userId, updateEnrollmentProgress]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

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

      // Re-read from the database rather than adjusting React state.
      //
      // completedChecks in state is only ever set by fetchProgress on mount,
      // and the lesson page calls markLessonStatus before refetch. Deciding
      // completion from state therefore missed every check-in answered during
      // the current visit, so the last lesson of a course always came out one
      // item short. isComplete requires exact equality, so it never fired and
      // no certificate was ever created on any course.
      const totals = await readCourseProgress(supabase, courseId, userId);

      setProgress({
        totalLessons: totals.totalLessons,
        completedLessons: totals.completedLessons,
        progressPct: totals.progressPct,
        isComplete: totals.isComplete,
        lessonProgress: totals.lessonProgress,
        totalChecks: totals.totalChecks,
        completedChecks: totals.completedChecks,
      });

      await updateEnrollmentProgress(totals.progressPct, totals.isComplete);

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
    certificateEarned,
    clearCertificateEarned,
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
