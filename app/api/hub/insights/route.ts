import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { tab, data, context } = await request.json()

    if (!tab || (!data && !context)) {
      return NextResponse.json({ error: 'Missing tab or data' }, { status: 400 })
    }

    let prompt = ''

    if (tab === 'educator_profile') {
      prompt = `You are a warm, encouraging AI coach for educators on the TDI Learning Hub. ${context}

Keep it under 100 words total. No emojis. No bullet points. Write in short paragraphs. Be real, not cheesy.`
    } else if (tab === 'growth') {
      prompt = `You are a warm, encouraging AI coach for educators on the TDI Learning Hub. Based on this educator's data, write 2-3 short personalized insights. Be specific about their numbers. Use "you" voice. No emojis. No bullet points. Write in short paragraphs (1-2 sentences each). End with one thoughtful question they could reflect on.

Data:
- Tools explored: ${data.toolsExplored}
- Hours saved: ${data.hoursSaved}
- Days active: ${data.daysActive}
- Community contributions: ${data.communityContributions}
- Recognitions earned: ${data.recognitionsEarned}
- Goals: ${data.goals?.join(', ') || 'none set yet'}

Keep it under 100 words total. Be real, not cheesy.`
    } else if (tab === 'vibe_check') {
      const checkInSummary = (data.checkIns || [])
        .slice(0, 10)
        .map((c: { score: number; category: string; date: string }) => `${c.date}: ${c.category} = ${c.score}/5`)
        .join(', ')

      prompt = `You are a warm, encouraging AI coach for educators on the TDI Learning Hub. Based on this educator's vibe check data, write 2-3 short personalized insights about their wellbeing trends. Be specific about patterns you see. Use "you" voice. No emojis. No bullet points. Write in short paragraphs (1-2 sentences each). End with one thoughtful question for self-reflection.

Vibe Check data (score 1=tough day, 5=great day):
${checkInSummary || 'No check-ins yet'}

Total check-ins: ${data.totalCheckIns || 0}
Dimensions checked: ${data.dimensionsChecked?.join(', ') || 'none yet'}

Keep it under 100 words total. Be honest and caring, not clinical.`
    } else if (tab === 'partnership_report') {
      const reportPrompt = data?.prompt || context;
      if (!reportPrompt) {
        return NextResponse.json({ error: 'Missing report prompt' }, { status: 400 })
      }
      prompt = `You are a professional report writer for Teachers Deserve It (TDI), an education company that partners with schools for year-long professional development.

Voice rules:
- Warm, direct, honest, no fluff
- Never use em dashes. Use commas or periods instead.
- No emojis
- Professional but human, not corporate
- Always position TDI positively with specific data points
- Include the 74% implementation rate stat (vs 10% national average) where relevant
- End sections with forward-looking language

${reportPrompt}

Write the full report content. Use ALL CAPS for section headers. Use bullet points with - for lists. Keep it thorough but readable.`
    } else {
      return NextResponse.json({ error: 'Unknown tab type' }, { status: 400 })
    }

    const maxTokens = tab === 'partnership_report' ? 1500 : 200;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    })

    // Log AI usage
    const { logAIUsage } = await import('@/lib/ai-usage')
    logAIUsage({
      endpoint: 'insights',
      model: 'claude-sonnet-4-20250514',
      inputTokens: response.usage?.input_tokens || 0,
      outputTokens: response.usage?.output_tokens || 0,
      metadata: { tab },
    })

    const text = response.content[0]
    if (text.type !== 'text') {
      return NextResponse.json({ insight: '' })
    }

    return NextResponse.json({ insight: text.text })
  } catch (error) {
    console.error('[insights] error:', error)
    // For partnership reports, return the error so the client can fall back gracefully
    if (request) {
      try {
        const body = await request.clone().json().catch(() => ({}));
        if (body.tab === 'partnership_report') {
          return NextResponse.json({ insight: '', error: String(error) })
        }
      } catch {}
    }
    return NextResponse.json({ insight: '' })
  }
}
