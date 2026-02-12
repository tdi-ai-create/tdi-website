import { getSupabase } from '@/lib/supabase';

// Feedback types
export type FeedbackType = 'course_feedback' | 'general_satisfaction' | 'feature_request';

export interface FeedbackData {
  type: FeedbackType;
  rating?: number; // 1-5 for course feedback
  satisfaction?: 'great' | 'ok' | 'needs_work'; // for general satisfaction
  comment?: string;
  lessonId?: string; // for course feedback
  courseId?: string; // for course feedback
}

// localStorage keys
const FEEDBACK_PROMPTS_KEY = 'hub_feedback_prompts';
const SESSION_COUNT_KEY = 'hub_session_count';
const SESSION_FEEDBACK_KEY = 'hub_session_feedback_shown';

interface FeedbackPromptRecord {
  timestamp: number;
  type: FeedbackType;
}

// Get prompts shown this week
function getWeeklyPrompts(): FeedbackPromptRecord[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(FEEDBACK_PROMPTS_KEY);
    if (!stored) return [];

    const prompts: FeedbackPromptRecord[] = JSON.parse(stored);
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Filter to only this week's prompts
    return prompts.filter(p => p.timestamp > oneWeekAgo);
  } catch {
    return [];
  }
}

// Record that a prompt was shown
export function recordPromptShown(type: FeedbackType): void {
  if (typeof window === 'undefined') return;

  try {
    const prompts = getWeeklyPrompts();
    prompts.push({ timestamp: Date.now(), type });
    localStorage.setItem(FEEDBACK_PROMPTS_KEY, JSON.stringify(prompts));

    // Mark this session as having shown feedback
    sessionStorage.setItem(SESSION_FEEDBACK_KEY, 'true');
  } catch {
    // Ignore storage errors
  }
}

// Check if feedback was already shown this session
export function wasPromptShownThisSession(): boolean {
  if (typeof window === 'undefined') return true;
  return sessionStorage.getItem(SESSION_FEEDBACK_KEY) === 'true';
}

// Get session count
export function getSessionCount(): number {
  if (typeof window === 'undefined') return 0;

  try {
    return parseInt(localStorage.getItem(SESSION_COUNT_KEY) || '0', 10);
  } catch {
    return 0;
  }
}

// Increment session count (call on app mount)
export function incrementSessionCount(): void {
  if (typeof window === 'undefined') return;

  try {
    const current = getSessionCount();
    localStorage.setItem(SESSION_COUNT_KEY, String(current + 1));
  } catch {
    // Ignore storage errors
  }
}

// Check if we can show a feedback prompt
export function canShowFeedbackPrompt(isMomentModeActive: boolean): boolean {
  if (typeof window === 'undefined') return false;

  // Never show during Moment Mode
  if (isMomentModeActive) return false;

  // Never show on first visit (wait until 2nd session)
  const sessionCount = getSessionCount();
  if (sessionCount < 2) return false;

  // Max 1 feedback prompt per session
  if (wasPromptShownThisSession()) return false;

  // Max 3 feedback prompts per week
  const weeklyPrompts = getWeeklyPrompts();
  if (weeklyPrompts.length >= 3) return false;

  return true;
}

