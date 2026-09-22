import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import { GOAL_TO_CATEGORY, goalLabel, type GoalKey } from '@/lib/hub/goals';

export interface RecommendedCourse {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  pd_hours: number;
  estimated_minutes: number;
  thumbnail_url?: string;
  reason: string;
}

export interface RecommendationsResult {
  courses: RecommendedCourse[];
  reasons: string[];
  /**
   * True when at least one returned course was chosen by a real rule (stress,
   * goal or role) rather than falling through to the curated default.
   *
   * The home page uses this to pick its heading. A reader we know nothing about
   * yet is shown "From the Hub library", not "Next for you", because claiming
   * personalisation we cannot back is the habit that produced the
   * "Popular with teachers" label this file just lost.
   */
  personalized: boolean;
}

/**
 * `hub_courses.category` stores slugs: classroom-management, communication,
 * leadership, stress-&-wellness, time-savers.
 *
 * Every rule in this file used to compare those against Title Case literals
 * ('Stress & Wellness', 'Leadership'), so no comparison could ever be true.
 * All four rules fell through to the default branch and every reader got the
 * same arbitrary three courses. Normalising both sides means the maps above
 * can stay readable and a future casing change cannot silently kill scoring
 * again.
 */
function normalizeCategory(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase().replace(/\s+/g, '-');
}

/** Which rule chose a course. 'default' means none did. */
type Signal = 'stress' | 'goal' | 'role' | 'default';

/**
 * The order slots are filled in. Stress first so a reader having a hard week
 * still sees a wellness course at the top of the band.
 */
const SIGNAL_ORDER: Signal[] = ['stress', 'goal', 'role'];

/**
 * Get personalized course recommendations for a user
 * Rule-based recommendation logic (no AI needed)
 */
