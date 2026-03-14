import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

const EXTRACTION_PROMPT = `You are analyzing a document from a school partnership program. Extract any metrics you can find related to:

1. staff_enrolled - Total number of staff/educators enrolled
2. hub_login_pct - Percentage of staff who logged into the Hub platform
3. love_notes_count - Number of "love notes" or appreciation messages sent
4. observations_used - Number of in-person observations completed (format: X of Y)
5. observations_total - Total observations available
6. virtual_sessions_used - Number of virtual sessions completed (format: X of Y)
7. virtual_sessions_total - Total virtual sessions available
8. executive_coaching_used - Number of executive coaching sessions (format: X of Y)
9. executive_coaching_total - Total executive coaching sessions available
10. cost_per_educator - Cost per educator (numeric value only, no $ symbol)
11. momentum_status - Overall momentum status: "Strong", "Building", or "Needs Attention"

Return ONLY a JSON object with the metrics you found. Use null for any metric not found in the document.
Do not include any explanation or markdown formatting - just the raw JSON object.

Example output:
{"staff_enrolled": 25, "hub_login_pct": 89, "love_notes_count": 15, "observations_used": 2, "observations_total": 4, "virtual_sessions_used": 1, "virtual_sessions_total": 6, "executive_coaching_used": null, "executive_coaching_total": null, "cost_per_educator": 450, "momentum_status": "Strong"}`

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: partnershipId } = await params
    const userEmail = request.headers.get('x-user-email')
    const body = await request.json()
    const { fileId } = body

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 })
    }

    const anthropicApiKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicApiKey) {
      return NextResponse.json(
        { error: 'AI extraction not configured' },
        { status: 503 }
      )
    }

    const supabase = getServiceSupabase()

    // Get file record
    const { data: fileRecord, error: fetchError } = await supabase
      .from('partnership_files')
      .select('*')
      .eq('id', fileId)
      .eq('partnership_id', partnershipId)
      .single()

    if (fetchError || !fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('partnership-files')
      .download(fileRecord.storage_path)

    if (downloadError || !fileData) {
      console.error('Download error:', downloadError)
      return NextResponse.json(
        { error: 'Failed to download file' },
        { status: 500 }
      )
    }

    // Prepare content for Claude
    const anthropic = new Anthropic({ apiKey: anthropicApiKey })

    let extractedData: Record<string, any> = {}

    // Handle different file types
    if (fileRecord.content_type === 'application/pdf') {
      // For PDF, we need to convert to base64 and use document processing
      const arrayBuffer = await fileData.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: base64
                }
              },
              {
                type: 'text',
                text: EXTRACTION_PROMPT
              }
            ]
          }
        ]
      })

      const textContent = response.content.find(c => c.type === 'text')
      if (textContent && textContent.type === 'text') {
        try {
          extractedData = JSON.parse(textContent.text)
        } catch {
          console.error('Failed to parse extraction response:', textContent.text)
          return NextResponse.json(
            { error: 'Failed to parse extracted data' },
            { status: 500 }
          )
        }
      }
    } else if (fileRecord.content_type?.startsWith('image/')) {
      // For images, use vision capabilities
      const arrayBuffer = await fileData.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      const mediaType = fileRecord.content_type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64
                }
              },
              {
                type: 'text',
                text: EXTRACTION_PROMPT
              }
            ]
          }
        ]
      })

      const textContent = response.content.find(c => c.type === 'text')
      if (textContent && textContent.type === 'text') {
        try {
          extractedData = JSON.parse(textContent.text)
        } catch {
          console.error('Failed to parse extraction response:', textContent.text)
          return NextResponse.json(
            { error: 'Failed to parse extracted data' },
            { status: 500 }
          )
        }
      }
    } else if (fileRecord.content_type === 'text/csv' ||
               fileRecord.content_type?.includes('spreadsheet') ||
               fileRecord.content_type?.includes('excel')) {
      // For CSV/Excel, read as text
      const text = await fileData.text()

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Here is the content of a spreadsheet/CSV file:\n\n${text}\n\n${EXTRACTION_PROMPT}`
          }
        ]
      })

      const textContent = response.content.find(c => c.type === 'text')
      if (textContent && textContent.type === 'text') {
        try {
          extractedData = JSON.parse(textContent.text)
        } catch {
          console.error('Failed to parse extraction response:', textContent.text)
          return NextResponse.json(
            { error: 'Failed to parse extracted data' },
            { status: 500 }
          )
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type for extraction' },
        { status: 400 }
      )
    }

    // Update file record with extracted data
    const { error: updateError } = await supabase
      .from('partnership_files')
      .update({
        extracted_data: extractedData,
        extracted_at: new Date().toISOString()
      })
      .eq('id', fileId)

    if (updateError) {
      console.error('Failed to save extracted data:', updateError)
    }

    return NextResponse.json({
      success: true,
      extracted: extractedData
    })
  } catch (error) {
    console.error('Extraction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