// Determine which feedback type to show
export function getNextFeedbackType(context?: {
  justCompletedLesson?: boolean;
  lessonId?: string;
  courseId?: string;
}): { type: FeedbackType; context?: { lessonId?: string; courseId?: string } } | null {
  const sessionCount = getSessionCount();
  const weeklyPrompts = getWeeklyPrompts();

  // If just completed a lesson, show course feedback
  if (context?.justCompletedLesson && context.lessonId) {
    // Check if we already showed course feedback for this lesson recently
    const recentCourseFeedback = weeklyPrompts.filter(p => p.type === 'course_feedback');
    if (recentCourseFeedback.length < 2) {
      return {
        type: 'course_feedback',
        context: { lessonId: context.lessonId, courseId: context.courseId }
      };
    }
  }

  // Feature request only after 5+ sessions
  if (sessionCount >= 5) {
    const recentFeatureRequests = weeklyPrompts.filter(p => p.type === 'feature_request');
    if (recentFeatureRequests.length === 0) {
      return { type: 'feature_request' };
    }
  }

  // General satisfaction (random during browsing)
  const recentSatisfaction = weeklyPrompts.filter(p => p.type === 'general_satisfaction');
  if (recentSatisfaction.length === 0) {
    return { type: 'general_satisfaction' };
  }

  // Rotate through types we haven't shown recently
  const typeCounts: Record<FeedbackType, number> = {
    course_feedback: weeklyPrompts.filter(p => p.type === 'course_feedback').length,
    general_satisfaction: weeklyPrompts.filter(p => p.type === 'general_satisfaction').length,
    feature_request: weeklyPrompts.filter(p => p.type === 'feature_request').length,
  };

  // Pick the least shown type
  const sortedTypes = Object.entries(typeCounts)
    .filter(([type]) => type !== 'feature_request' || sessionCount >= 5)
    .sort((a, b) => a[1] - b[1]);

  if (sortedTypes.length > 0) {
    return { type: sortedTypes[0][0] as FeedbackType };
  }

  return { type: 'general_satisfaction' };
}

// Submit feedback to the database
export async function submitFeedback(
  userId: string,
  data: FeedbackData
): Promise<boolean> {
  const supabase = getSupabase();

  try {
    const { error } = await supabase
      .from('hub_activity_log')
      .insert({
        user_id: userId,
        action: 'feedback',
        metadata: {
          type: data.type,
          rating: data.rating,
          satisfaction: data.satisfaction,
          comment: data.comment || null,
          lesson_id: data.lessonId || null,
          course_id: data.courseId || null,
          submitted_at: new Date().toISOString(),
        },
      });

    return !error;
  } catch {
    return false;
  }
}

// Get feedback stats for admin dashboard
export async function getAdminFeedbackStats() {
  const supabase = getSupabase();

  try {
    const { data: feedbackData } = await supabase
      .from('hub_activity_log')
      .select('metadata, created_at')
      .eq('action', 'feedback')
      .order('created_at', { ascending: false })
      .limit(500);

    if (!feedbackData) return null;

    // Calculate course rating average
    const courseRatings = feedbackData
      .filter(f => (f.metadata as { type?: string })?.type === 'course_feedback')
      .map(f => (f.metadata as { rating?: number })?.rating)
      .filter((r): r is number => typeof r === 'number');

    const avgCourseRating = courseRatings.length > 0
      ? (courseRatings.reduce((a, b) => a + b, 0) / courseRatings.length).toFixed(1)
      : null;

    // Calculate satisfaction breakdown
    const satisfactionData = feedbackData
      .filter(f => (f.metadata as { type?: string })?.type === 'general_satisfaction')
      .map(f => (f.metadata as { satisfaction?: string })?.satisfaction)
      .filter((s): s is string => typeof s === 'string');

    const satisfactionBreakdown = {
      great: satisfactionData.filter(s => s === 'great').length,
      ok: satisfactionData.filter(s => s === 'ok').length,
      needs_work: satisfactionData.filter(s => s === 'needs_work').length,
      total: satisfactionData.length,
    };

    // Get recent comments (last 20)
    const recentComments = feedbackData
      .filter(f => (f.metadata as { comment?: string })?.comment)
      .slice(0, 20)
      .map(f => ({
        type: (f.metadata as { type?: string })?.type,
        comment: (f.metadata as { comment?: string })?.comment,
        rating: (f.metadata as { rating?: number })?.rating,
        satisfaction: (f.metadata as { satisfaction?: string })?.satisfaction,
        created_at: f.created_at,
      }));

    return {
      avgCourseRating,
      courseRatingsCount: courseRatings.length,
      satisfactionBreakdown,
      recentComments,
      totalFeedback: feedbackData.length,
    };
  } catch {
    return null;
  }
}
