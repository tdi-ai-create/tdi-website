import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CREATOR_STUDIO_RECIPIENTS } from '@/lib/creator-notification-recipients'

export async function POST(request: NextRequest) {
  try {
    const { creatorId, email, resume_or_fresh, content_path, projected_completion_date } = await request.json()
    if (!creatorId || !email) {
      return NextResponse.json({ error: 'Missing creatorId or email' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const updates: Record<string, any> = {
      lifecycle_state: 'active',
      unpaused_at: new Date().toISOString(),
      unpause_token: null,
      updated_at: new Date().toISOString(),
    }

    if (resume_or_fresh === 'fresh' && content_path) {
      updates.content_path = content_path
    }
    if (projected_completion_date) {
      updates.projected_completion_date = projected_completion_date
      updates.projected_date_set_at = new Date().toISOString()
      updates.projected_date_set_by = `creator:${email}`
    }

    const { error: updateError } = await (supabase.from('creators') as any)
      .update(updates)
      .eq('id', creatorId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    await (supabase.from('creator_pause_history') as any).insert({
      creator_id: creatorId,
      event_type: 'unpaused',
      triggered_by: `creator:${email}`,
      triggered_by_type: 'creator',
    })

    // Get creator name for emails
    const { data: creator } = await (supabase.from('creators') as any)
      .select('name')
      .eq('id', creatorId)
      .single()
    const firstName = creator?.name?.split(' ')[0] || 'there'

    // Send welcome-back email to creator
    const resendApiKey = process.env.RESEND_API_KEY
    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
            to: [email],
            subject: `Welcome back to Creator Studio!`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1e2749;">Welcome back, ${firstName}!</h2>
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                  Your Creator Studio account is active again. We're excited to have you back!
                </p>
                <div style="margin: 24px 0;">
                  <a href="https://www.teachersdeserveit.com/creator-portal/dashboard"
                     style="display: inline-block; background-color: #1e2749; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                    Go to Your Dashboard
                  </a>
                </div>
                <p style="color: #6b7280; font-size: 14px;">
                  Questions? Reach out anytime at <a href="mailto:creatorstudio@teachersdeserveit.com" style="color: #2563EB;">creatorstudio@teachersdeserveit.com</a>
                </p>
                <p style="color: #6b7280; font-size: 14px;">-- The TDI Team</p>
              </div>
            `,
          }),
        })
      } catch (emailErr) {
        console.error('[unpause] Email error:', emailErr)
      }

      // Notify the team
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
            to: CREATOR_STUDIO_RECIPIENTS,
            subject: `${creator?.name || email} unpaused their Creator Studio account`,
            text: `Creator: ${creator?.name || 'Unknown'} (${email})\nChoice: ${resume_or_fresh || 'resume'}\n\nView in admin: https://www.teachersdeserveit.com/tdi-admin/creators/${creatorId}`,
          }),
        })
      } catch (emailErr) {
        console.error('[unpause] Team notification error:', emailErr)
      }
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
