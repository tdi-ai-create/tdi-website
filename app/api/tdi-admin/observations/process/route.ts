import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { getServiceSupabase } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'
import { logAIUsage } from '@/lib/ai-usage'

export const maxDuration = 120

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  try {
    const { visitId } = await request.json()

    if (!visitId) {
      return NextResponse.json({ error: 'visitId is required' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI processing not configured (missing API key)' }, { status: 503 })
    }

    const supabase = getServiceSupabase()

    // Fetch the visit record
    const { data: visit, error: visitError } = await supabase
      .from('observation_visits')
      .select('*')
      .eq('id', visitId)
      .single()

    if (visitError || !visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
    }

    // Update status to processing
    const { error: processingError } = await supabase
      .from('observation_visits')
      .update({ status: 'processing' })
      .eq('id', visitId)

    if (processingError) {
      console.error('[Observations] Could not mark visit as processing', processingError)
      return NextResponse.json(
        { error: 'Could not start processing this visit' },
        { status: 500 }
      )
    }

    // Fetch the partnership staff roster
    const { data: staff } = await supabase
      .from('staff_members')
      .select('id, first_name, last_name, email, role_title')
      .eq('partnership_id', visit.partnership_id)

    const roster = (staff || []).map((s: any) => ({
      id: s.id,
      first_name: s.first_name,
      last_name: s.last_name,
      email: s.email,
      role_title: s.role_title,
    }))

    // Download notepad photos from storage as base64
    const photos = visit.notepad_photos || []
    const imageBlocks: Anthropic.ImageBlockParam[] = []

    for (const photo of photos) {
      try {
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('partnership-files')
          .download(photo.storage_path)

        if (downloadError || !fileData) {
          console.error('[Observations] Failed to download photo:', photo.storage_path, downloadError)
          continue
        }

        const arrayBuffer = await fileData.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')

        imageBlocks.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: base64,
          },
        })
      } catch (err) {
        console.error('[Observations] Failed to process photo:', photo.storage_path, err)
      }
    }

    if (imageBlocks.length === 0) {
      const { error: revertError } = await supabase
        .from('observation_visits')
        .update({ status: 'uploaded' })
        .eq('id', visitId)
      if (revertError) {
        console.error('[Observations] Could not revert visit to uploaded', revertError)
      }
      return NextResponse.json(
        { error: 'Could not load any photos for processing' },
        { status: 400 }
      )
    }

    // Build the system prompt
    const systemPrompt = `You are analyzing handwritten observation notes from a school visit by a TDI educational consultant. The notes describe specific moments of educator practice observed in classrooms.

Staff roster for this school:
${JSON.stringify(roster, null, 2)}

Your job:
1. Read and transcribe the handwritten text from the notepad photos
2. Identify each educator mentioned by name
3. For each educator, extract the specific moments/practices observed
4. Match educator names to the staff roster (fuzzy match, first name or last name)
5. Draft a Love Note for each educator. A Love Note is a warm, specific celebration email. It should:
   - Address the educator by first name
   - Open by thanking them for letting us pop in, and tell them they are an amazing teacher
   - List every specific moment you observed as a bullet, aiming for 8-12 (use the actual notes, never generic praise)
   - Include at least 3 things actually said, quoted word for word, attributed to a student or to the teacher
   - Be warm and personal, never evaluative or rubric-like, and never a score
   - End with 2 suggested Hub resources related to their practice, one quick win and one game where possible
   - Close warmly: we are here all day to talk it through, another time is fine, and we are in their corner
6. For each educator, suggest strategy tags from this list: Proximity, Small Group Facilitation, De-escalation, Checking for Understanding, Routine Building, Communication with Teacher, Student Engagement, Differentiation, Positive Reinforcement, Hub Content in Action, Independent Initiative, Questioning Techniques
7. For each educator, suggest growth indicators from this list: Saw Confidence, Saw Independence, Saw Collaboration, Saw Hub Content Applied, Saw Student Responsiveness, Saw Reflection/Self-Awareness
8. Generate a visit summary with coaching themes and key wins

Return a JSON object with this exact structure:
{
  "raw_text": "full transcription of all notes",
  "educators": [
    {
      "name": "educator name from notes",
      "matched_roster_id": "UUID from roster or null",
      "matched_email": "email from roster or null",
      "love_note": "the full Love Note text",
      "strategy_tags": ["tag1", "tag2"],
      "growth_indicators": ["indicator1"],
      "hub_resources": ["resource suggestion 1"]
    }
  ],
  "summary": {
    "coaching_themes": ["theme1", "theme2"],
    "key_wins": ["win1", "win2"],
    "areas_to_watch": ["area1"],
    "board_summary": "One paragraph board-ready summary of the visit"
  }
}

Return ONLY the JSON. No markdown formatting, no explanation.`

    // Call Claude with vision
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            ...imageBlocks,
            {
              type: 'text',
              text: 'Please analyze these handwritten observation notes and return the structured JSON as specified.',
            },
          ],
        },
      ],
    })

    // Extract text response
    const textBlock = message.content.find((b) => b.type === 'text')
    const rawResponse = textBlock ? (textBlock as Anthropic.TextBlock).text : ''

    // Parse JSON
    let parsed: any
    try {
      // Try to extract JSON from the response (in case of markdown wrapping)
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawResponse)
    } catch {
      console.error('[Observations] Failed to parse AI response:', rawResponse.slice(0, 500))
      const { error: revertParseError } = await supabase
        .from('observation_visits')
        .update({ status: 'uploaded' })
        .eq('id', visitId)
      if (revertParseError) {
        console.error('[Observations] Could not revert visit to uploaded', revertParseError)
      }
      return NextResponse.json(
        { error: 'AI response could not be parsed. Please try again.' },
        { status: 500 }
      )
    }

    // Create observation_notes records (one per educator)
    const educators = parsed.educators || []
    for (const edu of educators) {
      const { error: noteError } = await supabase.from('observation_notes').insert({
        visit_id: visitId,
        educator_name: edu.name,
        educator_id: edu.matched_roster_id || null,
        educator_email: edu.matched_email || null,
        love_note_draft: edu.love_note,
        strategy_tags: edu.strategy_tags || [],
        growth_indicators: edu.growth_indicators || [],
        hub_resources_spotted: edu.hub_resources || [],
      })

      if (noteError) {
        // A dropped note means a teacher who was observed never gets one.
        console.error('[Observations] Could not save Love Note for', edu.name, noteError)
        return NextResponse.json(
          { error: `Could not save the note for ${edu.name}. Nothing was sent.` },
          { status: 500 }
        )
      }
    }

    // Create observation_summaries record
    const summary = parsed.summary || {}
    const { error: summaryError } = await supabase.from('observation_summaries').insert({
      visit_id: visitId,
      partnership_id: visit.partnership_id,
      coaching_themes: summary.coaching_themes || [],
      key_wins: summary.key_wins || [],
      areas_to_watch: summary.areas_to_watch || [],
      board_summary: summary.board_summary || '',
    })

    if (summaryError) {
      console.error('[Observations] Could not save visit summary', summaryError)
    }

    // Update visit status
    const { error: processedError } = await supabase
      .from('observation_visits')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString(),
        raw_notes: parsed.raw_text || '',
      })
      .eq('id', visitId)

    if (processedError) {
      // The notes are saved. If the visit never reaches processed, nobody can
      // review or send them, so this has to be visible rather than silent.
      console.error('[Observations] Notes saved but visit status not updated', processedError)
      return NextResponse.json(
        { error: 'Notes were saved but the visit could not be marked processed.' },
        { status: 500 }
      )
    }

    // Create timeline event
    const { error: timelineError } = await supabase.from('timeline_events').insert({
      partnership_id: visit.partnership_id,
      event_type: 'observation',
      event_title: `Visit #${visit.visit_number} processed (${educators.length} educators)`,
      event_date: visit.visit_date,
      status: 'completed',
      notes: `Observation visit processed. ${educators.length} Love Notes drafted.`,
    })

    if (timelineError) {
      console.error('[Observations] Could not write the timeline event', timelineError)
    }

    // Log AI usage
    logAIUsage({
      userId: auth.user.id,
      endpoint: 'observations/process',
      model: 'claude-sonnet-4-6',
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
      metadata: { visitId, educatorCount: educators.length },
    })

    return NextResponse.json({
      success: true,
      educators_found: educators.length,
      summary: {
        coaching_themes: summary.coaching_themes,
        key_wins: summary.key_wins,
      },
    })
  } catch (error) {
    console.error('[Observations] Process error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
