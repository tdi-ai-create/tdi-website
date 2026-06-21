import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * POST /api/partners/request-date
 *
 * Principal requests a date for an observation day, virtual session,
 * or executive session. TDI team gets notified and confirms.
 *
 * Body: { partnershipId, eventType, preferredDate, alternateDate, notes, requesterName, requesterEmail }
 */
export async function POST(request: NextRequest) {
  try {
    const { partnershipId, eventType, preferredDate, alternateDate, notes, requesterName, requesterEmail, needsTravel } = await request.json();

    if (!partnershipId || !eventType || !preferredDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: partnership } = await supabase
      .from('partnerships')
      .select('org_name, contact_name, slug')
      .eq('id', partnershipId)
      .single();

    const schoolName = partnership?.org_name || partnership?.contact_name || 'Partnership';

    // Create timeline event as "upcoming" with requested date
    await supabase.from('timeline_events').insert({
      partnership_id: partnershipId,
      event_title: eventType,
      event_date: preferredDate,
      event_type: eventType.toLowerCase().includes('observation') ? 'observation' : 'session',
      status: 'upcoming',
      notes: notes || null,
    });

    // Log activity
    await supabase.from('activity_log').insert({
      partnership_id: partnershipId,
      action: 'date_requested',
      details: { eventType, preferredDate, alternateDate, notes },
    });

    // Notify TDI team
    if (RESEND_API_KEY) {
      const preferred = new Date(preferredDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      const alternate = alternateDate ? new Date(alternateDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'None provided';

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Teachers Deserve It Team <hello@teachersdeserveit.com>',
          to: ['hello@teachersdeserveit.com'],
          subject: `Date Request: ${eventType} at ${schoolName}`,
          text: `${requesterName || 'A principal'} from ${schoolName} is requesting a date for:\n\nEvent: ${eventType}\nPreferred: ${preferred}\nAlternate: ${alternate}\nNotes: ${notes || 'None'}\n\nPartnership: ${partnershipId}\nDashboard: https://www.teachersdeserveit.com/tdi-admin/leadership/${partnershipId}\n\nConfirm or suggest a new date, then reply to the principal at ${requesterEmail}.`,
        }),
      });
    }

    // Confirm to the requester
    if (RESEND_API_KEY && requesterEmail) {
      const preferred = new Date(preferredDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Teachers Deserve It Team <hello@teachersdeserveit.com>',
          to: [requesterEmail.toLowerCase()],
          subject: `Date request received: ${eventType}`,
          html: `
            <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e2749;font-size:15px;line-height:1.7;">
              <p>We received your request to schedule a ${eventType} on ${preferred}.</p>
              <p>Our team will confirm within 48 hours. If the date works, you will receive a confirmation email with everything you need to prepare (which is almost nothing).</p>
              <p>If we need to adjust, we will reach out with alternatives.</p>
              <p>The TDI Team</p>
            </div>
          `,
        }),
      });
    }

    // Send travel booking notification for in-person events
    if (needsTravel && RESEND_API_KEY) {
      const preferred = new Date(preferredDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Teachers Deserve It Team <hello@teachersdeserveit.com>',
          to: ['hello@teachersdeserveit.com'],
          subject: `Travel Event Needed: ${eventType} at ${schoolName}`,
          text: `A date has been requested that requires travel.\n\nSchool: ${schoolName}\nEvent: ${eventType}\nRequested Date: ${preferred}\nAlternate: ${alternateDate ? new Date(alternateDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'None'}\nNotes: ${notes || 'None'}\nContact: ${requesterName} (${requesterEmail})\n\nOnce the date is confirmed, book travel accordingly.\n\nPartnership: https://www.teachersdeserveit.com/tdi-admin/leadership/${partnershipId}`,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, message: 'Date request submitted. We will confirm within 48 hours.' });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
