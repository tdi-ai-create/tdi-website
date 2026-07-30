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
 * POST /api/partners/roster-update
 *
 * Two modes:
 *   action: "preview" — returns a diff of what would change (no DB writes)
 *   action: "apply"   — commits the diff: adds new, marks removed as inactive, updates unchanged
 *
 * Body: { partnershipId, staff: [{ firstName, lastName, email, roleTitle }], action: "preview" | "apply" }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { partnershipId, staff: incomingStaff, action } = body;

    if (!partnershipId) {
      return NextResponse.json({ error: 'partnershipId is required' }, { status: 400 });
    }

    if (!['preview', 'apply'].includes(action)) {
      return NextResponse.json({ error: 'action must be "preview" or "apply"' }, { status: 400 });
    }

    // Validate and normalize incoming staff list
    const staffList: { firstName: string; lastName: string; email: string; roleTitle?: string; building?: string; department?: string }[] =
      (incomingStaff || [])
        .map((s: { firstName?: string; lastName?: string; email?: string; roleTitle?: string; building?: string; department?: string }) => ({
          firstName: s.firstName || '',
          lastName: s.lastName || '',
          email: (s.email || '').toLowerCase().trim(),
          roleTitle: s.roleTitle || undefined,
          building: s.building || undefined,
          department: s.department || undefined,
        }))
        .filter((s: { email: string }) => s.email.includes('@'));

    if (staffList.length === 0) {
      return NextResponse.json(
        { error: 'No valid staff members found. Each row needs at least an email address.' },
        { status: 400 }
      );
    }

    // Deduplicate by email
    const seen = new Set<string>();
    const uniqueIncoming = staffList.filter(s => {
      if (seen.has(s.email)) return false;
      seen.add(s.email);
      return true;
    });

    // Verify partnership
    const { data: partnership } = await supabase
      .from('partnerships')
      .select('id, status, contact_name, org_name, base_staff_enrolled')
      .eq('id', partnershipId)
      .single();

    if (!partnership) {
      return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
    }

    // Fetch current active roster
    const { data: currentStaff } = await supabase
      .from('staff_members')
      .select('id, first_name, last_name, email, role_title, hub_enrolled, is_active')
      .eq('partnership_id', partnershipId);

    const current = currentStaff || [];

    // Build lookup maps
    const currentByEmail = new Map(
      current.map(s => [s.email.toLowerCase(), s])
    );
    const incomingEmails = new Set(uniqueIncoming.map(s => s.email));

    // Classify each incoming email
    const toAdd: typeof uniqueIncoming = [];
    const unchanged: { email: string; name: string; roleTitle?: string }[] = [];

    for (const s of uniqueIncoming) {
      const existing = currentByEmail.get(s.email);
      if (!existing) {
        toAdd.push(s);
      } else {
        unchanged.push({
          email: s.email,
          name: `${existing.first_name} ${existing.last_name}`.trim() || s.email,
          roleTitle: s.roleTitle,
        });
      }
    }

    // Anyone in current but NOT in incoming gets marked inactive
    const toRemove: { id: string; email: string; name: string }[] = [];
    for (const s of current) {
      if (!incomingEmails.has(s.email.toLowerCase())) {
        toRemove.push({
          id: s.id,
          email: s.email,
          name: `${s.first_name} ${s.last_name}`.trim() || s.email,
        });
      }
    }

    // --- PREVIEW MODE: return the diff without writing ---
    if (action === 'preview') {
      return NextResponse.json({
        preview: true,
        added: toAdd.length,
        removed: toRemove.length,
        unchanged: unchanged.length,
        addedList: toAdd.map(s => ({
          email: s.email,
          name: `${s.firstName} ${s.lastName}`.trim() || s.email,
          roleTitle: s.roleTitle,
        })),
        removedList: toRemove,
        unchangedList: unchanged,
      });
    }

    // --- APPLY MODE: commit the diff ---
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teachersdeserveit.com';

    // 1. Mark removed staff as inactive (soft delete)
    if (toRemove.length > 0) {
      const removeIds = toRemove.map(s => s.id);
      await supabase
        .from('staff_members')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .in('id', removeIds);
    }

    // 2. Insert new staff
    let provisioned = 0;
    let provisionFailed = 0;

    if (toAdd.length > 0) {
      const newRecords = toAdd.map(s => ({
        partnership_id: partnershipId,
        first_name: s.firstName,
        last_name: s.lastName,
        email: s.email,
        role_title: s.roleTitle || null,
        building_name: s.building || null,
        department: s.department || null,
        hub_enrolled: false,
        is_active: true,
      }));

      const { error: insertError } = await supabase
        .from('staff_members')
        .insert(newRecords);

      if (insertError) {
        console.error('[roster-update] Insert error:', insertError);
        return NextResponse.json(
          { error: 'Failed to add new staff: ' + insertError.message },
          { status: 500 }
        );
      }

      // Auto-provision Hub accounts for new staff
      for (const s of toAdd) {
        try {
          const provResp = await fetch(`${baseUrl}/api/hub/provision`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: s.email,
              name: `${s.firstName} ${s.lastName}`.trim() || s.email.split('@')[0],
              tier: 'all_access',
              source: 'partner_roster_update',
            }),
          });

          if (provResp.ok) {
            provisioned++;
            await supabase
              .from('staff_members')
              .update({ hub_enrolled: true })
              .eq('partnership_id', partnershipId)
              .eq('email', s.email);

            fetch(`${baseUrl}/api/hub/emails/staff-welcome`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: s.email,
                firstName: s.firstName || s.email.split('@')[0],
                schoolName: partnership.contact_name || 'your school',
                roleTitle: s.roleTitle || null,
              }),
            }).catch(() => {});
          } else {
            provisionFailed++;
          }
        } catch {
          provisionFailed++;
        }
      }
    }

    // 3. Update active staff count (only active members)
    const { count: activeCount } = await supabase
      .from('staff_members')
      .select('id', { count: 'exact', head: true })
      .eq('partnership_id', partnershipId)
      .eq('is_active', true);

    const newTotal = activeCount || unchanged.length + toAdd.length;

    await supabase
      .from('partnerships')
      .update({ staff_enrolled: newTotal, updated_at: new Date().toISOString() })
      .eq('id', partnershipId);

    // 4. Flag if over contract seat limit
    if (partnership.base_staff_enrolled && newTotal > partnership.base_staff_enrolled) {
      const overCount = newTotal - partnership.base_staff_enrolled;
      const schoolName = partnership.org_name || partnership.contact_name || 'A partnership';

      await supabase.from('action_items').insert({
        partnership_id: partnershipId,
        title: `Roster update exceeds contract: ${newTotal} active staff vs ${partnership.base_staff_enrolled} contracted seats (+${overCount})`,
        description: `${schoolName} updated their roster. Active staff count (${newTotal}) exceeds the ${partnership.base_staff_enrolled}-seat contract by ${overCount}. Review whether this is a replacement or expansion.`,
        category: 'follow_up',
        priority: 'medium',
        status: 'pending',
        visible_to_partner: false,
      });

      if (process.env.RESEND_API_KEY) {
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'TDI Admin <noreply@teachersdeserveit.com>',
            to: 'rae@teachersdeserveit.com',
            subject: `Roster update over contract: ${schoolName} (+${overCount} active staff)`,
            html: `<div style="font-family:sans-serif;color:#1e2749;font-size:15px;line-height:1.6;">
              <p><strong>${schoolName}</strong> uploaded an updated roster. Active staff count: <strong>${newTotal}</strong>, which is <strong>${overCount} more</strong> than their contracted ${partnership.base_staff_enrolled} seats.</p>
              <p>Changes: ${toAdd.length} added, ${toRemove.length} marked inactive, ${unchanged.length} unchanged.</p>
              <p><a href="https://www.teachersdeserveit.com/tdi-admin/leadership/${partnershipId}">Open Partnership Dashboard</a></p>
            </div>`,
          }),
        }).catch(() => {});
      }
    }

    // 5. Log activity
    await supabase.from('activity_log').insert({
      partnership_id: partnershipId,
      action: 'roster_updated',
      details: {
        added: toAdd.length,
        removed: toRemove.length,
        unchanged: unchanged.length,
        new_total: newTotal,
        hub_provisioned: provisioned,
        hub_failed: provisionFailed,
      },
    });

    // 6. Notify admin
    const notifyUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const schoolName = partnership.org_name || partnership.contact_name || 'A partnership';

    fetch(`${notifyUrl}/api/admin/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'roster_updated',
        partnershipName: schoolName,
        urgency: 'info',
        details: {
          'Staff added': toAdd.length,
          'Staff removed': toRemove.length,
          'Unchanged': unchanged.length,
          'New active total': newTotal,
        },
      }),
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      added: toAdd.length,
      removed: toRemove.length,
      unchanged: unchanged.length,
      total: newTotal,
      hubProvisioned: provisioned,
      hubFailed: provisionFailed,
      message: `Roster updated. ${toAdd.length} new staff added, ${toRemove.length} removed, ${unchanged.length} unchanged. Total active: ${newTotal}.${provisioned > 0 ? ` ${provisioned} Hub account${provisioned !== 1 ? 's' : ''} created.` : ''}${provisionFailed > 0 ? ` ${provisionFailed} Hub account${provisionFailed !== 1 ? 's' : ''} could not be created automatically.` : ''}`,
    });
  } catch (error) {
    console.error('[roster-update] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
