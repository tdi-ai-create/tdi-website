import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/admin/deal-to-partnership
 *
 * Triggered when a Sales deal is marked as Signed. Creates:
 * 1. Partnership record in Leadership (linked to Sales deal)
 * 2. Client dashboard with unique slug
 * 3. Hub All-Access provisioning for contact
 * 4. Onboarding action items (partner-visible + admin-only)
 * 5. Welcome email to principal
 *
 * Body: { dealId, partnershipType, contractPhase, staffCount,
 *         observationDays, virtualSessions, executiveSessions,
 *         contractStart, contractEnd, buildingCount, partnershipGoal }
 */

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) throw new Error('Missing Supabase credentials');
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getUniqueSlug(supabase: any, name: string): Promise<string> {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);

  let slug = base;
  let counter = 1;

  while (true) {
    const { data } = await supabase
      .from('partnerships')
      .select('id')
      .eq('slug', slug)
      .limit(1);

    if (!data || data.length === 0) return slug;
    slug = `${base}-${counter}`;
    counter++;
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();

    const {
      dealId,
      partnershipType = 'school',
      contractPhase = 'IGNITE',
      staffCount = 0,
      observationDays = 0,
      virtualSessions = 0,
      executiveSessions = 0,
      contractStart,
      contractEnd,
      buildingCount = 1,
      partnershipGoal,
    } = body;

    if (!dealId) {
      return NextResponse.json({ error: 'dealId is required' }, { status: 400 });
    }

    // 1. Get the Sales deal
    const { data: deal, error: dealError } = await supabase
      .from('sales_opportunities')
      .select('*')
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    console.log('[deal-to-partnership] Processing deal:', deal.name, deal.id);

    // 2. Check if partnership already exists for this deal
    const { data: existing } = await supabase
      .from('partnerships')
      .select('id, slug')
      .eq('sales_deal_id', dealId)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({
        error: 'Partnership already exists for this deal',
        partnershipId: existing[0].id,
        dashboardUrl: `/partners/${existing[0].slug}`,
      }, { status: 409 });
    }

    // 3. Generate unique dashboard slug
    const slug = await getUniqueSlug(supabase, deal.name);

    // 4. Create partnership record
    // Use correct column names from schema:
    // observation_days_used (not _completed), virtual_sessions_used, executive_sessions_used
    // staff_enrolled exists (migration 015), partnership_goal exists (migration 016)
    // phone does NOT exist on partnerships (it's on organizations), so skip it
    const partnershipInsert: Record<string, unknown> = {
      partnership_type: partnershipType,
      slug,
      contact_name: deal.contact_name || deal.name,
      contact_email: deal.contact_email,
      contract_phase: contractPhase,
      contract_start: contractStart || new Date().toISOString().split('T')[0],
      contract_end: contractEnd || null,
      building_count: buildingCount,
      observation_days_total: observationDays,
      observation_days_used: 0,
      virtual_sessions_total: virtualSessions,
      virtual_sessions_used: 0,
      executive_sessions_total: executiveSessions,
      executive_sessions_used: 0,
      staff_enrolled: staffCount,
      status: 'active',
      partnership_goal: partnershipGoal || null,
      sales_deal_id: dealId,
      invite_sent_at: new Date().toISOString(),
    };

    const { data: partnership, error: partnershipError } = await supabase
      .from('partnerships')
      .insert(partnershipInsert)
      .select()
      .single();

    if (partnershipError) {
      console.error('[deal-to-partnership] Error creating partnership:', partnershipError);
      return NextResponse.json({ error: 'Failed to create partnership: ' + partnershipError.message }, { status: 500 });
    }

    const partnershipId = partnership?.id;
    if (!partnershipId) {
      return NextResponse.json({ error: 'Partnership created but ID missing' }, { status: 500 });
    }

    // Also create the organization record so org_name appears in the admin view
    await supabase.from('organizations').insert({
      partnership_id: partnershipId,
      name: deal.name,
      org_type: partnershipType,
      address_city: deal.city || null,
      address_state: deal.state || null,
      website: deal.website || null,
    });

    console.log('[deal-to-partnership] Partnership created:', partnershipId, slug);

    // 5. Create onboarding action items
    const actionItems = [
      // Partner-visible items (principal sees these on their dashboard)
      {
        partnership_id: partnershipId,
        title: 'Upload staff roster',
        description: 'Upload your staff list with names, roles, and email addresses so we can set up Hub accounts.',
        category: 'onboarding',
        priority: 'high',
        status: 'pending',
        visible_to_partner: true,
        sort_order: 1,
      },
      {
        partnership_id: partnershipId,
        title: 'Upload roster photos',
        description: 'Share staff headshots for Hub profiles. If photos are not available, teachers can upload their own after logging in.',
        category: 'onboarding',
        priority: 'medium',
        status: 'pending',
        visible_to_partner: true,
        sort_order: 2,
      },
      {
        partnership_id: partnershipId,
        title: 'Identify your staff champion',
        description: 'Choose a teacher or coach who will help encourage Hub adoption. This person will join a brief demo session with us.',
        category: 'onboarding',
        priority: 'high',
        status: 'pending',
        visible_to_partner: true,
        sort_order: 3,
      },
      {
        partnership_id: partnershipId,
        title: 'Schedule kickoff walkthrough',
        description: 'Book your 20-minute Dashboard walkthrough with TDI. This is where we show you exactly what your data looks like.',
        category: 'onboarding',
        priority: 'high',
        status: 'pending',
        visible_to_partner: true,
        sort_order: 4,
        cta_label: 'Schedule via Calendly',
        cta_url: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone',
      },
      {
        partnership_id: partnershipId,
        title: 'Distribute Hub access to staff',
        description: 'Share the Hub login link with your team. Every staff member has an account ready to go.',
        category: 'onboarding',
        priority: 'medium',
        status: 'pending',
        visible_to_partner: true,
        sort_order: 5,
      },
      // Admin-only items (Rae/TDI team sees these, principal does not)
      {
        partnership_id: partnershipId,
        title: 'Provision staff Hub accounts from roster',
        description: 'Batch create Hub accounts for all staff once roster is received.',
        category: 'onboarding',
        priority: 'high',
        status: 'pending',
        visible_to_partner: false,
        sort_order: 10,
      },
      {
        partnership_id: partnershipId,
        title: 'Verify principal dashboard login',
        description: 'Test the principal login before the walkthrough. Confirm dashboard loads with school data.',
        category: 'onboarding',
        priority: 'high',
        status: 'pending',
        visible_to_partner: false,
        sort_order: 11,
      },
      {
        partnership_id: partnershipId,
        title: 'Prepare Day 1 Win insight',
        description: 'New school: prepare cohort reference data. Returning school: prepare stress trend line.',
        category: 'onboarding',
        priority: 'medium',
        status: 'pending',
        visible_to_partner: false,
        sort_order: 12,
      },
      {
        partnership_id: partnershipId,
        title: 'Review Phase 0 gate',
        description: 'Confirm all items green before scheduling kickoff: roster collected, accounts provisioned, login verified, calendar set.',
        category: 'onboarding',
        priority: 'high',
        status: 'pending',
        visible_to_partner: false,
        sort_order: 13,
      },
    ];

    const { error: itemsError } = await supabase
      .from('action_items')
      .insert(actionItems);

    if (itemsError) {
      console.error('[deal-to-partnership] Error creating action items:', itemsError);
      // Non-fatal, continue
    } else {
      console.log('[deal-to-partnership] Created', actionItems.length, 'onboarding action items');
    }

    // 6. Log activity
    await supabase.from('activity_log').insert({
      partnership_id: partnershipId,
      user_id: null,
      action: 'partnership_created_from_deal',
      details: {
        deal_id: dealId,
        deal_name: deal.name,
        deal_value: deal.value,
        automated: true,
      },
    });

    // 7. Update Sales deal with partnership link
    await supabase
      .from('sales_opportunities')
      .update({
        stage: 'signed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', dealId);

    // 8. Provision Hub access for contact
    let hubProvisioned = false;
    if (deal.contact_email) {
      try {
        const hubUrl = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
        const hubKey = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;

        if (hubUrl && hubKey) {
          const hubSupabase = createClient(hubUrl, hubKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          });

          // Check if Hub account already exists
          const { data: existingProfile } = await hubSupabase
            .from('hub_profiles')
            .select('id')
            .eq('email', deal.contact_email.toLowerCase())
            .limit(1);

          if (!existingProfile || existingProfile.length === 0) {
            // Create Hub membership with All-Access
            const { error: membershipError } = await hubSupabase
              .from('hub_memberships')
              .upsert({
                email: deal.contact_email.toLowerCase(),
                tier: 'all_access',
                source: 'district_partner',
                partnership_id: partnershipId,
                is_active: true,
              }, { onConflict: 'email' });

            if (!membershipError) {
              hubProvisioned = true;
              console.log('[deal-to-partnership] Hub access provisioned for:', deal.contact_email);
            }
          } else {
            hubProvisioned = true; // Already exists
          }
        }
      } catch (hubError) {
        console.error('[deal-to-partnership] Hub provisioning error (non-fatal):', hubError);
      }
    }

    // 9. Send welcome email to principal
    let emailSent = false;
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && deal.contact_email) {
      const firstName = (deal.contact_name || deal.name).split(' ')[0];
      const dashboardUrl = `https://www.teachersdeserveit.com/partners/${slug}`;

      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Rae Hughart <notifications@teachersdeserveit.com>',
            to: [deal.contact_email.toLowerCase()],
            cc: ['rae@teachersdeserveit.com'],
            subject: `Welcome to TDI, ${firstName}! Your Leadership Dashboard is ready`,
            html: `
              <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e2749;">
                <div style="text-align: center; padding: 40px 20px 30px;">
                  <div style="display: inline-block; background: linear-gradient(135deg, #1e2749 0%, #38618C 100%); color: white; padding: 12px 28px; border-radius: 50px; font-size: 14px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
                    Welcome to TDI
                  </div>
                </div>
                <div style="padding: 0 30px;">
                  <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 16px; color: #1e2749;">
                    ${firstName}, your team's PD plan starts now.
                  </h1>
                  <p style="font-size: 16px; line-height: 1.7; color: #4a5568; margin-bottom: 24px;">
                    We just built your Leadership Dashboard. It's where you'll track your team's progress, see real engagement data, and know exactly what TDI is doing for your building all year long.
                  </p>

                  <div style="background: #F9FAFB; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                    <h2 style="font-size: 16px; font-weight: 700; color: #1e2749; margin: 0 0 12px;">Your first three steps:</h2>
                    <div style="font-size: 15px; line-height: 1.8; color: #4a5568;">
                      <div style="margin-bottom: 8px;">1. <strong>Upload your staff roster</strong> so we can set up Hub accounts</div>
                      <div style="margin-bottom: 8px;">2. <strong>Schedule your kickoff walkthrough</strong> with our team (20 min)</div>
                      <div style="margin-bottom: 8px;">3. <strong>Identify a staff champion</strong> who can help drive adoption</div>
                    </div>
                  </div>

                  <div style="text-align: center; margin-bottom: 30px;">
                    <a href="${dashboardUrl}" style="display: inline-block; background: #1e2749; color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px;">
                      Open Your Dashboard
                    </a>
                  </div>

                  <p style="font-size: 14px; line-height: 1.7; color: #4a5568; margin-bottom: 24px;">
                    Your teachers will also get access to the TDI Learning Hub with tools, courses, and PD certificates. But this dashboard is yours. It's the view that makes the investment visible.
                  </p>

                  <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
                    <p style="font-size: 14px; color: #718096;">
                      Questions? Reply to this email or reach out anytime. I'm personally invested in making this work for your building.
                    </p>
                    <p style="font-size: 14px; color: #1e2749; font-weight: 600; margin-top: 8px;">
                      Rae Hughart, CEO
                      <br/>Teachers Deserve It
                    </p>
                  </div>
                </div>
              </div>
            `,
          }),
        });

        if (emailResponse.ok) {
          emailSent = true;
          console.log('[deal-to-partnership] Welcome email sent to:', deal.contact_email);
        } else {
          const err = await emailResponse.text();
          console.error('[deal-to-partnership] Email failed:', err);
        }
      } catch (emailError) {
        console.error('[deal-to-partnership] Email error:', emailError);
      }
    }

    // 10. If grant-funded deal, auto-create a funding pursuit
    let grantPursuitCreated = false;
    if (deal.grant_support || deal.stage === 'signed_with_grant') {
      try {
        const { error: grantError } = await supabase
          .from('funding_pursuits')
          .insert({
            pursuit_name: `${deal.name} Funding`,
            district_name: deal.name,
            partnership_id: partnershipId,
            sales_deal_id: dealId,
            total_amount: deal.value || 0,
            contract_gap: deal.value || 0,
            buffer_amount: Math.round((deal.value || 0) * 0.15),
            current_phase: 'intake',
            implementation_date: contractStart || null,
            funding_paths: JSON.stringify([
              { plan: 'A', label: 'Title II-A', amount: 0, status: 'researching', deadline: null, contact: '', notes: 'Federal formula funds. Check district Title II officer.' },
              { plan: 'A', label: 'IDEA / CEIS', amount: 0, status: 'researching', deadline: null, contact: '', notes: 'Special education funding path. Check IEP concentration.' },
              { plan: 'B', label: 'State formula', amount: 0, status: 'not_started', deadline: null, contact: '', notes: 'State-level discretionary dollars.' },
              { plan: 'C', label: 'Foundation/corporate', amount: 0, status: 'not_started', deadline: null, contact: '', notes: 'Competitive applications. Match school profile to funder mission.' },
            ]),
            school_profile: JSON.stringify({
              state: deal.state || '',
              city: deal.city || '',
              staffCount: staffCount || 0,
            }),
            next_action_label: 'Build school profile and begin funder search',
            next_action_urgency: 'info',
            internal_notes: `Auto-created from Sales deal ${dealId}. Contract value: $${(deal.value || 0).toLocaleString()}. TDI responsible for finding, drafting, and tracking grant funding.`,
          });

        if (!grantError) {
          grantPursuitCreated = true;
          console.log('[deal-to-partnership] Grant pursuit created for:', deal.name);

          // Add grant-specific action items
          await supabase.from('action_items').insert([
            {
              partnership_id: partnershipId,
              title: 'Grant: Build school funding profile',
              description: 'Collect Title I status, FRL rate, IEP concentration, enrollment, geographic classification. This data drives eligibility for all funding paths.',
              category: 'onboarding',
              priority: 'high',
              status: 'pending',
              visible_to_partner: false,
              sort_order: 20,
            },
            {
              partnership_id: partnershipId,
              title: 'Grant: Research and map funding paths (Plan A/B/C/D)',
              description: 'Run federal, state, foundation, and direct funding searches. Map all eligible paths into the funding matrix.',
              category: 'onboarding',
              priority: 'high',
              status: 'pending',
              visible_to_partner: false,
              sort_order: 21,
            },
            {
              partnership_id: partnershipId,
              title: 'Grant: Draft and submit narratives',
              description: 'Write budget narratives for each funding path. Pass the completeness review. Prepare submission packet with forwarding emails.',
              category: 'onboarding',
              priority: 'high',
              status: 'pending',
              visible_to_partner: false,
              sort_order: 22,
            },
            {
              partnership_id: partnershipId,
              title: 'Grant: Track submissions and follow up',
              description: 'Monitor all submitted paths. Run follow-up cadence. Activate contingency paths if any are denied or stall.',
              category: 'onboarding',
              priority: 'medium',
              status: 'pending',
              visible_to_partner: false,
              sort_order: 23,
            },
          ]);
        } else {
          console.error('[deal-to-partnership] Grant pursuit error:', grantError);
        }
      } catch (grantErr) {
        console.error('[deal-to-partnership] Grant pursuit error:', grantErr);
      }
    }

    return NextResponse.json({
      success: true,
      partnership: {
        id: partnershipId,
        slug,
        dashboardUrl: `/partners/${slug}`,
        orgName: deal.name,
      },
      actionItemsCreated: actionItems.length,
      hubProvisioned,
      welcomeEmailSent: emailSent,
      grantPursuitCreated,
      dealId,
    });
  } catch (error) {
    console.error('[deal-to-partnership] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
