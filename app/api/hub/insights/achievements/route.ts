import { NextRequest, NextResponse } from 'next/server'

interface InsightData {
  name?: string
  role?: string
  toolsExplored?: number
  hoursSaved?: string
  daysActive?: number
  recognitionsEarned?: number
  earnedNames?: string[]
  topCategories?: string[]
  communityPosts?: number
  coursesCompleted?: number
  pdHours?: number
}

// ── Template pools for variety ──────────────────────────────────────────────

const GROWTH_PATTERNS = [
  (d: InsightData) => {
    const parts: string[] = []
    if ((d.toolsExplored || 0) > 10) parts.push(`You have explored ${d.toolsExplored} tools, which puts you in the top tier of active learners on the Hub.`)
    else if ((d.toolsExplored || 0) > 0) parts.push(`You have explored ${d.toolsExplored} tools so far. Each one builds on the last.`)
    if ((d.topCategories || []).length > 0) parts.push(`Your strongest focus areas are ${d.topCategories!.join(' and ')}.`)
    if ((d.communityPosts || 0) > 0) parts.push(`You have contributed ${d.communityPosts} community posts, which means you are not just learning, you are sharing what works.`)
    if ((d.daysActive || 0) > 7) parts.push(`${d.daysActive} days of activity shows real consistency.`)
    parts.push('What pattern do you notice in the tools you keep coming back to?')
    return parts.join(' ')
  },
]

const STRENGTH_TEMPLATES = [
  (d: InsightData) => {
    const parts: string[] = []
    const cats = d.topCategories || []
    if (cats.includes('Communication')) parts.push('Your focus on communication tools shows you prioritize how you connect with students and families.')
    else if (cats.includes('Classroom Setup')) parts.push('Your investment in classroom setup tools reveals someone who thinks about systems before problems arise.')
    else if (cats.includes('Instructional Strategies')) parts.push('You gravitate toward instructional strategies, which means you are always refining how you teach, not just what you teach.')
    else if (cats.includes('Self-Care') || cats.includes('Stress Relief')) parts.push('Your attention to wellness tools shows you understand that taking care of yourself is part of taking care of your students.')
    else if (cats.length > 0) parts.push(`Your focus on ${cats[0]} shows intentionality in how you approach your practice.`)
    if ((d.recognitionsEarned || 0) > 3) parts.push(`Earning ${d.recognitionsEarned} recognitions reflects someone who follows through, not just someone who browses.`)
    const unexplored = ['Assessment', 'Leadership', 'Time Savers', 'Lesson Planning'].filter(c => !cats.includes(c))
    if (unexplored.length > 0) parts.push(`To complement your strengths, consider exploring ${unexplored[0]}.`)
    return parts.join(' ') || 'Keep exploring tools to build your strength profile.'
  },
]

const NEXT_STEPS_TEMPLATES = [
  (d: InsightData) => {
    const cats = d.topCategories || []
    const unexplored = ['Assessment', 'Communication', 'Classroom Setup', 'Instructional Strategies', 'Self-Care', 'Time Savers', 'Leadership', 'Lesson Planning'].filter(c => !cats.includes(c))
    const parts: string[] = []
    if (unexplored.length > 0) parts.push(`Try a tool in ${unexplored[0]} to round out your toolkit.`)
    if ((d.communityPosts || 0) === 0) parts.push('Share your first community post about a tool that worked for you.')
    else parts.push('Check what other educators are saying in the community about tools you have tried.')
    return parts.join(' ')
  },
]

