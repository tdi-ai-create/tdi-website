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
    } else {
      return NextResponse.json({ error: 'Unknown tab type' }, { status: 400 })
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
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
    return NextResponse.json({ insight: '' })
  }
}
