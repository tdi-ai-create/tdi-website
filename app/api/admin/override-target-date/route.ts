import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = getServiceSupabase();
    const { creatorId, newDate, reason, adminEmail } = await request.json();

    if (!creatorId || !newDate || !reason || !adminEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Creators carry two parallel date column families, target_* and
    // projected_*. This route used to write only target_*, but every surface
    // an admin actually looks at reads projected_*: the "Projected Date
    // History" card's current-state values, its "Last updated" line, and the
    // trg_log_projected_date trigger that populates projected_date_history.
    // The trigger fires on projected_completion_date and ignores target_*
    // entirely, so an override wrote the audit note and changed nothing the
    // admin could see. That is what Bella hit on Amy Storer.
    //
    // Both families are written here so no existing reader regresses:
    // the reminder cron, creator-studio sync and the older /admin profile all
    // still read target_*. Collapsing the two is a separate migration.
    const setAt = new Date().toISOString();
    const setBy = `admin:${adminEmail}`;

    const { error: updateError } = await supabase
      .from('creators')
      .update({
        target_completion_date: newDate,
        target_date_set_at: setAt,
        target_date_set_by: setBy,
        projected_completion_date: newDate,
        projected_date_set_at: setAt,
        projected_date_set_by: setBy,
        updated_at: setAt,
      })
      .eq('id', creatorId);

    if (updateError) {
      console.error('[override-target-date] Update error:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // Attach the reason to the row the trigger just wrote. The previous version
    // updated creator_target_date_history, a table that does not exist, and
    // swallowed the resulting error as non-blocking, so no override reason has
    // ever reached the profile. Read the row back rather than filtering an
    // update, because PostgREST does not accept order/limit on a PATCH.
    // The trigger stamps changed_at from projected_date_set_at, so matching on
    // setAt identifies this override's own row. It also means a no-op override
    // (same date resubmitted) writes no row and we correctly leave the earlier
    // entry's reason alone instead of rewriting history.
    const { data: latest, error: latestError } = await supabase
      .from('projected_date_history')
      .select('id')
      .eq('creator_id', creatorId)
      .eq('changed_at', setAt)
      .limit(1)
      .maybeSingle();

    if (latestError) {
      console.error('[override-target-date] History lookup error:', latestError);
    } else if (latest?.id) {
      const { error: historyError } = await supabase
        .from('projected_date_history')
        .update({ reason, notes: `[Admin override] ${reason}` })
        .eq('id', latest.id);

      if (historyError) {
        console.error('[override-target-date] History update error:', historyError);
        // Non-blocking. The date itself is already saved.
      }
    }

    // Create audit note
    const adminName = adminEmail.split('@')[0] || 'Admin';
    await supabase.from('creator_notes').insert({
      creator_id: creatorId,
      content: `[Auto] Target date overridden to ${newDate} by ${adminName}. Reason: ${reason}`,
      author: 'System',
      visible_to_creator: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[override-target-date] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to override target date' },
      { status: 500 }
    );
  }
}
