import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * POST /api/partners/roster-access
 *
 * Saves access assignments for a partnership's staff.
 * Updates staff_members.access_type and provisions/stores blog access.
 * Notifies Rae when blog access list is submitted.
 *
 * Body: { partnershipId, assignments: [{ id, email, firstName, lastName, hubAccess, blogAccess }] }
 */
export async function POST(request: NextRequest) {
  try {
    const { partnershipId, assignments } = await request.json();
    if (!partnershipId || !assignments) {
      return NextResponse.json({ error: 'partnershipId and assignments required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get partnership info
    const { data: partnership } = await supabase
      .from('partnerships')
      .select('id, org_name, contact_name, base_staff_enrolled')
      .eq('id', partnershipId)
      .single();

    const schoolName = partnership?.org_name || partnership?.contact_name || 'A partnership';
    let hubCount = 0;
    let blogCount = 0;
    const blogEmails: string[] = [];

    // Every write in this loop grants a real person access to something they
    // are paying for. Neither was checked, so a school could assign the Hub to
    // twenty staff, be told it worked, and have nobody receive anything.
    const failures: string[] = [];

    for (const a of assignments) {
      const accessType = a.hubAccess && a.blogAccess ? 'hub_and_blog'
        : a.hubAccess ? 'hub_only'
        : a.blogAccess ? 'blog_only'
        : 'none';

      // Update staff_members access_type
      const { error: accessError } = await supabase
        .from('staff_members')
        .update({ access_type: accessType, updated_at: new Date().toISOString() })
        .eq('id', a.id);

      if (accessError) {
        failures.push(`${a.email}: ${accessError.message}`);
        continue;
      }

      if (a.hubAccess) hubCount++;
      if (a.blogAccess) {
        // partnership_blog_access does have a unique index on
        // (partnership_id, email), so this upsert is a real one.
        const { error: blogError } = await supabase
          .from('partnership_blog_access')
          .upsert({
            partnership_id: partnershipId,
            email: a.email.toLowerCase(),
            first_name: a.firstName || null,
            last_name: a.lastName || null,
            granted_at: new Date().toISOString(),
          }, { onConflict: 'partnership_id,email' });

        if (blogError) {
          failures.push(`${a.email} blog access: ${blogError.message}`);
          continue;
        }

        blogCount++;
        blogEmails.push(a.email);
      }
    }

    // Partial success is still failure from the school's side. Name who did
    // not get access rather than reporting a total that quietly excludes them.
    if (failures.length > 0) {
      console.error('[partners/roster-access] access not granted:', failures.join('; '));
      return NextResponse.json(
        {
          error: `${failures.length} of ${assignments.length} staff could not be given access. Nothing else was changed for them. ${failures.join('; ')}`,
          failures,
        },
        { status: 500 }
      );
    }

    // Notify Rae if blog access was assigned
    if (blogCount > 0 && RESEND_API_KEY) {
      const blogList = blogEmails.map(e => `- ${e}`).join('\n');
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'TDI Admin <noreply@teachersdeserveit.com>',
          to: 'rae@teachersdeserveit.com',
          subject: `Blog access list: ${schoolName} (${blogCount} people)`,
          html: `<div style="font-family:sans-serif;color:#1e2749;font-size:14px;line-height:1.6;">
            <p><strong>${schoolName}</strong> assigned blog access for <strong>${blogCount}</strong> team members.</p>
            <p>Grant paid Substack access to these emails:</p>
            <pre style="background:#F8FAFC;padding:12px;border-radius:8px;font-size:13px;">${blogList}</pre>
            <p>${hubCount} Hub memberships assigned${partnership?.base_staff_enrolled ? ` (contract: ${partnership.base_staff_enrolled} seats)` : ''}.</p>
            <p><a href="https://www.teachersdeserveit.com/tdi-admin/leadership/${partnershipId}">Open Partnership</a></p>
          </div>`,
        }),
      }).catch(() => {});
    }

    // Log activity
    const { error: logError } = await supabase.from('activity_log').insert({
      partnership_id: partnershipId,
      action: 'roster_access_updated',
      details: { hubCount, blogCount, total: assignments.length },
    });

    if (logError) {
      console.error('[partners/roster-access] activity_log insert failed:', logError.message);
    }

    return NextResponse.json({
      success: true,
      message: `Updated: ${hubCount} Hub membership${hubCount !== 1 ? 's' : ''}, ${blogCount} blog subscription${blogCount !== 1 ? 's' : ''}.`,
    });
  } catch (error) {
    console.error('[roster-access] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
