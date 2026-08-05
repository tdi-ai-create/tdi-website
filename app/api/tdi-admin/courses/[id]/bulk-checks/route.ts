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
 * Returns engagement check coverage at the COURSE level.
 * Each course should have 5 check-ins total (not per lesson).
 * If id is "all", returns coverage across all courses.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getHubServiceSupabase()

    // Get all courses (or one)
    let coursesQuery = supabase
      .from('hub_courses')
      .select('id, title')

    if (id !== 'all') {
      coursesQuery = coursesQuery.eq('id', id)
    }

    const { data: courses, error: coursesError } = await coursesQuery
    if (coursesError) return NextResponse.json({ error: coursesError.message }, { status: 500 })

    // Get all lessons with their course mapping
    const courseIds = (courses || []).map((c) => c.id)
    const { data: lessons } = await supabase
      .from('hub_lessons')
      .select('id, title, content, transcript, module_id, hub_modules!inner(course_id)')
      .in('hub_modules.course_id', courseIds.length > 0 ? courseIds : ['none'])

    // Get all quiz questions for these lessons
    const lessonIds = (lessons || []).map((l) => l.id)
    const { data: questions } = await supabase
      .from('hub_quiz_questions')
      .select('lesson_id, question_type')
      .in('lesson_id', lessonIds.length > 0 ? lessonIds : ['none'])

    // Count checks per course
    const lessonToCourse = new Map<string, string>()
    lessons?.forEach((l) => {
      const courseId = (l as any).hub_modules?.course_id
      if (courseId) lessonToCourse.set(l.id, courseId)
    })

    const courseCheckCounts = new Map<string, number>()
    questions?.forEach((q) => {
      const courseId = lessonToCourse.get(q.lesson_id)
      if (courseId) {
        courseCheckCounts.set(courseId, (courseCheckCounts.get(courseId) || 0) + 1)
      }
    })

    // Check which courses have content (at least one lesson with content)
    const courseHasContent = new Map<string, boolean>()
    const courseLessonCount = new Map<string, number>()
    lessons?.forEach((l) => {
      const courseId = (l as any).hub_modules?.course_id
      if (!courseId) return
      courseLessonCount.set(courseId, (courseLessonCount.get(courseId) || 0) + 1)
      const content = l.content as Record<string, unknown> | null
      const hasContent = !!(
        (content?.body_html && (content.body_html as string).length > 50) ||
        (content?.text && (content.text as string).length > 50) ||
        (content?.video_id) ||
        (l.transcript && (l.transcript as string).length > 50)
      )
      if (hasContent) courseHasContent.set(courseId, true)
    })

    const results = (courses || []).map((c) => {
      const checkCount = courseCheckCounts.get(c.id) || 0
      const hasContent = courseHasContent.get(c.id) || false
      const lessonCount = courseLessonCount.get(c.id) || 0
      return {
        course_id: c.id,
        course_title: c.title,
        lesson_count: lessonCount,
        has_content: hasContent,
        check_count: checkCount,
        meets_minimum: checkCount >= 5,
      }
    })

    const total = results.length
    const withContent = results.filter((r) => r.has_content).length
    const meetsMinimum = results.filter((r) => r.meets_minimum).length

    return NextResponse.json({
      courses: results,
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
 * Generates 5 AI engagement checks per COURSE (not per lesson).
 * Synthesizes content across all lessons to create course-level checks.
 * Assigns checks to the first lesson with content for DB storage.
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

    // Get courses
    let coursesQuery = supabase
      .from('hub_courses')
      .select('id, title, category, description')

    if (id !== 'all') {
      coursesQuery = coursesQuery.eq('id', id)
    }

    const { data: courses, error: coursesError } = await coursesQuery
    if (coursesError) return NextResponse.json({ error: coursesError.message }, { status: 500 })

    // Get all lessons for these courses
    const courseIds = (courses || []).map((c) => c.id)
    const { data: allLessons, error: lessonsError } = await supabase
      .from('hub_lessons')
      .select('id, title, type, content, transcript, module_id, hub_modules!inner(course_id)')
      .in('hub_modules.course_id', courseIds.length > 0 ? courseIds : ['none'])
      .order('sort_order', { ascending: true })

    if (lessonsError) return NextResponse.json({ error: lessonsError.message }, { status: 500 })

    // Group lessons by course
    const lessonsByCourse = new Map<string, typeof allLessons>()
    allLessons?.forEach((l) => {
      const courseId = (l as any).hub_modules?.course_id
      if (!courseId) return
      const arr = lessonsByCourse.get(courseId) || []
      arr.push(l)
      lessonsByCourse.set(courseId, arr)
    })

    // Get existing check counts per course
    const allLessonIds = (allLessons || []).map((l) => l.id)
    const { data: existingQuestions } = await supabase
      .from('hub_quiz_questions')
      .select('lesson_id, sort_order')
      .in('lesson_id', allLessonIds.length > 0 ? allLessonIds : ['none'])

    const lessonToCourse = new Map<string, string>()
    allLessons?.forEach((l) => {
      const courseId = (l as any).hub_modules?.course_id
      if (courseId) lessonToCourse.set(l.id, courseId)
    })

    const courseCheckCounts = new Map<string, number>()
    existingQuestions?.forEach((q) => {
      const courseId = lessonToCourse.get(q.lesson_id)
      if (courseId) {
        courseCheckCounts.set(courseId, (courseCheckCounts.get(courseId) || 0) + 1)
      }
    })

    // Filter to courses that need checks (< 5 total) and have content
    const needsChecks = (courses || []).filter((c) => {
      const lessons = lessonsByCourse.get(c.id) || []
      const hasContent = lessons.some((l) => {
        const content = l.content as Record<string, unknown> | null
        return !!(
          (content?.body_html && (content.body_html as string).length > 50) ||
          (content?.text && (content.text as string).length > 50) ||
          (content?.markdown && (content.markdown as string).length > 50) ||
          (content?.video_id) ||
          (l.transcript && (l.transcript as string).length > 50)
        )
      })
      return hasContent && (courseCheckCounts.get(c.id) || 0) < 5
    })

    if (needsChecks.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All courses already have check-ins.',
        processed: 0,
        results: [],
      })
    }

    const client = new Anthropic({ apiKey })

    const results: Array<{
      course_id: string
      course_title: string
      status: 'generated' | 'failed' | 'skipped'
      checks_created: number
      error?: string
    }> = []

    for (const course of needsChecks) {
      const lessons = lessonsByCourse.get(course.id) || []

      // Build a summary of the course content from all lessons
      const lessonSummaries: string[] = []
      let firstLessonWithContent: string | null = null

      for (const lesson of lessons) {
        const content = lesson.content as Record<string, unknown> | null
        const bodyHtml = (content?.body_html as string) || ''
        const bodyText = (content?.text as string) || ''
        const markdown = (content?.markdown as string) || ''
        const transcript = (lesson.transcript as string) || ''
        const lessonContent = bodyHtml || bodyText || markdown || transcript

        if (lessonContent && lessonContent.trim().length > 50) {
          if (!firstLessonWithContent) firstLessonWithContent = lesson.id
          // Take first 1500 chars of each lesson to stay within token limits
          lessonSummaries.push(`LESSON: ${lesson.title}\n${lessonContent.substring(0, 1500)}`)
        }
      }

      if (lessonSummaries.length === 0 || !firstLessonWithContent) {
        results.push({
          course_id: course.id,
          course_title: course.title,
          status: 'skipped',
          checks_created: 0,
        })
        continue
      }

      // Cap total content to ~12K chars
      let combinedContent = ''
      for (const summary of lessonSummaries) {
        if (combinedContent.length + summary.length > 12000) break
        combinedContent += summary + '\n\n---\n\n'
      }

      try {
        const prompt = `You are an instructional designer for Teachers Deserve It, an educator professional development platform. Generate 5 formative check-ins for this ENTIRE COURSE, not individual lessons. The check-ins should assess the course's key themes and big ideas.

COURSE TITLE: ${course.title}
COURSE CATEGORY: ${course.category || 'General'}
COURSE DESCRIPTION: ${course.description || 'N/A'}
TOTAL LESSONS: ${lessons.length}

CONTENT FROM ACROSS THE COURSE:
${combinedContent}

---

Generate exactly 5 check-ins for the whole course:
- 2 multiple choice comprehension checks (3-4 options, 1 correct) covering the course's core concepts
- 1 reflection prompt that connects the course themes to the educator's own practice
- 1 action step: a specific, practical thing they can try in their classroom this week based on what they learned
- 1 checkpoint: 3-4 key takeaways from the entire course

Rules:
- These should cover the WHOLE COURSE, not just one lesson
- Test real understanding of the course's big ideas, not surface recall
- Reflection should be personal: "Think about..." or "Consider a time when..."
- Action step must be specific enough to do tomorrow
- Tone: warm, professional, no emojis, no dashes
- Explanations should teach WHY, not just confirm

Return ONLY a JSON array. Each object:
{"question_text":"...","question_type":"multiple_choice"|"reflection"|"action_step"|"checkpoint","options":[...]|null,"correct_answer":"..."|null,"explanation":"..."|null,"sort_order":number}

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
            course_id: course.id,
            course_title: course.title,
            status: 'failed',
            checks_created: 0,
            error: 'AI returned no questions',
          })
          continue
        }

        // Store all 5 checks on the first lesson with content
        const insertRows = questions.map((q: Record<string, unknown>, i: number) => ({
          lesson_id: firstLessonWithContent,
          question_text: q.question_text || '',
          question_type: q.question_type || 'multiple_choice',
          options: q.options || null,
          correct_answer: q.correct_answer || null,
          explanation: q.explanation || null,
          sort_order: i,
          content_position: null,
        }))

        const { data: created, error: insertError } = await supabase
          .from('hub_quiz_questions')
          .insert(insertRows)
          .select()

        if (insertError) {
          results.push({
            course_id: course.id,
            course_title: course.title,
            status: 'failed',
            checks_created: 0,
            error: insertError.message,
          })
        } else {
          results.push({
            course_id: course.id,
            course_title: course.title,
            status: 'generated',
            checks_created: created?.length || 0,
          })
        }
      } catch (err: unknown) {
        results.push({
          course_id: course.id,
          course_title: course.title,
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
      message: `Generated ${totalChecks} check-ins across ${generated} courses. ${failed > 0 ? `${failed} failed.` : ''}`,
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
