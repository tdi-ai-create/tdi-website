import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const SCHOOL_NOTIFICATION_THRESHOLD = 5;
const RAE_EMAIL = 'rae@teachersdeserveit.com';

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const resend = new Resend(process.env.RESEND_API_KEY!);

  try {
    const body = await request.json();
    const { name, email, school_name, state, share_consent } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Check for duplicate email
    const { data: existing } = await supabase
      .from('petition_signatures')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'This email has already signed the petition' }, { status: 409 });
    }

    // Insert signature
    const { error: insertError } = await supabase
      .from('petition_signatures')
      .insert({ name, email, school_name: school_name || null, state: state || null, share_consent: share_consent || false });

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save signature' }, { status: 500 });
    }

    // Get updated count
    const { count } = await supabase
      .from('petition_signatures')
      .select('*', { count: 'exact', head: true });

    // Send confirmation email to signer
    await resend.emails.send({
      from: 'Rae Hughart <rae@teachersdeserveit.com>',
      to: email,
      subject: 'You signed it. Now let\'s actually do something about it.',
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
          <p style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">You signed the petition.</p>
          <p style="font-size: 16px; color: #444; margin-bottom: 24px;">Welcome to the movement, ${name}.</p>

          <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">
            You just joined thousands of educators who believe PD should be chosen, not assigned - and that teacher time should go toward work that actually moves students forward.
          </p>

          <p style="font-size: 15px; line-height: 1.7; margin-bottom: 24px;">
            As a thank you, here's a free month inside the TDI Learning Hub - 33 courses, practical strategies, and a community of educators who get it.
          </p>

          <div style="background: #E1F5EE; border-left: 4px solid #1D9E75; padding: 20px 24px; border-radius: 4px; margin-bottom: 32px;">
            <p style="font-size: 13px; color: #0F6E56; margin: 0 0 6px; font-family: sans-serif; letter-spacing: 1px; text-transform: uppercase;">Your free month coupon code</p>
            <p style="font-size: 28px; font-weight: bold; color: #0F6E56; margin: 0; letter-spacing: 2px; font-family: monospace;">Free Month</p>
          </div>

          <a href="https://teachersdeserveit.com/hub" style="display: inline-block; background: #1D9E75; color: white; padding: 14px 32px; border-radius: 4px; text-decoration: none; font-family: sans-serif; font-weight: bold; font-size: 15px; margin-bottom: 32px;">
            Redeem Your Free Month
          </a>

          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />

          <p style="font-size: 14px; color: #666; line-height: 1.7; font-family: sans-serif;">
            Want to do more? Share the petition with a colleague. The more educators who sign, the louder the message.
          </p>

          <p style="font-size: 14px; color: #666; font-family: sans-serif; margin-top: 8px;">
            <a href="https://teachersdeserveit.com/movement" style="color: #1D9E75;">teachersdeserveit.com/movement</a>
          </p>

          <p style="font-size: 14px; color: #999; font-family: sans-serif; margin-top: 32px;">
            - Rae Hughart, CEO - Teachers Deserve It
          </p>
        </div>
      `,
    });

    // Check school nomination threshold
    if (school_name && school_name.trim().length > 0) {
      const normalizedSchool = school_name.trim();

      const { count: schoolCount } = await supabase
        .from('petition_signatures')
        .select('*', { count: 'exact', head: true })
        .ilike('school_name', normalizedSchool);

      if (schoolCount && schoolCount >= SCHOOL_NOTIFICATION_THRESHOLD) {
        // Check if we've already notified for this school at this threshold
        const { data: existingNotif } = await supabase
          .from('petition_school_notifications')
          .select('id, nomination_count')
          .ilike('school_name', normalizedSchool)
          .single();

        const shouldNotify = !existingNotif || existingNotif.nomination_count < SCHOOL_NOTIFICATION_THRESHOLD;

        if (shouldNotify) {
          // Send notification to Rae
          await resend.emails.send({
            from: 'TDI Movement Alert <noreply@teachersdeserveit.com>',
            to: RAE_EMAIL,
            subject: `School milestone - ${normalizedSchool} has ${schoolCount} petition signatures`,
            html: `
              <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
                <h2 style="color: #1D9E75; margin-bottom: 8px;">School Nomination Alert</h2>
                <p style="font-size: 16px; margin-bottom: 16px;">
                  <strong>${normalizedSchool}</strong> just hit <strong>${schoolCount} signatures</strong> on the petition.
                </p>
                <p style="font-size: 15px; color: #444; margin-bottom: 24px;">
                  This school has ${schoolCount} educators who believe in TDI's mission. This might be worth a conversation.
                </p>
                <a href="https://teachersdeserveit.com/tdi-admin/intelligence" style="display: inline-block; background: #1D9E75; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold;">
                  View in Intelligence Hub
                </a>
                <p style="font-size: 13px; color: #999; margin-top: 24px;">
                  Most recent signer: ${name} (${email})
                </p>
              </div>
            `,
          });

          // Upsert notification log
          await supabase
            .from('petition_school_notifications')
            .upsert({ school_name: normalizedSchool, nomination_count: schoolCount, notified_at: new Date().toISOString() }, { onConflict: 'school_name' });
        }
      }
    }

    return NextResponse.json({ success: true, count });

  } catch (error) {
    console.error('Petition sign error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
