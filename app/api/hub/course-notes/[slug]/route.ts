import { NextRequest, NextResponse } from 'next/server';
import { createHubServerClient as createSupabaseServerClient } from '@/lib/supabase-hub-server';

/**
 * GET /api/hub/course-notes/[slug]
 *
 * The reflections and plan an educator wrote in one course, as a PDF they can
 * keep. Separate from the certificate on purpose: the certificate is the
 * document handed to a principal, and a reflection printed on it stops being a
 * reflection and starts being a performance.
 *
 * Scoped to the session user. There is no way to request someone else's notes,
 * and no admin path into this route.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
    }

    const { data: course } = await supabase
      .from('hub_courses')
      .select('id, title')
      .eq('slug', slug)
      .single();

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Modules are the reliable path to a course's lessons.
    const { data: modules } = await supabase
      .from('hub_modules')
      .select('id, sort_order')
      .eq('course_id', course.id)
      .order('sort_order', { ascending: true });

    const moduleIds = (modules || []).map((m) => m.id);
    if (moduleIds.length === 0) {
      return NextResponse.json({ error: 'Nothing written yet' }, { status: 404 });
    }

    const { data: lessons } = await supabase
      .from('hub_lessons')
      .select('id, title, sort_order')
      .in('module_id', moduleIds)
      .order('sort_order', { ascending: true });

    const lessonIds = (lessons || []).map((l) => l.id);
    const { data: questions } = await supabase
      .from('hub_quiz_questions')
      .select('id, lesson_id, question_text, question_type, sort_order')
      .in('lesson_id', lessonIds)
      .eq('is_active', true);

    const written = (questions || []).filter(
      (q) => q.question_type === 'reflection' || q.question_type === 'action_step'
    );

    const { data: responses } = await supabase
      .from('hub_quiz_responses')
      .select('question_id, response')
      .eq('user_id', user.id)
      .in('question_id', written.map((q) => q.id));

    const answerBy = new Map((responses || []).map((r) => [r.question_id, r.response]));
    const lessonById = new Map((lessons || []).map((l) => [l.id, l]));

    const entries = written
      .map((q) => ({
        prompt: q.question_text,
        answer: (answerBy.get(q.id) || '').trim(),
        isPlan: q.question_type === 'action_step',
        lessonTitle: lessonById.get(q.lesson_id)?.title || '',
        order: lessonById.get(q.lesson_id)?.sort_order ?? 0,
      }))
      .filter((e) => e.answer.length > 0)
      .sort((a, b) => a.order - b.order);

    if (entries.length === 0) {
      return NextResponse.json({ error: 'Nothing written yet' }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from('hub_profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();

    const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let jsPDF: any;
    try {
      const mod = await import('jspdf');
      jsPDF = mod.jsPDF;
    } catch {
      return NextResponse.json({ course: course.title, entries }, { status: 200 });
    }

    const doc = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });
    const pageWidth = 8.5;
    const pageHeight = 11;
    const margin = 0.9;
    const width = pageWidth - margin * 2;
    let y = margin;

    const newPageIfNeeded = (needed: number) => {
      if (y + needed > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(146, 64, 14);
    doc.text('YOUR NOTES', margin, y);
    y += 0.32;

    doc.setFont('times', 'bold');
    doc.setFontSize(21);
    doc.setTextColor(30, 39, 73);
    const titleLines = doc.splitTextToSize(course.title, width);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 0.3 + 0.12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(
      name ? `Written by ${name}` : 'What you wrote as you worked through this course',
      margin,
      y
    );
    y += 0.26;

    doc.setDrawColor(232, 184, 75);
    doc.setLineWidth(0.02);
    doc.line(margin, y, margin + width, y);
    y += 0.42;

    for (const entry of entries) {
      newPageIfNeeded(1.6);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(entry.isPlan ? 146 : 107, entry.isPlan ? 64 : 114, entry.isPlan ? 14 : 128);
      doc.text(
        `${entry.isPlan ? 'YOUR PLAN' : 'REFLECTION'}${entry.lessonTitle ? `  ${entry.lessonTitle}` : ''}`.toUpperCase(),
        margin,
        y
      );
      y += 0.24;

      // The prompt, so a plan read weeks later is still legible.
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(120, 128, 145);
      const promptLines = doc.splitTextToSize(entry.prompt, width - 0.15);
      newPageIfNeeded(promptLines.length * 0.16 + 0.5);
      doc.text(promptLines, margin + 0.15, y);
      y += promptLines.length * 0.16 + 0.16;

      doc.setFont('times', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(42, 51, 72);
      const answerLines = doc.splitTextToSize(entry.answer, width);
      newPageIfNeeded(answerLines.length * 0.2 + 0.3);
      doc.text(answerLines, margin, y);
      y += answerLines.length * 0.2 + 0.5;
    }

    newPageIfNeeded(0.6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(156, 163, 175);
    doc.text('These are yours. Teachers Deserve It never shares them with your school.', margin, pageHeight - 0.6);

    const pdf = Buffer.from(doc.output('arraybuffer'));
    const filename = `${course.title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}-notes.pdf`;

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
