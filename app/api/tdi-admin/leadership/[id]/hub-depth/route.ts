import { NextRequest, NextResponse } from 'next/server';
import { getHubServiceClient, resolvePartnershipMembers } from '@/lib/hub/partnership-members';
import { isTDIAdmin } from '@/lib/partnership-portal-data';

/**
 * What a partnership's educators are actually doing in the Hub.
 *
 * The Leadership dashboard could show six counters. The Hub holds a great deal
 * more than that, and none of it has ever reached this page: which courses a
 * staff reaches for, what they ask in the community, how many recognitions
 * they have earned, what the quizzes say about them.
 *
 * Measured 26 Aug 2026 across the partner schools: 523 lesson progress records,
 * 106 community posts, 59 recognitions, 44 enrolments, 37 Vibe Checks, 22 quiz
 * results. All of it sitting behind routes that asked the wrong database.
 *
 * Two rules this route holds to.
 *
 * Activity means a person chose to do something. account_provisioned is written
 * when TDI creates the seat, and counting it made Roosevelt read as sixteen
 * active educators when the real number was one.
 *
 * Vibe Check data is aggregate only. The action step gate tells teachers "This
 * is yours. We will never share it." That promise is why the answers are
 * honest, and it does not survive a principal reading individual entries. Per
 * person rows here carry activity counts, never wellbeing.
 */

export const dynamic = 'force-dynamic';

