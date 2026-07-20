import { NextRequest, NextResponse } from 'next/server'

// --- Template functions (no AI) ---

function generateEducatorProfileInsight(context: string): string {
  // Extract key details from context string to build a structured summary
  const lines = context.split('\n').filter((l: string) => l.trim())
  const details: string[] = []

  for (const line of lines) {
    const trimmed = line.trim().replace(/^[-*]\s*/, '')
    if (trimmed.length > 0) {
      details.push(trimmed)
    }
  }

  if (details.length === 0) {
    return 'Welcome to the TDI Learning Hub. As you explore tools and engage with the community, your profile insights will grow to reflect your journey.'
  }

  // Build a warm summary from available context
  const summary = details.slice(0, 5).join('. ')
  return `Here is what stands out about your journey so far. ${summary}. Keep building on this momentum as you continue exploring the Hub.`
}

function generateGrowthInsight(data: {
  toolsExplored?: number
  hoursSaved?: number
  daysActive?: number
  communityContributions?: number
  recognitionsEarned?: number
  goals?: string[]
}): string {
  const parts: string[] = []

  const tools = data.toolsExplored ?? 0
  const hours = data.hoursSaved ?? 0
  const days = data.daysActive ?? 0
  const contributions = data.communityContributions ?? 0
  const recognitions = data.recognitionsEarned ?? 0
  const goals = data.goals ?? []

  // Tools + hours
  if (tools > 0 && hours > 0) {
    parts.push(
      `You have explored ${tools} tool${tools !== 1 ? 's' : ''} so far, saving roughly ${hours} hour${hours !== 1 ? 's' : ''}. That is real time back in your day.`
    )
  } else if (tools > 0) {
    parts.push(
      `You have explored ${tools} tool${tools !== 1 ? 's' : ''} so far. Each one is a step toward working smarter, not harder.`
    )
  } else {
    parts.push(
      'You have not explored any tools yet. Start with one that addresses your biggest daily time drain and build from there.'
    )
  }

  // Activity + community
  if (days > 0 && contributions > 0) {
    parts.push(
      `With ${days} active day${days !== 1 ? 's' : ''} and ${contributions} community contribution${contributions !== 1 ? 's' : ''}, you are building a consistent practice.`
    )
  } else if (days > 0) {
    parts.push(
      `You have been active for ${days} day${days !== 1 ? 's' : ''}. Consistency matters more than speed.`
    )
  }

  // Recognitions
  if (recognitions > 0) {
    parts.push(
      `You have earned ${recognitions} recognition${recognitions !== 1 ? 's' : ''}, which shows your engagement is making an impact.`
    )
  }

  // Goals
  if (goals.length > 0) {
    parts.push(
      `Your current goals: ${goals.join(', ')}. What is one small step you could take this week toward the goal that matters most to you?`
    )
  } else {
    parts.push(
      'What is one thing you would like to improve in your workflow this month?'
    )
  }

  return parts.join('\n\n')
}

function generateVibeCheckInsight(data: {
  checkIns?: Array<{ score: number; category: string; date: string }>
  totalCheckIns?: number
  dimensionsChecked?: string[]
}): string {
  const checkIns = data.checkIns || []
  const total = data.totalCheckIns ?? 0
  const dimensions = data.dimensionsChecked || []

  if (checkIns.length === 0 && total === 0) {
    return 'You have not logged any vibe checks yet. Taking a moment to check in with yourself, even once a week, can reveal patterns you might not notice otherwise. What is one area of your work life you would like to pay closer attention to?'
  }

  const parts: string[] = []

  // Calculate average score
  const recent = checkIns.slice(0, 10)
  if (recent.length > 0) {
    const avg = recent.reduce((sum, c) => sum + c.score, 0) / recent.length
    const avgRounded = Math.round(avg * 10) / 10

    if (avgRounded >= 4) {
      parts.push(
        `Your recent average vibe score is ${avgRounded} out of 5. You are in a strong place right now, and that consistency is worth noticing.`
      )
    } else if (avgRounded >= 3) {
      parts.push(
        `Your recent average vibe score is ${avgRounded} out of 5. You are holding steady, which takes more effort than people realize.`
      )
    } else {
      parts.push(
        `Your recent average vibe score is ${avgRounded} out of 5. It looks like things have been tough lately. Recognizing that is the first step toward shifting it.`
      )
    }

    // Look for trends (improving or declining)
    if (recent.length >= 3) {
      const firstHalf = recent.slice(Math.floor(recent.length / 2))
      const secondHalf = recent.slice(0, Math.floor(recent.length / 2))
      const firstAvg =
        firstHalf.reduce((s, c) => s + c.score, 0) / firstHalf.length
      const secondAvg =
        secondHalf.reduce((s, c) => s + c.score, 0) / secondHalf.length

      if (secondAvg - firstAvg >= 0.5) {
        parts.push('Your scores have been trending upward recently. Whatever you are doing differently, it seems to be working.')
      } else if (firstAvg - secondAvg >= 0.5) {
        parts.push('Your scores have dipped a bit recently. That happens. Pay attention to what changed and whether there is something you can adjust.')
      }
    }

    // Category breakdown
    const categoryScores: Record<string, number[]> = {}
    for (const c of recent) {
      if (!categoryScores[c.category]) categoryScores[c.category] = []
      categoryScores[c.category].push(c.score)
    }
    const cats = Object.entries(categoryScores)
    if (cats.length > 1) {
      const sorted = cats
        .map(([cat, scores]) => ({
          cat,
          avg: scores.reduce((a, b) => a + b, 0) / scores.length,
        }))
        .sort((a, b) => b.avg - a.avg)
      const strongest = sorted[0]
      const weakest = sorted[sorted.length - 1]
      if (strongest.avg - weakest.avg >= 1) {
        parts.push(
          `Your strongest area is ${strongest.cat} (${Math.round(strongest.avg * 10) / 10}), while ${weakest.cat} (${Math.round(weakest.avg * 10) / 10}) could use some attention.`
        )
      }
    }
  }

  // Total + dimensions
  if (total > 0) {
    parts.push(
      `You have logged ${total} check-in${total !== 1 ? 's' : ''} total${dimensions.length > 0 ? ` across ${dimensions.join(', ')}` : ''}.`
    )
  }

  parts.push(
    'What is one thing that consistently affects your energy at work, and what would it look like to protect that?'
  )

  return parts.join('\n\n')
}

