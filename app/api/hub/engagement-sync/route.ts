import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

/**
 * Hub Engagement Sync API -- Bridge between Paperclip agents and the Learning Hub
 *
 * Paperclip agents (Jasmine, Julie Lynn) call this endpoint to:
 * - Find lessons that need engagement checks (find_work)
 * - Generate AI engagement checks for a lesson (generate_checks)
 * - Validate lesson engagement density (validate_density)
 * - Get lesson content for review (get_lesson)
 *
 * Auth: Bearer token via PAPERCLIP_SYNC_KEY env var
 */

function db() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('Learning Hub Supabase not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function authorize(request: NextRequest): boolean {
  const syncKey = process.env.PAPERCLIP_SYNC_KEY
  if (!syncKey) return false
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${syncKey}`
}

type SyncAction =
  | 'find_work'
  | 'get_lesson'
  | 'generate_checks'
  | 'validate_density'
  | 'get_status'

// ────────────────────────────────────────────────────────────
// GET — read-only queries
// ────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') as SyncAction

  const supabase = db()

  // ── find_work: lessons that need engagement checks ──
  if (action === 'find_work') {
    // Find lessons with content but no quiz questions
    const { data: lessons } = await supabase
      .from('hub_lessons')
      .select('id, title, type, content, course_id')

    if (!lessons) return NextResponse.json({ work: [] })

    // Get quiz question counts per lesson
    const { data: questionCounts } = await supabase
      .from('hub_quiz_questions')
      .select('lesson_id')

    const lessonQuestionCounts = new Map<string, number>()
    questionCounts?.forEach((q) => {
      lessonQuestionCounts.set(q.lesson_id, (lessonQuestionCounts.get(q.lesson_id) || 0) + 1)
    })

    // Filter to lessons that have content but no/insufficient checks
    const needsWork = lessons.filter((l) => {
      const content = l.content as Record<string, unknown> | null
      const hasContent = content && (
        (content.body_html && typeof content.body_html === 'string' && (content.body_html as string).length > 50) ||
        (content.video_id)
      )
      const hasTranscript = false // Would need transcript column check
      const questionCount = lessonQuestionCounts.get(l.id) || 0
      return (hasContent || hasTranscript) && questionCount < 4
    })

    // Get course titles
    const courseIds = [...new Set(needsWork.map((l) => l.course_id))]
    const { data: courses } = await supabase
      .from('hub_courses')
      .select('id, title, slug')
      .in('id', courseIds.length > 0 ? courseIds : ['none'])

    const courseMap = new Map(courses?.map((c) => [c.id, c]) || [])

    const work = needsWork.map((l) => {
      const content = l.content as Record<string, unknown> | null
      const course = courseMap.get(l.course_id)
      return {
        lesson_id: l.id,
        lesson_title: l.title,
        lesson_type: l.type,
        course_title: course?.title || 'Unknown',
        course_slug: course?.slug || '',
        has_body_html: !!(content?.body_html),
        has_video: !!(content?.video_id),
        existing_checks: lessonQuestionCounts.get(l.id) || 0,
        request_type: 'generate_checks',
      }
    })

    return NextResponse.json({ work, count: work.length })
  }

  // ── get_lesson: full lesson data for review ──
  if (action === 'get_lesson') {
    const lessonId = searchParams.get('lesson_id')
    if (!lessonId) return NextResponse.json({ error: 'lesson_id required' }, { status: 400 })

    const { data: lesson } = await supabase
      .from('hub_lessons')
      .select('id, title, type, content, transcript, transcript_es')
      .eq('id', lessonId)
      .single()

    if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })

    const { data: questions } = await supabase
      .from('hub_quiz_questions')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('sort_order', { ascending: true })

    return NextResponse.json({ lesson, questions: questions || [] })
  }

  // ── validate_density: check if a lesson meets minimum requirements ──
  if (action === 'validate_density') {
    const lessonId = searchParams.get('lesson_id')
    if (!lessonId) return NextResponse.json({ error: 'lesson_id required' }, { status: 400 })

    const { data: questions } = await supabase
      .from('hub_quiz_questions')
      .select('question_type')
      .eq('lesson_id', lessonId)

    const types = questions?.map((q) => q.question_type) || []
    const comprehensionCount = types.filter((t) => t === 'multiple_choice' || t === 'true_false').length
    const reflectionCount = types.filter((t) => t === 'reflection').length
    const actionCount = types.filter((t) => t === 'action_step').length
    const checkpointCount = types.filter((t) => t === 'checkpoint').length

    const passes = comprehensionCount >= 2 && actionCount >= 1 && checkpointCount >= 1
    const issues: string[] = []
    if (comprehensionCount < 2) issues.push(`Need ${2 - comprehensionCount} more comprehension check(s)`)
    if (actionCount < 1) issues.push('Missing action step ("Try It")')
    if (checkpointCount < 1) issues.push('Missing checkpoint')

    return NextResponse.json({
      lesson_id: lessonId,
      passes,
      total_checks: types.length,
      breakdown: { comprehensionCount, reflectionCount, actionCount, checkpointCount },
      issues,
    })
  }

  // ── get_status: overall engagement coverage stats ──
  if (action === 'get_status') {
    const { data: lessons } = await supabase
      .from('hub_lessons')
      .select('id, title, course_id')

    const { data: questions } = await supabase
      .from('hub_quiz_questions')
      .select('lesson_id, question_type')

    const lessonQuestionCounts = new Map<string, number>()
    questions?.forEach((q) => {
      lessonQuestionCounts.set(q.lesson_id, (lessonQuestionCounts.get(q.lesson_id) || 0) + 1)
    })

    const totalLessons = lessons?.length || 0
    const withChecks = lessons?.filter((l) => (lessonQuestionCounts.get(l.id) || 0) >= 4).length || 0
    const withoutChecks = totalLessons - withChecks

    return NextResponse.json({
      total_lessons: totalLessons,
      lessons_with_checks: withChecks,
      lessons_without_checks: withoutChecks,
      coverage_pct: totalLessons > 0 ? Math.round((withChecks / totalLessons) * 100) : 0,
      total_questions: questions?.length || 0,
    })
  }

  return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
}

// ────────────────────────────────────────────────────────────
// POST — mutations
// ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const action = body.action as SyncAction

  // ── generate_checks: AI-generate engagement checks for a lesson ──
  if (action === 'generate_checks') {
    const { lesson_id } = body
    if (!lesson_id) return NextResponse.json({ error: 'lesson_id required' }, { status: 400 })

    // Delegate to the existing generate endpoint logic
    const supabase = db()

    const { data: lesson } = await supabase
      .from('hub_lessons')
      .select('id, title, type, content, transcript')
      .eq('id', lesson_id)
      .single()

    if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })

    const contentObj = (typeof lesson.content === 'object' && lesson.content !== null)
      ? lesson.content as Record<string, unknown>
      : {}
    const bodyHtml = (contentObj.body_html as string) || ''
    const bodyText = (contentObj.text as string) || ''
    const transcript = lesson.transcript || ''
    const lessonContent = bodyHtml || bodyText || transcript

    if (!lessonContent || lessonContent.trim().length < 50) {
      return NextResponse.json(
        { error: 'Lesson needs body content or transcript (50+ chars) to generate checks.' },
        { status: 400 }
      )
    }

    let sectionCount = 0
    if (bodyHtml) {
      const breakPattern = /(?=<h[23][^>]*>)|(?:<!--\s*section-break\s*-->)/gi
      const sections = bodyHtml.split(breakPattern).filter((s: string) => s.trim().length > 0)
      sectionCount = sections.length
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    })

    const responseText = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')

    let questions
    try {
      const cleaned = responseText.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
      questions = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'AI generated invalid JSON. Retry.' }, { status: 500 })
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'AI returned no questions. Retry.' }, { status: 500 })
    }

    const { data: existing } = await supabase
      .from('hub_quiz_questions')
      .select('sort_order')
      .eq('lesson_id', lesson_id)
      .order('sort_order', { ascending: false })
      .limit(1)

    let nextSortOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0

    const insertRows = questions.map((q: Record<string, unknown>) => ({
      lesson_id,
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
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      lesson_id,
      lesson_title: lesson.title,
      checks_created: created?.length || 0,
      questions: created,
    })
  }

  return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
}
