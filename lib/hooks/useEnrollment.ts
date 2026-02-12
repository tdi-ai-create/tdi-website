'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  status: 'active' | 'completed';
  progress_pct: number;
  completed_at: string | null;
}

interface UseEnrollmentReturn {
  enrollment: Enrollment | null;
  isEnrolled: boolean;
  isLoading: boolean;
  isEnrolling: boolean;
  error: string | null;
  enroll: () => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useEnrollment(courseId: string | null, userId: string | null): UseEnrollmentReturn {
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollment = useCallback(async () => {
    if (!courseId || !userId) {
      setIsLoading(false);
      return;
    }

    const supabase = getSupabase();

    try {
      const { data, error: fetchError } = await supabase
        .from('hub_enrollments')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is expected for new users
        console.error('Error fetching enrollment:', fetchError);
      }

      setEnrollment(data || null);
    } catch (err) {
      console.error('Error fetching enrollment:', err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, userId]);

  useEffect(() => {
    fetchEnrollment();
  }, [fetchEnrollment]);

  const enroll = async (): Promise<boolean> => {
    console.log('[Enrollment] Starting enrollment...', { courseId, userId });

    if (!courseId || !userId) {
      console.error('[Enrollment] Missing course or user information', { courseId, userId });
      setError('Missing course or user information');
      return false;
    }

    if (enrollment) {
      console.log('[Enrollment] Already enrolled');
      // Already enrolled
      return true;
    }

    setIsEnrolling(true);
    setError(null);

    const supabase = getSupabase();

    try {
      console.log('[Enrollment] Step 1: Creating enrollment record...');
      // Step 1: Create the enrollment
      const { data: newEnrollment, error: enrollError } = await supabase
        .from('hub_enrollments')
        .insert({
          user_id: userId,
          course_id: courseId,
          enrolled_at: new Date().toISOString(),
          status: 'active',
          progress_pct: 0,
        })
        .select()
        .single();

      console.log('[Enrollment] Insert result:', { newEnrollment, enrollError });

      if (enrollError) {
        // Check if it's a duplicate key error (already enrolled)
        if (enrollError.code === '23505') {
          console.log('[Enrollment] Duplicate - already enrolled, fetching existing...');
          // Fetch existing enrollment
          await fetchEnrollment();
          return true;
        }
        console.error('[Enrollment] Insert error:', enrollError);
        throw enrollError;
      }

      // Step 2: Get all lessons for this course (via modules)
      const { data: lessons, error: lessonsError } = await supabase
        .from('hub_lessons')
        .select('id')
        .eq('course_id', courseId);

      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
        // Don't fail enrollment, just log the error
      }

      // Step 3: Create lesson progress records for each lesson
      if (lessons && lessons.length > 0) {
        const progressRecords = lessons.map((lesson) => ({
          user_id: userId,
          lesson_id: lesson.id,
          status: 'not_started',
          progress_pct: 0,
        }));

        const { error: progressError } = await supabase
          .from('hub_lesson_progress')
          .insert(progressRecords);

        if (progressError) {
          console.error('Error creating lesson progress:', progressError);
          // Don't fail enrollment, just log the error
        }
      }

      setEnrollment(newEnrollment);
      return true;
    } catch (err) {
      console.error('Error enrolling:', err);
      setError('Failed to enroll. Please try again.');
      return false;
    } finally {
      setIsEnrolling(false);
    }
  };

  return {
    enrollment,
    isEnrolled: !!enrollment,
    isLoading,
    isEnrolling,
    error,
    enroll,
    refetch: fetchEnrollment,
  };
}

// Standalone function for use outside of React components
export async function enrollInCourse(courseId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  console.log('[enrollInCourse] Starting...', { courseId, userId });
  const supabase = getSupabase();

  try {
    // Check if already enrolled
    console.log('[enrollInCourse] Checking if already enrolled...');
    const { data: existing, error: checkError } = await supabase
      .from('hub_enrollments')
      .select('id')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .single();

    console.log('[enrollInCourse] Check result:', { existing, checkError });

    if (existing) {
      console.log('[enrollInCourse] Already enrolled, returning success');
      return { success: true };
    }

    // Create enrollment
    console.log('[enrollInCourse] Creating enrollment...');
    const { data: insertData, error: enrollError } = await supabase
      .from('hub_enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        enrolled_at: new Date().toISOString(),
        status: 'active',
        progress_pct: 0,
      })
      .select();

    console.log('[enrollInCourse] Insert result:', { insertData, enrollError });

    if (enrollError) {
      if (enrollError.code === '23505') {
        console.log('[enrollInCourse] Duplicate key - already enrolled');
        // Already enrolled
        return { success: true };
      }
      console.error('[enrollInCourse] Enrollment insert error:', enrollError);
      throw enrollError;
    }

    // Get lessons and create progress records
    console.log('[enrollInCourse] Getting lessons for progress records...');
    const { data: lessons, error: lessonsError } = await supabase
      .from('hub_lessons')
      .select('id')
      .eq('course_id', courseId);

    console.log('[enrollInCourse] Lessons result:', { lessons, lessonsError });

    if (lessons && lessons.length > 0) {
      const progressRecords = lessons.map((lesson) => ({
        user_id: userId,
        lesson_id: lesson.id,
        status: 'not_started',
        progress_pct: 0,
      }));

      console.log('[enrollInCourse] Creating progress records:', progressRecords.length);
      const { error: progressError } = await supabase.from('hub_lesson_progress').insert(progressRecords);
      console.log('[enrollInCourse] Progress insert result:', { progressError });
    }

    console.log('[enrollInCourse] Success!');
    return { success: true };
  } catch (err) {
    console.error('[enrollInCourse] Error:', err);
    return { success: false, error: 'Failed to enroll' };
  }
}
