import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { isTDIAdmin } from '@/lib/is-tdi-admin';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teachersdeserveit.com';

/**
 * POST /api/admin/partnerships/send-login-link
 *
 * Generates a Supabase magic link for a partner contact and sends it
 * via a branded Resend email. Updates invite_sent_at on the partnership.
 *
 * Body: { email, partnershipId, contactName?, schoolName? }
 */
export async function POST(request: NextRequest) {
  try {
    const adminEmail = request.headers.get('x-user-email');
    if (!adminEmail || !(await isTDIAdmin(adminEmail))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email not configured' }, { status: 500 });
    }

    const { email, partnershipId, contactName, schoolName } = await request.json();

    if (!email || !partnershipId) {
      return NextResponse.json({ error: 'email and partnershipId are required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Generate a magic link via Supabase Admin API
    const redirectTo = `${SITE_URL}/partners/login`;
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email.toLowerCase(),
      options: { redirectTo },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error('[send-login-link] generateLink error:', linkError);
      return NextResponse.json(
        { error: linkError?.message || 'Failed to generate login link' },
        { status: 500 },
      );
    }

    const loginLink = linkData.properties.action_link;
    const name = contactName ? contactName.split(' ')[0] : 'there';
    const school = schoolName || 'your school';

    const html = `
      <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:580px;margin:0 auto;color:#1e2749;font-size:15px;line-height:1.7;">
        <div style="background:#1e2749;padding:32px;text-align:center;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#E8B84B;">TDI Partner Dashboard</p>
          <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:white;">Your login link is ready</p>
          <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.6);">${school}</p>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 20px;">${name},</p>

          <p style="margin:0 0 24px;">Here is your login link for <strong>${school}&apos;s TDI Dashboard</strong>. Click the button below to sign in instantly. No password needed.</p>

          <div style="text-align:center;margin:0 0 28px;">
            <a href="${loginLink}" style="display:inline-block;padding:18px 48px;background:#E8B84B;color:#1e2749;text-decoration:none;border-radius:10px;font-size:16px;font-weight:700;">Log In Now</a>
          </div>

          <div style="border-left:3px solid #E8B84B;padding-left:16px;margin:0 0 24px;">
            <p style="margin:0;font-size:14px;color:#64748B;">This link expires in 24 hours and can only be used once. If you need a new link, contact your TDI team. Questions? Reply to this email or reach us at <a href="mailto:info@teachersdeserveit.com" style="color:#2A9D8F;font-weight:600;">info@teachersdeserveit.com</a>.</p>
          </div>

          <p style="margin:0;">The TDI Team</p>
        </div>
        <div style="background:#1e2749;padding:16px 32px;text-align:center;">
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.5);">Teachers Deserve It | teachersdeserveit.com</p>
        </div>
      </div>
    `;

    // Send via Resend
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Teachers Deserve It Team <hello@teachersdeserveit.com>',
        to: [email.toLowerCase()],
        subject: `${name}, here is your TDI Dashboard login link`,
        html,
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.error('[send-login-link] Resend error:', err);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    // Update invite_sent_at on the partnership
    const { error: updateError } = await supabase
      .from('partnerships')
      .update({ invite_sent_at: new Date().toISOString() })
      .eq('id', partnershipId);

    if (updateError) {
      console.error('[send-login-link] Failed to update invite_sent_at:', updateError);
      // Non-fatal: email was sent, just log the update failure
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[send-login-link] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
