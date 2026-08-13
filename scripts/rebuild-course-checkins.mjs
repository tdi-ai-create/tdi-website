/**
 * Rebuild course check-ins so each one confirms understanding of the lesson it
 * sits on and then asks the educator to do something with it.
 *
 * The old check-ins were generated five at a time from a blend of every lesson
 * in the course and parked wherever there was content. A later pass spread
 * those five across three lessons, which left two of them attached to a lesson
 * that already had one and therefore never rendering. Course pages counted all
 * five and promised "5 check-ins" for an experience that had three.
 *
 * This rebuilds them per lesson, from that lesson's own transcript:
 *
 *   check-in 1..n-1  comprehension question + reflection
 *   final check-in   comprehension question + implementation plan
 *
 * Check-ins land on content lessons only, never on Welcome, Your Guide, or a
 * downloads packet, and the last one lands on the final content lesson so the
 * plan is written after the whole course has been watched.
 *
 * Old questions are retired (is_active = false), never deleted: educators have
 * already answered some of them and hub_quiz_responses references question_id.
 *
 * Usage:
 *   node scripts/rebuild-course-checkins.mjs --dry-run
 *   node scripts/rebuild-course-checkins.mjs --course=calm-classrooms-not-chaos
 *   node scripts/rebuild-course-checkins.mjs --all
 */

import fs from 'node:fs'
import path from 'node:path'
import Anthropic from '@anthropic-ai/sdk'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ROOT = path.resolve(import.meta.dirname, '..')
const BACKUP_DIR = path.join(ROOT, 'scripts', 'checkin-backups')

const MODEL = 'claude-opus-5'
const CONCURRENCY = 3
const MAX_CHECKINS = 3
const TRANSCRIPT_CHARS = 12000

// Lessons that introduce the course rather than teach it. A check-in here asks
// educators to reflect on a welcome video.
const INTRO_TITLE = /^(welcome|getting started|intro|introduction|your guide|meet |start here|who is |about (this|the) (course|creator))/i
const RESOURCE_TITLE = /(download|packet|workbook|resource|handout|slides|worksheet)/i

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const ONLY_COURSE = args.find((a) => a.startsWith('--course='))?.split('=')[1]
const RUN_ALL = args.includes('--all')