const REFLECTION_PROMPTS = [
  (d: InsightData) => {
    const cats = d.topCategories || []
    if (cats.includes('Communication')) return 'Think about the last difficult conversation you had with a parent or colleague. Which communication tool would have changed how it went?'
    if (cats.includes('Classroom Setup')) return 'If you could redesign one routine in your classroom tomorrow using what you have learned, which would have the biggest ripple effect?'
    if (cats.includes('Self-Care') || cats.includes('Stress Relief')) return 'What is the one thing you keep saying you will do for yourself but haven not started yet?'
    if (cats.includes('Instructional Strategies')) return 'Which strategy have you tried that surprised you with how well it worked? What made the difference?'
    if ((d.toolsExplored || 0) > 5) return 'Of all the tools you have explored, which one changed something small but meaningful in your day?'
    return 'What is one thing you wish you had known on your first day in education that you know now?'
  },
]

function generateGrowthNarrative(d: InsightData): string {
  const name = d.name || 'Educator'
  const role = d.role || 'educator'
  const tools = d.toolsExplored || 0
  const hours = d.pdHours || 0
  const cats = (d.topCategories || []).join(', ') || 'various professional development areas'
  const recognitions = d.recognitionsEarned || 0
  const courses = d.coursesCompleted || 0

  let narrative = `I have been actively engaged in professional development through the TDI Learning Hub, an approved PD provider recognized in all 50 states. Over the course of my learning journey, I have explored ${tools} professional tools and resources across ${cats}.`

  if (hours > 0) narrative += ` I have earned ${hours} PD hours through structured learning experiences.`
  if (courses > 0) narrative += ` I completed ${courses} course${courses === 1 ? '' : 's'}, each building on practical skills I apply in my ${role} role.`
  if (recognitions > 0) narrative += ` I earned ${recognitions} of 11 available recognitions, reflecting consistent engagement and skill application.`

  narrative += `\n\nMy focus areas have centered on ${cats}, where I have found tools that directly impact my daily practice.`
  if ((d.communityPosts || 0) > 0) narrative += ` I have also contributed ${d.communityPosts} posts to the educator community, sharing strategies and learning from peers.`

  narrative += `\n\nI plan to continue deepening my skills through the TDI Learning Hub, building on the foundation I have established and expanding into new areas of professional growth.`

  return narrative
}

function generateAdminEmail(d: InsightData): string {
  const name = d.name || 'Educator'
  const tools = d.toolsExplored || 0
  const hours = d.pdHours || 0
  const courses = d.coursesCompleted || 0
  const cats = (d.topCategories || []).join(', ') || 'multiple professional development areas'

  let email = `Dear [Principal/PD Coordinator],\n\nI wanted to share an update on my professional development through the TDI Learning Hub, which is recognized for PD credit in all 50 states.`
  if (hours > 0) email += ` I have completed ${hours} PD hours`
  if (tools > 0) email += `${hours > 0 ? ' and' : ' I have'} explored ${tools} professional tools`
  email += ` focused on ${cats}.`
  if (courses > 0) email += ` I also completed ${courses} course${courses === 1 ? '' : 's'}.`
  email += `\n\nI have attached my certificate for your records. I would be happy to share what I have learned with colleagues at our next team meeting or PD day.\n\nThank you for supporting my professional growth.\n\n${name}`

  return email
}

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing type or data' }, { status: 400 })
    }

    let insight = ''

    if (type === 'growth_narrative') {
      insight = generateGrowthNarrative(data)
    } else if (type === 'growth_patterns') {
      insight = GROWTH_PATTERNS[0](data)
    } else if (type === 'next_steps') {
      insight = NEXT_STEPS_TEMPLATES[0](data)
    } else if (type === 'admin_email') {
      insight = generateAdminEmail(data)
    } else if (type === 'strength_spotter') {
      insight = STRENGTH_TEMPLATES[0](data)
    } else if (type === 'reflection_prompt') {
      insight = REFLECTION_PROMPTS[0](data)
    } else {
      return NextResponse.json({ error: 'Unknown insight type' }, { status: 400 })
    }

    return NextResponse.json({ insight })
  } catch (error) {
    console.error('[achievements insights] error:', error)
    return NextResponse.json({ insight: '' })
  }
}
