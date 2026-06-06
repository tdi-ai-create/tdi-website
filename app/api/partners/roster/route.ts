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
      .select('id, status, contact_name')
      .eq('id', partnershipId)
      .single();

    if (!partnership) {
      return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
    }

    let staffList: { firstName: string; lastName: string; email: string; roleTitle?: string }[] = [];

    // Parse CSV if provided
    if (csv) {
      const lines = csv.trim().split('\n');
      // Skip header row
      const dataLines = lines.slice(1);
      staffList = dataLines
        .map((line: string) => {
          const parts = line.split(',').map((p: string) => p.trim().replace(/^"|"$/g, ''));
          if (parts.length < 3 || !parts[2]?.includes('@')) return null;
          return {
            firstName: parts[0] || '',
            lastName: parts[1] || '',
            email: parts[2].toLowerCase(),
            roleTitle: parts[3] || null,
          };
        })
        .filter(Boolean) as typeof staffList;
    } else if (staff && Array.isArray(staff)) {
      staffList = staff.map((s: { firstName?: string; lastName?: string; email?: string; roleTitle?: string }) => ({
        firstName: s.firstName || '',
        lastName: s.lastName || '',
        email: (s.email || '').toLowerCase(),
        roleTitle: s.roleTitle || undefined,
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

    // Insert new staff
    const records = newStaff.map(s => ({
      partnership_id: partnershipId,
      first_name: s.firstName,
      last_name: s.lastName,
      email: s.email,
      role_title: s.roleTitle || null,
      hub_enrolled: false,
    }));

    const { error: insertError } = await supabase
      .from('staff_members')
      .insert(records);

    if (insertError) {
      console.error('[roster] Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to add staff: ' + insertError.message }, { status: 500 });
    }

    // Update staff_enrolled count on partnership
    const totalCount = (existingStaff?.length || 0) + newStaff.length;
    await supabase
      .from('partnerships')
      .update({ staff_enrolled: totalCount, updated_at: new Date().toISOString() })
      .eq('id', partnershipId);

    // Mark the "Upload staff roster" action item as completed if it exists
    await supabase
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

    // Log activity
    await supabase.from('activity_log').insert({
      partnership_id: partnershipId,
      action: 'roster_uploaded',
      details: { count: newStaff.length, skipped, total: totalCount },
    });

    // Notify admin team
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    fetch(`${baseUrl}/api/admin/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'roster_uploaded',
        partnershipName: partnership?.contact_name || 'A partnership',
        urgency: 'action',
        details: { 'Staff added': newStaff.length, 'Total roster': totalCount, 'Next step': 'Provision Hub accounts from the Internal tab' },
      }),
    }).catch(() => {}); // Fire and forget

    return NextResponse.json({
      success: true,
      added: newStaff.length,
      skipped,
      total: totalCount,
      message: `Added ${newStaff.length} staff member${newStaff.length !== 1 ? 's' : ''} to the roster.${skipped > 0 ? ` ${skipped} already existed.` : ''}`,
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
