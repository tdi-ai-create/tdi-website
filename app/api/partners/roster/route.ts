import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * POST /api/partners/roster
 *
 * Accepts a roster of staff members for a partnership.
 * Can be called from the partner dashboard (principal uploading)
 * or from the admin portal (TDI team uploading on behalf).
 *
 * Body: { partnershipId, staff: [{ firstName, lastName, email, roleTitle }] }
 * OR: { partnershipId, csv: "First Name,Last Name,Email,Role\n..." }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { partnershipId, staff, csv } = body;

    if (!partnershipId) {
      return NextResponse.json({ error: 'partnershipId is required' }, { status: 400 });
    }

    // Verify partnership exists
    const { data: partnership } = await supabase
      .from('partnerships')
      .select('id, status, contact_name, org_name, base_staff_enrolled, slug')
      .eq('id', partnershipId)
      .single();

    if (!partnership) {
      return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
    }

    let staffList: { firstName: string; lastName: string; email: string; roleTitle?: string; building?: string; department?: string }[] = [];

    // Parse CSV if provided
    if (csv) {
      const lines = csv.trim().split('\n');
      // Header row determines column order
      const header = lines[0].split(',').map((h: string) => h.trim().replace(/^"|"$/g, '').toLowerCase());
      const dataLines = lines.slice(1);

      // Find column indexes by header name (flexible matching)
      const buildingIdx = header.findIndex((h: string) => ['building', 'school', 'building name', 'school name'].includes(h));
      const deptIdx = header.findIndex((h: string) => ['department', 'dept', 'dept.', 'grade level', 'grade'].includes(h));

      staffList = dataLines
        .map((line: string) => {
          const parts = line.split(',').map((p: string) => p.trim().replace(/^"|"$/g, ''));
          if (parts.length < 3 || !parts[2]?.includes('@')) return null;
          return {
            firstName: parts[0] || '',
            lastName: parts[1] || '',
            email: parts[2].toLowerCase(),
            roleTitle: parts[3] || null,
            building: buildingIdx >= 0 ? (parts[buildingIdx] || null) : (parts[4] || null),
            department: deptIdx >= 0 ? (parts[deptIdx] || null) : (parts[5] || null),
          };
        })
        .filter(Boolean) as typeof staffList;
    } else if (staff && Array.isArray(staff)) {
      staffList = staff.map((s: { firstName?: string; lastName?: string; email?: string; roleTitle?: string; building?: string; department?: string }) => ({
        firstName: s.firstName || '',
        lastName: s.lastName || '',
        email: (s.email || '').toLowerCase(),
        roleTitle: s.roleTitle || undefined,
        building: s.building || undefined,
        department: s.department || undefined,
      })).filter(s => s.email.includes('@'));
    }

    if (staffList.length === 0) {
      return NextResponse.json({ error: 'No valid staff members found. Each needs at least an email address.' }, { status: 400 });
    }

    // Deduplicate by email
    const seen = new Set<string>();
    const uniqueStaff = staffList.filter(s => {
      if (seen.has(s.email)) return false;
      seen.add(s.email);
      return true;
    });

    // Check for existing staff (don't duplicate)
    const { data: existingStaff } = await supabase
      .from('staff_members')
      .select('email')
      .eq('partnership_id', partnershipId);

    const existingEmails = new Set((existingStaff || []).map(s => s.email.toLowerCase()));
    const newStaff = uniqueStaff.filter(s => !existingEmails.has(s.email));
    const skipped = uniqueStaff.length - newStaff.length;

    if (newStaff.length === 0) {
      return NextResponse.json({
        success: true,
        added: 0,
        skipped,
        message: 'All staff members already exist in the roster.',
      });
    }

    // Auto-create buildings from roster if they don't exist yet
    const buildingNames = [...new Set(newStaff.map(s => s.building).filter(Boolean))] as string[];
    const buildingIdMap = new Map<string, string>();

    if (buildingNames.length > 0) {
      // The link runs the other way. partnerships has no organization_id
      // column, so this used to select a column that does not exist, discard
      // the error, and leave orgId undefined. Every building lookup then
      // missed and the create branch was guarded by `else if (orgId)`, so no
      // building was ever created. That is why the buildings table is empty
      // and every district partner's Schools tab is blank.
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .eq('partnership_id', partnershipId)
        .maybeSingle();

      if (orgError) {
        console.error('[partners/roster] organization lookup failed:', orgError.message);
      }

      const orgId = org?.id;

      // Two active partnerships have no organizations row at all, so buildings
      // genuinely cannot be created for them. Say so rather than silently
      // dropping the building names the school typed in.
      if (!orgId) {
        console.warn(
          `[partners/roster] partnership ${partnershipId} has no organizations row, so ${buildingNames.length} building name(s) were not created.`
        );
      }

      for (const bName of buildingNames) {
        // maybeSingle, not single. single() returns an error when no row
        // matches, which is the normal case the first time a building is
        // named, and that error was being read as "lookup failed".
        const { data: existing } = await supabase
          .from('buildings')
          .select('id')
          .eq('organization_id', orgId)
          .ilike('name', bName)
          .limit(1)
          .maybeSingle();

        if (existing) {
          buildingIdMap.set(bName.toLowerCase(), existing.id);
        } else if (orgId) {
          // Create the building
          const { data: created, error: createError } = await supabase
            .from('buildings')
            .insert({ organization_id: orgId, name: bName })
            .select('id')
            .single();
          if (createError) {
            console.error(`[partners/roster] could not create building "${bName}":`, createError.message);
          }
          if (created) buildingIdMap.set(bName.toLowerCase(), created.id);
        }
      }
    }

    // Insert new staff
    const records = newStaff.map(s => ({
      partnership_id: partnershipId,
      first_name: s.firstName,
      last_name: s.lastName,
      email: s.email,
      role_title: s.roleTitle || null,
      building_name: s.building || null,
      building_id: s.building ? (buildingIdMap.get(s.building.toLowerCase()) || null) : null,
      department: (s as { department?: string }).department || null,
      hub_enrolled: false,
    }));

    const { error: insertError } = await supabase
      .from('staff_members')
      .insert(records);

    if (insertError) {
      console.error('[roster] Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to add staff: ' + insertError.message }, { status: 500 });
    }

    // Update staff_enrolled count on partnership. The staff rows are already
    // in, so this does not fail the request, but a silent failure here leaves
    // the seat count disagreeing with the roster it was just built from.
    const totalCount = (existingStaff?.length || 0) + newStaff.length;
    const { error: countError } = await supabase
      .from('partnerships')
      .update({ staff_enrolled: totalCount, updated_at: new Date().toISOString() })
      .eq('id', partnershipId);

    if (countError) {
      console.error('[partners/roster] staff_enrolled not updated:', countError.message);
    }

    // Flag if roster exceeds contracted seats
    if (partnership.base_staff_enrolled && totalCount > partnership.base_staff_enrolled) {
      const overCount = totalCount - partnership.base_staff_enrolled;
      const schoolName = partnership.org_name || partnership.contact_name || 'A partnership';

      // Create internal action item for trainer follow-up
      const { error: itemError } = await supabase.from('action_items').insert({
        partnership_id: partnershipId,
        title: `Roster exceeds contract: ${totalCount} staff vs ${partnership.base_staff_enrolled} contracted seats (+${overCount})`,
        description: `${schoolName} added ${overCount} staff beyond their ${partnership.base_staff_enrolled}-seat contract. Follow up to determine if this is a replacement, expansion, or grant opportunity.`,
        category: 'follow_up',
        priority: 'medium',
        status: 'pending',
        visible_to_partner: false,
      });

      if (itemError) {
        console.error('[partners/roster] action item not completed:', itemError.message);
      }

      // Notify Rae via email
      if (process.env.RESEND_API_KEY) {
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'TDI Admin <noreply@teachersdeserveit.com>',
            to: 'rae@teachersdeserveit.com',
            subject: `Roster over contract: ${schoolName} (+${overCount} staff)`,
            html: `<div style="font-family:sans-serif;color:#1e2749;font-size:15px;line-height:1.6;">
              <p><strong>${schoolName}</strong> just updated their roster with <strong>${totalCount} staff</strong>, which is <strong>${overCount} more</strong> than their contracted ${partnership.base_staff_enrolled} seats.</p>
              <p>This could be:</p>
              <ul>
                <li>A replacement for staff who left (no action needed)</li>
                <li>A genuine expansion (contract amendment opportunity)</li>
                <li>A grant expansion conversation</li>
              </ul>
              <p><a href="https://www.teachersdeserveit.com/tdi-admin/leadership/${partnershipId}">Open Partnership Dashboard</a></p>
            </div>`,
          }),
        }).catch(err => console.error('[roster] Over-contract notification failed:', err));
      }

      // Log it
      const { error: logError } = await supabase.from('activity_log').insert({
        partnership_id: partnershipId,
        action: 'roster_over_contract',
        details: { total: totalCount, contracted: partnership.base_staff_enrolled, over: overCount },
      });

      if (logError) {
        console.error('[partners/roster] activity_log insert failed:', logError.message);
      }
    }

    // Mark the "Upload staff roster" action item as completed if it exists
    const { error: flagError } = await supabase
      .from('action_items')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: 'partner',
        updated_at: new Date().toISOString(),
      })
      .eq('partnership_id', partnershipId)
      .ilike('title', '%staff roster%')
      .eq('status', 'pending');

    if (flagError) {
      console.error('[partners/roster] over-seat flag not written:', flagError.message);
    }

    // Auto-provision Hub accounts for each new staff member
    let provisioned = 0;
    let provisionFailed = 0;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teachersdeserveit.com';

    for (const s of newStaff) {
      try {
        const provResp = await fetch(`${baseUrl}/api/hub/provision`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: s.email,
            name: `${s.firstName} ${s.lastName}`.trim() || s.email.split('@')[0],
            tier: 'all_access',
            source: 'partner_roster',
          }),
        });
        if (provResp.ok) {
          provisioned++;
          // Mark as hub_enrolled in staff_members
          const { error: logError3 } = await supabase
            .from('staff_members')
            .update({ hub_enrolled: true })
            .eq('partnership_id', partnershipId)
            .eq('email', s.email);

          if (logError3) {
            console.error('[partners/roster] activity_log insert failed:', logError3.message);
          }
          // Send staff welcome email
          fetch(`${baseUrl}/api/hub/emails/staff-welcome`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: s.email,
              firstName: s.firstName || s.email.split('@')[0],
              schoolName: partnership.contact_name || 'your school',
              roleTitle: s.roleTitle || null,
            }),
          }).catch(err => console.error(`[roster] Welcome email failed for ${s.email}:`, err));
        } else {
          provisionFailed++;
        }
      } catch {
        provisionFailed++;
      }
    }

    // Log activity
    const { error: logError1 } = await supabase.from('activity_log').insert({
      partnership_id: partnershipId,
      action: 'roster_uploaded',
      details: { count: newStaff.length, skipped, total: totalCount, hub_provisioned: provisioned, hub_failed: provisionFailed },
    });

    if (logError1) {
      console.error('[partners/roster] activity_log insert failed:', logError1.message);
    }

    // Notify admin team
    const notifyUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    fetch(`${notifyUrl}/api/admin/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'roster_uploaded',
        partnershipName: partnership?.contact_name || 'A partnership',
        urgency: 'action',
        details: { 'Staff added': newStaff.length, 'Total roster': totalCount, 'Next step': 'Provision Hub accounts from the Internal tab' },
      }),
    }).catch(err => console.error('[roster] Admin notification failed:', err));

    return NextResponse.json({
      success: true,
      added: newStaff.length,
      skipped,
      total: totalCount,
      hubProvisioned: provisioned,
      hubFailed: provisionFailed,
      message: `Added ${newStaff.length} staff member${newStaff.length !== 1 ? 's' : ''} to the roster. ${provisioned} Hub account${provisioned !== 1 ? 's' : ''} created.${skipped > 0 ? ` ${skipped} already existed.` : ''}${provisionFailed > 0 ? ` ${provisionFailed} Hub account${provisionFailed !== 1 ? 's' : ''} could not be created.` : ''}`,
    });
  } catch (error) {
    console.error('[roster] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

/**
 * GET /api/partners/roster?partnershipId=xxx
 *
 * Returns the current roster for a partnership.
 */
export async function GET(request: NextRequest) {
  try {
    const partnershipId = request.nextUrl.searchParams.get('partnershipId');
    if (!partnershipId) {
      return NextResponse.json({ error: 'partnershipId is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('staff_members')
      .select('*')
      .eq('partnership_id', partnershipId)
      .order('last_name', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ staff: data || [], count: data?.length || 0 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
