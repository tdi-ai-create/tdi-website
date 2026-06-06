import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/admin/resend-welcome
 *
 * Resends the welcome email to a creator. If no creatorId is provided,
 * sends to the most recently added creator.
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }
    if (!resendApiKey) {
      return NextResponse.json({ error: 'Resend not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let creatorId: string | null = null;
    try {
      const body = await request.json();
      creatorId = body.creatorId || null;
    } catch {
      // No body, that's fine
    }

    let creator;
    if (creatorId) {
      const { data } = await supabase.from('creators').select('id, name, email').eq('id', creatorId).single();
      creator = data;
    } else {
      // Get most recently added creator
      const { data } = await supabase.from('creators').select('id, name, email').order('created_at', { ascending: false }).limit(1).single();
      creator = data;
    }

    if (!creator || !creator.email) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    const firstName = creator.name.split(' ')[0];

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
        to: [creator.email.toLowerCase()],
        cc: ['creatorstudio@teachersdeserveit.com', 'bella@teachersdeserveit.com'],
        subject: `You've Been Selected as a TDI Creator!`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e2749;">
            <div style="text-align: center; padding: 40px 20px 30px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #1e2749 0%, #2d3a5c 100%); color: white; padding: 12px 28px; border-radius: 50px; font-size: 14px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
                Application Accepted
              </div>
            </div>
            <div style="padding: 0 30px;">
              <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 16px; color: #1e2749; text-align: center;">
                Welcome to the TDI Creator Studio, ${firstName}!
              </h1>
              <p style="font-size: 16px; line-height: 1.7; color: #4a5568; text-align: center; margin-bottom: 30px;">
                We reviewed your application and loved what we saw. You've been hand-selected to join our community of educators who are turning their expertise into content that makes a real difference.
              </p>
              <div style="background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%); border-radius: 16px; padding: 28px; margin-bottom: 30px;">
                <h2 style="font-size: 18px; font-weight: 700; color: #1e2749; margin: 0 0 16px;">What Being a TDI Creator Means</h2>
                <div style="font-size: 15px; line-height: 1.8; color: #4a5568;">
                  <div style="margin-bottom: 12px;"><span style="color: #1e2749; font-weight: bold; margin-right: 10px; font-size: 18px;">1.</span><strong>Your expertise, amplified.</strong> We handle the production, design, and platform so you can focus on what you know best.</div>
                  <div style="margin-bottom: 12px;"><span style="color: #1e2749; font-weight: bold; margin-right: 10px; font-size: 18px;">2.</span><strong>You earn while you impact.</strong> TDI Creators earn 50% on every sale through your personal affiliate link.</div>
                  <div style="margin-bottom: 12px;"><span style="color: #1e2749; font-weight: bold; margin-right: 10px; font-size: 18px;">3.</span><strong>A guided process, not a guessing game.</strong> Your Creator Studio portal walks you through every step with a dedicated team supporting you.</div>
                </div>
              </div>
              <div style="background: #1e2749; border-radius: 16px; padding: 28px; margin-bottom: 30px; text-align: center;">
                <h2 style="font-size: 18px; font-weight: 700; color: white; margin: 0 0 8px;">Your Next Step</h2>
                <p style="font-size: 15px; color: rgba(255,255,255,0.8); margin: 0 0 20px;">
                  Log into your Creator Studio portal to get started. You'll choose your content path and begin building something incredible.
                </p>
                <a href="https://www.teachersdeserveit.com/creator-portal" style="display: inline-block; background: #F5A623; color: #1e2749; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px;">
                  Open Your Creator Studio
                </a>
              </div>
              <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-bottom: 30px;">
                <p style="font-size: 14px; line-height: 1.7; color: #718096; text-align: center;">
                  Questions? Reach out anytime at <a href="mailto:creatorstudio@teachersdeserveit.com" style="color: #1e2749; font-weight: 600;">creatorstudio@teachersdeserveit.com</a>
                </p>
                <p style="font-size: 14px; color: #1e2749; font-weight: 600; text-align: center; margin-top: 8px;">
                  - The TDI Team
                </p>
              </div>
            </div>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const err = await emailResponse.text();
      return NextResponse.json({ error: 'Email send failed', details: err }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      sentTo: creator.email,
      name: creator.name,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
