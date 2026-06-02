import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing type or data' }, { status: 400 })
    }

    let prompt = ''
    let maxTokens = 300

    const baseContext = `You are an AI growth coach for educators on the TDI Learning Hub, a professional development platform recognized in all 50 US states. Write in a warm, professional tone. Use "you" voice. No emojis. No hashtags. No markdown formatting (no asterisks, no bold, no headers). Just plain text. Be specific about their numbers.

Educator data:
- Name: ${data.name || 'Educator'}
- Role: ${data.role || 'Educator'}
- Tools explored: ${data.toolsExplored || 0}
- Hours saved: ${data.hoursSaved || '0'}
- Days active: ${data.daysActive || 0}
- Recognitions earned: ${data.recognitionsEarned || 0} of 11
- Earned recognitions: ${(data.earnedNames || []).join(', ') || 'none yet'}
- Top categories explored: ${(data.topCategories || []).join(', ') || 'various'}
- Community posts: ${data.communityPosts || 0}
- Courses completed: ${data.coursesCompleted || 0}
- PD hours earned: ${data.pdHours || 0}`

    if (type === 'growth_narrative') {
      maxTokens = 400
      prompt = `${baseContext}

Write a professional development growth narrative that this educator can paste directly into their evaluation portfolio or annual review. It should:
- Be written in first person ("I completed...", "I focused on...")
- Reference the TDI Learning Hub as "an approved PD provider recognized in all 50 states"
- Include specific numbers (tools, hours, recognitions)
- Mention their focus areas
- Be 3-4 paragraphs, formal but warm
- End with a forward-looking statement about continued growth
- Do NOT include a date or header -- just the narrative text`

    } else if (type === 'growth_patterns') {
      maxTokens = 150
      prompt = `${baseContext}

Write 2-3 short personalized insights about this educator's growth patterns. Be specific about numbers and what they reveal. Each insight should be 1-2 sentences. End with one thought-provoking reflection question. Keep it under 80 words total. Be real, not cheesy.`

    } else if (type === 'next_steps') {
      maxTokens = 120
      prompt = `${baseContext}

Based on their activity patterns, recommend 2 specific next steps. Each should be 1 sentence and actionable. Frame them as opportunities, not tasks. Reference specific tools or categories they haven't tried yet. Keep it under 60 words total.`

    } else if (type === 'admin_email') {
      maxTokens = 400
      prompt = `${baseContext}

Write a professional email from this educator to their principal or PD coordinator. The email should:
- Start with "Dear [Principal/PD Coordinator],"
- Summarize their professional development through the TDI Learning Hub
- Reference specific numbers (hours, tools, courses)
- Mention that TDI is recognized for PD credit in all 50 states
- Attach their certificate (reference "attached certificate")
- Offer to share what they learned with colleagues
- End with "Thank you for supporting my professional growth."
- Sign with their name
- Be concise (under 150 words)
- Sound professional and confident, not boastful`

    } else if (type === 'strength_spotter') {
      maxTokens = 120
      prompt = `${baseContext}

Identify this educator's top 2 strength areas based on their activity. For each strength, write one sentence explaining what it reveals about their teaching practice. Then suggest one area they could explore to complement their strengths. Keep it under 70 words total. Be genuine and specific.`

    } else if (type === 'reflection_prompt') {
      maxTokens = 60
      prompt = `${baseContext}

Generate ONLY one personalized reflection question based on their recent activity. Output ONLY the question itself -- no greeting, no preamble, no "Hi", no context. Just the question. One sentence. Make it thought-provoking and specific to their activity.`

    } else {
      return NextResponse.json({ error: 'Unknown insight type' }, { status: 400 })
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    })

    // Log AI usage
    const { logAIUsage } = await import('@/lib/ai-usage')
    logAIUsage({
      endpoint: 'achievements',
      model: 'claude-sonnet-4-20250514',
      inputTokens: response.usage?.input_tokens || 0,
      outputTokens: response.usage?.output_tokens || 0,
      metadata: { type },
    })

    const text = response.content[0]
    if (text.type !== 'text') {
      return NextResponse.json({ insight: '' })
    }

    return NextResponse.json({ insight: text.text })
  } catch (error) {
    console.error('[achievements insights] error:', error)
    return NextResponse.json({ insight: '' })
  }
}
