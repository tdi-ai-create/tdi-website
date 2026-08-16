import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import { createCertificate } from '@/lib/certificate';

/**
 * POST /api/tdi-admin/certificates/backfill
 *
 * One-off repair for learners who finished a course while completion was being
 * decided from stale React state. Those enrollments have every lesson and every
 * answerable check-in done, but completed_at was never stamped and no
 * certificate was ever created.
 *
 * The hook fix makes this self-heal the next time the learner opens the course.
 * This exists for the ones who never come back.
 *
 * Body: { dryRun?: boolean }  — defaults to true. Nothing is written unless
 * dryRun is explicitly false.
 */

function getHubAdmin() {
  const url =
    process.env.LEARNING_HUB_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;

  if (!url || !key) throw new Error('Hub Supabase not configured');

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) return auth;

    const body = await request.json().catch(() => ({}));
    // Write only when explicitly told to. A missing or malformed body is a
    // dry run, never a live mutation.
    const dryRun = body?.dryRun !== false;

    const supabase = getHubAdmin();

    const { data: enrollments, error: enrollError } = await supabase
      .from('hub_enrollments')
      .select('id, user_id, course_id, progress_pct')
      .is('completed_at', null);

    if (enrollError) {
      return NextResponse.json({ error: enrollError.message }, { status: 500 });
    }

    const eligible: Array<{
      enrollmentId: string;
      userId: string;
      courseId: string;
      email: string | null;
      courseTitle: string | null;
      storedPct: number | null;
      lessons: number;
      checks: number;
      hadCertificate: boolean;
    }> = [];

    for (const e of enrollments || []) {
      const userId = e.user_id as string;
      const courseId = e.course_id as string;

      const { data: modules } = await supabase
        .from('hub_modules')
        .select('id')
        .eq('course_id', courseId);

      const moduleIds = (modules || []).map((m) => m.id);
      if (moduleIds.length === 0) continue;

      const { data: lessons } = await supabase
        .from('hub_lessons')
        .select('id')
        .in('module_id', moduleIds);

      const lessonIds = (lessons || []).map((l) => l.id);
      if (lessonIds.length === 0) continue;

      const { data: lessonProgress } = await supabase
        .from('hub_lesson_progress')
        .select('lesson_id')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .in('lesson_id', lessonIds);

      const doneLessons = new Set((lessonProgress || []).map((p) => p.lesson_id)).size;
      if (doneLessons < lessonIds.length) continue;

      // is_active only. A deactivated question is never shown to the learner
      // and must not be treated as outstanding work.
      const { data: questions } = await supabase
        .from('hub_quiz_questions')
        .select('id')
        .eq('is_active', true)
        .in('lesson_id', lessonIds);

      const questionIds = (questions || []).map((q) => q.id);
      let doneChecks = 0;

      if (questionIds.length > 0) {
        const { data: responses } = await supabase
          .from('hub_quiz_responses')
          .select('question_id')
          .eq('user_id', userId)
          .in('question_id', questionIds);
        doneChecks = new Set((responses || []).map((r) => r.question_id)).size;
      }

      if (doneChecks < questionIds.length) continue;

      const { data: profile } = await supabase
        .from('hub_profiles')
        .select('email')
        .eq('id', userId)
        .maybeSingle();

      const { data: course } = await supabase
        .from('hub_courses')
        .select('title, pd_hours')
        .eq('id', courseId)
        .maybeSingle();

      const { data: existingCert } = await supabase
        .from('hub_certificates')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();

      eligible.push({
        enrollmentId: e.id as string,
        userId,
        courseId,
        email: (profile?.email as string) ?? null,
        courseTitle: (course?.title as string) ?? null,
        storedPct: (e.progress_pct as number) ?? null,
        lessons: lessonIds.length,
        checks: questionIds.length,
        hadCertificate: !!existingCert,
      });
    }

    if (dryRun) {
      return NextResponse.json({
        dryRun: true,
        scanned: enrollments?.length ?? 0,
        eligible: eligible.length,
        certificatesToCreate: eligible.filter((x) => !x.hadCertificate).length,
        rows: eligible,
      });
    }

    const repaired: Array<Record<string, unknown>> = [];

    for (const item of eligible) {
      const now = new Date().toISOString();

      await supabase
        .from('hub_enrollments')
        .update({
          status: 'completed',
          progress_pct: 100,
          completed_at: now,
          updated_at: now,
        })
        .eq('id', item.enrollmentId);

      let verificationCode: string | null = null;

      if (!item.hadCertificate) {
        // Use the real path so the code stays unique and the learner is
        // actually notified. Passing the service-role client because the
        // default hub client is anon and RLS blocks it off a user session.
        const result = await createCertificate(item.userId, item.courseId, supabase);

        if (!result.success) {
          repaired.push({ ...item, certificateError: result.error ?? 'unknown' });
          continue;
        }

        verificationCode = result.verificationCode ?? null;
      }

      await supabase.from('hub_activity_log').insert({
        user_id: item.userId,
        action: 'course_completed',
        metadata: {
          course_id: item.courseId,
          completed_at: now,
          source: 'certificate_backfill',
        },
      });

      repaired.push({ ...item, verificationCode });
    }

    return NextResponse.json({
      dryRun: false,
      repaired: repaired.length,
      rows: repaired,
    });
  } catch (error) {
    console.error('[certificates/backfill] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
