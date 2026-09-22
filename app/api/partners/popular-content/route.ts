import { NextResponse } from 'next/server';
import { getHubServiceClient } from '@/lib/hub/partnership-members';

/**
 * GET /api/partners/popular-content
 *
 * The narrow slice of Hub content data a partner dashboard is allowed to see:
 * the titles of the most used Quick Wins and the most enrolled courses, used
 * to write the Newsletter Ready report on the Reports tab.
 *
 * This exists because the partner dashboard used to read `api/tdi-admin/stats`
 * for the same two lists. That route answers with the whole internal gauge,
 * total users, the paid against free split, the engagement funnel, and a
 * breakdown naming every client school with its seat count. A school leader had
 * no business receiving any of that, and because the admin gate on that route
 * logged failures instead of blocking, neither did anybody else on the
 * internet.
 *
 * Titles only, deliberately. No view counts, no enrolment counts, no totals.
 * A raw count of other people is an internal gauge and does not belong in
 * anything outside TDI, and the newsletter only ever used the titles.
 */

export const dynamic = 'force-dynamic';

/** Small enough to be cheap, long enough that a leader clicking twice does not re-run it. */
export const revalidate = 300;

const QUICK_WIN_COUNT = 6;
const COURSE_COUNT = 6;

export async function GET() {
  try {
    const hub = getHubServiceClient();

    const [quickWinViews, enrolments] = await Promise.all([
      hub
        .from('hub_activity_log')
        .select('metadata')
        .eq('action', 'quick_win_viewed')
        .limit(5000),
      hub.from('hub_enrollments').select('course_id'),
    ]);

    // Quick Wins, ranked by views. Two metadata spellings exist in the log and
    // both are real, so both are counted, matching the admin route this
    // replaces.
    const qwCounts: Record<string, number> = {};
    (quickWinViews.data ?? []).forEach((row: { metadata: Record<string, unknown> | null }) => {
      const id = (row.metadata?.quick_win_id as string) || (row.metadata?.content_id as string);
      if (id) qwCounts[id] = (qwCounts[id] || 0) + 1;
    });
    const topQuickWinIds = Object.entries(qwCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, QUICK_WIN_COUNT)
      .map(([id]) => id);

    // Courses, ranked by enrolments.
    const courseCounts: Record<string, number> = {};
    (enrolments.data ?? []).forEach((row: { course_id: string | null }) => {
      if (row.course_id) courseCounts[row.course_id] = (courseCounts[row.course_id] || 0) + 1;
    });
    const topCourseIds = Object.entries(courseCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, COURSE_COUNT)
      .map(([id]) => id);

    const [qwNames, courseNames] = await Promise.all([
      topQuickWinIds.length
        ? hub.from('hub_quick_wins').select('id, title').in('id', topQuickWinIds)
        : Promise.resolve({ data: [] as { id: string; title: string }[] }),
      topCourseIds.length
        ? hub.from('hub_courses').select('id, title').in('id', topCourseIds)
        : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    ]);

    const qwTitles = new Map((qwNames.data ?? []).map((q: { id: string; title: string }) => [q.id, q.title]));
    const courseTitles = new Map((courseNames.data ?? []).map((c: { id: string; title: string }) => [c.id, c.title]));

    // Anything we cannot name is dropped rather than leaking a uuid into a
    // staff newsletter. Order is preserved, so ranking survives without any
    // number being published.
    return NextResponse.json({
      topQuickWins: topQuickWinIds.map((id) => qwTitles.get(id)).filter(Boolean),
      topCourses: topCourseIds.map((id) => courseTitles.get(id)).filter(Boolean),
    });
  } catch (error) {
    // Non-fatal by design. The newsletter has its own fallback copy, so a
    // failure here costs personalisation, not the report.
    console.error('[partners/popular-content]', error);
    return NextResponse.json({ topQuickWins: [], topCourses: [] });
  }
}
