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
 * POST /api/partners/champion
 *
 * Principal identifies their staff champion.
 * Body: { partnershipId, championName, championEmail, championRole }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { partnershipId, championName, championEmail, championRole } = await request.json();

    if (!partnershipId || !championName) {
      return NextResponse.json({ error: 'partnershipId and championName are required' }, { status: 400 });
    }

    // If champion is in the roster, update their record
    if (championEmail) {
      const { data: existing } = await supabase
        .from('staff_members')
        .select('id')
        .eq('partnership_id', partnershipId)
        .ilike('email', championEmail.toLowerCase())
        .limit(1);

      if (existing && existing.length > 0) {
        // Mark existing staff member as champion via partnership_users
        await supabase.from('partnership_users').upsert({
          partnership_id: partnershipId,
          user_id: null,
          role: 'champion',
          first_name: championName.split(' ')[0],
          last_name: championName.split(' ').slice(1).join(' ') || '',
          title: championRole || 'Staff Champion',
        }, { onConflict: 'partnership_id,role' }).select();
      }
    }

    // Store champion info on the partnership (simple approach)
    // Using partnership_goal or a metadata approach
    // For now, create/update a partnership_user with role=champion
    const nameParts = championName.trim().split(' ');
    const { error } = await supabase
      .from('partnership_users')
      .insert({
        partnership_id: partnershipId,
        role: 'champion',
        first_name: nameParts[0],
        last_name: nameParts.slice(1).join(' ') || '',
        title: championRole || 'Staff Champion',
      });

    // If insert fails (maybe duplicate), try update
    if (error) {
      await supabase
        .from('partnership_users')
        .update({
          first_name: nameParts[0],
          last_name: nameParts.slice(1).join(' ') || '',
          title: championRole || 'Staff Champion',
        })
        .eq('partnership_id', partnershipId)
        .eq('role', 'champion');
    }

    // Mark the "Identify staff champion" action item as completed
    await supabase
      .from('action_items')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: 'partner',
        updated_at: new Date().toISOString(),
      })
      .eq('partnership_id', partnershipId)
      .ilike('title', '%staff champion%')
      .eq('status', 'pending');

    // Log activity
    await supabase.from('activity_log').insert({
      partnership_id: partnershipId,
      action: 'champion_identified',
      details: { name: championName, email: championEmail, role: championRole },
    });

    return NextResponse.json({
      success: true,
      message: `${championName} identified as staff champion.`,
    });
  } catch (error) {
    console.error('[champion] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
