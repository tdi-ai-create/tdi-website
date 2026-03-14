import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { creatorId, targetDate, setBy, notes } = await request.json();

    if (!creatorId || !targetDate || !setBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: creatorId, targetDate, setBy' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Server config error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const now = new Date().toISOString();

    // Update creator with new target date
    const { error: updateError } = await supabase
      .from('creators')
      .update({
        target_completion_date: targetDate,
        target_date_set_at: now,
        target_date_set_by: setBy,
        updated_at: now,
      })
      .eq('id', creatorId);

    if (updateError) {
      console.error('[set-target-date] Update error:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // Log to history table
    const { error: historyError } = await supabase
      .from('creator_target_date_history')
      .insert({
        creator_id: creatorId,
        target_date: targetDate,
        set_at: now,
        set_by: setBy,
        notes: notes || null,
      });

    if (historyError) {
      console.error('[set-target-date] History error:', historyError);
      // Don't fail the request for history error, just log it
    }

    return NextResponse.json({
      success: true,
      message: 'Target date set successfully',
      targetDate,
    });
  } catch (error) {
    console.error('[set-target-date] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