if (!ONLY_COURSE && !RUN_ALL && !DRY_RUN) {
  console.error('Pass --all to rebuild every course, --course=<slug> for one, or --dry-run to preview.')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Env
// ---------------------------------------------------------------------------

function loadEnv(file) {
  const out = {}
  if (!fs.existsSync(file)) return out
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return out
}

const env = {
  ...loadEnv(path.join(ROOT, '.env.vercel.production')),
  ...loadEnv(path.join(ROOT, '.env.local')),
}

const SUPABASE_URL = env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
const SUPABASE_KEY = env.LEARNING_HUB_SUPABASE_SERVICE_KEY
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || env.ANTHROPIC_API_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Learning Hub Supabase credentials not found')
if (!ANTHROPIC_KEY && !DRY_RUN) throw new Error('ANTHROPIC_API_KEY not found')

const anthropic = ANTHROPIC_KEY ? new Anthropic({ apiKey: ANTHROPIC_KEY }) : null

// ---------------------------------------------------------------------------
// Supabase REST
// ---------------------------------------------------------------------------

async function db(method, table, query = '', body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ''}`, {
    method,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: method === 'POST' ? 'return=representation' : 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`${method} ${table}: ${res.status} ${await res.text()}`)
  return res.status === 204 ? null : res.json()
}

const select = (table, query) => db('GET', table, query)

// ---------------------------------------------------------------------------
// Course shape
// ---------------------------------------------------------------------------

/**
 * Ordered lessons for a course. hub_lessons.course_id is unreliable, so the
 * modules are the path to the lessons.
 */
async function loadCourseLessons(courseId) {
  const modules = await select(
    'hub_modules',
    `course_id=eq.${courseId}&select=id,sort_order&order=sort_order`
  )
  if (modules.length === 0) return []

  const ids = modules.map((m) => m.id).join(',')
  const lessons = await select(
    'hub_lessons',
    `module_id=in.(${ids})&select=id,title,slug,type,sort_order,module_id,transcript&limit=500`
  )

  const order = new Map(modules.map((m, i) => [m.id, i]))
  return lessons.sort((a, b) => {
    const mod = order.get(a.module_id) - order.get(b.module_id)
    return mod !== 0 ? mod : a.sort_order - b.sort_order
  })
}

const isContentLesson = (l) =>
  l.type !== 'resource' && l.type !== 'download' && !RESOURCE_TITLE.test(l.title)

const hasTranscript = (l) => (l.transcript || '').trim().length > 400

/**
 * Which lessons carry a check-in.
 *
 * Candidates are content lessons with enough transcript to write a real
 * question from, minus the intro lessons. The last candidate always gets one,
 * so the implementation plan is written after the final lesson; the rest are
 * spread evenly across what comes before.
 */
function pickCheckInLessons(lessons) {
  const teaching = lessons.filter((l) => isContentLesson(l) && hasTranscript(l))
  const candidates = teaching.filter((l) => !INTRO_TITLE.test(l.title))
  const pool = candidates.length > 0 ? candidates : teaching
  if (pool.length === 0) return []

  const count = Math.min(MAX_CHECKINS, pool.length)
  const picked = []
  for (let i = 1; i <= count; i++) {
    // i/count lands the last one exactly on the final lesson.
    const idx = Math.min(pool.length - 1, Math.ceil((pool.length * i) / count) - 1)
    const lesson = pool[idx]
    if (!picked.some((p) => p.id === lesson.id)) picked.push(lesson)
  }
  return picked
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

const SCHEMA = {
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

const STYLE = `Style rules, all required:
- Never use an em dash, an en dash, or a double hyphen. Use a period, a comma, or restructure the sentence.
- No emojis.
- Write to an educator as a respected colleague. Warm, direct, never condescending.
- Do not reference "the video", "the lesson", or "this module". Ask about the idea itself, so the question reads the same in a transcript or a printed packet.`

function buildPrompt({ course, lesson, transcript, position, total, isFinal, priorTitles }) {
  const appliedSpec = isFinal
    ? `2. An implementation plan prompt (question_type "action_step"). This is the last check-in in the course, so it asks the educator to commit to something specific from what they have learned: what they will try, with which students or colleagues, and when. Name a concrete strategy from this course so the prompt cannot be answered generically. Two to four sentences.`
    : `2. A reflection prompt (question_type "reflection"). It asks the educator to connect this specific idea to their own room, their own students, or a situation they have actually been in. Ground it in the content of this lesson, not the course in general. Two to four sentences.`

  return `You write formative check-ins for Teachers Deserve It, a professional learning hub for educators.

COURSE: ${course.title}
COURSE DESCRIPTION: ${course.description || 'Not provided'}
CATEGORY: ${course.category || 'General'}

This is check-in ${position} of ${total} in the course, placed at the end of the lesson below. The educator has just finished watching it.${
    priorTitles.length ? `\nLessons they have already watched: ${priorTitles.join('; ')}` : ''
  }

LESSON: ${lesson.title}

TRANSCRIPT OF THIS LESSON:
${transcript}

---

Write exactly two parts.

1. A multiple choice comprehension question with four options, exactly one correct. It must be answerable only by someone who understood THIS lesson: build it from a specific idea, distinction, number, or step that appears in the transcript above. No general education trivia, and nothing answerable by common sense alone. The three wrong options must be plausible to someone who half followed the lesson, not obviously wrong. The explanation teaches why the correct answer is correct in two or three sentences, so an educator who missed it still learns the idea.

${appliedSpec}

${STYLE}`
}

const DASHES = /[–—]|--/g

function cleanText(s) {
  // The style rule is absolute, so strip anything that slipped through rather
  // than shipping a dash into a course.
  return String(s || '')
    .replace(DASHES, ', ')
    .replace(/\s+,/g, ',')
    .replace(/,\s*,/g, ',')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

async function generateCheckIn(ctx) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4000,
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: SCHEMA } },
    messages: [{ role: 'user', content: buildPrompt(ctx) }],
  })

  if (response.stop_reason === 'refusal') throw new Error('Model declined the request')

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
  const parsed = JSON.parse(text)

  const options = parsed.comprehension.options.map((o) => ({
    text: cleanText(o.text),
    is_correct: !!o.is_correct,
  }))
  if (options.filter((o) => o.is_correct).length !== 1) {
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
      question_type: ctx.isFinal ? 'action_step' : 'reflection',
      options: null,
      correct_answer: null,
      explanation: null,
      sort_order: 1,
    },
  ]
}

// ---------------------------------------------------------------------------
// Per-course rebuild
// ---------------------------------------------------------------------------

async function rebuildCourse(course) {
  const lessons = await loadCourseLessons(course.id)
  if (lessons.length === 0) return { slug: course.slug, status: 'skipped', reason: 'no lessons' }

  const gateLessons = pickCheckInLessons(lessons)
  if (gateLessons.length === 0) {
    return { slug: course.slug, status: 'skipped', reason: 'no lesson with a usable transcript' }
  }

  const lessonIds = lessons.map((l) => l.id).join(',')
  const existing = await select(
    'hub_quiz_questions',
    `lesson_id=in.(${lessonIds})&select=*&is_active=eq.true`
  )

  const plan = []
  for (let i = 0; i < gateLessons.length; i++) {
    const lesson = gateLessons[i]
    const idx = lessons.findIndex((l) => l.id === lesson.id)
    plan.push({
      course,
      lesson,
      transcript: lesson.transcript.trim().slice(0, TRANSCRIPT_CHARS),
      position: i + 1,
      total: gateLessons.length,
      isFinal: i === gateLessons.length - 1,
      priorTitles: lessons
        .slice(0, idx)
        .filter(isContentLesson)
        .map((l) => l.title)
        .slice(-6),
    })
  }

  if (DRY_RUN) {
    return {
      slug: course.slug,
      status: 'dry-run',
      lessons: lessons.length,
      retiring: existing.length,
      checkIns: plan.map((p) => `#${lessons.findIndex((l) => l.id === p.lesson.id) + 1} ${p.lesson.title}${p.isFinal ? ' (plan)' : ' (reflection)'}`),
    }
  }

  const generated = []
  for (const ctx of plan) {
    generated.push(await generateCheckIn(ctx))
  }

  // Only touch the database once every question for the course is in hand, so a
  // failure halfway through never leaves a course with no check-ins at all.
  if (existing.length > 0) {
    await db('PATCH', 'hub_quiz_questions', `id=in.(${existing.map((q) => q.id).join(',')})`, {
      is_active: false,
    })
  }

  const rows = plan.flatMap((ctx, i) =>
    generated[i].map((q) => ({ ...q, lesson_id: ctx.lesson.id, content_position: null, is_active: true }))
  )
  const inserted = await db('POST', 'hub_quiz_questions', '', rows)

  return {
    slug: course.slug,
    status: 'rebuilt',
    checkIns: gateLessons.length,
    questions: inserted.length,
    retired: existing.length,
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  let query = 'select=id,slug,title,description,category,is_published&order=title'
  if (ONLY_COURSE) query += `&slug=eq.${ONLY_COURSE}`
  const courses = await select('hub_courses', query)

  if (courses.length === 0) {
    console.error(ONLY_COURSE ? `No course with slug ${ONLY_COURSE}` : 'No courses found')
    process.exit(1)
  }

  if (!DRY_RUN) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true })
    const all = await select('hub_quiz_questions', 'select=*&limit=10000')
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const file = path.join(BACKUP_DIR, `hub_quiz_questions-${stamp}.json`)
    fs.writeFileSync(file, JSON.stringify(all, null, 2))
    console.log(`Backed up ${all.length} questions to ${file}\n`)
  }

  const results = []
  for (let i = 0; i < courses.length; i += CONCURRENCY) {
    const batch = courses.slice(i, i + CONCURRENCY)
    const settled = await Promise.allSettled(batch.map(rebuildCourse))
    settled.forEach((r, j) => {
      if (r.status === 'fulfilled') {
        results.push(r.value)
        const v = r.value
        console.log(
          v.status === 'dry-run'
            ? `${v.slug}\n  ${v.lessons} lessons, retiring ${v.retiring}\n  ${v.checkIns.join('\n  ')}`
            : v.status === 'rebuilt'
              ? `${v.slug}: ${v.checkIns} check-ins, ${v.questions} questions, ${v.retired} retired`
              : `${v.slug}: skipped (${v.reason})`
        )
      } else {
        results.push({ slug: batch[j].slug, status: 'failed', reason: r.reason.message })
        console.error(`${batch[j].slug}: FAILED ${r.reason.message}`)
      }
    })
  }

  const by = (s) => results.filter((r) => r.status === s).length
  console.log(
    `\nDone. rebuilt=${by('rebuilt')} skipped=${by('skipped')} failed=${by('failed')} dry-run=${by('dry-run')}`
  )
  if (by('failed') > 0) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
