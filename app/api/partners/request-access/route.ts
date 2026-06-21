import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * POST /api/partners/request-access
 *
 * Principal requests dashboard access for additional team members
 * (AP, coach, etc.). Sends notification to TDI team for processing.
 *
 * Body: { partnershipId, requesterName, requesterEmail, newMembers: [{ name, email, role }] }
 */
export async function POST(request: NextRequest) {
  try {
    const { partnershipId, requesterName, requesterEmail, newMembers } = await request.json();

    if (!partnershipId || !newMembers || newMembers.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get partnership info
    const { data: partnership } = await supabase
      .from('partnerships')
      .select('org_name, contact_name, slug')
      .eq('id', partnershipId)
      .single();

    const schoolName = partnership?.org_name || partnership?.contact_name || 'Partnership';

    // Log the request
    await supabase.from('activity_log').insert({
      partnership_id: partnershipId,
      action: 'team_access_requested',
      details: {
        requested_by: requesterName || requesterEmail,
        members: newMembers,
      },
    });

    // Notify TDI team
    if (RESEND_API_KEY) {
      const memberList = newMembers.map((m: { name: string; email: string; role: string }) =>
        `- ${m.name || 'No name'} (${m.email}) -- ${m.role || 'Team member'}`
      ).join('\n');

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Teachers Deserve It Team <hello@teachersdeserveit.com>',
          to: ['hello@teachersdeserveit.com'],
          subject: `Team Access Request: ${schoolName}`,
          text: `${requesterName || 'A principal'} from ${schoolName} is requesting dashboard access for:\n\n${memberList}\n\nPartnership: ${partnershipId}\nDashboard: https://www.teachersdeserveit.com/tdi-admin/leadership/${partnershipId}`,
        }),
      });
    }

    // Confirm to the requester
    if (RESEND_API_KEY && requesterEmail) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Teachers Deserve It Team <hello@teachersdeserveit.com>',
          to: [requesterEmail.toLowerCase()],
          subject: 'Team access request received',
          html: `
            <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e2749;font-size:15px;line-height:1.7;">
              <p>We received your request to add team members to your dashboard. We will set up their access and let you know when it is ready.</p>
              <p>This usually takes less than 24 hours.</p>
              <p>The TDI Team</p>
            </div>
          `,
        }),
      });
    }

    return NextResponse.json({ success: true, message: 'Request submitted. We will set up access within 24 hours.' });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
