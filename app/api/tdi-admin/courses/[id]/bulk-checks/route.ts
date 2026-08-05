import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 300

function getHubServiceSupabase() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('Learning Hub Supabase not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

/**
 * GET /api/tdi-admin/courses/[id]/bulk-checks
 *
 * Returns engagement check coverage for all lessons in a course.
 * If id is "all", returns coverage across all courses.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getHubServiceSupabase()

    let lessonsQuery = supabase
      .from('hub_lessons')
      .select('id, title, content, transcript, module_id, hub_modules!inner(course_id, hub_courses!inner(id, title))')

    if (id !== 'all') {
      lessonsQuery = lessonsQuery.eq('hub_modules.course_id', id)
    }

    const { data: lessons, error } = await lessonsQuery

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get all quiz questions
    const lessonIds = (lessons || []).map((l) => l.id)
    const { data: questions } = await supabase
      .from('hub_quiz_questions')
      .select('lesson_id, question_type')
      .in('lesson_id', lessonIds.length > 0 ? lessonIds : ['none'])

    const questionsByLesson = new Map<string, Array<{ question_type: string }>>()
    questions?.forEach((q) => {
      const arr = questionsByLesson.get(q.lesson_id) || []
      arr.push(q)
      questionsByLesson.set(q.lesson_id, arr)
    })

    const results = (lessons || []).map((l) => {
      const content = l.content as Record<string, unknown> | null
      const course = (l as any).hub_modules?.hub_courses
      const lessonQuestions = questionsByLesson.get(l.id) || []
      const hasContent = !!(
        (content?.body_html && (content.body_html as string).length > 50) ||
        (content?.text && (content.text as string).length > 50) ||
        (content?.video_id) ||
        (l.transcript && (l.transcript as string).length > 50)
      )

      return {
        lesson_id: l.id,
        lesson_title: l.title,
        course_id: course?.id || '',
        course_title: course?.title || '',
        has_content: hasContent,
        has_video: !!(content?.video_id),
        has_transcript: !!(l.transcript && (l.transcript as string).length > 10),
        check_count: lessonQuestions.length,
        meets_minimum: lessonQuestions.length >= 4,
        breakdown: {
          comprehension: lessonQuestions.filter((q) => q.question_type === 'multiple_choice' || q.question_type === 'true_false').length,
          reflection: lessonQuestions.filter((q) => q.question_type === 'reflection').length,
          action_step: lessonQuestions.filter((q) => q.question_type === 'action_step').length,
          checkpoint: lessonQuestions.filter((q) => q.question_type === 'checkpoint').length,
        },
      }
    })

    const total = results.length
    const withContent = results.filter((r) => r.has_content).length
    const meetsMinimum = results.filter((r) => r.meets_minimum).length

    return NextResponse.json({
      lessons: results,
      total,
      with_content: withContent,
      meets_minimum: meetsMinimum,
      needs_checks: withContent - meetsMinimum,
      coverage_pct: withContent > 0 ? Math.round((meetsMinimum / withContent) * 100) : 0,
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

/**
 * POST /api/tdi-admin/courses/[id]/bulk-checks
 *
 * Generates AI engagement checks for all lessons in a course that need them.
 * Only generates for lessons with content (body, transcript, or video).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getHubServiceSupabase()

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 })
    }

    // Get all lessons for this course
    let lessonsQuery = supabase
      .from('hub_lessons')
      .select('id, title, type, content, transcript, module_id, hub_modules!inner(course_id)')

    if (id !== 'all') {
      lessonsQuery = lessonsQuery.eq('hub_modules.course_id', id)
    }

    const { data: lessons, error } = await lessonsQuery

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get existing question counts
    const lessonIds = (lessons || []).map((l) => l.id)
    const { data: existingQuestions } = await supabase
      .from('hub_quiz_questions')
      .select('lesson_id, sort_order')
      .in('lesson_id', lessonIds.length > 0 ? lessonIds : ['none'])

    const questionCounts = new Map<string, number>()
    const maxSortOrders = new Map<string, number>()
    existingQuestions?.forEach((q) => {
      questionCounts.set(q.lesson_id, (questionCounts.get(q.lesson_id) || 0) + 1)
      const current = maxSortOrders.get(q.lesson_id) ?? -1
      if (q.sort_order > current) maxSortOrders.set(q.lesson_id, q.sort_order)
    })

    // Filter to lessons that need checks
    const needsChecks = (lessons || []).filter((l) => {
      const content = l.content as Record<string, unknown> | null
      const hasContent = !!(
        (content?.body_html && (content.body_html as string).length > 50) ||
        (content?.text && (content.text as string).length > 50) ||
        (content?.markdown && (content.markdown as string).length > 50) ||
        (content?.video_id) ||
        (l.transcript && (l.transcript as string).length > 50)
      )
      return hasContent && (questionCounts.get(l.id) || 0) < 4
    })

    if (needsChecks.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All lessons already have sufficient engagement checks.',
        processed: 0,
        results: [],
      })
    }

    const client = new Anthropic({ apiKey })

    const results: Array<{
      lesson_id: string
      lesson_title: string
      status: 'generated' | 'failed' | 'skipped'
      checks_created: number
      error?: string
    }> = []

    for (const lesson of needsChecks) {
      const content = lesson.content as Record<string, unknown> | null
      const bodyHtml = (content?.body_html as string) || ''
      const bodyText = (content?.text as string) || ''
      const markdown = (content?.markdown as string) || ''
      const transcript = (lesson.transcript as string) || ''
      const lessonContent = bodyHtml || bodyText || markdown || transcript

      if (!lessonContent || lessonContent.trim().length < 50) {
        results.push({
          lesson_id: lesson.id,
          lesson_title: lesson.title,
          status: 'skipped',
          checks_created: 0,
        })
        continue
      }

      try {
        let sectionCount = 0
        if (bodyHtml) {
          const breakPattern = /(?=<h[23][^>]*>)|(?:<!--\s*section-break\s*-->)/gi
          const sections = bodyHtml.split(breakPattern).filter((s: string) => s.trim().length > 0)
          sectionCount = sections.length
        }

        const prompt = `You are an instructional designer for Teachers Deserve It, an educator professional development platform. Generate engagement checks for this lesson.

LESSON TITLE: ${lesson.title}
LESSON TYPE: ${lesson.type}
CONTENT SECTIONS: ${sectionCount}

CONTENT:
${lessonContent.substring(0, 8000)}

---

Generate exactly:
- 2 multiple choice comprehension checks (3-4 options, 1 correct)
- 1 reflection prompt (connects content to educator's own practice)
- 1 action step (specific classroom action they can try this week)
- 1 checkpoint (3-4 key takeaways)

Rules:
- Test real understanding, not surface recall
- Reflection should be personal: "Think about..." or "Consider a time when..."
- Action step must be specific enough to do tomorrow
- Tone: warm, professional, no emojis
- Explanations should teach WHY, not just confirm

${sectionCount > 1 ? `Position checks between sections (0-based content_position). Distribute evenly. Checkpoint goes at end (null).` : 'Set all content_position to null.'}

Return ONLY a JSON array. Each object:
{"question_text":"...","question_type":"multiple_choice"|"true_false"|"reflection"|"action_step"|"checkpoint","options":[...]|null,"correct_answer":"..."|null,"explanation":"..."|null,"content_position":number|null,"sort_order":number}

For multiple_choice: options = [{"text":"...","is_correct":boolean}]
For checkpoint: options = [{"text":"..."}] (takeaways)
For reflection/action_step: options = null

JSON array only, no markdown fences.`

        const response = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }],
        })

        const responseText = response.content
          .filter((block): block is Anthropic.TextBlock => block.type === 'text')
          .map((block) => block.text)
          .join('')

        const cleaned = responseText.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
        const questions = JSON.parse(cleaned)

        if (!Array.isArray(questions) || questions.length === 0) {
          results.push({
            lesson_id: lesson.id,
            lesson_title: lesson.title,
            status: 'failed',
            checks_created: 0,
            error: 'AI returned no questions',
          })
          continue
        }

        let nextSortOrder = (maxSortOrders.get(lesson.id) ?? -1) + 1

        const insertRows = questions.map((q: Record<string, unknown>) => ({
          lesson_id: lesson.id,
          question_text: q.question_text || '',
          question_type: q.question_type || 'multiple_choice',
          options: q.options || null,
          correct_answer: q.correct_answer || null,
          explanation: q.explanation || null,
          sort_order: q.sort_order ?? nextSortOrder++,
          content_position: q.content_position ?? null,
        }))

        const { data: created, error: insertError } = await supabase
          .from('hub_quiz_questions')
          .insert(insertRows)
          .select()

        if (insertError) {
          results.push({
            lesson_id: lesson.id,
            lesson_title: lesson.title,
            status: 'failed',
            checks_created: 0,
            error: insertError.message,
          })
        } else {
          results.push({
            lesson_id: lesson.id,
            lesson_title: lesson.title,
            status: 'generated',
            checks_created: created?.length || 0,
          })
        }
      } catch (err: unknown) {
        results.push({
          lesson_id: lesson.id,
          lesson_title: lesson.title,
          status: 'failed',
          checks_created: 0,
          error: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }

    const generated = results.filter((r) => r.status === 'generated').length
    const totalChecks = results.reduce((sum, r) => sum + r.checks_created, 0)
    const failed = results.filter((r) => r.status === 'failed').length

    return NextResponse.json({
      success: true,
      message: `Generated ${totalChecks} checks across ${generated} lessons. ${failed > 0 ? `${failed} failed.` : ''}`,
      processed: results.length,
      generated,
      total_checks: totalChecks,
      failed,
      results,
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
