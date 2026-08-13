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
 * Every course should carry three check-ins, each on a content lesson, and each
 * made of a comprehension question plus a reflection or an implementation plan.
 * Coverage is counted in check-ins, not questions: counting questions is what
 * let a course with three check-ins report five.
 */
const TARGET_CHECK_INS = 3

/**
 * GET /api/tdi-admin/courses/[id]/bulk-checks
 *
 * Returns check-in coverage at the COURSE level: how many lessons carry a
 * check-in, and whether those check-ins ask educators to apply what they
 * learned rather than only recall it.
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

    // Get all active quiz questions for these lessons
    const lessonIds = (lessons || []).map((l) => l.id)
    const { data: questions } = await supabase
      .from('hub_quiz_questions')
      .select('lesson_id, question_type')
      .eq('is_active', true)
      .in('lesson_id', lessonIds.length > 0 ? lessonIds : ['none'])

    // Count checks per course
    const lessonToCourse = new Map<string, string>()
    lessons?.forEach((l) => {
      const courseId = (l as any).hub_modules?.course_id
      if (courseId) lessonToCourse.set(l.id, courseId)
    })

    // A check-in is a lesson that carries questions, so a lesson with a
    // comprehension question and a reflection counts once.
    const courseCheckInLessons = new Map<string, Set<string>>()
    const courseAppliedCounts = new Map<string, number>()
    questions?.forEach((q) => {
      const courseId = lessonToCourse.get(q.lesson_id)
      if (!courseId) return
      const lessonSet = courseCheckInLessons.get(courseId) || new Set<string>()
      lessonSet.add(q.lesson_id)
      courseCheckInLessons.set(courseId, lessonSet)
      if (q.question_type === 'reflection' || q.question_type === 'action_step') {
        courseAppliedCounts.set(courseId, (courseAppliedCounts.get(courseId) || 0) + 1)
      }
    })

    const courseCheckCounts = new Map<string, number>(
      Array.from(courseCheckInLessons, ([courseId, set]) => [courseId, set.size])
    )

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
      const appliedCount = courseAppliedCounts.get(c.id) || 0
      const hasContent = courseHasContent.get(c.id) || false
      const lessonCount = courseLessonCount.get(c.id) || 0
      return {
        course_id: c.id,
        course_title: c.title,
        lesson_count: lessonCount,
        has_content: hasContent,
        check_count: checkCount,
        applied_count: appliedCount,
        // A course clears the gate only when it has enough check-ins and every
        // one of them ends in a reflection or a plan.
        meets_minimum: checkCount >= Math.min(TARGET_CHECK_INS, lessonCount) && appliedCount >= checkCount,
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


// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

// Lessons that introduce the course rather than teach it. A check-in here asks
// educators to reflect on a welcome video.
const INTRO_TITLE = /^(welcome|getting started|intro|introduction|your guide|meet |start here|who is |about (this|the) (course|creator))/i
const RESOURCE_TITLE = /(download|packet|workbook|resource|handout|slides|worksheet)/i
const TRANSCRIPT_CHARS = 12000

interface LessonRow {
  id: string
  title: string
  type: string | null
  sort_order: number
  module_id: string | null
  transcript: string | null
}

const isContentLesson = (l: LessonRow) =>
  l.type !== 'resource' && l.type !== 'download' && !RESOURCE_TITLE.test(l.title)

const hasTranscript = (l: LessonRow) => (l.transcript || '').trim().length > 400

/**
 * Which lessons carry a check-in.
 *
 * Candidates are content lessons with enough transcript to write a real
 * question from, minus the intro lessons. The last candidate always gets one,
 * so the implementation plan is written after the final lesson; the rest are
 * spread evenly across what comes before.
 */
function pickCheckInLessons(lessons: LessonRow[]): LessonRow[] {
  const teaching = lessons.filter((l) => isContentLesson(l) && hasTranscript(l))
  const candidates = teaching.filter((l) => !INTRO_TITLE.test(l.title))
  const pool = candidates.length > 0 ? candidates : teaching
  if (pool.length === 0) return []

  const count = Math.min(TARGET_CHECK_INS, pool.length)
  const picked: LessonRow[] = []
  for (let i = 1; i <= count; i++) {
    // i/count lands the last one exactly on the final lesson.
    const idx = Math.min(pool.length - 1, Math.ceil((pool.length * i) / count) - 1)
    const lesson = pool[idx]
    if (!picked.some((p) => p.id === lesson.id)) picked.push(lesson)
  }
  return picked
}

const CHECK_IN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['comprehension', 'applied'],
  properties: {
    comprehension: {
      type: 'object',
      additionalProperties: false,
      required: ['question_text', 'options', 'explanation'],
      properties: {
        question_text: { type: 'string' },
        options: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['text', 'is_correct'],
            properties: { text: { type: 'string' }, is_correct: { type: 'boolean' } },
          },
        },
        explanation: { type: 'string' },
      },
    },
    applied: {
      type: 'object',
      additionalProperties: false,
      required: ['question_text'],
      properties: { question_text: { type: 'string' } },
    },
  },
}

