import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const HUB_URL = 'https://www.teachersdeserveit.com/hub';

/**
 * GET /api/cron/contract-expiration
 *
 * Runs daily at 8 AM CT. Checks all active partnerships for upcoming
 * or past contract expirations. Sends educator emails at 30/14/3 days
 * before expiration. Auto-downgrades memberships on expiration date.
 *
 * Email sequence:
 *   Day -30: Full heads-up (features, options, copy-paste for principal)
 *   Day -14: Reminder (condensed)
 *   Day  -3: Final notice (urgent)
 *   Day   0: Downgrade to free + confirmation email
 *
 * From: Teachers Deserve It Team <hello@teachersdeserveit.com>
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const isVercelCron = request.headers.get('x-vercel-cron') === '1';
      if (!isVercelCron) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!RESEND_API_KEY) return NextResponse.json({ error: 'Resend not configured' }, { status: 500 });

    const portalSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const hubUrl = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
    const hubKey = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;
    if (!hubUrl || !hubKey) return NextResponse.json({ error: 'Hub not configured' }, { status: 500 });

    const hubSupabase = createClient(hubUrl, hubKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    let emailsSent = 0;
    let downgraded = 0;

    // Get all active partnerships with contract_end dates
    const { data: partnerships } = await portalSupabase
      .from('partnerships')
      .select('id, slug, contact_name, contact_email, org_name, contract_end, staff_enrolled')
      .eq('status', 'active')
      .not('contract_end', 'is', null);

    if (!partnerships || partnerships.length === 0) {
      return NextResponse.json({ success: true, emailsSent: 0, downgraded: 0, message: 'No partnerships with contract dates' });
    }

    for (const p of partnerships) {
      const contractEnd = new Date(p.contract_end + 'T00:00:00');
      const daysRemaining = Math.floor((contractEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const schoolName = p.org_name || p.contact_name || 'your school';
      const expirationDate = contractEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      // Get all_access members for this partnership
      const { data: members } = await hubSupabase
        .from('hub_memberships')
        .select('id, user_id, email:user_id')
        .eq('source', 'district_partner')
        .eq('tier', 'all_access')
        .eq('partnership_id', p.id);

      // If no partnership_id match, try email domain matching
      let memberEmails: string[] = [];
      if (members && members.length > 0) {
        // Get emails from profiles
        const userIds = members.map(m => m.user_id).filter(Boolean);
        if (userIds.length > 0) {
          const { data: profiles } = await hubSupabase
            .from('hub_profiles')
            .select('id, email')
            .in('id', userIds.slice(0, 500));
          memberEmails = (profiles || []).map(pr => pr.email).filter(Boolean);
        }
      }

      // Fallback: get emails from profiles linked by partnership_id
      if (memberEmails.length === 0) {
        const { data: profiles } = await hubSupabase
          .from('hub_profiles')
          .select('email')
          .eq('partnership_id', p.id)
          .limit(500);
        memberEmails = (profiles || []).map(pr => pr.email).filter(Boolean);
      }

      if (memberEmails.length === 0) continue;

      // Check which emails have already been sent for this contract
      const { data: sentEmails } = await portalSupabase
        .from('activity_log')
        .select('action')
        .eq('partnership_id', p.id)
        .like('action', `contract_expiration_%_${p.contract_end}`);

      const sent = new Set((sentEmails || []).map(e => e.action));
      const headsUpKey = `contract_expiration_heads_up_${p.contract_end}`;
      const reminderKey = `contract_expiration_reminder_${p.contract_end}`;
      const finalKey = `contract_expiration_final_notice_${p.contract_end}`;
      const downgradeKey = `contract_expiration_downgrade_${p.contract_end}`;

      // Determine which email to send based on days remaining
      // Supports compressed timelines: if no heads_up sent yet and
      // contract is expiring within 14 days, send heads_up first
      let emailType: 'heads_up' | 'reminder' | 'final_notice' | 'downgrade' | null = null;

      if (daysRemaining <= 0 && !sent.has(downgradeKey)) {
        // Expiration day or past -- downgrade
        emailType = 'downgrade';
      } else if (daysRemaining <= 3 && daysRemaining > 0 && !sent.has(finalKey)) {
        // 3 days or less -- final notice (skip if heads_up never sent, send that first)
        if (!sent.has(headsUpKey)) {
          emailType = 'heads_up';
        } else {
          emailType = 'final_notice';
        }
      } else if (daysRemaining <= 14 && daysRemaining > 3 && !sent.has(headsUpKey)) {
        // Within 14 days and never notified -- send heads_up (compressed)
        emailType = 'heads_up';
      } else if (daysRemaining <= 14 && daysRemaining > 3 && sent.has(headsUpKey) && !sent.has(reminderKey)) {
        // Heads up sent, within 14 days -- send reminder
        emailType = 'reminder';
      } else if (daysRemaining === 30 && !sent.has(headsUpKey)) {
        emailType = 'heads_up';
      } else if (daysRemaining === 14 && !sent.has(reminderKey)) {
        emailType = 'reminder';
      } else if (daysRemaining === 3 && !sent.has(finalKey)) {
        emailType = 'final_notice';
      }

      if (!emailType) continue;

      const actionKey = `contract_expiration_${emailType}_${p.contract_end}`;
      if (sent.has(actionKey)) continue;

      // Build email content
      const { subject, html } = buildExpirationEmail(emailType, {
        schoolName,
        expirationDate,
        contactName: p.contact_name || '',
      });

      // Send to all members
      let sendSuccess = 0;
      for (const email of memberEmails) {
        const resp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Teachers Deserve It Team <hello@teachersdeserveit.com>',
            to: email,
            subject,
            html,
          }),
        });
        if (resp.ok) sendSuccess++;
      }

      emailsSent += sendSuccess;

      // On downgrade day, change memberships from all_access to free
      if (emailType === 'downgrade') {
        // Update hub_memberships
        const { data: toDowngrade } = await hubSupabase
          .from('hub_profiles')
          .select('id')
          .eq('partnership_id', p.id);

        if (toDowngrade && toDowngrade.length > 0) {
          const userIds = toDowngrade.map(td => td.id);
          const { count } = await hubSupabase
            .from('hub_memberships')
            .update({
              tier: 'free',
              updated_at: new Date().toISOString(),
            })
            .in('user_id', userIds)
            .eq('tier', 'all_access')
            .eq('source', 'district_partner');

          downgraded = count || 0;
        }
      }

      // Log that we sent this email type
      await portalSupabase.from('activity_log').insert({
        partnership_id: p.id,
        action: actionKey,
        details: {
          type: emailType,
          recipients: sendSuccess,
          total_members: memberEmails.length,
          contract_end: p.contract_end,
          downgraded: emailType === 'downgrade' ? downgraded : undefined,
        },
      });
    }

    return NextResponse.json({ success: true, emailsSent, downgraded });
  } catch (error) {
    console.error('[contract-expiration] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

function buildExpirationEmail(
  type: 'heads_up' | 'reminder' | 'final_notice' | 'downgrade',
  ctx: { schoolName: string; expirationDate: string; contactName: string }
): { subject: string; html: string } {
  const { schoolName, expirationDate } = ctx;

  const featuresSection = `
    <hr style="border:none;border-top:1px solid #E5E7EB;margin:32px 0;" />
    <p style="margin:0 0 4px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94A3B8;">Have You Seen What is New in the Hub?</p>
    <p style="margin:0 0 20px;font-size:14px;color:#64748B;">We have been building. A lot. Here is what is waiting for you.</p>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:14px;"><tr>
      <td style="width:44px;vertical-align:top;padding-right:12px;"><div style="width:40px;height:40px;border-radius:10px;background:#DCFCE7;text-align:center;line-height:40px;font-size:18px;">&#9889;</div></td>
      <td><p style="margin:0;font-size:14px;font-weight:700;color:#1e2749;">145+ Quick Wins</p><p style="margin:0;font-size:12px;color:#64748B;">5-minute tools across 12 categories.</p></td>
    </tr></table>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:14px;"><tr>
      <td style="width:44px;vertical-align:top;padding-right:12px;"><div style="width:40px;height:40px;border-radius:10px;background:#FEF9C3;text-align:center;line-height:40px;font-size:18px;">&#127918;</div></td>
      <td><p style="margin:0;font-size:14px;font-weight:700;color:#1e2749;">9 Interactive Practice Games</p><p style="margin:0;font-size:12px;color:#64748B;">Real scenarios. Track your scores. Play solo or with your team.</p></td>
    </tr></table>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:14px;"><tr>
      <td style="width:44px;vertical-align:top;padding-right:12px;"><div style="width:40px;height:40px;border-radius:10px;background:#E0E7FF;text-align:center;line-height:40px;font-size:18px;">&#127891;</div></td>
      <td><p style="margin:0;font-size:14px;font-weight:700;color:#1e2749;">Courses That Count</p><p style="margin:0;font-size:12px;color:#64748B;">Earn PD hours with verifiable certificates.</p></td>
    </tr></table>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:14px;"><tr>
      <td style="width:44px;vertical-align:top;padding-right:12px;"><div style="width:40px;height:40px;border-radius:10px;background:#F3E8FF;text-align:center;line-height:40px;font-size:18px;">&#128150;</div></td>
      <td><p style="margin:0;font-size:14px;font-weight:700;color:#1e2749;">I Need a Moment</p><p style="margin:0;font-size:12px;color:#64748B;">A private reset tool for the hard days.</p></td>
    </tr></table>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:14px;"><tr>
      <td style="width:44px;vertical-align:top;padding-right:12px;"><div style="width:40px;height:40px;border-radius:10px;background:#FFEDD5;text-align:center;line-height:40px;font-size:18px;">&#128172;</div></td>
      <td><p style="margin:0;font-size:14px;font-weight:700;color:#1e2749;">Community Q&A</p><p style="margin:0;font-size:12px;color:#64748B;">Ask questions and learn from educators across the country.</p></td>
    </tr></table>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:4px;"><tr>
      <td style="width:44px;vertical-align:top;padding-right:12px;"><div style="width:40px;height:40px;border-radius:10px;background:#CFFAFE;text-align:center;line-height:40px;font-size:18px;">&#127758;</div></td>
      <td><p style="margin:0;font-size:14px;font-weight:700;color:#1e2749;">Full Spanish Translation</p><p style="margin:0;font-size:12px;color:#64748B;">Toggle between English and Spanish across the entire Hub.</p></td>
    </tr></table>
  `;

  const optionsSection = `
    <div style="background:#F8FAFC;border-radius:12px;padding:24px;margin:24px 0;">
      <p style="margin:0 0 16px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94A3B8;">Two Ways to Keep Full Access</p>
      <div style="margin-bottom:20px;">
        <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#1e2749;">1. Forward this email to your principal</p>
        <p style="margin:0 0 10px;font-size:14px;color:#64748B;">Click forward and let them know your team values this resource. Or copy the text below:</p>
        <div style="background:white;border:1px solid #E5E7EB;border-radius:8px;padding:14px 16px;margin-top:8px;">
          <p style="margin:0;font-size:13px;color:#334155;line-height:1.6;font-style:italic;">"Hi, our TDI Learning Hub all-access membership expires ${expirationDate}. The Hub has quick wins, PD courses, classroom strategies, and stress management tools that our team has been using. Can we look into renewing? They can be reached at info@teachersdeserveit.com or our school trainer (Rae Hughart, rae@teachersdeserveit.com) from last year can help. Here is more info: teachersdeserveit.com/for-schools"</p>
        </div>
      </div>
      <div>
        <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#1e2749;">2. Keep your own membership</p>
        <p style="margin:0 0 6px;font-size:14px;color:#64748B;">We now offer individual membership tiers so you can keep full access on your own.</p>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:10px 0;">
          <tr><td style="padding:8px 12px;background:white;border:1px solid #E5E7EB;border-radius:8px 8px 0 0;"><p style="margin:0;font-size:13px;font-weight:700;color:#1e2749;">Free</p><p style="margin:0;font-size:12px;color:#94A3B8;">Select Quick Wins, community features, account access</p></td></tr>
          <tr><td style="padding:8px 12px;background:white;border:1px solid #E5E7EB;border-top:none;"><p style="margin:0;font-size:13px;font-weight:700;color:#1e2749;">Essentials</p><p style="margin:0;font-size:12px;color:#94A3B8;">All Quick Wins, practice games, community Q&A</p></td></tr>
          <tr><td style="padding:8px 12px;background:white;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 8px 8px;"><p style="margin:0;font-size:13px;font-weight:700;color:#1e2749;">Professional</p><p style="margin:0;font-size:12px;color:#94A3B8;">Everything in Essentials + courses, PD hours, certificates</p></td></tr>
        </table>
        <a href="${HUB_URL}/membership" style="color:#2A9D8F;font-size:14px;font-weight:600;text-decoration:none;">View Plans & Pricing &rarr;</a>
      </div>
    </div>
  `;

  const keepSection = `
    <div style="border-left:3px solid #D9E8E2;padding-left:16px;margin:24px 0;">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0F4438;">What You Will NOT Lose</p>
      <p style="margin:0;font-size:14px;color:#64748B;">Your free Hub account, any certificates you have already earned, access to free Quick Wins, and community features all stay with you.</p>
    </div>
  `;

  const footer = `
    <div style="background:#F8FAFC;padding:20px 32px;border-top:1px solid #E5E7EB;">
      <p style="margin:0;font-size:12px;color:#9CA3AF;text-align:center;">
        This email was sent by Teachers Deserve It because your school, ${schoolName}, partnered with TDI to provide you with professional development support.
      </p>
    </div>
  `;

  const wrap = (body: string) => `
    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:580px;margin:0 auto;color:#1e2749;font-size:15px;line-height:1.7;">
      <div style="background:#1e2749;padding:24px 32px;">
        <p style="margin:0;color:white;font-size:18px;font-weight:700;">Teachers Deserve It</p>
        <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:13px;">Learning Hub Update</p>
      </div>
      <div style="padding:32px;">${body}</div>
      ${footer}
    </div>
  `;

  if (type === 'heads_up') {
    return {
      subject: `Your TDI Hub access is changing on ${expirationDate}`,
      html: wrap(`
        <p style="margin:0 0 16px;">Hi there,</p>
        <p style="margin:0 0 16px;">Your school's partnership with Teachers Deserve It included all-access to the TDI Learning Hub this year. That access updates on <strong>${expirationDate}</strong>.</p>
        <p style="margin:0 0 16px;">After that date, you will still have a free Hub account with access to select tools. But courses, PD hours, certificates, and premium Quick Wins will require an active membership.</p>
        ${optionsSection}
        ${keepSection}
        ${featuresSection}
        <div style="text-align:center;margin:32px 0 16px;">
          <a href="${HUB_URL}" style="display:inline-block;padding:16px 36px;background:#1e2749;color:white;text-decoration:none;border-radius:10px;font-size:15px;font-weight:700;">Open the Learning Hub</a>
        </div>
        <p style="margin:0;">The TDI Team</p>
      `),
    };
  }

  if (type === 'reminder') {
    return {
      subject: `Two weeks left: your TDI Hub all-access expires ${expirationDate}`,
      html: wrap(`
        <p style="margin:0 0 16px;">Hi there,</p>
        <p style="margin:0 0 16px;">Just a reminder that your all-access TDI Learning Hub membership through ${schoolName} expires on <strong>${expirationDate}</strong>. That is two weeks from now.</p>
        <p style="margin:0 0 16px;">After that date, your account switches to the free plan. You keep your account and certificates, but courses, PD hours, and premium tools will require a membership.</p>
        ${optionsSection}
        <div style="text-align:center;margin:24px 0 16px;">
          <a href="${HUB_URL}" style="display:inline-block;padding:14px 32px;background:#1e2749;color:white;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;">Open the Learning Hub</a>
        </div>
        <p style="margin:0;">The TDI Team</p>
      `),
    };
  }

  if (type === 'final_notice') {
    const endDay = new Date(expirationDate).toLocaleDateString('en-US', { weekday: 'long' });
    return {
      subject: `This ${endDay}: your TDI Hub all-access expires`,
      html: wrap(`
        <p style="margin:0 0 16px;">Hi there,</p>
        <p style="margin:0 0 16px;">Your all-access TDI Learning Hub membership expires <strong>this ${endDay}, ${expirationDate}</strong>.</p>
        <p style="margin:0 0 16px;">After that, your account moves to the free plan. Everything you have earned stays with you. But if you want to keep full access, now is the time to act.</p>
        <p style="margin:0 0 16px;">Forward this email to your principal and ask about renewing, or keep your own membership:</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${HUB_URL}/membership" style="display:inline-block;padding:14px 32px;background:#2A9D8F;color:white;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;">View Membership Plans</a>
        </div>
        <p style="margin:0 0 16px;font-size:14px;color:#64748B;">Your principal can reach us at <a href="mailto:info@teachersdeserveit.com" style="color:#2A9D8F;">info@teachersdeserveit.com</a> or contact Rae Hughart at <a href="mailto:rae@teachersdeserveit.com" style="color:#2A9D8F;">rae@teachersdeserveit.com</a> to renew.</p>
        <p style="margin:0;">The TDI Team</p>
      `),
    };
  }

  // downgrade
  return {
    subject: 'Your TDI Hub account has been updated to the free plan',
    html: wrap(`
      <p style="margin:0 0 16px;">Hi there,</p>
      <p style="margin:0 0 16px;">Your school's TDI partnership access period has ended, and your Hub account has been updated to the <strong>free plan</strong>.</p>
      ${keepSection}
      <p style="margin:0 0 16px;">If your school renews, you will be upgraded automatically. Or you can keep full access on your own:</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${HUB_URL}/membership" style="display:inline-block;padding:14px 32px;background:#1e2749;color:white;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;">Upgrade Your Account</a>
      </div>
      <p style="margin:0 0 16px;font-size:14px;color:#64748B;">Questions? Reach us at <a href="mailto:info@teachersdeserveit.com" style="color:#2A9D8F;">info@teachersdeserveit.com</a></p>
      <p style="margin:0;">The TDI Team</p>
    `),
  };
}
