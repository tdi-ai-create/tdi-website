import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';

/**
 * POST /api/admin/provision-roster
 *
 * Batch provisions Hub All-Access for all staff in a partnership's roster.
 * Creates hub_memberships records for each staff member who doesn't already have one.
 * Updates staff_members.hub_enrolled = true for each provisioned member.
 * Sends each of them the Hub welcome email.
 *
 * Two things were wrong with this route.
 *
 * It reported success when it did nothing. The roster query filters on
 * staff_members, so a partnership whose roster was never loaded matched zero
 * rows and the route returned success:true with the message "All staff already
 * provisioned." That is precisely backwards, and it happened to the three
 * partnerships that most needed provisioning: St. Mary, Allenwood and Oak Grove
 * all had empty rosters on 26 Aug 2026.
 *
 * It also never told anyone. api/hub/emails/staff-welcome exists and works, but
 * it was only wired into the partner-facing roster routes, the ones a principal
 * uses on their own dashboard. This route, the one TDI uses when provisioning
 * on a school's behalf, created accounts in silence. Measured 26 Aug 2026: 216
 * live partner seats, of which only Roosevelt's 16 came through a path that
 * emails anyone, and 43 educators have ever opened the Hub.
 *
 * Body: { partnershipId }
 * Query: ?dryRun=1 computes the full decision set and reports it, writing
 * nothing and sending nothing.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) return auth;

    const dryRun = request.nextUrl.searchParams.get('dryRun') === '1';
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;

    const { partnershipId } = await request.json();
    if (!partnershipId) {
      return NextResponse.json({ error: 'partnershipId is required' }, { status: 400 });
    }

    const portalSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const hubUrl = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
    const hubKey = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;

    if (!hubUrl || !hubKey) {
      return NextResponse.json({ error: 'Hub Supabase not configured' }, { status: 500 });
    }

    const hubSupabase = createClient(hubUrl, hubKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get partnership slug for Hub nav toggle
    const { data: partnershipInfo } = await portalSupabase
      .from('partnerships')
      .select('slug, org_name, contact_name, staff_enrolled')
      .eq('id', partnershipId)
      .single();

    const partnershipSlug = partnershipInfo?.slug || null;
    const schoolName = partnershipInfo?.org_name || partnershipInfo?.contact_name || 'your school';
    const contractedSeats = partnershipInfo?.staff_enrolled ?? 0;

    // Get all staff who aren't provisioned yet
    const { data: staff, error: staffError } = await portalSupabase
      .from('staff_members')
      .select('id, email, first_name, last_name, role_title')
      .eq('partnership_id', partnershipId)
      .eq('hub_enrolled', false);

    if (staffError) {
      return NextResponse.json({ error: staffError.message }, { status: 500 });
    }

    if (!staff || staff.length === 0) {
      // Distinguish "everyone is already done" from "there is nobody to do".
      // Returning success for the second case is how three partnerships were
      // reported as provisioned while having no access at all.
      const { count: rosterSize, error: countError } = await portalSupabase
        .from('staff_members')
        .select('id', { count: 'exact', head: true })
        .eq('partnership_id', partnershipId);

      if (countError) {
        return NextResponse.json({ error: countError.message }, { status: 500 });
      }

      if (!rosterSize || rosterSize === 0) {
        return NextResponse.json(
          {
            success: false,
            provisioned: 0,
            rosterSize: 0,
            contractedSeats,
            error:
              contractedSeats > 0
                ? `Nothing to provision. This partnership has no roster, and ${contractedSeats} seats are contracted. Load the roster first.`
                : 'Nothing to provision. This partnership has no roster.',
          },
          { status: 409 }
        );
      }

      return NextResponse.json({
        success: true,
        provisioned: 0,
        rosterSize,
        contractedSeats,
        message: `All ${rosterSize} staff on the roster are already provisioned.`,
      });
    }

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        contractedSeats,
        wouldProvision: staff.length,
        wouldEmail: staff.filter((m) => m.email).length,
        skippedNoEmail: staff.filter((m) => !m.email).length,
        recipients: staff.filter((m) => m.email).map((m) => m.email),
        message: `Dry run. Would provision ${staff.length} and send ${staff.filter((m) => m.email).length} welcome emails. Nothing written, nothing sent.`,
      });
    }

    let provisioned = 0;
    let failed = 0;
    let welcomeSent = 0;
    let welcomeFailed = 0;

    for (const member of staff) {
      if (!member.email) continue;
      const email = member.email.toLowerCase();

      try {
        // Step 1: Find or create Hub user
        const { data: existingProfile } = await hubSupabase
          .from('hub_profiles')
          .select('id')
          .ilike('email', email)
          .maybeSingle();

        let userId: string;

        if (existingProfile) {
          userId = existingProfile.id;
        } else {
          // Create auth user in Hub
          const { data: authUser, error: authError } = await hubSupabase.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: {
              display_name: `${member.first_name || ''} ${member.last_name || ''}`.trim() || email.split('@')[0],
              source: 'district_partner',
            },
          });

          if (authError || !authUser?.user) {
            console.error('[provision-roster] Auth error for:', email, authError?.message);
            failed++;
            continue;
          }

          userId = authUser.user.id;

          // Create hub_profile. A failure here leaves an auth user with no
          // profile, which is worse than not creating them at all, so it counts
          // as a failure for this member rather than being ignored.
          const { error: profileInsertError } = await hubSupabase.from('hub_profiles').upsert({
            id: userId,
            email,
            display_name: `${member.first_name || ''} ${member.last_name || ''}`.trim() || email.split('@')[0],
            first_name: member.first_name || null,
            last_name: member.last_name || null,
            partnership_id: partnershipId,
            partnership_slug: partnershipSlug,
            onboarding_completed: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });

          if (profileInsertError) {
            console.error('[provision-roster] Profile create failed for:', email, profileInsertError.message);
            failed++;
            continue;
          }
        }

        // Step 2: Create/update Hub membership using user_id (not email)
        const { error: membershipError } = await hubSupabase
          .from('hub_memberships')
          .upsert({
            user_id: userId,
            tier: 'all_access',
            source: 'district_partner',
            status: 'active',
            partnership_id: partnershipId,
          }, { onConflict: 'user_id' });

        if (membershipError) {
          console.error('[provision-roster] Membership error for:', email, membershipError.message);
          failed++;
          continue;
        }

        // Step 3: Update existing profile with partnership info
        if (existingProfile) {
          const { error: profileUpdateError } = await hubSupabase
            .from('hub_profiles')
            .update({
              partnership_id: partnershipId,
              partnership_slug: partnershipSlug,
              first_name: member.first_name || undefined,
              last_name: member.last_name || undefined,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          // Not fatal: the seat is what grants access. But an unlinked profile
          // is how St. Mary ended up invisible to every partnership query, so
          // it is worth knowing about.
          if (profileUpdateError) {
            console.error('[provision-roster] Profile link failed for:', email, profileUpdateError.message);
          }
        }

        // Step 4: Mark as enrolled in portal
        const { error: enrolledError } = await portalSupabase
          .from('staff_members')
          .update({
            hub_enrolled: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', member.id);

        // The seat exists either way, but if this flag does not stick the next
        // run will try to provision the same person again.
        if (enrolledError) {
          console.error('[provision-roster] hub_enrolled flag failed for:', email, enrolledError.message);
        }

        provisioned++;

        // Tell them the account exists. This route created accounts in silence
        // until now, which is the likeliest reason 173 of 216 provisioned
        // educators have never opened the Hub.
        //
        // Awaited and counted rather than fire and forget. The three partner
        // facing callers of this endpoint use fetch(...).catch(console.error)
        // with no await, so nobody can say whether those sends ever landed.
        try {
          const welcomeRes = await fetch(`${baseUrl}/api/hub/emails/staff-welcome`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              firstName: member.first_name || email.split('@')[0],
              schoolName,
              roleTitle: member.role_title || null,
            }),
          });
          if (welcomeRes.ok) {
            welcomeSent++;
          } else {
            welcomeFailed++;
            console.error('[provision-roster] Welcome email rejected for:', email, welcomeRes.status);
          }
        } catch (mailErr) {
          welcomeFailed++;
          console.error('[provision-roster] Welcome email failed for:', email, mailErr);
        }
      } catch (err) {
        console.error('[provision-roster] Error for:', email, err);
        failed++;
      }
    }

    // Mark the "Provision staff Hub accounts" action item as completed
    const { error: actionItemError } = await portalSupabase
      .from('action_items')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: auth.member.email,
        updated_at: new Date().toISOString(),
      })
      .eq('partnership_id', partnershipId)
      .ilike('title', '%provision%hub%')
      .eq('status', 'pending');

    if (actionItemError) {
      console.error('[provision-roster] Action item completion failed:', actionItemError.message);
    }

    // Log activity
    const { error: activityError } = await portalSupabase.from('activity_log').insert({
      partnership_id: partnershipId,
      action: 'roster_provisioned',
      details: { provisioned, failed, welcomeSent, welcomeFailed, total: staff.length, by: auth.member.email },
    });

    // The log is the only durable record that this ran and what it sent.
    if (activityError) {
      console.error('[provision-roster] Activity log write failed:', activityError.message);
    }

    return NextResponse.json({
      success: true,
      provisioned,
      failed,
      welcomeSent,
      welcomeFailed,
      contractedSeats,
      total: staff.length,
      message: `Provisioned Hub All-Access for ${provisioned} staff member${provisioned !== 1 ? 's' : ''} and sent ${welcomeSent} welcome email${welcomeSent !== 1 ? 's' : ''}.${failed > 0 ? ` ${failed} provisioning failure${failed !== 1 ? 's' : ''}.` : ''}${welcomeFailed > 0 ? ` ${welcomeFailed} email${welcomeFailed !== 1 ? 's' : ''} did not send.` : ''}`,
    });
  } catch (error) {
    console.error('[provision-roster] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