const STYLE_RULES = `Style rules, all required:
- Never use an em dash, an en dash, or a double hyphen. Use a period, a comma, or restructure the sentence.
- No emojis.
- Write to an educator as a respected colleague. Warm, direct, never condescending.
- Do not reference "the video", "the lesson", or "this module". Ask about the idea itself, so the question reads the same in a transcript or a printed packet.`

// The style rule is absolute, so strip anything that slipped through rather
// than shipping a dash into a course.
function cleanText(s: unknown): string {
  return String(s || '')
    .replace(/[–—]|--/g, ', ')
    .replace(/\s+,/g, ',')
    .replace(/,\s*,/g, ',')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

interface GeneratedQuestion {
  question_text: string
  question_type: string
  options: Array<{ text: string; is_correct?: boolean }> | null
  correct_answer: string | null
  explanation: string | null
  sort_order: number
}

async function generateCheckIn(
  client: Anthropic,
  course: { title: string; description: string | null; category: string | null },
  lesson: LessonRow,
  position: number,
  total: number,
  priorTitles: string[]
): Promise<GeneratedQuestion[]> {
  const isFinal = position === total

  const appliedSpec = isFinal
    ? `2. An implementation plan prompt (question_type "action_step"). This is the last check-in in the course, so it asks the educator to commit to something specific from what they have learned: what they will try, with which students or colleagues, and when. Name a concrete strategy from this course so the prompt cannot be answered generically. Two to four sentences.`
    : `2. A reflection prompt (question_type "reflection"). It asks the educator to connect this specific idea to their own room, their own students, or a situation they have actually been in. Ground it in the content of this lesson, not the course in general. Two to four sentences.`

  const prompt = `You write formative check-ins for Teachers Deserve It, a professional learning hub for educators.

COURSE: ${course.title}
COURSE DESCRIPTION: ${course.description || 'Not provided'}
CATEGORY: ${course.category || 'General'}

This is check-in ${position} of ${total} in the course, placed at the end of the lesson below. The educator has just finished watching it.${
    priorTitles.length ? `\nLessons they have already watched: ${priorTitles.join('; ')}` : ''
  }

LESSON: ${lesson.title}

TRANSCRIPT OF THIS LESSON:
${(lesson.transcript || '').trim().slice(0, TRANSCRIPT_CHARS)}

---

Write exactly two parts.

1. A multiple choice comprehension question with four options, exactly one correct. It must be answerable only by someone who understood THIS lesson: build it from a specific idea, distinction, number, or step that appears in the transcript above. No general education trivia, and nothing answerable by common sense alone. The three wrong options must be plausible to someone who half followed the lesson, not obviously wrong. The explanation teaches why the correct answer is correct in two or three sentences, so an educator who missed it still learns the idea.

${appliedSpec}

${STYLE_RULES}`

  const response = await client.messages.create({
    model: 'claude-opus-5',
    max_tokens: 4000,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: CHECK_IN_SCHEMA } },
    messages: [{ role: 'user', content: prompt }],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)

  if (response.stop_reason === 'refusal') throw new Error('Model declined the request')

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
  const parsed = JSON.parse(text)

  const options = parsed.comprehension.options.map((o: { text: string; is_correct: boolean }) => ({
    text: cleanText(o.text),
    is_correct: !!o.is_correct,
  }))
  if (options.filter((o: { is_correct: boolean }) => o.is_correct).length !== 1) {
    throw new Error('Comprehension question did not come back with exactly one correct option')
  }

  return [
    {
      question_text: cleanText(parsed.comprehension.question_text),
      question_type: 'multiple_choice',
      options,
      correct_answer: null,
      explanation: cleanText(parsed.comprehension.explanation),
      sort_order: 0,
    },
    {
      question_text: cleanText(parsed.applied.question_text),
      question_type: isFinal ? 'action_step' : 'reflection',
      options: null,
      correct_answer: null,
      explanation: null,
      sort_order: 1,
    },
  ]
}

