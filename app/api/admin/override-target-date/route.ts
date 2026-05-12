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

    // Update the creator's target date — the DB trigger will auto-log to history
    const { error: updateError } = await supabase
      .from('creators')
      .update({
        target_completion_date: newDate,
        target_date_set_at: new Date().toISOString(),
        target_date_set_by: `admin:${adminEmail}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', creatorId);

    if (updateError) {
      console.error('[override-target-date] Update error:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // Update the most recent history row with the reason
    const { error: historyError } = await supabase
      .from('creator_target_date_history')
      .update({ notes: `[Admin override] ${reason}` })
      .eq('creator_id', creatorId)
      .order('set_at', { ascending: false })
      .limit(1);

    if (historyError) {
      console.error('[override-target-date] History update error:', historyError);
      // Non-blocking — the override itself succeeded
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