const ENGAGEMENT_ACTIONS = [
  'hub_login',
  'lesson_viewed',
  'quick_win_viewed',
  'quick_win_saved',
  'checkin_completed',
  'practice_tool_completed',
  'course_completed',
  'resource_downloaded',
  'transcript_downloaded',
  'share_used',
  'tour_completed',
];

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const email = request.headers.get('x-user-email');
    if (!email || !(await isTDIAdmin(email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id: partnershipId } = await params;
    const hub = getHubServiceClient();
    const { userIds, matchedBy } = await resolvePartnershipMembers(partnershipId);

    if (userIds.length === 0) {
      return NextResponse.json({
        hasSeats: false,
        matchedBy,
        seats: 0,
        summary: null,
        courses: [],
        people: [],
      });
    }

    const [activityRes, enrolRes, lessonRes, qaRes, recogRes, quizRes, vibeRes, certRes, favRes, profileRes] =
      await Promise.all([
        hub.from('hub_activity_log').select('user_id, action, created_at').in('user_id', userIds).neq('action', 'account_provisioned'),
        hub.from('hub_enrollments').select('user_id, course_id').in('user_id', userIds),
        hub.from('hub_lesson_progress').select('user_id').in('user_id', userIds),
        hub.from('hub_qa_posts').select('user_id, parent_id').in('user_id', userIds),
        hub.from('hub_earned_recognitions').select('user_id, recognition_type').in('user_id', userIds),
        hub.from('hub_quiz_results').select('user_id, quiz_type, result_key').in('user_id', userIds),
        hub.from('hub_assessments').select('stress_score, question_category, created_at').in('user_id', userIds).eq('type', 'daily_check_in').not('stress_score', 'is', null),
        hub.from('hub_certificates').select('user_id').in('user_id', userIds),
        hub.from('hub_favorites').select('user_id').in('user_id', userIds),
        hub.from('hub_profiles').select('id, email, display_name').in('id', userIds),
      ]);

    for (const [name, res] of [
      ['hub_activity_log', activityRes], ['hub_enrollments', enrolRes], ['hub_lesson_progress', lessonRes],
      ['hub_qa_posts', qaRes], ['hub_earned_recognitions', recogRes], ['hub_quiz_results', quizRes],
      ['hub_assessments', vibeRes], ['hub_certificates', certRes], ['hub_favorites', favRes],
      ['hub_profiles', profileRes],
    ] as const) {
      // Surface rather than swallow. Half a picture presented as a whole one is
      // how a school gets told its staff are disengaged when they are not.
      if (res.error) {
        console.error(`[hub-depth] ${name} read failed:`, res.error.message);
        return NextResponse.json({ error: `${name}: ${res.error.message}` }, { status: 500 });
      }
    }

    const activity = activityRes.data ?? [];
    const engaged = activity.filter((a) => ENGAGEMENT_ACTIONS.includes(a.action as string));

    const courseIds = [...new Set((enrolRes.data ?? []).map((e) => e.course_id as string))];
    let courseTitles = new Map<string, string>();
    if (courseIds.length > 0) {
      const { data: courses } = await hub.from('hub_courses').select('id, title').in('id', courseIds);
      courseTitles = new Map((courses ?? []).map((c) => [c.id as string, c.title as string]));
    }

    const enrolByCourse = new Map<string, Set<string>>();
    for (const e of enrolRes.data ?? []) {
      const key = e.course_id as string;
      if (!enrolByCourse.has(key)) enrolByCourse.set(key, new Set());
      enrolByCourse.get(key)!.add(e.user_id as string);
    }
    const courses = [...enrolByCourse.entries()]
      .map(([id, users]) => ({ title: courseTitles.get(id) ?? 'Untitled course', enrolled: users.size }))
      .sort((a, b) => b.enrolled - a.enrolled || a.title.localeCompare(b.title));

    const count = (action: string) => engaged.filter((a) => a.action === action).length;
    const vibe = vibeRes.data ?? [];
    const avgStress = vibe.length
      ? Math.round((vibe.reduce((s, v) => s + Number(v.stress_score), 0) / vibe.length) * 10) / 10
      : null;

    const activeUsers = new Set(engaged.map((a) => a.user_id as string));
    const lastActivity = engaged.reduce<string | null>(
      (latest, a) => (!latest || (a.created_at as string) > latest ? (a.created_at as string) : latest),
      null
    );

    const profiles = new Map((profileRes.data ?? []).map((p) => [p.id as string, p]));
    const perUser = new Map<string, { lessons: number; quickWins: number; checkins: number; total: number; last: string | null }>();
    for (const a of engaged) {
      const uid = a.user_id as string;
      if (!perUser.has(uid)) perUser.set(uid, { lessons: 0, quickWins: 0, checkins: 0, total: 0, last: null });
      const row = perUser.get(uid)!;
      row.total++;
      if (a.action === 'lesson_viewed') row.lessons++;
      if (a.action === 'quick_win_viewed' || a.action === 'quick_win_saved') row.quickWins++;
      if (a.action === 'checkin_completed') row.checkins++;
      const at = a.created_at as string;
      if (!row.last || at > row.last) row.last = at;
    }

    const people = [...perUser.entries()]
      .map(([uid, row]) => ({
        email: (profiles.get(uid)?.email as string) ?? 'unknown',
        name: (profiles.get(uid)?.display_name as string) ?? null,
        ...row,
      }))
      .sort((a, b) => b.total - a.total);

    const quizzes = new Map<string, string[]>();
    for (const q of quizRes.data ?? []) {
      const type = String(q.quiz_type);
      if (!quizzes.has(type)) quizzes.set(type, []);
      const key = String(q.result_key);
      if (!quizzes.get(type)!.includes(key)) quizzes.get(type)!.push(key);
    }

    return NextResponse.json({
      hasSeats: true,
      matchedBy,
      seats: userIds.length,
      summary: {
        activeEducators: activeUsers.size,
        neverOpened: userIds.length - activeUsers.size,
        lessonsWorked: (lessonRes.data ?? []).length,
        coursesStarted: courseIds.length,
        lessonsViewed: count('lesson_viewed'),
        quickWinsOpened: count('quick_win_viewed'),
        coursesFinished: count('course_completed'),
        certificates: (certRes.data ?? []).length,
        toolsSaved: (favRes.data ?? []).length,
        communityPosts: (qaRes.data ?? []).length,
        questionsAsked: (qaRes.data ?? []).filter((q) => !q.parent_id).length,
        recognitions: (recogRes.data ?? []).length,
        // Aggregate only, deliberately. See the note at the top of this file.
        vibeChecks: vibe.length,
        vibeAverage: avgStress,
        lastActivity,
      },
      courses,
      quizzes: [...quizzes.entries()].map(([type, results]) => ({ type, results })),
      people,
    });
  } catch (error) {
    console.error('[hub-depth] failed:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