/**
 * POST /api/tdi-admin/courses/[id]/bulk-checks
 *
 * Rebuilds a course's check-ins from the transcripts of the lessons they sit
 * on, so each one confirms the educator understood that lesson and then asks
 * them to reflect on it or plan how they will use it. The final check-in lands
 * on the last content lesson and always asks for the plan.
 *
 * Existing questions are retired (is_active = false) rather than deleted:
 * educators have already answered some of them, and hub_quiz_responses
 * references question_id.
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

    let coursesQuery = supabase
      .from('hub_courses')
      .select('id, title, category, description')

    if (id !== 'all') {
      coursesQuery = coursesQuery.eq('id', id)
    }

    const { data: courses, error: coursesError } = await coursesQuery
    if (coursesError) return NextResponse.json({ error: coursesError.message }, { status: 500 })

    const courseIds = (courses || []).map((c) => c.id)
    if (courseIds.length === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Modules are the reliable path to a course's lessons: hub_lessons.course_id
    // is often null.
    const { data: modules } = await supabase
      .from('hub_modules')
      .select('id, course_id, sort_order')
      .in('course_id', courseIds)
      .order('sort_order', { ascending: true })

    const moduleIds = (modules || []).map((m) => m.id)
    const { data: allLessons, error: lessonsError } = moduleIds.length > 0
      ? await supabase
          .from('hub_lessons')
          .select('id, title, type, sort_order, module_id, transcript')
          .in('module_id', moduleIds)
          .order('sort_order', { ascending: true })
      : { data: [] as LessonRow[], error: null }

    if (lessonsError) return NextResponse.json({ error: lessonsError.message }, { status: 500 })

    const moduleOrder = new Map((modules || []).map((m, i) => [m.id, i]))
    const moduleCourse = new Map((modules || []).map((m) => [m.id, m.course_id]))

    const lessonsByCourse = new Map<string, LessonRow[]>()
    ;((allLessons || []) as LessonRow[]).forEach((l) => {
      const courseId = l.module_id ? moduleCourse.get(l.module_id) : undefined
      if (!courseId) return
      const arr = lessonsByCourse.get(courseId) || []
      arr.push(l)
      lessonsByCourse.set(courseId, arr)
    })
    lessonsByCourse.forEach((arr) =>
      arr.sort((a, b) => {
        const mod = (moduleOrder.get(a.module_id!) ?? 0) - (moduleOrder.get(b.module_id!) ?? 0)
        return mod !== 0 ? mod : a.sort_order - b.sort_order
      })
    )

    const client = new Anthropic({ apiKey })

    const results: Array<{
      course_id: string
      course_title: string
      status: 'rebuilt' | 'failed' | 'skipped'
      check_ins: number
      questions_created: number
      retired: number
      error?: string
    }> = []

    for (const course of courses || []) {
      const lessons = lessonsByCourse.get(course.id) || []
      const gateLessons = pickCheckInLessons(lessons)

      if (gateLessons.length === 0) {
        results.push({
          course_id: course.id,
          course_title: course.title,
          status: 'skipped',
          check_ins: 0,
          questions_created: 0,
          retired: 0,
          error: 'No lesson with a usable transcript',
        })
        continue
      }

      try {
        // Generate everything before touching the database, so a failure
        // halfway through never leaves a course with no check-ins at all.
        const generated: GeneratedQuestion[][] = []
        for (let i = 0; i < gateLessons.length; i++) {
          const lesson = gateLessons[i]
          const idx = lessons.findIndex((l) => l.id === lesson.id)
          const priorTitles = lessons
            .slice(0, idx)
            .filter(isContentLesson)
            .map((l) => l.title)
            .slice(-6)
          generated.push(
            await generateCheckIn(client, course, lesson, i + 1, gateLessons.length, priorTitles)
          )
        }

        const lessonIds = lessons.map((l) => l.id)
        const { data: existing } = await supabase
          .from('hub_quiz_questions')
          .select('id')
          .eq('is_active', true)
          .in('lesson_id', lessonIds)

        if (existing && existing.length > 0) {
          await supabase
            .from('hub_quiz_questions')
            .update({ is_active: false })
            .in('id', existing.map((q) => q.id))
        }

        const rows = gateLessons.flatMap((lesson, i) =>
          generated[i].map((q) => ({
            ...q,
            lesson_id: lesson.id,
            content_position: null,
            is_active: true,
          }))
        )

        const { data: created, error: insertError } = await supabase
          .from('hub_quiz_questions')
          .insert(rows)
          .select()

        if (insertError) throw new Error(insertError.message)

        results.push({
          course_id: course.id,
          course_title: course.title,
          status: 'rebuilt',
          check_ins: gateLessons.length,
          questions_created: created?.length || 0,
          retired: existing?.length || 0,
        })
      } catch (err: unknown) {
        results.push({
          course_id: course.id,
          course_title: course.title,
          status: 'failed',
          check_ins: 0,
          questions_created: 0,
          retired: 0,
          error: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }

    const rebuilt = results.filter((r) => r.status === 'rebuilt').length
    const totalCheckIns = results.reduce((sum, r) => sum + r.check_ins, 0)
    const failed = results.filter((r) => r.status === 'failed').length

    return NextResponse.json({
      success: true,
      message: `Rebuilt ${totalCheckIns} check-ins across ${rebuilt} course${rebuilt === 1 ? '' : 's'}. ${failed > 0 ? `${failed} failed.` : ''}`.trim(),
      processed: results.length,
      rebuilt,
      total_check_ins: totalCheckIns,
      failed,
      results,
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
