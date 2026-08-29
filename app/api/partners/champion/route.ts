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
    // There used to be a second write above this one, an upsert with
    // `onConflict: 'partnership_id,role'`. partnership_users has no unique
    // index on that pair, so PostgREST answered 42P10 every time and the error
    // was thrown away. It has been removed rather than repaired, because the
    // write below already does the job.
    //
    // That write was an insert with an update fallback "if insert fails, maybe
    // duplicate". With no unique constraint the insert never conflicts, so it
    // never failed, so the fallback never ran and naming a second champion
    // added a second row instead of replacing the first. Look first, then
    // write, which needs no constraint and is genuinely idempotent.
    const nameParts = championName.trim().split(' ');
    const championFields = {
      first_name: nameParts[0],
      last_name: nameParts.slice(1).join(' ') || '',
      title: championRole || 'Staff Champion',
    };

    const { data: currentChampion, error: championLookupError } = await supabase
      .from('partnership_users')
      .select('id')
      .eq('partnership_id', partnershipId)
      .eq('role', 'champion')
      .maybeSingle();

    if (championLookupError) {
      console.error('[partners/champion] lookup failed:', championLookupError.message);
      return NextResponse.json(
        { error: `Could not check the current champion: ${championLookupError.message}` },
        { status: 500 }
      );
    }

    const { error: championWriteError } = currentChampion
      ? await supabase.from('partnership_users').update(championFields).eq('id', currentChampion.id)
      : await supabase
          .from('partnership_users')
          .insert({ partnership_id: partnershipId, role: 'champion', ...championFields });

    // Naming the champion is the whole point of this request, so say so rather
    // than reporting success over a write that did not happen.
    if (championWriteError) {
      console.error('[partners/champion] write failed:', championWriteError.message);
      return NextResponse.json(
        { error: `Could not save ${championName} as your staff champion: ${championWriteError.message}` },
        { status: 500 }
      );
    }

    // Mark the "Identify staff champion" action item as completed. The
    // champion is already saved, so this logs rather than failing the request.
    const { error: itemError } = await supabase
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

    if (itemError) {
      console.error('[partners/champion] action item not completed:', itemError.message);
    }

    // Log activity
    const { error: logError } = await supabase.from('activity_log').insert({
      partnership_id: partnershipId,
      action: 'champion_identified',
      details: { name: championName, email: championEmail, role: championRole },
    });

    if (logError) {
      console.error('[partners/champion] activity_log insert failed:', logError.message);
    }

    return NextResponse.json({
      success: true,
      message: `${championName} identified as staff champion.`,
    });
  } catch (error) {
    console.error('[champion] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