export async function getRecommendations(userId: string): Promise<RecommendationsResult> {
  const supabase = getSupabase();

  // Gather user data in parallel
  const [
    { data: profile },
    { data: latestCheckIn },
    { data: enrollments },
  ] = await Promise.all([
    // Role, and the goals onboarding actually writes.
    //
    // This used to read goals from the `hub_user_goals` table, which has zero
    // rows across the whole Hub. Onboarding stores them on the profile instead,
    // where 199 people have at least one. Same bug as the stress score above:
    // a rule reading a location nothing writes to.
    supabase
      .from('hub_profiles')
      .select('role, onboarding_data')
      .eq('id', userId)
      .single(),
    // Get latest stress score. The value lives in `stress_score`; the `score`
    // column this used to read is null on all 533 daily_check_in rows, so the
    // stress rule below could never fire.
    supabase
      .from('hub_assessments')
      .select('stress_score')
      .eq('user_id', userId)
      .eq('type', 'daily_check_in')
      .order('created_at', { ascending: false })
      .limit(1),
    // Get user's enrolled courses (both active and completed)
    supabase
      .from('hub_enrollments')
      .select('course_id')
      .eq('user_id', userId),
  ]);

  // Get IDs of courses to exclude
  const excludedCourseIds = enrollments?.map((e) => e.course_id) || [];

  // Get all published courses
  const { data: allCourses } = await supabase
    .from('hub_courses')
    .select('id, slug, title, description, category, pd_hours, estimated_minutes, thumbnail_url')
    .eq('is_published', true);

  if (!allCourses || allCourses.length === 0) {
    return { courses: [], reasons: [], personalized: false };
  }

  // Filter out already enrolled courses
  const availableCourses = allCourses.filter((c) => !excludedCourseIds.includes(c.id));

  if (availableCourses.length === 0) {
    return { courses: [], reasons: [], personalized: false };
  }

  // Score and rank courses based on rules
  const scoredCourses: { course: typeof availableCourses[0]; score: number; reason: string; signal: Signal }[] = [];

  const stressScore = latestCheckIn?.[0]?.stress_score;
  const userRole = profile?.role;
  const onboardingData = profile?.onboarding_data as Record<string, unknown> | undefined;
  const userGoals = (onboardingData?.goals as string[] | undefined) ?? [];

  // Goal wording and goal-to-category both live in lib/hub/goals.ts now.
  //
  // They used to be hand-written here, and the wording drifted: this file
  // called `team_growth` "grow your team" while the tile the educator actually
  // pressed said "Grow as a leader", so a chip named a goal they never chose.
  // Quoting their own words back to them is the point, so there is one source.
  // Map roles to categories.
  //
  // The keys are the six values the onboarding and profile pickers actually
  // write (see the Role union in app/hub/onboarding/page.tsx), plus the legacy
  // 'leader'. The previous map keyed on new_teacher, student_teacher, admin and
  // instructional_coach, none of which this Hub has ever stored, and had no
  // entry at all for classroom_teacher: 526 of the 676 people active in the
  // last 90 days. 'other' is deliberately absent. It tells us nothing, so those
  // readers fall through to the curated default rather than being handed a
  // category we invented for them.
  const roleToCategoryMap: Record<string, string> = {
    'classroom_teacher': 'classroom-management',
    'para': 'classroom-management',
    'coach': 'leadership',
    'school_leader': 'leadership',
    'district_staff': 'leadership',
    'leader': 'leadership',
  };

  for (const course of availableCourses) {
    const courseCategory = normalizeCategory(course.category);
    let score = 0;
    let reason = '';
    let signal: Signal = 'default';

    // Rule 1: High stress - prioritize wellness (highest priority)
    // stress_score is a 1 to 5 scale, so 4 and 5 are the stressed end.
    if (stressScore && stressScore >= 4 && courseCategory === normalizeCategory('stress-&-wellness')) {
      score += 100;
      reason = 'Based on your Vibe Check';
      signal = 'stress';
    }

    // Rule 2: Match to user's goals
    for (const goal of userGoals) {
      const matchedCategory = GOAL_TO_CATEGORY[goal as GoalKey];
      if (matchedCategory && courseCategory === normalizeCategory(matchedCategory)) {
        score += 50;
        if (!reason) {
          // Their own words, not a paraphrase of them.
          reason = `Your goal: ${goalLabel(goal)}`;
          signal = 'goal';
        }
        break; // Only count one goal match per course
      }
    }

    // Rule 3: Match to user's role
    if (userRole) {
      const matchedCategory = roleToCategoryMap[userRole];
      if (matchedCategory && courseCategory === normalizeCategory(matchedCategory)) {
        score += 30;
        if (!reason) {
          reason = 'Recommended for your role';
          signal = 'role';
        }
      }
    }

    // Default reason for courses that match nothing specific.
    //
    // This used to read 'Popular with teachers', which counted nothing. It was
    // the fallback string on rules that always failed, so every reader was
    // shown a popularity claim built from no data. This file has no view or
    // enrolment counts in scope, so the honest label is curation, matching the
    // "Written for" wording the home page bands already use.
    if (!reason && score === 0) {
      reason = 'Chosen from the Hub library';
      score = 1; // Small base score
    }

    scoredCourses.push({ course, score, reason, signal });
  }

  // Take the best course per signal rather than the top three by score.
  //
  // Sorting by score alone let the stress rule, weighted 100, take all three
  // slots. We publish exactly three wellness courses, so every stressed
  // educator in the Hub received the same three under a heading claiming they
  // were chosen for them: a weaker version of the "Popular with teachers"
  // problem this change exists to remove. It would also have made the quiz
  // signal invisible to precisely the readers who need it most.
  //
  // Stress still takes the first slot whenever it fires, so someone having a
  // hard week still opens the Hub to a wellness course. They just also see
  // what we know about their goal and their role.
  scoredCourses.sort((a, b) => b.score - a.score);

  const picked: typeof scoredCourses = [];
  const takenIds = new Set<string>();

  for (const signalName of SIGNAL_ORDER) {
    const best = scoredCourses.find(
      (sc) => sc.signal === signalName && !takenIds.has(sc.course.id)
    );
    if (best) {
      picked.push(best);
      takenIds.add(best.course.id);
    }
  }

  // Fill any remaining slots from what is left, best score first. A reader with
  // only one signal still gets a full band.
  for (const sc of scoredCourses) {
    if (picked.length >= 3) break;
    if (takenIds.has(sc.course.id)) continue;
    picked.push(sc);
    takenIds.add(sc.course.id);
  }

  const topCourses = picked.slice(0, 3);

  // Anything above the base score of 1 was picked by a real rule.
  const personalized = topCourses.some((sc) => sc.score > 1);

  return {
    courses: topCourses.map((sc) => ({
      ...sc.course,
      reason: sc.reason,
    })),
    reasons: topCourses.map((sc) => sc.reason),
    personalized,
  };
}

/**
 * Check if user has completed onboarding (needed to show recommendations)
 */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  const supabase = getSupabase();

  const { data } = await supabase
    .from('hub_profiles')
    .select('onboarding_completed')
    .eq('id', userId)
    .single();

  return data?.onboarding_completed === true;
}