function generatePartnershipReportInsight(
  data: { prompt?: string },
  context?: string
): string {
  const reportPrompt = data?.prompt || context || ''

  if (!reportPrompt) {
    return ''
  }

  // Extract and structure the data from the prompt
  const lines = reportPrompt.split('\n').filter((l: string) => l.trim())
  const sections: string[] = []

  sections.push('PARTNERSHIP REPORT SUMMARY')
  sections.push('')

  // Pass through the structured content, cleaning it up
  let currentSection = ''
  for (const line of lines) {
    const trimmed = line.trim()

    // Skip meta-instructions (lines that look like prompts to an AI)
    if (
      trimmed.toLowerCase().startsWith('write') ||
      trimmed.toLowerCase().startsWith('generate') ||
      trimmed.toLowerCase().startsWith('create') ||
      trimmed.toLowerCase().startsWith('format') ||
      trimmed.toLowerCase().startsWith('include') ||
      trimmed.toLowerCase().startsWith('use ')
    ) {
      continue
    }

    // Detect section headers
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !trimmed.startsWith('-')) {
      currentSection = trimmed
      sections.push(trimmed)
      sections.push('')
      continue
    }

    // Include data lines
    if (trimmed.length > 0) {
      sections.push(trimmed)
    }
  }

  sections.push('')
  sections.push('KEY CONTEXT')
  sections.push('')
  sections.push(
    '- TDI partnerships achieve a 74% implementation rate, compared to the 10% national average for professional development programs.'
  )
  sections.push(
    '- This report reflects data from the TDI Learning Hub and partnership engagement tracking.'
  )
  sections.push('')
  sections.push('NEXT STEPS')
  sections.push('')
  sections.push(
    '- Review educator engagement data for areas of strength and opportunity.'
  )
  sections.push(
    '- Schedule a partnership check-in to discuss progress and upcoming priorities.'
  )
  sections.push(
    '- Continue building on current momentum heading into the next phase.'
  )

  return sections.join('\n')
}

// --- Route handler ---

export async function POST(request: NextRequest) {
  try {
    const { tab, data, context } = await request.json()

    if (!tab || (!data && !context)) {
      return NextResponse.json({ error: 'Missing tab or data' }, { status: 400 })
    }

    let insight = ''

    if (tab === 'educator_profile') {
      insight = generateEducatorProfileInsight(context || '')
    } else if (tab === 'growth') {
      insight = generateGrowthInsight(data || {})
    } else if (tab === 'vibe_check') {
      insight = generateVibeCheckInsight(data || {})
    } else if (tab === 'partnership_report') {
      const reportPrompt = data?.prompt || context
      if (!reportPrompt) {
        return NextResponse.json({ error: 'Missing report prompt' }, { status: 400 })
      }
      insight = generatePartnershipReportInsight(data || {}, context)
    } else {
      return NextResponse.json({ error: 'Unknown tab type' }, { status: 400 })
    }

    return NextResponse.json({ insight })
  } catch (error) {
    console.error('[insights] error:', error)
    // For partnership reports, return the error so the client can fall back gracefully
    if (request) {
      try {
        const body = await request.clone().json().catch(() => ({}))
        if (body.tab === 'partnership_report') {
          return NextResponse.json({ insight: '', error: String(error) })
        }
      } catch {}
    }
    return NextResponse.json({ insight: '' })
  }
}
