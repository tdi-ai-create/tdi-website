import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { creatorId, creatorName, creatorEmail, contentPath, message } = await request.json()

    if (!creatorId || !creatorEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Add a visible note for the creator
    await (supabase.from('creator_notes') as any).insert({
      creator_id: creatorId,
      content: "You asked to chat with the team. We'll be in touch within 24 hours.",
      author: 'TDI Team',
      visible_to_creator: true,
    })

    // Send notification email to team
    const resendApiKey = process.env.RESEND_API_KEY
    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
            to: ['creatorstudio@teachersdeserveit.com', 'rae@teachersdeserveit.com'],
            subject: `Pep talk requested: ${creatorName || creatorEmail}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px;">
                <h2 style="color: #1e2749;">Pep talk requested</h2>
                <p><strong>${creatorName || 'A creator'}</strong> (${creatorEmail}) would like to chat with the team before continuing.</p>
                <p><strong>Content path:</strong> ${contentPath || 'Not yet selected'}</p>
                ${message ? `<p><strong>Their message:</strong> ${message}</p>` : '<p><em>No additional message provided.</em></p>'}
                <p style="margin-top: 20px; color: #6B7280;">Reach out within 24 hours to keep the momentum going.</p>
              </div>
            `,
          }),
        })
      } catch (emailErr) {
        console.error('[pep-talk] Email send failed:', emailErr)
      }
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
