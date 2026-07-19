import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * POST /api/partners/invite-leader
 *
 * Allows a principal to invite another leader (AP, department head, etc.)
 * to view the partnership dashboard. Creates a portal account and sends
 * an invite email. Notifies Rae.
 *
 * Body: { partnershipId, name, email, role }
 */
export async function POST(request: NextRequest) {
  try {
    const { partnershipId, name, email, role } = await request.json();

    if (!partnershipId || !email) {
      return NextResponse.json({ error: 'Partnership ID and email required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify partnership exists
    const { data: partnership } = await supabase
      .from('partnerships')
      .select('id, slug, org_name, contact_name')
      .eq('id', partnershipId)
      .single();

    if (!partnership) {
      return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
    }

    const schoolName = partnership.org_name || partnership.contact_name || 'your school';
    const firstName = (name || '').split(' ')[0] || 'there';
    const dashboardUrl = `https://www.teachersdeserveit.com/partners/${partnership.slug}`;

    // Create Supabase auth account via invite
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teachersdeserveit.com'}/partners/login`,
        data: {
          partnership_id: partnershipId,
          name: name || email,
        },
      }
    );

    if (inviteError) {
      // If user already exists, just link them
      if (inviteError.message?.includes('already registered')) {
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === email.toLowerCase());

        if (existingUser) {
          await supabase.from('partnership_users').upsert({
            partnership_id: partnershipId,
            user_id: existingUser.id,
            role: role || 'viewer',
          }, { onConflict: 'partnership_id,user_id' });

          // Notify Rae
          if (RESEND_API_KEY) {
            fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                from: 'TDI Admin <noreply@teachersdeserveit.com>',
                to: 'rae@teachersdeserveit.com',
                subject: `Dashboard access added: ${name || email} at ${schoolName}`,
                html: `<p><strong>${schoolName}</strong> added <strong>${name || email}</strong> (${email}) as a dashboard viewer. They already had an account.</p>
                  <p><a href="https://www.teachersdeserveit.com/tdi-admin/leadership/${partnershipId}">View Partnership</a></p>`,
              }),
            }).catch(() => {});
          }

          return NextResponse.json({
            success: true,
            message: `${firstName} already has an account and has been given access to this dashboard.`,
          });
        }
      }
      return NextResponse.json({ error: 'Failed to create account. Please contact info@teachersdeserveit.com.' }, { status: 500 });
    }

    // Link new user to partnership
    if (inviteData?.user) {
      await supabase.from('partnership_users').upsert({
        partnership_id: partnershipId,
        user_id: inviteData.user.id,
        role: role || 'viewer',
      }, { onConflict: 'partnership_id,user_id' });
    }

    // Log activity
    await supabase.from('activity_log').insert({
      partnership_id: partnershipId,
      action: 'leader_invited',
      details: { name, email, role: role || 'viewer', invited_by: 'partner' },
    });

    // Notify Rae
    if (RESEND_API_KEY) {
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'TDI Admin <noreply@teachersdeserveit.com>',
          to: 'rae@teachersdeserveit.com',
          subject: `New dashboard invite: ${name || email} at ${schoolName}`,
          html: `<p><strong>${schoolName}</strong> invited <strong>${name || email}</strong> (${email}) to view their dashboard.</p>
            <p>Role: ${role || 'viewer'}</p>
            <p><a href="https://www.teachersdeserveit.com/tdi-admin/leadership/${partnershipId}">View Partnership</a></p>`,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: `Invite sent to ${firstName}. They will receive an email to set up their login.`,
    });
  } catch (error) {
    console.error('[invite-leader] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
